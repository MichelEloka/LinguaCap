package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import org.linguacap.common.HttpError;

/**
 * Règles d'une tentative d'évaluation (DEV-061 à DEV-070) : version sans corrigé pour l'élève, autocorrection des
 * questions fermées, points de la grille pour l'écrit et l'oral, résultats par compétence et décision.
 */
final class ExamRules {
    static final String CLOSED = "closed";
    static final String WRITTEN = "written";
    static final String ORAL = "oral";
    static final int MAX_TEXT = 8000;

    private ExamRules() {}

    /** Points obtenus et maximum d'une compétence. */
    record Score(int points, int max) {
        int percent() {
            return max == 0 ? 0 : Math.round(100f * points / max);
        }
    }

    record Result(Map<String, Score> scores, int percent, String decision, List<String> weakCompetences) {}

    /** Champs de corrigé d'une question : jamais servis à l'élève (explications et retours compris). */
    private static final List<String> QUESTION_ANSWERS = List.of("correct", "explanation", "spec", "feedback", "accept",
            "answers", "pairs");
    private static final List<String> OPTION_ANSWERS = List.of("correct", "feedback");

    /** Définition remise à l'élève : ni corrigé des choix, ni explication, ni retour, ni clé de question typée. */
    static JsonNode withoutAnswers(JsonNode definition) {
        ObjectNode copy = definition.deepCopy();
        for (JsonNode part : copy.path("parts")) {
            for (JsonNode question : part.path("questions")) {
                if (question.isObject()) ((ObjectNode) question).remove(QUESTION_ANSWERS);
                for (JsonNode blank : question.path("blanks")) {
                    if (blank.isObject()) ((ObjectNode) blank).remove("accept");
                }
                for (JsonNode option : question.path("options")) {
                    if (option.isObject()) ((ObjectNode) option).remove(OPTION_ANSWERS);
                }
            }
        }
        return copy;
    }

    static boolean needsGrading(JsonNode definition) {
        for (JsonNode part : definition.path("parts")) {
            if (!CLOSED.equals(part.path("mode").asText())) return true;
        }
        return false;
    }

    static JsonNode part(JsonNode definition, String partId) {
        for (JsonNode part : definition.path("parts")) {
            if (part.path("id").asText().equals(partId)) return part;
        }
        return null;
    }

    /** Réponses enregistrées en cours de tentative : seuls les choix et parties de l'évaluation sont acceptés. */
    static void checkProgress(JsonNode definition, JsonNode answers, JsonNode texts) {
        if (answers != null && !answers.isNull()) {
            if (!answers.isObject()) throw HttpError.badRequest("Les réponses doivent être regroupées par partie.");
            answers.properties().forEach(entry -> {
                JsonNode part = part(definition, entry.getKey());
                if (part == null || !CLOSED.equals(part.path("mode").asText()) || !entry.getValue().isObject()) {
                    throw HttpError.badRequest("Une réponse ne correspond pas à cette évaluation.");
                }
                entry.getValue().properties().forEach(answer -> {
                    JsonNode question = question(part, answer.getKey());
                    if (question == null || !answer.getValue().isTextual() || !hasOption(question, answer.getValue().asText())) {
                        throw HttpError.badRequest("Une réponse ne correspond pas à cette évaluation.");
                    }
                });
            });
        }
        if (texts != null && !texts.isNull()) {
            if (!texts.isObject()) throw HttpError.badRequest("Les productions écrites sont regroupées par partie.");
            texts.properties().forEach(entry -> {
                JsonNode part = part(definition, entry.getKey());
                if (part == null || !WRITTEN.equals(part.path("mode").asText()) || !entry.getValue().isTextual()
                        || entry.getValue().asText().length() > MAX_TEXT) {
                    throw HttpError.badRequest("Une production écrite ne correspond pas à cette évaluation ou dépasse 8 000 caractères.");
                }
            });
        }
    }

    /** Ce qui manque avant la remise : chaque production écrite et orale est requise. */
    static List<String> missing(JsonNode definition, JsonNode texts, JsonNode recordings) {
        List<String> missing = new ArrayList<>();
        for (JsonNode part : definition.path("parts")) {
            String id = part.path("id").asText();
            String title = part.path("title").asText(id);
            if (WRITTEN.equals(part.path("mode").asText()) && texts.path(id).asText("").isBlank()) {
                missing.add("Rédigez la production écrite « " + title + " ».");
            }
            if (ORAL.equals(part.path("mode").asText()) && recordings.path(id).asText("").isBlank()) {
                missing.add("Enregistrez ou déposez la production orale « " + title + " ».");
            }
        }
        return missing;
    }

    /** Points des questions fermées, partie par partie : une question sans réponse compte faux. */
    static Map<String, Score> closedScores(JsonNode definition, JsonNode answers) {
        Map<String, Score> scores = new LinkedHashMap<>();
        for (JsonNode part : definition.path("parts")) {
            if (!CLOSED.equals(part.path("mode").asText())) continue;
            int points = 0;
            int max = 0;
            for (JsonNode question : part.path("questions")) {
                max++;
                String chosen = answers.path(part.path("id").asText()).path(question.path("id").asText()).asText("");
                for (JsonNode option : question.path("options")) {
                    if (option.path("correct").asBoolean(false) && option.path("id").asText().equals(chosen)) points++;
                }
            }
            scores.put(part.path("id").asText(), new Score(points, max));
        }
        return scores;
    }

