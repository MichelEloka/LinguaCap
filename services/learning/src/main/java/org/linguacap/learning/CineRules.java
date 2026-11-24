package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.linguacap.common.HttpError;

/**
 * Règles du Ciné-club (EVO-055) : carnet de mots de l'élève, séquences proposées par l'équipe pédagogique et
 * agrégation « films, dernier résultat, mots notés, propositions en cours ». Le Ciné-club est facultatif : hors
 * parcours, hors contrat, hors durées conseillées.
 */
final class CineRules {
    static final int MAX_WORD = 80;
    static final int MAX_WORD_NOTE = 200;
    static final int MAX_WORDS = 3000;
    static final int MAX_RECOMMENDATION_NOTE = 300;
    static final int MAX_OPEN_RECOMMENDATIONS = 100;
    static final String FILM = "film";
    static final String ACTIVITY = "activity";
    static final String MANUAL = "manual";
    static final Set<String> SOURCE_KINDS = Set.of(FILM, ACTIVITY, MANUAL);
    /** Identifiant de séquence (catalogue) : slug de 59 caractères au plus. */
    static final Pattern SEQUENCE_ID = Pattern.compile("[a-z0-9]+(-[a-z0-9]+)*");
    static final int MAX_SEQUENCE_ID = 59;
    /** Référence d'activité choisie par l'interface (ex. « <version>/<module> » pour le lexique d'un module). */
    static final Pattern ACTIVITY_SOURCE = Pattern.compile("[A-Za-z0-9][A-Za-z0-9:/._-]{0,119}");
    static final Pattern LEVEL = Pattern.compile("[ABCabc][12]");

    private CineRules() {}

    /** Mot du carnet. note : '' si vide ; sourceId : séquence, référence d'activité, ou null pour une saisie libre. */
    public record LearnerWord(UUID id, UUID learnerId, String languageId, String word, String note, String sourceKind,
                              String sourceId, String createdAt, String updatedAt) {}

    /** Séquence proposée à l'élève ; dismissedAt : null tant que l'élève ne l'a pas écartée. */
    public record FilmRecommendation(UUID id, UUID learnerId, String filmId, String sequenceId, UUID recommendedBy,
                                     String recommendedByRole, String note, String createdAt, String dismissedAt) {}

    /** Dernière remise des questions « après » d'une séquence (attemptId : corrigé par GET /assessments/exercises/{id}). */
    public record CineResult(String attemptId, int correct, int total, String submittedAt) {}

    /**
     * Séquence d'un film avec l'état de l'élève : champs de la séquence servie par le catalogue (sans questions),
     * dernier résultat, mots notés pendant cette séquence (plus récent d'abord) et proposition en cours.
     */
    public record CineSequence(String id, String filmId, int position, String title, int start, int end, boolean approx,
                               String context, JsonNode keywords, String lessonId, int questionCount,
                               CineResult lastResult, List<LearnerWord> words, FilmRecommendation recommendation) {}

    public record CineFilm(String id, String languageId, String levelId, String levelCode, String title,
                           String description, String provider, String videoId, String channel, String videoUrl,
                           String courseUrl, String credit, String licenseNote, int durationSeconds, int position,
                           List<CineSequence> sequences) {}

    /**
     * Ciné-club d'un élève : films publiés de sa langue (et du niveau demandé), propositions en cours sur ces films (plus
     * récente d'abord) et nombre de mots du carnet. languageId : null si la langue de l'élève est inconnue (tous les
     * films publiés sont servis).
     */
    public record CineOverview(UUID learnerId, String languageId, String level, List<CineFilm> films,
                               List<FilmRecommendation> recommendations, int wordCount) {}

    /** Mot à enregistrer, normalisé. */
    record WordInput(String word, String note, String sourceKind, String sourceId) {}

    /** Mot saisi : 1 à 80 caractères, note de 200 au plus, source cohérente avec son type. */
    static WordInput word(String word, String note, String sourceKind, String sourceId) {
        String text = text(word);
        if (text.isEmpty() || text.length() > MAX_WORD) {
            throw HttpError.badRequest("Le mot compte 1 à " + MAX_WORD + " caractères.");
        }
        String remark = text(note);
        if (remark.length() > MAX_WORD_NOTE) {
            throw HttpError.badRequest("La note du mot compte " + MAX_WORD_NOTE + " caractères au plus.");
        }
        if (sourceKind == null || !SOURCE_KINDS.contains(sourceKind)) {
            throw HttpError.badRequest("Indiquez la source du mot : film, activity ou manual.");
        }
        String source = sourceId == null ? null : sourceId.strip();
        switch (sourceKind) {
            case FILM -> {
                if (source == null || !SEQUENCE_ID.matcher(source).matches() || source.length() > MAX_SEQUENCE_ID) {
                    throw HttpError.badRequest("Un mot noté pendant un film indique sa séquence.");
                }
            }
            case ACTIVITY -> {
                if (source == null || !ACTIVITY_SOURCE.matcher(source).matches()) {
                    throw HttpError.badRequest("Un mot noté depuis une activité indique sa référence (120 caractères au plus).");
                }
            }
            default -> {
                if (source != null) throw HttpError.badRequest("Un mot saisi librement n’a pas de source.");
            }
        }
        return new WordInput(text, remark, sourceKind, source);
    }

