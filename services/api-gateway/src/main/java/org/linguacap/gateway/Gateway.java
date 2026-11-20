package org.linguacap.gateway;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.HttpError;
import org.linguacap.common.Secrets;
import org.linguacap.common.ServiceClient;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Path("/api/v1")
@Produces(MediaType.APPLICATION_JSON)
public class Gateway {
    private static final String SLUG = "[a-z0-9][a-z0-9-]{0,79}";
    private static final String UUID_PATH = "[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}";
    private static final UUID HEALTH_ACTOR = new UUID(0, 0);

    @Inject ServiceClient services;
    @Inject SupabaseAuth auth;
    @ConfigProperty(name = "lingua.services.identity") String identity;
    @ConfigProperty(name = "lingua.services.catalogue") String catalogue;
    @ConfigProperty(name = "lingua.services.media") String media;
    @ConfigProperty(name = "lingua.services.learning") String learning;
    @ConfigProperty(name = "lingua.services.assessment") String assessment;
    @ConfigProperty(name = "lingua.services.tracking") String tracking;
    @ConfigProperty(name = "lingua.origin-secret") Optional<String> originSecret;
    @ConfigProperty(name = "lingua.cloud-run") boolean cloudRun;
    @Context HttpHeaders headers;
    @Context UriInfo uri;

    @GET
    @Path("health")
    public Response health() {
        verifyOrigin();
        String requestId = UUID.randomUUID().toString();
        var checks = List.of(identity, catalogue, media, learning, assessment, tracking).stream()
                .map(service -> CompletableFuture.supplyAsync(() -> services.exchange(service, "/q/health/ready",
                                "GET", HEALTH_ACTOR, null, "", "", false, requestId).status() == 200)
                        .exceptionally(failure -> false)).toList();
        boolean ready = checks.stream().map(CompletableFuture::join).reduce(true, Boolean::logicalAnd);
        return response(200, Map.of("status", ready ? "ok" : "degraded"), requestId);
    }

    @GET
    @Path("{path:.+}")
    public Response read(@PathParam("path") String path) { return forward("GET", path, null); }

    @POST
    @Path("{path:.+}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@PathParam("path") String path, JsonNode body) { return forward("POST", path, body); }

    @PUT
    @Path("{path:.+}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response update(@PathParam("path") String path, JsonNode body) { return forward("PUT", path, body); }

    private Response forward(String method, String path, JsonNode body) {
        verifyOrigin();
        String base = destination(path, method);
        String requestId = UUID.randomUUID().toString();
        var user = auth.verify(headers.getHeaderString(HttpHeaders.AUTHORIZATION));
        if (!path.equals("me")) {
            var profile = call(identity, "/v1/me", "GET", user, null, requestId);
            if (profile.status() != 200) return response(profile.status(), profile.body(), requestId);
        }
        String learnerQuery = "";
        var params = uri.getQueryParameters();
        if (!params.isEmpty()) {
            String learner = params.getFirst("learnerId");
            if (!method.equals("GET") || !List.of("learning/progress", "learning/enrollment", "assessments/results", "tracking/messages").contains(path)
                    || params.size() != 1 || learner == null || !learner.matches(UUID_PATH) || params.get("learnerId").size() != 1) {
                throw HttpError.badRequest("Paramètre de recherche invalide.");
            }
            learnerQuery = "?learnerId=" + learner;
        }
        if (!method.equals("GET") && (body == null || !body.isObject())) {
            throw HttpError.badRequest("Un objet JSON est attendu.");
        }
        var result = call(base, "/v1/" + path + learnerQuery, method, user, body, requestId);
        return response(result.status(), result.body(), requestId);
    }

    private String destination(String path, String method) {
        if (method.equals("GET")) {
            if (path.equals("me") || path.equals("learners") || path.matches("learners/" + UUID_PATH)) return identity;
            if (path.equals("invitations") || path.equals("admin/users") || path.matches("admin/users/" + UUID_PATH)) {
                return identity;
            }
            if (path.equals("levels") || path.equals("tracks") || path.matches("lessons/" + SLUG)) return catalogue;
            if (path.equals("media") || path.matches("media/" + SLUG) || path.matches("media/" + SLUG + "/versions/[1-9][0-9]{0,3}")) {
                return media;
            }
            if (path.equals("learning/goal") || path.equals("learning/progress") || path.equals("learning/enrollment")
                    || path.matches("learning/sessions/" + UUID_PATH)) return learning;
            if (path.equals("assessments/results")) return assessment;
            if (path.equals("tracking/overview") || path.equals("tracking/messages")
                    || path.matches("tracking/learners/" + UUID_PATH)) return tracking;
        }
        if (method.equals("POST")) {
            if (path.equals("invitations") || path.matches("invitations/" + UUID_PATH + "/(resend|cancel)")) return identity;
            if (path.equals("levels") || path.matches("levels/" + SLUG + "/publish")) return catalogue;
            if (path.equals("assessments/quiz")) return assessment;
            if (path.equals("learning/enrollments")) return learning;
            if (path.equals("tracking/messages")) return tracking;
        }
        if (method.equals("PUT")) {
            if (path.equals("learning/goal")) return learning;
            if (path.matches("learning/sessions/" + UUID_PATH + "/activities/" + SLUG + "/progress")) return learning;
            if (path.matches("admin/users/" + UUID_PATH + "/(status|role|permissions|teacher|reviewer)")) return identity;
        }
        throw HttpError.notFound("Cette route API est inconnue.");
    }

    private ServiceClient.Result call(String target, String path, String method, SupabaseAuth.Account user,
                                      JsonNode body, String requestId) {
        // Only Media uses the user's Supabase token to enforce Storage RLS.
        String token = target.equals(media) ? user.token() : "";
        String email = path.equals("/v1/me") ? user.email() : "";
        String key = path.equals("/v1/assessments/quiz") ? headers.getHeaderString("Idempotency-Key") : null;
        if (key != null && !key.matches("[A-Za-z0-9._-]{1,128}")) {
            throw HttpError.badRequest("Clé de remise invalide.");
        }
        return services.exchange(target, path, method, user.id(), body, token, email, user.emailVerified(), requestId, key == null ? "" : key);
    }

    private void verifyOrigin() {
        if ((cloudRun || originSecret.isPresent())
                && !Secrets.match(originSecret.orElse(null), headers.getHeaderString("X-Linguacap-Origin"))) {
            throw HttpError.forbidden("Origine API non autorisée.");
        }
    }

    private static Response response(int status, Object body, String requestId) {
        return Response.status(status).type(MediaType.APPLICATION_JSON_TYPE)
                .header("Cache-Control", "no-store").header("X-Request-Id", requestId).entity(body).build();
    }
}
