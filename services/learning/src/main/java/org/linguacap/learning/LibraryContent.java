package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agroal.api.AgroalDataSource;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.ServiceClient;
import org.linguacap.learning.LibraryResource.LastResult;
import org.linguacap.learning.LibraryResource.LibraryActivity;
import org.linguacap.learning.LibraryResource.LibraryActivityItem;
import org.linguacap.learning.LibraryResource.LibraryLesson;
import org.linguacap.learning.LibraryResource.LibraryModule;
import org.linguacap.learning.LibraryResource.LibraryPlacement;
import org.linguacap.learning.LibraryResource.Practice;

/**
 * Contenu de la bibliothèque : versions publiées lues dans le catalogue, derniers scores lus dans Évaluations et
 * adresses temporaires des supports demandées à Médias avec le jeton de l'utilisateur (même logique que les séances).
 * Aucun corrigé n'est servi : le catalogue livre les activités sans réponses attendues.
 */
@ApplicationScoped
class LibraryContent {
    private static final Logger LOG = Logger.getLogger(LibraryContent.class);
    static final List<String> LEVELS = List.of("A1", "A2", "B1", "B2", "C1", "C2");
    /** Seules les leçons et les exercices sont en accès libre : révisions et évaluations restent dans le parcours. */
    static final Set<String> KINDS = Set.of("lesson", "exercise");
    /** Langue des versions publiées avant les parcours multi-langues : tout le catalogue était en allemand. */
    static final String LEGACY_LANGUAGE = "de";

