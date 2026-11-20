package org.linguacap.identity;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.regex.Pattern;
import org.linguacap.common.HttpError;

/** Règles métier des comptes, sans accès à la base : testées unitairement. */
final class AccountRules {
    static final Set<String> STAFF_ROLES = Set.of("admin", "teacher", "staff");
    static final Set<String> PERMISSIONS = Set.of("catalogue", "correction");
    static final Set<String> STATUSES = Set.of("active", "disabled");
    static final Duration INVITATION_VALIDITY = Duration.ofDays(7);
    static final Duration LAST_SEEN_PRECISION = Duration.ofMinutes(5);
    private static final Pattern EMAIL = Pattern.compile("[^\\s@]+@[^\\s@]+\\.[^\\s@]+");

    private AccountRules() {}

    static String normalizeEmail(String email) {
        return email == null ? "" : email.strip().toLowerCase(Locale.ROOT);
    }

    /** Valide les champs d'une invitation et renvoie l'adresse normalisée. */
    static String checkInvitationFields(String email, String displayName) {
        String normalized = normalizeEmail(email);
        if (normalized.length() > 254 || !EMAIL.matcher(normalized).matches()) {
            throw HttpError.badRequest("L’adresse e-mail est invalide.");
        }
        String name = displayName == null ? "" : displayName.strip();
        if (name.isEmpty() || name.length() > 140) {
            throw HttpError.badRequest("Le nom doit contenir entre 1 et 140 caractères.");
        }
        return normalized;
    }

    /** Rôles qu'un compte peut inviter : l'administration invite tout le monde sauf un admin, un professeur ses élèves. */
    static Set<String> invitableRoles(String callerRole) {
        return switch (callerRole) {
            case "admin" -> Set.of("teacher", "learner", "staff");
            case "teacher" -> Set.of("learner");
            default -> Set.of();
        };
    }

    static String invitationStatus(OffsetDateTime acceptedAt, OffsetDateTime cancelledAt,
                                   OffsetDateTime expiresAt, OffsetDateTime now) {
        if (acceptedAt != null) return "accepted";
        if (cancelledAt != null) return "cancelled";
        if (!expiresAt.isAfter(now)) return "expired";
        return "pending";
    }

    static boolean lastSeenIsStale(OffsetDateTime lastSeenAt, OffsetDateTime now) {
        return lastSeenAt == null || lastSeenAt.plus(LAST_SEEN_PRECISION).isBefore(now);
    }

    static void checkStatusChange(UUID callerId, Account target, String status, long otherActiveAdmins) {
        if (!STATUSES.contains(status)) {
            throw HttpError.badRequest("L’état du compte doit être active ou disabled.");
        }
        if ("disabled".equals(status) && callerId.equals(target.id())) {
            throw HttpError.conflict("Vous ne pouvez pas désactiver votre propre compte.");
        }
        if ("disabled".equals(status) && target.is("admin") && target.active() && otherActiveAdmins == 0) {
            throw HttpError.conflict("LinguaCap doit garder au moins un administrateur actif.");
        }
    }

    static void checkRoleChange(UUID callerId, Account target, String role, long otherActiveAdmins, int activeLearners) {
        if (role == null || !STAFF_ROLES.contains(role)) {
            throw HttpError.badRequest("Le rôle doit être admin, teacher ou staff.");
        }
        if (target.is("learner")) {
            throw HttpError.conflict("Le rôle d’un élève ne peut pas être modifié : son parcours lui appartient.");
        }
        if (callerId.equals(target.id())) {
            throw HttpError.conflict("Vous ne pouvez pas modifier votre propre rôle.");
        }
        if (target.is("admin") && !"admin".equals(role) && target.active() && otherActiveAdmins == 0) {
            throw HttpError.conflict("LinguaCap doit garder au moins un administrateur actif.");
        }
        if (target.is("teacher") && !"teacher".equals(role) && activeLearners > 0) {
            throw HttpError.conflict("Réaffectez d’abord les " + activeLearners + " élève(s) de ce professeur.");
        }
    }

    static Set<String> checkPermissions(Account target, Collection<String> requested) {
        if (requested == null) {
            throw HttpError.badRequest("La liste des permissions est requise.");
        }
        Set<String> permissions = new TreeSet<>();
        for (String permission : requested) {
            if (permission == null || !PERMISSIONS.contains(permission)) {
                throw HttpError.badRequest("Permission inconnue : utilisez catalogue ou correction.");
            }
            permissions.add(permission);
        }
        if (target.is("learner") && !permissions.isEmpty()) {
            throw HttpError.conflict("Un élève ne reçoit pas de permission.");
        }
        return Set.copyOf(permissions);
    }

    static void checkTeacherAssignment(Account learner, Account teacher) {
        if (learner == null || !learner.is("learner")) {
            throw HttpError.notFound("Élève introuvable.");
        }
        if (teacher != null && (!teacher.is("teacher") || !teacher.active())) {
            throw HttpError.badRequest("Le professeur sélectionné est introuvable ou désactivé.");
        }
    }

    static void checkReviewerAssignment(Account learner, Account reviewer) {
        if (learner == null || !learner.is("learner")) {
            throw HttpError.notFound("Élève introuvable.");
        }
        if (reviewer == null) return;
        if (learner.teacherId() != null) {
            throw HttpError.conflict("Un élève accompagné est corrigé par son professeur référent.");
        }
        if (!STAFF_ROLES.contains(reviewer.role()) || Objects.equals(reviewer.id(), learner.id())) {
            throw HttpError.badRequest("Le correcteur doit être un compte de l’équipe pédagogique.");
        }
        if (!reviewer.active()) {
            throw HttpError.conflict("Ce compte correcteur est désactivé.");
        }
        if (!reviewer.has("correction")) {
            throw HttpError.conflict("Ce compte n’a pas la permission Correction.");
        }
    }
}
