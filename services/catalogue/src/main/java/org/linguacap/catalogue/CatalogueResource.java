package org.linguacap.catalogue;

import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.Permissions;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Path("/v1")
@Produces(MediaType.APPLICATION_JSON)
public class CatalogueResource {
    private static final String LEVEL_COLUMNS = "id, code, title, status, description, version";
    /**
     * Leçon lisible hors édition (alias l : leçon, n : niveau, v : version jointe à gauche) : leçon d'une version
     * publiée ou retirée (les élèves inscrits gardent leur version, même si le niveau est repassé en brouillon au
     * retrait de sa dernière version publiée), ou leçon historique sans version d'un niveau publié.
     */
    static final String READABLE_LESSON =
            "(l.version_id is not null and v.status in ('published', 'retired') or l.version_id is null and n.status = 'published')";
    /**
     * Leçon dont le corrigé des questions à choix est servi à Évaluations : comme avant, toute leçon d'un niveau
     * publié, et aussi celles d'une version publiée ou retirée d'un niveau repassé en brouillon (élèves inscrits).
     */
    static final String KEYED_LESSON =
            "(n.status = 'published' or l.version_id is not null and v.status in ('published', 'retired'))";

    @Inject
    AgroalDataSource dataSource;

    @Inject
    Actor actor;

    @Inject
    IdentityClient identities;

