package org.linguacap.assessment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.linguacap.common.HttpError;
import org.linguacap.common.Outbox;

/** Tentatives d'évaluation : réponses en cours, remise horodatée, correction et résultat (DEV-061 à DEV-071). */
@ApplicationScoped
class ExamStore {
    private static final Logger LOG = Logger.getLogger(ExamStore.class);

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    public record Attempt(UUID id, UUID learnerId, UUID enrollmentId, UUID trackVersionId, String kind, int number,
                          String status, JsonNode definition, int passPercent, JsonNode answers, JsonNode texts,
                          JsonNode recordings, OffsetDateTime dueAt, OffsetDateTime startedAt, OffsetDateTime submittedAt,
                          String submitKey, OffsetDateTime gradedAt, UUID graderId, JsonNode grading, JsonNode scores,
                          Integer percent, String decision, JsonNode review, String feedback, String learningAcked) {
        /** Une remise au plus tard à l'échéance reste à temps, même corrigée après. */
        boolean onTime() {
            return submittedAt != null && (dueAt == null || !submittedAt.isAfter(dueAt));
        }
    }

    Attempt find(UUID id) {
        return read("read attempt", connection -> {
            Attempt attempt = find(connection, id, false);
            if (attempt == null) throw HttpError.notFound("Tentative introuvable.");
            return attempt;
        });
    }

    List<Attempt> forEnrollment(UUID enrollmentId) {
        return list("select * from assessment.exam_attempts where enrollment_id = ? order by kind, number desc", enrollmentId);
    }

    /** Apprentissage a reçu la remise (submitted) ou la correction (graded) ; une correction reçue ne régresse pas. */
    void acknowledge(UUID id, String state) {
        transaction("acknowledge learning", connection -> {
            try (var query = connection.prepareStatement("update assessment.exam_attempts set learning_acked = ? "
                    + "where id = ? and learning_acked is distinct from 'graded'")) {
                query.setString(1, state);
                query.setObject(2, id);
                return query.executeUpdate();
            }
        });
    }

    /** Remises en attente de correction, les plus anciennes d'abord. */
    List<Attempt> awaitingGrading() {
        return list("select * from assessment.exam_attempts where status = 'submitted' and ?::uuid is null order by submitted_at limit 200", null);
    }

