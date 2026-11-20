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
            throw HttpError.forbidden("La médiathèque est réservée à l’administration.");
        }
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement("select " + ASSET_COLUMNS + " from media.assets order by title");
             var rows = query.executeQuery()) {
            var assets = new ArrayList<MediaMetadata>();
            while (rows.next()) {
                assets.add(readAsset(rows).metadata());
            }
            return assets;
        } catch (SQLException error) {
            throw HttpError.unavailable("La médiathèque est temporairement indisponible.");
        }
    }

    @GET
    @Path("/{id}")
    public Response media(@PathParam("id") String id) {
        if (!id.matches("[a-z0-9-]{1,64}")) {
            throw HttpError.badRequest("Identifiant de média invalide.");
        }
        UUID actorId = actor.id();
        Asset asset = authorizeRead(id, actorId, isAdmin(actorId));
        String signedUrl = storage.sign(asset.bucket(), asset.path(), actor.token());

        var detail = new MediaDetail(asset.metadata().id(), asset.metadata().kind(), asset.metadata().title(),
                asset.metadata().mimeType(), signedUrl, asset.metadata().alt(), asset.metadata().transcript(),
                asset.metadata().credit());
        return Response.ok(detail).header("Cache-Control", "private, no-store").build();
    }

    private Asset authorizeRead(String id, UUID actorId, boolean admin) {
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement("select " + ASSET_COLUMNS + " from media.assets"
                     + " where id = ? and (status = 'published' or ?)")) {
            query.setString(1, id);
            query.setBoolean(2, admin);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) {
                    throw HttpError.notFound("Média introuvable.");
                }
                Asset asset = readAsset(rows);
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

    private boolean isAdmin(UUID actorId) {
        return "admin".equals(identities.current(actorId).path("role").asText());
    }

    private static Asset readAsset(ResultSet row) throws SQLException {
        return new Asset(row.getString("bucket"), row.getString("object_path"),
                new MediaMetadata(row.getString("id"), row.getString("kind"), row.getString("title"),
                        row.getString("mime_type"), row.getString("alt"), row.getString("transcript"),
                        row.getString("credit"), row.getString("status")));
    }

    private record Asset(String bucket, String path, MediaMetadata metadata) {}
    public record MediaMetadata(String id, String kind, String title, String mimeType, String alt, String transcript,
                                String credit, String status) {}
    public record MediaDetail(String id, String kind, String title, String mimeType, String url, String alt,
                              String transcript, String credit) {}
}
