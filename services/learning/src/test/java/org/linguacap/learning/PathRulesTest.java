package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.WebApplicationException;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.linguacap.learning.PathRules.Caller;
import org.linguacap.learning.PathRules.Engagement;
import org.linguacap.learning.PathRules.PathState;
import org.linguacap.learning.PathRules.Permissions;
import org.linguacap.learning.PathRules.ProposalState;
import org.linguacap.learning.Planner.Day;

class PathRulesTest {
    private static final LocalDate MONDAY = LocalDate.of(2026, 11, 23);
    private static final Caller AUTONOMOUS = new Caller(true, false, false, false);
    private static final Caller ACCOMPANIED = new Caller(true, false, false, true);
    private static final Caller TEACHER = new Caller(false, true, false, true);
    private static final Caller ADMIN = new Caller(false, false, true, true);

    private static JsonNode json(String text) {
        try {
            return new ObjectMapper().readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalArgumentException(error);
        }
    }

    private static int status(org.junit.jupiter.api.function.Executable rule) {
        return assertThrows(WebApplicationException.class, rule).getResponse().getStatus();
    }

    @Test
    void lesRangsSuiventLeCadreEuropeen() {
        assertEquals(0, PathRules.rank("A0"));
        assertEquals(1, PathRules.rank("A1"));
        assertEquals(6, PathRules.rank("C2"));
        assertEquals(-1, PathRules.rank("Z9"));
        assertEquals(List.of("A1", "A2"), PathRules.levelsBetween("A0", "A2"));
        assertEquals(List.of("A2", "B1"), PathRules.levelsBetween("A1", "B1"));
        assertEquals(List.of(), PathRules.levelsBetween("A2", "A2"));
    }

    @Test
    void lePrerequisDUneEtapeEstLuDansLeCatalogueEtNonDeduitDuRang() {
        JsonNode b1 = json("{'levelCode': 'B1', 'planning': {'prerequisiteLevelCode': 'A2'}}");
        assertEquals("A2", PathRules.prerequisiteOf(b1));
        // Le catalogue décide : un B1 dont le prérequis a été changé en A1 n'exige plus A2 (le rang dirait A2).
        JsonNode changed = json("{'levelCode': 'B1', 'planning': {'prerequisiteLevelCode': 'A1'}}");
        assertEquals("A1", PathRules.prerequisiteOf(changed));
        // Un niveau sans prérequis au catalogue (C1 de démonstration, premier niveau) n'en a pas, quel que soit son rang.
        assertNull(PathRules.prerequisiteOf(json("{'levelCode': 'C1', 'planning': {'prerequisiteLevelCode': null}}")));
        assertNull(PathRules.prerequisiteOf(json("{'levelCode': 'A1', 'planning': {}}")));
        assertNull(PathRules.prerequisiteOf(json("{'levelCode': 'B1', 'planning': {'prerequisiteLevelCode': 'b1'}}")),
                "un code hors de l'échelle est ignoré");
        assertNull(PathRules.prerequisiteOf(null));
    }

    @Test
    void lesCiblesAutoriseesSontLesNiveauxPubliesConsecutifsAuDessusDuDepart() {
        assertEquals(List.of("A2", "B1"), PathRules.allowedTargets("A1", Set.of("A1", "A2", "B1")), "B1 publié : proposé");
        assertEquals(List.of("A2", "B1"), PathRules.allowedTargets("A1", Set.of("A1", "A2", "B1", "C1")),
                "l'enchaînement s'arrête au premier niveau non publié (B2)");
        assertEquals(List.of("A1", "A2"), PathRules.allowedTargets("A0", Set.of("A1", "A2")));
        assertEquals(List.of("A2"), PathRules.allowedTargets("A1", Set.of("A1", "A2", "B2")));
        assertEquals(List.of(), PathRules.allowedTargets("A2", Set.of("A1", "A2")));
        assertEquals(List.of(), PathRules.allowedTargets("A0", Set.of("A2")));
    }

    @Test
    void leDepartNePeutPasDepasserLeResultatDuTest() {
        PathRules.checkStartNotAbovePlacement("A0", "A1");
        PathRules.checkStartNotAbovePlacement("A1", "A1");
        assertEquals(409, status(() -> PathRules.checkStartNotAbovePlacement("A2", "A1")));
        assertEquals(400, status(() -> PathRules.checkStartLevel("C2")));
        assertEquals(400, status(() -> PathRules.checkTargetLevel("A0")));
    }

