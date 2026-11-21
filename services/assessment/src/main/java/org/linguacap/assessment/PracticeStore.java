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

/**
 * Examens d'entraînement en accès libre : définition figée, réponses en cours, remise rejouable et score des parties
 * fermées. Table séparée des examens du parcours : aucun événement, aucune file de correction.
 */
@ApplicationScoped
class PracticeStore {
    private static final Logger LOG = Logger.getLogger(PracticeStore.class);

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    public record Attempt(UUID id, UUID learnerId, UUID trackVersionId, String levelCode, String kind, JsonNode definition,
                          String status, JsonNode answers, String submitKey, JsonNode scores, Integer percent,
                          OffsetDateTime startedAt, OffsetDateTime submittedAt) {}

    /** created : faux quand une tentative déjà ouverte est reprise. */
    record Opened(Attempt attempt, boolean created) {}

    Attempt find(UUID id) {
        return read("read practice", connection -> {
            Attempt attempt = find(connection, id, false);
            if (attempt == null) throw HttpError.notFound("Entraînement introuvable.");
            return attempt;
        });
    }

    /** Entraînements d'un élève, les plus récents d'abord. */
    List<Attempt> forLearner(UUID learnerId) {
        return read("list practice", connection -> {
            List<Attempt> attempts = new ArrayList<>();
            try (var query = connection.prepareStatement("""
                    select * from assessment.practice_attempts where learner_id = ? order by started_at desc limit 100
                    """)) {
                query.setObject(1, learnerId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) attempts.add(attempt(rows));
                }
            }
            return attempts;
        });
    }

    /** Tentative en cours pour cette version et ce type, ou null. */
    Attempt open(UUID learnerId, UUID trackVersionId, String kind) {
        return read("read open practice", connection -> open(connection, learnerId, trackVersionId, kind));
    }

    /** Date de la dernière remise pour cette version et ce type, ou null. */
    OffsetDateTime lastSubmitted(UUID learnerId, UUID trackVersionId, String kind) {
        return read("read last practice", connection -> lastSubmitted(connection, learnerId, trackVersionId, kind));
    }

    /** Ouvre une tentative ; une tentative ouverte entre-temps est reprise, le délai de 12 h est revérifié sous verrou. */
    Opened create(UUID learnerId, UUID trackVersionId, String levelCode, String kind, JsonNode definition) {
        return transaction("open practice", connection -> {
            try (var lock = connection.prepareStatement("select pg_advisory_xact_lock(hashtextextended(?, 0))")) {
                lock.setString(1, "practice:" + learnerId + ":" + trackVersionId + ":" + kind);
                lock.executeQuery().close();
            }
            Attempt current = open(connection, learnerId, trackVersionId, kind);
            if (current != null) return new Opened(current, false);
            String refusal = PracticeRules.retryRefusal(lastSubmitted(connection, learnerId, trackVersionId, kind),
                    OffsetDateTime.now());
            if (refusal != null) throw HttpError.conflict(refusal);
            UUID id = UUID.randomUUID();
            try (var insert = connection.prepareStatement("""
                    insert into assessment.practice_attempts (id, learner_id, track_version_id, level_code, kind, definition)
                    values (?, ?, ?, ?, ?, ?::jsonb)
                    """)) {
                insert.setObject(1, id);
                insert.setObject(2, learnerId);
                insert.setObject(3, trackVersionId);
                insert.setString(4, levelCode);
                insert.setString(5, kind);
                insert.setString(6, definition.toString());
                insert.executeUpdate();
            }
            return new Opened(find(connection, id, false), true);
        });
    }

    Attempt save(UUID id, UUID learnerId, JsonNode answers) {
        return transaction("save practice", connection -> {
            Attempt attempt = owned(connection, id, learnerId);
            if (!"in_progress".equals(attempt.status())) throw HttpError.conflict("Cet entraînement est déjà remis.");
            ExamRules.checkProgress(attempt.definition(), answers, null);
            try (var update = connection.prepareStatement("""
                    update assessment.practice_attempts set answers = ?::jsonb, updated_at = now() where id = ?
                    """)) {
                update.setString(1, answers.toString());
                update.setObject(2, id);
                update.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    /** Remise et score des parties fermées dans la même transaction ; une tentative déjà remise est renvoyée telle quelle. */
    Attempt submit(UUID id, UUID learnerId, String key) {
        return transaction("submit practice", connection -> {
            Attempt attempt = owned(connection, id, learnerId);
            if (!"in_progress".equals(attempt.status())) return attempt;
            PracticeRules.Scored scored = PracticeRules.score(attempt.definition(), attempt.answers());
            try (var update = connection.prepareStatement("""
                    update assessment.practice_attempts
                    set status = 'submitted', submit_key = ?, scores = ?::jsonb, percent = ?, submitted_at = now(),
                        updated_at = now()
                    where id = ?
                    """)) {
                update.setString(1, key);
                update.setString(2, PracticeRules.scoresNode(json, scored).toString());
                update.setInt(3, scored.percent());
                update.setObject(4, id);
                update.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    private Attempt owned(Connection connection, UUID id, UUID learnerId) throws SQLException {
        Attempt attempt = find(connection, id, true);
        if (attempt == null || !learnerId.equals(attempt.learnerId())) throw HttpError.notFound("Entraînement introuvable.");
        return attempt;
    }

    private Attempt open(Connection connection, UUID learnerId, UUID trackVersionId, String kind) throws SQLException {
        try (var query = connection.prepareStatement("""
                select * from assessment.practice_attempts
                where learner_id = ? and track_version_id = ? and kind = ? and status = 'in_progress'
                """)) {
            query.setObject(1, learnerId);
            query.setObject(2, trackVersionId);
            query.setString(3, kind);
            try (var rows = query.executeQuery()) {
                return rows.next() ? attempt(rows) : null;
            }
        }
    }

    private static OffsetDateTime lastSubmitted(Connection connection, UUID learnerId, UUID trackVersionId, String kind)
            throws SQLException {
        try (var query = connection.prepareStatement("""
                select max(submitted_at) from assessment.practice_attempts
                where learner_id = ? and track_version_id = ? and kind = ? and status = 'submitted'
                """)) {
            query.setObject(1, learnerId);
            query.setObject(2, trackVersionId);
            query.setString(3, kind);
            try (var rows = query.executeQuery()) {
                return rows.next() ? rows.getObject(1, OffsetDateTime.class) : null;
            }
        }
    }

    private Attempt find(Connection connection, UUID id, boolean lock) throws SQLException {
        try (var query = connection.prepareStatement("select * from assessment.practice_attempts where id = ?"
                + (lock ? " for update" : ""))) {
            query.setObject(1, id);
            try (var rows = query.executeQuery()) {
                return rows.next() ? attempt(rows) : null;
            }
        }
    }

    private Attempt attempt(ResultSet rows) throws SQLException {
        return new Attempt(rows.getObject("id", UUID.class), rows.getObject("learner_id", UUID.class),
                rows.getObject("track_version_id", UUID.class), rows.getString("level_code"), rows.getString("kind"),
                node(rows.getString("definition")), rows.getString("status"), node(rows.getString("answers")),
                rows.getString("submit_key"), node(rows.getString("scores")), (Integer) rows.getObject("percent"),
                rows.getObject("started_at", OffsetDateTime.class), rows.getObject("submitted_at", OffsetDateTime.class));
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
        return HttpError.unavailable("Les entraînements sont temporairement indisponibles.");
    }
}
