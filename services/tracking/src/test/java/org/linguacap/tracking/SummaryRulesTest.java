package org.linguacap.tracking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

/** Constat de revue : un élève en pause accumulait des séances en retard et passait « À relancer ». */
class SummaryRulesTest {
    private static final OffsetDateTime NOW = OffsetDateTime.of(2026, 12, 10, 12, 0, 0, 0, ZoneOffset.UTC);
    private static final OffsetDateTime PAUSED_AT = NOW.minusDays(5);

    @Test
    void unObjectifEnCoursCompteLeRetardJusquÀMaintenant() {
        assertEquals(NOW, SummaryRules.lateCutoff("active", PAUSED_AT, NOW));
        assertEquals(NOW, SummaryRules.lateCutoff("paused", null, NOW), "Sans heure de pause connue : comme avant");
    }

    @Test
    void enPauseSeulesLesSéancesÉchuesAvantLaPauseSontEnRetard() {
        OffsetDateTime cutoff = SummaryRules.lateCutoff("paused", PAUSED_AT, NOW);
        assertEquals(PAUSED_AT, cutoff);
        assertTrue(SummaryRules.late(PAUSED_AT.minusDays(1), null, cutoff), "Échue avant la pause : en retard");
        assertFalse(SummaryRules.late(PAUSED_AT.plusDays(2), null, cutoff), "Échue pendant la pause : pas de retard");
        assertTrue(SummaryRules.late(PAUSED_AT.minusDays(3), PAUSED_AT.minusDays(1), cutoff), "Terminée après l'échéance");
        assertFalse(SummaryRules.late(PAUSED_AT.minusDays(3), PAUSED_AT.minusDays(4), cutoff));
    }

    @Test
    void enPauseLaProchaineÉchéanceEstLaReprise() {
        OffsetDateTime next = NOW.plusDays(1);
        assertEquals(next, SummaryRules.nextDue("active", next, null));
        assertNull(SummaryRules.nextDue("paused", next, null), "Reprise pas encore prévue : aucune échéance");
        OffsetDateTime resume = SummaryRules.nextDue("paused", next, LocalDate.of(2026, 12, 20));
        assertEquals(OffsetDateTime.of(2026, 12, 19, 23, 0, 0, 0, ZoneOffset.UTC).toInstant(), resume.toInstant(),
                "Minuit à Paris le jour de la reprise");
    }
}
