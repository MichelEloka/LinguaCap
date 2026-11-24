package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.random.RandomGenerator;
import java.util.regex.Pattern;
import org.linguacap.assessment.PlacementResource.CompetenceScore;
import org.linguacap.assessment.PlacementResource.PlacementQuestion;
import org.linguacap.assessment.PlacementResource.PlacementResult;
import org.linguacap.assessment.PlacementResource.PlacementSummary;
import org.linguacap.assessment.PlacementResource.PlacementTier;
import org.linguacap.assessment.PlacementResource.PlacementView;
import org.linguacap.assessment.PlacementResource.QuestionOption;
import org.linguacap.assessment.PlacementResource.QuestionPlacement;
import org.linguacap.common.Cefr;
import org.linguacap.common.HttpError;

/**
 * Règles du test de niveau : tirage stratifié figé au démarrage pour tous les paliers, un palier à la fois, choix
 * « Je ne sais pas » compté faux, palier réussi au seuil global et sans compétence sous le seuil minimal, arrêt au
 * premier palier échoué, niveau placé, reprise après 24 h et remises rejouées par clé. Aucune vue ne porte de corrigé.
 */
final class PlacementRules {
    static final String DONT_KNOW = "dontknow";
    static final String BEGINNER = Cefr.BEGINNER;
    static final Duration RETAKE_DELAY = Duration.ofHours(24);
    static final int DEFAULT_PASS_PERCENT = 67;
    static final int DEFAULT_MIN_COMPETENCE_PERCENT = 34;
    static final int DEFAULT_DRAW_COUNT = 12;
    private static final Pattern LANGUAGE = Pattern.compile("[a-z]{2}");
    private static final ZoneId PILOT_ZONE = ZoneId.of("Europe/Paris");
    private static final String[] MONTHS = {"janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
        "septembre", "octobre", "novembre", "décembre"};

    private PlacementRules() {}

    /** Résultat d'un palier remis : bonnes réponses, pourcentage, détail par compétence et réussite. */
    record TierResult(int correct, int total, int percent, Map<String, CompetenceScore> competences, boolean passed) {}

    /** Nouvel état d'une tentative après la remise d'un palier. */
    record Transition(ObjectNode answers, ObjectNode tierResults, ObjectNode submitKeys, ObjectNode savedAnswers,
                      String currentTier, String status, String placedLevel) {
        boolean completed() {
            return "completed".equals(status);
        }
    }

    /** Adresse temporaire d'un support (son, image) servie par Médias. */
    record MediaFile(String url, String mimeType) {}

    /** Langue du test : celle de l'élève ; une langue demandée qui diffère de la sienne est refusée. */
    static String language(String requested, String profileLanguage) {
        if (requested != null && !LANGUAGE.matcher(requested).matches()) throw HttpError.badRequest("Langue invalide.");
        String own = profileLanguage == null || profileLanguage.isBlank() ? null : profileLanguage;
        if (requested != null && own != null && !requested.equals(own)) {
            throw HttpError.conflict("Le test de niveau porte sur la langue que vous apprenez.");
        }
        String language = requested != null ? requested : own;
        if (language == null) throw HttpError.conflict("Choisissez d’abord la langue que vous souhaitez apprendre.");
        return language;
    }

    // --- Tirage -----------------------------------------------------------------------------------------------

