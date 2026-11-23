// Mode étude : séances en lecteur d'activités (leçon, exercice à choix illustrés, exercice déjà corrigé, séance
// terminée) et diagnostic A1, avec les vrais contenus du module « Essen » et du test de positionnement.
//
// Les routes de séance (/learning/sessions/...) sont déjà simulées par 00-core pour toutes les séances : les écrans
// de ce module les remplacent au niveau de la page (page.route a priorité sur les routes du contexte), puis rechargent.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentModule, day, enrollment, grades as coreGrades, mediaUrl, questionView } from './00-core.mjs';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const read = (path) => JSON.parse(readFileSync(join(repo, path), 'utf8'));
const essen = contentModule('a1-essen');
const level = read('content/de/a1/level.json');
const media = new Map(essen.media.map((item) => [item.key, item]));

const scriptOf = (key) => (media.get(key)?.script ?? []).filter((line) => line.text)
  .map((line) => (line.name ? `${line.name} : ${line.text}` : line.text)).join('\n') || null;

/** Activité de séance construite à partir du contenu réel ; la transcription suit sa règle de visibilité. */
function activity(id, status = 'todo', extra = {}) {
  const source = essen.activities.find((item) => item.id === id);
  const audio = (source.placements ?? []).find((placement) => placement.usage === 'audio');
  const visible = audio && (audio.transcriptVisibility === 'on_demand' || (audio.transcriptVisibility === 'after_answer' && status === 'completed'));
  return {
    id, kind: source.kind, title: source.title, estimatedMinutes: source.estimatedMinutes, status, state: {}, attemptId: null,
    lesson: { id: `a1-v2-${id}`, title: source.lesson.title, description: source.lesson.description },
    transcript: visible ? scriptOf(audio.media) : null,
    questions: (source.questions ?? []).map(questionView), mission: null, contentVersionId: 'v-a1-2', contentActivityId: id, reviewItems: null,
    placements: (source.placements ?? []).map((placement, position) => ({
      position: position + 1, assetId: placement.media, assetVersion: 1, usage: placement.usage,
      alt: placement.alt ?? media.get(placement.media)?.alt ?? null, caption: placement.caption ?? null, decorative: Boolean(placement.decorative),
      questionId: placement.questionId ?? null, optionId: placement.optionId ?? null, url: mediaUrl(placement.media),
    })),
    ...extra,
  };
}

const studyGrade = (id, activityId, correct, submittedAt, sessionId) => {
  const total = essen.activities.find((item) => item.id === activityId).questions.length;
  return { kind: 'quiz', id, lessonId: `a1-v2-${activityId}`, correct: Math.min(correct, total), total, submittedAt, sessionId, activityId,
    moduleScores: null, pending: 0, flagged: [], typed: true };
};
const studyGrades = [
  studyGrade('g-imbiss', 'a1-essen-imbiss', 5, day(0, 10), 'etude-exercice'),
  studyGrade('g-lesen', 'a1-essen-lesen', 4, day(-1, 10), 'etude-terminee'),
  studyGrade('g-grammatik', 'a1-essen-grammatik', 7, day(-1, 11), 'etude-terminee'),
];

/** Corrigé d'une remise (forme d'ExerciseResult) : les `grade.correct` premières questions justes, les autres fausses. */
function exerciseResult(grade) {
  const source = essen.activities.find((item) => item.id === grade.activityId);
  const questions = source.questions.map((question, index) => {
    const right = index < grade.correct;
    const view = questionView(question);
    const type = question.type ?? 'choice';
    const common = { id: question.id, type, prompt: question.prompt, status: right ? 'correct' : 'incorrect',
      explanation: question.explanation ?? null, feedback: null, notices: [], detail: null };
    if (type === 'fill') {
      return { ...common, given: { blanks: Object.fromEntries(question.blanks.map((blank) => [blank.id, right ? blank.accept[0] : '…'])) },
        expected: { blanks: Object.fromEntries(question.blanks.map((blank) => [blank.id, blank.accept])), text: question.text },
        detail: { blanks: Object.fromEntries(question.blanks.map((blank) => [blank.id, { correct: right, notices: [] }])) } };
    }
    if (type === 'order') {
      const order = right ? question.answers[0].map((text) => view.tokens.find((token) => token.text === text).id) : view.tokens.map((token) => token.id);
      return { ...common, given: { order, sentence: order.map((id) => view.tokens.find((token) => token.id === id).text).join(' ') },
        expected: { sentence: question.answers[0].join(' '), alternatives: question.answers.slice(1).map((answer) => answer.join(' ')) } };
    }
    if (type === 'match') {
      const solution = Object.fromEntries(view.left.map((item, index) => [item.id, `r${index}`]));
      const given = right ? solution : Object.fromEntries(view.left.map((item, index) => [item.id, `r${(index + 1) % view.left.length}`]));
      return { ...common, given: { pairs: given }, detail: { pairs: Object.fromEntries(view.left.map((item) => [item.id, given[item.id] === solution[item.id]])) },
        expected: { pairs: solution, labels: Object.fromEntries([...view.left, ...view.right].map((item) => [item.id, item.text])) } };
    }
    if (type === 'dictation') {
      const words = question.accept[0].split(/\s+/).map((word, position) => ({ expected: word, given: right || position ? word : null, status: right || position ? 'ok' : 'missing' }));
      return { ...common, given: { text: words.filter((word) => word.given).map((word) => word.given).join(' ') }, expected: { text: question.accept[0] },
        detail: { score: right ? 100 : 80, words } };
    }
    const chosen = right ? question.options.find((option) => option.correct) : question.options.find((option) => !option.correct);
    const expected = question.options.find((option) => option.correct);
    return { ...common, given: { choice: chosen.id, label: chosen.label }, expected: { optionId: expected.id, label: expected.label }, feedback: chosen.feedback ?? null };
  });
  return { grade, questions };
}

