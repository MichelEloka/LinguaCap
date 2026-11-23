package org.linguacap.catalogue;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.linguacap.catalogue.QuestionSpecs.Blank;
import org.linguacap.catalogue.QuestionSpecs.Pair;
import org.linguacap.catalogue.QuestionSpecs.Spec;
import org.linguacap.catalogue.VersionDocument.Option;
import org.linguacap.catalogue.VersionDocument.Question;

/**
 * Vues d'une question : vue publique servie à l'élève (jamais de corrigé : ni correct, accept, answers, pairs,
 * explanation, feedback ni spec) et clé de correction servie à Évaluations seulement.
 * Les jetons d'une remise en ordre et les éléments d'une association portent des identifiants opaques, calculés par
 * hachage ; l'ordre affiché est déterministe et n'est jamais une solution.
 */
final class QuestionViews {
    private QuestionViews() {}

    /** Vue publique d'une question : la forme dépend du type. */
    public sealed interface View permits ChoiceView, FillView, OrderView, MatchView, DictationView, SpeakView {
        String id();

        String type();
    }

    /** Choix : la clé « text » des options est conservée (forme historique de la vue élève). */
    public record ChoiceView(String id, String type, String prompt, List<OptionView> options) implements View {}

    public record OptionView(String id, String text) {}

    /** Texte à trous : repères [[id]] dans le texte, un champ par trou. */
    public record FillView(String id, String type, String prompt, String text, List<BlankView> blanks) implements View {}

    public record BlankView(String id, int size, String hint) {}

    public record OrderView(String id, String type, String prompt, List<Token> tokens) implements View {}

    /** Jeton (remise en ordre) ou élément (association) : identifiant opaque et texte affiché. */
    public record Token(String id, String text) {}

    public record MatchView(String id, String type, String prompt, List<Token> left, List<Token> right) implements View {}

    /** Dictée : nombre de mots indiqué si l'auteur l'a choisi (showWordCount), sinon null. */
    public record DictationView(String id, String type, String prompt, Integer wordCount) implements View {}

    public record SpeakView(String id, String type, String prompt, String text, int threshold) implements View {}

    /** Clé de correction d'une question (route interne exercise-key) : les champs hors du type restent null. */
    public record KeyQuestion(String id, String type, String prompt, String explanation, List<KeyOption> options,
                              String text, List<KeyBlank> blanks, List<Token> tokens, List<List<String>> answers,
                              List<Token> left, List<Token> right, Map<String, String> pairs, List<String> accept,
                              Integer threshold) {}

    public record KeyOption(String id, String label, boolean correct, String feedback) {}

    public record KeyBlank(String id, List<String> accept, int size, String hint) {}

