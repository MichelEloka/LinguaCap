package org.linguacap.catalogue;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.catalogue.FilmDocument.EditorDocument;
import org.linguacap.catalogue.FilmDocument.Film;
import org.linguacap.catalogue.FilmDocument.FilmFields;
import org.linguacap.catalogue.FilmDocument.FilmView;
import org.linguacap.catalogue.FilmDocument.Input;
import org.linguacap.catalogue.FilmDocument.Keyword;
import org.linguacap.catalogue.FilmDocument.Sequence;
import org.linguacap.catalogue.FilmDocument.SequenceInput;
import org.linguacap.catalogue.FilmDocument.SequenceView;
import org.linguacap.catalogue.FilmDocument.Summary;
import org.linguacap.catalogue.VersionDocument.Checks;
import org.linguacap.catalogue.VersionDocument.Question;
import org.linguacap.common.HttpError;

/**
 * Films du Ciné-club (EVO-055) : un film s'enregistre d'un bloc avec ses séquences et les leçons « après »
 * (cine-&lt;séquence&gt;, sans version, au niveau du film). Réenregistrer remplace les séquences et les questions ; une
 * séquence retirée du document est supprimée avec sa leçon. Un film publié reste lisible pendant l'enregistrement,
 * qui exige alors un document complet.
 */
@ApplicationScoped
class FilmStore {
    private static final Logger LOG = Logger.getLogger(FilmStore.class);
    private static final String FILM_COLUMNS = """
            f.id, f.language_id, f.level_id, n.code as level_code, f.title, f.description, f.provider, f.video_id,
            f.channel, f.video_url, f.course_url, f.credit, f.license_note, f.duration_seconds, f.position, f.status,
            f.published_at, f.updated_at
            """;

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    /** Tous les films, par niveau puis position (éditeur). */
    List<Summary> summaries() {
        return read("list films", connection -> {
            List<Summary> films = new ArrayList<>();
            try (var query = connection.prepareStatement("""
                    select f.id, f.language_id, f.level_id, n.code as level_code, f.title, f.video_id, f.duration_seconds,
                           f.position, f.status, f.published_at, f.updated_at,
                           (select count(*) from catalogue.film_sequences s where s.film_id = f.id) as sequence_count
                    from catalogue.films f join catalogue.levels n on n.id = f.level_id
                    order by f.language_id, n.position nulls last, n.code, f.position, f.id
                    """); var rows = query.executeQuery()) {
                while (rows.next()) films.add(summary(rows));
            }
            return List.copyOf(films);
        });
    }

    /** Document complet de l'éditeur (questions avec corrigé), avec ce qu'il reste à compléter pour publier. */
    EditorDocument editorDocument(String filmId) {
        return read("read film", connection -> {
            EditorDocument document = editorDocument(connection, filmId);
            if (document == null) throw HttpError.notFound("Film introuvable.");
            return document;
        });
    }

    /**
     * Crée ou remplace un film (document normalisé et structurellement valide). Le niveau doit appartenir à la langue
     * du film ; une leçon ou une séquence d'un parcours ou d'un autre film n'est jamais reprise (409). Un film publié
     * garde son état et exige un document complet.
     */
    void save(Input input, Checks checks, UUID editor) {
        transaction("save film", connection -> {
            save(connection, input, checks, editor);
            return null;
        });
    }

