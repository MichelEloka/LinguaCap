package org.linguacap.catalogue;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.Permissions;
import org.linguacap.common.ServiceClient;

/**
 * Édition du catalogue (DEV-047 à DEV-058) : niveaux, brouillons de parcours, contrôle de complétude,
 * publication et retrait. Réservé à l'administration et à la permission Catalogue.
 */
@Path("/v1/catalogue")
@Produces(MediaType.APPLICATION_JSON)
public class AuthoringResource {
    private static final String LEVEL_ID = "[abc][12]";

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject AuthoringStore store;
    @Inject ServiceClient services;
    @ConfigProperty(name = "lingua.services.media") String mediaUrl;

    @GET
    @Path("/levels")
    public List<AuthoringStore.LevelView> levels() {
        requireEditor();
        return store.levels();
    }

    @PUT
    @Path("/levels/{levelId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public List<AuthoringStore.LevelView> updateLevel(@PathParam("levelId") String levelId, LevelChange change) {
        requireEditor();
        if (!levelId.matches(LEVEL_ID) || change == null) throw HttpError.badRequest("Niveau invalide.");
        String title = VersionDocument.text(change.title());
        String description = VersionDocument.text(change.description());
        if (title.isEmpty() || title.length() > 120 || description.length() > 2000
                || change.position() != null && (change.position() < 1 || change.position() > 50)) {
            throw HttpError.badRequest("Vérifiez le titre, la description et la position du niveau.");
        }
        String prerequisite = change.prerequisiteLevelId();
        if (prerequisite != null && (!prerequisite.matches(LEVEL_ID) || prerequisite.equals(levelId))) {
            throw HttpError.badRequest("Le prérequis doit être un autre niveau.");
        }
        store.updateLevel(levelId, title, description, change.position(), prerequisite);
        return store.levels();
    }

    /** Nouveau brouillon, vide ou copié d'une version publiée (DEV-058). */
    @POST
    @Path("/levels/{levelId}/versions")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createDraft(@PathParam("levelId") String levelId, DraftRequest request) {
        UUID editor = requireEditor();
        if (!levelId.matches(LEVEL_ID)) throw HttpError.badRequest("Niveau invalide.");
        UUID id = store.createDraft(levelId, request == null ? null : request.fromVersionId(), editor);
        return Response.status(Response.Status.CREATED).entity(store.document(id)).build();
    }

    @GET
    @Path("/versions/{versionId}")
    public VersionDocument version(@PathParam("versionId") UUID versionId) {
        requireEditor();
        return store.document(versionId);
    }

    /** Enregistre le brouillon complet ; il peut rester incomplet et se reprendre plus tard (DEV-055). */
    @PUT
    @Path("/versions/{versionId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public SavedVersion save(@PathParam("versionId") UUID versionId, DraftContent content) {
        requireEditor();
        if (content == null) throw HttpError.badRequest("Le document de version est requis.");
        VersionDocument.checkStructure(content.settings(), content.diagnostic(), content.modules(), content.assessments());
        store.save(versionId, content.settings(), content.diagnostic(), content.modules(), content.assessments());
        VersionDocument saved = store.document(versionId);
        return new SavedVersion(saved, checks(saved));
    }

    /** Ce qu'il reste à compléter avant de publier (DEV-056). */
    @GET
    @Path("/versions/{versionId}/checks")
    public VersionDocument.Checks checks(@PathParam("versionId") UUID versionId) {
        requireEditor();
        return checks(store.document(versionId));
    }

    /**
     * Publie un brouillon complet (DEV-057). La version publiée précédente du niveau est retirée des nouvelles
     * attributions ; ses élèves gardent leur version. La réponse liste les versions de médias à publier.
     */
    @POST
    @Path("/versions/{versionId}/publish")
    @Consumes(MediaType.APPLICATION_JSON)
    public AuthoringStore.Published publish(@PathParam("versionId") UUID versionId) {
        UUID editor = requireEditor();
        VersionDocument document = store.document(versionId);
        if (!"draft".equals(document.status())) throw HttpError.conflict("Seul un brouillon se publie.");
        VersionDocument.Checks checks = checks(document);
        if (!checks.publishable()) {
            throw HttpError.conflict("Le parcours n’est pas prêt : " + checks.issues().get(0).message()
                    + (checks.issues().size() > 1 ? " (" + checks.issues().size() + " points à compléter)" : ""));
        }
        List<VersionDocument.MediaRef> media = document.mediaRefs();
        if (!media.isEmpty()) {
            // Les fichiers référencés deviennent lisibles par les élèves inscrits : ils sont publiés avant le parcours.
            var result = services.exchange(mediaUrl, "/v1/internal/media/publish", "POST", editor,
                    Map.of("items", media), "", "", false, actor.requestId());
            if (result.status() == 404 || result.status() == 409) {
                JsonNode message = result.body().path("message");
                throw HttpError.conflict(message.isTextual() ? message.asText() : "Un média du parcours est introuvable.");
            }
            if (result.status() != 200) {
                throw HttpError.unavailable("La médiathèque est indisponible : réessayez la publication.");
            }
        }
        return store.publish(versionId, media);
    }

    @POST
    @Path("/versions/{versionId}/retire")
    @Consumes(MediaType.APPLICATION_JSON)
    public AuthoringStore.VersionSummary retire(@PathParam("versionId") UUID versionId) {
        requireEditor();
        return store.retire(versionId);
    }

    private static VersionDocument.Checks checks(VersionDocument document) {
        return VersionDocument.check(document.settings(), document.diagnostic(), document.modules(), document.assessments());
    }

    private UUID requireEditor() {
        UUID id = actor.id();
        if (!Permissions.canEditCatalogue(identities.current(id))) {
            throw HttpError.forbidden("L’édition du catalogue requiert la permission Catalogue.");
        }
        return id;
    }

    public record LevelChange(String title, String description, Integer position, String prerequisiteLevelId) {}

    public record DraftRequest(UUID fromVersionId) {}

    public record DraftContent(VersionDocument.Settings settings, VersionDocument.Diagnostic diagnostic,
                               List<VersionDocument.Module> modules, List<VersionDocument.Assessment> assessments) {}

    public record SavedVersion(VersionDocument version, VersionDocument.Checks checks) {}
}
