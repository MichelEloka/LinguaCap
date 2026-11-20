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

    @Inject
    AgroalDataSource dataSource;

    @Inject
    Actor actor;

    @Inject
    IdentityClient identities;

    @GET
    @Path("/levels")
    public List<Level> levels() {
        boolean admin = isAdmin();
        String sql = "select " + LEVEL_COLUMNS + " from catalogue.levels"
                + " where status = 'published' or ? order by code";
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

    @POST
    @Path("/levels/{id}/publish")
    public Level publishLevel(@PathParam("id") String id) {
        requireAdmin();
        if (!id.matches("[abc][12]")) {
            throw HttpError.badRequest("Identifiant de niveau invalide.");
        }
        try (var connection = dataSource.getConnection();
             var update = connection.prepareStatement("""
                     update catalogue.levels level
                     set status = 'published'
                     where level.id = ? and level.status = 'draft'
                       and exists (select 1 from catalogue.lessons lesson where lesson.level_id = level.id)
                     returning
                     """ + LEVEL_COLUMNS)) {
            update.setString(1, id);
            try (var rows = update.executeQuery()) {
                if (rows.next()) {
                    return readLevel(rows);
                }
            }
            try (var lookup = connection.prepareStatement(
                    "select " + LEVEL_COLUMNS + " from catalogue.levels where id = ?")) {
                lookup.setString(1, id);
                try (var rows = lookup.executeQuery()) {
                    if (!rows.next()) {
                        throw HttpError.notFound("Niveau introuvable.");
                    }
                    Level level = readLevel(rows);
                    if ("published".equals(level.status())) {
                        return level;
                    }
                }
            }
            throw HttpError.conflict("Ajoutez au moins une leçon avant de publier ce niveau.");
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
                     where l.id = ? and (n.status = 'published' or ?)
                     """)) {
            query.setString(1, id);
            query.setBoolean(2, admin);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) {
                    throw HttpError.notFound("Leçon introuvable.");
                }
                return new Lesson(rows.getString("id"), rows.getString("title"),
                        rows.getString("code"), rows.getString("description"),
                        rows.getString("transcript"),
                        List.of((String[]) rows.getArray("media_ids").getArray()),
                        readQuestions(connection, id));
            }
        } catch (SQLException error) {
            throw HttpError.unavailable("La leçon est temporairement indisponible.");
        }
    }

    @GET
    @Path("/internal/lessons/{id}/answer-key")
    public AnswerKey answerKey(@PathParam("id") String id) {
        actor.id();
        validateLessonId(id);
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement("""
                     select o.question_id, o.id
                     from catalogue.options o
                     join catalogue.lessons l on l.id = o.lesson_id
                     join catalogue.levels n on n.id = l.level_id
                     where o.lesson_id = ? and o.correct and n.status = 'published'
                     """)) {
            query.setString(1, id);
            try (var rows = query.executeQuery()) {
                Map<String, String> answers = new LinkedHashMap<>();
                while (rows.next()) {
                    answers.put(rows.getString("question_id"), rows.getString("id"));
                }
                if (answers.isEmpty()) {
                    throw HttpError.notFound("Corrigé indisponible pour cette leçon.");
                }
                return new AnswerKey(Map.copyOf(answers));
            }
        } catch (SQLException error) {
            throw HttpError.unavailable("Le corrigé est temporairement indisponible.");
        }
    }

    private List<Question> readQuestions(Connection connection, String lessonId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select q.id as question_id, q.prompt, o.id as option_id, o.label
                from catalogue.questions q
                join catalogue.options o on o.lesson_id = q.lesson_id and o.question_id = q.id
                where q.lesson_id = ?
                order by q.position, o.position
                """)) {
            query.setString(1, lessonId);
            try (var rows = query.executeQuery()) {
                Map<String, Question> questions = new LinkedHashMap<>();
                while (rows.next()) {
                    String id = rows.getString("question_id");
                    Question question = questions.get(id);
                    if (question == null) {
                        question = new Question(id, rows.getString("prompt"), new ArrayList<>());
                        questions.put(id, question);
                    }
                    question.options().add(new Option(rows.getString("option_id"), rows.getString("label")));
                }
                return List.copyOf(questions.values());
            }
        }
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
    public record Lesson(String id, String title, String level, String description, String transcript,
                         List<String> mediaIds, List<Question> questions) {}
    public record Question(String id, String prompt, List<Option> options) {}
    public record Option(String id, String text) {}
    public record AnswerKey(Map<String, String> answers) {}
}