    @Test
    void laDifficulteSuitLeBaremeHebdomadaire() {
        // 1 286 minutes (A1) en 13 semaines : 99 min par semaine, léger.
        assertEquals("light", PathRules.difficulty(1286, MONDAY, MONDAY.plusWeeks(13)).code());
        assertEquals(99, PathRules.difficulty(1286, MONDAY, MONDAY.plusWeeks(13)).requiredWeeklyMinutes());
        assertEquals("moderate", PathRules.difficulty(300, MONDAY, MONDAY.plusWeeks(1)).code());
        assertEquals("sustained", PathRules.difficulty(301, MONDAY, MONDAY.plusWeeks(1)).code());
        assertEquals("intensive", PathRules.difficulty(630, MONDAY, MONDAY.plusWeeks(1)).code());
        assertEquals("very_intensive", PathRules.difficulty(840, MONDAY, MONDAY.plusWeeks(1)).code());
        assertEquals("unrealistic", PathRules.difficulty(841, MONDAY, MONDAY.plusWeeks(1)).code());
        assertEquals("Irréaliste", PathRules.difficulty(841, MONDAY, MONDAY.plusWeeks(1)).label());
        // Moins d'une semaine est toujours irréaliste, même pour une charge minime.
        assertEquals("unrealistic", PathRules.difficulty(10, MONDAY, MONDAY.plusDays(6)).code());
        assertEquals(409, status(() -> PathRules.checkObjective("unrealistic")));
        PathRules.checkObjective("very_intensive");
    }

    @Test
    void chaqueBandeIndiqueLaPremiereDateCibleQuiLaRespecte() {
        List<PathRules.BandView> bands = PathRules.bands(2605, MONDAY);
        assertEquals(6, bands.size());
        assertNull(bands.get(5).earliestTargetDate());
        for (PathRules.BandView band : bands.subList(0, 5)) {
            LocalDate earliest = LocalDate.parse(band.earliestTargetDate());
            assertTrue(PathRules.requiredWeeklyMinutes(2605, MONDAY, earliest) <= band.maxWeeklyMinutes(), band.code());
            assertTrue(PathRules.requiredWeeklyMinutes(2605, MONDAY, earliest.minusDays(1)) > band.maxWeeklyMinutes(),
                    band.code() + " : la veille dépasse la bande");
        }
        // Une charge nulle reste au moins une semaine.
        assertEquals(MONDAY.plusDays(7).toString(), PathRules.bands(0, MONDAY).get(0).earliestTargetDate());
    }

    @Test
    void lesDisponibilitesProposeesCouvrentLaChargeAvecUneMarge() {
        List<Day> light = PathRules.suggestedAvailability(100);
        assertEquals(5, light.size());
        assertEquals(new Day(1, 1, 25), light.get(0));
        assertEquals(new Day(5, 1, 15), PathRules.suggestedAvailability(20).get(4));
        List<Day> sustained = PathRules.suggestedAvailability(400);
        assertEquals(2, sustained.get(0).sessions());
        assertTrue(PathRules.weeklyCapacity(sustained) >= 400 * 1.15);
        List<Day> heavy = PathRules.suggestedAvailability(1200);
        assertEquals(7, heavy.size());
        assertTrue(PathRules.weeklyCapacity(heavy) >= 1200);
        for (int weekly : List.of(0, 60, 150, 300, 450, 630, 840, 2000, 5040)) {
            for (Day day : PathRules.suggestedAvailability(weekly)) {
                GoalRules.checkAvailability(List.of(day));
            }
        }
    }

    @Test
    void laFaisabiliteCompareLaChargeEtLaCapacite() {
        assertEquals("comfortable", PathRules.feasibility(85, 100).code());
        assertEquals("tight", PathRules.feasibility(100, 100).code());
        assertEquals("insufficient", PathRules.feasibility(101, 100).code());
        assertEquals(999, PathRules.feasibility(10, 0).loadPercent());
        assertEquals(0, PathRules.feasibility(0, 0).loadPercent());
    }

    @Test
    void lEngagementEstLaChargeNecessaireBorneeParLesJoursChoisis() {
        List<Day> week = List.of(new Day(1, 1, 30), new Day(3, 1, 30));
        assertEquals(60, PathRules.weeklyCapacity(week));
        assertEquals(45, PathRules.commitment(45, week));
        assertEquals(60, PathRules.commitment(120, week));
        assertTrue(PathRules.respectsCommitment(week, 60));
        assertFalse(PathRules.respectsCommitment(week, 61));
    }

