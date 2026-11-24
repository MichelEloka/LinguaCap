package org.linguacap.tracking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.linguacap.common.Outbox;

class TrackingSyncTest {
    private static final ObjectMapper JSON = new ObjectMapper();

    private static JsonNode json(String value) throws Exception {
        return JSON.readTree(value);
    }

    @Test
    void laDemandePorteLeCurseurEtLaSéquencePourUnProducteurPasEncoreÀJour() {
        assertEquals("/v1/internal/learning/events?cursor=0:172&after=172&limit=100",
                TrackingSync.pagePath("/v1/internal/learning/events", new Outbox.Cursor(0, 172)));
        assertEquals("/v1/internal/identity/events?cursor=1042:35&after=35&limit=100",
                TrackingSync.pagePath("/v1/internal/identity/events", new Outbox.Cursor(1042, 35)));
    }

    @Test
    void lePointDeRepriseSuitLeCurseurDuProducteur() throws Exception {
        Outbox.Cursor from = new Outbox.Cursor(0, 172);
        assertEquals(new Outbox.Cursor(1042, 97),
                TrackingSync.nextCursor(from, json("{\"items\":[{}],\"last\":97,\"cursor\":\"1042:97\"}")),
                "La séquence peut baisser quand la transaction avance");
        assertEquals(new Outbox.Cursor(0, 180), TrackingSync.nextCursor(from, json("{\"items\":[{}],\"last\":180}")),
                "Un producteur encore à l'ancienne lecture fait avancer la séquence seule");
        assertEquals(new Outbox.Cursor(1042, 97), TrackingSync.nextCursor(new Outbox.Cursor(1042, 97),
                json("{\"items\":[{}],\"last\":12,\"cursor\":\"1041:12\"}")), "Le point de reprise ne recule jamais");
        assertEquals(new Outbox.Cursor(1042, 97), TrackingSync.nextCursor(new Outbox.Cursor(1042, 97),
                json("{\"items\":[{}],\"last\":12}")));
        assertThrows(IllegalArgumentException.class,
                () -> TrackingSync.nextCursor(from, json("{\"items\":[{}],\"cursor\":\"illisible\"}")));
    }

    @Test
    void lÉtatDeLObjectifVientDeLÉvénement() throws Exception {
        assertEquals("awaiting_grading", TrackingSync.goalStatusOf("learning.plan_validated",
                json("{\"revision\":4,\"goalStatus\":\"awaiting_grading\"}")),
                "Une replanification garde l'attente de correction");
        assertEquals("active", TrackingSync.goalStatusOf("learning.plan_validated", json("{\"revision\":4}")),
                "Un planning validé avant EVO-042 reprend l'objectif");
        assertEquals("paused", TrackingSync.goalStatusOf("learning.goal_resumed",
                json("{\"goalStatus\":\"paused\",\"resumeDate\":\"2026-12-14\"}")));
        assertNull(TrackingSync.goalStatusOf("learning.goal_status_changed", json("{\"goalStatus\":null}")),
                "Sans état, l'état connu est gardé");
        assertNull(TrackingSync.goalStatusOf("learning.goal_paused", json("{\"goalStatus\":\"\"}")));
    }
}
