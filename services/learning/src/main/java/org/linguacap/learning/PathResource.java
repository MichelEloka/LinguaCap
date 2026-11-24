package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;
import org.linguacap.learning.LearnerAccess.Viewer;
import org.linguacap.learning.PathStore.AdditionRow;
import org.linguacap.learning.PathStore.LevelChoice;
import org.linguacap.learning.PathStore.PathRow;
import org.linguacap.learning.PathStore.RevisionRow;
import org.linguacap.learning.PathStore.StepRow;
import org.linguacap.learning.Planner.Day;

/**
 * Parcours multi-niveaux : accueil de l'élève, estimation d'un objectif, brouillon, jours, planning global, validation,
 * pause, reprise, passage au niveau suivant et ajouts de cours. Les routes historiques des inscriptions et le lien avec
 * Évaluations délèguent ici quand l'inscription appartient à un parcours.
 */
@ApplicationScoped
@Path("/v1/learning")
@Produces(MediaType.APPLICATION_JSON)
public class PathResource {
    private static final Logger LOG = Logger.getLogger(PathResource.class);
    private static final String SLUG = "[a-z0-9]+(-[a-z0-9]+)*";

    @Inject Actor actor;
    @Inject LearnerAccess access;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject PathStore paths;
    @Inject ContractStore contracts;
    @Inject GoalStore goals;
    @Inject CourseStore courses;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "lingua.services.catalogue")
    String catalogueUrl;
    @ConfigProperty(name = "lingua.services.assessment")
    String assessmentUrl;
    @ConfigProperty(name = "lingua.services.identity")
    String identityUrl;

    // --- Accueil et estimation ------------------------------------------------------------------------------

    /** Étapes de l'accueil de l'élève : langue, test de niveau, résultat, objectif, jours, planning, démarrage. */
    @GET
    @Path("/onboarding")
    public OnboardingState onboarding() {
        UUID callerId = actor.id();
        JsonNode me = identities.current(callerId);
        if (!"learner".equals(me.path("role").asText())) throw HttpError.forbidden("L’accueil est réservé aux élèves.");
        Viewer viewer = access.viewer(callerId, callerId);
        String languageId = me.hasNonNull("languageId") ? me.path("languageId").asText() : viewer.languageId();
        OnboardingTeacher teacher = viewer.teacherId() == null ? null
                : new OnboardingTeacher(viewer.teacherId().toString(), teacherName(callerId));
        PathRow path = paths.latest(callerId);
        if (path != null && "withdrawn".equals(path.status())) path = null;
        JsonNode placement = latestPlacement(callerId, callerId, languageId);
        if (languageId == null && path != null) languageId = path.languageId();

        JsonNode language = languageId == null ? null : language(callerId, languageId);
        OnboardingProgress progress = onboardingProgress(catalogue(callerId), languageId, language,
                path == null ? null : path.status(), path != null && path.availabilityConfirmedAt() != null, placement);
        // Identités ne bloque pas le changement de langue : elle se verrouille dès que le parcours démarre ou que
        // l'élève est suivi (langue choisie par le professeur).
        return new OnboardingState(viewer.accompanied(), languageId, viewer.accompanied() || progress.started(), teacher,
                placement == null ? null : new OnboardingPlacement(placement.path("id").asText(),
                        placement.path("status").asText(), progress.placedLevel(), text(placement.path("completedAt"))),
                path == null ? null : new OnboardingPath(path.id().toString(), path.status(), path.validatedRevision()),
                progress.steps(), progress.started(), progress.blocked());
    }

    /**
     * Calcul de l'accueil d'un élève, partagé avec la vue du professeur (LearnerStateResource) : étapes, démarrage et
     * blocage. pathStatus : parcours ouvert ou le plus récent, null sans parcours (ou retiré) ; language : langue du
     * catalogue (null si le catalogue ne la décrit pas) ; placement : dernière tentative du test de niveau, ou null.
     */
    OnboardingProgress onboardingProgress(Catalogue catalogue, String languageId, JsonNode language, String pathStatus,
                                          boolean availabilityConfirmed, JsonNode placement) {
        boolean placed = placement != null && "completed".equals(placement.path("status").asText());
        String placedLevel = placed ? text(placement.path("placedLevel")) : null;
        boolean started = pathStatus != null && !"draft".equals(pathStatus);
        String blocked = null;
        if (!started && language != null) {
            if (!"available".equals(language.path("status").asText("available"))) blocked = "language_unavailable";
            else if (!placed && !language.path("placementAvailable").asBoolean(true)) blocked = "placement_unavailable";
        }
        if (!started && blocked == null && placed && pathStatus == null && languageId != null
                && PathRules.allowedTargets(placedLevel, catalogue.published(languageId).keySet()).isEmpty()) {
            blocked = "no_target_available";
        }
        return new OnboardingProgress(OnboardingRules.steps(languageId != null, placed, pathStatus, availabilityConfirmed,
                blocked), started, blocked, placedLevel);
    }

    /** Étapes de l'accueil, démarrage du parcours, blocage éventuel et niveau placé par le test. */
    record OnboardingProgress(List<OnboardingStep> steps, boolean started, String blocked, String placedLevel) {}

    /** Charge et difficulté d'un objectif, bandes du barème, cibles autorisées et jours proposés. */
    @POST
    @Path("/paths/estimate")
    @Consumes(MediaType.APPLICATION_JSON)
    public Estimate estimate(EstimateRequest request) {
        UUID callerId = actor.id();
        if (request == null || request.targetDate() == null) {
            throw HttpError.badRequest("Indiquez le niveau visé et la date cible.");
        }
        UUID learnerId = request.learnerId() == null ? callerId : LearnerAccess.parse(request.learnerId());
        if (request.learnerId() == null) access.resolve(callerId, null);
        Viewer viewer = access.viewer(callerId, learnerId);
        PathRow path = null;
        if (request.pathId() != null) {
            path = paths.byId(parseId(request.pathId(), "Parcours introuvable."));
            if (path == null || !path.learnerId().equals(learnerId)) throw HttpError.notFound("Parcours introuvable.");
        }
        String targetLevel = PathRules.checkTargetLevel(request.targetLevel());
        String languageId = path != null ? path.languageId() : viewer.languageId() != null ? viewer.languageId() : "de";
        String startLevel = request.startLevel() != null ? PathRules.checkStartLevel(request.startLevel())
                : path != null ? path.startLevel() : placedLevel(callerId, learnerId, languageId);
        LocalDate today = today();
        boolean active = path != null && "active".equals(path.status());
        LocalDate start = request.startDate() != null ? date(request.startDate())
                : active ? later(today, path.startDate()) : path != null ? path.startDate() : today;
        LocalDate target = date(request.targetDate());
        PathRules.checkTarget(start, target);

        Catalogue catalogue = catalogue(callerId);
        Map<String, Track> published = catalogue.published(languageId);
        List<String> allowed = PathRules.allowedTargets(startLevel, published.keySet());
        List<Slot> slots = active ? slotsFor(path, paths.steps(path.id()), targetLevel, catalogue)
                : freshSlots(startLevel, targetLevel, published, allowed);
        List<PathPlanner.Level> levels = levels(slots, catalogue, active ? paths.additions(path.id()) : List.of());
        int required = PathPlanner.requiredMinutes(levels);
        PathRules.Difficulty difficulty = PathRules.difficulty(required, start, target);
        int weekly = difficulty.requiredWeeklyMinutes();
        List<EstimateLevel> estimateLevels = new ArrayList<>();
        for (int index = 0; index < slots.size(); index++) {
            PathPlanner.Level level = levels.get(index);
            if (!level.open()) continue;
            estimateLevels.add(new EstimateLevel(level.levelCode(), slots.get(index).versionId().toString(),
                    PathPlanner.levelMinutes(level)));
        }
        long days = ChronoUnit.DAYS.between(start, target);
        return new Estimate(languageId, startLevel, targetLevel, start.toString(), target.toString(),
                Math.round(days / 7.0 * 10) / 10.0, required, estimateLevels, weekly,
                new DailyMinutes((int) Math.ceil(weekly / 5.0), (int) Math.ceil(weekly / 7.0)), difficulty,
                PathRules.bands(required, start), allowed, start.plusDays(7).toString(),
                start.plusDays(PathRules.MAX_PATH_DAYS).toString(), PathRules.suggestedAvailability(weekly));
    }

    // --- Brouillon et objectif ------------------------------------------------------------------------------

    /** L'élève crée son parcours à partir de son test de niveau : brouillon et proposition n°1. */
    @POST
    @Path("/paths")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(PathCreateRequest request) {
        UUID callerId = actor.id();
        if (!"learner".equals(access.role(callerId))) throw HttpError.forbidden("Seul l’élève crée son parcours.");
        if (request == null || request.placementAttemptId() == null || request.startDate() == null
                || request.targetDate() == null) {
            throw HttpError.badRequest("Indiquez votre test de niveau, le niveau visé et les dates.");
        }
        Viewer viewer = access.viewer(callerId, callerId);
        UUID attemptId = parseId(request.placementAttemptId(), "Test de niveau introuvable.");
        JsonNode placement = placement(callerId, callerId, attemptId);
        if (!"completed".equals(placement.path("status").asText())) {
            throw HttpError.conflict("Terminez votre test de niveau avant de choisir votre objectif.");
        }
        String placedLevel = text(placement.path("placedLevel"));
        String languageId = text(placement.path("languageId")) != null ? text(placement.path("languageId"))
                : viewer.languageId() != null ? viewer.languageId() : "de";
        String startLevel = request.startLevel() == null ? placedLevel : PathRules.checkStartLevel(request.startLevel());
        PathRules.checkStartLevel(startLevel);
        PathRules.checkStartNotAbovePlacement(startLevel, placedLevel);
        String targetLevel = PathRules.checkTargetLevel(request.targetLevel());
        LocalDate start = date(request.startDate());
        LocalDate target = date(request.targetDate());
        PathRules.checkDates(start, target, today());

        Catalogue catalogue = catalogue(callerId);
        Map<String, Track> published = catalogue.published(languageId);
        List<Slot> slots = freshSlots(startLevel, targetLevel, published, PathRules.allowedTargets(startLevel, published.keySet()));
        List<PathPlanner.Level> levels = levels(slots, catalogue, List.of());
        int required = PathPlanner.requiredMinutes(levels);
        PathRules.Difficulty difficulty = PathRules.difficulty(required, start, target);
        PathRules.checkObjective(difficulty.code());
        List<Day> days = PathRules.suggestedAvailability(difficulty.requiredWeeklyMinutes());
        UUID pathId = paths.createDraft(callerId, languageId, startLevel, targetLevel, start, target,
                difficulty.requiredWeeklyMinutes(), required, difficulty.code(), attemptId, choices(slots), days);
        PathRow path = paths.byId(pathId);
        propose(path, callerId, days, start, target, catalogue);
        return Response.status(Response.Status.CREATED).entity(view(paths.byId(pathId), viewer)).build();
    }

    /** Parcours de l'élève (ouvert, sinon le plus récent), ou null. */
    @GET
    @Path("/path")
    public JsonNode path(@QueryParam("learnerId") String requestedLearnerId) {
        UUID callerId = actor.id();
        UUID learnerId = access.resolve(callerId, requestedLearnerId);
        PathRow path = paths.latest(learnerId);
        if (path == null) return NullNode.getInstance();
        return mapper.valueToTree(view(path, access.viewer(callerId, learnerId)));
    }

    /** Nouvel objectif d'un brouillon (l'élève) : niveaux, dates et niveau de départ. */
    @PUT
    @Path("/paths/{pathId}/objective")
    @Consumes(MediaType.APPLICATION_JSON)
    public PathView objective(@PathParam("pathId") UUID pathId, ObjectiveRequest request) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        Viewer viewer = access.viewer(callerId, path.learnerId());
        if (!viewer.learner()) throw HttpError.forbidden("L’élève choisit lui-même l’objectif de son brouillon.");
        if (!"draft".equals(path.status())) {
            throw HttpError.conflict("L’objectif d’un parcours démarré se modifie par un avenant au contrat.");
        }
        if (request == null || request.startDate() == null || request.targetDate() == null) {
            throw HttpError.badRequest("Indiquez le niveau visé et les dates.");
        }
        String placedLevel = path.placementAttemptId() == null ? null
                : text(placement(callerId, callerId, path.placementAttemptId()).path("placedLevel"));
        String startLevel = request.startLevel() == null ? path.startLevel() : PathRules.checkStartLevel(request.startLevel());
        PathRules.checkStartNotAbovePlacement(startLevel, placedLevel);
        String targetLevel = PathRules.checkTargetLevel(request.targetLevel());
        LocalDate start = date(request.startDate());
        LocalDate target = date(request.targetDate());
        PathRules.checkDates(start, target, today());
        Catalogue catalogue = catalogue(callerId);
        Map<String, Track> published = catalogue.published(path.languageId());
        List<Slot> slots = freshSlots(startLevel, targetLevel, published, PathRules.allowedTargets(startLevel, published.keySet()));
        int required = PathPlanner.requiredMinutes(levels(slots, catalogue, List.of()));
        PathRules.Difficulty difficulty = PathRules.difficulty(required, start, target);
        PathRules.checkObjective(difficulty.code());
        paths.updateObjective(pathId, startLevel, targetLevel, start, target, difficulty.requiredWeeklyMinutes(), required,
                difficulty.code(), choices(slots));
        List<Day> days = paths.availability(pathId);
        if (path.availabilityConfirmedAt() == null) {
            // Jours encore jamais confirmés : ils suivent la nouvelle charge.
            days = PathRules.suggestedAvailability(difficulty.requiredWeeklyMinutes());
            List<Day> suggested = days;
            paths.transaction("suggest days", connection -> {
                paths.writeAvailability(connection, pathId, suggested);
                return null;
            });
        }
        propose(paths.byId(pathId), callerId, days, start, target, catalogue);
        return view(paths.byId(pathId), viewer);
    }

    // --- Jours, proposition et validation -----------------------------------------------------------------

    @PUT
    @Path("/paths/{pathId}/availability")
    @Consumes(MediaType.APPLICATION_JSON)
    public PathProposal availability(@PathParam("pathId") UUID pathId, AvailabilityRequest request) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        if (request == null) throw HttpError.badRequest("Les disponibilités sont requises.");
        return changeAvailability(path, access.viewer(callerId, path.learnerId()), request.days(),
                request.targetDate() == null ? null : date(request.targetDate()));
    }

    @GET
    @Path("/paths/{pathId}/proposal")
    public PathProposal proposal(@PathParam("pathId") UUID pathId) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        PathProposal proposal = currentProposal(path, access.viewer(callerId, path.learnerId()));
        if (proposal == null) throw HttpError.notFound("Aucune proposition de planning pour ce parcours.");
        return proposal;
    }

    /** Validation : l'élève démarre son brouillon ; ensuite l'élève, le professeur référent ou l'administration. */
    @POST
    @Path("/paths/{pathId}/proposal/validate")
    @Consumes(MediaType.APPLICATION_JSON)
    public PathView validate(@PathParam("pathId") UUID pathId, GoalResource.ValidationRequest request) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        Viewer viewer = access.viewer(callerId, path.learnerId());
        if (request == null || request.number() == null) throw HttpError.badRequest("Indiquez la proposition à valider.");
        validateProposal(path, viewer, request.number());
        return view(paths.byId(pathId), viewer);
    }

    @POST
    @Path("/paths/{pathId}/pause")
    @Consumes(MediaType.APPLICATION_JSON)
    public PathView pause(@PathParam("pathId") UUID pathId) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        Viewer viewer = access.viewer(callerId, path.learnerId());
        pausePath(path, viewer);
        return view(paths.byId(pathId), viewer);
    }

    @POST
    @Path("/paths/{pathId}/resume")
    @Consumes(MediaType.APPLICATION_JSON)
    public PathProposal resume(@PathParam("pathId") UUID pathId, GoalResource.ResumeRequest request) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        if (request == null || request.resumeDate() == null) throw HttpError.badRequest("Indiquez la date de reprise.");
        return resumePath(path, access.viewer(callerId, path.learnerId()), date(request.resumeDate()),
                request.targetDate() == null ? null : date(request.targetDate()));
    }

    /**
     * Passage au niveau suivant : automatique à la remise de l'examen blanc, possible ensuite pour l'élève si
     * l'ouverture n'a pas eu lieu ; le professeur référent ou l'administration peut le forcer à tout moment.
     */
    @POST
    @Path("/paths/{pathId}/advance")
    @Consumes(MediaType.APPLICATION_JSON)
    public PathView advance(@PathParam("pathId") UUID pathId) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        Viewer viewer = access.viewer(callerId, path.learnerId());
        if (!"active".equals(path.status())) throw HttpError.conflict("Ce parcours n’est plus actif.");
        List<StepRow> steps = paths.steps(pathId);
        StepRow active = activeStep(steps);
        boolean hasNext = active != null && nextStep(steps, active) != null;
        if (!hasNext) throw HttpError.conflict("Aucun niveau suivant n’est prévu dans ce parcours.");
        if (!viewer.educator() && !PathRules.SUBMITTED_FINAL.contains(active.goalStatus())) {
            throw HttpError.conflict("Le niveau suivant s’ouvre à la remise de l’examen blanc du niveau en cours.");
        }
        if (paths.activateNext(pathId, null, callerId, today()) != null) afterActivation(pathId, callerId);
        return view(paths.byId(pathId), viewer);
    }

    // --- Ajouts de cours -----------------------------------------------------------------------------------

    @GET
    @Path("/paths/{pathId}/additions")
    public List<AdditionView> additions(@PathParam("pathId") UUID pathId) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        access.viewer(callerId, path.learnerId());
        Catalogue catalogue = catalogue(callerId);
        Map<UUID, Map<String, CourseStore.ProgressRow>> progress = new HashMap<>();
        return paths.additions(pathId).stream().map(row -> additionView(row, catalogue, progress)).toList();
    }

    /** Le professeur référent ou l'administration ajoute un module ou une activité d'une version publiée de la langue. */
    @POST
    @Path("/paths/{pathId}/additions")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response addCourse(@PathParam("pathId") UUID pathId, AdditionRequest request) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        Viewer viewer = access.viewer(callerId, path.learnerId());
        if (!viewer.educator()) throw HttpError.forbidden("Le professeur référent ou l’administration ajoute des cours.");
        if (!"active".equals(path.status())) throw HttpError.conflict("Des cours s’ajoutent à un parcours en cours.");
        if (request == null || request.stepLevel() == null || request.trackVersionId() == null || request.moduleId() == null
                || !request.moduleId().matches(SLUG) || request.activityId() != null && !request.activityId().matches(SLUG)
                || !("next".equals(request.placement()) || "end_of_level".equals(request.placement()))) {
            throw HttpError.badRequest("Indiquez le niveau, la version, le module (ou l’activité) et la place de l’ajout.");
        }
        String note = request.note() == null || request.note().isBlank() ? null : request.note().strip();
        if (note != null && note.length() > 500) throw HttpError.badRequest("La note de l’ajout tient en 500 caractères au plus.");
        StepRow step = paths.steps(pathId).stream()
                .filter(row -> row.levelCode().equals(request.stepLevel())
                        && ("planned".equals(row.status()) || "active".equals(row.status())))
                .findFirst().orElseThrow(() -> HttpError.conflict("Ce niveau n’est pas à venir ou en cours dans le parcours."));
        Catalogue catalogue = catalogue(callerId);
        UUID versionId = parseId(request.trackVersionId(), "Version introuvable.");
        JsonNode track = catalogue.track(versionId);
        if (!"published".equals(track.path("status").asText())) {
            throw HttpError.conflict("Seule une version publiée peut servir à un ajout de cours.");
        }
        if (track.hasNonNull("languageId") && !path.languageId().equals(track.path("languageId").asText())) {
            throw HttpError.conflict("Cette version n’est pas dans la langue du parcours.");
        }
        JsonNode module = null;
        for (JsonNode candidate : track.path("modules")) if (request.moduleId().equals(candidate.path("id").asText())) module = candidate;
        if (module == null) throw HttpError.notFound("Module introuvable dans cette version.");
        String title = module.path("title").asText();
        int minutes = 0;
        boolean found = request.activityId() == null;
        for (JsonNode activity : module.path("activities")) {
            if (request.activityId() == null) minutes += activity.path("estimatedMinutes").asInt();
            else if (request.activityId().equals(activity.path("id").asText())) {
                found = true;
                title = activity.path("title").asText();
                minutes = activity.path("estimatedMinutes").asInt();
            }
        }
        if (!found) throw HttpError.notFound("Activité introuvable dans ce module.");
        if (title.isBlank()) title = request.moduleId();
        UUID additionId = paths.insertAddition(pathId, step.id(), versionId, track.path("levelCode").asText(),
                request.moduleId(), request.activityId(), title.length() > 160 ? title.substring(0, 160) : title,
                Math.max(1, Math.min(2000, minutes)), request.placement(), note, callerId);
        PathRow current = paths.byId(pathId);
        PathProposal proposal = reproposal(current, viewer, paths.availability(pathId), catalogue);
        AdditionView addition = additionView(paths.addition(additionId), catalogue, new HashMap<>());
        return Response.status(Response.Status.CREATED).entity(new AdditionCreated(addition, proposal)).build();
    }

    @POST
    @Path("/paths/{pathId}/additions/{additionId}/remove")
    @Consumes(MediaType.APPLICATION_JSON)
    public AdditionRemoved removeCourse(@PathParam("pathId") UUID pathId, @PathParam("additionId") UUID additionId) {
        UUID callerId = actor.id();
        PathRow path = readable(pathId);
        Viewer viewer = access.viewer(callerId, path.learnerId());
        if (!viewer.educator()) throw HttpError.forbidden("Le professeur référent ou l’administration retire un ajout.");
        AdditionRow row = paths.addition(additionId);
        if (row == null || !row.pathId().equals(pathId)) throw HttpError.notFound("Ajout introuvable.");
        if (row.removedAt() != null) throw HttpError.conflict("Cet ajout a déjà été retiré.");
        Catalogue catalogue = catalogue(callerId);
        if ("completed".equals(additionView(row, catalogue, new HashMap<>()).status())) {
            throw HttpError.conflict("Cet ajout est déjà terminé : il reste dans le parcours.");
        }
        paths.removeAddition(pathId, additionId, callerId);
        return new AdditionRemoved(reproposal(paths.byId(pathId), viewer, paths.availability(pathId), catalogue));
    }

    // --- Actions partagées avec les routes historiques et les contrats ---------------------------------------

    /** Parcours d'une inscription, ou null pour une inscription antérieure aux parcours. */
    PathRow pathOfEnrollment(UUID enrollmentId) {
        return paths.ofEnrollment(enrollmentId);
    }

    PathProposal changeAvailability(PathRow path, Viewer viewer, List<Day> requested, LocalDate target) {
        PathRules.Permissions permissions = permissions(path, viewer);
        if (!permissions.canEditAvailability()) {
            if (!path.open()) throw HttpError.conflict("Ce parcours n’est plus actif.");
            throw HttpError.forbidden("Vous ne pouvez pas modifier les jours de ce parcours.");
        }
        List<Day> days = GoalRules.checkAvailability(requested);
        Catalogue catalogue = catalogue(viewer.callerId());
        if ("draft".equals(path.status())) {
            LocalDate newTarget = target == null ? path.targetDate() : target;
            PathRules.checkTarget(path.startDate(), newTarget);
            if (target != null) {
                int required = PathPlanner.requiredMinutes(levels(slots(paths.steps(path.id())), catalogue, List.of()));
                PathRules.checkObjective(PathRules.difficulty(required, path.startDate(), newTarget).code());
            }
            paths.confirmDraftAvailability(path.id(), days, target);
            PathRow updated = paths.byId(path.id());
            propose(updated, viewer.callerId(), days, updated.startDate(), updated.targetDate(), catalogue);
            return currentProposal(paths.byId(path.id()), viewer);
        }
        if (target != null && !target.equals(path.targetDate())) {
            throw HttpError.conflict("La date cible d’un parcours démarré se modifie par un avenant au contrat.");
        }
        return reproposal(path, viewer, days, catalogue);
    }

    /** Proposition en attente, sinon la dernière révision validée ; null si aucune. */
    PathProposal currentProposal(PathRow path, Viewer viewer) {
        RevisionRow revision = paths.proposal(path.id());
        if (revision == null) return null;
        return proposalView(path, revision, viewer, paths.steps(path.id()), engagement(path.id()));
    }

    void validateProposal(PathRow path, Viewer viewer, int number) {
        if ("draft".equals(path.status())) {
            if (!viewer.learner()) throw HttpError.forbidden("L’élève valide lui-même son planning pour démarrer son parcours.");
            paths.start(path.id(), number, viewer.accompanied());
            return;
        }
        if (!"active".equals(path.status())) throw HttpError.conflict("Ce parcours n’est plus actif.");
        RevisionRow revision = paths.revision(path.id(), number);
        if (revision == null) throw HttpError.notFound("Proposition introuvable.");
        List<StepRow> steps = paths.steps(path.id());
        StepRow active = activeStep(steps);
        if (active != null && !active.prerequisiteMet()) {
            throw HttpError.conflict("Le prérequis du niveau doit être validé ou confirmé par le diagnostic.");
        }
        String reason = PathRules.blockingReason(viewer.caller(), path.status(), path.targetLevel(),
                proposalState(path, revision, steps), engagement(path.id()));
        if (reason != null) throw blocked(reason);
        paths.validate(path.id(), number, viewer.callerId());
    }

    void pausePath(PathRow path, Viewer viewer) {
        if (viewer.learner() && viewer.accompanied()) {
            throw HttpError.forbidden("Votre professeur référent organise la pause et la reprise de votre parcours.");
        }
        if (!viewer.learner() && !viewer.educator()) throw HttpError.forbidden("Vous ne pouvez pas mettre ce parcours en pause.");
        paths.pause(path.id());
    }

    PathProposal resumePath(PathRow path, Viewer viewer, LocalDate resumeDate, LocalDate target) {
        if (viewer.learner() && viewer.accompanied()) {
            throw HttpError.forbidden("Votre professeur référent organise la pause et la reprise de votre parcours.");
        }
        if (!"active".equals(path.status()) || path.pausedAt() == null) throw HttpError.conflict("Ce parcours n’est pas en pause.");
        if (target != null && !target.equals(path.targetDate())) {
            throw HttpError.conflict("La date cible d’un parcours démarré se modifie par un avenant au contrat.");
        }
        LocalDate today = today();
        if (resumeDate.isBefore(today) || resumeDate.isAfter(today.plusYears(1)) || !path.targetDate().isAfter(resumeDate)) {
            throw HttpError.badRequest("La reprise doit être comprise entre aujourd’hui et la date cible du parcours.");
        }
        paths.planResume(path.id(), resumeDate);
        PathRow updated = paths.byId(path.id());
        Catalogue catalogue = catalogue(viewer.callerId());
        propose(updated, viewer.callerId(), paths.availability(path.id()), resumeDate, updated.targetDate(), catalogue);
        return currentProposal(paths.byId(path.id()), viewer);
    }

    /** Nouvelle proposition à partir du planning en vigueur (point de départ confirmé, diagnostic, ajout…). */
    PathProposal repropose(PathRow path, Viewer viewer) {
        return reproposal(path, viewer, paths.availability(path.id()), catalogue(viewer.callerId()));
    }

    /**
     * Après l'application de conditions (contrat) : nouvelle proposition jusqu'à la date du contrat, validée
     * automatiquement si elle tient et respecte l'engagement ; sinon elle reste en attente.
     */
    void reproposeAndValidate(UUID pathId, UUID by, List<Day> days) {
        PathRow path = paths.byId(pathId);
        if (path == null || !"active".equals(path.status())) return;
        Catalogue catalogue = catalogue(by);
        int number = propose(path, by, days == null || days.isEmpty() ? paths.availability(pathId) : days,
                from(path), path.targetDate(), catalogue);
        autoValidate(pathId, number, by);
    }

    /**
     * Lien avec Évaluations : la remise de l'examen blanc du niveau actif ouvre le niveau suivant ; sa validation sur
     * le dernier niveau termine le parcours. Un niveau déjà terminé (reprise « à consolider ») ne change rien.
     */
    void onExamEvent(UUID enrollmentId, String kind, String event, String decision, UUID callerId) {
        PathRow path = paths.ofEnrollment(enrollmentId);
        if (path == null || !"active".equals(path.status())) return;
        List<StepRow> steps = paths.steps(path.id());
        StepRow step = steps.stream().filter(row -> enrollmentId.equals(row.enrollmentId())).findFirst().orElse(null);
        if (step == null) return;
        switch (PathRules.examFollowUp(step.status(), nextStep(steps, step) != null, kind, event, decision)) {
            case ACTIVATE_NEXT -> {
                if (paths.activateNext(path.id(), step.id(), callerId, today()) != null) afterActivation(path.id(), callerId);
            }
            case COMPLETE_PATH -> paths.complete(enrollmentId);
            case NONE -> { }
        }
    }

    /**
     * Attribution historique par le professeur (POST /learning/enrollments) : parcours d'un niveau (origine
     * « assignment »), proposition n°1 à valider comme avant, contrat n°1 accepté d'office. Renvoie l'inscription.
     */
    UUID assign(UUID learnerId, JsonNode track, UUID assignedBy, String role, String startLevel, LocalDate start,
                LocalDate target, String template, String prerequisite, boolean prerequisiteMet, List<Day> days) {
        String levelCode = track.path("levelCode").asText();
        String languageId = track.hasNonNull("languageId") ? track.path("languageId").asText() : "de";
        LevelChoice level = new LevelChoice(PathRules.rank(levelCode), levelCode,
                UUID.fromString(track.path("versionId").asText()), track.path("number").asInt());
        UUID[] created = paths.createAssigned(learnerId, languageId, level, assignedBy, startLevel, start, target, template,
                prerequisite, prerequisiteMet, days);
        PathRow path = paths.byId(created[0]);
        Catalogue catalogue = catalogue(assignedBy);
        catalogue.tracks.put(level.trackVersionId(), track);
        int number = propose(path, assignedBy, days, from(path), target, catalogue);
        RevisionRow revision = paths.revision(path.id(), number);
        int weekly = PathRules.commitment(PathRules.requiredWeeklyMinutes(revision.requiredMinutes(),
                revision.startDate(), revision.targetDate()), days);
        paths.acceptInitialContract(path.id(), "admin".equals(role) ? "admin" : "teacher", assignedBy,
                new ContractStore.Terms(startLevel, levelCode, start, target, weekly, days, revision.requiredMinutes(),
                        revision.difficulty()));
        return created[1];
    }

    // --- Calcul d'une proposition ---------------------------------------------------------------------------

    /** Proposition calculée à partir du planning en vigueur, depuis aujourd'hui (ou la reprise) jusqu'à la date cible. */
    private PathProposal reproposal(PathRow path, Viewer viewer, List<Day> days, Catalogue catalogue) {
        propose(path, viewer.callerId(), days, from(path), path.targetDate(), catalogue);
        return currentProposal(paths.byId(path.id()), viewer);
    }

    /** Calcule et enregistre une proposition du planning global ; renvoie son numéro. */
    int propose(PathRow path, UUID by, List<Day> days, LocalDate from, LocalDate target, Catalogue catalogue) {
        List<StepRow> steps = paths.steps(path.id());
        List<PathPlanner.Level> levels = levels(slots(steps), catalogue, paths.additions(path.id()));
        PathPlanner.Result result = PathPlanner.plan(from, target, days, levels, !"draft".equals(path.status()));
        Planner.Plan plan = result.plan();
        JsonNode stored = mapper.valueToTree(new PlanJson(result.sessions(), plan.overflow(), plan.weeks(),
                result.suggestions(), result.levels()));
        PathRules.Difficulty difficulty = PathRules.difficulty(plan.requiredMinutes(), from, target);
        return paths.saveProposal(path.id(), from, target, days, stored, plan.capacityMinutes(), plan.requiredMinutes(),
                plan.overflow().size(), difficulty.code(), by);
    }

    /** Validation automatique d'une proposition qui tient ; un refus laisse la proposition en attente. */
    private void autoValidate(UUID pathId, int number, UUID by) {
        PathRow path = paths.byId(pathId);
        RevisionRow revision = paths.revision(pathId, number);
        if (path == null || revision == null) return;
        PathRules.Caller system = new PathRules.Caller(false, false, true, false);
        if (PathRules.blockingReason(system, path.status(), path.targetLevel(),
                proposalState(path, revision, paths.steps(pathId)), engagement(pathId)) != null) {
            return;
        }
        try {
            paths.validate(pathId, number, by);
        } catch (WebApplicationException refused) {
            LOG.infof("Automatic plan validation left pending (HTTP %d)", refused.getResponse().getStatus());
        }
    }

    /** Après l'ouverture d'un niveau : proposition depuis aujourd'hui jusqu'à la date du contrat, validée si elle tient. */
    private void afterActivation(UUID pathId, UUID by) {
        try {
            reproposeAndValidate(pathId, by, null);
        } catch (WebApplicationException error) {
            LOG.warnf("Plan proposal after level activation failed (HTTP %d)", error.getResponse().getStatus());
        }
    }

    private LocalDate from(PathRow path) {
        if (path.resumeDate() != null) return path.resumeDate();
        return "draft".equals(path.status()) ? path.startDate() : later(today(), path.startDate());
    }

    /** Niveau d'un parcours, réel ou envisagé (estimation, avenant). */
    record Slot(int rank, String levelCode, UUID versionId, int versionNumber, String status, UUID stepId,
                UUID enrollmentId, List<String> acquired) {}

    private static List<Slot> slots(List<StepRow> steps) {
        return steps.stream().map(step -> new Slot(step.rank(), step.levelCode(), step.trackVersionId(),
                step.trackVersionNumber(), step.status(), step.id(), step.enrollmentId(), step.acquiredModules())).toList();
    }

    /** Niveaux d'un nouveau parcours : ]départ, visé], tous publiés et consécutifs. */
    private static List<Slot> freshSlots(String startLevel, String targetLevel, Map<String, Track> published,
                                         List<String> allowed) {
        if (!allowed.contains(targetLevel)) {
            throw HttpError.conflict(PathRules.rank(targetLevel) <= PathRules.rank(startLevel)
                    ? "Le niveau visé doit dépasser le niveau de départ."
                    : "Ce niveau n’est pas encore proposé : choisissez un niveau publié à la suite de votre niveau de départ.");
        }
        List<Slot> slots = new ArrayList<>();
        for (String level : PathRules.levelsBetween(startLevel, targetLevel)) {
            Track track = published.get(level);
            slots.add(new Slot(PathRules.rank(level), level, track.versionId(), track.number(), "planned", null, null, List.of()));
        }
        return slots;
    }

    /**
     * Niveaux d'un parcours démarré pour un niveau visé : les niveaux ouverts ou terminés restent, les niveaux prévus
     * au-delà de la cible sortent, les niveaux manquants sont pris dans les versions publiées.
     */
    List<Slot> slotsFor(PathRow path, List<StepRow> steps, String targetLevel, Catalogue catalogue) {
        StepRow active = activeStep(steps);
        int targetRank = PathRules.rank(targetLevel);
        int floor = steps.stream().filter(step -> !"planned".equals(step.status())).mapToInt(StepRow::rank).max().orElse(0);
        if (active != null && targetRank < active.rank() || targetRank < floor) {
            throw HttpError.conflict("Le niveau visé ne peut pas être inférieur au niveau en cours.");
        }
        List<Slot> slots = new ArrayList<>();
        int highest = PathRules.rank(path.startLevel());
        for (Slot slot : slots(steps)) {
            if ("planned".equals(slot.status()) && slot.rank() > targetRank) continue;
            slots.add(slot);
            highest = Math.max(highest, slot.rank());
        }
        Map<String, Track> published = null;
        for (int rank = highest + 1; rank <= targetRank; rank++) {
            if (published == null) published = catalogue.published(path.languageId());
            String level = PathRules.levelOfRank(rank);
            Track track = published.get(level);
            if (track == null) {
                throw HttpError.conflict("Le niveau " + level + " n’est pas encore proposé : choisissez un niveau publié.");
            }
            slots.add(new Slot(rank, level, track.versionId(), track.number(), "planned", null, null, List.of()));
        }
        return slots;
    }

    /** Niveaux prévus à enregistrer pour une liste de niveaux (les niveaux ouverts ou terminés sont conservés). */
    static List<LevelChoice> choices(List<Slot> slots) {
        return slots.stream().filter(slot -> "planned".equals(slot.status()))
                .map(slot -> new LevelChoice(slot.rank(), slot.levelCode(), slot.versionId(), slot.versionNumber())).toList();
    }

    /** Contenu de chaque niveau pour le planificateur : version, acquis, activités terminées et ajouts actifs. */
    List<PathPlanner.Level> levels(List<Slot> slots, Catalogue catalogue, List<AdditionRow> additions) {
        List<PathPlanner.Level> levels = new ArrayList<>();
        int position = 0;
        for (Slot slot : slots) {
            position++;
            JsonNode track = catalogue.track(slot.versionId());
            JsonNode planning = track.path("planning");
            boolean open = slot.enrollmentId() != null;
            Set<String> completed = open ? goals.completedActivities(slot.enrollmentId()) : Set.of();
            List<PathPlanner.Addition> added = new ArrayList<>();
            for (AdditionRow row : additions) {
                if (row.removedAt() != null || slot.stepId() == null || !slot.stepId().equals(row.stepId())) continue;
                added.add(addition(row, catalogue));
            }
            levels.add(new PathPlanner.Level(position, slot.levelCode(), slot.status(), modules(track),
                    open ? Set.copyOf(slot.acquired()) : Set.of(), completed, planning.path("reviewMinutes").asInt(10),
                    planning.path("midtermMinutes").asInt(30), planning.path("finalMinutes").asInt(60), List.copyOf(added)));
        }
        return levels;
    }

    private static PathPlanner.Addition addition(AdditionRow row, Catalogue catalogue) {
        JsonNode source = catalogue.track(row.sourceVersionId());
        String moduleTitle = row.title();
        List<PathPlanner.SourceActivity> activities = new ArrayList<>();
        for (JsonNode module : source.path("modules")) {
            if (!row.moduleId().equals(module.path("id").asText())) continue;
            moduleTitle = module.path("title").asText(row.title());
            for (JsonNode activity : module.path("activities")) {
                if (row.activityId() != null && !row.activityId().equals(activity.path("id").asText())) continue;
                activities.add(new PathPlanner.SourceActivity(activity.path("id").asText(), activity.path("kind").asText(),
                        activity.path("title").asText(), activity.path("estimatedMinutes").asInt()));
            }
        }
        return new PathPlanner.Addition(row.id().toString(), row.placement(), row.sourceVersionId().toString(),
                row.moduleId(), moduleTitle, List.copyOf(activities));
    }

    private static List<Planner.ModuleContent> modules(JsonNode track) {
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
        }
        return modules;
    }

    // --- Vues ------------------------------------------------------------------------------------------------

    PathView view(PathRow path, Viewer viewer) {
        Catalogue catalogue = catalogue(viewer.callerId());
        List<StepRow> steps = paths.steps(path.id());
        RevisionRow proposal = paths.proposal(path.id());
        RevisionRow validated = proposal != null && "validated".equals(proposal.status()) ? proposal : paths.validated(path.id());
        boolean draft = "draft".equals(path.status());
        RevisionRow projection = draft ? proposal : validated;
        StepRow active = activeStep(steps);
        String defaultLevel = active != null ? active.levelCode() : steps.isEmpty() ? null : steps.get(0).levelCode();
        List<PathPlanner.PlannedSession> projected = projection == null ? List.of()
                : PathPlanner.parseSessions(projection.plan().path("sessions"), defaultLevel);

        List<PathStepView> stepViews = new ArrayList<>();
        List<PathPlanner.PathSession> sessions = new ArrayList<>();
        int position = 0;
        for (StepRow step : steps) {
            position++;
            List<PathPlanner.PathSession> own;
            if (step.enrollmentId() != null) {
                int stepPosition = position;
                own = courses.sessions(step.enrollmentId()).current().stream()
                        .map(session -> PathPlanner.actual(session, step.enrollmentId(), stepPosition, step.levelCode()))
                        .toList();
            } else {
                own = PathPlanner.locked(projected, step.levelCode(), position);
            }
            if (!draft) sessions.addAll(own);
            int minutes = own.stream().mapToInt(PathPlanner.PathSession::estimatedMinutes).sum();
            String finalDecision = "validated".equals(step.goalStatus()) || "to_consolidate".equals(step.goalStatus())
                    ? step.goalStatus() : null;
            stepViews.add(new PathStepView(step.id(), position, step.levelCode(),
                    catalogue.track(step.trackVersionId()).path("levelTitle").asText(step.levelCode()), step.trackVersionId(),
                    step.trackVersionNumber(), step.status(), step.enrollmentId(), step.goalStatus(), minutes,
                    own.isEmpty() ? null : own.get(0).date(), own.isEmpty() ? null : own.get(own.size() - 1).date(),
                    own.size(), (int) own.stream().filter(session -> "completed".equals(session.status())).count(),
                    finalDecision));
        }

        List<ContractStore.ContractRow> all = contracts.list(path.id());
        ContractStore.ContractRow current = all.stream().filter(row -> ContractRules.ACCEPTED.equals(row.status()))
                .findFirst().orElse(null);
        ContractStore.ContractRow pending = all.stream().filter(row -> ContractRules.PENDING.contains(row.status()))
                .findFirst().orElse(null);
        boolean pathActive = "active".equals(path.status());
        PathRules.Engagement engagement = current == null ? null : new PathRules.Engagement(current.terms().targetLevel(),
                current.terms().targetDate(), current.terms().weeklyMinutes());

        String blocking = null;
        ProposalBrief brief = null;
        if (proposal != null) {
            blocking = PathRules.blockingReason(viewer.caller(), path.status(), path.targetLevel(),
                    proposalState(path, proposal, steps), engagement);
            brief = new ProposalBrief(proposal.number(), proposal.status(), proposal.overflowCount(),
                    "proposed".equals(proposal.status()) && blocking == null, proposal.createdAt().toString());
        }
        PathRules.PathState state = new PathRules.PathState(path.status(), path.pausedAt() != null,
                active != null && nextStep(steps, active) != null, active == null ? null : active.goalStatus(),
                pending == null ? null : pending.status(), current != null);
        PathRules.Permissions permissions = PathRules.permissions(viewer.caller(), state, blocking,
                proposal != null && "proposed".equals(proposal.status()));
        LocalDate liveFrom = draft ? path.startDate() : later(today(), path.startDate());
        PathRules.Difficulty difficulty = liveFrom.isBefore(path.targetDate())
                ? PathRules.difficulty(path.requiredMinutes(), liveFrom, path.targetDate())
                : PathRules.of(path.difficulty(), path.requiredMinutes());
        if (!path.open()) difficulty = PathRules.of(path.difficulty(),
                PathRules.requiredWeeklyMinutes(path.requiredMinutes(), path.startDate(), path.targetDate()));
        return new PathView(path.id(), path.learnerId(), path.languageId(), path.status(), viewer.accompanied(),
                path.origin(), path.startLevel(), path.targetLevel(), path.startDate().toString(),
                path.targetDate().toString(), path.initialTargetDate().toString(), path.weeklyMinutes(),
                path.requiredMinutes(), difficulty, path.placementAttemptId(), path.pausedAt() != null,
                path.pausedAt() == null ? null : path.pausedAt().toString(),
                path.resumeDate() == null ? null : path.resumeDate().toString(), path.validatedRevision(), stepViews,
                paths.availability(path.id()), brief, sessions,
                new ContractBlock(current == null ? null : ContractResource.view(current, viewer.party(), pathActive),
                        pending == null ? null : ContractResource.view(pending, viewer.party(), pathActive), current != null),
                permissions);
    }

    PathProposal proposalView(PathRow path, RevisionRow revision, Viewer viewer, List<StepRow> steps,
                              PathRules.Engagement engagement) {
        StepRow active = activeStep(steps);
        String defaultLevel = active != null ? active.levelCode() : steps.isEmpty() ? null : steps.get(0).levelCode();
        List<PathPlanner.PlannedSession> sessions = PathPlanner.parseSessions(revision.plan().path("sessions"), defaultLevel);
        List<PathPlanner.Span> spans = PathPlanner.parseSpans(revision.plan().path("levels"));
        if (spans.isEmpty()) {
            Map<String, Integer> positions = new LinkedHashMap<>();
            for (int index = 0; index < steps.size(); index++) positions.put(steps.get(index).levelCode(), index + 1);
            spans = PathPlanner.spans(sessions, positions);
        }
        JsonNode weeks = revision.plan().path("weeks").isArray() ? revision.plan().path("weeks") : mapper.createArrayNode();
        String reason = PathRules.blockingReason(viewer.caller(), path.status(), path.targetLevel(),
                proposalState(path, revision, steps), engagement);
        PathRules.Difficulty difficulty = PathRules.of(revision.difficulty(), PathRules.requiredWeeklyMinutes(
                revision.requiredMinutes(), revision.startDate(), revision.targetDate()));
        return new PathProposal(revision.number(), revision.baseRevision(), revision.status(),
                revision.startDate().toString(), revision.targetDate().toString(),
                mapper.valueToTree(PathPlanner.parseDays(revision.availability())), revision.capacityMinutes(),
                revision.requiredMinutes(), revision.overflowCount(), revision.createdAt().toString(),
                mapper.valueToTree(sessions), mapper.valueToTree(PathPlanner.parseItems(revision.plan().path("overflow"),
                defaultLevel)), weeks, mapper.valueToTree(PathPlanner.parseSuggestions(revision.plan().path("suggestions"))),
                "proposed".equals(revision.status()) && reason == null, path.id(), difficulty,
                PathRules.feasibility(revision.requiredMinutes(), revision.capacityMinutes()), mapper.valueToTree(spans),
                reason);
    }

    /** Résumé d'une proposition pour la vue historique d'une inscription. */
    GoalResource.ProposalSummary proposalSummary(PathRow path, Viewer viewer) {
        PathProposal proposal = currentProposal(path, viewer);
        if (proposal == null) return null;
        return new GoalResource.ProposalSummary(proposal.number(), proposal.status(), proposal.capacityMinutes(),
                proposal.requiredMinutes(), proposal.overflowCount(), proposal.createdAt(), proposal.validatable());
    }

    PathRules.Permissions permissions(PathRow path, Viewer viewer) {
        List<StepRow> steps = paths.steps(path.id());
        StepRow active = activeStep(steps);
        List<ContractStore.ContractRow> all = contracts.list(path.id());
        ContractStore.ContractRow pending = all.stream().filter(row -> ContractRules.PENDING.contains(row.status()))
                .findFirst().orElse(null);
        boolean engaged = all.stream().anyMatch(row -> ContractRules.ACCEPTED.equals(row.status()));
        RevisionRow proposal = paths.proposal(path.id());
        String blocking = proposal == null ? null : PathRules.blockingReason(viewer.caller(), path.status(),
                path.targetLevel(), proposalState(path, proposal, steps), engagement(path.id()));
        return PathRules.permissions(viewer.caller(), new PathRules.PathState(path.status(), path.pausedAt() != null,
                        active != null && nextStep(steps, active) != null, active == null ? null : active.goalStatus(),
                        pending == null ? null : pending.status(), engaged), blocking,
                proposal != null && "proposed".equals(proposal.status()));
    }

    PathRules.Engagement engagement(UUID pathId) {
        return contracts.list(pathId).stream().filter(row -> ContractRules.ACCEPTED.equals(row.status())).findFirst()
                .map(row -> new PathRules.Engagement(row.terms().targetLevel(), row.terms().targetDate(),
                        row.terms().weeklyMinutes()))
                .orElse(null);
    }

    /** État d'une proposition, avec le prérequis du niveau actif (attribution d'un niveau à prérequis non confirmé). */
    private static PathRules.ProposalState proposalState(PathRow path, RevisionRow revision, List<StepRow> steps) {
        StepRow active = activeStep(steps);
        return new PathRules.ProposalState(revision.status(), revision.baseRevision(), path.validatedRevision(),
                revision.overflowCount(), revision.targetDate(), PathPlanner.parseDays(revision.availability()),
                active == null || active.prerequisiteMet());
    }

    private AdditionView additionView(AdditionRow row, Catalogue catalogue,
                                      Map<UUID, Map<String, CourseStore.ProgressRow>> cache) {
        String status = "planned";
        if (row.stepEnrollmentId() != null) {
            Map<String, CourseStore.ProgressRow> progress =
                    cache.computeIfAbsent(row.stepEnrollmentId(), id -> courses.progress(id));
            List<String> ids = addition(row, catalogue).activities().stream()
                    .map(activity -> PathPlanner.additionItemId(row.id().toString(), activity.id())).toList();
            long done = ids.stream().filter(id -> progress.containsKey(id) && progress.get(id).completedAt() != null).count();
            boolean started = ids.stream().anyMatch(progress::containsKey);
            status = !ids.isEmpty() && done == ids.size() ? "completed" : started ? "in_progress" : "planned";
        }
        return new AdditionView(row.id(), row.pathId(), row.stepLevel(), row.sourceVersionId(), row.sourceLevelCode(),
                row.moduleId(), row.activityId(), row.title(), row.minutes(), row.placement(), row.note(), row.addedBy(),
                row.addedAt().toString(), row.removedAt() == null ? null : row.removedAt().toString(), status);
    }

    private static WebApplicationException blocked(String reason) {
        return switch (reason) {
            case "not_allowed" -> HttpError.forbidden("Vous ne pouvez pas valider ce planning.");
            case "stale" -> HttpError.conflict("Le planning a changé depuis cette proposition : actualisez-la avant de la valider.");
            case "overflow" -> HttpError.conflict("Le programme dépasse la capacité : appliquez un ajustement avant de valider.");
            case "objective_locked" -> HttpError.conflict(
                    "Le niveau visé et la date cible sont fixés par le contrat : proposez un avenant pour les changer.");
            default -> HttpError.conflict("Le temps prévu chaque semaine doit rester au moins égal à l’engagement du contrat.");
        };
    }

    // --- Outils ----------------------------------------------------------------------------------------------

    private PathRow readable(UUID pathId) {
        PathRow path = paths.byId(pathId);
        if (path == null) throw HttpError.notFound("Parcours introuvable.");
        return path;
    }

    static StepRow activeStep(List<StepRow> steps) {
        return steps.stream().filter(step -> "active".equals(step.status())).findFirst().orElse(null);
    }

    static StepRow nextStep(List<StepRow> steps, StepRow step) {
        return steps.stream().filter(other -> "planned".equals(other.status()) && other.rank() > step.rank())
                .findFirst().orElse(null);
    }

    /** Version publiée d'un niveau. */
    record Track(UUID versionId, int number, String levelTitle) {}

    Catalogue catalogue(UUID callerId) {
        return new Catalogue(callerId);
    }

    /** Lectures du catalogue mises en cache pour la durée d'un appel. */
    final class Catalogue {
        private final UUID callerId;
        final Map<UUID, JsonNode> tracks = new HashMap<>();
        private final Map<String, Map<String, Track>> published = new HashMap<>();

        private Catalogue(UUID callerId) {
            this.callerId = callerId;
        }

        JsonNode track(UUID versionId) {
            return tracks.computeIfAbsent(versionId, id ->
                    services.request(catalogueUrl, "/v1/internal/tracks/" + id, "GET", callerId, null));
        }

        /** Versions publiées de la langue, par niveau (le pilote en allemand : une version sans langue vaut « de »). */
        Map<String, Track> published(String languageId) {
            return published.computeIfAbsent(languageId, language -> {
                Map<String, Track> levels = new LinkedHashMap<>();
                for (JsonNode track : services.request(catalogueUrl, "/v1/tracks", "GET", callerId, null)) {
                    String trackLanguage = track.hasNonNull("languageId") ? track.path("languageId").asText() : "de";
                    if (!language.equals(trackLanguage)) continue;
                    levels.put(track.path("levelCode").asText(), new Track(UUID.fromString(track.path("versionId").asText()),
                            track.path("number").asInt(), track.path("levelTitle").asText()));
                }
                return levels;
            });
        }
    }

    /** Langue du catalogue (statut, test de niveau disponible), ou null si le catalogue ne la décrit pas. */
    private JsonNode language(UUID callerId, String languageId) {
        return languages(callerId).get(languageId);
    }

    /** Langues du catalogue par identifiant ; vide si le catalogue ne répond pas (l'accueil n'est alors pas bloqué). */
    Map<String, JsonNode> languages(UUID callerId) {
        Map<String, JsonNode> languages = new HashMap<>();
        try {
            for (JsonNode language : services.request(catalogueUrl, "/v1/languages", "GET", callerId, null)) {
                languages.put(language.path("id").asText(), language);
            }
        } catch (WebApplicationException unavailable) {
            LOG.warn("Catalogue languages unavailable for onboarding");
        }
        return languages;
    }

    private String teacherName(UUID callerId) {
        try {
            JsonNode card = services.request(identityUrl, "/v1/me/teacher", "GET", callerId, null);
            return card == null || card.isNull() ? "" : card.path("displayName").asText("");
        } catch (WebApplicationException unavailable) {
            return "";
        }
    }

    /** Tentatives de test de niveau de l'élève (résumés, sans questions), demandées à Évaluations. */
    private JsonNode placements(UUID callerId, UUID learnerId) {
        String path = "/v1/assessments/placements" + (callerId.equals(learnerId) ? "" : "?learnerId=" + learnerId);
        return services.request(assessmentUrl, path, "GET", callerId, null);
    }

    private JsonNode placement(UUID callerId, UUID learnerId, UUID attemptId) {
        for (JsonNode attempt : placements(callerId, learnerId)) {
            if (attemptId.toString().equals(attempt.path("id").asText())) return attempt;
        }
        throw HttpError.notFound("Test de niveau introuvable.");
    }

    /** Dernière tentative (en cours ou terminée) de la langue, ou null (aussi si Évaluations ne répond pas). */
    JsonNode latestPlacement(UUID callerId, UUID learnerId, String languageId) {
        try {
            JsonNode latest = null;
            for (JsonNode attempt : placements(callerId, learnerId)) {
                if ("abandoned".equals(attempt.path("status").asText())) continue;
                if (languageId != null && !languageId.equals(attempt.path("languageId").asText(languageId))) continue;
                if (latest == null || attempt.path("startedAt").asText().compareTo(latest.path("startedAt").asText()) > 0) {
                    latest = attempt;
                }
            }
            return latest;
        } catch (WebApplicationException unavailable) {
            LOG.warn("Placement attempts unavailable");
            return null;
        }
    }

    /** Niveau de départ par défaut : le dernier résultat du test de niveau, sinon débutant. */
    private String placedLevel(UUID callerId, UUID learnerId, String languageId) {
        JsonNode latest = latestPlacement(callerId, learnerId, languageId);
        String level = latest == null || !"completed".equals(latest.path("status").asText()) ? null
                : text(latest.path("placedLevel"));
        return level == null ? "A0" : level;
    }

    static LocalDate today() {
        return LocalDate.now(CourseRules.PILOT_ZONE);
    }

    private static LocalDate later(LocalDate first, LocalDate second) {
        return first.isAfter(second) ? first : second;
    }

    static LocalDate date(String value) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException | NullPointerException error) {
            throw HttpError.badRequest("Utilisez des dates au format AAAA-MM-JJ.");
        }
    }

    private static UUID parseId(String value, String notFound) {
        try {
            UUID id = UUID.fromString(value);
            if (id.toString().equalsIgnoreCase(value)) return id;
        } catch (IllegalArgumentException | NullPointerException ignored) {
            // Même réponse pour toutes les formes invalides.
        }
        throw HttpError.badRequest(notFound);
    }

    private static String text(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode() || node.asText().isEmpty() ? null : node.asText();
    }

    // --- Formes JSON (linguacap-react/src/integration/v2.ts) ---------------------------------------------------

    public record EstimateRequest(String learnerId, String pathId, String startLevel, String targetLevel, String startDate,
                                  String targetDate) {}

    public record EstimateLevel(String levelCode, String trackVersionId, int plannedMinutes) {}

    public record DailyMinutes(int fiveDays, int sevenDays) {}

    public record Estimate(String languageId, String startLevel, String targetLevel, String startDate, String targetDate,
                           double weeks, int requiredMinutes, List<EstimateLevel> levels, int requiredWeeklyMinutes,
                           DailyMinutes requiredDailyMinutes, PathRules.Difficulty difficulty,
                           List<PathRules.BandView> bands, List<String> allowedTargets, String minTargetDate,
                           String maxTargetDate, List<Day> suggestedAvailability) {}

    public record OnboardingStep(String id, String status) {}

    public record OnboardingTeacher(String id, String displayName) {}

    public record OnboardingPlacement(String attemptId, String status, String placedLevel, String completedAt) {}

    public record OnboardingPath(String id, String status, int validatedRevision) {}

    public record OnboardingState(boolean accompanied, String languageId, boolean languageLocked, OnboardingTeacher teacher,
                                  OnboardingPlacement placement, OnboardingPath path, List<OnboardingStep> steps,
                                  boolean completed, String blockedReason) {}

    public record PathCreateRequest(String placementAttemptId, String targetLevel, String startDate, String targetDate,
                                    String startLevel) {}

    public record ObjectiveRequest(String targetLevel, String startDate, String targetDate, String startLevel) {}

    public record AvailabilityRequest(List<Day> days, String targetDate) {}

    public record AdditionRequest(String stepLevel, String trackVersionId, String moduleId, String activityId,
                                  String placement, String note) {}

    record PlanJson(List<PathPlanner.PlannedSession> sessions, List<Planner.Item> overflow, List<Planner.Week> weeks,
                    List<PathPlanner.Suggestion> suggestions, List<PathPlanner.Span> levels) {}

    /** Sur-ensemble de l'ancienne proposition (GoalResource.ProposalView), mêmes noms de champs. */
    public record PathProposal(int number, int baseRevision, String status, String startDate, String targetDate,
                               JsonNode availability, int capacityMinutes, int requiredMinutes, int overflowCount,
                               String createdAt, JsonNode sessions, JsonNode overflow, JsonNode weeks,
                               JsonNode suggestions, boolean validatable, UUID pathId, PathRules.Difficulty difficulty,
                               PathRules.Feasibility feasibility, JsonNode levels, String blockingReason) {}

    public record PathStepView(UUID id, int position, String levelCode, String levelTitle, UUID trackVersionId,
                               int trackVersionNumber, String status, UUID enrollmentId, String goalStatus,
                               int plannedMinutes, String firstDate, String lastDate, int sessionsTotal,
                               int sessionsCompleted, String finalDecision) {}

    public record ProposalBrief(int number, String status, int overflowCount, boolean validatable, String createdAt) {}

    public record ContractBlock(ContractResource.Contract current, ContractResource.Contract pending, boolean engaged) {}

    public record PathView(UUID id, UUID learnerId, String languageId, String status, boolean accompanied, String origin,
                           String startLevel, String targetLevel, String startDate, String targetDate,
                           String initialTargetDate, int weeklyMinutes, int requiredMinutes,
                           PathRules.Difficulty difficulty, UUID placementAttemptId, boolean paused, String pausedAt,
                           String resumeDate, int validatedRevision, List<PathStepView> steps, List<Day> availability,
                           ProposalBrief proposal, List<PathPlanner.PathSession> sessions, ContractBlock contract,
                           PathRules.Permissions permissions) {}

    public record AdditionView(UUID id, UUID pathId, String stepLevel, UUID sourceTrackVersionId, String sourceLevelCode,
                               String moduleId, String activityId, String title, int minutes, String placement,
                               String note, UUID addedBy, String addedAt, String removedAt, String status) {}

    public record AdditionCreated(AdditionView addition, PathProposal proposal) {}

    public record AdditionRemoved(PathProposal proposal) {}
}