    /**
     * Fige le tirage de tous les paliers de la banque publiée, corrigés compris : par palier, drawCount questions
     * réparties entre les compétences au prorata de la banque (12 parmi 12 lecture et 6 écoute : 8 et 4), tirées au
     * hasard, regroupées par compétence ; l'ordre des choix est mélangé. Paliers rangés A1 → C2.
     */
    static ObjectNode draw(ObjectMapper json, JsonNode test, RandomGenerator random) {
        ObjectNode definition = json.createObjectNode();
        definition.put("testId", test.path("id").asText(null));
        definition.put("testNumber", test.path("number").asInt());
        definition.put("title", test.path("title").asText(""));
        definition.put("description", test.path("description").asText(""));
        ArrayNode tiers = definition.putArray("tiers");
        Map<String, JsonNode> byCode = new LinkedHashMap<>();
        for (JsonNode tier : test.path("tiers")) {
            String code = tier.path("code").asText("");
            if (Cefr.isLevel(code) && !byCode.containsKey(code)) byCode.put(code, tier);
        }
        List<String> codes = new ArrayList<>(byCode.keySet());
        codes.sort(Cefr.ORDER);
        for (String code : codes) {
            JsonNode tier = byCode.get(code);
            List<JsonNode> bank = new ArrayList<>();
            Set<String> ids = new HashSet<>();
            for (JsonNode question : tier.path("questions")) {
                if (answerable(question) && ids.add(question.path("id").asText())) bank.add(question);
            }
            if (bank.isEmpty()) continue;
            ObjectNode drawn = tiers.addObject();
            drawn.put("code", code);
            drawn.put("title", tier.path("title").asText(""));
            drawn.put("passPercent", bounded(tier.path("passPercent").asInt(DEFAULT_PASS_PERCENT), 1, 100));
            drawn.put("minCompetencePercent", bounded(tier.path("minCompetencePercent").asInt(DEFAULT_MIN_COMPETENCE_PERCENT), 0, 100));
            int drawCount = tier.path("drawCount").asInt(DEFAULT_DRAW_COUNT);
            drawn.put("drawCount", drawCount);
            ArrayNode questions = drawn.putArray("questions");
            for (JsonNode question : drawQuestions(bank, drawCount, random)) questions.add(frozen(json, question, random));
        }
        return definition;
    }

    /**
     * Quotas du tirage par compétence (méthode du plus fort reste) : chaque compétence de la banque reçoit au moins
     * une question dès que le nombre de questions tirées le permet. Un nombre hors bornes tire toute la banque.
     */
    static Map<String, Integer> quotas(Map<String, Integer> sizes, int drawCount) {
        int total = sizes.values().stream().mapToInt(Integer::intValue).sum();
        int count = drawCount <= 0 || drawCount > total ? total : drawCount;
        Map<String, Integer> quotas = new LinkedHashMap<>();
        if (count == total) {
            quotas.putAll(sizes);
            return quotas;
        }
        Map<String, Double> remainders = new HashMap<>();
        int assigned = 0;
        for (Map.Entry<String, Integer> entry : sizes.entrySet()) {
            double exact = (double) count * entry.getValue() / total;
            int floor = (int) Math.floor(exact);
            quotas.put(entry.getKey(), floor);
            remainders.put(entry.getKey(), exact - floor);
            assigned += floor;
        }
        List<String> order = new ArrayList<>(sizes.keySet());
        order.sort(Comparator.comparingDouble((String key) -> -remainders.get(key)));
        for (int i = 0; assigned < count; i = (i + 1) % order.size()) {
            String key = order.get(i);
            if (quotas.get(key) < sizes.get(key)) {
                quotas.merge(key, 1, Integer::sum);
                assigned++;
            }
        }
        if (count >= sizes.size()) {
            for (String key : sizes.keySet()) {
                if (quotas.get(key) > 0 || sizes.get(key) == 0) continue;
                String richest = quotas.entrySet().stream().max(Map.Entry.comparingByValue()).orElseThrow().getKey();
                if (quotas.get(richest) <= 1) break;
                quotas.merge(richest, -1, Integer::sum);
                quotas.put(key, 1);
            }
        }
        return quotas;
    }

