package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
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
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

/**
 * Répétition orale (EVO-043). Le navigateur reconnaît la voix et n'envoie que le texte reconnu : le score est
 * recalculé ici (AnswerRules.speak) et les échecs sont comptés par élève, manche et question. Après trois échecs
 * l'élève peut passer à la suite (la question sera « à revoir »). Sans reconnaissance vocale, l'élève enregistre sa
 * voix (dépôt privé chez Médias) ; l'essai attend alors la validation du professeur.
 */
@Path("/v1/assessments/speech")
@Produces(MediaType.APPLICATION_JSON)
public class SpeechResource {
    private static final Logger LOG = Logger.getLogger(SpeechResource.class);
    static final Pattern SLUG = Pattern.compile("[a-z0-9]+(?:-[a-z0-9]+)*");
    private static final int MAX_TRANSCRIPTS = 5;

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject SpeechStore store;
    @Inject ExerciseKeys keys;

    @ConfigProperty(name = "lingua.services.media") String mediaUrl;
    @ConfigProperty(name = "lingua.services.identity") String identityUrl;

    /** Essai reconnu : jusqu'à cinq transcriptions du navigateur, rescorées ; le meilleur score est retenu. */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public SpeechAttemptView attempt(SpeechRequest request) {
        UUID learnerId = learner();
        if (request == null) throw HttpError.badRequest("Essai de répétition requis.");
        SpeechStore.Context context = context(learnerId, request.lessonId(), request.questionId(), request.roundId(),
                request.sessionId(), request.activityId());
        List<String> transcripts = request.transcripts();
        if (transcripts == null || transcripts.isEmpty() || transcripts.size() > MAX_TRANSCRIPTS
                || transcripts.stream().anyMatch(text -> text == null || text.length() > AnswerRules.MAX_TRANSCRIPT)) {
            throw HttpError.badRequest("Un essai porte de une à cinq transcriptions de 300 caractères au plus.");
        }
        JsonNode question = speakQuestion(context, learnerId);
        AnswerRules.SpeakCheck check = AnswerRules.speak(transcripts, AnswerRules.speakAccepts(question));
        int threshold = AnswerRules.threshold(question);
        SpeechStore.Speech speech = store.recognize(context, check.transcript(), check.score(), threshold,
                check.score() >= threshold);
        return view(speech, learnerId, AnswerRules.speakText(question), false);
    }

    /** Repli sans reconnaissance vocale : réserve le dépôt de l'enregistrement chez Médias. */
    @POST
    @Path("/recordings")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response reserveRecording(SpeechRecordingRequest request) {
        UUID learnerId = learner();
        if (request == null) throw HttpError.badRequest("Enregistrement requis.");
        SpeechStore.Context context = context(learnerId, request.lessonId(), request.questionId(), request.roundId(),
                request.sessionId(), request.activityId());
        JsonNode question = speakQuestion(context, learnerId);
        store.checkOpen(context, true);
        UUID id = UUID.randomUUID();
        Map<String, Object> body = new HashMap<>();
        body.put("attemptId", id);
        body.put("partId", context.questionId());
        body.put("mimeType", String.valueOf(request.mimeType()));
        body.put("size", request.size());
        JsonNode production = forward(services, actor, mediaUrl, "/v1/internal/media/productions", learnerId, body);
        UUID productionId = UUID.fromString(production.path("id").asText());
        SpeechStore.Speech speech = store.reserveRecording(id, context, AnswerRules.threshold(question), productionId,
                production.path("mimeType").asText(request.mimeType()));
        Upload upload = new Upload(productionId, production.path("uploadUrl").asText(null),
                production.path("maxBytes").asLong());
        return Response.status(Response.Status.CREATED)
                .entity(new RecordingReservation(view(speech, learnerId, AnswerRules.speakText(question), false), upload))
                .build();
    }

