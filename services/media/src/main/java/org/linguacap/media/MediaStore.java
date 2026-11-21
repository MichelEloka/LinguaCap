package org.linguacap.media;

import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;

/** Médiathèque : ressources, versions de fichiers immuables, dépôts en cours et autorisations de lecture. */
@ApplicationScoped
class MediaStore {
    private static final Logger LOG = Logger.getLogger(MediaStore.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    static final int UPLOAD_MINUTES = 30;
    private static final int MAX_PENDING = 20;

    @Inject AgroalDataSource dataSource;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    public record Version(int version, String mimeType, Long sizeBytes, String status, String createdAt) {}

    public record AssetView(String id, String kind, String title, String mimeType, String alt, String transcript, String credit,
                     String source, String license, String status, String updatedAt, List<Version> versions) {}

    public record FileRow(String assetId, String kind, String title, int version, String mimeType, String bucket, String path,
                   String alt, String transcript, String credit, String status) {}

    public record Upload(UUID id, UUID actorId, String assetId, boolean replaces, String kind, String title, String mimeType,
                  long size, String bucket, String objectPath, String source, String license, String alt,
                  String transcript, String status, String reason, Integer version, OffsetDateTime createdAt,
                  OffsetDateTime expiresAt) {
        boolean expired() {
            return "pending".equals(status) && expiresAt.isBefore(OffsetDateTime.now());
        }
    }

    public record NewUpload(String assetId, String title, String mimeType, long size, String source, String license,
                     String alt, String transcript) {}

    public record Ref(String assetId, int version) {}

    List<AssetView> assets() {
        return read("list assets", connection -> {
            Map<String, AssetView> assets = new LinkedHashMap<>();
            try (var query = connection.prepareStatement("""
                    select id, kind, title, mime_type, alt, transcript, credit, source, license, status, updated_at
                    from media.assets order by title, id
                    """); var rows = query.executeQuery()) {
                while (rows.next()) assets.put(rows.getString("id"), asset(rows));
            }
            try (var query = connection.prepareStatement("""
                    select asset_id, version, mime_type, size_bytes, status, created_at
                    from media.asset_versions order by asset_id, version desc
                    """); var rows = query.executeQuery()) {
                while (rows.next()) {
                    AssetView asset = assets.get(rows.getString("asset_id"));
                    if (asset != null) asset.versions().add(version(rows));
                }
            }
            return List.copyOf(assets.values());
        });
    }

    /** Version précise, ou la plus récente ; les brouillons ne sont visibles que si includeDrafts. */
    FileRow file(String assetId, Integer version, boolean includeDrafts) {
        return read("read file", connection -> {
            try (var query = connection.prepareStatement("""
                    select v.asset_id, a.kind, a.title, v.version, v.mime_type, v.bucket, v.object_path, v.alt,
                           v.transcript, v.credit, v.status
                    from media.asset_versions v join media.assets a on a.id = v.asset_id
                    where v.asset_id = ? and (v.status = 'published' or ?) and (?::integer is null or v.version = ?)
                    order by v.version desc limit 1
                    """)) {
                query.setString(1, assetId);
                query.setBoolean(2, includeDrafts);
                query.setObject(3, version, java.sql.Types.INTEGER);
                query.setObject(4, version, java.sql.Types.INTEGER);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) return null;
                    return new FileRow(rows.getString("asset_id"), rows.getString("kind"), rows.getString("title"),
                            rows.getInt("version"), rows.getString("mime_type"), rows.getString("bucket"),
                            rows.getString("object_path"), rows.getString("alt"), rows.getString("transcript"),
                            rows.getString("credit"), rows.getString("status"));
                }
            }
        });
    }

    /** Autorisation de lecture de 60 secondes : le temps de signer l'adresse temporaire du fichier. */
    void grant(UUID actorId, FileRow file) {
        read("grant read", connection -> {
            try (var grant = connection.prepareStatement("""
                    insert into media.storage_read_grants (actor_id, bucket, object_path, expires_at)
                    values (?, ?, ?, now() + interval '60 seconds')
                    on conflict (actor_id, bucket, object_path) do update set expires_at = excluded.expires_at
                    """)) {
                grant.setObject(1, actorId);
                grant.setString(2, file.bucket());
                grant.setString(3, file.path());
                grant.executeUpdate();
            }
            return null;
        });
    }

    /** Titre, source, licence et textes par défaut ; les versions publiées gardent leurs textes figés. */
    AssetView update(String id, String title, String source, String license, String alt, String transcript) {
        return transaction("update asset", connection -> {
            try (var update = connection.prepareStatement("""
                    update media.assets set title = ?, source = ?, license = ?, alt = ?, transcript = ?, credit = ?,
                        updated_at = now()
                    where id = ?
                    """)) {
                update.setString(1, title);
                update.setString(2, source);
                update.setString(3, license);
                update.setString(4, alt);
                update.setString(5, transcript);
                update.setString(6, credit(source, license));
                update.setString(7, id);
                if (update.executeUpdate() == 0) throw HttpError.notFound("Média introuvable.");
            }
            try (var drafts = connection.prepareStatement("""
                    update media.asset_versions set alt = ?, transcript = ?, credit = ? where asset_id = ? and status = 'draft'
                    """)) {
                drafts.setString(1, alt);
                drafts.setString(2, transcript);
                drafts.setString(3, credit(source, license));
                drafts.setString(4, id);
                drafts.executeUpdate();
            }
            return assetById(connection, id);
        });
    }

    /** Réserve un chemin de dépôt pour l'auteur : nouvelle ressource, ou nouvelle version d'une ressource existante. */
    Upload reserve(UUID actorId, NewUpload request) {
        return transaction("reserve upload", connection -> {
            try (var count = connection.prepareStatement("""
                    select count(*) from media.uploads where actor_id = ? and status = 'pending' and expires_at > now()
                    """)) {
                count.setObject(1, actorId);
                try (var rows = count.executeQuery()) {
                    rows.next();
                    if (rows.getInt(1) >= MAX_PENDING) {
                        throw HttpError.conflict("Trop de dépôts en attente : finalisez ou attendez l’expiration des précédents.");
                    }
                }
            }
            String kind = MediaRules.kind(request.mimeType());
            String assetId = request.assetId();
            String title = request.title();
            boolean replaces = assetId != null;
            if (replaces) {
                try (var query = connection.prepareStatement("select kind, title from media.assets where id = ?")) {
                    query.setString(1, assetId);
                    try (var rows = query.executeQuery()) {
                        if (!rows.next()) throw HttpError.notFound("Média à remplacer introuvable.");
                        if (!kind.equals(rows.getString("kind"))) {
                            throw HttpError.badRequest("Remplacez une image par une image et un son par un son.");
                        }
                        if (title.isEmpty()) title = rows.getString("title");
                    }
                }
            } else {
                byte[] suffix = new byte[3];
                RANDOM.nextBytes(suffix);
                assetId = MediaRules.slug(title) + "-" + HexFormat.of().formatHex(suffix);
            }
            UUID id = UUID.randomUUID();
            try (var insert = connection.prepareStatement("""
                    insert into media.uploads (id, actor_id, asset_id, replaces, kind, title, declared_mime, declared_size,
                        bucket, object_path, source, license, alt, transcript, expires_at)
                    values (?, ?, ?, ?, ?, ?, ?, ?, 'linguacap-course', ?, ?, ?, ?, ?, now() + make_interval(mins => ?))
                    """)) {
                insert.setObject(1, id);
                insert.setObject(2, actorId);
                insert.setString(3, assetId);
                insert.setBoolean(4, replaces);
                insert.setString(5, kind);
                insert.setString(6, title);
                insert.setString(7, request.mimeType());
                insert.setLong(8, request.size());
                insert.setString(9, assetId + "/" + id + "." + MediaRules.extension(request.mimeType()));
                insert.setString(10, request.source());
                insert.setString(11, request.license());
                insert.setString(12, request.alt());
                insert.setString(13, request.transcript());
                insert.setInt(14, UPLOAD_MINUTES);
                insert.executeUpdate();
            }
            return upload(connection, id);
        });
    }

    Upload upload(UUID id) {
        return read("read upload", connection -> upload(connection, id));
    }

    List<Upload> uploads(UUID actorId) {
        return read("list uploads", connection -> {
            List<Upload> uploads = new ArrayList<>();
            try (var query = connection.prepareStatement(
                    "select * from media.uploads where actor_id = ? order by created_at desc limit 20")) {
                query.setObject(1, actorId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) uploads.add(upload(rows));
                }
            }
            return uploads;
        });
    }

    /** Clôt un dépôt en attente : refusé (fichier non conforme) ou abandonné (non finalisé à temps). */
    Upload close(UUID id, String status, String reason) {
        return transaction("close upload", connection -> {
            try (var update = connection.prepareStatement("""
                    update media.uploads set status = ?, reason = ?, finalized_at = now() where id = ? and status = 'pending'
                    """)) {
                update.setString(1, status);
                update.setString(2, reason);
                update.setObject(3, id);
                update.executeUpdate();
            }
            return upload(connection, id);
        });
    }

    /** Fichier conforme : nouvelle version brouillon de la ressource, l'ancienne version reste intacte (DEV-058). */
    Upload accept(UUID id, long size) {
        return transaction("accept upload", connection -> {
            Upload upload;
            try (var lock = connection.prepareStatement("select * from media.uploads where id = ? for update")) {
                lock.setObject(1, id);
                try (var rows = lock.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Dépôt introuvable.");
                    upload = upload(rows);
                }
            }
            if (!"pending".equals(upload.status())) return upload;
            String credit = credit(upload.source(), upload.license());
            if (upload.replaces()) {
                try (var lock = connection.prepareStatement("select 1 from media.assets where id = ? for update")) {
                    lock.setString(1, upload.assetId());
                    try (var rows = lock.executeQuery()) {
                        if (!rows.next()) throw HttpError.notFound("Média à remplacer introuvable.");
                    }
                }
            } else {
                try (var insert = connection.prepareStatement("""
                        insert into media.assets (id, kind, title, mime_type, bucket, object_path, alt, transcript, credit,
                            status, source, license, created_by)
                        values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
                        """)) {
                    insert.setString(1, upload.assetId());
                    insert.setString(2, upload.kind());
                    insert.setString(3, upload.title());
                    insert.setString(4, upload.mimeType());
                    insert.setString(5, upload.bucket());
                    insert.setString(6, upload.objectPath());
                    insert.setString(7, upload.alt());
                    insert.setString(8, upload.transcript());
                    insert.setString(9, credit);
                    insert.setString(10, upload.source());
                    insert.setString(11, upload.license());
                    insert.setObject(12, upload.actorId());
                    insert.executeUpdate();
                }
            }
            int version;
            try (var next = connection.prepareStatement(
                    "select coalesce(max(version), 0) + 1 from media.asset_versions where asset_id = ?")) {
                next.setString(1, upload.assetId());
                try (var rows = next.executeQuery()) {
                    rows.next();
                    version = rows.getInt(1);
                }
            }
            try (var insert = connection.prepareStatement("""
                    insert into media.asset_versions (asset_id, version, bucket, object_path, mime_type, size_bytes, alt,
                        transcript, credit, status)
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
                    """)) {
                insert.setString(1, upload.assetId());
                insert.setInt(2, version);
                insert.setString(3, upload.bucket());
                insert.setString(4, upload.objectPath());
                insert.setString(5, upload.mimeType());
                insert.setLong(6, size);
                insert.setString(7, upload.alt());
                insert.setString(8, upload.transcript());
                insert.setString(9, credit);
                insert.executeUpdate();
            }
            try (var update = connection.prepareStatement("""
                    update media.assets set title = ?, mime_type = ?, object_path = ?, alt = ?, transcript = ?, credit = ?,
                        source = ?, license = ?, updated_at = now()
                    where id = ?
                    """)) {
                update.setString(1, upload.title());
                update.setString(2, upload.mimeType());
                update.setString(3, upload.objectPath());
                update.setString(4, upload.alt());
                update.setString(5, upload.transcript());
                update.setString(6, credit);
                update.setString(7, upload.source());
                update.setString(8, upload.license());
                update.setString(9, upload.assetId());
                update.executeUpdate();
            }
            try (var update = connection.prepareStatement("""
                    update media.uploads set status = 'available', version = ?, finalized_at = now() where id = ?
                    """)) {
                update.setInt(1, version);
                update.setObject(2, id);
                update.executeUpdate();
            }
            return upload(connection, id);
        });
    }

    /** Publie les versions référencées par un parcours publié : elles deviennent lisibles par ses élèves. */
    void publish(List<Ref> refs) {
        if (refs.isEmpty()) return;
        // Deux requêtes pour toute la liste (et non deux par fichier) : un parcours complet référence plus de 200 fichiers
        // et la publication doit tenir dans le délai des appels entre services.
        String[] assetIds = refs.stream().map(Ref::assetId).toArray(String[]::new);
        Integer[] versions = refs.stream().map(Ref::version).toArray(Integer[]::new);
        transaction("publish versions", connection -> {
            Set<String> published = new HashSet<>();
            try (var update = connection.prepareStatement("""
                    update media.asset_versions v set status = 'published'
                    from unnest(?::text[], ?::integer[]) as ref(asset_id, version)
                    where v.asset_id = ref.asset_id and v.version = ref.version and v.status in ('draft', 'published')
                    returning v.asset_id, v.version
                    """)) {
                update.setArray(1, connection.createArrayOf("text", assetIds));
                update.setArray(2, connection.createArrayOf("integer", versions));
                try (var rows = update.executeQuery()) {
                    while (rows.next()) published.add(rows.getString(1) + "#" + rows.getInt(2));
                }
            }
            for (Ref ref : refs) {
                if (!published.contains(ref.assetId() + "#" + ref.version())) {
                    throw HttpError.notFound("Le média " + ref.assetId() + " (version " + ref.version()
                            + ") est introuvable : choisissez une version disponible dans la médiathèque.");
                }
            }
            try (var update = connection.prepareStatement(
                    "update media.assets set status = 'published' where id = any(?::text[]) and status <> 'published'")) {
                update.setArray(1, connection.createArrayOf("text", assetIds));
                update.executeUpdate();
            }
            return null;
        });
    }

    private AssetView assetById(Connection connection, String id) throws SQLException {
        AssetView asset;
        try (var query = connection.prepareStatement("""
                select id, kind, title, mime_type, alt, transcript, credit, source, license, status, updated_at
                from media.assets where id = ?
                """)) {
            query.setString(1, id);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) throw HttpError.notFound("Média introuvable.");
                asset = asset(rows);
            }
        }
        try (var query = connection.prepareStatement("""
                select version, mime_type, size_bytes, status, created_at from media.asset_versions
                where asset_id = ? order by version desc
                """)) {
            query.setString(1, id);
            try (var rows = query.executeQuery()) {
                while (rows.next()) asset.versions().add(version(rows));
            }
        }
        return asset;
    }

    private static Upload upload(Connection connection, UUID id) throws SQLException {
        try (var query = connection.prepareStatement("select * from media.uploads where id = ?")) {
            query.setObject(1, id);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) throw HttpError.notFound("Dépôt introuvable.");
                return upload(rows);
            }
        }
    }

    private static Upload upload(ResultSet rows) throws SQLException {
        return new Upload(rows.getObject("id", UUID.class), rows.getObject("actor_id", UUID.class),
                rows.getString("asset_id"), rows.getBoolean("replaces"), rows.getString("kind"), rows.getString("title"),
                rows.getString("declared_mime"), rows.getLong("declared_size"), rows.getString("bucket"),
                rows.getString("object_path"), rows.getString("source"), rows.getString("license"), rows.getString("alt"),
                rows.getString("transcript"), rows.getString("status"), rows.getString("reason"),
                (Integer) rows.getObject("version"), rows.getObject("created_at", OffsetDateTime.class),
                rows.getObject("expires_at", OffsetDateTime.class));
    }

    private static AssetView asset(ResultSet rows) throws SQLException {
        OffsetDateTime updated = rows.getObject("updated_at", OffsetDateTime.class);
        return new AssetView(rows.getString("id"), rows.getString("kind"), rows.getString("title"),
                rows.getString("mime_type"), rows.getString("alt"), rows.getString("transcript"), rows.getString("credit"),
                rows.getString("source"), rows.getString("license"), rows.getString("status"),
                updated == null ? null : updated.toString(), new ArrayList<>());
    }

    private static Version version(ResultSet rows) throws SQLException {
        OffsetDateTime created = rows.getObject("created_at", OffsetDateTime.class);
        return new Version(rows.getInt("version"), rows.getString("mime_type"), (Long) rows.getObject("size_bytes"),
                rows.getString("status"), created == null ? null : created.toString());
    }

    static String credit(String source, String license) {
        String left = source == null ? "" : source.strip();
        String right = license == null ? "" : license.strip();
        if (left.isEmpty()) return right.isEmpty() ? null : right;
        return right.isEmpty() ? left : left + " · " + right;
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
        LOG.errorf("Media database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        if ("23505".equals(error.getSQLState())) return HttpError.conflict("Ce média existe déjà : réessayez.");
        return HttpError.unavailable("La médiathèque est temporairement indisponible.");
    }
}
