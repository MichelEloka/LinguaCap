// Données de base de l'aperçu : profils, parcours A1 d'une élève (vrais contenus du module « Essen »), suivi
// professeur, catalogue et médiathèque. Les autres modules ajoutent leurs écrans et leurs routes.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
export const day = (offset, hour = 18) => { const date = new Date(); date.setDate(date.getDate() + offset); date.setHours(hour, 0, 0, 0); return date.toISOString(); };

export const profiles = {
  learner: { id: 'u-l1', displayName: 'Camille Martin', role: 'learner', permissions: [] },
  teacher: { id: 't1', displayName: 'Marie Weber', role: 'teacher', permissions: [] },
  staff: { id: 's1', displayName: 'Jonas Richter', role: 'staff', permissions: ['catalogue', 'correction'] },
  admin: { id: 'a1', displayName: 'Inès Morel', role: 'admin', permissions: [] },
};

const read = (path) => JSON.parse(readFileSync(join(repo, path), 'utf8'));
const levelA1 = read('content/de/a1/level.json');
/** Module A1 par identifiant : la V4 range ses modules dans des fichiers numérotés listés par level.json. */
export const contentModule = (id) => read(`content/de/a1/${levelA1.modules.find((item) => item.id === id).file}`);
const essen = contentModule('a1-essen');
const media = new Map(essen.media.map((item) => [item.key, item]));
export const mediaUrl = (key) => {
  const item = media.get(key);
  const audio = item ? item.kind === 'audio' : /-(audio|native|q\d+)$/.test(key);
  return audio ? `/__media/audio/${key}.mp3` : `/__media/images/${key}.${item?.photo ? 'jpg' : 'png'}`;
};

/**
 * Vue élève d'une question de contenu, pour tous les types de la V4 (sans corrigé) : identifiants simples pour les
 * jetons et les éléments à associer, affichés dans un ordre qui n'est jamais la solution.
 */
export function questionView(question) {
  const type = question.type ?? 'choice';
  const base = { id: question.id, type, prompt: question.prompt };
  if (type === 'fill') return { ...base, text: question.text, blanks: question.blanks.map((blank) => ({ id: blank.id, size: blank.size ?? 8, hint: blank.hint ?? null })) };
  if (type === 'order') {
    const tokens = question.answers[0].map((text, index) => ({ id: `k${String(index).padStart(6, '0')}`, text }));
    const shown = [...tokens].sort((a, b) => a.text.localeCompare(b.text, 'de'));
    if (shown.every((token, index) => token === tokens[index])) shown.push(shown.shift());
    return { ...base, tokens: shown };
  }
  if (type === 'match') {
    const right = question.pairs.map((pair, index) => ({ id: `r${index}`, text: pair.right })).sort((a, b) => a.text.localeCompare(b.text, 'de'));
    if (right.every((item, index) => item.id === `r${index}`)) right.push(right.shift());
    return { ...base, left: question.pairs.map((pair, index) => ({ id: `l${index}`, text: pair.left })), right };
  }
  if (type === 'dictation') return { ...base, wordCount: question.showWordCount ? question.accept[0].split(/\s+/).length : null };
  if (type === 'speak') return { ...base, text: question.text, threshold: question.threshold ?? (question.text.split(/\s+/).length <= 3 ? 80 : 75) };
  return { ...base, options: question.options.map((option) => ({ id: option.id, text: option.label })) };
}

/** Activités d'une séance construites à partir des vrais contenus (leçon, exercice, écoute). */
export function activitiesOf(ids, completed = 1) {
  return ids.map((id) => essen.activities.find((activity) => activity.id === id)).filter(Boolean).map((activity, index) => ({
    id: activity.id, kind: activity.kind, title: activity.title, estimatedMinutes: activity.estimatedMinutes,
    status: index < completed ? 'completed' : 'todo', state: {}, attemptId: null,
    lesson: { id: `a1-v2-${activity.id}`, title: activity.lesson.title, description: activity.lesson.description },
    transcript: index < completed ? 'Kellner : Guten Tag! Was möchten Sie trinken?\nPaula : Ich möchte einen Cappuccino, bitte.' : null,
    questions: (activity.questions ?? []).map(questionView), mission: null, contentVersionId: 'v-a1-2', contentActivityId: activity.id, reviewItems: null,
    placements: (activity.placements ?? []).map((placement, position) => ({
      position: position + 1, assetId: placement.media, assetVersion: 1, usage: placement.usage,
      alt: placement.alt ?? media.get(placement.media)?.alt ?? null, caption: placement.caption ?? null, decorative: Boolean(placement.decorative),
      questionId: placement.questionId ?? null, optionId: placement.optionId ?? null, transcriptAvailable: placement.usage === 'audio',
      url: mediaUrl(placement.media), mimeType: media.get(placement.media)?.kind === 'audio' ? 'audio/mpeg' : 'image/png',
    })),
  }));
}

