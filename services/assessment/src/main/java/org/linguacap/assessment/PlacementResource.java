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
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;

/**
 * Test de niveau de l'accueil élève : la banque publiée de la langue est lue chez Catalogue (avec corrigés), le tirage
 * est figé dans la tentative, l'élève remet un palier à la fois et reçoit son niveau placé. Le professeur référent et
 * l'administration consultent le résultat, sans les questions. Aucun événement, aucun appel à Apprentissage.
 */
@Path("/v1/assessments/placements")
@Produces(MediaType.APPLICATION_JSON)
public class PlacementResource {
    private static final Logger LOG = Logger.getLogger(PlacementResource.class);
    private static final Pattern REQUEST_KEY = Pattern.compile("[A-Za-z0-9_-]{8,128}");
    private static final SecureRandom RANDOM = new SecureRandom();

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject PlacementStore store;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "lingua.services.catalogue") String catalogueUrl;
    @ConfigProperty(name = "lingua.services.media") String mediaUrl;

    /** Tentatives de l'élève (ou de l'élève indiqué, pour son professeur référent et l'administration), récentes d'abord. */
    @GET
    public List<PlacementSummary> placements(@QueryParam("learnerId") String requestedLearnerId) {
        UUID learnerId = authorizeLearner(actor.id(), requestedLearnerId);
        return store.forLearner(learnerId).stream().map(PlacementRules::summary).toList();
    }

    /**
     * Démarre le test, reprend la tentative en cours (200) ou enregistre « débutant déclaré ». Un nouvel essai attend
     * 24 h après la fin du précédent ; restart abandonne la tentative en cours pour un nouveau tirage.
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response start(StartRequest request) {
        UUID learnerId = actor.id();
        JsonNode profile = identities.current(learnerId);
        if (!"learner".equals(profile.path("role").asText())) throw HttpError.forbidden("Seul un élève passe le test de niveau.");
        StartRequest body = request == null ? new StartRequest(null, null, null) : request;
        String languageId = PlacementRules.language(body.languageId(), profile.path("languageId").asText(null));
        if (Boolean.TRUE.equals(body.declaredBeginner())) {
            PlacementStore.Attempt attempt = store.declareBeginner(learnerId, languageId);
            return Response.status(Response.Status.CREATED).entity(view(attempt, learnerId)).build();
        }
        boolean restart = Boolean.TRUE.equals(body.restart());
        PlacementStore.Attempt current = store.open(learnerId, languageId);
        if (current != null && !restart) return Response.ok(view(current, learnerId)).build();
        String refusal = PlacementRules.retakeRefusal(store.lastTested(learnerId, languageId), OffsetDateTime.now());
        if (refusal != null) throw HttpError.conflict(refusal);
        JsonNode test = publishedTest(learnerId, languageId);
        JsonNode definition = PlacementRules.draw(mapper, test, RANDOM);
        UUID testId = uuid(test.path("id").asText(null));
        if (testId == null || PlacementRules.firstTier(definition) == null) {
            throw HttpError.conflict("Le test de niveau n’est pas encore disponible pour cette langue.");
        }
        PlacementStore.Opened opened = store.start(learnerId, languageId, testId, Math.max(1, test.path("number").asInt(1)),
                definition, restart);
        return Response.status(opened.created() ? Response.Status.CREATED : Response.Status.OK)
                .entity(view(opened.attempt(), learnerId)).build();
    }

    /** Tentative lue par son élève (questions du palier en cours, sans corrigé), ou par un tiers habilité (sans questions). */
    @GET
    @Path("/{id}")
    public PlacementView placement(@PathParam("id") UUID id) {
        UUID callerId = actor.id();
        PlacementStore.Attempt attempt = store.find(id);
        if (!callerId.equals(attempt.learnerId())) identities.learner(callerId, attempt.learnerId());
        return view(attempt, callerId);
    }

    /** Enregistre les réponses du palier en cours. */
    @PUT
    @Path("/{id}/answers")
    @Consumes(MediaType.APPLICATION_JSON)
    public PlacementView save(@PathParam("id") UUID id, TierAnswers request) {
        UUID learnerId = actor.id();
        if (request == null) throw HttpError.badRequest("Réponses requises.");
        return view(store.save(id, learnerId, request.tier(), request.answers()), learnerId);
    }

    /** Remet le palier en cours ; rejouer la remise avec la même clé renvoie le même état. */
    @POST
    @Path("/{id}/submit")
    @Consumes(MediaType.APPLICATION_JSON)
    public PlacementView submit(@PathParam("id") UUID id, @HeaderParam("Idempotency-Key") String key, TierAnswers request) {
        UUID learnerId = actor.id();
        if (key == null || !REQUEST_KEY.matcher(key).matches()) throw HttpError.badRequest("Clé de remise invalide.");
        if (request == null) throw HttpError.badRequest("Réponses requises.");
        return view(store.submit(id, learnerId, key, request.tier(), request.answers()), learnerId);
    }

    /** Banque publiée de la langue, corrigés compris (route interne de Catalogue). */
    private JsonNode publishedTest(UUID learnerId, String languageId) {
        var result = services.exchange(catalogueUrl, "/v1/internal/placement-tests/published/" + languageId, "GET",
                learnerId, null, "", "", false, actor.requestId());
        if (result.status() == 404) throw HttpError.conflict("Le test de niveau n’est pas encore disponible pour cette langue.");
        if (result.status() != 200 || !result.body().isObject()) {
            LOG.warnf("Published placement test returned HTTP %d", result.status());
            throw HttpError.unavailable("Le test de niveau est temporairement indisponible.");
        }
        return result.body();
    }

    private PlacementView view(PlacementStore.Attempt attempt, UUID callerId) {
        boolean owner = callerId.equals(attempt.learnerId());
        Map<String, PlacementRules.MediaFile> media = owner ? mediaFiles(attempt, callerId) : Map.of();
        OffsetDateTime retake = "completed".equals(attempt.status())
                ? PlacementRules.retakeAvailableAt(attempt, store.lastTested(attempt.learnerId(), attempt.languageId())) : null;
        return PlacementRules.view(attempt, owner, media, retake);
    }

    /** Adresses temporaires des sons et images du palier en cours, avec le jeton de l'élève (politiques Storage). */
    private Map<String, PlacementRules.MediaFile> mediaFiles(PlacementStore.Attempt attempt, UUID callerId) {
        Map<String, PlacementRules.MediaFile> files = new LinkedHashMap<>();
        List<Map<String, Object>> wanted = PlacementRules.mediaRefs(attempt);
        if (wanted.isEmpty() || actor.token().isEmpty()) return files;
        try {
            var result = services.exchange(mediaUrl, "/v1/internal/media/read-grants", "POST", callerId,
                    Map.of("items", wanted), actor.token(), "", false, actor.requestId());
            if (result.status() == 200) {
                for (JsonNode file : result.body()) {
                    files.put(file.path("assetId").asText() + "@" + file.path("version").asInt(),
                            new PlacementRules.MediaFile(file.path("url").asText(null), file.path("mimeType").asText(null)));
                }
            }
        } catch (WebApplicationException error) {
            LOG.warn("Media read grants unavailable for a placement test");
        }
        return files;
    }

    private UUID authorizeLearner(UUID callerId, String requestedLearnerId) {
        if (requestedLearnerId != null) {
            UUID id = uuid(requestedLearnerId);
            if (id == null || !id.toString().equalsIgnoreCase(requestedLearnerId)) {
                throw HttpError.badRequest("Identifiant élève invalide.");
            }
            if (!callerId.equals(id)) {
                identities.learner(callerId, id);
                return id;
            }
        }
        if (!"learner".equals(identities.current(callerId).path("role").asText())) {
            throw HttpError.forbidden("Sélectionnez un élève auquel votre compte a accès.");
        }
        return callerId;
    }

    private static UUID uuid(String value) {
        try {
            return value == null ? null : UUID.fromString(value);
        } catch (IllegalArgumentException error) {
            return null;
        }
    }

    public record StartRequest(String languageId, Boolean restart, Boolean declaredBeginner) {}

    /** answers : {questionId: optionId | "dontknow"} pour les questions du palier indiqué. */
    public record TierAnswers(String tier, JsonNode answers) {}

    public record CompetenceScore(int correct, int total, int percent) {}

    /** status : locked, current, passed ou failed ; scores à null tant que le palier n'est pas remis. */
    public record PlacementTier(String code, String title, String status, int questionCount, int passPercent,
                                Integer correct, Integer total, Integer percent, Map<String, CompetenceScore> competences) {}

    public record QuestionOption(String id, String text) {}

    public record QuestionPlacement(int position, String usage, String url, String mimeType, String alt, String caption) {}

    /** Question du palier en cours, sans corrigé. Le choix « Je ne sais pas » (valeur dontknow) est ajouté par l'interface. */
    public record PlacementQuestion(String id, String competence, String prompt, List<QuestionOption> options,
                                    List<QuestionPlacement> placements) {}

    public record PlacementResult(String placedLevel, String label, String summary, boolean beyondTest,
                                  boolean declaredBeginner) {}

    public record PlacementView(UUID id, UUID learnerId, String languageId, UUID testId, Integer testNumber, String status,
                                String currentTier, List<PlacementTier> tiers, List<PlacementQuestion> questions,
                                Map<String, String> savedAnswers, PlacementResult result, String startedAt,
                                String completedAt, String retakeAvailableAt) {}

    public record PlacementSummary(UUID id, String languageId, String status, String placedLevel, String startedAt,
                                   String completedAt) {}
}
