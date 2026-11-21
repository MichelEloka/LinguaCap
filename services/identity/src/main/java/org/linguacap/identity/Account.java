package org.linguacap.identity;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;
import org.linguacap.identity.IdentityResource.Profile;

/**
 * Compte LinguaCap complet, utilisé par le service. Le profil public n'en expose qu'une partie.
 * languageId : langue apprise par un élève (null tant qu'un élève autonome ne l'a pas choisie, et pour l'équipe).
 */
record Account(UUID id, String displayName, String role, UUID teacherId, String status,
               OffsetDateTime lastSeenAt, Set<String> permissions, String languageId) {

    /** Compte sans langue d'apprentissage (équipe, ou élève qui ne l'a pas encore choisie). */
    Account(UUID id, String displayName, String role, UUID teacherId, String status,
            OffsetDateTime lastSeenAt, Set<String> permissions) {
        this(id, displayName, role, teacherId, status, lastSeenAt, permissions, null);
    }

    boolean active() {
        return "active".equals(status);
    }

    boolean is(String expectedRole) {
        return expectedRole.equals(role);
    }

    boolean has(String permission) {
        return permissions.contains(permission);
    }

    /** Élève accompagné par un professeur référent, dont il reçoit la langue et le contrat à valider. */
    boolean accompanied() {
        return is("learner") && teacherId != null;
    }

    Profile toProfile() {
        return new Profile(id, displayName, role, teacherId, languageId);
    }
}
