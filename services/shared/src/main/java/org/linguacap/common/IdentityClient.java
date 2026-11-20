package org.linguacap.common;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import java.util.UUID;

@ApplicationScoped
public class IdentityClient {
    @Inject ServiceClient services;
    @ConfigProperty(name = "lingua.services.identity") String base;

    public JsonNode current(UUID actor) {
        return services.request(base, "/v1/me", "GET", actor, null);
    }

    public JsonNode learner(UUID actor, UUID learner) {
        return services.request(base, "/v1/learners/" + learner, "GET", actor, null);
    }

    public JsonNode learners(UUID actor) {
        return services.request(base, "/v1/learners", "GET", actor, null);
    }
}
