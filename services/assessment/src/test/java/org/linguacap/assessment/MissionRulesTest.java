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
        assertEquals(300, definition.path("oral").path("maxSeconds").asInt(), "cinq minutes au plus (niveaux B)");
        assertEquals(600, definition.path("written").path("maxChars").asInt());
        assertEquals(12, definition.path("written").path("minWords").asInt());
        assertEquals(3, definition.path("checklist").size());
        JsonNode visible = MissionRules.visibleDefinition(definition);
        assertTrue(visible.has("oral") && visible.has("written") && visible.has("checklist") && !visible.has("title"));
        assertTrue(definition.path("criteria").isArray() && definition.path("criteria").isEmpty(), "A1 : aucune grille");
        assertTrue(visible.path("criteria").isArray() && visible.path("criteria").isEmpty(), "servie avec criteria = []");
        JsonNode frozenBefore = json("{'description':'D','oral':null,'written':{'prompt':'P','maxChars':600,'minWords':0},'checklist':['a']}");
        assertTrue(MissionRules.visibleDefinition(frozenBefore).path("criteria").isArray(),
                "une remise figée avant les grilles est servie avec criteria = []");

        assertEquals(409, status(() -> MissionRules.definition(json("{'activity':{'kind':'exercise'}}"))));
        assertEquals(503, status(() -> MissionRules.definition(
                json("{'activity':{'kind':'mission'},'mission':{'oral':null,'written':null,'checklist':['a','b']}}"))));
        JsonNode oralOnly = MissionRules.definition(json(
                "{'activity':{'kind':'mission','title':'Mission'},'mission':{'oral':{'prompt':'Stellen Sie sich vor.','maxSeconds':10},'checklist':['a','b']}}"));
        assertEquals(30, oralOnly.path("oral").path("maxSeconds").asInt());
        assertTrue(oralOnly.path("written").isNull());
        JsonNode tooLong = MissionRules.definition(json(
                "{'activity':{'kind':'mission'},'mission':{'oral':{'prompt':'Sprechen Sie.','maxSeconds':301},'checklist':['a','b']}}"));
        assertEquals(300, tooLong.path("oral").path("maxSeconds").asInt(), "301 s ramené à 300 s (le catalogue le refuse)");
        JsonNode defaults = MissionRules.definition(json(
                "{'activity':{'kind':'mission'},'mission':{'oral':{'prompt':'P'},'written':{'prompt':'W','minWords':500},'checklist':['a','b']}}"));
        assertEquals(120, defaults.path("oral").path("maxSeconds").asInt(), "deux minutes par défaut, comme en V4");
        assertEquals(1500, defaults.path("written").path("maxChars").asInt(), "1 500 caractères par défaut, comme en V4");
        assertEquals(400, defaults.path("written").path("minWords").asInt(), "400 mots au plus");
    }

    /** Mission B1 « écrire à la régie » servie par Catalogue : écrit de 1 500 caractères, grille de 4 critères. */
    private static final JsonNode B1_CONTENT = json("""
            {'moduleId':'b1-wohnen-atelier','levelCode':'B1',
             'activity':{'id':'b1-wohnen-atelier-schreiben','kind':'mission','title':'Mission : écrire à la régie',
                         'estimatedMinutes':25,'competences':['expression-ecrite'],'lessonId':'b1-wohnen-atelier-schreiben'},
             'lesson':{'id':'b1-wohnen-atelier-schreiben','title':'Écrire à la régie',
                       'description':'Ihre Heizung funktioniert nicht. [fr] Votre chauffage ne fonctionne pas.','transcript':null},
             'mission':{'oral':null,
                        'written':{'prompt':'Schreiben Sie an die Hausverwaltung. [fr] Écrivez à la régie.','maxChars':1500,'minWords':100},
                        'checklist':['Ich beschreibe das Problem.','Ich bitte um einen Termin.'],
                        'criteria':[{'id':'aufgabe','label':' Tâche : tous les points sont traités ','maxPoints':5},
                                    {'id':'kohaerenz','label':'Cohérence : texte organisé','maxPoints':5},
                                    {'id':'wortschatz','label':'Vocabulaire : précis et varié','maxPoints':5},
                                    {'id':'strukturen','label':'Structures : verbe à la bonne place','maxPoints':5}]},
             'questions':[],'placements':[]}
            """);

    @Test
    void laGrilleEstFigéeDansLaDéfinitionEtMontréeAvantLaRemise() {
        JsonNode definition = MissionRules.definition(B1_CONTENT);
        JsonNode criteria = definition.path("criteria");
        assertEquals(4, criteria.size());
        assertEquals("aufgabe", criteria.get(0).path("id").asText());
        assertEquals("Tâche : tous les points sont traités", criteria.get(0).path("label").asText(), "libellé sans espaces de bord");
        assertEquals(5, criteria.get(3).path("maxPoints").asInt());
        assertEquals(criteria, MissionRules.visibleDefinition(definition).path("criteria"), "l'élève voit la grille");

        JsonNode noisy = MissionRules.definition(json("""
                {'activity':{'kind':'mission'},'mission':{'written':{'prompt':'W'},'checklist':['a','b'],
                 'criteria':[{'id':'a','label':'A','maxPoints':50},{'id':'a','label':'Doublon','maxPoints':2},
                             {'id':'B','label':'Invalide','maxPoints':2},{'id':'c','label':'C','maxPoints':2},
                             {'id':'d','label':'D','maxPoints':2},{'id':'e','label':'E','maxPoints':2},
                             {'id':'f','label':'F','maxPoints':2},{'id':'g','label':'G','maxPoints':2},
                             {'id':'h','label':'H','maxPoints':2}]}}
                """));
        assertEquals(6, noisy.path("criteria").size(), "six critères au plus, doublons et identifiants invalides écartés");
        assertEquals(20, noisy.path("criteria").get(0).path("maxPoints").asInt(), "20 points au plus par critère");
    }

    @Test
    void leRetourSurGrilleExigeChaqueCritèreDansSesBornes() {
        JsonNode definition = MissionRules.definition(B1_CONTENT);
        MissionRules.Grade grade = MissionRules.checkPoints(definition,
                json("{'strukturen':2,'aufgabe':5,'wortschatz':3,'kohaerenz':4}"));
        assertEquals(14, grade.score());
        assertEquals(20, grade.maxScore());
        assertEquals("{\"aufgabe\":5,\"kohaerenz\":4,\"wortschatz\":3,\"strukturen\":2}", grade.points().toString(),
                "points rangés dans l'ordre de la grille");
        assertEquals(0, MissionRules.checkPoints(definition, json("{'aufgabe':0,'kohaerenz':0,'wortschatz':0,'strukturen':0}"))
                .score(), "zéro est une note");

        assertEquals(400, status(() -> MissionRules.checkPoints(definition, null)), "points exigés");
        assertEquals(400, status(() -> MissionRules.checkPoints(definition, JSON.nullNode())));
        assertEquals(400, status(() -> MissionRules.checkPoints(definition, json("[5,4,3,2]"))));
        assertEquals(400, status(() -> MissionRules.checkPoints(definition, json("{'aufgabe':5,'kohaerenz':4,'wortschatz':3}"))),
                "critère manquant");
        assertEquals(400, status(() -> MissionRules.checkPoints(definition,
                json("{'aufgabe':6,'kohaerenz':4,'wortschatz':3,'strukturen':2}"))), "au-delà de maxPoints");
        assertEquals(400, status(() -> MissionRules.checkPoints(definition,
                json("{'aufgabe':-1,'kohaerenz':4,'wortschatz':3,'strukturen':2}"))), "négatif");
        assertEquals(400, status(() -> MissionRules.checkPoints(definition,
                json("{'aufgabe':4.5,'kohaerenz':4,'wortschatz':3,'strukturen':2}"))), "pas un entier");
        assertEquals(400, status(() -> MissionRules.checkPoints(definition,
                json("{'aufgabe':'4','kohaerenz':4,'wortschatz':3,'strukturen':2}"))), "pas un nombre");
        assertEquals(400, status(() -> MissionRules.checkPoints(definition,
                json("{'aufgabe':4,'kohaerenz':4,'wortschatz':3,'strukturen':2,'aussprache':4}"))), "clé inconnue");
        assertEquals(400, status(() -> MissionRules.checkPoints(definition,
                json("{'aufgabe':4,'kohaerenz':4,'wortschatz':3,'strukturen':null}"))), "critère non noté");
    }

    @Test
    void uneMissionSansGrilleSeCorrigeCommeEnV4() {
        JsonNode definition = MissionRules.definition(CONTENT);
        assertNull(MissionRules.checkPoints(definition, null), "A1/A2 : aucun point, aucune note");
        assertNull(MissionRules.checkPoints(definition, JSON.nullNode()), "points: null vaut absence");
        assertEquals(400, status(() -> MissionRules.checkPoints(definition, json("{'aufgabe':3}"))), "points refusés");
        assertEquals(400, status(() -> MissionRules.checkPoints(definition, json("{}"))), "même vides");
        JsonNode frozenBefore = json("{'description':'D','oral':null,'written':{'prompt':'P','maxChars':600,'minWords':0},'checklist':['a']}");
        assertNull(MissionRules.checkPoints(frozenBefore, null), "remise figée avant les grilles");
    }

    @Test
    void laDécisionResteAuCorrecteurQuelQueSoitLeScore() {
        JsonNode definition = MissionRules.definition(B1_CONTENT);
        MissionRules.Grade low = MissionRules.checkPoints(definition, json("{'aufgabe':1,'kohaerenz':1,'wortschatz':1,'strukturen':1}"));
        assertEquals(4, low.score());
        assertEquals("", MissionRules.checkReview("validated", null), "validée malgré un score bas : décision libre");
        MissionRules.Grade high = MissionRules.checkPoints(definition, json("{'aufgabe':5,'kohaerenz':5,'wortschatz':5,'strukturen':5}"));
        assertEquals(20, high.score());
        assertEquals("Reprenez la formule de politesse.", MissionRules.checkReview("to_redo", "Reprenez la formule de politesse."),
                "à reprendre malgré un score haut, avec un commentaire");
    }

    @Test
    void leBrouillonLimiteLeTexteEtLaListe() {
        JsonNode definition = MissionRules.definition(CONTENT);
        assertEquals(TEXT, MissionRules.checkText(definition, TEXT));
        assertEquals(400, status(() -> MissionRules.checkText(definition, "a".repeat(601))), "limite de la mission");
        JsonNode long3000 = MissionRules.definition(json(
                "{'activity':{'kind':'mission'},'mission':{'written':{'prompt':'Schreiben Sie.','maxChars':5000},'checklist':['a','b']}}"));
        assertEquals(3000, long3000.path("written").path("maxChars").asInt(), "3 000 caractères au plus");
        assertEquals(400, status(() -> MissionRules.checkText(long3000, "ä".repeat(3001))), "texte de 3 001 caractères refusé");
        assertEquals("ä".repeat(3000), MissionRules.checkText(long3000, "ä".repeat(3000)));
        assertEquals(400, status(() -> MissionRules.checkText(definition, "a".repeat(3001))), "borne commune avant la limite");
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
        JsonNode b1 = MissionRules.definition(B1_CONTENT);
        String hundredWords = "Sehr geehrte Damen und Herren, ".repeat(25).strip();
        assertNull(MissionRules.submitRefusal(b1, hundredWords, List.of(0, 1), null), "écrit B1 de 100 mots");
        assertTrue(MissionRules.submitRefusal(b1, "Sehr geehrte Damen und Herren.", List.of(0, 1), null).contains("100 mots"));
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
