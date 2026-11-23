package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.WebApplicationException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.linguacap.learning.CourseResource.ActivityDetail;
import org.linguacap.learning.CourseResource.MissionDefinition;
import org.linguacap.learning.CourseResource.MissionOral;
import org.linguacap.learning.CourseResource.MissionWritten;
import org.linguacap.learning.CourseResource.ReviewItem;
import org.linguacap.learning.CourseResource.ReviewScore;
import org.linguacap.learning.LibraryResource.LibraryActivity;

class CourseRulesTest {
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-22T10:00:00+01:00");
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final UUID LEARNER = UUID.fromString("11111111-1111-4111-8111-111111111111");
    private static final UUID SESSION = UUID.fromString("22222222-2222-4222-8222-222222222222");
    private static final UUID VERSION = UUID.fromString("7d0c1f5e-8a54-4c0e-9d7a-2f4f3c2b1a00");
    /** Clés d'un corrigé : jamais dans une vue élève avant la remise. */
    private static final List<String> ANSWER_KEYS = List.of("correct", "accept", "answers", "pairs", "explanation",
            "feedback", "spec");

    private static JsonNode json(String text) {
        try {
            return JSON.readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalArgumentException(error);
        }
    }

    @Test
    void lEtatDUneSeanceSuitSonAvancementEtSonEcheance() {
        OffsetDateTime later = NOW.plusDays(1);
        assertEquals("planned", CourseRules.sessionStatus(null, null, later, NOW));
        assertEquals("in_progress", CourseRules.sessionStatus(NOW, null, later, NOW));
        assertEquals("late", CourseRules.sessionStatus(NOW, null, NOW.minusMinutes(1), NOW));
        assertEquals("late", CourseRules.sessionStatus(null, null, NOW.minusDays(1), NOW));
        assertEquals("completed", CourseRules.sessionStatus(NOW, NOW, NOW.minusDays(1), NOW),
                "Une séance terminée après l’échéance reste terminée : le retard est mesuré par Suivi.");
    }

    @Test
    void lEcheanceTombeA20HeuresAParisDansLAnneeQuiVient() {
        LocalDate today = LocalDate.of(2026, 11, 22);
        OffsetDateTime winter = CourseRules.firstDue("2026-11-24", today);
        assertEquals(OffsetDateTime.parse("2026-11-24T20:00:00+01:00"), winter);
        OffsetDateTime summer = CourseRules.firstDue("2027-07-01", today);
        assertEquals(OffsetDateTime.parse("2027-07-01T20:00:00+02:00"), summer);
        assertEquals(today, CourseRules.firstDue("2026-11-22", today).toLocalDate());
    }

    @Test
    void uneEcheanceInvalideEstRefusee() {
        LocalDate today = LocalDate.of(2026, 11, 22);
        for (String date : new String[] {"2026-11-21", "2027-11-23", "22/11/2026", "", null}) {
            var error = assertThrows(WebApplicationException.class, () -> CourseRules.firstDue(date, today));
            assertEquals(400, error.getResponse().getStatus());
        }
    }

    @Test
    void laTranscriptionSuitLaRegleDuSupport() {
        assertTrue(CourseRules.transcriptAvailable("on_demand", false, false));
        assertFalse(CourseRules.transcriptAvailable("after_answer", false, false));
        assertTrue(CourseRules.transcriptAvailable("after_answer", true, false));
        assertFalse(CourseRules.transcriptAvailable("hidden", true, false));
        assertFalse(CourseRules.transcriptAvailable(null, true, false));
        assertTrue(CourseRules.transcriptAvailable("hidden", false, true), "L’équipe pédagogique voit toujours la transcription.");
    }

    @Test
    void seuleUneActiviteNoteeOuUneMissionExigeUneTentative() {
        assertTrue(CourseRules.requiresAttempt("exercise"));
        assertTrue(CourseRules.requiresAttempt("assessment"));
        assertTrue(CourseRules.requiresAttempt("mission"), "une mission se termine avec sa remise");
        assertFalse(CourseRules.requiresAttempt("lesson"));
        assertFalse(CourseRules.requiresAttempt("review"));
    }

