package org.linguacap.common;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class PermissionsTest {
    private static JsonNode profile(String json) throws Exception {
        return new ObjectMapper().readTree(json);
    }

    @Test
    void lAdministrationEditeToujoursLeCatalogue() throws Exception {
        assertTrue(Permissions.canEditCatalogue(profile("{\"role\":\"admin\",\"permissions\":[]}")));
        assertTrue(Permissions.canEditCatalogue(profile("{\"role\":\"admin\"}")));
    }

    @Test
    void lEquipeEditeAvecLaPermissionCatalogue() throws Exception {
        assertTrue(Permissions.canEditCatalogue(profile("{\"role\":\"staff\",\"permissions\":[\"correction\",\"catalogue\"]}")));
        assertFalse(Permissions.canEditCatalogue(profile("{\"role\":\"staff\",\"permissions\":[\"correction\"]}")));
    }

    @Test
    void unProfesseurSansPermissionNEditePas() throws Exception {
        assertFalse(Permissions.canEditCatalogue(profile("{\"role\":\"teacher\"}")));
        assertFalse(Permissions.canEditCatalogue(profile("{\"role\":\"teacher\",\"permissions\":[\"correction\"]}")));
        assertTrue(Permissions.canEditCatalogue(profile("{\"role\":\"teacher\",\"permissions\":[\"catalogue\"]}")));
    }
}