    /**
     * Questions d'une leçon telles qu'enregistrées (type, clé, explication, options avec corrigé et retour).
     * Usage interne au catalogue : seules {@link #publicViews} et {@link #key} en sortent.
     */
    static List<Question> read(Connection connection, String lessonId) throws SQLException {
        Map<String, Question> questions = new LinkedHashMap<>();
        try (var query = connection.prepareStatement("""
                select q.id, q.type, q.prompt, q.module_ref, q.explanation, q.spec::text as spec,
                       o.id as option_id, o.label, o.correct, o.feedback
                from catalogue.questions q
                left join catalogue.options o on o.lesson_id = q.lesson_id and o.question_id = q.id
                where q.lesson_id = ?
                order by q.position, o.position
                """)) {
            query.setString(1, lessonId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    String id = rows.getString("id");
                    Question question = questions.get(id);
                    if (question == null) {
                        question = new Question(id, rows.getString("type"), rows.getString("prompt"),
                                rows.getString("module_ref"), rows.getString("explanation"), new ArrayList<>(),
                                QuestionSpecs.read(rows.getString("spec")));
                        questions.put(id, question);
                    }
                    if (rows.getString("option_id") != null) {
                        question.options().add(new Option(rows.getString("option_id"), rows.getString("label"),
                                rows.getBoolean("correct"), rows.getString("feedback")));
                    }
                }
            }
        }
        return List.copyOf(questions.values());
    }

    /**
     * Vues publiques, dans l'ordre des questions. Une question à choix sans option n'est pas servie (comportement
     * historique de la vue élève, qui joignait les options).
     */
    static List<View> publicViews(String lessonId, List<Question> questions) {
        List<View> views = new ArrayList<>();
        for (Question question : questions) {
            View view = publicView(lessonId, question);
            if (view != null) views.add(view);
        }
        return List.copyOf(views);
    }

    static View publicView(String lessonId, Question question) {
        String type = QuestionSpecs.typeOf(question);
        String prompt = VersionDocument.text(question.prompt());
        Spec spec = question.spec();
        return switch (type) {
            case QuestionSpecs.CHOICE -> {
                List<Option> options = VersionDocument.nonNull(question.options());
                if (options.isEmpty()) yield null;
                yield new ChoiceView(question.id(), type, prompt,
                        options.stream().map(option -> new OptionView(option.id(), option.label())).toList());
            }
            case QuestionSpecs.FILL -> new FillView(question.id(), type, prompt, spec == null ? "" : VersionDocument.text(spec.text()),
                    blanks(spec).stream().map(blank -> new BlankView(blank.id(), size(blank), blankHint(blank))).toList());
            case QuestionSpecs.ORDER -> new OrderView(question.id(), type, prompt,
                    orderTokens(lessonId, question.id(), spec == null ? null : spec.answers()));
            case QuestionSpecs.MATCH -> {
                Match match = match(lessonId, question.id(), spec == null ? null : spec.pairs());
                yield new MatchView(question.id(), type, prompt, match.left(), match.right());
            }
            case QuestionSpecs.DICTATION -> new DictationView(question.id(), type, prompt, wordCount(spec));
            case QuestionSpecs.SPEAK -> new SpeakView(question.id(), type, prompt,
                    spec == null ? "" : VersionDocument.text(spec.text()), QuestionSpecs.threshold(spec));
            default -> null;
        };
    }

    /** Clés de correction des questions servies à l'élève (mêmes questions, mêmes identifiants, même ordre affiché). */
    static List<KeyQuestion> key(String lessonId, List<Question> questions) {
        List<KeyQuestion> keys = new ArrayList<>();
        for (Question question : questions) {
            String type = QuestionSpecs.typeOf(question);
            String prompt = VersionDocument.text(question.prompt());
            String explanation = blankToNull(question.explanation());
            Spec spec = question.spec();
            KeyQuestion key = switch (type) {
                case QuestionSpecs.CHOICE -> {
                    List<Option> options = VersionDocument.nonNull(question.options());
                    if (options.isEmpty()) yield null;
                    yield new KeyQuestion(question.id(), type, prompt, explanation, options.stream()
                            .map(option -> new KeyOption(option.id(), option.label(), option.correct(), blankToNull(option.feedback())))
                            .toList(), null, null, null, null, null, null, null, null, null);
                }
                case QuestionSpecs.FILL -> new KeyQuestion(question.id(), type, prompt, explanation, null,
                        spec == null ? "" : VersionDocument.text(spec.text()), blanks(spec).stream()
                        .map(blank -> new KeyBlank(blank.id(), accepted(blank.accept()), size(blank), blankHint(blank))).toList(),
                        null, null, null, null, null, null, null);
                case QuestionSpecs.ORDER -> {
                    List<List<String>> answers = answers(spec);
                    yield new KeyQuestion(question.id(), type, prompt, explanation, null, null, null,
                            orderTokens(lessonId, question.id(), answers), answers, null, null, null, null, null);
                }
                case QuestionSpecs.MATCH -> {
                    Match match = match(lessonId, question.id(), spec == null ? null : spec.pairs());
                    yield new KeyQuestion(question.id(), type, prompt, explanation, null, null, null, null, null,
                            match.left(), match.right(), match.pairs(), null, null);
                }
                case QuestionSpecs.DICTATION -> new KeyQuestion(question.id(), type, prompt, explanation, null, null, null,
                        null, null, null, null, null, accepted(spec == null ? null : spec.accept()), null);
                case QuestionSpecs.SPEAK -> new KeyQuestion(question.id(), type, prompt, explanation, null,
                        spec == null ? "" : VersionDocument.text(spec.text()), null, null, null, null, null, null,
                        QuestionSpecs.speakAccept(spec), QuestionSpecs.threshold(spec));
                default -> null;
            };
            if (key != null) keys.add(key);
        }
        return List.copyOf(keys);
    }

    /**
     * Jetons d'une remise en ordre : un par élément de la première solution, identifiant « k » suivi de 6 caractères
     * hexadécimaux de sha256(lessonId|qid|texte|index). Triés par identifiant ; si cet ordre est une solution, il
     * tourne d'un cran (puis d'un autre…), et en dernier recours la permutation suivante est retenue.
     */
    static List<Token> orderTokens(String lessonId, String questionId, List<List<String>> answers) {
        List<List<String>> solutions = answers == null ? List.of() : answers;
        if (solutions.isEmpty() || solutions.get(0) == null || solutions.get(0).isEmpty()) return List.of();
        List<String> first = solutions.get(0).stream().map(VersionDocument::text).toList();
        List<String> ids = opaqueIds("k", lessonId, questionId, "", first);
        List<Token> tokens = new ArrayList<>();
        for (int index = 0; index < first.size(); index++) tokens.add(new Token(ids.get(index), first.get(index)));
        tokens.sort(Comparator.comparing(Token::id));
        for (int shift = 0; shift < tokens.size(); shift++) {
            List<Token> candidate = rotate(tokens, shift);
            if (!matchesSolution(texts(candidate), solutions)) return List.copyOf(candidate);
        }
        // Disposition périodique (ex. a b a b) : on parcourt les permutations suivantes, en nombre borné.
        int[] order = new int[tokens.size()];
        for (int index = 0; index < order.length; index++) order[index] = index;
        for (int step = 0; step < 40_320 && nextPermutation(order); step++) {
            List<Token> candidate = new ArrayList<>();
            for (int index : order) candidate.add(tokens.get(index));
            if (!matchesSolution(texts(candidate), solutions)) return List.copyOf(candidate);
        }
        return List.copyOf(tokens);
    }

    /** Association : éléments de gauche dans l'ordre du contenu, éléments de droite triés par identifiant. */
    record Match(List<Token> left, List<Token> right, Map<String, String> pairs) {}

    static Match match(String lessonId, String questionId, List<Pair> pairs) {
        List<Pair> list = pairs == null ? List.of() : pairs;
        List<String> lefts = list.stream().map(pair -> VersionDocument.text(pair.left())).toList();
        List<String> rights = list.stream().map(pair -> VersionDocument.text(pair.right())).toList();
        List<String> leftIds = opaqueIds("l", lessonId, questionId, "l:", lefts);
        List<String> rightIds = opaqueIds("r", lessonId, questionId, "r:", rights);
        List<Token> left = new ArrayList<>();
        List<Token> partners = new ArrayList<>();
        Map<String, String> solution = new LinkedHashMap<>();
        for (int index = 0; index < list.size(); index++) {
            left.add(new Token(leftIds.get(index), lefts.get(index)));
            partners.add(new Token(rightIds.get(index), rights.get(index)));
            solution.put(leftIds.get(index), rightIds.get(index));
        }
        List<Token> right = new ArrayList<>(partners);
        right.sort(Comparator.comparing(Token::id));
        // Si chaque élément de droite se trouvait en face de son partenaire, la colonne tourne d'un cran.
        if (right.size() > 1 && right.equals(partners)) right = rotate(right, 1);
        return new Match(List.copyOf(left), List.copyOf(right), Collections.unmodifiableMap(solution));
    }

    /**
     * Identifiants opaques d'une liste : préfixe suivi des 6 premiers caractères hexadécimaux de
     * sha256(lessonId|qid|marque+texte|index). En cas de collision dans la liste, la liste entière passe à 10 puis
     * 16 caractères (calcul toujours déterministe).
     */
    static List<String> opaqueIds(String prefix, String lessonId, String questionId, String mark, List<String> texts) {
        for (int length : new int[] {6, 10, 16, 64}) {
            List<String> ids = new ArrayList<>();
            Set<String> seen = new HashSet<>();
            for (int index = 0; index < texts.size(); index++) {
                String id = prefix + sha256(lessonId + "|" + questionId + "|" + mark + texts.get(index) + "|" + index)
                        .substring(0, length);
                ids.add(id);
                seen.add(id);
            }
            if (seen.size() == ids.size()) return List.copyOf(ids);
        }
        throw new IllegalStateException("Identifiants opaques en collision");
    }

    static boolean matchesSolution(List<String> texts, List<List<String>> solutions) {
        for (List<String> solution : solutions) {
            if (solution != null && solution.stream().map(VersionDocument::text).toList().equals(texts)) return true;
        }
        return false;
    }

    static List<String> texts(List<Token> tokens) {
        return tokens.stream().map(Token::text).toList();
    }

    private static <T> List<T> rotate(List<T> list, int shift) {
        List<T> rotated = new ArrayList<>(list.size());
        for (int index = 0; index < list.size(); index++) rotated.add(list.get((index + shift) % list.size()));
        return rotated;
    }

    /** Permutation suivante dans l'ordre lexicographique ; false après la dernière. */
    private static boolean nextPermutation(int[] order) {
        int pivot = order.length - 2;
        while (pivot >= 0 && order[pivot] >= order[pivot + 1]) pivot--;
        if (pivot < 0) return false;
        int swap = order.length - 1;
        while (order[swap] <= order[pivot]) swap--;
        int held = order[pivot];
        order[pivot] = order[swap];
        order[swap] = held;
        for (int low = pivot + 1, high = order.length - 1; low < high; low++, high--) {
            held = order[low];
            order[low] = order[high];
            order[high] = held;
        }
        return true;
    }

    private static List<Blank> blanks(Spec spec) {
        return spec == null || spec.blanks() == null ? List.of() : spec.blanks();
    }

    private static List<List<String>> answers(Spec spec) {
        if (spec == null || spec.answers() == null) return List.of();
        return spec.answers().stream().map(answer -> answer.stream().map(VersionDocument::text).toList()).toList();
    }

    /** Largeur d'un trou : celle fixée par l'auteur, sinon la plus longue réponse acceptée (3 à 40 caractères). */
    static int size(Blank blank) {
        if (blank.size() != null) return blank.size();
        int longest = accepted(blank.accept()).stream().mapToInt(String::length).max().orElse(0);
        return Math.max(3, Math.min(40, longest));
    }

    private static String blankHint(Blank blank) {
        return blankToNull(blank.hint());
    }

    private static Integer wordCount(Spec spec) {
        if (spec == null || !Boolean.TRUE.equals(spec.showWordCount())) return null;
        List<String> accept = accepted(spec.accept());
        return accept.isEmpty() ? null : QuestionSpecs.words(accept.get(0)).size();
    }

    private static List<String> accepted(List<String> answers) {
        List<String> accept = new ArrayList<>();
        for (String answer : answers == null ? List.<String>of() : answers) {
            if (!VersionDocument.text(answer).isEmpty()) accept.add(VersionDocument.text(answer));
        }
        return List.copyOf(accept);
    }

    private static String blankToNull(String value) {
        String text = VersionDocument.text(value);
        return text.isEmpty() ? null : text;
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException(error);
        }
    }
}
