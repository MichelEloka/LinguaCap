// Incrément « Parcours », espace élève (lot A5) : accueil en étapes, test de niveau, objectif, jours, planning
// multi-niveaux, « Mon planning », « Mon contrat », bibliothèque et entraînement au bilan.
//
// Les réponses viennent du simulateur de l'application (src/integration/mock-api.ts, compilé à la volée avec esbuild) :
// chaque écran part d'un état neuf, l'amène à l'étape voulue par des appels directs au simulateur, puis détourne toutes
// les routes /api/v1 de la page vers ce simulateur (page.route est prioritaire sur les réponses de 00-core.mjs).
// Les autres écrans de l'aperçu ne sont pas touchés : ce module ne répond à aucune route par défaut.
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const require = createRequire(join(app, 'package.json'));
let bundle = null;
let generation = 0;

/** Navigateur minimal pour le simulateur : pas de stockage, l'état reste en mémoire. */
function browserShim() {
  const storage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
  globalThis.window ??= { location: { search: '', reload() {} }, sessionStorage: storage, dispatchEvent: () => true };
}

/** Nouvelle instance du simulateur (état initial) avec un accès à son état interne. */
async function freshMock() {
  if (!bundle) {
    const { build } = require('esbuild');
    const result = await build({ entryPoints: [join(app, 'src', 'integration', 'mock-api.ts')], bundle: true, format: 'esm', platform: 'neutral', write: false, logLevel: 'silent' });
    bundle = result.outputFiles[0].text;
  }
  browserShim();
  const module = await import(`data:text/javascript;base64,${Buffer.from(`${bundle}\n// ${++generation}`).toString('base64')}`);
  const as = (role) => (path, options) => module.mockRequest(path, `mock-${role}`, options);
  await as('eleve-autonome')('/me');
  const state = globalThis.window.linguacapMock.state;
  return { module, as, state };
}

const iso = (offset = 0) => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10); };
const weekdays = (minutes) => [1, 2, 3, 4, 5].map((weekday) => ({ weekday, sessions: 1, minutes }));
const answersOf = (state, attemptId, tier, right) => Object.fromEntries(state().placements.find((attempt) => attempt.id === attemptId).questions
  .filter((question) => question.tier === tier).map((question) => [question.id, right ? question.answer : 'dontknow']));

/** Étapes de mise en place, enchaînées par chaque écran. */
const steps = {
  async language(mock, role) { if (role === 'eleve-autonome') await mock.as(role)('/me/language', { method: 'PUT', body: { languageId: 'de' } }); },
  async startTest(mock, role) {
    await steps.language(mock, role);
    return mock.as(role)('/assessments/placements', { method: 'POST', body: { languageId: 'de' } });
  },
  async placedA1(mock, role) {
    const view = await steps.startTest(mock, role);
    const submit = (tier, right) => mock.as(role)(`/assessments/placements/${view.id}/submit`, {
      method: 'POST', body: { tier, answers: answersOf(mock.state, view.id, tier, right) }, idempotencyKey: `apercu-${tier}-${generation}` });
    await submit('A1', true);
    return submit('A2', false);
  },
  async beginner(mock, role) {
    await steps.language(mock, role);
    return mock.as(role)('/assessments/placements', { method: 'POST', body: { languageId: 'de', declaredBeginner: true } });
  },
  async draft(mock, role, { beginner = false, months = 6 } = {}) {
    const placement = beginner ? await steps.beginner(mock, role) : await steps.placedA1(mock, role);
    const target = beginner || placement.result?.placedLevel === 'A0' ? 'A2' : 'A2';
    const date = new Date(); date.setMonth(date.getMonth() + months);
    return mock.as(role)('/learning/paths', { method: 'POST', body: { placementAttemptId: placement.id, targetLevel: target, startDate: iso(), targetDate: date.toISOString().slice(0, 10) } });
  },
  async proposal(mock, role, options) {
    const path = await steps.draft(mock, role, options);
    const proposal = await mock.as(role)(`/learning/paths/${path.id}/availability`, { method: 'PUT', body: { days: weekdays(45) } });
    return { path, proposal };
  },
  async started(mock, role, options) {
    const { path, proposal } = await steps.proposal(mock, role, options);
    return mock.as(role)(`/learning/paths/${path.id}/proposal/validate`, { method: 'POST', body: { number: proposal.number } });
  },
  async counterProposal(mock) {
    const path = await steps.started(mock, 'eleve-suivi', { beginner: true, months: 9 });
    const date = new Date(path.targetDate); date.setDate(date.getDate() + 28);
    await mock.as('professeur')(`/learning/paths/${path.id}/contracts`, { method: 'POST', body: {
      targetLevel: path.targetLevel, targetDate: date.toISOString().slice(0, 10), weeklyMinutes: path.weeklyMinutes + 30,
      availability: path.availability.map((day) => ({ ...day, minutes: day.minutes + 10 })),
      note: 'Je vous propose un mois de plus et une demi-heure de plus par semaine : vous serez plus à l’aise pour l’examen blanc.' } });
    return path;
  },
  async practice(mock, role, submitted) {
    await steps.started(mock, role, { beginner: true, months: 9 });
    const library = await mock.as(role)('/learning/library');
    const view = await mock.as(role)('/assessments/practice', { method: 'POST', body: { trackVersionId: library.levels[0].trackVersionId, kind: 'midterm' } });
    if (!submitted) return view;
    const answers = Object.fromEntries(view.definition.parts.filter((part) => part.mode === 'closed')
      .map((part) => [part.id, Object.fromEntries(part.questions.map((question, index) => [question.id, question.options[index % question.options.length].id]))]));
    await mock.as(role)(`/assessments/practice/${view.id}/answers`, { method: 'PUT', body: { answers } });
    return mock.as(role)(`/assessments/practice/${view.id}/submit`, { method: 'POST', body: {}, idempotencyKey: `apercu-practice-${generation}` });
  },
};

