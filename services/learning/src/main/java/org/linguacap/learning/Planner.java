package org.linguacap.learning;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.function.Function;

/**
 * Moteur de planification, sans accès à la base (DEV-040 à DEV-042) : capacité entre deux dates,
 * répartition des activités dans les créneaux dans l'ordre fourni, charge hebdomadaire, débordement
 * et ajustements chiffrés quand le programme dépasse la capacité.
 */
final class Planner {
    static final int MAX_DAYS = 400;

    private Planner() {}

    /** Créneaux d'un jour de la semaine (1 = lundi) : nombre de séances et durée de chacune. */
    record Day(int weekday, int sessions, int minutes) {}

    /**
     * Élément à placer : activité, révision ou créneau d'évaluation. Dans un parcours multi-niveaux, l'élément porte
     * son niveau ; une activité ajoutée par le professeur porte aussi sa version source et son ajout d'origine.
     */
    record Item(String id, String kind, String title, int minutes, String moduleId, String levelCode,
                String sourceVersionId, String sourceActivityId, String additionId) {
        /** Élément d'un parcours d'un seul niveau (forme historique). */
        Item(String id, String kind, String title, int minutes, String moduleId) {
            this(id, kind, title, minutes, moduleId, null, null, null, null);
        }

        Item withLevel(String level) {
            return new Item(id, kind, title, minutes, moduleId, level, sourceVersionId, sourceActivityId, additionId);
        }
    }

    record Session(LocalDate date, int slot, int capacity, List<Item> items) {
        int minutes() {
            return items.stream().mapToInt(Item::minutes).sum();
        }
    }

    record Week(LocalDate start, int availableMinutes, int plannedMinutes) {}

    /** Ajustement proposé : appliquer ces disponibilités et cette date cible fait tenir le programme. */
    record Suggestion(String kind, String label, List<Day> availability, LocalDate targetDate) {}

    record Plan(LocalDate from, LocalDate target, List<Day> availability, List<Session> sessions, List<Item> overflow,
                int capacityMinutes, int requiredMinutes, List<Week> weeks, List<Suggestion> suggestions) {
        boolean fits() {
            return overflow.isEmpty();
        }
    }

    record ModuleContent(String id, int position, String title, List<String> prerequisites, List<Item> activities) {}

    static final String MIDTERM = "bilan-intermediaire";
    static final String FINAL = "examen-blanc";

    /**
     * Éléments restant à planifier : modules dans l'ordre de leurs prérequis, sans les modules acquis ni les
     * activités terminées, une révision après chaque module, le bilan à mi-parcours et l'examen blanc à la fin.
     */
    static List<Item> items(List<ModuleContent> modules, java.util.Set<String> acquiredModules,
                            java.util.Set<String> completedActivities, int reviewMinutes, int midtermMinutes,
                            int finalMinutes) {
        List<ModuleContent> ordered = order(modules);
        List<ModuleContent> remaining = ordered.stream().filter(module -> !acquiredModules.contains(module.id())).toList();
        int midtermAfter = (remaining.size() + 1) / 2;
        List<Item> items = new ArrayList<>();
        int done = 0;
        for (ModuleContent module : remaining) {
            List<Item> activities = module.activities().stream()
                    .filter(activity -> !completedActivities.contains(activity.id())).toList();
            items.addAll(activities);
            String review = "revision-" + module.id();
            if (reviewMinutes > 0 && !completedActivities.contains(review) && !activities.isEmpty()) {
                items.add(new Item(review, "review", "Révision · " + module.title(), reviewMinutes, module.id()));
            }
            done++;
            if (done == midtermAfter && midtermMinutes > 0 && !completedActivities.contains(MIDTERM)) {
                items.add(new Item(MIDTERM, "assessment", "Bilan intermédiaire", midtermMinutes, null));
            }
        }
        if (finalMinutes > 0 && !completedActivities.contains(FINAL)) {
            items.add(new Item(FINAL, "assessment", "Examen blanc", finalMinutes, null));
        }
        return items;
    }

