package org.linguacap.catalogue;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Array;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.catalogue.VersionDocument.Activity;
import org.linguacap.catalogue.VersionDocument.Assessment;
import org.linguacap.catalogue.VersionDocument.MediaRef;
import org.linguacap.catalogue.VersionDocument.Part;
import org.linguacap.catalogue.VersionDocument.Diagnostic;
import org.linguacap.catalogue.VersionDocument.Lesson;
import org.linguacap.catalogue.VersionDocument.Mission;
import org.linguacap.catalogue.VersionDocument.Module;
import org.linguacap.catalogue.VersionDocument.Option;
import org.linguacap.catalogue.VersionDocument.Placement;
import org.linguacap.catalogue.VersionDocument.Question;
import org.linguacap.catalogue.VersionDocument.Settings;
import org.linguacap.catalogue.VersionDocument.VocabularyEntry;
import org.linguacap.common.HttpError;

/** Édition des versions de parcours : un brouillon s'enregistre d'un bloc, une version publiée est figée. */
@ApplicationScoped
class AuthoringStore {
    private static final Logger LOG = Logger.getLogger(AuthoringStore.class);

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    public record VersionSummary(UUID id, int number, String status, String publishedAt, String retiredAt, String updatedAt) {}

    public record LevelView(String id, String code, String title, String description, Integer position, String status,
                     String prerequisiteLevelId, String prerequisiteLevelCode, List<VersionSummary> versions) {}

    public record Published(VersionSummary version, List<MediaRef> media) {}

    List<LevelView> levels() {
        return read("list levels", connection -> {
            Map<String, LevelView> levels = new LinkedHashMap<>();
            try (var query = connection.prepareStatement("""
                    select l.id, l.code, l.title, l.description, l.position, l.status, l.prerequisite_level_id,
                           p.code as prerequisite_code
                    from catalogue.levels l left join catalogue.levels p on p.id = l.prerequisite_level_id
                    order by l.position nulls last, l.code
                    """); var rows = query.executeQuery()) {
                while (rows.next()) {
                    levels.put(rows.getString("id"), new LevelView(rows.getString("id"), rows.getString("code"),
                            rows.getString("title"), rows.getString("description"), (Integer) rows.getObject("position"),
                            rows.getString("status"), rows.getString("prerequisite_level_id"),
                            rows.getString("prerequisite_code"), new ArrayList<>()));
                }
            }
            try (var query = connection.prepareStatement("""
                    select id, level_id, number, status, published_at, retired_at, updated_at
                    from catalogue.track_versions order by level_id, number desc
                    """); var rows = query.executeQuery()) {
                while (rows.next()) {
                    LevelView level = levels.get(rows.getString("level_id"));
                    if (level != null) level.versions().add(summary(rows));
                }
            }
            return List.copyOf(levels.values());
        });
    }

    /** Ordre, titre et prérequis d'un niveau (DEV-047). */
    void updateLevel(String levelId, String title, String description, Integer position, String prerequisiteLevelId) {
        transaction("update level", connection -> {
            if (prerequisiteLevelId != null && wouldLoop(connection, levelId, prerequisiteLevelId)) {
                throw HttpError.badRequest("Ce prérequis créerait une boucle entre niveaux.");
            }
            try (var update = connection.prepareStatement("""
                    update catalogue.levels set title = ?, description = ?, position = ?, prerequisite_level_id = ?
                    where id = ?
                    """)) {
                update.setString(1, title);
                update.setString(2, description);
                update.setObject(3, position);
                update.setString(4, prerequisiteLevelId);
                update.setString(5, levelId);
                if (update.executeUpdate() == 0) throw HttpError.notFound("Niveau introuvable.");
            }
            return null;
        });
    }

