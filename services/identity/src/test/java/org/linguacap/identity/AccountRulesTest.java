package org.linguacap.identity;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.ws.rs.WebApplicationException;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;
import org.linguacap.identity.IdentityResource.TeacherProfileRequest;

class AccountRulesTest {
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-21T10:00:00Z");
    private static final UUID ADMIN = UUID.randomUUID();
    private static final Set<String> OPEN = Set.of("de");

    private static TeacherProfileRequest teacherProfile(List<String> languages, List<String> levels, Integer maxLearners,
                                                        Integer gradingDelayHours, String bio) {
        return new TeacherProfileRequest(languages, levels, maxLearners, gradingDelayHours, bio, true, "self");
    }

    private static Account account(String role, String status, UUID teacherId, String... permissions) {
        return new Account(UUID.randomUUID(), "Compte " + role, role, teacherId, status, null, Set.of(permissions));
    }

    private static Account active(String role, String... permissions) {
        return account(role, "active", null, permissions);
    }

    private static void assertRefused(int status, Executable rule) {
        var error = assertThrows(WebApplicationException.class, rule);
        assertEquals(status, error.getResponse().getStatus());
        assertTrue(((Map<?, ?>) error.getResponse().getEntity()).get("message").toString().length() > 5);
    }

    @Test
    void lesRolesInvitablesDependentDeLAppelant() {
        assertEquals(Set.of("teacher", "learner", "staff"), AccountRules.invitableRoles("admin"));
        assertEquals(Set.of("learner"), AccountRules.invitableRoles("teacher"));
        assertTrue(AccountRules.invitableRoles("staff").isEmpty());
        assertTrue(AccountRules.invitableRoles("learner").isEmpty());
    }

    @Test
    void lesChampsDInvitationSontNormalises() {
        assertEquals("eleve@exemple.fr", AccountRules.checkInvitationFields("  Eleve@Exemple.FR ", "Élève"));
        assertRefused(400, () -> AccountRules.checkInvitationFields("pas-une-adresse", "Élève"));
        assertRefused(400, () -> AccountRules.checkInvitationFields("eleve@exemple.fr", "   "));
        assertRefused(400, () -> AccountRules.checkInvitationFields("eleve@exemple.fr", "x".repeat(141)));
    }

    @Test
    void leStatutDUneInvitationSuitSonCycleDeVie() {
        OffsetDateTime later = NOW.plusDays(3);
        assertEquals("pending", AccountRules.invitationStatus(null, null, later, NOW));
        assertEquals("expired", AccountRules.invitationStatus(null, null, NOW, NOW));
        assertEquals("cancelled", AccountRules.invitationStatus(null, NOW, later, NOW));
        assertEquals("accepted", AccountRules.invitationStatus(NOW, null, NOW.minusDays(1), NOW));
    }

    @Test
    void laDerniereActiviteEstEnregistreeAuPlusToutesLesCinqMinutes() {
        assertTrue(AccountRules.lastSeenIsStale(null, NOW));
        assertFalse(AccountRules.lastSeenIsStale(NOW.minusMinutes(4), NOW));
        assertTrue(AccountRules.lastSeenIsStale(NOW.minusMinutes(6), NOW));
    }

    @Test
    void laDesactivationProtegeLeDernierAdministrateur() {
        Account admin = active("admin");
        assertRefused(409, () -> AccountRules.checkStatusChange(admin.id(), admin, "disabled", 3));
        assertRefused(409, () -> AccountRules.checkStatusChange(ADMIN, admin, "disabled", 0));
        assertDoesNotThrow(() -> AccountRules.checkStatusChange(ADMIN, admin, "disabled", 1));
        assertDoesNotThrow(() -> AccountRules.checkStatusChange(ADMIN, active("teacher"), "disabled", 0));
        assertRefused(400, () -> AccountRules.checkStatusChange(ADMIN, active("teacher"), "supprime", 0));
    }

    @Test
    void leRoleDUnEleveEtDUnProfesseurAvecElevesEstProtege() {
        assertRefused(409, () -> AccountRules.checkRoleChange(ADMIN, active("learner"), "staff", 1, 0));
        assertRefused(400, () -> AccountRules.checkRoleChange(ADMIN, active("teacher"), "learner", 1, 0));
        assertRefused(409, () -> AccountRules.checkRoleChange(ADMIN, active("teacher"), "staff", 1, 2));
        assertDoesNotThrow(() -> AccountRules.checkRoleChange(ADMIN, active("teacher"), "staff", 1, 0));
        Account admin = active("admin");
        assertRefused(409, () -> AccountRules.checkRoleChange(admin.id(), admin, "teacher", 2, 0));
        assertRefused(409, () -> AccountRules.checkRoleChange(ADMIN, admin, "staff", 0, 0));
    }

