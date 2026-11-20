package org.linguacap.common;

import static org.junit.jupiter.api.Assertions.assertEquals;

import jakarta.ws.rs.WebApplicationException;
import java.util.Map;
import java.util.function.Function;
import org.junit.jupiter.api.Test;

class HttpErrorTest {
    private static void assertEnvelope(Function<String, WebApplicationException> factory, int status, String code) {
        var response = factory.apply("Message lisible").getResponse();
        assertEquals(status, response.getStatus());
        assertEquals("no-store", response.getHeaderString("Cache-Control"));
        assertEquals(Map.of("code", code, "message", "Message lisible"), response.getEntity());
    }

    @Test
    void chaqueErreurSuitLeFormatDuContrat() {
        assertEnvelope(HttpError::badRequest, 400, "INVALID_INPUT");
        assertEnvelope(HttpError::unauthorized, 401, "UNAUTHENTICATED");
        assertEnvelope(HttpError::forbidden, 403, "FORBIDDEN");
        assertEnvelope(HttpError::notFound, 404, "NOT_FOUND");
        assertEnvelope(HttpError::conflict, 409, "CONFLICT");
        assertEnvelope(HttpError::unavailable, 503, "UNAVAILABLE");
    }
}
