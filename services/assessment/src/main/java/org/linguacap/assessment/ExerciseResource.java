package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.linguacap.assessment.AnswerRules.SpeechOutcome;
import org.linguacap.assessment.AssessmentResource.Grade;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;

/**
 * Exercices typés (V4) : la remise renvoie la correction de chaque question (juste ou faux, réponse attendue,
 * explication, remarques), figée dans quiz_attempts.review et relue par GET /assessments/exercises/{id}. Une
 * ancienne remise de quiz est corrigée à la volée, sans explication. Le corrigé n'est jamais servi avant la remise.
 */
@Path("/v1/assessments/exercises")
@Produces(MediaType.APPLICATION_JSON)
public class ExerciseResource {
    static final int MAX_QUESTIONS = 30;
    private static final Pattern ANSWER_ID = Pattern.compile("[A-Za-z0-9][A-Za-z0-9_.-]{0,79}");
    private static final Pattern REQUEST_KEY = Pattern.compile("[A-Za-z0-9_-]{8,128}");

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ExerciseKeys keys;
    @Inject ExerciseStore store;

    /** Remise d'une manche (Idempotency-Key) : rejouer la même remise renvoie la même correction. */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public ExerciseResult submit(SubmitRequest request, @HeaderParam("Idempotency-Key") String requestKey) {
        UUID learnerId = actor.id();
        if (!"learner".equals(identities.current(learnerId).path("role").asText())) {
            throw HttpError.forbidden("Seul un élève remet un exercice.");
        }
        validate(request, requestKey);
        JsonNode key = keys.key(request.lessonId(), learnerId);
        ExerciseStore.Stored stored = store.submit(new ExerciseStore.Submission(learnerId, requestKey, request.lessonId(),
                request.roundId(), request.sessionId(), request.activityId(), request.answers().toString()),
                speech -> grade(key, request.answers(), speech));
        return new ExerciseResult(stored.grade(), stored.review());
    }

    /** Correction d'une remise : son élève, son professeur référent ou l'administration. */
    @GET
    @Path("/{attemptId}")
    public ExerciseResult result(@PathParam("attemptId") UUID attemptId) {
        UUID callerId = actor.id();
        ExerciseStore.Stored stored = store.find(attemptId);
        if (!callerId.equals(stored.learnerId())) identities.learner(callerId, stored.learnerId());
        if ("diagnostic".equals(stored.grade().kind())) {
            throw HttpError.conflict("Le diagnostic n’a pas de corrigé détaillé.");
        }
        if (stored.review() != null && stored.review().isArray()) return new ExerciseResult(stored.grade(), stored.review());
        JsonNode key = keys.keyOrNull(stored.grade().lessonId(), callerId);
        return new ExerciseResult(stored.grade(), legacy(key, stored.answers()));
    }

    /**
     * Correction de toutes les questions de la clé : chaque question doit avoir une réponse (400 sinon), une réponse
     * étrangère à l'exercice est refusée (400) ; une répétition orale qui ne permet pas encore de passer bloque (409).
     */
    static ExerciseStore.Graded grade(JsonNode key, JsonNode answers, Map<UUID, SpeechOutcome> speech) {
        Map<String, JsonNode> questions = AnswerRules.questions(key);
        answers.fieldNames().forEachRemaining(id -> {
            if (!questions.containsKey(id)) throw HttpError.badRequest("Une réponse ne correspond pas à cet exercice.");
        });
        ArrayNode reviews = JsonNodeFactory.instance.arrayNode();
        int correct = 0;
        int pending = 0;
        List<String> flagged = new ArrayList<>();
        List<UUID> speechIds = new ArrayList<>();
        for (JsonNode question : key.path("questions")) {
            String id = question.path("id").asText();
            JsonNode answer = answers.get(id);
            if (answer == null || answer.isNull()) {
                throw HttpError.badRequest("Répondez à toutes les questions avant de valider.");
            }
            ObjectNode review = AnswerRules.review(question, answer, speech);
            switch (review.path("status").asText()) {
                case AnswerRules.CORRECT -> correct++;
                case AnswerRules.PENDING -> pending++;
                case AnswerRules.FLAGGED -> flagged.add(id);
                default -> { }
            }
            if (AnswerRules.SPEAK.equals(AnswerRules.type(question))) {
                speechIds.add(UUID.fromString(answer.path("speechAttemptId").asText()));
            }
            reviews.add(review);
        }
        return new ExerciseStore.Graded(reviews, correct, pending, List.copyOf(flagged), reviews.size(),
                List.copyOf(speechIds));
    }

    /** Ancienne remise de quiz ({q1: 'b'}) : correction des choix calculée à la volée, sans explication ni retour. */
    static ArrayNode legacy(JsonNode key, JsonNode answers) {
        ArrayNode reviews = JsonNodeFactory.instance.arrayNode();
        if (key == null || answers == null) return reviews;
        for (JsonNode question : key.path("questions")) {
            JsonNode answer = answers.path(question.path("id").asText());
            if (!AnswerRules.CHOICE.equals(AnswerRules.type(question)) || !answer.isTextual()) continue;
            try {
                ObjectNode review = AnswerRules.review(question, answer, Map.of());
                review.putNull("explanation");
                review.putNull("feedback");
                reviews.add(review);
            } catch (WebApplicationException ignored) {
                // Choix disparu du contenu : la question est omise.
            }
        }
        return reviews;
    }

    /** Forme de la remise, contrôlée avant tout appel au catalogue. */
    static void validate(SubmitRequest request, String requestKey) {
        if (request == null || request.lessonId() == null || request.lessonId().length() > 100
                || !SpeechResource.SLUG.matcher(request.lessonId()).matches()) {
            throw HttpError.badRequest("Identifiant de leçon invalide.");
        }
        if (request.roundId() == null) throw HttpError.badRequest("La manche de l’exercice est requise.");
        if ((request.sessionId() == null) != (request.activityId() == null)
                || request.activityId() != null && (request.activityId().length() > 80
                || !SpeechResource.SLUG.matcher(request.activityId()).matches())) {
            throw HttpError.badRequest("La séance et l’activité de la remise vont ensemble.");
        }
        JsonNode answers = request.answers();
        if (answers == null || !answers.isObject() || answers.isEmpty()) {
            throw HttpError.badRequest("Les réponses de l’exercice sont requises.");
        }
        if (answers.size() > MAX_QUESTIONS) {
            throw HttpError.badRequest("Un exercice compte " + MAX_QUESTIONS + " questions au plus.");
        }
        Set<String> seen = new HashSet<>();
        answers.properties().forEach(entry -> {
            if (!ANSWER_ID.matcher(entry.getKey()).matches() || !seen.add(entry.getKey())) {
                throw HttpError.badRequest("Une réponse a un identifiant invalide.");
            }
            AnswerRules.checkShape(entry.getKey(), entry.getValue());
        });
        if (requestKey != null && !REQUEST_KEY.matcher(requestKey).matches()) {
            throw HttpError.badRequest("Clé de remise invalide.");
        }
    }

    /**
     * answers : {q1:{choice:'b'}, q2:{blanks:{'1':'weil'}}, q3:{order:[ids]}, q4:{pairs:{l:r}}, q5:{text:'…'},
     * q6:{speechAttemptId:'uuid'}}.
     */
    public record SubmitRequest(String lessonId, UUID roundId, UUID sessionId, String activityId, JsonNode answers) {}

    /** grade : résultat (pending, flagged, typed) ; questions : correction de chaque question (QuestionReview). */
    public record ExerciseResult(Grade grade, JsonNode questions) {}
}