    @Test
    void lesPermissionsSontLimiteesALEquipe() {
        assertEquals(Set.of("catalogue", "correction"),
                AccountRules.checkPermissions(active("staff"), List.of("correction", "catalogue", "catalogue")));
        assertEquals(Set.of(), AccountRules.checkPermissions(active("learner"), List.of()));
        assertRefused(409, () -> AccountRules.checkPermissions(active("learner"), List.of("catalogue")));
        assertRefused(400, () -> AccountRules.checkPermissions(active("staff"), List.of("suivi")));
        assertRefused(400, () -> AccountRules.checkPermissions(active("staff"), Arrays.asList("catalogue", null)));
        assertRefused(400, () -> AccountRules.checkPermissions(active("staff"), null));
    }

    @Test
    void unEleveNEstRattacheQuAUnProfesseurActif() {
        Account learner = active("learner");
        assertDoesNotThrow(() -> AccountRules.checkTeacherAssignment(learner, active("teacher")));
        assertDoesNotThrow(() -> AccountRules.checkTeacherAssignment(learner, null));
        assertRefused(400, () -> AccountRules.checkTeacherAssignment(learner, active("staff")));
        assertRefused(400, () -> AccountRules.checkTeacherAssignment(learner, account("teacher", "disabled", null)));
        assertRefused(404, () -> AccountRules.checkTeacherAssignment(active("teacher"), active("teacher")));
    }

    @Test
    void lesLanguesOuvertesSontLuesDansLaConfiguration() {
        assertEquals(Set.of("de"), AccountRules.openLanguages("de"));
        assertEquals(Set.of("de", "en"), AccountRules.openLanguages(" de, EN ,xx,,"));
        assertTrue(AccountRules.openLanguages("").isEmpty());
        assertTrue(AccountRules.openLanguages(null).isEmpty());
        assertEquals(14, AccountRules.KNOWN_LANGUAGES.size());
    }

    @Test
    void seulLEleveAutonomeChoisitSaLangueParmiLesLanguesOuvertes() {
        Account autonomous = active("learner");
        assertEquals("de", AccountRules.checkLanguageChoice(autonomous, " DE ", OPEN));
        assertRefused(403, () -> AccountRules.checkLanguageChoice(account("learner", "active", UUID.randomUUID()), "de", OPEN));
        assertRefused(403, () -> AccountRules.checkLanguageChoice(active("teacher"), "de", OPEN));
        assertRefused(400, () -> AccountRules.checkLanguageChoice(autonomous, null, OPEN));
        assertRefused(400, () -> AccountRules.checkLanguageChoice(autonomous, "xx", OPEN));
        assertRefused(409, () -> AccountRules.checkLanguageChoice(autonomous, "en", OPEN));
    }

    @Test
    void laLangueDUneInvitationRespecteLesLanguesDuProfesseur() {
        assertNull(AccountRules.checkInvitationLanguage("learner", null, List.of("de"), OPEN));
        assertNull(AccountRules.checkInvitationLanguage("learner", "  ", List.of("de"), OPEN));
        assertEquals("de", AccountRules.checkInvitationLanguage("learner", "de", List.of("de"), OPEN));
        // Professeur pas encore accueilli : toute langue ouverte est acceptée.
        assertEquals("de", AccountRules.checkInvitationLanguage("learner", "De", List.of(), OPEN));
        assertEquals("de", AccountRules.checkInvitationLanguage("learner", "de", null, OPEN));
        assertRefused(409, () -> AccountRules.checkInvitationLanguage("learner", "de", List.of("en"), Set.of("de", "en")));
        assertRefused(409, () -> AccountRules.checkInvitationLanguage("learner", "en", List.of("de", "en"), OPEN));
        assertRefused(400, () -> AccountRules.checkInvitationLanguage("learner", "klingon", List.of(), OPEN));
        assertRefused(400, () -> AccountRules.checkInvitationLanguage("teacher", "de", List.of(), OPEN));
    }

