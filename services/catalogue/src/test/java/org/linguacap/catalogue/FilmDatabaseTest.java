package org.linguacap.catalogue;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.ws.rs.WebApplicationException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.linguacap.catalogue.ExerciseKeyResource.ExerciseKey;
import org.linguacap.catalogue.FilmDocument.Film;
import org.linguacap.catalogue.FilmDocument.Input;

/**
 * Films du Ciné-club contre une vraie base (toutes les migrations appliquées), dans une transaction annulée à la fin :
 * enregistrement, publication, réimport, retrait, et surtout les règles de lecture des leçons « après » — aucune lecture
 * ni clé d'exercice pour un film en brouillon, clé servie (non figée) pour un film publié, aucun corrigé dans ce que
 * reçoit une session. Lancé seulement si LINGUACAP_TEST_JDBC_URL désigne une base jetable
 * (jdbc:postgresql://hôte:5432/base?user=…&amp;password=…) ; jamais la base de la pile locale.
 */
@EnabledIfEnvironmentVariable(named = "LINGUACAP_TEST_JDBC_URL", matches = "jdbc:postgresql://.+")
class FilmDatabaseTest {
    private static final String LESSON = "cine-essai-film-01";
    private static final UUID EDITOR = UUID.fromString("9e8d7c6b-5a49-4382-8716-a5b4c3d2e1f0");
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Pattern ANSWER_KEYS = Pattern.compile("\"(correct|accept|answers|pairs|explanation|feedback|spec)\"");

    private Connection connection;
    private FilmStore store;

    @BeforeEach
    void open() throws SQLException {
        connection = DriverManager.getConnection(System.getenv("LINGUACAP_TEST_JDBC_URL"));
        connection.setAutoCommit(false);
        store = new FilmStore();
        store.json = JSON;
    }

    @AfterEach
    void close() throws SQLException {
        connection.rollback();
        connection.close();
    }

    private void save(JsonNode document) throws SQLException {
        Input input = FilmDocument.normalized(FilmDocumentTest.parse(document));
        FilmDocument.checkStructure(input.film().id(), input);
        store.save(connection, input, FilmDocument.check(input), EDITOR);
    }

