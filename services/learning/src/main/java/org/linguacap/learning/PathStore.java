package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Array;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.linguacap.common.HttpError;
import org.linguacap.learning.Planner.Day;

/**
 * Parcours multi-niveaux du schéma learning : niveaux, jours, révisions du planning global, ajouts de cours, démarrage,
 * validation, ouverture du niveau suivant et fin du parcours. Chaque niveau ouvert reste une inscription.
 */
@ApplicationScoped
class PathStore {
    private static final Logger LOG = Logger.getLogger(PathStore.class);
    private static final String PATH_COLUMNS = """
            id, learner_id, language_id, status, start_level, target_level, start_date, target_date, initial_target_date,
            weekly_minutes, required_minutes, difficulty, placement_attempt_id, origin, validated_revision,
            availability_confirmed_at, paused_at, resume_date, created_by, created_at, ended_at
            """;
    private static final String REVISION_COLUMNS = """
            path_id, number, base_revision, status, start_date, target_date, availability::text as availability,
            plan::text as plan, capacity_minutes, required_minutes, overflow_count, difficulty, created_by, created_at,
            validated_by, validated_at
            """;
    private static final String ADDITION_COLUMNS = """
            a.id, a.path_id, a.step_id, a.source_version_id, a.source_level_code, a.module_id, a.activity_id, a.title,
            a.minutes, a.placement, a.note, a.added_by, a.added_at, a.removed_at, a.removed_by, s.level_code as step_level,
            s.enrollment_id as step_enrollment_id
            """;

    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper json;
    @Inject LearningEvents events;
    @Inject GoalStore goals;
    @Inject ContractStore contracts;

    @FunctionalInterface
    interface Work<T> {
        T run(Connection connection) throws SQLException;
    }

    record PathRow(UUID id, UUID learnerId, String languageId, String status, String startLevel, String targetLevel,
                   LocalDate startDate, LocalDate targetDate, LocalDate initialTargetDate, int weeklyMinutes,
                   int requiredMinutes, String difficulty, UUID placementAttemptId, String origin, int validatedRevision,
                   OffsetDateTime availabilityConfirmedAt, OffsetDateTime pausedAt, LocalDate resumeDate,
                   UUID createdBy, OffsetDateTime createdAt, OffsetDateTime endedAt) {
        boolean open() {
            return "draft".equals(status) || "active".equals(status);
        }
    }

    /** Niveau du parcours, avec l'état de son inscription quand il est ouvert. */
    record StepRow(UUID id, UUID pathId, int rank, String levelCode, UUID trackVersionId, int trackVersionNumber,
                   String status, UUID enrollmentId, OffsetDateTime activatedAt, OffsetDateTime completedAt,
                   String goalStatus, List<String> acquiredModules, boolean prerequisiteMet) {}

    record RevisionRow(UUID pathId, int number, int baseRevision, String status, LocalDate startDate, LocalDate targetDate,
                       JsonNode availability, JsonNode plan, int capacityMinutes, int requiredMinutes, int overflowCount,
                       String difficulty, UUID createdBy, OffsetDateTime createdAt, UUID validatedBy,
                       OffsetDateTime validatedAt) {}

    record AdditionRow(UUID id, UUID pathId, UUID stepId, UUID sourceVersionId, String sourceLevelCode, String moduleId,
                       String activityId, String title, int minutes, String placement, String note, UUID addedBy,
                       OffsetDateTime addedAt, OffsetDateTime removedAt, UUID removedBy, String stepLevel,
                       UUID stepEnrollmentId) {}

    /** Niveau retenu pour un parcours : rang, code et version publiée. */
    record LevelChoice(int rank, String levelCode, UUID trackVersionId, int trackVersionNumber) {}

    // --- Lecture ---------------------------------------------------------------------------------------------

    PathRow byId(UUID pathId) {
        return read("read path", connection -> path(connection, "where id = ?", pathId, false));
    }

    /** Parcours ouvert de l'élève (brouillon ou actif), sinon le plus récent. */
    PathRow latest(UUID learnerId) {
        return read("read path", connection -> path(connection,
                "where learner_id = ? order by (status in ('draft', 'active')) desc, created_at desc limit 1", learnerId, false));
    }

    /** Parcours auquel appartient une inscription, ou null pour une inscription antérieure aux parcours. */
    PathRow ofEnrollment(UUID enrollmentId) {
        return read("read path", connection -> path(connection,
                "where id = (select path_id from learning.path_steps where enrollment_id = ?)", enrollmentId, false));
    }

    List<StepRow> steps(UUID pathId) {
        return read("read path steps", connection -> steps(connection, pathId));
    }

    List<Day> availability(UUID pathId) {
        return read("read path availability", connection -> availability(connection, pathId));
    }

    /** Dernière proposition en attente, sinon la dernière révision validée. */
    RevisionRow proposal(UUID pathId) {
        return read("read path proposal", connection -> revision(connection, """
                where path_id = ? and status in ('proposed', 'validated')
                order by (status = 'proposed') desc, number desc limit 1
                """, pathId, null));
    }

    RevisionRow validated(UUID pathId) {
        return read("read validated plan", connection -> revision(connection,
                "where path_id = ? and status = 'validated' order by number desc limit 1", pathId, null));
    }

    RevisionRow revision(UUID pathId, int number) {
        return read("read path revision", connection -> revision(connection, "where path_id = ? and number = ?", pathId, number));
    }

