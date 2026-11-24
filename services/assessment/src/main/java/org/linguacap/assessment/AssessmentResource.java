package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

@Path("/v1/assessments")
@Produces(MediaType.APPLICATION_JSON)
public class AssessmentResource {
    private static final Pattern LESSON_ID = Pattern.compile("[a-z0-9]+(?:-[a-z0-9]+)*");
    private static final Pattern ANSWER_ID = Pattern.compile("[A-Za-z0-9][A-Za-z0-9_.-]{0,79}");
    private static final Pattern REQUEST_KEY = Pattern.compile("[A-Za-z0-9_-]{8,128}");
    /** Colonnes lues par readGrade, partagées avec les remises d'exercices typés (ExerciseStore). */
    static final String GRADE_COLUMNS = "id, lesson_id, correct, total, submitted_at, session_id, activity_id, kind, "
            + "module_scores, pending, flagged, typed";

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper mapper;
    @Inject ExerciseKeys keys;

    @ConfigProperty(name = "lingua.services.catalogue")
    String catalogueUrl;

    @POST
    @Path("/quiz")
    @Consumes(MediaType.APPLICATION_JSON)
    public Grade quiz(QuizRequest request, @HeaderParam("Idempotency-Key") String requestKey) {
        UUID learnerId = actor.id();
        if (!"learner".equals(identities.current(learnerId).path("role").asText())) {
            throw HttpError.forbidden("Seul un élève peut remettre un quiz.");
        }
        validate(request, requestKey);
        String lessonId = request.lessonId();
        String answersJson = mapper.valueToTree(request.answers()).toString();
        Grade prior = findExisting(learnerId, requestKey, lessonId, answersJson);
        if (prior != null) {
            return prior;
        }
        var keyResult = services.exchange(catalogueUrl, "/v1/internal/lessons/" + lessonId + "/answer-key", "GET",
                learnerId, null, "", "", false, actor.requestId());
        if (keyResult.status() == 404 && typedLesson(lessonId, learnerId)) {
            throw HttpError.conflict("Cet exercice se remet avec sa correction détaillée : utilisez /assessments/exercises.");
        }
        if (keyResult.status() >= 400) {
            throw new WebApplicationException(Response.status(keyResult.status()).entity(keyResult.body()).build());
        }
        JsonNode key = keyResult.body();
        if (key.path("modules").isObject() && !key.path("modules").isEmpty()) {
            // Un diagnostic remis comme un quiz donnerait son score à volonté, donc ses réponses par essais successifs.
            throw HttpError.conflict("Ce questionnaire est un diagnostic : il se passe depuis votre objectif.");
        }
        if (key.path("typed").asBoolean(false)) {
            // Une leçon typée (trous, ordre, association, dictée, répétition) se remet avec sa correction détaillée.
            throw HttpError.conflict("Cet exercice se remet avec sa correction détaillée : utilisez /assessments/exercises.");
        }
        JsonNode answerKey = key.path("answers");
        if (!answerKey.isObject() || answerKey.isEmpty() || answerKey.size() > 100) {
            throw HttpError.unavailable("Le corrigé de ce quiz est indisponible.");
        }
        if (request.answers().size() != answerKey.size()) {
            throw HttpError.badRequest("Réponds à toutes les questions avant de remettre le quiz.");
        }
        int correct = 0;
        for (Map.Entry<String, String> answer : request.answers().entrySet()) {
            JsonNode expected = answerKey.get(answer.getKey());
            if (expected == null || !expected.isTextual()) {
                throw HttpError.badRequest("Une réponse ne correspond pas à ce quiz.");
            }
            if (answer.getValue().equals(expected.textValue())) {
                correct++;
            }
        }
        return storeAttempt(learnerId, requestKey, lessonId, answersJson, correct, answerKey.size(),
                request.sessionId(), request.activityId(), "quiz", null);
    }

    /** Leçon sans aucun choix (le corrigé des choix est alors introuvable) mais avec des questions typées. */
    private boolean typedLesson(String lessonId, UUID learnerId) {
        try {
            JsonNode key = keys.keyOrNull(lessonId, learnerId);
            if (key == null) return false;
            for (JsonNode question : key.path("questions")) {
                if (!AnswerRules.CHOICE.equals(AnswerRules.type(question))) return true;
            }
        } catch (WebApplicationException unavailable) {
            // Clé typée indisponible : le refus d'origine (404) est conservé.
        }
        return false;
    }

