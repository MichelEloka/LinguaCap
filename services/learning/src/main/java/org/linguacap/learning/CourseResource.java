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
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.ServiceClient;

/** Parcours attribués, séances et progression (DEV-028 à DEV-031). */
@Path("/v1/learning")
@Produces(MediaType.APPLICATION_JSON)
public class CourseResource {
    private static final String ACTIVITY_ID = "[a-z0-9]+(-[a-z0-9]+)*";

    @Inject Actor actor;
    @Inject LearnerAccess access;
    @Inject ServiceClient services;
    @Inject CourseStore store;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "lingua.services.catalogue")
    String catalogueUrl;
    @ConfigProperty(name = "lingua.services.assessment")
    String assessmentUrl;

    /** Parcours de l'élève et ses séances, ou null si aucun parcours n'a été attribué. */
    @GET
    @Path("/enrollment")
    public JsonNode enrollment(@QueryParam("learnerId") String requestedLearnerId) {
        UUID learnerId = access.resolve(actor.id(), requestedLearnerId);
        EnrollmentView enrollment = store.enrollment(learnerId);
        return enrollment == null ? NullNode.getInstance() : mapper.valueToTree(enrollment);
    }

    /** Attribue une version publiée du parcours et planifie la première séance avec son échéance. */
    @POST
    @Path("/enrollments")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response enroll(EnrollmentRequest request) {
        UUID callerId = actor.id();
        if (request == null || request.trackVersionId() == null) {
            throw HttpError.badRequest("Choisissez l’élève, le parcours et l’échéance de la première séance.");
        }
        UUID learnerId = LearnerAccess.parse(request.learnerId());
        access.requireEducatorOf(callerId, learnerId);
        var dueAt = CourseRules.firstDue(request.firstSessionDue(), LocalDate.now(CourseRules.PILOT_ZONE));

        JsonNode track = services.request(catalogueUrl, "/v1/internal/tracks/" + request.trackVersionId(),
                "GET", callerId, null);
        if (!"published".equals(track.path("status").asText())) {
            throw HttpError.conflict("Cette version du parcours n’est plus proposée aux nouvelles inscriptions.");
        }
        JsonNode module = track.path("modules").path(0);
        if (!module.isObject() || module.path("activities").isEmpty()) {
            throw HttpError.conflict("Ce parcours ne contient encore aucune activité.");
        }
        List<CourseStore.PlannedActivity> activities = new ArrayList<>();
        for (JsonNode activity : module.path("activities")) {
            activities.add(new CourseStore.PlannedActivity(activity.path("id").asText(),
                    activity.path("position").asInt(), activity.path("kind").asText(),
                    activity.path("title").asText(), activity.path("estimatedMinutes").asInt()));
        }
        store.enroll(learnerId, track.path("levelCode").asText(), request.trackVersionId(),
                track.path("number").asInt(), callerId, module.path("id").asText(), module.path("title").asText(),
                activities, dueAt);
        return Response.status(Response.Status.CREATED).entity(store.enrollment(learnerId)).build();
    }

    /** Séance avec le contenu de ses activités, livré après vérification de l'inscription. */
    @GET
    @Path("/sessions/{id}")
    public SessionDetail session(@PathParam("id") UUID sessionId) {
        UUID callerId = actor.id();
        CourseStore.SessionRow session = readable(callerId, sessionId);
        boolean staff = !callerId.equals(session.learnerId());
        Map<String, CourseStore.ProgressRow> progress = store.progress(sessionId);

        List<ActivityDetail> activities = new ArrayList<>();
        for (ActivitySummary summary : session.summary().activities()) {
            JsonNode content = services.request(catalogueUrl, "/v1/internal/tracks/" + session.trackVersionId()
                    + "/activities/" + summary.id(), "GET", callerId, null);
            CourseStore.ProgressRow row = progress.get(summary.id());
            boolean completed = row != null && row.completedAt() != null;

            List<PlacementView> placements = new ArrayList<>();
            boolean transcriptAllowed = false;
            for (JsonNode placement : content.path("placements")) {
                boolean available = CourseRules.transcriptAvailable(
                        placement.path("transcriptVisibility").asText(), completed, staff);
                transcriptAllowed |= available && "audio".equals(placement.path("usage").asText());
                placements.add(new PlacementView(placement.path("position").asInt(), placement.path("assetId").asText(),
                        placement.path("assetVersion").asInt(), placement.path("usage").asText(),
                        nullable(placement.path("alt")), nullable(placement.path("caption")), available));
            }
            JsonNode lesson = content.path("lesson");
            activities.add(new ActivityDetail(summary.id(), summary.position(), summary.kind(), summary.title(),
                    summary.estimatedMinutes(), mapper.convertValue(content.path("activity").path("competences"), List.class),
                    summary.status(), row == null ? mapper.createObjectNode() : row.state(), summary.completedAt(),
                    row == null || row.attemptId() == null ? null : row.attemptId().toString(),
                    lesson.isObject() ? new LessonView(lesson.path("id").asText(), lesson.path("title").asText(),
                            lesson.path("description").asText()) : null,
                    transcriptAllowed && lesson.isObject() ? nullable(lesson.path("transcript")) : null,
                    content.path("questions"), placements));
        }
        return new SessionDetail(session.summary(), session.trackVersionId(), session.levelCode(), activities);
    }

    /**
     * Sauvegarde l'état d'une activité (reprise après fermeture) et, si demandé, sa fin horodatée.
     * Une activité notée se termine avec la tentative qui la corrige. Rejouer la requête ne compte rien deux fois.
     */
    @PUT
    @Path("/sessions/{id}/activities/{activityId}/progress")
    @Consumes(MediaType.APPLICATION_JSON)
    public SessionSummary progress(@PathParam("id") UUID sessionId, @PathParam("activityId") String activityId,
                                   ProgressRequest request) {
        UUID learnerId = actor.id();
        if (request == null || !activityId.matches(ACTIVITY_ID) || activityId.length() > 80) {
            throw HttpError.badRequest("Progression invalide.");
        }
        CourseStore.SessionRow session = store.session(sessionId);
        if (session == null || !learnerId.equals(session.learnerId())) {
            throw HttpError.notFound("Séance introuvable.");
        }
        if (!"active".equals(session.enrollmentStatus())) {
            throw HttpError.conflict("Ce parcours n’est plus actif.");
        }
        ActivitySummary activity = session.summary().activities().stream()
                .filter(item -> item.id().equals(activityId)).findFirst()
                .orElseThrow(() -> HttpError.notFound("Activité introuvable dans cette séance."));
        if (request.state() != null && (!request.state().isObject()
                || request.state().toString().getBytes(StandardCharsets.UTF_8).length > CourseRules.MAX_STATE_BYTES)) {
            throw HttpError.badRequest("L’état sauvegardé doit être un objet JSON de 8 Ko au plus.");
        }
        boolean complete = Boolean.TRUE.equals(request.completed());
        UUID attemptId = null;
        if (complete && !"completed".equals(activity.status()) && CourseRules.requiresAttempt(activity.kind())) {
            attemptId = verifiedAttempt(learnerId, sessionId, activityId, request.attemptId());
        }
        return store.record(sessionId, activityId, learnerId, request.state(), complete, attemptId);
    }

    /** La tentative doit appartenir à l'élève et avoir été remise pour cette séance et cette activité. */
    private UUID verifiedAttempt(UUID learnerId, UUID sessionId, String activityId, String attemptId) {
        if (attemptId == null) {
            throw HttpError.badRequest("Remettez l’exercice avant de le terminer.");
        }
        JsonNode results = services.request(assessmentUrl, "/v1/assessments/results", "GET", learnerId, null);
        for (JsonNode grade : results) {
            if (attemptId.equals(grade.path("id").asText())
                    && sessionId.toString().equals(grade.path("sessionId").asText())
                    && activityId.equals(grade.path("activityId").asText())) {
                return UUID.fromString(attemptId);
            }
        }
        throw HttpError.conflict("Cette remise ne correspond pas à l’exercice de la séance.");
    }

    private CourseStore.SessionRow readable(UUID callerId, UUID sessionId) {
        CourseStore.SessionRow session = store.session(sessionId);
        if (session == null) throw HttpError.notFound("Séance introuvable.");
        if (!callerId.equals(session.learnerId())) {
            access.resolve(callerId, session.learnerId().toString());
        }
        return session;
    }

    private static String nullable(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode() ? null : node.asText();
    }

    public record EnrollmentRequest(String learnerId, UUID trackVersionId, String firstSessionDue) {}

    public record ProgressRequest(JsonNode state, Boolean completed, String attemptId) {}

    public record ActivitySummary(String id, int position, String kind, String title, int estimatedMinutes,
                                  String status, String completedAt) {}

    public record SessionSummary(UUID id, int position, String moduleId, String title, String dueAt, String status,
                                 String startedAt, String completedAt, int estimatedMinutes,
                                 List<ActivitySummary> activities) {}

    public record EnrollmentView(UUID id, UUID learnerId, String levelCode, UUID trackVersionId, int trackVersionNumber,
                                 UUID assignedBy, String assignedAt, String status, List<SessionSummary> sessions) {}

    public record LessonView(String id, String title, String description) {}

    public record PlacementView(int position, String assetId, int assetVersion, String usage, String alt,
                                String caption, boolean transcriptAvailable) {}

    public record ActivityDetail(String id, int position, String kind, String title, int estimatedMinutes,
                                 List<?> competences, String status, JsonNode state, String completedAt,
                                 String attemptId, LessonView lesson, String transcript, JsonNode questions,
                                 List<PlacementView> placements) {}

    public record SessionDetail(SessionSummary session, UUID trackVersionId, String levelCode,
                                List<ActivityDetail> activities) {}
}
