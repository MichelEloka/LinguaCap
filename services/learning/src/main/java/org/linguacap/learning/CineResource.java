package org.linguacap.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.linguacap.common.Actor;
import org.linguacap.common.HttpError;
import org.linguacap.common.IdentityClient;
import org.linguacap.common.ServiceClient;
import org.linguacap.learning.CineRules.CineOverview;
import org.linguacap.learning.CineRules.FilmRecommendation;
import org.linguacap.learning.CineRules.LearnerWord;
import org.linguacap.learning.CineRules.WordInput;

/**
 * Ciné-club (EVO-055), facultatif : carnet de mots de l'élève, séquences de film proposées par son professeur
 * référent, son correcteur désigné ou l'administration, et agrégation des films publiés de sa langue avec son dernier
 * résultat, ses mots notés et les propositions en cours. Lecture : l'élève, son référent, son correcteur désigné
 * (permission Correction) et l'administration, décidés par Identités (route interne des droits de correction) ; un
 * tiers est refusé. Écriture du carnet et refus d'une proposition : l'élève seulement.
 */
@Path("/v1/learning")
@Produces(MediaType.APPLICATION_JSON)
public class CineResource {
    private static final Logger LOG = Logger.getLogger(CineResource.class);
    /** Langue des comptes antérieurs au choix de la langue : tout le catalogue était en allemand. */
    private static final String DEFAULT_LANGUAGE = LibraryContent.LEGACY_LANGUAGE;

    @Inject Actor actor;
    @Inject IdentityClient identities;
    @Inject ServiceClient services;
    @Inject CineStore store;
    @Inject ObjectMapper mapper;

    @ConfigProperty(name = "lingua.services.identity") String identityUrl;
    @ConfigProperty(name = "lingua.services.catalogue") String catalogueUrl;
    @ConfigProperty(name = "lingua.services.assessment") String assessmentUrl;

    /**
     * Élève consulté et place de l'appelant : learner (l'élève lui-même), teacher (référent), reviewer (correcteur
     * désigné) ou admin. languageId : langue de l'élève, null si elle est inconnue.
     */
    record Reader(UUID callerId, UUID learnerId, String role, String languageId) {
        boolean self() {
            return callerId.equals(learnerId);
        }
    }

    @GET
    @Path("/words")
    public List<LearnerWord> words(@QueryParam("learnerId") String learnerId) {
        return store.words(reader(actor.id(), learnerId).learnerId());
    }

    @POST
    @Path("/words")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response addWord(WordRequest request) {
        Reader learner = learnerOnly(actor.id(), "Seul l’élève note un mot dans son carnet.");
        if (request == null) throw HttpError.badRequest("Le mot est requis.");
        WordInput input = CineRules.word(request.word(), request.note(), request.sourceKind(), request.sourceId());
        String language = learner.languageId() != null ? learner.languageId() : DEFAULT_LANGUAGE;
        return Response.status(Response.Status.CREATED).entity(store.add(learner.learnerId(), language, input)).build();
    }

    @PATCH
    @Path("/words/{wordId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public LearnerWord updateWord(@PathParam("wordId") String wordId, WordChange request) {
        Reader learner = learnerOnly(actor.id(), "Seul l’élève modifie son carnet.");
        if (request == null) throw HttpError.badRequest("Indiquez le mot ou la note à modifier.");
        return store.update(learner.learnerId(), id(wordId, "Mot introuvable dans ton carnet."),
                CineRules.change(request.word(), request.note()));
    }

    @DELETE
    @Path("/words/{wordId}")
    public Deleted deleteWord(@PathParam("wordId") String wordId) {
        Reader learner = learnerOnly(actor.id(), "Seul l’élève modifie son carnet.");
        UUID id = id(wordId, "Mot introuvable dans ton carnet.");
        store.delete(learner.learnerId(), id);
        return new Deleted(id, true);
    }

    @GET
    @Path("/film-recommendations")
    public List<FilmRecommendation> recommendations(@QueryParam("learnerId") String learnerId) {
        return store.recommendations(reader(actor.id(), learnerId).learnerId());
    }

