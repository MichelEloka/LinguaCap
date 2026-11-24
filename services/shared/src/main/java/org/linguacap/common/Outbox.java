package org.linguacap.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Table de sortie des événements métier (DEV-073, DEV-074) : écriture dans la transaction de l'action, puis
 * lecture par lots ordonnés pour Suivi. L'enveloppe suit contracts/events/event-envelope.schema.json.
 *
 * <p>Lecture sans perte (EVO-042) : la séquence est attribuée à l'insertion, mais l'événement n'est visible qu'à la
 * validation de sa transaction. Lire « séquence &gt; dernier numéro vu » sautait pour toujours l'événement d'une
 * transaction qui avait pris un numéro plus petit et validait après une transaction de numéro plus grand. Chaque ligne
 * porte donc sa transaction (colonne {@code tx}, valeur par défaut {@code pg_current_xact_id()}) et le curseur
 * {@code "<tx>:<séquence>"} parcourt les événements dans l'ordre (tx, séquence), en ne servant que les transactions
 * terminées ({@code tx} inférieur au plus ancien identifiant encore actif de l'instantané) : aucune transaction encore
 * ouverte ne peut ensuite ajouter un événement avant le curseur. Une longue transaction retarde la lecture, sans perte.
 */
public final class Outbox {
    public static final int MAX_BATCH = 200;
    private static final Pattern CURSOR = Pattern.compile("(\\d{1,19}):(\\d{1,19})");
    private static final String COLUMNS = "sequence, id, type, version, occurred_at, subject_kind, subject_id, learner_id, "
            + "request_id, data::text as data";

    private Outbox() {}

    /**
     * Point de reprise d'un consommateur : transaction productrice, puis séquence. Les événements écrits avant la
     * migration 20261201000100 portent {@code tx = 0} : un ancien point de reprise numérique N vaut le curseur (0, N).
     */
    public record Cursor(long tx, long sequence) implements Comparable<Cursor> {
        public static final Cursor START = new Cursor(0, 0);

        public Cursor {
            if (tx < 0 || sequence < 0) throw new IllegalArgumentException("Curseur négatif");
        }

        /** Curseur écrit {@code "<tx>:<séquence>"}. */
        public static Cursor parse(String value) {
            var match = value == null ? null : CURSOR.matcher(value.strip());
            if (match == null || !match.matches()) throw new IllegalArgumentException("Curseur illisible");
            try {
                return new Cursor(Long.parseLong(match.group(1)), Long.parseLong(match.group(2)));
            } catch (NumberFormatException error) {
                throw new IllegalArgumentException("Curseur hors limites", error);
            }
        }

        public Cursor max(Cursor other) {
            return other == null || compareTo(other) >= 0 ? this : other;
        }

        @Override
        public int compareTo(Cursor other) {
            int byTx = Long.compare(tx, other.tx);
            return byTx != 0 ? byTx : Long.compare(sequence, other.sequence);
        }

        @Override
        public String toString() {
            return tx + ":" + sequence;
        }
    }

    /** Paramètre {@code cursor} d'une route d'export : null s'il est absent, 400 s'il est illisible. */
    public static Cursor cursorParam(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Cursor.parse(value);
        } catch (IllegalArgumentException error) {
            throw HttpError.badRequest("Point de reprise invalide : utilisez <transaction>:<séquence>.");
        }
    }

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
     * Route d'export d'un producteur : lecture au curseur s'il est fourni, sinon lecture historique après le numéro
     * {@code after} (Suivi pas encore passé au curseur, pendant le déploiement).
     */
    public static ObjectNode export(Connection connection, ObjectMapper json, String table, String producer, Cursor cursor,
                                    long after, int limit) throws SQLException {
        return cursor == null ? read(connection, json, table, producer, Math.max(0, after), limit)
                : read(connection, json, table, producer, cursor, limit);
    }

    /**
     * Lot d'événements après le curseur, dans l'ordre (tx, séquence), limité aux transactions terminées :
     * { items: [{ sequence, tx, event }], last, cursor }. Le consommateur reprend au curseur renvoyé (inchangé si le lot
     * est vide) ; last reste la séquence du dernier événement servi, comme dans la lecture historique.
     */
    public static ObjectNode read(Connection connection, ObjectMapper json, String table, String producer, Cursor after,
                                  int limit) throws SQLException {
        int size = Math.max(1, Math.min(limit, MAX_BATCH));
        ObjectNode page = json.createObjectNode();
        ArrayNode items = page.putArray("items");
        Cursor last = after;
        try (var query = connection.prepareStatement("select tx::text as tx, " + COLUMNS + " from " + table
                + " where (tx, sequence) > (?::xid8, ?) and tx < pg_snapshot_xmin(pg_current_snapshot())"
                + " order by tx, sequence limit ?")) {
            query.setString(1, Long.toString(after.tx()));
            query.setLong(2, after.sequence());
            query.setInt(3, size);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    last = new Cursor(Long.parseLong(rows.getString("tx")), rows.getLong("sequence"));
                    ObjectNode item = items.addObject();
                    item.put("sequence", last.sequence());
                    item.put("tx", last.tx());
                    item.set("event", event(json, producer, rows));
                }
            }
        }
        page.put("last", last.sequence());
        page.put("cursor", last.toString());
        return page;
    }

    /**
     * Lecture historique (paramètre after) : { items: [{ sequence, event }], last }, dans l'ordre de la séquence.
     * Conservée pour la transition seulement : elle peut sauter l'événement d'une transaction validée en retard.
     */
    public static ObjectNode read(Connection connection, ObjectMapper json, String table, String producer, long after,
                                  int limit) throws SQLException {
        int size = Math.max(1, Math.min(limit, MAX_BATCH));
        ObjectNode page = json.createObjectNode();
        ArrayNode items = page.putArray("items");
        long last = after;
        try (var query = connection.prepareStatement("select " + COLUMNS + " from " + table
                + " where sequence > ? order by sequence limit ?")) {
            query.setLong(1, after);
            query.setInt(2, size);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    last = rows.getLong("sequence");
                    ObjectNode item = items.addObject();
                    item.put("sequence", last);
                    item.set("event", event(json, producer, rows));
                }
            }
        }
        page.put("last", last);
        return page;
    }

    private static ObjectNode event(ObjectMapper json, String producer, ResultSet rows) throws SQLException {
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
        return event;
    }

    private static JsonNode parse(ObjectMapper json, String value) throws SQLException {
        try {
            return json.readTree(value);
        } catch (JsonProcessingException error) {
            throw new SQLException("Données d’événement illisibles", "XX000", error);
        }
    }
}
