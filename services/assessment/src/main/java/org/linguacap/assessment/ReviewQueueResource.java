package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

/**
 * File du professeur (EVO-043, EVO-044) : missions remises et répétitions orales enregistrées qui attendent un
 * retour, pour les élèves que l'appelant est habilité à corriger (professeur référent, correcteur désigné,
 * administration). Un enregistrement d'élève autonome sans correcteur n'apparaît que chez l'administration.
 */
@Path("/v1/assessments/reviews")
@Produces(MediaType.APPLICATION_JSON)
public class ReviewQueueResource {
    private static final int GRADER_BATCH = 200;

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject MissionStore missions;
    @Inject SpeechStore speeches;
    @Inject ExerciseKeys keys;

    @ConfigProperty(name = "lingua.services.identity") String identityUrl;

    @GET
    public List<ReviewItem> reviews() {
        UUID callerId = actor.id();
        if ("learner".equals(identities.current(callerId).path("role").asText())) {
            throw HttpError.forbidden("La file des corrections est réservée aux professeurs, aux correcteurs et à l’administration.");
        }
        List<MissionStore.Mission> waitingMissions = missions.awaitingReview();
        List<SpeechStore.Speech> waitingSpeech = speeches.pending();
        if (waitingMissions.isEmpty() && waitingSpeech.isEmpty()) return List.of();
        List<UUID> learnerIds = new ArrayList<>();
        waitingMissions.forEach(mission -> learnerIds.add(mission.learnerId()));
        waitingSpeech.forEach(speech -> learnerIds.add(speech.learnerId()));
        Map<UUID, JsonNode> rights = rights(services, identityUrl, callerId, learnerIds);
        List<ReviewItem> items = new ArrayList<>();
        for (MissionStore.Mission mission : waitingMissions) {
            JsonNode right = rights.get(mission.learnerId());
            if (right == null || !right.path("canGrade").asBoolean()) continue;
            items.add(new ReviewItem("mission", mission.id(), mission.learnerId(), right.path("displayName").asText(""),
                    mission.definition().path("title").asText("Mission"), mission.levelCode(),
                    mission.sessionId() == null ? "library" : "session", text(mission.submittedAt())));
        }
        for (SpeechStore.Speech speech : waitingSpeech) {
            JsonNode right = rights.get(speech.learnerId());
            if (right == null || !right.path("canGrade").asBoolean()) continue;
            JsonNode key = quietKey(speech.lessonId(), callerId);
            JsonNode question = key == null ? null : AnswerRules.questions(key).get(speech.questionId());
            String sentence = question == null ? "" : AnswerRules.speakText(question);
            items.add(new ReviewItem("speech", speech.id(), speech.learnerId(), right.path("displayName").asText(""),
                    sentence.isBlank() ? "Prononciation" : "Prononciation : « " + sentence + " »",
                    key == null ? null : keys.levelCode(key.path("versionId").asText(null), callerId),
                    speech.sessionId() == null ? "library" : "session", text(speech.createdAt())));
        }
        items.sort(Comparator.comparing(ReviewItem::submittedAt, Comparator.nullsLast(Comparator.naturalOrder())));
        return items;
    }

    /** Clé de l'exercice pour titrer une répétition ; un catalogue indisponible ne bloque pas la file. */
    private JsonNode quietKey(String lessonId, UUID callerId) {
        try {
            return keys.key(lessonId, callerId);
        } catch (WebApplicationException error) {
            return null;
        }
    }

    /**
     * Droits de correction chez Identités (DEV-065, DEV-068), par lots de 200 élèves : learnerId → {displayName,
     * teacherId, reviewerId, canGrade}.
     */
    static Map<UUID, JsonNode> rights(ServiceClient services, String identityUrl, UUID callerId, Collection<UUID> learnerIds) {
        List<UUID> ids = List.copyOf(new LinkedHashSet<>(learnerIds));
        Map<UUID, JsonNode> rights = new HashMap<>();
        for (int from = 0; from < ids.size(); from += GRADER_BATCH) {
            JsonNode list = services.request(identityUrl, "/v1/internal/identity/graders", "POST", callerId,
                    Map.of("learnerIds", ids.subList(from, Math.min(ids.size(), from + GRADER_BATCH))));
            for (JsonNode right : list) rights.put(UUID.fromString(right.path("learnerId").asText()), right);
        }
        return rights;
    }

    /** Professeur référent, correcteur désigné disposant de la permission Correction, ou administration. */
    static boolean canGrade(ServiceClient services, String identityUrl, UUID callerId, UUID learnerId) {
        JsonNode right = rights(services, identityUrl, callerId, List.of(learnerId)).get(learnerId);
        return right != null && right.path("canGrade").asBoolean();
    }

    private static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }

    /** kind : mission ou speech ; context : séance ou bibliothèque. */
    public record ReviewItem(String kind, UUID id, UUID learnerId, String learnerName, String title, String levelCode,
                             String context, String submittedAt) {}
}
