package org.linguacap.tracking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.linguacap.tracking.KpiRules.Activity;
import org.linguacap.tracking.KpiRules.Attempt;
import org.linguacap.tracking.KpiRules.Filters;
import org.linguacap.tracking.KpiRules.Goal;
import org.linguacap.tracking.KpiRules.Invitation;
import org.linguacap.tracking.KpiRules.Rate;
import org.linguacap.tracking.KpiRules.Relance;
import org.linguacap.tracking.KpiRules.Session;

/** Jeu de données fictif dont chaque indicateur a été calculé à la main (DEV-092). */
class KpiRulesTest {
    private static final OffsetDateTime NOW = at("2026-12-20T12:00");

    private static OffsetDateTime at(String local) {
        return java.time.LocalDateTime.parse(local).atZone(KpiRules.PARIS).toOffsetDateTime();
    }

    private static final List<Invitation> INVITATIONS = List.of(
            new Invitation("inv1", at("2026-12-01T10:00"), "L1"),
            new Invitation("inv1", at("2026-12-05T10:00"), "L1"), // réémission : la fenêtre part de l'envoi d'origine
            new Invitation("inv2", at("2026-12-02T10:00"), "L2"),
            new Invitation("inv3", at("2026-12-18T10:00"), "L3"), // fenêtre non écoulée
            new Invitation("inv4", at("2026-11-20T10:00"), "L4"), // hors période
            new Invitation("inv5", at("2026-12-03T10:00"), null)); // jamais activée

    private static final List<Goal> GOALS = List.of(
            new Goal("E1", "L1", "A0", "A1", "intensive", true, LocalDate.parse("2026-12-15")),
            new Goal("E2", "L2", "A1", "A2", "standard", false, LocalDate.parse("2026-12-18")),
            new Goal("E3", "L4", "A0", "A1", "intensive", true, LocalDate.parse("2026-12-30")));

    private static final List<Session> SESSIONS = List.of(
            new Session("E1", "L1", at("2026-12-06T20:00"), at("2026-12-06T18:00"), null),
            new Session("E1", "L1", at("2026-12-08T20:00"), at("2026-12-09T09:00"), null),
            new Session("E1", "L1", at("2026-12-10T20:00"), null, at("2026-12-09T12:00")), // replanifiée avant l'échéance
            new Session("E1", "L1", at("2026-12-12T20:00"), at("2026-12-11T19:00"), null),
            new Session("E2", "L2", at("2026-12-10T20:00"), null, at("2026-12-15T09:00")), // retard constaté puis replanifiée
            new Session("E2", "L2", at("2026-12-25T20:00"), null, null), // pas encore échue
            new Session("E2", "L2", at("2026-12-14T20:00"), null, null));

    private static final List<Activity> ACTIVITY = List.of(
            new Activity("L1", at("2026-12-06T17:00")), new Activity("L1", at("2026-12-09T08:00")),
            new Activity("L2", at("2026-12-12T10:00")), new Activity("L1", at("2026-12-15T10:00")),
            new Activity("L3", at("2026-12-16T10:00")));

    private static final List<Attempt> ATTEMPTS = List.of(
            new Attempt("E1", "midterm", "graded", at("2026-12-07T10:00"), "completed", Map.of("lecture", 50, "ecoute", 60)),
            new Attempt("E1", "final", "graded", at("2026-12-10T10:00"), "to_consolidate", Map.of("lecture", 40, "ecoute", 45)),
            new Attempt("E1", "final", "graded", at("2026-12-15T18:00"), "validated", Map.of("lecture", 80, "ecoute", 70)),
            new Attempt("E2", "final", "submitted", at("2026-12-17T10:00"), null, null));

    private static final List<Relance> RELANCES = List.of(
            new Relance("L1", at("2026-12-08T10:00"), at("2026-12-09T08:00")),
            new Relance("L2", at("2026-12-10T10:00"), at("2026-12-20T09:00")),
            new Relance("L2", at("2026-12-16T10:00"), null)); // fenêtre non écoulée

    private static KpiRules.Dashboard compute(String startLevel, String level, String template, String kind) {
        return KpiRules.compute(new Filters(LocalDate.parse("2026-12-01"), LocalDate.parse("2026-12-20"), startLevel, level,
                template, kind), NOW, INVITATIONS, GOALS, SESSIONS, ACTIVITY, ATTEMPTS, RELANCES);
    }

    @Test
    void lesSixIndicateursCorrespondentAuCalculManuel() {
        KpiRules.Dashboard dashboard = compute(null, null, null, null);
        assertEquals(Rate.of(1, 3), dashboard.activation(), "inv1 activée à temps malgré la réémission ; inv2 trop tard ; inv5 jamais");
        assertEquals(33.3, dashboard.activation().rate());
        assertEquals(List.of(new KpiRules.Week(LocalDate.parse("2026-11-30"), 1), new KpiRules.Week(LocalDate.parse("2026-12-07"), 2),
                new KpiRules.Week(LocalDate.parse("2026-12-14"), 2)), dashboard.activeLearners());
        assertEquals(3, dashboard.activeLearnersTotal());
        assertEquals(Rate.of(2, 5), dashboard.sessionsOnTime(), "La séance replanifiée avant l’échéance sort du calcul, le retard constaté reste");
        assertEquals(Rate.of(1, 2), dashboard.goalsValidated(), "E1 validé par une remise à temps corrigée ensuite ; E3 hors période");
        assertEquals(1, dashboard.goalsAwaitingGrading());
        assertEquals(List.of(new KpiRules.Progression("ecoute", 1, 60.0, 70.0, 10.0),
                new KpiRules.Progression("lecture", 1, 50.0, 80.0, 30.0)), dashboard.progression());
        assertEquals(Rate.of(1, 2), dashboard.resumption());
        assertEquals(3, dashboard.goals());
    }

    @Test
    void lesFiltresSeparentLesParcoursAutonomes() {
        KpiRules.Dashboard autonomous = compute(null, null, null, "autonomous");
        assertEquals(Rate.of(0, 2), autonomous.sessionsOnTime());
        assertEquals(Rate.of(0, 1), autonomous.activation(), "Seule l’invitation d’un élève suivi en autonomie compte");
        assertEquals(Rate.of(0, 1), autonomous.goalsValidated());
        assertEquals(Rate.of(0, 1), autonomous.resumption());
        assertEquals(List.of(), autonomous.progression());
        KpiRules.Dashboard intensive = compute("A0", "A1", "intensive", "accompanied");
        assertEquals(Rate.of(2, 3), intensive.sessionsOnTime());
        assertEquals(2, intensive.goals());
    }

    @Test
    void unGroupeVideNeProduitPasDeTaux() {
        KpiRules.Dashboard empty = compute(null, "B2", null, null);
        assertNull(empty.activation().rate());
        assertNull(empty.sessionsOnTime().rate());
        assertNull(empty.goalsValidated().rate());
        assertEquals(0, empty.goals());
        assertEquals(0, empty.activeLearnersTotal());
    }
}
