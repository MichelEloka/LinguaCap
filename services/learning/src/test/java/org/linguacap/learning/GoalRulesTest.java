package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.ws.rs.WebApplicationException;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.linguacap.learning.Planner.Day;

class GoalRulesTest {
    private static final LocalDate TODAY = LocalDate.of(2026, 11, 23);

    private static void assertBadRequest(org.junit.jupiter.api.function.Executable rule) {
        assertEquals(400, assertThrows(WebApplicationException.class, rule).getResponse().getStatus());
    }

    @Test
    void lIntensifViseA1EnUnMoisEtA2EnDeuxMois() {
        assertEquals(LocalDate.of(2026, 12, 23), GoalRules.defaultTarget("intensive", "A1", TODAY));
        assertEquals(LocalDate.of(2027, 1, 23), GoalRules.defaultTarget("intensive", "A2", TODAY));
        assertEquals(LocalDate.of(2027, 2, 23), GoalRules.defaultTarget("standard", "A1", TODAY));
        var intensive = GoalRules.template("intensive");
        assertEquals(7, intensive.days().size());
        assertTrue(intensive.days().stream().allMatch(day -> day.sessions() == 2 && day.minutes() == 45));
        assertBadRequest(() -> GoalRules.template("express"));
    }

    @Test
    void lesDatesDoiventSeSuivreDansUnDelaiRaisonnable() {
        assertDoesNotThrow(() -> GoalRules.checkDates(TODAY, TODAY.plusMonths(1), TODAY));
        assertBadRequest(() -> GoalRules.checkDates(TODAY.minusDays(1), TODAY.plusMonths(1), TODAY));
        assertBadRequest(() -> GoalRules.checkDates(TODAY, TODAY, TODAY));
        assertBadRequest(() -> GoalRules.checkDates(TODAY, TODAY.plusYears(2), TODAY));
    }

    @Test
    void lesDisponibilitesAcceptentUneCadenceDifferenteSelonLesJours() {
        List<Day> week = GoalRules.checkAvailability(List.of(new Day(6, 3, 30), new Day(1, 2, 45), new Day(2, 1, 20)));
        assertEquals(List.of(1, 2, 6), week.stream().map(Day::weekday).toList(), "Les jours sont triés");
        assertBadRequest(() -> GoalRules.checkAvailability(List.of()));
        assertBadRequest(() -> GoalRules.checkAvailability(List.of(new Day(1, 1, 30), new Day(1, 2, 30))));
        assertBadRequest(() -> GoalRules.checkAvailability(List.of(new Day(8, 1, 30))));
        assertBadRequest(() -> GoalRules.checkAvailability(List.of(new Day(1, 7, 30))));
        assertBadRequest(() -> GoalRules.checkAvailability(List.of(new Day(1, 4, 200))));
        assertBadRequest(() -> GoalRules.checkAvailability(List.of(new Day(1, 1, 5))));
    }

    @Test
    void leNiveauDeDepartEstUnNiveauConnu() {
        assertEquals("A0", GoalRules.checkStartLevel("A0"));
        assertBadRequest(() -> GoalRules.checkStartLevel("Z9"));
        assertBadRequest(() -> GoalRules.checkStartLevel(null));
    }

    @Test
    void leProfesseurValideLAccompagneEtLElevelAutonome() {
        assertTrue(GoalRules.canValidate(false, "teacher", true));
        assertFalse(GoalRules.canValidate(true, "learner", true));
        assertTrue(GoalRules.canValidate(true, "learner", false));
        assertFalse(GoalRules.canValidate(false, "teacher", false));
        assertTrue(GoalRules.canValidate(false, "admin", true));
        assertTrue(GoalRules.canValidate(false, "admin", false));
        assertFalse(GoalRules.canValidate(false, "staff", false));
    }
}
