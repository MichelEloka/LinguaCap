package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.linguacap.common.HttpError;

/**
 * Correction des questions typées (V4) : choix, texte à trous, remise en ordre, association, dictée et répétition
 * orale. Les réponses sont comparées après normalisation (NFC, casse, ponctuation, espaces, nombres en lettres) ;
 * les translittérations ae/oe/ue/ss sont acceptées avec la remarque « graphie à retenir », un nom écrit sans majuscule
 * avec la remarque « majuscule du nom », une faute de frappe dans une dictée avec la remarque « faute de frappe ».
 * La clé de correction vient du catalogue (route interne exercise-key) ; rien ici n'est servi avant la remise.
 */
final class AnswerRules {
    static final String CHOICE = "choice";
    static final String FILL = "fill";
    static final String ORDER = "order";
    static final String MATCH = "match";
    static final String DICTATION = "dictation";
    static final String SPEAK = "speak";
    static final Set<String> TYPES = Set.of(CHOICE, FILL, ORDER, MATCH, DICTATION, SPEAK);

    /** État d'un mot aligné (dictée, répétition). */
    static final String OK = "ok";
    static final String NEAR = "near";
    static final String TRANSLIT = "translit";
    static final String MISSING = "missing";
    static final String WRONG = "wrong";
    static final String EXTRA = "extra";

    /** Remarques d'une réponse acceptée. */
    static final String TRANSLITERATION = "transliteration";
    static final String CASE = "case";
    static final String TYPO = "typo";

    /** État d'une question corrigée. */
    static final String CORRECT = "correct";
    static final String INCORRECT = "incorrect";
    static final String PENDING = "pending";
    static final String FLAGGED = "flagged";

    static final int MAX_TEXT = 500;
    static final int MAX_BLANK = 80;
    static final int MAX_TOKENS = 16;
    static final int MAX_PAIRS = 8;
    static final int MAX_TRANSCRIPT = 300;
    /** Échecs de répétition après lesquels l'élève peut passer à la suite (la question est alors « à revoir »). */
    static final int SKIP_AFTER = 3;

    private static final JsonNodeFactory JSON = JsonNodeFactory.instance;
    private static final String QUOTES = "\"„“”«»‹›‚‘’'`´";
    private static final String PUNCTUATION = ".,;:!?¿¡()[]…–—/";
    private static final String SENTENCE_END = ".!?…:";
    /** Séparateur des milliers : « 1.000 » vaut 1000. */
    private static final Pattern THOUSANDS = Pattern.compile("(?<![\\d.])(\\d{1,3})\\.(\\d{3})(?![\\d.])");
    private static final Pattern UUID_TEXT = Pattern.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
    /** « 1 » s'écrit « eins » mais se lit aussi « ein Uhr », « einen Bruder ». */
    private static final Set<String> ONE_FORMS = Set.of("ein", "eine", "einen", "einem", "einer", "eines");
    /** Déterminants dont la terminaison porte le cas et le genre : jamais tolérés comme faute de frappe. */
    private static final Set<String> INFLECTED = inflected();
    private static final List<String> NOTICE_ORDER = List.of(TRANSLITERATION, CASE, TYPO);

    private AnswerRules() {}

    /** Mot d'une réponse : forme saisie, forme normalisée, début de phrase (la majuscule n'y signale pas un nom). */
    record Token(String original, String norm, boolean sentenceStart) {}

    record Pair(Token expected, Token given, String status) {}

    /** Alignement mot à mot : coût (mot faux, manquant ou en trop : 1 ; faute de frappe : 0,5) et paires alignées. */
    record Alignment(double cost, List<Pair> pairs, int expectedCount, int givenCount) {
        int score() {
            int size = Math.max(expectedCount, givenCount);
            return size == 0 ? 100 : (int) Math.max(0, Math.round(100 * (1 - cost / size)));
        }

        boolean complete() {
            return pairs.stream().noneMatch(pair -> MISSING.equals(pair.status()) || WRONG.equals(pair.status())
                    || EXTRA.equals(pair.status()));
        }
    }

    record WordCheck(String expected, String given, String status) {}

    /** Dictée corrigée : juste sans mot faux, manquant ou en trop ; score partiel de 0 à 100. */
    record TextCheck(boolean correct, int score, List<WordCheck> words, List<String> notices) {}

