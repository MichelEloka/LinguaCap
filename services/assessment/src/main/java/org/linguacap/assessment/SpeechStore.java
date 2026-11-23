package org.linguacap.assessment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.assessment.AssessmentResource.Grade;
import org.linguacap.common.HttpError;

/**
 * Essais de répétition orale (EVO-043) : chaque essai reconnu est rescoré par le serveur ; dix essais reconnus au
 * plus par manche et par question (vingt avec les enregistrements). Un enregistrement de repli attend la décision
 * du professeur, qui met à jour la remise de l'exercice déjà rattachée.
 */
@ApplicationScoped
class SpeechStore {
    private static final Logger LOG = Logger.getLogger(SpeechStore.class);
    static final int MAX_RECOGNITION = 10;
    static final int MAX_ATTEMPTS = 20;

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    record Speech(UUID id, UUID learnerId, String lessonId, String questionId, UUID roundId, UUID sessionId,
                  String activityId, int attempt, String mode, String transcript, Integer score, int threshold,
                  boolean passed, UUID productionId, String recordingMime, String reviewStatus, UUID reviewerId,
                  OffsetDateTime reviewedAt, String comment, UUID quizAttemptId, OffsetDateTime createdAt) {}

    /** Question répétée dans une manche. */
    record Context(UUID learnerId, String lessonId, String questionId, UUID roundId, UUID sessionId, String activityId) {}

    /** Un essai compte comme échec : reconnu sous le seuil, ou enregistrement refusé par le professeur. */
    static boolean failed(Speech speech) {
        return "recognition".equals(speech.mode()) ? !speech.passed() : "rejected".equals(speech.reviewStatus());
    }

    Speech find(UUID id) {
        return read("read speech", connection -> {
            Speech speech = find(connection, id, false);
            if (speech == null) throw HttpError.notFound("Répétition introuvable.");
            return speech;
        });
    }

    /** Essais d'une question dans la manche, dans l'ordre. */
    List<Speech> forQuestion(UUID learnerId, UUID roundId, String questionId) {
        return read("list speech", connection -> {
            try (var query = connection.prepareStatement("""
                    select * from assessment.speech_attempts where learner_id = ? and round_id = ? and question_id = ?
                    order by attempt
                    """)) {
                query.setObject(1, learnerId);
                query.setObject(2, roundId);
                query.setString(3, questionId);
                return list(query.executeQuery());
            }
        });
    }

    /** Enregistrements en attente de validation, les plus anciens d'abord (file des corrections). */
    List<Speech> pending() {
        return read("list pending speech", connection -> {
            try (var query = connection.prepareStatement("""
                    select * from assessment.speech_attempts where review_status = 'pending' order by created_at limit 200
                    """)) {
                return list(query.executeQuery());
            }
        });
    }

    /** Essais de la manche pour une leçon ; verrouillés pendant la remise de l'exercice. */
    static List<Speech> forRound(Connection connection, UUID learnerId, UUID roundId, String lessonId, boolean lock)
            throws SQLException {
        try (var query = connection.prepareStatement("""
                select * from assessment.speech_attempts where learner_id = ? and round_id = ? and lesson_id = ?
                order by question_id, attempt
                """ + (lock ? " for update" : ""))) {
            query.setObject(1, learnerId);
            query.setObject(2, roundId);
            query.setString(3, lessonId);
            return list(query.executeQuery());
        }
    }

    /** Refus avant de réserver un dépôt : manche déjà remise ou trop d'essais (409). */
    void checkOpen(Context context, boolean recording) {
        read("check speech", connection -> {
            limits(connection, context, recording);
            return null;
        });
    }