    void save(Connection connection, Input input, Checks checks, UUID editor) throws SQLException {
        FilmFields film = input.film();
        String status = null;
        try (var lock = connection.prepareStatement("select status from catalogue.films where id = ? for update")) {
            lock.setString(1, film.id());
            try (var rows = lock.executeQuery()) {
                if (rows.next()) status = rows.getString(1);
            }
        }
        if ("published".equals(status) && !checks.publishable()) {
            throw HttpError.conflict("Ce film est publié : " + checks.issues().get(0).message()
                    + (checks.issues().size() > 1 ? " (" + checks.issues().size() + " points à compléter)" : "")
                    + " Retirez-le pour l’enregistrer incomplet.");
        }
        try (var level = connection.prepareStatement("select language_id from catalogue.levels where id = ?")) {
            level.setString(1, film.levelId());
            try (var rows = level.executeQuery()) {
                if (!rows.next()) throw HttpError.badRequest("Le niveau " + film.levelId() + " n’existe pas au catalogue.");
                if (!film.languageId().equals(rows.getString(1))) {
                    throw HttpError.badRequest("Le niveau " + film.levelId() + " n’appartient pas à la langue "
                            + film.languageId() + ".");
                }
            }
        }
        List<String> sequenceIds = input.sequences().stream().map(SequenceInput::id).toList();
        List<String> lessonIds = sequenceIds.stream().map(FilmDocument::lessonId).toList();
        checkOwnership(connection, film.id(), sequenceIds, lessonIds);

        try (var upsert = connection.prepareStatement("""
                insert into catalogue.films (id, language_id, level_id, title, description, provider, video_id, channel,
                    video_url, course_url, credit, license_note, duration_seconds, position, created_by)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                on conflict (id) do update set language_id = excluded.language_id, level_id = excluded.level_id,
                    title = excluded.title, description = excluded.description, provider = excluded.provider,
                    video_id = excluded.video_id, channel = excluded.channel, video_url = excluded.video_url,
                    course_url = excluded.course_url, credit = excluded.credit, license_note = excluded.license_note,
                    duration_seconds = excluded.duration_seconds, position = excluded.position, updated_at = now()
                """)) {
            upsert.setString(1, film.id());
            upsert.setString(2, film.languageId());
            upsert.setString(3, film.levelId());
            upsert.setString(4, film.title());
            upsert.setString(5, film.description());
            upsert.setString(6, film.provider());
            upsert.setString(7, film.videoId());
            upsert.setString(8, film.channel());
            upsert.setString(9, film.videoUrl());
            upsert.setString(10, film.courseUrl());
            upsert.setString(11, film.credit());
            upsert.setString(12, film.licenseNote());
            upsert.setInt(13, film.durationSeconds());
            upsert.setInt(14, film.position());
            upsert.setObject(15, editor);
            upsert.executeUpdate();
        }

        Set<String> previous = new LinkedHashSet<>();
        try (var query = connection.prepareStatement("select lesson_id from catalogue.film_sequences where film_id = ?")) {
            query.setString(1, film.id());
            try (var rows = query.executeQuery()) {
                while (rows.next()) previous.add(rows.getString(1));
            }
        }
        Set<String> touched = new LinkedHashSet<>(previous);
        touched.addAll(lessonIds);
        Set<String> removed = new LinkedHashSet<>(previous);
        lessonIds.forEach(removed::remove);
        execute(connection, "delete from catalogue.film_sequences where film_id = ?", film.id());
        execute(connection, "delete from catalogue.options where lesson_id = any(?)", touched);
        execute(connection, "delete from catalogue.questions where lesson_id = any(?)", touched);
        execute(connection, "delete from catalogue.lessons where id = any(?) and version_id is null", removed);

        try (var lessons = connection.prepareStatement("""
                     insert into catalogue.lessons (id, level_id, title, description, transcript, media_ids, version_id)
                     values (?, ?, ?, ?, '', '{}', null)
                     on conflict (id) do update set level_id = excluded.level_id, title = excluded.title,
                         description = excluded.description, transcript = '', media_ids = '{}'
                     where catalogue.lessons.version_id is null
                     """);
             var sequences = connection.prepareStatement("""
                     insert into catalogue.film_sequences (id, film_id, position, title, start_seconds, end_seconds,
                         bounds_approx, context, keywords, lesson_id)
                     values (?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?)
                     """);
             var questions = connection.prepareStatement("""
                     insert into catalogue.questions (lesson_id, id, position, prompt, module_ref, type, explanation, spec)
                     values (?, ?, ?, ?, ?, ?, ?, ?::jsonb)
                     """);
             var options = connection.prepareStatement("""
                     insert into catalogue.options (lesson_id, question_id, id, position, label, correct, feedback)
                     values (?, ?, ?, ?, ?, ?, ?)
                     """)) {
            for (SequenceInput sequence : input.sequences()) {
                String lessonId = FilmDocument.lessonId(sequence.id());
                lessons.setString(1, lessonId);
                lessons.setString(2, film.levelId());
                lessons.setString(3, sequence.title().isEmpty() ? "Séquence " + sequence.position() : sequence.title());
                lessons.setString(4, sequence.context());
                lessons.addBatch();
                sequences.setString(1, sequence.id());
                sequences.setString(2, film.id());
                sequences.setInt(3, sequence.position());
                sequences.setString(4, sequence.title());
                sequences.setInt(5, sequence.start());
                sequences.setInt(6, sequence.end());
                sequences.setBoolean(7, Boolean.TRUE.equals(sequence.approx()));
                sequences.setString(8, sequence.context());
                sequences.setString(9, write(sequence.keywords()));
                sequences.setString(10, lessonId);
                sequences.addBatch();
                AuthoringStore.addQuestions(questions, options, lessonId, sequence.questions(), false);
            }
            for (var batch : List.of(lessons, sequences, questions, options)) batch.executeBatch();
        }
    }

