package org.linguacap.learning;

import java.util.Set;
import org.linguacap.common.HttpError;

/**
 * Cycle de vie du contrat (section 3.3 du plan), sans accès à la base : six états, propositions, contre-propositions,
 * avenants et décisions. Tant qu'aucun contrat n'a été accepté, les propositions de l'élève s'appliquent tout de suite ;
 * ensuite, seul un contrat accepté s'applique.
 */
final class ContractRules {
    static final String PENDING_TEACHER = "pending_teacher";
    static final String PENDING_LEARNER = "pending_learner";
    static final String ACCEPTED = "accepted";
    static final String REJECTED = "rejected";
    static final String SUPERSEDED = "superseded";
    static final String WITHDRAWN = "withdrawn";
    static final Set<String> STATUSES = Set.of(PENDING_TEACHER, PENDING_LEARNER, ACCEPTED, REJECTED, SUPERSEDED, WITHDRAWN);
    static final Set<String> PENDING = Set.of(PENDING_TEACHER, PENDING_LEARNER);
    static final int MAX_NOTE = 1000;

    private ContractRules() {}

    /** Partie au contrat : l'élève, ou l'équipe pédagogique (professeur référent ou administration). */
    enum Party { LEARNER, EDUCATOR }

    /**
     * Effet d'une nouvelle proposition : état de la proposition en attente qu'elle remplace (rejetée ou retirée),
     * état de la nouvelle, remplacement du contrat en vigueur et application immédiate des conditions.
     */
    record Proposal(String status, String previousPending, boolean supersedeAccepted, boolean applyNow) {}

    /** Effet d'une décision sur une proposition en attente. */
    record Decision(String status, boolean supersedeAccepted, boolean apply) {}

    /**
     * Nouvelle proposition, contre-proposition ou avenant.
     *
     * @param proposer       partie qui propose
     * @param accompanied    l'élève a un professeur référent
     * @param pendingStatus  état de la proposition en attente, ou null
     * @param engaged        au moins un contrat a été accepté
     */
    static Proposal propose(Party proposer, boolean accompanied, String pendingStatus, boolean engaged) {
        if (pendingStatus != null && !PENDING.contains(pendingStatus)) {
            throw new IllegalArgumentException("Proposition en attente invalide : " + pendingStatus);
        }
        if (proposer == Party.LEARNER && !accompanied) {
            // Élève autonome : l'avenant est accepté d'office et remplace le contrat en vigueur.
            return new Proposal(ACCEPTED, pendingStatus == null ? null : WITHDRAWN, engaged, true);
        }
        if (proposer == Party.LEARNER) {
            String previous = pendingStatus == null ? null : PENDING_LEARNER.equals(pendingStatus) ? REJECTED : WITHDRAWN;
            return new Proposal(PENDING_TEACHER, previous, false, !engaged);
        }
        String previous = pendingStatus == null ? null : PENDING_TEACHER.equals(pendingStatus) ? REJECTED : WITHDRAWN;
        return new Proposal(PENDING_LEARNER, previous, false, false);
    }

    /** Acceptation ou refus par la partie adverse ; toute autre partie est refusée. */
    static Decision decide(Party actor, String status, boolean accept) {
        if (!PENDING.contains(status)) throw HttpError.conflict("Ce contrat n’attend plus de réponse.");
        if (!canDecide(actor, status)) {
            throw HttpError.forbidden(PENDING_TEACHER.equals(status)
                    ? "Le professeur référent ou l’administration répond à cette proposition."
                    : "L’élève répond à cette proposition.");
        }
        return accept ? new Decision(ACCEPTED, true, true) : new Decision(REJECTED, false, false);
    }

    /** La partie adverse d'une proposition en attente peut l'accepter ou la refuser. */
    static boolean canDecide(Party viewer, String status) {
        if (viewer == null) return false;
        return PENDING_TEACHER.equals(status) && viewer == Party.EDUCATOR
                || PENDING_LEARNER.equals(status) && viewer == Party.LEARNER;
    }

    /** Auteur inscrit au contrat selon le rôle de l'appelant. */
    static String proposedBy(Party party, String role) {
        if (party == Party.LEARNER) return "learner";
        return "admin".equals(role) ? "admin" : "teacher";
    }

    static String checkNote(String note) {
        if (note == null || note.isBlank()) return null;
        String value = note.strip();
        if (value.length() > MAX_NOTE) throw HttpError.badRequest("La note du contrat tient en 1 000 caractères au plus.");
        return value;
    }

    /** Engagement hebdomadaire minimal : entre 0 et 84 heures par semaine. */
    static int checkWeeklyMinutes(Integer weeklyMinutes) {
        if (weeklyMinutes == null || weeklyMinutes < 0 || weeklyMinutes > 5040) {
            throw HttpError.badRequest("Indiquez l’engagement hebdomadaire, entre 0 et 5 040 minutes.");
        }
        return weeklyMinutes;
    }
}
