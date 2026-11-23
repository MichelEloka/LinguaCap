package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.linguacap.learning.LexiconContent.Lexicon;
import org.linguacap.learning.LexiconContent.LexiconAudio;
import org.linguacap.learning.LexiconContent.LexiconEntry;

class LexiconContentTest {
    private static final ObjectMapper JSON = new ObjectMapper();

    private static JsonNode json(String text) {
        try {
            return JSON.readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalArgumentException(error);
        }
    }

    /** Réponse du catalogue (GET /v1/internal/tracks/{v}/modules/{m}/vocabulary). */
    private static final JsonNode VOCABULARY = json("""
            {'versionId': '7d0c1f5e-8a54-4c0e-9d7a-2f4f3c2b1a00', 'levelCode': 'A1', 'moduleId': 'a1-sante',
             'moduleTitle': 'Santé', 'entries': [
               {'id': 'kopf', 'word': 'Kopf', 'article': 'der', 'plural': 'Köpfe', 'partOfSpeech': 'noun',
                'translation': 'la tête', 'example': 'Mein Kopf tut weh.', 'note': null,
                'audio': {'assetId': 'a1-sante-lexique', 'assetVersion': 2, 'start': 0.0, 'end': 1.45}},
               {'id': 'weh-tun', 'word': 'wehtun', 'article': null, 'plural': null, 'partOfSpeech': 'verb',
                'translation': 'faire mal', 'example': null, 'note': 'séparable : weh|tun',
                'audio': {'assetId': 'a1-sante-lexique', 'assetVersion': 2, 'start': 3.21, 'end': 4.4}},
               {'id': 'leute', 'word': 'Leute', 'article': null, 'plural': null, 'partOfSpeech': 'noun',
                'translation': 'les gens', 'example': null, 'note': 'toujours au pluriel', 'audio': null}]}
            """);

    @Test
    void leLexiqueServiReprendLeVocabulaireEtLesSegmentsDuSon() {
        Map<String, JsonNode> files = Map.of("a1-sante-lexique@2",
                json("{'assetId': 'a1-sante-lexique', 'version': 2, 'url': 'https://media.example/lexique.mp3', 'mimeType': 'audio/mpeg'}"));
        Lexicon lexicon = LexiconContent.lexicon(VOCABULARY, files);
        assertEquals(UUID.fromString("7d0c1f5e-8a54-4c0e-9d7a-2f4f3c2b1a00"), lexicon.trackVersionId());
        assertEquals("A1", lexicon.levelCode());
        assertEquals("a1-sante", lexicon.moduleId());
        assertEquals("Santé", lexicon.moduleTitle());
        assertEquals(new LexiconEntry("kopf", "Kopf", "der", "Köpfe", "noun", "la tête", "Mein Kopf tut weh.", null,
                new LexiconAudio("https://media.example/lexique.mp3", 0.0, 1.45)), lexicon.entries().get(0));
        LexiconAudio segment = lexicon.entries().get(1).audio();
        assertTrue(segment.start() < segment.end());
        assertEquals(3.21, segment.start());
        assertEquals("séparable : weh|tun", lexicon.entries().get(1).note());
        assertNull(lexicon.entries().get(2).audio(), "une entrée sans son");
        assertNull(lexicon.entries().get(2).article());
    }

    @Test
    void sansAdresseDeMediasLeLexiqueResteLisible() {
        Lexicon lexicon = LexiconContent.lexicon(VOCABULARY, Map.of());
        assertNull(lexicon.entries().get(0).audio().url());
        assertEquals(1.45, lexicon.entries().get(0).audio().end());
    }

    @Test
    void leSonDuLexiqueEstDemandeUneSeuleFois() {
        Map<String, Map<String, Object>> refs = LexiconContent.audioRefs(VOCABULARY);
        assertEquals(Map.of("a1-sante-lexique@2", Map.of("assetId", "a1-sante-lexique", "version", 2)), refs);
        assertTrue(LexiconContent.audioRefs(null).isEmpty());
        assertTrue(LexiconContent.audioRefs(json("{'entries': []}")).isEmpty());
    }

    @Test
    void laFormeServieEstCelleDuContrat() {
        JsonNode served = JSON.valueToTree(LexiconContent.lexicon(VOCABULARY, Map.of()));
        assertEquals(List.of("trackVersionId", "levelCode", "moduleId", "moduleTitle", "entries"), names(served));
        assertEquals(List.of("id", "word", "article", "plural", "partOfSpeech", "translation", "example", "note", "audio"),
                names(served.path("entries").get(0)));
        assertEquals(List.of("url", "start", "end"), names(served.path("entries").get(0).path("audio")));
    }

    private static List<String> names(JsonNode node) {
        List<String> names = new java.util.ArrayList<>();
        node.fieldNames().forEachRemaining(names::add);
        return names;
    }
}
