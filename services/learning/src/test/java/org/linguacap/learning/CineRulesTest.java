package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.WebApplicationException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.linguacap.learning.CineRules.CineOverview;
import org.linguacap.learning.CineRules.CineResult;
import org.linguacap.learning.CineRules.CineSequence;
import org.linguacap.learning.CineRules.FilmRecommendation;
import org.linguacap.learning.CineRules.LearnerWord;
import org.linguacap.learning.CineRules.WordInput;

class CineRulesTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final UUID LEARNER = UUID.fromString("7d1f3c5a-2b4e-4f60-8a1b-9c0d2e3f4a5b");
    private static final UUID TEACHER = UUID.fromString("9e8d7c6b-5a49-4382-8716-a5b4c3d2e1f0");

    private static JsonNode json(String text) {
        try {
            return JSON.readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalArgumentException(error);
        }
    }

    /** Films servis par GET /v1/films (séquences sans questions). */
    private static final JsonNode FILMS = json("""
            [{'id': 'nicos-weg-a1', 'languageId': 'de', 'levelId': 'a1', 'levelCode': 'A1', 'title': 'Nicos Weg',
              'description': 'Film', 'provider': 'youtube', 'videoId': '4-eDoThe6qo', 'channel': 'DW',
              'videoUrl': 'https://www.youtube.com/watch?v=4-eDoThe6qo', 'courseUrl': 'https://example.org',
              'credit': 'Film : Nicos Weg', 'licenseNote': '', 'durationSeconds': 6180, 'position': 1,
              'sequences': [
                {'id': 'nicos-weg-a1-01', 'filmId': 'nicos-weg-a1', 'position': 1, 'title': 'Hallo', 'start': 0,
                 'end': 420, 'approx': true, 'context': 'Avant', 'keywords': [{'word': 'Hallo', 'article': null,
                 'plural': null, 'translation': 'bonjour', 'note': null}], 'lessonId': 'cine-nicos-weg-a1-01',
                 'questionCount': 6, 'questions': null},
                {'id': 'nicos-weg-a1-02', 'filmId': 'nicos-weg-a1', 'position': 2, 'title': 'Am Bahnhof', 'start': 420,
                 'end': 900, 'approx': false, 'context': 'Avant', 'keywords': [], 'lessonId': 'cine-nicos-weg-a1-02',
                 'questionCount': 5, 'questions': null}]}]
            """);

    private static LearnerWord word(String text, String kind, String source, String createdAt) {
        return new LearnerWord(UUID.randomUUID(), LEARNER, "de", text, "", kind, source, createdAt, createdAt);
    }

    private static FilmRecommendation recommendation(String sequenceId, String dismissedAt, String createdAt) {
        return new FilmRecommendation(UUID.randomUUID(), LEARNER, sequenceId.substring(0, sequenceId.lastIndexOf('-')),
                sequenceId, TEACHER, "teacher", "À regarder avant jeudi", createdAt, dismissedAt);
    }

    private static int status(Runnable action) {
        return assertThrows(WebApplicationException.class, action::run).getResponse().getStatus();
    }

    @Test
    void unMotSeNoteAvecUneSourceCoherente() {
        assertEquals(new WordInput("Bahnhof", "la gare", "film", "nicos-weg-a1-02"),
                CineRules.word("  Bahnhof ", " la gare ", "film", "nicos-weg-a1-02"));
        assertEquals(new WordInput("Termin", "", "activity", "b1000000-0000-4000-8000-000000000001/alltag"),
                CineRules.word("Termin", null, "activity", "b1000000-0000-4000-8000-000000000001/alltag"));
        assertEquals(new WordInput("doch", "", "manual", null), CineRules.word("doch", "", "manual", null));

        assertEquals(400, status(() -> CineRules.word(" ", "", "manual", null)), "mot vide");
        assertEquals(400, status(() -> CineRules.word("x".repeat(81), "", "manual", null)), "mot trop long");
        assertEquals(400, status(() -> CineRules.word("Zug", "x".repeat(201), "manual", null)), "note trop longue");
        assertEquals(400, status(() -> CineRules.word("Zug", "", "lexique", null)), "source inconnue");
        assertEquals(400, status(() -> CineRules.word("Zug", "", "film", null)), "film sans séquence");
        assertEquals(400, status(() -> CineRules.word("Zug", "", "film", "Nicos_Weg")), "séquence invalide");
        assertEquals(400, status(() -> CineRules.word("Zug", "", "activity", " ")), "activité sans référence");
        assertEquals(400, status(() -> CineRules.word("Zug", "", "manual", "nicos-weg-a1-01")), "saisie libre avec source");
    }

    @Test
    void uneModificationPorteSurLeMotOuSurLaNote() {
        assertEquals(new WordInput(null, "le train", null, null), CineRules.change(null, " le train "));
        assertEquals(new WordInput("Zug", null, null, null), CineRules.change("Zug", null));
        assertEquals(400, status(() -> CineRules.change(null, null)));
        assertEquals(400, status(() -> CineRules.change("", null)));
    }

    @Test
    void uneSequenceSeProposeAvecUneNoteCourte() {
        assertEquals("Pour réviser l’accusatif.", CineRules.recommendationNote("nicos-weg-a1-02", " Pour réviser l’accusatif. "));
        assertEquals("", CineRules.recommendationNote("nicos-weg-a1-02", null));
        assertEquals(400, status(() -> CineRules.recommendationNote("nicos-weg-a1-02", "x".repeat(301))));
        assertEquals(400, status(() -> CineRules.recommendationNote("../a1", "")));
        assertEquals("nicos-weg-a1", CineRules.filmOf(FILMS, "nicos-weg-a1-02").path("id").asText());
        assertNull(CineRules.filmOf(FILMS, "nicos-weg-a2-01"), "séquence hors des films publiés de la langue");
        assertEquals("B1", CineRules.level("b1"));
        assertNull(CineRules.level(null));
        assertEquals(400, status(() -> CineRules.level("D1")));
    }

    @Test
    void lAgregationReunitResultatMotsEtPropositions() {
        JsonNode grades = json("""
                [{'id': 'a3', 'lessonId': 'cine-nicos-weg-a1-01', 'correct': 6, 'total': 6, 'submittedAt': '2026-12-04T10:00:00Z', 'kind': 'quiz'},
                 {'id': 'a2', 'lessonId': 'cine-nicos-weg-a1-01', 'correct': 3, 'total': 6, 'submittedAt': '2026-12-03T10:00:00Z', 'kind': 'quiz'},
                 {'id': 'a1', 'lessonId': 'a1-v1-hallo-quiz', 'correct': 1, 'total': 4, 'submittedAt': '2026-12-02T10:00:00Z', 'kind': 'quiz'}]
                """);
        List<LearnerWord> words = List.of(
                word("Fahrkarte", "film", "nicos-weg-a1-02", "2026-12-04T10:02:00Z"),
                word("Bahnhof", "film", "nicos-weg-a1-02", "2026-12-04T10:01:00Z"),
                word("Termin", "activity", "b1/alltag", "2026-12-03T09:00:00Z"),
                word("doch", "manual", null, "2026-12-02T09:00:00Z"));
        FilmRecommendation open = recommendation("nicos-weg-a1-02", null, "2026-12-04T08:00:00Z");
        FilmRecommendation elsewhere = recommendation("nicos-weg-a2-01", null, "2026-12-03T08:00:00Z");
        FilmRecommendation dismissed = recommendation("nicos-weg-a1-01", "2026-12-02T09:00:00Z", "2026-12-01T08:00:00Z");

        CineOverview overview = CineRules.overview(LEARNER, "de", "A1", FILMS, CourseRules.latestGrades(grades), words,
                List.of(open, elsewhere, dismissed));

        assertEquals(4, overview.wordCount(), "tous les mots du carnet sont comptés");
        assertEquals(List.of(open), overview.recommendations(),
                "seules les propositions en cours sur les films servis sont listées");
        List<CineSequence> sequences = overview.films().get(0).sequences();
        assertEquals(new CineResult("a3", 6, 6, "2026-12-04T10:00:00Z"), sequences.get(0).lastResult(),
                "le dernier résultat est la remise la plus récente de la leçon cine-…");
        assertNull(sequences.get(0).recommendation(), "une proposition écartée n'est plus en cours");
        assertTrue(sequences.get(0).words().isEmpty());
        assertNull(sequences.get(1).lastResult(), "séquence pas encore faite");
        assertEquals(open, sequences.get(1).recommendation());
        assertEquals(List.of("Fahrkarte", "Bahnhof"), sequences.get(1).words().stream().map(LearnerWord::word).toList(),
                "les mots notés pendant la séquence, plus récent d'abord");
        assertEquals("cine-nicos-weg-a1-02", sequences.get(1).lessonId());
        assertTrue(sequences.get(0).approx());
    }

    @Test
    void lAgregationGardeLaFormeDuContrat() {
        CineOverview overview = CineRules.overview(LEARNER, "de", null, FILMS, Map.of(), List.of(), List.of());
        JsonNode body = JSON.valueToTree(overview);
        assertEquals(List.of("learnerId", "languageId", "level", "films", "recommendations", "wordCount"), names(body));
        JsonNode film = body.at("/films/0");
        assertEquals(List.of("id", "languageId", "levelId", "levelCode", "title", "description", "provider", "videoId",
                "channel", "videoUrl", "courseUrl", "credit", "licenseNote", "durationSeconds", "position", "sequences"),
                names(film));
        JsonNode sequence = film.at("/sequences/0");
        assertEquals(List.of("id", "filmId", "position", "title", "start", "end", "approx", "context", "keywords",
                "lessonId", "questionCount", "lastResult", "words", "recommendation"), names(sequence));
        assertFalse(sequence.has("questions"), "l'agrégation ne sert pas les questions");
        assertTrue(sequence.get("lastResult").isNull() && sequence.get("recommendation").isNull(), "null explicite");
        assertEquals("bonjour", sequence.at("/keywords/0/translation").asText());
        assertTrue(body.get("level").isNull());

        assertTrue(CineRules.overview(LEARNER, null, null, json("{}"), Map.of(), List.of(), List.of()).films().isEmpty(),
                "réponse inattendue du catalogue : aucun film");
    }

    private static List<String> names(JsonNode node) {
        List<String> names = new ArrayList<>();
        node.fieldNames().forEachRemaining(names::add);
        return names;
    }
}
