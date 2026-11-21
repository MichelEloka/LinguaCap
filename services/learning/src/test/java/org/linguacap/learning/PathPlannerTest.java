package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.linguacap.learning.PathPlanner.Addition;
import org.linguacap.learning.PathPlanner.Level;
import org.linguacap.learning.PathPlanner.PathSession;
import org.linguacap.learning.PathPlanner.PlannedSession;
import org.linguacap.learning.PathPlanner.Result;
import org.linguacap.learning.PathPlanner.SourceActivity;
import org.linguacap.learning.Planner.Day;
import org.linguacap.learning.Planner.Item;
import org.linguacap.learning.Planner.ModuleContent;

class PathPlannerTest {
    private static final LocalDate MONDAY = LocalDate.of(2026, 11, 23);
    private static final String ADDITION = "3f9a2c71-0000-4000-8000-000000000001";

    private static List<Day> weekdays(int sessions, int minutes) {
        return IntStream.rangeClosed(1, 5).mapToObj(day -> new Day(day, sessions, minutes)).toList();
    }

    /** Niveau de deux modules de deux activités de 20 minutes, révisions 10, bilan 30, examen blanc 60. */
    private static Level level(int position, String code, String status, Set<String> completed, List<Addition> additions) {
        String prefix = code.toLowerCase();
        List<ModuleContent> modules = List.of(
                new ModuleContent(prefix + "-saluer", 1, "Saluer " + code, List.of(), List.of(
                        new Item(prefix + "-saluer-lecon", "lesson", "Leçon", 20, prefix + "-saluer"),
                        new Item(prefix + "-saluer-quiz", "exercise", "Quiz", 20, prefix + "-saluer"))),
                new ModuleContent(prefix + "-cafe", 2, "Au café " + code, List.of(), List.of(
                        new Item(prefix + "-cafe-lecon", "lesson", "Leçon", 20, prefix + "-cafe"),
                        new Item(prefix + "-cafe-quiz", "exercise", "Quiz", 20, prefix + "-cafe"))));
        return new Level(position, code, status, modules, Set.of(), completed, 10, 30, 60, additions);
    }

    private static Addition module(String placement) {
        return new Addition(ADDITION, placement, "11111111-1111-4111-8111-111111111111", "au-cafe", "Au café (A2)",
                List.of(new SourceActivity("a2-cafe-dialog", "lesson", "Dialogue", 15),
                        new SourceActivity("a2-cafe-quiz", "exercise", "Quiz du café", 10)));
    }

    @Test
    void uneSeanceNeMelangeJamaisDeuxNiveaux() {
        List<Level> levels = List.of(level(1, "A1", "active", Set.of(), List.of()), level(2, "A2", "planned", Set.of(), List.of()));
        Result result = PathPlanner.plan(MONDAY, MONDAY.plusWeeks(20), weekdays(1, 45), levels, true);
        assertTrue(result.plan().fits());
        for (PlannedSession session : result.sessions()) {
            assertTrue(session.items().stream().allMatch(item -> session.levelCode().equals(item.levelCode())),
                    "La séance du " + session.date() + " ne contient qu'un niveau");
        }
        assertTrue(result.sessions().stream().anyMatch(session -> "A1".equals(session.levelCode())));
        assertTrue(result.sessions().stream().anyMatch(session -> "A2".equals(session.levelCode())));
        // Tous les éléments d'A1 passent avant ceux d'A2.
        List<String> order = result.sessions().stream().map(PlannedSession::levelCode).distinct().toList();
        assertEquals(List.of("A1", "A2"), order);
    }

    @Test
    void lesNiveauxTerminesSontExclusEtLesActivitesTermineesDuNiveauEnCoursAussi() {
        List<Level> levels = List.of(level(1, "A1", "completed", Set.of(), List.of()),
                level(2, "A2", "active", Set.of("a2-saluer-lecon"), List.of()));
        List<String> ids = PathPlanner.items(levels).stream().map(Item::id).toList();
        assertFalse(ids.stream().anyMatch(id -> id.startsWith("a1-")));
        assertFalse(ids.contains("a2-saluer-lecon"));
        assertEquals("a2-saluer-quiz", ids.get(0));
        assertEquals(Planner.FINAL, ids.get(ids.size() - 1));
        // 3 activités restantes + 2 révisions + bilan + examen blanc.
        assertEquals(60 + 20 + 30 + 60, PathPlanner.requiredMinutes(levels));
    }

