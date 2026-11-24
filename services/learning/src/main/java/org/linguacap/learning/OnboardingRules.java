package org.linguacap.learning;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.linguacap.common.Cefr;

/**
 * Règles pures de l'accueil de l'élève, partagées par l'écran de l'élève (GET /learning/onboarding) et par la vue du
 * professeur lue en direct (LearnerStateResource) : étapes, débutant sans diagnostic (EVO-038) et niveau en cours.
 */
final class OnboardingRules {
    /** Point de départ d'un débutant (déclaré ou placé par le test). */
    static final String BEGINNER = Cefr.BEGINNER;

    private OnboardingRules() {}

    /**
     * Étapes de l'accueil : langue, test de niveau, résultat, objectif, jours, planning, démarrage.
     * pathStatus : statut du parcours ouvert ou le plus récent (null sans parcours ou s'il a été retiré).
     * blocked : language_unavailable, placement_unavailable, no_target_available ou null.
     */
    static List<PathResource.OnboardingStep> steps(boolean hasLanguage, boolean placed, String pathStatus,
                                                   boolean availabilityConfirmed, String blocked) {
        boolean hasPath = pathStatus != null;
        boolean started = hasPath && !"draft".equals(pathStatus);
        boolean confirmed = hasPath && availabilityConfirmed;
        List<PathResource.OnboardingStep> steps = new ArrayList<>();
        steps.add(step("language", hasLanguage ? "done" : "language_unavailable".equals(blocked) ? "blocked" : "current"));
        steps.add(step("placement", placed ? "done" : started ? "skipped"
                : "placement_unavailable".equals(blocked) || "language_unavailable".equals(blocked) ? "blocked"
                : hasLanguage ? "current" : "todo"));
        steps.add(step("result", hasPath ? (placed ? "done" : "skipped")
                : "no_target_available".equals(blocked) ? "blocked" : placed ? "current" : "todo"));
        steps.add(step("objective", hasPath ? "done" : "todo"));
        steps.add(step("days", started || confirmed ? "done" : hasPath ? "current" : "todo"));
        steps.add(step("planning", started ? "done" : confirmed ? "current" : "todo"));
        steps.add(step("start", started ? "done" : "todo"));
        return steps;
    }

    /**
     * Débutant (EVO-038) : le niveau ou le parcours part de A0. Le parcours est déjà adapté, sans diagnostic initial ni
     * question supplémentaire, à chaque niveau du parcours.
     */
    static boolean beginner(String enrollmentStartLevel, String pathStartLevel) {
        return BEGINNER.equals(enrollmentStartLevel) || BEGINNER.equals(pathStartLevel);
    }

    /** Niveau d'un parcours à présenter : le niveau ouvert, sinon le plus haut niveau terminé ; null pour un brouillon. */
    static Level shownLevel(List<Level> levels) {
        Level shown = null;
        for (Level level : levels) {
            if ("active".equals(level.status())) return level;
            if ("completed".equals(level.status()) && (shown == null || level.rank() > shown.rank())) shown = level;
        }
        return shown;
    }

    /** Niveau d'un parcours avec l'état de son inscription (goalStatus null tant que le niveau n'est pas ouvert). */
    record Level(int rank, String levelCode, String status, UUID enrollmentId, String goalStatus) {}

    private static PathResource.OnboardingStep step(String id, String status) {
        return new PathResource.OnboardingStep(id, status);
    }
}
