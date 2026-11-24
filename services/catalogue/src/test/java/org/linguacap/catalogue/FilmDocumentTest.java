package org.linguacap.catalogue;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.ws.rs.WebApplicationException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import org.junit.jupiter.api.Test;
import org.linguacap.catalogue.FilmDocument.Input;
import org.linguacap.catalogue.QuestionViews.KeyQuestion;
import org.linguacap.catalogue.VersionDocument.Checks;
import org.linguacap.catalogue.VersionDocument.Issue;

class FilmDocumentTest {
    /** Réglage de Quarkus pour ce service (quarkus.jackson.fail-on-unknown-properties=true). */
    private static final ObjectMapper JSON = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);
    /** Clés d'un corrigé : aucune ne doit figurer dans ce que reçoit une session, à aucune profondeur. */
    private static final Set<String> ANSWER_KEYS = Set.of("correct", "accept", "answers", "pairs", "explanation",
            "feedback", "spec");

    /** Document d'import complet au format 1 : un film, une séquence de 7 minutes, 4 mots-clés, 5 questions typées. */
    static ObjectNode document() {
        try {
            return (ObjectNode) JSON.readTree("""
                    {"format": 1,
                     "film": {"id": "essai-film", "languageId": "de", "levelId": "a1", "title": "Film d’essai",
                       "description": "Un film de recette.", "provider": "youtube", "videoId": "AbCdEfGhIj_",
                       "channel": "Chaîne d’essai", "videoUrl": "https://www.youtube.com/watch?v=AbCdEfGhIj_",
                       "courseUrl": "https://example.org/cours", "credit": "Film : essai, lecteur YouTube",
                       "licenseNote": "Lecture par le lecteur officiel seulement.", "durationSeconds": 3600, "position": 1},
                     "sequences": [{"id": "essai-film-01", "position": 1, "title": "Am Bahnhof", "start": 0, "end": 420,
                       "approx": true, "context": "Nico arrive en ville. [fr] Que cherche-t-il ?",
                       "keywords": [
                         {"word": "Bahnhof", "article": "der", "plural": "Bahnhöfe", "translation": "la gare", "note": null},
                         {"word": "Fahrkarte", "article": "die", "plural": "Fahrkarten", "translation": "le billet"},
                         {"word": "ankommen", "translation": "arriver", "note": "séparable : an|kommen"},
                         {"word": "Entschuldigung", "translation": "pardon"}],
                       "questions": [
                         {"id": "q1", "type": "choice", "prompt": "Où arrive Nico ?", "explanation": "Il descend du train.",
                          "options": [{"id": "a", "label": "À la gare", "correct": true, "feedback": "Oui."},
                                      {"id": "b", "label": "À l’aéroport", "correct": false}]},
                         {"id": "q2", "type": "choice", "prompt": "Que cherche-t-il ?", "explanation": "Une adresse.",
                          "options": [{"id": "a", "label": "Une adresse", "correct": true},
                                      {"id": "b", "label": "Un emploi", "correct": false}]},
                         {"id": "q3", "type": "fill", "prompt": "Complétez.", "explanation": "ankommen est séparable.",
                          "spec": {"text": "Der Zug [[1]] um zehn an.", "blanks": [{"id": "1", "accept": ["kommt"]}]}},
                         {"id": "q4", "type": "order", "prompt": "Remettez en ordre.", "explanation": "Verbe en 2e position.",
                          "spec": {"answers": [["Ich", "suche", "den", "Bahnhof."]]}},
                         {"id": "q5", "type": "match", "prompt": "Associez.", "explanation": "Vocabulaire de la séquence.",
                          "spec": {"pairs": [{"left": "der Bahnhof", "right": "la gare"},
                                             {"left": "die Fahrkarte", "right": "le billet"}]}}]}]}
                    """);
        } catch (Exception error) {
            throw new IllegalStateException(error);
        }
    }

    static Input parse(JsonNode node) {
        try {
            return JSON.treeToValue(node, Input.class);
        } catch (Exception error) {
            throw new IllegalStateException(error);
        }
    }

    static Input valid() {
        Input input = FilmDocument.normalized(parse(document()));
        FilmDocument.checkStructure("essai-film", input);
        return input;
    }

    private static ObjectNode sequence(ObjectNode document) {
        return (ObjectNode) document.withArray("sequences").get(0);
    }

    /** Le document modifié est refusé en 400 avec un message qui contient le fragment attendu. */
    private static void refused(Consumer<ObjectNode> change, String fragment) {
        ObjectNode document = document();
        change.accept(document);
        WebApplicationException error = assertThrows(WebApplicationException.class,
                () -> FilmDocument.checkStructure("essai-film", FilmDocument.normalized(parse(document))));
        assertEquals(400, error.getResponse().getStatus());
        String message = String.valueOf(((Map<?, ?>) error.getResponse().getEntity()).get("message"));
        assertTrue(message.contains(fragment), "message « " + message + " » sans « " + fragment + " »");
    }

    @Test
    void unDocumentCompletEstValideEtPubliable() {
        Input input = valid();
        Checks checks = FilmDocument.check(input);
        assertTrue(checks.publishable(), () -> "points relevés : " + checks.issues());
        assertEquals("cine-essai-film-01", FilmDocument.lessonId(input.sequences().get(0).id()));
        assertEquals(Boolean.TRUE, input.sequences().get(0).approx());
        assertEquals("der", input.sequences().get(0).keywords().get(0).article());
        assertEquals(null, input.sequences().get(0).keywords().get(2).article(), "article absent : null");
    }

    @Test
    void laStructureEstControleeAvecUnMessagePrecis() {
        refused(document -> document.put("format", 2), "format 1");
        refused(document -> ((ObjectNode) document.get("film")).put("id", "autre-film"), "adresse");
        refused(document -> ((ObjectNode) document.get("film")).put("provider", "vimeo"), "YouTube officiel");
        refused(document -> ((ObjectNode) document.get("film")).put("videoId", "trop-court"), "11 caractères");
        refused(document -> ((ObjectNode) document.get("film")).put("videoUrl", "https://youtu.be/AbCdEfGhIj_"),
                "https://www.youtube.com/watch?v=AbCdEfGhIj_");
        refused(document -> ((ObjectNode) document.get("film")).put("courseUrl", "http://example.org"), "https");
        refused(document -> ((ObjectNode) document.get("film")).put("levelId", "A1"), "niveau");
        refused(document -> ((ObjectNode) document.get("film")).put("durationSeconds", 30), "durée");
        refused(document -> sequence(document).put("id", "autre-01"), "commence par « essai-film- »");
        refused(document -> sequence(document).put("end", 120), "3 à 15 minutes");
        refused(document -> sequence(document).put("end", 1200), "3 à 15 minutes");
        refused(document -> sequence(document).put("end", 4000), "tenir dans la vidéo");
        refused(document -> sequence(document).put("start", -1), "tenir dans la vidéo");
        refused(document -> ((ObjectNode) sequence(document).withArray("keywords").get(0)).put("article", "le"), "der, die ou das");
        refused(document -> ((ObjectNode) sequence(document).withArray("questions").get(0)).put("type", "dictation"),
                "choice, fill, order ou match");
        refused(document -> ((ObjectNode) sequence(document).withArray("questions").get(0)).put("moduleRef", "m1"),
                "aucun module");
        refused(document -> ((ObjectNode) sequence(document).withArray("questions").get(2)).withObject("spec")
                .putArray("pairs"), "inattendu");
        refused(document -> {
            ArrayNode questions = sequence(document).withArray("questions");
            for (int index = 0; index < 4; index++) questions.add(((ObjectNode) questions.get(0).deepCopy()).put("id", "x" + index));
        }, "8 questions au plus");
        refused(document -> document.withArray("sequences").add(sequence(document).deepCopy().put("position", 2)),
                "Deux séquences");
        refused(document -> document.withArray("sequences").add(sequence(document).deepCopy().put("id", "essai-film-02")),
                "position");
    }

    @Test
    void unBrouillonIncompletSEnregistreMaisNeSePubliePas() {
        ObjectNode document = document();
        ((ObjectNode) document.get("film")).put("courseUrl", "");
        ObjectNode sequence = sequence(document);
        sequence.put("context", "  ");
        ArrayNode keywords = sequence.withArray("keywords");
        keywords.remove(3);
        ((ObjectNode) keywords.get(0)).put("translation", "");
        ArrayNode questions = sequence.withArray("questions");
        questions.remove(4);
        ((ObjectNode) questions.get(0).get("options").get(1)).put("correct", true);
        Input input = FilmDocument.normalized(parse(document));
        assertDoesNotThrow(() -> FilmDocument.checkStructure("essai-film", input));
        Checks checks = FilmDocument.check(input);
        assertFalse(checks.publishable());
        List<String> paths = checks.issues().stream().map(Issue::path).toList();
        assertEquals(List.of("film.courseUrl", "sequences[0].context", "sequences[0].keywords",
                "sequences[0].keywords[0]", "sequences[0].questions", "sequences[0].questions[0].options"), paths);
        assertTrue(FilmDocument.refusal(checks).startsWith("Le film n’est pas prêt : Indiquez le lien"));
        assertTrue(FilmDocument.refusal(checks).endsWith("(6 points à compléter)"));

        Input empty = FilmDocument.normalized(parse(JSON.createObjectNode().set("film", document().get("film"))));
        FilmDocument.checkStructure("essai-film", empty);
        assertEquals(List.of("sequences"), FilmDocument.check(empty).issues().stream().map(Issue::path).toList(),
                "un film sans séquence s'enregistre, il ne se publie pas");
    }

    /** L'éditeur renvoie le document servi tel quel : les champs en lecture seule sont ignorés, les autres refusés. */
    @Test
    void leDocumentDeLEditeurFaitLAllerRetour() throws Exception {
        ObjectNode served = document();
        served.remove("format");
        ((ObjectNode) served.get("film")).put("levelCode", "A1").put("status", "published")
                .put("publishedAt", "2026-12-03T10:00:00Z").put("updatedAt", "2026-12-03T10:00:00Z");
        sequence(served).put("lessonId", "cine-essai-film-01");
        served.putObject("checks").put("publishable", true).putArray("issues");
        Input input = FilmDocument.normalized(JSON.treeToValue(served, Input.class));
        FilmDocument.checkStructure("essai-film", input);
        assertTrue(FilmDocument.check(input).publishable());

        ObjectNode unknown = document();
        sequence(unknown).put("transcript", "Texte recopié");
        assertThrows(UnrecognizedPropertyException.class, () -> JSON.treeToValue(unknown, Input.class),
                "aucune transcription ne peut entrer dans le catalogue");
    }

    /**
     * Ce que reçoit une session (GET /films/{id}, GET /lessons/cine-…) ne contient aucun corrigé, alors que la clé
     * d'exercice servie à Évaluations pour la même leçon porte la réponse de chaque question, dans le même ordre.
     */
    @Test
    void lesQuestionsApresSontServiesSansCorrigeEtCorrigeesParLaCleDExercice() throws Exception {
        Input input = valid();
        FilmDocument.SequenceInput sequence = input.sequences().get(0);
        String lessonId = FilmDocument.lessonId(sequence.id());
        List<QuestionViews.View> views = QuestionViews.publicViews(lessonId, sequence.questions());
        FilmDocument.Film film = new FilmDocument.Film("essai-film", "de", "a1", "A1", "Film d’essai", "", "youtube",
                "AbCdEfGhIj_", "Chaîne", "https://www.youtube.com/watch?v=AbCdEfGhIj_", "https://example.org/cours",
                "Film : essai", "", 3600, 1, List.of(new FilmDocument.Sequence(sequence.id(), "essai-film", 1,
                sequence.title(), 0, 420, true, sequence.context(), sequence.keywords(), lessonId, views.size(), views)));
        JsonNode served = JSON.valueToTree(film);
        assertEquals(5, served.at("/sequences/0/questions").size());
        List<String> leaked = new ArrayList<>();
        collect(served, leaked);
        assertEquals(List.of(), leaked, "aucune clé de corrigé dans la réponse servie");
        assertFalse(served.toString().contains("Il descend du train"), "aucune explication avant la remise");

        List<KeyQuestion> key = QuestionViews.key(lessonId, sequence.questions());
        assertEquals(views.stream().map(QuestionViews.View::id).toList(), key.stream().map(KeyQuestion::id).toList(),
                "la clé suit les questions servies");
        assertTrue(key.get(0).options().stream().anyMatch(QuestionViews.KeyOption::correct));
        assertEquals(List.of("kommt"), key.get(2).blanks().get(0).accept());
        assertNotNull(key.get(3).answers());
        assertEquals(2, key.get(4).pairs().size());
        assertEquals("Il descend du train.", key.get(0).explanation(), "l'explication est servie avec le corrigé");
    }

    /** Une leçon d'un film en brouillon n'est ni lisible ni corrigée hors édition ; une leçon de version reste inchangée. */
    @Test
    void lesLeconsDUnFilmEnBrouillonNeSontNiLisiblesNiCorrigees() {
        assertTrue(CatalogueResource.READABLE_LESSON.contains(CatalogueResource.DRAFT_FILM_LESSON));
        assertTrue(CatalogueResource.KEYED_LESSON.contains(CatalogueResource.DRAFT_FILM_LESSON));
        assertTrue(CatalogueResource.DRAFT_FILM_LESSON.contains("f.status <> 'published'"));
        assertFalse(CatalogueResource.READABLE_LESSON.contains("%"), "le prédicat est inséré par String.formatted");
    }

    private static void collect(JsonNode node, List<String> leaked) {
        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                if (ANSWER_KEYS.contains(field.getKey())) leaked.add(field.getKey());
                collect(field.getValue(), leaked);
            }
        } else if (node.isArray()) {
            node.forEach(child -> collect(child, leaked));
        }
    }
}
