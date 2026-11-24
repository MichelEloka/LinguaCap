package org.linguacap.gateway;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.linguacap.common.HttpError;
import org.linguacap.common.RequestLog;
import org.linguacap.common.Secrets;
import org.linguacap.common.ServiceClient;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Path("/api/v1")
@Produces(MediaType.APPLICATION_JSON)
public class Gateway {
    private static final String SLUG = "[a-z0-9][a-z0-9-]{0,79}";
    private static final String UUID_PATH = "[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}";
    private static final String LEVEL = "[abc][12]";
    /** Numéro de contrat d'un parcours. */
    private static final String NUMBER = "[1-9][0-9]{0,3}";
    /**
     * Lectures d'un élève relayées avec ?learnerId= (professeur référent ou administration ; pour le carnet de mots et
     * les séquences proposées du Ciné-club, aussi le correcteur désigné).
     */
    private static final List<String> LEARNER_READS = List.of("learning/progress", "learning/enrollment", "assessments/results",
            "tracking/messages", "assessments/exams", "learning/path", "learning/library", "assessments/placements",
            "assessments/missions", "learning/words", "learning/film-recommendations");
    /** Lexique d'un module de la bibliothèque (V4) : lu aussi avec ?learnerId= par le référent ou l'administration. */
    private static final String LEXICON = "learning/library/" + UUID_PATH + "/modules/" + SLUG + "/lexicon";
    /** Filtres acceptés par le tableau de bord des indicateurs, chacun avec sa forme stricte. */
    private static final Map<String, String> KPI_FILTERS = Map.of("from", "\\d{4}-\\d{2}-\\d{2}", "to", "\\d{4}-\\d{2}-\\d{2}",
            "startLevel", "A0|[ABC][12]", "level", "[ABC][12]", "template", "standard|intensive|custom",
            "kind", "accompanied|autonomous");
    /**
     * Lectures à filtres nommés : chaque paramètre est facultatif, présent une fois au plus et de forme stricte. Ciné-club :
     * films d'une langue et d'un niveau, agrégation de l'élève (niveau, élève consulté).
     */
    private static final Map<String, Map<String, String>> FILTERS = Map.of("tracking/kpis", KPI_FILTERS,
            "films", Map.of("languageId", "[a-z]{2}", "level", "[ABC][12]"),
            "learning/cine", Map.of("level", "[ABC][12]", "learnerId", UUID_PATH));
    private static final UUID HEALTH_ACTOR = new UUID(0, 0);
    /** Acteur anonyme des lectures publiques (aucune session) : le service appelé ne lit jamais d'identité. */
    private static final UUID PUBLIC_ACTOR = new UUID(0, 0);
    /** Réponse publique réussie : données en lecture seule, mises en cache cinq minutes par le navigateur et le proxy. */
    private static final String PUBLIC_CACHE = "public, max-age=300";

    @Inject ServiceClient services;
    @Inject SupabaseAuth auth;
    @ConfigProperty(name = "lingua.services.identity") String identity;
    @ConfigProperty(name = "lingua.services.catalogue") String catalogue;
    @ConfigProperty(name = "lingua.services.media") String media;
    @ConfigProperty(name = "lingua.services.learning") String learning;
    @ConfigProperty(name = "lingua.services.assessment") String assessment;
    @ConfigProperty(name = "lingua.services.tracking") String tracking;
    @ConfigProperty(name = "lingua.origin-secret") Optional<String> originSecret;
    @ConfigProperty(name = "lingua.cloud-run") boolean cloudRun;
    @Context HttpHeaders headers;
    @Context UriInfo uri;

    @GET
    @Path("health")
    public Response health() {
        verifyOrigin();
        String requestId = RequestLog.current();
        var checks = List.of(identity, catalogue, media, learning, assessment, tracking).stream()
                .map(service -> CompletableFuture.supplyAsync(() -> services.exchange(service, "/q/health/ready",
                                "GET", HEALTH_ACTOR, null, "", "", false, requestId).status() == 200)
                        .exceptionally(failure -> false)).toList();
        boolean ready = checks.stream().map(CompletableFuture::join).reduce(true, Boolean::logicalAnd);
        return response(200, Map.of("status", ready ? "ok" : "degraded"), requestId);
    }