    /** Nouveau brouillon : vide, ou copie d'une version (contenus recopiés sous de nouveaux identifiants). */
    UUID createDraft(String levelId, UUID fromVersionId, UUID createdBy) {
        VersionDocument source = fromVersionId == null ? null : document(fromVersionId);
        if (source != null && !source.levelId().equals(levelId)) {
            throw HttpError.badRequest("La version copiée appartient à un autre niveau.");
        }
        UUID id = transaction("create draft", connection -> {
            try (var lock = connection.prepareStatement("select id from catalogue.levels where id = ? for update")) {
                lock.setString(1, levelId);
                try (var rows = lock.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Niveau introuvable.");
                }
            }
            try (var existing = connection.prepareStatement(
                    "select 1 from catalogue.track_versions where level_id = ? and status = 'draft'")) {
                existing.setString(1, levelId);
                try (var rows = existing.executeQuery()) {
                    if (rows.next()) throw HttpError.conflict("Un brouillon existe déjà pour ce niveau : reprenez-le.");
                }
            }
            try (var insert = connection.prepareStatement("""
                    insert into catalogue.track_versions (level_id, number, created_by)
                    select ?, coalesce(max(number), 0) + 1, ? from catalogue.track_versions where level_id = ?
                    returning id
                    """)) {
                insert.setString(1, levelId);
                insert.setObject(2, createdBy);
                insert.setString(3, levelId);
                try (var rows = insert.executeQuery()) {
                    rows.next();
                    return rows.getObject(1, UUID.class);
                }
            }
        });
        if (source != null) save(id, source.settings(), source.diagnostic(), source.modules(), source.assessments());
        return id;
    }

