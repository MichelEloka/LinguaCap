package org.linguacap.assessment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;

class AnswerRulesTest {
    private static final ObjectMapper JSON = new ObjectMapper();

    private static JsonNode json(String text) {
        try {
            return JSON.readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalStateException(error);
        }
    }

    @Test
    void lesNombresSÉcriventEnChiffresOuEnLettres() {
        assertEquals("null", NumberWords.words(0));
        assertEquals("eins", NumberWords.words(1));
        assertEquals("sechzehn", NumberWords.words(16));
        assertEquals("siebzehn", NumberWords.words(17));
        assertEquals("einundzwanzig", NumberWords.words(21));
        assertEquals("dreißig", NumberWords.words(30));
        assertEquals("hunderteins", NumberWords.words(101));
        assertEquals("neunhundertneunundneunzig", NumberWords.words(999));
        assertEquals("tausend", NumberWords.words(1000));
        assertEquals("zweitausendvierundzwanzig", NumberWords.words(2024));
        assertEquals("neuntausendneunhundertneunundneunzig", NumberWords.words(9999));
        assertEquals(100, NumberWords.parse("einhundert"));
        assertEquals(101, NumberWords.parse("hundertundeins"));
        assertEquals(1350, NumberWords.parse("eintausenddreihundertfünfzig"));
        assertEquals(77, NumberWords.parse("siebenundsiebzig"));
        assertNull(NumberWords.parse("ein"), "« ein » est un article, pas un nombre isolé");
        assertNull(NumberWords.parse("stunde"), "« und » au milieu d'un mot n'en fait pas un nombre");
        assertNull(NumberWords.parse("jahrtausend"));
        for (int number = 0; number <= NumberWords.MAX; number++) {
            assertEquals(number, NumberWords.parse(NumberWords.words(number)), "aller-retour " + number);
        }
    }

    @Test
    void laNormalisationIgnoreCasseEspacesPonctuationEtFormeDesNombres() {
        assertEquals("der zug fährt um zehn uhr ab", AnswerRules.normalize("  Der Zug  fährt um 10 Uhr ab. "));
        assertEquals(AnswerRules.normalize("Das kostet 1.000 Euro."), AnswerRules.normalize("Das kostet tausend Euro"));
        assertEquals(AnswerRules.normalize("Ich bin 25 Jahre alt."), AnswerRules.normalize("Ich bin fünfundzwanzig Jahre alt"));
        assertEquals("ich schreibe eine e-mail", AnswerRules.normalize("Ich schreibe eine E-Mail!"), "trait d'union interne gardé");
        assertEquals("er sagt hallo", AnswerRules.normalize("Er sagt: „Hallo!“"), "guillemets et deux-points retirés");
        assertEquals("wie gehts", AnswerRules.normalize("Wie geht’s?"));
        assertEquals("ja nein", AnswerRules.normalize("ja – nein"), "espace insécable et tiret retirés");
        assertEquals(AnswerRules.normalize("100 Meter"), AnswerRules.normalize("einhundert Meter"));
    }

    @Test
    void unMotSeCompareAvecTranslittérationEtFauteDeFrappe() {
        assertEquals(AnswerRules.OK, AnswerRules.compareWord("eins", "ein"), "um 1 Uhr = um ein Uhr");
        assertEquals(AnswerRules.TRANSLIT, AnswerRules.compareWord("straße", "strasse"));
        assertEquals(AnswerRules.TRANSLIT, AnswerRules.compareWord("fährt", "faehrt"));
        assertEquals(AnswerRules.TRANSLIT, AnswerRules.compareWord("müde", "muede"));
        assertEquals(AnswerRules.NEAR, AnswerRules.compareWord("fährt", "fahrt"), "tréma oublié : une faute");
        assertEquals(AnswerRules.NEAR, AnswerRules.compareWord("kopfschmerzen", "kopfschmertzen"));
        assertEquals(AnswerRules.NEAR, AnswerRules.compareWord("bahnhofstraße", "banhofstrase"), "deux fautes à partir de 8 lettres");
        assertEquals(AnswerRules.WRONG, AnswerRules.compareWord("einen", "einem"), "la terminaison de l'article porte le cas");
        assertEquals(AnswerRules.WRONG, AnswerRules.compareWord("der", "den"));
        assertEquals(AnswerRules.WRONG, AnswerRules.compareWord("fünfzehn", "fünfzig"), "un nombre doit être exact");
        assertEquals(AnswerRules.WRONG, AnswerRules.compareWord("sechzehn", "sechszehn"));
    }

