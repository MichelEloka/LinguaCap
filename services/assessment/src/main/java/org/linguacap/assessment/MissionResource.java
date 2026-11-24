package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.assessment.SpeechResource.Recording;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

/**
 * Missions (EVO-044) : l'élève ouvre la mission d'une activité, rédige son texte, enregistre sa production orale,
 * coche sa liste d'auto-vérification puis remet. La remise part chez le professeur référent, sinon chez le
 * correcteur désigné, sinon elle est simplement envoyée. Le correcteur valide ou demande de reprendre ; l'élève
 * reprend alors une nouvelle remise numérotée. Apprentissage vérifie la remise par GET /missions/{id}.
 */
@Path("/v1/assessments/missions")
@Produces(MediaType.APPLICATION_JSON)
public class MissionResource {
    private static final Logger LOG = Logger.getLogger(MissionResource.class);
    private static final Pattern REQUEST_KEY = Pattern.compile("[A-Za-z0-9_-]{8,128}");
    private static final Pattern LEVEL = Pattern.compile("[ABC][12]");
    private static final String PART = "mission";

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject MissionStore store;
    @Inject ExerciseKeys keys;

    @ConfigProperty(name = "lingua.services.catalogue") String catalogueUrl;
    @ConfigProperty(name = "lingua.services.media") String mediaUrl;
    @ConfigProperty(name = "lingua.services.identity") String identityUrl;

    /**
     * Ouvre la mission : 201 et un nouveau brouillon, ou 200 et la dernière remise de ce contexte (séance ou
     * bibliothèque) ou le brouillon en cours. restart (après « à reprendre » ou un envoi) ouvre la remise suivante.
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response open(OpenRequest request) {
        UUID learnerId = actor.id();
        if (!"learner".equals(identities.current(learnerId).path("role").asText())) {
            throw HttpError.forbidden("Seul un élève remet une mission.");
        }
        if (request == null || request.trackVersionId() == null || request.activityId() == null
                || request.activityId().length() > 80 || !SpeechResource.SLUG.matcher(request.activityId()).matches()) {
            throw HttpError.badRequest("Indiquez la version et l’activité de la mission.");
        }
        if ((request.sessionId() == null) != (request.sessionActivityId() == null)
                || request.sessionActivityId() != null && (request.sessionActivityId().length() > 80
                || !SpeechResource.SLUG.matcher(request.sessionActivityId()).matches())) {
            throw HttpError.badRequest("La séance et l’activité de séance vont ensemble.");
        }
        JsonNode content = activity(learnerId, request.trackVersionId(), request.activityId());
        var definition = MissionRules.definition(content);
        String levelCode = content.path("levelCode").asText("");
        if (!LEVEL.matcher(levelCode).matches()) {
            String fallback = keys.levelCode(request.trackVersionId().toString(), learnerId);
            levelCode = fallback == null ? "" : fallback;
        }
        if (!LEVEL.matcher(levelCode).matches()) throw HttpError.unavailable("Cette mission est temporairement indisponible.");
        String moduleId = content.path("moduleId").asText(request.activityId());
        String lessonId = content.path("activity").path("lessonId").asText("");
        MissionStore.Opened opened = store.open(learnerId, request.trackVersionId(), request.activityId(),
                request.sessionId(), request.sessionActivityId(), Boolean.TRUE.equals(request.restart()),
                new MissionStore.Draft(levelCode, moduleId, lessonId.isBlank() ? request.activityId() : lessonId, definition));
        return Response.status(opened.created() ? Response.Status.CREATED : Response.Status.OK)
                .entity(view(opened.mission(), learnerId, false, true)).build();
    }

    /** Missions de l'élève, ou d'un élève suivi (professeur référent, administration) avec learnerId. */
    @GET
    public List<MissionSummary> missions(@QueryParam("learnerId") String requestedLearnerId) {
        UUID learnerId = authorizeLearner(actor.id(), requestedLearnerId);
        return store.forLearner(learnerId).stream().map(MissionResource::summary).toList();
    }

    /** Remise lue par son élève (et par Apprentissage pour son compte) ou par un correcteur habilité. */
    @GET
    @Path("/{missionId}")
    public MissionView mission(@PathParam("missionId") UUID missionId) {
        UUID callerId = actor.id();
        MissionStore.Mission mission = store.find(missionId);
        if (callerId.equals(mission.learnerId())) return view(mission, callerId, false, true);
        if (!ReviewQueueResource.canGrade(services, identityUrl, callerId, mission.learnerId())) {
            throw HttpError.forbidden("Seuls l’élève, son professeur référent et son correcteur désigné consultent cette mission.");
        }
        return view(mission, callerId, MissionRules.SUBMITTED.equals(mission.status()), true);
    }

