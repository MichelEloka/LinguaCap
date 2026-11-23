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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import org.jboss.logging.Logger;
import org.linguacap.assessment.AnswerRules.SpeechOutcome;
import org.linguacap.assessment.AssessmentResource.Grade;
import org.linguacap.common.HttpError;
import org.linguacap.common.Outbox;

/**
 * Remises d'exercices typés (quiz_attempts, typed) : correction figée question par question, manche remise une seule
 * fois, répétitions orales rattachées à la remise et événement « à revoir » dans la même transaction.
 */
@ApplicationScoped
class ExerciseStore {
    private static final Logger LOG = Logger.getLogger(ExerciseStore.class);
    private static final String COLUMNS = AssessmentResource.GRADE_COLUMNS
            + ", learner_id, answers::text as answers_text, review::text as review_text, round_id";

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    /** Remise lue : résultat, réponses données et correction figée (null pour l'historique). */
    record Stored(Grade grade, UUID learnerId, JsonNode answers, JsonNode review, UUID roundId) {}

    /** Correction d'une remise, calculée sous verrou avec les répétitions de la manche. */
    record Graded(ArrayNode questions, int correct, int pending, List<String> flagged, int total, List<UUID> speechIds) {}

    /** Contexte de la remise. */
    record Submission(UUID learnerId, String requestKey, String lessonId, UUID roundId, UUID sessionId, String activityId,
                      String answersJson) {}

