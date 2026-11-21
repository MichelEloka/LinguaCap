package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.MissingNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.linguacap.assessment.PlacementResource.CompetenceScore;
import org.linguacap.assessment.PracticeResource.PartScore;
import org.linguacap.assessment.PracticeResource.PracticeResult;
import org.linguacap.assessment.PracticeResource.PracticeSummary;
import org.linguacap.assessment.PracticeResource.PracticeView;
import org.linguacap.common.HttpError;

/**
 * Règles de l'examen d'entraînement en accès libre : seul le bilan intermédiaire est proposé (l'examen blanc est
 * l'examen de passage de niveau, réservé au parcours) ; seules les parties fermées sont corrigées, l'écrit et l'oral
 * sont affichés en auto-entraînement ; le résultat donne un score par partie et par compétence, jamais le corrigé ;
 * nouvel essai 12 h après une remise.
 */
final class PracticeRules {
    static final String MIDTERM = "midterm";
    static final String FINAL = "final";
    static final Duration RETRY_DELAY = Duration.ofHours(12);
    static final int DEFAULT_PASS_PERCENT = 60;
    static final String FINAL_REFUSAL = "L’examen blanc est l’examen de passage de niveau : il se passe uniquement dans "
            + "votre parcours. En entraînement libre, vous pouvez refaire le bilan intermédiaire.";

    private PracticeRules() {}

    /** Résultat d'une remise : pourcentage des parties fermées, réussite, points par partie et par compétence. */
    record Scored(int percent, boolean passed, Map<String, PartScore> parts, Map<String, CompetenceScore> competences) {}

    /** Type demandé : bilan intermédiaire seulement ; l'examen blanc est refusé explicitement (409). */
    static void checkKind(String kind) {
        if (!MIDTERM.equals(kind) && !FINAL.equals(kind)) {
            throw HttpError.badRequest("Indiquez la version et l’évaluation : bilan intermédiaire.");
        }
        if (FINAL.equals(kind)) throw HttpError.conflict(FINAL_REFUSAL);
    }

    /** Un entraînement corrige au moins une question fermée. */
    static void checkPracticable(JsonNode definition) {
        for (JsonNode part : definition.path("parts")) {
            if (ExamRules.CLOSED.equals(part.path("mode").asText()) && !part.path("questions").isEmpty()) return;
        }
        throw HttpError.conflict("Ce bilan ne comporte pas encore de questions corrigées automatiquement.");
    }

    /** Nouvel essai au plus tôt 12 h après la dernière remise du même couple version/type ; null si permis. */
    static String retryRefusal(OffsetDateTime lastSubmittedAt, OffsetDateTime now) {
        if (lastSubmittedAt == null) return null;
        OffsetDateTime available = lastSubmittedAt.plus(RETRY_DELAY);
        if (!now.isBefore(available)) return null;
        return "Vous pourrez refaire cet entraînement à partir du " + PlacementRules.frenchDateTime(available) + ".";
    }

    static OffsetDateTime nextAttemptAt(OffsetDateTime submittedAt) {
        return submittedAt == null ? null : submittedAt.plus(RETRY_DELAY);
    }

    /**
     * Correction des parties fermées (ExamRules.closedScores) et décision au seuil de la version, comme un examen
     * blanc : score global au seuil et aucune compétence sous la moitié du seuil. L'écrit et l'oral ne comptent pas.
     */
    static Scored score(JsonNode definition, JsonNode answers) {
        Map<String, ExamRules.Score> closed = ExamRules.closedScores(definition, answers == null ? MissingNode.getInstance() : answers);
        ExamRules.Result result = ExamRules.result(definition, closed, passPercent(definition), FINAL);
        Map<String, PartScore> parts = new LinkedHashMap<>();
        closed.forEach((part, score) -> parts.put(part, new PartScore(score.points(), score.max())));
        Map<String, CompetenceScore> competences = new LinkedHashMap<>();
        result.scores().forEach((competence, score) -> competences.put(competence,
                new CompetenceScore(score.points(), score.max(), score.percent())));
        return new Scored(result.percent(), "validated".equals(result.decision()), parts, competences);
    }

    static ObjectNode scoresNode(ObjectMapper json, Scored scored) {
        ObjectNode node = json.createObjectNode().put("percent", scored.percent()).put("passed", scored.passed());
        ObjectNode parts = node.putObject("parts");
        scored.parts().forEach((part, score) -> parts.putObject(part).put("correct", score.correct()).put("total", score.total()));
        ObjectNode competences = node.putObject("competences");
        scored.competences().forEach((competence, score) -> competences.putObject(competence)
                .put("correct", score.correct()).put("total", score.total()).put("percent", score.percent()));
        return node;
    }