    /**
     * Niveaux du catalogue dans l'ordre de leur position (sans position : en dernier, par code). Un niveau est publié
     * tant qu'il a une version publiée : le retrait de sa dernière version le repasse en brouillon (AuthoringStore).
     * Les éditeurs voient aussi les brouillons.
     */
    @GET
    @Path("/levels")
    public List<Level> levels() {
        boolean admin = isAdmin();
        String sql = "select " + LEVEL_COLUMNS + " from catalogue.levels"
                + " where status = 'published' or ? order by position nulls last, code";
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement(sql)) {
            query.setBoolean(1, admin);
            try (var rows = query.executeQuery()) {
                var levels = new ArrayList<Level>();
                while (rows.next()) {
                    levels.add(readLevel(rows));
                }
                return levels;
            }
        } catch (SQLException error) {
            throw HttpError.unavailable("Le catalogue est temporairement indisponible.");
        }
    }

    @POST
    @Path("/levels")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createLevel(CreateLevel body) {
        requireAdmin();
        if (body == null || body.code() == null || body.title() == null) {
            throw HttpError.badRequest("Le code et le titre du niveau sont requis.");
        }
        String code = body.code().strip().toUpperCase(Locale.ROOT);
        String title = body.title().strip();
        String description = body.description() == null ? "" : body.description().strip();
        if (!code.matches("[ABC][12]") || title.isEmpty()
                || title.length() > 120 || description.length() > 2000) {
            throw HttpError.badRequest("Vérifiez le code CECRL, le titre et la description.");
        }

        String sql = """
                insert into catalogue.levels (id, code, title, description)
                values (?, ?, ?, ?)
                on conflict (code) do nothing
                returning
                """ + LEVEL_COLUMNS;
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement(sql)) {
            query.setString(1, code.toLowerCase(Locale.ROOT));
            query.setString(2, code);
            query.setString(3, title);
            query.setString(4, description);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) {
                    throw HttpError.conflict("Ce niveau existe déjà.");
                }
                return Response.status(Response.Status.CREATED).entity(readLevel(rows)).build();
            }
        } catch (SQLException error) {
            throw HttpError.unavailable("Le catalogue est temporairement indisponible.");
        }
    }

    @GET
    @Path("/lessons/{id}")
    public Lesson lesson(@PathParam("id") String id) {
        validateLessonId(id);
        boolean admin = isAdmin();
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement("""
                     select l.id, l.title, n.code, l.description, l.transcript, l.media_ids
                     from catalogue.lessons l
                     join catalogue.levels n on n.id = l.level_id
                     left join catalogue.track_versions v on v.id = l.version_id
                     where l.id = ? and (? or %s)
                     """.formatted(READABLE_LESSON))) {
            query.setString(1, id);
            query.setBoolean(2, admin);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) {
                    throw HttpError.notFound("Leçon introuvable.");
                }
                // La transcription d'un exercice peut contenir la réponse (dictée, écoute) : l'élève la reçoit par sa
                // séance ou la bibliothèque, qui appliquent sa visibilité ; cette route ne la sert qu'aux éditeurs.
                return new Lesson(rows.getString("id"), rows.getString("title"),
                        rows.getString("code"), rows.getString("description"),
                        admin ? rows.getString("transcript") : null,
                        List.of((String[]) rows.getArray("media_ids").getArray()),
                        readQuestions(connection, id));
            }
        } catch (SQLException error) {
            throw HttpError.unavailable("La leçon est temporairement indisponible.");
        }
    }

    /**
     * Corrigé des questions à choix d'une leçon (quiz et diagnostic). typed : la leçon contient des questions typées,
     * qui se corrigent par la clé d'exercice (exercise-key) ; Évaluations refuse alors la remise en quiz.
     */
    @GET
    @Path("/internal/lessons/{id}/answer-key")
    public AnswerKey answerKey(@PathParam("id") String id) {
        actor.id();
        validateLessonId(id);
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement("""
                     select o.question_id, o.id, q.module_ref
                     from catalogue.options o
                     join catalogue.questions q on q.lesson_id = o.lesson_id and q.id = o.question_id
                     join catalogue.lessons l on l.id = o.lesson_id
                     join catalogue.levels n on n.id = l.level_id
                     left join catalogue.track_versions v on v.id = l.version_id
                     where o.lesson_id = ? and o.correct and q.type = 'choice' and %s
                     """.formatted(KEYED_LESSON));
             var typedQuery = connection.prepareStatement("""
                     select exists (
                         select 1 from catalogue.questions q
                         join catalogue.lessons l on l.id = q.lesson_id
                         join catalogue.levels n on n.id = l.level_id
                         left join catalogue.track_versions v on v.id = l.version_id
                         where q.lesson_id = ? and q.type <> 'choice' and %s)
                     """.formatted(KEYED_LESSON))) {
            query.setString(1, id);
            typedQuery.setString(1, id);
            boolean typed;
            try (var rows = typedQuery.executeQuery()) {
                typed = rows.next() && rows.getBoolean(1);
            }
            try (var rows = query.executeQuery()) {
                Map<String, String> answers = new LinkedHashMap<>();
                Map<String, String> modules = new LinkedHashMap<>();
                while (rows.next()) {
                    answers.put(rows.getString("question_id"), rows.getString("id"));
                    if (rows.getString("module_ref") != null) modules.put(rows.getString("question_id"), rows.getString("module_ref"));
                }
                if (answers.isEmpty() && !typed) {
                    throw HttpError.notFound("Corrigé indisponible pour cette leçon.");
                }
                return new AnswerKey(Map.copyOf(answers), Map.copyOf(modules), typed);
            }
        } catch (SQLException error) {
            throw HttpError.unavailable("Le corrigé est temporairement indisponible.");
        }
    }

    /** Vues élève des questions d'une leçon, sans aucun corrigé (voir {@link QuestionViews}). */
    static List<QuestionViews.View> readQuestions(Connection connection, String lessonId) throws SQLException {
        return QuestionViews.publicViews(lessonId, QuestionViews.read(connection, lessonId));
    }

    private static Level readLevel(ResultSet row) throws SQLException {
        return new Level(row.getString("id"), row.getString("code"), row.getString("title"),
                row.getString("status"), row.getString("description"), row.getInt("version"));
    }

    private static void validateLessonId(String id) {
        if (!id.matches("[a-z0-9-]{1,64}")) {
            throw HttpError.badRequest("Identifiant de leçon invalide.");
        }
    }

    /** Administration ou permission Catalogue : édition et lecture des brouillons. */
    private boolean isAdmin() {
        return Permissions.canEditCatalogue(identities.current(actor.id()));
    }

    private void requireAdmin() {
        if (!isAdmin()) {
            throw HttpError.forbidden("L’édition du catalogue requiert la permission Catalogue.");
        }
    }

    public record CreateLevel(String code, String title, String description) {}
    public record Level(String id, String code, String title, String status, String description, int version) {}
    /** questions : vues élève typées (QuestionViews.View), sans corrigé. */
    public record Lesson(String id, String title, String level, String description, String transcript,
                         List<String> mediaIds, List<QuestionViews.View> questions) {}
    /**
     * answers : bonne option de chaque question à choix ; modules : pour un diagnostic, le module (ou « prerequis »)
     * que chaque question évalue ; typed : la leçon contient des questions typées (corrigées par exercise-key).
     */
    public record AnswerKey(Map<String, String> answers, Map<String, String> modules, boolean typed) {}
}
