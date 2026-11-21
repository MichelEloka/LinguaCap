package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import org.linguacap.learning.Planner.Day;
import org.linguacap.learning.Planner.Item;

/**
 * Planning global d'un parcours multi-niveaux, sans accès à la base : éléments de chaque niveau dans l'ordre
 * (contenu de la version, révisions, bilan, examen blanc, puis cours ajoutés), répartition dans les créneaux sans
 * jamais mélanger deux niveaux dans une séance, étendue de chaque niveau et projection verrouillée des niveaux futurs.
 */
final class PathPlanner {
    static final String ADDITION_PREFIX = "ajout-";

    private PathPlanner() {}

    /** Activité d'une version source, telle que publiée. */
    record SourceActivity(String id, String kind, String title, int minutes) {}

    /** Cours ajouté à un niveau : un module entier (plusieurs activités) ou une seule activité d'une version source. */
    record Addition(String id, String placement, String sourceVersionId, String moduleId, String moduleTitle,
                    List<SourceActivity> activities) {}

    /** Niveau à planifier : contenu de sa version, modules acquis et activités terminées de son inscription, ajouts. */
    record Level(int position, String levelCode, String status, List<Planner.ModuleContent> modules, Set<String> acquired,
                 Set<String> completed, int reviewMinutes, int midtermMinutes, int finalMinutes, List<Addition> additions) {
        boolean open() {
            return "planned".equals(status) || "active".equals(status);
        }
    }

    /** Séance proposée, rattachée à un seul niveau. */
    record PlannedSession(LocalDate date, int slot, String dueAt, String title, String moduleId, int minutes, int capacity,
                          String levelCode, List<Item> items) {}

    /** Étendue d'un niveau dans le planning : premières et dernières dates, minutes et nombre de séances. */
    record Span(String levelCode, int stepPosition, String firstDate, String lastDate, int minutes, int sessionCount) {}

    /** Ajustement proposé ; repousser la date cible d'un parcours démarré demande un avenant au contrat. */
    record Suggestion(String kind, String label, List<Day> availability, String targetDate, boolean requiresAmendment) {}

    record Result(Planner.Plan plan, List<PlannedSession> sessions, List<Span> levels, List<Suggestion> suggestions) {}

    /** Activité d'une séance du parcours, réelle ou projetée. */
    record SessionActivity(String id, int position, String kind, String title, int estimatedMinutes, String status,
                           String completedAt, boolean added) {}

    /** Séance du parcours : réelle pour un niveau ouvert, projetée et verrouillée (sans identifiant) pour un niveau futur. */
    record PathSession(UUID id, UUID enrollmentId, int stepPosition, String levelCode, boolean locked, int position,
                       String date, int slot, String dueAt, String moduleId, String title, String status,
                       int estimatedMinutes, String startedAt, String completedAt, List<SessionActivity> activities) {}

    /** Identifiant d'une activité ajoutée : « ajout- », six caractères de l'ajout, puis l'activité source. */
    static String additionItemId(String additionId, String activityId) {
        String compact = additionId.replace("-", "").toLowerCase();
        return ADDITION_PREFIX + compact.substring(0, Math.min(6, compact.length())) + "-" + activityId;
    }

    static boolean isAddition(String activityId) {
        return activityId != null && activityId.startsWith(ADDITION_PREFIX);
    }

    /** Éléments d'un ajout, sans les activités déjà terminées ; ils portent leur version et leur activité source. */
    static List<Item> additionItems(Addition addition, String levelCode, Set<String> completed) {
        List<Item> items = new ArrayList<>();
        for (SourceActivity activity : addition.activities()) {
            String id = additionItemId(addition.id(), activity.id());
            if (completed.contains(id)) continue;
            items.add(new Item(id, activity.kind(), activity.title(), Math.max(1, activity.minutes()), addition.moduleId(),
                    levelCode, addition.sourceVersionId(), activity.id(), addition.id()));
        }
        return items;
    }

