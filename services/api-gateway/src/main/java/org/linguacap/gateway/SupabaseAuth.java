package org.linguacap.gateway;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.HttpError;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class SupabaseAuth {
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    @Inject ObjectMapper json;
    @ConfigProperty(name = "lingua.supabase.url") Optional<String> url;
    @ConfigProperty(name = "lingua.supabase.publishable-key") Optional<String> key;
    @ConfigProperty(name = "lingua.cloud-run") boolean cloudRun;

    public Account verify(String authorization) {
        if (authorization == null || !authorization.matches("(?i)Bearer [A-Za-z0-9_.-]{20,8192}")) {
            throw HttpError.unauthorized("Connectez-vous pour accéder à cet espace.");
        }
        try {
            var host = URI.create(url.orElseThrow(() -> HttpError.unavailable("Supabase Auth reste à configurer.")));
            if (host.getHost() == null || host.getUserInfo() != null
                    || !(host.getScheme().equals("https") || !cloudRun && host.getScheme().equals("http"))) {
                throw HttpError.unavailable("Supabase Auth reste à configurer.");
            }
            var request = HttpRequest.newBuilder(host.resolve("/auth/v1/user")).timeout(Duration.ofSeconds(5))
                    .header("Authorization", authorization)
                    .header("apikey", key.orElseThrow(() -> HttpError.unavailable("Supabase Auth reste à configurer.")))
                    .header("Accept", "application/json").GET().build();
            var result = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (result.statusCode() == 401 || result.statusCode() == 403) {
                throw HttpError.unauthorized("Cette session a expiré. Reconnectez-vous.");
            }
            if (result.statusCode() != 200) throw HttpError.unavailable("Supabase Auth est indisponible.");
            var user = json.readTree(result.body());
            if (!"authenticated".equals(user.path("aud").asText())) {
                throw HttpError.unauthorized("Cette session n’est pas reconnue.");
            }
            return new Account(UUID.fromString(user.path("id").asText()), authorization.substring(7),
                    user.path("email").asText(""), !user.path("email_confirmed_at").asText("").isBlank());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw HttpError.unavailable("La vérification de session a été interrompue.");
        } catch (IOException | IllegalArgumentException e) {
            throw HttpError.unavailable("Supabase Auth est indisponible.");
        }
    }

    public record Account(UUID id, String token, String email, boolean emailVerified) {}
}