function session(id, position, title, activities) {
  const done = activities.every((item) => item.status === 'completed');
  return {
    session: { id, position, title, dueAt: day(1), status: done ? 'completed' : 'in_progress', completedAt: done ? day(-1, 12) : null,
      estimatedMinutes: activities.reduce((sum, item) => sum + item.estimatedMinutes, 0), activities: [] },
    enrollmentId: 'e1', levelCode: 'A1', activities,
  };
}

/** Séances de l'aperçu, recréées pour chaque écran (les réponses et fins d'activité modifient cet état). */
function studySessions() {
  const imbissAnswers = { q1: 'b', q2: 'd', q3: 'c', q4: 'a', q5: 'c', q6: 'b' };
  return new Map([
    ['etude-lecon', session('etude-lecon', 3, 'Au marché', [
      activity('a1-essen-wortschatz', 'started'), activity('a1-essen-dialog'), activity('a1-essen-hoeren'), activity('a1-essen-imbiss'),
    ])],
    ['etude-exercice', session('etude-exercice', 4, 'Au restaurant', [
      activity('a1-essen-wortschatz', 'completed'), activity('a1-essen-dialog', 'completed'),
      activity('a1-essen-hoeren', 'started', { state: { answers: { q1: 'b' } } }),
      activity('a1-essen-imbiss', 'completed', { attemptId: 'g-imbiss', state: { answers: imbissAnswers } }),
    ])],
    ['etude-terminee', session('etude-terminee', 2, 'Les nombres', [
      activity('a1-essen-wortschatz', 'completed'), activity('a1-essen-dialog', 'completed'),
      activity('a1-essen-lesen', 'completed', { attemptId: 'g-lesen' }), activity('a1-essen-grammatik', 'completed', { attemptId: 'g-grammatik' }),
    ])],
  ]);
}

function summaryOf(detail) {
  const activities = detail.activities.map(({ id, kind, title, estimatedMinutes, status }) => ({ id, kind, title, estimatedMinutes, status }));
  const done = activities.every((item) => item.status === 'completed');
  return { ...detail.session, status: done ? 'completed' : 'in_progress', completedAt: done ? day(0, 12) : null, activities };
}

/** Remplace, pour cette page, les routes de séance de 00-core par celles du mode étude, puis recharge. */
async function useStudyApi(page) {
  const sessions = studySessions();
  const grades = [...studyGrades, ...coreGrades];
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace(/^\/api\/v1/, '');
    const method = request.method();
    let body;
    try { body = request.postDataJSON(); } catch { body = undefined; }
    const detailMatch = path.match(/^\/learning\/sessions\/([^/]+)$/);
    if (method === 'GET' && detailMatch && sessions.has(detailMatch[1])) {
      const detail = sessions.get(detailMatch[1]);
      return route.fulfill({ json: { ...detail, session: summaryOf(detail) } });
    }
    const progress = path.match(/^\/learning\/sessions\/([^/]+)\/activities\/([^/]+)\/progress$/);
    if (method === 'PUT' && progress && sessions.has(progress[1])) {
      const detail = sessions.get(progress[1]);
      const item = detail.activities.find((entry) => entry.id === decodeURIComponent(progress[2]));
      if (item && body?.state) item.state = body.state;
      if (item && body?.completed) {
        item.status = 'completed';
        if (body.attemptId) {
          item.attemptId = body.attemptId;
          const audio = item.placements.find((placement) => placement.usage === 'audio');
          if (audio) item.transcript = scriptOf(audio.assetId);
        }
      } else if (item && item.status === 'todo') item.status = 'started';
      return route.fulfill({ json: summaryOf(detail) });
    }
    if (method === 'GET' && path === '/assessments/results') return route.fulfill({ json: grades });
    const reviewed = path.match(/^\/assessments\/exercises\/([^/]+)$/);
    if (method === 'GET' && reviewed) {
      const grade = grades.find((item) => item.id === decodeURIComponent(reviewed[1]));
      return grade?.activityId ? route.fulfill({ json: exerciseResult(grade) }) : route.fulfill({ status: 404, json: { code: 'NOT_FOUND', message: 'Remise introuvable.' } });
    }
    if (method === 'POST' && path === '/assessments/exercises') {
      const total = Object.keys(body?.answers ?? {}).length;
      const grade = { kind: 'quiz', id: `g-${body?.activityId}`, lessonId: body?.lessonId, correct: Math.max(0, total - 1), total,
        submittedAt: new Date().toISOString(), sessionId: body?.sessionId ?? null, activityId: body?.activityId ?? null, moduleScores: null,
        pending: 0, flagged: [], typed: true };
      grades.unshift(grade);
      return route.fulfill({ json: exerciseResult(grade) });
    }
    if (method === 'POST' && path === '/assessments/quiz') {
      const total = Object.keys(body?.answers ?? {}).length;
      const grade = { kind: 'quiz', id: `g-${body?.activityId}`, lessonId: body?.lessonId, correct: Math.max(0, total - 1), total,
        submittedAt: new Date().toISOString(), sessionId: body?.sessionId, activityId: body?.activityId };
      grades.unshift(grade);
      return route.fulfill({ json: grade });
    }
    return route.fallback();
  });
  await page.reload({ waitUntil: 'networkidle' });
}