    /** Tentative ouverte reprise, ou nouvelle tentative numérotée après les précédentes. */
    Attempt open(UUID learnerId, UUID enrollmentId, UUID trackVersionId, String kind, JsonNode definition,
                 int passPercent, OffsetDateTime dueAt) {
        return transaction("open attempt", connection -> {
            try (var lock = connection.prepareStatement(
                    "select pg_advisory_xact_lock(hashtextextended(?, 0))")) {
                lock.setString(1, enrollmentId + ":" + kind);
                lock.executeQuery().close();
            }
            try (var query = connection.prepareStatement("""
                    select id from assessment.exam_attempts where enrollment_id = ? and kind = ? and status = 'in_progress'
                    """)) {
                query.setObject(1, enrollmentId);
                query.setString(2, kind);
                try (var rows = query.executeQuery()) {
                    if (rows.next()) return find(connection, rows.getObject(1, UUID.class), false);
                }
            }
            UUID id = UUID.randomUUID();
            try (var insert = connection.prepareStatement("""
                    insert into assessment.exam_attempts (id, learner_id, enrollment_id, track_version_id, kind, number,
                        definition, pass_percent, due_at)
                    select ?, ?, ?, ?, ?, coalesce(max(number), 0) + 1, ?::jsonb, ?, ?
                    from assessment.exam_attempts where enrollment_id = ? and kind = ?
                    """)) {
                insert.setObject(1, id);
                insert.setObject(2, learnerId);
                insert.setObject(3, enrollmentId);
                insert.setObject(4, trackVersionId);
                insert.setString(5, kind);
                insert.setString(6, definition.toString());
                insert.setInt(7, passPercent);
                insert.setObject(8, dueAt);
                insert.setObject(9, enrollmentId);
                insert.setString(10, kind);
                insert.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    Attempt saveProgress(UUID id, JsonNode answers, JsonNode texts) {
        return transaction("save attempt", connection -> {
            try (var update = connection.prepareStatement("""
                    update assessment.exam_attempts
                    set answers = coalesce(?::jsonb, answers), texts = coalesce(?::jsonb, texts), updated_at = now()
                    where id = ? and status = 'in_progress'
                    """)) {
                update.setString(1, answers == null || answers.isNull() ? null : answers.toString());
                update.setString(2, texts == null || texts.isNull() ? null : texts.toString());
                update.setObject(3, id);
                if (update.executeUpdate() == 0) throw HttpError.conflict("Cette tentative est déjà remise.");
            }
            return find(connection, id, false);
        });
    }

    Attempt attachRecording(UUID id, String partId, UUID productionId) {
        return transaction("attach recording", connection -> {
            try (var update = connection.prepareStatement("""
                    update assessment.exam_attempts set recordings = jsonb_set(recordings, array[?], to_jsonb(?::text)),
                        updated_at = now()
                    where id = ? and status = 'in_progress'
                    """)) {
                update.setString(1, partId);
                update.setString(2, productionId.toString());
                update.setObject(3, id);
                if (update.executeUpdate() == 0) throw HttpError.conflict("Cette tentative est déjà remise.");
            }
            return find(connection, id, false);
        });
    }

    /**
     * Remise horodatée. Sans production à corriger, le résultat est enregistré dans la même transaction.
     * Une tentative déjà remise est renvoyée telle quelle : rejouer la remise n'en crée pas une deuxième.
     */
    Attempt submit(UUID id, String key, ExamRules.Result result, JsonNode review) {
        return transaction("submit attempt", connection -> {
            Attempt current = find(connection, id, true);
            if (current == null) throw HttpError.notFound("Tentative introuvable.");
            if (!"in_progress".equals(current.status())) return current;
            try (var update = connection.prepareStatement("""
                    update assessment.exam_attempts
                    set status = ?, submit_key = ?, submitted_at = now(), updated_at = now(),
                        graded_at = case when ? then now() end, scores = ?::jsonb, percent = ?, decision = ?, review = ?::jsonb
                    where id = ?
                    """)) {
                update.setString(1, result == null ? "submitted" : "graded");
                update.setString(2, key);
                update.setBoolean(3, result != null);
                update.setString(4, result == null ? null : ExamRules.scoresNode(json, result.scores()).toString());
                update.setObject(5, result == null ? null : result.percent());
                update.setString(6, result == null ? null : result.decision());
                update.setString(7, review == null ? null : review.toString());
                update.setObject(8, id);
                update.executeUpdate();
            }
            Attempt submitted = find(connection, id, false);
            emit(connection, "assessment.attempt_submitted", submitted, result == null);
            if (result != null) emit(connection, "assessment.attempt_graded", submitted, false);
            return submitted;
        });
    }

    /** Correction humaine : la date de correction est enregistrée à part de la date de remise. */
    Attempt grade(UUID id, UUID graderId, JsonNode grading, ExamRules.Result result, JsonNode review, String feedback) {
        return transaction("grade attempt", connection -> {
            Attempt current = find(connection, id, true);
            if (current == null) throw HttpError.notFound("Tentative introuvable.");
            if (!"submitted".equals(current.status())) {
                throw HttpError.conflict("graded".equals(current.status()) ? "Cette tentative est déjà corrigée."
                        : "Cette tentative n’est pas encore remise.");
            }
            try (var update = connection.prepareStatement("""
                    update assessment.exam_attempts
                    set status = 'graded', graded_at = now(), grader_id = ?, grading = ?::jsonb, scores = ?::jsonb,
                        percent = ?, decision = ?, review = ?::jsonb, feedback = ?, updated_at = now()
                    where id = ?
                    """)) {
                update.setObject(1, graderId);
                update.setString(2, grading.toString());
                update.setString(3, ExamRules.scoresNode(json, result.scores()).toString());
                update.setInt(4, result.percent());
                update.setString(5, result.decision());
                update.setString(6, review.toString());
                update.setString(7, feedback);
                update.setObject(8, id);
                update.executeUpdate();
            }
            Attempt graded = find(connection, id, false);
            emit(connection, "assessment.attempt_graded", graded, true);
            return graded;
        });
    }

    /** Remise ou correction (DEV-073) : états, dates et résultats par compétence, sans les réponses ni les productions. */
    private void emit(Connection connection, String type, Attempt attempt, boolean pending) throws SQLException {
        var data = json.createObjectNode().put("attemptId", attempt.id().toString())
                .put("enrollmentId", attempt.enrollmentId().toString()).put("kind", attempt.kind())
                .put("number", attempt.number()).put("status", attempt.status())
                .put("submittedAt", attempt.submittedAt() == null ? null : attempt.submittedAt().toString())
                .put("dueAt", attempt.dueAt() == null ? null : attempt.dueAt().toString()).put("onTime", attempt.onTime());
        if (type.endsWith("_submitted")) {
            data.put("needsGrading", pending);
        } else {
            data.put("wasPending", pending).put("gradedAt", attempt.gradedAt() == null ? null : attempt.gradedAt().toString())
                    .put("decision", attempt.decision()).put("percent", attempt.percent());
            data.set("scores", attempt.scores());
        }
        Outbox.emit(connection, "assessment.outbox_events", type, "attempt", attempt.id().toString(), attempt.learnerId(),
                null, data);
    }

    private List<Attempt> list(String sql, UUID parameter) {
        return read("list attempts", connection -> {
            List<Attempt> attempts = new ArrayList<>();
            try (var query = connection.prepareStatement(sql)) {
                query.setObject(1, parameter);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) attempts.add(attempt(rows));
                }
            }
            return attempts;
        });
    }

    private Attempt find(Connection connection, UUID id, boolean lock) throws SQLException {
        try (var query = connection.prepareStatement("select * from assessment.exam_attempts where id = ?"
                + (lock ? " for update" : ""))) {
            query.setObject(1, id);
            try (var rows = query.executeQuery()) {
                return rows.next() ? attempt(rows) : null;
            }
        }
    }

    private Attempt attempt(ResultSet rows) throws SQLException {
        return new Attempt(rows.getObject("id", UUID.class), rows.getObject("learner_id", UUID.class),
                rows.getObject("enrollment_id", UUID.class), rows.getObject("track_version_id", UUID.class),
                rows.getString("kind"), rows.getInt("number"), rows.getString("status"), node(rows.getString("definition")),
                rows.getInt("pass_percent"), node(rows.getString("answers")), node(rows.getString("texts")),
                node(rows.getString("recordings")), rows.getObject("due_at", OffsetDateTime.class),
                rows.getObject("started_at", OffsetDateTime.class), rows.getObject("submitted_at", OffsetDateTime.class),
                rows.getString("submit_key"), rows.getObject("graded_at", OffsetDateTime.class),
                rows.getObject("grader_id", UUID.class), node(rows.getString("grading")), node(rows.getString("scores")),
                (Integer) rows.getObject("percent"), rows.getString("decision"), node(rows.getString("review")),
                rows.getString("feedback"), rows.getString("learning_acked"));
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
        return HttpError.unavailable("Les évaluations sont temporairement indisponibles.");
    }
}
