package org.linguacap.tracking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

@Path("/v1/tracking")
@Produces(MediaType.APPLICATION_JSON)
public class TrackingResource {
    private static final Logger LOG = Logger.getLogger(TrackingResource.class);

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "lingua.services.identity")
    String identityUrl;

    @ConfigProperty(name = "lingua.services.learning")
    String learningUrl;

    @GET
    @Path("/overview")
    public ObjectNode overview(@QueryParam("learnerId") String requestedLearnerId) {
        UUID callerId = actor.id();
        String role = identities.current(callerId).path("role").asText();
        if (!isEducator(role)) {
            throw HttpError.forbidden("Le suivi des élèves est réservé aux comptes habilités.");
        }
        JsonNode roster = requestedLearnerId == null
                ? services.request(identityUrl, "/v1/learners", "GET", callerId, null)
                : mapper.createArrayNode().add(identities.learner(callerId, readLearnerId(requestedLearnerId)));
        if (!roster.isArray()) {
            throw HttpError.unavailable("La liste des élèves est indisponible.");
        }
        List<String> learnerIds = new ArrayList<>();
        for (JsonNode profile : roster) {
            String learnerId = profile.path("id").asText();
            if (learnerId.isBlank()) {
                throw HttpError.unavailable("La liste des élèves est incomplète.");
            }
            learnerIds.add(readLearnerId(learnerId).toString());
        }
        // Accueil et parcours en direct (EVO-039) ; sans réponse d'Apprentissage, la vue reste servie (learning null)
        // et les lectures suivantes d'Apprentissage ne sont pas tentées.
        Map<String, JsonNode> live = learningStates(callerId, learnerIds);
        ArrayNode entries = mapper.createArrayNode();
        int goals = 0;
        int withResults = 0;
        for (JsonNode profile : roster) {
            String learnerId = profile.path("id").asText();
            JsonNode progress = live == null ? null
                    : optional(() -> services.request(learningUrl, "/v1/learning/progress?learnerId=" + learnerId,
                            "GET", callerId, null), "progress");
            JsonNode results = progress == null ? mapper.createArrayNode() : progress.path("results");
            if (!results.isArray()) {
                throw HttpError.unavailable("Les résultats d’un élève sont indisponibles.");
            }
            ObjectNode entry = entries.addObject();
            entry.put("learnerId", learnerId);
            entry.set("profile", profile);
            entry.set("progress", progress == null ? NullNode.getInstance() : progress);
            entry.set("results", results);
            UUID id = UUID.fromString(learnerId);
            entry.set("tracking", summary(id, false));
            entry.set("learning", LearningStates.of(live, id.toString()));
            if (progress != null && progress.path("goal").isObject()) {
                goals++;
            }
            if (!results.isEmpty()) {
                withResults++;
            }
        }
        ObjectNode overview = mapper.createObjectNode();
        overview.set("learners", entries);
        overview.set("freshness", freshness());
        overview.put("learnerCount", entries.size());
        overview.put("goalsCount", goals);
        overview.put("learnersWithResults", withResults);
        return overview;
    }

    @GET
    @Path("/messages")
    public List<Message> messages(@QueryParam("learnerId") String requestedLearnerId) {
        UUID callerId = actor.id();
        String role = identities.current(callerId).path("role").asText();
        UUID learnerId;
        if ("learner".equals(role)) {
            if (requestedLearnerId != null && !callerId.equals(readLearnerId(requestedLearnerId))) {
                throw HttpError.forbidden("Ces messages appartiennent à un autre élève.");
            }
            learnerId = callerId;
        } else if (isEducator(role)) {
            learnerId = readLearnerId(requestedLearnerId);
            identities.learner(callerId, learnerId);
        } else {
            throw HttpError.forbidden("Ce compte ne peut pas consulter les messages.");
        }
        String sql = """
                SELECT id, learner_id, author_id, text, sent_at, alert_id, resumed_at
                FROM tracking.encouragements
                WHERE learner_id = ?
                ORDER BY sent_at DESC, id DESC
                """;
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, learnerId);
            try (var rows = statement.executeQuery()) {
                List<Message> messages = new ArrayList<>();
                while (rows.next()) {
                    messages.add(readMessage(rows));
                }
                return messages;
            }
        } catch (SQLException ignored) {
            throw HttpError.unavailable("Les encouragements de cet élève sont indisponibles.");
        }
    }

    @POST
    @Path("/messages")
    @Consumes(MediaType.APPLICATION_JSON)
    public Message sendMessage(MessageRequest request) {
        UUID callerId = actor.id();
        if (!"teacher".equals(identities.current(callerId).path("role").asText())) {
            throw HttpError.forbidden("Seul le professeur référent peut envoyer un encouragement.");
        }
        if (request == null || request.text() == null) {
            throw HttpError.badRequest("Écris un encouragement avant de l’envoyer.");
        }
        UUID learnerId = readLearnerId(request.learnerId());
        identities.learner(callerId, learnerId);
        UUID alertId = request.alertId() == null ? null : readLearnerId(request.alertId());
        String text = request.text().strip();
        if (text.isEmpty() || text.codePointCount(0, text.length()) > 500
                || text.codePoints().anyMatch(c -> Character.isISOControl(c) && c != '\n' && c != '\t')) {
            throw HttpError.badRequest("L’encouragement doit contenir entre 1 et 500 caractères de texte.");
        }
        String sql = """
                INSERT INTO tracking.encouragements (learner_id, author_id, text, alert_id, enrollment_id)
                VALUES (?, ?, ?, ?, (SELECT enrollment_id FROM tracking.alerts WHERE id = ?))
                RETURNING id, learner_id, author_id, text, sent_at, alert_id, resumed_at
                """;
        try (var connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                if (alertId != null) {
                    try (var alert = connection.prepareStatement("""
                            UPDATE tracking.alerts SET encouraged_at = coalesce(encouraged_at, now()), updated_at = now()
                            WHERE id = ? AND learner_id = ? AND status <> 'closed'
                            """)) {
                        alert.setObject(1, alertId);
                        alert.setObject(2, learnerId);
                        if (alert.executeUpdate() == 0) throw HttpError.notFound("Cette alerte est close ou ne concerne pas cet élève.");
                    }
                }
                try (var statement = connection.prepareStatement(sql)) {
                    statement.setObject(1, learnerId);
                    statement.setObject(2, callerId);
                    statement.setString(3, text);
                    statement.setObject(4, alertId);
                    statement.setObject(5, alertId);
                    try (var rows = statement.executeQuery()) {
                        if (rows.next()) {
                            Message message = readMessage(rows);
                            connection.commit();
                            return message;
                        }
                    }
                }
                connection.rollback();
            } catch (SQLException | RuntimeException error) {
                connection.rollback();
                throw error;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException ignored) {
            throw HttpError.unavailable("L’encouragement n’a pas pu être envoyé.");
        }
        throw HttpError.unavailable("L’encouragement n’a pas pu être envoyé.");
    }

    /**
     * Fiche élève du professeur référent ou de l’administration (DEV-033) : profil, parcours et séances,
     * objectif, résultats et encouragements, lus auprès des services propriétaires. L’accueil et le parcours
     * (learning) sont lus en direct ; sans réponse d’Apprentissage, la fiche reste servie avec la synthèse du Suivi.
     */
    @GET
    @Path("/learners/{id}")
    public ObjectNode learner(@PathParam("id") String requestedLearnerId) {
        UUID callerId = actor.id();
        if (!isEducator(identities.current(callerId).path("role").asText())) {
            throw HttpError.forbidden("La fiche élève est réservée au professeur référent et à l’administration.");
        }
        UUID learnerId = readLearnerId(requestedLearnerId);
        JsonNode profile = identities.learner(callerId, learnerId);
        Map<String, JsonNode> live = learningStates(callerId, List.of(learnerId.toString()));
        JsonNode enrollment = live == null ? null : optional(() -> services.request(learningUrl,
                "/v1/learning/enrollment?learnerId=" + learnerId, "GET", callerId, null), "enrollment");
        JsonNode progress = live == null ? null : optional(() -> services.request(learningUrl,
                "/v1/learning/progress?learnerId=" + learnerId, "GET", callerId, null), "progress");
        ObjectNode sheet = mapper.createObjectNode();
        sheet.set("profile", profile);
        sheet.set("enrollment", enrollment == null ? NullNode.getInstance() : enrollment);
        sheet.set("goal", progress == null ? NullNode.getInstance() : progress.path("goal"));
        sheet.set("results", progress == null ? mapper.createArrayNode() : progress.path("results"));
        sheet.put("completedCount", progress == null ? 0 : progress.path("completedCount").asInt());
        sheet.set("messages", mapper.valueToTree(messagesFor(learnerId)));
        sheet.set("tracking", summary(learnerId, true));
        sheet.set("learning", LearningStates.of(live, learnerId.toString()));
        sheet.set("freshness", freshness());
        return sheet;
    }

    /**
     * Accueil et parcours des élèves, lus en un appel groupé par lot de 200 (EVO-039). Le droit d’accès est celui
     * de l’appelant : Apprentissage le recoupe avec sa liste d’élèves chez Identités. Null si Apprentissage ne
     * répond pas : la vue reste servie, sans données en direct.
     */
    private Map<String, JsonNode> learningStates(UUID callerId, List<String> learnerIds) {
        if (learnerIds.isEmpty()) return Map.of();
        try {
            List<JsonNode> responses = new ArrayList<>();
            for (List<String> batch : LearningStates.batches(learnerIds)) {
                responses.add(services.request(learningUrl, "/v1/internal/learning/learner-states", "POST", callerId,
                        Map.of("learnerIds", batch)));
            }
            Map<String, JsonNode> states = LearningStates.index(responses);
            if (states == null) LOG.warn("Learner states returned an unexpected body");
            return states;
        } catch (WebApplicationException error) {
            LOG.warnf("Learner states unavailable (HTTP %d): tracking views served without live learning data",
                    error.getResponse().getStatus());
            return null;
        }
    }

    /** Lecture facultative chez Apprentissage : une indisponibilité (503) donne null, un refus reste une erreur. */
    private static JsonNode optional(Supplier<JsonNode> read, String what) {
        try {
            return read.get();
        } catch (WebApplicationException error) {
            if (error.getResponse().getStatus() != 503) throw error;
            LOG.warnf("Learning %s unavailable for a tracking view", what);
            return null;
        }
    }

    /**
     * Synthèse de Suivi pour un élève (DEV-076 à DEV-079) : objectif en cours, retard, prochaine échéance, temps de
     * pratique, dernière activité, corrections en attente, résultats par compétence et alerte active. La fiche
     * complète ajoute les séances du calendrier validé, l'historique des alertes et les résultats d'examen par niveau.
     * Les copies en attente portent sur tous les niveaux de l'élève ; un objectif en pause n'accumule pas de retard.
     */
    private ObjectNode summary(UUID learnerId, boolean detailed) {
        ObjectNode summary = mapper.createObjectNode();
        OffsetDateTime now = OffsetDateTime.now();
        try (var connection = dataSource.getConnection()) {
            UUID enrollmentId = null;
            String goalStatus = null;
            OffsetDateTime pausedAt = null;
            LocalDate resumeDate = null;
            try (var query = connection.prepareStatement("""
                    select enrollment_id, level_code, goal_status, coalesce(paused_at, status_at) as paused_at, target_date, initial_target_date, resume_date,
                           last_activity_at, practice_seconds, sessions_completed, sessions_on_time, results::text as results
                    from tracking.goals where learner_id = ? order by assigned_at desc nulls last, updated_at desc limit 1
                    """)) {
                query.setObject(1, learnerId);
                try (var rows = query.executeQuery()) {
                    if (rows.next()) {
                        enrollmentId = rows.getObject("enrollment_id", UUID.class);
                        goalStatus = rows.getString("goal_status");
                        pausedAt = rows.getObject("paused_at", OffsetDateTime.class);
                        resumeDate = rows.getObject("resume_date", LocalDate.class);
                        summary.put("enrollmentId", enrollmentId.toString());
                        summary.put("levelCode", rows.getString("level_code"));
                        summary.put("goalStatus", goalStatus);
                        summary.put("targetDate", text(rows.getObject("target_date")));
                        summary.put("initialTargetDate", text(rows.getObject("initial_target_date")));
                        summary.put("resumeDate", text(resumeDate));
                        summary.put("lastActivityAt", text(rows.getObject("last_activity_at", OffsetDateTime.class)));
                        summary.put("practiceMinutes", rows.getLong("practice_seconds") / 60);
                        summary.put("sessionsCompleted", rows.getInt("sessions_completed"));
                        summary.put("sessionsOnTime", rows.getInt("sessions_on_time"));
                        summary.set("results", mapper.readTree(rows.getString("results")));
                    }
                }
            }
            if (enrollmentId == null) return summary;
            // Copies en attente sur tous les niveaux de l'élève : l'ouverture du niveau suivant à la remise de l'examen
            // blanc ne fait pas disparaître la copie du niveau précédent. Résultats d'examen gardés par niveau.
            ObjectNode resultsByLevel = mapper.createObjectNode();
            try (var query = connection.prepareStatement("""
                    select level_code, pending_grading, results::text as results from tracking.goals
                    where learner_id = ? order by assigned_at nulls first, updated_at
                    """)) {
                query.setObject(1, learnerId);
                try (var rows = query.executeQuery()) {
                    int pending = 0;
                    while (rows.next()) {
                        pending += rows.getInt("pending_grading");
                        JsonNode results = mapper.readTree(rows.getString("results"));
                        if (rows.getString("level_code") != null && !results.isEmpty()) {
                            resultsByLevel.set(rows.getString("level_code"), results);
                        }
                    }
                    summary.put("pendingGrading", pending);
                }
            }
            if (detailed) summary.set("resultsByLevel", resultsByLevel);
            // Objectif en pause : seules les séances échues avant la pause comptent en retard, et la prochaine échéance
            // est la reprise prévue (la pause garde les séances du planning jusqu'à la reprise).
            OffsetDateTime cutoff = SummaryRules.lateCutoff(goalStatus, pausedAt, now);
            try (var query = connection.prepareStatement("""
                    select count(*) filter (where completed_at is null and due_at < ?) as late,
                           min(due_at) filter (where completed_at is null and due_at >= ?) as next_due
                    from tracking.sessions where enrollment_id = ? and not superseded
                    """)) {
                query.setObject(1, cutoff);
                query.setObject(2, now);
                query.setObject(3, enrollmentId);
                try (var rows = query.executeQuery()) {
                    rows.next();
                    summary.put("lateSessions", rows.getInt("late"));
                    summary.put("nextDueAt", text(SummaryRules.nextDue(goalStatus,
                            rows.getObject("next_due", OffsetDateTime.class), resumeDate)));
                }
            }
            ArrayNode alerts = summary.putArray("alerts");
            try (var query = connection.prepareStatement("""
                    select id, status, reason, late_sessions, next_milestone, next_milestone_due_at, midterm_overdue,
                           opened_at, updated_at, closed_at, encouraged_at
                    from tracking.alerts where learner_id = ? order by opened_at desc limit ?
                    """)) {
                query.setObject(1, learnerId);
                query.setInt(2, detailed ? 20 : 1);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        ObjectNode alert = alerts.addObject();
                        alert.put("id", rows.getObject("id", UUID.class).toString());
                        alert.put("status", rows.getString("status"));
                        alert.put("reason", rows.getString("reason"));
                        alert.put("lateSessions", rows.getInt("late_sessions"));
                        alert.put("nextMilestone", rows.getString("next_milestone"));
                        alert.put("nextMilestoneDueAt", text(rows.getObject("next_milestone_due_at", OffsetDateTime.class)));
                        alert.put("midtermOverdue", rows.getBoolean("midterm_overdue"));
                        alert.put("openedAt", text(rows.getObject("opened_at", OffsetDateTime.class)));
                        alert.put("closedAt", text(rows.getObject("closed_at", OffsetDateTime.class)));
                        alert.put("encouragedAt", text(rows.getObject("encouraged_at", OffsetDateTime.class)));
                    }
                }
            }
            JsonNode latest = alerts.isEmpty() ? null : alerts.get(0);
            summary.set("alert", latest != null && !"closed".equals(latest.path("status").asText()) ? latest : null);
            if (!detailed) summary.remove("alerts");
            if (detailed) {
                ArrayNode sessions = summary.putArray("sessions");
                try (var query = connection.prepareStatement("""
                        select session_id, due_at, completed_at, milestone from tracking.sessions
                        where enrollment_id = ? and not superseded order by due_at
                        """)) {
                    query.setObject(1, enrollmentId);
                    try (var rows = query.executeQuery()) {
                        while (rows.next()) {
                            OffsetDateTime due = rows.getObject("due_at", OffsetDateTime.class);
                            OffsetDateTime done = rows.getObject("completed_at", OffsetDateTime.class);
                            sessions.addObject().put("sessionId", rows.getObject("session_id", UUID.class).toString())
                                    .put("dueAt", text(due)).put("completedAt", text(done))
                                    .put("milestone", rows.getString("milestone"))
                                    .put("late", SummaryRules.late(due, done, cutoff));
                        }
                    }
                }
            }
            return summary;
        } catch (SQLException | com.fasterxml.jackson.core.JsonProcessingException error) {
            throw HttpError.unavailable("Le suivi de cet élève est temporairement indisponible.");
        }
    }

    /** Fraîcheur des synthèses : fin du dernier traitement réussi. */
    private ObjectNode freshness() {
        ObjectNode freshness = mapper.createObjectNode();
        try (var connection = dataSource.getConnection();
             var query = connection.prepareStatement("""
                     select max(finished_at) filter (where status = 'succeeded') as synced,
                            (array_agg(status order by started_at desc))[1] as last_status
                     from tracking.job_runs
                     """); var rows = query.executeQuery()) {
            rows.next();
            freshness.put("syncedAt", text(rows.getObject("synced", OffsetDateTime.class)));
            freshness.put("lastStatus", rows.getString("last_status"));
        } catch (SQLException error) {
            freshness.putNull("syncedAt");
        }
        return freshness;
    }

    private static String text(Object value) {
        return value == null ? null : value.toString();
    }

    private List<Message> messagesFor(UUID learnerId) {
        String sql = """
                SELECT id, learner_id, author_id, text, sent_at, alert_id, resumed_at
                FROM tracking.encouragements
                WHERE learner_id = ?
                ORDER BY sent_at DESC, id DESC
                """;
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, learnerId);
            try (var rows = statement.executeQuery()) {
                List<Message> messages = new ArrayList<>();
                while (rows.next()) {
                    messages.add(readMessage(rows));
                }
                return messages;
            }
        } catch (SQLException ignored) {
            throw HttpError.unavailable("Les encouragements de cet élève sont indisponibles.");
        }
    }

    private static Message readMessage(ResultSet row) throws SQLException {
        return new Message(row.getObject("id", UUID.class).toString(),
                row.getObject("learner_id", UUID.class).toString(),
                row.getObject("author_id", UUID.class).toString(), row.getString("text"),
                row.getObject("sent_at", OffsetDateTime.class).toString(),
                row.getObject("alert_id") == null ? null : row.getObject("alert_id", UUID.class).toString(),
                row.getObject("resumed_at") == null ? null : row.getObject("resumed_at", OffsetDateTime.class).toString());
    }

    private static boolean isEducator(String role) {
        return "teacher".equals(role) || "admin".equals(role);
    }

    private static UUID readLearnerId(String value) {
        if (value != null) {
            try {
                UUID id = UUID.fromString(value);
                if (id.toString().equalsIgnoreCase(value)) {
                    return id;
                }
            } catch (IllegalArgumentException ignored) {
                // Both invalid shapes use the same response.
            }
        }
        throw HttpError.badRequest("Sélectionne un élève avec un identifiant valide.");
    }

    /** alertId : alerte à laquelle répond l'encouragement, facultative. */
    public record MessageRequest(String learnerId, String text, String alertId) {}

    /** resumedAt : première activité de l'élève après cet encouragement (DEV-082). */
    public record Message(String id, String learnerId, String authorId, String text, String sentAt, String alertId,
                          String resumedAt) {}
}