    /**
     * Éléments restants d'un niveau : ceux du planning de la version (Planner.items), précédés des ajouts « next »,
     * les ajouts « end_of_level » juste avant l'examen blanc.
     */
    static List<Item> levelItems(Level level) {
        List<Item> base = new ArrayList<>();
        for (Item item : Planner.items(level.modules(), level.acquired(), level.completed(), level.reviewMinutes(),
                level.midtermMinutes(), level.finalMinutes())) {
            base.add(item.withLevel(level.levelCode()));
        }
        List<Item> next = new ArrayList<>();
        List<Item> end = new ArrayList<>();
        for (Addition addition : level.additions()) {
            List<Item> added = additionItems(addition, level.levelCode(), level.completed());
            if ("next".equals(addition.placement())) next.addAll(added);
            else end.addAll(added);
        }
        List<Item> items = new ArrayList<>(next);
        int finalIndex = -1;
        for (int index = 0; index < base.size(); index++) {
            if (Planner.FINAL.equals(base.get(index).id())) finalIndex = index;
        }
        if (finalIndex < 0) {
            items.addAll(base);
            items.addAll(end);
        } else {
            items.addAll(base.subList(0, finalIndex));
            items.addAll(end);
            items.addAll(base.subList(finalIndex, base.size()));
        }
        return items;
    }

    /** Éléments de tous les niveaux prévus ou en cours, dans l'ordre des niveaux. */
    static List<Item> items(List<Level> levels) {
        List<Item> items = new ArrayList<>();
        for (Level level : levels) if (level.open()) items.addAll(levelItems(level));
        return items;
    }

    /** Minutes restantes du parcours : la somme des éléments à planifier. */
    static int requiredMinutes(List<Level> levels) {
        return items(levels).stream().mapToInt(Item::minutes).sum();
    }

    /** Minutes prévues pour un niveau, d'après le contenu de sa version seul (estimation avant tout démarrage). */
    static int levelMinutes(Level level) {
        return levelItems(level).stream().mapToInt(Item::minutes).sum();
    }

    /**
     * Planning global entre deux dates. {@code started} : le parcours est démarré, repousser la date cible passe par
     * un avenant au contrat.
     */
    static Result plan(LocalDate from, LocalDate target, List<Day> availability, List<Level> levels, boolean started) {
        Planner.Plan plan = Planner.plan(from, target, availability, items(levels), PathRules.MAX_PATH_DAYS);
        List<PlannedSession> sessions = sessions(plan, titles(levels));
        List<Suggestion> suggestions = plan.suggestions().stream()
                .map(suggestion -> new Suggestion(suggestion.kind(), suggestion.label(), suggestion.availability(),
                        suggestion.targetDate().toString(), started && "target_date".equals(suggestion.kind())))
                .toList();
        return new Result(plan, sessions, spans(levels, sessions, plan.overflow()), suggestions);
    }

    /** Titres des modules : par niveau pour le contenu de la version, par version source pour un ajout. */
    static Map<String, String> titles(List<Level> levels) {
        Map<String, String> titles = new HashMap<>();
        for (Level level : levels) {
            for (Planner.ModuleContent module : level.modules()) titles.put(level.levelCode() + "/" + module.id(), module.title());
            for (Addition addition : level.additions()) {
                titles.put(addition.sourceVersionId() + "/" + addition.moduleId(), addition.moduleTitle());
            }
        }
        return titles;
    }

    static List<PlannedSession> sessions(Planner.Plan plan, Map<String, String> titles) {
        return plan.sessions().stream().map(session -> {
            Item first = session.items().get(0);
            String moduleId = first.moduleId() == null ? "evaluation" : first.moduleId();
            String key = (first.sourceVersionId() != null ? first.sourceVersionId() : first.levelCode()) + "/" + first.moduleId();
            String title = first.moduleId() == null ? first.title() : titles.getOrDefault(key, first.title());
            return new PlannedSession(session.date(), session.slot(), dueAt(session.date()), title, moduleId,
                    session.minutes(), session.capacity(), first.levelCode(), session.items());
        }).toList();
    }

