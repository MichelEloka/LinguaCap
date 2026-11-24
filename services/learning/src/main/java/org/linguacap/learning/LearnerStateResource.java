package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import io.agroal.api.AgroalDataSource;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import java.sql.Array;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

/**
 * État d'apprentissage d'un lot d'élèves, lu en direct pour Suivi (EVO-039) : avancement de l'accueil (langue, test ou
 * débutant déclaré, objectif, jours, planning) et parcours dès sa création, brouillon compris. Route interne : le droit
 * d'accès est recoupé avec la liste d'élèves de l'appelant chez Identités (un seul appel) ; un élève hors de cette
 * liste est simplement absent de la réponse.
 */
@Path("/v1/internal/learning/learner-states")
@Produces(MediaType.APPLICATION_JSON)
public class LearnerStateResource {
    static final int MAX_LEARNERS = 200;
    private static final Logger LOG = Logger.getLogger(LearnerStateResource.class);
    /** Lectures du test de niveau chez Évaluations, quelques-unes à la fois. */
    private static final ExecutorService LOOKUPS = Executors.newFixedThreadPool(4, task -> {
        Thread thread = new Thread(task, "learner-states");
        thread.setDaemon(true);
        return thread;
    });

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject PathResource pathResource;
    @Inject AgroalDataSource dataSource;

    @ConfigProperty(name = "lingua.services.assessment")
    String assessmentUrl;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public List<LearnerState> states(StatesRequest request) {
        UUID callerId = actor.id();
        Set<UUID> requested = requested(request);
        if (requested.isEmpty()) return List.of();
        Map<UUID, JsonNode> profiles = visible(callerId, requested);
        if (profiles.isEmpty()) return List.of();
        Map<UUID, PathSnapshot> paths = latestPaths(profiles.keySet());

        // Dernière tentative du test de niveau de chaque élève (même lecture que l'accueil de l'élève).
        Map<UUID, CompletableFuture<PlacementLookup>> lookups = new LinkedHashMap<>();
        profiles.forEach((learnerId, profile) -> lookups.put(learnerId, CompletableFuture
                .supplyAsync(() -> placement(callerId, learnerId, text(profile.path("languageId"))), LOOKUPS)
                .exceptionally(error -> {
                    LOG.warn("Placement lookup failed for a learner state");
                    return PlacementLookup.NONE;
                })));

        PathResource.Catalogue catalogue = pathResource.catalogue(callerId);
        Map<String, JsonNode> languages = null;
        boolean catalogueDown = false;
        List<LearnerState> states = new ArrayList<>();
        for (Map.Entry<UUID, JsonNode> entry : profiles.entrySet()) {
            UUID learnerId = entry.getKey();
            PathSnapshot path = paths.get(learnerId);
            PlacementLookup lookup = lookups.get(learnerId).join();
            String languageId = text(entry.getValue().path("languageId"));
            if (languageId == null && path != null) languageId = path.languageId();
            String pathStatus = path == null ? null : path.status();
            boolean started = pathStatus != null && !"draft".equals(pathStatus);
            boolean confirmed = path != null && path.availabilityConfirmed();
            if (languages == null && !started && languageId != null) languages = pathResource.languages(callerId);
            JsonNode language = languages == null || languageId == null ? null : languages.get(languageId);

            PathResource.OnboardingProgress progress = null;
            if (!catalogueDown) {
                try {
                    progress = pathResource.onboardingProgress(catalogue, languageId, language, pathStatus, confirmed,
                            lookup.latest());
                } catch (WebApplicationException unavailable) {
                    LOG.warn("Catalogue unavailable while computing learner states");
                    catalogueDown = true;
                }
            }
            if (progress == null) {
                // Sans le catalogue, le blocage « aucun niveau à viser » n'est pas calculé ; les étapes restent justes.
                JsonNode latest = lookup.latest();
                boolean placed = latest != null && "completed".equals(latest.path("status").asText());
                progress = new PathResource.OnboardingProgress(OnboardingRules.steps(languageId != null, placed, pathStatus,
                        confirmed, null), started, null, placed ? text(latest.path("placedLevel")) : null);
            }
            states.add(new LearnerState(learnerId, languageId,
                    new OnboardingView(progress.steps(), progress.started(), placementView(lookup, progress.placedLevel()),
                            progress.blocked()),
                    path == null ? null : path.view()));
        }
        return states;
    }