    /** Tri topologique stable : un module passe après ses prérequis, sinon dans l'ordre du parcours. */
    static List<ModuleContent> order(List<ModuleContent> modules) {
        List<ModuleContent> pending = new ArrayList<>(modules);
        pending.sort(Comparator.comparingInt(ModuleContent::position));
        java.util.Set<String> known = new java.util.HashSet<>();
        for (ModuleContent module : modules) known.add(module.id());
        List<ModuleContent> ordered = new ArrayList<>();
        java.util.Set<String> placed = new java.util.HashSet<>();
        while (!pending.isEmpty()) {
            ModuleContent next = pending.stream()
                    .filter(module -> module.prerequisites().stream().filter(known::contains).allMatch(placed::contains))
                    .findFirst().orElse(pending.get(0));
            ordered.add(next);
            placed.add(next.id());
            pending.remove(next);
        }
        return ordered;
    }

    static Plan plan(LocalDate from, LocalDate target, List<Day> availability, List<Item> items) {
        return plan(from, target, availability, items, MAX_DAYS);
    }

    /** Même calcul sur un horizon plus long (parcours de plusieurs niveaux). */
    static Plan plan(LocalDate from, LocalDate target, List<Day> availability, List<Item> items, int maxDays) {
        Plan plan = fill(from, target, availability, items, maxDays);
        if (plan.fits()) return plan;
        return new Plan(plan.from(), plan.target(), plan.availability(), plan.sessions(), plan.overflow(),
                plan.capacityMinutes(), plan.requiredMinutes(), plan.weeks(),
                suggestions(from, target, availability, items, maxDays));
    }

    private static Plan fill(LocalDate from, LocalDate target, List<Day> availability, List<Item> items, int maxDays) {
        Map<Integer, Day> byWeekday = new LinkedHashMap<>();
        for (Day day : availability) byWeekday.put(day.weekday(), day);
        List<Session> slots = new ArrayList<>();
        LocalDate last = target.isAfter(from.plusDays(maxDays)) ? from.plusDays(maxDays) : target;
        for (LocalDate date = from; !date.isAfter(last); date = date.plusDays(1)) {
            Day day = byWeekday.get(date.getDayOfWeek().getValue());
            if (day == null) continue;
            for (int slot = 1; slot <= day.sessions(); slot++) {
                slots.add(new Session(date, slot, day.minutes(), new ArrayList<>()));
            }
        }
        int capacity = slots.stream().mapToInt(Session::capacity).sum();
        int required = items.stream().mapToInt(Item::minutes).sum();

        // Ordre conservé : un élément ne passe jamais avant celui qui le précède (prérequis).
        int index = 0;
        int used = 0;
        List<Item> overflow = new ArrayList<>();
        for (Item item : items) {
            while (index < slots.size()) {
                Session current = slots.get(index);
                boolean empty = current.items().isEmpty();
                // Une séance ne mélange jamais deux niveaux : un changement de niveau passe au créneau suivant.
                if (!empty && !Objects.equals(current.items().get(0).levelCode(), item.levelCode())) {
                    index++;
                    used = 0;
                    continue;
                }
                // Un élément plus long qu'une séance occupe seule une séance entière plutôt que d'être coupé.
                if (item.minutes() <= current.capacity() - used || empty && item.minutes() > current.capacity()) {
                    current.items().add(item);
                    used += item.minutes();
                    if (used >= current.capacity()) {
                        index++;
                        used = 0;
                    }
                    break;
                }
                index++;
                used = 0;
            }
            if (index >= slots.size() && !placed(slots, item)) overflow.add(item);
        }
        List<Session> sessions = slots.stream().filter(session -> !session.items().isEmpty())
                .map(session -> new Session(session.date(), session.slot(), session.capacity(), List.copyOf(session.items())))
                .toList();
        return new Plan(from, target, List.copyOf(availability), sessions, List.copyOf(overflow), capacity, required,
                weeks(slots), List.of());
    }

    private static boolean placed(List<Session> slots, Item item) {
        return !slots.isEmpty() && slots.get(slots.size() - 1).items().contains(item);
    }

