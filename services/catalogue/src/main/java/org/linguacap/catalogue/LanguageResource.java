package org.linguacap.catalogue;

import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.sql.Array;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.linguacap.common.Actor;
import org.linguacap.common.Cefr;
import org.linguacap.common.HttpError;

/**
 * Langues du catalogue (proposées ou bientôt disponibles), avec leurs niveaux et la version publiée de chacun.
 * Lisible par tout utilisateur connecté : choix de la langue à l'accueil, invitations, profil du professeur. C'est la
 * source de vérité de la disponibilité d'un niveau (published), de son ordre (position) et de son prérequis : un
 * niveau publié demain apparaît partout sans changer le code.
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
            return read(connection);
        } catch (SQLException error) {
            throw HttpError.unavailable("Les langues sont temporairement indisponibles.");
        }
    }

    /**
     * Langues dans l'ordre de leur position, niveaux dans l'ordre de leur position (sans position : en dernier, par
     * code). Lecture partagée avec la route publique (PublicCatalogueResource).
     */
    static List<Language> read(Connection connection) throws SQLException {
        Map<String, List<LanguageLevel>> levels = new LinkedHashMap<>();
        // Durée prévue d'une version publiée, calculée comme le planning d'Apprentissage : activités, révision de
        // chaque module non vide, bilan intermédiaire et examen blanc.
        try (var query = connection.prepareStatement("""
                select l.language_id, l.code, l.title, l.position, prereq.code as prerequisite, v.id as version_id,
                       (select count(*) from catalogue.modules m where m.version_id = v.id) as modules,
                       (select coalesce(sum(a.estimated_minutes), 0) from catalogue.activities a where a.version_id = v.id)
                           as activity_minutes,
                       (select count(distinct a.module_id) from catalogue.activities a where a.version_id = v.id)
                           as filled_modules,
                       v.review_minutes, v.midterm_minutes, v.final_minutes
                from catalogue.levels l
                left join catalogue.levels prereq on prereq.id = l.prerequisite_level_id
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
                String prerequisite = rows.getString("prerequisite");
                levels.computeIfAbsent(rows.getString("language_id"), key -> new ArrayList<>())
                        .add(new LanguageLevel(rows.getString("code"), rows.getString("title"), versionId != null,
                                versionId, minutes, versionId == null ? 0 : rows.getInt("modules"),
                                (Integer) rows.getObject("position"), Cefr.isLevel(prerequisite) ? prerequisite : null));
            }
        }
        List<Language> languages = new ArrayList<>();
        try (var query = connection.prepareStatement("""
                select lang.id, lang.name, lang.native_name, lang.status, lang.position,
                       exists (select 1 from catalogue.placement_tests p
                               where p.language_id = lang.id and p.status = 'published') as placement,
                       array(select tier ->> 'code'
                             from catalogue.placement_tests p, jsonb_array_elements(p.tiers) with ordinality as t(tier, n)
                             where p.language_id = lang.id and p.status = 'published' order by t.n) as tiers
                from catalogue.languages lang order by lang.position, lang.id
                """); var rows = query.executeQuery()) {
            while (rows.next()) {
                String id = rows.getString("id");
                languages.add(new Language(id, rows.getString("name"), rows.getString("native_name"),
                        rows.getString("status"), rows.getInt("position"), rows.getBoolean("placement"),
                        List.copyOf(levels.getOrDefault(id, List.of())), placementTiers(rows.getArray("tiers"))));
            }
        }
        return languages;
    }

    /** Paliers de la banque publiée : codes de l'échelle, sans doublon, de A1 vers C2 (ordre des paliers tirés). */
    static List<String> placementTiers(List<String> codes) {
        Set<String> tiers = new LinkedHashSet<>();
        for (String code : codes) if (Cefr.isLevel(code)) tiers.add(code);
        return tiers.stream().sorted(Cefr.ORDER).toList();
    }

    private static List<String> placementTiers(Array array) throws SQLException {
        if (array == null) return List.of();
        try {
            List<String> codes = new ArrayList<>();
            for (Object value : (Object[]) array.getArray()) codes.add(value == null ? null : String.valueOf(value));
            return placementTiers(codes);
        } finally {
            array.free();
        }
    }

    /**
     * Niveau d'une langue : publié s'il a une version attribuable ; plannedMinutes est la durée prévue de cette version.
     * position : ordre au catalogue (null s'il n'est pas renseigné) ; prerequisiteCode : niveau prérequis ou null.
     */
    public record LanguageLevel(String code, String title, boolean published, UUID trackVersionId, Integer plannedMinutes,
                                int moduleCount, Integer position, String prerequisiteCode) {}

    /** placementTiers : codes des paliers de la banque de test publiée, dans l'ordre ([] sans banque publiée). */
    public record Language(String id, String name, String nativeName, String status, int position, boolean placementAvailable,
                           List<LanguageLevel> levels, List<String> placementTiers) {}
}
