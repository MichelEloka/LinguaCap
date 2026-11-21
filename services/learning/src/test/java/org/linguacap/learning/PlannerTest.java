package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.linguacap.learning.Planner.Day;
import org.linguacap.learning.Planner.Item;
import org.linguacap.learning.Planner.ModuleContent;
import org.linguacap.learning.Planner.Plan;

class PlannerTest {
    private static final LocalDate MONDAY = LocalDate.of(2026, 11, 23);

    private static List<Day> everyDay(int sessions, int minutes) {
        return IntStream.rangeClosed(1, 7).mapToObj(day -> new Day(day, sessions, minutes)).toList();
    }

    private static List<Item> activities(int count, int minutes) {
        return IntStream.rangeClosed(1, count)
                .mapToObj(index -> new Item("activite-" + index, "lesson", "Activité " + index, minutes, "m")).toList();
    }

    private static List<String> order(Plan plan) {
        return plan.sessions().stream().flatMap(session -> session.items().stream()).map(Item::id).toList();
    }

    @Test
    void deuxSeancesDe45MinutesSeptJoursSurSeptDonnent10h30ParSemaine() {
        Plan plan = Planner.plan(MONDAY, MONDAY.plusDays(6), everyDay(2, 45), activities(3, 30));
        assertEquals(630, plan.capacityMinutes());
        assertEquals(1, plan.weeks().size());
        assertEquals(630, plan.weeks().get(0).availableMinutes());
        assertEquals(90, plan.weeks().get(0).plannedMinutes());
        assertTrue(plan.fits());
    }

    @Test
    void plusieursSeancesLeMemeJourOntChacuneLeurCreneau() {
        Plan plan = Planner.plan(MONDAY, MONDAY.plusDays(6), everyDay(2, 45), activities(4, 30));
        assertEquals(MONDAY, plan.sessions().get(0).date());
        assertEquals(1, plan.sessions().get(0).slot());
        assertEquals(MONDAY, plan.sessions().get(1).date());
        assertEquals(2, plan.sessions().get(1).slot());
        assertEquals(MONDAY.plusDays(1), plan.sessions().get(2).date());
        assertTrue(plan.sessions().stream().allMatch(session -> session.minutes() <= session.capacity()));
    }

    @Test
    void lOrdreDesActivitesEstToujoursConserve() {
        List<Item> items = new ArrayList<>(activities(6, 20));
        items.add(2, new Item("longue", "lesson", "Longue", 40, "m"));
        Plan plan = Planner.plan(MONDAY, MONDAY.plusDays(13), everyDay(1, 45), items);
        assertEquals(items.stream().map(Item::id).toList(), order(plan));
    }

    @Test
    void uneActivitePlusLongueQuUneSeanceOccupeUneSeanceEntiere() {
        Plan plan = Planner.plan(MONDAY, MONDAY.plusDays(6), everyDay(1, 30),
                List.of(new Item("courte", "lesson", "Courte", 10, "m"), new Item("longue", "lesson", "Longue", 50, "m")));
        assertTrue(plan.fits());
        assertEquals(List.of("courte"), plan.sessions().get(0).items().stream().map(Item::id).toList());
        assertEquals(List.of("longue"), plan.sessions().get(1).items().stream().map(Item::id).toList());
    }

    @Test
    void desCreneauxInsuffisantsSignalentLeDebordementEtDesAjustementsQuiTiennent() {
        List<Day> availability = List.of(new Day(1, 1, 30), new Day(3, 1, 30));
        LocalDate target = MONDAY.plusDays(6);
        List<Item> items = activities(6, 30);
        Plan plan = Planner.plan(MONDAY, target, availability, items);
        assertFalse(plan.fits());
        assertEquals(60, plan.capacityMinutes());
        assertEquals(180, plan.requiredMinutes());
        assertEquals(List.of("activite-3", "activite-4", "activite-5", "activite-6"),
                plan.overflow().stream().map(Item::id).toList());
        assertEquals(Set.of("minutes", "sessions", "days", "target_date"),
                Set.copyOf(plan.suggestions().stream().map(Planner.Suggestion::kind).toList()));
        for (Planner.Suggestion suggestion : plan.suggestions()) {
            assertTrue(Planner.plan(MONDAY, suggestion.targetDate(), suggestion.availability(), items).fits(),
                    "L’ajustement « " + suggestion.label() + " » fait tenir le programme");
        }
    }

