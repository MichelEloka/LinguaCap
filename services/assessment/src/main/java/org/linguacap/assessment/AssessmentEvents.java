package org.linguacap.assessment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.sql.Connection;
import java.sql.SQLException;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.Outbox;

/** Export des remises et corrections pour Suivi (DEV-073, DEV-074), lu par lots avec point de reprise. */
@Path("/v1/internal/assessments/events")
@Produces(MediaType.APPLICATION_JSON)
public class AssessmentEvents {
    private static final Logger LOG = Logger.getLogger(AssessmentEvents.class);

    @Inject Actor actor;
    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @GET
    public ObjectNode export(@QueryParam("after") @DefaultValue("0") long after, @QueryParam("limit") @DefaultValue("100") int limit) {
        actor.id();
        try (Connection connection = dataSource.getConnection()) {
            return Outbox.read(connection, json, "assessment.outbox_events", "assessment", Math.max(0, after), limit);
        } catch (SQLException error) {
            LOG.errorf("Assessment event export failed (SQLSTATE %s)", error.getSQLState());
            throw HttpError.unavailable("Les événements d’évaluation sont temporairement indisponibles.");
        }
    }
}
