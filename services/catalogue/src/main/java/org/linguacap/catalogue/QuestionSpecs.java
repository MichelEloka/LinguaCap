package org.linguacap.catalogue;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.linguacap.catalogue.VersionDocument.Issue;
import org.linguacap.catalogue.VersionDocument.Question;
import org.linguacap.common.HttpError;

/**
 * Types de question (choice, fill, order, match, dictation, speak) et clé de correction propre à chaque type
 * ({@code spec}). La clé est stockée au catalogue et n'est servie qu'à Évaluations (route exercise-key) ; l'élève
 * reçoit la vue publique construite par {@link QuestionViews}.
 */
final class QuestionSpecs {
    static final String CHOICE = "choice";
    static final String FILL = "fill";
    static final String ORDER = "order";
    static final String MATCH = "match";
    static final String DICTATION = "dictation";
    static final String SPEAK = "speak";
    static final Set<String> TYPES = Set.of(CHOICE, FILL, ORDER, MATCH, DICTATION, SPEAK);
    /** Taille maximale d'une clé enregistrée (contrainte de catalogue.questions.spec). */
    static final int MAX_SPEC_BYTES = 8192;
    static final int MAX_EXPLANATION = 1500;
    static final int MAX_FEEDBACK = 500;
    /** Limites alignées sur la remise (POST /assessments/exercises) : 16 jetons, 8 paires, 80 caractères par trou. */
    static final int MAX_TOKENS = 16;
    static final int MAX_PAIRS = 8;
    static final int MAX_BLANK_ANSWER = 80;
    /** Repère d'un trou dans le texte d'une question « fill » : [[id]]. */
    static final Pattern MARKER = Pattern.compile("\\[\\[([^\\]]*)\\]\\]");

    /** Champs de la clé admis pour chaque type : tout autre champ renseigné est refusé à l'enregistrement. */
    private static final Map<String, Set<String>> FIELDS = Map.of(
            FILL, Set.of("text", "blanks"),
            ORDER, Set.of("answers"),
            MATCH, Set.of("pairs"),
            DICTATION, Set.of("accept", "showWordCount"),
            SPEAK, Set.of("text", "accept", "threshold"));

    /** Lecture des clés enregistrées : tolérante, une clé écrite par une version ultérieure reste lisible. */
    private static final ObjectMapper JSON = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private QuestionSpecs() {}

    /**
     * Clé de correction d'une question typée. Seuls les champs du type sont renseignés :
     * fill {text, blanks}, order {answers}, match {pairs}, dictation {accept, showWordCount},
     * speak {text, accept, threshold}.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Spec(String text, List<Blank> blanks, List<List<String>> answers, List<Pair> pairs,
                       List<String> accept, Boolean showWordCount, Integer threshold) {
        boolean isEmpty() {
            return text == null && blanks == null && answers == null && pairs == null && accept == null
                    && showWordCount == null && threshold == null;
        }

        Set<String> present() {
            Set<String> fields = new HashSet<>();
            if (text != null) fields.add("text");
            if (blanks != null) fields.add("blanks");
            if (answers != null) fields.add("answers");
            if (pairs != null) fields.add("pairs");
            if (accept != null) fields.add("accept");
            if (showWordCount != null) fields.add("showWordCount");
            if (threshold != null) fields.add("threshold");
            return fields;
        }
    }

    /** Trou d'une question « fill » : réponses acceptées, largeur du champ (caractères) et indice facultatif. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Blank(String id, List<String> accept, Integer size, String hint) {}

    /** Paire d'une question « match ». */
    public record Pair(String left, String right) {}

    /** Type effectif : absent (ancien format, éditeur, B1 de démonstration) vaut « choice ». */
    static String typeOf(Question question) {
        return typeOf(question == null ? null : question.type());
    }

    static String typeOf(String type) {
        return type == null || type.isBlank() ? CHOICE : type;
    }

    /** Clé d'une question typée, ou null pour un choix (la clé d'un choix est portée par ses options). */
    static Spec specOf(Question question) {
        if (CHOICE.equals(typeOf(question))) return null;
        return question.spec() == null || question.spec().isEmpty() ? null : question.spec();
    }

