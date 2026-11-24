package org.linguacap.catalogue;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import org.linguacap.catalogue.VersionDocument.Checks;
import org.linguacap.catalogue.VersionDocument.Issue;
import org.linguacap.catalogue.VersionDocument.Question;
import org.linguacap.common.HttpError;

/**
 * Document d'un film du Ciné-club (EVO-055) : le film (lecteur YouTube officiel, crédit, liens), ses séquences de 3 à
 * 15 minutes avec leur contexte « avant », leurs mots-clés et les questions « après » (leçon {@code cine-<séquence>}
 * sans version). Le même document sert à l'import (format 1, PUT /catalogue/films/{id}) et à l'éditeur : les champs en
 * lecture seule du document servi (levelCode, status, publishedAt, updatedAt, lessonId, checks) sont ignorés en entrée.
 * La structure est contrôlée à l'enregistrement (400) ; la complétude est exigée pour publier (comme un parcours).
 */
final class FilmDocument {
    static final int FORMAT = 1;
    static final int MAX_FILM_ID = 48;
    /** Leçon cine-<séquence> : 64 caractères au plus, comme tout identifiant de leçon. */
    static final int MAX_SEQUENCE_ID = 59;
    static final String LESSON_PREFIX = "cine-";
    static final String PROVIDER = "youtube";
    static final String WATCH_URL = "https://www.youtube.com/watch?v=";
    static final int MAX_SEQUENCES = 40;
    static final int MIN_SEQUENCE_SECONDS = 180;
    static final int MAX_SEQUENCE_SECONDS = 900;
    static final int MIN_DURATION = 60;
    static final int MAX_DURATION = 14_400;
    static final int MIN_KEYWORDS = 4;
    static final int MAX_KEYWORDS = 10;
    static final int MIN_QUESTIONS = 5;
    static final int MAX_QUESTIONS = 8;
    /** Questions « après » corrigées sans enregistrement ni son : la dictée et la répétition sont exclues. */
    static final Set<String> QUESTION_TYPES = Set.of(QuestionSpecs.CHOICE, QuestionSpecs.FILL, QuestionSpecs.ORDER,
            QuestionSpecs.MATCH);
    static final Pattern VIDEO_ID = Pattern.compile("[A-Za-z0-9_-]{11}");
    static final Pattern COURSE_URL = Pattern.compile("https://\\S+");
    static final Pattern LANGUAGE = Pattern.compile("[a-z]{2}");
    static final Pattern LEVEL_ID = Pattern.compile("[abc][12]");

    private FilmDocument() {}

    // --- Entrée (import et éditeur) ----------------------------------------------------------------------------------

    /** Document reçu : format (facultatif, 1), film et séquences. */
    @JsonIgnoreProperties({"checks"})
    public record Input(Integer format, FilmFields film, List<SequenceInput> sequences) {}

    @JsonIgnoreProperties({"levelCode", "status", "publishedAt", "updatedAt"})
    public record FilmFields(String id, String languageId, String levelId, String title, String description,
                             String provider, String videoId, String channel, String videoUrl, String courseUrl,
                             String credit, String licenseNote, Integer durationSeconds, Integer position) {}

    /** Séquence reçue : start et end en secondes entières ; approx : bornes à vérifier en regardant. */
    @JsonIgnoreProperties({"lessonId"})
    public record SequenceInput(String id, Integer position, String title, Integer start, Integer end, Boolean approx,
                                String context, List<Keyword> keywords, List<Question> questions) {}

    /** Mot-clé original d'une séquence : article der, die, das ou null ; pluriel et note facultatifs. */
    public record Keyword(String word, String article, String plural, String translation, String note) {}

    // --- Sorties ------------------------------------------------------------------------------------------------------

    /** Film de l'éditeur (avec son état). */
    public record FilmView(String id, String languageId, String levelId, String levelCode, String title,
                           String description, String provider, String videoId, String channel, String videoUrl,
                           String courseUrl, String credit, String licenseNote, int durationSeconds, int position,
                           String status, String publishedAt, String updatedAt) {}

    /** Séquence de l'éditeur : questions avec leur corrigé (document du catalogue). */
    public record SequenceView(String id, int position, String title, int start, int end, boolean approx,
                               String context, List<Keyword> keywords, String lessonId, List<Question> questions) {}

    /** Document servi à l'éditeur : le film, ses séquences avec corrigés et ce qu'il reste à compléter pour publier. */
    public record EditorDocument(FilmView film, List<SequenceView> sequences, Checks checks) {}