    @Test
    void uneMissionNeTermineLActiviteQueRemiseDepuisCetteSeance() {
        String base = "{'id': '33333333-3333-4333-8333-333333333333', 'learnerId': '" + LEARNER + "', 'status': '%s',"
                + " 'sessionId': '%s', 'sessionActivityId': '%s', 'activityId': 'a1-sante-mission'}";
        for (String status : List.of("submitted", "sent", "reviewed")) {
            assertTrue(CourseRules.missionCompletes(json(base.formatted(status, SESSION, "a1-sante-mission")), LEARNER, SESSION,
                    "a1-sante-mission"), status);
        }
        assertFalse(CourseRules.missionCompletes(json(base.formatted("draft", SESSION, "a1-sante-mission")), LEARNER, SESSION,
                "a1-sante-mission"), "un brouillon n'est pas une remise");
        assertFalse(CourseRules.missionCompletes(json(base.formatted("submitted", UUID.randomUUID(), "a1-sante-mission")),
                LEARNER, SESSION, "a1-sante-mission"), "remise depuis une autre séance");
        assertFalse(CourseRules.missionCompletes(json(base.formatted("submitted", SESSION, "a1-autre-mission")), LEARNER,
                SESSION, "a1-sante-mission"), "remise pour une autre activité");
        assertFalse(CourseRules.missionCompletes(json(base.formatted("submitted", SESSION, "a1-sante-mission")),
                UUID.randomUUID(), SESSION, "a1-sante-mission"), "remise d'un autre élève");
        assertFalse(CourseRules.missionCompletes(json("{'status': 'submitted', 'sessionId': null}"), LEARNER, SESSION,
                "a1-sante-mission"), "remise libre (bibliothèque)");
        assertFalse(CourseRules.missionCompletes(null, LEARNER, SESSION, "a1-sante-mission"));
    }

    /** Réponse d'un catalogue qui servirait par erreur des corrigés (ancien format ou régression). */
    private static final JsonNode LEAKY = json("""
            [{'id': 'q1', 'type': 'choice', 'prompt': 'Quel mot ?', 'explanation': 'Parce que.',
              'options': [{'id': 'a', 'text': 'weil', 'correct': true, 'feedback': 'Bien.'}, {'id': 'b', 'text': 'denn'}]},
             {'id': 'q2', 'type': 'fill', 'prompt': 'Complétez.', 'text': 'Ich bleibe, [[1]] ich krank bin.',
              'blanks': [{'id': '1', 'size': 6, 'hint': null, 'accept': ['weil']}], 'spec': {'text': 'x'}},
             {'id': 'q3', 'type': 'order', 'prompt': 'Ordre.', 'tokens': [{'id': 'k1a2b3c', 'text': 'weil'}],
              'answers': [['weil']]},
             {'id': 'q4', 'type': 'match', 'prompt': 'Associez.', 'left': [{'id': 'l1', 'text': 'warten'}],
              'right': [{'id': 'r1', 'text': 'auf'}], 'pairs': {'l1': 'r1'}},
             {'id': 'q5', 'type': 'dictation', 'prompt': 'Écrivez.', 'wordCount': 7, 'accept': ['Der Zug fährt ab.']},
             {'id': 'q6', 'type': 'speak', 'prompt': 'Répétez.', 'text': 'Hallo.', 'threshold': 80}]
            """);

    @Test
    void aucuneVueEleveNeContientDeCorrigeAvantLaRemise() throws Exception {
        JsonNode questions = CourseRules.publicQuestions(LEAKY);
        assertNoAnswerKey(questions);
        assertEquals("weil", questions.get(0).path("options").get(0).path("text").asText(), "le texte des choix reste");
        assertEquals("Ich bleibe, [[1]] ich krank bin.", questions.get(1).path("text").asText());
        assertEquals(6, questions.get(1).path("blanks").get(0).path("size").asInt());
        assertEquals("k1a2b3c", questions.get(2).path("tokens").get(0).path("id").asText());
        assertEquals("Hallo.", questions.get(5).path("text").asText());
        assertTrue(LEAKY.get(0).has("explanation"), "la réponse du catalogue n'est pas modifiée");

        // Vue de séance et vue de bibliothèque complètes, telles que sérialisées pour l'élève.
        ActivityDetail detail = new ActivityDetail("a1-sante-pratique", 1, "exercise", "S’entraîner", 10, List.of("lecture"),
                "todo", JSON.createObjectNode(), null, null, new CourseResource.LessonView("l", "Leçon", "Texte."), null,
                questions, List.of(), null, VERSION, "a1-sante-pratique", null);
        assertNoAnswerKey(JSON.valueToTree(detail));
        LibraryActivity library = new LibraryActivity("a1-sante-pratique", 1, "exercise", "S’entraîner", 10, List.of(),
                "todo", JSON.createObjectNode(), null, null, null, null, CourseRules.publicQuestions(LEAKY), List.of(), VERSION,
                "A1", "a1-sante", "Santé", null);
        assertNoAnswerKey(JSON.valueToTree(library));
        assertEquals(0, CourseRules.publicQuestions(json("{}")).size(), "pas de questions : tableau vide");
        assertEquals(0, CourseRules.publicQuestions(null).size());
    }