    /** Brouillon : texte (3 000 caractères au plus, et la limite de la mission) et points cochés de la liste. */
    @PUT
    @Path("/{missionId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public MissionView save(@PathParam("missionId") UUID missionId, SaveRequest request) {
        UUID learnerId = actor.id();
        MissionStore.Mission mission = owned(learnerId, missionId);
        if (request == null) throw HttpError.badRequest("Texte ou liste de vérification requis.");
        String text = MissionRules.checkText(mission.definition(), request.text());
        List<Integer> checklist = MissionRules.checkChecklist(mission.definition(), request.checklist());
        return view(store.save(missionId, learnerId, text, checklist), learnerId, false, true);
    }

    /** Réserve le dépôt de la production orale dans l'espace privé des productions (Médias). */
    @POST
    @Path("/{missionId}/recordings")
    @Consumes(MediaType.APPLICATION_JSON)
    public JsonNode reserveRecording(@PathParam("missionId") UUID missionId, RecordingRequest request) {
        UUID learnerId = actor.id();
        MissionStore.Mission mission = owned(learnerId, missionId);
        if (!MissionRules.DRAFT.equals(mission.status())) throw HttpError.conflict("Cette mission est déjà remise.");
        if (!mission.definition().path("oral").isObject()) {
            throw HttpError.badRequest("Cette mission n’attend pas d’enregistrement.");
        }
        if (request == null) throw HttpError.badRequest("Enregistrement requis.");
        Map<String, Object> body = new HashMap<>();
        body.put("attemptId", missionId);
        body.put("partId", PART);
        body.put("mimeType", String.valueOf(request.mimeType()));
        body.put("size", request.size());
        return SpeechResource.forward(services, actor, mediaUrl, "/v1/internal/media/productions", learnerId, body);
    }

    /** Contrôle l'enregistrement reçu puis le rattache au brouillon. */
    @POST
    @Path("/{missionId}/recordings/{productionId}/finalize")
    @Consumes(MediaType.APPLICATION_JSON)
    public MissionView finalizeRecording(@PathParam("missionId") UUID missionId, @PathParam("productionId") UUID productionId) {
        UUID learnerId = actor.id();
        MissionStore.Mission mission = owned(learnerId, missionId);
        if (!MissionRules.DRAFT.equals(mission.status())) {
            if (productionId.equals(mission.recordingId())) return view(mission, learnerId, false, true);
            throw HttpError.conflict("Cette mission est déjà remise.");
        }
        JsonNode production = SpeechResource.forward(services, actor, mediaUrl,
                "/v1/internal/media/productions/" + productionId + "/finalize", learnerId, Map.of());
        if (!missionId.toString().equals(production.path("attemptId").asText())
                || !"available".equals(production.path("status").asText())) {
            throw HttpError.conflict("Cet enregistrement ne correspond pas à cette mission.");
        }
        return view(store.attachRecording(missionId, learnerId, productionId, production.path("mimeType").asText(null)),
                learnerId, false, true);
    }

    /** Remise (Idempotency-Key) : liste entièrement cochée, texte et enregistrement prévus présents (409 sinon). */
    @POST
    @Path("/{missionId}/submit")
    @Consumes(MediaType.APPLICATION_JSON)
    public MissionView submit(@PathParam("missionId") UUID missionId, @HeaderParam("Idempotency-Key") String key) {
        UUID learnerId = actor.id();
        if (key == null || !REQUEST_KEY.matcher(key).matches()) throw HttpError.badRequest("Clé de remise invalide.");
        MissionStore.Mission mission = owned(learnerId, missionId);
        if (!MissionRules.DRAFT.equals(mission.status())) return view(mission, learnerId, false, true);
        String refusal = MissionRules.submitRefusal(mission.definition(), mission.text(), mission.checklist(),
                mission.recordingId());
        if (refusal != null) throw HttpError.conflict(refusal);
        JsonNode right = ReviewQueueResource.rights(services, identityUrl, learnerId, List.of(learnerId)).get(learnerId);
        MissionStore.Mission submitted = store.submit(missionId, learnerId, key, MissionRules.recipient(right));
        return view(submitted, learnerId, false, true);
    }

    /**
     * Retour du correcteur habilité (403 pour un professeur tiers) : « validée » ou « à reprendre ». Une mission à
     * grille exige les points de chaque critère (400 sinon) ; une mission sans grille les refuse. La décision reste
     * celle du correcteur, quel que soit le score.
     */
    @POST
    @Path("/{missionId}/review")
    @Consumes(MediaType.APPLICATION_JSON)
    public MissionView review(@PathParam("missionId") UUID missionId, ReviewRequest request) {
        UUID callerId = actor.id();
        MissionStore.Mission mission = store.find(missionId);
        if (!ReviewQueueResource.canGrade(services, identityUrl, callerId, mission.learnerId())) {
            throw HttpError.forbidden("Seuls le professeur référent, le correcteur désigné et l’administration donnent un retour sur cette mission.");
        }
        if (request == null) throw HttpError.badRequest("Indiquez « validée » ou « à reprendre ».");
        String comment = MissionRules.checkReview(request.decision(), request.comment());
        MissionRules.Grade grade = MissionRules.checkPoints(mission.definition(), request.points());
        return view(store.review(missionId, callerId, request.decision(), comment, grade), callerId, false, true);
    }