    /**
     * Contrôle de structure à l'enregistrement d'un brouillon : type connu, champs propres au type, tailles bornées.
     * Un brouillon peut rester incomplet : la complétude est vérifiée à la publication ({@link #checkComplete}).
     */
    static void checkStructure(Question question, String owner) {
        String type = typeOf(question);
        String label = "la question " + question.id() + " de " + owner;
        if (!TYPES.contains(type)) {
            throw HttpError.badRequest("Type de question inconnu pour " + label + " : choice, fill, order, match, dictation ou speak.");
        }
        if (VersionDocument.text(question.explanation()).length() > MAX_EXPLANATION) {
            throw HttpError.badRequest("L’explication de " + label + " dépasse " + MAX_EXPLANATION + " caractères.");
        }
        Spec spec = question.spec();
        if (CHOICE.equals(type)) {
            if (spec != null && !spec.isEmpty()) {
                throw HttpError.badRequest("Une question à choix ne porte pas de clé typée (" + label + ").");
            }
            for (VersionDocument.Option option : VersionDocument.nonNull(question.options())) {
                if (option != null && VersionDocument.text(option.feedback()).length() > MAX_FEEDBACK) {
                    throw HttpError.badRequest("Le retour d’un choix de " + label + " dépasse " + MAX_FEEDBACK + " caractères.");
                }
            }
            return;
        }
        if (!VersionDocument.nonNull(question.options()).isEmpty()) {
            throw HttpError.badRequest("Une question « " + type + " » n’a pas de choix de réponse (" + label + ").");
        }
        if (spec == null) return;
        Set<String> unexpected = new HashSet<>(spec.present());
        unexpected.removeAll(FIELDS.get(type));
        if (!unexpected.isEmpty()) {
            throw HttpError.badRequest("Champ " + String.join(", ", new java.util.TreeSet<>(unexpected))
                    + " inattendu pour une question « " + type + " » (" + label + ").");
        }
        String invalid = "Vérifiez la clé de correction de " + label + ".";
        switch (type) {
            case FILL -> {
                if (VersionDocument.text(spec.text()).length() > 1000 || nonNull(spec.blanks()).size() > 10) throw HttpError.badRequest(invalid);
                Set<String> ids = new HashSet<>();
                for (Blank blank : nonNull(spec.blanks())) {
                    if (blank == null || blank.id() == null || !blank.id().matches(VersionDocument.ID) || blank.id().length() > 16
                            || !ids.add(blank.id()) || nonNull(blank.accept()).size() > 10
                            || nonNull(blank.accept()).stream().anyMatch(answer -> answer == null || answer.length() > MAX_BLANK_ANSWER)
                            || blank.size() != null && (blank.size() < 1 || blank.size() > 60)
                            || VersionDocument.text(blank.hint()).length() > 120) {
                        throw HttpError.badRequest(invalid);
                    }
                }
            }
            case ORDER -> {
                if (nonNull(spec.answers()).size() > 8) throw HttpError.badRequest(invalid);
                for (List<String> answer : nonNull(spec.answers())) {
                    if (answer == null || answer.size() > MAX_TOKENS
                            || answer.stream().anyMatch(token -> token == null || token.length() > 80)) {
                        throw HttpError.badRequest(invalid);
                    }
                }
            }
            case MATCH -> {
                if (nonNull(spec.pairs()).size() > MAX_PAIRS) throw HttpError.badRequest(invalid);
                for (Pair pair : nonNull(spec.pairs())) {
                    if (pair == null || VersionDocument.text(pair.left()).length() > 120
                            || VersionDocument.text(pair.right()).length() > 120) {
                        throw HttpError.badRequest(invalid);
                    }
                }
            }
            case DICTATION -> checkAccept(spec.accept(), 500, invalid);
            case SPEAK -> {
                if (VersionDocument.text(spec.text()).length() > 300
                        || spec.threshold() != null && (spec.threshold() < 50 || spec.threshold() > 100)) {
                    throw HttpError.badRequest(invalid);
                }
                checkAccept(spec.accept(), 300, invalid);
            }
            default -> throw HttpError.badRequest(invalid);
        }
        if (write(spec).getBytes(StandardCharsets.UTF_8).length > MAX_SPEC_BYTES) {
            throw HttpError.badRequest("La clé de correction de " + label + " est trop volumineuse (8 Ko au plus).");
        }
    }

    private static void checkAccept(List<String> accept, int max, String invalid) {
        if (nonNull(accept).size() > 8 || nonNull(accept).stream().anyMatch(answer -> answer == null || answer.length() > max)) {
            throw HttpError.badRequest(invalid);
        }
    }

