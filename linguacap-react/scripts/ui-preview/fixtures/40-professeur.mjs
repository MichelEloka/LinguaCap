// Espace professeur : écrans complémentaires (onglets de la fiche, détail d'alerte, encouragement, accueil de
// l'administration, attribution d'un parcours) et résultats d'exercices cohérents dans la vue d'ensemble.
import { day, overview, sheet } from './00-core.mjs';

// La vue d'ensemble de 00-core n'a pas de résultats d'exercices : on les complète (taux de réussite de la liste).
const scores = {
  'u-l1': [[5, 6], [3, 6], [6, 6], [4, 5]], 'u-l2': [[8, 10], [9, 10], [7, 10], [9, 10]], 'u-l3': [[4, 6], [5, 6]],
  'u-l4': [[9, 10], [10, 10], [8, 10], [10, 10]], 'u-l5': [[2, 6], [3, 6]],
};
for (const learner of overview.learners) {
  if (!learner.results.length) learner.results = (scores[learner.learnerId] ?? []).map(([correct, total]) => ({ correct, total }));
  learner.tracking.sessionsOnTime ??= Math.max(0, learner.tracking.sessionsCompleted - 1);
}

const withExam = {
  ...sheet,
  tracking: { ...sheet.tracking, results: { midterm: { percent: 68, decision: 'completed', onTime: true,
    scores: { lecture: { percent: 82 }, ecoute: { percent: 74 }, 'expression-ecrite': { percent: 61 }, 'expression-orale': { percent: 55 } } } } },
};
const withoutTrack = {
  profile: { id: 'u-l6', displayName: 'Nora Schmitt' }, enrollment: null, goal: null, results: [], completedCount: 0, messages: [], tracking: {},
};
const tracks = [
  { versionId: 'v-a1-2', levelCode: 'A1', levelTitle: 'Allemand A1', number: 2, moduleCount: 8, activityCount: 64, totalMinutes: 1300, prerequisiteLevelCode: null },
  { versionId: 'v-a2-2', levelCode: 'A2', levelTitle: 'Allemand A2', number: 2, moduleCount: 10, activityCount: 82, totalMinutes: 2100, prerequisiteLevelCode: 'A1' },
];

/** Remplace une réponse de l'API pour un écran puis recharge la page. */
async function override(page, pattern, json) {
  await page.route(pattern, (route) => route.fulfill({ json }));
  await page.reload({ waitUntil: 'networkidle' });
}

export const screens = [
  { name: 'prof-fiche-objectif', role: 'teacher', path: '/espace/eleves/u-l1?onglet=objectif' },
  { name: 'prof-fiche-resultats', role: 'teacher', path: '/espace/eleves/u-l1?onglet=resultats',
    setup: (page) => override(page, '**/api/v1/tracking/learners/**', withExam) },
  { name: 'prof-fiche-messages', role: 'teacher', path: '/espace/eleves/u-l1?onglet=messages' },
  { name: 'prof-fiche-attribuer', role: 'teacher', path: '/espace/eleves/u-l6', setup: async (page) => {
    await page.route('**/api/v1/tracks', (route) => route.fulfill({ json: tracks }));
    await override(page, '**/api/v1/tracking/learners/**', withoutTrack);
    await page.getByRole('button', { name: 'Attribuer un parcours' }).first().click();
  } },
  { name: 'prof-eleves-semaine', role: 'teacher', path: '/espace/eleves?filtre=semaine' },
  { name: 'prof-alertes-detail', role: 'teacher', path: '/espace/alertes',
    setup: (page) => page.getByRole('button', { name: /Camille Martin/ }).first().click() },
  { name: 'prof-encourager', role: 'teacher', path: '/espace', setup: async (page) => {
    await page.getByRole('button', { name: 'Encourager Camille Martin' }).click();
    await page.getByRole('button', { name: 'Relancer' }).click();
  } },
  { name: 'prof-accueil-vide', role: 'teacher', path: '/espace',
    setup: (page) => override(page, '**/api/v1/tracking/overview', { freshness: { syncedAt: day(0, 8) }, learners: [] }) },
  { name: 'prof-admin-accueil', role: 'admin', path: '/espace' },
  { name: 'prof-admin-fiche', role: 'admin', path: '/espace/eleves/u-l1' },
];

export function api() {
  return undefined;
}