const study = (after) => async (page) => {
  await useStudyApi(page);
  if (after) await after(page);
};

export const diagnostic = {
  lessonId: 'a1-v2-diagnostic', title: level.diagnostic.title, description: level.diagnostic.description,
  questions: level.diagnostic.questions.map((question) => ({ id: question.id, prompt: question.prompt,
    options: question.options.map((option) => ({ id: option.id, text: option.label })) })),
};

async function answerDiagnostic(page, count) {
  await page.getByRole('button', { name: 'Commencer le test' }).click();
  for (let index = 0; index < count; index++) {
    await page.locator('.study-choice-input').nth(index % 2).check();
    await page.waitForTimeout(520);
  }
}

export const screens = [
  { name: 'etude-lecon', role: 'learner', path: '/espace/seance/etude-lecon', setup: study() },
  { name: 'etude-lecon-zoom', role: 'learner', path: '/espace/seance/etude-lecon', setup: study(async (page) => {
    await page.getByRole('button', { name: /^Agrandir l’image/ }).first().click();
  }) },
  { name: 'etude-enchainement', role: 'learner', path: '/espace/seance/etude-lecon', setup: study(async (page) => {
    await page.getByRole('button', { name: 'J’ai terminé la leçon' }).click();
    await page.getByText('Leçon terminée').waitFor();
  }) },
  { name: 'etude-dialogue', role: 'learner', path: '/espace/seance/etude-lecon', setup: study(async (page) => {
    await page.getByRole('button', { name: /^Dialogue : au café/ }).click();
    await page.getByText('Lire la transcription').click();
  }) },
  { name: 'etude-exercice', role: 'learner', path: '/espace/seance/etude-exercice', setup: study(async (page) => {
    await page.locator('.study-question').nth(1).scrollIntoViewIfNeeded();
  }) },
  { name: 'etude-corrige', role: 'learner', path: '/espace/seance/etude-exercice', setup: study(async (page) => {
    await page.getByRole('button', { name: /^Écouter : à l’Imbiss/ }).click();
    await page.getByText('Lire la transcription').click();
    await page.locator('.study-result').scrollIntoViewIfNeeded();
  }) },
  { name: 'etude-terminee', role: 'learner', path: '/espace/seance/etude-terminee', setup: study() },
  { name: 'etude-diagnostic', role: 'learner', path: '/espace/diagnostic' },
  { name: 'etude-diagnostic-question', role: 'learner', path: '/espace/diagnostic', setup: (page) => answerDiagnostic(page, 2) },
  { name: 'etude-diagnostic-resultat', role: 'learner', path: '/espace/diagnostic', setup: async (page) => {
    await answerDiagnostic(page, diagnostic.questions.length);
    await page.getByRole('button', { name: /Envoyer mes réponses/ }).click();
    await page.getByText('Test terminé, merci !').waitFor();
  } },
];

export function api(role, method, rawPath, body) {
  const path = rawPath.split('?')[0];
  if (role !== 'learner') return undefined;
  if (method === 'GET' && /^\/learning\/enrollments\/[^/]+\/diagnostic$/.test(path)) return diagnostic;
  if (method === 'POST' && path === '/assessments/diagnostics') {
    return { kind: 'diagnostic', id: 'g-diag', lessonId: body?.lessonId ?? diagnostic.lessonId, correct: 7, total: diagnostic.questions.length, submittedAt: day(0, 9) };
  }
  if (method === 'POST' && /^\/learning\/enrollments\/[^/]+\/diagnostic$/.test(path)) {
    return { ...enrollment, goal: { ...enrollment.goal, diagnosticAttemptId: body?.attemptId ?? 'g-diag', diagnosticModules: ['a1-hallo', 'a1-zahlen'] } };
  }
  return undefined;
}
