package org.linguacap.catalogue;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.linguacap.catalogue.LanguageResource.Language;
import org.linguacap.catalogue.LanguageResource.LanguageLevel;
import org.linguacap.catalogue.PublicCatalogueResource.PublicLanguage;

class PublicCatalogueResourceTest {
    private static final ObjectMapper JSON = new ObjectMapper();

    private static LanguageLevel published(String code, int position, String prerequisite, int minutes, int modules) {
        return new LanguageLevel(code, "Allemand " + code, true, UUID.randomUUID(), minutes, modules, position, prerequisite);
    }

    private static LanguageLevel draft(String code, Integer position, String prerequisite) {
        return new LanguageLevel(code, "Allemand " + code, false, null, null, 0, position, prerequisite);
    }

    /** Catalogue lu par LanguageResource : A1, A2 et B1 publiés, B2 en brouillon ; l'anglais n'a aucun niveau publié. */
    private static final List<Language> CATALOGUE = List.of(
            new Language("de", "Allemand", "Deutsch", "available", 1, true, List.of(
                    published("A1", 1, null, 2596, 23), published("A2", 2, "A1", 2410, 22),
                    published("B1", 3, "A2", 3540, 24), draft("B2", 4, "B1")), List.of("A1", "A2", "B1")),
            new Language("en", "Anglais", "English", "coming_soon", 2, false, List.of(draft("A1", null, null)), List.of()),
            new Language("es", "Espagnol", "Español", "coming_soon", 3, false, List.of(), List.of()));

    @Test
    void seulsLesNiveauxPubliésSontListésSansCompte() {
        List<PublicLanguage> languages = PublicCatalogueResource.published(CATALOGUE);
        assertEquals(1, languages.size(), "une langue sans niveau publié est absente");
        PublicLanguage german = languages.get(0);
        assertEquals("Deutsch", german.nativeName());
        assertEquals(List.of("A1", "A2", "B1"), german.levels().stream().map(PublicCatalogueResource.PublicLevel::code).toList(),
                "B2 n'a pas de version publiée : il n'est pas annoncé");
        assertEquals(3540, german.levels().get(2).plannedMinutes());
        assertEquals(24, german.levels().get(2).moduleCount());
        assertEquals(3, german.levels().get(2).position());
    }

    @Test
    void laRéponsePubliqueNePorteNiVersionNiDisponibilité() {
        JsonNode body = JSON.valueToTree(PublicCatalogueResource.published(CATALOGUE));
        assertEquals(List.of("id", "name", "nativeName", "position", "levels"), names(body.get(0)));
        assertEquals(List.of("code", "title", "position", "moduleCount", "plannedMinutes"), names(body.get(0).path("levels").get(0)));
        assertFalse(body.toString().contains("trackVersionId"), "aucun identifiant de version sans compte");
    }

    @Test
    void lesNiveauxConnectésPortentLeurPositionEtLeurPrérequis() {
        JsonNode german = JSON.valueToTree(CATALOGUE.get(0));
        JsonNode b1 = german.path("levels").get(2);
        assertEquals(3, b1.path("position").asInt());
        assertEquals("A2", b1.path("prerequisiteCode").asText());
        assertTrue(german.path("levels").get(0).path("prerequisiteCode").isNull(), "null explicite pour A1");
        assertTrue(JSON.valueToTree(CATALOGUE.get(1)).path("levels").get(0).path("position").isNull());
        assertEquals("[\"A1\",\"A2\",\"B1\"]", german.path("placementTiers").toString());
    }

    @Test
    void lesPaliersDuTestSuiventLÉchelleSansDoublon() {
        assertEquals(List.of("A1", "A2", "B1"), LanguageResource.placementTiers(Arrays.asList("B1", "A1", "A2", "A1", "X9", null)));
        assertEquals(List.of(), LanguageResource.placementTiers(List.of()));
    }

    private static List<String> names(JsonNode node) {
        List<String> names = new java.util.ArrayList<>();
        node.fieldNames().forEachRemaining(names::add);
        return names;
    }
}
