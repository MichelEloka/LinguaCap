package org.linguacap.media;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
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
 * Dépôt direct (DEV-050, DEV-051) : Médias réserve un chemin lié à l'auteur, le navigateur y envoie le fichier dans
 * Supabase Storage, puis Médias contrôle le fichier reçu avant d'en faire une version de la ressource.
 * Un dépôt non finalisé dans les 30 minutes est abandonné et son fichier supprimé.
 */
@Path("/v1/media/uploads")
@Produces(MediaType.APPLICATION_JSON)
public class UploadResource {
    private static final String ABANDONED = "Dépôt non finalisé dans les " + MediaStore.UPLOAD_MINUTES + " minutes.";

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject StorageSigner storage;
    @Inject MediaStore store;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response reserve(UploadRequest request) {
        UUID actorId = requireEditor();
        if (request == null) throw HttpError.badRequest("Décrivez le fichier à déposer.");
        String kind = MediaRules.kind(request.mimeType());
        if (kind == null) {
            throw HttpError.badRequest("Formats acceptés : images JPEG, PNG ou WebP, sons MP3 ou WAV.");
        }
        if (request.size() <= 0 || request.size() > MediaRules.maxBytes(kind)) {
            throw HttpError.badRequest("image".equals(kind) ? "Une image pèse 5 Mo au plus." : "Un son pèse 15 Mo au plus.");
        }
        String assetId = MediaResource.nullable(request.assetId());
        if (assetId != null && !assetId.matches(MediaResource.ASSET_ID)) throw HttpError.badRequest("Média à remplacer invalide.");
        String title = MediaResource.text(request.title());
        String source = MediaResource.text(request.source());
        String license = MediaResource.text(request.license());
        String alt = MediaResource.nullable(request.alt());
        String transcript = MediaResource.nullable(request.transcript());
        if (assetId == null && title.isEmpty() || title.length() > 120) throw HttpError.badRequest("Donnez un titre au média (120 caractères au plus).");
        if (source.isEmpty() || source.length() > 200 || license.isEmpty() || license.length() > 120) {
            throw HttpError.badRequest("Indiquez la source et la licence du média.");
        }
        if ("image".equals(kind) && (alt == null || alt.length() > 300)) {
            throw HttpError.badRequest("Rédigez le texte alternatif de l’image (300 caractères au plus).");
        }
        if ("audio".equals(kind) && (transcript == null || transcript.length() > 4000)) {
            throw HttpError.badRequest("Rédigez la transcription du son (4 000 caractères au plus).");
        }
        MediaStore.Upload upload = store.reserve(actorId, new MediaStore.NewUpload(assetId, title, request.mimeType(),
                request.size(), source, license, alt, transcript));
        return Response.status(Response.Status.CREATED).entity(view(upload)).build();
    }

    /** Dépôts récents de l'auteur ; les dépôts expirés sont abandonnés et leur fichier supprimé. */
    @GET
    public List<UploadView> uploads() {
        UUID actorId = requireEditor();
        List<MediaStore.Upload> uploads = store.uploads(actorId);
        return uploads.stream().map(upload -> {
            if (!upload.expired()) return view(upload);
            storage.delete(upload.bucket(), upload.objectPath(), actor.token());
            return view(store.close(upload.id(), "abandoned", ABANDONED));
        }).toList();
    }

    /**
     * Contrôle le fichier reçu : présence, taille, type réel lu dans ses premiers octets. Un fichier conforme devient
     * une nouvelle version brouillon ; un fichier refusé est supprimé. Rejouer la finalisation ne crée rien deux fois.
     */
    @POST
    @Path("/{id}/finalize")
    @Consumes(MediaType.APPLICATION_JSON)
    public UploadView finalize(@PathParam("id") UUID id) {
        UUID actorId = requireEditor();
        MediaStore.Upload upload = store.upload(id);
        if (!actorId.equals(upload.actorId())) throw HttpError.notFound("Dépôt introuvable.");
        if ("available".equals(upload.status())) return view(upload);
        if (!"pending".equals(upload.status())) {
            throw HttpError.conflict(upload.reason() == null ? "Ce dépôt est clos : recommencez." : upload.reason() + " Recommencez le dépôt.");
        }
        String token = actor.token();
        if (upload.expired()) {
            storage.delete(upload.bucket(), upload.objectPath(), token);
            store.close(id, "abandoned", ABANDONED);
            throw HttpError.conflict("Le dépôt a expiré : recommencez.");
        }
        StorageSigner.Probe probe = storage.probe(upload.bucket(), upload.objectPath(), token);
        if (probe == null) {
            throw HttpError.conflict("Le fichier n’a pas été reçu en entier : relancez l’envoi.");
        }
        String refusal = MediaRules.refusal(upload.mimeType(), upload.size(), probe.size(), probe.head());
        if (refusal != null) {
            storage.delete(upload.bucket(), upload.objectPath(), token);
            store.close(id, "rejected", refusal);
            throw HttpError.unprocessable(refusal);
        }
        return view(store.accept(id, probe.size()));
    }

    private UploadView view(MediaStore.Upload upload) {
        boolean pending = "pending".equals(upload.status());
        return new UploadView(upload.id(), upload.assetId(), upload.replaces(), upload.kind(), upload.title(),
                upload.mimeType(), upload.size(), upload.status(), upload.reason(), upload.version(),
                upload.createdAt().toString(), upload.expiresAt().toString(),
                pending ? storage.uploadUrl(upload.bucket(), upload.objectPath()) : null,
                MediaRules.maxBytes(upload.kind()));
    }

    private UUID requireEditor() {
        UUID actorId = actor.id();
        if (!Permissions.canEditCatalogue(identities.current(actorId))) {
            throw HttpError.forbidden("La médiathèque requiert la permission Catalogue.");
        }
        return actorId;
    }

    /** assetId : ressource dont le fichier est remplacé par une nouvelle version ; absent pour une nouvelle ressource. */
    public record UploadRequest(String assetId, String title, String mimeType, long size, String source, String license,
                                String alt, String transcript) {}

    public record UploadView(UUID id, String assetId, boolean replaces, String kind, String title, String mimeType,
                             long size, String status, String reason, Integer version, String createdAt,
                             String expiresAt, String uploadUrl, long maxBytes) {}
}
