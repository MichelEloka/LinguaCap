package org.linguacap.tracking;

import com.fasterxml.jackson.databind.JsonNode;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/** État actuel de l'équipe et historique des réponses effectivement reçues. */
final class TeacherOnboardingKpis {
    private TeacherOnboardingKpis() {}

    record Dashboard(int teachers, Map<String, Integer> byLanguage, Map<String, Integer> byLevel,
                     Map<String, Integer> byAvailability, Map<String, Integer> byCourseMode,
                     Map<String, Integer> byMaxLearners, Map<String, Integer> byGradingDelayHours,
                     List<Day> trend) {}

    record Day(String date, int responses, int accepting, int notAccepting, int self, int linguacap) {}

    static Dashboard compute(JsonNode profiles, List<Day> trend) {
        Map<String, Integer> languages = new TreeMap<>();
        Map<String, Integer> levels = new TreeMap<>();
        Map<String, Integer> availability = zeroes("yes", "no", "unknown");
        Map<String, Integer> course = zeroes("self", "linguacap", "unknown");
        Map<String, Integer> capacities = new TreeMap<>();
        Map<String, Integer> delays = new TreeMap<>();
        for (JsonNode profile : profiles) {
            addArray(languages, profile.path("languages"));
            addArray(levels, profile.path("levels"));
            JsonNode accepting = profile.path("acceptingNewStudents");
            String availabilityValue = "unknown";
            if (accepting.isBoolean()) availabilityValue = accepting.booleanValue() ? "yes" : "no";
            add(availability, availabilityValue);
            String mode = profile.path("courseCreationMode").asText("");
            add(course, course.containsKey(mode) ? mode : "unknown");
            add(capacities, profile.path("maxLearners").asText("unknown"));
            add(delays, profile.path("gradingDelayHours").asText("unknown"));
        }
        return new Dashboard(profiles.size(), languages, levels, availability, course, capacities, delays, trend);
    }

    static List<Day> trend(Connection connection, LocalDate start, LocalDate end) throws SQLException {
        try (var query = connection.prepareStatement("""
                with dated_answers as (
                    select (occurred_at at time zone 'Europe/Paris')::date as day, subject_id, occurred_at, sequence,
                           data->>'acceptingNewStudents' as accepting, data->>'courseCreationMode' as course_mode
                    from tracking.event_log
                    where producer = 'identity' and type = 'identity.teacher_profile_updated'
                      and occurred_at >= ? and occurred_at < ?
                      and jsonb_typeof(data->'acceptingNewStudents') = 'boolean'
                      and data->>'courseCreationMode' in ('self', 'linguacap')
                ), last_by_day as (
                    select distinct on (day, subject_id) day, accepting, course_mode
                    from dated_answers order by day, subject_id, occurred_at desc, sequence desc
                )
                select day, count(*) as responses,
                       count(*) filter (where accepting = 'true') as accepting,
                       count(*) filter (where accepting = 'false') as not_accepting,
                       count(*) filter (where course_mode = 'self') as self,
                       count(*) filter (where course_mode = 'linguacap') as linguacap
                from last_by_day group by day order by day
                """)) {
            query.setObject(1, start.atStartOfDay(KpiRules.PARIS).toOffsetDateTime());
            query.setObject(2, end.plusDays(1).atStartOfDay(KpiRules.PARIS).toOffsetDateTime());
            try (var rows = query.executeQuery()) {
                List<Day> days = new ArrayList<>();
                while (rows.next()) {
                    days.add(new Day(rows.getObject("day", LocalDate.class).toString(), rows.getInt("responses"),
                            rows.getInt("accepting"), rows.getInt("not_accepting"),
                            rows.getInt("self"), rows.getInt("linguacap")));
                }
                return days;
            }
        }
    }

    private static Map<String, Integer> zeroes(String... categories) {
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (String category : categories) counts.put(category, 0);
        return counts;
    }

    private static void addArray(Map<String, Integer> counts, JsonNode values) {
        if (values.isEmpty()) add(counts, "unknown");
        else values.forEach(value -> add(counts, value.asText()));
    }

    private static void add(Map<String, Integer> counts, String value) {
        counts.merge(value, 1, Integer::sum);
    }
}
