// V4 « Contenus et pédagogie » : exercices typés et corrigé, répétition orale, mission, lexique, révision « à reprendre »,
// bibliothèque « à revoir », résultats et tiroir du corrigé côté élève ; corrections des missions et de la prononciation
// côté professeur.
//
// Comme 70-parcours-eleve.mjs, les réponses viennent du simulateur de l'application (src/integration/mock-api.ts, compilé
// avec esbuild) : il porte des contenus V4 d'exemple (modules « a1-hallo », « a1-zahlen », « a2-gesundheit ») et des
// données de départ (Léa : répétition « à revoir », mission à reprendre ; Yanis : mission et répétition en attente chez
// Marie Weber). Chaque écran part d'un état neuf. Ce module ne répond à aucune route par défaut.
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const require = createRequire(join(app, 'package.json'));
const A1 = 'b1000000-0000-4000-8000-0000000000a1';
let bundle = null;
let generation = 0;

async function freshMock() {
  if (!bundle) {
    const { build } = require('esbuild');
    const result = await build({ entryPoints: [join(app, 'src', 'integration', 'mock-api.ts')], bundle: true, format: 'esm', platform: 'neutral', write: false, logLevel: 'silent' });
    bundle = result.outputFiles[0].text;
  }
  const storage = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
  globalThis.window ??= { location: { search: '', reload() {} }, sessionStorage: storage, dispatchEvent: () => true };
  const module = await import(`data:text/javascript;base64,${Buffer.from(`${bundle}\n// v4-${++generation}`).toString('base64')}`);
  const as = (role) => (path, options) => module.mockRequest(path, `mock-${role}`, options);
  await as('eleve-suivi')('/me');
  return { module, as, state: globalThis.window.linguacapMock.state };
}

const iso = (offset = 0) => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10); };

/** Léa démarre un parcours A1 → A2 : ses premières séances portent les activités V4 du module « a1-hallo ». */
async function startedPath(mock) {
  const lea = mock.as('eleve-suivi');
  const placement = await lea('/assessments/placements', { method: 'POST', body: { languageId: 'de', declaredBeginner: true } });
  const path = await lea('/learning/paths', { method: 'POST', body: { placementAttemptId: placement.id, targetLevel: 'A2', startDate: iso(), targetDate: iso(270) } });
  const proposal = await lea(`/learning/paths/${path.id}/availability`, { method: 'PUT', body: { days: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, sessions: 1, minutes: 60 })) } });
  await lea(`/learning/paths/${path.id}/proposal/validate`, { method: 'POST', body: { number: proposal.number } });
  return mock.state().paths.find((item) => item.learnerId === '00000000-0000-4000-8000-000000000102');
}
const sessionWith = (path, activityId) => path.liveSessions.find((session) => session.items.some((item) => item.id === activityId));

/** Exercice « S'entraîner » remis en séance avec quelques erreurs, puis terminé : la séance affiche le corrigé. */
async function gradedPractice(mock) {
  const path = await startedPath(mock);
  const session = sessionWith(path, 'a1-hallo-ueben');
  const lea = mock.as('eleve-suivi');
  const detail = await lea(`/learning/sessions/${session.id}`);
  const activity = detail.activities.find((item) => item.id === 'a1-hallo-ueben');
  const [, , order, match] = activity.questions;
  const tokenOf = (text) => order.tokens.find((token) => token.text === text).id;
  const rightOf = (text) => match.right.find((item) => item.text === text).id;
  const answers = {
    q1: { blanks: { 1: 'heisse', 2: 'komme' } }, q2: { blanks: { 1: 'ist', 2: 'sind' } },
    q3: { order: ['Welche', 'Sprachen', 'du', 'sprichst', 'gut?'].map(tokenOf) },
    q4: { pairs: Object.fromEntries(match.left.map((left, index) => [left.id,
      rightOf(['Ich heiße Jonas.', 'Aus Frankreich.', 'In Würzburg.', 'Gut, danke!'][index === 1 ? 2 : index === 2 ? 1 : index])])) },
    q5: { choice: 'b' },
  };
  const roundId = crypto.randomUUID();
  const result = await lea('/assessments/exercises', { method: 'POST', body: { lessonId: activity.lesson.id, roundId, answers, sessionId: session.id, activityId: activity.id } });
  await lea(`/learning/sessions/${session.id}/activities/${activity.id}/progress`, { method: 'PUT', body: { state: { answers, roundId }, completed: true, attemptId: result.grade.id } });
  return { session, result };
}

/** Détourne l'API de la page vers le simulateur sous le rôle donné, ouvre l'écran puis joue les gestes éventuels. */
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
        const json = JSON.stringify(result ?? null).replace(/blob:nodedata:[^"]+/g, '/__media/audio/a1-hallo-dialog-audio.mp3');
        return route.fulfill({ status: 200, contentType: 'application/json', body: json });
      } catch (error) {
        return route.fulfill({ status: 409, json: { code: 'CONFLICT', message: error.message } });
      }
    });
    await page.goto(new URL(typeof path === 'function' ? path(data) : path, page.url()).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    if (then) await then(page, data);
  };
}

