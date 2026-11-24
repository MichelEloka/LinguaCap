package org.linguacap.tracking;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;

/**
 * Règles pures de la synthèse d'un élève lue par le professeur (TrackingResource.summary) : retard et prochaine échéance
 * d'un objectif en pause, copies en attente sur tous les objectifs de l'élève.
 * <p>
 * La pause ne retire pas les séances du planning : sans ces règles, un élève en pause voyait ses séances en retard
 * s'accumuler et passait « À relancer ».
 */
final class SummaryRules {
    /** Fuseau du pilote : une reprise prévue un jour donné commence à minuit, heure de Paris. */
    static final ZoneId PILOT_ZONE = ZoneId.of("Europe/Paris");

    private SummaryRules() {}

    /**
     * Instant jusqu'auquel une séance non terminée compte en retard : maintenant, ou l'instant de la pause pour un
     * objectif en pause (pausedAt : entrée en pause projetée par Suivi, que l'annonce d'une reprise ne déplace pas).
     */
    static OffsetDateTime lateCutoff(String goalStatus, OffsetDateTime pausedAt, OffsetDateTime now) {
        if (!"paused".equals(goalStatus) || pausedAt == null) return now;
        return pausedAt.isBefore(now) ? pausedAt : now;
    }

    /** Séance en retard : terminée après l'échéance, ou non terminée avec une échéance passée avant la limite. */
    static boolean late(OffsetDateTime due, OffsetDateTime completed, OffsetDateTime cutoff) {
        return completed == null ? due.isBefore(cutoff) : completed.isAfter(due);
    }

    /**
     * Prochaine échéance montrée : la séance suivante, ou pour un objectif en pause la date de reprise prévue (début de
     * journée, heure du pilote), sinon aucune.
     */
    static OffsetDateTime nextDue(String goalStatus, OffsetDateTime nextSession, LocalDate resumeDate) {
        if (!"paused".equals(goalStatus)) return nextSession;
        return resumeDate == null ? null : resumeDate.atStartOfDay(PILOT_ZONE).toOffsetDateTime();
    }
}
