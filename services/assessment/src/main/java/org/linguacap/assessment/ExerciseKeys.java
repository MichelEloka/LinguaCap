package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;
import org.linguacap.common.ServiceClient;

/**
 * Clés de correction des exercices typés, lues chez Catalogue (GET /v1/internal/lessons/{id}/exercise-key). Une
 * leçon d'une version publiée ou retirée est figée (frozen) : sa clé est gardée en mémoire. Les brouillons et
 * l'ancienne leçon de démonstration sont relus à chaque remise.
 */
@ApplicationScoped
class ExerciseKeys {
    private static final Logger LOG = Logger.getLogger(ExerciseKeys.class);
    private static final int MAX_KEYS = 256;
    private static final int MAX_LEVELS = 64;

    @Inject ServiceClient services;

    @ConfigProperty(name = "lingua.services.catalogue") String catalogueUrl;

    private final Map<String, JsonNode> frozen = Collections.synchronizedMap(lru(MAX_KEYS));
    private final Map<String, String> levels = Collections.synchronizedMap(lru(MAX_LEVELS));

    /** Clé complète de la leçon : questions avec réponses acceptées, explications et retours. */
    JsonNode key(String lessonId, UUID actorId) {
        JsonNode cached = frozen.get(lessonId);
        if (cached != null) return cached;
        var result = services.exchange(catalogueUrl, "/v1/internal/lessons/" + lessonId + "/exercise-key", "GET",
                actorId, null, "", "", false, "");
        if (result.status() == 404) throw HttpError.notFound("Exercice introuvable.");
        JsonNode key = result.body();
        if (result.status() != 200 || key == null || !key.path("questions").isArray() || key.path("questions").isEmpty()) {
            LOG.warnf("Catalogue exercise key returned HTTP %d", result.status());
            throw HttpError.unavailable("La correction de cet exercice est temporairement indisponible.");
        }
        if (key.path("frozen").asBoolean(false)) frozen.put(lessonId, key);
        return key;
    }

    /** Clé de la leçon, ou null si elle n'existe plus (ancienne tentative). */
    JsonNode keyOrNull(String lessonId, UUID actorId) {
        try {
            return key(lessonId, actorId);
        } catch (jakarta.ws.rs.WebApplicationException error) {
            if (error.getResponse().getStatus() == 404) return null;
            throw error;
        }
    }

    /** Code du niveau d'une version (file des corrections) ; null si la version est illisible. */
    String levelCode(String versionId, UUID actorId) {
        if (versionId == null || versionId.isBlank()) return null;
        String cached = levels.get(versionId);
        if (cached != null) return cached;
        try {
            UUID.fromString(versionId);
            var result = services.exchange(catalogueUrl, "/v1/internal/tracks/" + versionId, "GET", actorId, null,
                    "", "", false, "");
            String code = result.status() == 200 ? result.body().path("levelCode").asText(null) : null;
            if (code != null && code.matches("[ABC][12]")) {
                levels.put(versionId, code);
                return code;
            }
        } catch (IllegalArgumentException | jakarta.ws.rs.WebApplicationException error) {
            LOG.debug("Track level unavailable for the review queue");
        }
        return null;
    }

    private static <V> Map<String, V> lru(int capacity) {
        return new LinkedHashMap<>(32, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, V> eldest) {
                return size() > capacity;
            }
        };
    }
}
