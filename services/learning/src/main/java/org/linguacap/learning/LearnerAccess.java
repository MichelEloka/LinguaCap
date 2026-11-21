package org.linguacap.learning;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.UUID;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;

/** Droits sur un élève, décidés par Identités : l'élève lui-même, son professeur référent ou l'administration. */
@ApplicationScoped
class LearnerAccess {
    @Inject IdentityClient identities;

    String role(UUID callerId) {
        return identities.current(callerId).path("role").asText();
    }

    /** Résout l'élève consulté : l'appelant s'il est élève, sinon l'élève demandé auquel il a accès. */
    UUID resolve(UUID callerId, String requestedLearnerId) {
        if (requestedLearnerId != null) {
            UUID id = parse(requestedLearnerId);
            if (!callerId.equals(id)) {
                identities.learner(callerId, id);
                return id;
            }
        }
        if (!"learner".equals(role(callerId))) {
            throw HttpError.forbidden("Sélectionne un élève auquel ton compte a accès.");
        }
        return callerId;
    }

    /** Vérifie qu'un professeur référent ou un administrateur agit sur cet élève. */
    void requireEducatorOf(UUID callerId, UUID learnerId) {
        String role = role(callerId);
        if (!"teacher".equals(role) && !"admin".equals(role)) {
            throw HttpError.forbidden("Seuls le professeur référent et l’administration attribuent un parcours.");
        }
        identities.learner(callerId, learnerId);
    }

    /**
     * Appelant d'une action sur le parcours d'un élève : l'élève lui-même, son professeur référent ou l'administration.
     * accompanied : l'élève a un professeur référent ; languageId : langue de l'élève si Identités la connaît.
     */
    record Viewer(UUID callerId, UUID learnerId, String role, boolean accompanied, UUID teacherId, String languageId) {
        boolean learner() {
            return callerId.equals(learnerId);
        }

        boolean teacher() {
            return !learner() && "teacher".equals(role);
        }

        boolean admin() {
            return !learner() && "admin".equals(role);
        }

        boolean educator() {
            return teacher() || admin();
        }

        PathRules.Caller caller() {
            return new PathRules.Caller(learner(), teacher(), admin(), accompanied);
        }

        ContractRules.Party party() {
            return learner() ? ContractRules.Party.LEARNER : educator() ? ContractRules.Party.EDUCATOR : null;
        }
    }

    /** Vérifie l'accès (Identités répond 403 ou 404 sinon) et décrit l'appelant vis-à-vis de cet élève. */
    Viewer viewer(UUID callerId, UUID learnerId) {
        var learner = identities.learner(callerId, learnerId);
        boolean self = callerId.equals(learnerId);
        String role = self ? "learner" : role(callerId);
        if (!self && !"teacher".equals(role) && !"admin".equals(role)) {
            throw HttpError.forbidden("Seuls l’élève, son professeur référent et l’administration ont accès à ce parcours.");
        }
        UUID teacherId = learner.hasNonNull("teacherId") ? UUID.fromString(learner.path("teacherId").asText()) : null;
        String languageId = learner.hasNonNull("languageId") ? learner.path("languageId").asText() : null;
        return new Viewer(callerId, learnerId, role, teacherId != null, teacherId, languageId);
    }

    static UUID parse(String value) {
        if (value != null) {
            try {
                UUID id = UUID.fromString(value);
                if (id.toString().equalsIgnoreCase(value)) return id;
            } catch (IllegalArgumentException ignored) {
                // Même réponse pour toutes les formes invalides.
            }
        }
        throw HttpError.badRequest("Identifiant élève invalide.");
    }
}
