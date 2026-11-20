package org.linguacap.catalogue;

import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.sql.Array;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.linguacap.catalogue.CatalogueResource.Question;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;

/**
 * Parcours versionnés : langue → niveau → version → modules → activités (DEV-025).
 * Les versions publiées sont attribuables. Une version retirée reste lisible pour les élèves déjà inscrits.
 */
@Path("/v1")
@Produces(MediaType.APPLICATION_JSON)
public class TrackResource {
    private static final String ACTIVITY_ID = "[a-z0-9]+(-[a-z0-9]+)*";

    @Inject AgroalDataSource dataSource;
    @Inject Actor actor;

    /** Versions publiées, proposées à l'attribution par un professeur ou l'administration. */
    @GET
    @Path("/tracks")
    public List<TrackSummary> tracks() {
        actor.id();
        String sql = """
                select v.id, v.number, v.published_at, l.id as level_id, l.code, l.title, lang.name as language,
                       prereq.code as prerequisite, v.success_criteria,
                       (select count(*) from catalogue.modules m where m.version_id = v.id) as modules,
                       (select count(*) from catalogue.activities a where a.version_id = v.id) as activities,
                       (select coalesce(sum(a.estimated_minutes), 0) from catalogue.activities a where a.version_id = v.id) as minutes
                from catalogue.track_versions v
                join catalogue.levels l on l.id = v.level_id
                join catalogue.languages lang on lang.id = l.language_id
                left join catalogue.levels prereq on prereq.id = l.prerequisite_level_id
                where v.status = 'published'
                order by lang.name, l.position nulls last, l.code
                """;
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement(sql);
             var rows = query.executeQuery()) {
            List<TrackSummary> tracks = new ArrayList<>();
            while (rows.next()) {
                tracks.add(new TrackSummary(rows.getObject("id", UUID.class), rows.getString("level_id"),
                        rows.getString("code"), rows.getString("title"), rows.getString("language"),
                        rows.getInt("number"), text(rows.getObject("published_at", OffsetDateTime.class)),
                        rows.getInt("modules"), rows.getInt("activities"), rows.getInt("minutes"),
                        rows.getString("prerequisite"), rows.getString("success_criteria")));
            }
            return tracks;
        } catch (SQLException error) {
            throw HttpError.unavailable("Les parcours sont temporairement indisponibles.");
        }
    }

    /** Structure complète d'une version, pour Apprentissage (route interne, non exposée par la passerelle). */
    @GET
    @Path("/internal/tracks/{versionId}")
    public Track track(@PathParam("versionId") UUID versionId) {
        actor.id();
        try (var connection = dataSource.getConnection()) {
            Track header = header(connection, versionId);
            Map<String, TrackModule> modules = new LinkedHashMap<>();
            try (var query = connection.prepareStatement("""
                    select id, position, title, objective, prerequisites
                    from catalogue.modules where version_id = ? order by position
                    """)) {
                query.setObject(1, versionId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        modules.put(rows.getString("id"), new TrackModule(rows.getString("id"), rows.getInt("position"),
                                rows.getString("title"), rows.getString("objective"), texts(rows.getArray("prerequisites")),
                                new ArrayList<>()));
                    }
                }
            }
            try (var query = connection.prepareStatement("""
                    select module_id, id, position, kind, title, estimated_minutes, competences, lesson_id
                    from catalogue.activities where version_id = ? order by position
                    """)) {
                query.setObject(1, versionId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        modules.get(rows.getString("module_id")).activities().add(activity(rows));
                    }
                }
            }
            return new Track(header.versionId(), header.levelId(), header.levelCode(), header.levelTitle(),
                    header.number(), header.status(), List.copyOf(modules.values()), header.planning());
        } catch (SQLException error) {
            throw HttpError.unavailable("Le parcours est temporairement indisponible.");
        }
    }

    /** Contenu d'une activité sans corrigé : leçon, questions et supports avec leur version de fichier. */
    @GET
    @Path("/internal/tracks/{versionId}/activities/{activityId}")
    public ActivityContent activity(@PathParam("versionId") UUID versionId, @PathParam("activityId") String activityId) {
        actor.id();
        if (!activityId.matches(ACTIVITY_ID) || activityId.length() > 80) {
            throw HttpError.badRequest("Identifiant d’activité invalide.");
        }
        try (var connection = dataSource.getConnection()) {
            header(connection, versionId);
            TrackActivity activity;
            String moduleId;
            try (var query = connection.prepareStatement("""
                    select module_id, id, position, kind, title, estimated_minutes, competences, lesson_id
                    from catalogue.activities where version_id = ? and id = ?
                    """)) {
                query.setObject(1, versionId);
                query.setString(2, activityId);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Activité introuvable dans ce parcours.");
                    moduleId = rows.getString("module_id");
                    activity = activity(rows);
                }
            }
            LessonContent lesson = null;
            List<Question> questions = List.of();
            if (activity.lessonId() != null) {
                try (var query = connection.prepareStatement(
                        "select id, title, description, transcript from catalogue.lessons where id = ?")) {
                    query.setString(1, activity.lessonId());
                    try (var rows = query.executeQuery()) {
                        if (rows.next()) {
                            lesson = new LessonContent(rows.getString("id"), rows.getString("title"),
                                    rows.getString("description"), rows.getString("transcript"));
                        }
                    }
                }
                if ("exercise".equals(activity.kind()) || "assessment".equals(activity.kind())) {
                    questions = CatalogueResource.readQuestions(connection, activity.lessonId());
                }
            }
            List<Placement> placements = new ArrayList<>();
            try (var query = connection.prepareStatement("""
                    select position, asset_id, asset_version, usage, alt, caption, transcript_visibility
                    from catalogue.media_placements where version_id = ? and activity_id = ? order by position
                    """)) {
                query.setObject(1, versionId);
                query.setString(2, activityId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        placements.add(new Placement(rows.getInt("position"), rows.getString("asset_id"),
                                rows.getInt("asset_version"), rows.getString("usage"), rows.getString("alt"),
                                rows.getString("caption"), rows.getString("transcript_visibility")));
                    }
                }
            }
            return new ActivityContent(moduleId, activity, lesson, questions, placements);
        } catch (SQLException error) {
            throw HttpError.unavailable("L’activité est temporairement indisponible.");
        }
    }

    /** Questions du diagnostic de la version, sans corrigé (route interne pour Apprentissage). */
    @GET
    @Path("/internal/tracks/{versionId}/diagnostic")
    public Diagnostic diagnostic(@PathParam("versionId") UUID versionId) {
        actor.id();
        try (var connection = dataSource.getConnection()) {
            Track header = header(connection, versionId);
            String lessonId = header.planning().diagnosticLessonId();
            if (lessonId == null) throw HttpError.notFound("Ce parcours n’a pas de diagnostic.");
            try (var query = connection.prepareStatement("select title, description from catalogue.lessons where id = ?")) {
                query.setString(1, lessonId);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Diagnostic introuvable.");
                    return new Diagnostic(lessonId, rows.getString("title"), rows.getString("description"),
                            CatalogueResource.readQuestions(connection, lessonId));
                }
            }
        } catch (SQLException error) {
            throw HttpError.unavailable("Le diagnostic est temporairement indisponible.");
        }
    }

    private Track header(Connection connection, UUID versionId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select v.id, v.number, v.status, l.id as level_id, l.code, l.title, prereq.code as prerequisite,
                       v.expected_competences, v.success_criteria, v.pass_percent, v.review_minutes,
                       v.midterm_minutes, v.final_minutes, v.diagnostic_lesson_id
                from catalogue.track_versions v join catalogue.levels l on l.id = v.level_id
                left join catalogue.levels prereq on prereq.id = l.prerequisite_level_id
                where v.id = ? and v.status in ('published', 'retired')
                """)) {
            query.setObject(1, versionId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) throw HttpError.notFound("Parcours introuvable.");
                return new Track(rows.getObject("id", UUID.class), rows.getString("level_id"), rows.getString("code"),
                        rows.getString("title"), rows.getInt("number"), rows.getString("status"), List.of(),
                        new Planning(rows.getString("prerequisite"), texts(rows.getArray("expected_competences")),
                                rows.getString("success_criteria"), rows.getInt("pass_percent"),
                                rows.getInt("review_minutes"), rows.getInt("midterm_minutes"),
                                rows.getInt("final_minutes"), rows.getString("diagnostic_lesson_id")));
            }
        }
    }

    private static TrackActivity activity(ResultSet rows) throws SQLException {
        return new TrackActivity(rows.getString("id"), rows.getInt("position"), rows.getString("kind"),
                rows.getString("title"), rows.getInt("estimated_minutes"), texts(rows.getArray("competences")),
                rows.getString("lesson_id"));
    }

    private static List<String> texts(Array array) throws SQLException {
        if (array == null) return List.of();
        try {
            List<String> values = new ArrayList<>();
            for (Object value : (Object[]) array.getArray()) values.add(String.valueOf(value));
            return List.copyOf(values);
        } finally {
            array.free();
        }
    }

    private static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }

    public record TrackSummary(UUID versionId, String levelId, String levelCode, String levelTitle, String language,
                               int number, String publishedAt, int moduleCount, int activityCount, int totalMinutes,
                               String prerequisiteLevelCode, String successCriteria) {}

    /** Données de planification publiées avec la version : prérequis, critères, durées des révisions et évaluations. */
    public record Planning(String prerequisiteLevelCode, List<String> expectedCompetences, String successCriteria,
                           int passPercent, int reviewMinutes, int midtermMinutes, int finalMinutes,
                           String diagnosticLessonId) {}

    public record Track(UUID versionId, String levelId, String levelCode, String levelTitle, int number, String status,
                        List<TrackModule> modules, Planning planning) {}

    public record Diagnostic(String lessonId, String title, String description, List<Question> questions) {}

    public record TrackModule(String id, int position, String title, String objective, List<String> prerequisites,
                              List<TrackActivity> activities) {}

    public record TrackActivity(String id, int position, String kind, String title, int estimatedMinutes,
                                List<String> competences, String lessonId) {}

    public record LessonContent(String id, String title, String description, String transcript) {}

    public record Placement(int position, String assetId, int assetVersion, String usage, String alt, String caption,
                            String transcriptVisibility) {}

    public record ActivityContent(String moduleId, TrackActivity activity, LessonContent lesson,
                                  List<Question> questions, List<Placement> placements) {}
}
