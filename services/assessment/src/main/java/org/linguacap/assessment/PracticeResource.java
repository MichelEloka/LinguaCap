package org.linguacap.assessment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.assessment.PlacementResource.CompetenceScore;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

/**
 * Examen d'entraînement de la bibliothèque : l'élève refait le bilan intermédiaire d'une version publiée de sa langue,
 * hors parcours. Seules les parties fermées sont corrigées ; aucun corrigé n'est révélé. L'examen blanc, examen de
 * passage de niveau, n'est pas proposé ici (409). Aucun événement, aucune file de correction, aucun appel à Apprentissage.
 */
@Path("/v1/assessments/practice")
@Produces(MediaType.APPLICATION_JSON)
public class PracticeResource {
    private static final Logger LOG = Logger.getLogger(PracticeResource.class);
    private static final Pattern REQUEST_KEY = Pattern.compile("[A-Za-z0-9_-]{8,128}");
    private static final Pattern LEVEL = Pattern.compile("[ABC][12]");

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject PracticeStore store;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "lingua.services.catalogue") String catalogueUrl;
    @ConfigProperty(name = "lingua.services.media") String mediaUrl;

    /** Entraînements de l'élève, les plus récents d'abord. */
    @GET
    public List<PracticeSummary> attempts() {
        UUID learnerId = actor.id();
        return store.forLearner(learnerId).stream().map(PracticeRules::summary).toList();
    }

    /** Ouvre un entraînement (201) ou reprend celui en cours (200) ; nouvel essai 12 h après une remise. */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response start(StartRequest request) {
        UUID learnerId = actor.id();
        if (request == null || request.trackVersionId() == null) {
            throw HttpError.badRequest("Indiquez la version et l’évaluation : bilan intermédiaire.");
        }
        PracticeRules.checkKind(request.kind());
        JsonNode profile = identities.current(learnerId);
        if (!"learner".equals(profile.path("role").asText())) throw HttpError.forbidden("Seul un élève s’entraîne ici.");
        UUID versionId = request.trackVersionId();
        PracticeStore.Attempt current = store.open(learnerId, versionId, request.kind());
        if (current != null) return Response.ok(view(current, learnerId)).build();
        String refusal = PracticeRules.retryRefusal(store.lastSubmitted(learnerId, versionId, request.kind()), OffsetDateTime.now());
        if (refusal != null) throw HttpError.conflict(refusal);
        JsonNode track = catalogue(learnerId, "/v1/internal/tracks/" + versionId, "Version introuvable.");
        if (!"published".equals(track.path("status").asText())) throw HttpError.conflict("Cette version n’est plus proposée.");
        String trackLanguage = track.path("languageId").asText("");
        String ownLanguage = profile.path("languageId").asText("");
        if (!trackLanguage.isBlank() && !ownLanguage.isBlank() && !trackLanguage.equals(ownLanguage)) {
            throw HttpError.conflict("Cet entraînement ne concerne pas la langue que vous apprenez.");
        }
        JsonNode definition = catalogue(learnerId, "/v1/internal/tracks/" + versionId + "/assessments/" + request.kind(),
                "Ce niveau n’a pas encore de bilan intermédiaire.");
        PracticeRules.checkPracticable(definition);
        String levelCode = definition.path("levelCode").asText(track.path("levelCode").asText(""));
        if (!LEVEL.matcher(levelCode).matches()) throw HttpError.unavailable("Cet entraînement est temporairement indisponible.");
        PracticeStore.Opened opened = store.create(learnerId, versionId, levelCode, request.kind(), definition);
        return Response.status(opened.created() ? Response.Status.CREATED : Response.Status.OK)
                .entity(view(opened.attempt(), learnerId)).build();
    }

    @GET
    @Path("/{id}")
    public PracticeView attempt(@PathParam("id") UUID id) {
        UUID learnerId = actor.id();
        return view(owned(learnerId, id), learnerId);
    }

    /** Enregistre les réponses en cours : l'entraînement reprend là où l'élève l'a laissé. */
    @PUT
    @Path("/{id}/answers")
    @Consumes(MediaType.APPLICATION_JSON)
    public PracticeView save(@PathParam("id") UUID id, ProgressRequest request) {
        UUID learnerId = actor.id();
        if (request == null || request.answers() == null || !request.answers().isObject()) {
            throw HttpError.badRequest("Les réponses doivent être regroupées par partie.");
        }
        return view(store.save(id, learnerId, request.answers()), learnerId);
    }

    /** Remise : score des parties fermées, sans corrigé. Rejouer la remise renvoie le même résultat. */
    @POST
    @Path("/{id}/submit")
    @Consumes(MediaType.APPLICATION_JSON)
    public PracticeView submit(@PathParam("id") UUID id, @HeaderParam("Idempotency-Key") String key) {
        UUID learnerId = actor.id();
        if (key == null || !REQUEST_KEY.matcher(key).matches()) throw HttpError.badRequest("Clé de remise invalide.");
        return view(store.submit(id, learnerId, key), learnerId);
    }

    private PracticeStore.Attempt owned(UUID learnerId, UUID id) {
        PracticeStore.Attempt attempt = store.find(id);
        if (!learnerId.equals(attempt.learnerId())) throw HttpError.notFound("Entraînement introuvable.");
        return attempt;
    }

    /** Lecture interne chez Catalogue : version ou évaluation absente → message clair, autre échec → indisponible. */
    private JsonNode catalogue(UUID learnerId, String path, String missing) {
        var result = services.exchange(catalogueUrl, path, "GET", learnerId, null, "", "", false, actor.requestId());
        if (result.status() == 404) throw HttpError.notFound(missing);
        if (result.status() != 200 || !result.body().isObject()) {
            LOG.warnf("Catalogue returned HTTP %d for a practice exam", result.status());
            throw HttpError.unavailable("Cet entraînement est temporairement indisponible.");
        }
        return result.body();
    }

    private PracticeView view(PracticeStore.Attempt attempt, UUID callerId) {
        Map<String, String> media = "in_progress".equals(attempt.status()) ? mediaFiles(attempt, callerId) : Map.of();
        return PracticeRules.view(mapper, attempt, media);
    }

    /** Adresses temporaires des sons et images de l'entraînement, avec le jeton de l'élève (politiques Storage). */
    private Map<String, String> mediaFiles(PracticeStore.Attempt attempt, UUID callerId) {
        Map<String, String> files = new LinkedHashMap<>();
        List<Map<String, Object>> wanted = PracticeRules.mediaRefs(attempt.definition());
        if (wanted.isEmpty() || actor.token().isEmpty()) return files;
        try {
            var result = services.exchange(mediaUrl, "/v1/internal/media/read-grants", "POST", callerId,
                    Map.of("items", wanted), actor.token(), "", false, actor.requestId());
            if (result.status() == 200) {
                for (JsonNode file : result.body()) {
                    files.put(file.path("assetId").asText() + "@" + file.path("version").asInt(), file.path("url").asText());
                }
            }
        } catch (WebApplicationException error) {
            LOG.warn("Media read grants unavailable for a practice exam");
        }
        return files;
    }

    public record StartRequest(UUID trackVersionId, String kind) {}

    /** answers : {partId: {questionId: optionId}} pour les parties fermées. */
    public record ProgressRequest(JsonNode answers) {}

    public record PartScore(int correct, int total) {}

    public record PracticeResult(int percent, boolean passed, Map<String, PartScore> parts,
                                 Map<String, CompetenceScore> competences) {}

    /** mode vaut toujours « practice » ; media : clé « assetId@version » → adresse temporaire, tant que l'entraînement est ouvert. */
    public record PracticeView(UUID id, UUID learnerId, UUID trackVersionId, String levelCode, String kind, String mode,
                               String status, JsonNode definition, JsonNode answers, Map<String, String> media,
                               PracticeResult result, String startedAt, String submittedAt, String nextAttemptAt) {}

    public record PracticeSummary(UUID id, UUID trackVersionId, String levelCode, String kind, String status, String title,
                                  Integer percent, String startedAt, String submittedAt) {}
}
