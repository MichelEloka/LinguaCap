package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Array;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;
import org.linguacap.learning.Planner.Day;

/** Objectif, disponibilités, propositions de planning et replanification du schéma learning. */
@ApplicationScoped
class GoalStore {
    private static final Logger LOG = Logger.getLogger(GoalStore.class);
    private static final String COLUMNS = """
            id, learner_id, level_code, track_version_id, track_version_number, assigned_by, assigned_at, status,
            start_level, start_date, target_date, initial_target_date, template, goal_status, paused_at, resume_date,
            prerequisite_level, prerequisite_met, acquired_modules, diagnostic_attempt_id, diagnostic_modules,
            diagnostic_prerequisite, starting_point_confirmed_at, validated_revision
            """;

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    record EnrollmentRow(UUID id, UUID learnerId, String levelCode, UUID trackVersionId, int trackVersionNumber,
                         UUID assignedBy, OffsetDateTime assignedAt, String status, String startLevel, LocalDate startDate,
                         LocalDate targetDate, LocalDate initialTargetDate, String template, String goalStatus,
                         OffsetDateTime pausedAt, LocalDate resumeDate, String prerequisiteLevel, boolean prerequisiteMet,
                         List<String> acquiredModules, UUID diagnosticAttemptId, List<String> diagnosticModules,
                         Boolean diagnosticPrerequisite, OffsetDateTime startingPointConfirmedAt, int validatedRevision) {}

    record ProposalRow(int number, int baseRevision, String status, LocalDate startDate, LocalDate targetDate,
                       JsonNode availability, JsonNode plan, int capacityMinutes, int requiredMinutes, int overflowCount,
                       OffsetDateTime createdAt, OffsetDateTime validatedAt) {}

    EnrollmentRow latest(UUID learnerId) {
        return read("read goal", connection -> one(connection, """
                select %s from learning.enrollments where learner_id = ?
                order by (status = 'active') desc, assigned_at desc limit 1
                """.formatted(COLUMNS), learnerId));
    }

    EnrollmentRow byId(UUID enrollmentId) {
        return read("read goal", connection -> one(connection,
                "select %s from learning.enrollments where id = ?".formatted(COLUMNS), enrollmentId));
    }

    boolean hasValidated(UUID learnerId, String levelCode) {
        return read("read validated goals", connection -> {
            try (var query = connection.prepareStatement("""
                    select 1 from learning.enrollments where learner_id = ? and level_code = ? and goal_status = 'validated'
                    """)) {
                query.setObject(1, learnerId);
                query.setString(2, levelCode);
                try (var rows = query.executeQuery()) {
                    return rows.next();
                }
            }
        });
    }

    /** Crée le parcours en préparation avec son objectif et ses disponibilités. */
    UUID create(UUID learnerId, String levelCode, UUID versionId, int versionNumber, UUID assignedBy, String startLevel,
                LocalDate startDate, LocalDate targetDate, String template, String prerequisiteLevel,
                boolean prerequisiteMet, List<Day> availability) {
        return transaction("create goal", connection -> {
            UUID id;
            try (var insert = connection.prepareStatement("""
                    insert into learning.enrollments
                        (learner_id, level_code, track_version_id, track_version_number, assigned_by, start_level,
                         start_date, target_date, initial_target_date, template, goal_status, prerequisite_level,
                         prerequisite_met)
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'preparing', ?, ?)
                    on conflict (learner_id) where status = 'active' do nothing
                    returning id
                    """)) {
                insert.setObject(1, learnerId);
                insert.setString(2, levelCode);
                insert.setObject(3, versionId);
                insert.setInt(4, versionNumber);
                insert.setObject(5, assignedBy);
                insert.setString(6, startLevel);
                insert.setObject(7, startDate);
                insert.setObject(8, targetDate);
                insert.setObject(9, targetDate);
                insert.setString(10, template);
                insert.setString(11, prerequisiteLevel);
                insert.setBoolean(12, prerequisiteMet);
                try (var rows = insert.executeQuery()) {
                    if (!rows.next()) throw HttpError.conflict("Un parcours est déjà en cours pour cet élève.");
                    id = rows.getObject(1, UUID.class);
                }
            }
            writeAvailability(connection, id, availability);
            return id;
        });
    }

