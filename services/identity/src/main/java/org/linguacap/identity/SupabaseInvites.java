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

/** Envoi des liens d'activation par Supabase Auth, qui les achemine par le SMTP configuré (Resend). */
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

    /**
     * Envoie le lien d'activation et renvoie l'identifiant Auth du compte.
     * Si la personne a déjà validé son adresse (lien ouvert, invitation ensuite annulée ou expirée),
     * Supabase refuse une nouvelle invitation : un lien de choix du mot de passe la remplace.
     */
    UUID send(String email, String displayName, UUID knownUserId) {
        HttpResponse<String> response = post("/auth/v1/invite",
                Map.of("email", email, "data", Map.of("display_name", displayName)));
        if (response.statusCode() / 100 == 2) {
            try {
                return UUID.fromString(json.readTree(response.body()).path("id").asText());
            } catch (IOException | IllegalArgumentException error) {
                throw HttpError.unavailable("L’envoi de l’invitation n’a pas abouti. Réessaie plus tard.");
            }
        }
        String code = errorCode(response);
        if ("email_exists".equals(code) || "user_already_exists".equals(code)) {
            if (knownUserId == null) {
                throw HttpError.conflict("Cette adresse a déjà un compte d’authentification : la personne peut se "
                        + "connecter, ou choisir un mot de passe avec « Mot de passe oublié ».");
            }
            HttpResponse<String> recovery = post("/auth/v1/recover", Map.of("email", email));
            if (recovery.statusCode() / 100 == 2) return knownUserId;
            throw failure(recovery, errorCode(recovery));
        }
        throw failure(response, code);
    }

    private HttpResponse<String> post(String path, Map<String, ?> body) {
        String base = supabaseUrl.orElseThrow().replaceAll("/+$", "");
        String redirect = URLEncoder.encode(siteUrl.orElseThrow(), StandardCharsets.UTF_8);
        String key = adminKey.orElseThrow();
        try {
            HttpRequest.Builder request = HttpRequest.newBuilder(URI.create(base + path + "?redirect_to=" + redirect))
                    .timeout(Duration.ofSeconds(10))
                    .header("apikey", key)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
            if (!key.startsWith("sb_secret_")) {
                request.header("Authorization", "Bearer " + key);
            }
            return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw HttpError.unavailable("L’envoi de l’invitation a été interrompu.");
        } catch (IOException | IllegalArgumentException error) {
            LOG.warnf("Supabase Auth request %s failed (%s)", path, error.getClass().getSimpleName());
            throw HttpError.unavailable("L’envoi de l’invitation n’a pas abouti. Réessaie plus tard.");
        }
    }

    private String errorCode(HttpResponse<String> response) {
        try {
            JsonNode error = json.readTree(response.body());
            return error.path("error_code").asText(error.path("code").asText(""));
        } catch (IOException error) {
            return "";
        }
    }

    private RuntimeException failure(HttpResponse<String> response, String code) {
        LOG.warnf("Supabase Auth email request returned HTTP %d (%s)", response.statusCode(), code);
        if (response.statusCode() == 429 || code.startsWith("over_email_send_rate_limit")) {
            return HttpError.conflict("Un e-mail vient déjà d’être envoyé à cette adresse. Réessayez dans une minute.");
        }
        return HttpError.unavailable("L’envoi de l’invitation n’a pas abouti. Réessaie plus tard.");
    }
}