const summary = (id, position, title, offset, status, minutes = 45) => ({
  id, position, title, dueAt: day(offset), status, completedAt: status === 'completed' ? day(offset, 12) : null, estimatedMinutes: minutes,
  activities: [
    { id: `${id}-a`, kind: 'lesson', title: 'Leçon', estimatedMinutes: 15, status: status === 'completed' ? 'completed' : 'todo' },
    { id: `${id}-b`, kind: 'exercise', title: 'Exercice', estimatedMinutes: 15, status: status === 'completed' ? 'completed' : 'todo' },
  ],
});
export const sessions = [
  summary('s1', 1, 'Hallo! Se saluer', -3, 'completed'), summary('s2', 2, 'Les nombres', -2, 'completed'),
  summary('s3', 3, 'Au marché', 0, 'in_progress'), summary('s4', 4, 'Au restaurant', 0, 'planned'),
  summary('s5', 5, 'Mes loisirs', 1, 'planned'), summary('s6', 6, 'Ma famille', -1, 'late'),
  summary('s7', 7, 'La ville', 2, 'planned'), summary('s8', 8, 'Bilan intermédiaire', 4, 'planned', 30),
];
export const goal = {
  startLevel: 'A0', targetLevel: 'A1', startDate: day(-4).slice(0, 10), targetDate: day(26).slice(0, 10), initialTargetDate: day(26).slice(0, 10),
  template: 'intensive', status: 'active', resumeDate: null, successCriteria: 'Obtenir au moins 60 % à l’examen blanc A1.',
  expectedCompetences: ['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'], prerequisiteLevel: null, prerequisiteMet: true,
  acquiredModules: ['a1-hallo'], diagnosticLessonId: 'a1-v2-diagnostic', diagnosticAttemptId: 'g0', diagnosticModules: ['a1-hallo'],
  diagnosticPrerequisite: null, startingPointConfirmedAt: day(-4), accompanied: true,
};
const availability = Array.from({ length: 7 }, (_, index) => ({ weekday: index + 1, sessions: 2, minutes: 45 }));
export const enrollment = {
  id: 'e1', levelCode: 'A1', trackVersionNumber: 2, assignedAt: day(-4), status: 'active', sessions, goal, availability,
  proposal: { number: 2, status: 'validated', overflowCount: 0, validatable: false }, supersededSessions: 1,
};
export const proposal = {
  number: 2, status: 'validated', startDate: goal.startDate, targetDate: goal.targetDate, availability, capacityMinutes: 2700,
  requiredMinutes: 1300, overflowCount: 0, overflow: [], suggestions: [], validatable: false,
  weeks: [{ start: day(-4).slice(0, 10), availableMinutes: 630, plannedMinutes: 540 }, { start: day(3).slice(0, 10), availableMinutes: 630, plannedMinutes: 450 }],
  sessions: sessions.map((session) => ({ date: session.dueAt.slice(0, 10), slot: 1, dueAt: session.dueAt, title: session.title, minutes: 45,
    items: [{ id: `${session.id}-a`, kind: 'lesson', title: session.title, minutes: 15 }] })),
};
const grade = (id, lessonId, correct, total, submittedAt) => ({ kind: 'quiz', id, lessonId, correct, total, submittedAt, sessionId: null,
  activityId: null, moduleScores: null, pending: 0, flagged: [], typed: false });