    /** Enregistrement reçu : Médias le contrôle, puis l'essai attend la validation du professeur (pending). */
    @POST
    @Path("/{speechId}/recordings/{productionId}/finalize")
    @Consumes(MediaType.APPLICATION_JSON)
    public SpeechAttemptView finalizeRecording(@PathParam("speechId") UUID speechId,
                                               @PathParam("productionId") UUID productionId) {
        UUID learnerId = actor.id();
        SpeechStore.Speech speech = store.find(speechId);
        if (!learnerId.equals(speech.learnerId())) throw HttpError.notFound("Répétition introuvable.");
        if (!"recording".equals(speech.mode()) || !productionId.equals(speech.productionId())) {
            throw HttpError.conflict("Cet enregistrement ne correspond pas à cet essai.");
        }
        if ("uploading".equals(speech.reviewStatus())) {
            JsonNode production = forward(services, actor, mediaUrl,
                    "/v1/internal/media/productions/" + productionId + "/finalize", learnerId, Map.of());
            if (!speechId.toString().equals(production.path("attemptId").asText())
                    || !"available".equals(production.path("status").asText())) {
                throw HttpError.conflict("Cet enregistrement ne correspond pas à cet essai.");
            }
            speech = store.finalizeRecording(speechId, production.path("mimeType").asText(null));
        }
        return view(speech, learnerId, sentence(speech, learnerId), true);
    }

    /** Essai lu par son élève ou par un correcteur habilité (adresse temporaire de l'enregistrement). */
    @GET
    @Path("/{speechId}")
    public SpeechAttemptView speech(@PathParam("speechId") UUID speechId) {
        UUID callerId = actor.id();
        SpeechStore.Speech speech = store.find(speechId);
        if (!callerId.equals(speech.learnerId())
                && !ReviewQueueResource.canGrade(services, identityUrl, callerId, speech.learnerId())) {
            throw HttpError.forbidden("Seuls l’élève, son professeur référent et son correcteur désigné consultent cette répétition.");
        }
        return view(speech, callerId, sentence(speech, callerId), true);
    }

    /** Décision du professeur sur un enregistrement : validé ou refusé (la remise de l'exercice est mise à jour). */
    @POST
    @Path("/{speechId}/review")
    @Consumes(MediaType.APPLICATION_JSON)
    public SpeechAttemptView review(@PathParam("speechId") UUID speechId, SpeechReviewRequest request) {
        UUID callerId = actor.id();
        SpeechStore.Speech speech = store.find(speechId);
        if (!ReviewQueueResource.canGrade(services, identityUrl, callerId, speech.learnerId())) {
            throw HttpError.forbidden("Seuls le professeur référent, le correcteur désigné et l’administration valident cette répétition.");
        }
        if (request == null || !"validated".equals(request.decision()) && !"rejected".equals(request.decision())) {
            throw HttpError.badRequest("Indiquez « validée » ou « refusée ».");
        }
        String comment = request.comment() == null ? null : request.comment().strip();
        if (comment != null && comment.length() > 1000) throw HttpError.badRequest("Le commentaire compte 1 000 caractères au plus.");
        SpeechStore.Speech reviewed = store.review(speechId, callerId, request.decision(), comment);
        return view(reviewed, callerId, sentence(reviewed, callerId), true);
    }

    private UUID learner() {
        UUID learnerId = actor.id();
        if (!"learner".equals(identities.current(learnerId).path("role").asText())) {
            throw HttpError.forbidden("Seul un élève répète à voix haute.");
        }
        return learnerId;
    }

    /** Question speak de la leçon (400 si la question n'existe pas ou ne se répète pas). */
    private JsonNode speakQuestion(SpeechStore.Context context, UUID learnerId) {
        JsonNode question = AnswerRules.questions(keys.key(context.lessonId(), learnerId)).get(context.questionId());
        if (question == null || !AnswerRules.SPEAK.equals(AnswerRules.type(question))) {
            throw HttpError.badRequest("Cette question ne se répète pas à voix haute.");
        }
        return question;
    }

    /** Phrase à répéter, pour l'affichage ; null si la clé est momentanément indisponible. */
    private String sentence(SpeechStore.Speech speech, UUID callerId) {
        try {
            JsonNode question = AnswerRules.questions(keys.key(speech.lessonId(), callerId)).get(speech.questionId());
            return question == null ? null : AnswerRules.speakText(question);
        } catch (WebApplicationException error) {
            return null;
        }
    }

    static SpeechStore.Context context(UUID learnerId, String lessonId, String questionId, UUID roundId, UUID sessionId,
                                       String activityId) {
        if (lessonId == null || lessonId.length() > 100 || !SLUG.matcher(lessonId).matches()) {
            throw HttpError.badRequest("Identifiant de leçon invalide.");
        }
        if (questionId == null || questionId.length() > 64 || !SLUG.matcher(questionId).matches()) {
            throw HttpError.badRequest("Identifiant de question invalide.");
        }
        if (roundId == null) throw HttpError.badRequest("La manche de l’exercice est requise.");
        if ((sessionId == null) != (activityId == null)
                || activityId != null && (activityId.length() > 80 || !SLUG.matcher(activityId).matches())) {
            throw HttpError.badRequest("La séance et l’activité de l’essai vont ensemble.");
        }
        return new SpeechStore.Context(learnerId, lessonId, questionId, roundId, sessionId, activityId);
    }

