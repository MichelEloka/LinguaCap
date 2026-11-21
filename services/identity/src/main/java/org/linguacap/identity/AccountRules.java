package org.linguacap.identity;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.regex.Pattern;
import org.linguacap.common.HttpError;
import org.linguacap.identity.IdentityResource.TeacherProfileRequest;

/** Règles métier des comptes, sans accès à la base : testées unitairement. */
final class AccountRules {
    static final Set<String> STAFF_ROLES = Set.of("admin", "teacher", "staff");
    static final Set<String> PERMISSIONS = Set.of("catalogue", "correction");
    static final Set<String> STATUSES = Set.of("active", "disabled");
    static final Duration INVITATION_VALIDITY = Duration.ofDays(7);
    static final Duration LAST_SEEN_PRECISION = Duration.ofMinutes(5);
    /** Langues connues du catalogue (codes ISO 639-1). Seules les langues ouvertes peuvent être choisies. */
    static final Set<String> KNOWN_LANGUAGES = Set.of("de", "en", "es", "it", "pt", "nl", "fr", "ar", "zh", "ja", "ru",
            "ko", "tr", "pl");
    /** Niveaux du cadre européen, dans l'ordre de progression. */
    static final List<String> LEVELS = List.of("A1", "A2", "B1", "B2", "C1", "C2");
    static final Set<Integer> GRADING_DELAYS = Set.of(24, 48, 72, 168);
    static final int MAX_BIO_LENGTH = 500;
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

    /** Langues ouvertes, lues dans la configuration (lingua.languages.open, codes séparés par des virgules). */
    static Set<String> openLanguages(String configured) {
        Set<String> open = new TreeSet<>();
        if (configured == null) return Set.of();
        for (String value : configured.split(",")) {
            String code = value.strip().toLowerCase(Locale.ROOT);
            if (KNOWN_LANGUAGES.contains(code)) open.add(code);
        }
        return Set.copyOf(open);
    }

    /** Vérifie qu'une langue est connue (400) et ouverte (409), et renvoie son code normalisé. */
    static String checkOpenLanguage(String languageId, Set<String> openLanguages) {
        String code = languageId == null ? "" : languageId.strip().toLowerCase(Locale.ROOT);
        if (code.isEmpty()) {
            throw HttpError.badRequest("Choisissez une langue.");
        }
        if (!KNOWN_LANGUAGES.contains(code)) {
            throw HttpError.badRequest("Cette langue n’est pas proposée par LinguaCap.");
        }
        if (!openLanguages.contains(code)) {
            throw HttpError.conflict("Cette langue ouvrira bientôt : choisissez une langue déjà disponible.");
        }
        return code;
    }

    /**
     * Choix de la langue par l'élève lui-même : réservé à l'élève autonome, la langue d'un élève accompagné étant
     * fixée par son professeur référent.
     */
    static String checkLanguageChoice(Account caller, String languageId, Set<String> openLanguages) {
        if (caller == null || !caller.is("learner")) {
            throw HttpError.forbidden("Seul un élève choisit sa langue d’apprentissage.");
        }
        if (caller.accompanied()) {
            throw HttpError.forbidden("Votre langue d’apprentissage est choisie par votre professeur référent.");
        }
        return checkOpenLanguage(languageId, openLanguages);
    }

    /**
     * Langue facultative d'une invitation : réservée aux élèves, ouverte, et enseignée par le professeur référent
     * lorsqu'il a déjà indiqué ses langues. Renvoie null sans langue : l'activation retiendra alors la première
     * langue du professeur.
     */
    static String checkInvitationLanguage(String role, String languageId, Collection<String> teacherLanguages,
                                          Set<String> openLanguages) {
        if (languageId == null || languageId.isBlank()) return null;
        if (!"learner".equals(role)) {
            throw HttpError.badRequest("La langue d’apprentissage concerne uniquement les invitations d’élèves.");
        }
        String code = checkOpenLanguage(languageId, openLanguages);
        if (teacherLanguages != null && !teacherLanguages.isEmpty() && !teacherLanguages.contains(code)) {
            throw HttpError.conflict("Le professeur référent n’enseigne pas cette langue.");
        }
        return code;
    }

    /** Valide le questionnaire d'accueil du professeur et renvoie ses réponses normalisées. */
    static TeacherProfileRequest checkTeacherProfile(TeacherProfileRequest request, Set<String> openLanguages) {
        if (request == null || request.languages() == null || request.levels() == null) {
            throw HttpError.badRequest("Indiquez au moins une langue et un niveau enseignés.");
        }
        Set<String> languages = new LinkedHashSet<>();
        for (String language : request.languages()) {
            languages.add(checkOpenLanguage(language, openLanguages));
        }
        if (languages.isEmpty()) {
            throw HttpError.badRequest("Indiquez au moins une langue enseignée.");
        }
        Set<String> levels = new TreeSet<>(Comparator.comparingInt(LEVELS::indexOf));
        for (String level : request.levels()) {
            String code = level == null ? "" : level.strip().toUpperCase(Locale.ROOT);
            if (!LEVELS.contains(code)) {
                throw HttpError.badRequest("Les niveaux enseignés vont de A1 à C2.");
            }
            levels.add(code);
        }
        if (levels.isEmpty()) {
            throw HttpError.badRequest("Indiquez au moins un niveau enseigné.");
        }
        String courseCreationMode = request.courseCreationMode();
        if ((request.acceptingNewStudents() == null) != (courseCreationMode == null)) {
            throw HttpError.badRequest("Indiquez votre disponibilité et comment vous souhaitez construire vos cours.");
        }
        if (courseCreationMode != null && !"self".equals(courseCreationMode) && !"linguacap".equals(courseCreationMode)) {
            throw HttpError.badRequest("Indiquez comment vous souhaitez construire vos cours.");
        }
        Integer maxLearners = request.maxLearners();
        if (maxLearners != null && (maxLearners < 1 || maxLearners > 500)) {
            throw HttpError.badRequest("Le nombre d’élèves souhaité doit être compris entre 1 et 500.");
        }
        Integer delay = request.gradingDelayHours();
        if (delay != null && !GRADING_DELAYS.contains(delay)) {
            throw HttpError.badRequest("Le délai de correction doit être de 24, 48 ou 72 heures, ou d’une semaine.");
        }
        String bio = request.bio() == null ? "" : request.bio().strip();
        if (bio.length() > MAX_BIO_LENGTH) {
            throw HttpError.badRequest("La présentation doit tenir en " + MAX_BIO_LENGTH + " caractères.");
        }
        return new TeacherProfileRequest(List.copyOf(languages), List.copyOf(levels), maxLearners, delay, bio,
                request.acceptingNewStudents(), courseCreationMode);
    }
}
