package org.linguacap.catalogue;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.WebApplicationException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.linguacap.catalogue.QuestionSpecs.Blank;
import org.linguacap.catalogue.QuestionSpecs.Pair;
import org.linguacap.catalogue.QuestionSpecs.Spec;
import org.linguacap.catalogue.VersionDocument.Activity;
import org.linguacap.catalogue.VersionDocument.Criterion;
import org.linguacap.catalogue.VersionDocument.Diagnostic;
import org.linguacap.catalogue.VersionDocument.Lesson;
import org.linguacap.catalogue.VersionDocument.MediaRef;
import org.linguacap.catalogue.VersionDocument.Mission;
import org.linguacap.catalogue.VersionDocument.Module;
import org.linguacap.catalogue.VersionDocument.Option;
import org.linguacap.catalogue.VersionDocument.Oral;
import org.linguacap.catalogue.VersionDocument.Placement;
import org.linguacap.catalogue.VersionDocument.Question;
import org.linguacap.catalogue.VersionDocument.Settings;
import org.linguacap.catalogue.VersionDocument.VocabularyAudio;
import org.linguacap.catalogue.VersionDocument.VocabularyEntry;
import org.linguacap.catalogue.VersionDocument.Written;

class VersionDocumentTest {
    private static final Settings SETTINGS = new Settings(List.of("lecture", "ecoute"), "Réussir 60 % de l’examen blanc.",
            60, 10, 30, 60);
    /** Lecture stricte, comme le service (quarkus.jackson.fail-on-unknown-properties=true). */
    private static final ObjectMapper STRICT = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);

    private static Question question(String id, boolean... correct) {
        List<Option> options = new java.util.ArrayList<>();
        for (int index = 0; index < correct.length; index++) {
            options.add(new Option("o" + index, "Choix " + index, correct[index]));
        }
        return new Question(id, "Question " + id + " ?", null, options);
    }

    private static Question typed(String id, String type, Spec spec) {
        return new Question(id, type, "Consigne " + id + ".", null, "Parce que la règle le veut.", List.of(), spec);
    }

    private static Spec fill(String text, Blank... blanks) {
        return new Spec(text, List.of(blanks), null, null, null, null, null);
    }

    private static Spec order(List<List<String>> answers) {
        return new Spec(null, null, answers, null, null, null, null);
    }

    private static Spec match(Pair... pairs) {
        return new Spec(null, null, null, List.of(pairs), null, null, null);
    }

    private static Spec dictation(String... accept) {
        return new Spec(null, null, null, null, List.of(accept), true, null);
    }

    private static Spec speak(String text, Integer threshold, String... accept) {
        return new Spec(text, null, null, null, List.of(accept), null, threshold);
    }

    private static Module complete() {
        Placement image = new Placement("kaffee-image", 1, "illustration", "Une tasse de café.", null, "hidden", false, null, null);
        return new Module("au-cafe", "Au café", "Commander une boisson.", List.of(), List.of(
                new Activity("lecon", "lesson", "Commander", 10, List.of("ecoute"),
                        new Lesson("Commander", "Texte de la leçon.", "Kaffee."), List.of(), List.of(image)),
                new Activity("quiz", "exercise", "Exercice", 5, List.of("ecoute"), null,
                        List.of(question("q1", true, false)), List.of())));
    }

    /** Module V4 : exercice typé complet, mission et vocabulaire avec son de lexique. */
    private static Module v4() {
        Placement dictationSound = new Placement("a1-sante-dictee-q5", 1, "audio", null, null, "after_answer", false, "q5", null);
        Activity exercise = new Activity("a1-sante-pratique", "exercise", "S’entraîner : weil", 10, List.of("lecture", "ecoute"),
                new Lesson("S’entraîner", "Complétez.", null), List.of(
                        new Question("q1", "choice", "Quel mot ?", null, "Weil renvoie le verbe à la fin.",
                                List.of(new Option("a", "weil", true, null), new Option("b", "denn", false, "Denn ne renvoie pas le verbe."))
                                , null),
                        typed("q2", "fill", fill("Ich bleibe zu Hause, [[1]] ich krank bin.", new Blank("1", List.of("weil"), 6, null))),
                        typed("q3", "order", order(List.of(List.of("Ich bleibe zu Hause,", "weil", "ich", "krank", "bin.")))),
                        typed("q4", "match", match(new Pair("warten", "auf + accusatif"), new Pair("denken", "an + accusatif"))),
                        typed("q5", "dictation", dictation("Der Zug fährt um zehn Uhr ab.")),
                        typed("q6", "speak", speak("Ich habe Kopfschmerzen.", null, "Ich habe Kopfschmerzen."))),
                List.of(dictationSound));
        Activity mission = new Activity("a1-sante-mission", "mission", "Mission : déplacer un rendez-vous", 20,
                List.of("expression-orale", "expression-ecrite"),
                new Lesson("Mission", "Vous devez déplacer votre rendez-vous chez le médecin.", null), List.of(), List.of(),
                new Mission(new Oral("Appelez le cabinet.", 120), new Written("Écrivez un message.", 1500, 25),
                        List.of("Je salue.", "Je propose une autre date.")));
        VocabularyEntry kopf = new VocabularyEntry("kopf", "Kopf", "der", "Köpfe", "noun", "la tête", "Mein Kopf tut weh.",
                null, new VocabularyAudio("a1-sante-lexique", 2, 0.0, 1.4));
        VocabularyEntry leute = new VocabularyEntry("leute", "Leute", null, null, "noun", "les gens", null,
                "toujours au pluriel", null);
        return new Module("a1-sante", "Santé", "Dire où on a mal.", List.of(), List.of(exercise, mission), List.of(kopf, leute));
    }

    @Test
    void unParcoursCompletEstPubliable() {
        var checks = VersionDocument.check(SETTINGS, null, List.of(complete()));
        assertTrue(checks.publishable(), () -> checks.issues().toString());
    }

    @Test
    void chaqueManqueEstSignaleAvecSonEmplacement() {
        Placement unnamed = new Placement("kaffee-image", 1, "illustration", " ", null, "hidden", false, null, null);
        Module incomplete = new Module("vide", "", "", List.of("inconnu"), List.of(
                new Activity("lecon", "lesson", "", 10, List.of(), new Lesson("", "", ""), List.of(), List.of(unnamed)),
                new Activity("quiz", "exercise", "Exercice", 5, List.of(), null,
                        List.of(question("q1", true, true), question("q2", false)), List.of())));
        var checks = VersionDocument.check(new Settings(List.of(), "", 60, 10, 30, 60), null, List.of(incomplete));
        assertFalse(checks.publishable());
        List<String> paths = checks.issues().stream().map(VersionDocument.Issue::path).toList();
        for (String expected : List.of("settings.successCriteria", "settings.expectedCompetences", "modules[0].title",
                "modules[0].objective", "modules[0].prerequisites", "modules[0].activities[0].title",
                "modules[0].activities[0].lesson", "modules[0].activities[0].placements[0].alt",
                "modules[0].activities[1].questions[0].options", "modules[0].activities[1].questions[1].options")) {
            assertTrue(paths.contains(expected), "Manque signalé : " + expected + " dans " + paths);
        }
    }

    @Test
    void uneImageDecorativeNExigePasDeTexteAlternatif() {
        Placement decorative = new Placement("kaffee-image", 1, "illustration", null, null, "hidden", true, null, null);
        Module module = new Module("m", "Module", "Objectif.", List.of(), List.of(new Activity("lecon", "lesson", "Leçon", 5,
                List.of(), new Lesson("Leçon", "Texte.", ""), List.of(), List.of(decorative))));
        assertTrue(VersionDocument.check(SETTINGS, null, List.of(module)).publishable());
    }

    @Test
    void lesPrerequisEnBoucleSontRefuses() {
        Module first = new Module("a", "A", "Objectif.", List.of("b"), complete().activities());
        Module second = new Module("b", "B", "Objectif.", List.of("a"), List.of(
                new Activity("autre", "lesson", "Autre", 5, List.of(), new Lesson("Autre", "Texte.", ""), List.of(), List.of())));
        var checks = VersionDocument.check(SETTINGS, null, List.of(first, second));
        assertTrue(checks.issues().stream().anyMatch(issue -> issue.message().contains("boucle")));
    }

    @Test
    void leDiagnosticRattacheChaqueQuestionAUnModuleOuAuPrerequis() {
        Diagnostic diagnostic = new Diagnostic("Diagnostic", "Situer l’élève.", List.of(
                new Question("d1", "Q ?", "au-cafe", List.of(new Option("a", "A", true), new Option("b", "B", false))),
                new Question("d2", "Q ?", "prerequis", List.of(new Option("a", "A", true), new Option("b", "B", false))),
                new Question("d3", "Q ?", "ailleurs", List.of(new Option("a", "A", true), new Option("b", "B", false)))));
        var checks = VersionDocument.check(SETTINGS, diagnostic, List.of(complete()));
        assertEquals(List.of("diagnostic.questions[2].moduleRef"), checks.issues().stream().map(VersionDocument.Issue::path).toList());
    }

    @Test
    void laStructureRefuseLesIdentifiantsInvalidesOuEnDouble() {
        assertDoesNotThrow(() -> VersionDocument.checkStructure(SETTINGS, null, List.of(complete())));
        Module badId = new Module("Au Café", "Au café", "Objectif.", List.of(), List.of());
        assertEquals(400, assertThrows(WebApplicationException.class,
                () -> VersionDocument.checkStructure(SETTINGS, null, List.of(badId))).getResponse().getStatus());
        assertThrows(WebApplicationException.class, () -> VersionDocument.checkStructure(SETTINGS, null, List.of(complete(), complete())));
        Module reserved = new Module("m", "M", "O", List.of(), List.of(new Activity("diagnostic", "lesson", "L", 5, List.of(),
                null, List.of(), List.of())));
        assertThrows(WebApplicationException.class, () -> VersionDocument.checkStructure(SETTINGS, null, List.of(reserved)));
        Module planned = new Module("m", "M", "O", List.of(), List.of(new Activity("revision-m", "review", "R", 5, List.of(),
                null, List.of(), List.of())));
        assertThrows(WebApplicationException.class, () -> VersionDocument.checkStructure(SETTINGS, null, List.of(planned)));
        Module unknownKind = new Module("m", "M", "O", List.of(), List.of(new Activity("x", "video", "L", 5, List.of(),
                null, List.of(), List.of())));
        assertThrows(WebApplicationException.class, () -> VersionDocument.checkStructure(SETTINGS, null, List.of(unknownKind)));
    }

    @Test
    void unModuleV4CompletEstPubliableEtPublieSesSonsDeLexique() {
        Module module = v4();
        assertDoesNotThrow(() -> VersionDocument.checkStructure(SETTINGS, null, List.of(module)));
        var checks = VersionDocument.check(SETTINGS, null, List.of(module));
        assertTrue(checks.publishable(), () -> checks.issues().toString());
        VersionDocument document = new VersionDocument(null, "a1", "A1", "A1", 4, "draft", null, null, SETTINGS, null,
                List.of(module), List.of());
        assertEquals(List.of(new MediaRef("a1-sante-dictee-q5", 1), new MediaRef("a1-sante-lexique", 2)), document.mediaRefs(),
                "Le son du lexique est publié avec le parcours.");
    }

    @Test
    void lAncienFormatDImportResteLisibleEtPubliable() throws Exception {
        String old = """
                {"settings": {"expectedCompetences": ["lecture"], "successCriteria": "Réussir.", "passPercent": 60,
                              "reviewMinutes": 10, "midtermMinutes": 30, "finalMinutes": 60},
                 "diagnostic": null,
                 "modules": [{"id": "au-cafe", "title": "Au café", "objective": "Commander.", "prerequisites": [],
                   "activities": [{"id": "quiz", "kind": "exercise", "title": "Quiz", "estimatedMinutes": 5,
                     "competences": ["lecture"], "lesson": {"title": "Quiz", "description": "", "transcript": null},
                     "questions": [{"id": "q1", "prompt": "Quoi ?", "moduleRef": null,
                       "options": [{"id": "a", "label": "Un café", "correct": true}, {"id": "b", "label": "Un thé", "correct": false}]}],
                     "placements": []}]}],
                 "assessments": []}
                """;
        AuthoringResource.DraftContent content = STRICT.readValue(old, AuthoringResource.DraftContent.class);
        Question question = content.modules().get(0).activities().get(0).questions().get(0);
        assertNull(question.type(), "type absent dans l’ancien format");
        assertEquals("choice", QuestionSpecs.typeOf(question));
        assertNull(content.modules().get(0).activities().get(0).mission());
        assertNull(content.modules().get(0).vocabulary());
        assertDoesNotThrow(() -> VersionDocument.checkStructure(content.settings(), content.diagnostic(), content.modules(),
                content.assessments()));
        assertTrue(VersionDocument.check(content.settings(), content.diagnostic(), content.modules(), content.assessments())
                .publishable());
    }

    @Test
    void leNouveauFormatSeLitStrictementEtGardeSaForme() throws Exception {
        String v4 = """
                {"id": "a1-sante", "title": "Santé", "objective": "Dire où on a mal.", "prerequisites": [],
                 "vocabulary": [{"id": "kopf", "word": "Kopf", "article": "der", "plural": "Köpfe", "partOfSpeech": "noun",
                   "translation": "la tête", "example": "Mein Kopf tut weh.", "note": null,
                   "audio": {"assetId": "a1-sante-lexique", "assetVersion": 1, "start": 0.0, "end": 1.2}}],
                 "activities": [
                   {"id": "a1-sante-pratique", "kind": "exercise", "title": "S’entraîner", "estimatedMinutes": 10,
                    "competences": ["lecture"], "lesson": null, "placements": [], "mission": null,
                    "questions": [
                      {"id": "q1", "type": "fill", "prompt": "Complétez.", "moduleRef": null, "explanation": "Weil + verbe final.",
                       "options": [], "spec": {"text": "Ich bleibe, [[1]] ich krank bin.",
                         "blanks": [{"id": "1", "accept": ["weil"], "size": 6, "hint": null}]}},
                      {"id": "q2", "type": "choice", "prompt": "Quel mot ?", "moduleRef": null, "explanation": null,
                       "options": [{"id": "a", "label": "weil", "correct": true, "feedback": "Bien vu."},
                                   {"id": "b", "label": "denn", "correct": false, "feedback": null}], "spec": null}]},
                   {"id": "a1-sante-mission", "kind": "mission", "title": "Mission", "estimatedMinutes": 20,
                    "competences": ["expression-ecrite"], "lesson": {"title": "Mission", "description": "Situation.", "transcript": null},
                    "questions": [], "placements": [],
                    "mission": {"oral": null, "written": {"prompt": "Écrivez.", "maxChars": 1500, "minWords": 25},
                                "checklist": ["Je salue.", "Je propose une date."]}}]}
                """;
        Module module = STRICT.readValue(v4, Module.class);
        assertEquals("fill", module.activities().get(0).questions().get(0).type());
        assertEquals(List.of("weil"), module.activities().get(0).questions().get(0).spec().blanks().get(0).accept());
        assertEquals("Bien vu.", module.activities().get(0).questions().get(1).options().get(0).feedback());
        assertEquals(25, module.activities().get(1).mission().written().minWords());
        assertEquals(1.2, module.vocabulary().get(0).audio().end());
        assertTrue(VersionDocument.check(SETTINGS, null, List.of(module)).publishable());

        JsonNode written = STRICT.valueToTree(module);
        JsonNode question = written.path("activities").get(0).path("questions").get(0);
        assertEquals(List.of("id", "type", "prompt", "moduleRef", "explanation", "options", "spec"),
                iterable(question.fieldNames()), "forme du plan : {id, type, prompt, moduleRef, explanation, options, spec}");
        assertFalse(question.path("spec").has("answers"), "une clé typée ne garde que les champs de son type");
        JsonNode options = written.path("activities").get(0).path("questions").get(1).path("options");
        assertEquals("Bien vu.", options.get(0).path("feedback").asText());
        assertFalse(options.get(1).has("feedback"), "un retour absent n’est pas écrit (forme des tests de niveau inchangée)");

        String unknown = v4.replace("\"size\": 6", "\"size\": 6, \"voice\": \"mann\"");
        assertThrows(Exception.class, () -> STRICT.readValue(unknown, Module.class), "champ inconnu refusé");
    }

    @Test
    void laStructureRefuseUneCleTypeeIncoherente() {
        Question choiceWithSpec = new Question("q1", "choice", "Q ?", null, null,
                List.of(new Option("a", "A", true), new Option("b", "B", false)), order(List.of(List.of("a", "b"))));
        Question fillWithOptions = new Question("q1", "fill", "Q ?", null, null, List.of(new Option("a", "A", true)),
                fill("x [[1]]", new Blank("1", List.of("y"), null, null)));
        Question foreignField = typed("q1", "order", new Spec(null, null, List.of(List.of("a", "b")),
                List.of(new Pair("a", "b")), null, null, null));
        Question unknownType = typed("q1", "essay", null);
        Question longExplanation = new Question("q1", "choice", "Q ?", null, "x".repeat(1501),
                List.of(new Option("a", "A", true)), null);
        Question longFeedback = new Question("q1", "choice", "Q ?", null, null,
                List.of(new Option("a", "A", true, "x".repeat(501))), null);
        Question tooManyTokens = typed("q1", "order", order(List.of(java.util.Collections.nCopies(17, "Wort"))));
        Question tooManyPairs = typed("q1", "match", new Spec(null, null, null,
                java.util.stream.IntStream.range(0, 9).mapToObj(index -> new Pair("l" + index, "r" + index)).toList(),
                null, null, null));
        Question longBlank = typed("q1", "fill", fill("[[1]]", new Blank("1", List.of("x".repeat(81)), null, null)));
        Question lowThreshold = typed("q1", "speak", speak("Hallo.", 40, "Hallo."));
        for (Question question : List.of(choiceWithSpec, fillWithOptions, foreignField, unknownType, longExplanation,
                longFeedback, tooManyTokens, tooManyPairs, longBlank, lowThreshold)) {
            Module module = new Module("m", "M", "O", List.of(), List.of(new Activity("x", "exercise", "E", 5, List.of(),
                    null, List.of(question), List.of())));
            var error = assertThrows(WebApplicationException.class,
                    () -> VersionDocument.checkStructure(SETTINGS, null, List.of(module)), question.toString());
            assertEquals(400, error.getResponse().getStatus());
        }
        Module emptySpec = new Module("m", "M", "O", List.of(), List.of(new Activity("x", "exercise", "E", 5, List.of(),
                null, List.of(new Question("q1", "choice", "Q ?", null, null, List.of(new Option("a", "A", true)),
                new Spec(null, null, null, null, null, null, null))), List.of())));
        assertDoesNotThrow(() -> VersionDocument.checkStructure(SETTINGS, null, List.of(emptySpec)),
                "un éditeur peut envoyer une clé vide pour un choix");
    }

    @Test
    void uneCleTypeeIncompleteEstSignaleeALaPublication() {
        Activity exercise = new Activity("pratique", "exercise", "Pratique", 10, List.of(), null, List.of(
                typed("q1", "fill", fill("Ich bleibe, [[1]] ich [[2]] bin.", new Blank("1", List.of(" "), null, null))),
                typed("q2", "order", order(List.of(List.of("a", "b", "c"), List.of("a", "b", "d")))),
                typed("q3", "match", match(new Pair("warten", "auf"))),
                typed("q4", "dictation", dictation("Der Zug fährt ab.")),
                typed("q5", "speak", new Spec("", null, null, null, List.of(), null, null)),
                typed("q6", "order", order(List.of(List.of("ja", "ja")))),
                typed("q7", "match", match(new Pair("a", "x"), new Pair("b", "X")))),
                List.of());
        Module module = new Module("m", "M", "Objectif.", List.of(), List.of(exercise));
        var checks = VersionDocument.check(SETTINGS, null, List.of(module));
        List<String> paths = checks.issues().stream().map(VersionDocument.Issue::path).toList();
        String at = "modules[0].activities[0].questions";
        for (String expected : List.of(at + "[0].spec.blanks", at + "[0].spec.text", at + "[1].spec.answers",
                at + "[2].spec.pairs", at + "[3]", at + "[4].spec.text", at + "[4].spec.accept", at + "[5].spec.answers",
                at + "[6].spec.pairs")) {
            assertTrue(paths.contains(expected), "Manque signalé : " + expected + " dans " + checks.issues());
        }
        assertTrue(checks.issues().stream().anyMatch(issue -> issue.message().contains("dictée")),
                "une dictée sans son est signalée");
    }

    @Test
    void laTranscriptionDUneDicteeResteMasqueeJusquALaReponse() {
        Placement visible = new Placement("dictee", 1, "audio", null, null, "on_demand", false, "q1", null);
        Activity exercise = new Activity("pratique", "exercise", "Pratique", 10, List.of(), null,
                List.of(typed("q1", "dictation", dictation("Guten Morgen."))), List.of(visible));
        var checks = VersionDocument.check(SETTINGS, null, List.of(new Module("m", "M", "Objectif.", List.of(), List.of(exercise))));
        assertTrue(checks.issues().stream().anyMatch(issue -> issue.message().contains("masquée")), checks.issues()::toString);
    }

    @Test
    void leDiagnosticEtLesEvaluationsRestentEnQuestionsAChoix() {
        Diagnostic diagnostic = new Diagnostic("Diagnostic", "Situer.", List.of(
                new Question("d1", "fill", "Complétez.", "au-cafe", null, List.of(),
                        fill("[[1]]", new Blank("1", List.of("weil"), null, null)))));
        VersionDocument.Part part = new VersionDocument.Part("lecture", "lecture", "closed", "Lecture", "", List.of(
                typed("p1", "order", order(List.of(List.of("a", "b"))))), List.of(), List.of());
        VersionDocument.Assessment midterm = new VersionDocument.Assessment("midterm", "Bilan", "", List.of(part));
        assertDoesNotThrow(() -> VersionDocument.checkStructure(SETTINGS, diagnostic, List.of(complete()), List.of(midterm)));
        var checks = VersionDocument.check(SETTINGS, diagnostic, List.of(complete()), List.of(midterm));
        List<String> paths = checks.issues().stream().map(VersionDocument.Issue::path).toList();
        assertTrue(paths.contains("diagnostic.questions[0].type"), paths::toString);
        assertTrue(paths.contains("assessments[0].parts[0].questions[0].type"), paths::toString);
    }

    @Test
    void uneMissionExigeSaConsigneSesPartiesEtSaListe() {
        Activity bare = new Activity("mission", "mission", "Mission", 20, List.of("expression-orale"), null, List.of(), List.of(),
                new Mission(null, null, List.of()));
        Activity half = new Activity("mission-2", "mission", "Mission 2", 20, List.of("expression-orale"),
                new Lesson("Mission", "Situation.", null), List.of(), List.of(),
                new Mission(new Oral(" ", null), null, List.of("Un seul point.")));
        var checks = VersionDocument.check(SETTINGS, null, List.of(new Module("m", "M", "Objectif.", List.of(), List.of(bare, half))));
        List<String> paths = checks.issues().stream().map(VersionDocument.Issue::path).toList();
        for (String expected : List.of("modules[0].activities[0].lesson", "modules[0].activities[0].mission",
                "modules[0].activities[1].mission.oral.prompt", "modules[0].activities[1].mission.checklist")) {
            assertTrue(paths.contains(expected), "Manque signalé : " + expected + " dans " + paths);
        }
        Mission defaults = new Mission(new Oral(" Parlez. ", null), new Written("Écrivez.", null, null), List.of(" a ", "b"))
                .normalized();
        assertEquals(new Mission(new Oral("Parlez.", 120), new Written("Écrivez.", 1500, 0), List.of("a", "b")), defaults);
    }

    @Test
    void laStructureDUneMissionEstBornee() {
        Mission valid = new Mission(new Oral("Parlez.", 120), new Written("Écrivez.", 1500, 25), List.of("a", "b"));
        for (Activity activity : List.of(
                new Activity("x", "lesson", "L", 5, List.of(), null, List.of(), List.of(), valid),
                new Activity("x", "mission", "M", 5, List.of(), null, List.of(question("q1", true, false)), List.of(), valid),
                new Activity("x", "mission", "M", 5, List.of(), null, List.of(), List.of(),
                        new Mission(new Oral("Parlez.", 10), null, List.of("a", "b"))),
                new Activity("x", "mission", "M", 5, List.of(), null, List.of(), List.of(),
                        new Mission(new Oral("Parlez.", 301), null, List.of("a", "b"))),
                new Activity("x", "mission", "M", 5, List.of(), null, List.of(), List.of(),
                        new Mission(null, new Written("Écrivez.", 3001, 25), List.of("a", "b"))),
                new Activity("x", "mission", "M", 5, List.of(), null, List.of(), List.of(),
                        new Mission(null, new Written("Écrivez.", 1500, 401), List.of("a", "b"))),
                new Activity("x", "mission", "M", 5, List.of(), null, List.of(), List.of(),
                        new Mission(null, new Written("Écrivez.", 1500, 25), java.util.Collections.nCopies(7, "point"))),
                new Activity("x", "mission", "M", 5, List.of(), null, List.of(), List.of(),
                        new Mission(null, new Written("Écrivez.", 1500, 25), List.of("x".repeat(161), "b"))))) {
            Module module = new Module("m", "M", "O", List.of(), List.of(activity));
            assertEquals(400, assertThrows(WebApplicationException.class,
                    () -> VersionDocument.checkStructure(SETTINGS, null, List.of(module))).getResponse().getStatus());
        }
        Module ok = new Module("m", "M", "O", List.of(), List.of(new Activity("x", "mission", "M", 5, List.of(), null,
                List.of(), List.of(), valid)));
        assertDoesNotThrow(() -> VersionDocument.checkStructure(SETTINGS, null, List.of(ok)));
        // Bornes élargies pour les niveaux B : 300 s, 3 000 caractères et 400 mots acceptés.
        Mission longest = new Mission(new Oral("Sprechen Sie.", 300), new Written("Schreiben Sie.", 3000, 400), List.of("a", "b"));
        Module wide = new Module("m", "M", "O", List.of(), List.of(new Activity("x", "mission", "M", 5, List.of(), null,
                List.of(), List.of(), longest)));
        assertDoesNotThrow(() -> VersionDocument.checkStructure(SETTINGS, null, List.of(wide)));
    }

    private static final List<Criterion> GRID_B1 = List.of(
            new Criterion("aufgabe", "Tâche : tous les points sont traités", 5),
            new Criterion("kohaerenz", "Cohérence : texte organisé, connecteurs variés", 5),
            new Criterion("wortschatz", "Vocabulaire : précis et assez varié", 5),
            new Criterion("strukturen", "Structures : verbe à la bonne place", 5));

    private static Module missionModule(Mission mission) {
        return new Module("m", "Module", "Objectif.", List.of(), List.of(new Activity("b1-wohnen-schreiben", "mission",
                "Mission : écrire à la régie", 25, List.of("expression-ecrite"),
                new Lesson("Mission", "Schreiben Sie an die Hausverwaltung. [fr] Écrivez à la régie.", null), List.of(),
                List.of(), mission)));
    }

    @Test
    void laGrilleDUneMissionEstFacultativeEtBornée() {
        Written written = new Written("Schreiben Sie eine E-Mail. [fr] Écrivez un courriel.", 1500, 100);
        List<String> checklist = List.of("Ich nenne das Problem.", "Ich schlage eine Lösung vor.");
        Mission graded = new Mission(null, written, checklist, GRID_B1);
        assertDoesNotThrow(() -> VersionDocument.checkStructure(SETTINGS, null, List.of(missionModule(graded))));
        assertTrue(VersionDocument.check(SETTINGS, null, List.of(missionModule(graded))).publishable());
        assertEquals(List.of(), new Mission(null, written, checklist, null).criteria(), "sans grille : []");
        assertTrue(VersionDocument.check(SETTINGS, null, List.of(missionModule(new Mission(null, written, checklist))))
                .publishable(), "une mission A1/A2 sans grille reste publiable");

        Criterion fifth = new Criterion("aussprache", "Prononciation", 4);
        Criterion sixth = new Criterion("interaktion", "Interaction", 4);
        Criterion seventh = new Criterion("extra", "Critère de trop", 1);
        List<List<Criterion>> refused = List.of(
                List.of(GRID_B1.get(0), GRID_B1.get(1), GRID_B1.get(2), GRID_B1.get(3), fifth, sixth, seventh),
                List.of(GRID_B1.get(0), new Criterion("aufgabe", "Doublon", 5)),
                List.of(new Criterion("aufgabe", "Tâche", 0)),
                List.of(new Criterion("aufgabe", "Tâche", 21)),
                List.of(new Criterion("Aufgabe", "Tâche", 5)),
                List.of(new Criterion("a".repeat(41), "Tâche", 5)),
                List.of(new Criterion("aufgabe", "x".repeat(201), 5)),
                java.util.Arrays.asList(GRID_B1.get(0), null));
        for (List<Criterion> criteria : refused) {
            Module module = missionModule(new Mission(null, written, checklist, criteria));
            assertEquals(400, assertThrows(WebApplicationException.class,
                    () -> VersionDocument.checkStructure(SETTINGS, null, List.of(module))).getResponse().getStatus(),
                    () -> "grille refusée : " + criteria);
        }
        List<Criterion> six = List.of(GRID_B1.get(0), GRID_B1.get(1), GRID_B1.get(2), GRID_B1.get(3), fifth, sixth);
        assertDoesNotThrow(() -> VersionDocument.checkStructure(SETTINGS, null,
                List.of(missionModule(new Mission(null, written, checklist, six)))), "six critères au plus");

        Mission blank = new Mission(null, written, checklist, List.of(GRID_B1.get(0), new Criterion("kohaerenz", " Ko ", 5)));
        assertDoesNotThrow(() -> VersionDocument.checkStructure(SETTINGS, null, List.of(missionModule(blank))),
                "un brouillon peut garder un critère à rédiger");
        List<String> paths = VersionDocument.check(SETTINGS, null, List.of(missionModule(blank))).issues().stream()
                .map(VersionDocument.Issue::path).toList();
        assertEquals(List.of("modules[0].activities[0].mission.criteria[1].label"), paths);

        Mission padded = new Mission(null, written, checklist, List.of(new Criterion("aufgabe", "  Tâche : tout est traité  ", 5)))
                .normalized();
        assertEquals(List.of(new Criterion("aufgabe", "Tâche : tout est traité", 5)), padded.criteria());
    }

    @Test
    void laGrilleSeLitStrictementEtSonAbsenceVautUneGrilleVide() throws Exception {
        String a2 = """
                {"oral": null, "written": {"prompt": "Écrivez.", "maxChars": 1500, "minWords": 25},
                 "checklist": ["Je salue.", "Je propose une date."]}
                """;
        Mission old = STRICT.readValue(a2, Mission.class);
        assertEquals(List.of(), old.criteria(), "mission A1/A2 stockée sans grille");
        JsonNode served = STRICT.valueToTree(old);
        assertTrue(served.path("criteria").isArray() && served.path("criteria").isEmpty(), "servie avec criteria = []");

        String b1 = a2.replace("\"checklist\"",
                "\"criteria\": [{\"id\": \"aufgabe\", \"label\": \"Aufgabe [fr] Tâche\", \"maxPoints\": 5}], \"checklist\"");
        Mission graded = STRICT.readValue(b1, Mission.class);
        assertEquals(List.of(new Criterion("aufgabe", "Aufgabe [fr] Tâche", 5)), graded.criteria());
        String unknown = b1.replace("\"maxPoints\": 5", "\"maxPoints\": 5, \"weight\": 2");
        assertThrows(Exception.class, () -> STRICT.readValue(unknown, Mission.class), "champ inconnu refusé");
    }

    @Test
    void leVocabulaireEstControle() {
        VocabularyEntry badArticle = new VocabularyEntry("kopf", "Kopf", "le", null, "noun", "la tête", null, null, null);
        VocabularyEntry badSegment = new VocabularyEntry("kopf", "Kopf", "der", null, "noun", "la tête", null, null,
                new VocabularyAudio("a1-lexique", 1, 2.0, 1.0));
        VocabularyEntry badNature = new VocabularyEntry("kopf", "Kopf", "der", null, "nom", "la tête", null, null, null);
        for (VocabularyEntry entry : List.of(badArticle, badSegment, badNature)) {
            Module module = new Module("m", "M", "O", List.of(), List.of(), List.of(entry));
            assertThrows(WebApplicationException.class, () -> VersionDocument.checkStructure(SETTINGS, null, List.of(module)));
        }
        VocabularyEntry duplicate = new VocabularyEntry("kopf", "Kopf", "der", null, "noun", "la tête", null, null, null);
        Module twice = new Module("m", "M", "O", List.of(), List.of(), List.of(duplicate, duplicate));
        assertThrows(WebApplicationException.class, () -> VersionDocument.checkStructure(SETTINGS, null, List.of(twice)));

        VocabularyEntry noArticle = new VocabularyEntry("kopf", "Kopf", null, null, "noun", "la tête", null, null, null);
        VocabularyEntry untranslated = new VocabularyEntry("gehen", "gehen", null, null, "verb", " ", null, null, null);
        Module module = new Module("m", "M", "Objectif.", List.of(), complete().activities(), List.of(noArticle, untranslated));
        List<String> paths = VersionDocument.check(SETTINGS, null, List.of(module)).issues().stream()
                .map(VersionDocument.Issue::path).toList();
        assertEquals(List.of("modules[0].vocabulary[0].article", "modules[0].vocabulary[1]"), paths);
    }

    private static List<String> iterable(java.util.Iterator<String> names) {
        List<String> list = new java.util.ArrayList<>();
        names.forEachRemaining(list::add);
        return list;
    }
}
