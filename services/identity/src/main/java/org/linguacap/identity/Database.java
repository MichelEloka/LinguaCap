package org.linguacap.identity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Map;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;

/** Connexions, transactions et table de sortie des événements du schéma identity. */
@ApplicationScoped
class Database {
    private static final Logger LOG = Logger.getLogger(Database.class);

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    <T> T read(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            return work.run(connection);
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    /** Exécute le travail dans une transaction : tout est enregistré, ou rien. */
    <T> T transaction(String operation, Work<T> work) {
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

    /** Transmet l'auteur d'une modification au déclencheur d'historique, pour la transaction en cours. */
    void setActor(Connection connection, UUID actorId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("select set_config('linguacap.actor_id', ?, true)")) {
            statement.setString(1, actorId == null ? "" : actorId.toString());
            statement.execute();
        }
    }

    /** Enregistre un événement métier dans la même transaction que l'action. */
    void record(Connection connection, String type, String subjectKind, Object subjectId, UUID learnerId,
                String requestId, Map<String, ?> data) throws SQLException {
        String payload;
        try {
            payload = json.writeValueAsString(data);
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("Événement non sérialisable", error);
        }
        try (PreparedStatement statement = connection.prepareStatement("""
                insert into identity.outbox_events (id, type, subject_kind, subject_id, learner_id, request_id, data)
                values (?, ?, ?, ?, ?, ?, ?::jsonb)
                """)) {
            statement.setObject(1, UUID.randomUUID());
            statement.setString(2, type);
            statement.setString(3, subjectKind);
            statement.setString(4, String.valueOf(subjectId));
            statement.setObject(5, learnerId);
            statement.setString(6, requestId == null || requestId.isEmpty() ? null : requestId);
            statement.setString(7, payload);
            statement.executeUpdate();
        }
    }

    RuntimeException failure(String operation, SQLException error) {
        LOG.errorf("Identity database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        return HttpError.unavailable("Le service d’identité est temporairement indisponible.");
    }
}
