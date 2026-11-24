package org.linguacap.tracking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;
import org.linguacap.common.Outbox;
import org.linguacap.common.ServiceClient;

/**
 * Projection des événements dans Suivi (DEV-074, DEV-075, DEV-079, DEV-080) : lecture par lots depuis chaque
 * producteur avec point de reprise, déduplication par identifiant, synthèses par objectif, puis contrôle des alertes.
 * Un lot en échec n'avance pas le point de reprise : il est relu au passage suivant.
 * Le point de reprise est le curseur (transaction, séquence) du producteur (EVO-042) : un événement validé en retard
 * par une transaction concurrente n'est plus jamais sauté. Les synthèses ne dépendent pas de l'ordre d'arrivée : un
 * événement relu, arrivé en retard ou rattrapé ne remplace ni un état, ni un planning, ni un résultat plus récents.
 */
@ApplicationScoped
class TrackingSync {
    private static final Logger LOG = Logger.getLogger(TrackingSync.class);
    /** Acteur technique des appels internes du traitement périodique. */
    static final UUID SYSTEM = new UUID(0, 1);
    private static final int MAX_PAGES = 20;

    @Inject AgroalDataSource dataSource;
    @Inject ServiceClient services;
    @Inject ObjectMapper json;

    @ConfigProperty(name = "lingua.services.identity") String identityUrl;
    @ConfigProperty(name = "lingua.services.learning") String learningUrl;
    @ConfigProperty(name = "lingua.services.assessment") String assessmentUrl;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    public record Summary(String kind, int imported, int opened, int updated, int closed, Map<String, String> errors) {}

    /** Importe les nouveaux événements de chaque producteur, puis met à jour les alertes. Rejouable sans effet double. */
    synchronized Summary sync() {
        UUID run = startRun("sync");
        int imported = 0;
        Map<String, String> errors = new LinkedHashMap<>();
        for (var producer : List.of(
                new Producer("identity", identityUrl, "/v1/internal/identity/events"),
                new Producer("learning", learningUrl, "/v1/internal/learning/events"),
                new Producer("assessment", assessmentUrl, "/v1/internal/assessments/events"))) {
            try {
                imported += pull(producer);
            } catch (RuntimeException error) {
                String message = error instanceof WebApplicationException web ? "HTTP " + web.getResponse().getStatus()
                        : error.getClass().getSimpleName();
                errors.put(producer.name(), message);
                recordFailure(producer.name(), message);
                LOG.warnf("Tracking import from %s failed: %s", producer.name(), message);
            }
        }
        int[] alerts = evaluateAlerts(OffsetDateTime.now());
        finishRun(run, imported, alerts, errors);
        return new Summary("sync", imported, alerts[0], alerts[1], alerts[2], errors);
    }

    /** Reconstruit les synthèses à partir du journal des événements, dans l'ordre de leur survenue. */
    synchronized Summary rebuild() {
        UUID run = startRun("rebuild");
        int replayed = transaction("rebuild projections", connection -> {
            for (String sql : List.of("delete from tracking.activity", "delete from tracking.sessions", "delete from tracking.goals",
                    "update tracking.encouragements set resumed_at = null")) {
                try (var statement = connection.prepareStatement(sql)) {
                    statement.executeUpdate();
                }
            }
            int count = 0;
            try (var query = connection.prepareStatement("""
                    select event_id, producer, type, occurred_at, learner_id, data::text as data from tracking.event_log
                    order by occurred_at, producer, sequence
                    """); var rows = query.executeQuery()) {
                List<Event> events = new ArrayList<>();
                while (rows.next()) {
                    events.add(new Event(rows.getObject("event_id", UUID.class), rows.getString("type"),
                            rows.getObject("occurred_at", OffsetDateTime.class), rows.getObject("learner_id", UUID.class),
                            parse(rows.getString("data"))));
                }
                for (Event event : events) {
                    apply(connection, event);
                    count++;
                }
            }
            return count;
        });
        int[] alerts = evaluateAlerts(OffsetDateTime.now());
        finishRun(run, replayed, alerts, Map.of());
        return new Summary("rebuild", replayed, alerts[0], alerts[1], alerts[2], Map.of());
    }

    private record Producer(String name, String base, String path) {}

    record Event(UUID id, String type, OffsetDateTime occurredAt, UUID learnerId, JsonNode data) {}

