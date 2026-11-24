package org.linguacap.tracking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.linguacap.common.Outbox;

/**
 * Lecture au curseur et projections de Suivi contre une vraie base PostgreSQL (EVO-042), migrations appliquées.
 * Activé par LINGUACAP_TEST_DATABASE_URL (URL JDBC avec utilisateur et mot de passe), par exemple une base jetable :
 * jdbc:postgresql://localhost:5432/lingua?user=postgres&amp;password=x. Les projections sont testées dans une transaction
 * annulée ; la lecture concurrente utilise une copie temporaire de learning.outbox_events, supprimée à la fin.
 */
@EnabledIfEnvironmentVariable(named = "LINGUACAP_TEST_DATABASE_URL", matches = "jdbc:postgresql:.+")
class TrackingDatabaseTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final OffsetDateTime T0 = OffsetDateTime.parse("2026-12-01T09:00:00Z");

    private static Connection open() throws SQLException {
        return DriverManager.getConnection(System.getenv("LINGUACAP_TEST_DATABASE_URL"));
    }

    @FunctionalInterface
    private interface Work {
        void run(Connection connection, TrackingSync sync) throws Exception;
    }

    /** Projection dans une transaction annulée : la base n'est pas modifiée. */
    private static void rolledBack(Work work) throws Exception {
        try (Connection connection = open()) {
            connection.setAutoCommit(false);
            try {
                TrackingSync sync = new TrackingSync();
                sync.json = JSON;
                work.run(connection, sync);
            } finally {
                connection.rollback();
            }
        }
    }

    /** Import d'un événement comme pull() : journal, puis synthèses. */
    private static void receive(Connection connection, TrackingSync sync, String producer, String type, String subject,
                                OffsetDateTime at, UUID learnerId, ObjectNode data) throws SQLException {
        UUID id = UUID.randomUUID();
        try (var insert = connection.prepareStatement("""
                insert into tracking.event_log (event_id, producer, sequence, type, occurred_at, learner_id, subject_kind,
                    subject_id, data)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb)
                """)) {
            insert.setObject(1, id);
            insert.setString(2, producer);
            insert.setLong(3, -ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE));
            insert.setString(4, type);
            insert.setObject(5, at);
            insert.setObject(6, learnerId);
            insert.setString(7, producer.equals("assessment") ? "attempt" : "goal");
            insert.setString(8, subject);
            insert.setString(9, data.toString());
            insert.executeUpdate();
        }
        sync.apply(connection, new TrackingSync.Event(id, type, at, learnerId, data));
    }

    private static String text(Connection connection, String sql, Object parameter) throws SQLException {
        try (var query = connection.prepareStatement(sql)) {
            query.setObject(1, parameter);
            try (var rows = query.executeQuery()) {
                return rows.next() ? rows.getString(1) : null;
            }
        }
    }

    private static OffsetDateTime instant(Connection connection, String sql, Object parameter) throws SQLException {
        try (var query = connection.prepareStatement(sql)) {
            query.setObject(1, parameter);
            try (var rows = query.executeQuery()) {
                return rows.next() ? rows.getObject(1, OffsetDateTime.class) : null;
            }
        }
    }

    private static ObjectNode plan(UUID enrollmentId, int revision, String goalStatus, String... sessions) {
        ObjectNode data = JSON.createObjectNode().put("enrollmentId", enrollmentId.toString()).put("revision", revision)
                .put("targetDate", "2027-03-01");
        if (goalStatus != null) data.put("goalStatus", goalStatus);
        var list = data.putArray("sessions");
        for (int index = 0; index < sessions.length; index++) {
            list.addObject().put("id", sessions[index]).put("dueAt", T0.plusDays(index + 1).toString())
                    .putNull("completedAt").putNull("milestone");
        }
        return data;
    }

    private static ObjectNode goal(UUID enrollmentId, String goalStatus, String resumeDate) {
        return JSON.createObjectNode().put("enrollmentId", enrollmentId.toString()).put("goalStatus", goalStatus)
                .put("resumeDate", resumeDate).put("targetDate", "2027-03-01");
    }

    @Test
    void laRepriseAprèsEncouragementGardeLaPremièreActivitéQuelQueSoitLOrdre() throws Exception {
        rolledBack((connection, sync) -> {
            UUID learner = UUID.randomUUID();
            UUID enrollment = UUID.randomUUID();
            UUID encouragement = UUID.randomUUID();
            try (var insert = connection.prepareStatement("""
                    insert into tracking.encouragements (id, learner_id, author_id, text, sent_at) values (?, ?, ?, 'On reprend ?', ?)
                    """)) {
                insert.setObject(1, encouragement);
                insert.setObject(2, learner);
                insert.setObject(3, UUID.randomUUID());
                insert.setObject(4, T0);
                insert.executeUpdate();
            }
            ObjectNode activity = JSON.createObjectNode().put("enrollmentId", enrollment.toString())
                    .put("sessionId", UUID.randomUUID().toString()).put("activityId", "lecon").put("completed", true);
            // Deux activités après l'envoi, importées dans l'ordre inverse, et une activité antérieure à l'envoi.
            receive(connection, sync, "learning", "learning.activity_progressed", "s", T0.plusHours(2), learner, activity);
            receive(connection, sync, "learning", "learning.activity_progressed", "s", T0.plusHours(1), learner, activity);
            receive(connection, sync, "learning", "learning.activity_progressed", "s", T0.minusHours(1), learner, activity);
            assertEquals(T0.plusHours(1).toInstant(), instant(connection,
                    "select resumed_at from tracking.encouragements where id = ?", encouragement).toInstant(),
                    "La reprise est la plus ancienne activité postérieure à l'envoi");
            assertEquals(T0.plusHours(2).toInstant(), instant(connection,
                    "select last_activity_at from tracking.goals where enrollment_id = ?", enrollment).toInstant());
        });
    }

    @Test
    void laPauseEtLaRepriseSontVisiblesMêmeDansLeDésordre() throws Exception {
        rolledBack((connection, sync) -> {
            UUID learner = UUID.randomUUID();
            UUID enrollment = UUID.randomUUID();
            String goalSql = "select goal_status || ' ' || coalesce(resume_date::text, '-') from tracking.goals where enrollment_id = ?";
            receive(connection, sync, "learning", "learning.goal_resumed", "g", T0.plusMinutes(3), learner,
                    goal(enrollment, "paused", "2026-12-14"));
            receive(connection, sync, "learning", "learning.goal_paused", "g", T0.plusMinutes(2), learner,
                    goal(enrollment, "paused", null));
            receive(connection, sync, "learning", "learning.plan_validated", "g", T0.plusMinutes(1), learner,
                    plan(enrollment, 1, "active", UUID.randomUUID().toString()));
            assertEquals("paused 2026-12-14", text(connection, goalSql, enrollment),
                    "La validation antérieure ne remplace ni la pause ni la date de reprise");
            receive(connection, sync, "learning", "learning.plan_validated", "g", T0.plusMinutes(4), learner,
                    plan(enrollment, 2, "active", UUID.randomUUID().toString()));
            assertEquals("active -", text(connection, goalSql, enrollment), "Le planning de reprise validé reprend l'objectif");
        });
    }

    @Test
    void uneReplanificationGardeLAttenteDeCorrection() throws Exception {
        rolledBack((connection, sync) -> {
            UUID learner = UUID.randomUUID();
            UUID enrollment = UUID.randomUUID();
            receive(connection, sync, "learning", "learning.goal_status_changed", "g", T0.plusMinutes(1), learner,
                    goal(enrollment, "awaiting_grading", null));
            receive(connection, sync, "learning", "learning.plan_validated", "g", T0.plusMinutes(2), learner,
                    plan(enrollment, 3, "awaiting_grading", UUID.randomUUID().toString()));
            assertEquals("awaiting_grading", text(connection,
                    "select goal_status from tracking.goals where enrollment_id = ?", enrollment));
            receive(connection, sync, "learning", "learning.plan_validated", "g", T0.plusMinutes(3), learner,
                    plan(enrollment, 4, null, UUID.randomUUID().toString()));
            assertEquals("active", text(connection, "select goal_status from tracking.goals where enrollment_id = ?", enrollment),
                    "Un planning validé sans goalStatus (avant EVO-042) vaut « active »");
        });
    }

    @Test
    void unPlanningRattrapéNeRouvrePasLesSéancesRemplacées() throws Exception {
        rolledBack((connection, sync) -> {
            UUID learner = UUID.randomUUID();
            UUID enrollment = UUID.randomUUID();
            String current = UUID.randomUUID().toString();
            String older = UUID.randomUUID().toString();
            String kept = UUID.randomUUID().toString();
            receive(connection, sync, "learning", "learning.plan_validated", "g", T0.plusMinutes(5), learner,
                    plan(enrollment, 3, "active", kept, current));
            receive(connection, sync, "learning", "learning.plan_validated", "g", T0.plusMinutes(4), learner,
                    plan(enrollment, 2, "active", kept, older));
            String sessions = "select string_agg(revision || ':' || superseded, ',' order by due_at, revision) from tracking.sessions where enrollment_id = ?";
            assertEquals("3:false,2:true,3:false", text(connection, sessions, enrollment));
            assertEquals("3", text(connection, "select plan_revision from tracking.goals where enrollment_id = ?", enrollment));
        });
    }

    @Test
    void uneRemiseEtUnRésultatRattrapésNeFaussentNiLAttenteNiLeDernierRésultat() throws Exception {
        rolledBack((connection, sync) -> {
            UUID learner = UUID.randomUUID();
            UUID enrollment = UUID.randomUUID();
            String first = UUID.randomUUID().toString();
            String second = UUID.randomUUID().toString();
            ObjectNode graded = JSON.createObjectNode().put("enrollmentId", enrollment.toString()).put("kind", "final")
                    .put("wasPending", true).put("percent", 80).put("decision", "validated");
            ObjectNode submitted = JSON.createObjectNode().put("enrollmentId", enrollment.toString()).put("kind", "final")
                    .put("needsGrading", true);
            // Correction de la tentative 2 importée avant sa remise, puis résultat rattrapé de la tentative 1.
            receive(connection, sync, "assessment", "assessment.attempt_graded", second, T0.plusDays(2), learner,
                    graded.deepCopy().put("attemptId", second).put("number", 2));
            receive(connection, sync, "assessment", "assessment.attempt_submitted", second, T0.plusDays(1), learner,
                    submitted.deepCopy().put("attemptId", second).put("number", 2));
            receive(connection, sync, "assessment", "assessment.attempt_graded", first, T0, learner,
                    graded.deepCopy().put("attemptId", first).put("number", 1).put("decision", "to_consolidate"));
            assertEquals("0", text(connection, "select pending_grading from tracking.goals where enrollment_id = ?", enrollment));
            assertEquals("2 validated", text(connection,
                    "select (results->'final'->>'number') || ' ' || (results->'final'->>'decision') from tracking.goals where enrollment_id = ?",
                    enrollment));
            UUID third = UUID.randomUUID();
            receive(connection, sync, "assessment", "assessment.attempt_submitted", third.toString(), T0.plusDays(3), learner,
                    submitted.deepCopy().put("attemptId", third.toString()).put("number", 3));
            assertEquals("1", text(connection, "select pending_grading from tracking.goals where enrollment_id = ?", enrollment));
        });
    }

    @Test
    void unObjectifFixéRattrapéNeRamènePasLaDateCibleEnArrière() throws Exception {
        rolledBack((connection, sync) -> {
            UUID learner = UUID.randomUUID();
            UUID enrollment = UUID.randomUUID();
            ObjectNode later = plan(enrollment, 1, "active");
            later.put("targetDate", "2027-05-01");
            receive(connection, sync, "learning", "learning.plan_validated", "g", T0.plusMinutes(2), learner, later);
            receive(connection, sync, "learning", "learning.goal_set", "g", T0.plusMinutes(1), learner,
                    JSON.createObjectNode().put("enrollmentId", enrollment.toString()).put("levelCode", "a1")
                            .put("targetDate", "2027-03-01").put("initialTargetDate", "2027-03-01"));
            assertEquals("active 2027-05-01 a1 2027-03-01", text(connection,
                    "select goal_status || ' ' || target_date || ' ' || level_code || ' ' || initial_target_date from tracking.goals where enrollment_id = ?",
                    enrollment));
        });
    }

    /**
     * Deux transactions concurrentes : la lente prend sa séquence puis valide après la rapide. La lecture au curseur ne
     * sert l'événement rapide qu'une fois la lente terminée (ou avant elle s'il appartient à une transaction plus
     * ancienne), et ne saute jamais l'événement lent.
     */
    @Test
    void unÉvénementValidéEnRetardNEstJamaisSauté() throws Exception {
        String table = "public.outbox_probe_" + Long.toHexString(ThreadLocalRandom.current().nextLong() & Long.MAX_VALUE);
        try (Connection admin = open()) {
            try (var create = admin.createStatement()) {
                create.execute("create table " + table + " (like learning.outbox_events including all)");
            }
            try (Connection slow = open(); Connection fast = open(); Connection reader = open()) {
                slow.setAutoCommit(false);
                insert(slow, table, "lente");
                insert(fast, table, "rapide");
                ObjectNode during = Outbox.read(reader, JSON, table, "learning", Outbox.Cursor.START, 100);
                assertEquals(0, during.path("items").size(), "L'événement rapide attend la fin de la transaction lente");
                assertEquals("0:0", during.path("cursor").asText());
                ObjectNode legacy = Outbox.read(reader, JSON, table, "learning", 0, 100);
                assertEquals(List.of("rapide"), subjects(legacy), "L'ancienne lecture servait la rapide seule…");
                slow.commit();
                ObjectNode after = Outbox.read(reader, JSON, table, "learning", Outbox.Cursor.START, 100);
                assertEquals(List.of("lente", "rapide"), subjects(after));
                assertEquals(0, Outbox.read(reader, JSON, table, "learning", legacy.path("last").asLong(), 100)
                        .path("items").size(), "… puis sautait la lente pour toujours");
                Outbox.Cursor cursor = Outbox.Cursor.parse(after.path("cursor").asText());
                assertEquals(0, Outbox.read(reader, JSON, table, "learning", cursor, 100).path("items").size());

                // Transaction rapide plus ancienne (identifiant pris avant la lente) : servie tout de suite, et la lente,
                // de numéro plus petit, passe après elle dans l'ordre (tx, séquence).
                fast.setAutoCommit(false);
                try (var first = fast.createStatement()) {
                    first.execute("select pg_current_xact_id()");
                }
                insert(slow, table, "lente-2");
                insert(fast, table, "rapide-2");
                fast.commit();
                ObjectNode older = Outbox.read(reader, JSON, table, "learning", cursor, 100);
                assertEquals(List.of("rapide-2"), subjects(older));
                slow.commit();
                Outbox.Cursor next = Outbox.Cursor.parse(older.path("cursor").asText());
                ObjectNode late = Outbox.read(reader, JSON, table, "learning", next, 100);
                assertEquals(List.of("lente-2"), subjects(late), "La lente, validée après, n'est pas sautée");
                assertTrue(late.path("items").get(0).path("sequence").asLong() < next.sequence(),
                        "… bien que son numéro soit plus petit que celui du point de reprise");
            } finally {
                try (var drop = admin.createStatement()) {
                    drop.execute("drop table if exists " + table);
                }
            }
        }
    }

    private static void insert(Connection connection, String table, String subject) throws SQLException {
        Outbox.emit(connection, table, "learning.goal_status_changed", "goal", subject, UUID.randomUUID(), null,
                JSON.createObjectNode().put("probe", subject).put("date", LocalDate.of(2026, 12, 1).toString()));
    }

    private static List<String> subjects(JsonNode page) {
        List<String> subjects = new ArrayList<>();
        for (JsonNode item : page.path("items")) subjects.add(item.path("event").path("subject").path("id").asText());
        return subjects;
    }
}
