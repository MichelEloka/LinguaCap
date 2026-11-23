// Incrément « Parcours », côté professeur (lot A6) : accueil en questions, contrats, onglet « Parcours » de la fiche,
// ajout de cours, badges et vitrine des langues. Parcours A0 → A2 de Camille Martin (u-l1) avec un contrat n° 1 en
// attente ; bibliothèque construite à partir des vrais modules A1 et A2.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { day, profiles } from './00-core.mjs';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const iso = (offset) => day(offset).slice(0, 10);
const difficulty = { code: 'moderate', label: 'Modéré', requiredWeeklyMinutes: 195 };
const days = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, sessions: 1, minutes: 45 }));
const pathId = '7f1d2c3b-0000-4000-8000-000000000001';

const terms = { startLevel: 'A0', targetLevel: 'A2', startDate: iso(-4), targetDate: iso(150), weeklyMinutes: 195, availability: days,
  requiredMinutes: 2540, difficulty };
const contract = { pathId, number: 1, status: 'pending_teacher', proposedBy: 'learner', proposerId: 'u-l1', terms,
  note: 'Je voudrais atteindre A2 avant mon départ à Berlin au printemps.', createdAt: day(-4, 10), decidedAt: null, decidedBy: null,
  decisionNote: null, canAccept: true, canReject: true };
const pending = [
  { pathId, learnerId: 'u-l1', learnerName: 'Camille Martin', languageId: 'de', contract,
    path: { startLevel: 'A0', targetLevel: 'A2', targetDate: terms.targetDate, status: 'active' } },
  { pathId: '7f1d2c3b-0000-4000-8000-000000000003', learnerId: 'u-l3', learnerName: 'Awa Diallo', languageId: 'de',
    contract: { ...contract, pathId: '7f1d2c3b-0000-4000-8000-000000000003', proposerId: 'u-l3', createdAt: day(-1, 9), note: null,
      terms: { ...terms, startLevel: 'A1', targetDate: iso(70), weeklyMinutes: 150, requiredMinutes: 1300,
        difficulty: { code: 'sustained', label: 'Soutenu', requiredWeeklyMinutes: 310 } } },
    path: { startLevel: 'A1', targetLevel: 'A2', targetDate: iso(70), status: 'active' } },
];

// Séances : A1 sur dix semaines, puis A2 projeté (verrouillé).
const weekStart = (() => { const date = new Date(); date.setDate(date.getDate() - ((date.getDay() + 6) % 7) - 7); return date; })();
const sessions = [];
const weeks = [];
for (let week = 0; week < 22; week++) {
  const level = week < 10 ? 'A1' : 'A2';
  let planned = 0;
  for (let weekday = 0; weekday < 5; weekday++) {
    const date = new Date(weekStart); date.setDate(date.getDate() + week * 7 + weekday);
    const key = date.toISOString().slice(0, 10);
    const minutes = week === 21 ? 0 : 35 + ((week + weekday) % 3) * 5;
    if (!minutes) continue;
    planned += minutes;
    sessions.push({ date: key, slot: 1, dueAt: `${key}T18:00:00.000Z`, title: level === 'A1' ? ['Hallo ! Se présenter', 'Les nombres', 'Au café', 'Ma journée', 'Au marché'][weekday] : ['Voyager', 'Santé', 'Logement', 'Travail', 'Achats'][weekday],
      moduleId: `${level.toLowerCase()}-module`, minutes, capacity: 45, levelCode: level,
      items: [{ id: `${key}-a`, kind: 'lesson', title: 'Leçon', minutes: minutes - 15, moduleId: null, levelCode: level, sourceVersionId: null, sourceActivityId: null, additionId: null },
        { id: `${key}-b`, kind: 'exercise', title: 'Exercice', minutes: 15, moduleId: null, levelCode: level, sourceVersionId: null, sourceActivityId: null, additionId: week === 2 ? 'ad1' : null }] });
  }
  weeks.push({ start: new Date(weekStart.getTime() + week * 7 * 86_400_000).toISOString().slice(0, 10), availableMinutes: 225, plannedMinutes: planned });
}
const levels = [
  { levelCode: 'A1', stepPosition: 1, firstDate: sessions[0].date, lastDate: sessions[49].date, minutes: 1286, sessionCount: 50 },
  { levelCode: 'A2', stepPosition: 2, firstDate: sessions[50].date, lastDate: sessions.at(-1).date, minutes: 1254, sessionCount: sessions.length - 50 },
];
const proposal = {
  number: 1, baseRevision: 0, status: 'validated', startDate: terms.startDate, targetDate: terms.targetDate, availability: days,
  capacityMinutes: 4950, requiredMinutes: 2540, overflowCount: 0, createdAt: day(-4, 10), sessions, overflow: [], weeks,
  suggestions: [], validatable: false, pathId, difficulty, feasibility: { code: 'comfortable', loadPercent: 51 }, levels, blockingReason: null,
};
const steps = [
  { id: 'st1', position: 1, levelCode: 'A1', levelTitle: 'Allemand A1', trackVersionId: 'v-a1-2', trackVersionNumber: 2, status: 'active',
    enrollmentId: 'e1', goalStatus: 'active', plannedMinutes: 1286, firstDate: levels[0].firstDate, lastDate: levels[0].lastDate,
    sessionsTotal: 50, sessionsCompleted: 6, finalDecision: null },
  { id: 'st2', position: 2, levelCode: 'A2', levelTitle: 'Allemand A2', trackVersionId: 'v-a2-2', trackVersionNumber: 2, status: 'planned',
    enrollmentId: null, goalStatus: null, plannedMinutes: 1254, firstDate: levels[1].firstDate, lastDate: levels[1].lastDate,
    sessionsTotal: sessions.length - 50, sessionsCompleted: 0, finalDecision: null },
];
const pathData = {
  id: pathId, learnerId: 'u-l1', languageId: 'de', status: 'active', accompanied: true, origin: 'onboarding', startLevel: 'A0', targetLevel: 'A2',
  startDate: terms.startDate, targetDate: terms.targetDate, initialTargetDate: terms.targetDate, weeklyMinutes: 195, requiredMinutes: 2540,
  difficulty, placementAttemptId: 'pl1', paused: false, pausedAt: null, resumeDate: null, validatedRevision: 1, steps, availability: days,
  proposal: { number: 1, status: 'validated', overflowCount: 0, validatable: false, createdAt: day(-4, 10) }, sessions: [],
  contract: { current: null, pending: contract, engaged: false },
  permissions: { canEditAvailability: true, canValidate: false, canChangeObjective: false, canProposeContract: true, canDecideContract: true,
    canPause: true, canAddCourses: true, canAdvance: true },
};
const addition = { id: 'ad1', pathId, stepLevel: 'A1', sourceTrackVersionId: 'v-a1-2', sourceLevelCode: 'A1', moduleId: 'a1-zahlen',
  activityId: 'a1-zahlen-hoeren', title: 'Écouter les nombres', minutes: 12, placement: 'next', note: 'Pour revoir les nombres avant le marché.',
  addedBy: 't1', addedAt: day(-2, 9), removedAt: null, status: 'planned' };
