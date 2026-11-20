package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.sql.Array;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

@Path("/v1/learning")
@Produces(MediaType.APPLICATION_JSON)
public class LearningResource {
    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper mapper;
    @Inject GoalStore goals;

    @ConfigProperty(name = "lingua.services.assessment")
    String assessmentUrl;
    @ConfigProperty(name = "lingua.services.catalogue")
    String catalogueUrl;

    @GET
    @Path("/goal")
    public JsonNode goal(@QueryParam("learnerId") String requestedLearnerId) {
        UUID callerId = actor.id();
        UUID learnerId = authorizeLearner(callerId, requestedLearnerId);
        return goalFor(learnerId);
    }

    @PUT
    @Path("/goal")
    @Consumes(MediaType.APPLICATION_JSON)
    public Goal saveGoal(GoalRequest request) {
        UUID learnerId = actor.id();
        if (!"learner".equals(identities.current(learnerId).path("role").asText())) {
            throw HttpError.forbidden("Ce compte ne peut pas modifier un objectif élève.");
        }
        GoalPlan plan = validateGoal(request);
        JsonNode levels = services.request(catalogueUrl, "/v1/levels", "GET", learnerId, null);
        boolean published = false;
        for (JsonNode level : levels) {
            if (plan.level().equals(level.path("code").asText()) && "published".equals(level.path("status").asText())) {
                published = true;
                break;
            }
        }
        if (!published) throw HttpError.badRequest("Choisissez un niveau publié dans le catalogue.");
        String sql = """
                INSERT INTO learning.goal_plans
                    (learner_id, level, pace, start_date, target_date, study_days,
                     sessions_per_day, minutes_per_session)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (learner_id) DO UPDATE SET
                    level = EXCLUDED.level, pace = EXCLUDED.pace,
                    start_date = EXCLUDED.start_date, target_date = EXCLUDED.target_date,
                    study_days = EXCLUDED.study_days, sessions_per_day = EXCLUDED.sessions_per_day,
                    minutes_per_session = EXCLUDED.minutes_per_session, updated_at = now()
                RETURNING *
                """;
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {
            Array studyDays = connection.createArrayOf("integer", plan.studyDays().toArray());
            try {
                statement.setObject(1, learnerId);
                statement.setString(2, plan.level());
                statement.setString(3, plan.pace());
                statement.setObject(4, plan.startDate());
                statement.setObject(5, plan.targetDate());
                statement.setArray(6, studyDays);
                statement.setInt(7, plan.sessionsPerDay());
                statement.setInt(8, plan.minutesPerSession());
                try (var rows = statement.executeQuery()) {
                    if (rows.next()) {
                        return readGoal(rows);
                    }
                    throw HttpError.unavailable("L’objectif n’a pas pu être enregistré.");
                }
            } finally {
                studyDays.free();
            }
        } catch (SQLException ignored) {
            throw HttpError.unavailable("L’objectif n’a pas pu être enregistré.");
        }
    }

    @GET
    @Path("/progress")
    public ObjectNode progress(@QueryParam("learnerId") String requestedLearnerId) {
        UUID callerId = actor.id();
        UUID learnerId = authorizeLearner(callerId, requestedLearnerId);
        String path = "/v1/assessments/results";
        if (!callerId.equals(learnerId)) {
            path += "?learnerId=" + learnerId;
        }
        JsonNode results = services.request(assessmentUrl, path, "GET", callerId, null);
        if (!results.isArray()) {
            throw HttpError.unavailable("Les résultats de cet élève sont indisponibles.");
        }
        Set<String> completed = new LinkedHashSet<>();
        for (JsonNode result : results) {
            String lessonId = result.path("lessonId").asText();
            if (!lessonId.isBlank()) {
                completed.add(lessonId);
            }
        }
        ObjectNode progress = mapper.createObjectNode();
        progress.put("learnerId", learnerId.toString());
        progress.set("completedLessons", mapper.valueToTree(completed));
        progress.put("completedCount", completed.size());
        progress.set("goal", goalFor(learnerId));
        progress.set("results", results);
        GoalStore.EnrollmentRow enrollment = goals.latest(learnerId);
        if (enrollment == null) {
            progress.putNull("enrollment");
        } else {
            var summary = progress.putObject("enrollment");
            summary.put("levelCode", enrollment.levelCode());
            summary.put("goalStatus", enrollment.goalStatus());
            summary.put("targetDate", enrollment.targetDate() == null ? null : enrollment.targetDate().toString());
            summary.put("initialTargetDate", enrollment.initialTargetDate() == null ? null : enrollment.initialTargetDate().toString());
        }
        return progress;
    }

