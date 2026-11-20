// Espace élève : états complémentaires de l'accueil, du planning, des résultats et des messages, et objectif vu par le
// professeur. Les réponses de base viennent de 00-core.mjs ; chaque écran ci-dessous remplace certaines routes
// (page.route est prioritaire sur les routes du contexte) puis recharge la page.
import { day, enrollment, goal, grades, proposal, sessions, sheet } from './00-core.mjs';

const iso = (offset) => day(offset).slice(0, 10);
const monday = (() => { const date = new Date(); date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); return date; })();
const fromMonday = (offset) => { const date = new Date(monday); date.setDate(date.getDate() + offset); date.setHours(18, 0, 0, 0); return date; };
const pad = (value) => String(value).padStart(2, '0');
const key = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Proposition à valider, trop chargée : quatre jours par semaine, deux séances certains jours, ajustements proposés.
const titles = ['Hallo! Se saluer', 'Les nombres', 'Au marché', 'Au restaurant', 'Mes loisirs', 'Ma famille', 'La ville', 'Bilan intermédiaire',
  'Au café', 'Les courses', 'Mon quotidien', 'Les vacances', 'Chez le médecin', 'Le logement'];
const openDays = [1, 2, 4, 6];
const availability = openDays.map((weekday) => ({ weekday, sessions: weekday === 6 ? 2 : 1, minutes: 45 }));
const plannedSessions = [];
for (let week = 0; week < 4; week++) {
  for (const weekday of openDays) {
    const date = fromMonday(week * 7 + weekday - 1);
    for (let slot = 1; slot <= (weekday === 6 ? 2 : 1); slot++) {
      const title = titles[plannedSessions.length % titles.length];
      plannedSessions.push({ date: key(date), slot, dueAt: date.toISOString(), title, minutes: 45, items: [
        { id: `p${plannedSessions.length}-a`, kind: 'lesson', title: `${title} · leçon`, minutes: 20 },
        { id: `p${plannedSessions.length}-b`, kind: 'exercise', title: `${title} · exercice`, minutes: 15 },
        { id: `p${plannedSessions.length}-c`, kind: 'review', title: 'Révision du vocabulaire', minutes: 10 },
      ] });
    }
  }
}
const proposed = {
  ...proposal, number: 3, status: 'proposed', availability, capacityMinutes: 3600, requiredMinutes: 3960, overflowCount: 3, validatable: false,
  sessions: plannedSessions,
  weeks: [0, 1, 2, 3].map((week) => ({ start: key(fromMonday(week * 7)), availableMinutes: 225, plannedMinutes: week === 3 ? 180 : 225 })),
  overflow: [
    { id: 'o1', kind: 'exercise', title: 'Le logement · exercice', minutes: 15 },
    { id: 'o2', kind: 'review', title: 'Révision générale', minutes: 20 },
    { id: 'o3', kind: 'assessment', title: 'Examen blanc A1', minutes: 60 },
  ],
  suggestions: [
    { kind: 'minutes', label: 'Passer à 60 min par séance', availability: availability.map((item) => ({ ...item, minutes: 60 })), targetDate: goal.targetDate },
    { kind: 'days', label: 'Ajouter le vendredi', availability: [...availability, { weekday: 5, sessions: 1, minutes: 45 }], targetDate: goal.targetDate },
    { kind: 'target_date', label: 'Repousser la date cible d’une semaine', availability, targetDate: iso(33) },
  ],
};
const proposedEnrollment = { ...enrollment, availability, sessions: [], goal: { ...goal, status: 'preparing', accompanied: false },
  proposal: { number: 3, status: 'proposed', overflowCount: 3, validatable: false } };

// Élève qui démarre : diagnostic à passer, aucune séance publiée, aucun résultat ni message.
const newcomer = { ...enrollment, sessions: [], availability: [], proposal: null,
  goal: { ...goal, status: 'preparing', diagnosticAttemptId: null, diagnosticModules: null, startingPointConfirmedAt: null } };

// Résultats rattachés aux séances (titres d'activité).
const linkedGrades = grades.map((grade, index) => ({ ...grade, sessionId: sessions[index % 3].id, activityId: `${sessions[index % 3].id}-b` }))
  .concat([{ kind: 'quiz', id: 'g5', lessonId: 'l5', correct: 7, total: 8, submittedAt: day(0, 12), sessionId: 's3', activityId: 's3-b' }]);

// Fiche du professeur : parcours en pause, diagnostic passé en attente de confirmation du point de départ.
const pausedSheet = { ...sheet, enrollment: { ...sheet.enrollment, goal: { ...goal, status: 'paused', resumeDate: iso(10), startingPointConfirmedAt: null,
  diagnosticModules: ['a1-hallo', 'a1-zahlen'], diagnosticPrerequisite: null, targetDate: iso(40) } } };

const replace = (routes) => async (page) => {
  for (const [pattern, body] of routes) await page.route(pattern, (route) => route.fulfill({ json: body }));
  await page.reload({ waitUntil: 'networkidle' });
};

// La fiche élève du professeur range l'objectif dans un onglet.
async function openGoalTab(page) {
  const tab = page.getByRole('tab', { name: /Objectif/ });
  if (await tab.count()) { await tab.first().click(); await page.waitForTimeout(500); }
}

export const screens = [
  { name: 'eleve-accueil-nouveau', role: 'learner', path: '/espace',
    setup: replace([['**/api/v1/learning/enrollment', newcomer], ['**/api/v1/assessments/results', []], ['**/api/v1/tracking/messages', []]]) },
  { name: 'eleve-planning-proposition', role: 'learner', path: '/espace/planning',
    setup: replace([['**/api/v1/learning/enrollment', proposedEnrollment], ['**/api/v1/learning/enrollments/*/proposal', proposed]]) },
  { name: 'eleve-planning-dispos', role: 'learner', path: '/espace/planning',
    setup: async (page) => { await page.getByRole('button', { name: 'Modifier les disponibilités' }).click(); await page.waitForTimeout(400); } },
  { name: 'eleve-planning-seance', role: 'learner', path: '/espace/planning',
    setup: async (page) => {
      await replace([['**/api/v1/learning/enrollment', proposedEnrollment], ['**/api/v1/learning/enrollments/*/proposal', proposed]])(page);
      await page.locator('.lp-calendar button.lx-event').first().click();
      await page.waitForTimeout(400);
    } },
  { name: 'eleve-resultats-seances', role: 'learner', path: '/espace/resultats', setup: replace([['**/api/v1/assessments/results', linkedGrades]]) },
  { name: 'eleve-resultats-vide', role: 'learner', path: '/espace/resultats', setup: replace([['**/api/v1/assessments/results', []]]) },
  { name: 'eleve-messages-vide', role: 'learner', path: '/espace/messages', setup: replace([['**/api/v1/tracking/messages', []]]) },
  { name: 'prof-fiche-pause', role: 'teacher', path: '/espace/eleves/u-l1?onglet=objectif',
    setup: async (page) => { await replace([['**/api/v1/tracking/learners/**', pausedSheet]])(page); await openGoalTab(page); } },
];

export function api() {
  return undefined;
}