    /** Ligne de la liste de l'éditeur. */
    public record Summary(String id, String languageId, String levelId, String levelCode, String title, String videoId,
                          int durationSeconds, int position, String status, int sequenceCount, String publishedAt,
                          String updatedAt) {}

    /** Film servi à toute session : jamais de corrigé. */
    public record Film(String id, String languageId, String levelId, String levelCode, String title, String description,
                       String provider, String videoId, String channel, String videoUrl, String courseUrl, String credit,
                       String licenseNote, int durationSeconds, int position, List<Sequence> sequences) {}

    /**
     * Séquence servie à toute session. questions : vues élève de la leçon (sans corrigé) dans GET /films/{id}, null dans
     * la liste GET /films ; questionCount : nombre de questions de la leçon.
     */
    public record Sequence(String id, String filmId, int position, String title, int start, int end, boolean approx,
                           String context, List<Keyword> keywords, String lessonId, int questionCount,
                           List<QuestionViews.View> questions) {}

    // --- Règles -------------------------------------------------------------------------------------------------------

    static String lessonId(String sequenceId) {
        return LESSON_PREFIX + sequenceId;
    }

    static boolean validFilmId(String id) {
        return id != null && id.length() <= MAX_FILM_ID && id.matches(VersionDocument.ID);
    }

    /**
     * Document normalisé : textes sans espaces de bord, champs facultatifs à leur valeur par défaut (description, note
     * de licence et lien du cours vides, position 1, approx faux, listes vides), séquences dans l'ordre des positions.
     */
    static Input normalized(Input input) {
        if (input == null || input.film() == null) {
            throw HttpError.badRequest("Le document de film est incomplet : « film » et « sequences » sont requis.");
        }
        FilmFields film = input.film();
        FilmFields fields = new FilmFields(film.id(), text(film.languageId()), text(film.levelId()), text(film.title()),
                text(film.description()), text(film.provider()), text(film.videoId()), text(film.channel()),
                text(film.videoUrl()), text(film.courseUrl()), text(film.credit()), text(film.licenseNote()),
                film.durationSeconds(), film.position() == null ? 1 : film.position());
        List<SequenceInput> sequences = new ArrayList<>();
        for (SequenceInput sequence : nonNull(input.sequences())) {
            if (sequence == null) throw HttpError.badRequest("Une séquence du film " + film.id() + " est vide.");
            List<Keyword> keywords = new ArrayList<>();
            for (Keyword keyword : nonNull(sequence.keywords())) {
                if (keyword == null) {
                    throw HttpError.badRequest("Un mot-clé de la séquence " + sequence.id() + " est vide.");
                }
                keywords.add(new Keyword(text(keyword.word()), blankToNull(keyword.article()), blankToNull(keyword.plural()),
                        text(keyword.translation()), blankToNull(keyword.note())));
            }
            sequences.add(new SequenceInput(sequence.id(), sequence.position(), text(sequence.title()), sequence.start(),
                    sequence.end(), Boolean.TRUE.equals(sequence.approx()), text(sequence.context()), List.copyOf(keywords),
                    nonNull(sequence.questions())));
        }
        sequences.sort(Comparator.comparing(SequenceInput::position, Comparator.nullsLast(Comparator.naturalOrder())));
        return new Input(input.format(), fields, List.copyOf(sequences));
    }