    @Test
    void uneDateCibleTropLointaineOuAnterieureEstRefusee() {
        PathRules.checkDates(MONDAY, MONDAY.plusYears(2), MONDAY);
        assertEquals(400, status(() -> PathRules.checkDates(MONDAY, MONDAY, MONDAY)));
        assertEquals(400, status(() -> PathRules.checkDates(MONDAY, MONDAY.plusDays(PathRules.MAX_PATH_DAYS + 1), MONDAY)));
        assertEquals(400, status(() -> PathRules.checkDates(MONDAY.minusDays(1), MONDAY.plusMonths(3), MONDAY)));
    }

    @Test
    void uneValidationEstBloqueeParLaRaisonLaPlusUtile() {
        List<Day> days = List.of(new Day(1, 1, 60), new Day(2, 1, 60));
        LocalDate target = MONDAY.plusMonths(3);
        ProposalState fresh = new ProposalState("proposed", 2, 2, 0, target, days);
        assertNull(PathRules.blockingReason(ACCOMPANIED, "active", "A2", fresh, null));
        assertNull(PathRules.blockingReason(TEACHER, "active", "A2", fresh, null));
        assertEquals("stale", PathRules.blockingReason(TEACHER, "active", "A2",
                new ProposalState("proposed", 1, 2, 0, target, days), null));
        assertEquals("overflow", PathRules.blockingReason(TEACHER, "active", "A2",
                new ProposalState("proposed", 2, 2, 3, target, days), null));
        Engagement engagement = new Engagement("A2", target, 120);
        assertNull(PathRules.blockingReason(TEACHER, "active", "A2", fresh, engagement));
        assertEquals("objective_locked", PathRules.blockingReason(TEACHER, "active", "A2",
                new ProposalState("proposed", 2, 2, 0, target.plusDays(7), days), engagement));
        assertEquals("objective_locked", PathRules.blockingReason(TEACHER, "active", "B1", fresh, engagement));
        assertEquals("commitment", PathRules.blockingReason(ACCOMPANIED, "active", "A2",
                new ProposalState("proposed", 2, 2, 0, target, List.of(new Day(1, 1, 60))), engagement));
        // Des jours sous l'engagement débordent souvent : l'engagement est signalé en premier.
        assertEquals("commitment", PathRules.blockingReason(ACCOMPANIED, "active", "A2",
                new ProposalState("proposed", 2, 2, 4, target, List.of(new Day(1, 1, 60))), engagement));
        assertEquals("overflow", PathRules.blockingReason(ACCOMPANIED, "active", "A2",
                new ProposalState("proposed", 2, 2, 4, target, days), engagement));
        // Brouillon : seul l'élève démarre son parcours.
        ProposalState draft = new ProposalState("proposed", 0, 0, 0, target, days);
        assertNull(PathRules.blockingReason(AUTONOMOUS, "draft", "A2", draft, null));
        assertEquals("not_allowed", PathRules.blockingReason(TEACHER, "draft", "A2", draft, null));
        assertNull(PathRules.blockingReason(TEACHER, "active", "A2",
                new ProposalState("validated", 2, 2, 0, target, days), null));
    }

    @Test
    void laRemiseDeLExamenBlancOuvreLeNiveauSuivantEtSaValidationTermineLeParcours() {
        assertEquals(PathRules.ExamFollowUp.ACTIVATE_NEXT,
                PathRules.examFollowUp("active", true, "final", "submitted", null));
        assertEquals(PathRules.ExamFollowUp.NONE, PathRules.examFollowUp("active", false, "final", "submitted", null));
        assertEquals(PathRules.ExamFollowUp.NONE, PathRules.examFollowUp("active", true, "midterm", "submitted", null));
        assertEquals(PathRules.ExamFollowUp.COMPLETE_PATH,
                PathRules.examFollowUp("active", false, "final", "graded", "validated"));
        assertEquals(PathRules.ExamFollowUp.NONE,
                PathRules.examFollowUp("active", false, "final", "graded", "to_consolidate"));
        // Le niveau suivant a déjà été ouvert à la remise : la correction ne change rien.
        assertEquals(PathRules.ExamFollowUp.NONE, PathRules.examFollowUp("active", true, "final", "graded", "validated"));
    }

    @Test
    void laRepriseDeLExamenDUnNiveauTermineNeReactiveJamaisLeNiveauSuivant() {
        // Niveau terminé « à consolider » : remise puis correction de la nouvelle tentative (lot A3).
        for (String event : List.of("submitted", "graded")) {
            for (String decision : new String[] {null, "validated", "to_consolidate"}) {
                assertEquals(PathRules.ExamFollowUp.NONE, PathRules.examFollowUp("completed", true, "final", event, decision));
                assertEquals(PathRules.ExamFollowUp.NONE, PathRules.examFollowUp("completed", false, "final", event, decision));
            }
        }
        assertEquals(PathRules.ExamFollowUp.NONE, PathRules.examFollowUp(null, true, "final", "submitted", null));
    }

