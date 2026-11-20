package org.linguacap.media;

import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.Permissions;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Path("/v1/media")
@Produces(MediaType.APPLICATION_JSON)
public class MediaResource {
    private static final String ASSET_COLUMNS =
            "id, kind, title, mime_type, bucket, object_path, alt, transcript, credit, status";

    @Inject
    AgroalDataSource dataSource;

    @Inject
    Actor actor;

    @Inject
    IdentityClient identities;

    @Inject
    StorageSigner storage;

    @GET
    public List<MediaMetadata> media() {
        if (!isAdmin(actor.id())) {
            throw HttpError.forbidden("La médiathèque requiert la permission Catalogue.");
        }
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement("select " + ASSET_COLUMNS + " from media.assets order by title");
             var rows = query.executeQuery()) {
            var assets = new ArrayList<MediaMetadata>();
            while (rows.next()) {
                assets.add(readMetadata(rows));
            }
            return assets;
        } catch (SQLException error) {
            throw HttpError.unavailable("La médiathèque est temporairement indisponible.");
        }
    }

    /** Dernière version publiée (ou dernière version pour un éditeur du catalogue). */
    @GET
    @Path("/{id}")
    public Response media(@PathParam("id") String id) {
        return read(id, null);
    }

    /** Version précise référencée par un parcours : un élève inscrit retrouve le fichier de sa version. */
    @GET
    @Path("/{id}/versions/{version}")
    public Response mediaVersion(@PathParam("id") String id, @PathParam("version") int version) {
        if (version < 1 || version > 9999) {
            throw HttpError.badRequest("Version de média invalide.");
        }
        return read(id, version);
    }

    private Response read(String id, Integer version) {
        if (!id.matches("[a-z0-9-]{1,64}")) {
            throw HttpError.badRequest("Identifiant de média invalide.");
        }
        UUID actorId = actor.id();
        Asset asset = authorizeRead(id, version, actorId, isAdmin(actorId));
        String signedUrl = storage.sign(asset.bucket(), asset.path(), actor.token());

        var detail = new MediaDetail(asset.metadata().id(), asset.metadata().kind(), asset.metadata().title(),
                asset.metadata().mimeType(), signedUrl, asset.metadata().alt(), asset.metadata().transcript(),
                asset.metadata().credit(), asset.version());
        return Response.ok(detail).header("Cache-Control", "private, no-store").build();
    }

    private Asset authorizeRead(String id, Integer version, UUID actorId, boolean editor) {
        String sql = """
                select v.asset_id as id, a.kind, a.title, v.mime_type, v.bucket, v.object_path, v.alt, v.transcript,
                       v.credit, v.status, v.version
                from media.asset_versions v
                join media.assets a on a.id = v.asset_id
                where v.asset_id = ? and (v.status = 'published' or ?) and (? is null or v.version = ?)
                order by v.version desc
                limit 1
                """;
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement(sql)) {
            query.setString(1, id);
            query.setBoolean(2, editor);
            query.setObject(3, version, java.sql.Types.INTEGER);
            query.setObject(4, version, java.sql.Types.INTEGER);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) {
                    throw HttpError.notFound("Média introuvable.");
                }
                Asset asset = new Asset(rows.getString("bucket"), rows.getString("object_path"), rows.getInt("version"),
                        new MediaMetadata(rows.getString("id"), rows.getString("kind"), rows.getString("title"),
                                rows.getString("mime_type"), rows.getString("alt"), rows.getString("transcript"),
                                rows.getString("credit"), rows.getString("status")));
                try (var grant = connection.prepareStatement("""
                        insert into media.storage_read_grants (actor_id, bucket, object_path, expires_at)
                        values (?, ?, ?, now() + interval '60 seconds')
                        on conflict (actor_id, bucket, object_path)
                        do update set expires_at = excluded.expires_at
                        """)) {
                    grant.setObject(1, actorId);
                    grant.setString(2, asset.bucket());
                    grant.setString(3, asset.path());
                    grant.executeUpdate();
                }
                return asset;
            }
        } catch (SQLException error) {
            throw HttpError.unavailable("La médiathèque est temporairement indisponible.");
        }
    }

    /** Administration ou permission Catalogue : médiathèque pédagogique et brouillons. */
    private boolean isAdmin(UUID actorId) {
        return Permissions.canEditCatalogue(identities.current(actorId));
    }

    private static MediaMetadata readMetadata(ResultSet row) throws SQLException {
        return new MediaMetadata(row.getString("id"), row.getString("kind"), row.getString("title"),
                row.getString("mime_type"), row.getString("alt"), row.getString("transcript"),
                row.getString("credit"), row.getString("status"));
    }

    private record Asset(String bucket, String path, int version, MediaMetadata metadata) {}
    public record MediaMetadata(String id, String kind, String title, String mimeType, String alt, String transcript,
                                String credit, String status) {}
    public record MediaDetail(String id, String kind, String title, String mimeType, String url, String alt,
                              String transcript, String credit, int version) {}
}