    private static List<Week> weeks(List<Session> slots) {
        Map<LocalDate, int[]> weeks = new TreeMap<>();
        for (Session slot : slots) {
            LocalDate monday = slot.date().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            int[] totals = weeks.computeIfAbsent(monday, key -> new int[2]);
            totals[0] += slot.capacity();
            totals[1] += slot.minutes();
        }
        return weeks.entrySet().stream().map(entry -> new Week(entry.getKey(), entry.getValue()[0], entry.getValue()[1])).toList();
    }

    /** Propose d'augmenter la durée ou le nombre de séances, d'ajouter des jours ou de repousser l'échéance. */
    private static List<Suggestion> suggestions(LocalDate from, LocalDate target, List<Day> availability, List<Item> items,
                                                int maxDays) {
        List<Suggestion> suggestions = new ArrayList<>();
        if (availability.isEmpty()) {
            List<Day> weekdays = new ArrayList<>();
            for (int weekday = 1; weekday <= 5; weekday++) weekdays.add(new Day(weekday, 1, 30));
            if (fill(from, target, weekdays, items, maxDays).fits()) {
                suggestions.add(new Suggestion("days", "Ajouter une séance de 30 min du lundi au vendredi", weekdays, target));
            }
            return suggestions;
        }
        for (int minutes = step(maxMinutes(availability)); minutes <= 240; minutes += 5) {
            int duration = minutes;
            List<Day> candidate = map(availability, day -> new Day(day.weekday(), day.sessions(), Math.max(day.minutes(), duration)));
            if (fill(from, target, candidate, items, maxDays).fits()) {
                suggestions.add(new Suggestion("minutes", "Allonger les séances à " + minutes + " min", candidate, target));
                break;
            }
        }
        for (int extra = 1; extra <= 5; extra++) {
            int added = extra;
            List<Day> candidate = map(availability, day -> new Day(day.weekday(), Math.min(6, day.sessions() + added), day.minutes()));
            if (fill(from, target, candidate, items, maxDays).fits()) {
                suggestions.add(new Suggestion("sessions", "Ajouter " + extra + " séance" + (extra > 1 ? "s" : "")
                        + " par jour travaillé", candidate, target));
                break;
            }
        }
        if (availability.size() < 7) {
            Day model = availability.stream().max(Comparator.comparingInt(day -> day.sessions() * day.minutes())).orElseThrow();
            List<Day> candidate = new ArrayList<>(availability);
            for (int weekday = 1; weekday <= 7; weekday++) {
                int value = weekday;
                if (availability.stream().noneMatch(day -> day.weekday() == value)) {
                    candidate.add(new Day(weekday, model.sessions(), model.minutes()));
                }
            }
            candidate.sort(Comparator.comparingInt(Day::weekday));
            if (fill(from, target, candidate, items, maxDays).fits()) {
                suggestions.add(new Suggestion("days", "Travailler les sept jours de la semaine", List.copyOf(candidate), target));
            }
        }
        // La capacité ne fait que croître avec l'échéance : la première date qui suffit se cherche par dichotomie.
        LocalDate horizon = from.plusDays(maxDays);
        if (!target.isBefore(horizon) || !fill(from, horizon, availability, items, maxDays).fits()) return suggestions;
        long low = target.toEpochDay() + 1;
        long high = horizon.toEpochDay();
        while (low < high) {
            long middle = (low + high) / 2;
            if (fill(from, LocalDate.ofEpochDay(middle), availability, items, maxDays).fits()) high = middle;
            else low = middle + 1;
        }
        LocalDate later = LocalDate.ofEpochDay(low);
        suggestions.add(new Suggestion("target_date", "Repousser l’échéance au " + later, availability, later));
        return suggestions;
    }

    private static int step(int minutes) {
        return (minutes / 5 + 1) * 5;
    }

    private static int maxMinutes(List<Day> availability) {
        return availability.stream().mapToInt(Day::minutes).max().orElse(0);
    }

    private static List<Day> map(List<Day> availability, Function<Day, Day> change) {
        return availability.stream().map(change).toList();
    }
}