    private SpeechAttemptView view(SpeechStore.Speech speech, UUID callerId, String text, boolean withFile) {
        List<SpeechStore.Speech> round = store.forQuestion(speech.learnerId(), speech.roundId(), speech.questionId());
        int failures = (int) round.stream().filter(SpeechStore::failed).count();
        Recording recording = null;
        if (speech.productionId() != null) {
            String url = null;
            String mimeType = speech.recordingMime();
            if (withFile && !"uploading".equals(speech.reviewStatus())) {
                JsonNode grant = productionGrants(services, actor, mediaUrl, callerId, List.of(speech.productionId()))
                        .get(speech.productionId());
                if (grant != null) {
                    url = grant.path("url").asText(null);
                    mimeType = grant.path("mimeType").asText(mimeType);
                }
            }
            recording = new Recording(speech.productionId(), mimeType, url);
        }
        return new SpeechAttemptView(speech.id(), speech.learnerId(), speech.lessonId(), speech.questionId(),
                speech.roundId(), speech.attempt(), speech.mode(), speech.score(), speech.passed(), speech.threshold(),
                failures, failures >= AnswerRules.SKIP_AFTER, speech.transcript(), text, speech.reviewStatus(),
                speech.comment(), recording, text(speech.createdAt()));
    }

    /** Appel à Médias avec le jeton de l'utilisateur (politiques Storage) ; les refus métier sont relayés tels quels. */
    static JsonNode forward(ServiceClient services, Actor actor, String base, String path, UUID callerId, Object body) {
        var result = services.exchange(base, path, "POST", callerId, body, actor.token(), "", false, actor.requestId());
        if (result.status() >= 400) {
            throw new WebApplicationException(Response.status(result.status()).type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(result.body()).build());
        }
        return result.body();
    }

    /** Adresses de lecture de cinq minutes des enregistrements, pour un lecteur déjà autorisé (sans jeton : aucune). */
    static Map<UUID, JsonNode> productionGrants(ServiceClient services, Actor actor, String mediaUrl, UUID callerId,
                                                List<UUID> ids) {
        Map<UUID, JsonNode> grants = new HashMap<>();
        if (ids.isEmpty() || actor.token().isEmpty()) return grants;
        try {
            var result = services.exchange(mediaUrl, "/v1/internal/media/productions/read-grants", "POST", callerId,
                    Map.of("ids", ids), actor.token(), "", false, actor.requestId());
            if (result.status() == 200) {
                for (JsonNode grant : result.body()) grants.put(UUID.fromString(grant.path("id").asText()), grant);
            }
        } catch (WebApplicationException | IllegalArgumentException error) {
            LOG.warn("Media production grants unavailable");
        }
        return grants;
    }

    private static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }

    public record SpeechRequest(String lessonId, String questionId, UUID roundId, UUID sessionId, String activityId,
                                List<String> transcripts) {}

    public record SpeechRecordingRequest(String lessonId, String questionId, UUID roundId, UUID sessionId,
                                         String activityId, String mimeType, long size) {}

    public record SpeechReviewRequest(String decision, String comment) {}

    /** Enregistrement privé : adresse temporaire pour l'élève et ses correcteurs, null pendant l'envoi. */
    public record Recording(UUID productionId, String mimeType, String url) {}

    public record Upload(UUID id, String uploadUrl, long maxBytes) {}

    public record RecordingReservation(SpeechAttemptView attempt, Upload upload) {}

    /**
     * failures : échecs de la question dans la manche ; canSkip : trois échecs, l'élève peut passer à la suite.
     * text : phrase à répéter (ajout au plan, pour la file du professeur) ; reviewStatus : auto, uploading, pending,
     * validated ou rejected.
     */
    public record SpeechAttemptView(UUID id, UUID learnerId, String lessonId, String questionId, UUID roundId, int attempt,
                                    String mode, Integer score, boolean passed, int threshold, int failures,
                                    boolean canSkip, String transcript, String text, String reviewStatus, String comment,
                                    Recording recording, String createdAt) {}
}