    /**
     * Définition remise à l'élève, recopiée champ par champ : choix sans corrigé, consignes et grilles de l'écrit et
     * de l'oral en auto-entraînement (selfPractice), supports numérotés.
     */
    static ObjectNode visibleDefinition(ObjectMapper json, JsonNode definition) {
        ObjectNode visible = json.createObjectNode();
        visible.put("title", definition.path("title").asText(""));
        visible.put("description", definition.path("description").asText(""));
        visible.put("levelCode", definition.path("levelCode").asText(null));
        visible.put("passPercent", passPercent(definition));
        ArrayNode parts = visible.putArray("parts");
        for (JsonNode part : definition.path("parts")) {
            String mode = part.path("mode").asText(ExamRules.CLOSED);
            ObjectNode copy = parts.addObject();
            copy.put("id", part.path("id").asText());
            copy.put("competence", part.path("competence").asText(""));
            copy.put("mode", mode);
            copy.put("title", part.path("title").asText(""));
            copy.put("instructions", part.path("instructions").asText(""));
            ArrayNode questions = copy.putArray("questions");
            for (JsonNode question : part.path("questions")) {
                ObjectNode visibleQuestion = questions.addObject();
                visibleQuestion.put("id", question.path("id").asText());
                visibleQuestion.put("prompt", question.path("prompt").asText(""));
                ArrayNode options = visibleQuestion.putArray("options");
                for (JsonNode option : question.path("options")) {
                    options.addObject().put("id", option.path("id").asText()).put("label", option.path("label").asText(""));
                }
            }
            ArrayNode placements = copy.putArray("placements");
            int position = 0;
            for (JsonNode placement : part.path("placements")) {
                boolean decorative = placement.path("decorative").asBoolean(false);
                placements.addObject().put("position", ++position)
                        .put("assetId", placement.path("assetId").asText())
                        .put("assetVersion", placement.path("assetVersion").asInt())
                        .put("usage", "audio".equals(placement.path("usage").asText()) ? "audio" : "illustration")
                        .put("alt", decorative ? null : blankToNull(placement.path("alt").asText(null)))
                        .put("caption", blankToNull(placement.path("caption").asText(null)))
                        .put("decorative", decorative)
                        .put("transcriptVisibility", placement.path("transcriptVisibility").asText("hidden"))
                        .put("questionId", blankToNull(placement.path("questionId").asText(null)))
                        .put("optionId", blankToNull(placement.path("optionId").asText(null)));
            }
            ArrayNode criteria = copy.putArray("criteria");
            for (JsonNode criterion : part.path("criteria")) {
                criteria.addObject().put("id", criterion.path("id").asText()).put("label", criterion.path("label").asText(""))
                        .put("maxPoints", criterion.path("maxPoints").asInt());
            }
            copy.put("selfPractice", !ExamRules.CLOSED.equals(mode));
        }
        return visible;
    }

    /** Supports de l'entraînement à demander à Médias : une entrée par version de fichier. */
    static List<Map<String, Object>> mediaRefs(JsonNode definition) {
        Map<String, Map<String, Object>> wanted = new LinkedHashMap<>();
        for (JsonNode part : definition.path("parts")) {
            for (JsonNode placement : part.path("placements")) {
                String assetId = placement.path("assetId").asText("");
                if (assetId.isBlank()) continue;
                int version = placement.path("assetVersion").asInt();
                wanted.put(assetId + "@" + version, Map.of("assetId", assetId, "version", version));
            }
        }
        return List.copyOf(wanted.values());
    }

    static PracticeView view(ObjectMapper json, PracticeStore.Attempt attempt, Map<String, String> media) {
        return new PracticeView(attempt.id(), attempt.learnerId(), attempt.trackVersionId(), attempt.levelCode(),
                attempt.kind(), "practice", attempt.status(), visibleDefinition(json, attempt.definition()),
                attempt.answers() == null ? json.createObjectNode() : attempt.answers(), media, result(attempt.scores()),
                text(attempt.startedAt()), text(attempt.submittedAt()), text(nextAttemptAt(attempt.submittedAt())));
    }

    static PracticeSummary summary(PracticeStore.Attempt attempt) {
        return new PracticeSummary(attempt.id(), attempt.trackVersionId(), attempt.levelCode(), attempt.kind(),
                attempt.status(), attempt.definition().path("title").asText(""), attempt.percent(),
                text(attempt.startedAt()), text(attempt.submittedAt()));
    }

    /** Résultat enregistré à la remise : agrégats seulement (aucune réponse attendue, aucune question marquée). */
    static PracticeResult result(JsonNode scores) {
        if (scores == null || !scores.isObject() || scores.isEmpty()) return null;
        Map<String, PartScore> parts = new LinkedHashMap<>();
        scores.path("parts").properties().forEach(entry -> parts.put(entry.getKey(),
                new PartScore(entry.getValue().path("correct").asInt(), entry.getValue().path("total").asInt())));
        Map<String, CompetenceScore> competences = new LinkedHashMap<>();
        scores.path("competences").properties().forEach(entry -> competences.put(entry.getKey(),
                new CompetenceScore(entry.getValue().path("correct").asInt(), entry.getValue().path("total").asInt(),
                        entry.getValue().path("percent").asInt())));
        return new PracticeResult(scores.path("percent").asInt(), scores.path("passed").asBoolean(false), parts, competences);
    }

    static int passPercent(JsonNode definition) {
        int value = definition.path("passPercent").asInt(DEFAULT_PASS_PERCENT);
        return value < 1 || value > 100 ? DEFAULT_PASS_PERCENT : value;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }
}