    @Test
    void unPrerequisNonConfirmeEmpecheLaValidationAvantMemeLeDebordement() {
        List<Day> days = List.of(new Day(1, 1, 60), new Day(2, 1, 60));
        LocalDate target = MONDAY.plusMonths(3);
        // Attribution historique d'A2 sans A1 validé : personne ne valide avant le diagnostic ou la confirmation.
        ProposalState waiting = new ProposalState("proposed", 0, 0, 0, target, days, false);
        for (Caller caller : List.of(TEACHER, ADMIN, ACCOMPANIED, AUTONOMOUS)) {
            assertEquals("not_allowed", PathRules.blockingReason(caller, "active", "A2", waiting, null));
        }
        assertEquals("not_allowed", PathRules.blockingReason(TEACHER, "active", "A2",
                new ProposalState("proposed", 0, 0, 5, target, days, false), null));
        assertEquals("stale", PathRules.blockingReason(TEACHER, "active", "A2",
                new ProposalState("proposed", 0, 1, 0, target, days, false), null));
        assertNull(PathRules.blockingReason(TEACHER, "active", "A2",
                new ProposalState("proposed", 0, 0, 0, target, days, true), null));
        // validatable et canValidate suivent la raison bloquante.
        PathState active = new PathState("active", false, false, "preparing", null, true);
        String reason = PathRules.blockingReason(TEACHER, "active", "A2", waiting, null);
        assertFalse(PathRules.permissions(TEACHER, active, reason, true).canValidate());
    }

    @Test
    void lesDroitsCalculesSuiventLeRoleEtLEtatDuParcours() {
        PathState draft = new PathState("draft", false, true, null, null, false);
        Permissions learnerDraft = PathRules.permissions(AUTONOMOUS, draft, null, true);
        assertTrue(learnerDraft.canEditAvailability());
        assertTrue(learnerDraft.canValidate());
        assertTrue(learnerDraft.canChangeObjective());
        assertFalse(learnerDraft.canProposeContract());
        assertFalse(learnerDraft.canAdvance());
        Permissions teacherDraft = PathRules.permissions(TEACHER, draft, "not_allowed", true);
        assertFalse(teacherDraft.canEditAvailability());
        assertFalse(teacherDraft.canValidate());
        assertFalse(teacherDraft.canChangeObjective());

        PathState active = new PathState("active", false, true, "active", "pending_teacher", false);
        Permissions accompanied = PathRules.permissions(ACCOMPANIED, active, null, false);
        assertTrue(accompanied.canEditAvailability());
        assertFalse(accompanied.canValidate());
        assertFalse(accompanied.canChangeObjective());
        assertTrue(accompanied.canProposeContract());
        assertFalse(accompanied.canDecideContract());
        assertFalse(accompanied.canPause());
        assertFalse(accompanied.canAddCourses());
        assertFalse(accompanied.canAdvance());
        Permissions teacher = PathRules.permissions(TEACHER, active, null, true);
        assertTrue(teacher.canDecideContract());
        assertTrue(teacher.canPause());
        assertTrue(teacher.canAddCourses());
        assertTrue(teacher.canAdvance());
        assertTrue(teacher.canValidate());
        assertTrue(PathRules.permissions(ADMIN, active, null, false).canAddCourses());
        assertTrue(PathRules.permissions(AUTONOMOUS, active, null, false).canPause());

        PathState waitingLearner = new PathState("active", false, true, "awaiting_grading", "pending_learner", true);
        assertTrue(PathRules.permissions(ACCOMPANIED, waitingLearner, null, false).canDecideContract());
        assertTrue(PathRules.permissions(ACCOMPANIED, waitingLearner, null, false).canAdvance());
        assertFalse(PathRules.permissions(TEACHER, waitingLearner, null, false).canDecideContract());
        PathState lastLevel = new PathState("active", true, false, "awaiting_grading", null, true);
        assertFalse(PathRules.permissions(TEACHER, lastLevel, null, false).canAdvance());
        assertFalse(PathRules.permissions(TEACHER, lastLevel, null, false).canPause());
        PathState completed = new PathState("completed", false, false, "validated", null, true);
        Permissions done = PathRules.permissions(TEACHER, completed, null, false);
        assertFalse(done.canEditAvailability() || done.canProposeContract() || done.canAddCourses() || done.canAdvance());
    }
}