    /**
     * Langues et niveaux publiés, sans session (vitrine, page de connexion, pied de page) : seule route métier relayée
     * sans {@code auth.verify}. Le secret de liaison du proxy reste exigé ; aucun paramètre n'est relayé ; ni jeton
     * d'utilisateur ni adresse ne partent vers le catalogue.
     */
    @GET
    @Path("public/languages")
    public Response publicLanguages() {
        verifyOrigin();
        if (!uri.getQueryParameters().isEmpty()) throw HttpError.badRequest("Paramètre de recherche invalide.");
        String requestId = RequestLog.current();
        var result = services.exchange(catalogue, "/v1/public/languages", "GET", PUBLIC_ACTOR, null, "", "", false, requestId);
        return Response.status(result.status()).type(MediaType.APPLICATION_JSON_TYPE)
                .header("Cache-Control", result.status() == 200 ? PUBLIC_CACHE : "no-store")
                .header("X-Request-Id", requestId).entity(result.body()).build();
    }

    @GET
    @Path("{path:.+}")
    public Response read(@PathParam("path") String path) { return forward("GET", path, null); }

    @POST
    @Path("{path:.+}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@PathParam("path") String path, JsonNode body) { return forward("POST", path, body); }

    @PUT
    @Path("{path:.+}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response update(@PathParam("path") String path, JsonNode body) { return forward("PUT", path, body); }

    /** Modification partielle (Ciné-club : mot du carnet). */
    @PATCH
    @Path("{path:.+}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response patch(@PathParam("path") String path, JsonNode body) { return forward("PATCH", path, body); }

    /** Suppression, sans corps (Ciné-club : mot du carnet). */
    @DELETE
    @Path("{path:.+}")
    public Response delete(@PathParam("path") String path) { return forward("DELETE", path, null); }

    private Response forward(String method, String path, JsonNode body) {
        verifyOrigin();
        String base = destination(path, method);
        String requestId = RequestLog.current();
        var user = auth.verify(headers.getHeaderString(HttpHeaders.AUTHORIZATION));
        if (!path.equals("me")) {
            var profile = call(identity, "/v1/me", "GET", user, null, requestId);
            if (profile.status() != 200) return response(profile.status(), profile.body(), requestId);
        }
        String learnerQuery = "";
        var params = uri.getQueryParameters();
        if (!params.isEmpty() && method.equals("GET") && FILTERS.containsKey(path)) {
            Map<String, String> allowed = FILTERS.get(path);
            StringBuilder filters = new StringBuilder();
            for (var entry : params.entrySet()) {
                String pattern = allowed.get(entry.getKey());
                if (pattern == null || entry.getValue().size() != 1 || !entry.getValue().get(0).matches(pattern)) {
                    throw HttpError.badRequest(path.equals("tracking/kpis") ? "Filtre d’indicateur invalide."
                            : "Paramètre de recherche invalide.");
                }
                filters.append(filters.isEmpty() ? "?" : "&").append(entry.getKey()).append('=').append(entry.getValue().get(0));
            }
            learnerQuery = filters.toString();
        } else if (!params.isEmpty()) {
            // Seuls learnerId (lectures d'un élève) et enrollmentId (tentatives d'un parcours) sont relayés.
            String name = path.equals("assessments/exams") ? "enrollmentId" : "learnerId";
            String value = params.getFirst(name);
            boolean learnerRead = LEARNER_READS.contains(path) || path.matches(LEXICON);
            if (!method.equals("GET") || !learnerRead
                    || params.size() != 1 || value == null || !value.matches(UUID_PATH) || params.get(name).size() != 1) {
                throw HttpError.badRequest("Paramètre de recherche invalide.");
            }
            learnerQuery = "?" + name + "=" + value;
        }
        if (!method.equals("GET") && !method.equals("DELETE") && (body == null || !body.isObject())) {
            throw HttpError.badRequest("Un objet JSON est attendu.");
        }
        var result = call(base, "/v1/" + path + learnerQuery, method, user, body, requestId);
        return response(result.status(), result.body(), requestId);
    }

    private String destination(String path, String method) {
        if (method.equals("GET")) {
            if (path.equals("me") || path.equals("learners") || path.matches("learners/" + UUID_PATH)) return identity;
            if (path.equals("invitations") || path.equals("admin/users") || path.matches("admin/users/" + UUID_PATH)) {
                return identity;
            }
            if (path.equals("levels") || path.equals("tracks") || path.matches("lessons/" + SLUG)) return catalogue;
            if (path.equals("catalogue/levels") || path.matches("catalogue/versions/" + UUID_PATH + "(/checks)?")) return catalogue;
            if (path.equals("media/uploads")) return media;
            if (path.equals("media") || path.matches("media/" + SLUG) || path.matches("media/" + SLUG + "/versions/[1-9][0-9]{0,3}")) {
                return media;
            }
            if (path.equals("learning/goal") || path.equals("learning/progress") || path.equals("learning/enrollment")
                    || path.equals("learning/templates") || path.matches("learning/sessions/" + UUID_PATH)
                    || path.matches("learning/enrollments/" + UUID_PATH + "/(proposal|diagnostic)")) return learning;
            if (path.equals("assessments/results") || path.equals("assessments/grading") || path.equals("assessments/exams")
                    || path.matches("assessments/exams/" + UUID_PATH)) return assessment;
            if (path.equals("tracking/overview") || path.equals("tracking/messages") || path.equals("tracking/kpis")
                    || path.matches("tracking/learners/" + UUID_PATH)) return tracking;
            // Parcours multi-niveaux : langues, test de niveau, entraînement, parcours, contrats, ajouts et bibliothèque.
            if (path.equals("me/teacher")) return identity;
            if (path.equals("languages") || path.equals("catalogue/placement-tests")
                    || path.matches("catalogue/placement-tests/" + UUID_PATH)) return catalogue;
            if (path.equals("assessments/placements") || path.matches("assessments/placements/" + UUID_PATH)
                    || path.equals("assessments/practice") || path.matches("assessments/practice/" + UUID_PATH)) return assessment;
            if (path.equals("learning/onboarding") || path.equals("learning/path") || path.equals("learning/contracts/pending")
                    || path.matches("learning/paths/" + UUID_PATH + "/(proposal|contracts|additions)")
                    || path.equals("learning/library") || path.matches("learning/library/" + UUID_PATH + "/activities/" + SLUG)) {
                return learning;
            }
            // V4 : corrigé par question, répétition orale, missions, file de corrections et lexique du module.
            if (path.matches("assessments/(exercises|speech|missions)/" + UUID_PATH) || path.equals("assessments/missions")
                    || path.equals("assessments/reviews")) return assessment;
            if (path.matches(LEXICON)) return learning;
            // Ciné-club : films publiés, édition des films, agrégation de l'élève, carnet de mots et séquences proposées.
            if (path.equals("films") || path.matches("films/" + SLUG)
                    || path.equals("catalogue/films") || path.matches("catalogue/films/" + SLUG)) return catalogue;
            if (path.equals("learning/cine") || path.equals("learning/words")
                    || path.equals("learning/film-recommendations")) return learning;
        }
        if (method.equals("POST")) {
            if (path.equals("invitations") || path.matches("invitations/" + UUID_PATH + "/(resend|cancel)")) return identity;
            if (path.equals("levels") || path.matches("catalogue/levels/" + LEVEL + "/versions")
                    || path.matches("catalogue/versions/" + UUID_PATH + "/(publish|retire)")) return catalogue;
            if (path.equals("media/uploads") || path.matches("media/uploads/" + UUID_PATH + "/finalize")) return media;
            if (path.equals("assessments/quiz")) return assessment;
            if (path.equals("learning/enrollments")
                    || path.matches("learning/enrollments/" + UUID_PATH + "/(proposal/validate|pause|resume|diagnostic)")) {
                return learning;
            }
            if (path.equals("assessments/diagnostics") || path.equals("assessments/exams")
                    || path.matches("assessments/exams/" + UUID_PATH + "/(submit|recordings|grading)")
                    || path.matches("assessments/exams/" + UUID_PATH + "/recordings/" + UUID_PATH + "/finalize")) return assessment;
            if (path.equals("tracking/messages")) return tracking;
            if (path.equals("catalogue/placement-tests") || path.matches("catalogue/placement-tests/" + UUID_PATH + "/publish")) {
                return catalogue;
            }
            if (path.equals("assessments/placements") || path.matches("assessments/placements/" + UUID_PATH + "/submit")
                    || path.equals("assessments/practice") || path.matches("assessments/practice/" + UUID_PATH + "/submit")) {
                return assessment;
            }
            // L'estimation est testée avant les motifs à identifiant.
            if (path.equals("learning/paths/estimate") || path.equals("learning/paths")) return learning;
            if (path.matches("learning/paths/" + UUID_PATH + "/(proposal/validate|pause|resume|advance|contracts|additions)")
                    || path.matches("learning/paths/" + UUID_PATH + "/contracts/" + NUMBER + "/(accept|reject)")
                    || path.matches("learning/paths/" + UUID_PATH + "/additions/" + UUID_PATH + "/remove")) return learning;
            // V4 : « speech/recordings » ne correspond jamais au motif d'identifiant (UUID hexadécimal).
            if (path.equals("assessments/exercises") || path.equals("assessments/speech")
                    || path.equals("assessments/speech/recordings") || path.equals("assessments/missions")
                    || path.matches("assessments/speech/" + UUID_PATH + "/review")
                    || path.matches("assessments/missions/" + UUID_PATH + "/(recordings|submit|review)")
                    || path.matches("assessments/(speech|missions)/" + UUID_PATH + "/recordings/" + UUID_PATH + "/finalize")) {
                return assessment;
            }
            if (path.matches("catalogue/films/" + SLUG + "/(publish|retire)")) return catalogue;
            if (path.equals("learning/words") || path.equals("learning/film-recommendations")
                    || path.matches("learning/film-recommendations/" + UUID_PATH + "/dismiss")) return learning;
        }
        if (method.equals("PUT")) {
            if (path.equals("learning/goal")) return learning;
            if (path.matches("assessments/exams/" + UUID_PATH + "/answers")) return assessment;
            if (path.matches("catalogue/levels/" + LEVEL) || path.matches("catalogue/versions/" + UUID_PATH)) return catalogue;
            if (path.matches("media/" + SLUG) && !path.equals("media/uploads")) return media;
            if (path.matches("learning/sessions/" + UUID_PATH + "/activities/" + SLUG + "/progress")
                    || path.matches("learning/enrollments/" + UUID_PATH + "/(availability|starting-point)")) return learning;
            if (path.matches("admin/users/" + UUID_PATH + "/(status|role|permissions|teacher|reviewer)")) return identity;
            if (path.equals("me/language") || path.equals("me/teacher-profile")) return identity;
            if (path.matches("catalogue/placement-tests/" + UUID_PATH)) return catalogue;
            if (path.matches("assessments/(placements|practice)/" + UUID_PATH + "/answers")) return assessment;
            if (path.matches("learning/paths/" + UUID_PATH + "/(objective|availability)")) return learning;
            if (path.matches("assessments/missions/" + UUID_PATH)) return assessment;
            if (path.matches("catalogue/films/" + SLUG)) return catalogue;
        }
        if ((method.equals("PATCH") || method.equals("DELETE")) && path.matches("learning/words/" + UUID_PATH)) return learning;
        throw HttpError.notFound("Cette route API est inconnue.");
    }

    private ServiceClient.Result call(String target, String path, String method, SupabaseAuth.Account user,
                                      JsonNode body, String requestId) {
        // Le jeton Supabase de l'utilisateur ne part que vers Médias, directement ou via la séance d'Apprentissage
        // qui demande les adresses temporaires de ses supports : les politiques Storage s'appliquent à l'utilisateur.
        // Les évaluations lisent et déposent aussi des fichiers privés (sons d'écoute, enregistrements oraux), comme le
        // test de niveau, l'entraînement et les activités de la bibliothèque (adresses temporaires des supports).
        // V4 : missions et répétitions orales (enregistrements de l'élève) et sons du lexique de la bibliothèque.
        String token = target.equals(media) || method.equals("GET") && path.matches("/v1/learning/sessions/" + UUID_PATH)
                || path.startsWith("/v1/assessments/exams") || path.startsWith("/v1/assessments/placements")
                || path.startsWith("/v1/assessments/practice")
                || path.startsWith("/v1/assessments/missions") || path.startsWith("/v1/assessments/speech")
                || method.equals("GET") && path.matches("/v1/learning/library/" + UUID_PATH + "/activities/" + SLUG)
                || method.equals("GET") && path.matches("/v1/" + LEXICON + "([?]learnerId=" + UUID_PATH + ")?")
                ? user.token() : "";
        String email = path.equals("/v1/me") ? user.email() : "";
        String key = path.equals("/v1/assessments/quiz") || path.equals("/v1/assessments/diagnostics")
                || path.equals("/v1/assessments/exercises")
                || path.matches("/v1/assessments/(exams|placements|practice|missions)/" + UUID_PATH + "/submit")
                ? headers.getHeaderString("Idempotency-Key") : null;
        if (key != null && !key.matches("[A-Za-z0-9._-]{1,128}")) {
            throw HttpError.badRequest("Clé de remise invalide.");
        }
        return services.exchange(target, path, method, user.id(), body, token, email, user.emailVerified(), requestId, key == null ? "" : key);
    }

    private void verifyOrigin() {
        if ((cloudRun || originSecret.isPresent())
                && !Secrets.match(originSecret.orElse(null), headers.getHeaderString("X-Linguacap-Origin"))) {
            throw HttpError.forbidden("Origine API non autorisée.");
        }
    }

    private static Response response(int status, Object body, String requestId) {
        return Response.status(status).type(MediaType.APPLICATION_JSON_TYPE)
                .header("Cache-Control", "no-store").header("X-Request-Id", requestId).entity(body).build();
    }
}
