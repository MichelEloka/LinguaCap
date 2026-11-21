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
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import jakarta.ws.rs.WebApplicationException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.linguacap.catalogue.PlacementDocument.Content;
import org.linguacap.catalogue.PlacementDocument.Placement;
import org.linguacap.catalogue.PlacementDocument.Question;
import org.linguacap.catalogue.PlacementDocument.Tier;
import org.linguacap.catalogue.VersionDocument.Issue;
import org.linguacap.catalogue.VersionDocument.MediaRef;
import org.linguacap.catalogue.VersionDocument.Option;

class PlacementDocumentTest {
    private static final Placement SOUND = new Placement("placement-a1-h01", 1, "audio", null, null, "hidden", false);

    private static List<Option> options(int correct) {
        List<Option> options = new ArrayList<>();
        for (int index = 0; index < 3; index++) options.add(new Option(String.valueOf((char) ('a' + index)), "Choix " + index, index == correct));
        return options;
    }

    private static Question reading(String id) {
        return new Question(id, "lecture", "a1-hallo", "Complétez : Woher ___ du ?", options(1), List.of());
    }

    private static Question listening(String id, Placement... placements) {
        return new Question(id, "ecoute", null, "Écoutez le message. Pourquoi Markus appelle-t-il ?", options(0), List.of(placements));
    }

    private static Tier tier(String code, int drawCount, Question... questions) {
        return new Tier(code, code + " · palier", 67, 34, drawCount, List.of(questions));
    }

    private static Tier completeA1() {
        return tier("A1", 3, reading("a1-l01"), reading("a1-l02"), listening("a1-h01", SOUND));
    }

    @Test
    void uneBanqueCompleteEstPubliable() {
        var checks = PlacementDocument.check("Test de niveau d’allemand", List.of(completeA1(),
                tier("A2", 2, reading("a2-l01"), listening("a2-h01", new Placement("placement-a2-h01", 2, "audio", null, null, "hidden", false)))));
        assertTrue(checks.publishable(), () -> checks.issues().toString());
    }

    @Test
    void chaqueManqueEstSignaleAvecSonEmplacement() {
        Question unanswered = new Question("a2-l01", "lecture", null, " ", List.of(new Option("a", "Oui", true),
                new Option("b", "Non", true)), List.of());
        Question silent = listening("a2-h01");
        Placement unnamed = new Placement("bild", 1, "illustration", " ", null, "hidden", false);
        Question pictured = new Question("a2-l02", "lecture", null, "Que montre l’image ?", options(2), List.of(unnamed));
        Tier a2 = new Tier("A2", "", 60, 70, 5, List.of(unanswered, silent, pictured));
        var checks = PlacementDocument.check(" ", List.of(a2, tier("C1", 1, reading("c1-l01"))));
        assertFalse(checks.publishable());
        List<String> paths = checks.issues().stream().map(Issue::path).toList();
        for (String expected : List.of("title", "tiers[0].code", "tiers[0].title", "tiers[0].drawCount",
                "tiers[0].minCompetencePercent", "tiers[0].questions[0].prompt", "tiers[0].questions[0].options",
                "tiers[0].questions[1].placements", "tiers[0].questions[2].placements[0].alt", "tiers[1].code")) {
            assertTrue(paths.contains(expected), "Manque signalé : " + expected + " dans " + paths);
        }
    }

    @Test
    void uneBanqueSansPalierNEstPasPubliable() {
        var checks = PlacementDocument.check("Test", List.of());
        assertEquals(List.of("tiers"), checks.issues().stream().map(Issue::path).toList());
    }

    @Test
    void uneQuestionDEcouteAExactementUnSon() {
        Tier twoSounds = tier("A1", 1, listening("a1-h01", SOUND, new Placement("autre", 1, "audio", null, null, "hidden", false)));
        assertEquals(List.of("tiers[0].questions[0].placements"),
                PlacementDocument.check("Test", List.of(twoSounds)).issues().stream().map(Issue::path).toList());
    }