    static String dueAt(LocalDate date) {
        return date.atTime(CourseRules.DUE_TIME).atZone(CourseRules.PILOT_ZONE).toOffsetDateTime().toString();
    }

    /** Étendue de chaque niveau ouvert : minutes planifiées et débordantes, dates et nombre de séances. */
    static List<Span> spans(List<Level> levels, List<PlannedSession> sessions, List<Item> overflow) {
        List<Span> spans = new ArrayList<>();
        for (Level level : levels) {
            if (!level.open()) continue;
            List<PlannedSession> own = sessions.stream().filter(session -> level.levelCode().equals(session.levelCode())).toList();
            int minutes = own.stream().mapToInt(PlannedSession::minutes).sum()
                    + overflow.stream().filter(item -> level.levelCode().equals(item.levelCode())).mapToInt(Item::minutes).sum();
            spans.add(new Span(level.levelCode(), level.position(),
                    own.isEmpty() ? null : own.get(0).date().toString(),
                    own.isEmpty() ? null : own.get(own.size() - 1).date().toString(), minutes, own.size()));
        }
        return spans;
    }

    /** Étendues reconstituées à partir des séances seules (révisions reprises de l'ancien planning). */
    static List<Span> spans(List<PlannedSession> sessions, Map<String, Integer> positions) {
        Map<String, List<PlannedSession>> byLevel = new LinkedHashMap<>();
        for (PlannedSession session : sessions) {
            byLevel.computeIfAbsent(session.levelCode(), key -> new ArrayList<>()).add(session);
        }
        List<Span> spans = new ArrayList<>();
        for (Map.Entry<String, List<PlannedSession>> entry : byLevel.entrySet()) {
            List<PlannedSession> own = entry.getValue();
            spans.add(new Span(entry.getKey(), positions.getOrDefault(entry.getKey(), 1), own.get(0).date().toString(),
                    own.get(own.size() - 1).date().toString(), own.stream().mapToInt(PlannedSession::minutes).sum(),
                    own.size()));
        }
        return spans;
    }

    /** Séances d'un niveau dans une proposition. */
    static List<PlannedSession> ofLevel(List<PlannedSession> sessions, String levelCode) {
        return sessions.stream().filter(session -> Objects.equals(levelCode, session.levelCode())).toList();
    }

    /**
     * Échéance d'un niveau : le jour de son examen blanc, sinon de sa dernière séance ; null si rien n'est planifié.
     * Le dernier niveau du parcours a pour échéance la date cible.
     */
    static LocalDate levelEnd(List<PlannedSession> sessions, String levelCode) {
        LocalDate last = null;
        for (PlannedSession session : ofLevel(sessions, levelCode)) {
            last = session.date();
            if (session.items().stream().anyMatch(item -> Planner.FINAL.equals(item.id()))) return session.date();
        }
        return last;
    }

    /** Projection d'un niveau futur : séances sans identifiant ni lien, verrouillées jusqu'à l'ouverture du niveau. */
    static List<PathSession> locked(List<PlannedSession> sessions, String levelCode, int stepPosition) {
        List<PathSession> locked = new ArrayList<>();
        int position = 0;
        for (PlannedSession session : ofLevel(sessions, levelCode)) {
            List<SessionActivity> activities = new ArrayList<>();
            int index = 0;
            for (Item item : session.items()) {
                activities.add(new SessionActivity(item.id(), ++index, item.kind(), item.title(), item.minutes(), "todo",
                        null, isAddition(item.id())));
            }
            locked.add(new PathSession(null, null, stepPosition, levelCode, true, ++position, session.date().toString(),
                    session.slot(), session.dueAt(), session.moduleId(), session.title(), "locked", session.minutes(),
                    null, null, List.copyOf(activities)));
        }
        return locked;
    }