const tier = (code, status, percent, lecture, ecoute) => ({ code, title: `Palier ${code}`, status, questionCount: 12, passPercent: 67,
  correct: percent === null ? null : Math.round(percent * 12 / 100), total: percent === null ? null : 12, percent,
  competences: percent === null ? null : { lecture: { correct: 0, total: 8, percent: lecture }, ecoute: { correct: 0, total: 4, percent: ecoute } } });
const placement = { id: 'pl1', learnerId: 'u-l1', languageId: 'de', testId: 'pt1', testNumber: 1, status: 'completed', currentTier: null,
  tiers: [tier('A1', 'failed', 42, 50, 25), tier('A2', 'locked', null), tier('B1', 'locked', null)], questions: [], savedAnswers: {},
  result: { placedLevel: 'A0', label: 'Débutant', summary: 'Vous débutez : votre parcours commencera par le niveau A1, pas à pas.', beyondTest: false, declaredBeginner: false },
  startedAt: day(-5, 9), completedAt: day(-5, 10), retakeAvailableAt: null };

function libraryLevel(code, versionId, current) {
  const folder = join(repo, 'content', 'de', code.toLowerCase());
  const modules = readdirSync(folder).filter((file) => /^\d\d-.*\.json$/.test(file)).sort().map((file, index) => {
    const module = JSON.parse(readFileSync(join(folder, file), 'utf8'));
    return { id: module.id, position: index + 1, title: module.title, objective: module.objective ?? '', vocabularyCount: module.vocabulary?.length ?? 0,
      activities: module.activities.map((activity, position) => ({ id: activity.id,
        kind: activity.kind === 'exercise' || activity.kind === 'mission' ? activity.kind : 'lesson',
        title: activity.title, estimatedMinutes: activity.estimatedMinutes, competences: [], lessonId: null,
        lastResult: current && index < 1 && position % 3 === 1 ? { correct: 5, total: 6, submittedAt: day(-2) } : null,
        toReview: current && index < 1 && position === 4 })) };
  });
  return { levelCode: code, levelTitle: `Allemand ${code}`, trackVersionId: versionId, number: 2, inPath: true, current, modules,
    practice: [{ kind: 'midterm', title: 'Bilan intermédiaire', available: true }, { kind: 'final', title: 'Examen blanc', available: false }] };
}
const library = { languageId: 'de', levels: [libraryLevel('A1', 'v-a1-2', true), libraryLevel('A2', 'v-a2-2', false)] };

