package org.linguacap.identity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.linguacap.common.Actor;
import org.linguacap.common.Outbox;

/** Export des événements d'Identités pour Suivi (DEV-074), en route interne lue par lots avec point de reprise. */
@Path("/v1/internal/identity/events")
@Produces(MediaType.APPLICATION_JSON)
public class IdentityEvents {
    @Inject Actor actor;
    @Inject Database db;
    @Inject ObjectMapper json;

    @GET
    public ObjectNode export(@QueryParam("after") @DefaultValue("0") long after, @QueryParam("limit") @DefaultValue("100") int limit) {
        actor.id();
        return db.read("export events", connection ->
                Outbox.read(connection, json, "identity.outbox_events", "identity", Math.max(0, after), limit));
    }
}
