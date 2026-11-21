package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Connection;
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
import org.linguacap.learning.CourseResource.EnrollmentSessions;
import org.linguacap.learning.CourseResource.SessionSummary;

/** Séances et progression du schéma learning. La progression appartient au parcours, pas à la séance. */
@ApplicationScoped
class CourseStore {
    private static final Logger LOG = Logger.getLogger(CourseStore.class);

    @Inject AgroalDataSource dataSource;
    @Inject LearningEvents events;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    record SessionRow(UUID id, UUID enrollmentId, UUID learnerId, String enrollmentStatus, String goalStatus,
                      UUID trackVersionId, String levelCode, boolean superseded, SessionSummary summary,
                      Map<String, Source> sources) {}

    /** Version et activité d'origine d'une activité ajoutée par le professeur (contenu lu dans cette version). */
    record Source(UUID versionId, String activityId) {}

    record ProgressRow(String activityId, JsonNode state, OffsetDateTime completedAt, UUID attemptId) {}

    /** Séances du planning en vigueur (et terminées), et nombre de séances remplacées par une replanification. */
    EnrollmentSessions sessions(UUID enrollmentId) {
        return read("read sessions", connection -> {
            List<SessionSummary> all = sessions(connection, enrollmentId);
            List<SessionSummary> current = all.stream().filter(session -> !"superseded".equals(session.status())).toList();
            return new EnrollmentSessions(current, all.size() - current.size());
        });
    }

    SessionRow session(UUID sessionId) {
        return read("read session", connection -> session(connection, sessionId));
    }

    Map<String, ProgressRow> progress(UUID enrollmentId) {
        return read("read progress", connection -> {
            Map<String, ProgressRow> progress = new LinkedHashMap<>();
            try (var query = connection.prepareStatement("""
                    select activity_id, state, completed_at, attempt_id from learning.activity_progress where enrollment_id = ?
                    """)) {
                query.setObject(1, enrollmentId);
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
    SessionSummary record(UUID sessionId, UUID enrollmentId, String activityId, UUID learnerId, JsonNode state,
                          boolean complete, UUID attemptId) {
        return transaction("record progress", connection -> {
            OffsetDateTime completedBefore;
            try (var lock = connection.prepareStatement("select completed_at from learning.sessions where id = ? for update")) {
                lock.setObject(1, sessionId);
                try (var rows = lock.executeQuery()) {
                    completedBefore = rows.next() ? rows.getObject(1, OffsetDateTime.class) : null;
                }
            }
            try (var upsert = connection.prepareStatement("""
                    insert into learning.activity_progress (session_id, activity_id, learner_id, enrollment_id, state)
                    values (?, ?, ?, ?, coalesce(?::jsonb, '{}'::jsonb))
                    on conflict (enrollment_id, activity_id) do update
                        set state = case when learning.activity_progress.completed_at is null and ?::jsonb is not null
                                         then ?::jsonb else learning.activity_progress.state end,
                            session_id = case when learning.activity_progress.completed_at is null
                                              then excluded.session_id else learning.activity_progress.session_id end,
                            updated_at = now()
                    """)) {
                String payload = state == null ? null : state.toString();
                upsert.setObject(1, sessionId);
                upsert.setString(2, activityId);
                upsert.setObject(3, learnerId);
                upsert.setObject(4, enrollmentId);
                upsert.setString(5, payload);
                upsert.setString(6, payload);
                upsert.setString(7, payload);
                upsert.executeUpdate();
            }
            if (complete) {
                try (var finish = connection.prepareStatement("""
                        update learning.activity_progress set completed_at = now(), attempt_id = ?
                        where enrollment_id = ? and activity_id = ? and completed_at is null
                        """)) {
                    finish.setObject(1, attemptId);
                    finish.setObject(2, enrollmentId);
                    finish.setString(3, activityId);
                    finish.executeUpdate();
                }
            }
            try (var start = connection.prepareStatement("""
                    update learning.sessions set started_at = coalesce(started_at, now()),
                        completed_at = case when completed_at is null and not exists (
                            select 1 from learning.session_activities sa
                            left join learning.activity_progress p
                                   on p.enrollment_id = learning.sessions.enrollment_id and p.activity_id = sa.activity_id
                            where sa.session_id = learning.sessions.id and p.completed_at is null
                        ) then now() else completed_at end
                    where id = ?
                    """)) {
                start.setObject(1, sessionId);
                start.executeUpdate();
            }
            events.progress(connection, enrollmentId, sessionId, learnerId, activityId, complete, completedBefore);
            return session(connection, sessionId).summary();
        });
    }

    private SessionRow session(Connection connection, UUID sessionId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select s.id, s.enrollment_id, s.learner_id, s.superseded_at, e.status, e.goal_status, e.track_version_id,
                       e.level_code
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
                        rows.getString("status"), rows.getString("goal_status"),
                        rows.getObject("track_version_id", UUID.class), rows.getString("level_code"),
                        rows.getObject("superseded_at") != null, summary, sources(connection, sessionId));
            }
        }
    }

    private static Map<String, Source> sources(Connection connection, UUID sessionId) throws SQLException {
        Map<String, Source> sources = new LinkedHashMap<>();
        try (var query = connection.prepareStatement("""
                select activity_id, source_version_id, source_activity_id from learning.session_activities
                where session_id = ? and source_version_id is not null
                """)) {
            query.setObject(1, sessionId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    sources.put(rows.getString("activity_id"), new Source(rows.getObject("source_version_id", UUID.class),
                            rows.getString("source_activity_id")));
                }
            }
        }
        return sources;
    }

    private List<SessionSummary> sessions(Connection connection, UUID enrollmentId) throws SQLException {
        Map<UUID, List<ActivitySummary>> activities = new LinkedHashMap<>();
        try (var query = connection.prepareStatement("""
                select sa.session_id, sa.activity_id, sa.position, sa.kind, sa.title, sa.estimated_minutes,
                       p.started_at, p.completed_at
                from learning.session_activities sa
                join learning.sessions s on s.id = sa.session_id
                left join learning.activity_progress p on p.enrollment_id = s.enrollment_id and p.activity_id = sa.activity_id
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
                select id, position, module_id, title, due_at, started_at, completed_at, superseded_at, slot
                from learning.sessions where enrollment_id = ? order by due_at, slot, position
                """)) {
            query.setObject(1, enrollmentId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    UUID id = rows.getObject("id", UUID.class);
                    OffsetDateTime dueAt = rows.getObject("due_at", OffsetDateTime.class);
                    OffsetDateTime startedAt = rows.getObject("started_at", OffsetDateTime.class);
                    OffsetDateTime completedAt = rows.getObject("completed_at", OffsetDateTime.class);
                    boolean superseded = rows.getObject("superseded_at") != null;
                    List<ActivitySummary> items = activities.getOrDefault(id, List.of());
                    String status = superseded && completedAt == null ? "superseded"
                            : CourseRules.sessionStatus(startedAt, completedAt, dueAt, now);
                    sessions.add(new SessionSummary(id, rows.getInt("position"), rows.getString("module_id"),
                            rows.getString("title"), dueAt.toString(), status, text(startedAt), text(completedAt),
                            items.stream().mapToInt(ActivitySummary::estimatedMinutes).sum(), rows.getInt("slot"),
                            List.copyOf(items)));
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