    private int pull(Producer producer) {
        int imported = 0;
        for (int page = 0; page < MAX_PAGES; page++) {
            Outbox.Cursor from = checkpoint(producer.name());
            JsonNode batch = services.request(producer.base(), pagePath(producer.path(), from), "GET", SYSTEM, null);
            JsonNode items = batch.path("items");
            if (!items.isArray() || items.isEmpty()) {
                clearFailure(producer.name());
                return imported;
            }
            Outbox.Cursor next = nextCursor(from, batch);
            imported += transaction("import events", connection -> {
                int fresh = 0;
                for (JsonNode item : items) {
                    JsonNode envelope = item.path("event");
                    Event event = new Event(UUID.fromString(envelope.path("eventId").asText()), envelope.path("type").asText(),
                            OffsetDateTime.parse(envelope.path("occurredAt").asText()),
                            envelope.hasNonNull("learnerId") ? UUID.fromString(envelope.path("learnerId").asText()) : null,
                            envelope.path("data"));
                    try (var insert = connection.prepareStatement("""
                            insert into tracking.event_log (event_id, producer, sequence, type, occurred_at, learner_id,
                                subject_kind, subject_id, data)
                            values (?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb) on conflict do nothing
                            """)) {
                        insert.setObject(1, event.id());
                        insert.setString(2, producer.name());
                        insert.setLong(3, item.path("sequence").asLong());
                        insert.setString(4, event.type());
                        insert.setObject(5, event.occurredAt());
                        insert.setObject(6, event.learnerId());
                        insert.setString(7, envelope.path("subject").path("kind").asText());
                        insert.setString(8, envelope.path("subject").path("id").asText());
                        insert.setString(9, event.data().toString());
                        if (insert.executeUpdate() == 0) continue;
                    }
                    apply(connection, event);
                    fresh++;
                }
                // Le point de reprise n'avance que dans l'ordre (transaction, séquence), jamais en arrière.
                try (var update = connection.prepareStatement("""
                        update tracking.checkpoints
                        set last_sequence = case when (last_tx, last_sequence) < (?, ?) then ? else last_sequence end,
                            last_tx = greatest(last_tx, ?), updated_at = now(), failures = 0, last_error = null
                        where producer = ?
                        """)) {
                    update.setLong(1, next.tx());
                    update.setLong(2, next.sequence());
                    update.setLong(3, next.sequence());
                    update.setLong(4, next.tx());
                    update.setString(5, producer.name());
                    update.executeUpdate();
                }
                return fresh;
            });
        }
        return imported;
    }

    /**
     * Lot suivant d'un producteur : le curseur fait foi ; after accompagne la demande pour un producteur pas encore
     * passé au curseur (déploiement dans le désordre), qui répond alors avec l'ancienne lecture.
     */
    static String pagePath(String path, Outbox.Cursor from) {
        return path + "?cursor=" + from + "&after=" + from.sequence() + "&limit=100";
    }

    /**
     * Point de reprise après un lot : le curseur renvoyé par le producteur. Sans curseur (ancienne lecture), seule la
     * séquence avance, comme avant. Le point de reprise ne recule jamais.
     */
    static Outbox.Cursor nextCursor(Outbox.Cursor from, JsonNode batch) {
        JsonNode cursor = batch.path("cursor");
        Outbox.Cursor next = cursor.isTextual() ? Outbox.Cursor.parse(cursor.asText())
                : new Outbox.Cursor(from.tx(), Math.max(from.sequence(), batch.path("last").asLong()));
        return next.max(from);
    }

    /**
     * État de l'objectif porté par un événement. plan_validated porte goalStatus depuis EVO-042 (une replanification
     * garde un objectif en attente de correction, validé ou à consolider) ; un événement plus ancien vaut « active ».
     * Pour les autres événements d'état, null garde l'état connu.
     */
    static String goalStatusOf(String type, JsonNode data) {
        String status = data.path("goalStatus").asText(null);
        if (status != null && status.isBlank()) status = null;
        return status == null && "learning.plan_validated".equals(type) ? "active" : status;
    }