    record BlankCheck(boolean correct, List<String> notices) {}

    /** Meilleur score d'une répétition et texte reconnu qui l'a obtenu. */
    record SpeakCheck(int score, String transcript) {}

    /** Essai de répétition retenu pour une question speak, avec le compte des essais de la manche. */
    record SpeechOutcome(UUID id, String questionId, String mode, boolean passed, String reviewStatus, Integer score,
                         String transcript, int attempts, int failures, String comment) {}

    // ---------------------------------------------------------------- normalisation

    /** Mots normalisés de la réponse, séparés par une espace. */
    static String normalize(String text) {
        StringBuilder normalized = new StringBuilder();
        for (Token token : tokens(text)) {
            if (!normalized.isEmpty()) normalized.append(' ');
            normalized.append(token.norm());
        }
        return normalized.toString();
    }

    /**
     * Découpe en mots : NFC, espaces insécables remplacées, guillemets supprimés, ponctuation retirée (les traits
     * d'union internes sont gardés), minuscules allemandes, nombres de 0 à 9 999 écrits en lettres.
     */
    static List<Token> tokens(String text) {
        List<Token> tokens = new ArrayList<>();
        if (text == null || text.isEmpty()) return tokens;
        String nfc = Normalizer.normalize(text, Normalizer.Form.NFC);
        StringBuilder cleaned = new StringBuilder(nfc.length());
        for (int index = 0; index < nfc.length(); index++) {
            char character = nfc.charAt(index);
            if (Character.isWhitespace(character) || Character.isSpaceChar(character)) {
                cleaned.append(' ');
            } else if (QUOTES.indexOf(character) < 0) {
                cleaned.append(character);
            }
        }
        String value = THOUSANDS.matcher(cleaned).replaceAll("$1$2");
        boolean start = true;
        StringBuilder word = new StringBuilder();
        for (int index = 0; index <= value.length(); index++) {
            char character = index < value.length() ? value.charAt(index) : ' ';
            if (character != ' ' && PUNCTUATION.indexOf(character) < 0) {
                word.append(character);
                continue;
            }
            if (add(tokens, word, start)) start = false;
            word.setLength(0);
            if (SENTENCE_END.indexOf(character) >= 0) start = true;
        }
        return tokens;
    }

    /** ä → ae, ö → oe, ü → ue, ß → ss. */
    static String transliterate(String norm) {
        return norm.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss");
    }

    /**
     * Compare deux mots normalisés : ok, translit (graphie ae/oe/ue/ss), near (une faute de frappe, deux à partir de
     * 8 lettres) ou wrong. Les mots courts, les déterminants et les nombres doivent être exacts.
     */
    static String compareWord(String expected, String given) {
        if (expected.equals(given)) return OK;
        if (expected.equals("eins") && ONE_FORMS.contains(given) || given.equals("eins") && ONE_FORMS.contains(expected)) {
            return OK;
        }
        String expectedLetters = transliterate(expected);
        String givenLetters = transliterate(given);
        if (expectedLetters.equals(givenLetters)) return TRANSLIT;
        if (expected.length() < 4 || INFLECTED.contains(expected) || NumberWords.parse(expected) != null
                || NumberWords.parse(given) != null) {
            return WRONG;
        }
        int allowed = expected.length() >= 8 ? 2 : 1;
        return distance(expectedLetters, givenLetters) <= allowed ? NEAR : WRONG;
    }

    /** Alignement mot à mot (distance d'édition sur les mots). */
    static Alignment align(List<Token> expected, List<Token> given) {
        int rows = expected.size();
        int columns = given.size();
        String[][] status = new String[rows][columns];
        double[][] cost = new double[rows + 1][columns + 1];
        for (int row = 0; row <= rows; row++) cost[row][0] = row;
        for (int column = 0; column <= columns; column++) cost[0][column] = column;
        for (int row = 1; row <= rows; row++) {
            for (int column = 1; column <= columns; column++) {
                status[row - 1][column - 1] = compareWord(expected.get(row - 1).norm(), given.get(column - 1).norm());
                double substitution = cost[row - 1][column - 1] + weight(status[row - 1][column - 1]);
                cost[row][column] = Math.min(substitution, Math.min(cost[row - 1][column] + 1, cost[row][column - 1] + 1));
            }
        }
        LinkedList<Pair> pairs = new LinkedList<>();
        int row = rows;
        int column = columns;
        while (row > 0 || column > 0) {
            if (row > 0 && column > 0
                    && cost[row][column] == cost[row - 1][column - 1] + weight(status[row - 1][column - 1])) {
                pairs.addFirst(new Pair(expected.get(row - 1), given.get(column - 1), status[row - 1][column - 1]));
                row--;
                column--;
            } else if (row > 0 && cost[row][column] == cost[row - 1][column] + 1) {
                pairs.addFirst(new Pair(expected.get(row - 1), null, MISSING));
                row--;
            } else {
                pairs.addFirst(new Pair(null, given.get(column - 1), EXTRA));
                column--;
            }
        }
        return new Alignment(cost[rows][columns], List.copyOf(pairs), rows, columns);
    }

