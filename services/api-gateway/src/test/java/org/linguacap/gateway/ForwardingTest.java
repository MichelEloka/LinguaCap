package org.linguacap.gateway;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.matchesPattern;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.QuarkusTestProfile;
import io.quarkus.test.junit.TestProfile;
import io.restassured.http.ContentType;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * Relais de la passerelle vers des services simulés (serveur HTTP du JDK, sans dépendance) : route publique des
 * langues (sans session, mise en cache, rien de l'utilisateur transmis) et corps du retour de mission sur grille
 * transmis intact (cours B1 et B2).
 */
@QuarkusTest
@TestProfile(ForwardingTest.Profile.class)
class ForwardingTest {
    static final String ORIGIN = "secret-de-liaison-de-test";
    static final String INTERNAL = "secret-interne-de-test";
    static final String TOKEN = "jeton-de-session-de-test-0123456789";
    static final String USER_ID = "7d4c0a52-3f0e-4c35-9a59-2a0a1c7e6b10";
    static final String MISSION_ID = "0b6f2f1e-8f61-4f7e-9d0b-1c2d3e4f5a6b";
    static final String LANGUAGES = """
            [{"id":"de","name":"Allemand","nativeName":"Deutsch","position":1,"levels":[
              {"code":"A1","title":"Allemand A1","position":1,"moduleCount":23,"plannedMinutes":2596},
              {"code":"A2","title":"Allemand A2","position":2,"moduleCount":22,"plannedMinutes":2410},
              {"code":"B1","title":"Allemand B1","position":3,"moduleCount":24,"plannedMinutes":3540}]}]
            """;

    /** Services simulés : Supabase Auth, Identités, Catalogue et Évaluations sur une même adresse. */
    static final class Stub {
        static final ObjectMapper JSON = new ObjectMapper();
        static final Map<String, Map<String, String>> HEADERS = new ConcurrentHashMap<>();
        static final Map<String, String> BODIES = new ConcurrentHashMap<>();
        static volatile int catalogueStatus = 200;
        static final HttpServer SERVER = start();

        private static HttpServer start() {
            try {
                HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
                server.createContext("/", Stub::handle);
                server.start();
                return server;
            } catch (IOException error) {
                throw new UncheckedIOException(error);
            }
        }

        static String base() { return "http://127.0.0.1:" + SERVER.getAddress().getPort(); }

        private static void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getRawPath();
            String query = exchange.getRequestURI().getRawQuery();
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Map<String, String> headers = new ConcurrentHashMap<>();
            exchange.getRequestHeaders().forEach((name, values) -> headers.put(name.toLowerCase(), String.join(",", values)));
            if (query != null) headers.put(":query", query);
            HEADERS.put(path, headers);
            BODIES.put(path, body);
            int status = 404;
            String answer = "{\"code\":\"NOT_FOUND\",\"message\":\"Route simulée inconnue.\"}";
            if (path.equals("/auth/v1/user")) {
                boolean valid = ("Bearer " + TOKEN).equals(headers.get("authorization"));
                status = valid ? 200 : 401;
                answer = valid ? "{\"id\":\"" + USER_ID + "\",\"aud\":\"authenticated\",\"email\":\"prof@example.test\","
                        + "\"email_confirmed_at\":\"2026-11-24T08:00:00Z\"}" : "{\"msg\":\"invalid\"}";
            } else if (path.equals("/v1/me")) {
                status = 200;
                answer = "{\"id\":\"" + USER_ID + "\",\"role\":\"teacher\"}";
            } else if (path.equals("/v1/public/languages")) {
                status = catalogueStatus;
                answer = status == 200 ? LANGUAGES : "{\"code\":\"UNAVAILABLE\",\"message\":\"Catalogue indisponible.\"}";
            } else if (path.equals("/v1/assessments/missions/" + MISSION_ID + "/review")) {
                status = 200;
                answer = "{\"id\":\"" + MISSION_ID + "\",\"received\":" + body + "}";
            }
            byte[] bytes = answer.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        }
    }

    public static class Profile implements QuarkusTestProfile {
        @Override
        public Map<String, String> getConfigOverrides() {
            String base = Stub.base();
            return Map.ofEntries(
                    Map.entry("lingua.origin-secret", ORIGIN), Map.entry("lingua.internal-secret", INTERNAL),
                    Map.entry("lingua.supabase.url", base), Map.entry("lingua.supabase.publishable-key", "cle-publique-de-test"),
                    Map.entry("lingua.services.identity", base), Map.entry("lingua.services.catalogue", base),
                    Map.entry("lingua.services.media", base), Map.entry("lingua.services.learning", base),
                    Map.entry("lingua.services.assessment", base), Map.entry("lingua.services.tracking", base),
                    Map.entry("quarkus.http.test-port", "0"));
        }
    }

    @AfterEach
    void reset() {
        Stub.catalogueStatus = 200;
        Stub.HEADERS.clear();
        Stub.BODIES.clear();
    }

    @Test
    void lesLanguesPubliquesSeLisentSansSessionEtSeMettentEnCache() throws IOException {
        String body = given().header("X-Linguacap-Origin", ORIGIN).accept(ContentType.JSON)
                .when().get("/api/v1/public/languages")
                .then().statusCode(200).contentType(ContentType.JSON)
                .header("Cache-Control", "public, max-age=300")
                .header("X-Request-Id", matchesPattern("^[0-9a-f-]{36}$"))
                .body("size()", equalTo(1))
                .extract().asString();
        assertEquals(Stub.JSON.readTree(LANGUAGES), Stub.JSON.readTree(body), "La réponse du catalogue est relayée telle quelle.");

        Map<String, String> sent = Stub.HEADERS.get("/v1/public/languages");
        assertEquals(INTERNAL, sent.get("x-linguacap-internal"), "Le secret interne accompagne l'appel au catalogue.");
        assertEquals("00000000-0000-0000-0000-000000000000", sent.get("x-linguacap-actor"), "Acteur anonyme.");
        assertNull(sent.get("authorization"), "Aucun jeton d'utilisateur ne part vers le catalogue.");
        assertNull(sent.get("x-linguacap-actor-email"), "Aucune adresse ne part vers le catalogue.");
        assertFalse(Stub.HEADERS.containsKey("/auth/v1/user"), "La route publique ne vérifie aucune session.");
        assertFalse(Stub.HEADERS.containsKey("/v1/me"), "La route publique ne lit aucun profil.");
    }

    @Test
    void uneSessionPresenteNEstNiVerifieeNiTransmise() {
        given().header("X-Linguacap-Origin", ORIGIN).header("Authorization", "Bearer " + TOKEN).accept(ContentType.JSON)
                .when().get("/api/v1/public/languages")
                .then().statusCode(200).header("Cache-Control", "public, max-age=300");
        assertNull(Stub.HEADERS.get("/v1/public/languages").get("authorization"));
        assertFalse(Stub.HEADERS.containsKey("/auth/v1/user"));
    }

    @Test
    void laRoutePubliqueExigeLeSecretDuProxyEtRefuseLesParametres() {
        given().accept(ContentType.JSON).when().get("/api/v1/public/languages")
                .then().statusCode(403).body("code", equalTo("FORBIDDEN")).header("Cache-Control", "no-store");
        given().header("X-Linguacap-Origin", ORIGIN).accept(ContentType.JSON)
                .when().get("/api/v1/public/languages?level=B1")
                .then().statusCode(400).body("code", equalTo("INVALID_INPUT")).header("Cache-Control", "no-store");
        given().header("X-Linguacap-Origin", ORIGIN).contentType(ContentType.JSON).body("{}")
                .when().post("/api/v1/public/languages")
                .then().statusCode(404).body("code", equalTo("NOT_FOUND"));
        assertFalse(Stub.HEADERS.containsKey("/v1/public/languages"), "Aucun appel au catalogue pour une requête refusée.");
    }

    @Test
    void uneErreurDuCatalogueNEstPasMiseEnCache() {
        Stub.catalogueStatus = 503;
        given().header("X-Linguacap-Origin", ORIGIN).accept(ContentType.JSON)
                .when().get("/api/v1/public/languages")
                .then().statusCode(503).header("Cache-Control", "no-store").body("code", equalTo("UNAVAILABLE"));
    }

    @Test
    void leRetourSurGrilleEstTransmisIntactAuxEvaluations() throws IOException {
        String review = """
                {"decision":"validated","comment":"Points forts : registre juste.","points":
                  {"aufgabe":5,"kohaerenz":4,"wortschatz":3,"strukturen":4}}
                """;
        given().header("X-Linguacap-Origin", ORIGIN).header("Authorization", "Bearer " + TOKEN)
                .contentType(ContentType.JSON).accept(ContentType.JSON).body(review)
                .when().post("/api/v1/assessments/missions/" + MISSION_ID + "/review")
                .then().statusCode(200).header("Cache-Control", "no-store")
                .body("received.points.aufgabe", equalTo(5));
        String path = "/v1/assessments/missions/" + MISSION_ID + "/review";
        JsonNode forwarded = Stub.JSON.readTree(Stub.BODIES.get(path));
        assertEquals(Stub.JSON.readTree(review), forwarded, "Décision, commentaire et points arrivent tels quels.");
        Map<String, String> sent = Stub.HEADERS.get(path);
        assertEquals(USER_ID, sent.get("x-linguacap-actor"));
        assertEquals("Bearer " + TOKEN, sent.get("authorization"), "Les missions reçoivent le jeton (enregistrements privés).");
        assertTrue(Stub.HEADERS.containsKey("/v1/me"), "Le profil est vérifié avant le relais.");
    }
}