    /** Complétude exigée à la publication : chaque manque est signalé avec son emplacement. */
    static void checkComplete(Question question, String at, List<Issue> issues) {
        String type = typeOf(question);
        String name = "« " + VersionDocument.text(question.prompt()) + " »";
        if (CHOICE.equals(type)) {
            List<VersionDocument.Option> options = VersionDocument.nonNull(question.options());
            if (options.size() < 2) issues.add(new Issue(at + ".options", "Proposez au moins deux choix pour " + name + "."));
            if (options.stream().filter(VersionDocument.Option::correct).count() != 1) {
                issues.add(new Issue(at + ".options", "Indiquez une seule bonne réponse pour " + name + "."));
            }
            if (options.stream().anyMatch(option -> VersionDocument.text(option.label()).isBlank())) {
                issues.add(new Issue(at + ".options", "Chaque choix de " + name + " doit avoir un libellé."));
            }
            return;
        }
        Spec spec = question.spec() == null ? new Spec(null, null, null, null, null, null, null) : question.spec();
        String path = at + ".spec";
        switch (type) {
            case FILL -> {
                String text = VersionDocument.text(spec.text());
                if (text.isEmpty()) issues.add(new Issue(path + ".text", "Rédigez le texte à compléter de " + name + "."));
                List<Blank> blanks = nonNull(spec.blanks());
                if (blanks.isEmpty()) issues.add(new Issue(path + ".blanks", "Ajoutez au moins un trou à " + name + "."));
                Map<String, Integer> markers = markers(text);
                for (Blank blank : blanks) {
                    if (markers.getOrDefault(blank.id(), 0) != 1) {
                        issues.add(new Issue(path + ".blanks", "Placez le repère [[" + blank.id() + "]] une seule fois dans le texte de " + name + "."));
                    }
                    if (nonNull(blank.accept()).stream().noneMatch(answer -> !VersionDocument.text(answer).isEmpty())) {
                        issues.add(new Issue(path + ".blanks", "Indiquez la réponse attendue du trou " + blank.id() + " de " + name + "."));
                    }
                }
                Set<String> declared = new HashSet<>();
                blanks.forEach(blank -> declared.add(blank.id()));
                for (String marker : markers.keySet()) {
                    if (!declared.contains(marker)) {
                        issues.add(new Issue(path + ".text", "Le repère [[" + marker + "]] de " + name + " ne correspond à aucun trou."));
                    }
                }
            }
            case ORDER -> {
                List<List<String>> answers = nonNull(spec.answers());
                if (answers.isEmpty() || nonNull(answers.get(0)).size() < 2) {
                    issues.add(new Issue(path + ".answers", "Donnez la phrase à remettre en ordre de " + name + " (deux éléments au moins)."));
                    return;
                }
                if (answers.stream().anyMatch(answer -> answer.stream().anyMatch(token -> VersionDocument.text(token).isEmpty()))) {
                    issues.add(new Issue(path + ".answers", "Chaque élément de " + name + " doit avoir un texte."));
                }
                Map<String, Integer> reference = multiset(answers.get(0));
                if (answers.stream().anyMatch(answer -> !multiset(answer).equals(reference))) {
                    issues.add(new Issue(path + ".answers", "Les solutions de " + name + " doivent utiliser exactement les mêmes éléments."));
                } else if (arrangements(reference, 9) <= distinct(answers).size()) {
                    issues.add(new Issue(path + ".answers", "Les éléments de " + name + " ne peuvent pas être mélangés : toutes les dispositions sont justes."));
                }
            }
            case MATCH -> {
                List<Pair> pairs = nonNull(spec.pairs());
                if (pairs.size() < 2) issues.add(new Issue(path + ".pairs", "Proposez au moins deux paires pour " + name + "."));
                Set<String> lefts = new HashSet<>();
                Set<String> rights = new HashSet<>();
                for (Pair pair : pairs) {
                    String left = VersionDocument.text(pair.left());
                    String right = VersionDocument.text(pair.right());
                    if (left.isEmpty() || right.isEmpty()) {
                        issues.add(new Issue(path + ".pairs", "Chaque paire de " + name + " doit avoir ses deux éléments."));
                    } else if (!lefts.add(left.toLowerCase(Locale.ROOT)) || !rights.add(right.toLowerCase(Locale.ROOT))) {
                        issues.add(new Issue(path + ".pairs", "Les éléments de " + name + " doivent être tous différents."));
                    }
                }
            }
            case DICTATION -> {
                if (nonNull(spec.accept()).stream().noneMatch(answer -> !VersionDocument.text(answer).isEmpty())) {
                    issues.add(new Issue(path + ".accept", "Indiquez la phrase attendue de la dictée " + name + "."));
                }
            }
            case SPEAK -> {
                if (VersionDocument.text(spec.text()).isEmpty()) {
                    issues.add(new Issue(path + ".text", "Indiquez la phrase à répéter de " + name + "."));
                }
                if (nonNull(spec.accept()).stream().noneMatch(answer -> !VersionDocument.text(answer).isEmpty())) {
                    issues.add(new Issue(path + ".accept", "Indiquez les réponses acceptées de " + name + "."));
                }
            }
            default -> issues.add(new Issue(at + ".type", "Type de question inconnu pour " + name + "."));
        }
    }

