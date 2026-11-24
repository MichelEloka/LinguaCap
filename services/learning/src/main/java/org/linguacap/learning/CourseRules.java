package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.linguacap.common.HttpError;
import org.linguacap.learning.CourseResource.MissionCriterion;
import org.linguacap.learning.CourseResource.MissionDefinition;
import org.linguacap.learning.CourseResource.MissionOral;
import org.linguacap.learning.CourseResource.MissionWritten;
import org.linguacap.learning.CourseResource.ReviewItem;
import org.linguacap.learning.CourseResource.ReviewScore;

/** Règles des séances, sans accès à la base : testées unitairement. */
final class CourseRules {
    /** Fuseau du pilote, en attendant le fuseau de l'élève (incrément 4). */
    static final ZoneId PILOT_ZONE = ZoneId.of("Europe/Paris");
    /** Heure d'échéance d'une séance dans la journée choisie. */
    static final LocalTime DUE_TIME = LocalTime.of(20, 0);
    static final int MAX_STATE_BYTES = 8192;
    /** Une mission est faite une fois remise : envoyée au correcteur, envoyée sans correcteur, ou déjà corrigée. */
    static final Set<String> MISSION_DONE = Set.of("submitted", "sent", "reviewed");
    /**
     * Clés d'un corrigé : jamais servies à l'élève avant la remise. Le catalogue n'en sert aucune dans ses vues ;
     * Apprentissage les retire encore par sécurité (catalogue plus ancien ou plus récent que prévu).
     */
    static final Set<String> ANSWER_KEYS = Set.of("correct", "accept", "answers", "pairs", "explanation", "feedback", "spec");
    /** Seuil de réussite par défaut d'une version (catalogue antérieur aux réglages de planification). */
    static final int DEFAULT_PASS_PERCENT = 60;
    /** Grille d'une mission : six critères au plus (bornes du catalogue). */
    static final int MAX_CRITERIA = 6;

    private CourseRules() {}

    /** État affiché : terminée, en retard, en cours ou à venir. */
    static String sessionStatus(OffsetDateTime startedAt, OffsetDateTime completedAt, OffsetDateTime dueAt,
                                OffsetDateTime now) {
        if (completedAt != null) return "completed";
        if (dueAt.isBefore(now)) return "late";
        if (startedAt != null) return "in_progress";
        return "planned";
    }

    /** Échéance de la première séance : le jour choisi à 20 h, entre aujourd'hui et un an. */
    static OffsetDateTime firstDue(String date, LocalDate today) {
        LocalDate day;
        try {
            day = LocalDate.parse(date == null ? "" : date);
        } catch (DateTimeParseException error) {
            throw HttpError.badRequest("Indiquez l’échéance au format AAAA-MM-JJ.");
        }
        if (day.isBefore(today) || day.isAfter(today.plusYears(1))) {
            throw HttpError.badRequest("L’échéance doit être comprise entre aujourd’hui et dans un an.");
        }
        return day.atTime(DUE_TIME).atZone(PILOT_ZONE).toOffsetDateTime();
    }

    /**
     * Une transcription est montrée à l'élève selon la règle du support : à la demande, après la réponse
     * (une fois l'exercice terminé) ou jamais. L'équipe pédagogique la voit toujours.
     */
    static boolean transcriptAvailable(String visibility, boolean activityCompleted, boolean staff) {
        if (staff) return true;
        return switch (visibility == null ? "" : visibility) {
            case "on_demand" -> true;
            case "after_answer" -> activityCompleted;
            default -> false;
        };
    }

    /**
     * Une activité notée (exercice, évaluation) ne se termine qu'avec la tentative qui la corrige ; une mission,
     * qu'avec sa remise (l'identifiant de la mission tient lieu de tentative).
     */
    static boolean requiresAttempt(String kind) {
        return "exercise".equals(kind) || "assessment".equals(kind) || "mission".equals(kind);
    }

    /**
     * La mission lue dans Évaluations termine l'activité si elle est remise (submitted, sent ou reviewed), par cet
     * élève, depuis cette séance et pour cette activité de la séance : rien n'est cru sur parole.
     */
    static boolean missionCompletes(JsonNode mission, UUID learnerId, UUID sessionId, String sessionActivityId) {
        if (mission == null || !mission.isObject()) return false;
        String owner = mission.path("learnerId").asText("");
        return MISSION_DONE.contains(mission.path("status").asText())
                && (owner.isEmpty() || owner.equalsIgnoreCase(learnerId.toString()))
                && sessionId.toString().equalsIgnoreCase(mission.path("sessionId").asText(""))
                && sessionActivityId.equals(mission.path("sessionActivityId").asText(""));
    }

    /** Questions servies à l'élève : vues du catalogue, sans aucune clé de corrigé à quelque profondeur que ce soit. */
    static JsonNode publicQuestions(JsonNode questions) {
        if (questions == null || !questions.isArray()) return JsonNodeFactory.instance.arrayNode();
        JsonNode copy = questions.deepCopy();
        strip(copy);
        return copy;
    }

