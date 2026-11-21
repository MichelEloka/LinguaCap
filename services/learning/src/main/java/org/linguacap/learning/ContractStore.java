package org.linguacap.learning;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;
import org.linguacap.learning.Planner.Day;

/** Contrats numérotés d'un parcours (schéma learning) ; les écritures se font dans la transaction de l'action. */
@ApplicationScoped
class ContractStore {
    private static final Logger LOG = Logger.getLogger(ContractStore.class);
    private static final String COLUMNS = """
            c.path_id, c.number, c.status, c.proposed_by, c.proposer_id, c.start_level, c.target_level, c.start_date,
            c.target_date, c.weekly_minutes, c.availability::text as availability, c.required_minutes, c.difficulty,
            c.note, c.created_at, c.decided_at, c.decided_by, c.decision_note
            """;

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;
    @Inject LearningEvents events;

    /** Conditions d'un contrat : niveaux, dates, engagement hebdomadaire minimal, jours, charge et difficulté. */
    record Terms(String startLevel, String targetLevel, LocalDate startDate, LocalDate targetDate, int weeklyMinutes,
                 List<Day> availability, int requiredMinutes, String difficulty) {}

    record ContractRow(UUID pathId, int number, String status, String proposedBy, UUID proposerId, Terms terms,
                       String note, OffsetDateTime createdAt, OffsetDateTime decidedAt, UUID decidedBy,
                       String decisionNote) {}

    /** Proposition en attente du professeur, avec l'élève et l'objectif du parcours. */
    record PendingRow(ContractRow contract, UUID learnerId, String languageId, String startLevel, String targetLevel,
                      LocalDate targetDate, String pathStatus) {}

