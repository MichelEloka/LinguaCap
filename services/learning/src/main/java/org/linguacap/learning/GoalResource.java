package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;
import org.linguacap.learning.Planner.Day;

/**
 * Objectif, disponibilités, diagnostic, propositions de planning, validation, pause et reprise (incrément 4).
 * Sur une inscription liée à un parcours, ces routes historiques délèguent au parcours (PathResource) et gardent
 * leurs formes : la proposition renvoyée est un sur-ensemble de l'ancienne, avec les mêmes noms de champs.
 */
@Path("/v1/learning")
@Produces(MediaType.APPLICATION_JSON)
public class GoalResource {
    @Inject Actor actor;
    @Inject LearnerAccess access;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject GoalStore goals;
    @Inject CourseStore courses;
    @Inject PathResource pathResource;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "lingua.services.catalogue")
    String catalogueUrl;
    @ConfigProperty(name = "lingua.services.assessment")
    String assessmentUrl;

    /** Modèles Standard et Intensif, modifiables (DEV-038). */
    @GET
    @Path("/templates")
    public List<TemplateView> templates() {
        actor.id();
        return GoalRules.TEMPLATES.stream().map(template -> new TemplateView(template.id(), template.name(),
                template.description(), template.days(), template.a1().toString(), template.a2().toString())).toList();
    }

    /** Parcours, objectif, disponibilités, proposition en cours et séances de l'élève, ou null. */
    @GET
    @Path("/enrollment")
    public JsonNode enrollment(@QueryParam("learnerId") String requestedLearnerId) {
        UUID callerId = actor.id();
        UUID learnerId = access.resolve(callerId, requestedLearnerId);
        GoalStore.EnrollmentRow row = goals.latest(learnerId);
        return row == null ? NullNode.getInstance() : mapper.valueToTree(view(row, callerId));
    }

    /** Le professeur référent ou l'administration fixe l'objectif et attribue une version publiée (DEV-034, DEV-035). */
    @POST
    @Path("/enrollments")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(GoalRequest request) {
        UUID callerId = actor.id();
        if (request == null || request.trackVersionId() == null) {
            throw HttpError.badRequest("Choisissez l’élève, le parcours, le niveau de départ et les dates.");
        }
        UUID learnerId = LearnerAccess.parse(request.learnerId());
        access.requireEducatorOf(callerId, learnerId);
        JsonNode track = track(request.trackVersionId(), callerId);
        if (!"published".equals(track.path("status").asText())) {
            throw HttpError.conflict("Cette version du parcours n’est plus proposée aux nouvelles inscriptions.");
        }
        String template = request.template() == null ? "standard" : request.template();
        GoalRules.Template model = GoalRules.template(template);
        String levelCode = track.path("levelCode").asText();
        LocalDate today = LocalDate.now(CourseRules.PILOT_ZONE);
        LocalDate start = request.startDate() == null ? today : date(request.startDate());
        LocalDate target = request.targetDate() == null ? GoalRules.defaultTarget(template, levelCode, start) : date(request.targetDate());
        GoalRules.checkDates(start, target, today);
        String startLevel = GoalRules.checkStartLevel(request.startLevel());

        // Un parcours à prérequis (A2 après A1) exige le niveau validé dans LinguaCap ou confirmé par le diagnostic.
        String prerequisite = text(track.path("planning").path("prerequisiteLevelCode"));
        boolean prerequisiteMet = prerequisite == null || goals.hasValidated(learnerId, prerequisite);

        // L'attribution crée un parcours d'un niveau (origine « assignment ») : contrat n°1 accepté d'office,
        // proposition n°1 à valider par le professeur comme avant.
        UUID enrollmentId = pathResource.assign(learnerId, track, callerId, access.role(callerId), startLevel, start,
                target, template, prerequisite, prerequisiteMet, model.days());
        return Response.status(Response.Status.CREATED).entity(view(goals.byId(enrollmentId), callerId)).build();
    }

    /** Disponibilités par jour (DEV-039) : une nouvelle proposition est calculée à chaque changement. */
    @PUT
    @Path("/enrollments/{id}/availability")
    @Consumes(MediaType.APPLICATION_JSON)
    public Object availability(@PathParam("id") UUID enrollmentId, AvailabilityRequest request) {
        UUID callerId = actor.id();
        GoalStore.EnrollmentRow row = readable(callerId, enrollmentId);
        active(row);
        if (request == null) throw HttpError.badRequest("Les disponibilités sont requises.");
        PathStore.PathRow path = pathResource.pathOfEnrollment(enrollmentId);
        if (path != null) {
            return pathResource.changeAvailability(path, access.viewer(callerId, row.learnerId()), request.days(),
                    request.targetDate() == null ? null : date(request.targetDate()));
        }
        List<Day> days = GoalRules.checkAvailability(request.days());
        LocalDate target = request.targetDate() == null ? null : date(request.targetDate());
        goals.replaceAvailability(enrollmentId, days, target);
        return propose(goals.byId(enrollmentId), callerId, null);
    }

    @GET
    @Path("/enrollments/{id}/proposal")
    public Object proposal(@PathParam("id") UUID enrollmentId) {
        UUID callerId = actor.id();
        GoalStore.EnrollmentRow row = readable(callerId, enrollmentId);
        PathStore.PathRow path = pathResource.pathOfEnrollment(enrollmentId);
        if (path != null) {
            Object current = pathResource.currentProposal(path, access.viewer(callerId, row.learnerId()));
            if (current == null) throw HttpError.notFound("Aucune proposition de planning pour ce parcours.");
            return current;
        }
        GoalStore.ProposalRow proposal = goals.proposal(enrollmentId);
        if (proposal == null) throw HttpError.notFound("Aucune proposition de planning pour ce parcours.");
        return proposalView(proposal, row, callerId);
    }

    /** Validation par le professeur référent (élève accompagné) ou par l'élève autonome (DEV-043, DEV-044). */
    @POST
    @Path("/enrollments/{id}/proposal/validate")
    @Consumes(MediaType.APPLICATION_JSON)
    public EnrollmentView validate(@PathParam("id") UUID enrollmentId, ValidationRequest request) {
        UUID callerId = actor.id();
        GoalStore.EnrollmentRow row = readable(callerId, enrollmentId);
        if (request == null || request.number() == null) throw HttpError.badRequest("Indiquez la proposition à valider.");
        PathStore.PathRow path = pathResource.pathOfEnrollment(enrollmentId);
        if (path != null) {
            active(row);
            pathResource.validateProposal(path, access.viewer(callerId, row.learnerId()), request.number());
            return view(goals.byId(enrollmentId), callerId);
        }
        if (!canValidate(callerId, row)) {
            throw HttpError.forbidden(accompanied(callerId, row)
                    ? "Le professeur référent valide le planning d’un élève accompagné."
                    : "L’élève autonome valide lui-même son planning.");
        }
        goals.validate(enrollmentId, request.number(), callerId);
        return view(goals.byId(enrollmentId), callerId);
    }

    /** Mise en pause : les alertes sont suspendues jusqu'à la reprise (DEV-045). */
    @POST
    @Path("/enrollments/{id}/pause")
    @Consumes(MediaType.APPLICATION_JSON)
    public EnrollmentView pause(@PathParam("id") UUID enrollmentId) {
        UUID callerId = actor.id();
        GoalStore.EnrollmentRow row = readable(callerId, enrollmentId);
        PathStore.PathRow path = pathResource.pathOfEnrollment(enrollmentId);
        if (path != null) {
            active(row);
            pathResource.pausePath(path, access.viewer(callerId, row.learnerId()));
            return view(goals.byId(enrollmentId), callerId);
        }
        requirePlanner(callerId, row);
        goals.pause(enrollmentId);
        return view(goals.byId(enrollmentId), callerId);
    }

    /** Prépare la reprise à une nouvelle date : les activités restantes sont replanifiées à partir de ce jour. */
    @POST
    @Path("/enrollments/{id}/resume")
    @Consumes(MediaType.APPLICATION_JSON)
    public Object resume(@PathParam("id") UUID enrollmentId, ResumeRequest request) {
        UUID callerId = actor.id();
        GoalStore.EnrollmentRow row = readable(callerId, enrollmentId);
        if (request == null || request.resumeDate() == null) throw HttpError.badRequest("Indiquez la date de reprise.");
        LocalDate resume = date(request.resumeDate());
        LocalDate target = request.targetDate() == null ? null : date(request.targetDate());
        PathStore.PathRow path = pathResource.pathOfEnrollment(enrollmentId);
        if (path != null) {
            active(row);
            return pathResource.resumePath(path, access.viewer(callerId, row.learnerId()), resume, target);
        }
        requirePlanner(callerId, row);
        GoalRules.checkDates(resume, target == null ? row.targetDate() : target, LocalDate.now(CourseRules.PILOT_ZONE));
        goals.planResume(enrollmentId, resume, target);
        return propose(goals.byId(enrollmentId), callerId, resume);
    }

    /** Questions du diagnostic initial, sans corrigé (DEV-036). */
    @GET
    @Path("/enrollments/{id}/diagnostic")
    public JsonNode diagnostic(@PathParam("id") UUID enrollmentId) {
        UUID callerId = actor.id();
        GoalStore.EnrollmentRow row = readable(callerId, enrollmentId);
        return services.request(catalogueUrl, "/v1/internal/tracks/" + row.trackVersionId() + "/diagnostic",
                "GET", callerId, null);
    }

    /**
     * L'élève transmet son diagnostic corrigé. Les modules entièrement réussis sont proposés comme acquis :
     * appliqués directement pour un élève autonome, à confirmer par le professeur pour un élève accompagné.
     */
    @POST
    @Path("/enrollments/{id}/diagnostic")
    @Consumes(MediaType.APPLICATION_JSON)
    public EnrollmentView submitDiagnostic(@PathParam("id") UUID enrollmentId, DiagnosticRequest request) {
        UUID learnerId = actor.id();
        GoalStore.EnrollmentRow row = goals.byId(enrollmentId);
        if (row == null || !learnerId.equals(row.learnerId())) throw HttpError.notFound("Parcours introuvable.");
        active(row);
        if (request == null || request.attemptId() == null) throw HttpError.badRequest("Remettez le diagnostic avant de le transmettre.");
        JsonNode track = track(row.trackVersionId(), learnerId);
        String diagnosticLesson = text(track.path("planning").path("diagnosticLessonId"));
        JsonNode attempt = null;
        for (JsonNode grade : services.request(assessmentUrl, "/v1/assessments/results", "GET", learnerId, null)) {
            if (request.attemptId().equals(grade.path("id").asText()) && "diagnostic".equals(grade.path("kind").asText())
                    && grade.path("lessonId").asText().equals(diagnosticLesson)) {
                attempt = grade;
            }
        }
        if (attempt == null) throw HttpError.conflict("Ce diagnostic ne correspond pas à votre parcours.");

        Set<String> trackModules = new HashSet<>();
        for (JsonNode module : track.path("modules")) trackModules.add(module.path("id").asText());
        List<String> acquired = new ArrayList<>();
        Boolean prerequisite = null;
        for (Map.Entry<String, JsonNode> score : attempt.path("moduleScores").properties()) {
            boolean mastered = score.getValue().path("total").asInt() > 0
                    && score.getValue().path("correct").asInt() == score.getValue().path("total").asInt();
            if ("prerequis".equals(score.getKey())) prerequisite = mastered;
            else if (mastered && trackModules.contains(score.getKey())) acquired.add(score.getKey());
        }
        boolean autonomous = !accompanied(learnerId, row);
        goals.recordDiagnostic(enrollmentId, UUID.fromString(request.attemptId()), acquired, prerequisite, autonomous, learnerId);
        if (autonomous) repropose(goals.byId(enrollmentId), learnerId);
        return view(goals.byId(enrollmentId), learnerId);
    }

    /** Le professeur confirme le point de départ : modules acquis et prérequis confirmé par le diagnostic (DEV-036, DEV-037). */
    @PUT
    @Path("/enrollments/{id}/starting-point")
    @Consumes(MediaType.APPLICATION_JSON)
    public EnrollmentView startingPoint(@PathParam("id") UUID enrollmentId, StartingPointRequest request) {
        UUID callerId = actor.id();
        GoalStore.EnrollmentRow row = readable(callerId, enrollmentId);
        if (callerId.equals(row.learnerId())) {
            throw HttpError.forbidden("Le point de départ est confirmé par le professeur ou l’administration.");
        }
        active(row);
        if (request == null || request.acquiredModules() == null) throw HttpError.badRequest("Indiquez les modules acquis.");
        Set<String> trackModules = new HashSet<>();
        for (JsonNode module : track(row.trackVersionId(), callerId).path("modules")) trackModules.add(module.path("id").asText());
        if (!trackModules.containsAll(request.acquiredModules())) {
            throw HttpError.badRequest("Un module indiqué n’appartient pas à ce parcours.");
        }
        boolean prerequisiteMet = row.prerequisiteMet();
        if (Boolean.TRUE.equals(request.prerequisiteMet()) && !prerequisiteMet) {
            if (!Boolean.TRUE.equals(row.diagnosticPrerequisite())) {
                throw HttpError.conflict("Le prérequis se confirme par un niveau validé dans LinguaCap ou par le diagnostic.");
            }
            prerequisiteMet = true;
        }
        goals.confirmStartingPoint(enrollmentId, List.copyOf(new HashSet<>(request.acquiredModules())), prerequisiteMet, callerId);
        repropose(goals.byId(enrollmentId), callerId);
        return view(goals.byId(enrollmentId), callerId);
    }

    // --- Calcul d'une proposition --------------------------------------------------------------------------

    /** Nouvelle proposition après un changement du point de départ : celle du parcours s'il y en a un. */
    private void repropose(GoalStore.EnrollmentRow row, UUID callerId) {
        PathStore.PathRow path = pathResource.pathOfEnrollment(row.id());
        if (path != null) {
            if ("active".equals(path.status())) pathResource.repropose(path, access.viewer(callerId, row.learnerId()));
            return;
        }
        propose(row, callerId, null);
    }

    private ProposalView propose(GoalStore.EnrollmentRow row, UUID callerId, LocalDate resumeDate) {
        JsonNode track = track(row.trackVersionId(), callerId);
        JsonNode planning = track.path("planning");
        Map<String, String> moduleTitles = new HashMap<>();
        List<Planner.ModuleContent> modules = new ArrayList<>();
        for (JsonNode module : track.path("modules")) {
            List<Planner.Item> activities = new ArrayList<>();
            for (JsonNode activity : module.path("activities")) {
                activities.add(new Planner.Item(activity.path("id").asText(), activity.path("kind").asText(),
                        activity.path("title").asText(), activity.path("estimatedMinutes").asInt(), module.path("id").asText()));
            }
            List<String> prerequisites = new ArrayList<>();
            module.path("prerequisites").forEach(item -> prerequisites.add(item.asText()));
            modules.add(new Planner.ModuleContent(module.path("id").asText(), module.path("position").asInt(),
                    module.path("title").asText(), prerequisites, activities));
            moduleTitles.put(module.path("id").asText(), module.path("title").asText());
        }
        List<Planner.Item> items = Planner.items(modules, Set.copyOf(row.acquiredModules()),
                goals.completedActivities(row.id()), planning.path("reviewMinutes").asInt(10),
                planning.path("midtermMinutes").asInt(30), planning.path("finalMinutes").asInt(60));
        LocalDate today = LocalDate.now(CourseRules.PILOT_ZONE);
        LocalDate from = resumeDate != null ? resumeDate : (row.startDate().isAfter(today) ? row.startDate() : today);
        List<Day> availability = goals.availability(row.id());
        Planner.Plan plan = Planner.plan(from, row.targetDate(), availability, items);

        List<PlannedSession> sessions = plan.sessions().stream().map(session -> {
            Planner.Item first = session.items().get(0);
            String moduleId = first.moduleId() == null ? "evaluation" : first.moduleId();
            String title = first.moduleId() == null ? first.title() : moduleTitles.getOrDefault(first.moduleId(), first.title());
            return new PlannedSession(session.date(), session.slot(),
                    session.date().atTime(CourseRules.DUE_TIME).atZone(CourseRules.PILOT_ZONE).toOffsetDateTime().toString(),
                    title, moduleId, session.minutes(), session.capacity(), session.items());
        }).toList();
        JsonNode stored = mapper.valueToTree(new PlanJson(sessions, plan.overflow(), plan.weeks(), plan.suggestions()));
        int number = goals.saveProposal(row.id(), row.validatedRevision(), from, row.targetDate(), availability, stored,
                plan.capacityMinutes(), plan.requiredMinutes(), plan.overflow().size(), callerId);
        return proposalView(goals.proposal(row.id()), row, callerId, number);
    }

    private ProposalView proposalView(GoalStore.ProposalRow proposal, GoalStore.EnrollmentRow row, UUID callerId) {
        return proposalView(proposal, row, callerId, proposal.number());
    }

    private ProposalView proposalView(GoalStore.ProposalRow proposal, GoalStore.EnrollmentRow row, UUID callerId, int number) {
        boolean pending = "proposed".equals(proposal.status());
        boolean validatable = pending && proposal.overflowCount() == 0 && row.prerequisiteMet() && canValidate(callerId, row);
        return new ProposalView(number, proposal.baseRevision(), proposal.status(), proposal.startDate().toString(),
                proposal.targetDate().toString(), proposal.availability(), proposal.capacityMinutes(),
                proposal.requiredMinutes(), proposal.overflowCount(), proposal.createdAt().toString(),
                proposal.plan().path("sessions"), proposal.plan().path("overflow"), proposal.plan().path("weeks"),
                proposal.plan().path("suggestions"), validatable);
    }

    // --- Vue du parcours -----------------------------------------------------------------------------------

    private EnrollmentView view(GoalStore.EnrollmentRow row, UUID callerId) {
        JsonNode planning = track(row.trackVersionId(), callerId).path("planning");
        PathStore.PathRow path = pathResource.pathOfEnrollment(row.id());
        GoalStore.ProposalRow proposal = path == null ? goals.proposal(row.id()) : null;
        CourseResource.EnrollmentSessions sessions = courses.sessions(row.id());
        GoalView goal = new GoalView(row.startLevel(), row.levelCode(), row.startDate().toString(),
                row.targetDate() == null ? null : row.targetDate().toString(),
                row.initialTargetDate() == null ? null : row.initialTargetDate().toString(), row.template(),
                row.goalStatus(), row.pausedAt() == null ? null : row.pausedAt().toString(),
                row.resumeDate() == null ? null : row.resumeDate().toString(), text(planning.path("successCriteria")),
                planning.path("expectedCompetences"), planning.path("passPercent").asInt(60), row.prerequisiteLevel(),
                row.prerequisiteMet(), row.acquiredModules(), text(planning.path("diagnosticLessonId")),
                row.diagnosticAttemptId() == null ? null : row.diagnosticAttemptId().toString(), row.diagnosticModules(),
                row.diagnosticPrerequisite(), row.startingPointConfirmedAt() == null ? null : row.startingPointConfirmedAt().toString(),
                row.validatedRevision(), accompanied(callerId, row));
        ProposalSummary summary;
        if (path != null) {
            // Proposition du parcours : la validation porte sur le niveau actif.
            summary = "active".equals(row.status()) && path.open()
                    ? pathResource.proposalSummary(path, access.viewer(callerId, row.learnerId())) : null;
        } else {
            summary = proposal == null ? null : new ProposalSummary(proposal.number(), proposal.status(),
                    proposal.capacityMinutes(), proposal.requiredMinutes(), proposal.overflowCount(),
                    proposal.createdAt().toString(), "proposed".equals(proposal.status()) && proposal.overflowCount() == 0
                    && row.prerequisiteMet() && canValidate(callerId, row));
        }
        return new EnrollmentView(row.id(), row.learnerId(), row.levelCode(), row.trackVersionId(),
                row.trackVersionNumber(), row.assignedBy(), row.assignedAt().toString(), row.status(), goal,
                goals.availability(row.id()), summary, sessions.current(), sessions.superseded(),
                path == null ? null : path.id());
    }

    // --- Droits --------------------------------------------------------------------------------------------

    private GoalStore.EnrollmentRow readable(UUID callerId, UUID enrollmentId) {
        GoalStore.EnrollmentRow row = goals.byId(enrollmentId);
        if (row == null) throw HttpError.notFound("Parcours introuvable.");
        if (!callerId.equals(row.learnerId())) access.resolve(callerId, row.learnerId().toString());
        return row;
    }

    private boolean accompanied(UUID callerId, GoalStore.EnrollmentRow row) {
        return !identities.learner(callerId, row.learnerId()).path("teacherId").isNull();
    }

    private boolean canValidate(UUID callerId, GoalStore.EnrollmentRow row) {
        boolean isLearner = callerId.equals(row.learnerId());
        String role = isLearner ? "learner" : access.role(callerId);
        return GoalRules.canValidate(isLearner, role, accompanied(callerId, row));
    }

    /** Pause et reprise : le professeur référent ou l'administration, ou l'élève autonome lui-même. */
    private void requirePlanner(UUID callerId, GoalStore.EnrollmentRow row) {
        if (callerId.equals(row.learnerId()) && accompanied(callerId, row)) {
            throw HttpError.forbidden("Votre professeur référent organise la pause et la reprise de votre parcours.");
        }
    }

    private static void active(GoalStore.EnrollmentRow row) {
        if (!"active".equals(row.status())) throw HttpError.conflict("Ce parcours n’est plus actif.");
    }

    private JsonNode track(UUID versionId, UUID callerId) {
        return services.request(catalogueUrl, "/v1/internal/tracks/" + versionId, "GET", callerId, null);
    }

    private static LocalDate date(String value) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException error) {
            throw HttpError.badRequest("Utilisez des dates au format AAAA-MM-JJ.");
        }
    }

    private static String text(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode() || node.asText().isEmpty() ? null : node.asText();
    }

    public record GoalRequest(String learnerId, UUID trackVersionId, String startLevel, String startDate,
                              String targetDate, String template) {}

    public record AvailabilityRequest(List<Day> days, String targetDate) {}

    public record ValidationRequest(Integer number) {}

    public record ResumeRequest(String resumeDate, String targetDate) {}

    public record DiagnosticRequest(String attemptId) {}

    public record StartingPointRequest(List<String> acquiredModules, Boolean prerequisiteMet) {}

    public record TemplateView(String id, String name, String description, List<Day> days, String a1Duration,
                               String a2Duration) {}

    public record PlannedSession(LocalDate date, int slot, String dueAt, String title, String moduleId, int minutes,
                                 int capacity, List<Planner.Item> items) {}

    record PlanJson(List<PlannedSession> sessions, List<Planner.Item> overflow, List<Planner.Week> weeks,
                    List<Planner.Suggestion> suggestions) {}

    public record GoalView(String startLevel, String targetLevel, String startDate, String targetDate,
                           String initialTargetDate, String template, String status, String pausedAt, String resumeDate,
                           String successCriteria, JsonNode expectedCompetences, int passPercent, String prerequisiteLevel,
                           boolean prerequisiteMet, List<String> acquiredModules, String diagnosticLessonId,
                           String diagnosticAttemptId, List<String> diagnosticModules, Boolean diagnosticPrerequisite,
                           String startingPointConfirmedAt, int validatedRevision, boolean accompanied) {}

    public record ProposalSummary(int number, String status, int capacityMinutes, int requiredMinutes, int overflowCount,
                                  String createdAt, boolean validatable) {}

    public record ProposalView(int number, int baseRevision, String status, String startDate, String targetDate,
                               JsonNode availability, int capacityMinutes, int requiredMinutes, int overflowCount,
                               String createdAt, JsonNode sessions, JsonNode overflow, JsonNode weeks,
                               JsonNode suggestions, boolean validatable) {}

    public record EnrollmentView(UUID id, UUID learnerId, String levelCode, UUID trackVersionId, int trackVersionNumber,
                                 UUID assignedBy, String assignedAt, String status, GoalView goal, List<Day> availability,
                                 ProposalSummary proposal, List<CourseResource.SessionSummary> sessions,
                                 int supersededSessions, UUID pathId) {}
}
