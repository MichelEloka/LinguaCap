package org.linguacap.assessment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.linguacap.common.HttpError;

/**
 * Tentatives du test de niveau : tirage figé, réponses enregistrées par palier, remises rejouables par clé, niveau
 * placé. Une seule tentative ouverte par élève et par langue ; aucune n'émet d'événement.
 */
@ApplicationScoped
class PlacementStore {
    private static final Logger LOG = Logger.getLogger(PlacementStore.class);

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    public record Attempt(UUID id, UUID learnerId, String languageId, UUID testId, Integer testNumber, String status,
                          JsonNode definition, String currentTier, JsonNode savedAnswers, JsonNode answers,
                          JsonNode tierResults, JsonNode submitKeys, boolean declaredBeginner, String placedLevel,
                          OffsetDateTime startedAt, OffsetDateTime completedAt) {}

    /** created : faux quand une tentative déjà ouverte est reprise. */
    record Opened(Attempt attempt, boolean created) {}

    Attempt find(UUID id) {
        return read("read placement", connection -> {
            Attempt attempt = find(connection, id, false);
            if (attempt == null) throw HttpError.notFound("Test de niveau introuvable.");
            return attempt;
        });
    }

    /** Tentatives d'un élève, les plus récentes d'abord. */
    List<Attempt> forLearner(UUID learnerId) {
        return read("list placements", connection -> {
            List<Attempt> attempts = new ArrayList<>();
            try (var query = connection.prepareStatement("""
                    select * from assessment.placement_attempts where learner_id = ? order by started_at desc limit 50
                    """)) {
                query.setObject(1, learnerId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) attempts.add(attempt(rows));
                }
            }
            return attempts;
        });
    }

    /** Tentative en cours de l'élève pour cette langue, ou null. */
    Attempt open(UUID learnerId, String languageId) {
        return read("read open placement", connection -> open(connection, learnerId, languageId));
    }

    /** Fin du dernier test réellement passé (questions vues) dans cette langue, ou null. */
    OffsetDateTime lastTested(UUID learnerId, String languageId) {
        return read("read last placement", connection -> lastTested(connection, learnerId, languageId));
    }

    /**
     * Ouvre une tentative avec le tirage donné. Une tentative déjà ouverte est reprise, sauf demande de recommencer :
     * elle est alors abandonnée. Le délai de 24 h est revérifié sous verrou.
     */
    Opened start(UUID learnerId, String languageId, UUID testId, int testNumber, JsonNode definition, boolean restart) {
        String firstTier = PlacementRules.firstTier(definition);
        if (firstTier == null) throw HttpError.conflict("Le test de niveau n’est pas encore disponible pour cette langue.");
        return transaction("start placement", connection -> {
            lock(connection, learnerId, languageId);
            Attempt current = open(connection, learnerId, languageId);
            if (current != null && !restart) return new Opened(current, false);
            String refusal = PlacementRules.retakeRefusal(lastTested(connection, learnerId, languageId), OffsetDateTime.now());
            if (refusal != null) throw HttpError.conflict(refusal);
            if (current != null) abandon(connection, current.id());
            UUID id = UUID.randomUUID();
            try (var insert = connection.prepareStatement("""
                    insert into assessment.placement_attempts (id, learner_id, language_id, test_id, test_number,
                        definition, current_tier)
                    values (?, ?, ?, ?, ?, ?::jsonb, ?)
                    """)) {
                insert.setObject(1, id);
                insert.setObject(2, learnerId);
                insert.setString(3, languageId);
                insert.setObject(4, testId);
                insert.setInt(5, testNumber);
                insert.setString(6, definition.toString());
                insert.setString(7, firstTier);
                insert.executeUpdate();
            }
            return new Opened(find(connection, id, false), true);
        });
    }

    /** « Je n'ai jamais étudié cette langue » : tentative terminée d'office au niveau A0 ; une tentative ouverte est abandonnée. */
    Attempt declareBeginner(UUID learnerId, String languageId) {
        return transaction("declare beginner", connection -> {
            lock(connection, learnerId, languageId);
            Attempt current = open(connection, learnerId, languageId);
            if (current != null) abandon(connection, current.id());
            UUID id = UUID.randomUUID();
            try (var insert = connection.prepareStatement("""
                    insert into assessment.placement_attempts (id, learner_id, language_id, status, declared_beginner,
                        placed_level, completed_at)
                    values (?, ?, ?, 'completed', true, 'A0', now())
                    """)) {
                insert.setObject(1, id);
                insert.setObject(2, learnerId);
                insert.setString(3, languageId);
                insert.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    /** Réponses en cours du palier ouvert : la tentative reprend là où l'élève l'a laissée. */
    Attempt save(UUID id, UUID learnerId, String tier, JsonNode answers) {
        return transaction("save placement", connection -> {
            Attempt attempt = owned(connection, id, learnerId);
            PlacementRules.checkAnswers(PlacementRules.openTier(attempt, tier), answers, false);
            ObjectNode saved = attempt.savedAnswers().isObject() ? ((ObjectNode) attempt.savedAnswers()).deepCopy()
                    : json.createObjectNode();
            saved.set(tier, answers.deepCopy());
            try (var update = connection.prepareStatement("""
                    update assessment.placement_attempts set saved_answers = ?::jsonb, updated_at = now() where id = ?
                    """)) {
                update.setString(1, saved.toString());
                update.setObject(2, id);
                update.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    /**
     * Remise d'un palier. Rejouer la même remise avec la même clé renvoie l'état courant sans rien recompter ; une
     * clé déjà utilisée pour d'autres réponses est refusée.
     */
    Attempt submit(UUID id, UUID learnerId, String key, String tier, JsonNode answers) {
        return transaction("submit placement", connection -> {
            Attempt attempt = owned(connection, id, learnerId);
            if (PlacementRules.replayed(attempt.submitKeys(), key, tier, answers)) return attempt;
            PlacementRules.Transition next = PlacementRules.submit(json, attempt, key, tier, answers);
            try (var update = connection.prepareStatement("""
                    update assessment.placement_attempts
                    set answers = ?::jsonb, tier_results = ?::jsonb, submit_keys = ?::jsonb, saved_answers = ?::jsonb,
                        current_tier = ?, status = ?, placed_level = ?, completed_at = case when ? then now() end,
                        updated_at = now()
                    where id = ?
                    """)) {
                update.setString(1, next.answers().toString());
                update.setString(2, next.tierResults().toString());
                update.setString(3, next.submitKeys().toString());
                update.setString(4, next.savedAnswers().toString());
                update.setString(5, next.currentTier());
                update.setString(6, next.status());
                update.setString(7, next.placedLevel());
                update.setBoolean(8, next.completed());
                update.setObject(9, id);
                update.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    private Attempt owned(Connection connection, UUID id, UUID learnerId) throws SQLException {
        Attempt attempt = find(connection, id, true);
        if (attempt == null || !learnerId.equals(attempt.learnerId())) throw HttpError.notFound("Test de niveau introuvable.");
        return attempt;
    }

    private static void lock(Connection connection, UUID learnerId, String languageId) throws SQLException {
        try (var lock = connection.prepareStatement("select pg_advisory_xact_lock(hashtextextended(?, 0))")) {
            lock.setString(1, "placement:" + learnerId + ":" + languageId);
            lock.executeQuery().close();
        }
    }

    private static void abandon(Connection connection, UUID id) throws SQLException {
        try (var update = connection.prepareStatement("""
                update assessment.placement_attempts set status = 'abandoned', current_tier = null, updated_at = now()
                where id = ? and status = 'in_progress'
                """)) {
            update.setObject(1, id);
            update.executeUpdate();
        }
    }

    private Attempt open(Connection connection, UUID learnerId, String languageId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select * from assessment.placement_attempts
                where learner_id = ? and language_id = ? and status = 'in_progress'
                """)) {
            query.setObject(1, learnerId);
            query.setString(2, languageId);
            try (var rows = query.executeQuery()) {
                return rows.next() ? attempt(rows) : null;
            }
        }
    }

    private static OffsetDateTime lastTested(Connection connection, UUID learnerId, String languageId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select max(completed_at) from assessment.placement_attempts
                where learner_id = ? and language_id = ? and status = 'completed' and not declared_beginner
                """)) {
            query.setObject(1, learnerId);
            query.setString(2, languageId);
            try (var rows = query.executeQuery()) {
                return rows.next() ? rows.getObject(1, OffsetDateTime.class) : null;
            }
        }
    }

    private Attempt find(Connection connection, UUID id, boolean lock) throws SQLException {
        try (var query = connection.prepareStatement("select * from assessment.placement_attempts where id = ?"
                + (lock ? " for update" : ""))) {
            query.setObject(1, id);
            try (var rows = query.executeQuery()) {
                return rows.next() ? attempt(rows) : null;
            }
        }
    }

    private Attempt attempt(ResultSet rows) throws SQLException {
        return new Attempt(rows.getObject("id", UUID.class), rows.getObject("learner_id", UUID.class),
                rows.getString("language_id"), rows.getObject("test_id", UUID.class), (Integer) rows.getObject("test_number"),
                rows.getString("status"), node(rows.getString("definition")), rows.getString("current_tier"),
                node(rows.getString("saved_answers")), node(rows.getString("answers")), node(rows.getString("tier_results")),
                node(rows.getString("submit_keys")), rows.getBoolean("declared_beginner"), rows.getString("placed_level"),
                rows.getObject("started_at", OffsetDateTime.class), rows.getObject("completed_at", OffsetDateTime.class));
    }

    private JsonNode node(String value) throws SQLException {
        if (value == null) return json.createObjectNode();
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
        return HttpError.unavailable("Le test de niveau est temporairement indisponible.");
    }
}