    // ---------------------------------------------------------------- règles par type

    /** Trou : la réponse doit figurer parmi les réponses acceptées (normalisées), sans tolérance de frappe. */
    static BlankCheck blank(String given, List<String> accepts, boolean sentenceStart) {
        List<Token> givenTokens = tokens(given);
        BlankCheck accepted = null;
        for (String accept : accepts) {
            List<Token> expected = new ArrayList<>(tokens(accept));
            if (expected.isEmpty() || expected.size() != givenTokens.size()) continue;
            Token first = expected.get(0);
            expected.set(0, new Token(first.original(), first.norm(), sentenceStart));
            List<Pair> pairs = new ArrayList<>();
            boolean matches = true;
            for (int index = 0; index < expected.size() && matches; index++) {
                String status = compareWord(expected.get(index).norm(), givenTokens.get(index).norm());
                matches = OK.equals(status) || TRANSLIT.equals(status);
                pairs.add(new Pair(expected.get(index), givenTokens.get(index), status));
            }
            if (!matches) continue;
            List<String> notices = notices(pairs);
            if (notices.isEmpty()) return new BlankCheck(true, List.of());
            if (accepted == null) accepted = new BlankCheck(true, notices);
        }
        return accepted == null ? new BlankCheck(false, List.of()) : accepted;
    }

    /** Remise en ordre : les mots choisis, mis bout à bout et normalisés, doivent former l'une des solutions. */
    static boolean orderMatches(List<String> givenTexts, List<List<String>> answers) {
        String given = normalize(String.join(" ", givenTexts));
        for (List<String> answer : answers) {
            if (normalize(String.join(" ", answer)).equals(given)) return true;
        }
        return false;
    }

    /** Dictée : meilleur alignement sur les réponses acceptées. */
    static TextCheck dictation(String given, List<String> accepts) {
        List<Token> givenTokens = tokens(given);
        Alignment best = null;
        for (String accept : accepts) {
            Alignment alignment = align(tokens(accept), givenTokens);
            if (best == null || alignment.cost() < best.cost()) best = alignment;
        }
        if (best == null) return new TextCheck(false, 0, List.of(), List.of());
        List<WordCheck> words = new ArrayList<>();
        for (Pair pair : best.pairs()) {
            words.add(new WordCheck(pair.expected() == null ? null : pair.expected().original(),
                    pair.given() == null ? null : pair.given().original(), pair.status()));
        }
        return new TextCheck(best.complete(), best.score(), words, notices(best.pairs()));
    }

    /** Répétition : 100 × (1 − coût / max(mots attendus, mots reconnus)), meilleur score sur transcriptions × réponses. */
    static SpeakCheck speak(List<String> transcripts, List<String> accepts) {
        int best = -1;
        String transcript = transcripts.isEmpty() ? "" : transcripts.get(0);
        for (String candidate : transcripts) {
            List<Token> given = tokens(candidate);
            for (String accept : accepts) {
                int score = align(tokens(accept), given).score();
                if (score > best) {
                    best = score;
                    transcript = candidate;
                }
            }
        }
        return new SpeakCheck(Math.max(best, 0), transcript == null ? "" : transcript);
    }

    /** Seuil de réussite d'une répétition : celui de la question (50 à 100), sinon 80 jusqu'à 3 mots et 75 au-delà. */
    static int threshold(JsonNode question) {
        JsonNode value = question.path("threshold");
        if (value.isInt() && value.asInt() >= 50 && value.asInt() <= 100) return value.asInt();
        return tokens(speakText(question)).size() <= 3 ? 80 : 75;
    }

