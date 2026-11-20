package org.linguacap.media;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;

/**
 * Accès à Supabase Storage avec le jeton de l'utilisateur : les politiques RLS décident de chaque lecture, dépôt
 * ou suppression. Médias ne détient aucune clé capable de contourner ces politiques.
 */
@ApplicationScoped
class StorageSigner {
    private static final Logger LOG = Logger.getLogger(StorageSigner.class);

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

    /** Premiers octets et taille d'un objet déposé, ou null s'il n'existe pas (dépôt interrompu). */
    record Probe(long size, String contentType, byte[] head) {}

    String sign(String bucket, String objectPath, String userToken) {
        String locator = "/object/sign/" + bucket + "/" + objectPath;
        try {
            var request = base(locator, userToken)
                    .header("Content-Type", "application/json")
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
            return browserOrigin() + "/storage/v1" + signed;
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw unavailable();
        } catch (IOException | IllegalArgumentException error) {
            throw unavailable();
        }
    }

    /** Adresse de dépôt direct du navigateur vers le chemin réservé (DEV-050). */
    String uploadUrl(String bucket, String objectPath) {
        return browserOrigin() + "/storage/v1/object/" + bucket + "/" + objectPath;
    }

    /** Lit la taille et les premiers octets du fichier déposé, sans télécharger le reste. */
    Probe probe(String bucket, String objectPath, String userToken) {
        try {
            var request = base("/object/authenticated/" + bucket + "/" + objectPath, userToken)
                    .header("Range", "bytes=0-" + (MediaRules.HEAD_BYTES - 1))
                    .GET().build();
            var response = http.send(request, HttpResponse.BodyHandlers.ofInputStream());
            try (InputStream body = response.body()) {
                int status = response.statusCode();
                if (status == 400 || status == 404) return null;
                if (status != 200 && status != 206) {
                    LOG.warnf("Storage probe returned HTTP %d", status);
                    throw unavailable();
                }
                byte[] head = body.readNBytes(MediaRules.HEAD_BYTES);
                long size = response.headers().firstValue("Content-Range")
                        .filter(range -> range.matches("bytes \\d+-\\d+/\\d+"))
                        .map(range -> Long.parseLong(range.substring(range.indexOf('/') + 1)))
                        .orElseGet(() -> status == 200
                                ? response.headers().firstValueAsLong("Content-Length").orElse(-1) : -1);
                String type = response.headers().firstValue("Content-Type").orElse("").split(";")[0].trim();
                return new Probe(size, type, head);
            }
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw unavailable();
        } catch (IOException | IllegalArgumentException error) {
            throw unavailable();
        }
    }

    /** Supprime un dépôt refusé ou abandonné ; un échec est journalisé sans bloquer l'utilisateur. */
    boolean delete(String bucket, String objectPath, String userToken) {
        try {
            var request = base("/object/" + bucket + "/" + objectPath, userToken).DELETE().build();
            int status = http.send(request, HttpResponse.BodyHandlers.discarding()).statusCode();
            if (status >= 200 && status < 300 || status == 400 || status == 404) return true;
            LOG.warnf("Storage delete returned HTTP %d", status);
            return false;
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            return false;
        } catch (IOException | RuntimeException error) {
            LOG.warn("Storage delete failed", error);
            return false;
        }
    }

    private HttpRequest.Builder base(String locator, String userToken) {
        if (userToken == null || userToken.isEmpty()) throw unavailable();
        String internalOrigin = supabaseUrl.orElseThrow(StorageSigner::unavailable).replaceAll("/+$", "");
        String key = publishableKey.orElseThrow(StorageSigner::unavailable);
        return HttpRequest.newBuilder(URI.create(internalOrigin + "/storage/v1" + locator))
                .header("apikey", key)
                .header("Authorization", "Bearer " + userToken)
                .timeout(Duration.ofSeconds(8));
    }

    private String browserOrigin() {
        String internalOrigin = supabaseUrl.orElseThrow(StorageSigner::unavailable).replaceAll("/+$", "");
        return publicUrl.filter(value -> !value.isBlank()).orElse(internalOrigin).replaceAll("/+$", "");
    }

    private static RuntimeException unavailable() {
        return HttpError.unavailable("Le média n’est pas disponible pour le moment.");
    }
}