    /**
     * Contrôle de structure à l'enregistrement (400, message précis) : identifiants, tailles, lecteur YouTube officiel,
     * bornes des séquences dans la vidéo (3 à 15 minutes), mots-clés et questions (types choice, fill, order, match,
     * clés contrôlées par {@link QuestionSpecs}). Le document est normalisé ({@link #normalized}).
     */
    static void checkStructure(String filmId, Input input) {
        if (input.format() != null && input.format() != FORMAT) {
            throw HttpError.badRequest("Format de document de film inconnu : seul le format " + FORMAT + " est accepté.");
        }
        FilmFields film = input.film();
        if (film.id() == null || !film.id().equals(filmId)) {
            throw HttpError.badRequest("L’identifiant du film (" + film.id() + ") doit être celui de l’adresse (" + filmId + ").");
        }
        if (!validFilmId(film.id())) {
            throw HttpError.badRequest("Identifiant de film invalide : lettres minuscules, chiffres et tirets, "
                    + MAX_FILM_ID + " caractères au plus.");
        }
        String name = "du film " + film.id();
        if (!LANGUAGE.matcher(film.languageId()).matches() || !LEVEL_ID.matcher(film.levelId()).matches()) {
            throw HttpError.badRequest("Indiquez la langue (ex. de) et le niveau (ex. a1) " + name + ".");
        }
        if (film.title().isEmpty() || film.title().length() > 120 || film.description().length() > 2000) {
            throw HttpError.badRequest("Le titre " + name + " compte 1 à 120 caractères et sa description 2 000 au plus.");
        }
        if (!PROVIDER.equals(film.provider())) {
            throw HttpError.badRequest("Seul le lecteur YouTube officiel est accepté (provider « youtube ») " + name + ".");
        }
        if (!VIDEO_ID.matcher(film.videoId()).matches()) {
            throw HttpError.badRequest("Identifiant de vidéo YouTube invalide " + name + " (11 caractères).");
        }
        if (!(WATCH_URL + film.videoId()).equals(film.videoUrl())) {
            throw HttpError.badRequest("Le lien de la vidéo " + name + " doit être " + WATCH_URL + film.videoId() + ".");
        }
        if (!film.courseUrl().isEmpty() && (!COURSE_URL.matcher(film.courseUrl()).matches() || film.courseUrl().length() > 300)) {
            throw HttpError.badRequest("Le lien du cours " + name + " doit être une adresse https de 300 caractères au plus.");
        }
        if (film.channel().isEmpty() || film.channel().length() > 120 || film.credit().isEmpty()
                || film.credit().length() > 300 || film.licenseNote().length() > 1000) {
            throw HttpError.badRequest("Indiquez la chaîne (120 caractères au plus) et le crédit (300 au plus) " + name
                    + " ; la note de licence compte 1 000 caractères au plus.");
        }
        if (film.durationSeconds() == null || film.durationSeconds() < MIN_DURATION || film.durationSeconds() > MAX_DURATION) {
            throw HttpError.badRequest("La durée " + name + " va de " + MIN_DURATION + " à " + MAX_DURATION + " secondes.");
        }
        if (film.position() < 1 || film.position() > 100) {
            throw HttpError.badRequest("La position " + name + " va de 1 à 100.");
        }
        if (input.sequences().size() > MAX_SEQUENCES) {
            throw HttpError.badRequest("Un film compte " + MAX_SEQUENCES + " séquences au plus.");
        }
        Set<String> ids = new HashSet<>();
        Set<Integer> positions = new HashSet<>();
        for (SequenceInput sequence : input.sequences()) {
            String id = sequence.id();
            if (id == null || !id.matches(VersionDocument.ID) || !id.startsWith(film.id() + "-")
                    || id.length() > MAX_SEQUENCE_ID) {
                throw HttpError.badRequest("Identifiant de séquence invalide (" + id + ") : il commence par « " + film.id()
                        + "- » et compte " + MAX_SEQUENCE_ID + " caractères au plus.");
            }
            if (!ids.add(id)) throw HttpError.badRequest("Deux séquences portent l’identifiant " + id + ".");
            String label = "la séquence " + id;
            if (sequence.position() == null || sequence.position() < 1 || sequence.position() > 100
                    || !positions.add(sequence.position())) {
                throw HttpError.badRequest("La position de " + label + " doit être unique, de 1 à 100.");
            }
            if (sequence.title().length() > 160 || sequence.context().length() > 4000) {
                throw HttpError.badRequest("Le titre de " + label + " compte 160 caractères au plus et son contexte 4 000.");
            }
            checkBounds(sequence, film.durationSeconds(), label);
            if (sequence.keywords().size() > MAX_KEYWORDS) {
                throw HttpError.badRequest(label(label) + " compte " + MAX_KEYWORDS + " mots-clés au plus.");
            }
            for (Keyword keyword : sequence.keywords()) {
                if (keyword.word().length() > 80 || keyword.article() != null && !VersionDocument.ARTICLES.contains(keyword.article())
                        || keyword.plural() != null && keyword.plural().length() > 80 || keyword.translation().length() > 160
                        || keyword.note() != null && keyword.note().length() > 120) {
                    throw HttpError.badRequest("Vérifiez le mot-clé « " + keyword.word() + " » de " + label
                            + " : mot et pluriel de 80 caractères, article der, die ou das, traduction de 160, note de 120.");
                }
            }
            if (sequence.questions().size() > MAX_QUESTIONS) {
                throw HttpError.badRequest(label(label) + " compte " + MAX_QUESTIONS + " questions au plus.");
            }
            for (Question question : sequence.questions()) {
                if (question != null && !QUESTION_TYPES.contains(QuestionSpecs.typeOf(question))) {
                    throw HttpError.badRequest("La question " + question.id() + " de " + label
                            + " doit être de type choice, fill, order ou match.");
                }
                if (question != null && question.moduleRef() != null) {
                    throw HttpError.badRequest("La question " + question.id() + " de " + label + " ne se rattache à aucun module.");
                }
            }
            VersionDocument.checkQuestions(sequence.questions(), label);
        }
    }