    private static void strip(JsonNode node) {
        if (node.isObject()) ((ObjectNode) node).remove(ANSWER_KEYS);
        if (node.isContainerNode()) node.forEach(CourseRules::strip);
    }

    /**
     * Définition d'une mission (activité « mission » du catalogue), ou null pour les autres activités. La grille de
     * critères est recopiée telle que le catalogue la sert, pour que l'élève la voie avant la remise ([] sans grille,
     * missions A1 et A2 ou catalogue antérieur aux grilles).
     */
    static MissionDefinition missionDefinition(JsonNode content) {
        JsonNode mission = content == null ? null : content.path("mission");
        if (mission == null || !mission.isObject()) return null;
        JsonNode oral = mission.path("oral");
        JsonNode written = mission.path("written");
        List<String> checklist = new ArrayList<>();
        for (JsonNode item : mission.path("checklist")) checklist.add(item.asText());
        return new MissionDefinition(content.path("lesson").path("description").asText(""),
                oral.isObject() ? new MissionOral(oral.path("prompt").asText(""), oral.path("maxSeconds").asInt(120)) : null,
                written.isObject() ? new MissionWritten(written.path("prompt").asText(""),
                        written.path("maxChars").asInt(1500), written.path("minWords").asInt(0)) : null,
                List.copyOf(checklist), missionCriteria(mission.path("criteria")));
    }

    /** Critères d'une grille : identifiant, libellé et points, sans doublon d'identifiant (6 au plus). */
    static List<MissionCriterion> missionCriteria(JsonNode criteria) {
        List<MissionCriterion> list = new ArrayList<>();
        Set<String> ids = new HashSet<>();
        for (JsonNode criterion : criteria) {
            String id = criterion.path("id").asText("");
            int maxPoints = criterion.path("maxPoints").asInt(0);
            if (id.isEmpty() || maxPoints < 1 || !ids.add(id) || list.size() == MAX_CRITERIA) continue;
            list.add(new MissionCriterion(id, criterion.path("label").asText(""), maxPoints));
        }
        return List.copyOf(list);
    }

    /**
     * Exercices à reprendre lors de la révision d'un module : ceux dont le dernier résultat porte des questions à
     * revoir (Grade.flagged, répétitions abandonnées après trois échecs) ou reste sous le seuil de réussite de la
     * version. Les résultats arrivent du plus récent au plus ancien ; un exercice jamais remis n'est pas listé.
     */
    static List<ReviewItem> reviewItems(JsonNode track, String moduleId, JsonNode grades) {
        if (track == null || moduleId == null) return List.of();
        int passPercent = track.path("planning").path("passPercent").asInt(DEFAULT_PASS_PERCENT);
        Map<String, JsonNode> latest = latestGrades(grades);
        String versionId = track.path("versionId").asText("");
        List<ReviewItem> items = new ArrayList<>();
        for (JsonNode module : track.path("modules")) {
            if (!moduleId.equals(module.path("id").asText())) continue;
            for (JsonNode activity : module.path("activities")) {
                String lessonId = activity.path("lessonId").asText("");
                if (!"exercise".equals(activity.path("kind").asText()) || lessonId.isEmpty()) continue;
                JsonNode grade = latest.get(lessonId);
                if (grade == null) continue;
                List<String> flagged = flagged(grade);
                int correct = grade.path("correct").asInt();
                int total = grade.path("total").asInt();
                boolean below = total > 0 && correct * 100 < passPercent * total;
                if (flagged.isEmpty() && !below) continue;
                items.add(new ReviewItem(activity.path("id").asText(), activity.path("title").asText(),
                        versionId.isEmpty() ? null : UUID.fromString(versionId), flagged, new ReviewScore(correct, total)));
            }
        }
        return List.copyOf(items);
    }

    /** Dernier résultat d'exercice (quiz ou exercice typé) de chaque leçon ; les diagnostics et examens sont ignorés. */
    static Map<String, JsonNode> latestGrades(JsonNode grades) {
        Map<String, JsonNode> latest = new HashMap<>();
        if (grades == null || !grades.isArray()) return latest;
        for (JsonNode grade : grades) {
            String lessonId = grade.path("lessonId").asText("");
            if (lessonId.isEmpty() || !isExerciseGrade(grade) || latest.containsKey(lessonId)) continue;
            latest.put(lessonId, grade);
        }
        return latest;
    }

    /** Résultat d'un exercice : remise en quiz (historique) ou en exercice typé. */
    static boolean isExerciseGrade(JsonNode grade) {
        String kind = grade.path("kind").asText("quiz");
        return "quiz".equals(kind) || "exercise".equals(kind);
    }

    /** Questions à revoir d'un résultat (vide pour un résultat antérieur à la V4). */
    static List<String> flagged(JsonNode grade) {
        List<String> flagged = new ArrayList<>();
        for (JsonNode question : grade.path("flagged")) {
            if (!question.asText("").isEmpty()) flagged.add(question.asText());
        }
        return List.copyOf(flagged);
    }
}
