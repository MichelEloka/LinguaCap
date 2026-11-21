package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;

/**
 * Bibliothèque en accès libre : toutes les versions publiées de la langue de l'élève, leçons et exercices lisibles à
 * tout moment, hors parcours. Les exercices libres sont corrigés par Évaluations (POST /assessments/quiz sans séance) ;
 * l'entraînement se limite au bilan intermédiaire, l'examen blanc restant l'examen de passage du parcours.
 */
@Path("/v1/learning")
@Produces(MediaType.APPLICATION_JSON)
public class LibraryResource {
    private static final String ACTIVITY_ID = "[a-z0-9]+(-[a-z0-9]+)*";

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject LibraryContent content;

    /** Élève consulté : lui-même, ou l'élève demandé par son professeur référent ou l'administration. */
    record Reader(UUID learnerId, boolean staff, String languageId) {}

    @GET
    @Path("/library")
    public Library library(@QueryParam("learnerId") String requestedLearnerId) {
        UUID callerId = actor.id();
        Reader reader = reader(callerId, requestedLearnerId, false);
        if (reader.languageId() == null) return new Library(null, List.of());
        List<JsonNode> tracks = content.publishedTracks(callerId, reader.languageId());
        if (tracks.isEmpty()) return new Library(reader.languageId(), List.of());
        Map<String, LastResult> results = content.lastResults(callerId, reader.learnerId());
        LibraryContent.PathVersions path = content.pathVersions(reader.learnerId());
        List<LibraryLevel> levels = new ArrayList<>();
        for (JsonNode summary : tracks) {
            UUID versionId = UUID.fromString(summary.path("versionId").asText());
            JsonNode track = content.track(callerId, versionId);
            if (track == null) continue;
            levels.add(new LibraryLevel(summary.path("levelCode").asText(), summary.path("levelTitle").asText(),
                    versionId, summary.path("number").asInt(), path.inPath().contains(versionId),
                    versionId.equals(path.current()), LibraryContent.modules(track, results),
                    LibraryContent.practice(content.midtermAvailable(callerId, track))));
        }
        return new Library(reader.languageId(), List.copyOf(levels));
    }

    /**
     * Leçon ou exercice d'une version publiée de la langue de l'élève, sans corrigé, avec les adresses temporaires
     * de ses supports. Sans learnerId, un membre de l'équipe pédagogique consulte toute version publiée.
     */
    @GET
    @Path("/library/{versionId}/activities/{activityId}")
    public LibraryActivity activity(@PathParam("versionId") UUID versionId, @PathParam("activityId") String activityId,
                                    @QueryParam("learnerId") String requestedLearnerId) {
        UUID callerId = actor.id();
        if (!activityId.matches(ACTIVITY_ID) || activityId.length() > 80) {
            throw HttpError.notFound("Activité introuvable dans la bibliothèque.");
        }
        Reader reader = reader(callerId, requestedLearnerId, true);
        JsonNode track = content.track(callerId, versionId);
        if (track == null || !"published".equals(track.path("status").asText())
                || reader.learnerId() != null && !Objects.equals(reader.languageId(), LibraryContent.languageOf(track))) {
            throw HttpError.notFound("Cette activité ne fait pas partie de la bibliothèque.");
        }
        return content.activity(callerId, reader.learnerId(), reader.staff(), track, activityId);
    }

    private Reader reader(UUID callerId, String requestedLearnerId, boolean staffWithoutLearner) {
        if (requestedLearnerId != null) {
            UUID learnerId = parse(requestedLearnerId);
            if (!learnerId.equals(callerId)) {
                JsonNode learner = identities.learner(callerId, learnerId);
                return new Reader(learnerId, true, LibraryContent.nullable(learner.path("languageId")));
            }
        }
        JsonNode me = identities.current(callerId);
        if ("learner".equals(me.path("role").asText())) {
            return new Reader(callerId, false, LibraryContent.nullable(me.path("languageId")));
        }
        if (staffWithoutLearner) return new Reader(null, true, null);
        throw HttpError.forbidden("Sélectionnez un élève auquel votre compte a accès.");
    }

    private static UUID parse(String value) {
        try {
            UUID id = UUID.fromString(value);
            if (id.toString().equalsIgnoreCase(value)) return id;
        } catch (IllegalArgumentException ignored) {
            // Même réponse pour toutes les formes invalides.
        }
        throw HttpError.badRequest("Identifiant élève invalide.");
    }

    /** languageId : null tant qu'un élève autonome n'a pas choisi sa langue (bibliothèque vide). */
    public record Library(String languageId, List<LibraryLevel> levels) {}

    /** inPath : niveau du parcours de l'élève ; current : niveau en cours. */
    public record LibraryLevel(String levelCode, String levelTitle, UUID trackVersionId, int number, boolean inPath,
                               boolean current, List<LibraryModule> modules, List<Practice> practice) {}

    public record LibraryModule(String id, int position, String title, String objective,
                                List<LibraryActivityItem> activities) {}

    /** lastResult : dernier score de l'exercice, remis librement ou en séance (null pour une leçon). */
    public record LibraryActivityItem(String id, String kind, String title, int estimatedMinutes,
                                      List<String> competences, String lessonId, LastResult lastResult) {}

    public record LastResult(int correct, int total, String submittedAt) {}

    /** Entraînement proposé : le bilan intermédiaire seulement ; l'examen blanc garde available à false. */
    public record Practice(String kind, String title, boolean available) {}

    public record LibraryLesson(String id, String title, String description) {}

    /** Support d'une activité, d'une question (questionId) ou d'un choix (optionId), avec son adresse temporaire. */
    public record LibraryPlacement(int position, String assetId, int assetVersion, String usage, String alt,
                                   String caption, boolean transcriptAvailable, boolean decorative, String questionId,
                                   String optionId, String url, String mimeType) {
        LibraryPlacement withFile(JsonNode file) {
            if (file == null) return this;
            return new LibraryPlacement(position, assetId, assetVersion, usage, alt, caption, transcriptAvailable,
                    decorative, questionId, optionId, file.path("url").asText(null), file.path("mimeType").asText(null));
        }
    }

    /**
     * Forme d'une activité de séance (CourseResource.ActivityDetail) sans progression ni corrigé : status « todo »,
     * état vide, completedAt et attemptId à null, complétée par la version et le module d'origine.
     */
    public record LibraryActivity(String id, int position, String kind, String title, int estimatedMinutes,
                                  List<String> competences, String status, JsonNode state, String completedAt,
                                  String attemptId, LibraryLesson lesson, String transcript, JsonNode questions,
                                  List<LibraryPlacement> placements, UUID trackVersionId, String levelCode,
                                  String moduleId, String moduleTitle) {}
}
