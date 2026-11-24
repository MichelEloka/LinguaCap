package org.linguacap.gateway;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.QuarkusTestProfile;
import io.quarkus.test.junit.TestProfile;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestFactory;

/**
 * Vérifie que la passerelle route exactement les opérations déclarées dans contracts/openapi.json.
 * Une route déclarée répond 401 sans session (elle existe), une méthode non déclarée répond 404.
 */
@QuarkusTest
@TestProfile(ContractRoutesTest.Profile.class)
class ContractRoutesTest {
    static final String ORIGIN = "secret-de-liaison-de-test";
    static final String ERROR_CODE = "^[A-Z][A-Z_]*$";
    static final List<String> METHODS = List.of("get", "post", "put");
    static final Path CONTRACT = Path.of("..", "..", "contracts", "openapi.json");

    public static class Profile implements QuarkusTestProfile {
        @Override
        public Map<String, String> getConfigOverrides() {
            return Map.of("lingua.origin-secret", ORIGIN, "quarkus.http.test-port", "0");
        }
    }

    /** `open` : opération déclarée sans authentification (`security: []`), relayée sans session. */
    record Operation(String method, String template, String path, boolean declared, boolean open) {}

    static JsonNode contract() throws IOException {
        return new ObjectMapper().readTree(CONTRACT.toFile());
    }

    static JsonNode resolve(JsonNode root, JsonNode node) {
        if (!node.has("$ref")) return node;
        JsonNode target = root;
        for (String part : node.get("$ref").asText().substring(2).split("/")) target = target.path(part);
        return target;
    }

    static List<Operation> operations() throws IOException {
        JsonNode root = contract();
        List<Operation> operations = new ArrayList<>();
        Pattern placeholder = Pattern.compile("\\{([A-Za-z]+)}");
        for (Map.Entry<String, JsonNode> entry : root.path("paths").properties()) {
            String template = entry.getKey();
            JsonNode item = entry.getValue();
            if (template.equals("/health")) continue;

            // Les paramètres de chemin peuvent être déclarés sur la route ou sur l'une de ses opérations.
            List<JsonNode> parameters = new ArrayList<>();
            item.path("parameters").forEach(parameters::add);
            for (String method : METHODS) item.path(method).path("parameters").forEach(parameters::add);

            Matcher matcher = placeholder.matcher(template);
            StringBuilder concrete = new StringBuilder();
            while (matcher.find()) {
                String name = matcher.group(1);
                String example = parameters.stream().map(parameter -> resolve(root, parameter))
                        .filter(parameter -> parameter.path("in").asText().equals("path")
                                && parameter.path("name").asText().equals(name))
                        .map(parameter -> parameter.path("example").asText(null))
                        .filter(value -> value != null && !value.isBlank())
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException(
                                "Exemple manquant pour {" + name + "} dans " + template));
                matcher.appendReplacement(concrete, Matcher.quoteReplacement(example));
            }
            matcher.appendTail(concrete);
            for (String method : METHODS) {
                JsonNode security = item.path(method).path("security");
                boolean open = item.has(method) && security.isArray() && security.isEmpty();
                operations.add(new Operation(method, template, concrete.toString(), item.has(method), open));
            }
        }
        return operations;
    }

    static RequestSpecification request(String method) {
        var spec = given().header("X-Linguacap-Origin", ORIGIN).accept(ContentType.JSON);
        return method.equals("get") ? spec : spec.contentType(ContentType.JSON).body("{}");
    }

    /**
     * Une route déclarée répond 401 sans session ; une route publique (`security: []`) est relayée sans session et répond
     * ici 503, car ce profil ne configure pas le secret interne des services ; une méthode non déclarée répond 404.
     */
    @TestFactory
    Stream<DynamicTest> laPasserelleRouteExactementLeContrat() throws IOException {
        List<Operation> operations = operations();
        assertFalse(operations.stream().noneMatch(Operation::declared), "Le contrat ne déclare aucune route.");
        return operations.stream().map(operation -> DynamicTest.dynamicTest(
                operation.method().toUpperCase() + " " + operation.template()
                        + (operation.open() ? " est relayée sans session" : operation.declared() ? " est routée" : " est refusée"),
                () -> request(operation.method())
                        .when().request(operation.method().toUpperCase(), "/api/v1" + operation.path())
                        .then()
                        .statusCode(operation.open() ? 503 : operation.declared() ? 401 : 404)
                        .contentType(ContentType.JSON)
                        .header("Cache-Control", "no-store")
                        .body("code", equalTo(operation.open() ? "UNAVAILABLE" : operation.declared() ? "UNAUTHENTICATED" : "NOT_FOUND"))
                        .body("message", not(emptyOrNullString()))));
    }

    @Test
    void leContratNeDeclareQueDeuxRoutesSansSession() throws IOException {
        JsonNode paths = contract().path("paths");
        List<String> open = new ArrayList<>();
        for (Map.Entry<String, JsonNode> entry : paths.properties()) {
            for (String method : METHODS) {
                JsonNode security = entry.getValue().path(method).path("security");
                if (entry.getValue().has(method) && security.isArray() && security.isEmpty()) {
                    open.add(method.toUpperCase() + " " + entry.getKey());
                }
            }
        }
        org.junit.jupiter.api.Assertions.assertEquals(List.of("GET /health", "GET /public/languages"), open,
                "Toute route sans session doit être examinée : données publiques en lecture seule uniquement.");
    }

    @Test
    void uneRouteInconnueRenvoieLeFormatDErreur() {
        request("get").when().get("/api/v1/route-inconnue")
                .then().statusCode(404).contentType(ContentType.JSON)
                .body("code", matchesPattern(ERROR_CODE)).body("message", not(emptyOrNullString()));
    }

    @Test
    void lAPIExigeLeSecretDeLiaisonDuProxy() {
        given().accept(ContentType.JSON).when().get("/api/v1/me")
                .then().statusCode(403).body("code", equalTo("FORBIDDEN"));
        given().header("X-Linguacap-Origin", "valeur-du-client").when().get("/api/v1/health")
                .then().statusCode(403).body("code", equalTo("FORBIDDEN"));
    }

    @Test
    void laSanteSuitLeContratEtSignaleLesServicesAbsents() {
        request("get").when().get("/api/v1/health")
                .then().statusCode(200).contentType(ContentType.JSON)
                .header("Cache-Control", "no-store")
                .header("X-Request-Id", matchesPattern("^[0-9a-f-]{36}$"))
                .body("status", is("degraded"));
    }

    @Test
    void laSondeCloudRunNeDependPasDuSecret() {
        given().when().get("/q/health/ready").then().statusCode(200).body("status", is("UP"));
    }
}