    @Test
    void sansDisponibiliteToutDebordeEtUneCadenceEstProposee() {
        Plan plan = Planner.plan(MONDAY, MONDAY.plusDays(27), List.of(), activities(2, 20));
        assertEquals(0, plan.capacityMinutes());
        assertEquals(2, plan.overflow().size());
        assertEquals("days", plan.suggestions().get(0).kind());
    }

    @Test
    void lesElementsSuiventLesPrerequisEtExcluentCeQuiEstAcquisOuTermine() {
        List<ModuleContent> modules = List.of(
                new ModuleContent("courses", 1, "Faire ses courses", List.of("au-cafe"),
                        List.of(new Item("lecon-courses", "lesson", "Courses", 10, "courses"))),
                new ModuleContent("au-cafe", 2, "Au café", List.of(),
                        List.of(new Item("lecon-cafe", "lesson", "Café", 10, "au-cafe"),
                                new Item("quiz-cafe", "exercise", "Quiz café", 5, "au-cafe"))),
                new ModuleContent("saluer", 3, "Saluer", List.of(),
                        List.of(new Item("lecon-saluer", "lesson", "Saluer", 10, "saluer"))));

        List<String> all = Planner.items(modules, Set.of(), Set.of(), 10, 30, 60).stream().map(Item::id).toList();
        assertEquals(List.of("lecon-cafe", "quiz-cafe", "revision-au-cafe", "lecon-courses", "revision-courses",
                Planner.MIDTERM, "lecon-saluer", "revision-saluer", Planner.FINAL), all);

        List<String> resumed = Planner.items(modules, Set.of("saluer"), Set.of("lecon-cafe"), 10, 30, 60)
                .stream().map(Item::id).toList();
        assertEquals(List.of("quiz-cafe", "revision-au-cafe", Planner.MIDTERM, "lecon-courses", "revision-courses",
                Planner.FINAL), resumed);
    }

    @Test
    void leConstructeurHistoriqueLaisseLeNiveauEtLaSourceVides() {
        Item item = new Item("lecon", "lesson", "Leçon", 10, "m");
        assertEquals(null, item.levelCode());
        assertEquals(null, item.sourceVersionId());
        assertEquals(null, item.sourceActivityId());
        assertEquals(null, item.additionId());
        assertEquals("A2", item.withLevel("A2").levelCode());
        assertEquals("lecon", item.withLevel("A2").id());
    }

    @Test
    void unChangementDeNiveauPasseAuCreneauSuivant() {
        List<Item> items = List.of(
                new Item("a1-fin", "lesson", "Fin A1", 10, "m").withLevel("A1"),
                new Item("a2-debut", "lesson", "Début A2", 10, "m").withLevel("A2"),
                new Item("a2-suite", "lesson", "Suite A2", 10, "m").withLevel("A2"));
        Plan plan = Planner.plan(MONDAY, MONDAY.plusDays(6), everyDay(2, 45), items);
        assertTrue(plan.fits());
        assertEquals(2, plan.sessions().size());
        assertEquals(List.of("a1-fin"), plan.sessions().get(0).items().stream().map(Item::id).toList());
        assertEquals(List.of("a2-debut", "a2-suite"), plan.sessions().get(1).items().stream().map(Item::id).toList());
        // Le créneau suivant peut être la deuxième séance du même jour.
        assertEquals(MONDAY, plan.sessions().get(1).date());
        assertEquals(2, plan.sessions().get(1).slot());
    }

    @Test
    void unHorizonPlusLongPermetDePlanifierAuDelaDeTreizeMois() {
        LocalDate target = MONDAY.plusDays(800);
        List<Item> items = activities(700, 30);
        assertFalse(Planner.plan(MONDAY, target, List.of(new Day(1, 1, 30), new Day(4, 1, 30)), items).fits());
        assertTrue(Planner.plan(MONDAY, target, everyDay(1, 30), items, 900).fits());
    }
}
