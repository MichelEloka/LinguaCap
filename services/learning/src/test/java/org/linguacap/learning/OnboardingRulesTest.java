package org.linguacap.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/**
 * Accueil de l'élève lu par l'élève et par son professeur (EVO-039) et débutant sans diagnostic (EVO-038). Constat de
 * départ : une élève suivie s'est déclarée débutante et a créé son parcours au brouillon ; le professeur la voyait
 * « sans parcours » parce que Suivi ne projette le parcours qu'à l'ouverture d'un niveau (événement goal_set).
 */
class OnboardingRulesTest {
    private static String statuses(List<PathResource.OnboardingStep> steps) {
        return String.join(",", steps.stream().map(step -> step.id() + "=" + step.status()).toList());
    }

    @Test
    void unÉlèveSansLangueCommenceParLaLangue() {
        assertEquals("language=current,placement=todo,result=todo,objective=todo,days=todo,planning=todo,start=todo",
                statuses(OnboardingRules.steps(false, false, null, false, null)));
    }

    @Test
    void unÉlèveSuiviArriveAuTestAvecLaLangueDuProfesseur() {
        assertEquals("language=done,placement=current,result=todo,objective=todo,days=todo,planning=todo,start=todo",
                statuses(OnboardingRules.steps(true, false, null, false, null)));
    }

    @Test
    void leDébutantDéclaréQuiACrééSonBrouillonEnEstAuxJours() {
        // Débutant déclaré : la tentative est terminée (placée en A0), le brouillon existe, les jours restent à confirmer.
        assertEquals("language=done,placement=done,result=done,objective=done,days=current,planning=todo,start=todo",
                statuses(OnboardingRules.steps(true, true, "draft", false, null)));
        assertEquals("language=done,placement=done,result=done,objective=done,days=done,planning=current,start=todo",
                statuses(OnboardingRules.steps(true, true, "draft", true, null)));
    }

    @Test
    void unParcoursDémarréTermineLAccueil() {
        assertEquals("language=done,placement=done,result=done,objective=done,days=done,planning=done,start=done",
                statuses(OnboardingRules.steps(true, true, "active", true, null)));
        // Parcours attribué par le professeur, sans test : le test et le résultat sont sautés.
        assertEquals("language=done,placement=skipped,result=skipped,objective=done,days=done,planning=done,start=done",
                statuses(OnboardingRules.steps(true, false, "active", false, null)));
        assertEquals("start=done", statuses(OnboardingRules.steps(true, true, "completed", true, null)).replaceAll(".*,", ""));
    }

    @Test
    void lesBlocagesSontPortésParLÉtapeConcernée() {
        assertTrue(statuses(OnboardingRules.steps(true, false, null, false, "placement_unavailable")).contains("placement=blocked"));
        assertTrue(statuses(OnboardingRules.steps(true, false, null, false, "language_unavailable")).contains("placement=blocked"));
        assertTrue(statuses(OnboardingRules.steps(true, true, null, false, "no_target_available")).contains("result=blocked"));
        assertTrue(statuses(OnboardingRules.steps(true, true, null, false, null)).contains("result=current"));
    }

    @Test
    void unDébutantNAPasDeDiagnostic() {
        assertTrue(OnboardingRules.beginner("A0", "A0"), "Niveau A1 d'un parcours qui part de A0");
        assertTrue(OnboardingRules.beginner("A1", "A0"), "Niveau A2 d'un parcours qui part de A0 : toujours sans diagnostic");
        assertTrue(OnboardingRules.beginner("A0", null), "Inscription attribuée avant les parcours, départ A0");
        assertFalse(OnboardingRules.beginner("A1", "A1"), "Un élève qui part de A1 garde le diagnostic de l'A2");
        assertFalse(OnboardingRules.beginner(null, null));
    }

    @Test
    void leNiveauMontréEstLeNiveauOuvertSinonLeDernierTerminé() {
        UUID a1 = UUID.randomUUID();
        UUID a2 = UUID.randomUUID();
        assertNull(OnboardingRules.shownLevel(List.of()), "Brouillon : aucun niveau ouvert");
        OnboardingRules.Level open = OnboardingRules.shownLevel(List.of(
                new OnboardingRules.Level(1, "A1", "completed", a1, "validated"),
                new OnboardingRules.Level(2, "A2", "active", a2, "paused")));
        assertEquals("A2", open.levelCode());
        assertEquals(a2, open.enrollmentId());
        assertEquals("paused", open.goalStatus());
        OnboardingRules.Level last = OnboardingRules.shownLevel(List.of(
                new OnboardingRules.Level(2, "A2", "completed", a2, "validated"),
                new OnboardingRules.Level(1, "A1", "completed", a1, "validated")));
        assertEquals("A2", last.levelCode(), "Parcours terminé : le niveau le plus haut");
    }
}
