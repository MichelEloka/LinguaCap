package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.ServiceClient;

/** Séances et progression (DEV-028 à DEV-031, DEV-043). */
@Path("/v1/learning")
@Produces(MediaType.APPLICATION_JSON)
public class CourseResource {
    private static final Logger LOG = Logger.getLogger(CourseResource.class);
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
    @ConfigProperty(name = "lingua.services.media")
    String mediaUrl;

    /** Séance avec le contenu de ses activités, livré après vérification de l'inscription. */
    @GET
    @Path("/sessions/{id}")
    public SessionDetail session(@PathParam("id") UUID sessionId) {
        UUID callerId = actor.id();
        CourseStore.SessionRow session = readable(callerId, sessionId);
        boolean staff = !callerId.equals(session.learnerId());
        Map<String, CourseStore.ProgressRow> progress = store.progress(session.enrollmentId());

        List<ActivityDetail> activities = new ArrayList<>();
        for (ActivitySummary summary : session.summary().activities()) {
            CourseStore.ProgressRow row = progress.get(summary.id());
            boolean completed = row != null && row.completedAt() != null;
            JsonNode state = row == null ? mapper.createObjectNode() : row.state();
            String attemptId = row == null || row.attemptId() == null ? null : row.attemptId().toString();
            if (isPlanned(summary)) {
                activities.add(new ActivityDetail(summary.id(), summary.position(), summary.kind(), summary.title(),
                        summary.estimatedMinutes(), List.of(), summary.status(), state, summary.completedAt(), attemptId,
                        new LessonView(null, summary.title(), plannedDescription(summary)), null,
                        mapper.createArrayNode(), List.of()));
                continue;
            }
            JsonNode content = services.request(catalogueUrl, "/v1/internal/tracks/" + session.trackVersionId()
                    + "/activities/" + summary.id(), "GET", callerId, null);
            List<PlacementView> placements = new ArrayList<>();
            boolean transcriptAllowed = false;
            for (JsonNode placement : content.path("placements")) {
                boolean available = CourseRules.transcriptAvailable(
                        placement.path("transcriptVisibility").asText(), completed, staff);
                transcriptAllowed |= available && "audio".equals(placement.path("usage").asText());
                placements.add(new PlacementView(placement.path("position").asInt(), placement.path("assetId").asText(),
                        placement.path("assetVersion").asInt(), placement.path("usage").asText(),
                        nullable(placement.path("alt")), nullable(placement.path("caption")), available,
                        placement.path("decorative").asBoolean(false), nullable(placement.path("questionId")),
                        nullable(placement.path("optionId")), null, null));
            }
            JsonNode lesson = content.path("lesson");
            activities.add(new ActivityDetail(summary.id(), summary.position(), summary.kind(), summary.title(),
                    summary.estimatedMinutes(), mapper.convertValue(content.path("activity").path("competences"), List.class),
                    summary.status(), state, summary.completedAt(), attemptId,
                    lesson.isObject() ? new LessonView(lesson.path("id").asText(), lesson.path("title").asText(),
                            lesson.path("description").asText()) : null,
                    transcriptAllowed && lesson.isObject() ? nullable(lesson.path("transcript")) : null,
                    content.path("questions"), placements));
        }
        return new SessionDetail(session.summary(), session.enrollmentId(), session.trackVersionId(), session.levelCode(),
                withFiles(callerId, activities));
    }