/**
 * Prépare l'état (`prepare` reçoit le simulateur et renvoie éventuellement des données pour l'adresse), détourne l'API de
 * la page vers le simulateur sous le rôle donné, ouvre l'écran puis joue les gestes éventuels (`then`).
 */
function scenario(role, prepare, path, then) {
  return async (page) => {
    const mock = await freshMock();
    const data = await prepare(mock);
    await page.route('**/api/v1/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      let body;
      try { body = request.postDataJSON(); } catch { body = undefined; }
      const method = request.method();
      try {
        const result = await mock.module.mockRequest(url.pathname.replace(/^\/api\/v1/, '') + url.search, `mock-${role}`,
          method === 'GET' ? undefined : { method, body: body ?? {}, idempotencyKey: request.headers()['idempotency-key'] });
        // Sons du simulateur (adresses « blob: » créées hors du navigateur) : un vrai enregistrement du dépôt.
        const json = JSON.stringify(result ?? null).replace(/blob:nodedata:[^"]+/g, '/__media/audio/a1-essen-dialog-audio.mp3');
        return route.fulfill({ status: 200, contentType: 'application/json', body: json });
      } catch (error) {
        return route.fulfill({ status: 409, json: { code: 'CONFLICT', message: error.message } });
      }
    });
    const target = typeof path === 'function' ? path(data) : path;
    await page.goto(new URL(target, page.url()).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    if (then) await then(page, data);
  };
}

const click = (selector) => async (page) => { await page.locator(selector).first().click(); await page.waitForTimeout(900); };

export const screens = [
  { name: 'parcours-langue', role: 'learner', path: '/espace', setup: scenario('eleve-autonome', async () => undefined, '/espace/accueil/langue') },
  { name: 'parcours-langue-suivi', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, '/espace/accueil/langue') },
  { name: 'parcours-test', role: 'learner', path: '/espace', setup: scenario('eleve-autonome', (mock) => steps.language(mock, 'eleve-autonome'), '/espace/accueil/test') },
  { name: 'parcours-test-question', role: 'learner', path: '/espace', setup: scenario('eleve-autonome', async (mock) => {
    const view = await steps.startTest(mock, 'eleve-autonome');
    const answers = Object.fromEntries(Object.entries(answersOf(mock.state, view.id, 'A1', true)).slice(0, 9));
    await mock.as('eleve-autonome')(`/assessments/placements/${view.id}/answers`, { method: 'PUT', body: { tier: 'A1', answers } });
  }, '/espace/accueil/test') },
  { name: 'parcours-test-palier', role: 'learner', path: '/espace', setup: scenario('eleve-autonome', async (mock) => {
    const view = await steps.startTest(mock, 'eleve-autonome');
    await mock.as('eleve-autonome')(`/assessments/placements/${view.id}/answers`, { method: 'PUT', body: { tier: 'A1', answers: answersOf(mock.state, view.id, 'A1', true) } });
  }, '/espace/accueil/test', async (page) => { await page.getByRole('button', { name: /^Valider le palier/ }).click(); await page.waitForTimeout(1200); }) },
  { name: 'parcours-niveau', role: 'learner', path: '/espace', setup: scenario('eleve-autonome', (mock) => steps.placedA1(mock, 'eleve-autonome'), '/espace/accueil/niveau',
    async (page) => page.waitForTimeout(900)) },
  { name: 'parcours-objectif', role: 'learner', path: '/espace', setup: scenario('eleve-autonome', (mock) => steps.placedA1(mock, 'eleve-autonome'), '/espace/accueil/objectif') },
  { name: 'parcours-objectif-irrealiste', role: 'learner', path: '/espace', setup: scenario('eleve-autonome', (mock) => steps.placedA1(mock, 'eleve-autonome'), '/espace/accueil/objectif',
    async (page) => { await page.locator('.obj-dates input[type="date"]').nth(1).fill(iso(9)); await page.waitForTimeout(1200); }) },
  { name: 'parcours-jours', role: 'learner', path: '/espace', setup: scenario('eleve-autonome', (mock) => steps.draft(mock, 'eleve-autonome'), '/espace/accueil/jours') },
  { name: 'parcours-planning', role: 'learner', path: '/espace', setup: scenario('eleve-autonome', (mock) => steps.proposal(mock, 'eleve-autonome', { beginner: true, months: 9 }), '/espace/accueil/planning') },
  { name: 'parcours-depart-suivi', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', (mock) => steps.started(mock, 'eleve-suivi', { beginner: true, months: 9 }), '/espace/accueil/depart') },
  { name: 'parcours-aujourdhui-contrat', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', (mock) => steps.counterProposal(mock), '/espace') },
  { name: 'parcours-mon-planning', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', (mock) => steps.counterProposal(mock), '/espace/planning') },
  { name: 'parcours-mon-planning-jours', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', (mock) => steps.started(mock, 'eleve-suivi', { beginner: true, months: 9 }), '/espace/planning',
    click('button:has-text("Modifier mes jours")')) },
  { name: 'parcours-contrat', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', (mock) => steps.counterProposal(mock), '/espace/contrat') },
  { name: 'parcours-contrat-avenant', role: 'learner', path: '/espace', setup: scenario('eleve-autonome', (mock) => steps.started(mock, 'eleve-autonome', { beginner: true, months: 9 }), '/espace/contrat',
    click('button:has-text("Proposer un avenant")')) },
  { name: 'parcours-bibliotheque', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', (mock) => steps.started(mock, 'eleve-suivi', { beginner: true, months: 9 }), '/espace/bibliotheque') },
  { name: 'parcours-bibliotheque-activite', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async (mock) => {
    await steps.started(mock, 'eleve-suivi', { beginner: true, months: 9 });
    const library = await mock.as('eleve-suivi')('/learning/library');
    const level = library.levels[0];
    const activity = level.modules.flatMap((module) => module.activities).find((item) => item.kind === 'exercise');
    return `/espace/bibliotheque/${level.trackVersionId}/${activity.id}`;
  }, (href) => href) },
  { name: 'parcours-entrainement', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', (mock) => steps.practice(mock, 'eleve-suivi', false),
    (view) => `/espace/bibliotheque/entrainement/${view.id}`) },
  { name: 'parcours-entrainement-resultat', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', (mock) => steps.practice(mock, 'eleve-suivi', true),
    (view) => `/espace/bibliotheque/entrainement/${view.id}`) },
];

/**
 * Écrans des autres modules (élève Camille de 00-core.mjs) : ils simulent un service antérieur à l'incrément, sans
 * accueil ni parcours ; l'espace garde alors son fonctionnement historique (aucune redirection, ancien planning).
 */
export function api(role, method, rawPath) {
  const path = rawPath.split('?')[0];
  if (role === 'learner' && method === 'GET' && (path === '/learning/onboarding' || path === '/learning/path')) {
    return { __status: 404, body: { code: 'NOT_FOUND', message: 'Route absente du service simulé.' } };
  }
  return undefined;
}