export const grades = [
  grade('g1', 'l1', 5, 6, day(-3, 11)), grade('g2', 'l2', 3, 6, day(-2, 11)), grade('g3', 'l3', 6, 6, day(-1, 11)), grade('g4', 'l4', 4, 5, day(0, 9)),
];
export const messages = [
  { id: 'm1', text: 'Bravo pour cette première séance ! Continue comme ça.', sentAt: day(-2, 9) },
  { id: 'm2', text: 'Pense à rattraper la séance « Ma famille » avant vendredi.', sentAt: day(-1, 9) },
];
export const alert = { id: 'al1', status: 'open', reason: 'Le bilan intermédiaire approche avec du retard (1 séance).', lateSessions: 1,
  nextMilestone: 'Bilan intermédiaire', nextMilestoneDueAt: day(4), midtermOverdue: false, openedAt: day(-1), closedAt: null, encouragedAt: null };
const learnerRow = (id, name, level, status, completed, extra = {}) => ({
  learnerId: id, profile: { id, displayName: name, teacherId: 't1' }, progress: { completedCount: completed, goal: { level } }, results: [],
  tracking: { enrollmentId: `e-${id}`, levelCode: level, goalStatus: status, nextDueAt: day(1), lateSessions: 0, pendingGrading: 0, alert: null,
    practiceMinutes: completed * 40, sessionsCompleted: completed, lastActivityAt: day(-1), ...extra },
});
export const overview = { freshness: { syncedAt: day(0, 8) }, learners: [
  learnerRow('u-l1', 'Camille Martin', 'A1', 'active', 2, { lateSessions: 1, alert, nextDueAt: day(0) }),
  learnerRow('u-l2', 'Yanis Benali', 'A2', 'awaiting_grading', 9, { pendingGrading: 1, nextDueAt: day(3) }),
  learnerRow('u-l3', 'Awa Diallo', 'A1', 'active', 4),
  learnerRow('u-l4', 'Léa Kaya', 'A2', 'validated', 21),
  learnerRow('u-l5', 'Tomás Rivera', 'A1', 'paused', 6),
] };
export const sheet = { profile: { id: 'u-l1', displayName: 'Camille Martin' }, enrollment, goal: { level: 'A1', targetDate: goal.targetDate }, results: grades,
  completedCount: 2, messages: messages.map((message) => ({ ...message, resumedAt: null })),
  tracking: { enrollmentId: 'e1', practiceMinutes: 95, lastActivityAt: day(-1), sessionsCompleted: 2, sessionsOnTime: 2, lateSessions: 1, pendingGrading: 0, alert, alerts: [alert] } };
export const levels = [
  { id: 'a1', code: 'A1', title: 'Allemand A1', description: 'Premiers pas', position: 1, status: 'published', prerequisiteLevelId: null, prerequisiteLevelCode: null,
    versions: [{ id: 'v-a1-2', number: 2, status: 'published', publishedAt: day(-1), retiredAt: null, updatedAt: day(-1) },
      { id: 'v-a1-1', number: 1, status: 'retired', publishedAt: day(-30), retiredAt: day(-1), updatedAt: day(-30) }] },
  { id: 'a2', code: 'A2', title: 'Allemand A2', description: 'Échanges du quotidien', position: 2, status: 'published', prerequisiteLevelId: 'a1', prerequisiteLevelCode: 'A1',
    versions: [{ id: 'v-a2-2', number: 2, status: 'published', publishedAt: day(-1), retiredAt: null, updatedAt: day(-1) }] },
  { id: 'b1', code: 'B1', title: 'Allemand B1', description: 'Raconter, expliquer, défendre un avis et agir dans la vie courante et au travail.', position: 3,
    status: 'published', prerequisiteLevelId: 'a2', prerequisiteLevelCode: 'A2',
    versions: [{ id: 'v-b1-1', number: 1, status: 'published', publishedAt: day(0, 9), retiredAt: null, updatedAt: day(0, 9) }] },
  { id: 'b2', code: 'B2', title: 'Allemand B2', description: 'Argumenter, nuancer et comprendre des textes complexes.', position: 4, status: 'draft',
    prerequisiteLevelId: 'b1', prerequisiteLevelCode: 'B1', versions: [] },
];
/**
 * Niveaux dynamiques (cours B1 et B2) : A1, A2 et B1 publiés, B2 en brouillon (« Bientôt »). GET /languages (connecté) liste
 * tous les niveaux du catalogue, GET /public/languages (sans compte) les seuls niveaux publiés.
 */