    /** Phrase à répéter : le texte de la question, sinon sa première réponse acceptée. */
    static String speakText(JsonNode question) {
        String text = question.path("text").asText("");
        if (!text.isBlank()) return text;
        return question.path("accept").path(0).asText("");
    }

    static List<String> speakAccepts(JsonNode question) {
        List<String> accepts = strings(question.path("accept"));
        if (accepts.isEmpty() && !speakText(question).isBlank()) accepts = List.of(speakText(question));
        return accepts;
    }

    static String type(JsonNode question) {
        String type = question.path("type").asText("");
        return type.isEmpty() || question.path("type").isNull() ? CHOICE : type;
    }

    // ---------------------------------------------------------------- correction d'une question

    /**
     * Forme de la réponse, contrôlée avant tout appel au catalogue : un objet portant le champ de son type, dans les
     * limites de taille. Une chaîne seule vaut un choix (ancien état sauvegardé {q1: 'b'}).
     */
    static void checkShape(String questionId, JsonNode answer) {
        if (answer == null || answer.isNull()) throw HttpError.badRequest("Répondez à toutes les questions avant de valider.");
        if (answer.isTextual()) {
            if (answer.asText().length() > 80) throw invalid();
            return;
        }
        if (!answer.isObject() || answer.size() != 1) throw invalid();
        String field = answer.fieldNames().next();
        JsonNode value = answer.get(field);
        switch (field) {
            case "choice" -> {
                if (!value.isTextual() || value.asText().isEmpty() || value.asText().length() > 80) throw invalid();
            }
            case "blanks" -> {
                if (!value.isObject() || value.size() > 20) throw invalid();
                value.properties().forEach(entry -> {
                    if (entry.getKey().length() > 40 || !entry.getValue().isTextual()) throw invalid();
                    if (entry.getValue().asText().length() > MAX_BLANK) {
                        throw HttpError.badRequest("Un trou se complète en " + MAX_BLANK + " caractères au plus.");
                    }
                });
            }
            case "order" -> {
                if (!value.isArray() || value.size() > MAX_TOKENS) throw invalid();
                for (JsonNode token : value) {
                    if (!token.isTextual() || token.asText().length() > 40) throw invalid();
                }
            }
            case "pairs" -> {
                if (!value.isObject() || value.size() > MAX_PAIRS) throw invalid();
                value.properties().forEach(entry -> {
                    if (entry.getKey().length() > 40 || !entry.getValue().isTextual() || entry.getValue().asText().length() > 40) {
                        throw invalid();
                    }
                });
            }
            case "text" -> {
                if (!value.isTextual()) throw invalid();
                if (value.asText().length() > MAX_TEXT) {
                    throw HttpError.badRequest("Une réponse écrite compte " + MAX_TEXT + " caractères au plus.");
                }
            }
            case "speechAttemptId" -> {
                if (!value.isTextual() || !UUID_TEXT.matcher(value.asText()).matches()) throw invalid();
            }
            default -> throw invalid();
        }
    }

