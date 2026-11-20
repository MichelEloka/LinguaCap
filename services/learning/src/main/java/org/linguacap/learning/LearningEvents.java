package org.linguacap.learning;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.Outbox;

/**
 * Événements d'Apprentissage (DEV-073) : objectif fixé, planning validé, pause, activité, séance terminée et état
 * de l'objectif. Ils sont écrits dans la transaction de l'action et exportés pour Suivi en route interne.
 */
@ApplicationScoped
@Path("/v1/internal/learning/events")
@Produces(MediaType.APPLICATION_JSON)
public class LearningEvents {
    private static final Logger LOG = Logger.getLogger(LearningEvents.class);
    private static final String TABLE = "learning.outbox_events";

    @Inject ObjectMapper json;
    @Inject AgroalDataSource dataSource;
    @Inject Actor actor;

    /** Lot d'événements après le numéro donné, pour Suivi. */
    @GET
    public ObjectNode export(@QueryParam("after") @DefaultValue("0") long after, @QueryParam("limit") @DefaultValue("100") int limit) {
        actor.id();
        try (Connection connection = dataSource.getConnection()) {
            return Outbox.read(connection, json, TABLE, "learning", Math.max(0, after), limit);
        } catch (SQLException error) {
            LOG.errorf("Learning event export failed (SQLSTATE %s)", error.getSQLState());
            throw HttpError.unavailable("Les événements d’apprentissage sont temporairement indisponibles.");
        }
    }

    void goalSet(Connection connection, UUID enrollmentId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select learner_id, level_code, track_version_id, start_level, template, start_date, target_date,
                       initial_target_date, assigned_by, assigned_at
                from learning.enrollments where id = ?
                """)) {
            query.setObject(1, enrollmentId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return;
                ObjectNode data = json.createObjectNode().put("enrollmentId", enrollmentId.toString())
                        .put("levelCode", rows.getString("level_code"))
                        .put("trackVersionId", rows.getObject("track_version_id", UUID.class).toString())
                        .put("startLevel", rows.getString("start_level")).put("template", rows.getString("template"))
                        .put("startDate", text(rows.getObject("start_date", LocalDate.class)))
                        .put("targetDate", text(rows.getObject("target_date", LocalDate.class)))
                        .put("initialTargetDate", text(rows.getObject("initial_target_date", LocalDate.class)))
                        .put("assignedBy", text(rows.getObject("assigned_by", UUID.class)))
                        .put("assignedAt", text(rows.getObject("assigned_at", OffsetDateTime.class)));
                Outbox.emit(connection, TABLE, "learning.goal_set", "goal", enrollmentId.toString(),
                        rows.getObject("learner_id", UUID.class), null, data);
            }
        }
    }

    /** Planning validé : séances actives avec leur échéance et le jalon qu'elles portent. */
    void planValidated(Connection connection, UUID enrollmentId, int revision) throws SQLException {
        UUID learnerId;
        String targetDate;
        try (var query = connection.prepareStatement("select learner_id, target_date from learning.enrollments where id = ?")) {
            query.setObject(1, enrollmentId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return;
                learnerId = rows.getObject("learner_id", UUID.class);
                targetDate = text(rows.getObject("target_date", LocalDate.class));
            }
        }
        ObjectNode data = json.createObjectNode().put("enrollmentId", enrollmentId.toString()).put("revision", revision)
                .put("targetDate", targetDate);
        ArrayNode sessions = data.putArray("sessions");
        try (var query = connection.prepareStatement("""
                select s.id, s.due_at, s.completed_at,
                       (select case when bool_or(sa.activity_id = 'examen-blanc') then 'final'
                                    when bool_or(sa.activity_id = 'bilan-intermediaire') then 'midterm' end
                        from learning.session_activities sa where sa.session_id = s.id) as milestone
                from learning.sessions s
                where s.enrollment_id = ? and s.superseded_at is null
                order by s.due_at, s.position
                """)) {
            query.setObject(1, enrollmentId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    ObjectNode session = sessions.addObject().put("id", rows.getObject("id", UUID.class).toString())
                            .put("dueAt", text(rows.getObject("due_at", OffsetDateTime.class)))
                            .put("completedAt", text(rows.getObject("completed_at", OffsetDateTime.class)));
                    session.put("milestone", rows.getString("milestone"));
                }
            }
        }
        Outbox.emit(connection, TABLE, "learning.plan_validated", "plan_revision", enrollmentId + ":" + revision,
                learnerId, null, data);
    }

    void goalStatus(Connection connection, UUID enrollmentId, String type, String status) throws SQLException {
        try (var query = connection.prepareStatement(
                "select learner_id, goal_status, resume_date, target_date from learning.enrollments where id = ?")) {
            query.setObject(1, enrollmentId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return;
                ObjectNode data = json.createObjectNode().put("enrollmentId", enrollmentId.toString())
                        .put("goalStatus", status == null ? rows.getString("goal_status") : status)
                        .put("resumeDate", text(rows.getObject("resume_date", LocalDate.class)))
                        .put("targetDate", text(rows.getObject("target_date", LocalDate.class)));
                Outbox.emit(connection, TABLE, type, "goal", enrollmentId.toString(),
                        rows.getObject("learner_id", UUID.class), null, data);
            }
        }
    }

    /** Activité pédagogique enregistrée, et fin de séance quand cette activité la termine. */
    void progress(Connection connection, UUID enrollmentId, UUID sessionId, UUID learnerId, String activityId,
                  boolean completed, OffsetDateTime sessionCompletedBefore) throws SQLException {
        ObjectNode data = json.createObjectNode().put("enrollmentId", enrollmentId.toString())
                .put("sessionId", sessionId.toString()).put("activityId", activityId).put("completed", completed);
        Outbox.emit(connection, TABLE, "learning.activity_progressed", "session", sessionId.toString(), learnerId, null, data);
        if (sessionCompletedBefore != null) return;
        try (var query = connection.prepareStatement("select due_at, completed_at from learning.sessions where id = ?")) {
            query.setObject(1, sessionId);
            try (var rows = query.executeQuery()) {
                if (!rows.next() || rows.getObject("completed_at") == null) return;
                OffsetDateTime due = rows.getObject("due_at", OffsetDateTime.class);
                OffsetDateTime done = rows.getObject("completed_at", OffsetDateTime.class);
                ObjectNode completion = json.createObjectNode().put("enrollmentId", enrollmentId.toString())
                        .put("sessionId", sessionId.toString()).put("dueAt", text(due)).put("completedAt", text(done))
                        .put("onTime", !done.isAfter(due));
                Outbox.emit(connection, TABLE, "learning.session_completed", "session", sessionId.toString(), learnerId,
                        null, completion);
            }
        }
    }

    private static String text(Object value) {
        return value == null ? null : value.toString();
    }
}