    /** Même lecture que GET /lessons/{id} pour une session sans droit d'édition. */
    private boolean readableByLearners(String lessonId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select 1 from catalogue.lessons l join catalogue.levels n on n.id = l.level_id
                left join catalogue.track_versions v on v.id = l.version_id where l.id = ? and %s
                """.formatted(CatalogueResource.READABLE_LESSON))) {
            query.setString(1, lessonId);
            try (var rows = query.executeQuery()) {
                return rows.next();
            }
        }
    }

    /** Même lecture que la route interne answer-key (corrigé des choix pour /assessments/quiz). */
    private boolean keyedForQuiz(String lessonId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select 1 from catalogue.lessons l join catalogue.levels n on n.id = l.level_id
                left join catalogue.track_versions v on v.id = l.version_id where l.id = ? and %s
                """.formatted(CatalogueResource.KEYED_LESSON))) {
            query.setString(1, lessonId);
            try (var rows = query.executeQuery()) {
                return rows.next();
            }
        }
    }

    private static int status(Executable action) {
        return assertThrows(WebApplicationException.class, action::run).getResponse().getStatus();
    }

    interface Executable {
        void run() throws Exception;
    }

    @Test
    void unFilmEnBrouillonNestNiLuNiCorrigeUnFilmPublieLest() throws Exception {
        save(FilmDocumentTest.document());
        assertEquals("draft", store.editorDocument(connection, "essai-film").film().status());
        assertTrue(store.editorDocument(connection, "essai-film").checks().publishable());
        assertNull(ExerciseKeyResource.key(connection, LESSON), "aucune clé d'exercice pour un film en brouillon");
        assertFalse(readableByLearners(LESSON), "leçon d'un film en brouillon illisible hors édition");
        assertFalse(keyedForQuiz(LESSON), "aucun corrigé de quiz pour un film en brouillon");
        assertNull(store.film(connection, "essai-film", false));
        assertNotNull(store.film(connection, "essai-film", true), "aperçu de l'éditeur");
        assertTrue(store.published(connection, "de", "A1").stream().noneMatch(film -> film.id().equals("essai-film")));

        assertEquals("published", store.publish(connection, "essai-film").status());
        assertEquals("published", store.publish(connection, "essai-film").status(), "publier deux fois ne change rien");
        assertTrue(readableByLearners(LESSON));
        assertTrue(keyedForQuiz(LESSON));
        ExerciseKey key = ExerciseKeyResource.key(connection, LESSON);
        assertNotNull(key, "la clé d'exercice est servie à Évaluations");
        assertNull(key.versionId());
        assertFalse(key.frozen(), "leçon sans version : relue à chaque remise");
        assertEquals(List.of("q1", "q2", "q3", "q4", "q5"), key.questions().stream().map(QuestionViews.KeyQuestion::id).toList());
        assertTrue(key.questions().get(0).options().stream().anyMatch(QuestionViews.KeyOption::correct));

        Film film = store.film(connection, "essai-film", false);
        String served = JSON.writeValueAsString(film);
        assertFalse(ANSWER_KEYS.matcher(served).find(), "aucun corrigé dans GET /films/{id} : " + served);
        assertEquals(5, film.sequences().get(0).questions().size());
        assertEquals(List.of("q1", "q2", "q3", "q4", "q5"),
                film.sequences().get(0).questions().stream().map(QuestionViews.View::id).toList(), "mêmes questions que la clé");
        String lessonView = JSON.writeValueAsString(CatalogueResource.readQuestions(connection, LESSON));
        assertFalse(ANSWER_KEYS.matcher(lessonView).find(), "aucun corrigé dans GET /lessons/cine-… : " + lessonView);

        List<Film> listed = store.published(connection, "de", "A1");
        Film item = listed.stream().filter(candidate -> candidate.id().equals("essai-film")).findFirst().orElseThrow();
        assertNull(item.sequences().get(0).questions(), "la liste ne sert pas les questions");
        assertEquals(5, item.sequences().get(0).questionCount());
        assertEquals(true, item.sequences().get(0).approx());
        assertTrue(store.published(connection, "de", "A2").stream().noneMatch(candidate -> candidate.id().equals("essai-film")));

        assertEquals("draft", store.retire(connection, "essai-film").status());
        assertNull(ExerciseKeyResource.key(connection, LESSON), "plus de clé après le retrait");
        assertEquals(409, status(() -> store.retire(connection, "essai-film")));
    }

    @Test
    void unReimportRemplaceLesQuestionsEtLesSequencesSansFiger() throws Exception {
        save(FilmDocumentTest.document());
        store.publish(connection, "essai-film");

        ObjectNode document = FilmDocumentTest.document();
        ObjectNode first = (ObjectNode) document.withArray("sequences").get(0);
        ArrayNode options = (ArrayNode) first.withArray("questions").get(1).get("options");
        ((ObjectNode) options.get(0)).put("correct", false);
        ((ObjectNode) options.get(1)).put("correct", true);
        ObjectNode second = first.deepCopy();
        second.put("id", "essai-film-02").put("position", 2).put("start", 420).put("end", 900).put("title", "Im Café");
        document.withArray("sequences").removeAll().add(second);
        save(document);

        assertEquals("published", store.editorDocument(connection, "essai-film").film().status(), "le statut est conservé");
        assertNull(ExerciseKeyResource.key(connection, LESSON), "séquence retirée : sa leçon est supprimée");
        try (var query = connection.prepareStatement("select count(*) from catalogue.lessons where id = ?")) {
            query.setString(1, LESSON);
            try (var rows = query.executeQuery()) {
                rows.next();
                assertEquals(0, rows.getInt(1));
            }
        }
        ExerciseKey key = ExerciseKeyResource.key(connection, "cine-essai-film-02");
        assertNotNull(key);
        assertEquals("b", key.questions().get(1).options().stream().filter(QuestionViews.KeyOption::correct)
                .findFirst().orElseThrow().id(), "la clé suit le document réimporté");

        ObjectNode incomplete = FilmDocumentTest.document();
        ((ObjectNode) incomplete.withArray("sequences").get(0)).withArray("questions").remove(0);
        assertEquals(409, status(() -> save(incomplete)), "un film publié exige un document complet");

        ObjectNode thief = FilmDocumentTest.document();
        ((ObjectNode) thief.get("film")).put("id", "essai");
        ((ObjectNode) thief.withArray("sequences").get(0)).put("id", "essai-film-02");
        assertEquals(409, status(() -> save(thief)), "la séquence d'un autre film n'est jamais reprise");
    }

    @Test
    void lesLeconsDeParcoursRestentLuesEtFigees() throws Exception {
        ExerciseKey legacy = ExerciseKeyResource.key(connection, "commander-au-cafe");
        assertNotNull(legacy, "leçon de la version A1 publiée de démonstration");
        assertTrue(legacy.frozen(), "une leçon de version publiée reste figée");
        assertTrue(readableByLearners("commander-au-cafe"));
    }

    @Test
    void unNiveauInconnuOuDUneAutreLangueEstRefuse() throws Exception {
        ObjectNode document = FilmDocumentTest.document();
        ((ObjectNode) document.get("film")).put("languageId", "en");
        assertEquals(400, status(() -> save(document)));
    }
}