    /** Applique un événement aux synthèses ; un événement arrivé tard ne remplace pas un état plus récent. */
    void apply(Connection connection, Event event) throws SQLException {
        JsonNode data = event.data();
        if (event.type().startsWith("identity.")) return;
        UUID enrollmentId = data.hasNonNull("enrollmentId") ? UUID.fromString(data.path("enrollmentId").asText()) : null;
        if (enrollmentId == null || event.learnerId() == null) return;
        execute(connection, "insert into tracking.goals (enrollment_id, learner_id) values (?, ?) on conflict do nothing",
                enrollmentId, event.learnerId());
        switch (event.type()) {
            case "learning.goal_set" -> {
                // Un goal_set rattrapé après un état plus récent ne ramène ni l'état ni la date cible en arrière.
                try (var update = connection.prepareStatement("""
                        update tracking.goals set level_code = ?, start_level = ?, template = ?,
                            target_date = case when status_at is null or status_at <= ? then ? else target_date end,
                            initial_target_date = ?, assigned_at = ?, accompanied = coalesce(?::boolean, accompanied),
                            goal_status = case when status_at is null or status_at <= ? then 'preparing' else goal_status end,
                            status_at = greatest(status_at, ?), updated_at = now()
                        where enrollment_id = ?
                        """)) {
                    update.setString(1, data.path("levelCode").asText(null));
                    update.setString(2, data.path("startLevel").asText(null));
                    update.setString(3, data.path("template").asText(null));
                    update.setObject(4, event.occurredAt());
                    update.setObject(5, date(data.path("targetDate")));
                    update.setObject(6, date(data.path("initialTargetDate")));
                    update.setObject(7, instant(data.path("assignedAt")));
                    update.setObject(8, null);
                    update.setObject(9, event.occurredAt());
                    update.setObject(10, event.occurredAt());
                    update.setObject(11, enrollmentId);
                    update.executeUpdate();
                }
            }
            case "learning.plan_validated" -> {
                int revision = data.path("revision").asInt();
                // Révision plus ancienne que celle déjà projetée (événement rattrapé ou arrivé en retard) : ses séances
                // sont gardées comme remplacées, sans rouvrir ni remplacer celles du planning en vigueur.
                boolean current;
                try (var advance = connection.prepareStatement("""
                        update tracking.goals set plan_revision = ?
                        where enrollment_id = ? and (plan_revision is null or plan_revision <= ?)
                        """)) {
                    advance.setInt(1, revision);
                    advance.setObject(2, enrollmentId);
                    advance.setInt(3, revision);
                    current = advance.executeUpdate() > 0;
                }
                List<UUID> ids = new ArrayList<>();
                for (JsonNode session : data.path("sessions")) {
                    UUID sessionId = UUID.fromString(session.path("id").asText());
                    ids.add(sessionId);
                    try (var upsert = connection.prepareStatement(current ? """
                            insert into tracking.sessions (session_id, enrollment_id, learner_id, revision, due_at, completed_at, milestone)
                            values (?, ?, ?, ?, ?, ?, ?)
                            on conflict (session_id) do update set due_at = excluded.due_at, revision = excluded.revision,
                                milestone = excluded.milestone, superseded = false, superseded_at = null,
                                completed_at = coalesce(tracking.sessions.completed_at, excluded.completed_at)
                            """ : """
                            insert into tracking.sessions (session_id, enrollment_id, learner_id, revision, due_at, completed_at,
                                milestone, superseded, superseded_at)
                            values (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            on conflict (session_id) do nothing
                            """)) {
                        OffsetDateTime completedAt = instant(session.path("completedAt"));
                        upsert.setObject(1, sessionId);
                        upsert.setObject(2, enrollmentId);
                        upsert.setObject(3, event.learnerId());
                        upsert.setInt(4, revision);
                        upsert.setObject(5, instant(session.path("dueAt")));
                        upsert.setObject(6, completedAt);
                        upsert.setString(7, session.path("milestone").asText(null));
                        if (!current) {
                            upsert.setBoolean(8, completedAt == null);
                            upsert.setObject(9, completedAt == null ? event.occurredAt() : null);
                        }
                        upsert.executeUpdate();
                    }
                }
                if (current) {
                    try (var supersede = connection.prepareStatement("""
                            update tracking.sessions set superseded = true, superseded_at = coalesce(superseded_at, ?)
                            where enrollment_id = ? and completed_at is null and revision < ? and not (session_id = any(?))
                            """)) {
                        supersede.setObject(1, event.occurredAt());
                        supersede.setObject(2, enrollmentId);
                        supersede.setInt(3, revision);
                        supersede.setArray(4, connection.createArrayOf("uuid", ids.toArray()));
                        supersede.executeUpdate();
                    }
                }
                status(connection, enrollmentId, goalStatusOf(event.type(), data), event.occurredAt(),
                        date(data.path("targetDate")), null);
            }
            case "learning.goal_paused", "learning.goal_resumed", "learning.goal_status_changed" ->
                    status(connection, enrollmentId, goalStatusOf(event.type(), data), event.occurredAt(),
                            date(data.path("targetDate")), date(data.path("resumeDate")));
            case "learning.activity_progressed" -> {
                try (var insert = connection.prepareStatement("""
                        insert into tracking.activity (enrollment_id, learner_id, at, event_id) values (?, ?, ?, ?)
                        on conflict do nothing
                        """)) {
                    insert.setObject(1, enrollmentId);
                    insert.setObject(2, event.learnerId());
                    insert.setObject(3, event.occurredAt());
                    insert.setObject(4, event.id());
                    insert.executeUpdate();
                }
                List<OffsetDateTime> times = new ArrayList<>();
                try (var query = connection.prepareStatement("select at from tracking.activity where enrollment_id = ?")) {
                    query.setObject(1, enrollmentId);
                    try (var rows = query.executeQuery()) {
                        while (rows.next()) times.add(rows.getObject(1, OffsetDateTime.class));
                    }
                }
                try (var update = connection.prepareStatement("""
                        update tracking.goals set last_activity_at = greatest(last_activity_at, ?), practice_seconds = ?,
                            updated_at = now()
                        where enrollment_id = ?
                        """)) {
                    update.setObject(1, event.occurredAt());
                    update.setLong(2, RiskRules.practiceSeconds(times));
                    update.setObject(3, enrollmentId);
                    update.executeUpdate();
                }
                // Première activité qui suit un encouragement : la reprise est enregistrée (DEV-082). La plus ancienne
                // activité postérieure à l'envoi l'emporte, quel que soit l'ordre d'arrivée des événements.
                try (var resumed = connection.prepareStatement("""
                        update tracking.encouragements set resumed_at = ?
                        where learner_id = ? and sent_at <= ? and (resumed_at is null or resumed_at > ?)
                        """)) {
                    resumed.setObject(1, event.occurredAt());
                    resumed.setObject(2, event.learnerId());
                    resumed.setObject(3, event.occurredAt());
                    resumed.setObject(4, event.occurredAt());
                    resumed.executeUpdate();
                }
            }
            case "learning.session_completed" -> {
                UUID sessionId = UUID.fromString(data.path("sessionId").asText());
                try (var upsert = connection.prepareStatement("""
                        insert into tracking.sessions (session_id, enrollment_id, learner_id, revision, due_at, completed_at)
                        values (?, ?, ?, 0, ?, ?)
                        on conflict (session_id) do update set completed_at = excluded.completed_at
                        """)) {
                    upsert.setObject(1, sessionId);
                    upsert.setObject(2, enrollmentId);
                    upsert.setObject(3, event.learnerId());
                    upsert.setObject(4, instant(data.path("dueAt")));
                    upsert.setObject(5, instant(data.path("completedAt")));
                    upsert.executeUpdate();
                }
                try (var update = connection.prepareStatement("""
                        update tracking.goals set sessions_completed = sessions_completed + 1,
                            sessions_on_time = sessions_on_time + ?, updated_at = now()
                        where enrollment_id = ?
                        """)) {
                    update.setInt(1, data.path("onTime").asBoolean() ? 1 : 0);
                    update.setObject(2, enrollmentId);
                    update.executeUpdate();
                }
            }
            case "assessment.attempt_submitted" -> {
                // Une remise rattrapée après sa correction n'est plus en attente.
                if (data.path("needsGrading").asBoolean()) {
                    execute(connection, """
                            update tracking.goals set pending_grading = pending_grading + 1, updated_at = now()
                            where enrollment_id = ? and not exists (
                                select 1 from tracking.event_log graded
                                where graded.producer = 'assessment' and graded.type = 'assessment.attempt_graded'
                                  and graded.subject_id = ?)
                            """, enrollmentId, data.path("attemptId").asText());
                }
            }
            case "assessment.attempt_graded" -> {
                // Le résultat d'une tentative rattrapée ne remplace pas celui d'une tentative plus récente.
                try (var update = connection.prepareStatement("""
                        update tracking.goals set pending_grading = greatest(0, pending_grading - ?),
                            results = case when coalesce((results -> ? ->> 'number')::int, 0) <= ?
                                           then jsonb_set(results, array[?], ?::jsonb) else results end,
                            updated_at = now()
                        where enrollment_id = ?
                        """)) {
                    update.setInt(1, data.path("wasPending").asBoolean() ? 1 : 0);
                    update.setString(2, data.path("kind").asText());
                    update.setInt(3, data.path("number").asInt());
                    update.setString(4, data.path("kind").asText());
                    update.setString(5, json.createObjectNode().put("attemptId", data.path("attemptId").asText())
                            .put("number", data.path("number").asInt()).put("percent", data.path("percent").asInt())
                            .put("decision", data.path("decision").asText()).put("onTime", data.path("onTime").asBoolean())
                            .put("submittedAt", data.path("submittedAt").asText(null)).put("gradedAt", data.path("gradedAt").asText(null))
                            .set("scores", data.path("scores")).toString());
                    update.setObject(6, enrollmentId);
                    update.executeUpdate();
                }
            }
            default -> { }
        }
    }

