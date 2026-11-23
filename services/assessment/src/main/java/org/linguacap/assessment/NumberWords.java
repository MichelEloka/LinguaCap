package org.linguacap.assessment;

import java.util.Map;

/**
 * Nombres allemands de 0 à 9 999 en toutes lettres : « 21 » et « einundzwanzig » se valent, comme « 100 »,
 * « hundert » et « einhundert ». La forme canonique omet « ein » devant hundert et tausend et le « und » qui suit.
 * Utilisé par la normalisation des réponses (AnswerRules) : un élève peut écrire un nombre en chiffres ou en lettres.
 */
final class NumberWords {
    static final int MAX = 9999;

    private static final String[] UNITS = {"", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"};
    private static final String[] TEENS = {"zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn",
            "siebzehn", "achtzehn", "neunzehn"};
    private static final String[] TENS = {"", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig",
            "achtzig", "neunzig"};
    /** Préfixes d'unité dans un composé : « ein » (einundzwanzig, einhundert), puis zwei à neun. */
    private static final Map<String, Integer> PREFIXES = Map.of("ein", 1, "zwei", 2, "drei", 3, "vier", 4, "fünf", 5,
            "sechs", 6, "sieben", 7, "acht", 8, "neun", 9);

    private NumberWords() {}

    /** Forme canonique en lettres, en minuscules : 1 → eins, 21 → einundzwanzig, 1 100 → tausendhundert. */
    static String words(int number) {
        if (number < 0 || number > MAX) throw new IllegalArgumentException("Nombre hors limites : " + number);
        if (number == 0) return "null";
        StringBuilder text = new StringBuilder();
        int thousands = number / 1000;
        int hundreds = number / 100 % 10;
        int rest = number % 100;
        if (thousands > 0) text.append(thousands == 1 ? "" : UNITS[thousands]).append("tausend");
        if (hundreds > 0) text.append(hundreds == 1 ? "" : UNITS[hundreds]).append("hundert");
        if (rest > 0) text.append(spellBelowHundred(rest));
        return text.toString();
    }

    /** Valeur d'un mot-nombre en minuscules (« einhundertzwei », « hundertundeins », « null »), ou null. */
    static Integer parse(String word) {
        if (word == null || word.isEmpty() || word.length() > 60) return null;
        if (word.equals("null")) return 0;
        int index = word.indexOf("tausend");
        if (index >= 0) {
            Integer multiplier = multiplier(word.substring(0, index));
            String tail = withoutAnd(word.substring(index + "tausend".length()));
            Integer rest = tail.isEmpty() ? Integer.valueOf(0) : belowThousand(tail);
            return multiplier == null || rest == null ? null : multiplier * 1000 + rest;
        }
        return belowThousand(word);
    }

    private static Integer belowThousand(String word) {
        int index = word.indexOf("hundert");
        if (index >= 0) {
            Integer multiplier = multiplier(word.substring(0, index));
            String tail = withoutAnd(word.substring(index + "hundert".length()));
            Integer rest = tail.isEmpty() ? Integer.valueOf(0) : belowHundred(tail);
            return multiplier == null || rest == null ? null : multiplier * 100 + rest;
        }
        return belowHundred(word);
    }

    private static Integer belowHundred(String word) {
        for (int unit = 1; unit < UNITS.length; unit++) {
            if (UNITS[unit].equals(word)) return unit;
        }
        for (int teen = 0; teen < TEENS.length; teen++) {
            if (TEENS[teen].equals(word)) return 10 + teen;
        }
        for (int ten = 2; ten < TENS.length; ten++) {
            if (TENS[ten].equals(word)) return ten * 10;
        }
        int and = word.indexOf("und");
        if (and <= 0) return null;
        Integer unit = PREFIXES.get(word.substring(0, and));
        String tens = word.substring(and + 3);
        for (int ten = 2; ten < TENS.length; ten++) {
            if (TENS[ten].equals(tens) && unit != null) return ten * 10 + unit;
        }
        return null;
    }

    /** Multiplicateur devant hundert ou tausend : rien ou « ein » valent 1, puis zwei à neun. */
    private static Integer multiplier(String prefix) {
        if (prefix.isEmpty()) return 1;
        Integer value = PREFIXES.get(prefix);
        return value == null ? null : value;
    }

    /** « hundertundeins » s'écrit aussi « hunderteins » : le « und » après hundert ou tausend est facultatif. */
    private static String withoutAnd(String tail) {
        return tail.startsWith("und") && tail.length() > 3 ? tail.substring(3) : tail;
    }

    private static String spellBelowHundred(int number) {
        if (number < 10) return UNITS[number];
        if (number < 20) return TEENS[number - 10];
        int unit = number % 10;
        return unit == 0 ? TENS[number / 10] : (unit == 1 ? "ein" : UNITS[unit]) + "und" + TENS[number / 10];
    }
}
