package org.linguacap.assessment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.WebApplicationException;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class PracticeRulesTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final UUID LEARNER = UUID.fromString("3f1c2a9e-6f1d-4b8e-9a51-2a0c1e7d4b10");
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-21T10:00:00Z");

    private static JsonNode json(String text) {
        try {
            return JSON.readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalStateException(error);
        }
    }

    /** Bilan intermédiaire tel que Catalogue le sert à Évaluations : corrigés, grilles et supports compris. */
    private static final JsonNode MIDTERM = json("""
            {'kind':'midterm','title':'Bilan intermédiaire A1','description':'À mi-parcours','passPercent':60,'levelCode':'A1',
             'parts':[
              {'id':'lecture','competence':'lecture','mode':'closed','title':'Lire','instructions':'Lisez.','criteria':[],
               'placements':[],'questions':[
                {'id':'q1','prompt':'Wie heißt er ?','moduleRef':'hallo','options':[{'id':'a','label':'Tom','correct':true},{'id':'b','label':'Max','correct':false}]},
                {'id':'q2','prompt':'Wo wohnt sie ?','moduleRef':null,'options':[{'id':'a','label':'Berlin','correct':false},{'id':'b','label':'Wien','correct':true}]}]},
              {'id':'ecoute','competence':'ecoute','mode':'closed','title':'Écouter','instructions':'Écoutez.','criteria':[],
               'placements':[{'assetId':'a1-bilan-ecoute','assetVersion':2,'usage':'audio','alt':'Dialogue','caption':null,
                 'transcriptVisibility':'hidden','decorative':false,'questionId':null,'optionId':null}],
               'questions':[
                {'id':'q1','prompt':'Was kauft er ?','options':[{'id':'a','label':'Brot','correct':false},{'id':'b','label':'Milch','correct':true}]},
                {'id':'q2','prompt':'Wann ?','options':[{'id':'a','label':'Heute','correct':true},{'id':'b','label':'Morgen','correct':false}]}]},
              {'id':'ecrit','competence':'expression-ecrite','mode':'written','title':'Écrire','instructions':'Présentez-vous.',
               'questions':[],'placements':[],'criteria':[{'id':'clarte','label':'Clarté','maxPoints':5}]},
              {'id':'oral','competence':'expression-orale','mode':'oral','title':'Parler','instructions':'Commandez un café.',
               'questions':[],'placements':[],'criteria':[{'id':'aisance','label':'Aisance','maxPoints':10}]}]}
            """);

    private static PracticeStore.Attempt attempt(String status, JsonNode answers, JsonNode scores, OffsetDateTime submittedAt) {
        return new PracticeStore.Attempt(UUID.randomUUID(), LEARNER, UUID.randomUUID(), "A1", "midterm", MIDTERM, status,
                answers, submittedAt == null ? null : "remise-0001", scores,
                scores == null ? null : scores.path("percent").asInt(), NOW.minusHours(1), submittedAt);
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
    void lExamenBlancEstRéservéAuParcours() {
        PracticeRules.checkKind("midterm");
        WebApplicationException refusal = assertThrows(WebApplicationException.class, () -> PracticeRules.checkKind("final"));
        assertEquals(409, refusal.getResponse().getStatus(), "L'examen de passage de niveau est refusé en entraînement");
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) refusal.getResponse().getEntity();
        assertEquals("CONFLICT", body.get("code"));
        assertTrue(body.get("message").contains("examen de passage de niveau"), body.get("message"));
        assertTrue(body.get("message").contains("bilan intermédiaire"));
        assertEquals(400, status(() -> PracticeRules.checkKind("practice")));
        assertEquals(400, status(() -> PracticeRules.checkKind(null)));
    }

    @Test
    void seulesLesPartiesFerméesSontCorrigées() {
        PracticeRules.Scored scored = PracticeRules.score(MIDTERM, json("{'lecture':{'q1':'a','q2':'b'},'ecoute':{'q1':'b','q2':'b'}}"));
        assertEquals(Map.of("lecture", new PracticeResource.PartScore(2, 2), "ecoute", new PracticeResource.PartScore(1, 2)),
                scored.parts(), "L'écrit et l'oral ne sont pas notés");
        assertEquals(75, scored.percent());
        assertEquals(new PlacementResource.CompetenceScore(1, 2, 50), scored.competences().get("ecoute"));
        assertTrue(scored.passed(), "75 % au seuil de 60 %, aucune compétence sous 30 %");

        PracticeRules.Scored weak = PracticeRules.score(MIDTERM, json("{'lecture':{'q1':'a','q2':'b'},'ecoute':{'q1':'a','q2':'b'}}"));
        assertEquals(50, weak.percent());
        assertFalse(weak.passed());
        assertEquals(0, PracticeRules.score(MIDTERM, null).percent(), "Sans réponse, tout compte faux");
    }

    @Test
    void aucunCorrigéNeFuiteDansLaVue() {
        PracticeStore.Attempt open = attempt("in_progress", json("{'lecture':{'q1':'b'}}"), null, null);
        JsonNode view = JSON.valueToTree(PracticeRules.view(JSON, open, Map.of("a1-bilan-ecoute@2", "https://media/son")));
        assertFalse(hasField(view.path("definition"), "correct"), "Aucun choix ne porte son corrigé");
        assertFalse(hasBooleanField(view, "correct"));
        assertFalse(hasField(view.path("definition"), "moduleRef"));
        assertEquals("practice", view.path("mode").asText());
        assertTrue(view.path("result").isNull());
        assertTrue(view.path("nextAttemptAt").isNull());
        assertTrue(view.path("submittedAt").isNull(), "null explicite, jamais de champ absent");
        assertEquals("https://media/son", view.path("media").path("a1-bilan-ecoute@2").asText());

        JsonNode parts = view.path("definition").path("parts");
        assertEquals(4, parts.size());
        assertFalse(parts.get(0).path("selfPractice").asBoolean());
        assertTrue(parts.get(2).path("selfPractice").asBoolean(), "L'écrit est proposé en auto-entraînement");
        assertTrue(parts.get(3).path("selfPractice").asBoolean());
        assertEquals("Commandez un café.", parts.get(3).path("instructions").asText());
        assertEquals(10, parts.get(3).path("criteria").get(0).path("maxPoints").asInt());
        JsonNode placement = parts.get(1).path("placements").get(0);
        assertEquals(1, placement.path("position").asInt());
        assertEquals("a1-bilan-ecoute", placement.path("assetId").asText());
        assertTrue(placement.path("caption").isNull());
        assertEquals(60, view.path("definition").path("passPercent").asInt());
        assertEquals("A1", view.path("definition").path("levelCode").asText());

        PracticeRules.Scored scored = PracticeRules.score(MIDTERM, open.answers());
        PracticeStore.Attempt submitted = attempt("submitted", open.answers(), PracticeRules.scoresNode(JSON, scored), NOW);
        JsonNode done = JSON.valueToTree(PracticeRules.view(JSON, submitted, Map.of()));
        assertFalse(hasBooleanField(done, "correct"), "Le résultat ne donne que des totaux par partie et par compétence");
        assertEquals(0, done.path("result").path("parts").path("lecture").path("correct").asInt());
        assertEquals(2, done.path("result").path("parts").path("lecture").path("total").asInt());
        assertEquals(0, done.path("result").path("percent").asInt());
        assertFalse(done.path("result").path("passed").asBoolean());
        assertEquals(NOW.plusHours(12).toString(), done.path("nextAttemptAt").asText());
        assertEquals("b", done.path("answers").path("lecture").path("q1").asText(), "Seules les réponses de l'élève sont rendues");
    }

    @Test
    void unNouvelEssaiAttendDouzeHeuresAprèsUneRemise() {
        assertNull(PracticeRules.retryRefusal(null, NOW));
        String refusal = PracticeRules.retryRefusal(NOW.minusHours(11), NOW);
        assertNotNull(refusal);
        assertTrue(refusal.contains("21 novembre à 12 h 00"), refusal);
        assertNull(PracticeRules.retryRefusal(NOW.minusHours(12), NOW));
        assertEquals(NOW.plusHours(12), PracticeRules.nextAttemptAt(NOW));
        assertNull(PracticeRules.nextAttemptAt(null));
    }

    @Test
    void unBilanSansQuestionFerméeNEstPasProposé() {
        PracticeRules.checkPracticable(MIDTERM);
        assertEquals(409, status(() -> PracticeRules.checkPracticable(json("""
                {'parts':[{'id':'ecrit','competence':'expression-ecrite','mode':'written','questions':[],'criteria':[]}]}
                """))));
    }

    @Test
    void leRésuméReprendLeRésultatEnregistré() {
        PracticeRules.Scored scored = PracticeRules.score(MIDTERM, json("{'lecture':{'q1':'a','q2':'b'},'ecoute':{'q1':'b','q2':'a'}}"));
        PracticeStore.Attempt submitted = attempt("submitted", JSON.createObjectNode(), PracticeRules.scoresNode(JSON, scored), NOW);
        PracticeResource.PracticeSummary summary = PracticeRules.summary(submitted);
        assertEquals("Bilan intermédiaire A1", summary.title());
        assertEquals(100, summary.percent());
        PracticeResource.PracticeResult result = PracticeRules.result(PracticeRules.scoresNode(JSON, scored));
        assertTrue(result.passed());
        assertEquals(new PlacementResource.CompetenceScore(2, 2, 100), result.competences().get("lecture"));
        assertNull(PracticeRules.result(null));
    }

    @Test
    void lExamenBlancDUnNiveauTerminéNeSeReprendQuÀConsolider() {
        JsonNode completed = json("{'status':'completed','goalStatus':'to_consolidate'}");
        assertNull(ExamResource.startRefusal(completed, "final"), "Examen blanc à consolider d'un niveau terminé : reprise permise");
        assertTrue(ExamResource.retakeOfCompletedLevel(completed, "final"));
        assertNotNull(ExamResource.startRefusal(completed, "midterm"));
        assertNotNull(ExamResource.startRefusal(json("{'status':'completed','goalStatus':'validated'}"), "final"));
        assertNotNull(ExamResource.startRefusal(json("{'status':'completed','goalStatus':'awaiting_grading'}"), "final"));
        assertNotNull(ExamResource.startRefusal(json("{'status':'withdrawn','goalStatus':'to_consolidate'}"), "final"));
        assertNull(ExamResource.startRefusal(json("{'status':'active','goalStatus':'active'}"), "midterm"));
        assertFalse(ExamResource.retakeOfCompletedLevel(json("{'status':'active','goalStatus':'to_consolidate'}"), "final"));
        assertTrue(ExamResource.startRefusal(json("{'status':'active','goalStatus':'paused'}"), "final").contains("pause"));
    }
}
