package org.linguacap.common;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.ws.rs.WebApplicationException;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class OutboxTest {
    private static final ObjectMapper JSON = new ObjectMapper();

    /** Requête préparée par la lecture : texte SQL et paramètres liés. */
    private static final class Recorded {
        String sql;
        final Map<Integer, Object> parameters = new HashMap<>();
    }

    /** Connexion simulée : une requête, dont les lignes sont données dans l'ordre où la base les servirait. */
    private static Connection connection(Recorded recorded, List<Map<String, Object>> rows) {
        Iterator<Map<String, Object>> cursor = rows.iterator();
        Map<String, Object>[] current = new Map[1];
        ResultSet result = proxy(ResultSet.class, (method, args) -> switch (method) {
            case "next" -> {
                current[0] = cursor.hasNext() ? cursor.next() : null;
                yield current[0] != null;
            }
            case "getString" -> current[0].get((String) args[0]) == null ? null : current[0].get((String) args[0]).toString();
            case "getLong" -> ((Number) current[0].get((String) args[0])).longValue();
            case "getInt" -> ((Number) current[0].get((String) args[0])).intValue();
            case "getObject" -> current[0].get((String) args[0]);
            default -> null;
        });
        PreparedStatement statement = proxy(PreparedStatement.class, (method, args) -> switch (method) {
            case "setString", "setLong", "setInt" -> recorded.parameters.put((Integer) args[0], args[1]);
            case "executeQuery" -> result;
            default -> null;
        });
        return proxy(Connection.class, (method, args) -> {
            if (method.equals("prepareStatement")) {
                recorded.sql = (String) args[0];
                return statement;
            }
            return null;
        });
    }

    @FunctionalInterface
    private interface Handler {
        Object handle(String method, Object[] args);
    }

    @SuppressWarnings("unchecked")
    private static <T> T proxy(Class<T> type, Handler handler) {
        return (T) Proxy.newProxyInstance(OutboxTest.class.getClassLoader(), new Class<?>[] {type},
                (self, method, args) -> handler.handle(method.getName(), args));
    }

    private static Map<String, Object> row(long tx, long sequence, String type) {
        Map<String, Object> row = new HashMap<>();
        row.put("tx", Long.toString(tx));
        row.put("sequence", sequence);
        row.put("id", UUID.randomUUID());
        row.put("type", type);
        row.put("version", 1);
        row.put("occurred_at", OffsetDateTime.parse("2026-12-01T10:00:00Z"));
        row.put("subject_kind", "goal");
        row.put("subject_id", "objectif");
        row.put("learner_id", UUID.randomUUID());
        row.put("data", "{\"goalStatus\":\"paused\"}");
        return row;
    }

    @Test
    void leCurseurSÉcritTransactionPuisSéquence() {
        Outbox.Cursor cursor = Outbox.Cursor.parse("1042:17");
        assertEquals(new Outbox.Cursor(1042, 17), cursor);
        assertEquals("1042:17", cursor.toString());
        assertEquals(cursor, Outbox.Cursor.parse(cursor.toString()));
        assertEquals("0:0", Outbox.Cursor.START.toString());
        for (String invalid : new String[] {"", "17", "a:b", "-1:2", "1:-2", "1:2:3", " :4", "99999999999999999999:1"}) {
            assertThrows(IllegalArgumentException.class, () -> Outbox.Cursor.parse(invalid), invalid);
        }
    }

    @Test
    void lOrdreSuitLaTransactionAvantLaSéquence() {
        // Une transaction plus récente qui a pris un numéro plus petit passe après : c'est elle qui validait en retard.
        assertTrue(new Outbox.Cursor(1041, 90).compareTo(new Outbox.Cursor(1042, 12)) < 0);
        assertTrue(new Outbox.Cursor(1042, 12).compareTo(new Outbox.Cursor(1042, 13)) < 0);
        assertEquals(0, new Outbox.Cursor(5, 5).compareTo(new Outbox.Cursor(5, 5)));
        Outbox.Cursor ahead = new Outbox.Cursor(1042, 12);
        assertEquals(ahead, ahead.max(new Outbox.Cursor(1041, 90)), "Le point de reprise ne recule jamais");
        assertEquals(ahead, new Outbox.Cursor(0, 300).max(ahead));
        assertEquals(ahead, ahead.max(null));
    }

    @Test
    void leParamètreCurseurEstFacultatifMaisJamaisIllisible() {
        assertNull(Outbox.cursorParam(null));
        assertNull(Outbox.cursorParam("  "));
        assertEquals(new Outbox.Cursor(7, 3), Outbox.cursorParam("7:3"));
        var error = assertThrows(WebApplicationException.class, () -> Outbox.cursorParam("7"));
        assertEquals(400, error.getResponse().getStatus());
    }

    @Test
    void laLectureAuCurseurNeSertQueLesTransactionsTerminées() throws Exception {
        Recorded recorded = new Recorded();
        ObjectNode page = Outbox.read(connection(recorded, List.of(row(1041, 98, "learning.plan_validated"),
                row(1042, 97, "learning.goal_paused"))), JSON, "learning.outbox_events", "learning",
                new Outbox.Cursor(1040, 120), 500);
        assertTrue(recorded.sql.contains("(tx, sequence) > (?::xid8, ?)"), recorded.sql);
        assertTrue(recorded.sql.contains("tx < pg_snapshot_xmin(pg_current_snapshot())"), recorded.sql);
        assertTrue(recorded.sql.contains("order by tx, sequence"), recorded.sql);
        assertEquals("1040", recorded.parameters.get(1));
        assertEquals(120L, recorded.parameters.get(2));
        assertEquals(Outbox.MAX_BATCH, recorded.parameters.get(3), "Un lot compte 200 événements au plus");
        assertEquals(2, page.path("items").size());
        assertEquals(98, page.path("items").get(0).path("sequence").asLong());
        assertEquals(1041, page.path("items").get(0).path("tx").asLong());
        assertEquals("learning.goal_paused", page.path("items").get(1).path("event").path("type").asText());
        assertEquals("paused", page.path("items").get(1).path("event").path("data").path("goalStatus").asText());
        assertEquals("1042:97", page.path("cursor").asText(), "Le curseur suit l'ordre (tx, séquence)");
        assertEquals(97, page.path("last").asLong(), "last reste la séquence du dernier événement servi");
    }

    @Test
    void unLotVideGardeLeCurseur() throws Exception {
        ObjectNode page = Outbox.read(connection(new Recorded(), List.of()), JSON, "identity.outbox_events", "identity",
                new Outbox.Cursor(88, 5), 100);
        assertEquals(0, page.path("items").size());
        assertEquals("88:5", page.path("cursor").asText());
        assertEquals(5, page.path("last").asLong());
    }

    @Test
    void leParamètreAfterGardeLaLectureHistorique() throws Exception {
        Recorded recorded = new Recorded();
        List<Map<String, Object>> rows = new ArrayList<>(List.of(row(0, 41, "assessment.attempt_submitted")));
        ObjectNode page = Outbox.export(connection(recorded, rows), JSON, "assessment.outbox_events", "assessment", null,
                40, 100);
        assertTrue(recorded.sql.contains("where sequence > ? order by sequence"), recorded.sql);
        assertEquals(40L, recorded.parameters.get(1));
        assertEquals(41, page.path("last").asLong());
        assertFalse(page.has("cursor"), "Un Suivi pas encore passé au curseur reçoit la forme historique");
        assertFalse(page.path("items").get(0).has("tx"));
        assertEquals("assessment", page.path("items").get(0).path("event").path("producer").asText());
    }
}