    Stored find(UUID id) {
        return read("read exercise", connection -> {
            try (var query = connection.prepareStatement("select " + COLUMNS + " from assessment.quiz_attempts where id = ?")) {
                query.setObject(1, id);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Remise introuvable.");
                    return stored(rows);
                }
            }
        });
    }

    /**
     * Remise d'une manche : une remise déjà enregistrée pour cette clé ou cette manche est renvoyée telle quelle
     * (mêmes réponses) ou refusée (409). Sinon les répétitions de la manche sont verrouillées puis la correction
     * est calculée, enregistrée et rattachée aux répétitions ; les questions « à revoir » émettent un événement.
     */
    Stored submit(Submission submission, Function<Map<UUID, SpeechOutcome>, Graded> grader) {
        return transaction("submit exercise", connection -> {
            try (var lock = connection.prepareStatement("select pg_advisory_xact_lock(hashtextextended(?, 0))")) {
                lock.setString(1, "exercise:" + submission.learnerId() + ":" + submission.roundId());
                lock.executeQuery().close();
            }
            Stored prior = existing(connection, submission);
            if (prior != null) return prior;
            List<SpeechStore.Speech> speeches = SpeechStore.forRound(connection, submission.learnerId(),
                    submission.roundId(), submission.lessonId(), true);
            Graded graded = grader.apply(outcomes(speeches));
            Stored stored;
            try (var insert = connection.prepareStatement("""
                    insert into assessment.quiz_attempts (learner_id, lesson_id, answers, correct, total, request_key,
                        session_id, activity_id, kind, review, pending, flagged, round_id, typed)
                    values (?, ?, ?::jsonb, ?, ?, ?, ?, ?, 'quiz', ?::jsonb, ?, ?, ?, true)
                    on conflict do nothing
                    returning
                    """ + COLUMNS)) {
                insert.setObject(1, submission.learnerId());
                insert.setString(2, submission.lessonId());
                insert.setString(3, submission.answersJson());
                insert.setInt(4, graded.correct());
                insert.setInt(5, graded.total());
                insert.setString(6, submission.requestKey());
                insert.setObject(7, submission.sessionId());
                insert.setString(8, submission.activityId());
                insert.setString(9, graded.questions().toString());
                insert.setInt(10, graded.pending());
                insert.setArray(11, connection.createArrayOf("text", graded.flagged().toArray()));
                insert.setObject(12, submission.roundId());
                try (var rows = insert.executeQuery()) {
                    stored = rows.next() ? stored(rows) : null;
                }
            }
            if (stored == null) {
                Stored concurrent = existing(connection, submission);
                if (concurrent != null) return concurrent;
                throw HttpError.conflict("Cette clé de remise a déjà été utilisée pour une autre manche.");
            }
            if (!graded.speechIds().isEmpty()) {
                try (var link = connection.prepareStatement("""
                        update assessment.speech_attempts set quiz_attempt_id = ?
                        where id = any(?) and learner_id = ? and round_id = ?
                        """)) {
                    link.setObject(1, UUID.fromString(stored.grade().id()));
                    link.setArray(2, connection.createArrayOf("uuid", graded.speechIds().toArray()));
                    link.setObject(3, submission.learnerId());
                    link.setObject(4, submission.roundId());
                    link.executeUpdate();
                }
            }
            if (!graded.flagged().isEmpty()) {
                emitFlagged(connection, json, stored.grade(), submission.learnerId(), submission.roundId(), graded.flagged());
            }
            return stored;
        });
    }

    /**
     * Questions « à revoir » d'une remise (DEV EVO-043) : le professeur en est prévenu par l'événement
     * assessment.exercise_flagged (sujet exercise, sans enrollmentId) et par Grade.flagged dans les résultats.
     */
    static void emitFlagged(Connection connection, ObjectMapper json, Grade grade, UUID learnerId, UUID roundId,
                            List<String> questionIds) throws SQLException {
        ObjectNode data = json.createObjectNode().put("attemptId", grade.id()).put("lessonId", grade.lessonId())
                .put("sessionId", grade.sessionId()).put("activityId", grade.activityId())
                .put("roundId", roundId == null ? null : roundId.toString())
                .put("correct", grade.correct()).put("pending", grade.pending()).put("total", grade.total());
        ArrayNode flagged = data.putArray("questionIds");
        questionIds.forEach(flagged::add);
        ArrayNode all = data.putArray("flagged");
        grade.flagged().forEach(all::add);
        Outbox.emit(connection, "assessment.outbox_events", "assessment.exercise_flagged", "exercise", grade.id(),
                learnerId, null, data);
    }

    /** Essais de répétition de la manche, résumés par question pour la correction. */
    static Map<UUID, SpeechOutcome> outcomes(List<SpeechStore.Speech> speeches) {
        Map<String, int[]> counts = new HashMap<>();
        for (SpeechStore.Speech speech : speeches) {
            int[] count = counts.computeIfAbsent(speech.questionId(), ignored -> new int[2]);
            count[0]++;
            if (SpeechStore.failed(speech)) count[1]++;
        }
        Map<UUID, SpeechOutcome> outcomes = new HashMap<>();
        for (SpeechStore.Speech speech : speeches) {
            int[] count = counts.get(speech.questionId());
            outcomes.put(speech.id(), new SpeechOutcome(speech.id(), speech.questionId(), speech.mode(), speech.passed(),
                    speech.reviewStatus(), speech.score(), speech.transcript(), count[0], count[1], speech.comment()));
        }
        return outcomes;
    }

    private Stored existing(Connection connection, Submission submission) throws SQLException {
        try (var query = connection.prepareStatement("select " + COLUMNS + """
                , answers = ?::jsonb as same_answers
                from assessment.quiz_attempts
                where learner_id = ? and (request_key = ? or round_id = ?)
                order by submitted_at limit 1
                """)) {
            query.setString(1, submission.answersJson());
            query.setObject(2, submission.learnerId());
            query.setString(3, submission.requestKey());
            query.setObject(4, submission.roundId());
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return null;
                if (!submission.lessonId().equals(rows.getString("lesson_id")) || !rows.getBoolean("same_answers")
                        || !submission.roundId().equals(rows.getObject("round_id", UUID.class))) {
                    throw HttpError.conflict("Cette manche est déjà remise : recommencez l’exercice pour une nouvelle manche.");
                }
                return stored(rows);
            }
        }
    }

    private Stored stored(ResultSet rows) throws SQLException {
        return new Stored(AssessmentResource.readGrade(rows), rows.getObject("learner_id", UUID.class),
                node(rows.getString("answers_text")), node(rows.getString("review_text")),
                rows.getObject("round_id", UUID.class));
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
        return HttpError.unavailable("Les exercices sont temporairement indisponibles.");
    }
}