const languageLevel = (code, position, prerequisiteCode, published, plannedMinutes, moduleCount) => ({
  code, title: `Allemand ${code}`, published, trackVersionId: published ? `v-${code.toLowerCase()}-${code === 'B1' ? 1 : 2}` : null,
  plannedMinutes: published ? plannedMinutes : null, moduleCount: published ? moduleCount : 0, position, prerequisiteCode,
});
export const languages = [
  { id: 'de', name: 'Allemand', nativeName: 'Deutsch', status: 'available', position: 1, placementAvailable: true, placementTiers: ['A1', 'A2', 'B1'],
    levels: [languageLevel('A1', 1, null, true, 2596, 23), languageLevel('A2', 2, 'A1', true, 2410, 22),
      languageLevel('B1', 3, 'A2', true, 3540, 24), languageLevel('B2', 4, 'B1', false)] },
  { id: 'en', name: 'Anglais', nativeName: 'English', status: 'coming_soon', position: 2, placementAvailable: false, placementTiers: [], levels: [] },
];
export const publicLanguages = [{ id: 'de', name: 'Allemand', nativeName: 'Deutsch', position: 1,
  levels: languages[0].levels.filter((level) => level.published).map(({ code, title, position, moduleCount, plannedMinutes }) => ({ code, title, position, moduleCount, plannedMinutes })) }];
/** Modèles de rythme : durées par niveau publié (A1 et A2 calibrées, B1 par la formule : 6 mois et 2 mois). */
export const templates = [
  { id: 'standard', name: 'Standard', description: 'Une séance de 30 minutes du lundi au vendredi.', a1Duration: 'P5M', a2Duration: 'P5M',
    days: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, sessions: 1, minutes: 30 })),
    durations: [{ levelCode: 'A1', months: 5, plannedMinutes: 2596 }, { levelCode: 'A2', months: 5, plannedMinutes: 2410 }, { levelCode: 'B1', months: 6, plannedMinutes: 3540 }] },
  { id: 'intensive', name: 'Intensif', description: 'Deux séances de 45 minutes chaque jour ; durée selon le niveau.', a1Duration: 'P1M', a2Duration: 'P2M',
    days: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({ weekday, sessions: 2, minutes: 45 })),
    durations: [{ levelCode: 'A1', months: 1, plannedMinutes: 2596 }, { levelCode: 'A2', months: 2, plannedMinutes: 2410 }, { levelCode: 'B1', months: 2, plannedMinutes: 3540 }] },
];
export const assets = [...media.values()].slice(0, 10).map((item, index) => ({
  id: item.key, kind: item.kind, title: `${item.title} [${item.key}]`, mimeType: item.kind === 'audio' ? 'audio/mpeg' : 'image/png',
  alt: item.alt ?? null, transcript: item.kind === 'audio' ? 'Transcription' : null, credit: 'Deutsch im Blick · CC BY 4.0', source: 'Deutsch im Blick', license: 'CC BY 4.0',
  status: 'published', updatedAt: day(-index), versions: [{ version: 1, mimeType: 'image/png', sizeBytes: 120000, status: 'published', createdAt: day(-index) }],
}));
export const queue = [
  { id: 'x1', learnerId: 'u-l2', learnerName: 'Yanis Benali', kind: 'midterm', number: 1, levelCode: 'A2', title: 'Bilan intermédiaire A2', submittedAt: day(-1), dueAt: day(1), onTime: true },
  { id: 'x2', learnerId: 'u-l4', learnerName: 'Léa Kaya', kind: 'final', number: 1, levelCode: 'A2', title: 'Examen blanc A2', submittedAt: day(-2), dueAt: day(-3), onTime: false },
];
export const missions = [
  { id: 'm-1', activityId: 'a1-essen-sprechen', title: 'Mission : mes habitudes alimentaires', levelCode: 'A1', moduleId: 'a1-essen', status: 'reviewed',
    decision: 'validated', submittedAt: day(-2, 19), reviewedAt: day(-1, 9), sessionId: 's2', score: null, maxScore: null },
  { id: 'm-2', activityId: 'a1-hallo-sprechen', title: 'Mission : se présenter au groupe', levelCode: 'A1', moduleId: 'a1-hallo', status: 'submitted',
    decision: null, submittedAt: day(0, 8), reviewedAt: null, sessionId: 's3', score: null, maxScore: null },
];
export const reviews = [
  { kind: 'mission', id: 'm-2', learnerId: 'u-l1', learnerName: 'Camille Martin', title: 'Mission : se présenter au groupe', levelCode: 'A1', context: 'session', submittedAt: day(0, 8) },
  { kind: 'speech', id: 'sp-1', learnerId: 'u-l3', learnerName: 'Awa Diallo', title: 'Prononciation : « Ich möchte einen Kaffee, bitte. »', levelCode: 'A1', context: 'library', submittedAt: day(-1, 18) },
];
export const invitations = [
  { id: 'i1', email: 'lea.k@exemple.fr', displayName: 'Léa Kaya', role: 'learner', teacherId: 't1', teacherName: 'Marie Weber', invitedByName: 'Marie Weber',
    status: 'pending', sendCount: 1, createdAt: day(-1), lastSentAt: day(-1), expiresAt: day(6), acceptedAt: null },
  { id: 'i2', email: 'tomas.r@exemple.fr', displayName: 'Tomás Rivera', role: 'learner', teacherId: 't1', teacherName: 'Marie Weber', invitedByName: 'Marie Weber',
    status: 'accepted', sendCount: 2, createdAt: day(-9), lastSentAt: day(-7), expiresAt: day(-2), acceptedAt: day(-6) },
];