    private static List<JsonNode> drawQuestions(List<JsonNode> bank, int drawCount, RandomGenerator random) {
        Map<String, List<JsonNode>> groups = new LinkedHashMap<>();
        for (JsonNode question : bank) groups.computeIfAbsent(competence(question), key -> new ArrayList<>()).add(question);
        Map<String, Integer> sizes = new LinkedHashMap<>();
        groups.forEach((competence, questions) -> sizes.put(competence, questions.size()));
        Map<String, Integer> quotas = quotas(sizes, drawCount);
        List<JsonNode> drawn = new ArrayList<>();
        groups.forEach((competence, questions) -> {
            List<JsonNode> shuffled = new ArrayList<>(questions);
            shuffle(shuffled, random);
            drawn.addAll(shuffled.subList(0, quotas.getOrDefault(competence, 0)));
        });
        return drawn;
    }

    /** Question figée dans la tentative : corrigé conservé pour la correction, choix dans un ordre tiré au hasard. */
    private static ObjectNode frozen(ObjectMapper json, JsonNode question, RandomGenerator random) {
        ObjectNode copy = json.createObjectNode();
        copy.put("id", question.path("id").asText());
        copy.put("competence", competence(question));
        copy.put("moduleRef", question.path("moduleRef").asText(null));
        copy.put("prompt", question.path("prompt").asText(""));
        List<JsonNode> options = new ArrayList<>();
        question.path("options").forEach(options::add);
        shuffle(options, random);
        ArrayNode frozenOptions = copy.putArray("options");
        for (JsonNode option : options) {
            frozenOptions.addObject().put("id", option.path("id").asText()).put("label", option.path("label").asText(""))
                    .put("correct", option.path("correct").asBoolean(false));
        }
        copy.set("placements", question.path("placements").isArray() ? question.path("placements").deepCopy()
                : json.createArrayNode());
        return copy;
    }

    /** Une question sans identifiant, sans deux choix ou sans bonne réponse ne peut pas être tirée. */
    private static boolean answerable(JsonNode question) {
        if (question.path("id").asText("").isBlank() || question.path("options").size() < 2) return false;
        Set<String> ids = new HashSet<>();
        int correct = 0;
        for (JsonNode option : question.path("options")) {
            String id = option.path("id").asText("");
            if (id.isBlank() || DONT_KNOW.equals(id) || !ids.add(id)) return false;
            if (option.path("correct").asBoolean(false)) correct++;
        }
        return correct == 1;
    }

    private static String competence(JsonNode question) {
        String competence = question.path("competence").asText("");
        return competence.isBlank() ? "lecture" : competence;
    }

    private static <T> void shuffle(List<T> items, RandomGenerator random) {
        for (int i = items.size() - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            T swap = items.get(i);
            items.set(i, items.get(j));
            items.set(j, swap);
        }
    }

