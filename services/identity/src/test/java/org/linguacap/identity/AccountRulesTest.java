package org.linguacap.identity;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
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

class AccountRulesTest {
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-21T10:00:00Z");
    private static final UUID ADMIN = UUID.randomUUID();

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
