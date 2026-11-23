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
 * de l'objectif ; parcours, niveaux, contrats et ajouts de cours (sujets « path » et « contract », sans clé
 * enrollmentId). Ils sont écrits dans la transaction de l'action et exportés pour Suivi en route interne.
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
                emitGoalState(connection, enrollmentId, "learning.goal_set", "goal", enrollmentId.toString(),
                        rows.getObject("learner_id", UUID.class), data);
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
        emitGoalState(connection, enrollmentId, "learning.plan_validated", "plan_revision", enrollmentId + ":" + revision,
                learnerId, data);
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
                emitGoalState(connection, enrollmentId, type, "goal", enrollmentId.toString(),
                        rows.getObject("learner_id", UUID.class), data);
            }
        }
    }

    /**
     * Événement d'état de l'objectif, horodaté par l'horloge de l'objectif (EVO-042). La valeur par défaut de la
     * table, now(), est l'heure du DÉBUT de la transaction : elle ne suit pas toujours l'ordre réel des actions sur un
     * objectif (horloge du serveur recalée en arrière, transactions qui se chevauchent), et Suivi, qui garde l'état le
     * plus récent selon occurredAt, écartait alors l'action la plus récente, par exemple une pause qui suit la
     * validation du planning. L'heure est lue sous le verrou de l'inscription, que toute action sur l'état de l'objectif
     * prend avant d'émettre : elle suit l'ordre des séquences et reste strictement croissante pour un même objectif.
     * L'enveloppe ne change pas (mêmes colonnes que {@link Outbox#emit}, heure fournie au lieu de la valeur par défaut).
     */
    private void emitGoalState(Connection connection, UUID enrollmentId, String type, String subjectKind,
                               String subjectId, UUID learnerId, ObjectNode data) throws SQLException {
        OffsetDateTime previous;
        OffsetDateTime clock;
        try (var lock = connection.prepareStatement("""
                select goal_event_at, clock_timestamp() as clock from learning.enrollments where id = ? for update
                """)) {
            lock.setObject(1, enrollmentId);
            try (var rows = lock.executeQuery()) {
                if (!rows.next()) throw new SQLException("Inscription introuvable pour l’événement " + type, "P0002");
                previous = rows.getObject("goal_event_at", OffsetDateTime.class);
                clock = rows.getObject("clock", OffsetDateTime.class);
            }
        }
        OffsetDateTime occurredAt = GoalRules.eventTime(previous, clock);
        try (var update = connection.prepareStatement("update learning.enrollments set goal_event_at = ? where id = ?")) {
            update.setObject(1, occurredAt);
            update.setObject(2, enrollmentId);
            update.executeUpdate();
        }
        try (var insert = connection.prepareStatement("insert into " + TABLE
                + " (id, type, occurred_at, subject_kind, subject_id, learner_id, data) values (?, ?, ?, ?, ?, ?, ?::jsonb)")) {
            insert.setObject(1, UUID.randomUUID());
            insert.setString(2, type);
            insert.setObject(3, occurredAt);
            insert.setString(4, subjectKind);
            insert.setString(5, subjectId);
            insert.setObject(6, learnerId);
            insert.setString(7, data.toString());
            insert.executeUpdate();
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

    // --- Parcours et contrat --------------------------------------------------------------------------------
    // Ces événements ne portent JAMAIS de clé enrollmentId : Suivi crée une ligne d'objectif pour tout événement
    // qui en porte une. Chaque niveau garde ses propres événements goal_set et plan_validated.

    /** Parcours créé, démarré ou terminé : l'objectif global (langue, niveaux, dates, charge). */
    void path(Connection connection, UUID pathId, String type) throws SQLException {
        try (var query = connection.prepareStatement("""
                select learner_id, language_id, status, origin, start_level, target_level, start_date, target_date,
                       initial_target_date, weekly_minutes, required_minutes, difficulty, validated_revision
                from learning.paths where id = ?
                """)) {
            query.setObject(1, pathId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return;
                ObjectNode data = json.createObjectNode().put("pathId", pathId.toString())
                        .put("languageId", rows.getString("language_id")).put("status", rows.getString("status"))
                        .put("origin", rows.getString("origin")).put("startLevel", rows.getString("start_level"))
                        .put("targetLevel", rows.getString("target_level"))
                        .put("startDate", text(rows.getObject("start_date", LocalDate.class)))
                        .put("targetDate", text(rows.getObject("target_date", LocalDate.class)))
                        .put("initialTargetDate", text(rows.getObject("initial_target_date", LocalDate.class)))
                        .put("weeklyMinutes", rows.getInt("weekly_minutes"))
                        .put("requiredMinutes", rows.getInt("required_minutes"))
                        .put("difficulty", rows.getString("difficulty"))
                        .put("validatedRevision", rows.getInt("validated_revision"));
                Outbox.emit(connection, TABLE, type, "path", pathId.toString(), rows.getObject("learner_id", UUID.class),
                        null, data);
            }
        }
    }

    /** Ouverture d'un niveau du parcours (l'inscription du niveau émet de son côté goal_set). */
    void pathStepActivated(Connection connection, UUID stepId) throws SQLException {
        try (var query = connection.prepareStatement("""
                select s.path_id, s.rank, s.level_code, s.track_version_id, s.track_version_number, p.learner_id
                from learning.path_steps s join learning.paths p on p.id = s.path_id where s.id = ?
                """)) {
            query.setObject(1, stepId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return;
                UUID pathId = rows.getObject("path_id", UUID.class);
                ObjectNode data = json.createObjectNode().put("pathId", pathId.toString()).put("stepId", stepId.toString())
                        .put("rank", rows.getInt("rank")).put("levelCode", rows.getString("level_code"))
                        .put("trackVersionId", rows.getObject("track_version_id", UUID.class).toString())
                        .put("trackVersionNumber", rows.getInt("track_version_number"));
                Outbox.emit(connection, TABLE, "learning.path_step_activated", "path", pathId.toString(),
                        rows.getObject("learner_id", UUID.class), null, data);
            }
        }
    }

    /** Contrat proposé, accepté, refusé ou retiré, avec ses conditions. */
    void contract(Connection connection, UUID pathId, int number, String type) throws SQLException {
        try (var query = connection.prepareStatement("""
                select c.status, c.proposed_by, c.start_level, c.target_level, c.start_date, c.target_date,
                       c.weekly_minutes, c.required_minutes, c.difficulty, c.decided_by, p.learner_id
                from learning.contracts c join learning.paths p on p.id = c.path_id
                where c.path_id = ? and c.number = ?
                """)) {
            query.setObject(1, pathId);
            query.setInt(2, number);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return;
                ObjectNode data = json.createObjectNode().put("pathId", pathId.toString()).put("number", number)
                        .put("status", rows.getString("status")).put("proposedBy", rows.getString("proposed_by"))
                        .put("startLevel", rows.getString("start_level")).put("targetLevel", rows.getString("target_level"))
                        .put("startDate", text(rows.getObject("start_date", LocalDate.class)))
                        .put("targetDate", text(rows.getObject("target_date", LocalDate.class)))
                        .put("weeklyMinutes", rows.getInt("weekly_minutes"))
                        .put("requiredMinutes", rows.getInt("required_minutes"))
                        .put("difficulty", rows.getString("difficulty"))
                        .put("decidedBy", text(rows.getObject("decided_by", UUID.class)));
                Outbox.emit(connection, TABLE, type, "contract", pathId + ":" + number,
                        rows.getObject("learner_id", UUID.class), null, data);
            }
        }
    }

    /** Cours ajouté ou retiré par le professeur. */
    void addition(Connection connection, UUID additionId, String type) throws SQLException {
        try (var query = connection.prepareStatement("""
                select a.path_id, a.source_version_id, a.source_level_code, a.module_id, a.activity_id, a.placement,
                       a.minutes, s.level_code, p.learner_id
                from learning.path_additions a
                join learning.path_steps s on s.id = a.step_id
                join learning.paths p on p.id = a.path_id
                where a.id = ?
                """)) {
            query.setObject(1, additionId);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return;
                UUID pathId = rows.getObject("path_id", UUID.class);
                ObjectNode data = json.createObjectNode().put("pathId", pathId.toString())
                        .put("additionId", additionId.toString()).put("stepLevel", rows.getString("level_code"))
                        .put("sourceVersionId", rows.getObject("source_version_id", UUID.class).toString())
                        .put("sourceLevelCode", rows.getString("source_level_code"))
                        .put("moduleId", rows.getString("module_id")).put("activityId", rows.getString("activity_id"))
                        .put("placement", rows.getString("placement")).put("minutes", rows.getInt("minutes"));
                Outbox.emit(connection, TABLE, type, "path", pathId.toString(), rows.getObject("learner_id", UUID.class),
                        null, data);
            }
        }
    }

    private static String text(Object value) {
        return value == null ? null : value.toString();
    }
}
