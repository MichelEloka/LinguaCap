package org.linguacap.assessment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Array;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;
import org.linguacap.common.Outbox;

/**
 * Remises de missions (EVO-044) : brouillon unique par mission, remise horodatée vers le professeur référent ou le
 * correcteur désigné, retour « validée » ou « à reprendre », reprise numérotée. Les événements
 * assessment.mission_submitted et assessment.mission_reviewed sont écrits dans la même transaction.
 */
@ApplicationScoped
class MissionStore {
    private static final Logger LOG = Logger.getLogger(MissionStore.class);

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    record Mission(UUID id, UUID learnerId, UUID trackVersionId, String levelCode, String moduleId, String activityId,
                   String lessonId, UUID sessionId, String sessionActivityId, int number, String status,
                   JsonNode definition, String text, List<Integer> checklist, UUID recordingId, String recordingMime,
                   UUID reviewerId, String reviewerKind, String submitKey, OffsetDateTime submittedAt, String decision,
                   String comment, UUID reviewedBy, OffsetDateTime reviewedAt, OffsetDateTime createdAt,
                   OffsetDateTime updatedAt) {}

    /** Mission du catalogue à ouvrir : niveau, module, leçon de consigne et définition figée. */
    record Draft(String levelCode, String moduleId, String lessonId, ObjectNode definition) {}

    /** created : faux quand une remise existante est renvoyée. */
    record Opened(Mission mission, boolean created) {}

    Mission find(UUID id) {
        return read("read mission", connection -> {
            Mission mission = find(connection, id, false);
            if (mission == null) throw HttpError.notFound("Mission introuvable.");
            return mission;
        });
    }

    /** Missions d'un élève, les plus récentes d'abord. */
    List<Mission> forLearner(UUID learnerId) {
        return read("list missions", connection -> {
            try (var query = connection.prepareStatement("""
                    select * from assessment.mission_submissions where learner_id = ? order by created_at desc, number desc
                    limit 200
                    """)) {
                query.setObject(1, learnerId);
                return list(query.executeQuery());
            }
        });
    }

    /** Missions remises en attente d'un retour, les plus anciennes d'abord. */
    List<Mission> awaitingReview() {
        return read("list mission queue", connection -> {
            try (var query = connection.prepareStatement("""
                    select * from assessment.mission_submissions where status = 'submitted' order by submitted_at limit 200
                    """)) {
                return list(query.executeQuery());
            }
        });
    }

    /**
     * Ouverture : sans reprise, la dernière remise de ce contexte (séance et activité de séance, ou bibliothèque),
     * sinon le brouillon en cours (rattaché à ce contexte), sinon un nouveau brouillon prérempli avec le dernier texte.
     * Avec reprise (après « à reprendre » ou un envoi sans destinataire) : nouveau brouillon numéroté à la suite.
     */
    Opened open(UUID learnerId, UUID trackVersionId, String activityId, UUID sessionId, String sessionActivityId,
                boolean restart, Draft draft) {
        return transaction("open mission", connection -> {
            try (var lock = connection.prepareStatement("select pg_advisory_xact_lock(hashtextextended(?, 0))")) {
                lock.setString(1, "mission:" + learnerId + ":" + trackVersionId + ":" + activityId);
                lock.executeQuery().close();
            }
            List<Mission> missions;
            try (var query = connection.prepareStatement("""
                    select * from assessment.mission_submissions
                    where learner_id = ? and track_version_id = ? and activity_id = ? order by number desc
                    """)) {
                query.setObject(1, learnerId);
                query.setObject(2, trackVersionId);
                query.setString(3, activityId);
                missions = list(query.executeQuery());
            }
            Mission current = missions.stream().filter(mission -> MissionRules.DRAFT.equals(mission.status())).findFirst()
                    .orElse(null);
            Mission inContext = missions.stream().filter(mission -> Objects.equals(sessionId, mission.sessionId())
                    && Objects.equals(sessionActivityId, mission.sessionActivityId())).findFirst().orElse(null);
            int next = missions.isEmpty() ? 1 : missions.get(0).number() + 1;
            if (!restart) {
                if (inContext != null) return new Opened(inContext, false);
                if (current != null) return new Opened(rehome(connection, current, sessionId, sessionActivityId), false);
                return new Opened(insert(connection, learnerId, trackVersionId, activityId, sessionId, sessionActivityId,
                        next, missions.isEmpty() ? "" : missions.get(0).text(), draft), true);
            }
            if (current != null) return new Opened(rehome(connection, current, sessionId, sessionActivityId), false);
            Mission latest = inContext != null ? inContext : missions.isEmpty() ? null : missions.get(0);
            if (latest != null) {
                String refusal = MissionRules.restartRefusal(latest.status(), latest.decision());
                if (refusal != null) throw HttpError.conflict(refusal);
            }
            return new Opened(insert(connection, learnerId, trackVersionId, activityId, sessionId, sessionActivityId,
                    next, latest == null ? "" : latest.text(), draft), true);
        });
    }

