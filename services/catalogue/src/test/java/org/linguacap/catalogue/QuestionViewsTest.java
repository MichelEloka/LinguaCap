package org.linguacap.catalogue;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.linguacap.catalogue.QuestionSpecs.Blank;
import org.linguacap.catalogue.QuestionSpecs.Pair;
import org.linguacap.catalogue.QuestionSpecs.Spec;
import org.linguacap.catalogue.QuestionViews.KeyQuestion;
import org.linguacap.catalogue.QuestionViews.Token;
import org.linguacap.catalogue.QuestionViews.View;
import org.linguacap.catalogue.VersionDocument.Option;
import org.linguacap.catalogue.VersionDocument.Question;

class QuestionViewsTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final String LESSON = "a2-v4-a2-weil-pratique";
    /** Clés d'un corrigé : aucune ne doit figurer dans une vue élève, à aucune profondeur. */
    private static final Set<String> ANSWER_KEYS = Set.of("correct", "accept", "answers", "pairs", "explanation",
            "feedback", "spec");

    private static final Question CHOICE = new Question("q1", "choice", "Pourquoi « weil » ?", null,
            "Weil renvoie le verbe conjugué à la fin : « denn » ne le fait pas.",
            List.of(new Option("a", "weil", true, "Oui : subordonnée, verbe à la fin."),
                    new Option("b", "denn", false, "Denn garde le verbe en deuxième position.")), null);
    private static final Question FILL = new Question("q2", "fill", "Complétez avec le connecteur.", null,
            "Cause + verbe final : weil.", List.of(), new Spec("Ich bleibe zu Hause, [[1]] ich krank bin.",
            List.of(new Blank("1", List.of("weil"), null, "connecteur")), null, null, null, null, null));
    private static final List<List<String>> SENTENCES = List.of(
            List.of("Ich bleibe zu Hause,", "weil", "ich", "krank", "bin."),
            List.of("Weil ich krank bin,", "bleibe", "ich", "zu Hause."));
    private static final Question ORDER = new Question("q3", "order", "Remettez les mots dans l’ordre.", null,
            "Le verbe conjugué va à la fin après weil.", List.of(),
            new Spec(null, null, List.of(List.of("Ich bleibe zu Hause,", "weil", "ich", "krank", "bin.")), null, null, null, null));
    private static final Question MATCH = new Question("q4", "match", "Associez chaque verbe à sa préposition.", null,
            "Ces verbes se construisent avec une préposition fixe.", List.of(), new Spec(null, null, null,
            List.of(new Pair("warten", "auf + accusatif"), new Pair("denken", "an + accusatif"),
                    new Pair("träumen", "von + datif")), null, null, null));
    private static final Question DICTATION = new Question("q5", "dictation", "Écoutez et écrivez.", null,
            "« abfahren » est séparable : la particule va à la fin.", List.of(),
            new Spec(null, null, null, null, List.of("Der Zug fährt um zehn Uhr ab."), true, null));
    private static final Question SPEAK = new Question("q6", "speak", "Écoutez puis répétez.", null,
            "Kopfschmerzen : le mot composé prend l’accent sur Kopf.", List.of(),
            new Spec("Ich habe Kopfschmerzen.", null, null, null, List.of("Ich habe Kopfschmerzen."), null, null));
    private static final List<Question> ALL = List.of(CHOICE, FILL, ORDER, MATCH, DICTATION, SPEAK);

    @Test
    void aucuneVueEleveNeContientDeCorrige() throws Exception {
        List<View> views = QuestionViews.publicViews(LESSON, ALL);
        assertEquals(List.of("choice", "fill", "order", "match", "dictation", "speak"), views.stream().map(View::type).toList());
        JsonNode tree = JSON.valueToTree(views);
        List<String> found = new ArrayList<>();
        collectKeys(tree, found);
        for (String key : ANSWER_KEYS) assertFalse(found.contains(key), "clé de corrigé « " + key + " » dans la vue élève");
        String text = JSON.writeValueAsString(views);
        // Ni les réponses attendues, ni les explications, ni les retours ne sont servis avant la remise.
        for (String secret : List.of("Der Zug fährt um zehn Uhr ab.", "weil\"]", "Oui : subordonnée",
                "Denn garde", "Cause + verbe final", "particule va à la fin", "renvoie le verbe", "connecteur\",\"accept")) {
            assertFalse(text.contains(secret), "« " + secret + " » visible avant la remise : " + text);
        }
        // Le texte d'une question à trous ne contient que les repères, pas les réponses.
        assertEquals("Ich bleibe zu Hause, [[1]] ich krank bin.", tree.get(1).path("text").asText());
    }

    @Test
    void laVueDUneQuestionAChoixGardeSaFormeHistorique() {
        JsonNode view = JSON.valueToTree(QuestionViews.publicView(LESSON, CHOICE));
        assertEquals(List.of("id", "type", "prompt", "options"), names(view));
        assertEquals("weil", view.path("options").get(0).path("text").asText());
        assertEquals(List.of("id", "text"), names(view.path("options").get(0)));
        Question legacy = new Question("q9", null, "Ancienne question ?", null, null,
                List.of(new Option("a", "A", true), new Option("b", "B", false)), null);
        assertEquals("choice", QuestionViews.publicView(LESSON, legacy).type(), "type absent = choice");
        Question withoutOptions = new Question("q10", "choice", "Sans choix ?", null, null, List.of(), null);
        assertTrue(QuestionViews.publicViews(LESSON, List.of(withoutOptions)).isEmpty());
        assertTrue(QuestionViews.key(LESSON, List.of(withoutOptions)).isEmpty(), "la clé suit la vue");
    }

    @Test
    void lesJetonsOntDesIdentifiantsOpaquesEtDeterministes() {
        List<Token> tokens = QuestionViews.orderTokens(LESSON, "q3", ORDER.spec().answers());
        assertEquals(5, tokens.size());
        tokens.forEach(token -> assertTrue(token.id().matches("k[0-9a-f]{6}"), token.id()));
        assertEquals(tokens, QuestionViews.orderTokens(LESSON, "q3", ORDER.spec().answers()), "même entrée, même vue");
        assertEquals(Set.copyOf(ORDER.spec().answers().get(0)), Set.copyOf(QuestionViews.texts(tokens)));
        List<Token> otherVersion = QuestionViews.orderTokens("a2-v5-a2-weil-pratique", "q3", ORDER.spec().answers());
        assertNotEquals(tokens.stream().map(Token::id).toList(), otherVersion.stream().map(Token::id).toList(),
                "les identifiants changent avec la leçon (donc avec la version)");
        // Un même mot présent deux fois reçoit deux identifiants distincts.
        List<Token> repeated = QuestionViews.orderTokens(LESSON, "q7", List.of(List.of("Das", "ist", "das", "Haus", "das")));
        assertEquals(5, repeated.stream().map(Token::id).distinct().count());
    }

    @Test
    void lOrdreAfficheNEstJamaisUneSolution() {
        List<List<List<String>>> cases = new ArrayList<>();
        cases.add(List.of(List.of("Ich", "bin")));
        cases.add(SENTENCES.subList(0, 1));
        cases.add(List.of(List.of("Am Montag", "gehe", "ich", "ins Kino."), List.of("Ich", "gehe", "am Montag", "ins Kino.")));
        cases.add(List.of(List.of("a", "b", "a", "b"), List.of("b", "a", "b", "a")));
        cases.add(List.of(List.of("x", "y", "z"), List.of("y", "z", "x"), List.of("z", "x", "y"), List.of("x", "z", "y")));
        for (List<List<String>> answers : cases) {
            for (int variant = 0; variant < 200; variant++) {
                List<Token> tokens = QuestionViews.orderTokens("lecon-" + variant, "q" + variant, answers);
                assertFalse(QuestionViews.matchesSolution(QuestionViews.texts(tokens), answers),
                        () -> "ordre affiché égal à une solution : " + tokens);
                assertEquals(answers.get(0).size(), tokens.size());
            }
        }
    }

    @Test
    void lAssociationNeMontrePasLesPairesEnFace() {
        for (int variant = 0; variant < 200; variant++) {
            List<Pair> pairs = List.of(new Pair("eins", "un"), new Pair("zwei", "deux"));
            QuestionViews.Match match = QuestionViews.match("lecon-" + variant, "q4", pairs);
            assertEquals(List.of("eins", "zwei"), QuestionViews.texts(match.left()), "la colonne de gauche suit le contenu");
            List<String> partners = match.left().stream().map(left -> match.pairs().get(left.id())).toList();
            assertNotEquals(partners, match.right().stream().map(Token::id).toList(),
                    "chaque élément de droite ne doit pas être en face de son partenaire");
            match.left().forEach(token -> assertTrue(token.id().matches("l[0-9a-f]{6}"), token.id()));
            match.right().forEach(token -> assertTrue(token.id().matches("r[0-9a-f]{6}"), token.id()));
        }
        QuestionViews.Match match = QuestionViews.match(LESSON, "q4", MATCH.spec().pairs());
        Map<String, String> texts = new HashMap<>();
        match.left().forEach(left -> texts.put(left.text(), match.right().stream()
                .filter(right -> right.id().equals(match.pairs().get(left.id()))).findFirst().orElseThrow().text()));
        assertEquals(Map.of("warten", "auf + accusatif", "denken", "an + accusatif", "träumen", "von + datif"), texts);
    }

    @Test
    void laCleReprendLesIdentifiantsEtLOrdreDeLaVue() {
        List<View> views = QuestionViews.publicViews(LESSON, ALL);
        List<KeyQuestion> keys = QuestionViews.key(LESSON, ALL);
        assertEquals(views.stream().map(View::id).toList(), keys.stream().map(KeyQuestion::id).toList());

        KeyQuestion choice = keys.get(0);
        assertTrue(choice.options().get(0).correct());
        assertEquals("Denn garde le verbe en deuxième position.", choice.options().get(1).feedback());
        assertEquals(CHOICE.explanation(), choice.explanation());

        KeyQuestion fill = keys.get(1);
        assertEquals(List.of("weil"), fill.blanks().get(0).accept());
        assertEquals("Ich bleibe zu Hause, [[1]] ich krank bin.", fill.text());

        assertEquals(((QuestionViews.OrderView) views.get(2)).tokens(), keys.get(2).tokens());
        assertEquals(ORDER.spec().answers(), keys.get(2).answers());

        QuestionViews.MatchView matchView = (QuestionViews.MatchView) views.get(3);
        assertEquals(matchView.left(), keys.get(3).left());
        assertEquals(matchView.right(), keys.get(3).right());
        assertEquals(3, keys.get(3).pairs().size());

        assertEquals(List.of("Der Zug fährt um zehn Uhr ab."), keys.get(4).accept());
        assertEquals(List.of("Ich habe Kopfschmerzen."), keys.get(5).accept());
        assertEquals(80, keys.get(5).threshold(), "trois mots au plus : seuil 80");

        JsonNode tree = JSON.valueToTree(keys.get(0));
        assertEquals(List.of("id", "type", "prompt", "explanation", "options", "text", "blanks", "tokens", "answers", "left",
                "right", "pairs", "accept", "threshold"), names(tree), "forme de la clé du plan");
    }

    @Test
    void lesVuesTypeesPortentCeQuIlFautPourRepondre() {
        QuestionViews.FillView fill = (QuestionViews.FillView) QuestionViews.publicView(LESSON, FILL);
        assertEquals(List.of(new QuestionViews.BlankView("1", 4, "connecteur")), fill.blanks(), "largeur : réponse la plus longue, 3 au moins");
        QuestionViews.DictationView dictation = (QuestionViews.DictationView) QuestionViews.publicView(LESSON, DICTATION);
        assertEquals(7, dictation.wordCount());
        Question hiddenCount = new Question("q5", "dictation", "Écrivez.", null, null, List.of(),
                new Spec(null, null, null, null, List.of("Guten Morgen."), null, null));
        assertNull(((QuestionViews.DictationView) QuestionViews.publicView(LESSON, hiddenCount)).wordCount());
        QuestionViews.SpeakView speak = (QuestionViews.SpeakView) QuestionViews.publicView(LESSON, SPEAK);
        assertEquals("Ich habe Kopfschmerzen.", speak.text());
        assertEquals(80, speak.threshold());
        Question longer = new Question("q6", "speak", "Répétez.", null, null, List.of(),
                new Spec("Ich habe seit gestern Kopfschmerzen.", null, null, null, List.of(), null, null));
        assertEquals(75, ((QuestionViews.SpeakView) QuestionViews.publicView(LESSON, longer)).threshold(), "au-delà de trois mots : 75");
        assertEquals(List.of("Ich habe seit gestern Kopfschmerzen."), QuestionViews.key(LESSON, List.of(longer)).get(0).accept(),
                "sans réponses acceptées, la phrase affichée fait foi");
        Question custom = new Question("q6", "speak", "Répétez.", null, null, List.of(),
                new Spec("Hallo.", null, null, null, List.of("Hallo."), null, 90));
        assertEquals(90, ((QuestionViews.SpeakView) QuestionViews.publicView(LESSON, custom)).threshold());
    }

    @Test
    void laCleEnregistreeNeGardeQueLesChampsDuTypeEtSeRelit() throws Exception {
        for (Question question : List.of(FILL, ORDER, MATCH, DICTATION, SPEAK)) {
            String stored = QuestionSpecs.write(question.spec());
            assertEquals(question.spec(), QuestionSpecs.read(stored), stored);
            assertFalse(stored.contains("null"), "aucun champ vide enregistré : " + stored);
        }
        assertEquals(List.of("text", "blanks"), names(JSON.readTree(QuestionSpecs.write(FILL.spec()))));
        assertNull(QuestionSpecs.read(null));
        assertEquals(Map.of("1", 1, "2", 2), QuestionSpecs.markers("[[1]] und [[2]], [[2]]"));
    }

    @Test
    void leNombreDeDispositionsDUnMultiensembleEstBorne() {
        assertEquals(3, QuestionSpecs.arrangements(Map.of("a", 2, "b", 1), 100));
        assertEquals(6, QuestionSpecs.arrangements(Map.of("a", 1, "b", 1, "c", 1), 100));
        assertEquals(1, QuestionSpecs.arrangements(Map.of("ja", 2), 100));
        assertEquals(9, QuestionSpecs.arrangements(Map.of("a", 1, "b", 1, "c", 1, "d", 1, "e", 1), 9));
    }

    private static void collectKeys(JsonNode node, List<String> keys) {
        if (node.isObject()) node.fieldNames().forEachRemaining(keys::add);
        node.forEach(child -> collectKeys(child, keys));
    }

    private static List<String> names(JsonNode node) {
        List<String> names = new ArrayList<>();
        node.fieldNames().forEachRemaining(names::add);
        return names;
    }
}
