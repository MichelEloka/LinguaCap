package org.linguacap.tracking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class RiskRulesTest {
    private static final OffsetDateTime NOW = OffsetDateTime.of(2026, 12, 10, 12, 0, 0, 0, ZoneOffset.UTC);

    /** Une séance par jour à partir de start ; les n premières sont terminées. */
    private static List<RiskRules.Slot> daily(OffsetDateTime start, int count, int completed, int midtermAt, int finalAt) {
        List<RiskRules.Slot> slots = new ArrayList<>();
        for (int index = 0; index < count; index++) {
            OffsetDateTime due = start.plusDays(index);
            String milestone = index == midtermAt ? "midterm" : index == finalAt ? "final" : null;
            slots.add(new RiskRules.Slot("s" + index, due, index < completed ? due.minusHours(1) : null, milestone));
        }
        return slots;
    }

    @Test
    void leTempsDePratiqueSArreteAprèsDixMinutesSansActivité() {
        OffsetDateTime start = NOW.minusHours(2);
        assertEquals(15 * 60, RiskRules.practiceSeconds(List.of(start, start.plusMinutes(5), start.plusMinutes(10),
                start.plusMinutes(50), start.plusMinutes(55))));
        assertEquals(0, RiskRules.practiceSeconds(List.of(start)));
        assertEquals(5 * 60, RiskRules.practiceSeconds(List.of(start.plusMinutes(5), start)), "Un événement arrivé en retard est remis dans l’ordre");
    }

    @Test
    void unObjectifÀJourNEstPasÀRisque() {
        RiskRules.Risk risk = RiskRules.evaluate(daily(NOW.minusDays(3), 10, 4, 6, 9), "active", NOW);
        assertFalse(risk.atRisk());
        assertEquals(0, risk.lateSessions());
        assertEquals("midterm", risk.nextMilestone());
    }

    @Test
    void leRetardSuitLaCadence() {
        // Une séance par jour : deux jours de retard ouvrent l'alerte, une journée non.
        assertFalse(RiskRules.evaluate(daily(NOW.minusDays(1).minusHours(1), 20, 0, 10, 19), "active", NOW).atRisk());
        RiskRules.Risk late = RiskRules.evaluate(daily(NOW.minusDays(2).minusHours(1), 20, 0, 10, 19), "active", NOW);
        assertTrue(late.atRisk());
        assertEquals(3, late.lateSessions());
        // Une séance par semaine : trois semaines de tolérance, deux jours ne suffisent pas.
        List<RiskRules.Slot> weekly = new ArrayList<>();
        for (int index = 0; index < 8; index++) {
            weekly.add(new RiskRules.Slot("w" + index, NOW.minusDays(2).plusWeeks(index), null, index == 7 ? "final" : null));
        }
        assertEquals(Duration.ofDays(7), RiskRules.cadence(weekly));
        assertFalse(RiskRules.evaluate(weekly, "active", NOW).atRisk());
    }

    @Test
    void unJalonProcheAvecDuRetardOuvreLAlerte() {
        List<RiskRules.Slot> slots = daily(NOW.minusDays(1).minusHours(2), 6, 0, 3, 5);
        RiskRules.Risk risk = RiskRules.evaluate(slots, "active", NOW);
        assertTrue(risk.atRisk());
        assertTrue(risk.reason().contains("bilan intermédiaire approche"));
    }

    @Test
    void leBilanObligatoireÉchuEstDétecté() {
        List<RiskRules.Slot> slots = daily(NOW.minusDays(5), 10, 3, 3, 9);
        RiskRules.Risk risk = RiskRules.evaluate(slots, "active", NOW);
        assertTrue(risk.midtermOverdue());
        assertTrue(risk.atRisk());
        assertTrue(risk.reason().startsWith("le bilan intermédiaire n’est pas remis"));
    }

    @Test
    void lesObjectifsEnPauseOuTerminésNOntPasDAlerte() {
        List<RiskRules.Slot> slots = daily(NOW.minusDays(9), 10, 0, 3, 9);
        for (String status : List.of("paused", "validated", "awaiting_grading", "to_consolidate")) {
            RiskRules.Risk risk = RiskRules.evaluate(slots, status, NOW);
            assertFalse(risk.atRisk(), status);
            assertNull(risk.reason());
        }
    }
}
