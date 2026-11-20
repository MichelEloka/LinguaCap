package org.linguacap.media;

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

@ApplicationScoped
class StorageSigner {
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    @Inject
    ObjectMapper json;

    @ConfigProperty(name = "lingua.supabase.url")
    Optional<String> supabaseUrl;

    @ConfigProperty(name = "lingua.supabase.public-url")
    Optional<String> publicUrl;

    @ConfigProperty(name = "lingua.supabase.publishable-key")
    Optional<String> publishableKey;

    String sign(String bucket, String objectPath, String userToken) {
        String internalOrigin = supabaseUrl.orElseThrow(StorageSigner::unavailable).replaceAll("/+$", "");
        String browserOrigin = publicUrl.orElse(internalOrigin).replaceAll("/+$", "");
        String key = publishableKey.orElseThrow(StorageSigner::unavailable);
        String locator = "/object/sign/" + bucket + "/" + objectPath;

        try {
            var request = HttpRequest.newBuilder(URI.create(internalOrigin + "/storage/v1" + locator))
                    .header("apikey", key)
                    .header("Authorization", "Bearer " + userToken)
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .POST(HttpRequest.BodyPublishers.ofString("{\"expiresIn\":300}"))
                    .build();
            var response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw unavailable();
            }

            var payload = json.readTree(response.body());
            String signed = payload == null ? "" : payload.path("signedURL").asText("");
            URI signedUri = URI.create(signed);
            if (!locator.equals(signedUri.getRawPath()) || signedUri.isAbsolute()
                    || signedUri.getRawAuthority() != null || signedUri.getRawFragment() != null
                    || signedUri.getRawQuery() == null || !signedUri.getRawQuery().startsWith("token=")) {
                throw unavailable();
            }
            return browserOrigin + "/storage/v1" + signed;
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw unavailable();
        } catch (IOException | IllegalArgumentException error) {
            throw unavailable();
        }
    }

    private static RuntimeException unavailable() {
        return HttpError.unavailable("Le média n’est pas disponible pour le moment.");
    }
}
