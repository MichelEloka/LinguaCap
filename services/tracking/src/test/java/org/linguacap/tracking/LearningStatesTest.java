package org.linguacap.tracking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

/**
 * EVO-039 : la vue du professeur lit l'accueil et le parcours en direct chez Apprentissage, par lots de 200 élèves, et
 * reste servie (learning null) quand Apprentissage ne répond pas.
 */
class LearningStatesTest {
    private final ObjectMapper json = new ObjectMapper();

    @Test
    void lesÉlèvesSontDemandésParLotsDeDeuxCents() {
        List<String> ids = IntStream.range(0, 450).mapToObj(index -> "id-" + index).toList();
        List<List<String>> batches = LearningStates.batches(ids);
        assertEquals(List.of(200, 200, 50), batches.stream().map(List::size).toList());
        assertEquals("id-200", batches.get(1).get(0), "L'ordre de la liste est conservé");
        assertEquals(List.of(), LearningStates.batches(List.of()));
    }

    @Test
    void chaqueÉlèveRetrouveSonÉtatLuEnDirect() throws Exception {
        JsonNode first = json.readTree("""
                [{"learnerId": "a", "path": {"status": "draft"}}, {"learnerId": "b", "path": null}]
                """);
        JsonNode second = json.readTree("[{\"learnerId\": \"c\", \"path\": {\"status\": \"active\"}}]");
        Map<String, JsonNode> states = LearningStates.index(List.of(first, second));
        assertEquals("draft", LearningStates.of(states, "a").path("path").path("status").asText(),
                "Le parcours au brouillon est visible sans attendre la synchronisation du Suivi");
        assertTrue(LearningStates.of(states, "b").path("path").isNull());
        assertEquals("active", LearningStates.of(states, "c").path("path").path("status").asText());
        assertTrue(LearningStates.of(states, "inconnu").isNull(), "Un élève absent de la réponse : learning null");
    }

    @Test
    void sansRéponseDApprentissageLaVueRestePlusPauvreMaisServie() throws Exception {
        assertTrue(LearningStates.of(null, "a").isNull(), "Apprentissage indisponible : learning null");
        List<JsonNode> responses = new ArrayList<>();
        responses.add(json.readTree("{\"code\": \"UNAVAILABLE\"}"));
        assertNull(LearningStates.index(responses), "Une réponse qui n'est pas une liste est écartée");
    }
}