    /**
     * Correction d'une question : état (correct, incorrect, pending, flagged), réponse donnée et attendue lisibles,
     * explication, retour du choix, remarques et détail par type. Une réponse qui ne correspond pas à la question
     * est refusée (400) ; une répétition qui ne permet pas encore de passer bloque la remise (409).
     */
    static ObjectNode review(JsonNode question, JsonNode answer, Map<UUID, SpeechOutcome> speech) {
        String id = question.path("id").asText();
        String type = type(question);
        if (!TYPES.contains(type)) throw HttpError.unavailable("La correction de cet exercice est indisponible.");
        ObjectNode review = JSON.objectNode();
        review.put("id", id).put("type", type).put("prompt", question.path("prompt").asText(""));
        ObjectNode given = JSON.objectNode();
        ObjectNode expected = JSON.objectNode();
        JsonNode detail = NullNode.getInstance();
        String status;
        String feedback = null;
        List<String> notices = List.of();
        switch (type) {
            case CHOICE -> {
                String chosen = answer.isTextual() ? answer.asText() : field(answer, "choice").asText();
                JsonNode option = byId(question.path("options"), chosen);
                if (option == null) throw invalid();
                JsonNode right = null;
                for (JsonNode candidate : question.path("options")) {
                    if (candidate.path("correct").asBoolean(false)) {
                        right = candidate;
                        break;
                    }
                }
                status = option.path("correct").asBoolean(false) ? CORRECT : INCORRECT;
                given.put("choice", chosen).put("label", option.path("label").asText(""));
                expected.put("optionId", right == null ? null : right.path("id").asText())
                        .put("label", right == null ? null : right.path("label").asText(""));
                feedback = text(option.path("feedback"));
            }
            case FILL -> {
                JsonNode blanks = field(answer, "blanks");
                Set<String> known = new HashSet<>();
                ObjectNode givenBlanks = given.putObject("blanks");
                ObjectNode expectedBlanks = expected.putObject("blanks");
                ObjectNode detailBlanks = JSON.objectNode();
                boolean all = true;
                List<String> collected = new ArrayList<>();
                String sentence = question.path("text").asText("");
                for (JsonNode blank : question.path("blanks")) {
                    String blankId = blank.path("id").asText();
                    known.add(blankId);
                    List<String> accepts = strings(blank.path("accept"));
                    String value = blanks.path(blankId).asText("");
                    BlankCheck check = blank(value, accepts, startsSentence(sentence, blankId));
                    givenBlanks.put(blankId, value);
                    ArrayNode acceptNode = expectedBlanks.putArray(blankId);
                    accepts.forEach(acceptNode::add);
                    ObjectNode blankDetail = detailBlanks.putObject(blankId).put("correct", check.correct());
                    ArrayNode blankNotices = blankDetail.putArray("notices");
                    check.notices().forEach(blankNotices::add);
                    all &= check.correct();
                    collected.addAll(check.notices());
                }
                blanks.fieldNames().forEachRemaining(name -> {
                    if (!known.contains(name)) throw invalid();
                });
                expected.put("text", sentence);
                status = all ? CORRECT : INCORRECT;
                notices = ordered(collected);
                ObjectNode fillDetail = JSON.objectNode();
                fillDetail.set("blanks", detailBlanks);
                detail = fillDetail;
            }
            case ORDER -> {
                JsonNode order = field(answer, "order");
                Map<String, String> texts = new LinkedHashMap<>();
                for (JsonNode token : question.path("tokens")) texts.put(token.path("id").asText(), token.path("text").asText(""));
                List<String> chosen = new ArrayList<>();
                Set<String> seen = new HashSet<>();
                ArrayNode ids = given.putArray("order");
                for (JsonNode token : order) {
                    String tokenId = token.asText();
                    if (!texts.containsKey(tokenId) || !seen.add(tokenId)) throw invalid();
                    chosen.add(texts.get(tokenId));
                    ids.add(tokenId);
                }
                given.put("sentence", String.join(" ", chosen));
                List<List<String>> answers = new ArrayList<>();
                for (JsonNode solution : question.path("answers")) answers.add(strings(solution));
                status = !answers.isEmpty() && orderMatches(chosen, answers) ? CORRECT : INCORRECT;
                expected.put("sentence", answers.isEmpty() ? "" : String.join(" ", answers.get(0)));
                ArrayNode alternatives = expected.putArray("alternatives");
                for (int index = 1; index < answers.size(); index++) alternatives.add(String.join(" ", answers.get(index)));
            }
            case MATCH -> {
                JsonNode pairs = field(answer, "pairs");
                Map<String, String> left = labels(question.path("left"));
                Map<String, String> right = labels(question.path("right"));
                pairs.properties().forEach(entry -> {
                    if (!left.containsKey(entry.getKey()) || !right.containsKey(entry.getValue().asText())) throw invalid();
                });
                ObjectNode givenPairs = given.putObject("pairs");
                ObjectNode expectedPairs = expected.putObject("pairs");
                ObjectNode detailPairs = JSON.objectNode();
                boolean all = !left.isEmpty();
                for (String leftId : left.keySet()) {
                    String wanted = question.path("pairs").path(leftId).asText(null);
                    String chosen = pairs.path(leftId).asText(null);
                    boolean matched = wanted != null && chosen != null && (wanted.equals(chosen)
                            || normalize(right.get(chosen)).equals(normalize(right.getOrDefault(wanted, ""))));
                    if (chosen != null) givenPairs.put(leftId, chosen);
                    expectedPairs.put(leftId, wanted);
                    detailPairs.put(leftId, matched);
                    all &= matched;
                }
                ObjectNode allLabels = expected.putObject("labels");
                left.forEach(allLabels::put);
                right.forEach(allLabels::put);
                status = all ? CORRECT : INCORRECT;
                ObjectNode matchDetail = JSON.objectNode();
                matchDetail.set("pairs", detailPairs);
                detail = matchDetail;
            }
            case DICTATION -> {
                String text = field(answer, "text").asText();
                List<String> accepts = strings(question.path("accept"));
                TextCheck check = dictation(text, accepts);
                given.put("text", text);
                expected.put("text", accepts.isEmpty() ? "" : accepts.get(0));
                status = check.correct() ? CORRECT : INCORRECT;
                notices = check.notices();
                ObjectNode dictationDetail = JSON.objectNode().put("score", check.score());
                ArrayNode words = dictationDetail.putArray("words");
                for (WordCheck word : check.words()) {
                    words.addObject().put("expected", word.expected()).put("given", word.given()).put("status", word.status());
                }
                detail = dictationDetail;
            }
            case SPEAK -> {
                UUID attemptId = UUID.fromString(field(answer, "speechAttemptId").asText());
                SpeechOutcome outcome = speech.get(attemptId);
                if (outcome == null || !id.equals(outcome.questionId())) {
                    throw HttpError.badRequest("Cette répétition ne correspond pas à la question.");
                }
                status = speakStatus(outcome, speakText(question));
                given.put("speechAttemptId", attemptId.toString()).put("transcript", outcome.transcript());
                expected.put("text", speakText(question));
                ObjectNode speakDetail = JSON.objectNode();
                if (outcome.score() == null) speakDetail.putNull("score");
                else speakDetail.put("score", outcome.score());
                speakDetail.put("transcript", outcome.transcript()).put("attempts", outcome.attempts())
                        .put("mode", outcome.mode()).put("reviewStatus", outcome.reviewStatus());
                detail = speakDetail;
            }
            default -> throw HttpError.unavailable("La correction de cet exercice est indisponible.");
        }
        review.put("status", status);
        review.set("given", given);
        review.set("expected", expected);
        review.put("explanation", text(question.path("explanation")));
        review.put("feedback", feedback);
        ArrayNode noticeNode = review.putArray("notices");
        notices.forEach(noticeNode::add);
        review.set("detail", detail);
        return review;
    }

