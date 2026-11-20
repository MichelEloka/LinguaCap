package org.linguacap.common;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

public final class HttpError {
    private HttpError() {}

    public static WebApplicationException badRequest(String message) { return create(400, "INVALID_INPUT", message); }
    public static WebApplicationException unauthorized(String message) { return create(401, "UNAUTHENTICATED", message); }
    public static WebApplicationException forbidden(String message) { return create(403, "FORBIDDEN", message); }
    public static WebApplicationException notFound(String message) { return create(404, "NOT_FOUND", message); }
    public static WebApplicationException conflict(String message) { return create(409, "CONFLICT", message); }
    public static WebApplicationException unavailable(String message) { return create(503, "UNAVAILABLE", message); }

    private static WebApplicationException create(int status, String code, String message) {
        return new WebApplicationException(Response.status(status)
                .type(MediaType.APPLICATION_JSON_TYPE)
                .header("Cache-Control", "no-store")
                .entity(Map.of("code", code, "message", message)).build());
    }
}
