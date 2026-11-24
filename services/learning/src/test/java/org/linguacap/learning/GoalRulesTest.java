package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.WebApplicationException;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.linguacap.learning.Planner.Day;

class GoalRulesTest {
    private static final LocalDate TODAY = LocalDate.of(2026, 11, 23);
    private static final ObjectMapper JSON = new ObjectMapper();

    private static JsonNode json(String text) {
        try {
            return JSON.readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalArgumentException(error);
        }
    }

    private static void assertBadRequest(org.junit.jupiter.api.function.Executable rule) {
        assertEquals(400, assertThrows(WebApplicationException.class, rule).getResponse().getStatus());
    }

    @Test
    void lIntensifViseA1EnUnMoisEtA2EnDeuxMois() {
        assertEquals(LocalDate.of(2026, 12, 23), GoalRules.defaultTarget("intensive", "A1", 2596, TODAY));
        assertEquals(LocalDate.of(2027, 1, 23), GoalRules.defaultTarget("intensive", "A2", 2410, TODAY));
        assertEquals(LocalDate.of(2027, 4, 23), GoalRules.defaultTarget("standard", "A1", 2596, TODAY));
        assertEquals(LocalDate.of(2027, 4, 23), GoalRules.defaultTarget("standard", "A2", null, TODAY));
        var intensive = GoalRules.template("intensive");
        assertEquals(7, intensive.days().size());
        assertTrue(intensive.days().stream().allMatch(day -> day.sessions() == 2 && day.minutes() == 45));
        assertBadRequest(() -> GoalRules.template("express"));
    }

    @Test
    void lesNouveauxNiveauxSuiventLaDuréePrévueDeLeurVersionEtA1A2GardentLeursDurées() {
        // B1 : 3 000 min d'activités + 24 révisions de 15 min + bilan 60 + examen blanc 120 ≈ 3 540 min.
        assertEquals(LocalDate.of(2027, 6, 23), GoalRules.defaultTarget("standard", "B1", 3540, TODAY), "sept mois en standard");
        assertEquals(LocalDate.of(2027, 1, 23), GoalRules.defaultTarget("intensive", "B1", 3540, TODAY), "deux mois en intensif");
        assertEquals(7, GoalRules.template("standard").durationFor("B2", 3540).getMonths(), "B2 de même volume : idem");
        assertEquals(2, GoalRules.template("intensive").durationFor("B2", 3540).getMonths());
        // A1 et A2 : surcharges calibrées, quelle que soit la durée prévue.
        assertEquals(5, GoalRules.template("standard").durationFor("A1", 9000).getMonths());
        assertEquals(1, GoalRules.template("intensive").durationFor("A1", 9000).getMonths());
        assertEquals(2, GoalRules.template("intensive").durationFor("A2", 100).getMonths());
        // Durée prévue inconnue : durée générique du modèle.
        assertEquals(5, GoalRules.template("standard").durationFor("C1", null).getMonths());
        assertEquals(2, GoalRules.template("intensive").durationFor("C1", 0).getMonths());
        assertEquals(TODAY.plusDays(Planner.MAX_DAYS), GoalRules.defaultTarget("standard", "C1", 20000, TODAY),
                "un très gros niveau reste dans la limite d'un objectif (treize mois)");

        assertEquals(150, GoalRules.template("standard").weeklyMinutes());
        assertEquals(630, GoalRules.template("intensive").weeklyMinutes());
        assertEquals(1, GoalRules.months(10, 150), "un mois au moins");
        assertEquals(1, GoalRules.months(0, 150));
        // 150 × 4,345 / 1,25 = 521,4 min tiennent dans un mois ; une minute de plus en demande deux.
        assertEquals(1, GoalRules.months(521, 150));
        assertEquals(2, GoalRules.months(522, 150));
        assertTrue(GoalRules.template("intensive").description().contains("selon le niveau"));
    }

    @Test
    void laDuréePrévueDUneVersionSeCalculeCommeAuCatalogue() {
        JsonNode track = json("""
                {'planning': {'reviewMinutes': 15, 'midtermMinutes': 60, 'finalMinutes': 120},
                 'modules': [
                   {'id': 'b1-wohnen', 'activities': [{'estimatedMinutes': 20}, {'estimatedMinutes': 18}]},
                   {'id': 'b1-wohnen-atelier', 'activities': [{'estimatedMinutes': 25}]},
                   {'id': 'vide', 'activities': []}]}
                """);
        assertEquals(20 + 18 + 25 + 15 * 2 + 60 + 120, GoalRules.plannedMinutes(track), "module vide sans révision");
        JsonNode old = json("{'modules': [{'id': 'm', 'activities': [{'estimatedMinutes': 30}]}]}");
        assertEquals(30 + 10 + 30 + 60, GoalRules.plannedMinutes(old), "réglages par défaut d'une version ancienne");
        assertEquals(null, GoalRules.plannedMinutes(json("{}")));
    }

    @Test
    void lesModèlesDonnentUneDuréeParNiveauPublié() {
        JsonNode languages = json("""
                [{'id': 'de', 'levels': [
                   {'code': 'A1', 'published': true, 'plannedMinutes': 2596},
                   {'code': 'A2', 'published': true, 'plannedMinutes': 2410},
                   {'code': 'B1', 'published': true, 'plannedMinutes': 3540},
                   {'code': 'B2', 'published': false, 'plannedMinutes': null}]},
                 {'id': 'en', 'levels': [{'code': 'A1', 'published': false, 'plannedMinutes': null}]}]
                """);
        var standard = GoalRules.durations(GoalRules.template("standard"), languages);
        assertEquals(List.of(new GoalResource.TemplateDuration("A1", 5, 2596), new GoalResource.TemplateDuration("A2", 5, 2410),
                new GoalResource.TemplateDuration("B1", 7, 3540)), standard, "B2 non publié : absent");
        var intensive = GoalRules.durations(GoalRules.template("intensive"), languages);
        assertEquals(List.of(1, 2, 2), intensive.stream().map(GoalResource.TemplateDuration::months).toList());
        assertEquals(List.of(), GoalRules.durations(GoalRules.template("standard"), null), "catalogue indisponible");
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
        assertEquals("C1", GoalRules.checkStartLevel("C1"));
        assertBadRequest(() -> GoalRules.checkStartLevel("C2"));
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