    /** Diagnostic initial (DEV-036) : chaque question situe l'élève sur un module ou sur le prérequis du niveau. */
    @POST
    @Path("/diagnostics")
    @Consumes(MediaType.APPLICATION_JSON)
    public Grade diagnostic(QuizRequest request, @HeaderParam("Idempotency-Key") String requestKey) {
        UUID learnerId = actor.id();
        if (!"learner".equals(identities.current(learnerId).path("role").asText())) {
            throw HttpError.forbidden("Seul un élève passe un diagnostic.");
        }
        validate(request, requestKey);
        if (request.sessionId() != null) {
            throw HttpError.badRequest("Un diagnostic n’est pas rattaché à une séance.");
        }
        String lessonId = request.lessonId();
        String answersJson = mapper.valueToTree(request.answers()).toString();
        Grade prior = findExisting(learnerId, requestKey, lessonId, answersJson);
        if (prior != null) {
            return prior;
        }
        JsonNode key = services.request(catalogueUrl,
                "/v1/internal/lessons/" + lessonId + "/answer-key", "GET", learnerId, null);
        JsonNode answerKey = key.path("answers");
        JsonNode modules = key.path("modules");
        if (!answerKey.isObject() || answerKey.isEmpty() || !modules.isObject() || modules.isEmpty()) {
            throw HttpError.badRequest("Ce questionnaire n’est pas un diagnostic.");
        }
        if (request.answers().size() != answerKey.size()) {
            throw HttpError.badRequest("Réponds à toutes les questions avant de remettre le diagnostic.");
        }
        int correct = 0;
        Map<String, int[]> scores = new java.util.TreeMap<>();
        for (Map.Entry<String, String> answer : request.answers().entrySet()) {
            JsonNode expected = answerKey.get(answer.getKey());
            if (expected == null || !expected.isTextual()) {
                throw HttpError.badRequest("Une réponse ne correspond pas à ce diagnostic.");
            }
            boolean right = answer.getValue().equals(expected.textValue());
            if (right) correct++;
            String module = modules.path(answer.getKey()).asText("");
            if (!module.isEmpty()) {
                int[] score = scores.computeIfAbsent(module, ignored -> new int[2]);
                score[1]++;
                if (right) score[0]++;
            }
        }
        var moduleScores = mapper.createObjectNode();
        scores.forEach((module, score) -> moduleScores.putObject(module).put("correct", score[0]).put("total", score[1]));
        return storeAttempt(learnerId, requestKey, lessonId, answersJson, correct, answerKey.size(), null, null,
                "diagnostic", moduleScores.toString());
    }