    /** Brouillon : texte et points cochés (null : inchangé). */
    Mission save(UUID id, UUID learnerId, String text, List<Integer> checklist) {
        return transaction("save mission", connection -> {
            draft(connection, id, learnerId);
            try (var update = connection.prepareStatement("""
                    update assessment.mission_submissions
                    set text = coalesce(?::text, text), checklist = coalesce(?::integer[], checklist), updated_at = now()
                    where id = ?
                    """)) {
                update.setString(1, text);
                update.setArray(2, checklist == null ? null : connection.createArrayOf("integer", checklist.toArray()));
                update.setObject(3, id);
                update.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    /** Enregistrement contrôlé par Médias, rattaché au brouillon (remplace le précédent). */
    Mission attachRecording(UUID id, UUID learnerId, UUID productionId, String mimeType) {
        return transaction("attach mission recording", connection -> {
            draft(connection, id, learnerId);
            try (var update = connection.prepareStatement("""
                    update assessment.mission_submissions set recording_id = ?, recording_mime = ?, updated_at = now()
                    where id = ?
                    """)) {
                update.setObject(1, productionId);
                update.setString(2, mimeType);
                update.setObject(3, id);
                update.executeUpdate();
            }
            return find(connection, id, false);
        });
    }

    /** Remise : refusée tant qu'il manque quelque chose (409) ; une mission déjà remise est renvoyée telle quelle. */
    Mission submit(UUID id, UUID learnerId, String key, MissionRules.Recipient recipient) {
        return transaction("submit mission", connection -> {
            Mission mission = owned(connection, id, learnerId);
            if (!MissionRules.DRAFT.equals(mission.status())) return mission;
            String refusal = MissionRules.submitRefusal(mission.definition(), mission.text(), mission.checklist(),
                    mission.recordingId());
            if (refusal != null) throw HttpError.conflict(refusal);
            try (var update = connection.prepareStatement("""
                    update assessment.mission_submissions
                    set status = ?, reviewer_id = ?, reviewer_kind = ?, submit_key = ?, submitted_at = now(), updated_at = now()
                    where id = ?
                    """)) {
                update.setString(1, recipient.status());
                update.setObject(2, recipient.reviewerId());
                update.setString(3, recipient.kind());
                update.setString(4, key);
                update.setObject(5, id);
                update.executeUpdate();
            }
            Mission submitted = find(connection, id, false);
            emit(connection, "assessment.mission_submitted", submitted);
            return submitted;
        });
    }

    /** Retour du correcteur : « validée » ou « à reprendre », avec son commentaire. */
    Mission review(UUID id, UUID reviewerId, String decision, String comment) {
        return transaction("review mission", connection -> {
            Mission mission = find(connection, id, true);
            if (mission == null) throw HttpError.notFound("Mission introuvable.");
            String refusal = MissionRules.reviewRefusal(mission.status());
            if (refusal != null) throw HttpError.conflict(refusal);
            try (var update = connection.prepareStatement("""
                    update assessment.mission_submissions
                    set status = 'reviewed', decision = ?, comment = ?, reviewed_by = ?, reviewed_at = now(), updated_at = now()
                    where id = ?
                    """)) {
                update.setString(1, decision);
                update.setString(2, comment == null || comment.isBlank() ? null : comment);
                update.setObject(3, reviewerId);
                update.setObject(4, id);
                update.executeUpdate();
            }
            Mission reviewed = find(connection, id, false);
            emit(connection, "assessment.mission_reviewed", reviewed);
            return reviewed;
        });
    }

    /** Remise ou retour : identifiants, état et dates, sans le texte ni l'enregistrement (aucun enrollmentId). */
    private void emit(Connection connection, String type, Mission mission) throws SQLException {
        ObjectNode data = json.createObjectNode().put("missionId", mission.id().toString())
                .put("trackVersionId", mission.trackVersionId().toString()).put("levelCode", mission.levelCode())
                .put("moduleId", mission.moduleId()).put("activityId", mission.activityId()).put("number", mission.number())
                .put("status", mission.status()).put("reviewerKind", mission.reviewerKind())
                .put("sessionId", mission.sessionId() == null ? null : mission.sessionId().toString())
                .put("sessionActivityId", mission.sessionActivityId())
                .put("submittedAt", text(mission.submittedAt()));
        if (mission.reviewedAt() != null) data.put("decision", mission.decision()).put("reviewedAt", text(mission.reviewedAt()));
        Outbox.emit(connection, "assessment.outbox_events", type, "mission", mission.id().toString(), mission.learnerId(),
                null, data);
    }

    private Mission insert(Connection connection, UUID learnerId, UUID trackVersionId, String activityId, UUID sessionId,
                           String sessionActivityId, int number, String text, Draft draft) throws SQLException {
        UUID id = UUID.randomUUID();
        String prefill = draft.definition().path("written").isObject() && text != null ? text : "";
        try (var insert = connection.prepareStatement("""
                insert into assessment.mission_submissions (id, learner_id, track_version_id, level_code, module_id,
                    activity_id, lesson_id, session_id, session_activity_id, number, definition, text)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?)
                """)) {
            insert.setObject(1, id);
            insert.setObject(2, learnerId);
            insert.setObject(3, trackVersionId);
            insert.setString(4, draft.levelCode());
            insert.setString(5, draft.moduleId());
            insert.setString(6, activityId);
            insert.setString(7, draft.lessonId());
            insert.setObject(8, sessionId);
            insert.setString(9, sessionActivityId);
            insert.setInt(10, number);
            insert.setString(11, draft.definition().toString());
            insert.setString(12, prefill);
            insert.executeUpdate();
        }
        return find(connection, id, false);
    }

    /** Le brouillon suit le contexte où l'élève le rouvre (séance ou bibliothèque). */
    private Mission rehome(Connection connection, Mission draft, UUID sessionId, String sessionActivityId)
            throws SQLException {
        if (Objects.equals(sessionId, draft.sessionId()) && Objects.equals(sessionActivityId, draft.sessionActivityId())) {
            return draft;
        }
        try (var update = connection.prepareStatement("""
                update assessment.mission_submissions set session_id = ?, session_activity_id = ?, updated_at = now()
                where id = ? and status = 'draft'
                """)) {
            update.setObject(1, sessionId);
            update.setString(2, sessionActivityId);
            update.setObject(3, draft.id());
            update.executeUpdate();
        }
        return find(connection, draft.id(), false);
    }

    private Mission draft(Connection connection, UUID id, UUID learnerId) throws SQLException {
        Mission mission = owned(connection, id, learnerId);
        if (!MissionRules.DRAFT.equals(mission.status())) throw HttpError.conflict("Cette mission est déjà remise.");
        return mission;
    }

    private Mission owned(Connection connection, UUID id, UUID learnerId) throws SQLException {
        Mission mission = find(connection, id, true);
        if (mission == null || !learnerId.equals(mission.learnerId())) throw HttpError.notFound("Mission introuvable.");
        return mission;
    }

    private Mission find(Connection connection, UUID id, boolean lock) throws SQLException {
        try (var query = connection.prepareStatement("select * from assessment.mission_submissions where id = ?"
                + (lock ? " for update" : ""))) {
            query.setObject(1, id);
            List<Mission> found = list(query.executeQuery());
            return found.isEmpty() ? null : found.get(0);
        }
    }

    private List<Mission> list(ResultSet rows) throws SQLException {
        try (rows) {
            List<Mission> missions = new ArrayList<>();
            while (rows.next()) {
                missions.add(new Mission(rows.getObject("id", UUID.class), rows.getObject("learner_id", UUID.class),
                        rows.getObject("track_version_id", UUID.class), rows.getString("level_code"),
                        rows.getString("module_id"), rows.getString("activity_id"), rows.getString("lesson_id"),
                        rows.getObject("session_id", UUID.class), rows.getString("session_activity_id"),
                        rows.getInt("number"), rows.getString("status"), node(rows.getString("definition")),
                        rows.getString("text"), integers(rows.getArray("checklist")),
                        rows.getObject("recording_id", UUID.class), rows.getString("recording_mime"),
                        rows.getObject("reviewer_id", UUID.class), rows.getString("reviewer_kind"),
                        rows.getString("submit_key"), rows.getObject("submitted_at", OffsetDateTime.class),
                        rows.getString("decision"), rows.getString("comment"), rows.getObject("reviewed_by", UUID.class),
                        rows.getObject("reviewed_at", OffsetDateTime.class), rows.getObject("created_at", OffsetDateTime.class),
                        rows.getObject("updated_at", OffsetDateTime.class)));
            }
            return missions;
        }
    }

    private static List<Integer> integers(Array array) throws SQLException {
        if (array == null) return List.of();
        try {
            List<Integer> values = new ArrayList<>();
            for (Object value : (Object[]) array.getArray()) values.add(((Number) value).intValue());
            return List.copyOf(values);
        } finally {
            array.free();
        }
    }

    private JsonNode node(String value) throws SQLException {
        if (value == null) return null;
        try {
            return json.readTree(value);
        } catch (JsonProcessingException error) {
            throw new SQLException("Donnée JSON illisible", "XX000", error);
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
        LOG.errorf("Assessment database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        return HttpError.unavailable("Les missions sont temporairement indisponibles.");
    }
}