    @Test
    void unTrouAccepteSesRéponsesEtSignaleGraphieEtMajuscule() {
        assertTrue(AnswerRules.blank("weil", List.of("weil"), false).correct());
        assertTrue(AnswerRules.blank(" Weil ", List.of("weil"), false).notices().isEmpty(), "majuscule superflue tolérée");
        assertFalse(AnswerRules.blank("denn", List.of("weil"), false).correct());
        assertTrue(AnswerRules.blank("zu dem", List.of("zum", "zu dem"), false).correct());
        assertFalse(AnswerRules.blank("zur", List.of("zum", "zu dem"), false).correct());

        AnswerRules.BlankCheck transliterated = AnswerRules.blank("Hauptstrasse", List.of("Hauptstraße"), false);
        assertTrue(transliterated.correct());
        assertEquals(List.of(AnswerRules.TRANSLITERATION), transliterated.notices());

        AnswerRules.BlankCheck lowercase = AnswerRules.blank("hauptstraße", List.of("Hauptstraße"), false);
        assertTrue(lowercase.correct());
        assertEquals(List.of(AnswerRules.CASE), lowercase.notices());
        assertTrue(AnswerRules.blank("Hauptstraße", List.of("Hauptstraße"), false).notices().isEmpty());
        assertTrue(AnswerRules.blank("ich", List.of("Ich"), true).notices().isEmpty(), "début de phrase : pas un nom");
        assertFalse(AnswerRules.blank("Hauptstrase", List.of("Hauptstraße"), false).correct(), "aucune faute tolérée dans un trou");
        assertTrue(AnswerRules.blank("möchte", List.of("möchte"), false).correct());
        assertEquals(List.of(AnswerRules.TRANSLITERATION), AnswerRules.blank("moechte", List.of("möchte"), false).notices());
        assertTrue(AnswerRules.blank("10", List.of("zehn"), false).correct());
        assertTrue(AnswerRules.startsSentence("[[1]] bin müde.", "1"));
        assertTrue(AnswerRules.startsSentence("Ich bin müde. [[1]] gehe nach Hause.", "1"));
        assertFalse(AnswerRules.startsSentence("Ich gehe [[1]] Arzt.", "1"));
    }

    @Test
    void laRemiseEnOrdreRespecteLaPlaceDuVerbe() {
        List<List<String>> weil = List.of(List.of("Ich bleibe zu Hause,", "weil", "ich", "krank", "bin."));
        assertTrue(AnswerRules.orderMatches(List.of("Ich bleibe zu Hause,", "weil", "ich", "krank", "bin."), weil));
        assertFalse(AnswerRules.orderMatches(List.of("Ich bleibe zu Hause,", "weil", "ich", "bin.", "krank"), weil),
                "après weil, le verbe conjugué va à la fin");
        List<List<String>> deshalb = List.of(List.of("Ich bin krank,", "deshalb", "bleibe", "ich", "zu Hause."),
                List.of("Ich bin krank,", "ich", "bleibe", "deshalb", "zu Hause."));
        assertTrue(AnswerRules.orderMatches(List.of("Ich bin krank,", "ich", "bleibe", "deshalb", "zu Hause."), deshalb),
                "ordre alternatif accepté");
        assertFalse(AnswerRules.orderMatches(List.of("Ich bin krank,", "deshalb", "ich", "bleibe", "zu Hause."), deshalb),
                "après deshalb, le verbe vient en deuxième position");
        List<List<String>> dass = List.of(List.of("Ich glaube,", "dass", "er", "heute", "kommt."));
        assertFalse(AnswerRules.orderMatches(List.of("Ich glaube,", "dass", "er", "kommt", "heute."), dass));
    }

