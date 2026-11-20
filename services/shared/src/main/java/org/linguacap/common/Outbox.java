package org.linguacap.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Table de sortie des événements métier (DEV-073, DEV-074) : écriture dans la transaction de l'action, puis
 * lecture par lots ordonnés pour Suivi. L'enveloppe suit contracts/events/event-envelope.schema.json.
 */
public final class Outbox {
    public static final int MAX_BATCH = 200;

    private Outbox() {}

    /** Écrit un événement dans la table de sortie du service, avec la connexion de la transaction en cours. */
    public static void emit(Connection connection, String table, String type, String subjectKind, String subjectId,
                            UUID learnerId, String requestId, ObjectNode data) throws SQLException {
        try (var insert = connection.prepareStatement("insert into " + table
                + " (id, type, subject_kind, subject_id, learner_id, request_id, data) values (?, ?, ?, ?, ?, ?, ?::jsonb)")) {
            insert.setObject(1, UUID.randomUUID());
            insert.setString(2, type);
            insert.setString(3, subjectKind);
            insert.setString(4, subjectId);
            insert.setObject(5, learnerId);
            insert.setString(6, requestId == null || requestId.isEmpty() ? null : requestId);
            insert.setString(7, data.toString());
            insert.executeUpdate();
        }
    }

    /**
     * Lot d'événements après le numéro donné, dans l'ordre de la séquence : { items: [{ sequence, event }], last }.
     * Le consommateur confirme sa reprise en relisant à partir de last.
     */
    public static ObjectNode read(Connection connection, ObjectMapper json, String table, String producer, long after,
                                  int limit) throws SQLException {
        int size = Math.max(1, Math.min(limit, MAX_BATCH));
        ObjectNode page = json.createObjectNode();
        ArrayNode items = page.putArray("items");
        long last = after;
        try (var query = connection.prepareStatement("select sequence, id, type, version, occurred_at, subject_kind, "
                + "subject_id, learner_id, request_id, data::text as data from " + table
                + " where sequence > ? order by sequence limit ?")) {
            query.setLong(1, after);
            query.setInt(2, size);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    last = rows.getLong("sequence");
                    ObjectNode event = json.createObjectNode();
                    event.put("eventId", rows.getObject("id", UUID.class).toString());
                    event.put("type", rows.getString("type"));
                    event.put("version", rows.getInt("version"));
                    event.put("producer", producer);
                    event.put("occurredAt", rows.getObject("occurred_at", OffsetDateTime.class).toString());
                    if (rows.getString("request_id") != null) event.put("requestId", rows.getString("request_id"));
                    event.putObject("subject").put("kind", rows.getString("subject_kind")).put("id", rows.getString("subject_id"));
                    UUID learnerId = rows.getObject("learner_id", UUID.class);
                    if (learnerId != null) event.put("learnerId", learnerId.toString());
                    event.set("data", parse(json, rows.getString("data")));
                    ObjectNode item = items.addObject();
                    item.put("sequence", last);
                    item.set("event", event);
                }
            }
        }
        page.put("last", last);
        return page;
    }

    private static JsonNode parse(ObjectMapper json, String value) throws SQLException {
        try {
            return json.readTree(value);
        } catch (JsonProcessingException error) {
            throw new SQLException("Données d’événement illisibles", "XX000", error);
        }
    }
}
