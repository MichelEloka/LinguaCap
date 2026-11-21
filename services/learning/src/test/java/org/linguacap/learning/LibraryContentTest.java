package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.linguacap.learning.LibraryResource.LastResult;
import org.linguacap.learning.LibraryResource.LibraryModule;
import org.linguacap.learning.LibraryResource.Practice;

class LibraryContentTest {
    private static final ObjectMapper JSON = new ObjectMapper();

    private static JsonNode json(String text) {
        try {
            return JSON.readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalArgumentException(error);
        }
    }

    private static final JsonNode TRACK = json("""
            {'versionId': '7d0c1f5e-8a54-4c0e-9d7a-2f4f3c2b1a00', 'levelCode': 'A1', 'status': 'published',
             'modules': [
               {'id': 'hallo', 'position': 1, 'title': 'Hallo', 'objective': 'Saluer', 'activities': [
                 {'id': 'a1-hallo-dialog', 'position': 1, 'kind': 'lesson', 'title': 'Dialogue', 'estimatedMinutes': 10,
                  'competences': ['ecoute'], 'lessonId': 'a1-hallo-dialog'},
                 {'id': 'a1-hallo-quiz', 'position': 2, 'kind': 'exercise', 'title': 'Quiz', 'estimatedMinutes': 8,
                  'competences': ['lecture', 'ecoute'], 'lessonId': 'a1-hallo-quiz'},
                 {'id': 'a1-hallo-bilan', 'position': 3, 'kind': 'assessment', 'title': 'Bilan', 'estimatedMinutes': 20,
                  'competences': [], 'lessonId': 'a1-hallo-bilan'},
                 {'id': 'a1-hallo-revision', 'position': 4, 'kind': 'review', 'title': 'Révision', 'estimatedMinutes': 15,
                  'competences': [], 'lessonId': null}]}]}
            """);

    @Test
    void laBibliothequeNeProposeQueLesLeconsEtLesExercicesAvecLeurDernierScore() {
        Map<String, LastResult> results = Map.of(
                "a1-hallo-quiz", new LastResult(7, 8, "2026-11-20T10:00:00Z"),
                "a1-hallo-dialog", new LastResult(1, 1, "2026-11-20T10:00:00Z"));
        List<LibraryModule> modules = LibraryContent.modules(TRACK, results);
        assertEquals(1, modules.size());
        LibraryModule module = modules.get(0);
        assertEquals("hallo", module.id());
        assertEquals("Saluer", module.objective());
        assertEquals(List.of("a1-hallo-dialog", "a1-hallo-quiz"),
                module.activities().stream().map(LibraryResource.LibraryActivityItem::id).toList());
        assertNull(module.activities().get(0).lastResult(), "une leçon n'a pas de score");
        assertEquals(new LastResult(7, 8, "2026-11-20T10:00:00Z"), module.activities().get(1).lastResult());
        assertEquals(List.of("lecture", "ecoute"), module.activities().get(1).competences());
    }

    @Test
    void leDernierScoreEstLePlusRecentDesQuizDeLaLecon() {
        JsonNode grades = json("""
                [{'id': '1', 'lessonId': 'a1-hallo-quiz', 'correct': 8, 'total': 8, 'submittedAt': '2026-11-21T09:00:00Z', 'kind': 'quiz'},
                 {'id': '2', 'lessonId': 'a1-hallo-quiz', 'correct': 3, 'total': 8, 'submittedAt': '2026-11-20T09:00:00Z', 'kind': 'quiz'},
                 {'id': '3', 'lessonId': 'a1-diagnostic', 'correct': 5, 'total': 10, 'submittedAt': '2026-11-19T09:00:00Z', 'kind': 'diagnostic'}]
                """);
        Map<String, LastResult> results = LibraryContent.lastResults(grades);
        assertEquals(Map.of("a1-hallo-quiz", new LastResult(8, 8, "2026-11-21T09:00:00Z")), results);
        assertTrue(LibraryContent.lastResults(json("{}")).isEmpty());
    }

    @Test
    void lExamenDePassageNEstJamaisOuvertEnEntrainement() {
        assertEquals(List.of(new Practice("midterm", "Bilan intermédiaire", true), new Practice("final", "Examen blanc", false)),
                LibraryContent.practice(true));
        assertTrue(LibraryContent.practice(false).stream().noneMatch(Practice::available));
    }

    @Test
    void seulesLesLeconsEtLesExercicesSontLisiblesDepuisLaBibliotheque() {
        assertEquals("hallo", LibraryContent.moduleOf(TRACK, "a1-hallo-quiz").path("id").asText());
        assertNull(LibraryContent.moduleOf(TRACK, "a1-hallo-bilan"));
        assertNull(LibraryContent.moduleOf(TRACK, "a1-hallo-revision"));
        assertNull(LibraryContent.moduleOf(TRACK, "inconnue"));
    }

    @Test
    void uneVersionSansLangueEstEnAllemand() {
        assertEquals("de", LibraryContent.languageOf(TRACK));
        assertEquals("en", LibraryContent.languageOf(json("{'languageId': 'en'}")));
        assertEquals("de", LibraryContent.languageOf(json("{'languageId': null}")));
        assertFalse(LibraryContent.KINDS.contains("assessment"));
    }
}