    @Test
    void laDictéeToléreUneFauteParMotEtDonneUnScorePartiel() {
        List<String> accept = List.of("Der Zug fährt um zehn Uhr ab.");
        AnswerRules.TextCheck digits = AnswerRules.dictation("Der Zug fährt um 10 Uhr ab", accept);
        assertTrue(digits.correct());
        assertEquals(100, digits.score());
        assertTrue(digits.notices().isEmpty());

        AnswerRules.TextCheck sloppy = AnswerRules.dictation("der zug faehrt um zehn uhr ab", accept);
        assertTrue(sloppy.correct());
        assertEquals(List.of(AnswerRules.TRANSLITERATION, AnswerRules.CASE), sloppy.notices(),
                "Zug et Uhr sont des noms ; der ouvre la phrase");

        AnswerRules.TextCheck typo = AnswerRules.dictation("Der Zug fahrt um zehn Uhr ab.", accept);
        assertTrue(typo.correct());
        assertEquals(List.of(AnswerRules.TYPO), typo.notices());
        assertEquals(93, typo.score(), "une faute coûte un demi-mot sur sept");
        assertEquals(AnswerRules.NEAR, typo.words().get(2).status());

        AnswerRules.TextCheck missing = AnswerRules.dictation("Der Zug fährt um zehn ab.", accept);
        assertFalse(missing.correct());
        assertEquals(86, missing.score());
        assertEquals(new AnswerRules.WordCheck("Uhr", null, AnswerRules.MISSING), missing.words().get(5));

        AnswerRules.TextCheck extra = AnswerRules.dictation("Der Zug fährt heute um zehn Uhr ab.", accept);
        assertFalse(extra.correct());
        assertTrue(extra.words().contains(new AnswerRules.WordCheck(null, "heute", AnswerRules.EXTRA)));

        AnswerRules.TextCheck article = AnswerRules.dictation("Ich sehe einem Mann.", List.of("Ich sehe einen Mann."));
        assertFalse(article.correct(), "einem au lieu de einen : faute de cas, pas de frappe");
        assertEquals(AnswerRules.WRONG, article.words().get(2).status());

        assertEquals(0, AnswerRules.dictation("", accept).score());
    }

    @Test
    void laRépétitionEstRescoréeÀPartirDuTexteReconnu() {
        List<String> accept = List.of("Ich habe Kopfschmerzen.");
        assertEquals(100, AnswerRules.speak(List.of("ich habe Kopfschmerzen"), accept).score());
        AnswerRules.SpeakCheck best = AnswerRules.speak(List.of("ich hab Kopf", "ich habe Kopfschmerzen"), accept);
        assertEquals(100, best.score());
        assertEquals("ich habe Kopfschmerzen", best.transcript(), "meilleure transcription retenue");
        assertEquals(50, AnswerRules.speak(List.of("ich habe Kopf schmerzen"), accept).score());
        assertEquals(100, AnswerRules.speak(List.of("ich bin 25 Jahre alt"), List.of("Ich bin fünfundzwanzig Jahre alt.")).score());
        assertEquals(93, AnswerRules.speak(List.of("ich möchte einen Termin am Montag macken"),
                List.of("Ich möchte einen Termin am Montag machen.")).score(), "une faute : un demi-mot sur sept");
        assertEquals(0, AnswerRules.speak(List.of(""), accept).score());

        assertEquals(80, AnswerRules.threshold(json("{'text':'Ich habe Kopfschmerzen.'}")), "80 jusqu'à 3 mots");
        assertEquals(75, AnswerRules.threshold(json("{'text':'Ich möchte einen Termin machen.'}")), "75 au-delà");
        assertEquals(60, AnswerRules.threshold(json("{'text':'Guten Tag.','threshold':60}")));
        assertEquals(80, AnswerRules.threshold(json("{'text':'Guten Tag.','threshold':20}")), "seuil hors bornes ignoré");
    }
}