    VersionDocument document(UUID versionId) {
        return read("read version", connection -> {
            String levelId;
            String levelCode;
            String levelTitle;
            int number;
            String status;
            String publishedAt;
            String updatedAt;
            String diagnosticLesson;
            Settings settings;
            try (var query = connection.prepareStatement("""
                    select v.level_id, l.code, l.title, v.number, v.status, v.published_at, v.updated_at,
                           v.expected_competences, v.success_criteria, v.pass_percent, v.review_minutes,
                           v.midterm_minutes, v.final_minutes, v.diagnostic_lesson_id
                    from catalogue.track_versions v join catalogue.levels l on l.id = v.level_id where v.id = ?
                    """)) {
                query.setObject(1, versionId);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Version introuvable.");
                    levelId = rows.getString("level_id");
                    levelCode = rows.getString("code");
                    levelTitle = rows.getString("title");
                    number = rows.getInt("number");
                    status = rows.getString("status");
                    publishedAt = text(rows.getObject("published_at", OffsetDateTime.class));
                    updatedAt = text(rows.getObject("updated_at", OffsetDateTime.class));
                    diagnosticLesson = rows.getString("diagnostic_lesson_id");
                    settings = new Settings(texts(rows.getArray("expected_competences")), rows.getString("success_criteria"),
                            rows.getInt("pass_percent"), rows.getInt("review_minutes"), rows.getInt("midterm_minutes"),
                            rows.getInt("final_minutes"));
                }
            }
            Diagnostic diagnostic = null;
            if (diagnosticLesson != null) {
                try (var query = connection.prepareStatement("select title, description from catalogue.lessons where id = ?")) {
                    query.setString(1, diagnosticLesson);
                    try (var rows = query.executeQuery()) {
                        if (rows.next()) {
                            diagnostic = new Diagnostic(rows.getString("title"), rows.getString("description"),
                                    QuestionViews.read(connection, diagnosticLesson));
                        }
                    }
                }
            }
            Map<String, List<Placement>> placements = placements(connection, versionId);
            Map<String, List<Question>> versionQuestions = versionQuestions(connection, versionId);
            Map<String, List<Activity>> activities = new LinkedHashMap<>();
            try (var query = connection.prepareStatement("""
                    select a.module_id, a.id, a.kind, a.title, a.estimated_minutes, a.competences, a.lesson_id,
                           a.mission::text as mission, l.title as lesson_title, l.description, l.transcript
                    from catalogue.activities a left join catalogue.lessons l on l.id = a.lesson_id
                    where a.version_id = ? order by a.module_id, a.position
                    """)) {
                query.setObject(1, versionId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        String lessonId = rows.getString("lesson_id");
                        String kind = rows.getString("kind");
                        Lesson lesson = lessonId == null ? null : new Lesson(rows.getString("lesson_title"),
                                rows.getString("description"), rows.getString("transcript"));
                        List<Question> questions = lessonId == null || "lesson".equals(kind) || "mission".equals(kind)
                                ? List.of() : versionQuestions.getOrDefault(lessonId, List.of());
                        // La consigne, le texte à lire et la transcription d'un exercice sont rendus comme ceux d'une leçon :
                        // une nouvelle version les reprend et l'éditeur les affiche.
                        activities.computeIfAbsent(rows.getString("module_id"), key -> new ArrayList<>())
                                .add(new Activity(rows.getString("id"), kind, rows.getString("title"),
                                        rows.getInt("estimated_minutes"), texts(rows.getArray("competences")), lesson, questions,
                                        placements.getOrDefault(rows.getString("id"), List.of()),
                                        readJson(rows.getString("mission"), Mission.class)));
                    }
                }
            }
            List<Module> modules = new ArrayList<>();
            try (var query = connection.prepareStatement("""
                    select id, title, objective, prerequisites, vocabulary::text as vocabulary
                    from catalogue.modules where version_id = ? order by position
                    """)) {
                query.setObject(1, versionId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        modules.add(new Module(rows.getString("id"), rows.getString("title"), rows.getString("objective"),
                                texts(rows.getArray("prerequisites")), activities.getOrDefault(rows.getString("id"), List.of()),
                                vocabulary(rows.getString("vocabulary"))));
                    }
                }
            }
            List<Assessment> assessments = new ArrayList<>();
            try (var query = connection.prepareStatement("""
                    select kind, title, description, parts::text from catalogue.version_assessments
                    where version_id = ? order by case kind when 'midterm' then 1 else 2 end
                    """)) {
                query.setObject(1, versionId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        assessments.add(new Assessment(rows.getString("kind"), rows.getString("title"),
                                rows.getString("description"), parts(rows.getString("parts"))));
                    }
                }
            }
            return new VersionDocument(versionId, levelId, levelCode, levelTitle, number, status, publishedAt, updatedAt,
                    settings, diagnostic, modules, List.copyOf(assessments));
        });
    }

    /** Remplace le contenu d'un brouillon : rien n'est enregistré si une écriture échoue. */
    void save(UUID versionId, Settings settings, Diagnostic diagnostic, List<Module> modules, List<Assessment> assessments) {
        transaction("save draft", connection -> {
            String levelId;
            int number;
            try (var lock = connection.prepareStatement(
                    "select level_id, number, status from catalogue.track_versions where id = ? for update")) {
                lock.setObject(1, versionId);
                try (var rows = lock.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Version introuvable.");
                    if (!"draft".equals(rows.getString("status"))) {
                        throw HttpError.conflict("Cette version est publiée : créez un nouveau brouillon pour la modifier.");
                    }
                    levelId = rows.getString("level_id");
                    number = rows.getInt("number");
                }
            }
            for (String sql : List.of(
                    "delete from catalogue.version_assessments where version_id = ?",
                    "delete from catalogue.media_placements where version_id = ?",
                    "delete from catalogue.activities where version_id = ?",
                    "delete from catalogue.modules where version_id = ?",
                    "delete from catalogue.options where lesson_id in (select id from catalogue.lessons where version_id = ?)",
                    "delete from catalogue.questions where lesson_id in (select id from catalogue.lessons where version_id = ?)",
                    "update catalogue.track_versions set diagnostic_lesson_id = null where id = ?",
                    "delete from catalogue.lessons where version_id = ?")) {
                try (var statement = connection.prepareStatement(sql)) {
                    statement.setObject(1, versionId);
                    statement.executeUpdate();
                }
            }
            String prefix = levelId + "-v" + number + "-";
            String diagnosticLesson = diagnostic == null ? null : prefix + "diagnostic";
            // Un niveau complet compte des milliers de lignes : chaque table est écrite en un lot (un aller-retour avec
            // la base), dans l'ordre imposé par les clés étrangères.
            try (var lessons = connection.prepareStatement("""
                         insert into catalogue.lessons (id, level_id, title, description, transcript, media_ids, version_id)
                         values (?, ?, ?, ?, ?, '{}', ?)
                         """);
                 var questions = connection.prepareStatement("""
                         insert into catalogue.questions (lesson_id, id, position, prompt, module_ref, type, explanation, spec)
                         values (?, ?, ?, ?, ?, ?, ?, ?::jsonb)
                         """);
                 var options = connection.prepareStatement("""
                         insert into catalogue.options (lesson_id, question_id, id, position, label, correct, feedback)
                         values (?, ?, ?, ?, ?, ?, ?)
                         """);
                 var moduleRows = connection.prepareStatement("""
                         insert into catalogue.modules (version_id, id, position, title, objective, prerequisites, vocabulary)
                         values (?, ?, ?, ?, ?, ?, ?::jsonb)
                         """);
                 var activityRows = connection.prepareStatement("""
                         insert into catalogue.activities (version_id, id, module_id, position, kind, title,
                             estimated_minutes, competences, lesson_id, mission)
                         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb)
                         """);
                 var placementRows = connection.prepareStatement("""
                         insert into catalogue.media_placements (version_id, activity_id, position, asset_id,
                             asset_version, usage, alt, caption, transcript_visibility, decorative, question_id, option_id)
                         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                         """);
                 var assessmentRows = connection.prepareStatement("""
                         insert into catalogue.version_assessments (version_id, kind, title, description, parts)
                         values (?, ?, ?, ?, ?::jsonb)
                         """)) {
                if (diagnostic != null) {
                    addLesson(lessons, diagnosticLesson, levelId, versionId, diagnostic.title(), diagnostic.description(), "");
                    addQuestions(questions, options, diagnosticLesson, diagnostic.questions(), true);
                }
                int modulePosition = 0;
                for (Module module : modules) {
                    moduleRows.setObject(1, versionId);
                    moduleRows.setString(2, module.id());
                    moduleRows.setInt(3, ++modulePosition);
                    moduleRows.setString(4, VersionDocument.text(module.title()));
                    moduleRows.setString(5, VersionDocument.text(module.objective()));
                    moduleRows.setArray(6, connection.createArrayOf("text", VersionDocument.nonNull(module.prerequisites()).toArray()));
                    moduleRows.setString(7, writeJson(vocabulary(module.vocabulary())));
                    moduleRows.addBatch();
                    int activityPosition = 0;
                    for (Activity activity : VersionDocument.nonNull(module.activities())) {
                        String lessonId = null;
                        boolean graded = "exercise".equals(activity.kind()) || "assessment".equals(activity.kind());
                        boolean mission = "mission".equals(activity.kind());
                        // Une mission a toujours sa leçon : la situation et la consigne lues par l'élève.
                        if (activity.lesson() != null || graded || mission) {
                            lessonId = prefix + activity.id();
                            Lesson lesson = activity.lesson();
                            addLesson(lessons, lessonId, levelId, versionId,
                                    lesson == null ? activity.title() : orPlaceholder(lesson.title(), activity.title()),
                                    lesson == null ? "" : VersionDocument.text(lesson.description()),
                                    lesson == null ? "" : VersionDocument.text(lesson.transcript()));
                            if (graded) addQuestions(questions, options, lessonId, activity.questions(), false);
                        }
                        activityRows.setObject(1, versionId);
                        activityRows.setString(2, activity.id());
                        activityRows.setString(3, module.id());
                        activityRows.setInt(4, ++activityPosition);
                        activityRows.setString(5, activity.kind());
                        activityRows.setString(6, VersionDocument.text(activity.title()));
                        activityRows.setInt(7, activity.estimatedMinutes());
                        activityRows.setArray(8, connection.createArrayOf("text", VersionDocument.nonNull(activity.competences()).toArray()));
                        activityRows.setString(9, lessonId);
                        activityRows.setString(10, mission && activity.mission() != null
                                ? writeJson(activity.mission().normalized()) : null);
                        activityRows.addBatch();
                        int placementPosition = 0;
                        for (Placement placement : VersionDocument.nonNull(activity.placements())) {
                            placementRows.setObject(1, versionId);
                            placementRows.setString(2, activity.id());
                            placementRows.setInt(3, ++placementPosition);
                            placementRows.setString(4, placement.assetId());
                            placementRows.setInt(5, placement.assetVersion());
                            placementRows.setString(6, placement.usage());
                            placementRows.setString(7, placement.decorative() ? "" : VersionDocument.text(placement.alt()));
                            placementRows.setString(8, blankToNull(placement.caption()));
                            placementRows.setString(9, placement.transcriptVisibility());
                            placementRows.setBoolean(10, placement.decorative());
                            placementRows.setString(11, placement.questionId());
                            placementRows.setString(12, placement.optionId());
                            placementRows.addBatch();
                        }
                    }
                }
                for (Assessment assessment : VersionDocument.nonNull(assessments)) {
                    assessmentRows.setObject(1, versionId);
                    assessmentRows.setString(2, assessment.kind());
                    assessmentRows.setString(3, VersionDocument.text(assessment.title()));
                    assessmentRows.setString(4, VersionDocument.text(assessment.description()));
                    assessmentRows.setString(5, write(VersionDocument.nonNull(assessment.parts())));
                    assessmentRows.addBatch();
                }
                for (var batch : List.of(lessons, questions, options, moduleRows, activityRows, placementRows, assessmentRows)) {
                    batch.executeBatch();
                }
            }
            try (var update = connection.prepareStatement("""
                    update catalogue.track_versions set expected_competences = ?, success_criteria = ?, pass_percent = ?,
                        review_minutes = ?, midterm_minutes = ?, final_minutes = ?, diagnostic_lesson_id = ?, updated_at = now()
                    where id = ?
                    """)) {
                update.setArray(1, connection.createArrayOf("text", VersionDocument.nonNull(settings.expectedCompetences()).toArray()));
                update.setString(2, VersionDocument.text(settings.successCriteria()));
                update.setInt(3, settings.passPercent());
                update.setInt(4, settings.reviewMinutes());
                update.setInt(5, settings.midtermMinutes());
                update.setInt(6, settings.finalMinutes());
                update.setString(7, diagnosticLesson);
                update.setObject(8, versionId);
                update.executeUpdate();
            }
            return null;
        });
    }

    /**
     * Publie un brouillon complet : la version publiée précédente du niveau est retirée des nouvelles attributions.
     * Les versions de médias référencées ont été publiées au préalable par Médias.
     */
    Published publish(UUID versionId, List<MediaRef> media) {
        return transaction("publish version", connection -> {
            String levelId;
            try (var lock = connection.prepareStatement(
                    "select level_id, status from catalogue.track_versions where id = ? for update")) {
                lock.setObject(1, versionId);
                try (var rows = lock.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Version introuvable.");
                    if (!"draft".equals(rows.getString("status"))) throw HttpError.conflict("Seul un brouillon se publie.");
                    levelId = rows.getString("level_id");
                }
            }
            try (var retire = connection.prepareStatement("""
                    update catalogue.track_versions set status = 'retired', retired_at = now()
                    where level_id = ? and status = 'published'
                    """)) {
                retire.setString(1, levelId);
                retire.executeUpdate();
            }
            try (var publish = connection.prepareStatement("""
                    update catalogue.track_versions set status = 'published', published_at = now(), updated_at = now()
                    where id = ?
                    """)) {
                publish.setObject(1, versionId);
                publish.executeUpdate();
            }
            try (var level = connection.prepareStatement("update catalogue.levels set status = 'published' where id = ?")) {
                level.setString(1, levelId);
                level.executeUpdate();
            }
            return new Published(summary(connection, versionId), media);
        });
    }

    /**
     * Retire une version des nouvelles attributions ; les élèves inscrits gardent l'accès à leur version. Le niveau
     * reflète sa disponibilité : sans autre version publiée, il repasse en brouillon (GET /levels ne le propose plus,
     * GET /languages le marque non publié) jusqu'à la prochaine publication.
     */
    VersionSummary retire(UUID versionId) {
        return transaction("retire version", connection -> {
            String levelId;
            try (var update = connection.prepareStatement("""
                    update catalogue.track_versions set status = 'retired', retired_at = now()
                    where id = ? and status = 'published'
                    returning level_id
                    """)) {
                update.setObject(1, versionId);
                try (var rows = update.executeQuery()) {
                    if (!rows.next()) throw HttpError.conflict("Seule une version publiée peut être retirée.");
                    levelId = rows.getString("level_id");
                }
            }
            try (var level = connection.prepareStatement("""
                    update catalogue.levels l set status = 'draft'
                    where l.id = ? and l.status = 'published'
                      and not exists (select 1 from catalogue.track_versions v where v.level_id = l.id and v.status = 'published')
                    """)) {
                level.setString(1, levelId);
                level.executeUpdate();
            }
            return summary(connection, versionId);
        });
    }

    private List<Part> parts(String value) throws SQLException {
        try {
            return json.readValue(value, new TypeReference<List<Part>>() {});
        } catch (JsonProcessingException error) {
            throw new SQLException("Parties d’évaluation illisibles", "XX000", error);
        }
    }

    private String write(List<Part> parts) throws SQLException {
        try {
            return json.writeValueAsString(parts);
        } catch (JsonProcessingException error) {
            throw new SQLException("Parties d’évaluation non sérialisables", "XX000", error);
        }
    }

    private static void addLesson(PreparedStatement lessons, String id, String levelId, UUID versionId, String title,
                                  String description, String transcript) throws SQLException {
        lessons.setString(1, id);
        lessons.setString(2, levelId);
        lessons.setString(3, title);
        lessons.setString(4, description);
        lessons.setString(5, transcript);
        lessons.setObject(6, versionId);
        lessons.addBatch();
    }

    static void addQuestions(PreparedStatement questionRows, PreparedStatement optionRows, String lessonId,
                                     List<Question> questions, boolean diagnostic) throws SQLException {
        int position = 0;
        for (Question question : VersionDocument.nonNull(questions)) {
            QuestionSpecs.Spec spec = QuestionSpecs.specOf(question);
            questionRows.setString(1, lessonId);
            questionRows.setString(2, question.id());
            questionRows.setInt(3, ++position);
            questionRows.setString(4, VersionDocument.text(question.prompt()));
            questionRows.setString(5, diagnostic ? question.moduleRef() : null);
            questionRows.setString(6, QuestionSpecs.typeOf(question));
            questionRows.setString(7, blankToNull(question.explanation()));
            questionRows.setString(8, spec == null ? null : QuestionSpecs.write(spec));
            questionRows.addBatch();
            int optionPosition = 0;
            boolean correctSeen = false;
            for (Option option : VersionDocument.nonNull(question.options())) {
                // Un brouillon peut porter plusieurs bonnes réponses le temps de l'édition : seule la première est gardée,
                // et le contrôle de publication signale l'écart.
                boolean correct = option.correct() && !correctSeen;
                correctSeen |= correct;
                optionRows.setString(1, lessonId);
                optionRows.setString(2, question.id());
                optionRows.setString(3, option.id());
                optionRows.setInt(4, ++optionPosition);
                optionRows.setString(5, VersionDocument.text(option.label()));
                optionRows.setBoolean(6, correct);
                optionRows.setString(7, blankToNull(option.feedback()));
                optionRows.addBatch();
            }
        }
    }

    /** Questions de toutes les leçons d'une version, en une requête, rangées par leçon. */
    private Map<String, List<Question>> versionQuestions(Connection connection, UUID versionId) throws SQLException {
        Map<String, Map<String, Question>> byLesson = new LinkedHashMap<>();
        try (var query = connection.prepareStatement("""
                select q.lesson_id, q.id, q.type, q.prompt, q.module_ref, q.explanation, q.spec::text as spec,
                       o.id as option_id, o.label, o.correct, o.feedback
                from catalogue.questions q
                join catalogue.lessons l on l.id = q.lesson_id
                left join catalogue.options o on o.lesson_id = q.lesson_id and o.question_id = q.id
                where l.version_id = ? order by q.lesson_id, q.position, o.position
                """)) {
            query.setObject(1, versionId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    collect(byLesson.computeIfAbsent(rows.getString("lesson_id"), key -> new LinkedHashMap<>()), rows);
                }
            }
        }
        Map<String, List<Question>> result = new LinkedHashMap<>();
        byLesson.forEach((lessonId, questions) -> result.put(lessonId, List.copyOf(questions.values())));
        return result;
    }

    private static void collect(Map<String, Question> questions, ResultSet rows) throws SQLException {
        String id = rows.getString("id");
        Question question = questions.get(id);
        if (question == null) {
            question = new Question(id, rows.getString("type"), rows.getString("prompt"), rows.getString("module_ref"),
                    rows.getString("explanation"), new ArrayList<>(), QuestionSpecs.read(rows.getString("spec")));
            questions.put(id, question);
        }
        if (rows.getString("option_id") != null) {
            question.options().add(new Option(rows.getString("option_id"), rows.getString("label"),
                    rows.getBoolean("correct"), rows.getString("feedback")));
        }
    }

    /** Vocabulaire enregistré (jsonb), dans l'ordre du module. */
    private List<VocabularyEntry> vocabulary(String value) throws SQLException {
        if (value == null || value.isBlank()) return List.of();
        try {
            return json.readValue(value, new TypeReference<List<VocabularyEntry>>() {});
        } catch (JsonProcessingException error) {
            throw new SQLException("Vocabulaire illisible", "XX000", error);
        }
    }

    /** Vocabulaire à enregistrer : textes sans espaces de bord, champs facultatifs vides à null. */
    private static List<VocabularyEntry> vocabulary(List<VocabularyEntry> entries) {
        return VersionDocument.nonNull(entries).stream().map(entry -> new VocabularyEntry(entry.id(),
                VersionDocument.text(entry.word()), entry.article(), blankToNull(entry.plural()), entry.partOfSpeech(),
                VersionDocument.text(entry.translation()), blankToNull(entry.example()), blankToNull(entry.note()),
                entry.audio())).toList();
    }

    private <T> T readJson(String value, Class<T> type) throws SQLException {
        if (value == null || value.isBlank()) return null;
        try {
            return json.readValue(value, type);
        } catch (JsonProcessingException error) {
            throw new SQLException("Contenu illisible", "XX000", error);
        }
    }

    private String writeJson(Object value) throws SQLException {
        try {
            return json.writeValueAsString(value);
        } catch (JsonProcessingException error) {
            throw new SQLException("Contenu non sérialisable", "XX000", error);
        }
    }

    private Map<String, List<Placement>> placements(Connection connection, UUID versionId) throws SQLException {
        Map<String, List<Placement>> placements = new LinkedHashMap<>();
        try (var query = connection.prepareStatement("""
                select activity_id, asset_id, asset_version, usage, alt, caption, transcript_visibility, decorative,
                       question_id, option_id
                from catalogue.media_placements where version_id = ? order by activity_id, position
                """)) {
            query.setObject(1, versionId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    placements.computeIfAbsent(rows.getString("activity_id"), key -> new ArrayList<>())
                            .add(new Placement(rows.getString("asset_id"), rows.getInt("asset_version"), rows.getString("usage"),
                                    rows.getString("alt"), rows.getString("caption"), rows.getString("transcript_visibility"),
                                    rows.getBoolean("decorative"), rows.getString("question_id"), rows.getString("option_id")));
                }
            }
        }
        return placements;
    }

    private boolean wouldLoop(Connection connection, String levelId, String prerequisiteId) throws SQLException {
        String current = prerequisiteId;
        for (int depth = 0; current != null && depth < 20; depth++) {
            if (current.equals(levelId)) return true;
            try (var query = connection.prepareStatement("select prerequisite_level_id from catalogue.levels where id = ?")) {
                query.setString(1, current);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) throw HttpError.badRequest("Le niveau prérequis est introuvable.");
                    current = rows.getString(1);
                }
            }
        }
        return false;
    }

    private VersionSummary summary(Connection connection, UUID versionId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select id, number, status, published_at, retired_at, updated_at from catalogue.track_versions where id = ?
                """)) {
            query.setObject(1, versionId);
            try (var rows = query.executeQuery()) {
                rows.next();
                return summary(rows);
            }
        }
    }

    private static VersionSummary summary(java.sql.ResultSet rows) throws SQLException {
        return new VersionSummary(rows.getObject("id", UUID.class), rows.getInt("number"), rows.getString("status"),
                text(rows.getObject("published_at", OffsetDateTime.class)), text(rows.getObject("retired_at", OffsetDateTime.class)),
                text(rows.getObject("updated_at", OffsetDateTime.class)));
    }

    private static String orPlaceholder(String value, String fallback) {
        String text = VersionDocument.text(value);
        return text.isEmpty() ? fallback : text;
    }

    private static String blankToNull(String value) {
        String text = VersionDocument.text(value);
        return text.isEmpty() ? null : text;
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
        LOG.errorf("Catalogue database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        if ("P0001".equals(error.getSQLState())) {
            return HttpError.conflict("Cette version du parcours est publiée : créez une nouvelle version pour la modifier.");
        }
        return HttpError.unavailable("Le catalogue est temporairement indisponible.");
    }
}