    @Test
    void laDefinitionDUneMissionVientDuCatalogue() {
        JsonNode content = json("""
                {'activity': {'id': 'a1-sante-mission', 'kind': 'mission'},
                 'lesson': {'id': 'l', 'title': 'Mission', 'description': 'Vous devez déplacer un rendez-vous.'},
                 'mission': {'oral': {'prompt': 'Appelez le cabinet.', 'maxSeconds': 90}, 'written': null,
                             'checklist': ['Je salue.', 'Je propose une date.']}}
                """);
        assertEquals(new MissionDefinition("Vous devez déplacer un rendez-vous.", new MissionOral("Appelez le cabinet.", 90),
                null, List.of("Je salue.", "Je propose une date.")), CourseRules.missionDefinition(content));
        JsonNode written = json("{'lesson': {'description': 'Situation.'}, 'mission': {'written': {'prompt': 'Écrivez.'},"
                + " 'checklist': []}}");
        assertEquals(new MissionWritten("Écrivez.", 1500, 0), CourseRules.missionDefinition(written).written(),
                "valeurs par défaut");
        assertNull(CourseRules.missionDefinition(json("{'activity': {'kind': 'exercise'}, 'mission': null}")));
        assertNull(CourseRules.missionDefinition(json("{'activity': {'kind': 'lesson'}}")), "catalogue antérieur aux missions");
    }

    private static final JsonNode TRACK = json("""
            {'versionId': '7d0c1f5e-8a54-4c0e-9d7a-2f4f3c2b1a00', 'planning': {'passPercent': 60},
             'modules': [
               {'id': 'a1-sante', 'activities': [
                 {'id': 'a1-sante-lecon', 'kind': 'lesson', 'title': 'Leçon', 'lessonId': 'a1-v4-a1-sante-lecon'},
                 {'id': 'a1-sante-pratique', 'kind': 'exercise', 'title': 'S’entraîner : weil', 'lessonId': 'a1-v4-a1-sante-pratique'},
                 {'id': 'a1-sante-repeter', 'kind': 'exercise', 'title': 'Répéter à voix haute', 'lessonId': 'a1-v4-a1-sante-repeter'},
                 {'id': 'a1-sante-dictee', 'kind': 'exercise', 'title': 'Dictée', 'lessonId': 'a1-v4-a1-sante-dictee'},
                 {'id': 'a1-sante-quiz', 'kind': 'exercise', 'title': 'Vérifier', 'lessonId': 'a1-v4-a1-sante-quiz'},
                 {'id': 'a1-sante-mission', 'kind': 'mission', 'title': 'Mission', 'lessonId': 'a1-v4-a1-sante-mission'}]},
               {'id': 'a1-arbeit', 'activities': [
                 {'id': 'a1-arbeit-quiz', 'kind': 'exercise', 'title': 'Quiz', 'lessonId': 'a1-v4-a1-arbeit-quiz'}]}]}
            """);

    @Test
    void laRevisionDUnModuleListeLesExercicesAReprendre() {
        JsonNode grades = json("""
                [{'id': '1', 'lessonId': 'a1-v4-a1-sante-repeter', 'kind': 'quiz', 'correct': 4, 'total': 5, 'flagged': ['q3']},
                 {'id': '2', 'lessonId': 'a1-v4-a1-sante-pratique', 'kind': 'quiz', 'correct': 2, 'total': 6, 'flagged': []},
                 {'id': '3', 'lessonId': 'a1-v4-a1-sante-dictee', 'kind': 'quiz', 'correct': 4, 'total': 4, 'flagged': []},
                 {'id': '4', 'lessonId': 'a1-v4-a1-sante-dictee', 'kind': 'quiz', 'correct': 0, 'total': 4, 'flagged': []},
                 {'id': '5', 'lessonId': 'a1-v4-a1-arbeit-quiz', 'kind': 'quiz', 'correct': 0, 'total': 4},
                 {'id': '6', 'lessonId': 'a1-v4-a1-sante-quiz', 'kind': 'diagnostic', 'correct': 0, 'total': 4}]
                """);
        List<ReviewItem> items = CourseRules.reviewItems(TRACK, "a1-sante", grades);
        assertEquals(List.of(
                new ReviewItem("a1-sante-pratique", "S’entraîner : weil", VERSION, List.of(), new ReviewScore(2, 6)),
                new ReviewItem("a1-sante-repeter", "Répéter à voix haute", VERSION, List.of("q3"), new ReviewScore(4, 5))),
                items, "à reprendre : sous le seuil, ou avec des questions à revoir ; la dernière remise fait foi");
        assertTrue(CourseRules.reviewItems(TRACK, "a1-inconnu", grades).isEmpty());
        assertTrue(CourseRules.reviewItems(TRACK, "a1-sante", json("[]")).isEmpty(), "rien de remis : rien à reprendre");
        assertTrue(CourseRules.reviewItems(null, "a1-sante", grades).isEmpty());
    }

    private static void assertNoAnswerKey(JsonNode node) {
        List<String> keys = new ArrayList<>();
        collect(node, keys);
        for (String key : ANSWER_KEYS) assertFalse(keys.contains(key), "clé de corrigé « " + key + " » servie à l'élève : " + node);
    }

    private static void collect(JsonNode node, List<String> keys) {
        if (node.isObject()) node.fieldNames().forEachRemaining(keys::add);
        node.forEach(child -> collect(child, keys));
    }
}
