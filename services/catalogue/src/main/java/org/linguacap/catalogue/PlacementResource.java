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
import org.linguacap.catalogue.PlacementDocument.Content;
import org.linguacap.catalogue.PlacementDocument.Summary;
import org.linguacap.catalogue.VersionDocument.Checks;
import org.linguacap.catalogue.VersionDocument.MediaRef;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.Permissions;
import org.linguacap.common.ServiceClient;

/**
 * Édition du test de niveau d'une langue : brouillon, contrôle de complétude et publication avec ses médias.
 * Réservé à l'administration et à la permission Catalogue. La banque publiée, corrigés compris, est servie à
 * Évaluations par la route interne {@link Internal}.
 */
@Path("/v1/catalogue/placement-tests")
@Produces(MediaType.APPLICATION_JSON)
public class PlacementResource {
    private static final String LANGUAGE_ID = "[a-z]{2}";

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject PlacementStore store;
    @Inject ServiceClient services;
    @ConfigProperty(name = "lingua.services.media") String mediaUrl;

    @GET
    public List<Summary> list() {
        requireEditor();
        return store.list();
    }

    /** Nouveau brouillon pour une langue, vide ou copié d'une banque existante (fromTestId). */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(CreateRequest request) {
        UUID editor = requireEditor();
        if (request == null || request.languageId() == null || !request.languageId().matches(LANGUAGE_ID)) {
            throw HttpError.badRequest("Indiquez la langue du test de niveau (code à deux lettres).");
        }
        UUID id = store.create(request.languageId(), request.fromTestId(), editor);
        return Response.status(Response.Status.CREATED).entity(store.document(id)).build();
    }

    @GET
    @Path("/{testId}")
    public PlacementDocument test(@PathParam("testId") UUID testId) {
        requireEditor();
        return store.document(testId);
    }

    /** Enregistre le brouillon complet ; il peut rester incomplet, la réponse liste ce qu'il reste à compléter. */
    @PUT
    @Path("/{testId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Saved save(@PathParam("testId") UUID testId, Content content) {
        requireEditor();
        PlacementDocument.checkStructure(content);
        store.save(testId, PlacementDocument.normalized(content));
        PlacementDocument saved = store.document(testId);
        return new Saved(saved, PlacementDocument.check(saved.title(), saved.tiers()));
    }

    /**
     * Publie un brouillon complet : la banque publiée précédente de la langue est retirée. Les sons et images des
     * questions sont publiés d'abord, pour que les élèves puissent les lire pendant le test.
     */
    @POST
    @Path("/{testId}/publish")
    @Consumes(MediaType.APPLICATION_JSON)
    public PlacementStore.Published publish(@PathParam("testId") UUID testId) {
        UUID editor = requireEditor();
        PlacementDocument document = store.document(testId);
        if (!"draft".equals(document.status())) throw HttpError.conflict("Seul un brouillon se publie.");
        Checks checks = PlacementDocument.check(document.title(), document.tiers());
        if (!checks.publishable()) {
            throw HttpError.conflict("Le test de niveau n’est pas prêt : " + checks.issues().get(0).message()
                    + (checks.issues().size() > 1 ? " (" + checks.issues().size() + " points à compléter)" : ""));
        }
        List<MediaRef> media = document.mediaRefs();
        if (!media.isEmpty()) {
            var result = services.exchange(mediaUrl, "/v1/internal/media/publish", "POST", editor,
                    Map.of("items", media), "", "", false, actor.requestId());
            if (result.status() == 404 || result.status() == 409) {
                JsonNode message = result.body().path("message");
                throw HttpError.conflict(message.isTextual() ? message.asText() : "Un média du test de niveau est introuvable.");
            }
            if (result.status() != 200) {
                throw HttpError.unavailable("La médiathèque est indisponible : réessayez la publication.");
            }
        }
        return store.publish(testId, media);
    }

    private UUID requireEditor() {
        UUID id = actor.id();
        if (!Permissions.canEditCatalogue(identities.current(id))) {
            throw HttpError.forbidden("L’édition du catalogue requiert la permission Catalogue.");
        }
        return id;
    }

    public record CreateRequest(String languageId, UUID fromTestId) {}

    public record Saved(PlacementDocument test, Checks checks) {}

    /** Route interne (non exposée par la passerelle) : banque publiée d'une langue, corrigés compris, pour Évaluations. */
    @Path("/v1/internal/placement-tests")
    @Produces(MediaType.APPLICATION_JSON)
    public static class Internal {
        @Inject Actor actor;
        @Inject PlacementStore store;

        @GET
        @Path("/published/{languageId}")
        public PlacementDocument published(@PathParam("languageId") String languageId) {
            actor.id();
            if (!languageId.matches(LANGUAGE_ID)) throw HttpError.badRequest("Code de langue invalide.");
            return store.published(languageId);
        }
    }
}
