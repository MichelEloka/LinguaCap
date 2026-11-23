package org.linguacap.assessment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.ws.rs.WebApplicationException;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;

class MissionRulesTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final UUID TEACHER = UUID.fromString("2b8e1a90-5c3d-4f6e-9a7b-1c2d3e4f5a6b");
    private static final UUID REVIEWER = UUID.fromString("9f8e7d6c-5b4a-4321-8fed-cba987654321");
    private static final UUID RECORDING = UUID.fromString("7a6b5c4d-3e2f-4a1b-9c8d-7e6f5a4b3c2d");

    private static JsonNode json(String text) {
        try {
            return JSON.readTree(text.replace('\'', '"'));
        } catch (Exception error) {
            throw new IllegalStateException(error);
        }
    }

    /** Activité servie par Catalogue (route interne) pour la mission A1 « déplacer un rendez-vous ». */
    private static final JsonNode CONTENT = json("""
            {'moduleId':'a1-sante','levelCode':'A1',
             'activity':{'id':'a1-sante-mission','kind':'mission','title':'Mission : déplacer un rendez-vous',
                         'estimatedMinutes':20,'competences':['expression-orale','expression-ecrite'],'lessonId':'v1-a1-sante-mission'},
             'lesson':{'id':'v1-a1-sante-mission','title':'Déplacer un rendez-vous',
                       'description':'Vous êtes malade et devez déplacer votre rendez-vous chez le médecin.','transcript':null},
             'mission':{'oral':{'prompt':'Appelez le cabinet et proposez un autre jour.','maxSeconds':300},
                        'written':{'prompt':'Écrivez un court message au cabinet.','maxChars':600,'minWords':12},
                        'checklist':['J’ai salué et dit mon nom.','J’ai expliqué pourquoi je ne peux pas venir.',
                                     'J’ai proposé un autre jour.']},
             'questions':[],'placements':[]}
            """);

    private static final String TEXT = "Guten Tag, hier ist Lea Brun. Ich bin krank und kann am Montag leider nicht kommen. "
            + "Geht es am Mittwoch um zehn Uhr?";

    private static int status(Executable action) {
        return assertThrows(WebApplicationException.class, action).getResponse().getStatus();
    }

    @Test
    void laDéfinitionEstFigéeEtBornée() {
        JsonNode definition = MissionRules.definition(CONTENT);
        assertEquals("Mission : déplacer un rendez-vous", definition.path("title").asText());
        assertEquals("Vous êtes malade et devez déplacer votre rendez-vous chez le médecin.", definition.path("description").asText());
        assertEquals(120, definition.path("oral").path("maxSeconds").asInt(), "deux minutes au plus");
        assertEquals(600, definition.path("written").path("maxChars").asInt());
        assertEquals(12, definition.path("written").path("minWords").asInt());
        assertEquals(3, definition.path("checklist").size());
        JsonNode visible = MissionRules.visibleDefinition(definition);
        assertTrue(visible.has("oral") && visible.has("written") && visible.has("checklist") && !visible.has("title"));

        assertEquals(409, status(() -> MissionRules.definition(json("{'activity':{'kind':'exercise'}}"))));
        assertEquals(503, status(() -> MissionRules.definition(
                json("{'activity':{'kind':'mission'},'mission':{'oral':null,'written':null,'checklist':['a','b']}}"))));
        JsonNode oralOnly = MissionRules.definition(json(
                "{'activity':{'kind':'mission','title':'Mission'},'mission':{'oral':{'prompt':'Stellen Sie sich vor.','maxSeconds':10},'checklist':['a','b']}}"));
        assertEquals(30, oralOnly.path("oral").path("maxSeconds").asInt());
        assertTrue(oralOnly.path("written").isNull());
    }

    @Test
    void leBrouillonLimiteLeTexteEtLaListe() {
        JsonNode definition = MissionRules.definition(CONTENT);
        assertEquals(TEXT, MissionRules.checkText(definition, TEXT));
        assertEquals(400, status(() -> MissionRules.checkText(definition, "a".repeat(601))), "limite de la mission");
        JsonNode long1500 = MissionRules.definition(json(
                "{'activity':{'kind':'mission'},'mission':{'written':{'prompt':'Schreiben Sie.','maxChars':5000},'checklist':['a','b']}}"));
        assertEquals(1500, long1500.path("written").path("maxChars").asInt());
        assertEquals(400, status(() -> MissionRules.checkText(long1500, "ä".repeat(1501))), "texte > 1 500 caractères");
        MissionRules.checkText(long1500, "ä".repeat(1500));
        JsonNode oralOnly = MissionRules.definition(json(
                "{'activity':{'kind':'mission'},'mission':{'oral':{'prompt':'Sprechen Sie.'},'checklist':['a','b']}}"));
        assertEquals(400, status(() -> MissionRules.checkText(oralOnly, "Hallo")));
        assertEquals("", MissionRules.checkText(oralOnly, "  "));

        assertEquals(List.of(0, 2), MissionRules.checkChecklist(definition, List.of(2, 0)));
        assertEquals(400, status(() -> MissionRules.checkChecklist(definition, List.of(0, 3))));
        assertEquals(400, status(() -> MissionRules.checkChecklist(definition, List.of(1, 1))));
        assertEquals(400, status(() -> MissionRules.checkChecklist(definition, List.of(-1))));
    }

    @Test
    void laRemiseExigeCeQueLÉlèveAffirmeAvoirFait() {
        JsonNode definition = MissionRules.definition(CONTENT);
        List<Integer> all = List.of(0, 1, 2);
        assertNull(MissionRules.submitRefusal(definition, TEXT, all, RECORDING));
        assertTrue(MissionRules.submitRefusal(definition, TEXT, List.of(0, 2), RECORDING).contains("Cochez"),
                "liste incomplète");
        assertTrue(MissionRules.submitRefusal(definition, "", all, RECORDING).contains("Rédigez"));
        assertTrue(MissionRules.submitRefusal(definition, "Ich bin krank.", all, RECORDING).contains("12 mots"));
        assertTrue(MissionRules.submitRefusal(definition, TEXT, all, null).contains("Enregistrez"));
        assertEquals(23, MissionRules.words(TEXT));
        assertEquals(0, MissionRules.words(" – … "));
    }

    @Test
    void leDestinataireEstLeRéférentPuisLeCorrecteur() {
        MissionRules.Recipient teacher = MissionRules.recipient(json(
                "{'teacherId':'" + TEACHER + "','reviewerId':'" + REVIEWER + "','canGrade':false}"));
        assertEquals(new MissionRules.Recipient("submitted", TEACHER, "teacher"), teacher);
        assertEquals(new MissionRules.Recipient("submitted", REVIEWER, "reviewer"),
                MissionRules.recipient(json("{'teacherId':null,'reviewerId':'" + REVIEWER + "'}")));
        assertEquals(new MissionRules.Recipient("sent", null, null), MissionRules.recipient(json("{'teacherId':null}")),
                "élève autonome sans correcteur : envoyée");
        assertEquals(new MissionRules.Recipient("sent", null, null), MissionRules.recipient(null));
    }

    @Test
    void leRetourEtLaReprise() {
        assertEquals("Très bien, la date est claire.", MissionRules.checkReview("validated", "  Très bien, la date est claire. "));
        assertEquals("", MissionRules.checkReview("validated", null), "valider sans commentaire est permis");
        assertEquals(400, status(() -> MissionRules.checkReview("to_redo", " ")), "à reprendre : dire quoi");
        assertEquals(400, status(() -> MissionRules.checkReview("approved", "ok")));
        assertEquals(400, status(() -> MissionRules.checkReview("to_redo", "x".repeat(2001))));

        assertNull(MissionRules.reviewRefusal("submitted"));
        assertTrue(MissionRules.reviewRefusal("reviewed").contains("déjà"));
        assertTrue(MissionRules.reviewRefusal("sent").contains("sans professeur"));
        assertTrue(MissionRules.reviewRefusal("draft").contains("pas encore"));

        assertNull(MissionRules.restartRefusal("reviewed", "to_redo"), "à reprendre : nouvelle remise");
        assertNull(MissionRules.restartRefusal("sent", null), "envoyée : l'élève peut recommencer");
        assertTrue(MissionRules.restartRefusal("submitted", null).contains("attend"));
        assertTrue(MissionRules.restartRefusal("reviewed", "validated").contains("validée"));
    }
}
