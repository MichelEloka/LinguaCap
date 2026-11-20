package org.linguacap.learning;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import org.linguacap.common.HttpError;

/** Règles des séances, sans accès à la base : testées unitairement. */
final class CourseRules {
    /** Fuseau du pilote, en attendant le fuseau de l'élève (incrément 4). */
    static final ZoneId PILOT_ZONE = ZoneId.of("Europe/Paris");
    /** Heure d'échéance d'une séance dans la journée choisie. */
    static final LocalTime DUE_TIME = LocalTime.of(20, 0);
    static final int MAX_STATE_BYTES = 8192;

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

    /** Une activité notée (exercice, évaluation) ne se termine qu'avec la tentative qui la corrige. */
    static boolean requiresAttempt(String kind) {
        return "exercise".equals(kind) || "assessment".equals(kind);
    }
}
