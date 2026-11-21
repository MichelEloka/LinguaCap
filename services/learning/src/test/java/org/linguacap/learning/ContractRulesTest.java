package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.ws.rs.WebApplicationException;
import org.junit.jupiter.api.Test;
import org.linguacap.learning.ContractRules.Decision;
import org.linguacap.learning.ContractRules.Party;
import org.linguacap.learning.ContractRules.Proposal;

/** Tableau 3.3 du plan : une ligne par transition. */
class ContractRulesTest {
    private static int status(org.junit.jupiter.api.function.Executable rule) {
        return assertThrows(WebApplicationException.class, rule).getResponse().getStatus();
    }

    @Test
    void lElevesSuiviPropose_enAttenteDuProfesseur_etSesConditionsSAppliquentTantQueRienNEstAccepte() {
        Proposal first = ContractRules.propose(Party.LEARNER, true, null, false);
        assertEquals(ContractRules.PENDING_TEACHER, first.status());
        assertNull(first.previousPending());
        assertTrue(first.applyNow());
        assertFalse(first.supersedeAccepted());
    }

    @Test
    void lEleveAutonomeEstAccepteDOfficeEtSonAvenantRemplaceLeContratEnVigueur() {
        Proposal first = ContractRules.propose(Party.LEARNER, false, null, false);
        assertEquals(ContractRules.ACCEPTED, first.status());
        assertTrue(first.applyNow());
        assertFalse(first.supersedeAccepted());
        Proposal amendment = ContractRules.propose(Party.LEARNER, false, null, true);
        assertEquals(ContractRules.ACCEPTED, amendment.status());
        assertTrue(amendment.supersedeAccepted());
        assertTrue(amendment.applyNow());
    }

    @Test
    void enAttenteDuProfesseur_leProfesseurContrePropose() {
        Proposal counter = ContractRules.propose(Party.EDUCATOR, true, ContractRules.PENDING_TEACHER, false);
        assertEquals(ContractRules.REJECTED, counter.previousPending());
        assertEquals(ContractRules.PENDING_LEARNER, counter.status());
        assertFalse(counter.applyNow());
    }

    @Test
    void enAttenteDuProfesseur_laNouvellePropositionDeLEleveRetireLaPrecedente() {
        Proposal again = ContractRules.propose(Party.LEARNER, true, ContractRules.PENDING_TEACHER, false);
        assertEquals(ContractRules.WITHDRAWN, again.previousPending());
        assertEquals(ContractRules.PENDING_TEACHER, again.status());
        assertTrue(again.applyNow());
        Proposal engaged = ContractRules.propose(Party.LEARNER, true, ContractRules.PENDING_TEACHER, true);
        assertFalse(engaged.applyNow());
    }

    @Test
    void enAttenteDeLEleve_laContrePropositionDeLEleveRejetteLaProposition() {
        Proposal counter = ContractRules.propose(Party.LEARNER, true, ContractRules.PENDING_LEARNER, true);
        assertEquals(ContractRules.REJECTED, counter.previousPending());
        assertEquals(ContractRules.PENDING_TEACHER, counter.status());
        assertFalse(counter.applyNow());
    }

    @Test
    void enAttenteDeLEleve_laNouvellePropositionDuProfesseurRetireLaPrecedente() {
        Proposal again = ContractRules.propose(Party.EDUCATOR, true, ContractRules.PENDING_LEARNER, true);
        assertEquals(ContractRules.WITHDRAWN, again.previousPending());
        assertEquals(ContractRules.PENDING_LEARNER, again.status());
    }

    @Test
    void unAvenantSurUnContratEnVigueurAttendLaPartieAdverseSansLeRemplacer() {
        Proposal learner = ContractRules.propose(Party.LEARNER, true, null, true);
        assertEquals(ContractRules.PENDING_TEACHER, learner.status());
        assertFalse(learner.supersedeAccepted());
        assertFalse(learner.applyNow());
        Proposal teacher = ContractRules.propose(Party.EDUCATOR, true, null, true);
        assertEquals(ContractRules.PENDING_LEARNER, teacher.status());
        assertFalse(teacher.supersedeAccepted());
        assertFalse(teacher.applyNow());
    }

    @Test
    void laPartieAdverseAccepteOuRefuse() {
        Decision accepted = ContractRules.decide(Party.EDUCATOR, ContractRules.PENDING_TEACHER, true);
        assertEquals(ContractRules.ACCEPTED, accepted.status());
        assertTrue(accepted.supersedeAccepted());
        assertTrue(accepted.apply());
        Decision learnerAccepts = ContractRules.decide(Party.LEARNER, ContractRules.PENDING_LEARNER, true);
        assertEquals(ContractRules.ACCEPTED, learnerAccepts.status());
        assertTrue(learnerAccepts.apply());
        Decision refused = ContractRules.decide(Party.LEARNER, ContractRules.PENDING_LEARNER, false);
        assertEquals(ContractRules.REJECTED, refused.status());
        assertFalse(refused.apply());
        assertFalse(refused.supersedeAccepted());
    }

    @Test
    void personneNeDecideAPlaceDeLaPartieAdverseNiSurUnContratClos() {
        assertEquals(403, status(() -> ContractRules.decide(Party.LEARNER, ContractRules.PENDING_TEACHER, true)));
        assertEquals(403, status(() -> ContractRules.decide(Party.EDUCATOR, ContractRules.PENDING_LEARNER, false)));
        for (String closed : new String[] {ContractRules.ACCEPTED, ContractRules.REJECTED, ContractRules.SUPERSEDED,
                ContractRules.WITHDRAWN}) {
            assertEquals(409, status(() -> ContractRules.decide(Party.EDUCATOR, closed, true)));
        }
        assertTrue(ContractRules.canDecide(Party.EDUCATOR, ContractRules.PENDING_TEACHER));
        assertFalse(ContractRules.canDecide(Party.EDUCATOR, ContractRules.PENDING_LEARNER));
        assertFalse(ContractRules.canDecide(null, ContractRules.PENDING_LEARNER));
    }

    @Test
    void lesChampsDuContratSontBornes() {
        assertEquals("teacher", ContractRules.proposedBy(Party.EDUCATOR, "teacher"));
        assertEquals("admin", ContractRules.proposedBy(Party.EDUCATOR, "admin"));
        assertEquals("learner", ContractRules.proposedBy(Party.LEARNER, "learner"));
        assertNull(ContractRules.checkNote("  "));
        assertEquals("Bien", ContractRules.checkNote(" Bien "));
        assertEquals(400, status(() -> ContractRules.checkNote("x".repeat(1001))));
        assertEquals(120, ContractRules.checkWeeklyMinutes(120));
        assertEquals(400, status(() -> ContractRules.checkWeeklyMinutes(null)));
        assertEquals(400, status(() -> ContractRules.checkWeeklyMinutes(5041)));
    }
}