    /** Nombre d'occurrences de chaque repère [[id]] du texte. */
    static Map<String, Integer> markers(String text) {
        Map<String, Integer> markers = new HashMap<>();
        Matcher matcher = MARKER.matcher(text == null ? "" : text);
        while (matcher.find()) markers.merge(matcher.group(1), 1, Integer::sum);
        return markers;
    }

    private static Map<String, Integer> multiset(List<String> tokens) {
        Map<String, Integer> counts = new HashMap<>();
        for (String token : nonNull(tokens)) counts.merge(VersionDocument.text(token), 1, Integer::sum);
        return counts;
    }

    /** Solutions distinctes, comparées sur leurs textes sans espaces de bord. */
    private static Set<List<String>> distinct(List<List<String>> answers) {
        Set<List<String>> distinct = new HashSet<>();
        for (List<String> answer : answers) distinct.add(nonNull(answer).stream().map(VersionDocument::text).toList());
        return distinct;
    }

    /** Nombre de dispositions distinctes d'un multiensemble (n! / produit des k!), plafonné à {@code cap}. */
    static long arrangements(Map<String, Integer> counts, long cap) {
        long result = 1;
        int placed = 0;
        for (int count : counts.values()) {
            for (int index = 1; index <= count; index++) {
                placed++;
                // Produit de coefficients binomiaux : C(placed, index) construit pas à pas reste entier.
                result = result * placed / index;
                if (result >= cap) return cap;
            }
        }
        return result;
    }

    /** Seuil de réussite d'une répétition : 80 jusqu'à trois mots, 75 au-delà, sauf seuil fixé (50 à 100). */
    static int threshold(Spec spec) {
        if (spec != null && spec.threshold() != null) return spec.threshold();
        return words(spec == null ? null : spec.text()).size() <= 3 ? 80 : 75;
    }

    /** Mots d'une phrase (ponctuation isolée ignorée). */
    static List<String> words(String text) {
        List<String> words = new ArrayList<>();
        for (String part : VersionDocument.text(text).split("\\s+")) {
            if (part.codePoints().anyMatch(Character::isLetterOrDigit)) words.add(part);
        }
        return words;
    }

    /** Réponses acceptées d'une répétition : la phrase affichée si l'auteur n'en a pas donné. */
    static List<String> speakAccept(Spec spec) {
        List<String> accept = new ArrayList<>();
        for (String answer : nonNull(spec == null ? null : spec.accept())) {
            if (!VersionDocument.text(answer).isEmpty()) accept.add(VersionDocument.text(answer));
        }
        if (accept.isEmpty() && spec != null && !VersionDocument.text(spec.text()).isEmpty()) accept.add(VersionDocument.text(spec.text()));
        return List.copyOf(accept);
    }

    static String write(Spec spec) {
        try {
            return JSON.writeValueAsString(spec);
        } catch (JsonProcessingException error) {
            throw HttpError.badRequest("Clé de correction illisible.");
        }
    }

    /** Clé enregistrée (jsonb), ou null. */
    static Spec read(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return JSON.readValue(value, Spec.class);
        } catch (JsonProcessingException error) {
            throw new IllegalStateException("Clé de correction illisible", error);
        }
    }

    static <T> List<T> nonNull(List<T> list) {
        return list == null ? List.of() : list;
    }
}