    @Inject Actor actor;
    @Inject ServiceClient services;
    @Inject AgroalDataSource dataSource;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "lingua.services.catalogue")
    String catalogueUrl;
    @ConfigProperty(name = "lingua.services.assessment")
    String assessmentUrl;
    @ConfigProperty(name = "lingua.services.media")
    String mediaUrl;

    /** Versions de parcours en cours de l'élève : le niveau actif et tous les niveaux de son parcours. */
    record PathVersions(UUID current, Set<UUID> inPath) {
        static final PathVersions NONE = new PathVersions(null, Set.of());
    }

    /** Versions publiées de la langue, de la plus élémentaire à la plus avancée. */
    List<JsonNode> publishedTracks(UUID callerId, String languageId) {
        List<JsonNode> tracks = new ArrayList<>();
        for (JsonNode track : services.request(catalogueUrl, "/v1/tracks", "GET", callerId, null)) {
            if (languageId.equals(languageOf(track)) && LEVELS.contains(track.path("levelCode").asText())) {
                tracks.add(track);
            }
        }
        tracks.sort(Comparator.comparingInt(track -> LEVELS.indexOf(track.path("levelCode").asText())));
        return tracks;
    }

    /** Structure d'une version (modules, activités, statut), ou null si elle n'est plus lisible. */
    JsonNode track(UUID callerId, UUID versionId) {
        try {
            return services.request(catalogueUrl, "/v1/internal/tracks/" + versionId, "GET", callerId, null);
        } catch (WebApplicationException error) {
            if (error.getResponse().getStatus() == 404) return null;
            throw error;
        }
    }

    /** Le bilan intermédiaire existe-t-il pour cette version ? (catalogue antérieur : vérification directe) */
    boolean midtermAvailable(UUID callerId, JsonNode track) {
        JsonNode kinds = track.path("assessmentKinds");
        if (kinds.isArray()) {
            for (JsonNode kind : kinds) {
                if ("midterm".equals(kind.asText())) return true;
            }
            return false;
        }
        var result = services.exchange(catalogueUrl, "/v1/internal/tracks/" + track.path("versionId").asText()
                + "/assessments/midterm", "GET", callerId, null, "", "", false, actor.requestId());
        return result.status() == 200;
    }

    /**
     * Dernier score de chaque exercice (clé : leçon), remise libre ou en séance. Si Évaluations est indisponible,
     * la bibliothèque reste lisible sans les scores.
     */
    Map<String, LastResult> lastResults(UUID callerId, UUID learnerId) {
        String path = "/v1/assessments/results" + (callerId.equals(learnerId) ? "" : "?learnerId=" + learnerId);
        JsonNode grades;
        try {
            grades = services.request(assessmentUrl, path, "GET", callerId, null);
        } catch (WebApplicationException error) {
            LOG.warnf("Assessment results unavailable for the library (HTTP %d)", error.getResponse().getStatus());
            return Map.of();
        }
        return lastResults(grades);
    }

    /** Les résultats arrivent du plus récent au plus ancien : le premier de chaque leçon est le dernier score. */
    static Map<String, LastResult> lastResults(JsonNode grades) {
        Map<String, LastResult> results = new HashMap<>();
        if (grades == null || !grades.isArray()) return results;
        for (JsonNode grade : grades) {
            String lessonId = grade.path("lessonId").asText("");
            String kind = grade.path("kind").asText("quiz");
            if (lessonId.isEmpty() || !"quiz".equals(kind) || results.containsKey(lessonId)) continue;
            results.put(lessonId, new LastResult(grade.path("correct").asInt(), grade.path("total").asInt(),
                    grade.path("submittedAt").asText()));
        }
        return results;
    }

    /**
     * Niveau actif (inscription en cours) et niveaux du parcours de l'élève. Tant que la migration des parcours
     * n'est pas appliquée, seule l'inscription active compte.
     */
    PathVersions pathVersions(UUID learnerId) {
        if (learnerId == null) return PathVersions.NONE;
        try (Connection connection = dataSource.getConnection()) {
            UUID current = null;
            Set<UUID> inPath = new HashSet<>();
            try (var query = connection.prepareStatement(
                    "select track_version_id from learning.enrollments where learner_id = ? and status = 'active'")) {
                query.setObject(1, learnerId);
                try (var rows = query.executeQuery()) {
                    if (rows.next()) current = rows.getObject(1, UUID.class);
                }
            }
            try (var query = connection.prepareStatement("""
                    select s.track_version_id from learning.path_steps s
                    where s.status <> 'withdrawn' and s.path_id = (
                        select p.id from learning.paths p
                        where p.learner_id = ? and p.status <> 'withdrawn'
                        order by p.status in ('draft', 'active') desc, p.created_at desc
                        limit 1)
                    """)) {
                query.setObject(1, learnerId);
                try (var rows = query.executeQuery()) {
                    while (rows.next()) inPath.add(rows.getObject(1, UUID.class));
                }
            } catch (SQLException error) {
                // 42P01 : table absente (migration des parcours non appliquée) ; 42501 : droit manquant.
                if (!"42P01".equals(error.getSQLState()) && !"42501".equals(error.getSQLState())) throw error;
                LOG.warnf("Learning paths unreadable for the library (SQLSTATE %s)", error.getSQLState());
            }
            if (current != null) inPath.add(current);
            return new PathVersions(current, Set.copyOf(inPath));
        } catch (SQLException error) {
            LOG.errorf("Library path lookup failed (SQLSTATE %s)", error.getSQLState());
            throw HttpError.unavailable("La bibliothèque est temporairement indisponible.");
        }
    }

    /** L'élève a-t-il terminé cette activité dans l'un de ses parcours sur cette version ? */
    boolean completedInPath(UUID learnerId, UUID versionId, String activityId) {
        try (Connection connection = dataSource.getConnection();
             var query = connection.prepareStatement("""
                     select exists (
                         select 1 from learning.activity_progress p
                         join learning.enrollments e on e.id = p.enrollment_id
                         where p.learner_id = ? and e.track_version_id = ? and p.activity_id = ?
                             and p.completed_at is not null)
                     """)) {
            query.setObject(1, learnerId);
            query.setObject(2, versionId);
            query.setString(3, activityId);
            try (var rows = query.executeQuery()) {
                return rows.next() && rows.getBoolean(1);
            }
        } catch (SQLException error) {
            LOG.errorf("Library progress lookup failed (SQLSTATE %s)", error.getSQLState());
            throw HttpError.unavailable("La bibliothèque est temporairement indisponible.");
        }
    }

    /**
     * Activité de la bibliothèque, sans corrigé, avec les adresses temporaires de ses supports. Pour l'élève, une
     * transcription « après la réponse » s'ouvre une fois l'activité terminée dans son parcours ou l'exercice remis
     * au moins une fois ; l'équipe pédagogique la voit toujours.
     */
    LibraryActivity activity(UUID callerId, UUID learnerId, boolean staff, JsonNode track, String activityId) {
        JsonNode module = moduleOf(track, activityId);
        if (module == null) throw HttpError.notFound("Activité introuvable dans la bibliothèque.");
        UUID versionId = UUID.fromString(track.path("versionId").asText());
        JsonNode content = services.request(catalogueUrl, "/v1/internal/tracks/" + versionId + "/activities/"
                + activityId, "GET", callerId, null);
        JsonNode activity = content.path("activity");
        JsonNode lesson = content.path("lesson");

        boolean answered = staff;
        if (!staff && learnerId != null && needsAnswer(content)) {
            String lessonId = activity.path("lessonId").asText("");
            answered = completedInPath(learnerId, versionId, activityId)
                    || "exercise".equals(activity.path("kind").asText()) && !lessonId.isEmpty()
                    && lastResults(callerId, learnerId).containsKey(lessonId);
        }
        List<LibraryPlacement> placements = new ArrayList<>();
        boolean transcriptAllowed = false;
        for (JsonNode placement : content.path("placements")) {
            boolean available = CourseRules.transcriptAvailable(placement.path("transcriptVisibility").asText(),
                    answered, staff);
            transcriptAllowed |= available && "audio".equals(placement.path("usage").asText());
            placements.add(new LibraryPlacement(placement.path("position").asInt(), placement.path("assetId").asText(),
                    placement.path("assetVersion").asInt(), placement.path("usage").asText(),
                    nullable(placement.path("alt")), nullable(placement.path("caption")), available,
                    placement.path("decorative").asBoolean(false), nullable(placement.path("questionId")),
                    nullable(placement.path("optionId")), null, null));
        }
        List<String> competences = new ArrayList<>();
        for (JsonNode competence : activity.path("competences")) competences.add(competence.asText());
        JsonNode questions = content.path("questions").isArray() ? content.path("questions") : mapper.createArrayNode();
        return new LibraryActivity(activity.path("id").asText(activityId), activity.path("position").asInt(),
                activity.path("kind").asText(), activity.path("title").asText(), activity.path("estimatedMinutes").asInt(),
                List.copyOf(competences), "todo", mapper.createObjectNode(), null, null,
                lesson.isObject() ? new LibraryLesson(lesson.path("id").asText(), lesson.path("title").asText(),
                        lesson.path("description").asText()) : null,
                transcriptAllowed && lesson.isObject() ? nullable(lesson.path("transcript")) : null,
                questions, withFiles(callerId, placements), versionId, track.path("levelCode").asText(),
                module.path("id").asText(), module.path("title").asText());
    }

    /**
     * Adresses temporaires des supports, demandées à Médias avec le jeton de l'utilisateur après la vérification de
     * l'accès (logique des séances, CourseResource.withFiles). Chaque ouverture renouvelle les adresses. Si Médias
     * est indisponible, l'activité reste lisible et chaque support propose de réessayer.
     */
    private List<LibraryPlacement> withFiles(UUID callerId, List<LibraryPlacement> placements) {
        Map<String, Map<String, Object>> wanted = new LinkedHashMap<>();
        for (LibraryPlacement placement : placements) {
            wanted.put(placement.assetId() + "@" + placement.assetVersion(),
                    Map.of("assetId", placement.assetId(), "version", placement.assetVersion()));
        }
        String token = actor.token();
        if (wanted.isEmpty() || token.isEmpty()) return placements;
        Map<String, JsonNode> files = new HashMap<>();
        try {
            var result = services.exchange(mediaUrl, "/v1/internal/media/read-grants", "POST", callerId,
                    Map.of("items", List.copyOf(wanted.values())), token, "", false, actor.requestId());
            if (result.status() != 200 || !result.body().isArray()) {
                LOG.warnf("Media read grants returned HTTP %d", result.status());
                return placements;
            }
            for (JsonNode file : result.body()) {
                files.put(file.path("assetId").asText() + "@" + file.path("version").asInt(), file);
            }
        } catch (WebApplicationException error) {
            LOG.warn("Media read grants unavailable");
            return placements;
        }
        return placements.stream()
                .map(placement -> placement.withFile(files.get(placement.assetId() + "@" + placement.assetVersion())))
                .toList();
    }

    /** Une transcription ne dépend de la réponse de l'élève que si un support la réserve à « après la réponse ». */
    private static boolean needsAnswer(JsonNode content) {
        for (JsonNode placement : content.path("placements")) {
            if ("after_answer".equals(placement.path("transcriptVisibility").asText())) return true;
        }
        return false;
    }

    /** Langue d'une version publiée (catalogue antérieur aux langues : allemand). */
    static String languageOf(JsonNode track) {
        String languageId = track.path("languageId").asText("");
        return languageId.isEmpty() ? LEGACY_LANGUAGE : languageId;
    }

    /** Module contenant une leçon ou un exercice de la version, ou null (activité absente ou hors accès libre). */
    static JsonNode moduleOf(JsonNode track, String activityId) {
        for (JsonNode module : track.path("modules")) {
            for (JsonNode activity : module.path("activities")) {
                if (activityId.equals(activity.path("id").asText())) {
                    return KINDS.contains(activity.path("kind").asText()) ? module : null;
                }
            }
        }
        return null;
    }

    /** Modules d'une version et leurs leçons et exercices, avec le dernier score de chaque exercice. */
    static List<LibraryModule> modules(JsonNode track, Map<String, LastResult> results) {
        List<LibraryModule> modules = new ArrayList<>();
        for (JsonNode module : track.path("modules")) {
            List<LibraryActivityItem> activities = new ArrayList<>();
            for (JsonNode activity : module.path("activities")) {
                String kind = activity.path("kind").asText();
                if (!KINDS.contains(kind)) continue;
                String lessonId = nullable(activity.path("lessonId"));
                List<String> competences = new ArrayList<>();
                for (JsonNode competence : activity.path("competences")) competences.add(competence.asText());
                activities.add(new LibraryActivityItem(activity.path("id").asText(), kind, activity.path("title").asText(),
                        activity.path("estimatedMinutes").asInt(), List.copyOf(competences), lessonId,
                        "exercise".equals(kind) && lessonId != null ? results.get(lessonId) : null));
            }
            modules.add(new LibraryModule(module.path("id").asText(), module.path("position").asInt(),
                    module.path("title").asText(), module.path("objective").asText(""), List.copyOf(activities)));
        }
        return List.copyOf(modules);
    }

    /**
     * Entraînement libre : le bilan intermédiaire seulement. L'examen blanc valide le passage de niveau ; il reste
     * réservé au parcours et n'est jamais ouvert depuis la bibliothèque.
     */
    static List<Practice> practice(boolean midtermAvailable) {
        return List.of(new Practice("midterm", "Bilan intermédiaire", midtermAvailable),
                new Practice("final", "Examen blanc", false));
    }

    static String nullable(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode() ? null : node.asText();
    }
}
