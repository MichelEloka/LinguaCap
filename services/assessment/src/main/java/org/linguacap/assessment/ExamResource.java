package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.ServiceClient;

/**
 * Bilan intermédiaire et examen blanc (DEV-061 à DEV-071) : l'élève ouvre une tentative sur la version attribuée,
 * enregistre ses réponses, dépose son oral par Médias et remet sa tentative ; le professeur référent ou le
 * correcteur désigné corrige l'écrit et l'oral avec la grille ; le résultat par compétence est calculé ici.
 */
@Path("/v1/assessments")
@Produces(MediaType.APPLICATION_JSON)
public class ExamResource {
    private static final Logger LOG = Logger.getLogger(ExamResource.class);
    private static final Pattern REQUEST_KEY = Pattern.compile("[A-Za-z0-9_-]{8,128}");
    private static final Pattern PART_ID = Pattern.compile("[a-z0-9]+(-[a-z0-9]+)*");
    private static final Set<String> KINDS = Set.of("midterm", "final");

    @Inject Actor actor;
    @Inject ServiceClient services;
    @Inject ExamStore store;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "lingua.services.catalogue") String catalogueUrl;
    @ConfigProperty(name = "lingua.services.learning") String learningUrl;
    @ConfigProperty(name = "lingua.services.media") String mediaUrl;
    @ConfigProperty(name = "lingua.services.identity") String identityUrl;

    /** Tentatives d'un parcours, la plus récente d'abord : historique visible de l'élève et de ses professeurs. */
    @GET
    @Path("/exams")
    public List<ExamSummary> exams(@QueryParam("enrollmentId") UUID enrollmentId) {
        UUID callerId = actor.id();
        if (enrollmentId == null) throw HttpError.badRequest("Indiquez le parcours.");
        context(callerId, enrollmentId);
        return store.forEnrollment(enrollmentId).stream().map(ExamResource::summary).toList();
    }

    /** Ouvre la tentative de l'élève, ou reprend la tentative en cours. */
    @POST
    @Path("/exams")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response start(StartRequest request) {
        UUID learnerId = actor.id();
        if (request == null || request.enrollmentId() == null || !KINDS.contains(request.kind())) {
            throw HttpError.badRequest("Indiquez le parcours et l’évaluation : bilan ou examen blanc.");
        }
        JsonNode context = context(learnerId, request.enrollmentId());
        if (!learnerId.toString().equals(context.path("learnerId").asText())) {
            throw HttpError.forbidden("Seul l’élève passe son évaluation.");
        }
        String kind = request.kind();
        String refusal = startRefusal(context, kind);
        if (refusal != null) throw HttpError.conflict(refusal);
        boolean retake = retakeOfCompletedLevel(context, kind);
        List<ExamStore.Attempt> previous = store.forEnrollment(request.enrollmentId()).stream()
                .filter(attempt -> attempt.kind().equals(kind)).toList();
        boolean resuming = previous.stream().anyMatch(attempt -> "in_progress".equals(attempt.status()));
        if (!resuming) {
            if (previous.stream().anyMatch(attempt -> "submitted".equals(attempt.status()))) {
                throw HttpError.conflict("Votre dernière tentative attend sa correction.");
            }
            if ("midterm".equals(kind) && !previous.isEmpty()) throw HttpError.conflict("Le bilan intermédiaire est déjà remis.");
            if (previous.stream().anyMatch(attempt -> "validated".equals(attempt.decision()))) {
                throw HttpError.conflict("L’examen blanc est déjà validé.");
            }
        }
        JsonNode definition = services.request(catalogueUrl, "/v1/internal/tracks/" + context.path("trackVersionId").asText()
                + "/assessments/" + kind, "GET", learnerId, null);
        if (definition.path("parts").isEmpty()) throw HttpError.conflict("Cette évaluation n’a pas encore de contenu.");
        // La reprise d'un niveau terminé n'a plus de créneau au calendrier : elle n'a pas d'échéance.
        String due = retake ? null : context.path("midterm".equals(kind) ? "midtermDueAt" : "finalDueAt").asText(null);
        ExamStore.Attempt attempt = store.open(learnerId, request.enrollmentId(),
                UUID.fromString(context.path("trackVersionId").asText()), kind, definition,
                definition.path("passPercent").asInt(60), due == null ? null : OffsetDateTime.parse(due));
        return Response.status(resuming ? Response.Status.OK : Response.Status.CREATED)
                .entity(view(attempt, learnerId, true, false)).build();
    }

    @GET
    @Path("/exams/{id}")
    public ExamView exam(@PathParam("id") UUID id) {
        UUID callerId = actor.id();
        ExamStore.Attempt attempt = store.find(id);
        if (callerId.equals(attempt.learnerId())) return view(attempt, callerId, true, false);
        boolean grader = canGrade(callerId, attempt.learnerId());
        if (!grader) context(callerId, attempt.enrollmentId());
        return view(attempt, callerId, grader, grader);
    }

    /** Enregistre les réponses en cours : la tentative reprend là où l'élève l'a laissée. */
    @PUT
    @Path("/exams/{id}/answers")
    @Consumes(MediaType.APPLICATION_JSON)
    public ExamView save(@PathParam("id") UUID id, ProgressRequest request) {
        UUID learnerId = actor.id();
        ExamStore.Attempt attempt = owned(learnerId, id);
        if (request == null) throw HttpError.badRequest("Réponses requises.");
        ExamRules.checkProgress(attempt.definition(), request.answers(), request.texts());
        return view(store.saveProgress(id, request.answers(), request.texts()), learnerId, false, false);
    }

    /** Réserve le dépôt direct de l'enregistrement d'une partie orale dans l'espace privé des productions. */
    @POST
    @Path("/exams/{id}/recordings")
    @Consumes(MediaType.APPLICATION_JSON)
    public JsonNode reserveRecording(@PathParam("id") UUID id, RecordingRequest request) {
        UUID learnerId = actor.id();
        ExamStore.Attempt attempt = owned(learnerId, id);
        if (!"in_progress".equals(attempt.status())) throw HttpError.conflict("Cette tentative est déjà remise.");
        if (request == null || request.partId() == null || !PART_ID.matcher(request.partId()).matches()) {
            throw HttpError.badRequest("Partie invalide.");
        }
        JsonNode part = ExamRules.part(attempt.definition(), request.partId());
        if (part == null || !ExamRules.ORAL.equals(part.path("mode").asText())) {
            throw HttpError.badRequest("Cette partie n’attend pas d’enregistrement.");
        }
        return forward(mediaUrl, "/v1/internal/media/productions", learnerId, Map.of("attemptId", id,
                "partId", request.partId(), "mimeType", String.valueOf(request.mimeType()), "size", request.size()));
    }

    /** Contrôle l'enregistrement reçu puis le rattache à la partie orale de la tentative. */
    @POST
    @Path("/exams/{id}/recordings/{productionId}/finalize")
    @Consumes(MediaType.APPLICATION_JSON)
    public ExamView finalizeRecording(@PathParam("id") UUID id, @PathParam("productionId") UUID productionId) {
        UUID learnerId = actor.id();
        ExamStore.Attempt attempt = owned(learnerId, id);
        if (!"in_progress".equals(attempt.status())) throw HttpError.conflict("Cette tentative est déjà remise.");
        JsonNode production = forward(mediaUrl, "/v1/internal/media/productions/" + productionId + "/finalize", learnerId, Map.of());
        if (!id.toString().equals(production.path("attemptId").asText()) || !"available".equals(production.path("status").asText())) {
            throw HttpError.conflict("Cet enregistrement ne correspond pas à cette tentative.");
        }
        return view(store.attachRecording(id, production.path("partId").asText(), productionId), learnerId, true, false);
    }

    /**
     * Remise finale (DEV-066) : refusée tant qu'une production manque. Les questions fermées sont corrigées tout de
     * suite ; sans écrit ni oral, le résultat est immédiat. Rejouer la remise renvoie la même tentative.
     */
    @POST
    @Path("/exams/{id}/submit")
    @Consumes(MediaType.APPLICATION_JSON)
    public ExamView submit(@PathParam("id") UUID id, @HeaderParam("Idempotency-Key") String key) {
        UUID learnerId = actor.id();
        ExamStore.Attempt attempt = owned(learnerId, id);
        if (key == null || !REQUEST_KEY.matcher(key).matches()) throw HttpError.badRequest("Clé de remise invalide.");
        if (!"in_progress".equals(attempt.status())) return view(attempt, learnerId, false, false);
        List<String> missing = ExamRules.missing(attempt.definition(), attempt.texts(), attempt.recordings());
        if (!missing.isEmpty()) throw HttpError.conflict(missing.get(0));
        ExamRules.Result result = ExamRules.needsGrading(attempt.definition()) ? null
                : ExamRules.result(attempt.definition(), ExamRules.closedScores(attempt.definition(), attempt.answers()),
                        attempt.passPercent(), attempt.kind());
        JsonNode review = result == null ? null : ExamRules.review(mapper, services.request(catalogueUrl,
                "/v1/internal/tracks/" + attempt.trackVersionId(), "GET", learnerId, null), result.weakCompetences());
        ExamStore.Attempt submitted = store.submit(id, key, result, review);
        notifyLearning(submitted, "submitted", learnerId);
        return view(submitted, learnerId, false, false);
    }

    /** File des corrections (DEV-068) : remises en attente que l'appelant est habilité à corriger. */
    @GET
    @Path("/grading")
    public List<QueueItem> queue() {
        UUID callerId = actor.id();
        List<ExamStore.Attempt> waiting = store.awaitingGrading();
        if (waiting.isEmpty()) return List.of();
        Map<UUID, JsonNode> rights = rights(callerId, waiting.stream().map(ExamStore.Attempt::learnerId).toList());
        List<QueueItem> queue = new ArrayList<>();
        for (ExamStore.Attempt attempt : waiting) {
            JsonNode right = rights.get(attempt.learnerId());
            if (right == null || !right.path("canGrade").asBoolean()) continue;
            queue.add(new QueueItem(attempt.id(), attempt.learnerId(), right.path("displayName").asText(), attempt.kind(),
                    attempt.number(), attempt.definition().path("levelCode").asText(null),
                    attempt.definition().path("title").asText(), text(attempt.submittedAt()), text(attempt.dueAt()),
                    attempt.onTime()));
        }
        return queue;
    }

    /**
     * Correction par compétence (DEV-069, DEV-070) : chaque critère de la grille est noté, avec un commentaire par
     * partie et une appréciation générale. Le résultat et la décision sont calculés une fois toutes les parties notées.
     */
    @POST
    @Path("/exams/{id}/grading")
    @Consumes(MediaType.APPLICATION_JSON)
    public ExamView grade(@PathParam("id") UUID id, GradingRequest request) {
        UUID graderId = actor.id();
        ExamStore.Attempt attempt = store.find(id);
        if (!canGrade(graderId, attempt.learnerId())) {
            throw HttpError.forbidden("Seuls le professeur référent et le correcteur désigné corrigent cette tentative.");
        }
        if (!"submitted".equals(attempt.status())) {
            throw HttpError.conflict("graded".equals(attempt.status()) ? "Cette tentative est déjà corrigée."
                    : "Cette tentative n’est pas encore remise.");
        }
        if (request == null || request.parts() == null || !request.parts().isObject()) {
            throw HttpError.badRequest("Notez chaque partie de la grille.");
        }
        String feedback = request.feedback() == null ? "" : request.feedback().strip();
        if (feedback.length() > 4000) throw HttpError.badRequest("L’appréciation compte 4 000 caractères au plus.");
        ObjectNode grading = mapper.createObjectNode();
        for (JsonNode part : attempt.definition().path("parts")) {
            if (ExamRules.CLOSED.equals(part.path("mode").asText())) continue;
            String partId = part.path("id").asText();
            JsonNode given = request.parts().path(partId);
            String comment = given.path("comment").asText("").strip();
            if (comment.length() > 2000) throw HttpError.badRequest("Un commentaire compte 2 000 caractères au plus.");
            JsonNode points = given.path("points");
            grading.putObject(partId).set("points", points.isObject() ? points.deepCopy() : mapper.createObjectNode());
            ((ObjectNode) grading.get(partId)).put("comment", comment);
        }
        Map<String, ExamRules.Score> parts = new LinkedHashMap<>(ExamRules.closedScores(attempt.definition(), attempt.answers()));
        parts.putAll(ExamRules.gradedScores(attempt.definition(), grading));
        ExamRules.Result result = ExamRules.result(attempt.definition(), parts, attempt.passPercent(), attempt.kind());
        JsonNode track = services.request(catalogueUrl, "/v1/internal/tracks/" + attempt.trackVersionId(), "GET", graderId, null);
        ArrayNode review = ExamRules.review(mapper, track, result.weakCompetences());
        ExamStore.Attempt graded = store.grade(id, graderId, grading, result, review, feedback);
        notifyLearning(graded, "graded", graderId);
        return view(graded, graderId, true, true);
    }

    /**
     * Ouverture ou reprise d'une tentative : sur un niveau en cours qui n'est pas en pause, ou pour l'examen blanc
     * « à consolider » d'un niveau terminé du parcours (l'élève a déjà ouvert le niveau suivant). Renvoie le refus,
     * ou null si la tentative est permise.
     */
    static String startRefusal(JsonNode context, String kind) {
        String status = context.path("status").asText();
        if ("active".equals(status)) {
            return "paused".equals(context.path("goalStatus").asText())
                    ? "Votre parcours est en pause : l’évaluation reprendra avec lui." : null;
        }
        if (retakeOfCompletedLevel(context, kind)) return null;
        return "completed".equals(status) ? "Ce niveau est terminé : seul un examen blanc à consolider peut encore être repris."
                : "Ce parcours n’est plus actif.";
    }

    static boolean retakeOfCompletedLevel(JsonNode context, String kind) {
        return "completed".equals(context.path("status").asText()) && "final".equals(kind)
                && "to_consolidate".equals(context.path("goalStatus").asText());
    }

    private ExamStore.Attempt owned(UUID learnerId, UUID id) {
        ExamStore.Attempt attempt = store.find(id);
        if (!learnerId.equals(attempt.learnerId())) throw HttpError.notFound("Tentative introuvable.");
        return attempt;
    }

    /** Contexte du parcours chez Apprentissage : l'appel échoue si l'appelant n'y a pas accès. */
    private JsonNode context(UUID callerId, UUID enrollmentId) {
        return services.request(learningUrl, "/v1/internal/learning/enrollments/" + enrollmentId, "GET", callerId, null);
    }

    private Map<UUID, JsonNode> rights(UUID callerId, List<UUID> learnerIds) {
        JsonNode list = services.request(identityUrl, "/v1/internal/identity/graders", "POST", callerId,
                Map.of("learnerIds", List.copyOf(new LinkedHashSet<>(learnerIds))));
        Map<UUID, JsonNode> rights = new HashMap<>();
        for (JsonNode right : list) rights.put(UUID.fromString(right.path("learnerId").asText()), right);
        return rights;
    }

    private boolean canGrade(UUID callerId, UUID learnerId) {
        JsonNode right = rights(callerId, List.of(learnerId)).get(learnerId);
        return right != null && right.path("canGrade").asBoolean();
    }

    /** Appel interne avec le jeton de l'utilisateur (politiques Storage) ; les refus métier sont relayés tels quels. */
    private JsonNode forward(String base, String path, UUID callerId, Object body) {
        var result = services.exchange(base, path, "POST", callerId, body, actor.token(), "", false, actor.requestId());
        if (result.status() >= 400) {
            throw new WebApplicationException(Response.status(result.status()).type(MediaType.APPLICATION_JSON_TYPE)
                    .entity(result.body()).build());
        }
        return result.body();
    }

    /** Termine le créneau du calendrier et met à jour l'objectif ; un échec est journalisé sans annuler la remise. */
    private void notifyLearning(ExamStore.Attempt attempt, String event, UUID callerId) {
        Map<String, Object> body = new HashMap<>();
        body.put("kind", attempt.kind());
        body.put("attemptId", attempt.id());
        body.put("event", event);
        body.put("decision", attempt.decision());
        try {
            var result = services.exchange(learningUrl, "/v1/internal/learning/enrollments/" + attempt.enrollmentId()
                    + "/exam-events", "POST", callerId, body, "", "", false, actor.requestId());
            if (result.status() != 200) LOG.warnf("Learning exam event returned HTTP %d", result.status());
        } catch (WebApplicationException error) {
            LOG.warn("Learning exam event unavailable");
        }
    }

    private ExamView view(ExamStore.Attempt attempt, UUID callerId, boolean withFiles, boolean grader) {
        boolean owner = callerId.equals(attempt.learnerId());
        boolean graded = "graded".equals(attempt.status());
        JsonNode definition = ExamRules.withoutAnswers(attempt.definition());
        Map<String, String> media = new LinkedHashMap<>();
        List<Recording> recordings = new ArrayList<>();
        if (withFiles && !actor.token().isEmpty()) {
            if (owner && "in_progress".equals(attempt.status())) media = placementFiles(attempt, callerId);
            recordings = recordingFiles(attempt, callerId);
        }
        Map<String, ExamRules.Score> closed = owner && !graded ? Map.of()
                : ExamRules.closedScores(attempt.definition(), attempt.answers());
        Result result = graded ? new Result(attempt.scores(), attempt.percent(), attempt.decision(), attempt.review(),
                attempt.feedback(), comments(attempt.grading()), text(attempt.gradedAt())) : null;
        return new ExamView(attempt.id(), attempt.enrollmentId(), attempt.learnerId(), attempt.kind(), attempt.number(),
                attempt.status(), definition, attempt.answers(), attempt.texts(), recordings, media,
                closed.isEmpty() ? null : ExamRules.scoresNode(mapper, closed), text(attempt.dueAt()),
                text(attempt.startedAt()), text(attempt.submittedAt()), attempt.onTime(), result,
                grader && "submitted".equals(attempt.status()));
    }

    /** Adresses temporaires des supports de l'évaluation (sons d'écoute, images), pour l'élève qui la passe. */
    private Map<String, String> placementFiles(ExamStore.Attempt attempt, UUID callerId) {
        Map<String, Map<String, Object>> wanted = new LinkedHashMap<>();
        for (JsonNode part : attempt.definition().path("parts")) {
            for (JsonNode placement : part.path("placements")) {
                wanted.put(placement.path("assetId").asText() + "@" + placement.path("assetVersion").asInt(),
                        Map.of("assetId", placement.path("assetId").asText(), "version", placement.path("assetVersion").asInt()));
            }
        }
        Map<String, String> files = new LinkedHashMap<>();
        if (wanted.isEmpty()) return files;
        try {
            var result = services.exchange(mediaUrl, "/v1/internal/media/read-grants", "POST", callerId,
                    Map.of("items", List.copyOf(wanted.values())), actor.token(), "", false, actor.requestId());
            if (result.status() == 200) {
                for (JsonNode file : result.body()) {
                    files.put(file.path("assetId").asText() + "@" + file.path("version").asInt(), file.path("url").asText());
                }
            }
        } catch (WebApplicationException error) {
            LOG.warn("Media read grants unavailable for an exam");
        }
        return files;
    }

    /** Enregistrements oraux de la tentative, lisibles par leur élève et par les correcteurs habilités (DEV-065). */
    private List<Recording> recordingFiles(ExamStore.Attempt attempt, UUID callerId) {
        List<String> ids = new ArrayList<>();
        attempt.recordings().properties().forEach(entry -> ids.add(entry.getValue().asText()));
        List<Recording> recordings = new ArrayList<>();
        if (ids.isEmpty()) return recordings;
        try {
            var result = services.exchange(mediaUrl, "/v1/internal/media/productions/read-grants", "POST", callerId,
                    Map.of("ids", ids), actor.token(), "", false, actor.requestId());
            if (result.status() == 200) {
                for (JsonNode file : result.body()) {
                    recordings.add(new Recording(file.path("partId").asText(), file.path("id").asText(),
                            file.path("mimeType").asText(), file.path("url").asText(null)));
                }
            }
        } catch (WebApplicationException error) {
            LOG.warn("Media production grants unavailable");
        }
        return recordings;
    }

    private static Map<String, String> comments(JsonNode grading) {
        Map<String, String> comments = new LinkedHashMap<>();
        if (grading != null) grading.properties().forEach(entry -> comments.put(entry.getKey(), entry.getValue().path("comment").asText("")));
        return comments;
    }

    private static ExamSummary summary(ExamStore.Attempt attempt) {
        return new ExamSummary(attempt.id(), attempt.kind(), attempt.number(), attempt.status(),
                attempt.definition().path("title").asText(), text(attempt.startedAt()), text(attempt.submittedAt()),
                text(attempt.dueAt()), text(attempt.gradedAt()), attempt.onTime(), attempt.percent(), attempt.decision());
    }

    private static String text(OffsetDateTime value) {
        return value == null ? null : value.toString();
    }

    public record StartRequest(UUID enrollmentId, String kind) {}

    public record ProgressRequest(JsonNode answers, JsonNode texts) {}

    public record RecordingRequest(String partId, String mimeType, long size) {}

    public record GradingRequest(JsonNode parts, String feedback) {}

    public record Recording(String partId, String productionId, String mimeType, String url) {}

    public record Result(JsonNode scores, Integer percent, String decision, JsonNode review, String feedback,
                         Map<String, String> comments, String gradedAt) {}

    /** canGrade : l'appelant peut corriger cette remise maintenant. closedScores : questions fermées, partie par partie. */
    public record ExamView(UUID id, UUID enrollmentId, UUID learnerId, String kind, int number, String status,
                           JsonNode definition, JsonNode answers, JsonNode texts, List<Recording> recordings,
                           Map<String, String> media, JsonNode closedScores, String dueAt, String startedAt,
                           String submittedAt, boolean onTime, Result result, boolean canGrade) {}

    public record ExamSummary(UUID id, String kind, int number, String status, String title, String startedAt,
                              String submittedAt, String dueAt, String gradedAt, boolean onTime, Integer percent,
                              String decision) {}

    public record QueueItem(UUID id, UUID learnerId, String learnerName, String kind, int number, String levelCode,
                            String title, String submittedAt, String dueAt, boolean onTime) {}
}