    @Test
    void leQuestionnaireDuProfesseurEstNormalise() {
        TeacherProfileRequest profile = AccountRules.checkTeacherProfile(
                new TeacherProfileRequest(List.of("DE", " de"), List.of("b1", "A1", "A1"), 12, 48, "  Bonjour  ",
                        false, "linguacap"), OPEN);
        assertEquals(List.of("de"), profile.languages());
        assertEquals(List.of("A1", "B1"), profile.levels());
        assertEquals(12, profile.maxLearners());
        assertEquals(48, profile.gradingDelayHours());
        assertEquals("Bonjour", profile.bio());
        assertEquals(false, profile.acceptingNewStudents());
        assertEquals("linguacap", profile.courseCreationMode());

        TeacherProfileRequest minimal = AccountRules.checkTeacherProfile(
                new TeacherProfileRequest(List.of("de"), List.of("A2"), null, null, null, null, null), OPEN);
        assertNull(minimal.maxLearners());
        assertNull(minimal.gradingDelayHours());
        assertEquals("", minimal.bio());
        assertNull(minimal.acceptingNewStudents());
        assertNull(minimal.courseCreationMode());
    }

    @Test
    void lesNiveauxEnseignesSuiventLEchelleEtPeuventPrecederLeCatalogue() {
        // L'échelle du CECRL valide et trie ; un niveau que le catalogue ne propose pas encore (C1) reste déclarable.
        TeacherProfileRequest profile = AccountRules.checkTeacherProfile(
                teacherProfile(List.of("de"), List.of("c1", "B2", "a2", "B1", "C2"), null, null, ""), OPEN);
        assertEquals(List.of("A2", "B1", "B2", "C1", "C2"), profile.levels());
        assertRefused(400, () -> AccountRules.checkTeacherProfile(teacherProfile(List.of("de"), List.of("A0"), null, null, ""), OPEN));
    }

    @Test
    void leQuestionnaireDuProfesseurRefuseLesReponsesInvalides() {
        assertRefused(400, () -> AccountRules.checkTeacherProfile(null, OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(teacherProfile(List.of(), List.of("A1"), null, null, ""), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(teacherProfile(List.of("de"), List.of(), null, null, ""), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(teacherProfile(null, List.of("A1"), null, null, ""), OPEN));
        assertRefused(409, () -> AccountRules.checkTeacherProfile(teacherProfile(List.of("de", "en"), List.of("A1"), null, null, ""), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(teacherProfile(List.of("xx"), List.of("A1"), null, null, ""), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(teacherProfile(List.of("de"), List.of("D1"), null, null, ""), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(
                teacherProfile(List.of("de"), Arrays.asList("A1", null), null, null, ""), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(teacherProfile(List.of("de"), List.of("A1"), 0, null, ""), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(teacherProfile(List.of("de"), List.of("A1"), 501, null, ""), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(teacherProfile(List.of("de"), List.of("A1"), null, 36, ""), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(
                teacherProfile(List.of("de"), List.of("A1"), null, null, "x".repeat(501)), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(new TeacherProfileRequest(
                List.of("de"), List.of("A1"), null, null, null, false, null), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(new TeacherProfileRequest(
                List.of("de"), List.of("A1"), null, null, null, null, "self"), OPEN));
        assertRefused(400, () -> AccountRules.checkTeacherProfile(new TeacherProfileRequest(
                List.of("de"), List.of("A1"), null, null, null, true, "externally"), OPEN));
    }

    @Test
    void leCompteGardeSonConstructeurHistoriqueEtExposeSaLangue() {
        Account legacy = active("learner");
        assertNull(legacy.languageId());
        assertFalse(legacy.accompanied());
        Account learner = new Account(UUID.randomUUID(), "Élève", "learner", UUID.randomUUID(), "active", null, Set.of(), "de");
        assertTrue(learner.accompanied());
        assertEquals("de", learner.toProfile().languageId());
        assertEquals(learner.teacherId(), learner.toProfile().teacherId());
    }

    @Test
    void leCorrecteurDesigneConcerneUnEleveAutonomeEtExigeLaPermission() {
        Account autonomous = active("learner");
        assertDoesNotThrow(() -> AccountRules.checkReviewerAssignment(autonomous, active("staff", "correction")));
        assertDoesNotThrow(() -> AccountRules.checkReviewerAssignment(autonomous, null));
        Account accompanied = account("learner", "active", UUID.randomUUID());
        assertRefused(409, () -> AccountRules.checkReviewerAssignment(accompanied, active("staff", "correction")));
        assertRefused(409, () -> AccountRules.checkReviewerAssignment(autonomous, active("staff", "catalogue")));
        assertRefused(409, () -> AccountRules.checkReviewerAssignment(autonomous, account("teacher", "disabled", null, "correction")));
        assertRefused(400, () -> AccountRules.checkReviewerAssignment(autonomous, active("learner", "correction")));
    }
}
