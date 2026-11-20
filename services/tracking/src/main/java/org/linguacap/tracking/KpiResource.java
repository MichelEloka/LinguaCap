package org.linguacap.tracking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

/**
 * Tableau de bord administrateur (DEV-084, DEV-091) : six indicateurs calculés sur les projections locales de Suivi,
 * filtrés par période, niveau de départ, niveau cible, cadence et type de parcours, avec la fraîcheur des données.
 */
@Path("/v1/tracking/kpis")
@Produces(MediaType.APPLICATION_JSON)
public class KpiResource {
    private static final Logger LOG = Logger.getLogger(KpiResource.class);

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;

    @ConfigProperty(name = "lingua.services.identity") String identityUrl;

    @GET
    public ObjectNode kpis(@QueryParam("from") String from, @QueryParam("to") String to,
                           @QueryParam("startLevel") String startLevel, @QueryParam("level") String level,
                           @QueryParam("template") String template, @QueryParam("kind") String kind) {
        UUID callerId = actor.id();
        if (!"admin".equals(identities.current(callerId).path("role").asText())) {
            throw HttpError.forbidden("Les indicateurs sont réservés à l’administration.");
        }
        LocalDate today = OffsetDateTime.now().atZoneSameInstant(KpiRules.PARIS).toLocalDate();
        LocalDate end = date(to, today);
        LocalDate start = date(from, end.minusDays(29));
        if (start.isAfter(end) || start.isBefore(end.minusYears(2))) throw HttpError.badRequest("Choisissez une période de deux ans au plus.");
        check(startLevel, "A0|[ABC][12]");
        check(level, "[ABC][12]");
        check(template, "standard|intensive|custom");
        check(kind, "accompanied|autonomous");
        KpiRules.Filters filters = new KpiRules.Filters(start, end, startLevel, level, template, kind);

        // Parcours accompagné : l'élève a un professeur référent dans Identités.
        Map<String, Boolean> accompanied = new HashMap<>();
        for (JsonNode learner : services.request(identityUrl, "/v1/learners", "GET", callerId, null)) {
            accompanied.put(learner.path("id").asText(), learner.hasNonNull("teacherId"));
        }
        try (Connection connection = dataSource.getConnection()) {
            KpiRules.Dashboard dashboard = KpiRules.compute(filters, OffsetDateTime.now(), invitations(connection),
                    goals(connection, accompanied), sessions(connection), activity(connection), attempts(connection),
                    relances(connection));
            ObjectNode result = json.valueToTree(dashboard);
            ObjectNode applied = result.putObject("filters");
            applied.put("from", start.toString()).put("to", end.toString()).put("startLevel", startLevel)
                    .put("level", level).put("template", template).put("kind", kind);
            result.set("freshness", freshness(connection));
            return result;
        } catch (SQLException error) {
            LOG.errorf("KPI computation failed (SQLSTATE %s)", error.getSQLState());
            throw HttpError.unavailable("Les indicateurs sont temporairement indisponibles.");
        }
    }

    /** Invitations d'élèves avec l'élève qui les a acceptées ; une réémission garde l'identifiant d'origine. */
    private List<KpiRules.Invitation> invitations(Connection connection) throws SQLException {
        Map<String, String> learners = new HashMap<>();
        try (var query = connection.prepareStatement("""
                select data->>'invitationId' as invitation, subject_id from tracking.event_log
                where type = 'identity.account_activated' and data->>'role' = 'learner'
                """); var rows = query.executeQuery()) {
            while (rows.next()) learners.put(rows.getString(1), rows.getString(2));
        }
        List<KpiRules.Invitation> invitations = new ArrayList<>();
        try (var query = connection.prepareStatement("""
                select subject_id, occurred_at from tracking.event_log
                where type = 'identity.invitation_sent' and data->>'role' = 'learner'
                """); var rows = query.executeQuery()) {
            while (rows.next()) {
                invitations.add(new KpiRules.Invitation(rows.getString(1), rows.getObject(2, OffsetDateTime.class),
                        learners.get(rows.getString(1))));
            }
        }
        return invitations;
    }

    private List<KpiRules.Goal> goals(Connection connection, Map<String, Boolean> accompanied) throws SQLException {
        List<KpiRules.Goal> goals = new ArrayList<>();
        try (var query = connection.prepareStatement("""
                select enrollment_id, learner_id, start_level, level_code, template, initial_target_date from tracking.goals
                """); var rows = query.executeQuery()) {
            while (rows.next()) {
                String learnerId = rows.getString("learner_id");
                goals.add(new KpiRules.Goal(rows.getString("enrollment_id"), learnerId, rows.getString("start_level"),
                        rows.getString("level_code"), rows.getString("template"), accompanied.get(learnerId),
                        rows.getObject("initial_target_date", LocalDate.class)));
            }
        }
        return goals;
    }