    /**
     * État le plus récent selon l'horloge de l'objectif ; goalStatus null garde l'état connu. paused_at retient l'entrée
     * en pause : l'annonce d'une reprise prévue (l'objectif reste en pause) ne la déplace pas, la reprise l'efface.
     */
    private void status(Connection connection, UUID enrollmentId, String goalStatus, OffsetDateTime at, LocalDate target,
                        LocalDate resume) throws SQLException {
        try (var update = connection.prepareStatement("""
                update tracking.goals set goal_status = coalesce(?, goal_status), status_at = ?, target_date = coalesce(?, target_date),
                    resume_date = ?,
                    paused_at = case when coalesce(?, goal_status) <> 'paused' then null
                                     when goal_status = 'paused' then coalesce(paused_at, ?) else ? end,
                    updated_at = now()
                where enrollment_id = ? and (status_at is null or status_at <= ?)
                """)) {
            update.setString(1, goalStatus);
            update.setObject(2, at);
            update.setObject(3, target);
            update.setObject(4, resume);
            update.setString(5, goalStatus);
            update.setObject(6, at);
            update.setObject(7, at);
            update.setObject(8, enrollmentId);
            update.setObject(9, at);
            update.executeUpdate();
        }
    }

    /**
     * Une alerte par objectif (DEV-079, DEV-080) : ouverte quand le risque apparaît, mise à jour ensuite, suspendue
     * pendant une pause et close quand le risque disparaît. Deux contrôles successifs ne créent pas de doublon.
     */
    int[] evaluateAlerts(OffsetDateTime now) {
        return transaction("evaluate alerts", connection -> {
            int opened = 0;
            int updated = 0;
            int closed = 0;
            Map<UUID, String[]> goals = new LinkedHashMap<>();
            try (var query = connection.prepareStatement("select enrollment_id, learner_id, goal_status from tracking.goals");
                 var rows = query.executeQuery()) {
                while (rows.next()) {
                    goals.put(rows.getObject(1, UUID.class), new String[] {rows.getString(2), rows.getString(3)});
                }
            }
            for (Map.Entry<UUID, String[]> goal : goals.entrySet()) {
                UUID enrollmentId = goal.getKey();
                List<RiskRules.Slot> slots = new ArrayList<>();
                try (var query = connection.prepareStatement("""
                        select session_id, due_at, completed_at, milestone from tracking.sessions
                        where enrollment_id = ? and not superseded
                        """)) {
                    query.setObject(1, enrollmentId);
                    try (var rows = query.executeQuery()) {
                        while (rows.next()) {
                            slots.add(new RiskRules.Slot(rows.getString(1), rows.getObject(2, OffsetDateTime.class),
                                    rows.getObject(3, OffsetDateTime.class), rows.getString(4)));
                        }
                    }
                }
                String goalStatus = goal.getValue()[1];
                RiskRules.Risk risk = RiskRules.evaluate(slots, goalStatus, now);
                UUID alertId = null;
                String alertStatus = null;
                try (var query = connection.prepareStatement(
                        "select id, status from tracking.alerts where enrollment_id = ? and status <> 'closed' for update")) {
                    query.setObject(1, enrollmentId);
                    try (var rows = query.executeQuery()) {
                        if (rows.next()) {
                            alertId = rows.getObject(1, UUID.class);
                            alertStatus = rows.getString(2);
                        }
                    }
                }
                if ("paused".equals(goalStatus)) {
                    if ("open".equals(alertStatus)) {
                        execute(connection, "update tracking.alerts set status = 'suspended', updated_at = now() where id = ? and ?::uuid is not null",
                                alertId, alertId);
                        updated++;
                    }
                    continue;
                }
                if (risk.atRisk()) {
                    try (var statement = connection.prepareStatement(alertId == null ? """
                            insert into tracking.alerts (enrollment_id, learner_id, reason, late_sessions, next_milestone,
                                next_milestone_due_at, midterm_overdue, id)
                            values (?, ?, ?, ?, ?, ?, ?, coalesce(?, gen_random_uuid()))
                            """ : """
                            update tracking.alerts set enrollment_id = ?, learner_id = ?, reason = ?, late_sessions = ?,
                                next_milestone = ?, next_milestone_due_at = ?, midterm_overdue = ?, status = 'open', updated_at = now()
                            where id = ?
                            """)) {
                        statement.setObject(1, enrollmentId);
                        statement.setObject(2, UUID.fromString(goal.getValue()[0]));
                        statement.setString(3, risk.reason());
                        statement.setInt(4, risk.lateSessions());
                        statement.setString(5, risk.nextMilestone());
                        statement.setObject(6, risk.nextMilestoneDueAt());
                        statement.setBoolean(7, risk.midtermOverdue());
                        statement.setObject(8, alertId);
                        statement.executeUpdate();
                    }
                    if (alertId == null) opened++;
                    else updated++;
                } else if (alertId != null) {
                    execute(connection, "update tracking.alerts set status = 'closed', closed_at = now(), updated_at = now() where id = ? and ?::uuid is not null",
                            alertId, alertId);
                    closed++;
                }
            }
            return new int[] {opened, updated, closed};
        });
    }