    @Test
    void unAjoutNextPasseEnTeteDuNiveauEtUnAjoutDeFinJusteAvantLExamenBlanc() {
        String dialog = PathPlanner.additionItemId(ADDITION, "a2-cafe-dialog");
        assertEquals("ajout-3f9a2c-a2-cafe-dialog", dialog);
        assertTrue(dialog.length() <= 53);

        List<Item> next = PathPlanner.levelItems(level(1, "A1", "active", Set.of(), List.of(module("next"))));
        assertEquals(dialog, next.get(0).id());
        assertEquals("ajout-3f9a2c-a2-cafe-quiz", next.get(1).id());
        assertEquals("11111111-1111-4111-8111-111111111111", next.get(0).sourceVersionId());
        assertEquals("a2-cafe-dialog", next.get(0).sourceActivityId());
        assertEquals(ADDITION, next.get(0).additionId());
        assertEquals("A1", next.get(0).levelCode());

        List<Item> end = PathPlanner.levelItems(level(1, "A1", "active", Set.of(), List.of(module("end_of_level"))));
        int finalIndex = end.size() - 1;
        assertEquals(Planner.FINAL, end.get(finalIndex).id());
        assertEquals("ajout-3f9a2c-a2-cafe-quiz", end.get(finalIndex - 1).id());
        assertEquals(dialog, end.get(finalIndex - 2).id());

        // Une activité ajoutée déjà terminée n'est plus planifiée.
        List<Item> resumed = PathPlanner.levelItems(level(1, "A1", "active", Set.of(dialog), List.of(module("next"))));
        assertEquals("ajout-3f9a2c-a2-cafe-quiz", resumed.get(0).id());
    }

    @Test
    void lesSeancesAjouteesPortentLeTitreDuModuleSource() {
        List<Level> levels = List.of(level(1, "A1", "active", Set.of(), List.of(module("next"))));
        Result result = PathPlanner.plan(MONDAY, MONDAY.plusWeeks(10), weekdays(1, 30), levels, true);
        assertEquals("Au café (A2)", result.sessions().get(0).title());
        assertEquals("au-cafe", result.sessions().get(0).moduleId());
        assertEquals("Saluer A1", result.sessions().get(1).title());
    }

    @Test
    void lEtendueDeChaqueNiveauEtSonEcheanceSontCalculees() {
        List<Level> levels = List.of(level(1, "A1", "active", Set.of(), List.of()), level(2, "A2", "planned", Set.of(), List.of()));
        Result result = PathPlanner.plan(MONDAY, MONDAY.plusWeeks(20), weekdays(1, 60), levels, true);
        assertEquals(2, result.levels().size());
        PathPlanner.Span a1 = result.levels().get(0);
        assertEquals("A1", a1.levelCode());
        assertEquals(1, a1.stepPosition());
        assertEquals(PathPlanner.levelMinutes(levels.get(0)), a1.minutes());
        assertEquals(MONDAY.toString(), a1.firstDate());
        LocalDate end = PathPlanner.levelEnd(result.sessions(), "A1");
        assertEquals(a1.lastDate(), end.toString());
        assertTrue(LocalDate.parse(result.levels().get(1).firstDate()).isAfter(end));
        assertNull(PathPlanner.levelEnd(result.sessions(), "B1"));
    }