    /**
     * Points de la grille saisis par le correcteur pour chaque production : chaque critère est noté entre 0 et son
     * maximum. Renvoie les points par partie.
     */
    static Map<String, Score> gradedScores(JsonNode definition, JsonNode grading) {
        Map<String, Score> scores = new LinkedHashMap<>();
        for (JsonNode part : definition.path("parts")) {
            String mode = part.path("mode").asText();
            if (CLOSED.equals(mode)) continue;
            String id = part.path("id").asText();
            JsonNode given = grading == null ? null : grading.path(id).path("points");
            if (given == null || !given.isObject()) {
                throw HttpError.badRequest("Notez chaque critère de la partie « " + part.path("title").asText(id) + " ».");
            }
            int points = 0;
            int max = 0;
            Set<String> criteria = new TreeSet<>();
            for (JsonNode criterion : part.path("criteria")) {
                String criterionId = criterion.path("id").asText();
                criteria.add(criterionId);
                int maxPoints = criterion.path("maxPoints").asInt();
                JsonNode value = given.get(criterionId);
                if (value == null || !value.isInt() || value.asInt() < 0 || value.asInt() > maxPoints) {
                    throw HttpError.badRequest("Le critère « " + criterion.path("label").asText(criterionId)
                            + " » se note de 0 à " + maxPoints + ".");
                }
                points += value.asInt();
                max += maxPoints;
            }
            given.fieldNames().forEachRemaining(name -> {
                if (!criteria.contains(name)) throw HttpError.badRequest("Un critère noté n’appartient pas à la grille.");
            });
            scores.put(id, new Score(points, max));
        }
        return scores;
    }

    /**
     * Résultat par compétence et décision. Un examen blanc est validé quand le score global atteint le seuil du
     * parcours et qu'aucune compétence n'est sous la moitié de ce seuil ; un bilan intermédiaire est « completed ».
     */
    static Result result(JsonNode definition, Map<String, Score> partScores, int passPercent, String kind) {
        Map<String, int[]> byCompetence = new LinkedHashMap<>();
        for (JsonNode part : definition.path("parts")) {
            Score score = partScores.get(part.path("id").asText());
            if (score == null) continue;
            int[] total = byCompetence.computeIfAbsent(part.path("competence").asText(), key -> new int[2]);
            total[0] += score.points();
            total[1] += score.max();
        }
        Map<String, Score> scores = new LinkedHashMap<>();
        int points = 0;
        int max = 0;
        List<String> weak = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : byCompetence.entrySet()) {
            Score score = new Score(entry.getValue()[0], entry.getValue()[1]);
            scores.put(entry.getKey(), score);
            points += score.points();
            max += score.max();
            if (score.percent() < passPercent) weak.add(entry.getKey());
        }
        int percent = new Score(points, max).percent();
        String decision;
        if ("midterm".equals(kind)) {
            decision = "completed";
        } else {
            boolean balanced = scores.values().stream().allMatch(score -> score.percent() * 2 >= passPercent);
            decision = percent >= passPercent && balanced ? "validated" : "to_consolidate";
        }
        return new Result(scores, percent, decision, weak);
    }

    /** Activités du parcours à revoir : celles qui travaillent une compétence restée sous le seuil. */
    static ArrayNode review(ObjectMapper mapper, JsonNode track, List<String> weakCompetences) {
        ArrayNode review = mapper.createArrayNode();
        if (weakCompetences.isEmpty()) return review;
        for (JsonNode module : track.path("modules")) {
            for (JsonNode activity : module.path("activities")) {
                boolean matches = false;
                for (JsonNode competence : activity.path("competences")) matches |= weakCompetences.contains(competence.asText());
                if (matches && review.size() < 20) {
                    review.addObject().put("activityId", activity.path("id").asText())
                            .put("title", activity.path("title").asText())
                            .put("moduleId", module.path("id").asText())
                            .put("moduleTitle", module.path("title").asText());
                }
            }
        }
        return review;
    }

    static ObjectNode scoresNode(ObjectMapper mapper, Map<String, Score> scores) {
        ObjectNode node = mapper.createObjectNode();
        scores.forEach((competence, score) -> node.putObject(competence).put("points", score.points())
                .put("max", score.max()).put("percent", score.percent()));
        return node;
    }

    private static JsonNode question(JsonNode part, String questionId) {
        for (JsonNode question : part.path("questions")) {
            if (question.path("id").asText().equals(questionId)) return question;
        }
        return null;
    }

    private static boolean hasOption(JsonNode question, String optionId) {
        for (JsonNode option : question.path("options")) {
            if (option.path("id").asText().equals(optionId)) return true;
        }
        return false;
    }
}