    private Outbox.Cursor checkpoint(String producer) {
        return transaction("read checkpoint", connection -> {
            try (var query = connection.prepareStatement(
                    "select last_tx, last_sequence from tracking.checkpoints where producer = ?")) {
                query.setString(1, producer);
                try (var rows = query.executeQuery()) {
                    return rows.next() ? new Outbox.Cursor(rows.getLong(1), rows.getLong(2)) : Outbox.Cursor.START;
                }
            }
        });
    }

    private void recordFailure(String producer, String message) {
        transaction("record failure", connection -> {
            try (var update = connection.prepareStatement("""
                    update tracking.checkpoints set failures = failures + 1, last_error = ?, updated_at = now() where producer = ?
                    """)) {
                update.setString(1, message);
                update.setString(2, producer);
                update.executeUpdate();
            }
            return null;
        });
    }

    private void clearFailure(String producer) {
        transaction("clear failure", connection -> {
            try (var update = connection.prepareStatement(
                    "update tracking.checkpoints set failures = 0, last_error = null where producer = ? and failures > 0")) {
                update.setString(1, producer);
                update.executeUpdate();
            }
            return null;
        });
    }

    private UUID startRun(String kind) {
        return transaction("start run", connection -> {
            try (var insert = connection.prepareStatement("insert into tracking.job_runs (kind) values (?) returning id")) {
                insert.setString(1, kind);
                try (var rows = insert.executeQuery()) {
                    rows.next();
                    return rows.getObject(1, UUID.class);
                }
            }
        });
    }

