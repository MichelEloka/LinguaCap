package org.linguacap.catalogue;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.ws.rs.WebApplicationException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.linguacap.catalogue.VersionDocument.Activity;
import org.linguacap.catalogue.VersionDocument.Diagnostic;
import org.linguacap.catalogue.VersionDocument.Lesson;
import org.linguacap.catalogue.VersionDocument.Module;
import org.linguacap.catalogue.VersionDocument.Option;
import org.linguacap.catalogue.VersionDocument.Placement;
import org.linguacap.catalogue.VersionDocument.Question;
import org.linguacap.catalogue.VersionDocument.Settings;

class VersionDocumentTest {
    private static final Settings SETTINGS = new Settings(List.of("lecture", "ecoute"), "Réussir 60 % de l’examen blanc.",
            60, 10, 30, 60);

    private static Question question(String id, boolean... correct) {
        List<Option> options = new java.util.ArrayList<>();
        for (int index = 0; index < correct.length; index++) {
            options.add(new Option("o" + index, "Choix " + index, correct[index]));
        }
        return new Question(id, "Question " + id + " ?", null, options);
    }

    private static Module complete() {
        Placement image = new Placement("kaffee-image", 1, "illustration", "Une tasse de café.", null, "hidden", false, null, null);
        return new Module("au-cafe", "Au café", "Commander une boisson.", List.of(), List.of(
                new Activity("lecon", "lesson", "Commander", 10, List.of("ecoute"),
                        new Lesson("Commander", "Texte de la leçon.", "Kaffee."), List.of(), List.of(image)),
                new Activity("quiz", "exercise", "Exercice", 5, List.of("ecoute"), null,
                        List.of(question("q1", true, false)), List.of())));
    }

    @Test
    void unParcoursCompletEstPubliable() {
        var checks = VersionDocument.check(SETTINGS, null, List.of(complete()));
        assertTrue(checks.publishable(), () -> checks.issues().toString());
    }

    @Test
    void chaqueManqueEstSignaleAvecSonEmplacement() {
        Placement unnamed = new Placement("kaffee-image", 1, "illustration", " ", null, "hidden", false, null, null);
        Module incomplete = new Module("vide", "", "", List.of("inconnu"), List.of(
                new Activity("lecon", "lesson", "", 10, List.of(), new Lesson("", "", ""), List.of(), List.of(unnamed)),
                new Activity("quiz", "exercise", "Exercice", 5, List.of(), null,
                        List.of(question("q1", true, true), question("q2", false)), List.of())));
        var checks = VersionDocument.check(new Settings(List.of(), "", 60, 10, 30, 60), null, List.of(incomplete));
        assertFalse(checks.publishable());
        List<String> paths = checks.issues().stream().map(VersionDocument.Issue::path).toList();
        for (String expected : List.of("settings.successCriteria", "settings.expectedCompetences", "modules[0].title",
                "modules[0].objective", "modules[0].prerequisites", "modules[0].activities[0].title",
                "modules[0].activities[0].lesson", "modules[0].activities[0].placements[0].alt",
                "modules[0].activities[1].questions[0].options", "modules[0].activities[1].questions[1].options")) {
            assertTrue(paths.contains(expected), "Manque signalé : " + expected + " dans " + paths);
        }
    }

    @Test
    void uneImageDecorativeNExigePasDeTexteAlternatif() {
        Placement decorative = new Placement("kaffee-image", 1, "illustration", null, null, "hidden", true, null, null);
        Module module = new Module("m", "Module", "Objectif.", List.of(), List.of(new Activity("lecon", "lesson", "Leçon", 5,
                List.of(), new Lesson("Leçon", "Texte.", ""), List.of(), List.of(decorative))));
        assertTrue(VersionDocument.check(SETTINGS, null, List.of(module)).publishable());
    }

    @Test
    void lesPrerequisEnBoucleSontRefuses() {
        Module first = new Module("a", "A", "Objectif.", List.of("b"), complete().activities());
        Module second = new Module("b", "B", "Objectif.", List.of("a"), List.of(
                new Activity("autre", "lesson", "Autre", 5, List.of(), new Lesson("Autre", "Texte.", ""), List.of(), List.of())));
        var checks = VersionDocument.check(SETTINGS, null, List.of(first, second));
        assertTrue(checks.issues().stream().anyMatch(issue -> issue.message().contains("boucle")));
    }

    @Test
    void leDiagnosticRattacheChaqueQuestionAUnModuleOuAuPrerequis() {
        Diagnostic diagnostic = new Diagnostic("Diagnostic", "Situer l’élève.", List.of(
                new Question("d1", "Q ?", "au-cafe", List.of(new Option("a", "A", true), new Option("b", "B", false))),
                new Question("d2", "Q ?", "prerequis", List.of(new Option("a", "A", true), new Option("b", "B", false))),
                new Question("d3", "Q ?", "ailleurs", List.of(new Option("a", "A", true), new Option("b", "B", false)))));
        var checks = VersionDocument.check(SETTINGS, diagnostic, List.of(complete()));
        assertEquals(List.of("diagnostic.questions[2].moduleRef"), checks.issues().stream().map(VersionDocument.Issue::path).toList());
    }

    @Test
    void laStructureRefuseLesIdentifiantsInvalidesOuEnDouble() {
        assertDoesNotThrow(() -> VersionDocument.checkStructure(SETTINGS, null, List.of(complete())));
        Module badId = new Module("Au Café", "Au café", "Objectif.", List.of(), List.of());
        assertEquals(400, assertThrows(WebApplicationException.class,
                () -> VersionDocument.checkStructure(SETTINGS, null, List.of(badId))).getResponse().getStatus());
        assertThrows(WebApplicationException.class, () -> VersionDocument.checkStructure(SETTINGS, null, List.of(complete(), complete())));
        Module reserved = new Module("m", "M", "O", List.of(), List.of(new Activity("diagnostic", "lesson", "L", 5, List.of(),
                null, List.of(), List.of())));
        assertThrows(WebApplicationException.class, () -> VersionDocument.checkStructure(SETTINGS, null, List.of(reserved)));
        Module planned = new Module("m", "M", "O", List.of(), List.of(new Activity("revision-m", "review", "R", 5, List.of(),
                null, List.of(), List.of())));
        assertThrows(WebApplicationException.class, () -> VersionDocument.checkStructure(SETTINGS, null, List.of(planned)));
        Module unknownKind = new Module("m", "M", "O", List.of(), List.of(new Activity("x", "video", "L", 5, List.of(),
                null, List.of(), List.of())));
        assertThrows(WebApplicationException.class, () -> VersionDocument.checkStructure(SETTINGS, null, List.of(unknownKind)));
    }
}
