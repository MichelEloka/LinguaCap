package org.linguacap.assessment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.ws.rs.WebApplicationException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;

class ExerciseGradingTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final UUID ROUND = UUID.fromString("6f1f8c52-7a56-4e8e-9d8e-2a4b1c0d9e01");
    private static final UUID PASSED = UUID.fromString("0b6d2c1a-1111-4c3b-8a9e-5f0e7d6c5b4a");

    private static JsonNode json(String text) {
        try {
            return JSON.readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalStateException(error);
        }
    }

    /** Clé servie par Catalogue (exercise-key) pour un exercice A2 « Santé » : une question de chaque type. */
    private static final JsonNode KEY = json("""
            {'lessonId':'a2-sante-entrainer','versionId':'5d0c1b2a-3e4f-4a5b-8c6d-7e8f9a0b1c2d','frozen':true,'questions':[
              {'id':'q1','type':'choice','prompt':'Quelle phrase est correcte ?','explanation':'Après weil, le verbe conjugué va à la fin.',
               'options':[{'id':'a','label':'Ich bleibe zu Hause, weil ich bin krank.','correct':false,
                           'feedback':'Après weil, le verbe ne reste pas en deuxième position.'},
                          {'id':'b','label':'Ich bleibe zu Hause, weil ich krank bin.','correct':true,'feedback':null},
                          {'id':'c','label':'Ich bleibe zu Hause, weil bin ich krank.','correct':false,'feedback':null}]},
              {'id':'q2','type':'fill','prompt':'Complétez avec la bonne préposition.',
               'text':'Ich warte [[1]] den Bus und gehe dann [[2]] Arzt.',
               'blanks':[{'id':'1','accept':['auf'],'size':4,'hint':null},{'id':'2','accept':['zum','zu dem'],'size':6,'hint':null}],
               'explanation':'On attend « auf » + accusatif ; zu + dem se contracte en zum.'},
              {'id':'q3','type':'order','prompt':'Remettez les mots dans l’ordre.',
               'tokens':[{'id':'k1a2b3','text':'weil'},{'id':'k4c5d6','text':'bin.'},{'id':'k7e8f9','text':'Ich bleibe zu Hause,'},
                         {'id':'ka1b2c','text':'krank'},{'id':'kd3e4f','text':'ich'}],
               'answers':[['Ich bleibe zu Hause,','weil','ich','krank','bin.']],
               'explanation':'Weil renvoie le verbe conjugué en fin de proposition.'},
              {'id':'q4','type':'match','prompt':'Associez chaque verbe à sa construction.',
               'left':[{'id':'l1','text':'warten'},{'id':'l2','text':'helfen'},{'id':'l3','text':'teilnehmen'}],
               'right':[{'id':'r1','text':'+ datif'},{'id':'r2','text':'an + datif'},{'id':'r3','text':'auf + accusatif'}],
               'pairs':{'l1':'r3','l2':'r1','l3':'r2'},'explanation':'warten auf + A, helfen + D, teilnehmen an + D.'},
              {'id':'q5','type':'dictation','prompt':'Écoutez et écrivez la phrase.',
               'accept':['Der Zug nach München fährt um 10 Uhr ab.'],'explanation':'Abfahren est séparable : ab va à la fin.'},
              {'id':'q6','type':'speak','prompt':'Écoutez puis répétez.','text':'Mir tut der Kopf weh.',
               'accept':['Mir tut der Kopf weh.'],'threshold':75,'explanation':'Mir tut … weh : la douleur au datif.'}]}
            """);

    private static final String RIGHT = """
            {'q1':{'choice':'b'},'q2':{'blanks':{'1':'auf','2':'zu dem'}},
             'q3':{'order':['k7e8f9','k1a2b3','kd3e4f','ka1b2c','k4c5d6']},
             'q4':{'pairs':{'l1':'r3','l2':'r1','l3':'r2'}},
             'q5':{'text':'Der Zug nach München fährt um zehn Uhr ab.'},'q6':{'speechAttemptId':'%s'}}
            """;

    private static AnswerRules.SpeechOutcome speech(UUID id, String mode, boolean passed, String status, int failures) {
        return new AnswerRules.SpeechOutcome(id, "q6", mode, passed, status, passed ? 100 : 40, "mir tut der Kopf weh",
                failures + (passed ? 1 : 0), failures, null);
    }

    private static JsonNode answers(String speechId) {
        return json(RIGHT.formatted(speechId));
    }

    private static JsonNode with(JsonNode answers, String question, String answer) {
        ObjectNode copy = answers.deepCopy();
        copy.set(question, json(answer));
        return copy;
    }

    private static JsonNode question(ExerciseStore.Graded graded, String id) {
        for (JsonNode review : graded.questions()) {
            if (review.path("id").asText().equals(id)) return review;
        }
        throw new AssertionError("question absente : " + id);
    }

    private static int status(Executable action) {
        return assertThrows(WebApplicationException.class, action).getResponse().getStatus();
    }

    @Test
    void desRéponsesJustesDonnentLaCorrectionDeChaqueQuestion() {
        var graded = ExerciseResource.grade(KEY, answers(PASSED.toString()),
                Map.of(PASSED, speech(PASSED, "recognition", true, "auto", 0)));
        assertEquals(6, graded.total());
        assertEquals(6, graded.correct());
        assertEquals(0, graded.pending());
        assertEquals(List.of(), graded.flagged());
        assertEquals(List.of(PASSED), graded.speechIds());
        for (JsonNode review : graded.questions()) {
            assertEquals("correct", review.path("status").asText(), review.toString());
            assertFalse(review.path("explanation").asText("").isBlank(), "chaque question porte son explication");
            assertFalse(review.path("prompt").asText("").isBlank());
        }
        JsonNode fill = question(graded, "q2");
        assertEquals(List.of("zum", "zu dem"), AnswerRules.strings(fill.path("expected").path("blanks").path("2")));
        assertTrue(fill.path("detail").path("blanks").path("2").path("correct").asBoolean());
        assertEquals("Ich bleibe zu Hause, weil ich krank bin.", question(graded, "q3").path("given").path("sentence").asText());
        assertEquals("Ich bleibe zu Hause, weil ich krank bin.", question(graded, "q1").path("given").path("label").asText());
        assertEquals("auf + accusatif", question(graded, "q4").path("expected").path("labels").path("r3").asText());
        assertEquals(100, question(graded, "q5").path("detail").path("score").asInt(), "10 et zehn se valent");
        assertEquals("Mir tut der Kopf weh.", question(graded, "q6").path("expected").path("text").asText());
        assertEquals("recognition", question(graded, "q6").path("detail").path("mode").asText());
    }

    @Test
    void desRéponsesFaussesMontrentLaRéponseAttendueEtLeRetour() {
        JsonNode answers = answers(PASSED.toString());
        answers = with(answers, "q1", "{'choice':'a'}");
        answers = with(answers, "q2", "{'blanks':{'1':'für','2':'zur'}}");
        answers = with(answers, "q3", "{'order':['k7e8f9','k1a2b3','kd3e4f','k4c5d6','ka1b2c']}");
        answers = with(answers, "q4", "{'pairs':{'l1':'r1','l2':'r3','l3':'r2'}}");
        answers = with(answers, "q5", "{'text':'Der Zug nach München fährt um zehn ab.'}");
        var graded = ExerciseResource.grade(KEY, answers, Map.of(PASSED, speech(PASSED, "recognition", true, "auto", 0)));
        assertEquals(1, graded.correct(), "seule la répétition est juste");
        JsonNode choice = question(graded, "q1");
        assertEquals("incorrect", choice.path("status").asText());
        assertEquals("b", choice.path("expected").path("optionId").asText());
        assertEquals("Après weil, le verbe ne reste pas en deuxième position.", choice.path("feedback").asText());
        JsonNode order = question(graded, "q3");
        assertEquals("incorrect", order.path("status").asText());
        assertEquals("Ich bleibe zu Hause, weil ich krank bin.", order.path("expected").path("sentence").asText());
        assertEquals("Ich bleibe zu Hause, weil ich bin. krank", order.path("given").path("sentence").asText());
        JsonNode match = question(graded, "q4");
        assertFalse(match.path("detail").path("pairs").path("l1").asBoolean());
        assertTrue(match.path("detail").path("pairs").path("l3").asBoolean());
        JsonNode dictation = question(graded, "q5");
        assertEquals("incorrect", dictation.path("status").asText());
        assertEquals(89, dictation.path("detail").path("score").asInt(), "un mot manquant sur neuf");
        assertTrue(dictation.path("detail").path("words").toString().contains("\"status\":\"missing\""));
    }

    @Test
    void lesGraphiesTolérées() {
        JsonNode answers = with(answers(PASSED.toString()), "q5", "{'text':'der zug nach muenchen faehrt um zehn uhr ab'}");
        answers = with(answers, "q2", "{'blanks':{'1':'Auf','2':'zum'}}");
        var graded = ExerciseResource.grade(KEY, answers, Map.of(PASSED, speech(PASSED, "recognition", true, "auto", 0)));
        assertEquals(6, graded.correct());
        assertEquals(List.of("transliteration", "case"), AnswerRules.strings(question(graded, "q5").path("notices")),
                "München et Zug : graphie à retenir et majuscule du nom");
    }

    @Test
    void laRépétitionOraleDécideDuStatutDeLaQuestion() {
        UUID failed = UUID.randomUUID();
        var flagged = ExerciseResource.grade(KEY, answers(failed.toString()),
                Map.of(failed, speech(failed, "recognition", false, "auto", 3)));
        assertEquals(5, flagged.correct());
        assertEquals(List.of("q6"), flagged.flagged(), "trois échecs : l'élève continue, la question est à revoir");
        assertEquals("flagged", question(flagged, "q6").path("status").asText());

        assertEquals(409, status(() -> ExerciseResource.grade(KEY, answers(failed.toString()),
                Map.of(failed, speech(failed, "recognition", false, "auto", 2)))), "deux échecs : la remise attend");

        UUID recording = UUID.randomUUID();
        var pending = ExerciseResource.grade(KEY, answers(recording.toString()),
                Map.of(recording, speech(recording, "recording", false, "pending", 0)));
        assertEquals(1, pending.pending());
        assertEquals(5, pending.correct());
        assertEquals("pending", question(pending, "q6").path("status").asText());
        assertEquals(409, status(() -> ExerciseResource.grade(KEY, answers(recording.toString()),
                Map.of(recording, speech(recording, "recording", false, "uploading", 0)))), "envoi non terminé");
        assertEquals(List.of("q6"), ExerciseResource.grade(KEY, answers(recording.toString()),
                Map.of(recording, speech(recording, "recording", false, "rejected", 1))).flagged());
        assertEquals(6, ExerciseResource.grade(KEY, answers(recording.toString()),
                Map.of(recording, speech(recording, "recording", true, "validated", 0))).correct());

        UUID other = UUID.randomUUID();
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, answers(other.toString()), Map.of())),
                "essai d'une autre manche");
        var elsewhere = new AnswerRules.SpeechOutcome(other, "q7", "recognition", true, "auto", 100, "", 1, 0, null);
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, answers(other.toString()), Map.of(other, elsewhere))),
                "essai d'une autre question");
    }

    @Test
    void lesRéponsesÉtrangèresOuIncomplètesSontRefusées() {
        Map<UUID, AnswerRules.SpeechOutcome> speech = Map.of(PASSED, speech(PASSED, "recognition", true, "auto", 0));
        JsonNode answers = answers(PASSED.toString());
        ObjectNode incomplete = answers.deepCopy();
        incomplete.remove("q4");
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, incomplete, speech)));
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, with(answers, "q9", "{'choice':'a'}"), speech)));
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, with(answers, "q1", "{'choice':'z'}"), speech)));
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, with(answers, "q1", "{'text':'b'}"), speech)), "mauvais type");
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, with(answers, "q2", "{'blanks':{'3':'auf'}}"), speech)));
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, with(answers, "q3", "{'order':['k1a2b3','k1a2b3']}"), speech)),
                "un jeton ne sert qu'une fois");
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, with(answers, "q3", "{'order':['kzzzzz']}"), speech)));
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, with(answers, "q4", "{'pairs':{'l9':'r1'}}"), speech)));
        assertEquals(400, status(() -> ExerciseResource.grade(KEY, with(answers, "q4", "{'pairs':{'l1':'r9'}}"), speech)));
        WebApplicationException refused = assertThrows(WebApplicationException.class,
                () -> ExerciseResource.grade(KEY, with(answers, "q2", "{'blanks':{'9':'x'}}"), speech));
        String message = String.valueOf(refused.getResponse().getEntity());
        assertFalse(message.contains("auf") || message.contains("zum"), "un refus ne révèle pas le corrigé : " + message);
    }

    @Test
    void laFormeDeLaRemiseEstBornée() {
        String key = "remise-12345678";
        assertEquals(400, status(() -> ExerciseResource.validate(request(answers(PASSED.toString()), null), key)),
                "manche requise");
        ExerciseResource.validate(request(answers(PASSED.toString()), ROUND), key);
        assertEquals(400, status(() -> ExerciseResource.validate(
                new ExerciseResource.SubmitRequest("a2-sante-entrainer", ROUND, UUID.randomUUID(), null,
                        answers(PASSED.toString())), key)), "séance sans activité");
        assertEquals(400, status(() -> ExerciseResource.validate(
                request(with(answers(PASSED.toString()), "q5", "{'text':'" + "a".repeat(501) + "'}"), ROUND), key)));
        assertEquals(400, status(() -> ExerciseResource.validate(
                request(with(answers(PASSED.toString()), "q2", "{'blanks':{'1':'" + "a".repeat(81) + "'}}"), ROUND), key)));
        StringBuilder tokens = new StringBuilder("{'order':[");
        for (int index = 0; index < 17; index++) tokens.append(index == 0 ? "" : ",").append("'k").append(index).append("'");
        assertEquals(400, status(() -> ExerciseResource.validate(
                request(with(answers(PASSED.toString()), "q3", tokens.append("]}").toString()), ROUND), key)));
        StringBuilder pairs = new StringBuilder("{'pairs':{");
        for (int index = 0; index < 9; index++) pairs.append(index == 0 ? "" : ",").append("'l").append(index).append("':'r1'");
        assertEquals(400, status(() -> ExerciseResource.validate(
                request(with(answers(PASSED.toString()), "q4", pairs.append("}}").toString()), ROUND), key)));
        assertEquals(400, status(() -> ExerciseResource.validate(
                request(with(answers(PASSED.toString()), "q6", "{'speechAttemptId':'pas-un-uuid'}"), ROUND), key)));
        assertEquals(400, status(() -> ExerciseResource.validate(
                request(with(answers(PASSED.toString()), "q1", "{'choice':'b','text':'b'}"), ROUND), key)));
        ObjectNode many = JSON.createObjectNode();
        for (int index = 0; index < 31; index++) many.set("q" + index, json("{'choice':'a'}"));
        assertEquals(400, status(() -> ExerciseResource.validate(request(many, ROUND), key)), "30 questions au plus");
        assertEquals(400, status(() -> ExerciseResource.validate(request(answers(PASSED.toString()), ROUND), "court")));
    }

    @Test
    void uneAncienneRemiseEstCorrigéeÀLaVoléeSansExplication() {
        var legacy = ExerciseResource.legacy(KEY, json("{'q1':'a'}"));
        assertEquals(1, legacy.size(), "seules les questions à choix d'une ancienne remise sont relues");
        JsonNode review = legacy.get(0);
        assertEquals("incorrect", review.path("status").asText());
        assertEquals("b", review.path("expected").path("optionId").asText());
        assertTrue(review.path("explanation").isNull());
        assertTrue(review.path("feedback").isNull());
        assertEquals(0, ExerciseResource.legacy(null, json("{'q1':'a'}")).size(), "leçon disparue : pas de correction");
        var graded = ExerciseResource.grade(KEY, with(answers(PASSED.toString()), "q1", "'b'"),
                Map.of(PASSED, speech(PASSED, "recognition", true, "auto", 0)));
        assertEquals("correct", question(graded, "q1").path("status").asText(), "ancien état {q1:'b'} relu comme un choix");
    }

    @Test
    void lesEssaisDeLaMancheSontComptésParQuestion() {
        UUID first = UUID.randomUUID();
        UUID second = UUID.randomUUID();
        UUID third = UUID.randomUUID();
        var outcomes = ExerciseStore.outcomes(List.of(attempt(first, 1, false), attempt(second, 2, false),
                attempt(third, 3, false)));
        assertEquals(3, outcomes.get(third).failures());
        assertEquals(3, outcomes.get(third).attempts());
        assertEquals(List.of("q6"), ExerciseResource.grade(KEY, answers(third.toString()), outcomes).flagged());
        var passed = ExerciseStore.outcomes(List.of(attempt(first, 1, false), attempt(second, 2, true)));
        assertEquals(6, ExerciseResource.grade(KEY, answers(second.toString()), passed).correct());
    }

    private static SpeechStore.Speech attempt(UUID id, int number, boolean passed) {
        return new SpeechStore.Speech(id, UUID.randomUUID(), "a2-sante-entrainer", "q6", ROUND, null, null, number,
                "recognition", "mir tut der kopf", passed ? 90 : 50, 75, passed, null, null, "auto", null, null, null,
                null, OffsetDateTime.now());
    }

    private static ExerciseResource.SubmitRequest request(JsonNode answers, UUID round) {
        return new ExerciseResource.SubmitRequest("a2-sante-entrainer", round, null, null, answers);
    }
}