    /**
     * Propose une séquence d'un film publié de la langue de l'élève : professeur référent, correcteur désigné ou
     * administration (403 pour tout autre compte, élève compris). Rien n'est planifié.
     */
    @POST
    @Path("/film-recommendations")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response recommend(RecommendationRequest request) {
        UUID callerId = actor.id();
        if (request == null || request.learnerId() == null) throw HttpError.badRequest("Indiquez l’élève et la séquence.");
        String note = CineRules.recommendationNote(request.sequenceId(), request.note());
        if (callerId.equals(request.learnerId())) {
            throw HttpError.forbidden("Seuls le professeur référent, le correcteur désigné et l’administration proposent une séquence.");
        }
        Reader staff = staff(callerId, request.learnerId());
        JsonNode film = CineRules.filmOf(films(callerId, staff.languageId(), null), request.sequenceId());
        if (film == null) {
            throw HttpError.notFound("Séquence introuvable parmi les films publiés de la langue de l’élève.");
        }
        FilmRecommendation created = store.recommend(staff.learnerId(), film.path("id").asText(), request.sequenceId(),
                callerId, staff.role(), note);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @POST
    @Path("/film-recommendations/{recommendationId}/dismiss")
    @Consumes(MediaType.APPLICATION_JSON)
    public FilmRecommendation dismiss(@PathParam("recommendationId") String recommendationId) {
        Reader learner = learnerOnly(actor.id(), "Seul l’élève écarte une séquence proposée.");
        return store.dismiss(learner.learnerId(), id(recommendationId, "Proposition introuvable."));
    }

    /**
     * Ciné-club de l'élève : films publiés de sa langue (et du niveau demandé), dernier résultat de chaque séquence, mots
     * notés par séquence et propositions en cours. Sans Évaluations, les résultats restent vides (page lisible).
     */
    @GET
    @Path("/cine")
    public CineOverview cine(@QueryParam("level") String level, @QueryParam("learnerId") String learnerId) {
        UUID callerId = actor.id();
        String code = CineRules.level(level);
        Reader reader = reader(callerId, learnerId);
        JsonNode films = films(callerId, reader.languageId(), code);
        Map<String, JsonNode> grades = CourseRules.latestGrades(grades(reader));
        return CineRules.overview(reader.learnerId(), reader.languageId(), code, films, grades,
                store.words(reader.learnerId()), store.recommendations(reader.learnerId()));
    }

    /** Lecteur : l'élève lui-même (sans paramètre), ou un élève demandé par son référent, son correcteur ou l'administration. */
    private Reader reader(UUID callerId, String requestedLearnerId) {
        if (requestedLearnerId != null) {
            UUID learnerId = LearnerAccess.parse(requestedLearnerId);
            if (!learnerId.equals(callerId)) return staff(callerId, learnerId);
        }
        return learnerOnly(callerId, "Sélectionnez un élève auquel votre compte a accès.");
    }

    private Reader learnerOnly(UUID callerId, String refusal) {
        JsonNode me = identities.current(callerId);
        if (!"learner".equals(me.path("role").asText())) throw HttpError.forbidden(refusal);
        return new Reader(callerId, callerId, "learner", LibraryContent.nullable(me.path("languageId")));
    }

    /**
     * Membre de l'équipe pédagogique de l'élève : Identités dit si l'appelant peut corriger cet élève (administration,
     * professeur référent, correcteur désigné avec la permission Correction). La langue de l'élève vient d'Identités
     * pour le référent et l'administration, sinon de son parcours.
     */
    private Reader staff(UUID callerId, UUID learnerId) {
        JsonNode right = null;
        for (JsonNode item : services.request(identityUrl, "/v1/internal/identity/graders", "POST", callerId,
                Map.of("learnerIds", List.of(learnerId)))) {
            if (learnerId.toString().equals(item.path("learnerId").asText())) right = item;
        }
        if (right == null) throw HttpError.notFound("Élève introuvable.");
        if (!right.path("canGrade").asBoolean()) {
            throw HttpError.forbidden("Seuls l’élève, son professeur référent, son correcteur désigné et l’administration"
                    + " ont accès au Ciné-club de cet élève.");
        }
        boolean admin = "admin".equals(identities.current(callerId).path("role").asText());
        boolean referent = callerId.toString().equals(right.path("teacherId").asText());
        String role = admin ? "admin" : referent ? "teacher" : "reviewer";
        String languageId = admin || referent
                ? LibraryContent.nullable(identities.learner(callerId, learnerId).path("languageId"))
                : store.pathLanguage(learnerId);
        return new Reader(callerId, learnerId, role, languageId);
    }

    /** Films publiés (sans questions) de la langue et du niveau, lus au catalogue ; toutes les langues si inconnue. */
    private JsonNode films(UUID callerId, String languageId, String level) {
        StringBuilder path = new StringBuilder("/v1/films");
        if (languageId != null) path.append("?languageId=").append(URLEncoder.encode(languageId, StandardCharsets.UTF_8));
        if (level != null) path.append(languageId == null ? '?' : '&').append("level=").append(level);
        JsonNode films = services.request(catalogueUrl, path.toString(), "GET", callerId, null);
        return films != null && films.isArray() ? films : mapper.createArrayNode();
    }

    /**
     * Résultats de l'élève, du plus récent au plus ancien : lus avec l'identité de l'appelant (l'élève, ou ?learnerId=
     * pour le référent et l'administration). Un correcteur désigné n'y a pas accès chez Évaluations : la page reste
     * lisible sans les scores, comme si Évaluations était indisponible.
     */
    private JsonNode grades(Reader reader) {
        String path = "/v1/assessments/results" + (reader.self() ? "" : "?learnerId=" + reader.learnerId());
        try {
            return services.request(assessmentUrl, path, "GET", reader.callerId(), null);
        } catch (WebApplicationException error) {
            LOG.debugf("Assessment results unavailable for the cine club (HTTP %d)", error.getResponse().getStatus());
            return mapper.createArrayNode();
        }
    }

    private static UUID id(String value, String notFound) {
        try {
            UUID id = UUID.fromString(value);
            if (id.toString().equalsIgnoreCase(value)) return id;
        } catch (IllegalArgumentException | NullPointerException ignored) {
            // Même réponse pour toutes les formes invalides.
        }
        throw HttpError.notFound(notFound);
    }

    /** sourceKind : film, activity ou manual ; sourceId : séquence, référence d'activité, ou null pour manual. */
    public record WordRequest(String word, String note, String sourceKind, String sourceId) {}

    /** Au moins l'un des deux ; null garde la valeur actuelle. */
    public record WordChange(String word, String note) {}

    public record RecommendationRequest(UUID learnerId, String sequenceId, String note) {}

    public record Deleted(UUID id, boolean deleted) {}
}
