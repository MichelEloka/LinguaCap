package org.linguacap.catalogue;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.linguacap.common.HttpError;

/**
 * Document d'édition d'une version de parcours : réglages, diagnostic, modules (et leur vocabulaire), activités,
 * leçons, questions typées avec corrigés, explications et supports, missions. Un brouillon s'enregistre d'un bloc ;
 * la publication exige un document complet. L'ancien format (questions sans type, sans explication ni clé typée,
 * modules sans vocabulaire) reste accepté : une question sans type est une question à choix.
 */
public record VersionDocument(UUID id, String levelId, String levelCode, String levelTitle, int number, String status,
                              String publishedAt, String updatedAt, Settings settings, Diagnostic diagnostic,
                              List<Module> modules, List<Assessment> assessments) {

    static final String ID = "[a-z0-9]+(-[a-z0-9]+)*";
    static final Set<String> KINDS = Set.of("lesson", "exercise", "review", "assessment", "mission");
    static final Set<String> COMPETENCES = Set.of("lecture", "ecoute", "expression-ecrite", "expression-orale");
    static final Set<String> USAGES = Set.of("illustration", "audio");
    static final Set<String> TRANSCRIPTS = Set.of("on_demand", "after_answer", "hidden");
    static final Set<String> ASSESSMENT_KINDS = Set.of("midterm", "final");
    static final Set<String> MODES = Set.of("closed", "written", "oral");
    static final Set<String> ARTICLES = Set.of("der", "die", "das");
    static final Set<String> PARTS_OF_SPEECH = Set.of("noun", "verb", "adjective", "adverb", "preposition",
            "conjunction", "pronoun", "number", "expression", "other");
    /** Un exercice typé se remet en une fois (POST /assessments/exercises) : 30 questions au plus. */
    static final int MAX_TYPED_QUESTIONS = 30;
    static final int MAX_VOCABULARY = 100;

    public record Settings(List<String> expectedCompetences, String successCriteria, int passPercent, int reviewMinutes,
                           int midtermMinutes, int finalMinutes) {}

    public record Diagnostic(String title, String description, List<Question> questions) {}

    /** vocabulary : lexique structuré du module (vide dans l'ancien format). */
    public record Module(String id, String title, String objective, List<String> prerequisites, List<Activity> activities,
                         List<VocabularyEntry> vocabulary) {
        public Module(String id, String title, String objective, List<String> prerequisites, List<Activity> activities) {
            this(id, title, objective, prerequisites, activities, List.of());
        }
    }

    /** mission : définition d'une activité « mission » (null pour les autres types). */
    public record Activity(String id, String kind, String title, int estimatedMinutes, List<String> competences,
                           Lesson lesson, List<Question> questions, List<Placement> placements, Mission mission) {
        public Activity(String id, String kind, String title, int estimatedMinutes, List<String> competences,
                        Lesson lesson, List<Question> questions, List<Placement> placements) {
            this(id, kind, title, estimatedMinutes, competences, lesson, questions, placements, null);
        }
    }

    public record Lesson(String title, String description, String transcript) {}

    /**
     * Question : type choice (null dans l'ancien format), fill, order, match, dictation ou speak. Les choix portent
     * le corrigé d'une question « choice » ; spec porte la clé des autres types. explanation est affichée après la
     * remise, avec le corrigé.
     */
    public record Question(String id, String type, String prompt, String moduleRef, String explanation,
                           List<Option> options, QuestionSpecs.Spec spec) {
        public Question(String id, String prompt, String moduleRef, List<Option> options) {
            this(id, QuestionSpecs.CHOICE, prompt, moduleRef, null, options, null);
        }
    }

    /** feedback : retour affiché après la remise si l'élève a choisi ce choix (absent s'il n'y en a pas). */
    public record Option(String id, String label, boolean correct,
                         @JsonInclude(JsonInclude.Include.NON_NULL) String feedback) {
        public Option(String id, String label, boolean correct) {
            this(id, label, correct, null);
        }
    }

    public record Placement(String assetId, int assetVersion, String usage, String alt, String caption,
                            String transcriptVisibility, boolean decorative, String questionId, String optionId) {}

    /**
     * Mission : production orale (oral) et/ou écrite (written) remise dans l'application, avec la liste de
     * vérification que l'élève coche avant l'envoi. La situation et la consigne sont dans la leçon de l'activité.
     */
    public record Mission(Oral oral, Written written, List<String> checklist) {
        /** Valeurs par défaut (2 min, 1 500 caractères, aucun minimum de mots) et textes sans espaces de bord. */
        Mission normalized() {
            return new Mission(
                    oral == null ? null : new Oral(text(oral.prompt()), oral.maxSeconds() == null ? 120 : oral.maxSeconds()),
                    written == null ? null : new Written(text(written.prompt()),
                            written.maxChars() == null ? 1500 : written.maxChars(),
                            written.minWords() == null ? 0 : written.minWords()),
                    nonNull(checklist).stream().map(VersionDocument::text).toList());
        }
    }

    /** Partie orale : enregistrement de 30 à 120 secondes. */
    public record Oral(String prompt, Integer maxSeconds) {}

    /** Partie écrite : texte de 200 à 1 500 caractères au plus, avec un nombre minimal de mots (0 à 200). */
    public record Written(String prompt, Integer maxChars, Integer minWords) {}

    /**
     * Entrée du vocabulaire d'un module. article : der, die, das ou null ; note : précision courte (« + accusatif »,
     * « séparable : an|fangen », « toujours au pluriel »).
     */
    public record VocabularyEntry(String id, String word, String article, String plural, String partOfSpeech,
                                  String translation, String example, String note, VocabularyAudio audio) {}

    /** Son d'une entrée : segment [start, end] (secondes) d'une version de média, publiée avec le parcours. */
    public record VocabularyAudio(String assetId, int assetVersion, double start, double end) {}

    /** Bilan intermédiaire (midterm) ou examen blanc (final) : une partie par compétence. */
    public record Assessment(String kind, String title, String description, List<Part> parts) {}

    /**
     * Partie d'évaluation : questions fermées corrigées automatiquement (closed), ou production écrite (written)
     * ou orale (oral) corrigée avec la grille de critères.
     */
    public record Part(String id, String competence, String mode, String title, String instructions,
                       List<Question> questions, List<Criterion> criteria, List<Placement> placements) {}

    /** Critère de la grille de correction d'une production, noté sur maxPoints. */
    public record Criterion(String id, String label, int maxPoints) {}

    /** Version précise d'un média référencée par la version de parcours. */
    public record MediaRef(String assetId, int version) {}

    /** Point à compléter avant publication : chemin dans le document et explication. */
    public record Issue(String path, String message) {}

    public record Checks(boolean publishable, List<Issue> issues) {}

    /** Contrôle de structure à l'enregistrement : identifiants, tailles et valeurs connues (un brouillon peut être incomplet). */
    static void checkStructure(Settings settings, Diagnostic diagnostic, List<Module> modules) {
        checkStructure(settings, diagnostic, modules, List.of());
    }

    static void checkStructure(Settings settings, Diagnostic diagnostic, List<Module> modules, List<Assessment> assessments) {
        if (settings == null || modules == null) throw HttpError.badRequest("Le document de version est incomplet.");
        if (modules.size() > 60) throw HttpError.badRequest("Un parcours compte 60 modules au plus.");
        if (!COMPETENCES.containsAll(nonNull(settings.expectedCompetences()))) {
            throw HttpError.badRequest("Compétence inconnue dans les réglages.");
        }
        if (text(settings.successCriteria()).length() > 2000 || settings.passPercent() < 1 || settings.passPercent() > 100
                || settings.reviewMinutes() < 0 || settings.reviewMinutes() > 120 || settings.midtermMinutes() < 0
                || settings.midtermMinutes() > 240 || settings.finalMinutes() < 0 || settings.finalMinutes() > 300) {
            throw HttpError.badRequest("Vérifiez les critères, le seuil de réussite et les durées des évaluations.");
        }
        Set<String> moduleIds = new HashSet<>();
        Set<String> activityIds = new HashSet<>();
        for (Module module : modules) {
            requireId(module == null ? null : module.id(), "module");
            if (!moduleIds.add(module.id())) throw HttpError.badRequest("Deux modules portent l’identifiant " + module.id() + ".");
            if (text(module.title()).length() > 120 || text(module.objective()).length() > 500) {
                throw HttpError.badRequest("Titre ou objectif trop long dans le module " + module.id() + ".");
            }
            checkVocabulary(module);
            for (Activity activity : nonNull(module.activities())) {
                requireId(activity == null ? null : activity.id(), "activité");
                // Le planning réserve les révisions de module (revision-…), le bilan et l’examen blanc.
                if (activity.id().length() > 40 || activity.id().startsWith("revision-")
                        || Set.of("diagnostic", "bilan-intermediaire", "examen-blanc").contains(activity.id())) {
                    throw HttpError.badRequest("L’identifiant d’activité " + activity.id() + " est trop long ou réservé.");
                }
                if (!activityIds.add(activity.id())) {
                    throw HttpError.badRequest("Deux activités portent l’identifiant " + activity.id() + ".");
                }
                if (!KINDS.contains(activity.kind()) || activity.estimatedMinutes() < 1 || activity.estimatedMinutes() > 240
                        || text(activity.title()).length() > 120 || !COMPETENCES.containsAll(nonNull(activity.competences()))) {
                    throw HttpError.badRequest("Vérifiez le type, le titre, la durée et les compétences de l’activité " + activity.id() + ".");
                }
                checkMissionStructure(activity);
                checkQuestions(activity.questions(), "l’activité " + activity.id());
                checkPlacements(activity.placements(), activity.questions(), "l’activité " + activity.id());
            }
        }
        if (diagnostic != null) checkQuestions(diagnostic.questions(), "diagnostic");
        Set<String> kinds = new HashSet<>();
        for (Assessment assessment : nonNull(assessments)) {
            if (assessment == null || !ASSESSMENT_KINDS.contains(assessment.kind()) || !kinds.add(assessment.kind())
                    || text(assessment.title()).length() > 120 || text(assessment.description()).length() > 2000
                    || nonNull(assessment.parts()).size() > 12) {
                throw HttpError.badRequest("Un parcours compte au plus un bilan et un examen blanc, de 12 parties au plus.");
            }
            Set<String> partIds = new HashSet<>();
            for (Part part : nonNull(assessment.parts())) {
                requireId(part == null ? null : part.id(), "partie");
                if (!partIds.add(part.id()) || !COMPETENCES.contains(part.competence()) || !MODES.contains(part.mode())
                        || text(part.title()).length() > 120 || text(part.instructions()).length() > 4000
                        || nonNull(part.criteria()).size() > 10) {
                    throw HttpError.badRequest("Vérifiez la compétence, le type et les consignes de la partie " + part.id() + ".");
                }
                checkQuestions(part.questions(), "la partie " + part.id());
                Set<String> criterionIds = new HashSet<>();
                for (Criterion criterion : nonNull(part.criteria())) {
                    requireId(criterion == null ? null : criterion.id(), "critère");
                    if (!criterionIds.add(criterion.id()) || text(criterion.label()).length() > 200
                            || criterion.maxPoints() < 1 || criterion.maxPoints() > 100) {
                        throw HttpError.badRequest("Vérifiez la grille de la partie " + part.id() + ".");
                    }
                }
                checkPlacements(part.placements(), part.questions(), "la partie " + part.id());
            }
        }
    }

    /** Une mission ne porte pas de questions ; seule une activité « mission » porte une définition de mission. */
    private static void checkMissionStructure(Activity activity) {
        Mission mission = activity.mission();
        boolean isMission = "mission".equals(activity.kind());
        if (mission != null && !isMission) {
            throw HttpError.badRequest("Seule une activité de type mission porte une mission (" + activity.id() + ").");
        }
        if (isMission && !nonNull(activity.questions()).isEmpty()) {
            throw HttpError.badRequest("Une mission ne comporte pas de questions : retirez-les de " + activity.id() + ".");
        }
        if (mission == null) return;
        Oral oral = mission.oral();
        Written written = mission.written();
        if (oral != null && (text(oral.prompt()).length() > 1000
                || oral.maxSeconds() != null && (oral.maxSeconds() < 30 || oral.maxSeconds() > 120))
                || written != null && (text(written.prompt()).length() > 1000
                || written.maxChars() != null && (written.maxChars() < 200 || written.maxChars() > 1500)
                || written.minWords() != null && (written.minWords() < 0 || written.minWords() > 200))
                || nonNull(mission.checklist()).size() > 6
                || nonNull(mission.checklist()).stream().anyMatch(item -> item == null || text(item).length() > 160)) {
            throw HttpError.badRequest("Vérifiez la mission " + activity.id()
                    + " : enregistrement de 30 à 120 s, texte de 200 à 1 500 caractères, 6 points de vérification au plus.");
        }
    }

    private static void checkVocabulary(Module module) {
        List<VocabularyEntry> entries = nonNull(module.vocabulary());
        if (entries.size() > MAX_VOCABULARY) {
            throw HttpError.badRequest("Le vocabulaire du module " + module.id() + " compte " + MAX_VOCABULARY + " entrées au plus.");
        }
        Set<String> ids = new HashSet<>();
        for (VocabularyEntry entry : entries) {
            requireId(entry == null ? null : entry.id(), "mot du vocabulaire");
            VocabularyAudio audio = entry.audio();
            if (!ids.add(entry.id()) || text(entry.word()).length() > 80 || entry.article() != null && !ARTICLES.contains(entry.article())
                    || text(entry.plural()).length() > 80
                    || entry.partOfSpeech() != null && !PARTS_OF_SPEECH.contains(entry.partOfSpeech())
                    || text(entry.translation()).length() > 160 || text(entry.example()).length() > 300
                    || text(entry.note()).length() > 120
                    || audio != null && (audio.assetId() == null || !audio.assetId().matches("[a-z0-9-]{1,64}")
                            || audio.assetVersion() < 1 || audio.assetVersion() > 9999 || !(audio.start() >= 0)
                            || !(audio.end() > audio.start()) || audio.end() > 3600)) {
                throw HttpError.badRequest("Vérifiez le mot « " + text(entry.word()) + " » du vocabulaire du module " + module.id() + ".");
            }
        }
    }

    /** Un support vise un média versionné et, au besoin, une question ou un choix de réponse de son activité. */
    private static void checkPlacements(List<Placement> placements, List<Question> questions, String owner) {
        Map<String, Set<String>> options = new HashMap<>();
        for (Question question : nonNull(questions)) {
            Set<String> ids = new HashSet<>();
            nonNull(question.options()).forEach(option -> ids.add(option.id()));
            options.put(question.id(), ids);
        }
        for (Placement placement : nonNull(placements)) {
            if (placement == null || placement.assetId() == null || !placement.assetId().matches("[a-z0-9-]{1,64}")
                    || placement.assetVersion() < 1 || placement.assetVersion() > 9999 || !USAGES.contains(placement.usage())
                    || !TRANSCRIPTS.contains(placement.transcriptVisibility())
                    || text(placement.alt()).length() > 300 || text(placement.caption()).length() > 300
                    || placement.questionId() != null && !options.containsKey(placement.questionId())
                    || placement.optionId() != null && (placement.questionId() == null
                            || !options.get(placement.questionId()).contains(placement.optionId()))) {
                throw HttpError.badRequest("Un support de " + owner + " est invalide.");
            }
        }
    }

    private static void checkQuestions(List<Question> questions, String owner) {
        Set<String> ids = new HashSet<>();
        for (Question question : nonNull(questions)) {
            requireId(question == null ? null : question.id(), "question");
            if (!ids.add(question.id()) || text(question.prompt()).length() > 500 || nonNull(question.options()).size() > 8
                    || question.moduleRef() != null && !question.moduleRef().matches(ID)) {
                throw HttpError.badRequest("Vérifiez les questions de " + owner + ".");
            }
            Set<String> optionIds = new HashSet<>();
            for (Option option : nonNull(question.options())) {
                requireId(option == null ? null : option.id(), "choix");
                if (!optionIds.add(option.id()) || text(option.label()).length() > 300) {
                    throw HttpError.badRequest("Vérifiez les choix de la question " + question.id() + ".");
                }
            }
            QuestionSpecs.checkStructure(question, owner);
        }
    }

    /** Complétude exigée à la publication (DEV-056) : tout ce qui manque est listé, rien n'est bloqué en silence. */
    static Checks check(Settings settings, Diagnostic diagnostic, List<Module> modules) {
        return check(settings, diagnostic, modules, List.of());
    }

    static Checks check(Settings settings, Diagnostic diagnostic, List<Module> modules, List<Assessment> assessments) {
        List<Issue> issues = new ArrayList<>();
        if (modules.isEmpty()) issues.add(new Issue("modules", "Ajoutez au moins un module."));
        if (text(settings.successCriteria()).isBlank()) issues.add(new Issue("settings.successCriteria", "Rédigez les critères de réussite."));
        if (nonNull(settings.expectedCompetences()).isEmpty()) {
            issues.add(new Issue("settings.expectedCompetences", "Indiquez les compétences évaluées."));
        }
        Set<String> moduleIds = new HashSet<>();
        modules.forEach(module -> moduleIds.add(module.id()));
        Map<String, List<String>> graph = new HashMap<>();
        for (int m = 0; m < modules.size(); m++) {
            Module module = modules.get(m);
            String path = "modules[" + m + "]";
            if (text(module.title()).isBlank()) issues.add(new Issue(path + ".title", "Donnez un titre au module " + module.id() + "."));
            if (text(module.objective()).isBlank()) {
                issues.add(new Issue(path + ".objective", "Décrivez ce que l’élève saura faire après « " + text(module.title()) + " »."));
            }
            for (String prerequisite : nonNull(module.prerequisites())) {
                if (!moduleIds.contains(prerequisite) || prerequisite.equals(module.id())) {
                    issues.add(new Issue(path + ".prerequisites", "Le prérequis « " + prerequisite + " » n’est pas un autre module du parcours."));
                }
            }
            graph.put(module.id(), nonNull(module.prerequisites()));
            if (nonNull(module.activities()).isEmpty()) {
                issues.add(new Issue(path + ".activities", "Ajoutez au moins une activité au module « " + text(module.title()) + " »."));
            }
            checkVocabularyComplete(module, path, issues);
            for (int a = 0; a < nonNull(module.activities()).size(); a++) {
                Activity activity = module.activities().get(a);
                String at = path + ".activities[" + a + "]";
                if (text(activity.title()).isBlank()) issues.add(new Issue(at + ".title", "Donnez un titre à l’activité " + activity.id() + "."));
                if ("lesson".equals(activity.kind()) && (activity.lesson() == null || text(activity.lesson().title()).isBlank()
                        || text(activity.lesson().description()).isBlank())) {
                    issues.add(new Issue(at + ".lesson", "Rédigez le titre et le texte de la leçon « " + text(activity.title()) + " »."));
                }
                if ("exercise".equals(activity.kind()) || "assessment".equals(activity.kind())) {
                    if (nonNull(activity.questions()).isEmpty()) {
                        issues.add(new Issue(at + ".questions", "Ajoutez au moins une question à « " + text(activity.title()) + " »."));
                    }
                    boolean typed = nonNull(activity.questions()).stream()
                            .anyMatch(question -> !QuestionSpecs.CHOICE.equals(QuestionSpecs.typeOf(question)));
                    if (typed && activity.questions().size() > MAX_TYPED_QUESTIONS) {
                        issues.add(new Issue(at + ".questions", "Un exercice typé compte " + MAX_TYPED_QUESTIONS
                                + " questions au plus : partagez « " + text(activity.title()) + " »."));
                    }
                    checkAnswers(activity.questions(), activity.placements(), at, issues, false);
                }
                if ("mission".equals(activity.kind())) checkMission(activity, at, issues);
                checkAlternatives(activity.placements(), at, issues);
            }
        }
        if (hasCycle(graph)) issues.add(new Issue("modules", "Les prérequis des modules forment une boucle."));
        if (diagnostic != null) {
            if (nonNull(diagnostic.questions()).isEmpty()) issues.add(new Issue("diagnostic", "Ajoutez des questions au diagnostic ou retirez-le."));
            for (int q = 0; q < nonNull(diagnostic.questions()).size(); q++) {
                Question question = diagnostic.questions().get(q);
                if (question.moduleRef() == null || !moduleIds.contains(question.moduleRef()) && !"prerequis".equals(question.moduleRef())) {
                    issues.add(new Issue("diagnostic.questions[" + q + "].moduleRef",
                            "Rattachez la question « " + text(question.prompt()) + " » à un module ou au prérequis."));
                }
            }
            checkAnswers(diagnostic.questions(), List.of(), "diagnostic", issues, true);
        }
        for (int e = 0; e < nonNull(assessments).size(); e++) {
            Assessment assessment = assessments.get(e);
            String at = "assessments[" + e + "]";
            String name = "midterm".equals(assessment.kind()) ? "bilan intermédiaire" : "examen blanc";
            if (text(assessment.title()).isBlank()) issues.add(new Issue(at + ".title", "Donnez un titre au " + name + "."));
            if (nonNull(assessment.parts()).isEmpty()) issues.add(new Issue(at + ".parts", "Ajoutez au moins une partie au " + name + "."));
            for (int p = 0; p < nonNull(assessment.parts()).size(); p++) {
                Part part = assessment.parts().get(p);
                String partAt = at + ".parts[" + p + "]";
                String label = "« " + (text(part.title()).isBlank() ? part.id() : text(part.title())) + " » du " + name;
                if (text(part.title()).isBlank()) {
                    issues.add(new Issue(partAt + ".title", "Donnez un titre à la partie " + part.id() + " du " + name + "."));
                }
                boolean production = "written".equals(part.mode()) || "oral".equals(part.mode());
                String expected = "written".equals(part.mode()) ? "expression-ecrite" : "expression-orale";
                if (production && !expected.equals(part.competence())) {
                    issues.add(new Issue(partAt + ".competence", "La partie " + label + " doit évaluer la compétence de sa production."));
                }
                if (!production && part.competence().startsWith("expression-")) {
                    issues.add(new Issue(partAt + ".mode", "La partie " + label + " évalue une production : choisissez écrit ou oral."));
                }
                if (production) {
                    if (text(part.instructions()).isBlank()) {
                        issues.add(new Issue(partAt + ".instructions", "Rédigez la consigne de la partie " + label + "."));
                    }
                    if (nonNull(part.criteria()).isEmpty()) {
                        issues.add(new Issue(partAt + ".criteria", "Ajoutez la grille de correction de la partie " + label + "."));
                    }
                    if (nonNull(part.criteria()).stream().anyMatch(criterion -> text(criterion.label()).isBlank())) {
                        issues.add(new Issue(partAt + ".criteria", "Chaque critère de la partie " + label + " doit avoir un libellé."));
                    }
                } else {
                    if (nonNull(part.questions()).isEmpty()) {
                        issues.add(new Issue(partAt + ".questions", "Ajoutez au moins une question à la partie " + label + "."));
                    }
                    checkAnswers(part.questions(), part.placements(), partAt, issues, true);
                }
                checkAlternatives(part.placements(), partAt, issues);
            }
        }
        return new Checks(issues.isEmpty(), List.copyOf(issues));
    }

    /** Mission complète : partie orale et/ou écrite avec leur consigne, 2 à 6 points de vérification, situation rédigée. */
    private static void checkMission(Activity activity, String at, List<Issue> issues) {
        String name = "« " + text(activity.title()) + " »";
        if (activity.lesson() == null || text(activity.lesson().description()).isBlank()) {
            issues.add(new Issue(at + ".lesson", "Rédigez la situation et la consigne de la mission " + name + "."));
        }
        Mission mission = activity.mission();
        if (mission == null || mission.oral() == null && mission.written() == null) {
            issues.add(new Issue(at + ".mission", "Prévoyez une partie orale ou écrite pour la mission " + name + "."));
            return;
        }
        if (mission.oral() != null && text(mission.oral().prompt()).isBlank()) {
            issues.add(new Issue(at + ".mission.oral.prompt", "Rédigez la consigne orale de la mission " + name + "."));
        }
        if (mission.written() != null && text(mission.written().prompt()).isBlank()) {
            issues.add(new Issue(at + ".mission.written.prompt", "Rédigez la consigne écrite de la mission " + name + "."));
        }
        List<String> checklist = nonNull(mission.checklist());
        if (checklist.size() < 2 || checklist.size() > 6 || checklist.stream().anyMatch(item -> text(item).isBlank())) {
            issues.add(new Issue(at + ".mission.checklist", "La mission " + name + " compte 2 à 6 points de vérification rédigés."));
        }
    }

    /** Vocabulaire publiable : mot, traduction et nature renseignés ; un nom a son article, sauf nom toujours au pluriel. */
    private static void checkVocabularyComplete(Module module, String path, List<Issue> issues) {
        List<VocabularyEntry> entries = nonNull(module.vocabulary());
        for (int v = 0; v < entries.size(); v++) {
            VocabularyEntry entry = entries.get(v);
            String at = path + ".vocabulary[" + v + "]";
            if (text(entry.word()).isBlank() || text(entry.translation()).isBlank() || entry.partOfSpeech() == null) {
                issues.add(new Issue(at, "Complétez le mot, sa traduction et sa nature (entrée " + entry.id() + " du module " + module.id() + ")."));
            } else if ("noun".equals(entry.partOfSpeech()) && entry.article() == null && !text(entry.note()).contains("pluriel")) {
                issues.add(new Issue(at + ".article", "Indiquez l’article du nom « " + text(entry.word()) + " »."));
            }
        }
    }

    private static void checkAlternatives(List<Placement> placements, String path, List<Issue> issues) {
        for (int p = 0; p < nonNull(placements).size(); p++) {
            Placement placement = placements.get(p);
            if ("illustration".equals(placement.usage()) && !placement.decorative() && text(placement.alt()).isBlank()) {
                issues.add(new Issue(path + ".placements[" + p + "].alt",
                        "Rédigez le texte alternatif de l’image " + placement.assetId() + " ou marquez-la comme décorative."));
            }
        }
    }

    /** Versions de médias à publier avec le parcours : supports des activités et des évaluations, sons du vocabulaire. */
    List<MediaRef> mediaRefs() {
        Set<MediaRef> refs = new java.util.LinkedHashSet<>();
        for (Module module : nonNull(modules)) {
            for (Activity activity : nonNull(module.activities())) {
                nonNull(activity.placements()).forEach(placement -> refs.add(new MediaRef(placement.assetId(), placement.assetVersion())));
            }
            for (VocabularyEntry entry : nonNull(module.vocabulary())) {
                if (entry.audio() != null) refs.add(new MediaRef(entry.audio().assetId(), entry.audio().assetVersion()));
            }
        }
        for (Assessment assessment : nonNull(assessments)) {
            for (Part part : nonNull(assessment.parts())) {
                nonNull(part.placements()).forEach(placement -> refs.add(new MediaRef(placement.assetId(), placement.assetVersion())));
            }
        }
        return List.copyOf(refs);
    }

    /**
     * Corrigés à la publication. Le diagnostic et les parties des évaluations restent en questions à choix
     * (choiceOnly) ; une dictée exige son son, masqué jusqu'à la réponse.
     */
    private static void checkAnswers(List<Question> questions, List<Placement> placements, String path, List<Issue> issues,
                                     boolean choiceOnly) {
        for (int q = 0; q < nonNull(questions).size(); q++) {
            Question question = questions.get(q);
            String at = path + ".questions[" + q + "]";
            String type = QuestionSpecs.typeOf(question);
            if (text(question.prompt()).isBlank()) issues.add(new Issue(at + ".prompt", "Rédigez l’énoncé de la question " + question.id() + "."));
            if (choiceOnly && !QuestionSpecs.CHOICE.equals(type)) {
                issues.add(new Issue(at + ".type", "Le diagnostic et les évaluations n’utilisent que des questions à choix ("
                        + question.id() + ")."));
                continue;
            }
            QuestionSpecs.checkComplete(question, at, issues);
            if (QuestionSpecs.DICTATION.equals(type)) {
                List<Placement> sounds = nonNull(placements).stream()
                        .filter(placement -> question.id().equals(placement.questionId()) && "audio".equals(placement.usage()))
                        .toList();
                if (sounds.isEmpty()) {
                    issues.add(new Issue(at, "Associez l’enregistrement de la dictée « " + text(question.prompt()) + " »."));
                } else if (sounds.stream().anyMatch(placement -> "on_demand".equals(placement.transcriptVisibility()))) {
                    issues.add(new Issue(at, "La transcription de la dictée « " + text(question.prompt())
                            + " » doit rester masquée jusqu’à la réponse."));
                }
            }
        }
    }

    private static boolean hasCycle(Map<String, List<String>> graph) {
        Map<String, Integer> state = new HashMap<>();
        for (String node : graph.keySet()) if (visit(node, graph, state)) return true;
        return false;
    }

    private static boolean visit(String node, Map<String, List<String>> graph, Map<String, Integer> state) {
        Integer current = state.get(node);
        if (current != null) return current == 1;
        state.put(node, 1);
        for (String next : graph.getOrDefault(node, List.of())) {
            if (graph.containsKey(next) && visit(next, graph, state)) return true;
        }
        state.put(node, 2);
        return false;
    }

    private static void requireId(String id, String what) {
        if (id == null || !id.matches(ID) || id.length() > 64) {
            throw HttpError.badRequest("Identifiant de " + what + " invalide : lettres minuscules, chiffres et tirets.");
        }
    }

    static String text(String value) {
        return value == null ? "" : value.strip();
    }

    static <T> List<T> nonNull(List<T> list) {
        return list == null ? List.of() : list;
    }
}
