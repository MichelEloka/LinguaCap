package org.linguacap.common;

import com.fasterxml.jackson.databind.JsonNode;

/** Lecture des droits à partir du profil renvoyé par Identités (GET /v1/me). */
public final class Permissions {
    public static final String CATALOGUE = "catalogue";
    public static final String CORRECTION = "correction";

    private Permissions() {}

    public static boolean has(JsonNode profile, String permission) {
        for (JsonNode granted : profile.path("permissions")) {
            if (permission.equals(granted.asText())) return true;
        }
        return false;
    }

    /** L'administration et les comptes titulaires de la permission Catalogue éditent le catalogue et la médiathèque. */
    public static boolean canEditCatalogue(JsonNode profile) {
        return "admin".equals(profile.path("role").asText()) || has(profile, CATALOGUE);
    }
}
