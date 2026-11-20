package org.linguacap.tracking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.Secrets;

/**
 * Traitement périodique du suivi (DEV-080), appelé par Cloud Scheduler avec l'identité de service dédiée. Cloud Run
 * vérifie le jeton OIDC avant l'appel ; le service contrôle en plus que le jeton porte le compte attendu. En recette,
 * le secret interne permet de déclencher le même traitement.
 */
@Path("/v1/internal/tracking/jobs")
@Produces(MediaType.APPLICATION_JSON)
public class TrackingJobs {
    @Context HttpHeaders headers;
    @Inject TrackingSync sync;
    @Inject ObjectMapper json;

    @ConfigProperty(name = "lingua.internal-secret") Optional<String> secret;
    @ConfigProperty(name = "lingua.cloud-run") boolean cloudRun;
    @ConfigProperty(name = "lingua.scheduler-account") Optional<String> schedulerAccount;

    /** Import des événements, mise à jour des synthèses et contrôle des alertes. */
    @POST
    @Path("/sync")
    public TrackingSync.Summary runSync() {
        authorize();
        return sync.sync();
    }

    /** Reconstruction des synthèses à partir du journal des événements. */
    @POST
    @Path("/rebuild")
    public TrackingSync.Summary rebuild() {
        authorize();
        return sync.rebuild();
    }

    private void authorize() {
        if (Secrets.match(secret.orElse(null), headers.getHeaderString(Actor.INTERNAL_SECRET))) return;
        if (cloudRun && schedulerAccount.filter(account -> !account.isBlank()).isPresent()
                && schedulerAccount.get().equals(tokenEmail(headers.getHeaderString(HttpHeaders.AUTHORIZATION)))) {
            return;
        }
        throw HttpError.forbidden("Traitement réservé à la planification du suivi.");
    }

    /** Compte porté par le jeton OIDC que Cloud Run a déjà vérifié avant de transmettre la requête. */
    private String tokenEmail(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        String[] parts = authorization.substring(7).split("\\.");
        if (parts.length != 3) return null;
        try {
            JsonNode claims = json.readTree(new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8));
            return claims.path("email_verified").asBoolean(false) ? claims.path("email").asText(null) : null;
        } catch (IllegalArgumentException | java.io.IOException error) {
            return null;
        }
    }
}