    @Test
    void unPlanningQuiDebordePeutProposerUnReportQuiDemandeUnAvenant() {
        List<Level> levels = List.of(level(1, "A1", "active", Set.of(), List.of()), level(2, "A2", "planned", Set.of(), List.of()));
        Result started = PathPlanner.plan(MONDAY, MONDAY.plusWeeks(1), List.of(new Day(1, 1, 30)), levels, true);
        assertFalse(started.plan().fits());
        PathPlanner.Suggestion later = started.suggestions().stream()
                .filter(suggestion -> "target_date".equals(suggestion.kind())).findFirst().orElseThrow();
        assertTrue(later.requiresAmendment());
        assertTrue(started.suggestions().stream().filter(suggestion -> !"target_date".equals(suggestion.kind()))
                .noneMatch(PathPlanner.Suggestion::requiresAmendment));
        Result draft = PathPlanner.plan(MONDAY, MONDAY.plusWeeks(1), List.of(new Day(1, 1, 30)), levels, false);
        assertTrue(draft.suggestions().stream().noneMatch(PathPlanner.Suggestion::requiresAmendment));
        // Le report proposé fait tenir tout le parcours.
        assertTrue(PathPlanner.plan(MONDAY, LocalDate.parse(later.targetDate()), List.of(new Day(1, 1, 30)), levels, true)
                .plan().fits());
    }

    @Test
    void lesNiveauxFutursSontProjetesSansIdentifiantEtVerrouilles() {
        List<Level> levels = List.of(level(1, "A1", "active", Set.of(), List.of()), level(2, "A2", "planned", Set.of(), List.of()));
        Result result = PathPlanner.plan(MONDAY, MONDAY.plusWeeks(20), weekdays(1, 45), levels, true);
        List<PathSession> locked = PathPlanner.locked(result.sessions(), "A2", 2);
        assertFalse(locked.isEmpty());
        for (PathSession session : locked) {
            assertNull(session.id());
            assertNull(session.enrollmentId());
            assertTrue(session.locked());
            assertEquals("locked", session.status());
            assertEquals("A2", session.levelCode());
            assertEquals(2, session.stepPosition());
            assertTrue(session.activities().stream().allMatch(activity -> "todo".equals(activity.status())));
        }
        assertEquals(1, locked.get(0).position());
    }

    @Test
    void uneSeanceReelleGardeSonIdentifiantEtSignaleLesActivitesAjoutees() {
        UUID sessionId = UUID.randomUUID();
        UUID enrollmentId = UUID.randomUUID();
        var summary = new CourseResource.SessionSummary(sessionId, 3, "au-cafe", "Au café", "2026-11-23T20:00+01:00",
                "planned", null, null, 25, 1, List.of(
                new CourseResource.ActivitySummary("ajout-3f9a2c-a2-cafe-dialog", 1, "lesson", "Dialogue", 15, "todo", null),
                new CourseResource.ActivitySummary("a1-cafe-quiz", 2, "exercise", "Quiz", 10, "completed",
                        "2026-11-22T10:00+01:00")));
        PathSession session = PathPlanner.actual(summary, enrollmentId, 1, "A1");
        assertEquals(sessionId, session.id());
        assertFalse(session.locked());
        assertEquals("2026-11-23", session.date());
        assertTrue(session.activities().get(0).added());
        assertFalse(session.activities().get(1).added());
    }

    @Test
    void uneRevisionRepriseDeLAncienPlanningEstCompleteeALaLecture() throws Exception {
        JsonNode legacy = new ObjectMapper().readTree("""
                [{"date":"2026-11-23","slot":1,"dueAt":"2026-11-23T20:00+01:00","title":"Saluer","moduleId":"saluer",
                  "minutes":20,"capacity":30,"items":[{"id":"lecon","kind":"lesson","title":"Leçon","minutes":20,
                  "moduleId":"saluer"}]}]
                """);
        List<PlannedSession> sessions = PathPlanner.parseSessions(legacy, "A1");
        assertEquals("A1", sessions.get(0).levelCode());
        Item item = sessions.get(0).items().get(0);
        assertEquals("A1", item.levelCode());
        assertNull(item.sourceVersionId());
        assertNull(item.additionId());
        assertEquals(1, PathPlanner.spans(sessions, java.util.Map.of("A1", 1)).get(0).sessionCount());
    }
}