    private void finishRun(UUID run, int imported, int[] alerts, Map<String, String> errors) {
        transaction("finish run", connection -> {
            try (var update = connection.prepareStatement("""
                    update tracking.job_runs set finished_at = now(), imported = ?, alerts_opened = ?, alerts_updated = ?,
                        alerts_closed = ?, status = ?, error = ?
                    where id = ?
                    """)) {
                update.setInt(1, imported);
                update.setInt(2, alerts[0]);
                update.setInt(3, alerts[1]);
                update.setInt(4, alerts[2]);
                update.setString(5, errors.isEmpty() ? "succeeded" : "failed");
                update.setString(6, errors.isEmpty() ? null : errors.toString());
                update.setObject(7, run);
                update.executeUpdate();
            }
            return null;
        });
    }

    private static void execute(Connection connection, String sql, Object first, Object second) throws SQLException {
        try (var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, first);
            statement.setObject(2, second);
            statement.executeUpdate();
        }
    }

    private JsonNode parse(String value) throws SQLException {
        try {
            return json.readTree(value);
        } catch (com.fasterxml.jackson.core.JsonProcessingException error) {
            throw new SQLException("Événement illisible", "XX000", error);
        }
    }

    private static OffsetDateTime instant(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode() || node.asText().isEmpty() ? null : OffsetDateTime.parse(node.asText());
    }

    private static LocalDate date(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode() || node.asText().isEmpty() ? null : LocalDate.parse(node.asText());
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
            LOG.errorf("Tracking database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
            throw HttpError.unavailable("Le suivi est temporairement indisponible.");
        }
    }
}
