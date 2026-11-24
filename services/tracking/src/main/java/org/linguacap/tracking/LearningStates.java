package org.linguacap.tracking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.NullNode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Accueil et parcours des élèves lus en direct chez Apprentissage (EVO-039) : la vue d'ensemble et la fiche n'attendent
 * plus la synchronisation périodique pour montrer un parcours au brouillon. Aides pures : découpage des demandes,
 * indexation de la réponse et valeur du champ `learning` (null quand Apprentissage n'a pas répondu).
 */
final class LearningStates {
    /** Élèves par demande à Apprentissage (POST /v1/internal/learning/learner-states). */
    static final int BATCH = 200;

    private LearningStates() {}

    /** Identifiants découpés en demandes de BATCH élèves au plus, dans l'ordre. */
    static List<List<String>> batches(List<String> learnerIds) {
        List<List<String>> batches = new ArrayList<>();
        for (int from = 0; from < learnerIds.size(); from += BATCH) {
            batches.add(List.copyOf(learnerIds.subList(from, Math.min(learnerIds.size(), from + BATCH))));
        }
        return batches;
    }

    /** Réponses d'Apprentissage indexées par élève ; une réponse qui n'est pas une liste est refusée (null). */
    static Map<String, JsonNode> index(List<JsonNode> responses) {
        Map<String, JsonNode> states = new HashMap<>();
        for (JsonNode response : responses) {
            if (response == null || !response.isArray()) return null;
            for (JsonNode state : response) {
                String learnerId = state.path("learnerId").asText("");
                if (!learnerId.isEmpty()) states.put(learnerId, state);
            }
        }
        return states;
    }

    /** Valeur du champ `learning` d'un élève : son état, ou null si Apprentissage est indisponible ou ne le connaît pas. */
    static JsonNode of(Map<String, JsonNode> states, String learnerId) {
        JsonNode state = states == null ? null : states.get(learnerId);
        return state == null ? NullNode.getInstance() : state;
    }
}