    /** Bornes dans la vidéo : 0 ≤ début < fin ≤ durée du film, et une séquence de 3 à 15 minutes. */
    private static void checkBounds(SequenceInput sequence, int duration, String label) {
        Integer start = sequence.start();
        Integer end = sequence.end();
        if (start == null || end == null || start < 0 || end <= start || end > duration) {
            throw HttpError.badRequest("Les bornes de " + label + " doivent tenir dans la vidéo (0 ≤ début < fin ≤ "
                    + duration + " s).");
        }
        if (end - start < MIN_SEQUENCE_SECONDS || end - start > MAX_SEQUENCE_SECONDS) {
            throw HttpError.badRequest(label(label) + " dure " + (end - start) + " s : une séquence dure de 3 à 15 minutes ("
                    + MIN_SEQUENCE_SECONDS + " à " + MAX_SEQUENCE_SECONDS + " s).");
        }
    }

    /**
     * Complétude exigée pour publier (et pour enregistrer un film publié) : au moins une séquence ; pour chacune, titre
     * et contexte rédigés, 4 à 10 mots-clés avec leur traduction, 5 à 8 questions complètes ; le lien du cours gratuit.
     */
    static Checks check(Input input) {
        List<Issue> issues = new ArrayList<>();
        if (input.film().courseUrl().isEmpty()) {
            issues.add(new Issue("film.courseUrl", "Indiquez le lien vers le cours gratuit du diffuseur."));
        }
        if (input.sequences().isEmpty()) issues.add(new Issue("sequences", "Ajoutez au moins une séquence au film."));
        for (int s = 0; s < input.sequences().size(); s++) {
            SequenceInput sequence = input.sequences().get(s);
            String at = "sequences[" + s + "]";
            String name = "la séquence " + sequence.id();
            if (sequence.title().isEmpty()) issues.add(new Issue(at + ".title", "Donnez un titre à " + name + "."));
            if (sequence.context().isEmpty()) {
                issues.add(new Issue(at + ".context", "Rédigez le contexte « avant » de " + name + "."));
            }
            List<Keyword> keywords = sequence.keywords();
            if (keywords.size() < MIN_KEYWORDS || keywords.size() > MAX_KEYWORDS) {
                issues.add(new Issue(at + ".keywords", label(name) + " compte " + MIN_KEYWORDS + " à " + MAX_KEYWORDS
                        + " mots-clés (" + keywords.size() + " aujourd’hui)."));
            }
            for (int k = 0; k < keywords.size(); k++) {
                if (keywords.get(k).word().isEmpty() || keywords.get(k).translation().isEmpty()) {
                    issues.add(new Issue(at + ".keywords[" + k + "]", "Complétez le mot et sa traduction (mot-clé "
                            + (k + 1) + " de " + name + ")."));
                }
            }
            List<Question> questions = sequence.questions();
            if (questions.size() < MIN_QUESTIONS || questions.size() > MAX_QUESTIONS) {
                issues.add(new Issue(at + ".questions", label(name) + " compte " + MIN_QUESTIONS + " à " + MAX_QUESTIONS
                        + " questions (" + questions.size() + " aujourd’hui)."));
            }
            for (int q = 0; q < questions.size(); q++) {
                Question question = questions.get(q);
                String questionAt = at + ".questions[" + q + "]";
                if (VersionDocument.text(question.prompt()).isEmpty()) {
                    issues.add(new Issue(questionAt + ".prompt", "Rédigez l’énoncé de la question " + question.id()
                            + " de " + name + "."));
                }
                QuestionSpecs.checkComplete(question, questionAt, issues);
            }
        }
        return new Checks(issues.isEmpty(), List.copyOf(issues));
    }

    /** Message de refus d'une publication : le premier point, et le nombre de points s'il y en a plusieurs. */
    static String refusal(Checks checks) {
        return "Le film n’est pas prêt : " + checks.issues().get(0).message()
                + (checks.issues().size() > 1 ? " (" + checks.issues().size() + " points à compléter)" : "");
    }

    private static String label(String value) {
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
    }

    static String text(String value) {
        return VersionDocument.text(value);
    }

    static String blankToNull(String value) {
        String text = text(value);
        return text.isEmpty() ? null : text;
    }

    static <T> List<T> nonNull(List<T> list) {
        return list == null ? List.of() : list;
    }
}
