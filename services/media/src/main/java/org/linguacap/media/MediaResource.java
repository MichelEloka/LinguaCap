package org.linguacap.media;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.Permissions;

/**
 * Médiathèque pédagogique (DEV-049, DEV-052, DEV-053) : réservée à l'administration et à la permission Catalogue,
 * brouillons compris. Les élèves reçoivent les adresses temporaires de leurs supports avec leur séance.
 */
@Path("/v1/media")
@Produces(MediaType.APPLICATION_JSON)
public class MediaResource {
    static final String ASSET_ID = "[a-z0-9-]{1,64}";

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject StorageSigner storage;
    @Inject MediaStore store;

    @GET
    public List<MediaStore.AssetView> media() {
        requireEditor();
        return store.assets();
    }

    /** Dernière version du fichier, brouillon compris, pour l'aperçu dans l'éditeur. */
    @GET
    @Path("/{id}")
    public Response media(@PathParam("id") String id) {
        return read(id, null);
    }

    /** Version précise référencée par un parcours. */
    @GET
    @Path("/{id}/versions/{version}")
    public Response mediaVersion(@PathParam("id") String id, @PathParam("version") int version) {
        if (version < 1 || version > 9999) throw HttpError.badRequest("Version de média invalide.");
        return read(id, version);
    }

    /** Titre, source, licence, texte alternatif et transcription par défaut de la ressource. */
    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public MediaStore.AssetView update(@PathParam("id") String id, MetadataChange change) {
        requireEditor();
        if (!id.matches(ASSET_ID) || change == null) throw HttpError.badRequest("Média invalide.");
        String title = text(change.title());
        String source = text(change.source());
        String license = text(change.license());
        if (title.isEmpty() || title.length() > 120 || source.length() > 200 || license.length() > 120
                || text(change.alt()).length() > 300 || text(change.transcript()).length() > 12000) {
            throw HttpError.badRequest("Vérifiez le titre, la source, la licence et les textes du média.");
        }
        return store.update(id, title, source, license, nullable(change.alt()), nullable(change.transcript()));
    }

    private Response read(String id, Integer version) {
        if (!id.matches(ASSET_ID)) throw HttpError.badRequest("Identifiant de média invalide.");
        UUID actorId = requireEditor();
        MediaStore.FileRow file = store.file(id, version, true);
        if (file == null) throw HttpError.notFound("Média introuvable.");
        store.grant(actorId, file);
        String url = storage.sign(file.bucket(), file.path(), actor.token());
        var detail = new MediaDetail(file.assetId(), file.kind(), file.title(), file.mimeType(), url, file.alt(),
                file.transcript(), file.credit(), file.version(), file.status());
        return Response.ok(detail).header("Cache-Control", "private, no-store").build();
    }

    private UUID requireEditor() {
        UUID actorId = actor.id();
        if (!Permissions.canEditCatalogue(identities.current(actorId))) {
            throw HttpError.forbidden("La médiathèque requiert la permission Catalogue.");
        }
        return actorId;
    }

    static String text(String value) {
        return value == null ? "" : value.strip();
    }

    static String nullable(String value) {
        String text = text(value);
        return text.isEmpty() ? null : text;
    }

    public record MetadataChange(String title, String source, String license, String alt, String transcript) {}

    public record MediaDetail(String id, String kind, String title, String mimeType, String url, String alt,
                              String transcript, String credit, int version, String status) {}
}