    private List<KpiRules.Session> sessions(Connection connection) throws SQLException {
        List<KpiRules.Session> sessions = new ArrayList<>();
        try (var query = connection.prepareStatement("""
                select enrollment_id, learner_id, due_at, completed_at, case when superseded then coalesce(superseded_at, due_at) end
                from tracking.sessions
                """); var rows = query.executeQuery()) {
            while (rows.next()) {
                sessions.add(new KpiRules.Session(rows.getString(1), rows.getString(2), rows.getObject(3, OffsetDateTime.class),
                        rows.getObject(4, OffsetDateTime.class), rows.getObject(5, OffsetDateTime.class)));
            }
        }
        return sessions;
    }

    private List<KpiRules.Activity> activity(Connection connection) throws SQLException {
        List<KpiRules.Activity> activity = new ArrayList<>();
        try (var query = connection.prepareStatement("select learner_id, at from tracking.activity"); var rows = query.executeQuery()) {
            while (rows.next()) activity.add(new KpiRules.Activity(rows.getString(1), rows.getObject(2, OffsetDateTime.class)));
        }
        return activity;
    }

    /** État le plus récent de chaque tentative, d'après les événements de remise et de correction. */
    private List<KpiRules.Attempt> attempts(Connection connection) throws SQLException {
        Map<String, KpiRules.Attempt> attempts = new LinkedHashMap<>();
        try (var query = connection.prepareStatement("""
                select type, data::text from tracking.event_log
                where type in ('assessment.attempt_submitted', 'assessment.attempt_graded') order by occurred_at, sequence
                """); var rows = query.executeQuery()) {
            while (rows.next()) {
                JsonNode data = json.readTree(rows.getString(2));
                boolean graded = rows.getString(1).endsWith("_graded");
                Map<String, Integer> scores = new LinkedHashMap<>();
                data.path("scores").properties().forEach(entry -> scores.put(entry.getKey(), entry.getValue().path("percent").asInt()));
                String id = data.path("attemptId").asText();
                KpiRules.Attempt previous = attempts.get(id);
                if (previous != null && "graded".equals(previous.status()) && !graded) continue;
                attempts.put(id, new KpiRules.Attempt(data.path("enrollmentId").asText(), data.path("kind").asText(),
                        graded ? "graded" : "submitted",
                        data.hasNonNull("submittedAt") ? OffsetDateTime.parse(data.path("submittedAt").asText()) : null,
                        graded ? data.path("decision").asText(null) : null, graded ? scores : null));
            }
        } catch (com.fasterxml.jackson.core.JsonProcessingException error) {
            throw new SQLException("Événement d’évaluation illisible", "XX000", error);
        }
        return List.copyOf(attempts.values());
    }

    /** Relances pour un retard : encouragements envoyés en réponse à une alerte. */
    private List<KpiRules.Relance> relances(Connection connection) throws SQLException {
        List<KpiRules.Relance> relances = new ArrayList<>();
        try (var query = connection.prepareStatement(
                "select learner_id, sent_at, resumed_at from tracking.encouragements where alert_id is not null");
             var rows = query.executeQuery()) {
            while (rows.next()) {
                relances.add(new KpiRules.Relance(rows.getString(1), rows.getObject(2, OffsetDateTime.class),
                        rows.getObject(3, OffsetDateTime.class)));
            }
        }
        return relances;
    }

    private ObjectNode freshness(Connection connection) throws SQLException {
        ObjectNode freshness = json.createObjectNode();
        try (var query = connection.prepareStatement("""
                select max(finished_at) filter (where status = 'succeeded'),
                       (array_agg(status order by started_at desc))[1]
                from tracking.job_runs
                """); var rows = query.executeQuery()) {
            rows.next();
            OffsetDateTime synced = rows.getObject(1, OffsetDateTime.class);
            freshness.put("syncedAt", synced == null ? null : synced.toString());
            freshness.put("lastStatus", rows.getString(2));
        }
        return freshness;
    }

    private static LocalDate date(String value, LocalDate fallback) {
        if (value == null || value.isBlank()) return fallback;
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException error) {
            throw HttpError.badRequest("Date invalide : utilisez le format AAAA-MM-JJ.");
        }
    }

    private static void check(String value, String pattern) {
        if (value != null && !value.matches(pattern)) throw HttpError.badRequest("Filtre invalide.");
    }
}
