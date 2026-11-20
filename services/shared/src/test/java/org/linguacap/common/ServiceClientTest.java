package org.linguacap.common;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.WebApplicationException;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ServiceClientTest {
    private static ServiceClient client(boolean cloudRun, String secret) {
        var client = new ServiceClient();
        client.json = new ObjectMapper();
        client.cloudRun = cloudRun;
        client.secret = Optional.ofNullable(secret);
        return client;
    }

    private static int refusal(ServiceClient client, String baseUrl, String path) {
        var error = assertThrows(WebApplicationException.class, () -> client.exchange(
                baseUrl, path, "GET", UUID.randomUUID(), null, "", "", false, "requete-test"));
        return error.getResponse().getStatus();
    }

    @Test
    void exigeHttpsSurCloudRun() {
        assertEquals(503, refusal(client(true, "interne"), "http://linguacap-identity.example.run.app", "/v1/me"));
    }

    @Test
    void limiteLesCheminsAuxRoutesInternesVersionnees() {
        var client = client(false, "interne");
        assertEquals(503, refusal(client, "https://identity.example.test", "/admin"));
        assertEquals(503, refusal(client, "https://identity.example.test", "/q/metrics"));
    }

    @Test
    void refuseLesAdressesAvecIdentifiants() {
        assertEquals(503, refusal(client(false, "interne"), "https://user:pass@identity.example.test", "/v1/me"));
    }

    @Test
    void refuseDAppelerSansSecretInterne() {
        assertEquals(503, refusal(client(false, null), "https://identity.example.test", "/v1/me"));
    }
}
