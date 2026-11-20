package org.linguacap.tracking;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

/**
 * Règles du suivi (DEV-076, DEV-079) : temps de pratique estimé à partir de l'activité, retard et risque d'un objectif
 * selon sa cadence et son prochain jalon, bilan obligatoire arrivé à échéance.
 */
final class RiskRules {
    /** Au-delà de dix minutes sans activité, le comptage du temps de pratique s'arrête. */
    static final Duration IDLE = Duration.ofMinutes(10);
    static final Duration MILESTONE_WINDOW = Duration.ofDays(7);
    private static final Set<String> SILENT = Set.of("paused", "validated", "to_consolidate", "awaiting_grading");

    private RiskRules() {}

    /** Séance projetée : échéance, fin éventuelle et jalon (midterm, final) qu'elle porte. */
    record Slot(String sessionId, OffsetDateTime dueAt, OffsetDateTime completedAt, String milestone) {}

    record Risk(boolean atRisk, int lateSessions, OffsetDateTime oldestLateDueAt, String nextMilestone,
                OffsetDateTime nextMilestoneDueAt, boolean midtermOverdue, String reason) {}

    /** Somme des écarts entre activités successives, sans compter les pauses de plus de dix minutes. */
    static long practiceSeconds(List<OffsetDateTime> activity) {
        List<OffsetDateTime> times = activity.stream().sorted().toList();
        long seconds = 0;
        for (int index = 1; index < times.size(); index++) {
            Duration gap = Duration.between(times.get(index - 1), times.get(index));
            if (!gap.isNegative() && gap.compareTo(IDLE) <= 0) seconds += gap.getSeconds();
        }
        return seconds;
    }

    /**
     * Un objectif est à risque lorsqu'une séance est en retard et que ce retard dépasse trois intervalles de sa
     * cadence (deux jours au moins), qu'il atteint trois séances, ou que le prochain jalon tombe dans les sept jours.
     * Un bilan intermédiaire non remis après son échéance ouvre toujours une alerte. Les objectifs en pause, en
     * attente de correction ou terminés n'ont pas d'alerte.
     */
    static Risk evaluate(List<Slot> slots, String goalStatus, OffsetDateTime now) {
        List<Slot> ordered = slots.stream().sorted(Comparator.comparing(Slot::dueAt)).toList();
        List<Slot> late = ordered.stream().filter(slot -> slot.completedAt() == null && slot.dueAt().isBefore(now)).toList();
        Slot next = ordered.stream().filter(slot -> slot.milestone() != null && slot.completedAt() == null
                && !slot.dueAt().isBefore(now)).findFirst().orElse(null);
        boolean midtermOverdue = late.stream().anyMatch(slot -> "midterm".equals(slot.milestone()));
        OffsetDateTime oldest = late.isEmpty() ? null : late.get(0).dueAt();
        if (SILENT.contains(goalStatus)) {
            return new Risk(false, late.size(), oldest, next == null ? null : next.milestone(),
                    next == null ? null : next.dueAt(), midtermOverdue, null);
        }
        List<String> reasons = new ArrayList<>();
        if (midtermOverdue) reasons.add("le bilan intermédiaire n’est pas remis alors que son échéance est passée");
        if (!late.isEmpty()) {
            Duration cadence = cadence(ordered);
            Duration overdue = Duration.between(oldest, now);
            Duration tolerance = cadence.multipliedBy(3).compareTo(Duration.ofDays(2)) > 0 ? cadence.multipliedBy(3) : Duration.ofDays(2);
            if (overdue.compareTo(tolerance) >= 0) reasons.add(late.size() + " séance" + (late.size() > 1 ? "s" : "")
                    + " en retard depuis " + Math.max(1, overdue.toDays()) + " jour" + (overdue.toDays() > 1 ? "s" : ""));
            else if (late.size() >= 3) reasons.add(late.size() + " séances en retard");
            if (next != null && Duration.between(now, next.dueAt()).compareTo(MILESTONE_WINDOW) <= 0) {
                reasons.add(("final".equals(next.milestone()) ? "l’examen blanc" : "le bilan intermédiaire")
                        + " approche avec du retard accumulé");
            }
        }
        return new Risk(!reasons.isEmpty(), late.size(), oldest, next == null ? null : next.milestone(),
                next == null ? null : next.dueAt(), midtermOverdue, reasons.isEmpty() ? null : String.join(" ; ", reasons));
    }

    /** Intervalle moyen entre deux séances du calendrier validé (au moins six heures). */
    static Duration cadence(List<Slot> ordered) {
        if (ordered.size() < 2) return Duration.ofDays(1);
        Duration span = Duration.between(ordered.get(0).dueAt(), ordered.get(ordered.size() - 1).dueAt());
        Duration average = span.dividedBy(ordered.size() - 1);
        return average.compareTo(Duration.ofHours(6)) < 0 ? Duration.ofHours(6) : average;
    }
}