    // --- Demande et droits -----------------------------------------------------------------------------------

    private static Set<UUID> requested(StatesRequest request) {
        if (request == null || request.learnerIds() == null) throw HttpError.badRequest("Indiquez les élèves.");
        if (request.learnerIds().size() > MAX_LEARNERS) {
            throw HttpError.badRequest("Demandez l’état de " + MAX_LEARNERS + " élèves au plus à la fois.");
        }
        Set<UUID> ids = new LinkedHashSet<>();
        for (String id : request.learnerIds()) ids.add(LearnerAccess.parse(id));
        return ids;
    }

    /**
     * Élèves demandés que l'appelant peut consulter, avec leur profil, dans l'ordre de la demande. Un seul élève : sa
     * fiche chez Identités (403 ou 404 : absent) ; sinon la liste des élèves de l'appelant (professeur référent ou
     * administration ; un autre rôle reçoit le refus d'Identités).
     */
    private Map<UUID, JsonNode> visible(UUID callerId, Set<UUID> requested) {
        Map<UUID, JsonNode> profiles = new LinkedHashMap<>();
        if (requested.size() == 1) {
            UUID only = requested.iterator().next();
            try {
                profiles.put(only, identities.learner(callerId, only));
            } catch (WebApplicationException refused) {
                int status = refused.getResponse().getStatus();
                if (status != 403 && status != 404) throw refused;
            }
            return profiles;
        }
        Map<UUID, JsonNode> roster = new HashMap<>();
        for (JsonNode profile : identities.learners(callerId)) {
            try {
                roster.put(UUID.fromString(profile.path("id").asText()), profile);
            } catch (IllegalArgumentException ignored) {
                // Profil incomplet : ignoré.
            }
        }
        for (UUID id : requested) if (roster.containsKey(id)) profiles.put(id, roster.get(id));
        return profiles;
    }

    // --- Parcours ------------------------------------------------------------------------------------------