    /**
     * Essai retenu pour une question speak : réussi → correct ; enregistrement en attente → pending ; validé → correct ;
     * refusé ou trois échecs → flagged (« à revoir ») ; sinon la remise attend d'autres essais (409).
     */
    static String speakStatus(SpeechOutcome outcome, String text) {
        if ("recording".equals(outcome.mode())) {
            return switch (outcome.reviewStatus()) {
                case "pending" -> PENDING;
                case "validated" -> CORRECT;
                case "rejected" -> FLAGGED;
                default -> throw HttpError.conflict("Votre enregistrement n’est pas encore envoyé : terminez l’envoi avant de valider.");
            };
        }
        if (outcome.passed()) return CORRECT;
        if (outcome.failures() >= SKIP_AFTER) return FLAGGED;
        throw HttpError.conflict("Répétez encore « " + text + " » : vous pourrez passer à la suite après "
                + SKIP_AFTER + " essais.");
    }

    // ---------------------------------------------------------------- outils

    /** Le trou ouvre-t-il une phrase (sa majuscule n'y signale alors pas un nom) ? */
    static boolean startsSentence(String text, String blankId) {
        int index = text.indexOf("[[" + blankId + "]]");
        if (index < 0) return true;
        String before = text.substring(0, index).strip();
        while (!before.isEmpty() && QUOTES.indexOf(before.charAt(before.length() - 1)) >= 0) {
            before = before.substring(0, before.length() - 1).strip();
        }
        return before.isEmpty() || SENTENCE_END.indexOf(before.charAt(before.length() - 1)) >= 0;
    }

    static List<String> strings(JsonNode array) {
        List<String> values = new ArrayList<>();
        if (array != null && array.isArray()) {
            for (JsonNode value : array) {
                if (value.isTextual()) values.add(value.asText());
            }
        }
        return values;
    }