    @Test
    void laStructureRefuseLesValeursInconnuesEtLesDoublons() {
        assertDoesNotThrow(() -> PlacementDocument.checkStructure(new Content("Test", "", List.of(completeA1()))));
        assertEquals(400, assertThrows(WebApplicationException.class, () -> PlacementDocument.checkStructure(null))
                .getResponse().getStatus());
        List<Content> invalid = List.of(
                new Content("Test", "", List.of(tier("A0", 1, reading("q1")))),
                new Content("Test", "", List.of(completeA1(), completeA1())),
                new Content("Test", "", List.of(tier("A1", 1, reading("q1")), tier("A2", 1, reading("q1")))),
                new Content("Test", "", List.of(tier("A1", 1, new Question("q1", "expression-orale", null, "Parlez.", options(0), List.of())))),
                new Content("Test", "", List.of(tier("A1", 1, new Question("Q 1", "lecture", null, "Texte", options(0), List.of())))),
                new Content("Test", "", List.of(tier("A1", 1, new Question("q1", "lecture", null, "x".repeat(1501), options(0), List.of())))),
                new Content("Test", "", List.of(tier("A1", 1, new Question("q1", "lecture", null, "Texte",
                        List.of(new Option("a", "Oui", true), new Option("dontknow", "Je ne sais pas", false)), List.of())))),
                new Content("Test", "", List.of(tier("A1", 1, listening("q1", new Placement("Son", 1, "audio", null, null, "hidden", false))))),
                new Content("Test", "", List.of(tier("A1", 1, listening("q1", new Placement("son", 1, "video", null, null, "hidden", false))))),
                new Content("Test", "", List.of(new Tier("A1", "A1", 0, 34, 12, List.of()))),
                new Content("x".repeat(121), "", List.of()));
        for (Content content : invalid) {
            assertThrows(WebApplicationException.class, () -> PlacementDocument.checkStructure(content), content::toString);
        }
    }

    @Test
    void lEnregistrementNettoieLesTextes() {
        Placement image = new Placement("bild", 1, "illustration", "  ", " ", "hidden", false);
        Question question = new Question("q1", "lecture", " ", "  Lisez le texte.\n\nHallo!  ",
                List.of(new Option("a", " Ja ", true), new Option("b", "Nein", false)), List.of(image));
        Content content = PlacementDocument.normalized(new Content(" Test ", null, List.of(new Tier("A1", " A1 ", 67, 34, 1, List.of(question)))));
        assertEquals("Test", content.title());
        assertEquals("", content.description());
        Question saved = content.tiers().get(0).questions().get(0);
        assertEquals("Lisez le texte.\n\nHallo!", saved.prompt());
        assertNull(saved.moduleRef());
        assertEquals("Ja", saved.options().get(0).label());
        assertNull(saved.placements().get(0).alt());
        assertNull(saved.placements().get(0).caption());
    }

    @Test
    void lesMediasAPublierSontDedoublonnesEtLesQuestionsComptees() {
        Tier a1 = tier("A1", 2, listening("a1-h01", SOUND), listening("a1-h02", SOUND),
                listening("a1-h03", new Placement("placement-a1-h03", 3, "audio", null, null, "hidden", false)));
        PlacementDocument document = new PlacementDocument(UUID.randomUUID(), "de", 1, "draft", "Test", "", List.of(a1, completeA1()),
                "2026-11-28T10:00Z", null);
        assertEquals(List.of(new MediaRef("placement-a1-h01", 1), new MediaRef("placement-a1-h03", 3)), document.mediaRefs());
        assertEquals(6, document.summary().questionCount());
    }

    @Test
    void leDocumentSeSerialiseAvecSesChampsNulsEtSeRenvoieTelQuel() throws Exception {
        ObjectMapper json = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);
        PlacementDocument document = new PlacementDocument(UUID.randomUUID(), "de", 1, "draft", "Test", "", List.of(completeA1()),
                "2026-11-28T10:00Z", null);
        JsonNode tree = json.valueToTree(document);
        for (String field : List.of("id", "languageId", "number", "status", "title", "description", "tiers", "updatedAt", "publishedAt")) {
            assertTrue(tree.has(field), "Champ attendu : " + field);
        }
        assertTrue(tree.path("publishedAt").isNull());
        JsonNode question = tree.path("tiers").get(0).path("questions").get(0);
        assertTrue(question.has("moduleRef") && question.path("options").get(1).path("correct").asBoolean());
        Content content = json.treeToValue(tree, Content.class);
        assertEquals(document.tiers(), content.tiers());
        ((com.fasterxml.jackson.databind.node.ObjectNode) tree).put("inconnu", true);
        assertThrows(UnrecognizedPropertyException.class, () -> json.treeToValue(tree, Content.class));
    }
}
