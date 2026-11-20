package org.linguacap.common;

import jakarta.enterprise.context.RequestScoped;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import java.util.Optional;
import java.util.UUID;

@RequestScoped
public class Actor {
    public static final String INTERNAL_SECRET = "X-Linguacap-Internal";
    public static final String ID = "X-Linguacap-Actor";
    public static final String EMAIL = "X-Linguacap-Actor-Email";
    public static final String EMAIL_VERIFIED = "X-Linguacap-Actor-Email-Verified";

    @Context HttpHeaders headers;
    @ConfigProperty(name = "lingua.internal-secret") Optional<String> secret;

    public UUID id() {
        if (!Secrets.match(secret.orElse(null), headers.getHeaderString(INTERNAL_SECRET))) {
            throw HttpError.forbidden("Appel interne non autorisé.");
        }
        try {
            return UUID.fromString(headers.getHeaderString(ID));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw HttpError.unauthorized("Identité requise.");
        }
    }

    public String email() {
        id();
        return Optional.ofNullable(headers.getHeaderString(EMAIL)).orElse("");
    }

    public boolean emailVerified() {
        id();
        return "true".equals(headers.getHeaderString(EMAIL_VERIFIED));
    }

    public String token() {
        id();
        String authorization = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return authorization != null && authorization.startsWith("Bearer ")
                ? authorization.substring(7) : "";
    }

    /** Identifiant de la requête d'origine transmis par la passerelle, pour relier traces et événements. */
    public String requestId() {
        String value = headers.getHeaderString("X-Request-Id");
        return value != null && value.matches("[A-Za-z0-9-]{1,64}") ? value : "";
    }
}