    /** Séance réelle d'un niveau ouvert ou terminé. */
    static PathSession actual(CourseResource.SessionSummary session, UUID enrollmentId, int stepPosition, String levelCode) {
        List<SessionActivity> activities = session.activities().stream()
                .map(activity -> new SessionActivity(activity.id(), activity.position(), activity.kind(), activity.title(),
                        activity.estimatedMinutes(), activity.status(), activity.completedAt(), isAddition(activity.id())))
                .toList();
        String date = OffsetDateTime.parse(session.dueAt()).atZoneSameInstant(CourseRules.PILOT_ZONE).toLocalDate().toString();
        return new PathSession(session.id(), enrollmentId, stepPosition, levelCode, false, session.position(), date,
                session.slot(), session.dueAt(), session.moduleId(), session.title(), session.status(),
                session.estimatedMinutes(), session.startedAt(), session.completedAt(), activities);
    }

    // --- Lecture des révisions enregistrées (y compris celles reprises de l'ancien planning par inscription) -----

    static List<PlannedSession> parseSessions(JsonNode sessions, String defaultLevel) {
        List<PlannedSession> parsed = new ArrayList<>();
        if (sessions == null || !sessions.isArray()) return parsed;
        for (JsonNode session : sessions) {
            String level = text(session.path("levelCode"));
            if (level == null) level = defaultLevel;
            List<Item> items = parseItems(session.path("items"), level);
            LocalDate date = LocalDate.parse(session.path("date").asText());
            String dueAt = text(session.path("dueAt"));
            parsed.add(new PlannedSession(date, session.path("slot").asInt(1), dueAt == null ? dueAt(date) : dueAt,
                    session.path("title").asText(""), session.path("moduleId").asText("evaluation"),
                    session.path("minutes").asInt(items.stream().mapToInt(Item::minutes).sum()),
                    session.path("capacity").asInt(0), level, items));
        }
        return parsed;
    }

    static List<Item> parseItems(JsonNode items, String defaultLevel) {
        List<Item> parsed = new ArrayList<>();
        if (items == null || !items.isArray()) return parsed;
        for (JsonNode item : items) {
            String level = text(item.path("levelCode"));
            parsed.add(new Item(item.path("id").asText(), item.path("kind").asText(), item.path("title").asText(""),
                    item.path("minutes").asInt(), text(item.path("moduleId")), level == null ? defaultLevel : level,
                    text(item.path("sourceVersionId")), text(item.path("sourceActivityId")), text(item.path("additionId"))));
        }
        return parsed;
    }

    static List<Suggestion> parseSuggestions(JsonNode suggestions) {
        List<Suggestion> parsed = new ArrayList<>();
        if (suggestions == null || !suggestions.isArray()) return parsed;
        for (JsonNode suggestion : suggestions) {
            List<Day> days = new ArrayList<>();
            for (JsonNode day : suggestion.path("availability")) {
                days.add(new Day(day.path("weekday").asInt(), day.path("sessions").asInt(), day.path("minutes").asInt()));
            }
            parsed.add(new Suggestion(suggestion.path("kind").asText(), suggestion.path("label").asText(""), List.copyOf(days),
                    suggestion.path("targetDate").asText(), suggestion.path("requiresAmendment").asBoolean(false)));
        }
        return parsed;
    }

    static List<Span> parseSpans(JsonNode levels) {
        List<Span> parsed = new ArrayList<>();
        if (levels == null || !levels.isArray()) return parsed;
        for (JsonNode level : levels) {
            parsed.add(new Span(level.path("levelCode").asText(), level.path("stepPosition").asInt(1),
                    text(level.path("firstDate")), text(level.path("lastDate")), level.path("minutes").asInt(),
                    level.path("sessionCount").asInt()));
        }
        return parsed;
    }

    static List<Day> parseDays(JsonNode days) {
        List<Day> parsed = new ArrayList<>();
        if (days == null || !days.isArray()) return parsed;
        for (JsonNode day : days) {
            parsed.add(new Day(day.path("weekday").asInt(), day.path("sessions").asInt(), day.path("minutes").asInt()));
        }
        return parsed;
    }

    private static String text(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode() || node.asText().isEmpty() ? null : node.asText();
    }
}