const estimate = (body = {}) => {
  const target = body.targetDate ?? terms.targetDate;
  const weeksCount = Math.max(1, Math.round((new Date(target) - new Date(terms.startDate)) / (7 * 86_400_000)));
  const weekly = Math.ceil(2540 / weeksCount);
  const code = weekly <= 150 ? 'light' : weekly <= 300 ? 'moderate' : weekly <= 450 ? 'sustained' : weekly <= 630 ? 'intensive' : weekly <= 840 ? 'very_intensive' : 'unrealistic';
  const label = { light: 'Léger', moderate: 'Modéré', sustained: 'Soutenu', intensive: 'Intensif', very_intensive: 'Très intensif', unrealistic: 'Irréaliste' }[code];
  return { languageId: 'de', startLevel: body.startLevel ?? 'A0', targetLevel: body.targetLevel ?? 'A2', startDate: terms.startDate, targetDate: target,
    weeks: weeksCount, requiredMinutes: 2540, levels: [], requiredWeeklyMinutes: weekly,
    requiredDailyMinutes: { fiveDays: Math.ceil(weekly / 5), sevenDays: Math.ceil(weekly / 7) }, difficulty: { code, label, requiredWeeklyMinutes: weekly },
    bands: [], allowedTargets: ['A1', 'A2'], minTargetDate: iso(10), maxTargetDate: iso(700),
    suggestedAvailability: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, sessions: 1, minutes: Math.max(15, Math.ceil(weekly * 1.15 / 25) * 5) })) };
};

const newTeacher = { ...profiles.teacher, id: 't2', displayName: 'Lukas Braun', languageId: null, teacherId: null,
  teacherProfile: { languages: [], levels: [], maxLearners: null, gradingDelayHours: null, bio: '', onboardedAt: null } };

async function asNewTeacher(page) {
  await page.route('**/api/v1/me', (route) => route.fulfill({ json: newTeacher }));
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Bienvenue Lukas/ }).waitFor();
}

export const screens = [
  { name: 'parcours-prof-questions', role: 'teacher', path: '/espace', setup: async (page) => {
    await asNewTeacher(page);
    await page.getByRole('button', { name: 'Commencer' }).click();
    await page.getByRole('button', { name: 'Continuer' }).click();
  } },
  { name: 'parcours-prof-questions-recap', role: 'teacher', path: '/espace', setup: async (page) => {
    await asNewTeacher(page);
    await page.getByRole('button', { name: 'Commencer' }).click();
    for (let step = 0; step < 5; step++) await page.getByRole('button', { name: 'Continuer' }).click();
  } },
  { name: 'parcours-prof-accueil', role: 'teacher', path: '/espace' },
  { name: 'parcours-prof-contrats', role: 'teacher', path: '/espace/contrats' },
  { name: 'parcours-prof-contrat-fiche', role: 'teacher', path: `/espace/contrats?contrat=${pathId}` },
  { name: 'parcours-prof-contreproposition', role: 'teacher', path: `/espace/contrats?contrat=${pathId}`, setup: async (page) => {
    await page.getByRole('button', { name: 'Proposer un autre contrat' }).click();
    await page.getByRole('button', { name: '9 mois' }).click();
    await page.waitForTimeout(500);
  } },
  { name: 'parcours-prof-eleves', role: 'teacher', path: '/espace/eleves' },
  { name: 'parcours-prof-fiche', role: 'teacher', path: '/espace/eleves/u-l1?onglet=parcours' },
  { name: 'parcours-prof-ajout', role: 'teacher', path: '/espace/eleves/u-l1?onglet=parcours', setup: async (page) => {
    await page.getByRole('button', { name: 'Ajouter des cours' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: /Au café|Guten Appetit/ }).first().click().catch(() => {});
  } },
  { name: 'parcours-prof-invitation', role: 'teacher', path: '/espace/invitations',
    setup: (page) => page.getByRole('button', { name: 'Inviter un élève' }).click() },
  { name: 'parcours-visiteur-langues', role: 'visitor', path: '/',
    setup: (page) => page.locator('#langues').evaluate((node) => node.scrollIntoView()) },
];

export function api(role, method, rawPath, body) {
  const [path, query = ''] = rawPath.split('?');
  if (role === 'visitor' || role === 'learner') return undefined;
  if (path === '/learning/contracts/pending') return pending;
  if (path === '/learning/path') return query.includes('u-l1') ? pathData : null;
  if (path === `/learning/paths/${pathId}/proposal`) return proposal;
  if (path === `/learning/paths/${pathId}/contracts` && method === 'GET') return [contract];
  if (path === `/learning/paths/${pathId}/additions` && method === 'GET') return [addition];
  if (path === `/learning/paths/${pathId}/additions` && method === 'POST') {
    return { __status: 201, body: { addition: { ...addition, id: 'ad2', moduleId: body?.moduleId, activityId: body?.activityId ?? null, title: 'Cours ajouté' }, proposal: { ...proposal, status: 'proposed', validatable: true } } };
  }
  if (path === '/learning/paths/estimate') return estimate(body);
  if (path === '/assessments/placements/pl1') return placement;
  if (path === '/assessments/placements') return [{ id: 'pl1', languageId: 'de', status: 'completed', placedLevel: 'A0', startedAt: placement.startedAt, completedAt: placement.completedAt }];
  if (path === '/learning/library') return library;
  if (path === '/me/teacher-profile' && method === 'PUT') return { ...newTeacher, teacherProfile: { ...body, onboardedAt: day(0, 9) } };
  return undefined;
}
