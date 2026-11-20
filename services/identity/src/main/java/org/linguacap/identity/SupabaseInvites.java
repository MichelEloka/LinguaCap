package org.linguacap.identity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;

@ApplicationScoped
class SupabaseInvites {
    private static final Logger LOG = Logger.getLogger(SupabaseInvites.class);
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(4)).build();

    @Inject ObjectMapper json;
    @ConfigProperty(name = "lingua.supabase.url") Optional<String> supabaseUrl;
    @ConfigProperty(name = "lingua.supabase.admin-key") Optional<String> adminKey;
    @ConfigProperty(name = "lingua.site-url") Optional<String> siteUrl;

    void requireConfigured() {
        if (supabaseUrl.filter(value -> !value.isBlank()).isEmpty()
                || adminKey.filter(value -> !value.isBlank()).isEmpty()
                || siteUrl.filter(value -> !value.isBlank()).isEmpty()) {
            throw HttpError.unavailable("L’envoi d’invitations Supabase reste à configurer.");
        }
    }

    UUID send(String email, String displayName) {
        String base = supabaseUrl.orElseThrow().replaceAll("/+$", "");
        String redirect = URLEncoder.encode(siteUrl.orElseThrow(), StandardCharsets.UTF_8);
        String key = adminKey.orElseThrow();
        try {
            URI endpoint = URI.create(base + "/auth/v1/invite?redirect_to=" + redirect);
            String payload = json.writeValueAsString(Map.of("email", email, "data", Map.of("display_name", displayName)));
            HttpRequest.Builder request = HttpRequest.newBuilder(endpoint)
                    .timeout(Duration.ofSeconds(10))
                    .header("apikey", key)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload));
            if (!key.startsWith("sb_secret_")) {
                request.header("Authorization", "Bearer " + key);
            }

            HttpResponse<String> response = client.send(request.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 == 2) {
                return UUID.fromString(json.readTree(response.body()).path("id").asText());
            }

            LOG.warnf("Supabase invite request returned HTTP %d", response.statusCode());
            if (response.statusCode() == 400 || response.statusCode() == 409 || response.statusCode() == 422) {
                JsonNode error = json.readTree(response.body());
                String code = error.path("error_code").asText();
                if ("email_exists".equals(code) || "user_already_exists".equals(code)) {
                    throw HttpError.conflict("Cette adresse correspond déjà à un compte Supabase.");
                }
            }
            throw HttpError.unavailable("L’envoi de l’invitation n’a pas abouti. Réessaie plus tard.");
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw HttpError.unavailable("L’envoi de l’invitation a été interrompu.");
        } catch (IOException | IllegalArgumentException error) {
            LOG.warnf("Supabase invite operation failed (%s)", error.getClass().getSimpleName());
            throw HttpError.unavailable("L’envoi de l’invitation n’a pas abouti. Réessaie plus tard.");
        }
    }
}
