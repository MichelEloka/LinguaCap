package org.linguacap.catalogue;

import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.catalogue.LanguageResource.Language;
import org.linguacap.catalogue.LanguageResource.LanguageLevel;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.Secrets;

/**
 * Langues et niveaux publiés, lus sans compte (vitrine, page de connexion, pied de page) : la passerelle relaie
 * GET /api/v1/public/languages sans session. Seuls les niveaux ayant une version publiée sont listés, et une langue
 * sans niveau publié est absente. Aucune identité n'est lue : la route reste interne (secret de service exigé), et
 * l'acteur transmis par la passerelle (acteur anonyme) est ignoré.
 */
@Path("/v1/public/languages")
@Produces(MediaType.APPLICATION_JSON)
public class PublicCatalogueResource {
    /** Données publiques en lecture seule : cinq minutes de cache, comme la réponse de la passerelle. */
    static final String CACHE = "public, max-age=300";

    @Inject AgroalDataSource dataSource;
    @ConfigProperty(name = "lingua.internal-secret") Optional<String> secret;

    @GET
    public Response languages(@HeaderParam(Actor.INTERNAL_SECRET) String internal) {
        if (!Secrets.match(secret.orElse(null), internal)) {
            throw HttpError.forbidden("Appel interne non autorisé.");
        }
        try (var connection = dataSource.getConnection()) {
            return Response.ok(published(LanguageResource.read(connection))).header("Cache-Control", CACHE).build();
        } catch (SQLException error) {
            throw HttpError.unavailable("Les langues sont temporairement indisponibles.");
        }
    }

    /** Langues ayant au moins un niveau publié, et leurs seuls niveaux publiés, dans l'ordre du catalogue. */
    static List<PublicLanguage> published(List<Language> languages) {
        List<PublicLanguage> result = new ArrayList<>();
        for (Language language : languages) {
            List<PublicLevel> levels = language.levels().stream().filter(LanguageLevel::published)
                    .map(level -> new PublicLevel(level.code(), level.title(), level.position(), level.moduleCount(),
                            level.plannedMinutes()))
                    .toList();
            if (!levels.isEmpty()) {
                result.add(new PublicLanguage(language.id(), language.name(), language.nativeName(), language.position(),
                        levels));
            }
        }
        return List.copyOf(result);
    }

    /** Niveau publié : position au catalogue (null si non renseignée), nombre de modules et durée prévue. */
    public record PublicLevel(String code, String title, Integer position, int moduleCount, Integer plannedMinutes) {}

    public record PublicLanguage(String id, String name, String nativeName, int position, List<PublicLevel> levels) {}
}