    static List<String> notices(List<Pair> pairs) {
        List<String> notices = new ArrayList<>();
        for (Pair pair : pairs) {
            if (NEAR.equals(pair.status())) notices.add(TYPO);
            if (TRANSLIT.equals(pair.status())) notices.add(TRANSLITERATION);
            if (pair.expected() != null && pair.given() != null && !WRONG.equals(pair.status())
                    && lowercaseNoun(pair.expected(), pair.given())) {
                notices.add(CASE);
            }
        }
        return ordered(notices);
    }

    private static List<String> ordered(List<String> notices) {
        return NOTICE_ORDER.stream().filter(notices::contains).toList();
    }

    /** Un nom (majuscule hors début de phrase) écrit en minuscule. */
    private static boolean lowercaseNoun(Token expected, Token given) {
        return !expected.sentenceStart() && Character.isUpperCase(expected.original().codePointAt(0))
                && Character.isLowerCase(given.original().codePointAt(0));
    }

    private static boolean add(List<Token> tokens, StringBuilder word, boolean start) {
        int from = 0;
        int to = word.length();
        while (from < to && word.charAt(from) == '-') from++;
        while (to > from && word.charAt(to - 1) == '-') to--;
        if (from == to) return false;
        String original = word.substring(from, to);
        tokens.add(new Token(original, canonical(original.toLowerCase(Locale.GERMAN)), start));
        return true;
    }

    /** Nombre en chiffres (0 à 9 999) ou en lettres → forme canonique en lettres. */
    private static String canonical(String lower) {
        if (!lower.isEmpty() && lower.length() <= 4 && lower.chars().allMatch(character -> character >= '0' && character <= '9')) {
            return NumberWords.words(Integer.parseInt(lower));
        }
        Integer value = NumberWords.parse(lower);
        return value == null ? lower : NumberWords.words(value);
    }

    private static double weight(String status) {
        return switch (status) {
            case OK, TRANSLIT -> 0;
            case NEAR -> 0.5;
            default -> 1;
        };
    }

    private static int distance(String first, String second) {
        int[] previous = new int[second.length() + 1];
        int[] current = new int[second.length() + 1];
        for (int column = 0; column <= second.length(); column++) previous[column] = column;
        for (int row = 1; row <= first.length(); row++) {
            current[0] = row;
            for (int column = 1; column <= second.length(); column++) {
                int substitution = previous[column - 1] + (first.charAt(row - 1) == second.charAt(column - 1) ? 0 : 1);
                current[column] = Math.min(substitution, Math.min(previous[column] + 1, current[column - 1] + 1));
            }
            int[] swap = previous;
            previous = current;
            current = swap;
        }
        return previous[second.length()];
    }

    private static Set<String> inflected() {
        Set<String> forms = new HashSet<>(Set.of("der", "die", "das", "den", "dem", "des"));
        for (String stem : List.of("ein", "kein", "mein", "dein", "sein", "ihr", "unser", "euer", "eur", "dies", "jed",
                "jen", "welch", "manch", "solch", "all")) {
            for (String ending : List.of("", "e", "en", "em", "er", "es")) forms.add(stem + ending);
        }
        return Set.copyOf(forms);
    }

    private static JsonNode field(JsonNode answer, String name) {
        JsonNode value = answer == null ? null : answer.get(name);
        if (value == null || value.isNull()) throw invalid();
        return value;
    }

    private static JsonNode byId(JsonNode items, String id) {
        for (JsonNode item : items) {
            if (item.path("id").asText().equals(id)) return item;
        }
        return null;
    }

    private static Map<String, String> labels(JsonNode items) {
        Map<String, String> labels = new LinkedHashMap<>();
        for (JsonNode item : items) labels.put(item.path("id").asText(), item.path("text").asText(""));
        return labels;
    }

    private static String text(JsonNode value) {
        return value == null || value.isNull() || value.isMissingNode() || value.asText().isBlank() ? null : value.asText();
    }

    private static RuntimeException invalid() {
        return HttpError.badRequest("Une réponse ne correspond pas à cet exercice.");
    }

    /** Index des questions d'une clé par identifiant. */
    static Map<String, JsonNode> questions(JsonNode key) {
        Map<String, JsonNode> questions = new HashMap<>();
        for (JsonNode question : key.path("questions")) questions.put(question.path("id").asText(), question);
        return questions;
    }
}
