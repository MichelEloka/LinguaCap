package org.linguacap.identity;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;
import org.linguacap.identity.IdentityResource.Profile;

/** Compte LinguaCap complet, utilisé par le service. Le profil public n'en expose qu'une partie. */
record Account(UUID id, String displayName, String role, UUID teacherId, String status,
               OffsetDateTime lastSeenAt, Set<String> permissions) {

    boolean active() {
        return "active".equals(status);
    }

    boolean is(String expectedRole) {
        return expectedRole.equals(role);
    }

    boolean has(String permission) {
        return permissions.contains(permission);
    }

    Profile toProfile() {
        return new Profile(id, displayName, role, teacherId);
    }
}