/** Ouvre une activité de la séance par son titre (rail des activités ou liste sur mobile). */
const openActivity = (title) => async (page) => {
  await page.getByRole('button', { name: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first().click();
  await page.waitForTimeout(900);
};
const scrollTo = (text) => async (page) => {
  await page.getByText(text).first().scrollIntoViewIfNeeded({ timeout: 3_000 }).catch(() => undefined);
  await page.waitForTimeout(500);
};
const both = (...actions) => async (page, data) => { for (const action of actions) await action(page, data); };
const session = (activityId) => (path) => `/espace/seance/${sessionWith(path, activityId).id}`;

export const screens = [
  // Élève : séance
  { name: 'v4-exercice', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', startedPath, session('a1-hallo-ueben'),
    both(openActivity('S’entraîner : heißen, kommen, sein'), scrollTo(/^Question 1/i))) },
  { name: 'v4-exercice-ordre', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', startedPath, session('a1-hallo-ueben'),
    both(openActivity('S’entraîner : heißen, kommen, sein'), scrollTo(/^Question 3/i))) },
  { name: 'v4-exercice-corrige', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', gradedPractice, (data) => `/espace/seance/${data.session.id}`,
    both(openActivity('S’entraîner : heißen, kommen, sein'), scrollTo(/^Question 2/i))) },
  { name: 'v4-repetition', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', startedPath, session('a1-hallo-nachsprechen'),
    both(openActivity('Répéter à voix haute : se présenter'), scrollTo(/^Question 1/i))) },
  { name: 'v4-mission', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', startedPath, session('a1-hallo-mission'),
    both(openActivity('Mission : se présenter au groupe'), scrollTo(/^Votre mission/i))) },
  { name: 'v4-lexique', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', startedPath, session('a1-hallo-ueben'), async (page) => {
    await page.getByRole('button', { name: 'Lexique du module' }).first().click();
    await page.waitForTimeout(900);
  }) },
  { name: 'v4-revision', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', startedPath, session('revision-a1-hallo'),
    openActivity('Révision')) },
  // Élève : bibliothèque et résultats
  { name: 'v4-bibliotheque', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, '/espace/bibliotheque') },
  { name: 'v4-bibliotheque-dictee', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined,
    `/espace/bibliotheque/${A1}/a1-zahlen-diktat`) },
  { name: 'v4-bibliotheque-mission-retour', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined,
    `/espace/bibliotheque/${A1}/a1-hallo-mission`) },
  { name: 'v4-resultats', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, '/espace/resultats') },
  { name: 'v4-resultats-corrige', role: 'learner', path: '/espace', setup: scenario('eleve-suivi', async () => undefined, '/espace/resultats', async (page) => {
    await page.getByRole('button', { name: /Voir le corrigé/ }).first().click();
    await page.waitForTimeout(1_000);
  }) },
  // Professeur : corrections et fiche élève
  { name: 'v4-prof-missions', role: 'teacher', path: '/espace', setup: scenario('professeur', async (mock) => mock.state(), (state) =>
    `/espace/corrections/missions/${state.missions.find((mission) => mission.status === 'submitted').id}`) },
  { name: 'v4-prof-prononciation', role: 'teacher', path: '/espace', setup: scenario('professeur', async (mock) => mock.state(), (state) =>
    `/espace/corrections/oral/${state.speech.find((attempt) => attempt.reviewStatus === 'pending').id}`) },
  { name: 'v4-prof-fiche-resultats', role: 'teacher', path: '/espace', setup: scenario('professeur', async () => undefined,
    '/espace/eleves/00000000-0000-4000-8000-000000000102?onglet=resultats') },
  // Équipe : éditeur du catalogue sur un brouillon au format 4 (questions typées, mission, lexique du module)
  { name: 'v4-editeur-module', role: 'staff', path: '/espace', setup: scenario('equipe', draftVersion, (draft) => `/espace/catalogue/versions/${draft.id}`,
    tryClick('button', /Hallo ! Se saluer/)) },
  { name: 'v4-editeur-exercice', role: 'staff', path: '/espace', setup: scenario('equipe', draftVersion, (draft) => `/espace/catalogue/versions/${draft.id}`,
    both(tryClick('button', /Hallo ! Se saluer/), tryClick('button', /S’entraîner : heißen, kommen, sein/), scrollTo(/Remettre en ordre/))) },
  { name: 'v4-editeur-mission', role: 'staff', path: '/espace', setup: scenario('equipe', draftVersion, (draft) => `/espace/catalogue/versions/${draft.id}`,
    both(tryClick('button', /Hallo ! Se saluer/), tryClick('button', /Mission : se présenter au groupe/))) },
  { name: 'v4-editeur-lexique', role: 'staff', path: '/espace', setup: scenario('equipe', draftVersion, (draft) => `/espace/catalogue/versions/${draft.id}`,
    both(tryClick('button', /Hallo ! Se saluer/), tryClick('button', /Lexique|Vocabulaire/), scrollTo(/Lexique|Vocabulaire/))) },
];

/** Brouillon de la version A1 du simulateur, copié de la version publiée (document au format 4). */
function draftVersion(mock) {
  return mock.as('equipe')('/catalogue/levels/a1/versions', { method: 'POST', body: {} });
}
/** Clic tolérant : l'écran est capturé même si l'élément n'existe pas (l'aperçu signale alors l'écart à l'œil). */
function tryClick(role, name) {
  return async (page) => {
    await page.getByRole(role, { name }).first().click({ timeout: 3_000 }).catch(() => undefined);
    await page.waitForTimeout(700);
  };
}
