package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;
import org.linguacap.learning.CourseResource.ActivitySummary;
import org.linguacap.learning.CourseResource.EnrollmentView;
import org.linguacap.learning.CourseResource.SessionSummary;

/** Inscriptions, séances et progression du schéma learning. */
@ApplicationScoped
class CourseStore {
    private static final Logger LOG = Logger.getLogger(CourseStore.class);

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    record PlannedActivity(String id, int position, String kind, String title, int estimatedMinutes) {}

    record SessionRow(UUID id, UUID enrollmentId, UUID learnerId, String enrollmentStatus, UUID trackVersionId,
                      String levelCode, SessionSummary summary) {}

    record ProgressRow(String activityId, JsonNode state, OffsetDateTime completedAt, UUID attemptId) {}

    /** Inscription la plus récente de l'élève (l'active en priorité), avec ses séances. */
    EnrollmentView enrollment(UUID learnerId) {
        return read("read enrollment", connection -> {
            try (var query = connection.prepareStatement("""
                    select id, learner_id, level_code, track_version_id, track_version_number, assigned_by,
                           assigned_at, status
                    from learning.enrollments where learner_id = ?
                    order by (status = 'active') desc, assigned_at desc limit 1
                    """)) {
                query.setObject(1, learnerId);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) return null;
                    UUID id = rows.getObject("id", UUID.class);
                    return new EnrollmentView(id, rows.getObject("learner_id", UUID.class), rows.getString("level_code"),
                            rows.getObject("track_version_id", UUID.class), rows.getInt("track_version_number"),
                            rows.getObject("assigned_by", UUID.class),
                            rows.getObject("assigned_at", OffsetDateTime.class).toString(), rows.getString("status"),
                            sessions(connection, id));
                }
            }
        });
    }

    /** Crée l'inscription et sa première séance, avec ses activités, dans une même transaction. */
    UUID enroll(UUID learnerId, String levelCode, UUID versionId, int versionNumber, UUID assignedBy,
                String moduleId, String moduleTitle, List<PlannedActivity> activities, OffsetDateTime dueAt) {
        return transaction("create enrollment", connection -> {
            UUID enrollmentId;
            try (var insert = connection.prepareStatement("""
                    insert into learning.enrollments (learner_id, level_code, track_version_id, track_version_number, assigned_by)
                    values (?, ?, ?, ?, ?)
                    on conflict (learner_id) where status = 'active' do nothing
                    returning id
                    """)) {
                insert.setObject(1, learnerId);
                insert.setString(2, levelCode);
                insert.setObject(3, versionId);
                insert.setInt(4, versionNumber);
                insert.setObject(5, assignedBy);
                try (var rows = insert.executeQuery()) {
                    if (!rows.next()) throw HttpError.conflict("Un parcours est déjà en cours pour cet élève.");
                    enrollmentId = rows.getObject(1, UUID.class);
                }
            }
            UUID sessionId;
            try (var insert = connection.prepareStatement("""
                    insert into learning.sessions (enrollment_id, learner_id, position, module_id, title, due_at)
                    values (?, ?, 1, ?, ?, ?) returning id
                    """)) {
                insert.setObject(1, enrollmentId);
                insert.setObject(2, learnerId);
                insert.setString(3, moduleId);
                insert.setString(4, moduleTitle);
                insert.setObject(5, dueAt);
                try (var rows = insert.executeQuery()) {
                    rows.next();
                    sessionId = rows.getObject(1, UUID.class);
                }
            }
            for (PlannedActivity activity : activities) {
                try (var insert = connection.prepareStatement("""
                        insert into learning.session_activities (session_id, activity_id, position, kind, title, estimated_minutes)
                        values (?, ?, ?, ?, ?, ?)
                        """)) {
                    insert.setObject(1, sessionId);
                    insert.setString(2, activity.id());
                    insert.setInt(3, activity.position());
                    insert.setString(4, activity.kind());
                    insert.setString(5, activity.title());
                    insert.setInt(6, activity.estimatedMinutes());
                    insert.executeUpdate();
                }
            }
            return enrollmentId;
        });
    }

    SessionRow session(UUID sessionId) {
        return read("read session", connection -> session(connection, sessionId));
    }

    Map<String, ProgressRow> progress(UUID sessionId) {
        return read("read progress", connection -> {
            Map<String, ProgressRow> progress = new LinkedHashMap<>();
            try (var query = connection.prepareStatement("""
                    select activity_id, state, completed_at, attempt_id from learning.activity_progress where session_id = ?
                    """)) {
                query.setObject(1, sessionId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        progress.put(rows.getString("activity_id"), new ProgressRow(rows.getString("activity_id"),
                                parse(rows.getString("state")), rows.getObject("completed_at", OffsetDateTime.class),
                                rows.getObject("attempt_id", UUID.class)));
                    }
                }
            }
            return progress;
        });
    }

    /**
     * Enregistre l'état d'une activité et, si demandé, sa fin. La fin n'est horodatée qu'une fois :
     * une requête rejouée renvoie le même résultat sans double comptage.
     */
    SessionSummary record(UUID sessionId, String activityId, UUID learnerId, JsonNode state, boolean complete,
                          UUID attemptId) {
        return transaction("record progress", connection -> {
            try (var lock = connection.prepareStatement("select id from learning.sessions where id = ? for update")) {
                lock.setObject(1, sessionId);
                lock.executeQuery().close();
            }
            try (var upsert = connection.prepareStatement("""
                    insert into learning.activity_progress (session_id, activity_id, learner_id, state)
                    values (?, ?, ?, coalesce(?::jsonb, '{}'::jsonb))
                    on conflict (session_id, activity_id) do update
                        set state = case when learning.activity_progress.completed_at is null and ?::jsonb is not null
                                         then ?::jsonb else learning.activity_progress.state end,
                            updated_at = now()
                    """)) {
                String payload = state == null ? null : state.toString();
                upsert.setObject(1, sessionId);
                upsert.setString(2, activityId);
                upsert.setObject(3, learnerId);
                upsert.setString(4, payload);
                upsert.setString(5, payload);
                upsert.setString(6, payload);
                upsert.executeUpdate();
            }
            if (complete) {
                try (var finish = connection.prepareStatement("""
                        update learning.activity_progress set completed_at = now(), attempt_id = ?
                        where session_id = ? and activity_id = ? and completed_at is null
                        """)) {
                    finish.setObject(1, attemptId);
                    finish.setObject(2, sessionId);
                    finish.setString(3, activityId);
                    finish.executeUpdate();
                }
            }
            try (var start = connection.prepareStatement("""
                    update learning.sessions set started_at = coalesce(started_at, now()),
                        completed_at = case when completed_at is null and not exists (
                            select 1 from learning.session_activities sa
                            left join learning.activity_progress p
                                   on p.session_id = sa.session_id and p.activity_id = sa.activity_id
                            where sa.session_id = learning.sessions.id and p.completed_at is null
                        ) then now() else completed_at end
                    where id = ?
                    """)) {
                start.setObject(1, sessionId);
                start.executeUpdate();
            }
            return session(connection, sessionId).summary();
        });
    }

    private SessionRow session(Connection connection, UUID sessionId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select s.id, s.enrollment_id, s.learner_id, e.status, e.track_version_id, e.level_code
                from learning.sessions s join learning.enrollments e on e.id = s.enrollment_id
                where s.id = ?
                """)) {
            query.setObject(1, sessionId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return null;
                UUID enrollmentId = rows.getObject("enrollment_id", UUID.class);
                SessionSummary summary = sessions(connection, enrollmentId).stream()
                        .filter(item -> item.id().equals(sessionId)).findFirst().orElseThrow();
                return new SessionRow(sessionId, enrollmentId, rows.getObject("learner_id", UUID.class),
                        rows.getString("status"), rows.getObject("track_version_id", UUID.class),
                        rows.getString("level_code"), summary);
            }
        }
    }

    private List<SessionSummary> sessions(Connection connection, UUID enrollmentId) throws SQLException {
        Map<UUID, List<ActivitySummary>> activities = new LinkedHashMap<>();
        try (var query = connection.prepareStatement("""
                select sa.session_id, sa.activity_id, sa.position, sa.kind, sa.title, sa.estimated_minutes,
                       p.started_at, p.completed_at
                from learning.session_activities sa
                join learning.sessions s on s.id = sa.session_id
                left join learning.activity_progress p on p.session_id = sa.session_id and p.activity_id = sa.activity_id
                where s.enrollment_id = ?
                order by s.position, sa.position
                """)) {
            query.setObject(1, enrollmentId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    OffsetDateTime completedAt = rows.getObject("completed_at", OffsetDateTime.class);
                    String status = completedAt != null ? "completed"
                            : rows.getObject("started_at") != null ? "started" : "todo";
                    activities.computeIfAbsent(rows.getObject("session_id", UUID.class), key -> new ArrayList<>())
                            .add(new ActivitySummary(rows.getString("activity_id"), rows.getInt("position"),
                                    rows.getString("kind"), rows.getString("title"), rows.getInt("estimated_minutes"),
                                    status, text(completedAt)));
                }
            }
        }
        List<SessionSummary> sessions = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now();
        try (var query = connection.prepareStatement("""
                select id, position, module_id, title, due_at, started_at, completed_at
                from learning.sessions where enrollment_id = ? order by due_at, position
                """)) {
            query.setObject(1, enrollmentId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    UUID id = rows.getObject("id", UUID.class);
                    OffsetDateTime dueAt = rows.getObject("due_at", OffsetDateTime.class);
                    OffsetDateTime startedAt = rows.getObject("started_at", OffsetDateTime.class);
                    OffsetDateTime completedAt = rows.getObject("completed_at", OffsetDateTime.class);
                    List<ActivitySummary> items = activities.getOrDefault(id, List.of());
                    sessions.add(new SessionSummary(id, rows.getInt("position"), rows.getString("module_id"),
                            rows.getString("title"), dueAt.toString(),
                            CourseRules.sessionStatus(startedAt, completedAt, dueAt, now),
                            text(startedAt), text(completedAt),
                            items.stream().mapToInt(ActivitySummary::estimatedMinutes).sum(), List.copyOf(items)));
                }
            }
        }
        return sessions;
    }

    private JsonNode parse(String value) {
        try {
            return json.readTree(value);
        } catch (Exception error) {
            return json.createObjectNode();
        }
    }

    private static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
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
        return HttpError.unavailable("Le parcours est temporairement indisponible.");
    }
}
