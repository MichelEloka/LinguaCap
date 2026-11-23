package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.ServiceClient;

/**
 * Lexique d'un module : vocabulaire lu dans le catalogue (version publiée ou retirée), son de chaque entrée servi
 * comme un segment [start, end] du son de lexique du module, avec l'adresse temporaire demandée à Médias avec le
 * jeton de l'utilisateur (même logique que les supports des séances). Si Médias est indisponible, le lexique reste
 * lisible sans adresses.
 */
@ApplicationScoped
public class LexiconContent {
    private static final Logger LOG = Logger.getLogger(LexiconContent.class);

    @Inject Actor actor;
    @Inject ServiceClient services;

    @ConfigProperty(name = "lingua.services.catalogue")
    String catalogueUrl;
    @ConfigProperty(name = "lingua.services.media")
    String mediaUrl;

    /** Forme servie : module, niveau et version, entrées dans l'ordre du module. */
    public record Lexicon(UUID trackVersionId, String levelCode, String moduleId, String moduleTitle,
                          List<LexiconEntry> entries) {}

    /** article : der, die, das ou null ; audio : segment du son de lexique, ou null si l'entrée n'a pas de son. */
    public record LexiconEntry(String id, String word, String article, String plural, String partOfSpeech,
                               String translation, String example, String note, LexiconAudio audio) {}

    /** url : adresse temporaire du son du module (null si Médias ne l'a pas fournie) ; start et end en secondes. */
    public record LexiconAudio(String url, double start, double end) {}

    /** Vocabulaire du module dans le catalogue, ou null si la version ou le module est introuvable. */
    JsonNode vocabulary(UUID callerId, UUID versionId, String moduleId) {
        try {
            return services.request(catalogueUrl, "/v1/internal/tracks/" + versionId + "/modules/" + moduleId
                    + "/vocabulary", "GET", callerId, null);
        } catch (WebApplicationException error) {
            if (error.getResponse().getStatus() == 404) return null;
            throw error;
        }
    }

    /** Lexique complet d'un module, ou null si le catalogue ne le connaît pas. */
    Lexicon lexicon(UUID callerId, UUID versionId, String moduleId) {
        JsonNode vocabulary = vocabulary(callerId, versionId, moduleId);
        if (vocabulary == null) return null;
        return lexicon(vocabulary, files(callerId, audioRefs(vocabulary)));
    }

    /**
     * Adresses temporaires des médias demandés (clé « assetId@version »), avec le jeton de l'utilisateur. Une réponse
     * vide si le jeton manque ou si Médias est indisponible : le contenu reste lisible.
     */
    Map<String, JsonNode> files(UUID callerId, Map<String, Map<String, Object>> wanted) {
        String token = actor.token();
        if (wanted.isEmpty() || token.isEmpty()) return Map.of();
        Map<String, JsonNode> files = new HashMap<>();
        try {
            var result = services.exchange(mediaUrl, "/v1/internal/media/read-grants", "POST", callerId,
                    Map.of("items", List.copyOf(wanted.values())), token, "", false, actor.requestId());
            if (result.status() != 200 || !result.body().isArray()) {
                LOG.warnf("Media read grants returned HTTP %d", result.status());
                return Map.of();
            }
            for (JsonNode file : result.body()) {
                files.put(file.path("assetId").asText() + "@" + file.path("version").asInt(), file);
            }
        } catch (WebApplicationException error) {
            LOG.warn("Media read grants unavailable");
            return Map.of();
        }
        return files;
    }

    /** Médias à demander pour les sons du vocabulaire (un par module en pratique). */
    static Map<String, Map<String, Object>> audioRefs(JsonNode vocabulary) {
        Map<String, Map<String, Object>> wanted = new LinkedHashMap<>();
        if (vocabulary == null) return wanted;
        for (JsonNode entry : vocabulary.path("entries")) {
            JsonNode audio = entry.path("audio");
            if (!audio.isObject() || audio.path("assetId").asText("").isEmpty()) continue;
            wanted.put(key(audio), Map.of("assetId", audio.path("assetId").asText(), "version", audio.path("assetVersion").asInt()));
        }
        return wanted;
    }

    /** Forme servie à partir du vocabulaire du catalogue et des adresses obtenues de Médias. */
    static Lexicon lexicon(JsonNode vocabulary, Map<String, JsonNode> files) {
        List<LexiconEntry> entries = new ArrayList<>();
        for (JsonNode entry : vocabulary.path("entries")) {
            JsonNode audio = entry.path("audio");
            LexiconAudio sound = null;
            if (audio.isObject() && !audio.path("assetId").asText("").isEmpty()) {
                JsonNode file = files.get(key(audio));
                sound = new LexiconAudio(file == null ? null : file.path("url").asText(null),
                        audio.path("start").asDouble(), audio.path("end").asDouble());
            }
            entries.add(new LexiconEntry(entry.path("id").asText(), entry.path("word").asText(""),
                    text(entry.path("article")), text(entry.path("plural")), text(entry.path("partOfSpeech")),
                    entry.path("translation").asText(""), text(entry.path("example")), text(entry.path("note")), sound));
        }
        String versionId = vocabulary.path("versionId").asText("");
        return new Lexicon(versionId.isEmpty() ? null : UUID.fromString(versionId), text(vocabulary.path("levelCode")),
                vocabulary.path("moduleId").asText(), vocabulary.path("moduleTitle").asText(""), List.copyOf(entries));
    }

    private static String key(JsonNode audio) {
        return audio.path("assetId").asText() + "@" + audio.path("assetVersion").asInt();
    }

    private static String text(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode() ? null : node.asText();
    }
}