    private UUID authorizeLearner(UUID callerId, String requestedLearnerId) {
        if (requestedLearnerId != null) {
            try {
                UUID id = UUID.fromString(requestedLearnerId);
                if (!id.toString().equalsIgnoreCase(requestedLearnerId)) {
                    throw new IllegalArgumentException();
                }
                identities.learner(callerId, id);
                return id;
            } catch (IllegalArgumentException ignored) {
                throw HttpError.badRequest("Identifiant élève invalide.");
            }
        }
        if (!"learner".equals(identities.current(callerId).path("role").asText())) {
            throw HttpError.forbidden("Sélectionne un élève auquel ton compte a accès.");
        }
        return callerId;
    }

    private JsonNode goalFor(UUID learnerId) {
        String sql = "SELECT * FROM learning.goal_plans WHERE learner_id = ?";
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, learnerId);
            try (var rows = statement.executeQuery()) {
                return rows.next() ? mapper.valueToTree(readGoal(rows)) : NullNode.getInstance();
            }
        } catch (SQLException ignored) {
            throw HttpError.unavailable("L’objectif de cet élève est indisponible.");
        }
    }

    private static Goal readGoal(ResultSet row) throws SQLException {
        Array array = row.getArray("study_days");
        List<Integer> studyDays = new ArrayList<>();
        try {
            for (Object day : (Object[]) array.getArray()) {
                studyDays.add(((Number) day).intValue());
            }
        } finally {
            array.free();
        }
        return new Goal(row.getString("level"), row.getString("pace"),
                row.getObject("start_date", LocalDate.class).toString(),
                row.getObject("target_date", LocalDate.class).toString(),
                List.copyOf(studyDays), row.getInt("sessions_per_day"),
                row.getInt("minutes_per_session"),
                row.getObject("updated_at", OffsetDateTime.class).toString());
    }

    private static GoalPlan validateGoal(GoalRequest request) {
        if (request == null || request.level() == null || request.pace() == null
                || request.startDate() == null || request.targetDate() == null
                || request.studyDays() == null || request.sessionsPerDay() == null
                || request.minutesPerSession() == null) {
            throw HttpError.badRequest("Le niveau, le rythme, les dates et les disponibilités sont requis.");
        }
        String level = request.level().strip().toUpperCase(Locale.ROOT);
        if (!level.matches("[ABC][12]")) {
            throw HttpError.badRequest("Choisissez un niveau de A1 à C2.");
        }
        String pace = request.pace().strip().toLowerCase(Locale.ROOT);
        if ("intensif".equals(pace)) {
            pace = "intensive";
        }
        if (!Set.of("standard", "intensive").contains(pace)) {
            throw HttpError.badRequest("Choisis un rythme standard ou intensif.");
        }
        LocalDate startDate = readDate(request.startDate());
        LocalDate targetDate = readDate(request.targetDate());
        if (targetDate.isBefore(startDate)) {
            throw HttpError.badRequest("La date cible doit suivre le début du parcours.");
        }
        List<Integer> days = request.studyDays();
        if (days.isEmpty() || days.size() > 7 || days.stream().anyMatch(day -> day == null || day < 1 || day > 7)
                || new LinkedHashSet<>(days).size() != days.size()) {
            throw HttpError.badRequest("Choisis un à sept jours distincts, numérotés de 1 à 7.");
        }
        int sessions = request.sessionsPerDay();
        int minutes = request.minutesPerSession();
        if (sessions <= 0 || minutes <= 0 || (long) sessions * minutes > 1440) {
            throw HttpError.badRequest("Les durées des séances doivent tenir dans une journée.");
        }
        return new GoalPlan(level, pace, startDate, targetDate,
                days.stream().sorted().toList(), sessions, minutes);
    }

    private static LocalDate readDate(String value) {
        if (value.length() != 10) {
            throw HttpError.badRequest("Utilise des dates au format AAAA-MM-JJ.");
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ignored) {
            throw HttpError.badRequest("Utilise des dates valides au format AAAA-MM-JJ.");
        }
    }

    public record GoalRequest(String level, String pace, String startDate, String targetDate,
                              List<Integer> studyDays, Integer sessionsPerDay, Integer minutesPerSession) {}

    public record Goal(String level, String pace, String startDate, String targetDate, List<Integer> studyDays,
                       int sessionsPerDay, int minutesPerSession, String updatedAt) {}

    private record GoalPlan(String level, String pace, LocalDate startDate, LocalDate targetDate,
                            List<Integer> studyDays, int sessionsPerDay, int minutesPerSession) {}
}