    /** Ajouts du parcours, dans l'ordre où ils ont été faits (retirés compris). */
    List<AdditionRow> additions(UUID pathId) {
        return read("read additions", connection -> {
            List<AdditionRow> additions = new ArrayList<>();
            try (var query = connection.prepareStatement("select " + ADDITION_COLUMNS + """
                    from learning.path_additions a join learning.path_steps s on s.id = a.step_id
                    where a.path_id = ? order by a.added_at, a.id
                    """)) {
                query.setObject(1, pathId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) additions.add(addition(rows));
                }
            }
            return additions;
        });
    }

    AdditionRow addition(UUID additionId) {
        return read("read addition", connection -> {
            try (var query = connection.prepareStatement("select " + ADDITION_COLUMNS
                    + " from learning.path_additions a join learning.path_steps s on s.id = a.step_id where a.id = ?")) {
                query.setObject(1, additionId);
                try (var rows = query.executeQuery()) {
                    return rows.next() ? addition(rows) : null;
                }
            }
        });
    }

    // --- Création et objectif ------------------------------------------------------------------------------

    /** Brouillon issu de l'accueil : niveaux prévus, jours proposés, événement learning.path_created. */
    UUID createDraft(UUID learnerId, String languageId, String startLevel, String targetLevel, LocalDate start,
                     LocalDate target, int weeklyMinutes, int requiredMinutes, String difficulty, UUID placementAttemptId,
                     List<LevelChoice> levels, List<Day> days) {
        return transaction("create path", connection -> {
            if (path(connection, "where learner_id = ? and status in ('draft', 'active') limit 1", learnerId, true) != null) {
                throw HttpError.conflict("Un parcours est déjà en préparation ou en cours : modifiez-le plutôt que d’en créer un autre.");
            }
            UUID pathId = insertPath(connection, learnerId, languageId, "draft", startLevel, targetLevel, start, target,
                    weeklyMinutes, requiredMinutes, difficulty, placementAttemptId, "onboarding", learnerId);
            syncSteps(connection, pathId, levels);
            writeAvailability(connection, pathId, days);
            events.path(connection, pathId, "learning.path_created");
            return pathId;
        });
    }

    /** Nouvel objectif d'un brouillon : niveaux et dates ; les niveaux qui sortent du parcours sont retirés. */
    void updateObjective(UUID pathId, String startLevel, String targetLevel, LocalDate start, LocalDate target,
                         int weeklyMinutes, int requiredMinutes, String difficulty, List<LevelChoice> levels) {
        transaction("update objective", connection -> {
            PathRow path = lock(connection, pathId);
            if (!"draft".equals(path.status())) {
                throw HttpError.conflict("L’objectif d’un parcours démarré se modifie par un avenant au contrat.");
            }
            try (var update = connection.prepareStatement("""
                    update learning.paths set start_level = ?, target_level = ?, start_date = ?, target_date = ?,
                        initial_target_date = ?, weekly_minutes = ?, required_minutes = ?, difficulty = ?, updated_at = now()
                    where id = ?
                    """)) {
                update.setString(1, startLevel);
                update.setString(2, targetLevel);
                update.setObject(3, start);
                update.setObject(4, target);
                update.setObject(5, target);
                update.setInt(6, weeklyMinutes);
                update.setInt(7, requiredMinutes);
                update.setString(8, difficulty);
                update.setObject(9, pathId);
                update.executeUpdate();
            }
            syncSteps(connection, pathId, levels);
            return null;
        });
    }

    /** Jours choisis pendant l'accueil (brouillon) ; la date cible peut encore changer. */
    void confirmDraftAvailability(UUID pathId, List<Day> days, LocalDate target) {
        transaction("update path availability", connection -> {
            PathRow path = lock(connection, pathId);
            if (!"draft".equals(path.status())) throw HttpError.conflict("Ce parcours a déjà démarré.");
            writeAvailability(connection, pathId, days);
            try (var update = connection.prepareStatement("""
                    update learning.paths set availability_confirmed_at = now(), target_date = coalesce(?, target_date),
                        initial_target_date = coalesce(?, initial_target_date), updated_at = now()
                    where id = ?
                    """)) {
                update.setObject(1, target);
                update.setObject(2, target);
                update.setObject(3, pathId);
                update.executeUpdate();
            }
            return null;
        });
    }

    /**
     * Parcours d'un niveau créé par l'attribution historique d'un professeur (POST /learning/enrollments) : niveau
     * actif, inscription en préparation, jours du modèle. Un brouillon de l'élève est abandonné au profit de
     * l'attribution. Renvoie {pathId, enrollmentId}.
     */
    UUID[] createAssigned(UUID learnerId, String languageId, LevelChoice level, UUID assignedBy, String startLevel,
                          LocalDate start, LocalDate target, String template, String prerequisiteLevel,
                          boolean prerequisiteMet, List<Day> days) {
        return transaction("assign path", connection -> {
            try (var withdraw = connection.prepareStatement("""
                    update learning.paths set status = 'withdrawn', ended_at = now(), updated_at = now()
                    where learner_id = ? and status = 'draft'
                    """)) {
                withdraw.setObject(1, learnerId);
                withdraw.executeUpdate();
            }
            if (path(connection, "where learner_id = ? and status = 'active' limit 1", learnerId, true) != null) {
                throw HttpError.conflict("Un parcours est déjà en cours pour cet élève.");
            }
            UUID pathId = insertPath(connection, learnerId, languageId, "active", startLevel, level.levelCode(), start,
                    target, 0, 0, "moderate", null, "assignment", assignedBy);
            UUID enrollmentId = goals.insertEnrollment(connection, learnerId, level.levelCode(), level.trackVersionId(),
                    level.trackVersionNumber(), assignedBy, startLevel, start, target, template, "preparing",
                    prerequisiteLevel, prerequisiteMet, days);
            UUID stepId = insertStep(connection, pathId, level, "active", enrollmentId);
            writeAvailability(connection, pathId, days);
            try (var confirm = connection.prepareStatement(
                    "update learning.paths set availability_confirmed_at = now() where id = ?")) {
                confirm.setObject(1, pathId);
                confirm.executeUpdate();
            }
            events.path(connection, pathId, "learning.path_created");
            events.pathStepActivated(connection, stepId);
            events.path(connection, pathId, "learning.path_started");
            return new UUID[] {pathId, enrollmentId};
        });
    }

    /** Contrat n°1 accepté d'office (attribution par le professeur), avec les conditions de la première proposition. */
    void acceptInitialContract(UUID pathId, String proposedBy, UUID proposerId, ContractStore.Terms terms) {
        transaction("initial contract", connection -> {
            lock(connection, pathId);
            if (contracts.accepted(connection, pathId) != null || contracts.pending(connection, pathId) != null) return null;
            contracts.insert(connection, pathId, ContractRules.ACCEPTED, proposedBy, proposerId, terms, null, proposerId);
            updateLoad(connection, pathId, terms.weeklyMinutes(), terms.requiredMinutes(), terms.difficulty());
            return null;
        });
    }

    // --- Propositions et validation ------------------------------------------------------------------------

    /** Enregistre une proposition fondée sur le planning en vigueur ; la précédente proposition en attente est écartée. */
    int saveProposal(UUID pathId, LocalDate start, LocalDate target, List<Day> availability, JsonNode plan, int capacity,
                     int required, int overflow, String difficulty, UUID createdBy) {
        return transaction("save path proposal", connection -> {
            PathRow path = lock(connection, pathId);
            try (var discard = connection.prepareStatement(
                    "update learning.path_revisions set status = 'discarded' where path_id = ? and status = 'proposed'")) {
                discard.setObject(1, pathId);
                discard.executeUpdate();
            }
            int number;
            try (var next = connection.prepareStatement(
                    "select coalesce(max(number), 0) + 1 from learning.path_revisions where path_id = ?")) {
                next.setObject(1, pathId);
                try (var rows = next.executeQuery()) {
                    rows.next();
                    number = rows.getInt(1);
                }
            }
            try (var insert = connection.prepareStatement("""
                    insert into learning.path_revisions (path_id, number, base_revision, start_date, target_date,
                        availability, plan, capacity_minutes, required_minutes, overflow_count, difficulty, created_by)
                    values (?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?, ?, ?, ?)
                    """)) {
                insert.setObject(1, pathId);
                insert.setInt(2, number);
                insert.setInt(3, path.validatedRevision());
                insert.setObject(4, start);
                insert.setObject(5, target);
                insert.setString(6, json.valueToTree(availability).toString());
                insert.setString(7, plan.toString());
                insert.setInt(8, capacity);
                insert.setInt(9, required);
                insert.setInt(10, overflow);
                insert.setString(11, difficulty);
                insert.setObject(12, createdBy);
                insert.executeUpdate();
            }
            // Rien n'est encore en vigueur dans un brouillon : la charge affichée suit la dernière proposition.
            if ("draft".equals(path.status())) updateLoad(connection, pathId, path.weeklyMinutes(), required, difficulty);
            return number;
        });
    }

    /**
     * Démarrage d'un brouillon par l'élève : inscription du premier niveau, séances, parcours actif et contrat n°1
     * (en attente du professeur pour un élève suivi, qui peut commencer tout de suite ; accepté d'office sinon).
     */
    void start(UUID pathId, int number, boolean accompanied) {
        transaction("start path", connection -> {
            PathRow path = lock(connection, pathId);
            if (!"draft".equals(path.status())) throw HttpError.conflict("Ce parcours a déjà démarré.");
            RevisionRow revision = checkedRevision(connection, path, number);
            PathRules.checkObjective(revision.difficulty());
            List<StepRow> steps = steps(connection, pathId);
            StepRow first = steps.stream().filter(step -> "planned".equals(step.status())).findFirst()
                    .orElseThrow(() -> HttpError.conflict("Ce parcours ne comporte aucun niveau à ouvrir."));
            List<Day> days = PathPlanner.parseDays(revision.availability());
            List<PathPlanner.PlannedSession> planned = PathPlanner.parseSessions(revision.plan().path("sessions"), first.levelCode());
            LocalDate levelTarget = levelTarget(path, steps, first, planned, revision.startDate());
            String prerequisite = PathRules.levelOfRank(first.rank() - 1);
            UUID enrollmentId = goals.insertEnrollment(connection, path.learnerId(), first.levelCode(),
                    first.trackVersionId(), first.trackVersionNumber(), path.learnerId(), path.startLevel(),
                    revision.startDate(), levelTarget, "custom", "active", prerequisite, true, days);
            activateStep(connection, first.id(), enrollmentId);
            goals.replaceSessions(connection, enrollmentId, number, sessionsOf(revision.plan(), first.levelCode()));
            markValidated(connection, pathId, number, path.learnerId());
            int weekly = PathRules.commitment(PathRules.requiredWeeklyMinutes(revision.requiredMinutes(),
                    revision.startDate(), revision.targetDate()), days);
            try (var update = connection.prepareStatement("""
                    update learning.paths set status = 'active', validated_revision = ?, start_date = ?, weekly_minutes = ?,
                        required_minutes = ?, difficulty = ?, availability_confirmed_at = coalesce(availability_confirmed_at, now()),
                        updated_at = now()
                    where id = ?
                    """)) {
                update.setInt(1, number);
                update.setObject(2, revision.startDate());
                update.setInt(3, weekly);
                update.setInt(4, revision.requiredMinutes());
                update.setString(5, revision.difficulty());
                update.setObject(6, pathId);
                update.executeUpdate();
            }
            writeAvailability(connection, pathId, days);
            setEnrollmentRevision(connection, enrollmentId, number, levelTarget);
            events.planValidated(connection, enrollmentId, number);
            events.path(connection, pathId, "learning.path_started");
            ContractStore.Terms terms = new ContractStore.Terms(path.startLevel(), path.targetLevel(), revision.startDate(),
                    path.targetDate(), weekly, days, revision.requiredMinutes(), revision.difficulty());
            contracts.insert(connection, pathId, accompanied ? ContractRules.PENDING_TEACHER : ContractRules.ACCEPTED,
                    "learner", path.learnerId(), terms, null, null);
            return null;
        });
    }

    /**
     * Valide une révision du planning global : les séances non terminées du niveau actif sont remplacées, les jours
     * deviennent ceux de la révision. learning.plan_validated n'est émis que pour le niveau actif ; les niveaux futurs
     * restent une projection du JSON de la révision.
     */
    void validate(UUID pathId, int number, UUID validatedBy) {
        transaction("validate path plan", connection -> {
            PathRow path = lock(connection, pathId);
            if (!"active".equals(path.status())) throw HttpError.conflict("Ce parcours n’est plus actif.");
            RevisionRow revision = checkedRevision(connection, path, number);
            List<StepRow> steps = steps(connection, pathId);
            StepRow active = steps.stream().filter(step -> "active".equals(step.status())).findFirst().orElse(null);
            if (active != null && !active.prerequisiteMet()) {
                throw HttpError.conflict("Le prérequis du niveau doit être validé ou confirmé par le diagnostic.");
            }
            List<Day> days = PathPlanner.parseDays(revision.availability());
            if (active != null) {
                List<PathPlanner.PlannedSession> planned =
                        PathPlanner.parseSessions(revision.plan().path("sessions"), active.levelCode());
                goals.replaceSessions(connection, active.enrollmentId(), number, sessionsOf(revision.plan(), active.levelCode()));
                goals.replaceAvailability(connection, active.enrollmentId(), days);
                setEnrollmentRevision(connection, active.enrollmentId(), number,
                        levelTarget(path, steps, active, planned, revision.startDate()));
            }
            markValidated(connection, pathId, number, validatedBy);
            try (var update = connection.prepareStatement("""
                    update learning.paths set validated_revision = ?, required_minutes = ?, difficulty = ?, paused_at = null,
                        resume_date = null, updated_at = now()
                    where id = ?
                    """)) {
                update.setInt(1, number);
                update.setInt(2, revision.requiredMinutes());
                update.setString(3, revision.difficulty());
                update.setObject(4, pathId);
                update.executeUpdate();
            }
            writeAvailability(connection, pathId, days);
            if (active != null) events.planValidated(connection, active.enrollmentId(), number);
            return null;
        });
    }

    /**
     * Ouvre le niveau suivant : l'inscription du niveau en cours se termine, celle du niveau suivant est créée en
     * préparation (goal_set) et le niveau devient actif. {@code expectedStep} : niveau dont l'examen blanc vient d'être
     * remis (null pour un passage forcé). Renvoie le niveau ouvert, ou null si ce niveau n'est plus le niveau actif.
     */
    UUID activateNext(UUID pathId, UUID expectedStep, UUID by, LocalDate today) {
        return transaction("activate next level", connection -> {
            PathRow path = lock(connection, pathId);
            if (!"active".equals(path.status())) throw HttpError.conflict("Ce parcours n’est plus actif.");
            List<StepRow> steps = steps(connection, pathId);
            StepRow current = steps.stream().filter(step -> "active".equals(step.status())).findFirst().orElse(null);
            if (current == null || expectedStep != null && !current.id().equals(expectedStep)) return null;
            StepRow next = steps.stream().filter(step -> "planned".equals(step.status()) && step.rank() > current.rank())
                    .findFirst().orElseThrow(() -> HttpError.conflict("Aucun niveau suivant n’est prévu dans ce parcours."));

            // Passage forcé avant la remise de l'examen blanc : les séances restantes sortent du calendrier et Suivi
            // en est informé, pour qu'aucune alerte ne porte sur un niveau terminé.
            if (!PathRules.SUBMITTED_FINAL.contains(current.goalStatus())) {
                int closing = path.validatedRevision() + 1;
                goals.supersedeOpenSessions(connection, current.enrollmentId(), closing);
                events.planValidated(connection, current.enrollmentId(), closing);
            } else {
                goals.supersedeOpenSessions(connection, current.enrollmentId(), path.validatedRevision());
            }
            try (var close = connection.prepareStatement("""
                    update learning.enrollments set status = 'completed', ended_at = now() where id = ? and status = 'active'
                    """)) {
                close.setObject(1, current.enrollmentId());
                close.executeUpdate();
            }
            try (var close = connection.prepareStatement(
                    "update learning.path_steps set status = 'completed', completed_at = now() where id = ?")) {
                close.setObject(1, current.id());
                close.executeUpdate();
            }
            RevisionRow validated = revision(connection,
                    "where path_id = ? and status = 'validated' order by number desc limit 1", pathId, null);
            List<PathPlanner.PlannedSession> planned = validated == null ? List.of()
                    : PathPlanner.parseSessions(validated.plan().path("sessions"), next.levelCode());
            LocalDate levelTarget = levelTarget(path, steps, next, planned, today);
            UUID enrollmentId = goals.insertEnrollment(connection, path.learnerId(), next.levelCode(),
                    next.trackVersionId(), next.trackVersionNumber(), by, current.levelCode(), today, levelTarget,
                    "custom", "preparing", current.levelCode(), true, availability(connection, pathId));
            activateStep(connection, next.id(), enrollmentId);
            return next.id();
        });
    }

    /** Fin du parcours : l'examen blanc du dernier niveau est validé. Le niveau et son inscription se terminent. */
    boolean complete(UUID enrollmentId) {
        return transaction("complete path", connection -> {
            UUID pathId;
            try (var query = connection.prepareStatement("select path_id from learning.path_steps where enrollment_id = ?")) {
                query.setObject(1, enrollmentId);
                try (var rows = query.executeQuery()) {
                    if (!rows.next()) return false;
                    pathId = rows.getObject(1, UUID.class);
                }
            }
            PathRow path = lock(connection, pathId);
            if (!"active".equals(path.status())) return false;
            List<StepRow> steps = steps(connection, pathId);
            StepRow active = steps.stream().filter(step -> "active".equals(step.status())).findFirst().orElse(null);
            if (active == null || !enrollmentId.equals(active.enrollmentId())
                    || steps.stream().anyMatch(step -> "planned".equals(step.status()))) {
                return false;
            }
            execute(connection, "update learning.path_steps set status = 'completed', completed_at = now() where id = ?",
                    active.id());
            execute(connection, """
                    update learning.enrollments set status = 'completed', ended_at = now() where id = ? and status = 'active'
                    """, enrollmentId);
            execute(connection, """
                    update learning.paths set status = 'completed', ended_at = now(), paused_at = null, resume_date = null,
                        updated_at = now()
                    where id = ?
                    """, pathId);
            events.path(connection, pathId, "learning.path_completed");
            return true;
        });
    }

    /** Pause du parcours : l'objectif du niveau actif passe en pause (alertes suspendues). */
    void pause(UUID pathId) {
        transaction("pause path", connection -> {
            PathRow path = lock(connection, pathId);
            if (!"active".equals(path.status()) || path.pausedAt() != null) {
                throw HttpError.conflict("Seul un parcours en cours peut être mis en pause.");
            }
            StepRow active = steps(connection, pathId).stream().filter(step -> "active".equals(step.status()))
                    .findFirst().orElseThrow(() -> HttpError.conflict("Seul un parcours en cours peut être mis en pause."));
            try (var update = connection.prepareStatement("""
                    update learning.enrollments set goal_status = 'paused', paused_at = now()
                    where id = ? and status = 'active' and goal_status in ('active', 'preparing')
                    """)) {
                update.setObject(1, active.enrollmentId());
                if (update.executeUpdate() == 0) throw HttpError.conflict("Seul un parcours en cours peut être mis en pause.");
            }
            execute(connection, "update learning.paths set paused_at = now(), updated_at = now() where id = ?", pathId);
            events.goalStatus(connection, active.enrollmentId(), "learning.goal_paused", "paused");
            return null;
        });
    }

    /** Date de reprise d'un parcours en pause ; la proposition calculée à partir de ce jour la confirmera. */
    void planResume(UUID pathId, LocalDate resumeDate) {
        transaction("plan path resume", connection -> {
            PathRow path = lock(connection, pathId);
            if (path.pausedAt() == null) throw HttpError.conflict("Ce parcours n’est pas en pause.");
            execute(connection, "update learning.paths set resume_date = ?, updated_at = now() where id = ?", resumeDate, pathId);
            try (var update = connection.prepareStatement("""
                    update learning.enrollments set resume_date = ?
                    where id in (select enrollment_id from learning.path_steps where path_id = ? and status = 'active')
                      and goal_status = 'paused'
                    """)) {
                update.setObject(1, resumeDate);
                update.setObject(2, pathId);
                update.executeUpdate();
            }
            return null;
        });
    }

    /** Applique les conditions d'un contrat : niveaux, date cible et engagement ; les niveaux prévus suivent la cible. */
    void applyTerms(Connection connection, UUID pathId, ContractStore.Terms terms, List<LevelChoice> levels)
            throws SQLException {
        try (var update = connection.prepareStatement("""
                update learning.paths set start_level = ?, target_level = ?, target_date = ?, weekly_minutes = ?,
                    updated_at = now()
                where id = ?
                """)) {
            update.setString(1, terms.startLevel());
            update.setString(2, terms.targetLevel());
            update.setObject(3, terms.targetDate());
            update.setInt(4, terms.weeklyMinutes());
            update.setObject(5, pathId);
            update.executeUpdate();
        }
        syncSteps(connection, pathId, levels);
    }

    // --- Ajouts de cours -----------------------------------------------------------------------------------

    UUID insertAddition(UUID pathId, UUID stepId, UUID sourceVersionId, String sourceLevelCode, String moduleId,
                        String activityId, String title, int minutes, String placement, String note, UUID addedBy) {
        return transaction("add course", connection -> {
            PathRow path = lock(connection, pathId);
            if (!"active".equals(path.status())) throw HttpError.conflict("Des cours s’ajoutent à un parcours en cours.");
            UUID id;
            try (var insert = connection.prepareStatement("""
                    insert into learning.path_additions (path_id, step_id, source_version_id, source_level_code, module_id,
                        activity_id, title, minutes, placement, note, added_by)
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) returning id
                    """)) {
                insert.setObject(1, pathId);
                insert.setObject(2, stepId);
                insert.setObject(3, sourceVersionId);
                insert.setString(4, sourceLevelCode);
                insert.setString(5, moduleId);
                insert.setString(6, activityId);
                insert.setString(7, title);
                insert.setInt(8, minutes);
                insert.setString(9, placement);
                insert.setString(10, note);
                insert.setObject(11, addedBy);
                try (var rows = insert.executeQuery()) {
                    rows.next();
                    id = rows.getObject(1, UUID.class);
                }
            }
            events.addition(connection, id, "learning.path_addition_created");
            return id;
        });
    }

    void removeAddition(UUID pathId, UUID additionId, UUID removedBy) {
        transaction("remove course", connection -> {
            PathRow path = lock(connection, pathId);
            if (!"active".equals(path.status())) throw HttpError.conflict("Ce parcours n’est plus actif.");
            try (var update = connection.prepareStatement("""
                    update learning.path_additions set removed_at = now(), removed_by = ?
                    where id = ? and path_id = ? and removed_at is null
                    """)) {
                update.setObject(1, removedBy);
                update.setObject(2, additionId);
                update.setObject(3, pathId);
                if (update.executeUpdate() == 0) throw HttpError.conflict("Cet ajout a déjà été retiré.");
            }
            events.addition(connection, additionId, "learning.path_addition_removed");
            return null;
        });
    }

    // --- Outils de transaction -----------------------------------------------------------------------------

    PathRow lock(Connection connection, UUID pathId) throws SQLException {
        PathRow path = path(connection, "where id = ?", pathId, true);
        if (path == null) throw HttpError.notFound("Parcours introuvable.");
        return path;
    }

    /** Proposition validable : en attente, fondée sur le planning en vigueur et sans débordement. */
    private RevisionRow checkedRevision(Connection connection, PathRow path, int number) throws SQLException {
        RevisionRow revision = revision(connection, "where path_id = ? and number = ? for update", path.id(), number);
        if (revision == null) throw HttpError.notFound("Proposition introuvable.");
        if (!"proposed".equals(revision.status()) || revision.baseRevision() != path.validatedRevision()) {
            throw HttpError.conflict("Le planning a changé depuis cette proposition : actualisez-la avant de la valider.");
        }
        if (revision.overflowCount() > 0) {
            throw HttpError.conflict("Le programme dépasse la capacité : appliquez un ajustement avant de valider.");
        }
        return revision;
    }

    private void markValidated(Connection connection, UUID pathId, int number, UUID validatedBy) throws SQLException {
        execute(connection, "update learning.path_revisions set status = 'superseded' where path_id = ? and status = 'validated'",
                pathId);
        try (var accept = connection.prepareStatement("""
                update learning.path_revisions set status = 'validated', validated_by = ?, validated_at = now()
                where path_id = ? and number = ?
                """)) {
            accept.setObject(1, validatedBy);
            accept.setObject(2, pathId);
            accept.setInt(3, number);
            accept.executeUpdate();
        }
    }

    /** L'objectif du niveau reprend : révision validée, échéance du niveau, fin de pause éventuelle. */
    private void setEnrollmentRevision(Connection connection, UUID enrollmentId, int number, LocalDate target)
            throws SQLException {
        try (var goal = connection.prepareStatement("""
                update learning.enrollments
                set validated_revision = ?,
                    goal_status = case when goal_status in ('preparing', 'paused', 'active') then 'active' else goal_status end,
                    paused_at = null, resume_date = null, target_date = greatest(?, start_date)
                where id = ?
                """)) {
            goal.setInt(1, number);
            goal.setObject(2, target);
            goal.setObject(3, enrollmentId);
            goal.executeUpdate();
        }
    }

    /** Échéance d'un niveau : la date cible pour le dernier niveau, sinon le jour de son examen blanc. */
    private static LocalDate levelTarget(PathRow path, List<StepRow> steps, StepRow step,
                                         List<PathPlanner.PlannedSession> planned, LocalDate floor) {
        boolean last = steps.stream().noneMatch(other -> "planned".equals(other.status()) && other.rank() > step.rank());
        LocalDate end = last ? path.targetDate() : PathPlanner.levelEnd(planned, step.levelCode());
        if (end == null) end = path.targetDate();
        return end.isBefore(floor) ? floor.plusDays(1) : end;
    }

    /** Séances d'un seul niveau dans le JSON d'une révision (niveau absent : révision reprise d'un seul niveau). */
    private ArrayNode sessionsOf(JsonNode plan, String levelCode) {
        ArrayNode sessions = json.createArrayNode();
        for (JsonNode session : plan.path("sessions")) {
            JsonNode level = session.path("levelCode");
            if (level.isMissingNode() || level.isNull() || levelCode.equals(level.asText())) sessions.add(session);
        }
        return sessions;
    }

    private void activateStep(Connection connection, UUID stepId, UUID enrollmentId) throws SQLException {
        try (var update = connection.prepareStatement("""
                update learning.path_steps set status = 'active', enrollment_id = ?, activated_at = now() where id = ?
                """)) {
            update.setObject(1, enrollmentId);
            update.setObject(2, stepId);
            update.executeUpdate();
        }
        events.pathStepActivated(connection, stepId);
    }

    private void updateLoad(Connection connection, UUID pathId, int weekly, int required, String difficulty)
            throws SQLException {
        try (var update = connection.prepareStatement("""
                update learning.paths set weekly_minutes = ?, required_minutes = ?, difficulty = ?, updated_at = now()
                where id = ?
                """)) {
            update.setInt(1, Math.max(0, Math.min(5040, weekly)));
            update.setInt(2, Math.max(0, required));
            update.setString(3, difficulty);
            update.setObject(4, pathId);
            update.executeUpdate();
        }
    }

    private UUID insertPath(Connection connection, UUID learnerId, String languageId, String status, String startLevel,
                            String targetLevel, LocalDate start, LocalDate target, int weekly, int required,
                            String difficulty, UUID placementAttemptId, String origin, UUID createdBy) throws SQLException {
        try (var insert = connection.prepareStatement("""
                insert into learning.paths (learner_id, language_id, status, start_level, target_level, start_date,
                    target_date, initial_target_date, weekly_minutes, required_minutes, difficulty, placement_attempt_id,
                    origin, created_by)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) returning id
                """)) {
            insert.setObject(1, learnerId);
            insert.setString(2, languageId);
            insert.setString(3, status);
            insert.setString(4, startLevel);
            insert.setString(5, targetLevel);
            insert.setObject(6, start);
            insert.setObject(7, target);
            insert.setObject(8, target);
            insert.setInt(9, Math.max(0, Math.min(5040, weekly)));
            insert.setInt(10, Math.max(0, required));
            insert.setString(11, difficulty);
            insert.setObject(12, placementAttemptId);
            insert.setString(13, origin);
            insert.setObject(14, createdBy);
            try (var rows = insert.executeQuery()) {
                rows.next();
                return rows.getObject(1, UUID.class);
            }
        }
    }

    private UUID insertStep(Connection connection, UUID pathId, LevelChoice level, String status, UUID enrollmentId)
            throws SQLException {
        try (var insert = connection.prepareStatement("""
                insert into learning.path_steps (path_id, rank, level_code, track_version_id, track_version_number, status,
                    enrollment_id, activated_at)
                values (?, ?, ?, ?, ?, ?, ?, case when ? then now() end) returning id
                """)) {
            insert.setObject(1, pathId);
            insert.setInt(2, level.rank());
            insert.setString(3, level.levelCode());
            insert.setObject(4, level.trackVersionId());
            insert.setInt(5, level.trackVersionNumber());
            insert.setString(6, status);
            insert.setObject(7, enrollmentId);
            insert.setBoolean(8, enrollmentId != null);
            try (var rows = insert.executeQuery()) {
                rows.next();
                return rows.getObject(1, UUID.class);
            }
        }
    }

    /**
     * Aligne les niveaux prévus sur la liste voulue : un niveau prévu qui sort du parcours est retiré, un niveau
     * manquant est ajouté. Les niveaux ouverts ou terminés ne changent jamais.
     */
    private void syncSteps(Connection connection, UUID pathId, List<LevelChoice> levels) throws SQLException {
        Set<Integer> wanted = new HashSet<>();
        for (LevelChoice level : levels) wanted.add(level.rank());
        Set<Integer> present = new HashSet<>();
        for (StepRow step : steps(connection, pathId)) {
            if ("planned".equals(step.status()) && !wanted.contains(step.rank())) {
                execute(connection, "update learning.path_steps set status = 'withdrawn' where id = ?", step.id());
            } else {
                present.add(step.rank());
            }
        }
        for (LevelChoice level : levels) {
            if (!present.contains(level.rank())) insertStep(connection, pathId, level, "planned", null);
        }
    }

    void writeAvailability(Connection connection, UUID pathId, List<Day> days) throws SQLException {
        execute(connection, "delete from learning.path_availabilities where path_id = ?", pathId);
        for (Day day : days) {
            try (var insert = connection.prepareStatement(
                    "insert into learning.path_availabilities (path_id, weekday, sessions, minutes) values (?, ?, ?, ?)")) {
                insert.setObject(1, pathId);
                insert.setInt(2, day.weekday());
                insert.setInt(3, day.sessions());
                insert.setInt(4, day.minutes());
                insert.executeUpdate();
            }
        }
    }

    List<Day> availability(Connection connection, UUID pathId) throws SQLException {
        List<Day> days = new ArrayList<>();
        try (var query = connection.prepareStatement(
                "select weekday, sessions, minutes from learning.path_availabilities where path_id = ? order by weekday")) {
            query.setObject(1, pathId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) days.add(new Day(rows.getInt(1), rows.getInt(2), rows.getInt(3)));
            }
        }
        return days;
    }

    List<StepRow> steps(Connection connection, UUID pathId) throws SQLException {
        List<StepRow> steps = new ArrayList<>();
        try (var query = connection.prepareStatement("""
                select s.id, s.path_id, s.rank, s.level_code, s.track_version_id, s.track_version_number, s.status,
                       s.enrollment_id, s.activated_at, s.completed_at, e.goal_status, e.acquired_modules,
                       coalesce(e.prerequisite_met, true) as prerequisite_met
                from learning.path_steps s left join learning.enrollments e on e.id = s.enrollment_id
                where s.path_id = ? and s.status <> 'withdrawn'
                order by s.rank
                """)) {
            query.setObject(1, pathId);
            try (var rows = query.executeQuery()) {
                while (rows.next()) {
                    steps.add(new StepRow(rows.getObject("id", UUID.class), rows.getObject("path_id", UUID.class),
                            rows.getInt("rank"), rows.getString("level_code"), rows.getObject("track_version_id", UUID.class),
                            rows.getInt("track_version_number"), rows.getString("status"),
                            rows.getObject("enrollment_id", UUID.class), rows.getObject("activated_at", OffsetDateTime.class),
                            rows.getObject("completed_at", OffsetDateTime.class), rows.getString("goal_status"),
                            texts(rows.getArray("acquired_modules")), rows.getBoolean("prerequisite_met")));
                }
            }
        }
        return steps;
    }

    private PathRow path(Connection connection, String where, UUID parameter, boolean forUpdate) throws SQLException {
        try (var query = connection.prepareStatement("select " + PATH_COLUMNS + " from learning.paths " + where
                + (forUpdate ? " for update" : ""))) {
            query.setObject(1, parameter);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return null;
                return new PathRow(rows.getObject("id", UUID.class), rows.getObject("learner_id", UUID.class),
                        rows.getString("language_id"), rows.getString("status"), rows.getString("start_level"),
                        rows.getString("target_level"), rows.getObject("start_date", LocalDate.class),
                        rows.getObject("target_date", LocalDate.class), rows.getObject("initial_target_date", LocalDate.class),
                        rows.getInt("weekly_minutes"), rows.getInt("required_minutes"), rows.getString("difficulty"),
                        rows.getObject("placement_attempt_id", UUID.class), rows.getString("origin"),
                        rows.getInt("validated_revision"), rows.getObject("availability_confirmed_at", OffsetDateTime.class),
                        rows.getObject("paused_at", OffsetDateTime.class), rows.getObject("resume_date", LocalDate.class),
                        rows.getObject("created_by", UUID.class), rows.getObject("created_at", OffsetDateTime.class),
                        rows.getObject("ended_at", OffsetDateTime.class));
            }
        }
    }

    private RevisionRow revision(Connection connection, String where, UUID pathId, Integer number) throws SQLException {
        try (var query = connection.prepareStatement("select " + REVISION_COLUMNS + " from learning.path_revisions " + where)) {
            query.setObject(1, pathId);
            if (number != null) query.setInt(2, number);
            try (var rows = query.executeQuery()) {
                if (!rows.next()) return null;
                return new RevisionRow(rows.getObject("path_id", UUID.class), rows.getInt("number"),
                        rows.getInt("base_revision"), rows.getString("status"), rows.getObject("start_date", LocalDate.class),
                        rows.getObject("target_date", LocalDate.class), parse(rows.getString("availability")),
                        parse(rows.getString("plan")), rows.getInt("capacity_minutes"), rows.getInt("required_minutes"),
                        rows.getInt("overflow_count"), rows.getString("difficulty"), rows.getObject("created_by", UUID.class),
                        rows.getObject("created_at", OffsetDateTime.class), rows.getObject("validated_by", UUID.class),
                        rows.getObject("validated_at", OffsetDateTime.class));
            }
        }
    }

    private static AdditionRow addition(ResultSet rows) throws SQLException {
        return new AdditionRow(rows.getObject("id", UUID.class), rows.getObject("path_id", UUID.class),
                rows.getObject("step_id", UUID.class), rows.getObject("source_version_id", UUID.class),
                rows.getString("source_level_code"), rows.getString("module_id"), rows.getString("activity_id"),
                rows.getString("title"), rows.getInt("minutes"), rows.getString("placement"), rows.getString("note"),
                rows.getObject("added_by", UUID.class), rows.getObject("added_at", OffsetDateTime.class),
                rows.getObject("removed_at", OffsetDateTime.class), rows.getObject("removed_by", UUID.class),
                rows.getString("step_level"), rows.getObject("step_enrollment_id", UUID.class));
    }

    private static void execute(Connection connection, String sql, Object... parameters) throws SQLException {
        try (var statement = connection.prepareStatement(sql)) {
            for (int index = 0; index < parameters.length; index++) statement.setObject(index + 1, parameters[index]);
            statement.executeUpdate();
        }
    }

    private static List<String> texts(Array array) throws SQLException {
        if (array == null) return List.of();
        try {
            List<String> values = new ArrayList<>();
            for (Object value : (Object[]) array.getArray()) values.add(String.valueOf(value));
            return List.copyOf(values);
        } finally {
            array.free();
        }
    }

    private JsonNode parse(String value) {
        try {
            return value == null ? json.createObjectNode() : json.readTree(value);
        } catch (Exception error) {
            return json.createObjectNode();
        }
    }

    <T> T read(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            return work.run(connection);
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    <T> T transaction(String operation, Work<T> work) {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                T result = work.run(connection);
                connection.commit();
                return result;
            } catch (SQLException | RuntimeException error) {
                connection.rollback();
                throw error;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException error) {
            throw failure(operation, error);
        }
    }

    private static RuntimeException failure(String operation, SQLException error) {
        LOG.errorf("Learning database operation '%s' failed (SQLSTATE %s)", operation, error.getSQLState());
        return HttpError.unavailable("Le parcours est temporairement indisponible.");
    }
}
