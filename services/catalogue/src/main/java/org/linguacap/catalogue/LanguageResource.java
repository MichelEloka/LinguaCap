package org.linguacap.catalogue;

import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;

/**
 * Langues du catalogue (proposées ou bientôt disponibles), avec leurs niveaux et la version publiée de chacun.
 * Lisible par tout utilisateur connecté : choix de la langue à l'accueil, invitations, profil du professeur.
 */
@Path("/v1/languages")
@Produces(MediaType.APPLICATION_JSON)
public class LanguageResource {
    @Inject AgroalDataSource dataSource;
    @Inject Actor actor;

    @GET
    public List<Language> languages() {
        actor.id();
        try (var connection = dataSource.getConnection()) {
            Map<String, List<LanguageLevel>> levels = new LinkedHashMap<>();
            // Durée prévue d'une version publiée, calculée comme le planning d'Apprentissage : activités, révision de
            // chaque module non vide, bilan intermédiaire et examen blanc.
            try (var query = connection.prepareStatement("""
                    select l.language_id, l.code, l.title, v.id as version_id,
                           (select count(*) from catalogue.modules m where m.version_id = v.id) as modules,
                           (select coalesce(sum(a.estimated_minutes), 0) from catalogue.activities a where a.version_id = v.id)
                               as activity_minutes,
                           (select count(distinct a.module_id) from catalogue.activities a where a.version_id = v.id)
                               as filled_modules,
                           v.review_minutes, v.midterm_minutes, v.final_minutes
                    from catalogue.levels l
                    left join catalogue.track_versions v on v.level_id = l.id and v.status = 'published'
                    order by l.position nulls last, l.code
                    """); var rows = query.executeQuery()) {
                while (rows.next()) {
                    UUID versionId = rows.getObject("version_id", UUID.class);
                    Integer minutes = null;
                    if (versionId != null) {
                        int filled = rows.getInt("filled_modules");
                        minutes = rows.getInt("activity_minutes") + rows.getInt("review_minutes") * filled
                                + (filled > 0 ? rows.getInt("midterm_minutes") : 0) + rows.getInt("final_minutes");
                    }
                    levels.computeIfAbsent(rows.getString("language_id"), key -> new ArrayList<>())
                            .add(new LanguageLevel(rows.getString("code"), rows.getString("title"), versionId != null,
                                    versionId, minutes, versionId == null ? 0 : rows.getInt("modules")));
                }
            }
            List<Language> languages = new ArrayList<>();
            try (var query = connection.prepareStatement("""
                    select lang.id, lang.name, lang.native_name, lang.status, lang.position,
                           exists (select 1 from catalogue.placement_tests p
                                   where p.language_id = lang.id and p.status = 'published') as placement
                    from catalogue.languages lang order by lang.position, lang.id
                    """); var rows = query.executeQuery()) {
                while (rows.next()) {
                    String id = rows.getString("id");
                    languages.add(new Language(id, rows.getString("name"), rows.getString("native_name"),
                            rows.getString("status"), rows.getInt("position"), rows.getBoolean("placement"),
                            List.copyOf(levels.getOrDefault(id, List.of()))));
                }
            }
            return languages;
        } catch (SQLException error) {
            throw HttpError.unavailable("Les langues sont temporairement indisponibles.");
        }
    }

    /** Niveau d'une langue : publié s'il a une version attribuable ; plannedMinutes est la durée prévue de cette version. */
    public record LanguageLevel(String code, String title, boolean published, UUID trackVersionId, Integer plannedMinutes,
                                int moduleCount) {}

    public record Language(String id, String name, String nativeName, String status, int position, boolean placementAvailable,
                           List<LanguageLevel> levels) {}
}
