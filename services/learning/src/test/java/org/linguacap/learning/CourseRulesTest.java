package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.ws.rs.WebApplicationException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;

class CourseRulesTest {
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-22T10:00:00+01:00");

    @Test
    void lEtatDUneSeanceSuitSonAvancementEtSonEcheance() {
        OffsetDateTime later = NOW.plusDays(1);
        assertEquals("planned", CourseRules.sessionStatus(null, null, later, NOW));
        assertEquals("in_progress", CourseRules.sessionStatus(NOW, null, later, NOW));
        assertEquals("late", CourseRules.sessionStatus(NOW, null, NOW.minusMinutes(1), NOW));
        assertEquals("late", CourseRules.sessionStatus(null, null, NOW.minusDays(1), NOW));
        assertEquals("completed", CourseRules.sessionStatus(NOW, NOW, NOW.minusDays(1), NOW),
                "Une séance terminée après l’échéance reste terminée : le retard est mesuré par Suivi.");
    }

    @Test
    void lEcheanceTombeA20HeuresAParisDansLAnneeQuiVient() {
        LocalDate today = LocalDate.of(2026, 11, 22);
        OffsetDateTime winter = CourseRules.firstDue("2026-11-24", today);
        assertEquals(OffsetDateTime.parse("2026-11-24T20:00:00+01:00"), winter);
        OffsetDateTime summer = CourseRules.firstDue("2027-07-01", today);
        assertEquals(OffsetDateTime.parse("2027-07-01T20:00:00+02:00"), summer);
        assertEquals(today, CourseRules.firstDue("2026-11-22", today).toLocalDate());
    }

    @Test
    void uneEcheanceInvalideEstRefusee() {
        LocalDate today = LocalDate.of(2026, 11, 22);
        for (String date : new String[] {"2026-11-21", "2027-11-23", "22/11/2026", "", null}) {
            var error = assertThrows(WebApplicationException.class, () -> CourseRules.firstDue(date, today));
            assertEquals(400, error.getResponse().getStatus());
        }
    }

    @Test
    void laTranscriptionSuitLaRegleDuSupport() {
        assertTrue(CourseRules.transcriptAvailable("on_demand", false, false));
        assertFalse(CourseRules.transcriptAvailable("after_answer", false, false));
        assertTrue(CourseRules.transcriptAvailable("after_answer", true, false));
        assertFalse(CourseRules.transcriptAvailable("hidden", true, false));
        assertFalse(CourseRules.transcriptAvailable(null, true, false));
        assertTrue(CourseRules.transcriptAvailable("hidden", false, true), "L’équipe pédagogique voit toujours la transcription.");
    }

    @Test
    void seuleUneActiviteNoteeExigeUneTentative() {
        assertTrue(CourseRules.requiresAttempt("exercise"));
        assertTrue(CourseRules.requiresAttempt("assessment"));
        assertFalse(CourseRules.requiresAttempt("lesson"));
        assertFalse(CourseRules.requiresAttempt("review"));
    }
}