    private static int bounded(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    // --- Paliers ----------------------------------------------------------------------------------------------

    static JsonNode tier(JsonNode definition, String code) {
        for (JsonNode tier : definition.path("tiers")) {
            if (tier.path("code").asText().equals(code)) return tier;
        }
        return null;
    }

    static String firstTier(JsonNode definition) {
        JsonNode tiers = definition.path("tiers");
        return tiers.isEmpty() ? null : tiers.get(0).path("code").asText();
    }

    static String nextTier(JsonNode definition, String code) {
        boolean found = false;
        for (JsonNode tier : definition.path("tiers")) {
            if (found) return tier.path("code").asText();
            found = tier.path("code").asText().equals(code);
        }
        return null;
    }

    /**
     * Réponses d'un palier : chaque clé est une question tirée du palier, chaque valeur l'un de ses choix ou
     * « dontknow ». À la remise, chaque question doit avoir une réponse.
     */
    static void checkAnswers(JsonNode tier, JsonNode answers, boolean complete) {
        if (answers == null || !answers.isObject()) throw HttpError.badRequest("Les réponses du palier sont requises.");
        Map<String, JsonNode> questions = new HashMap<>();
        for (JsonNode question : tier.path("questions")) questions.put(question.path("id").asText(), question);
        answers.properties().forEach(entry -> {
            JsonNode question = questions.get(entry.getKey());
            if (question == null || !entry.getValue().isTextual()
                    || !DONT_KNOW.equals(entry.getValue().asText()) && option(question, entry.getValue().asText()) == null) {
                throw HttpError.badRequest("Une réponse ne correspond pas à ce palier.");
            }
        });
        if (complete && answers.size() < questions.size()) {
            throw HttpError.badRequest("Répondez à chaque question du palier, ou choisissez « Je ne sais pas ».");
        }
    }

    /** Correction d'un palier : « Je ne sais pas » et l'absence de réponse comptent faux. */
    static TierResult score(JsonNode tier, JsonNode answers) {
        Map<String, int[]> byCompetence = new LinkedHashMap<>();
        int correct = 0;
        int total = 0;
        for (JsonNode question : tier.path("questions")) {
            int[] counts = byCompetence.computeIfAbsent(competence(question), key -> new int[2]);
            String chosen = answers.path(question.path("id").asText()).asText("");
            JsonNode option = DONT_KNOW.equals(chosen) ? null : option(question, chosen);
            boolean right = option != null && option.path("correct").asBoolean(false);
            counts[1]++;
            total++;
            if (right) {
                counts[0]++;
                correct++;
            }
        }
        int minimum = tier.path("minCompetencePercent").asInt(DEFAULT_MIN_COMPETENCE_PERCENT);
        Map<String, CompetenceScore> competences = new LinkedHashMap<>();
        boolean balanced = true;
        for (Map.Entry<String, int[]> entry : byCompetence.entrySet()) {
            CompetenceScore score = competence(entry.getValue()[0], entry.getValue()[1]);
            competences.put(entry.getKey(), score);
            balanced &= score.percent() >= minimum;
        }
        int percent = new ExamRules.Score(correct, total).percent();
        boolean passed = total > 0 && balanced && percent >= tier.path("passPercent").asInt(DEFAULT_PASS_PERCENT);
        return new TierResult(correct, total, percent, competences, passed);
    }

    /** Niveau placé : dernier palier réussi dans l'ordre du test, ou A0 si le premier palier n'est pas acquis. */
    static String placedLevel(JsonNode definition, JsonNode tierResults) {
        String placed = BEGINNER;
        for (JsonNode tier : definition.path("tiers")) {
            JsonNode result = tierResults.get(tier.path("code").asText());
            if (result == null || !result.path("passed").asBoolean(false)) break;
            placed = tier.path("code").asText();
        }
        return placed;
    }

    // --- Enregistrement et remise -----------------------------------------------------------------------------

    /** Palier visé par un enregistrement ou une remise : il doit être celui en cours. Renvoie sa définition. */
    static JsonNode openTier(PlacementStore.Attempt attempt, String tier) {
        if (!"in_progress".equals(attempt.status())) throw HttpError.conflict("Ce test de niveau est terminé.");
        JsonNode definition = tier == null ? null : tier(attempt.definition(), tier);
        if (definition == null) throw HttpError.badRequest("Indiquez un palier de ce test.");
        if (!tier.equals(attempt.currentTier())) {
            throw HttpError.conflict(attempt.tierResults().has(tier) ? "Ce palier est déjà remis : passez au palier suivant."
                    : "Ce palier n’est pas encore ouvert.");
        }
        return definition;
    }

    /**
     * Remise déjà traitée avec cette clé : vrai si c'est la même remise (l'état courant est renvoyé), conflit si la
     * clé a servi à d'autres réponses, faux pour une nouvelle remise.
     */
    static boolean replayed(JsonNode submitKeys, String key, String tier, JsonNode answers) {
        JsonNode previous = submitKeys == null ? null : submitKeys.get(key);
        if (previous == null) return false;
        if (previous.path("tier").asText().equals(tier) && previous.path("answers").equals(answers)) return true;
        throw HttpError.conflict("Cette clé de remise a déjà été utilisée pour d’autres réponses.");
    }

    /**
     * Remise d'un palier : correction, puis palier suivant si celui-ci est réussi et qu'il en reste un ; sinon fin du
     * test avec le niveau placé.
     */
    static Transition submit(ObjectMapper json, PlacementStore.Attempt attempt, String key, String tier, JsonNode answers) {
        JsonNode definition = openTier(attempt, tier);
        checkAnswers(definition, answers, true);
        TierResult result = score(definition, answers);
        ObjectNode allAnswers = object(json, attempt.answers());
        allAnswers.set(tier, answers.deepCopy());
        ObjectNode results = object(json, attempt.tierResults());
        results.set(tier, resultNode(json, result));
        ObjectNode keys = object(json, attempt.submitKeys());
        keys.putObject(key).put("tier", tier).set("answers", answers.deepCopy());
        ObjectNode saved = object(json, attempt.savedAnswers());
        saved.remove(tier);
        String next = result.passed() ? nextTier(attempt.definition(), tier) : null;
        if (next != null) return new Transition(allAnswers, results, keys, saved, next, "in_progress", null);
        return new Transition(allAnswers, results, keys, saved, null, "completed", placedLevel(attempt.definition(), results));
    }

    static ObjectNode resultNode(ObjectMapper json, TierResult result) {
        ObjectNode node = json.createObjectNode().put("correct", result.correct()).put("total", result.total())
                .put("percent", result.percent()).put("passed", result.passed());
        ObjectNode competences = node.putObject("competences");
        result.competences().forEach((competence, score) -> competences.putObject(competence)
                .put("correct", score.correct()).put("total", score.total()).put("percent", score.percent()));
        return node;
    }

    // --- Reprise ----------------------------------------------------------------------------------------------

    /** Nouvel essai au plus tôt 24 h après la fin du dernier test passé ; renvoie le refus, ou null si permis. */
    static String retakeRefusal(OffsetDateTime lastTestedAt, OffsetDateTime now) {
        if (lastTestedAt == null) return null;
        OffsetDateTime available = lastTestedAt.plus(RETAKE_DELAY);
        if (!now.isBefore(available)) return null;
        return "Vous pourrez repasser le test de niveau à partir du " + frenchDateTime(available) + ".";
    }

    /**
     * Date à partir de laquelle un nouvel essai est possible, pour une tentative terminée : 24 h après le dernier
     * test passé (« débutant déclaré » ne compte pas : aucune question n'a été vue).
     */
    static OffsetDateTime retakeAvailableAt(PlacementStore.Attempt attempt, OffsetDateTime lastTestedAt) {
        if (!"completed".equals(attempt.status())) return null;
        OffsetDateTime available = lastTestedAt == null ? attempt.completedAt() : lastTestedAt.plus(RETAKE_DELAY);
        return available.isBefore(attempt.completedAt()) ? attempt.completedAt() : available;
    }

    static String frenchDateTime(OffsetDateTime value) {
        ZonedDateTime local = value.atZoneSameInstant(PILOT_ZONE);
        return local.getDayOfMonth() + (local.getDayOfMonth() == 1 ? "er " : " ") + MONTHS[local.getMonthValue() - 1]
                + " à " + local.getHour() + " h " + String.format("%02d", local.getMinute());
    }

    // --- Vues -------------------------------------------------------------------------------------------------

    static String label(String level) {
        return Cefr.label(level);
    }

    /**
     * Niveaux publiés d'une langue d'après GET /v1/tracks (une version publiée par niveau) ; une version sans langue
     * date d'avant les parcours multi-langues : elle est en allemand.
     */
    static Set<String> publishedLevels(JsonNode tracks, String languageId) {
        Set<String> levels = new HashSet<>();
        if (tracks == null || !tracks.isArray()) return levels;
        for (JsonNode track : tracks) {
            String language = track.hasNonNull("languageId") ? track.path("languageId").asText() : "de";
            String code = track.path("levelCode").asText("");
            if (language.equals(languageId) && Cefr.isLevel(code)) levels.add(code);
        }
        return levels;
    }

    /** Résultat sans connaître les niveaux publiés (catalogue indisponible) : aucun niveau suivant n'est annoncé. */
    static PlacementResult result(PlacementStore.Attempt attempt) {
        return result(attempt, null);
    }

    /**
     * Résultat d'une tentative terminée, avec un résumé bienveillant ; null tant que le test est en cours.
     * published : niveaux publiés de la langue (catalogue), ou null s'ils sont inconnus. Le résumé n'annonce un niveau
     * comme ouvert que s'il est publié ; un niveau suivant non publié est annoncé « bientôt » ; sans catalogue, aucun
     * niveau suivant n'est annoncé.
     */
    static PlacementResult result(PlacementStore.Attempt attempt, Set<String> published) {
        if (!"completed".equals(attempt.status())) return null;
        String placed = attempt.placedLevel();
        if (attempt.declaredBeginner()) {
            return new PlacementResult(BEGINNER, label(BEGINNER), "Vous débutez dans cette langue : votre parcours "
                    + "commencera par les toutes premières bases, pas à pas.", false, true);
        }
        JsonNode tiers = attempt.definition().path("tiers");
        String last = tiers.isEmpty() ? null : tiers.get(tiers.size() - 1).path("code").asText();
        boolean beyond = placed.equals(last);
        String summary;
        if (BEGINNER.equals(placed)) {
            String first = firstTier(attempt.definition());
            summary = "Le palier " + (first == null ? Cefr.levelOfRank(1) : first) + " n’est pas encore acquis : votre "
                    + "parcours commencera par les bases, pas à pas.";
        } else if (beyond) {
            String next = Cefr.next(placed);
            summary = "Vous avez validé tous les paliers du test, jusqu’à " + placed + " : votre niveau dépasse peut-être "
                    + "ce qu’il mesure. Un professeur pourra l’affiner avec vous."
                    + (next != null && published != null && !published.contains(next)
                            ? " Le parcours " + next + " arrive bientôt." : "");
        } else {
            String next = Cefr.next(placed);
            String announce;
            if (next == null || published == null) announce = ".";
            else if (published.contains(next)) announce = " : votre parcours peut commencer au niveau " + next + ".";
            else announce = " : le parcours " + next + " arrive bientôt.";
            summary = "Vous avez validé le palier " + placed + announce;
        }
        return new PlacementResult(placed, label(placed), summary, beyond, false);
    }

    /**
     * Vue d'une tentative. Seul l'élève qui passe le test reçoit les questions du palier en cours et ses réponses
     * enregistrées, sans corrigé : chaque champ est recopié un à un, le champ « correct » des choix n'est jamais lu.
     */
    static PlacementView view(PlacementStore.Attempt attempt, boolean owner, Map<String, MediaFile> media,
                              OffsetDateTime retakeAvailableAt) {
        return view(attempt, owner, media, retakeAvailableAt, null);
    }

    /** Vue avec les niveaux publiés de la langue (null : inconnus), pour le résumé du résultat. */
    static PlacementView view(PlacementStore.Attempt attempt, boolean owner, Map<String, MediaFile> media,
                              OffsetDateTime retakeAvailableAt, Set<String> published) {
        boolean open = owner && "in_progress".equals(attempt.status());
        List<PlacementQuestion> questions = new ArrayList<>();
        Map<String, String> saved = new LinkedHashMap<>();
        if (open) {
            JsonNode current = tier(attempt.definition(), attempt.currentTier());
            if (current != null) {
                for (JsonNode question : current.path("questions")) questions.add(question(question, media));
            }
            attempt.savedAnswers().path(attempt.currentTier()).properties()
                    .forEach(entry -> saved.put(entry.getKey(), entry.getValue().asText()));
        }
        return new PlacementView(attempt.id(), attempt.learnerId(), attempt.languageId(), attempt.testId(),
                attempt.testNumber(), attempt.status(), attempt.currentTier(), tiers(attempt), questions, saved,
                result(attempt, published), text(attempt.startedAt()), text(attempt.completedAt()), text(retakeAvailableAt));
    }

    static List<PlacementTier> tiers(PlacementStore.Attempt attempt) {
        List<PlacementTier> tiers = new ArrayList<>();
        for (JsonNode tier : attempt.definition().path("tiers")) {
            String code = tier.path("code").asText();
            JsonNode result = attempt.tierResults().get(code);
            String status = result != null ? (result.path("passed").asBoolean(false) ? "passed" : "failed")
                    : code.equals(attempt.currentTier()) ? "current" : "locked";
            Map<String, CompetenceScore> competences = null;
            if (result != null) {
                competences = new LinkedHashMap<>();
                for (var entry : result.path("competences").properties()) {
                    competences.put(entry.getKey(), new CompetenceScore(entry.getValue().path("correct").asInt(),
                            entry.getValue().path("total").asInt(), entry.getValue().path("percent").asInt()));
                }
            }
            tiers.add(new PlacementTier(code, tier.path("title").asText(""), status, tier.path("questions").size(),
                    tier.path("passPercent").asInt(DEFAULT_PASS_PERCENT),
                    result == null ? null : result.path("correct").asInt(), result == null ? null : result.path("total").asInt(),
                    result == null ? null : result.path("percent").asInt(), competences));
        }
        return tiers;
    }

    static PlacementSummary summary(PlacementStore.Attempt attempt) {
        return new PlacementSummary(attempt.id(), attempt.languageId(), attempt.status(), attempt.placedLevel(),
                text(attempt.startedAt()), text(attempt.completedAt()));
    }

    /** Supports du palier en cours à demander à Médias : une entrée par version de fichier. */
    static List<Map<String, Object>> mediaRefs(PlacementStore.Attempt attempt) {
        Map<String, Map<String, Object>> wanted = new LinkedHashMap<>();
        JsonNode current = "in_progress".equals(attempt.status()) ? tier(attempt.definition(), attempt.currentTier()) : null;
        if (current == null) return List.of();
        for (JsonNode question : current.path("questions")) {
            for (JsonNode placement : question.path("placements")) {
                String assetId = placement.path("assetId").asText("");
                if (assetId.isBlank()) continue;
                int version = placement.path("assetVersion").asInt();
                wanted.put(assetId + "@" + version, Map.of("assetId", assetId, "version", version));
            }
        }
        return List.copyOf(wanted.values());
    }

    private static PlacementQuestion question(JsonNode question, Map<String, MediaFile> media) {
        List<QuestionOption> options = new ArrayList<>();
        for (JsonNode option : question.path("options")) {
            options.add(new QuestionOption(option.path("id").asText(), option.path("label").asText("")));
        }
        List<QuestionPlacement> placements = new ArrayList<>();
        int position = 0;
        for (JsonNode placement : question.path("placements")) {
            MediaFile file = media.get(placement.path("assetId").asText("") + "@" + placement.path("assetVersion").asInt());
            boolean decorative = placement.path("decorative").asBoolean(false);
            placements.add(new QuestionPlacement(++position, "audio".equals(placement.path("usage").asText()) ? "audio"
                    : "illustration", file == null ? null : file.url(), file == null ? null : file.mimeType(),
                    decorative ? null : blankToNull(placement.path("alt").asText(null)),
                    blankToNull(placement.path("caption").asText(null))));
        }
        return new PlacementQuestion(question.path("id").asText(), competence(question), question.path("prompt").asText(""),
                options, placements);
    }

    private static JsonNode option(JsonNode question, String optionId) {
        for (JsonNode option : question.path("options")) {
            if (option.path("id").asText().equals(optionId)) return option;
        }
        return null;
    }

    private static CompetenceScore competence(int correct, int total) {
        return new CompetenceScore(correct, total, new ExamRules.Score(correct, total).percent());
    }

    private static ObjectNode object(ObjectMapper json, JsonNode value) {
        return value != null && value.isObject() ? ((ObjectNode) value).deepCopy() : json.createObjectNode();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }
}
