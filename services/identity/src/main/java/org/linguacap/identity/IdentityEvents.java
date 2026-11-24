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
import java.util.List;
import org.linguacap.common.Actor;
import org.linguacap.common.Outbox;

/** Exports internes d'Identités pour Suivi. */
@Path("/v1/internal/identity")
@Produces(MediaType.APPLICATION_JSON)
public class IdentityEvents {
    @Inject Actor actor;
    @Inject Database db;
    @Inject ObjectMapper json;
    @Inject Accounts accounts;
    @Inject IdentityStore store;

    /** Lot d'événements après le curseur (ou, pendant la transition, après le numéro donné). */
    @GET
    @Path("/events")
    public ObjectNode export(@QueryParam("cursor") String cursor, @QueryParam("after") @DefaultValue("0") long after,
                             @QueryParam("limit") @DefaultValue("100") int limit) {
        actor.id();
        Outbox.Cursor from = Outbox.cursorParam(cursor);
        return db.read("export events", connection ->
                Outbox.export(connection, json, "identity.outbox_events", "identity", from, after, limit));
    }

    @GET
    @Path("/teacher-profiles")
    public List<IdentityStore.TeacherKpiProfile> teacherProfiles() {
        accounts.requireAdmin();
        return store.teacherKpiProfiles();
    }
}