    /** Modification d'un mot : au moins le mot ou la note ; null garde la valeur actuelle. */
    static WordInput change(String word, String note) {
        if (word == null && note == null) throw HttpError.badRequest("Indiquez le mot ou la note à modifier.");
        String text = word == null ? null : text(word);
        if (text != null && (text.isEmpty() || text.length() > MAX_WORD)) {
            throw HttpError.badRequest("Le mot compte 1 à " + MAX_WORD + " caractères.");
        }
        String remark = note == null ? null : text(note);
        if (remark != null && remark.length() > MAX_WORD_NOTE) {
            throw HttpError.badRequest("La note du mot compte " + MAX_WORD_NOTE + " caractères au plus.");
        }
        return new WordInput(text, remark, null, null);
    }

    /** Proposition d'une séquence : identifiant de séquence et note de 300 caractères au plus. */
    static String recommendationNote(String sequenceId, String note) {
        if (sequenceId == null || !SEQUENCE_ID.matcher(sequenceId).matches() || sequenceId.length() > MAX_SEQUENCE_ID) {
            throw HttpError.badRequest("Identifiant de séquence invalide.");
        }
        String text = text(note);
        if (text.length() > MAX_RECOMMENDATION_NOTE) {
            throw HttpError.badRequest("La note de la proposition compte " + MAX_RECOMMENDATION_NOTE + " caractères au plus.");
        }
        return text;
    }

    /** Niveau demandé (code CECRL, casse indifférente), en majuscules ; null s'il est absent. */
    static String level(String level) {
        if (level == null) return null;
        if (!LEVEL.matcher(level).matches()) throw HttpError.badRequest("Niveau invalide (ex. A1).");
        return level.toUpperCase(java.util.Locale.ROOT);
    }

    /** Film publié (servi par GET /v1/films du catalogue) qui contient la séquence, ou null. */
    static JsonNode filmOf(JsonNode films, String sequenceId) {
        if (films == null || !films.isArray()) return null;
        for (JsonNode film : films) {
            for (JsonNode sequence : film.path("sequences")) {
                if (sequenceId.equals(sequence.path("id").asText())) return film;
            }
        }
        return null;
    }

    /**
     * Agrégation : chaque séquence des films reçoit le dernier résultat de sa leçon (clé : lessonId), les mots notés
     * pendant la séquence et la proposition en cours ; les propositions en cours sur ces films sont listées à part.
     */
    static CineOverview overview(UUID learnerId, String languageId, String level, JsonNode films,
                                 Map<String, JsonNode> latestGrades, List<LearnerWord> words,
                                 List<FilmRecommendation> recommendations) {
        Map<String, List<LearnerWord>> bySequence = new LinkedHashMap<>();
        for (LearnerWord word : words) {
            if (FILM.equals(word.sourceKind()) && word.sourceId() != null) {
                bySequence.computeIfAbsent(word.sourceId(), key -> new ArrayList<>()).add(word);
            }
        }
        Map<String, FilmRecommendation> open = new LinkedHashMap<>();
        for (FilmRecommendation recommendation : recommendations) {
            if (recommendation.dismissedAt() == null) open.putIfAbsent(recommendation.sequenceId(), recommendation);
        }
        List<CineFilm> result = new ArrayList<>();
        Set<String> served = new HashSet<>();
        for (JsonNode film : films == null || !films.isArray() ? List.<JsonNode>of() : iterable(films)) {
            List<CineSequence> sequences = new ArrayList<>();
            for (JsonNode sequence : film.path("sequences")) {
                String id = sequence.path("id").asText();
                String lessonId = sequence.path("lessonId").asText();
                served.add(id);
                sequences.add(new CineSequence(id, sequence.path("filmId").asText(film.path("id").asText()),
                        sequence.path("position").asInt(), sequence.path("title").asText(""),
                        sequence.path("start").asInt(), sequence.path("end").asInt(), sequence.path("approx").asBoolean(),
                        sequence.path("context").asText(""), sequence.path("keywords"), lessonId,
                        sequence.path("questionCount").asInt(), result(latestGrades.get(lessonId)),
                        List.copyOf(bySequence.getOrDefault(id, List.of())), open.get(id)));
            }
            result.add(new CineFilm(film.path("id").asText(), film.path("languageId").asText(),
                    film.path("levelId").asText(), film.path("levelCode").asText(), film.path("title").asText(""),
                    film.path("description").asText(""), film.path("provider").asText("youtube"),
                    film.path("videoId").asText(), film.path("channel").asText(""), film.path("videoUrl").asText(""),
                    film.path("courseUrl").asText(""), film.path("credit").asText(""),
                    film.path("licenseNote").asText(""), film.path("durationSeconds").asInt(),
                    film.path("position").asInt(), List.copyOf(sequences)));
        }
        List<FilmRecommendation> current = open.values().stream()
                .filter(recommendation -> served.contains(recommendation.sequenceId())).toList();
        return new CineOverview(learnerId, languageId, level, List.copyOf(result), current, words.size());
    }

    /** Dernière remise (Grade d'Évaluations) en résultat de séquence ; null sans remise. */
    static CineResult result(JsonNode grade) {
        if (grade == null) return null;
        return new CineResult(grade.path("id").asText(), grade.path("correct").asInt(), grade.path("total").asInt(),
                grade.path("submittedAt").asText());
    }

    private static List<JsonNode> iterable(JsonNode array) {
        List<JsonNode> items = new ArrayList<>();
        array.forEach(items::add);
        return items;
    }

    static String text(String value) {
        return value == null ? "" : value.strip();
    }
}