    /**
     * Adresses temporaires des supports, demandées à Médias avec le jeton de l'utilisateur après la vérification de
     * l'accès à la séance. Chaque ouverture ou reprise renouvelle les adresses. Si Médias est indisponible, la séance
     * reste lisible et chaque support propose de réessayer.
     */
    private List<ActivityDetail> withFiles(UUID callerId, List<ActivityDetail> activities) {
        Map<String, Map<String, Object>> wanted = new LinkedHashMap<>();
        for (ActivityDetail activity : activities) {
            for (PlacementView placement : activity.placements()) {
                wanted.put(placement.assetId() + "@" + placement.assetVersion(),
                        Map.of("assetId", placement.assetId(), "version", placement.assetVersion()));
            }
        }
        String token = actor.token();
        if (wanted.isEmpty() || token.isEmpty()) return activities;
        Map<String, JsonNode> files = new HashMap<>();
        try {
            var result = services.exchange(mediaUrl, "/v1/internal/media/read-grants", "POST", callerId,
                    Map.of("items", List.copyOf(wanted.values())), token, "", false, actor.requestId());
            if (result.status() != 200 || !result.body().isArray()) {
                LOG.warnf("Media read grants returned HTTP %d", result.status());
                return activities;
            }
            for (JsonNode file : result.body()) {
                files.put(file.path("assetId").asText() + "@" + file.path("version").asInt(), file);
            }
        } catch (WebApplicationException error) {
            LOG.warn("Media read grants unavailable");
            return activities;
        }
        return activities.stream().map(activity -> activity.withPlacements(activity.placements().stream()
                .map(placement -> placement.withFile(files.get(placement.assetId() + "@" + placement.assetVersion())))
                .toList())).toList();
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
        if ("paused".equals(session.goalStatus())) {
            throw HttpError.conflict("Votre parcours est en pause : il reprendra à la date convenue.");
        }
        if (session.superseded()) {
            throw HttpError.conflict("Cette séance a été replanifiée : retrouvez ses activités dans votre nouveau calendrier.");
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
            if (isPlanned(activity)) {
                throw HttpError.conflict("Ce créneau d’évaluation s’ouvrira avec le bilan ou l’examen blanc.");
            }
            attemptId = verifiedAttempt(learnerId, sessionId, activityId, request.attemptId());
        }
        return store.record(sessionId, session.enrollmentId(), activityId, learnerId, request.state(), complete, attemptId);
    }

    /** Révisions et créneaux d'évaluation réservés par le planning : ils n'ont pas de contenu dans le catalogue. */
    private static boolean isPlanned(ActivitySummary activity) {
        return activity.id().startsWith("revision-") || Planner.MIDTERM.equals(activity.id())
                || Planner.FINAL.equals(activity.id());
    }

    private static String plannedDescription(ActivitySummary activity) {
        if ("review".equals(activity.kind())) {
            return "Relisez les leçons du module, réécoutez ses enregistrements et refaites ses exercices, "
                    + "puis indiquez que la révision est terminée.";
        }
        return Planner.MIDTERM.equals(activity.id())
                ? "Bilan intermédiaire : il vérifie vos acquis sur les modules déjà travaillés, compétence par compétence."
                : "Examen blanc : lecture, écoute, écrit et oral, corrigés avec la grille publiée avec votre parcours.";
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

    public record ProgressRequest(JsonNode state, Boolean completed, String attemptId) {}

    public record ActivitySummary(String id, int position, String kind, String title, int estimatedMinutes,
                                  String status, String completedAt) {}

    public record SessionSummary(UUID id, int position, String moduleId, String title, String dueAt, String status,
                                 String startedAt, String completedAt, int estimatedMinutes, int slot,
                                 List<ActivitySummary> activities) {}

    public record EnrollmentSessions(List<SessionSummary> current, int superseded) {}

    public record LessonView(String id, String title, String description) {}

    /** Support d'une activité, d'une question (questionId) ou d'un choix (optionId), avec son adresse temporaire. */
    public record PlacementView(int position, String assetId, int assetVersion, String usage, String alt,
                                String caption, boolean transcriptAvailable, boolean decorative, String questionId,
                                String optionId, String url, String mimeType) {
        PlacementView withFile(JsonNode file) {
            if (file == null) return this;
            return new PlacementView(position, assetId, assetVersion, usage, alt, caption, transcriptAvailable,
                    decorative, questionId, optionId, file.path("url").asText(null), file.path("mimeType").asText(null));
        }
    }

    public record ActivityDetail(String id, int position, String kind, String title, int estimatedMinutes,
                                 List<?> competences, String status, JsonNode state, String completedAt,
                                 String attemptId, LessonView lesson, String transcript, JsonNode questions,
                                 List<PlacementView> placements) {
        ActivityDetail withPlacements(List<PlacementView> files) {
            return new ActivityDetail(id, position, kind, title, estimatedMinutes, competences, status, state,
                    completedAt, attemptId, lesson, transcript, questions, files);
        }
    }

    public record SessionDetail(SessionSummary session, UUID enrollmentId, UUID trackVersionId, String levelCode,
                                List<ActivityDetail> activities) {}
}