    /** Parcours ouvert de chaque élève (brouillon ou actif), sinon le plus récent ; un parcours retiré ne compte pas. */
    private Map<UUID, PathSnapshot> latestPaths(Set<UUID> learnerIds) {
        Map<UUID, PathSnapshot> paths = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            Array ids = connection.createArrayOf("uuid", learnerIds.toArray());
            try (var query = connection.prepareStatement("""
                    select distinct on (learner_id) id, learner_id, language_id, status, start_level, target_level,
                           target_date, validated_revision, availability_confirmed_at, created_at
                    from learning.paths where learner_id = any (?)
                    order by learner_id, (status in ('draft', 'active')) desc, created_at desc
                    """)) {
                query.setArray(1, ids);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        if ("withdrawn".equals(rows.getString("status"))) continue;
                        UUID learnerId = rows.getObject("learner_id", UUID.class);
                        paths.put(learnerId, new PathSnapshot(rows.getObject("id", UUID.class), learnerId,
                                rows.getString("language_id"), rows.getString("status"), rows.getString("start_level"),
                                rows.getString("target_level"), rows.getObject("target_date", LocalDate.class),
                                rows.getInt("validated_revision"), rows.getObject("availability_confirmed_at") != null,
                                rows.getObject("created_at", OffsetDateTime.class), new ArrayList<>()));
                    }
                }
            } finally {
                ids.free();
            }
            if (paths.isEmpty()) return paths;
            Map<UUID, PathSnapshot> byPath = new HashMap<>();
            paths.values().forEach(path -> byPath.put(path.id(), path));
            Array pathIds = connection.createArrayOf("uuid", byPath.keySet().toArray());
            try (var query = connection.prepareStatement("""
                    select s.path_id, s.rank, s.level_code, s.status, s.enrollment_id, e.goal_status
                    from learning.path_steps s left join learning.enrollments e on e.id = s.enrollment_id
                    where s.path_id = any (?) and s.status in ('active', 'completed')
                    """)) {
                query.setArray(1, pathIds);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) {
                        byPath.get(rows.getObject("path_id", UUID.class)).levels().add(new OnboardingRules.Level(
                                rows.getInt("rank"), rows.getString("level_code"), rows.getString("status"),
                                rows.getObject("enrollment_id", UUID.class), rows.getString("goal_status")));
                    }
                }
            } finally {
                pathIds.free();
            }
            return paths;
        } catch (SQLException error) {
            LOG.errorf("Learner states read failed (SQLSTATE %s)", error.getSQLState());
            throw HttpError.unavailable("Les parcours des élèves sont temporairement indisponibles.");
        }
    }

    // --- Test de niveau --------------------------------------------------------------------------------------

    /** Dernière tentative de la langue ; « débutant déclaré » se lit sur la tentative elle-même (placée en A0). */
    private PlacementLookup placement(UUID callerId, UUID learnerId, String languageId) {
        JsonNode latest = pathResource.latestPlacement(callerId, learnerId, languageId);
        if (latest == null) return PlacementLookup.NONE;
        boolean declared = false;
        if ("completed".equals(latest.path("status").asText())
                && OnboardingRules.BEGINNER.equals(text(latest.path("placedLevel")))) {
            try {
                JsonNode attempt = services.request(assessmentUrl, "/v1/assessments/placements/"
                        + UUID.fromString(latest.path("id").asText()), "GET", callerId, null);
                declared = attempt.path("result").path("declaredBeginner").asBoolean(false);
            } catch (WebApplicationException | IllegalArgumentException unavailable) {
                LOG.warn("Placement attempt unavailable for a learner state");
            }
        }
        return new PlacementLookup(latest, declared);
    }

    private static PlacementState placementView(PlacementLookup lookup, String placedLevel) {
        JsonNode latest = lookup.latest();
        if (latest == null) return null;
        return new PlacementState(latest.path("id").asText(), latest.path("status").asText(), placedLevel,
                lookup.declaredBeginner(), text(latest.path("completedAt")));
    }

    private static String text(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode() || node.asText().isEmpty() ? null : node.asText();
    }

    record PlacementLookup(JsonNode latest, boolean declaredBeginner) {
        static final PlacementLookup NONE = new PlacementLookup(null, false);
    }

    record PathSnapshot(UUID id, UUID learnerId, String languageId, String status, String startLevel, String targetLevel,
                        LocalDate targetDate, int validatedRevision, boolean availabilityConfirmed, OffsetDateTime createdAt,
                        List<OnboardingRules.Level> levels) {
        PathState view() {
            OnboardingRules.Level shown = OnboardingRules.shownLevel(levels);
            return new PathState(id, status, startLevel, targetLevel, targetDate.toString(),
                    shown == null ? null : shown.levelCode(), shown == null ? null : shown.enrollmentId(),
                    shown == null ? null : shown.goalStatus(), validatedRevision, createdAt.toString());
        }
    }

    // --- Formes JSON (linguacap-react/src/integration/v2.ts, LearnerLearningState) ------------------------------

    public record StatesRequest(List<String> learnerIds) {}

    /** status : in_progress ou completed ; placedLevel n'est connu qu'une fois le test terminé. */
    public record PlacementState(String attemptId, String status, String placedLevel, boolean declaredBeginner,
                                 String completedAt) {}

    /** completed : le parcours a démarré ; blockedReason comme GET /learning/onboarding. */
    public record OnboardingView(List<PathResource.OnboardingStep> steps, boolean completed, PlacementState placement,
                                 String blockedReason) {}

    /** activeLevel, enrollmentId et goalStatus : niveau ouvert (sinon le dernier terminé), null pour un brouillon. */
    public record PathState(UUID id, String status, String startLevel, String targetLevel, String targetDate,
                            String activeLevel, UUID enrollmentId, String goalStatus, int validatedRevision,
                            String createdAt) {}

    public record LearnerState(UUID learnerId, String languageId, OnboardingView onboarding, PathState path) {}
}