    List<Day> availability(UUID enrollmentId) {
        return read("read availability", connection -> {
            List<Day> days = new ArrayList<>();
            try (var query = connection.prepareStatement("""
                    select weekday, sessions, minutes from learning.availabilities where enrollment_id = ? order by weekday
                    """)) {
                query.setObject(1, enrollmentId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) days.add(new Day(rows.getInt(1), rows.getInt(2), rows.getInt(3)));
                }
            }
            return days;
        });
    }

    void replaceAvailability(UUID enrollmentId, List<Day> days, LocalDate targetDate) {
        transaction("update availability", connection -> {
            writeAvailability(connection, enrollmentId, days);
            if (targetDate != null) {
                try (var update = connection.prepareStatement(
                        "update learning.enrollments set target_date = ? where id = ? and start_date < ?")) {
                    update.setObject(1, targetDate);
                    update.setObject(2, enrollmentId);
                    update.setObject(3, targetDate);
                    if (update.executeUpdate() == 0) throw HttpError.badRequest("La date cible doit suivre le début du parcours.");
                }
            }
            return null;
        });
    }

    Set<String> completedActivities(UUID enrollmentId) {
        return read("read completed activities", connection -> {
            Set<String> done = new HashSet<>();
            try (var query = connection.prepareStatement("""
                    select activity_id from learning.activity_progress where enrollment_id = ? and completed_at is not null
                    """)) {
                query.setObject(1, enrollmentId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) done.add(rows.getString(1));
                }
            }
            return done;
        });
    }

    /** Enregistre une nouvelle proposition ; la précédente proposition en attente est écartée. */
    int saveProposal(UUID enrollmentId, int baseRevision, LocalDate start, LocalDate target, List<Day> availability,
                     JsonNode plan, int capacity, int required, int overflow, UUID createdBy) {
        return transaction("save proposal", connection -> {
            try (var lock = connection.prepareStatement("select id from learning.enrollments where id = ? for update")) {
                lock.setObject(1, enrollmentId);
                lock.executeQuery().close();
            }
            try (var discard = connection.prepareStatement("""
                    update learning.plan_revisions set status = 'discarded' where enrollment_id = ? and status = 'proposed'
                    """)) {
                discard.setObject(1, enrollmentId);
                discard.executeUpdate();
            }
            int number;
            try (var next = connection.prepareStatement(
                    "select coalesce(max(number), 0) + 1 from learning.plan_revisions where enrollment_id = ?")) {
                next.setObject(1, enrollmentId);
                try (var rows = next.executeQuery()) {
                    rows.next();
                    number = rows.getInt(1);
                }
            }
            try (var insert = connection.prepareStatement("""
                    insert into learning.plan_revisions (enrollment_id, number, base_revision, start_date, target_date,
                        availability, plan, capacity_minutes, required_minutes, overflow_count, created_by)
                    values (?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?, ?, ?)
                    """)) {
                insert.setObject(1, enrollmentId);
                insert.setInt(2, number);
                insert.setInt(3, baseRevision);
                insert.setObject(4, start);
                insert.setObject(5, target);
                insert.setString(6, json.valueToTree(availability).toString());
                insert.setString(7, plan.toString());
                insert.setInt(8, capacity);
                insert.setInt(9, required);
                insert.setInt(10, overflow);
                insert.setObject(11, createdBy);
                insert.executeUpdate();
            }
            return number;
        });
    }

    /** Dernière proposition en attente, sinon la dernière révision validée. */
    ProposalRow proposal(UUID enrollmentId) {
        return read("read proposal", connection -> {
            try (var query = connection.prepareStatement("""
                    select number, base_revision, status, start_date, target_date, availability, plan, capacity_minutes,
                           required_minutes, overflow_count, created_at, validated_at
                    from learning.plan_revisions where enrollment_id = ? and status in ('proposed', 'validated')
                    order by (status = 'proposed') desc, number desc limit 1
                    """)) {
                query.setObject(1, enrollmentId);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) return null;
                    return new ProposalRow(rows.getInt("number"), rows.getInt("base_revision"), rows.getString("status"),
                            rows.getObject("start_date", LocalDate.class), rows.getObject("target_date", LocalDate.class),
                            parse(rows.getString("availability")), parse(rows.getString("plan")),
                            rows.getInt("capacity_minutes"), rows.getInt("required_minutes"), rows.getInt("overflow_count"),
                            rows.getObject("created_at", OffsetDateTime.class),
                            rows.getObject("validated_at", OffsetDateTime.class));
                }
            }
        });
    }

    /**
     * Valide une proposition fondée sur le planning en vigueur : les séances non terminées sont remplacées
     * (leur échéance et un éventuel retard restent dans l'historique), les séances terminées sont conservées.
     */
    void validate(UUID enrollmentId, int number, UUID validatedBy) {
        transaction("validate plan", connection -> {
            int current;
            boolean prerequisiteMet;
            try (var lock = connection.prepareStatement("""
                    select validated_revision, prerequisite_met, status from learning.enrollments where id = ? for update
                    """)) {
                lock.setObject(1, enrollmentId);
                try (var rows = lock.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Parcours introuvable.");
                    if (!"active".equals(rows.getString("status"))) throw HttpError.conflict("Ce parcours n’est plus actif.");
                    current = rows.getInt("validated_revision");
                    prerequisiteMet = rows.getBoolean("prerequisite_met");
                }
            }
            JsonNode plan;
            try (var query = connection.prepareStatement("""
                    select status, base_revision, overflow_count, plan from learning.plan_revisions
                    where enrollment_id = ? and number = ? for update
                    """)) {
                query.setObject(1, enrollmentId);
                query.setInt(2, number);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) throw HttpError.notFound("Proposition introuvable.");
                    if (!"proposed".equals(rows.getString("status")) || rows.getInt("base_revision") != current) {
                        throw HttpError.conflict("Le planning a changé depuis cette proposition : actualisez-la avant de la valider.");
                    }
                    if (rows.getInt("overflow_count") > 0) {
                        throw HttpError.conflict("Le programme dépasse la capacité : appliquez un ajustement avant de valider.");
                    }
                    plan = parse(rows.getString("plan"));
                }
            }
            if (!prerequisiteMet) {
                throw HttpError.conflict("Le prérequis du niveau doit être validé ou confirmé par le diagnostic.");
            }
            try (var history = connection.prepareStatement("""
                    insert into learning.session_due_history (session_id, revision_number, previous_due_at, was_late, reason)
                    select id, ?, due_at, due_at < now(), 'replanned' from learning.sessions
                    where enrollment_id = ? and completed_at is null and superseded_at is null
                    """)) {
                history.setInt(1, number);
                history.setObject(2, enrollmentId);
                history.executeUpdate();
            }
            try (var supersede = connection.prepareStatement("""
                    update learning.sessions set superseded_at = now()
                    where enrollment_id = ? and completed_at is null and superseded_at is null
                    """)) {
                supersede.setObject(1, enrollmentId);
                supersede.executeUpdate();
            }
            insertSessions(connection, enrollmentId, number, plan.path("sessions"));
            try (var previous = connection.prepareStatement("""
                    update learning.plan_revisions set status = 'superseded' where enrollment_id = ? and status = 'validated'
                    """)) {
                previous.setObject(1, enrollmentId);
                previous.executeUpdate();
            }
            try (var accept = connection.prepareStatement("""
                    update learning.plan_revisions set status = 'validated', validated_by = ?, validated_at = now()
                    where enrollment_id = ? and number = ?
                    """)) {
                accept.setObject(1, validatedBy);
                accept.setObject(2, enrollmentId);
                accept.setInt(3, number);
                accept.executeUpdate();
            }
            try (var goal = connection.prepareStatement("""
                    update learning.enrollments e
                    set validated_revision = ?, goal_status = 'active', paused_at = null, resume_date = null,
                        target_date = r.target_date
                    from learning.plan_revisions r
                    where e.id = ? and r.enrollment_id = e.id and r.number = ?
                    """)) {
                goal.setInt(1, number);
                goal.setObject(2, enrollmentId);
                goal.setInt(3, number);
                goal.executeUpdate();
            }
            return null;
        });
    }

    void pause(UUID enrollmentId) {
        transaction("pause goal", connection -> {
            try (var update = connection.prepareStatement("""
                    update learning.enrollments set goal_status = 'paused', paused_at = now()
                    where id = ? and status = 'active' and goal_status in ('active', 'preparing')
                    """)) {
                update.setObject(1, enrollmentId);
                if (update.executeUpdate() == 0) throw HttpError.conflict("Seul un parcours en cours peut être mis en pause.");
            }
            return null;
        });
    }

    void planResume(UUID enrollmentId, LocalDate resumeDate, LocalDate targetDate) {
        transaction("plan resume", connection -> {
            try (var update = connection.prepareStatement("""
                    update learning.enrollments set resume_date = ?, target_date = coalesce(?, target_date)
                    where id = ? and goal_status = 'paused'
                    """)) {
                update.setObject(1, resumeDate);
                update.setObject(2, targetDate);
                update.setObject(3, enrollmentId);
                if (update.executeUpdate() == 0) throw HttpError.conflict("Ce parcours n’est pas en pause.");
            }
            return null;
        });
    }

    void recordDiagnostic(UUID enrollmentId, UUID attemptId, List<String> modules, Boolean prerequisite,
                          boolean apply, UUID by) {
        transaction("record diagnostic", connection -> {
            try (var update = connection.prepareStatement("""
                    update learning.enrollments set diagnostic_attempt_id = ?, diagnostic_modules = ?,
                        diagnostic_prerequisite = ?,
                        acquired_modules = case when ? then ? else acquired_modules end,
                        prerequisite_met = case when ? then prerequisite_met or coalesce(?, false) else prerequisite_met end,
                        starting_point_confirmed_at = case when ? then now() else starting_point_confirmed_at end,
                        starting_point_confirmed_by = case when ? then ? else starting_point_confirmed_by end
                    where id = ?
                    """)) {
                Array array = connection.createArrayOf("text", modules.toArray());
                update.setObject(1, attemptId);
                update.setArray(2, array);
                update.setObject(3, prerequisite);
                update.setBoolean(4, apply);
                update.setArray(5, array);
                update.setBoolean(6, apply);
                update.setObject(7, prerequisite);
                update.setBoolean(8, apply);
                update.setBoolean(9, apply);
                update.setObject(10, by);
                update.setObject(11, enrollmentId);
                update.executeUpdate();
            }
            return null;
        });
    }

    void confirmStartingPoint(UUID enrollmentId, List<String> acquired, boolean prerequisiteMet, UUID by) {
        transaction("confirm starting point", connection -> {
            try (var update = connection.prepareStatement("""
                    update learning.enrollments set acquired_modules = ?, prerequisite_met = ?,
                        starting_point_confirmed_at = now(), starting_point_confirmed_by = ?
                    where id = ?
                    """)) {
                update.setArray(1, connection.createArrayOf("text", acquired.toArray()));
                update.setBoolean(2, prerequisiteMet);
                update.setObject(3, by);
                update.setObject(4, enrollmentId);
                update.executeUpdate();
            }
            return null;
        });
    }

    private void insertSessions(Connection connection, UUID enrollmentId, int revision, JsonNode sessions) throws SQLException {
        int position;
        UUID learnerId;
        try (var query = connection.prepareStatement("""
                select e.learner_id, coalesce(max(s.position), 0) from learning.enrollments e
                left join learning.sessions s on s.enrollment_id = e.id where e.id = ? group by e.learner_id
                """)) {
            query.setObject(1, enrollmentId);
            try (var rows = query.executeQuery()) {
                rows.next();
                learnerId = rows.getObject(1, UUID.class);
                position = rows.getInt(2);
            }
        }
        for (JsonNode session : sessions) {
            UUID sessionId;
            try (var insert = connection.prepareStatement("""
                    insert into learning.sessions (enrollment_id, learner_id, position, module_id, title, due_at,
                        scheduled_date, slot, revision_number)
                    values (?, ?, ?, ?, ?, ?::timestamptz, ?::date, ?, ?) returning id
                    """)) {
                insert.setObject(1, enrollmentId);
                insert.setObject(2, learnerId);
                insert.setInt(3, ++position);
                insert.setString(4, session.path("moduleId").asText());
                insert.setString(5, session.path("title").asText());
                insert.setString(6, session.path("dueAt").asText());
                insert.setString(7, session.path("date").asText());
                insert.setInt(8, session.path("slot").asInt());
                insert.setInt(9, revision);
                try (var rows = insert.executeQuery()) {
                    rows.next();
                    sessionId = rows.getObject(1, UUID.class);
                }
            }
            int index = 0;
            for (JsonNode item : session.path("items")) {
                try (var insert = connection.prepareStatement("""
                        insert into learning.session_activities (session_id, activity_id, position, kind, title, estimated_minutes)
                        values (?, ?, ?, ?, ?, ?)
                        """)) {
                    insert.setObject(1, sessionId);
                    insert.setString(2, item.path("id").asText());
                    insert.setInt(3, ++index);
                    insert.setString(4, item.path("kind").asText());
                    insert.setString(5, item.path("title").asText());
                    insert.setInt(6, Math.max(1, item.path("minutes").asInt()));
                    insert.executeUpdate();
                }
            }
        }
    }

    private void writeAvailability(Connection connection, UUID enrollmentId, List<Day> days) throws SQLException {
        try (var delete = connection.prepareStatement("delete from learning.availabilities where enrollment_id = ?")) {
            delete.setObject(1, enrollmentId);
            delete.executeUpdate();
        }
        for (Day day : days) {
            try (var insert = connection.prepareStatement("""
                    insert into learning.availabilities (enrollment_id, weekday, sessions, minutes) values (?, ?, ?, ?)
                    """)) {
                insert.setObject(1, enrollmentId);
                insert.setInt(2, day.weekday());
                insert.setInt(3, day.sessions());
                insert.setInt(4, day.minutes());
                insert.executeUpdate();
            }
        }
    }

    private EnrollmentRow one(Connection connection, String sql, UUID parameter) throws SQLException {
        try (var query = connection.prepareStatement(sql)) {
            query.setObject(1, parameter);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return null;
                return new EnrollmentRow(rows.getObject("id", UUID.class), rows.getObject("learner_id", UUID.class),
                        rows.getString("level_code"), rows.getObject("track_version_id", UUID.class),
                        rows.getInt("track_version_number"), rows.getObject("assigned_by", UUID.class),
                        rows.getObject("assigned_at", OffsetDateTime.class), rows.getString("status"),
                        rows.getString("start_level"), rows.getObject("start_date", LocalDate.class),
                        rows.getObject("target_date", LocalDate.class), rows.getObject("initial_target_date", LocalDate.class),
                        rows.getString("template"), rows.getString("goal_status"),
                        rows.getObject("paused_at", OffsetDateTime.class), rows.getObject("resume_date", LocalDate.class),
                        rows.getString("prerequisite_level"), rows.getBoolean("prerequisite_met"),
                        texts(rows.getArray("acquired_modules")), rows.getObject("diagnostic_attempt_id", UUID.class),
                        rows.getArray("diagnostic_modules") == null ? null : texts(rows.getArray("diagnostic_modules")),
                        (Boolean) rows.getObject("diagnostic_prerequisite"),
                        rows.getObject("starting_point_confirmed_at", OffsetDateTime.class),
                        rows.getInt("validated_revision"));
            }
        }
    }

    private static List<String> texts(Array array) throws SQLException {
        if (array == null) return List.of();
        try {
            List<String> values = new ArrayList<>();
            for (Object value : (Object[]) array.getArray()) values.add(String.valueOf(value));
            return List.copyOf(values);
        } finally {
            array.free();
        }
    }

    private JsonNode parse(String value) {
        try {
            return json.readTree(value);
        } catch (Exception error) {
            return json.createObjectNode();
        }
    }

    private <T> T read(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            return work.run(connection);
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    private <T> T transaction(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                T result = work.run(connection);
                connection.commit();
                return result;
            } catch (SQLException | RuntimeException error) {
                connection.rollback();
                throw error;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    private static RuntimeException failure(String operation, SQLException error) {
        LOG.errorf("Learning database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        return HttpError.unavailable("Le planning est temporairement indisponible.");
    }
}