    private MissionStore.Mission owned(UUID learnerId, UUID missionId) {
        MissionStore.Mission mission = store.find(missionId);
        if (!learnerId.equals(mission.learnerId())) throw HttpError.notFound("Mission introuvable.");
        return mission;
    }

    /** Activité du catalogue (route interne) : 404 si elle n'existe pas dans cette version. */
    private JsonNode activity(UUID learnerId, UUID versionId, String activityId) {
        var result = services.exchange(catalogueUrl, "/v1/internal/tracks/" + versionId + "/activities/" + activityId,
                "GET", learnerId, null, "", "", false, actor.requestId());
        if (result.status() == 404) throw HttpError.notFound("Mission introuvable dans ce parcours.");
        if (result.status() != 200 || !result.body().isObject()) {
            LOG.warnf("Catalogue returned HTTP %d for a mission", result.status());
            throw HttpError.unavailable("Cette mission est temporairement indisponible.");
        }
        return result.body();
    }

    private UUID authorizeLearner(UUID callerId, String requestedLearnerId) {
        if (requestedLearnerId != null) {
            UUID id;
            try {
                id = UUID.fromString(requestedLearnerId);
            } catch (IllegalArgumentException error) {
                throw HttpError.badRequest("Identifiant élève invalide.");
            }
            if (!id.toString().equalsIgnoreCase(requestedLearnerId)) throw HttpError.badRequest("Identifiant élève invalide.");
            if (!callerId.equals(id)) {
                identities.learner(callerId, id);
                return id;
            }
        }
        if (!"learner".equals(identities.current(callerId).path("role").asText())) {
            throw HttpError.forbidden("Sélectionne un élève auquel ton compte a accès.");
        }
        return callerId;
    }

    private MissionView view(MissionStore.Mission mission, UUID callerId, boolean canReview, boolean withFile) {
        Recording recording = null;
        if (mission.recordingId() != null) {
            String url = null;
            String mimeType = mission.recordingMime();
            if (withFile) {
                JsonNode grant = SpeechResource.productionGrants(services, actor, mediaUrl, callerId,
                        List.of(mission.recordingId())).get(mission.recordingId());
                if (grant != null) {
                    url = grant.path("url").asText(null);
                    mimeType = grant.path("mimeType").asText(mimeType);
                }
            }
            recording = new Recording(mission.recordingId(), mimeType, url);
        }
        Review review = mission.reviewedAt() == null ? null
                : new Review(mission.decision(), mission.comment(), text(mission.reviewedAt()), mission.points(),
                        mission.score(), mission.maxScore());
        return new MissionView(mission.id(), mission.learnerId(), mission.trackVersionId(), mission.levelCode(),
                mission.moduleId(), mission.activityId(), mission.sessionId(), mission.sessionActivityId(),
                mission.number(), mission.definition().path("title").asText(""),
                MissionRules.visibleDefinition(mission.definition()), mission.status(), mission.text(),
                mission.checklist(), recording, mission.reviewerKind(), text(mission.submittedAt()), review, canReview,
                text(mission.createdAt()), text(mission.updatedAt()));
    }

    private static MissionSummary summary(MissionStore.Mission mission) {
        return new MissionSummary(mission.id(), mission.activityId(), mission.definition().path("title").asText(""),
                mission.levelCode(), mission.moduleId(), mission.status(), mission.decision(), text(mission.submittedAt()),
                text(mission.reviewedAt()), mission.sessionId(), mission.score(), mission.maxScore());
    }

    private static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }

    public record OpenRequest(UUID trackVersionId, String activityId, UUID sessionId, String sessionActivityId,
                              Boolean restart) {}

    public record SaveRequest(String text, List<Integer> checklist) {}

    public record RecordingRequest(String mimeType, long size) {}

    /** points : {idCritère: entier de 0 à maxPoints}, exigé pour une mission à grille et refusé sans grille. */
    public record ReviewRequest(String decision, String comment, JsonNode points) {}

    /** Retour du correcteur ; points, score et maxScore : notation sur grille, null pour une mission sans grille. */
    public record Review(String decision, String comment, String reviewedAt, JsonNode points, Integer score,
                         Integer maxScore) {}

    /**
     * definition : {description, oral|null, written|null, checklist, criteria} (criteria : [] sans grille) ;
     * canReview : l'appelant peut donner son retour.
     */
    public record MissionView(UUID id, UUID learnerId, UUID trackVersionId, String levelCode, String moduleId,
                              String activityId, UUID sessionId, String sessionActivityId, int number, String title,
                              JsonNode definition, String status, String text, List<Integer> checklist,
                              Recording recording, String reviewerKind, String submittedAt, Review review,
                              boolean canReview, String createdAt, String updatedAt) {}

    /** score et maxScore : retour sur grille, null sans grille ou avant le retour. */
    public record MissionSummary(UUID id, String activityId, String title, String levelCode, String moduleId,
                                 String status, String decision, String submittedAt, String reviewedAt, UUID sessionId,
                                 Integer score, Integer maxScore) {}
}