    /**
     * Publie un film complet ; ses séquences deviennent lisibles et corrigeables par toute session. Publier un film déjà
     * publié ne change rien (import idempotent).
     */
    Summary publish(String filmId) {
        return transaction("publish film", connection -> publish(connection, filmId));
    }

    Summary publish(Connection connection, String filmId) throws SQLException {
        String status = lockStatus(connection, filmId);
        if ("published".equals(status)) return summary(connection, filmId);
        EditorDocument document = editorDocument(connection, filmId);
        if (!document.checks().publishable()) throw HttpError.conflict(FilmDocument.refusal(document.checks()));
        try (var update = connection.prepareStatement("""
                update catalogue.films set status = 'published', published_at = now(), updated_at = now() where id = ?
                """)) {
            update.setString(1, filmId);
            update.executeUpdate();
        }
        return summary(connection, filmId);
    }

    /** Retire un film : il repasse en brouillon ; les remises passées gardent leur corrigé (Évaluations). */
    Summary retire(String filmId) {
        return transaction("retire film", connection -> retire(connection, filmId));
    }

    Summary retire(Connection connection, String filmId) throws SQLException {
        String status = lockStatus(connection, filmId);
        if (!"published".equals(status)) throw HttpError.conflict("Seul un film publié peut être retiré.");
        try (var update = connection.prepareStatement("""
                update catalogue.films set status = 'draft', published_at = null, updated_at = now() where id = ?
                """)) {
            update.setString(1, filmId);
            update.executeUpdate();
        }
        return summary(connection, filmId);
    }

    /**
     * Films publiés dont le niveau est publié, par langue, position du niveau puis du film ; séquences sans questions
     * (questions null). languageId et levelCode sont facultatifs.
     */
    List<Film> published(String languageId, String levelCode) {
        return read("list published films", connection -> published(connection, languageId, levelCode));
    }

    List<Film> published(Connection connection, String languageId, String levelCode) throws SQLException {
        List<FilmView> films = new ArrayList<>();
        try (var query = connection.prepareStatement("select " + FILM_COLUMNS + """
                from catalogue.films f join catalogue.levels n on n.id = f.level_id
                where f.status = 'published' and n.status = 'published'
                  and (?::text is null or f.language_id = ?) and (?::text is null or n.code = ?)
                order by f.language_id, n.position nulls last, n.code, f.position, f.id
                """)) {
            query.setString(1, languageId);
            query.setString(2, languageId);
            query.setString(3, levelCode);
            query.setString(4, levelCode);
            try (var rows = query.executeQuery()) {
                while (rows.next()) films.add(filmView(rows));
            }
        }
        if (films.isEmpty()) return List.of();
        Map<String, List<Sequence>> sequences = sequences(connection, films.stream().map(FilmView::id).toList(), false);
        return films.stream().map(film -> film(film, sequences.getOrDefault(film.id(), List.of()))).toList();
    }

    /**
     * Film avec les vues élève des questions de chaque séquence (aucun corrigé). Hors aperçu de l'éditeur (preview),
     * seul un film publié d'un niveau publié est servi ; null sinon.
     */
    Film film(String filmId, boolean preview) {
        return read("read published film", connection -> film(connection, filmId, preview));
    }

