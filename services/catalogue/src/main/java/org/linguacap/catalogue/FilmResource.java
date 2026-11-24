package org.linguacap.catalogue;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.linguacap.catalogue.FilmDocument.EditorDocument;
import org.linguacap.catalogue.FilmDocument.Film;
import org.linguacap.catalogue.FilmDocument.Input;
import org.linguacap.catalogue.FilmDocument.Summary;
import org.linguacap.catalogue.VersionDocument.Checks;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.Permissions;

/**
 * Ciné-club (EVO-055) : s'entraîner avec un film, hors parcours. Toute session lit les films publiés (lecteur YouTube
 * officiel, séquences, contexte, mots-clés et questions « après » sans corrigé). Les questions « après » sont la leçon
 * cine-&lt;séquence&gt;, remise et corrigée par Évaluations (POST /assessments/exercises). L'édition est dans
 * {@link Editor} (racine distincte de /v1/catalogue).
 */
@Path("/v1/films")
@Produces(MediaType.APPLICATION_JSON)
public class FilmResource {
    private static final String LEVEL_CODE = "[ABCabc][12]";

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject FilmStore store;

    /** Films publiés (niveau publié), sans questions ; filtres facultatifs : langue (de) et niveau (A1). */
    @GET
    public List<Film> films(@QueryParam("languageId") String languageId, @QueryParam("level") String level) {
        actor.id();
        if (languageId != null && !FilmDocument.LANGUAGE.matcher(languageId).matches()
                || level != null && !level.matches(LEVEL_CODE)) {
            throw HttpError.badRequest("Filtre de film invalide : langue (ex. de) et niveau (ex. A1).");
        }
        return store.published(languageId, level == null ? null : level.toUpperCase(Locale.ROOT));
    }

    /** Film publié avec les vues élève des questions (aucun corrigé) ; les éditeurs prévisualisent aussi un brouillon. */
    @GET
    @Path("/{filmId}")
    public Film film(@PathParam("filmId") String filmId) {
        UUID callerId = actor.id();
        requireFilmId(filmId);
        Film film = store.film(filmId, false);
        if (film == null && Permissions.canEditCatalogue(identities.current(callerId))) film = store.film(filmId, true);
        if (film == null) throw HttpError.notFound("Film introuvable.");
        return film;
    }

    static void requireFilmId(String filmId) {
        if (!FilmDocument.validFilmId(filmId)) throw HttpError.badRequest("Identifiant de film invalide.");
    }

    /** Import et édition des films : administration ou permission Catalogue. */
    @Path("/v1/catalogue/films")
    @Produces(MediaType.APPLICATION_JSON)
    public static class Editor {
        @Inject Actor actor;
        @Inject IdentityClient identities;
        @Inject FilmStore store;

        @GET
        public List<Summary> summaries() {
            requireEditor();
            return store.summaries();
        }

        @GET
        @Path("/{filmId}")
        public EditorDocument document(@PathParam("filmId") String filmId) {
            requireEditor();
            requireFilmId(filmId);
            return store.editorDocument(filmId);
        }

        /**
         * Crée ou remplace un film et ses séquences (import au format 1 ou éditeur). La structure est contrôlée (400) ;
         * un brouillon peut rester incomplet, un film publié exige un document complet (409).
         */
        @PUT
        @Path("/{filmId}")
        @Consumes(MediaType.APPLICATION_JSON)
        public EditorDocument save(@PathParam("filmId") String filmId, Input body) {
            UUID editor = requireEditor();
            requireFilmId(filmId);
            Input input = FilmDocument.normalized(body);
            FilmDocument.checkStructure(filmId, input);
            Checks checks = FilmDocument.check(input);
            store.save(input, checks, editor);
            return store.editorDocument(filmId);
        }

        @POST
        @Path("/{filmId}/publish")
        @Consumes(MediaType.APPLICATION_JSON)
        public Summary publish(@PathParam("filmId") String filmId) {
            requireEditor();
            requireFilmId(filmId);
            return store.publish(filmId);
        }

        @POST
        @Path("/{filmId}/retire")
        @Consumes(MediaType.APPLICATION_JSON)
        public Summary retire(@PathParam("filmId") String filmId) {
            requireEditor();
            requireFilmId(filmId);
            return store.retire(filmId);
        }

        private UUID requireEditor() {
            UUID id = actor.id();
            if (!Permissions.canEditCatalogue(identities.current(id))) {
                throw HttpError.forbidden("L’édition du catalogue requiert la permission Catalogue.");
            }
            return id;
        }
    }
}