export const screens = [
  { name: 'eleve-accueil', role: 'learner', path: '/espace' },
  { name: 'eleve-planning', role: 'learner', path: '/espace/planning' },
  { name: 'eleve-resultats', role: 'learner', path: '/espace/resultats' },
  { name: 'eleve-messages', role: 'learner', path: '/espace/messages' },
  { name: 'eleve-seance', role: 'learner', path: '/espace/seance/s3' },
  { name: 'prof-accueil', role: 'teacher', path: '/espace' },
  { name: 'prof-eleves', role: 'teacher', path: '/espace/eleves' },
  { name: 'prof-alertes', role: 'teacher', path: '/espace/alertes' },
  { name: 'prof-fiche', role: 'teacher', path: '/espace/eleves/u-l1' },
  { name: 'prof-invitations', role: 'teacher', path: '/espace/invitations' },
  { name: 'prof-corrections', role: 'teacher', path: '/espace/corrections' },
  { name: 'equipe-accueil', role: 'staff', path: '/espace' },
  { name: 'equipe-catalogue', role: 'staff', path: '/espace/catalogue' },
  { name: 'equipe-mediatheque', role: 'staff', path: '/espace/mediatheque' },
  { name: 'visiteur-connexion', role: 'visitor', path: '/connexion' },
  { name: 'visiteur-accueil', role: 'visitor', path: '/' },
];

export function api(role, method, rawPath) {
  const path = rawPath.split('?')[0];
  if (path === '/me') return profiles[role] ?? { __status: 401, body: { code: 'UNAUTHENTICATED', message: 'Session requise.' } };
  if (path === '/health') return { status: 'ok' };
  if (path === '/learning/enrollment') return enrollment;
  if (path === '/assessments/results') return grades;
  if (path === '/tracking/messages') return messages;
  if (/^\/learning\/sessions\/[^/]+$/.test(path)) {
    return { session: sessions[2], enrollmentId: 'e1', levelCode: 'A1', activities: activitiesOf(['a1-essen-wortschatz', 'a1-essen-dialog', 'a1-essen-esskultur', 'a1-essen-obst-hoeren']) };
  }
  if (/\/progress$/.test(path)) return { session: sessions[2], enrollmentId: 'e1', levelCode: 'A1', activities: activitiesOf(['a1-essen-wortschatz', 'a1-essen-dialog', 'a1-essen-esskultur']) };
  if (/^\/learning\/enrollments\/[^/]+\/proposal$/.test(path)) return proposal;
  if (path === '/learning/templates') return templates;
  if (path === '/languages') return languages;
  if (path === '/public/languages') return publicLanguages;
  if (path === '/tracking/overview') return overview;
  if (/^\/tracking\/learners\//.test(path)) return sheet;
  if (path === '/assessments/grading') return queue;
  // V4 : missions de l'élève et file des missions et répétitions (écrans détaillés dans 90-contenus-v4.mjs).
  if (path === '/assessments/missions' && method === 'GET') return missions;
  if (path === '/assessments/reviews') return role === 'learner' ? undefined : reviews;
  if (path === '/invitations') return invitations;
  if (path === '/catalogue/levels') return levels;
  if (path === '/media') return assets;
  if (path === '/media/uploads') return [];
  if (path === '/tracks') return [];
  return undefined;
}
