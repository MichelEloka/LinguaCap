// Cours B1 et B2 (phase 1, B1) : module B1 d'exemple du simulateur (« b1-arbeit » et son atelier). Consignes bilingues
// (« [fr] » : traduction affichée sous l'allemand), exercices typés, répétition, mission sur grille avant la remise, retour
// noté par critère côté élève, notation sur grille côté professeur, entraînement au bilan B1, bibliothèque avec l'onglet
// B1 et l'onglet B2 « Bientôt ».
//
// Comme 90-contenus-v4.mjs, les réponses viennent du simulateur de l'application (src/integration/mock-api.ts) : chaque
// écran part d'un état neuf. Ce module ne répond à aucune route par défaut.
import { scenario, scrollTo } from './90-contenus-v4.mjs';

const B1 = 'b1000000-0000-4000-8000-0000000000b1';
const activity = (id) => `/espace/bibliotheque/${B1}/${id}`;
const settle = (ms = 700) => async (page) => { await page.waitForTimeout(ms); };
const both = (...actions) => async (page, data) => { for (const action of actions) await action(page, data); };

/** Léa remet l'écrit B1 « postuler par courriel » depuis la bibliothèque : il arrive chez Marie Weber. */
async function writtenSubmitted(mock) {
  const lea = mock.as('eleve-suivi');
  const opened = await lea('/assessments/missions', { method: 'POST', body: { trackVersionId: B1, activityId: 'b1-arbeit-atelier-schreiben' } });
  const text = 'Sehr geehrte Frau Keller,\n\nich habe Ihre Anzeige gelesen und bewerbe mich um die Stelle als Verkäuferin in Teilzeit. '
    + 'Seit drei Jahren arbeite ich in einem Supermarkt in Leipzig. Dort berate ich Kundinnen und Kunden, räume Waren ein und arbeite oft an der Kasse. '
    + 'Letzten Monat habe ich zum Beispiel eine neue Kollegin eingearbeitet und ihr die Kasse und das Lager erklärt. '
    + 'Ich arbeite gern im Team und interessiere mich sehr für Bio-Produkte, deshalb passt die Stelle gut zu mir. '
    + 'Feste Arbeitszeiten sind für mich wichtig, weil ich abends einen Deutschkurs besuche.\n\n'
    + 'Könnten Sie mir sagen, wie lange die Probezeit dauert? Wäre es möglich, schon am 1. März anzufangen?\n\n'
    + 'Über eine Einladung zu einem Gespräch würde ich mich sehr freuen.\n\nMit freundlichen Grüßen\nLéa Durand';
  await lea(`/assessments/missions/${opened.id}`, { method: 'PUT', body: { text, checklist: opened.definition.checklist.map((_, index) => index) } });
  return lea(`/assessments/missions/${opened.id}/submit`, { method: 'POST', idempotencyKey: 'apercu-b1-ecrit' });
}

/** Léa ouvre l'entraînement au bilan intermédiaire B1 (consignes bilingues, grilles d'écrit et d'oral). */
async function practiceStarted(mock) {
  return mock.as('eleve-suivi')('/assessments/practice', { method: 'POST', body: { trackVersionId: B1, kind: 'midterm' } });
}

export const screens = [
  // Élève : bibliothèque, leçon, exercices, répétition
  { name: 'b1-bibliotheque', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined,
    '/espace/bibliotheque?niveau=B1&module=b1-arbeit', settle()) },
  { name: 'b1-lecon', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, activity('b1-arbeit-einstieg'), settle()) },
  { name: 'b1-exercice-lecture', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, activity('b1-arbeit-lesen'),
    scrollTo(/Stratégie|STRATEGIE/i)) },
  { name: 'b1-exercice-questions', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, activity('b1-arbeit-lesen'),
    scrollTo(/Was sucht der Biomarkt/)) },
  { name: 'b1-exercice-grammaire', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, activity('b1-arbeit-grammatik'),
    scrollTo(/Ergänzen Sie die höfliche Form/)) },
  { name: 'b1-regle', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, activity('b1-arbeit-regel'), settle()) },
  { name: 'b1-repetition', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, activity('b1-arbeit-redemittel'),
    scrollTo(/Ich habe drei Jahre Erfahrung/)) },
  // Élève : missions sur grille (grille avant la remise, retour noté par critère)
  { name: 'b1-mission-ecrit', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, activity('b1-arbeit-atelier-schreiben'),
    settle()) },
  { name: 'b1-mission-grille', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, activity('b1-arbeit-atelier-schreiben'),
    scrollTo(/Comment votre production sera évaluée|Tâche : tous les points/)) },
  { name: 'b1-mission-retour', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, activity('b1-arbeit-atelier-sprechen'),
    scrollTo(/16|Points forts/)) },
  // Professeur : notation sur grille de l'écrit B1 de Léa
  { name: 'b1-prof-grille', role: 'teacher', path: '/espace', setup: scenario('professeur', writtenSubmitted, (mission) => `/espace/corrections/missions/${mission.id}`,
    both(settle(), scrollTo(/Tâche : tous les points|Grille/))) },
  // Élève : entraînement au bilan B1
  { name: 'b1-entrainement', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', practiceStarted, (view) => `/espace/bibliotheque/entrainement/${view.id}`, settle()) },
];

