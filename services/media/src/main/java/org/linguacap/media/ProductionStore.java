package org.linguacap.media;

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

/** Productions orales privées des élèves : dépôts réservés, fichiers contrôlés et autorisations de lecture. */
@ApplicationScoped
class ProductionStore {
    private static final Logger LOG = Logger.getLogger(ProductionStore.class);
    static final String BUCKET = "linguacap-productions";
    static final int UPLOAD_MINUTES = 30;
    private static final int MAX_PENDING = 10;

    @Inject AgroalDataSource dataSource;

    public record Production(UUID id, UUID ownerId, UUID attemptId, String partId, String objectPath, String mimeType,
                             long declaredSize, Long sizeBytes, String status, String reason, OffsetDateTime expiresAt) {
        boolean expired() {
            return "pending".equals(status) && expiresAt.isBefore(OffsetDateTime.now());
        }
    }

    Production reserve(UUID ownerId, UUID attemptId, String partId, String mimeType, long size) {
        try (Connection connection = dataSource.getConnection()) {
            try (var count = connection.prepareStatement(
                    "select count(*) from media.productions where owner_id = ? and status = 'pending' and expires_at > now()")) {
                count.setObject(1, ownerId);
                try (var rows = count.executeQuery()) {
                    rows.next();
                    if (rows.getInt(1) >= MAX_PENDING) {
                        throw HttpError.conflict("Trop d’envois en attente : terminez ou attendez l’expiration des précédents.");
                    }
                }
            }
            UUID id = UUID.randomUUID();
            try (var insert = connection.prepareStatement("""
                    insert into media.productions (id, owner_id, attempt_id, part_id, bucket, object_path, declared_mime,
                        declared_size, expires_at)
                    values (?, ?, ?, ?, ?, ?, ?, ?, now() + make_interval(mins => ?))
                    """)) {
                insert.setObject(1, id);
                insert.setObject(2, ownerId);
                insert.setObject(3, attemptId);
                insert.setString(4, partId);
                insert.setString(5, BUCKET);
                insert.setString(6, ownerId + "/" + attemptId + "/" + id + "." + MediaRules.productionExtension(mimeType));
                insert.setString(7, mimeType);
                insert.setLong(8, size);
                insert.setInt(9, UPLOAD_MINUTES);
                insert.executeUpdate();
            }
            return find(connection, id);
        } catch (SQLException error) {
            throw failure("reserve production", error);
        }
    }

    Production find(UUID id) {
        try (Connection connection = dataSource.getConnection()) {
            return find(connection, id);
        } catch (SQLException error) {
            throw failure("read production", error);
        }
    }

    Production close(UUID id, String status, String reason, Long size) {
        try (Connection connection = dataSource.getConnection();
             var update = connection.prepareStatement("""
                     update media.productions set status = ?, reason = ?, size_bytes = ?, finalized_at = now()
                     where id = ? and status = 'pending'
                     """)) {
            update.setString(1, status);
            update.setString(2, reason);
            update.setObject(3, size);
            update.setObject(4, id);
            update.executeUpdate();
            return find(connection, id);
        } catch (SQLException error) {
            throw failure("close production", error);
        }
    }

    /** Productions disponibles parmi les identifiants demandés. */
    List<Production> available(List<UUID> ids) {
        try (Connection connection = dataSource.getConnection();
             var query = connection.prepareStatement(
                     "select * from media.productions where id = any(?) and status = 'available' order by created_at")) {
            query.setArray(1, connection.createArrayOf("uuid", ids.toArray()));
            List<Production> productions = new ArrayList<>();
            try (var rows = query.executeQuery()) {
                while (rows.next()) productions.add(read(rows));
            }
            return productions;
        } catch (SQLException error) {
            throw failure("list productions", error);
        }
    }

    void grant(UUID actorId, Production production) {
        try (Connection connection = dataSource.getConnection();
             var grant = connection.prepareStatement("""
                     insert into media.production_read_grants (actor_id, object_path, expires_at)
                     values (?, ?, now() + interval '60 seconds')
                     on conflict (actor_id, object_path) do update set expires_at = excluded.expires_at
                     """)) {
            grant.setObject(1, actorId);
            grant.setString(2, production.objectPath());
            grant.executeUpdate();
        } catch (SQLException error) {
            throw failure("grant production", error);
        }
    }

    private static Production find(Connection connection, UUID id) throws SQLException {
        try (var query = connection.prepareStatement("select * from media.productions where id = ?")) {
            query.setObject(1, id);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) throw HttpError.notFound("Enregistrement introuvable.");
                return read(rows);
            }
        }
    }

    private static Production read(ResultSet rows) throws SQLException {
        return new Production(rows.getObject("id", UUID.class), rows.getObject("owner_id", UUID.class),
                rows.getObject("attempt_id", UUID.class), rows.getString("part_id"), rows.getString("object_path"),
                rows.getString("declared_mime"), rows.getLong("declared_size"), (Long) rows.getObject("size_bytes"),
                rows.getString("status"), rows.getString("reason"), rows.getObject("expires_at", OffsetDateTime.class));
    }

    private static RuntimeException failure(String operation, SQLException error) {
        LOG.errorf("Media database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        return HttpError.unavailable("L’espace des productions est temporairement indisponible.");
    }
}
