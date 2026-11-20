package org.linguacap.common;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class ServiceClient {
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private final Map<String, IdentityToken> tokens = new ConcurrentHashMap<>();

    @Inject ObjectMapper json;
    @ConfigProperty(name = "lingua.internal-secret") Optional<String> secret;
    @ConfigProperty(name = "lingua.cloud-run") boolean cloudRun;

    public JsonNode request(String baseUrl, String path, String method, UUID actor, Object body) {
        var result = exchange(baseUrl, path, method, actor, body, "", "", false, "");
        if (result.status() >= 400) {
            throw new WebApplicationException(Response.status(result.status()).entity(result.body()).build());
        }
        return result.body();
    }

    public Result exchange(String baseUrl, String path, String method, UUID actor, Object body,
                           String token, String email, boolean emailVerified, String requestId) {
        return exchange(baseUrl, path, method, actor, body, token, email, emailVerified, requestId, "");
    }

    public Result exchange(String baseUrl, String path, String method, UUID actor, Object body,
                           String token, String email, boolean emailVerified, String requestId, String idempotencyKey) {
        try {
            URI base = URI.create(baseUrl);
            if (base.getHost() == null || base.getUserInfo() != null
                    || !(base.getScheme().equals("https") || !cloudRun && base.getScheme().equals("http"))
                    || !(path.startsWith("/v1/") || path.equals("/q/health/ready"))) {
                throw HttpError.unavailable("L’adresse du service est invalide.");
            }
            var request = HttpRequest.newBuilder(base.resolve(path))
                    .timeout(Duration.ofSeconds(7))
                    .header("Accept", "application/json")
                    .header(Actor.ID, actor.toString())
                    .header(Actor.INTERNAL_SECRET, secret.orElseThrow(
                            () -> HttpError.unavailable("Le service interne n’est pas configuré.")));
            if (!token.isEmpty()) request.header("Authorization", "Bearer " + token);
            if (emailVerified && !email.isEmpty() && email.chars().allMatch(ch -> ch >= 33 && ch <= 126)) {
                request.header(Actor.EMAIL, email).header(Actor.EMAIL_VERIFIED, "true");
            }
            // L'identifiant de la requête en cours suit aussi les appels internes (traitement périodique, cascades).
            String correlation = requestId.isEmpty() ? RequestLog.active() : requestId;
            if (!correlation.isEmpty()) request.header(RequestLog.HEADER, correlation);
            if (!idempotencyKey.isEmpty()) request.header("Idempotency-Key", idempotencyKey);
            if (cloudRun) request.header("X-Serverless-Authorization", "Bearer " + tokenFor(base));
            var publisher = HttpRequest.BodyPublishers.noBody();
            if (body != null) {
                publisher = HttpRequest.BodyPublishers.ofByteArray(json.writeValueAsBytes(body));
                request.header("Content-Type", "application/json");
            }
            var result = client.send(request.method(method, publisher).build(), HttpResponse.BodyHandlers.ofByteArray());
            int status = result.statusCode();
            if (status >= 300 && status < 400 || status >= 500 && status != 503) {
                throw HttpError.unavailable("Un service LinguaCap est indisponible.");
            }
            byte[] payload = result.body();
            return new Result(status, payload.length == 0 ? json.nullNode() : json.readTree(payload));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw HttpError.unavailable("L’appel au service a été interrompu.");
        } catch (IOException | IllegalArgumentException e) {
            throw HttpError.unavailable("Un service LinguaCap est indisponible.");
        }
    }

    private String tokenFor(URI service) throws IOException, InterruptedException {
        String audience = service.getScheme() + "://" + service.getAuthority();
        IdentityToken cached = tokens.get(audience);
        if (cached != null && cached.expiresAt().isAfter(Instant.now())) return cached.value();
        String query = URLEncoder.encode(audience, StandardCharsets.UTF_8);
        var request = HttpRequest.newBuilder(URI.create("http://metadata.google.internal/computeMetadata/v1/"
                        + "instance/service-accounts/default/identity?audience=" + query))
                .header("Metadata-Flavor", "Google").timeout(Duration.ofSeconds(2)).GET().build();
        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200 || response.body().isBlank()) {
            throw HttpError.unavailable("L’identité d’exécution est indisponible.");
        }
        String value = response.body().trim();
        tokens.put(audience, new IdentityToken(value, Instant.now().plusSeconds(150)));
        return value;
    }

    public record Result(int status, JsonNode body) {}
    private record IdentityToken(String value, Instant expiresAt) {}
}