    Film film(Connection connection, String filmId, boolean preview) throws SQLException {
        FilmView film;
        try (var query = connection.prepareStatement("select " + FILM_COLUMNS + """
                from catalogue.films f join catalogue.levels n on n.id = f.level_id
                where f.id = ? and (? or f.status = 'published' and n.status = 'published')
                """)) {
            query.setString(1, filmId);
            query.setBoolean(2, preview);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return null;
                film = filmView(rows);
            }
        }
        return film(film, sequences(connection, List.of(filmId), true).getOrDefault(filmId, List.of()));
    }

    /** Une leçon ou une séquence déjà rattachée à un parcours ou à un autre film n'est jamais reprise. */
    private static void checkOwnership(Connection connection, String filmId, List<String> sequenceIds, List<String> lessonIds)
            throws SQLException {
        if (sequenceIds.isEmpty()) return;
        try (var query = connection.prepareStatement("""
                select s.id, s.film_id from catalogue.film_sequences s where s.id = any(?) and s.film_id <> ?
                """)) {
            query.setArray(1, connection.createArrayOf("text", sequenceIds.toArray()));
            query.setString(2, filmId);
            try (var rows = query.executeQuery()) {
                if (rows.next()) {
                    throw HttpError.conflict("La séquence " + rows.getString(1) + " appartient au film " + rows.getString(2) + ".");
                }
            }
        }
        try (var query = connection.prepareStatement("""
                select l.id, l.version_id, s.film_id from catalogue.lessons l
                left join catalogue.film_sequences s on s.lesson_id = l.id
                where l.id = any(?) and (l.version_id is not null or s.film_id is not null and s.film_id <> ?)
                """)) {
            query.setArray(1, connection.createArrayOf("text", lessonIds.toArray()));
            query.setString(2, filmId);
            try (var rows = query.executeQuery()) {
                if (rows.next()) {
                    throw HttpError.conflict("La leçon " + rows.getString(1) + (rows.getObject(2) != null
                            ? " appartient à un parcours." : " appartient au film " + rows.getString(3) + "."));
                }
            }
        }
    }

    EditorDocument editorDocument(Connection connection, String filmId) throws SQLException {
        FilmView film;
        try (var query = connection.prepareStatement("select " + FILM_COLUMNS + """
                from catalogue.films f join catalogue.levels n on n.id = f.level_id where f.id = ?
                """)) {
            query.setString(1, filmId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return null;
                film = filmView(rows);
            }
        }
        List<SequenceView> sequences = new ArrayList<>();
        try (var query = connection.prepareStatement("""
                select id, position, title, start_seconds, end_seconds, bounds_approx, context, keywords::text as keywords,
                       lesson_id
                from catalogue.film_sequences where film_id = ? order by position
                """)) {
            query.setString(1, filmId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    sequences.add(new SequenceView(rows.getString("id"), rows.getInt("position"), rows.getString("title"),
                            rows.getInt("start_seconds"), rows.getInt("end_seconds"), rows.getBoolean("bounds_approx"),
                            rows.getString("context"), keywords(rows.getString("keywords")), rows.getString("lesson_id"),
                            List.of()));
                }
            }
        }
        List<SequenceView> withQuestions = new ArrayList<>();
        for (SequenceView sequence : sequences) {
            withQuestions.add(new SequenceView(sequence.id(), sequence.position(), sequence.title(), sequence.start(),
                    sequence.end(), sequence.approx(), sequence.context(), sequence.keywords(), sequence.lessonId(),
                    QuestionViews.read(connection, sequence.lessonId())));
        }
        Checks checks = FilmDocument.check(new Input(FilmDocument.FORMAT, fields(film), withQuestions.stream()
                .map(sequence -> new SequenceInput(sequence.id(), sequence.position(), sequence.title(), sequence.start(),
                        sequence.end(), sequence.approx(), sequence.context(), sequence.keywords(), sequence.questions()))
                .toList()));
        return new EditorDocument(film, List.copyOf(withQuestions), checks);
    }

    private static FilmFields fields(FilmView film) {
        return new FilmFields(film.id(), film.languageId(), film.levelId(), film.title(), film.description(),
                film.provider(), film.videoId(), film.channel(), film.videoUrl(), film.courseUrl(), film.credit(),
                film.licenseNote(), film.durationSeconds(), film.position());
    }

    /** Séquences des films, rangées par film ; avec les vues élève des questions si withQuestions, sinon null. */
    private Map<String, List<Sequence>> sequences(Connection connection, List<String> filmIds, boolean withQuestions)
            throws SQLException {
        Map<String, List<Sequence>> result = new LinkedHashMap<>();
        List<Sequence> all = new ArrayList<>();
        try (var query = connection.prepareStatement("""
                select s.id, s.film_id, s.position, s.title, s.start_seconds, s.end_seconds, s.bounds_approx, s.context,
                       s.keywords::text as keywords, s.lesson_id,
                       (select count(*) from catalogue.questions q where q.lesson_id = s.lesson_id) as question_count
                from catalogue.film_sequences s where s.film_id = any(?) order by s.film_id, s.position
                """)) {
            query.setArray(1, connection.createArrayOf("text", filmIds.toArray()));
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    all.add(new Sequence(rows.getString("id"), rows.getString("film_id"), rows.getInt("position"),
                            rows.getString("title"), rows.getInt("start_seconds"), rows.getInt("end_seconds"),
                            rows.getBoolean("bounds_approx"), rows.getString("context"), keywords(rows.getString("keywords")),
                            rows.getString("lesson_id"), rows.getInt("question_count"), null));
                }
            }
        }
        for (Sequence sequence : all) {
            Sequence served = sequence;
            if (withQuestions) {
                List<QuestionViews.View> views = QuestionViews.publicViews(sequence.lessonId(),
                        QuestionViews.read(connection, sequence.lessonId()));
                served = new Sequence(sequence.id(), sequence.filmId(), sequence.position(), sequence.title(),
                        sequence.start(), sequence.end(), sequence.approx(), sequence.context(), sequence.keywords(),
                        sequence.lessonId(), views.size(), views);
            }
            result.computeIfAbsent(sequence.filmId(), key -> new ArrayList<>()).add(served);
        }
        return result;
    }

    private static Film film(FilmView film, List<Sequence> sequences) {
        return new Film(film.id(), film.languageId(), film.levelId(), film.levelCode(), film.title(), film.description(),
                film.provider(), film.videoId(), film.channel(), film.videoUrl(), film.courseUrl(), film.credit(),
                film.licenseNote(), film.durationSeconds(), film.position(), List.copyOf(sequences));
    }

    private static FilmView filmView(ResultSet rows) throws SQLException {
        return new FilmView(rows.getString("id"), rows.getString("language_id"), rows.getString("level_id"),
                rows.getString("level_code"), rows.getString("title"), rows.getString("description"),
                rows.getString("provider"), rows.getString("video_id"), rows.getString("channel"),
                rows.getString("video_url"), rows.getString("course_url"), rows.getString("credit"),
                rows.getString("license_note"), rows.getInt("duration_seconds"), rows.getInt("position"),
                rows.getString("status"), text(rows.getObject("published_at", OffsetDateTime.class)),
                text(rows.getObject("updated_at", OffsetDateTime.class)));
    }

    private static Summary summary(ResultSet rows) throws SQLException {
        return new Summary(rows.getString("id"), rows.getString("language_id"), rows.getString("level_id"),
                rows.getString("level_code"), rows.getString("title"), rows.getString("video_id"),
                rows.getInt("duration_seconds"), rows.getInt("position"), rows.getString("status"),
                rows.getInt("sequence_count"), text(rows.getObject("published_at", OffsetDateTime.class)),
                text(rows.getObject("updated_at", OffsetDateTime.class)));
    }

    private static Summary summary(Connection connection, String filmId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select f.id, f.language_id, f.level_id, n.code as level_code, f.title, f.video_id, f.duration_seconds,
                       f.position, f.status, f.published_at, f.updated_at,
                       (select count(*) from catalogue.film_sequences s where s.film_id = f.id) as sequence_count
                from catalogue.films f join catalogue.levels n on n.id = f.level_id where f.id = ?
                """)) {
            query.setString(1, filmId);
            try (var rows = query.executeQuery()) {
                rows.next();
                return summary(rows);
            }
        }
    }

    private static String lockStatus(Connection connection, String filmId) throws SQLException {
        try (var lock = connection.prepareStatement("select status from catalogue.films where id = ? for update")) {
            lock.setString(1, filmId);
            try (var rows = lock.executeQuery()) {
                if (!rows.next()) throw HttpError.notFound("Film introuvable.");
                return rows.getString(1);
            }
        }
    }

    private static void execute(Connection connection, String sql, String value) throws SQLException {
        try (var statement = connection.prepareStatement(sql)) {
            statement.setString(1, value);
            statement.executeUpdate();
        }
    }

    private static void execute(Connection connection, String sql, Set<String> values) throws SQLException {
        if (values.isEmpty()) return;
        try (var statement = connection.prepareStatement(sql)) {
            statement.setArray(1, connection.createArrayOf("text", values.toArray()));
            statement.executeUpdate();
        }
    }

    private List<Keyword> keywords(String value) throws SQLException {
        if (value == null || value.isBlank()) return List.of();
        try {
            return List.copyOf(json.readValue(value, new TypeReference<List<Keyword>>() {}));
        } catch (JsonProcessingException error) {
            throw new SQLException("Mots-clés illisibles", "XX000", error);
        }
    }

    private String write(List<Keyword> keywords) throws SQLException {
        try {
            return json.writeValueAsString(keywords);
        } catch (JsonProcessingException error) {
            throw new SQLException("Mots-clés non sérialisables", "XX000", error);
        }
    }

    private static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }

    private <T> T read(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            return work.run(connection);
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    private <T> T transaction(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                T result = work.run(connection);
                connection.commit();
                return result;
            } catch (SQLException | RuntimeException error) {
                connection.rollback();
                throw error;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    private static RuntimeException failure(String operation, SQLException error) {
        LOG.errorf("Catalogue film operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        if ("23505".equals(error.getSQLState())) {
            return HttpError.conflict("Un film enregistré en même temps utilise déjà l’une de ces séquences : réessayez.");
        }
        if ("23514".equals(error.getSQLState()) || "23503".equals(error.getSQLState())) {
            return HttpError.badRequest("Le document de film ne respecte pas les règles du catalogue.");
        }
        return HttpError.unavailable("Le catalogue est temporairement indisponible.");
    }
}
