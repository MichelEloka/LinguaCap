package org.linguacap.assessment;

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
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class PlacementRulesTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final UUID LEARNER = UUID.fromString("3f1c2a9e-6f1d-4b8e-9a51-2a0c1e7d4b10");
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-21T10:00:00Z");

    /** Banque publiée : par palier, 12 questions de lecture et 6 d'écoute (son), bonne réponse « b ». */
    private static JsonNode test(String... codes) {
        ObjectNode test = JSON.createObjectNode().put("id", UUID.randomUUID().toString()).put("languageId", "de")
                .put("number", 1).put("status", "published").put("title", "Test de niveau").put("description", "");
        ArrayNode tiers = test.putArray("tiers");
        for (String code : codes) {
            ObjectNode tier = tiers.addObject().put("code", code).put("title", "Palier " + code).put("passPercent", 67)
                    .put("minCompetencePercent", 34).put("drawCount", 12);
            ArrayNode questions = tier.putArray("questions");
            for (int i = 1; i <= 18; i++) {
                boolean listening = i > 12;
                ObjectNode question = questions.addObject().put("id", code.toLowerCase() + "-q" + i)
                        .put("competence", listening ? "ecoute" : "lecture").put("moduleRef", (String) null)
                        .put("prompt", "Question " + i);
                ArrayNode options = question.putArray("options");
                options.addObject().put("id", "a").put("label", "Erste").put("correct", false);
                options.addObject().put("id", "b").put("label", "Zweite").put("correct", true);
                options.addObject().put("id", "c").put("label", "Dritte").put("correct", false);
                ArrayNode placements = question.putArray("placements");
                if (listening) {
                    placements.addObject().put("assetId", "placement-" + code.toLowerCase() + "-" + i).put("assetVersion", 1)
                            .put("usage", "audio").put("alt", "Dialogue court").put("caption", (String) null)
                            .put("transcriptVisibility", "hidden").put("decorative", false);
                }
            }
        }
        return test;
    }

    private static PlacementStore.Attempt attempt(JsonNode definition) {
        return new PlacementStore.Attempt(UUID.randomUUID(), LEARNER, "de", UUID.randomUUID(), 1, "in_progress",
                definition, PlacementRules.firstTier(definition), JSON.createObjectNode(), JSON.createObjectNode(),
                JSON.createObjectNode(), JSON.createObjectNode(), false, null, NOW, null);
    }

    private static PlacementStore.Attempt apply(PlacementStore.Attempt attempt, PlacementRules.Transition next) {
        return new PlacementStore.Attempt(attempt.id(), attempt.learnerId(), attempt.languageId(), attempt.testId(),
                attempt.testNumber(), next.status(), attempt.definition(), next.currentTier(), next.savedAnswers(),
                next.answers(), next.tierResults(), next.submitKeys(), false, next.placedLevel(), attempt.startedAt(),
                next.completed() ? NOW : null);
    }

    /** Réponses d'un palier : les premières questions de chaque compétence justes, les autres fausses ou « Je ne sais pas ». */
    private static ObjectNode answers(JsonNode tier, int readingRight, int listeningRight) {
        ObjectNode answers = JSON.createObjectNode();
        int reading = 0;
        int listening = 0;
        for (JsonNode question : tier.path("questions")) {
            boolean right = "ecoute".equals(question.path("competence").asText()) ? listening++ < listeningRight
                    : reading++ < readingRight;
            String chosen = PlacementRules.DONT_KNOW;
            for (JsonNode option : question.path("options")) {
                if (option.path("correct").asBoolean() == right) chosen = option.path("id").asText();
            }
            answers.put(question.path("id").asText(), right ? chosen : (reading % 2 == 0 ? PlacementRules.DONT_KNOW : chosen));
        }
        return answers;
    }

    private static int status(Runnable action) {
        return assertThrows(WebApplicationException.class, action::run).getResponse().getStatus();
    }

    private static boolean hasField(JsonNode node, String name) {
        if (node.isObject() && node.has(name)) return true;
        for (JsonNode child : node) {
            if (hasField(child, name)) return true;
        }
        return false;
    }

    private static boolean hasBooleanField(JsonNode node, String name) {
        if (node.isObject() && node.path(name).isBoolean()) return true;
        for (JsonNode child : node) {
            if (hasBooleanField(child, name)) return true;
        }
        return false;
    }

    @Test
    void leTirageEstStratifiéParPalierEtRangéDeA1ÀB1() {
        JsonNode definition = PlacementRules.draw(JSON, test("B1", "A1", "A2"), new Random(7));
        assertEquals(List.of("A1", "A2", "B1"), definition.path("tiers").findValuesAsText("code").subList(0, 3));
        for (JsonNode tier : definition.path("tiers")) {
            JsonNode questions = tier.path("questions");
            assertEquals(12, questions.size());
            Set<String> ids = new HashSet<>();
            int reading = 0;
            for (JsonNode question : questions) {
                assertTrue(ids.add(question.path("id").asText()), "Aucune question tirée deux fois");
                assertTrue(question.path("id").asText().startsWith(tier.path("code").asText().toLowerCase()));
                if ("lecture".equals(question.path("competence").asText())) reading++;
            }
            assertEquals(8, reading, "8 questions de lecture et 4 d'écoute par palier");
            assertTrue(hasBooleanField(questions, "correct"), "La définition figée garde son corrigé pour la correction");
        }
        assertEquals(definition, PlacementRules.draw(JSON, test("B1", "A1", "A2"), new Random(7)).put("testId",
                definition.path("testId").asText()), "Le tirage ne dépend que du hasard fourni");
    }

    @Test
    void lesQuotasSuiventLaBanqueEtGardentChaqueCompétence() {
        assertEquals(Map.of("lecture", 8, "ecoute", 4), PlacementRules.quotas(sizes(12, 6), 12));
        assertEquals(Map.of("lecture", 8), PlacementRules.quotas(Map.of("lecture", 8), 8));
        assertEquals(Map.of("lecture", 11, "ecoute", 1), PlacementRules.quotas(sizes(17, 1), 12));
        assertEquals(Map.of("lecture", 2, "ecoute", 1), PlacementRules.quotas(sizes(5, 1), 3));
        assertEquals(Map.of("lecture", 12, "ecoute", 6), PlacementRules.quotas(sizes(12, 6), 40), "Toute la banque au plus");
        assertEquals(Map.of("lecture", 12, "ecoute", 6), PlacementRules.quotas(sizes(12, 6), 0));
    }

    private static Map<String, Integer> sizes(int reading, int listening) {
        Map<String, Integer> sizes = new LinkedHashMap<>();
        sizes.put("lecture", reading);
        sizes.put("ecoute", listening);
        return sizes;
    }

    @Test
    void unPalierSeRéussitAuSeuilEtSansCompétenceSousLeMinimum() {
        JsonNode tier = PlacementRules.tier(PlacementRules.draw(JSON, test("A1"), new Random(1)), "A1");
        PlacementRules.TierResult reading = PlacementRules.score(tier, answers(tier, 8, 0));
        assertEquals(8, reading.correct());
        assertEquals(67, reading.percent());
        assertFalse(reading.passed(), "Écoute à 0 % : palier échoué malgré 67 %");
        assertEquals(0, reading.competences().get("ecoute").percent());

        PlacementRules.TierResult balanced = PlacementRules.score(tier, answers(tier, 6, 2));
        assertEquals(67, balanced.percent());
        assertTrue(balanced.passed(), "8/12 avec 50 % en écoute : palier réussi");

        assertFalse(PlacementRules.score(tier, answers(tier, 7, 1)).passed(), "Écoute à 25 %, sous le minimum de 34 %");
        assertFalse(PlacementRules.score(tier, answers(tier, 5, 2)).passed(), "7/12 = 58 %, sous le seuil");
        PlacementRules.TierResult none = PlacementRules.score(tier, JSON.createObjectNode());
        assertEquals(0, none.correct());
        assertEquals(12, none.total());
    }

    @Test
    void jeNeSaisPasEstAcceptéEtComptéFaux() {
        JsonNode tier = PlacementRules.tier(PlacementRules.draw(JSON, test("A1"), new Random(2)), "A1");
        ObjectNode all = JSON.createObjectNode();
        tier.path("questions").forEach(question -> all.put(question.path("id").asText(), PlacementRules.DONT_KNOW));
        PlacementRules.checkAnswers(tier, all, true);
        assertEquals(0, PlacementRules.score(tier, all).correct());

        String first = tier.path("questions").get(0).path("id").asText();
        PlacementRules.checkAnswers(tier, JSON.createObjectNode().put(first, "a"), false);
        assertEquals(400, status(() -> PlacementRules.checkAnswers(tier, JSON.createObjectNode().put(first, "a"), true)),
                "À la remise, chaque question a une réponse");
        assertEquals(400, status(() -> PlacementRules.checkAnswers(tier, JSON.createObjectNode().put(first, "z"), false)));
        assertEquals(400, status(() -> PlacementRules.checkAnswers(tier, JSON.createObjectNode().put("a2-q1", "a"), false)));
        assertEquals(400, status(() -> PlacementRules.checkAnswers(tier, JSON.createObjectNode().put(first, 1), false)));
        assertEquals(400, status(() -> PlacementRules.checkAnswers(tier, JSON.createArrayNode(), false)));
    }

    @Test
    void leTestProgresseParPalierEtSArrêteAuPremierÉchec() {
        PlacementStore.Attempt attempt = attempt(PlacementRules.draw(JSON, test("A1", "A2", "B1"), new Random(3)));
        JsonNode a1 = PlacementRules.tier(attempt.definition(), "A1");
        PlacementStore.Attempt afterA1 = apply(attempt, PlacementRules.submit(JSON, attempt, "remise-a1-0001", "A1",
                answers(a1, 8, 4)));
        assertEquals("in_progress", afterA1.status());
        assertEquals("A2", afterA1.currentTier());
        List<String> statuses = PlacementRules.tiers(afterA1).stream().map(PlacementResource.PlacementTier::status).toList();
        assertEquals(List.of("passed", "current", "locked"), statuses);

        JsonNode a2 = PlacementRules.tier(attempt.definition(), "A2");
        PlacementStore.Attempt done = apply(afterA1, PlacementRules.submit(JSON, afterA1, "remise-a2-0001", "A2",
                answers(a2, 2, 1)));
        assertEquals("completed", done.status());
        assertNull(done.currentTier());
        assertEquals("A1", done.placedLevel(), "Niveau placé : dernier palier réussi");
        PlacementResource.PlacementResult result = PlacementRules.result(done);
        assertEquals("A1 · Découverte", result.label());
        assertFalse(result.beyondTest());
        assertTrue(result.summary().contains("A2"));
        assertEquals(List.of("passed", "failed", "locked"),
                PlacementRules.tiers(done).stream().map(PlacementResource.PlacementTier::status).toList());
        assertEquals(409, status(() -> PlacementRules.submit(JSON, done, "remise-b1-0001", "B1", JSON.createObjectNode())),
                "Le test terminé ne prend plus de remise");
    }

    @Test
    void échouerLePremierPalierPlaceEnA0EtToutRéussirDépasseLeTest() {
        PlacementStore.Attempt attempt = attempt(PlacementRules.draw(JSON, test("A1", "A2"), new Random(4)));
        JsonNode a1 = PlacementRules.tier(attempt.definition(), "A1");
        PlacementStore.Attempt failed = apply(attempt, PlacementRules.submit(JSON, attempt, "remise-a1-0001", "A1",
                answers(a1, 3, 1)));
        assertEquals("A0", failed.placedLevel());
        assertEquals("Débutant", PlacementRules.result(failed).label());

        PlacementStore.Attempt step = apply(attempt, PlacementRules.submit(JSON, attempt, "remise-a1-0002", "A1",
                answers(a1, 8, 4)));
        JsonNode a2 = PlacementRules.tier(attempt.definition(), "A2");
        PlacementStore.Attempt top = apply(step, PlacementRules.submit(JSON, step, "remise-a2-0002", "A2", answers(a2, 8, 4)));
        assertEquals("A2", top.placedLevel());
        assertTrue(PlacementRules.result(top).beyondTest(), "Dernier palier réussi : le niveau dépasse peut-être le test");
    }

    @Test
    void lesRemisesSontIdempotentesParClé() {
        PlacementStore.Attempt attempt = attempt(PlacementRules.draw(JSON, test("A1", "A2"), new Random(5)));
        JsonNode a1 = PlacementRules.tier(attempt.definition(), "A1");
        ObjectNode given = answers(a1, 8, 4);
        assertFalse(PlacementRules.replayed(attempt.submitKeys(), "remise-a1-0001", "A1", given));
        PlacementStore.Attempt after = apply(attempt, PlacementRules.submit(JSON, attempt, "remise-a1-0001", "A1", given));
        assertTrue(PlacementRules.replayed(after.submitKeys(), "remise-a1-0001", "A1", given.deepCopy()),
                "Même clé, mêmes réponses : l'état courant est renvoyé sans recompter");
        ObjectNode other = given.deepCopy().put(a1.path("questions").get(0).path("id").asText(), PlacementRules.DONT_KNOW);
        assertEquals(409, status(() -> PlacementRules.replayed(after.submitKeys(), "remise-a1-0001", "A1", other)));
        assertEquals(409, status(() -> PlacementRules.submit(JSON, after, "remise-a1-0002", "A1", given)),
                "Un palier déjà remis ne se remet pas avec une autre clé");
        assertEquals(409, status(() -> PlacementRules.openTier(attempt, "A2")), "Le palier suivant n'est pas encore ouvert");
        assertEquals(400, status(() -> PlacementRules.openTier(attempt, "C2")));
    }

    @Test
    void unNouvelEssaiAttendVingtQuatreHeures() {
        assertNull(PlacementRules.retakeRefusal(null, NOW));
        String refusal = PlacementRules.retakeRefusal(NOW.minusHours(23), NOW);
        assertNotNull(refusal);
        assertTrue(refusal.contains("21 novembre à 12 h 00"), "Heure de Paris : " + refusal);
        assertNull(PlacementRules.retakeRefusal(NOW.minusHours(24), NOW));

        PlacementStore.Attempt tested = new PlacementStore.Attempt(UUID.randomUUID(), LEARNER, "de", UUID.randomUUID(), 1,
                "completed", JSON.createObjectNode(), null, JSON.createObjectNode(), JSON.createObjectNode(),
                JSON.createObjectNode(), JSON.createObjectNode(), false, "A1", NOW.minusHours(1), NOW);
        assertEquals(NOW.plusHours(24), PlacementRules.retakeAvailableAt(tested, NOW));
        assertNull(PlacementRules.retakeAvailableAt(attempt(JSON.createObjectNode()), NOW));
    }

    @Test
    void leDébutantDéclaréEstPlacéEnA0SansQuestions() {
        PlacementStore.Attempt declared = new PlacementStore.Attempt(UUID.randomUUID(), LEARNER, "de", null, null,
                "completed", JSON.createObjectNode(), null, JSON.createObjectNode(), JSON.createObjectNode(),
                JSON.createObjectNode(), JSON.createObjectNode(), true, "A0", NOW, NOW);
        PlacementResource.PlacementResult result = PlacementRules.result(declared);
        assertEquals("A0", result.placedLevel());
        assertEquals("Débutant", result.label());
        assertTrue(result.declaredBeginner());
        assertFalse(result.beyondTest());
        PlacementResource.PlacementView view = PlacementRules.view(declared, true, Map.of(), NOW);
        assertEquals(List.of(), view.tiers());
        assertEquals(List.of(), view.questions());
        assertEquals(NOW.toString(), view.retakeAvailableAt(), "Aucune question vue : le test reste possible tout de suite");
        assertEquals(NOW, PlacementRules.retakeAvailableAt(declared, null));
    }

    @Test
    void aucuneVueNeRévèleLeCorrigé() {
        PlacementStore.Attempt attempt = attempt(PlacementRules.draw(JSON, test("A1", "A2"), new Random(6)));
        JsonNode a1 = PlacementRules.tier(attempt.definition(), "A1");
        Map<String, PlacementRules.MediaFile> media = new LinkedHashMap<>();
        for (Map<String, Object> ref : PlacementRules.mediaRefs(attempt)) {
            media.put(ref.get("assetId") + "@" + ref.get("version"), new PlacementRules.MediaFile("https://media/" + ref.get("assetId"), "audio/mpeg"));
        }
        assertEquals(4, media.size(), "Un son par question d'écoute du palier en cours");

        JsonNode own = JSON.valueToTree(PlacementRules.view(attempt, true, media, null));
        assertEquals(12, own.path("questions").size());
        assertFalse(hasField(own.path("questions"), "correct"), "Aucun choix ne porte son corrigé");
        assertFalse(hasBooleanField(own, "correct"));
        assertFalse(own.toString().contains("transcriptVisibility"));
        JsonNode listening = null;
        for (JsonNode question : own.path("questions")) {
            if ("ecoute".equals(question.path("competence").asText())) listening = question;
        }
        assertNotNull(listening);
        assertEquals("audio", listening.path("placements").get(0).path("usage").asText());
        assertEquals("audio/mpeg", listening.path("placements").get(0).path("mimeType").asText());
        assertEquals(1, listening.path("placements").get(0).path("position").asInt());
        assertTrue(listening.path("options").get(0).has("text"));

        ObjectNode saved = JSON.createObjectNode();
        saved.set("A1", JSON.createObjectNode().put(a1.path("questions").get(0).path("id").asText(), "a"));
        PlacementStore.Attempt withSaved = new PlacementStore.Attempt(attempt.id(), LEARNER, "de", attempt.testId(), 1,
                "in_progress", attempt.definition(), "A1", saved, JSON.createObjectNode(), JSON.createObjectNode(),
                JSON.createObjectNode(), false, null, NOW, null);
        assertEquals(1, PlacementRules.view(withSaved, true, Map.of(), null).savedAnswers().size());
        PlacementResource.PlacementView third = PlacementRules.view(withSaved, false, Map.of(), null);
        assertEquals(List.of(), third.questions(), "Un tiers ne voit pas les questions");
        assertEquals(Map.of(), third.savedAnswers());

        PlacementStore.Attempt done = apply(attempt, PlacementRules.submit(JSON, attempt, "remise-a1-0001", "A1",
                answers(a1, 1, 0)));
        JsonNode result = JSON.valueToTree(PlacementRules.view(done, true, Map.of(), NOW.plusHours(24)));
        assertEquals(0, result.path("questions").size());
        assertFalse(hasBooleanField(result, "correct"), "Le résultat ne donne que des totaux");
        assertTrue(result.path("tiers").get(0).path("correct").isInt());
        assertTrue(result.path("tiers").get(1).path("correct").isNull(), "null explicite pour un palier non passé");
        assertTrue(result.has("retakeAvailableAt"));
    }

    @Test
    void laLangueDuTestEstCelleDeLÉlève() {
        assertEquals("de", PlacementRules.language(null, "de"));
        assertEquals("de", PlacementRules.language("de", null));
        assertEquals("de", PlacementRules.language("de", "de"));
        assertEquals(409, status(() -> PlacementRules.language("en", "de")));
        assertEquals(409, status(() -> PlacementRules.language(null, "")));
        assertEquals(400, status(() -> PlacementRules.language("DE", null)));
        assertEquals("B1 · Seuil", PlacementRules.label("B1"));
        assertEquals("A2 · Survie", PlacementRules.label("A2"));
    }

    @Test
    void uneQuestionSansBonneRéponseNEstPasTirée() {
        ObjectNode bank = (ObjectNode) test("A1");
        ObjectNode broken = (ObjectNode) bank.path("tiers").get(0).path("questions").get(0);
        broken.putArray("options").addObject().put("id", "a").put("label", "Seule").put("correct", true);
        JsonNode tier = PlacementRules.tier(PlacementRules.draw(JSON, bank, new Random(8)), "A1");
        for (JsonNode question : tier.path("questions")) assertFalse("a1-q1".equals(question.path("id").asText()));
        assertEquals(12, tier.path("questions").size());
    }
}