    /** Contrats du parcours, les plus récents d'abord. */
    List<ContractRow> list(UUID pathId) {
        return read("read contracts", connection -> {
            List<ContractRow> contracts = new ArrayList<>();
            try (var query = connection.prepareStatement(
                    "select " + COLUMNS + " from learning.contracts c where c.path_id = ? order by c.number desc")) {
                query.setObject(1, pathId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) contracts.add(row(rows));
                }
            }
            return contracts;
        });
    }

    /** Propositions en attente du professeur pour ces élèves (tous les élèves si la liste est nulle). */
    List<PendingRow> pendingForTeacher(Collection<UUID> learnerIds) {
        return read("read pending contracts", connection -> {
            List<PendingRow> pending = new ArrayList<>();
            try (var query = connection.prepareStatement("select " + COLUMNS + """
                    , p.learner_id, p.language_id, p.start_level as path_start_level,
                      p.target_level as path_target_level, p.target_date as path_target_date, p.status as path_status
                    from learning.contracts c join learning.paths p on p.id = c.path_id
                    where c.status = 'pending_teacher' and p.status = 'active'
                      and (?::uuid[] is null or p.learner_id = any(?::uuid[]))
                    order by c.created_at
                    """)) {
                var ids = learnerIds == null ? null : connection.createArrayOf("uuid", learnerIds.toArray());
                query.setArray(1, ids);
                query.setArray(2, ids);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        pending.add(new PendingRow(row(rows), rows.getObject("learner_id", UUID.class),
                                rows.getString("language_id"), rows.getString("path_start_level"),
                                rows.getString("path_target_level"), rows.getObject("path_target_date", LocalDate.class),
                                rows.getString("path_status")));
                    }
                }
            }
            return pending;
        });
    }

    ContractRow find(Connection connection, UUID pathId, int number) throws SQLException {
        try (var query = connection.prepareStatement(
                "select " + COLUMNS + " from learning.contracts c where c.path_id = ? and c.number = ? for update")) {
            query.setObject(1, pathId);
            query.setInt(2, number);
            try (var rows = query.executeQuery()) {
                return rows.next() ? row(rows) : null;
            }
        }
    }

    ContractRow pending(Connection connection, UUID pathId) throws SQLException {
        return one(connection, pathId, "pending_teacher', 'pending_learner");
    }

    ContractRow accepted(Connection connection, UUID pathId) throws SQLException {
        return one(connection, pathId, "accepted");
    }

    private ContractRow one(Connection connection, UUID pathId, String statuses) throws SQLException {
        try (var query = connection.prepareStatement("select " + COLUMNS
                + " from learning.contracts c where c.path_id = ? and c.status in ('" + statuses + "') for update")) {
            query.setObject(1, pathId);
            try (var rows = query.executeQuery()) {
                return rows.next() ? row(rows) : null;
            }
        }
    }

    /**
     * Enregistre un contrat numéroté. Un contrat accepté d'office (élève autonome, attribution par le professeur,
     * reprise) est décidé aussitôt ; l'ancien contrat en vigueur doit avoir été remplacé avant.
     */
    int insert(Connection connection, UUID pathId, String status, String proposedBy, UUID proposerId, Terms terms,
               String note, UUID decidedBy) throws SQLException {
        int number;
        try (var next = connection.prepareStatement(
                "select coalesce(max(number), 0) + 1 from learning.contracts where path_id = ?")) {
            next.setObject(1, pathId);
            try (var rows = next.executeQuery()) {
                rows.next();
                number = rows.getInt(1);
            }
        }
        boolean accepted = ContractRules.ACCEPTED.equals(status);
        try (var insert = connection.prepareStatement("""
                insert into learning.contracts (path_id, number, status, proposed_by, proposer_id, start_level,
                    target_level, start_date, target_date, weekly_minutes, availability, required_minutes, difficulty,
                    note, decided_at, decided_by)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?, case when ? then now() end, ?)
                """)) {
            insert.setObject(1, pathId);
            insert.setInt(2, number);
            insert.setString(3, status);
            insert.setString(4, proposedBy);
            insert.setObject(5, proposerId);
            insert.setString(6, terms.startLevel());
            insert.setString(7, terms.targetLevel());
            insert.setObject(8, terms.startDate());
            insert.setObject(9, terms.targetDate());
            insert.setInt(10, terms.weeklyMinutes());
            insert.setString(11, json.valueToTree(terms.availability() == null ? List.of() : terms.availability()).toString());
            insert.setInt(12, terms.requiredMinutes());
            insert.setString(13, terms.difficulty());
            insert.setString(14, note);
            insert.setBoolean(15, accepted);
            insert.setObject(16, accepted ? decidedBy : null);
            insert.executeUpdate();
        }
        events.contract(connection, pathId, number, "learning.contract_proposed");
        if (accepted) events.contract(connection, pathId, number, "learning.contract_accepted");
        return number;
    }

    /** Change l'état d'un contrat (accepté, refusé, retiré ou remplacé) et émet l'événement correspondant. */
    void close(Connection connection, UUID pathId, int number, String status, UUID decidedBy, String decisionNote)
            throws SQLException {
        boolean decision = !ContractRules.SUPERSEDED.equals(status);
        try (var update = connection.prepareStatement("""
                update learning.contracts set status = ?,
                    decided_at = case when ? then now() else decided_at end,
                    decided_by = case when ? then ? else decided_by end,
                    decision_note = case when ? then ? else decision_note end
                where path_id = ? and number = ?
                """)) {
            update.setString(1, status);
            update.setBoolean(2, decision);
            update.setBoolean(3, decision);
            update.setObject(4, decidedBy);
            update.setBoolean(5, decision && decisionNote != null);
            update.setString(6, decisionNote);
            update.setObject(7, pathId);
            update.setInt(8, number);
            if (update.executeUpdate() == 0) throw HttpError.notFound("Contrat introuvable.");
        }
        String type = switch (status) {
            case ContractRules.ACCEPTED -> "learning.contract_accepted";
            case ContractRules.REJECTED -> "learning.contract_rejected";
            case ContractRules.WITHDRAWN -> "learning.contract_withdrawn";
            default -> null;
        };
        if (type != null) events.contract(connection, pathId, number, type);
    }

    private ContractRow row(ResultSet rows) throws SQLException {
        List<Day> days = new ArrayList<>();
        try {
            for (var day : json.readTree(rows.getString("availability"))) {
                days.add(new Day(day.path("weekday").asInt(), day.path("sessions").asInt(), day.path("minutes").asInt()));
            }
        } catch (Exception error) {
            days = List.of();
        }
        Terms terms = new Terms(rows.getString("start_level"), rows.getString("target_level"),
                rows.getObject("start_date", LocalDate.class), rows.getObject("target_date", LocalDate.class),
                rows.getInt("weekly_minutes"), List.copyOf(days), rows.getInt("required_minutes"),
                rows.getString("difficulty"));
        return new ContractRow(rows.getObject("path_id", UUID.class), rows.getInt("number"), rows.getString("status"),
                rows.getString("proposed_by"), rows.getObject("proposer_id", UUID.class), terms, rows.getString("note"),
                rows.getObject("created_at", OffsetDateTime.class), rows.getObject("decided_at", OffsetDateTime.class),
                rows.getObject("decided_by", UUID.class), rows.getString("decision_note"));
    }

    private <T> T read(String operation, PathStore.Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            return work.run(connection);
        } catch (SQLException error) {
            LOG.errorf("Learning database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
            throw HttpError.unavailable("Le contrat est temporairement indisponible.");
        }
    }
}
