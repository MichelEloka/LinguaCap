package org.linguacap.learning;

import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;

/**
 * Lien avec Évaluations (DEV-062, DEV-066, DEV-070), en routes internes : contexte d'un parcours pour ouvrir une
 * tentative, puis remise et résultat qui terminent le créneau du calendrier et mettent à jour l'état de l'objectif.
 */
@Path("/v1/internal/learning/enrollments/{id}")
@Produces(MediaType.APPLICATION_JSON)
public class ExamLinkResource {
    private static final Logger LOG = Logger.getLogger(ExamLinkResource.class);

    @Inject Actor actor;
    @Inject LearnerAccess access;
    @Inject GoalStore goals;
    @Inject CourseStore courses;
    @Inject AgroalDataSource dataSource;
    @Inject LearningEvents events;

    /** Parcours lisible par l'appelant, avec l'échéance des créneaux du bilan et de l'examen blanc. */
    @GET
    public ExamContext context(@PathParam("id") UUID enrollmentId) {
        UUID callerId = actor.id();
        GoalStore.EnrollmentRow row = goals.byId(enrollmentId);
        if (row == null) throw HttpError.notFound("Parcours introuvable.");
        if (!callerId.equals(row.learnerId())) access.resolve(callerId, row.learnerId().toString());
        return new ExamContext(row.id(), row.learnerId(), row.trackVersionId(), row.levelCode(), row.status(),
                row.goalStatus(), due(enrollmentId, Planner.MIDTERM), due(enrollmentId, Planner.FINAL));
    }

    /**
     * Remise ou correction d'une tentative. La remise termine le créneau du calendrier ; l'examen blanc fait passer
     * l'objectif en attente de correction, puis validé ou à consolider. Rejouer l'événement ne change rien de plus.
     */
    @POST
    @Path("/exam-events")
    @Consumes(MediaType.APPLICATION_JSON)
    public ExamContext event(@PathParam("id") UUID enrollmentId, ExamEvent event) {
        actor.id();
        if (event == null || event.attemptId() == null || !("midterm".equals(event.kind()) || "final".equals(event.kind()))
                || !("submitted".equals(event.event()) || "graded".equals(event.event()))) {
            throw HttpError.badRequest("Événement d’évaluation invalide.");
        }
        GoalStore.EnrollmentRow row = goals.byId(enrollmentId);
        if (row == null) throw HttpError.notFound("Parcours introuvable.");
        String activityId = "midterm".equals(event.kind()) ? Planner.MIDTERM : Planner.FINAL;
        if ("submitted".equals(event.event())) {
            UUID sessionId = sessionOf(enrollmentId, activityId);
            if (sessionId != null) {
                courses.record(sessionId, enrollmentId, activityId, row.learnerId(), null, true, event.attemptId());
            }
        }
        if ("final".equals(event.kind())) {
            String status = switch (event.decision() == null ? "" : event.decision()) {
                case "validated" -> "validated";
                case "to_consolidate" -> "to_consolidate";
                default -> "awaiting_grading";
            };
            updateGoal(enrollmentId, status);
        }
        return context(enrollmentId);
    }

    private OffsetDateTime due(UUID enrollmentId, String activityId) {
        try (Connection connection = dataSource.getConnection();
             var query = connection.prepareStatement("""
                     select s.due_at from learning.sessions s
                     join learning.session_activities sa on sa.session_id = s.id
                     where s.enrollment_id = ? and sa.activity_id = ? and s.superseded_at is null
                     order by s.position limit 1
                     """)) {
            query.setObject(1, enrollmentId);
            query.setString(2, activityId);
            try (var rows = query.executeQuery()) {
                return rows.next() ? rows.getObject(1, OffsetDateTime.class) : null;
            }
        } catch (SQLException error) {
            throw failure("read exam slot", error);
        }
    }

    private UUID sessionOf(UUID enrollmentId, String activityId) {
        try (Connection connection = dataSource.getConnection();
             var query = connection.prepareStatement("""
                     select s.id from learning.sessions s
                     join learning.session_activities sa on sa.session_id = s.id
                     where s.enrollment_id = ? and sa.activity_id = ? and s.superseded_at is null
                     order by s.position limit 1
                     """)) {
            query.setObject(1, enrollmentId);
            query.setString(2, activityId);
            try (var rows = query.executeQuery()) {
                return rows.next() ? rows.getObject(1, UUID.class) : null;
            }
        } catch (SQLException error) {
            throw failure("read exam session", error);
        }
    }

    /** Un objectif en pause garde son état ; un objectif validé ne revient pas en arrière. */
    private void updateGoal(UUID enrollmentId, String status) {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try (var update = connection.prepareStatement("""
                     update learning.enrollments set goal_status = ?
                     where id = ? and goal_status not in ('paused', 'validated') and goal_status <> ?
                     """)) {
                update.setString(1, status);
                update.setObject(2, enrollmentId);
                update.setString(3, status);
                if (update.executeUpdate() > 0) events.goalStatus(connection, enrollmentId, "learning.goal_status_changed", status);
                connection.commit();
            } catch (SQLException | RuntimeException error) {
                connection.rollback();
                throw error;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException error) {
            throw failure("update goal status", error);
        }
    }

    private static RuntimeException failure(String operation, SQLException error) {
        LOG.errorf("Learning database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        return HttpError.unavailable("Le parcours est temporairement indisponible.");
    }

    public record ExamEvent(String kind, UUID attemptId, String event, String decision) {}

    public record ExamContext(UUID id, UUID learnerId, UUID trackVersionId, String levelCode, String status,
                              String goalStatus, OffsetDateTime midtermDueAt, OffsetDateTime finalDueAt) {}
}
