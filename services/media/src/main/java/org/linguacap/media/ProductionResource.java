package org.linguacap.media;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.UUID;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;

/**
 * Productions orales privées (DEV-064, DEV-065), en routes internes appelées par Évaluations : Évaluations vérifie
 * la tentative et les droits du lecteur, Médias réserve le chemin, contrôle le fichier et délivre la lecture. Les
 * fichiers restent dans l'espace privé des productions, hors de la médiathèque pédagogique.
 */
@Path("/v1/internal/media/productions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductionResource {
    private static final String PART_ID = "[a-z0-9]+(-[a-z0-9]+)*";

    @Inject Actor actor;
    @Inject StorageSigner storage;
    @Inject ProductionStore store;

    /** Réserve le dépôt d'un enregistrement pour l'élève, sur une tentative ouverte vérifiée par Évaluations. */
    @POST
    public ProductionView reserve(ProductionRequest request) {
        UUID ownerId = actor.id();
        if (actor.token().isEmpty()) throw HttpError.unauthorized("Le jeton de l’élève est requis.");
        if (request == null || request.attemptId() == null || request.partId() == null || !request.partId().matches(PART_ID)
                || request.partId().length() > 64) {
            throw HttpError.badRequest("Partie d’évaluation invalide.");
        }
        if (MediaRules.productionExtension(request.mimeType()) == null) {
            throw HttpError.badRequest("Formats acceptés : WebM, Ogg, MP3, MP4 ou WAV.");
        }
        if (request.size() <= 0 || request.size() > MediaRules.PRODUCTION_MAX_BYTES) {
            throw HttpError.badRequest("Un enregistrement pèse 25 Mo au plus.");
        }
        return view(store.reserve(ownerId, request.attemptId(), request.partId(), request.mimeType(), request.size()));
    }

    /** Contrôle l'enregistrement reçu ; rejouer la finalisation renvoie le même résultat. */
    @POST
    @Path("/{id}/finalize")
    public ProductionView finalize(@PathParam("id") UUID id) {
        UUID ownerId = actor.id();
        ProductionStore.Production production = store.find(id);
        if (!ownerId.equals(production.ownerId())) throw HttpError.notFound("Enregistrement introuvable.");
        if ("available".equals(production.status())) return view(production);
        if (!"pending".equals(production.status())) {
            throw HttpError.conflict((production.reason() == null ? "Cet envoi est clos." : production.reason()) + " Recommencez l’enregistrement.");
        }
        String token = actor.token();
        if (production.expired()) {
            storage.delete(ProductionStore.BUCKET, production.objectPath(), token);
            store.close(id, "abandoned", "Envoi non finalisé dans les " + ProductionStore.UPLOAD_MINUTES + " minutes.", null);
            throw HttpError.conflict("L’envoi a expiré : recommencez.");
        }
        StorageSigner.Probe probe = storage.probe(ProductionStore.BUCKET, production.objectPath(), token);
        if (probe == null) throw HttpError.conflict("L’enregistrement n’a pas été reçu en entier : relancez l’envoi.");
        String refusal = MediaRules.productionRefusal(production.mimeType(), production.declaredSize(), probe.size(), probe.head());
        if (refusal != null) {
            storage.delete(ProductionStore.BUCKET, production.objectPath(), token);
            store.close(id, "rejected", refusal, null);
            throw HttpError.unprocessable(refusal);
        }
        return view(store.close(id, "available", null, probe.size()));
    }

    /** Adresses de lecture de cinq minutes pour un lecteur dont Évaluations a vérifié les droits. */
    @POST
    @Path("/read-grants")
    public List<ReadGrant> readGrants(Ids request) {
        UUID readerId = actor.id();
        String token = actor.token();
        if (token.isEmpty()) throw HttpError.unauthorized("Le jeton du lecteur est requis.");
        if (request == null || request.ids() == null || request.ids().isEmpty() || request.ids().size() > 20) {
            throw HttpError.badRequest("Liste d’enregistrements invalide.");
        }
        return store.available(request.ids()).stream().map(production -> {
            store.grant(readerId, production);
            return new ReadGrant(production.id(), production.attemptId(), production.partId(), production.mimeType(),
                    production.sizeBytes(), storage.sign(ProductionStore.BUCKET, production.objectPath(), token));
        }).toList();
    }

    private ProductionView view(ProductionStore.Production production) {
        boolean pending = "pending".equals(production.status());
        return new ProductionView(production.id(), production.attemptId(), production.partId(), production.mimeType(),
                production.sizeBytes(), production.status(), production.reason(), production.expiresAt().toString(),
                pending ? storage.uploadUrl(ProductionStore.BUCKET, production.objectPath()) : null,
                MediaRules.PRODUCTION_MAX_BYTES);
    }

    public record ProductionRequest(UUID attemptId, String partId, String mimeType, long size) {}

    public record Ids(List<UUID> ids) {}

    public record ProductionView(UUID id, UUID attemptId, String partId, String mimeType, Long size, String status,
                                 String reason, String expiresAt, String uploadUrl, long maxBytes) {}

    public record ReadGrant(UUID id, UUID attemptId, String partId, String mimeType, Long size, String url) {}
}
