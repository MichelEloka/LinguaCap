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