    @GET
    @Path("/results")
    public List<Grade> results(@QueryParam("learnerId") String requestedLearnerId) {
        UUID learnerId = authorizeLearner(actor.id(), requestedLearnerId);
        String sql = "SELECT " + GRADE_COLUMNS + """
                 FROM assessment.quiz_attempts
                WHERE learner_id = ?
                ORDER BY submitted_at DESC, id DESC
                """;
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, learnerId);
            try (var rows = statement.executeQuery()) {
                List<Grade> results = new ArrayList<>();
                while (rows.next()) {
                    results.add(readGrade(rows));
                }
                return results;
            }
        } catch (SQLException ignored) {
            throw HttpError.unavailable("Les résultats de cet élève sont indisponibles.");
        }
    }

    private UUID authorizeLearner(UUID callerId, String requestedLearnerId) {
        if (requestedLearnerId != null) {
            UUID id = readLearnerId(requestedLearnerId);
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

    private static UUID readLearnerId(String value) {
        try {
            UUID id = UUID.fromString(value);
            if (id.toString().equalsIgnoreCase(value)) {
                return id;
            }
        } catch (IllegalArgumentException ignored) {
            // Both invalid shapes use the same response.
        }
        throw HttpError.badRequest("Identifiant élève invalide.");
    }

    private Grade findExisting(UUID learnerId, String requestKey, String lessonId, String answersJson) {
        if (requestKey == null) {
            return null;
        }
        try (var connection = dataSource.getConnection()) {
            return findExisting(connection, learnerId, requestKey, lessonId, answersJson);
        } catch (SQLException ignored) {
            throw HttpError.unavailable("Le quiz est temporairement indisponible.");
        }
    }

    private Grade storeAttempt(UUID learnerId, String requestKey, String lessonId, String answersJson,
                               int correct, int total, UUID sessionId, String activityId, String kind,
                               String moduleScores) {
        String sql = """
                INSERT INTO assessment.quiz_attempts
                    (learner_id, lesson_id, answers, correct, total, request_key, session_id, activity_id, kind, module_scores)
                VALUES (?, ?, CAST(? AS jsonb), ?, ?, ?, ?, ?, ?, CAST(? AS jsonb))
                ON CONFLICT (learner_id, request_key) DO NOTHING
                RETURNING
                """ + GRADE_COLUMNS;
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, learnerId);
            statement.setString(2, lessonId);
            statement.setString(3, answersJson);
            statement.setInt(4, correct);
            statement.setInt(5, total);
            statement.setString(6, requestKey);
            statement.setObject(7, sessionId);
            statement.setString(8, activityId);
            statement.setString(9, kind);
            statement.setString(10, moduleScores);
            try (var rows = statement.executeQuery()) {
                if (rows.next()) {
                    return readGrade(rows);
                }
            }
            Grade prior = findExisting(connection, learnerId, requestKey, lessonId, answersJson);
            if (prior != null) {
                return prior;
            }
        } catch (SQLException ignored) {
            throw HttpError.unavailable("Le résultat du quiz n’a pas pu être enregistré.");
        }
        throw HttpError.unavailable("Le résultat du quiz n’a pas pu être enregistré.");
    }

    private static Grade findExisting(Connection connection, UUID learnerId, String requestKey, String lessonId,
                                      String answersJson) throws SQLException {
        String sql = "SELECT " + GRADE_COLUMNS + """
                , answers = CAST(? AS jsonb) AS same_answers
                FROM assessment.quiz_attempts
                WHERE learner_id = ? AND request_key = ?
                """;
        try (var statement = connection.prepareStatement(sql)) {
            statement.setString(1, answersJson);
            statement.setObject(2, learnerId);
            statement.setString(3, requestKey);
            try (var rows = statement.executeQuery()) {
                if (!rows.next()) {
                    return null;
                }
                if (!lessonId.equals(rows.getString("lesson_id")) || !rows.getBoolean("same_answers")) {
                    throw HttpError.conflict("Cette clé de remise a déjà été utilisée pour d’autres réponses.");
                }
                return readGrade(rows);
            }
        }
    }

    /** Remise lue avec les colonnes GRADE_COLUMNS ; l'historique vaut pending 0, flagged [] et typed false. */
    static Grade readGrade(ResultSet row) throws SQLException {
        UUID sessionId = row.getObject("session_id", UUID.class);
        String scores = row.getString("module_scores");
        JsonNode moduleScores;
        try {
            moduleScores = scores == null ? null : new ObjectMapper().readTree(scores);
        } catch (com.fasterxml.jackson.core.JsonProcessingException error) {
            moduleScores = null;
        }
        return new Grade(row.getObject("id", UUID.class).toString(), row.getString("lesson_id"),
                row.getInt("correct"), row.getInt("total"),
                row.getObject("submitted_at", OffsetDateTime.class).toString(),
                sessionId == null ? null : sessionId.toString(), row.getString("activity_id"),
                row.getString("kind"), moduleScores, row.getInt("pending"), texts(row.getArray("flagged")),
                row.getBoolean("typed"));
    }

    private static List<String> texts(java.sql.Array array) throws SQLException {
        if (array == null) return List.of();
        try {
            List<String> values = new ArrayList<>();
            for (Object value : (Object[]) array.getArray()) values.add(String.valueOf(value));
            return List.copyOf(values);
        } finally {
            array.free();
        }
    }

    private static void validate(QuizRequest request, String requestKey) {
        if (request == null || request.lessonId() == null || request.lessonId().length() > 100
                || !LESSON_ID.matcher(request.lessonId()).matches()) {
            throw HttpError.badRequest("Identifiant de leçon invalide.");
        }
        Map<String, String> answers = request.answers();
        if (answers == null || answers.isEmpty() || answers.size() > 100) {
            throw HttpError.badRequest("Les réponses du quiz sont requises.");
        }
        boolean invalidAnswer = answers.entrySet().stream().anyMatch(answer ->
                !ANSWER_ID.matcher(answer.getKey()).matches() || answer.getValue() == null
                        || !ANSWER_ID.matcher(answer.getValue()).matches());
        if (invalidAnswer) {
            throw HttpError.badRequest("Une réponse a un identifiant invalide.");
        }
        if ((request.sessionId() == null) != (request.activityId() == null)
                || request.activityId() != null && (request.activityId().length() > 80 || !LESSON_ID.matcher(request.activityId()).matches())) {
            throw HttpError.badRequest("La séance et l’activité de la remise vont ensemble.");
        }
        if (requestKey != null && !REQUEST_KEY.matcher(requestKey).matches()) {
            throw HttpError.badRequest("Clé de remise invalide.");
        }
    }

    /** sessionId et activityId, facultatifs et indissociables, rattachent la remise à une séance. */
    public record QuizRequest(String lessonId, Map<String, String> answers, UUID sessionId, String activityId) {}

    /**
     * kind : quiz ou diagnostic. moduleScores : pour un diagnostic, bonnes réponses et total par module.
     * pending : répétitions orales en attente de validation par le professeur ; flagged : questions « à revoir »
     * (trois échecs de répétition ou enregistrement refusé) ; typed : remise corrigée question par question
     * (POST /assessments/exercises, correction lisible par GET /assessments/exercises/{id}).
     */
    public record Grade(String id, String lessonId, int correct, int total, String submittedAt, String sessionId,
                        String activityId, String kind, JsonNode moduleScores, int pending, List<String> flagged,
                        boolean typed) {}
}