    /** Essai reconnu par le navigateur et rescoré ici. */
    Speech recognize(Context context, String transcript, int score, int threshold, boolean passed) {
        return transaction("record speech", connection -> {
            lock(connection, context);
            int attempt = limits(connection, context, false);
            UUID id = UUID.randomUUID();
            try (var insert = connection.prepareStatement("""
                    insert into assessment.speech_attempts (id, learner_id, lesson_id, question_id, round_id, session_id,
                        activity_id, attempt, mode, transcript, score, threshold, passed)
                    values (?, ?, ?, ?, ?, ?, ?, ?, 'recognition', ?, ?, ?, ?)
                    """)) {
                bind(insert, id, context, attempt);
                insert.setString(9, transcript.length() > AnswerRules.MAX_TRANSCRIPT
                        ? transcript.substring(0, AnswerRules.MAX_TRANSCRIPT) : transcript);
                insert.setInt(10, score);
                insert.setInt(11, threshold);
                insert.setBoolean(12, passed);
                insert.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    /** Enregistrement de repli réservé chez Médias (attemptId = id de l'essai, partId = id de la question). */
    Speech reserveRecording(UUID id, Context context, int threshold, UUID productionId, String mimeType) {
        return transaction("reserve speech recording", connection -> {
            lock(connection, context);
            int attempt = limits(connection, context, true);
            try (var insert = connection.prepareStatement("""
                    insert into assessment.speech_attempts (id, learner_id, lesson_id, question_id, round_id, session_id,
                        activity_id, attempt, mode, threshold, production_id, recording_mime, review_status)
                    values (?, ?, ?, ?, ?, ?, ?, ?, 'recording', ?, ?, ?, 'uploading')
                    """)) {
                bind(insert, id, context, attempt);
                insert.setInt(9, threshold);
                insert.setObject(10, productionId);
                insert.setString(11, mimeType);
                insert.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    /** Enregistrement reçu et contrôlé par Médias : il attend la décision du professeur. */
    Speech finalizeRecording(UUID id, String mimeType) {
        return transaction("finalize speech recording", connection -> {
            try (var update = connection.prepareStatement("""
                    update assessment.speech_attempts
                    set review_status = 'pending', recording_mime = coalesce(?, recording_mime)
                    where id = ? and mode = 'recording' and review_status = 'uploading'
                    """)) {
                update.setString(1, mimeType);
                update.setObject(2, id);
                update.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    /**
     * Décision du professeur sur un enregistrement : validé (la question devient juste) ou refusé (la question passe
     * « à revoir »). Si l'exercice est déjà remis, sa correction, son score et ses compteurs sont mis à jour.
     */
    Speech review(UUID id, UUID reviewerId, String decision, String comment) {
        return transaction("review speech", connection -> {
            Speech speech = find(connection, id, true);
            if (speech == null) throw HttpError.notFound("Répétition introuvable.");
            if (!"pending".equals(speech.reviewStatus())) {
                if (decision.equals(speech.reviewStatus())) return speech;
                throw HttpError.conflict(switch (speech.reviewStatus()) {
                    case "validated", "rejected" -> "Cette répétition a déjà été examinée.";
                    case "uploading" -> "L’enregistrement de cette répétition n’est pas encore envoyé.";
                    default -> "Cette répétition est corrigée automatiquement.";
                });
            }
            boolean validated = "validated".equals(decision);
            try (var update = connection.prepareStatement("""
                    update assessment.speech_attempts
                    set review_status = ?, passed = ?, reviewer_id = ?, reviewed_at = now(), comment = ?
                    where id = ?
                    """)) {
                update.setString(1, decision);
                update.setBoolean(2, validated);
                update.setObject(3, reviewerId);
                update.setString(4, comment == null || comment.isBlank() ? null : comment);
                update.setObject(5, id);
                update.executeUpdate();
            }
            if (speech.quizAttemptId() != null) updateExercise(connection, speech, decision, comment);
            return find(connection, id, false);
        });
    }

    private void updateExercise(Connection connection, Speech speech, String decision, String comment) throws SQLException {
        JsonNode review;
        int pending;
        try (var query = connection.prepareStatement(
                "select review::text, pending from assessment.quiz_attempts where id = ? for update")) {
            query.setObject(1, speech.quizAttemptId());
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return;
                review = node(rows.getString(1));
                pending = rows.getInt(2);
            }
        }
        if (review == null || !review.isArray() || pending <= 0) return;
        boolean validated = "validated".equals(decision);
        ObjectNode question = null;
        for (JsonNode item : review) {
            if (speech.questionId().equals(item.path("id").asText()) && AnswerRules.PENDING.equals(item.path("status").asText())
                    && speech.id().toString().equals(item.path("given").path("speechAttemptId").asText())) {
                question = (ObjectNode) item;
            }
        }
        if (question == null) return;
        question.put("status", validated ? AnswerRules.CORRECT : AnswerRules.FLAGGED);
        if (question.path("detail").isObject()) {
            ((ObjectNode) question.get("detail")).put("reviewStatus", decision)
                    .put("comment", comment == null || comment.isBlank() ? null : comment);
        }
        Grade grade;
        try (var update = connection.prepareStatement("""
                update assessment.quiz_attempts
                set review = ?::jsonb, pending = pending - 1, correct = correct + ?,
                    flagged = case when ? then array_append(flagged, ?) else flagged end
                where id = ?
                returning
                """ + AssessmentResource.GRADE_COLUMNS)) {
            update.setString(1, ((ArrayNode) review).toString());
            update.setInt(2, validated ? 1 : 0);
            update.setBoolean(3, !validated);
            update.setString(4, speech.questionId());
            update.setObject(5, speech.quizAttemptId());
            try (var rows = update.executeQuery()) {
                if (!rows.next()) return;
                grade = AssessmentResource.readGrade(rows);
            }
        }
        if (!validated) {
            ExerciseStore.emitFlagged(connection, json, grade, speech.learnerId(), speech.roundId(), List.of(speech.questionId()));
        }
    }

    /** Numéro du prochain essai ; refus si la manche est remise ou si les essais sont épuisés. */
    private static int limits(Connection connection, Context context, boolean recording) throws SQLException {
        try (var query = connection.prepareStatement("""
                select exists (select 1 from assessment.quiz_attempts where learner_id = ? and round_id = ?)
                """)) {
            query.setObject(1, context.learnerId());
            query.setObject(2, context.roundId());
            try (var rows = query.executeQuery()) {
                rows.next();
                if (rows.getBoolean(1)) {
                    throw HttpError.conflict("Cet exercice est déjà remis : recommencez-le pour une nouvelle série d’essais.");
                }
            }
        }
        int recognitions = 0;
        int attempts = 0;
        try (var query = connection.prepareStatement("""
                select count(*) filter (where mode = 'recognition'), coalesce(max(attempt), 0)
                from assessment.speech_attempts where learner_id = ? and round_id = ? and question_id = ?
                """)) {
            query.setObject(1, context.learnerId());
            query.setObject(2, context.roundId());
            query.setString(3, context.questionId());
            try (var rows = query.executeQuery()) {
                if (rows.next()) {
                    recognitions = rows.getInt(1);
                    attempts = rows.getInt(2);
                }
            }
        }
        if (attempts >= MAX_ATTEMPTS || !recording && recognitions >= MAX_RECOGNITION) {
            throw HttpError.conflict("Vous avez atteint " + (recording ? MAX_ATTEMPTS : MAX_RECOGNITION)
                    + " essais pour cette phrase : passez à la suite ou recommencez l’exercice.");
        }
        return attempts + 1;
    }

    private static void lock(Connection connection, Context context) throws SQLException {
        try (var lock = connection.prepareStatement("select pg_advisory_xact_lock(hashtextextended(?, 0))")) {
            lock.setString(1, "speech:" + context.learnerId() + ":" + context.roundId() + ":" + context.questionId());
            lock.executeQuery().close();
        }
    }

    private static void bind(java.sql.PreparedStatement insert, UUID id, Context context, int attempt) throws SQLException {
        insert.setObject(1, id);
        insert.setObject(2, context.learnerId());
        insert.setString(3, context.lessonId());
        insert.setString(4, context.questionId());
        insert.setObject(5, context.roundId());
        insert.setObject(6, context.sessionId());
        insert.setString(7, context.activityId());
        insert.setInt(8, attempt);
    }

    private static Speech find(Connection connection, UUID id, boolean lock) throws SQLException {
        try (var query = connection.prepareStatement("select * from assessment.speech_attempts where id = ?"
                + (lock ? " for update" : ""))) {
            query.setObject(1, id);
            List<Speech> found = list(query.executeQuery());
            return found.isEmpty() ? null : found.get(0);
        }
    }

    private static List<Speech> list(ResultSet rows) throws SQLException {
        try (rows) {
            List<Speech> speeches = new ArrayList<>();
            while (rows.next()) {
                speeches.add(new Speech(rows.getObject("id", UUID.class), rows.getObject("learner_id", UUID.class),
                        rows.getString("lesson_id"), rows.getString("question_id"), rows.getObject("round_id", UUID.class),
                        rows.getObject("session_id", UUID.class), rows.getString("activity_id"), rows.getInt("attempt"),
                        rows.getString("mode"), rows.getString("transcript"), (Integer) rows.getObject("score"),
                        rows.getInt("threshold"), rows.getBoolean("passed"), rows.getObject("production_id", UUID.class),
                        rows.getString("recording_mime"), rows.getString("review_status"),
                        rows.getObject("reviewer_id", UUID.class), rows.getObject("reviewed_at", OffsetDateTime.class),
                        rows.getString("comment"), rows.getObject("quiz_attempt_id", UUID.class),
                        rows.getObject("created_at", OffsetDateTime.class)));
            }
            return speeches;
        }
    }

    private JsonNode node(String value) throws SQLException {
        if (value == null) return null;
        try {
            return json.readTree(value);
        } catch (JsonProcessingException error) {
            throw new SQLException("Donnée JSON illisible", "XX000", error);
        }
    }

    private <T> T read(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            return work.run(connection);
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    private <T> T transaction(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                T result = work.run(connection);
                connection.commit();
                return result;
            } catch (SQLException | RuntimeException error) {
                connection.rollback();
                throw error;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    private static RuntimeException failure(String operation, SQLException error) {
        LOG.errorf("Assessment database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        return HttpError.unavailable("Les répétitions orales sont temporairement indisponibles.");
    }
}
