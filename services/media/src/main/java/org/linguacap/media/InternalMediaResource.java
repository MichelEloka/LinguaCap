package org.linguacap.media;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.Permissions;

/** Routes internes (non exposées par la passerelle) pour Apprentissage et Catalogue. */
@Path("/v1/internal/media")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InternalMediaResource {
    private static final int MAX_ITEMS = 60;

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject StorageSigner storage;
    @Inject MediaStore store;

    /**
     * Adresses temporaires des supports d'une séance (DEV-053). Apprentissage a vérifié que l'utilisateur lit cette
     * séance ; seules les versions publiées sont servies, avec le jeton de l'utilisateur pour la politique Storage.
     * Chaque reprise de séance renouvelle les adresses.
     */
    @POST
    @Path("/read-grants")
    public List<ReadGrant> readGrants(Refs request) {
        UUID actorId = actor.id();
        String token = actor.token();
        if (token.isEmpty()) throw HttpError.unauthorized("Le jeton de l’utilisateur est requis.");
        List<ReadGrant> grants = new ArrayList<>();
        for (MediaStore.Ref ref : refs(request)) {
            MediaStore.FileRow file = store.file(ref.assetId(), ref.version(), false);
            if (file == null) continue;
            store.grant(actorId, file);
            grants.add(new ReadGrant(file.assetId(), file.version(), file.mimeType(),
                    storage.sign(file.bucket(), file.path(), token)));
        }
        return grants;
    }

    /** Publie les versions de médias d'un parcours au moment de sa publication par un éditeur du catalogue. */
    @POST
    @Path("/publish")
    public Map<String, Integer> publish(Refs request) {
        UUID actorId = actor.id();
        if (!Permissions.canEditCatalogue(identities.current(actorId))) {
            throw HttpError.forbidden("La publication requiert la permission Catalogue.");
        }
        List<MediaStore.Ref> refs = refs(request);
        store.publish(refs);
        return Map.of("published", refs.size());
    }

    private static List<MediaStore.Ref> refs(Refs request) {
        if (request == null || request.items() == null || request.items().size() > MAX_ITEMS) {
            throw HttpError.badRequest("Liste de médias invalide.");
        }
        LinkedHashSet<MediaStore.Ref> refs = new LinkedHashSet<>();
        for (MediaStore.Ref ref : request.items()) {
            if (ref == null || ref.assetId() == null || !ref.assetId().matches(MediaResource.ASSET_ID)
                    || ref.version() < 1 || ref.version() > 9999) {
                throw HttpError.badRequest("Référence de média invalide.");
            }
            refs.add(ref);
        }
        return List.copyOf(refs);
    }

    public record Refs(List<MediaStore.Ref> items) {}

    public record ReadGrant(String assetId, int version, String mimeType, String url) {}
}
