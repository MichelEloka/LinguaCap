package org.linguacap.tracking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

@Path("/v1/tracking")
@Produces(MediaType.APPLICATION_JSON)
public class TrackingResource {
    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "lingua.services.identity")
    String identityUrl;

    @ConfigProperty(name = "lingua.services.learning")
    String learningUrl;

    @GET
    @Path("/overview")
    public ObjectNode overview(@QueryParam("learnerId") String requestedLearnerId) {
        UUID callerId = actor.id();
        String role = identities.current(callerId).path("role").asText();
        if (!isEducator(role)) {
            throw HttpError.forbidden("Le suivi des élèves est réservé aux comptes habilités.");
        }
        JsonNode roster = requestedLearnerId == null
                ? services.request(identityUrl, "/v1/learners", "GET", callerId, null)
                : mapper.createArrayNode().add(identities.learner(callerId, readLearnerId(requestedLearnerId)));
        if (!roster.isArray()) {
            throw HttpError.unavailable("La liste des élèves est indisponible.");
        }
        ArrayNode entries = mapper.createArrayNode();
        int goals = 0;
        int withResults = 0;
        for (JsonNode profile : roster) {
            String learnerId = profile.path("id").asText();
            if (learnerId.isBlank()) {
                throw HttpError.unavailable("La liste des élèves est incomplète.");
            }
            JsonNode progress = services.request(learningUrl,
                    "/v1/learning/progress?learnerId=" + readLearnerId(learnerId), "GET", callerId, null);
            JsonNode results = progress.path("results");
            if (!results.isArray()) {
                throw HttpError.unavailable("Les résultats d’un élève sont indisponibles.");
            }
            ObjectNode entry = entries.addObject();
            entry.put("learnerId", learnerId);
            entry.set("profile", profile);
            entry.set("progress", progress);
            entry.set("results", results);
            if (progress.path("goal").isObject()) {
                goals++;
            }
            if (!results.isEmpty()) {
                withResults++;
            }
        }
        ObjectNode overview = mapper.createObjectNode();
        overview.set("learners", entries);
        overview.put("learnerCount", entries.size());
        overview.put("goalsCount", goals);
        overview.put("learnersWithResults", withResults);
        return overview;
    }

    @GET
    @Path("/messages")
    public List<Message> messages(@QueryParam("learnerId") String requestedLearnerId) {
        UUID callerId = actor.id();
        String role = identities.current(callerId).path("role").asText();
        UUID learnerId;
        if ("learner".equals(role)) {
            if (requestedLearnerId != null && !callerId.equals(readLearnerId(requestedLearnerId))) {
                throw HttpError.forbidden("Ces messages appartiennent à un autre élève.");
            }
            learnerId = callerId;
        } else if (isEducator(role)) {
            learnerId = readLearnerId(requestedLearnerId);
            identities.learner(callerId, learnerId);
        } else {
            throw HttpError.forbidden("Ce compte ne peut pas consulter les messages.");
        }
        String sql = """
                SELECT id, learner_id, author_id, text, sent_at
                FROM tracking.encouragements
                WHERE learner_id = ?
                ORDER BY sent_at DESC, id DESC
                """;
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, learnerId);
            try (var rows = statement.executeQuery()) {
                List<Message> messages = new ArrayList<>();
                while (rows.next()) {
                    messages.add(readMessage(rows));
                }
                return messages;
            }
        } catch (SQLException ignored) {
            throw HttpError.unavailable("Les encouragements de cet élève sont indisponibles.");
        }
    }

    @POST
    @Path("/messages")
    @Consumes(MediaType.APPLICATION_JSON)
    public Message sendMessage(MessageRequest request) {
        UUID callerId = actor.id();
        if (!"teacher".equals(identities.current(callerId).path("role").asText())) {
            throw HttpError.forbidden("Seul le professeur référent peut envoyer un encouragement.");
        }
        if (request == null || request.text() == null) {
            throw HttpError.badRequest("Écris un encouragement avant de l’envoyer.");
        }
        UUID learnerId = readLearnerId(request.learnerId());
        identities.learner(callerId, learnerId);
        String text = request.text().strip();
        if (text.isEmpty() || text.codePointCount(0, text.length()) > 500
                || text.codePoints().anyMatch(c -> Character.isISOControl(c) && c != '\n' && c != '\t')) {
            throw HttpError.badRequest("L’encouragement doit contenir entre 1 et 500 caractères de texte.");
        }
        String sql = """
                INSERT INTO tracking.encouragements (learner_id, author_id, text)
                VALUES (?, ?, ?)
                RETURNING id, learner_id, author_id, text, sent_at
                """;
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, learnerId);
            statement.setObject(2, callerId);
            statement.setString(3, text);
            try (var rows = statement.executeQuery()) {
                if (rows.next()) {
                    return readMessage(rows);
                }
            }
        } catch (SQLException ignored) {
            throw HttpError.unavailable("L’encouragement n’a pas pu être envoyé.");
        }
        throw HttpError.unavailable("L’encouragement n’a pas pu être envoyé.");
    }

    /**
     * Fiche élève du professeur référent ou de l’administration (DEV-033) : profil, parcours et séances,
     * objectif, résultats et encouragements, lus auprès des services propriétaires.
     */
    @GET
    @Path("/learners/{id}")
    public ObjectNode learner(@PathParam("id") String requestedLearnerId) {
        UUID callerId = actor.id();
        if (!isEducator(identities.current(callerId).path("role").asText())) {
            throw HttpError.forbidden("La fiche élève est réservée au professeur référent et à l’administration.");
        }
        UUID learnerId = readLearnerId(requestedLearnerId);
        JsonNode profile = identities.learner(callerId, learnerId);
        JsonNode enrollment = services.request(learningUrl, "/v1/learning/enrollment?learnerId=" + learnerId,
                "GET", callerId, null);
        JsonNode progress = services.request(learningUrl, "/v1/learning/progress?learnerId=" + learnerId,
                "GET", callerId, null);
        ObjectNode sheet = mapper.createObjectNode();
        sheet.set("profile", profile);
        sheet.set("enrollment", enrollment);
        sheet.set("goal", progress.path("goal"));
        sheet.set("results", progress.path("results"));
        sheet.put("completedCount", progress.path("completedCount").asInt());
        sheet.set("messages", mapper.valueToTree(messagesFor(learnerId)));
        return sheet;
    }

    private List<Message> messagesFor(UUID learnerId) {
        String sql = """
                SELECT id, learner_id, author_id, text, sent_at
                FROM tracking.encouragements
                WHERE learner_id = ?
                ORDER BY sent_at DESC, id DESC
                """;
        try (var connection = dataSource.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, learnerId);
            try (var rows = statement.executeQuery()) {
                List<Message> messages = new ArrayList<>();
                while (rows.next()) {
                    messages.add(readMessage(rows));
                }
                return messages;
            }
        } catch (SQLException ignored) {
            throw HttpError.unavailable("Les encouragements de cet élève sont indisponibles.");
        }
    }

    private static Message readMessage(ResultSet row) throws SQLException {
        return new Message(row.getObject("id", UUID.class).toString(),
                row.getObject("learner_id", UUID.class).toString(),
                row.getObject("author_id", UUID.class).toString(), row.getString("text"),
                row.getObject("sent_at", OffsetDateTime.class).toString());
    }

    private static boolean isEducator(String role) {
        return "teacher".equals(role) || "admin".equals(role);
    }

    private static UUID readLearnerId(String value) {
        if (value != null) {
            try {
                UUID id = UUID.fromString(value);
                if (id.toString().equalsIgnoreCase(value)) {
                    return id;
                }
            } catch (IllegalArgumentException ignored) {
                // Both invalid shapes use the same response.
            }
        }
        throw HttpError.badRequest("Sélectionne un élève avec un identifiant valide.");
    }

    public record MessageRequest(String learnerId, String text) {}

    public record Message(String id, String learnerId, String authorId, String text, String sentAt) {}
}
