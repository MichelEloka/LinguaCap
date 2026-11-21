package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.learning.ContractStore.ContractRow;
import org.linguacap.learning.ContractStore.Terms;
import org.linguacap.learning.LearnerAccess.Viewer;
import org.linguacap.learning.PathStore.PathRow;
import org.linguacap.learning.PathStore.StepRow;
import org.linguacap.learning.Planner.Day;

/**
 * Contrat du parcours (section 3.3 du plan) : propositions, contre-propositions, avenants et décisions. Toute
 * proposition dont le planning déborde est refusée ; un contrat accepté verrouille le niveau visé, la date cible et
 * l'engagement hebdomadaire minimal. Notifications dans l'application : contrats en attente du professeur.
 */
@Path("/v1/learning")
@Produces(MediaType.APPLICATION_JSON)
public class ContractResource {
    @Inject Actor actor;
    @Inject LearnerAccess access;
    @Inject IdentityClient identities;
    @Inject PathStore paths;
    @Inject ContractStore contracts;
    @Inject PathResource pathResource;

    /** Contrats du parcours, les plus récents d'abord. */
    @GET
    @Path("/paths/{pathId}/contracts")
    public List<Contract> list(@PathParam("pathId") UUID pathId) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        Viewer viewer = access.viewer(callerId, path.learnerId());
        boolean active = "active".equals(path.status());
        return contracts.list(pathId).stream().map(row -> view(row, viewer.party(), active)).toList();
    }

    /** Proposition, contre-proposition ou avenant de l'élève, du professeur référent ou de l'administration. */
    @POST
    @Path("/paths/{pathId}/contracts")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response propose(@PathParam("pathId") UUID pathId, ContractRequest request) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        Viewer viewer = access.viewer(callerId, path.learnerId());
        ContractRules.Party party = viewer.party();
        if (party == null) throw HttpError.forbidden("Seuls l’élève, son professeur référent et l’administration proposent un contrat.");
        if (!"active".equals(path.status())) throw HttpError.conflict("Un contrat se propose sur un parcours en cours.");
        if (request == null || request.targetDate() == null) {
            throw HttpError.badRequest("Indiquez le niveau visé, la date cible et l’engagement hebdomadaire.");
        }
        String targetLevel = PathRules.checkTargetLevel(request.targetLevel());
        LocalDate target = PathResource.date(request.targetDate());
        int weekly = ContractRules.checkWeeklyMinutes(request.weeklyMinutes());
        String note = ContractRules.checkNote(request.note());
        List<StepRow> steps = paths.steps(pathId);
        StepRow active = PathResource.activeStep(steps);
        String startLevel = request.startLevel() == null ? path.startLevel() : PathRules.checkStartLevel(request.startLevel());
        int ceiling = active != null ? active.rank()
                : steps.stream().mapToInt(StepRow::rank).min().orElse(PathRules.rank(targetLevel));
        if (!startLevel.equals(path.startLevel()) && PathRules.rank(startLevel) >= ceiling) {
            throw HttpError.conflict("Le niveau de départ doit rester sous le niveau en cours.");
        }
        List<Day> days = request.availability() == null || request.availability().isEmpty()
                ? paths.availability(pathId) : GoalRules.checkAvailability(request.availability());
        LocalDate today = PathResource.today();
        LocalDate from = path.resumeDate() != null ? path.resumeDate()
                : today.isAfter(path.startDate()) ? today : path.startDate();
        if (!target.isAfter(from) || target.isAfter(path.startDate().plusDays(PathRules.MAX_PATH_DAYS))) {
            throw HttpError.badRequest("La date cible doit être à venir, dans un délai de trois ans après le début du parcours.");
        }
        if (!PathRules.respectsCommitment(days, weekly)) {
            throw HttpError.conflict("Les jours choisis doivent couvrir au moins l’engagement hebdomadaire du contrat.");
        }

        // Le planning des nouvelles conditions doit tenir : aucune proposition qui déborde n'est enregistrée.
        PathResource.Catalogue catalogue = pathResource.catalogue(callerId);
        List<PathResource.Slot> slots = pathResource.slotsFor(path, steps, targetLevel, catalogue);
        List<PathPlanner.Level> levels = pathResource.levels(slots, catalogue, paths.additions(pathId));
        PathPlanner.Result simulation = PathPlanner.plan(from, target, days, levels, true);
        if (!simulation.plan().fits()) {
            throw HttpError.conflict("Ce contrat ne tient pas dans le temps prévu : ajoutez des jours ou repoussez la date cible.");
        }
        PathRules.Difficulty difficulty = PathRules.difficulty(simulation.plan().requiredMinutes(), from, target);
        PathRules.checkObjective(difficulty.code());
        Terms terms = new Terms(startLevel, targetLevel, path.startDate(), target, weekly, days,
                simulation.plan().requiredMinutes(), difficulty.code());
        List<PathStore.LevelChoice> choices = PathResource.choices(slots);
        String proposedBy = ContractRules.proposedBy(party, viewer.role());

        int[] outcome = paths.transaction("propose contract", connection -> {
            paths.lock(connection, pathId);
            ContractRow pending = contracts.pending(connection, pathId);
            ContractRow accepted = contracts.accepted(connection, pathId);
            ContractRules.Proposal effect = ContractRules.propose(party, viewer.accompanied(),
                    pending == null ? null : pending.status(), accepted != null);
            if (pending != null) {
                contracts.close(connection, pathId, pending.number(), effect.previousPending(), callerId,
                        ContractRules.REJECTED.equals(effect.previousPending()) ? note : null);
            }
            if (effect.supersedeAccepted() && accepted != null) {
                contracts.close(connection, pathId, accepted.number(), ContractRules.SUPERSEDED, null, null);
            }
            int number = contracts.insert(connection, pathId, effect.status(), proposedBy, callerId, terms, note, null);
            if (effect.applyNow()) paths.applyTerms(connection, pathId, terms, choices);
            return new int[] {number, effect.applyNow() ? 1 : 0};
        });
        if (outcome[1] == 1) pathResource.reproposeAndValidate(pathId, callerId, days);
        ContractRow created = contracts.list(pathId).stream().filter(row -> row.number() == outcome[0]).findFirst()
                .orElseThrow(() -> HttpError.notFound("Contrat introuvable."));
        return Response.status(Response.Status.CREATED).entity(view(created, party, true)).build();
    }

    @POST
    @Path("/paths/{pathId}/contracts/{number}/accept")
    @Consumes(MediaType.APPLICATION_JSON)
    public PathResource.PathView accept(@PathParam("pathId") UUID pathId, @PathParam("number") int number,
                                        DecisionRequest request) {
        return decide(pathId, number, request, true);
    }

    @POST
    @Path("/paths/{pathId}/contracts/{number}/reject")
    @Consumes(MediaType.APPLICATION_JSON)
    public PathResource.PathView reject(@PathParam("pathId") UUID pathId, @PathParam("number") int number,
                                        DecisionRequest request) {
        return decide(pathId, number, request, false);
    }

    /** Contrats en attente du professeur : ceux de ses élèves (tous les élèves pour l'administration). */
    @GET
    @Path("/contracts/pending")
    public List<PendingContract> pending() {
        UUID callerId = actor.id();
        String role = access.role(callerId);
        if (!"teacher".equals(role) && !"admin".equals(role)) {
            throw HttpError.forbidden("Les contrats en attente sont réservés aux professeurs et à l’administration.");
        }
        Map<UUID, String> names = new HashMap<>();
        for (JsonNode learner : identities.learners(callerId)) {
            names.put(UUID.fromString(learner.path("id").asText()), learner.path("displayName").asText(""));
        }
        List<ContractStore.PendingRow> rows = contracts.pendingForTeacher("admin".equals(role) ? null : names.keySet());
        return rows.stream().map(row -> new PendingContract(row.contract().pathId(), row.learnerId(),
                names.getOrDefault(row.learnerId(), ""), row.languageId(),
                view(row.contract(), ContractRules.Party.EDUCATOR, "active".equals(row.pathStatus())),
                new PendingPath(row.startLevel(), row.targetLevel(), row.targetDate().toString(), row.pathStatus()))).toList();
    }

    private PathResource.PathView decide(UUID pathId, int number, DecisionRequest request, boolean accept) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        Viewer viewer = access.viewer(callerId, path.learnerId());
        if (!"active".equals(path.status())) throw HttpError.conflict("Ce parcours n’est plus actif.");
        String note = ContractRules.checkNote(request == null ? null : request.note());
        ContractRow row = contracts.list(pathId).stream().filter(contract -> contract.number() == number).findFirst()
                .orElseThrow(() -> HttpError.notFound("Contrat introuvable."));
        ContractRules.Decision preview = ContractRules.decide(viewer.party(), row.status(), accept);
        List<PathStore.LevelChoice> choices = preview.apply()
                ? PathResource.choices(pathResource.slotsFor(path, paths.steps(pathId), row.terms().targetLevel(),
                        pathResource.catalogue(callerId)))
                : List.of();
        boolean applied = paths.transaction("decide contract", connection -> {
            paths.lock(connection, pathId);
            ContractRow locked = contracts.find(connection, pathId, number);
            if (locked == null) throw HttpError.notFound("Contrat introuvable.");
            ContractRules.Decision decision = ContractRules.decide(viewer.party(), locked.status(), accept);
            if (decision.supersedeAccepted()) {
                ContractRow accepted = contracts.accepted(connection, pathId);
                if (accepted != null) contracts.close(connection, pathId, accepted.number(), ContractRules.SUPERSEDED, null, null);
            }
            contracts.close(connection, pathId, number, decision.status(), callerId, note);
            if (decision.apply()) paths.applyTerms(connection, pathId, locked.terms(), choices);
            return decision.apply();
        });
        if (applied) pathResource.reproposeAndValidate(pathId, callerId, row.terms().availability());
        return pathResource.view(paths.byId(pathId), viewer);
    }

    private PathRow readable(UUID pathId) {
        PathRow path = paths.byId(pathId);
        if (path == null) throw HttpError.notFound("Parcours introuvable.");
        return path;
    }

    /** Contrat tel que le voit un appelant : il peut l'accepter ou le refuser s'il est la partie adverse. */
    static Contract view(ContractRow row, ContractRules.Party viewer, boolean pathActive) {
        Terms terms = row.terms();
        LocalDate from = row.createdAt() == null ? terms.startDate() : row.createdAt()
                .atZoneSameInstant(CourseRules.PILOT_ZONE).toLocalDate();
        if (from.isBefore(terms.startDate()) || !from.isBefore(terms.targetDate())) from = terms.startDate();
        PathRules.Difficulty difficulty = PathRules.of(terms.difficulty(),
                PathRules.requiredWeeklyMinutes(terms.requiredMinutes(), from, terms.targetDate()));
        boolean decide = pathActive && ContractRules.canDecide(viewer, row.status());
        return new Contract(row.pathId(), row.number(), row.status(), row.proposedBy(), row.proposerId(),
                new ContractTerms(terms.startLevel(), terms.targetLevel(), terms.startDate().toString(),
                        terms.targetDate().toString(), terms.weeklyMinutes(), terms.availability(), terms.requiredMinutes(),
                        difficulty),
                row.note(), row.createdAt() == null ? null : row.createdAt().toString(),
                row.decidedAt() == null ? null : row.decidedAt().toString(), row.decidedBy(), row.decisionNote(), decide,
                decide);
    }

    public record ContractRequest(String targetLevel, String targetDate, Integer weeklyMinutes, List<Day> availability,
                                  String startLevel, String note) {}

    public record DecisionRequest(String note) {}

    public record ContractTerms(String startLevel, String targetLevel, String startDate, String targetDate,
                                int weeklyMinutes, List<Day> availability, int requiredMinutes,
                                PathRules.Difficulty difficulty) {}

    public record Contract(UUID pathId, int number, String status, String proposedBy, UUID proposerId, ContractTerms terms,
                           String note, String createdAt, String decidedAt, UUID decidedBy, String decisionNote,
                           boolean canAccept, boolean canReject) {}

    public record PendingPath(String startLevel, String targetLevel, String targetDate, String status) {}

    public record PendingContract(UUID pathId, UUID learnerId, String learnerName, String languageId, Contract contract,
                                  PendingPath path) {}
}
