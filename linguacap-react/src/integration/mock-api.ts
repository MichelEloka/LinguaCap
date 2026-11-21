/*
 * Simulateur en mémoire de l'API LinguaCap, pour développer les écrans sans services (`npm run dev:mock`).
 *
 * - Chargé seulement en développement quand VITE_LINGUACAP_MOCK=1 (voir api.ts) : jamais dans un build.
 * - Rôle choisi par `?as=eleve-autonome | eleve-suivi | professeur | professeur-nouveau | admin | equipe`, ou à la connexion
 *   par l'adresse saisie (« prof… », « nouveau… », « admin… », « suivi… », « equipe… », sinon élève autonome).
 * - État gardé en mémoire et recopié dans sessionStorage (une reprise de Vite ne le perd pas) ; `?reset` repart des données
 *   initiales, `window.linguacapMock.reset()` aussi. Se déconnecter puis se reconnecter sous un autre rôle garde l'état :
 *   un contrat envoyé par l'élève suivi apparaît chez le professeur.
 * - Couvre les routes de l'incrément « Parcours » (formes de v2.ts) et les routes historiques utiles aux écrans
 *   (profil, inscription, séances, résultats, examens simplifiés, suivi, invitations, comptes). Une route absente répond
 *   404 « Route non simulée ».
 */
import type {
  Addition, AdditionCreated, AdditionRemoved, CompetenceScore, Contract, ContractProposer, ContractStatus, ContractTerms,
  CurrentProfileV2, Day, Difficulty, DifficultyBand, DifficultyCode, Estimate, ExamKind, Language, LevelCode, LevelSpan, Library,
  LibraryActivity, OnboardingState, OnboardingStep, PathPermissions, PathProposal, PathSession, PathStatus, PathStep, PathView,
  PendingContract, PlacementAttemptStatus, PlacementCompetence, PlacementQuestionContent, PlacementSummary, PlacementTestDocument,
  PlacementTestSummary, PlacementTier, PlacementTierContent, PlacementView, PlanItem, PlannedSession, PracticePart, PracticeSummary,
  CourseCreationMode, PracticeView, StartLevel, Suggestion, TeacherCard, TeacherOnboardingStats, TeacherProfile,
} from './v2';
import { difficultyCodes, difficultyLabels, difficultyThresholds, gradingDelays, levelCodes, levelLabels, PLACEMENT_DONT_KNOW } from './v2';
import { findLanguage, languages as staticLanguages } from '../domain/languages';

type Method = 'GET' | 'POST' | 'PUT';
type Role = 'learner' | 'teacher' | 'admin' | 'staff';
type Permission = 'catalogue' | 'correction';
type Json = Record<string, unknown>;

class HttpError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); }
}
const invalid = (message: string) => new HttpError(400, 'INVALID_INPUT', message);
const forbidden = (message = 'Cette action n’est pas autorisée pour votre profil.') => new HttpError(403, 'FORBIDDEN', message);
const notFound = (message = 'Élément introuvable.') => new HttpError(404, 'NOT_FOUND', message);
const conflict = (message: string) => new HttpError(409, 'CONFLICT', message);

// ---------------------------------------------------------------------------------------------------------------------
// Dates (jours locaux « AAAA-MM-JJ »)
// ---------------------------------------------------------------------------------------------------------------------

const pad = (value: number) => String(value).padStart(2, '0');
const isoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
function parseDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}
const today = () => isoDate(new Date());
function addDays(iso: string, days: number) {
  const date = parseDate(iso);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}
const daysBetween = (from: string, to: string) => Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);
const weekdayOf = (iso: string) => ((parseDate(iso).getDay() + 6) % 7) + 1;
const mondayOf = (iso: string) => addDays(iso, 1 - weekdayOf(iso));
function at(iso: string, hour: number) {
  const date = parseDate(iso);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}
const now = () => new Date().toISOString();
const inHours = (iso: string, hours: number) => new Date(new Date(iso).getTime() + hours * 3_600_000).toISOString();
const isDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && isoDate(parseDate(value)) === value;
const longDate = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(iso));
const longMoment = (iso: string) => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  .format(new Date(iso));

const fixedId = (n: number) => `00000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;
const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID()
  : `${Date.now().toString(16).padStart(8, '0').slice(-8)}-0000-4000-8000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`);
const shortHex = (id: string) => id.replace(/-/g, '').slice(0, 6);
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}
const percentOf = (correct: number, total: number) => (total ? Math.round((correct * 100) / total) : 0);
const roundUp5 = (minutes: number) => Math.ceil(minutes / 5) * 5;

/** Son muet d'une seconde : les sons du test et des examens ne sont pas servis par le simulateur. */
let silentAudio: string | null | undefined;
function silentAudioUrl(): string | null {
  if (silentAudio !== undefined) return silentAudio;
  if (typeof URL === 'undefined' || typeof Blob === 'undefined' || !('createObjectURL' in URL)) return (silentAudio = null);
  const rate = 8000;
  const bytes = new Uint8Array(44 + rate);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  text(0, 'RIFF'); view.setUint32(4, 36 + rate, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true);
  view.setUint32(28, rate, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true); text(36, 'data'); view.setUint32(40, rate, true);
  bytes.fill(128, 44);
  return (silentAudio = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' })));
}

// ---------------------------------------------------------------------------------------------------------------------
// Contenus (extraits des vrais modules A1 et A2, voir la fin du fichier)
// ---------------------------------------------------------------------------------------------------------------------

interface MockModule {
  id: string; title: string; objective: string; prerequisites: string[];
  activities: [string, 'lesson' | 'exercise', string, number, string[]][];
}
interface MockLevelContent {
  code: LevelCode; settings: { reviewMinutes: number; midtermMinutes: number; finalMinutes: number; passPercent: number }; modules: MockModule[];
}
interface MockQuestion { id: string; prompt: string; options: { id: string; text: string }[]; answer: string }
interface MockActivityDetail { lesson: { title: string; description: string } | null; transcript: string | null; questions: MockQuestion[] }

const VERSIONS: Record<string, { id: string; number: number; publishedAt: string }> = {
  A1: { id: 'b1000000-0000-4000-8000-0000000000a1', number: 2, publishedAt: '2026-11-12T09:00:00.000Z' },
  A2: { id: 'b1000000-0000-4000-8000-0000000000a2', number: 2, publishedAt: '2026-11-12T09:00:00.000Z' },
};
const MIDTERM = 'bilan-intermediaire';
const FINAL = 'examen-blanc';
const levelTitle = (code: string) => `Allemand ${code}`;

function levelContent(code: string): MockLevelContent | undefined {
  return CONTENT.find((level) => level.code === code);
}
function versionLevel(versionId: string): MockLevelContent | undefined {
  const code = Object.entries(VERSIONS).find(([, version]) => version.id === versionId)?.[0];
  return code ? levelContent(code) : undefined;
}
function findActivity(level: MockLevelContent, activityId: string) {
  for (const module of level.modules) {
    const found = module.activities.find(([id]) => id === activityId);
    if (found) return { module, activity: found };
  }
  return undefined;
}
/** Minutes prévues pour un niveau complet : activités, révisions, bilan intermédiaire et examen blanc. */
function plannedMinutes(code: string): number {
  const level = levelContent(code);
  if (!level) return 0;
  const activities = level.modules.reduce((sum, module) => sum + module.activities.reduce((total, [, , , minutes]) => total + minutes, 0), 0);
  return activities + level.modules.length * level.settings.reviewMinutes + level.settings.midtermMinutes + level.settings.finalMinutes;
}
const publishedLevels = (): LevelCode[] => levelCodes.filter((code) => VERSIONS[code]);
const rankOf = (code: string) => ['A0', ...levelCodes].indexOf(code as StartLevel);
/** Cibles autorisées : niveaux publiés consécutifs au-dessus du niveau de départ. */
function allowedTargets(start: StartLevel): LevelCode[] {
  const targets: LevelCode[] = [];
  for (const code of levelCodes.slice(rankOf(start))) {
    if (!VERSIONS[code]) break;
    targets.push(code);
  }
  return targets;
}
const levelsBetween = (start: StartLevel, target: LevelCode) => levelCodes.filter((code) => rankOf(code) > rankOf(start) && rankOf(code) <= rankOf(target));

// ---------------------------------------------------------------------------------------------------------------------
// État
// ---------------------------------------------------------------------------------------------------------------------

interface UserRec {
  id: string; displayName: string; email: string; role: Role; permissions: Permission[]; teacherId: string | null; reviewerId: string | null;
  languageId: string | null; teacherProfile: TeacherProfile | null; status: 'active' | 'disabled'; createdAt: string; lastSeenAt: string | null;
}
interface InvitationRec {
  id: string; email: string; displayName: string; role: Role; teacherId: string | null; languageId: string | null; invitedBy: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'; sendCount: number; createdAt: string; lastSentAt: string | null; expiresAt: string;
  acceptedAt: string | null; cancelledAt: string | null;
}
interface PlacementQuestionRec {
  tier: LevelCode; id: string; competence: PlacementCompetence; prompt: string; options: { id: string; text: string }[]; answer: string; audio: boolean;
}
interface TierRec {
  code: LevelCode; title: string; passPercent: number; minCompetencePercent: number; status: PlacementTier['status'];
  correct: number | null; total: number | null; percent: number | null; competences: PlacementTier['competences'];
}
interface PlacementRec {
  id: string; learnerId: string; languageId: string; testId: string | null; testNumber: number | null; status: PlacementAttemptStatus;
  currentTier: LevelCode | null; tiers: TierRec[]; questions: PlacementQuestionRec[]; savedAnswers: Record<string, string>;
  submitKeys: Record<string, string>; declaredBeginner: boolean; placedLevel: StartLevel | null; startedAt: string; completedAt: string | null;
}
interface StepRec {
  id: string; position: number; levelCode: LevelCode; trackVersionId: string; trackVersionNumber: number; status: PathStep['status'];
  enrollmentId: string | null; goalStatus: string | null; activatedAt: string | null; completedAt: string | null; finalDecision: PathStep['finalDecision'];
}
interface LiveSession {
  id: string; enrollmentId: string; stepPosition: number; levelCode: LevelCode; date: string; slot: number; dueAt: string; moduleId: string;
  title: string; items: PlanItem[]; completedAt: string | null;
}
interface ContractRec {
  number: number; status: ContractStatus; proposedBy: ContractProposer; proposerId: string | null; terms: ContractTerms; note: string | null;
  createdAt: string; decidedAt: string | null; decidedBy: string | null; decisionNote: string | null;
}
interface AdditionRec {
  id: string; stepLevel: LevelCode; sourceTrackVersionId: string; sourceLevelCode: LevelCode; moduleId: string; activityId: string | null;
  title: string; minutes: number; placement: 'next' | 'end_of_level'; note: string | null; addedBy: string; addedAt: string;
  removedAt: string | null; removedBy: string | null;
}
interface ProgressRec { status: 'started' | 'completed'; completedAt: string | null; state: Json }
interface PathRec {
  id: string; learnerId: string; languageId: string; status: PathStatus; startLevel: StartLevel; targetLevel: LevelCode; startDate: string;
  targetDate: string; initialTargetDate: string; weeklyMinutes: number; placementAttemptId: string | null;
  origin: PathView['origin']; paused: boolean; pausedAt: string | null; resumeDate: string | null; validatedRevision: number;
  revisionCounter: number; availability: Day[]; availabilityConfirmed: boolean; steps: StepRec[]; proposal: PathProposal | null;
  validatedPlan: PathProposal | null; liveSessions: LiveSession[]; contracts: ContractRec[]; additions: AdditionRec[];
  progress: Record<string, ProgressRec>; createdBy: string; createdAt: string; endedAt: string | null;
}
interface PracticeRec {
  id: string; learnerId: string; trackVersionId: string; levelCode: LevelCode; kind: ExamKind; status: 'in_progress' | 'submitted';
  answers: Record<string, Record<string, string>>; submitKeys: string[]; result: PracticeView['result']; startedAt: string; submittedAt: string | null;
}
interface GradeRec {
  id: string; learnerId: string; lessonId: string; activityId: string | null; sessionId: string | null; correct: number; total: number; submittedAt: string;
}
interface ExamRec {
  id: string; enrollmentId: string; learnerId: string; levelCode: LevelCode; kind: ExamKind; number: number; status: 'in_progress' | 'submitted' | 'graded';
  answers: Record<string, Record<string, string>>; texts: Record<string, string>; startedAt: string; submittedAt: string | null; dueAt: string | null;
  submitKeys: string[]; result: Json | null;
}
interface MessageRec { id: string; learnerId: string; authorId: string; text: string; sentAt: string }
interface TeacherResponseRec { teacherId: string; date: string; accepting: boolean; mode: CourseCreationMode }
interface State {
  version: number; users: UserRec[]; invitations: InvitationRec[]; placementTests: PlacementTestDocument[]; placements: PlacementRec[];
  paths: PathRec[]; practice: PracticeRec[]; grades: GradeRec[]; exams: ExamRec[]; messages: MessageRec[];
  teacherResponses?: TeacherResponseRec[];
}

const STATE_VERSION = 1;
const STORAGE_KEY = 'linguacap-mock-state';
const IDS = {
  autonome: fixedId(0x101), suivi: fixedId(0x102), yanis: fixedId(0x103), awa: fixedId(0x104),
  weber: fixedId(0x201), braun: fixedId(0x202), morel: fixedId(0x301), richter: fixedId(0x401),
  test: 'c1000000-0000-4000-8000-000000000001',
};
/** Rôle du simulateur → compte simulé. */
export const mockAccounts: Record<string, string> = {
  'eleve-autonome': IDS.autonome, 'eleve-suivi': IDS.suivi, professeur: IDS.weber, 'professeur-nouveau': IDS.braun,
  admin: IDS.morel, equipe: IDS.richter,
};

let current: State | null = null;

function state(): State {
  if (current) return current;
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.has('reset')) window.sessionStorage.removeItem(STORAGE_KEY);
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? 'null') as State | null;
      if (saved?.version === STATE_VERSION) current = saved;
    } catch { /* état illisible : on repart des données initiales */ }
    (window as unknown as { linguacapMock: unknown }).linguacapMock = {
      state: () => current,
      reset() { window.sessionStorage.removeItem(STORAGE_KEY); window.location.reload(); },
    };
  }
  current ??= seed();
  return current;
}
function save() {
  if (typeof window !== 'undefined' && current) {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch { /* stockage plein : l'état reste en mémoire */ }
  }
}

const userById = (id: string) => state().users.find((user) => user.id === id);
function learnerById(id: string) {
  const user = userById(id);
  if (!user || user.role !== 'learner') throw notFound('Élève introuvable.');
  return user;
}
const isReferent = (actor: UserRec, learner: UserRec) => actor.role === 'admin' || (actor.role === 'teacher' && learner.teacherId === actor.id);
const canRead = (actor: UserRec, learner: UserRec) => actor.id === learner.id || isReferent(actor, learner);
function readable(actor: UserRec, learnerId: string) {
  const learner = learnerById(learnerId);
  if (!canRead(actor, learner)) throw forbidden('Cet élève n’est pas suivi par votre compte.');
  return learner;
}
/** Élève visé par une lecture : l'élève connecté, ou ?learnerId= pour son professeur ou l'administration. */
function targetLearner(actor: UserRec, query: URLSearchParams) {
  const learnerId = query.get('learnerId');
  if (learnerId) return readable(actor, learnerId);
  if (actor.role !== 'learner') throw invalid('Précisez l’élève consulté (learnerId).');
  return actor;
}
const requireLearner = (actor: UserRec) => { if (actor.role !== 'learner') throw forbidden('Cette action est réservée aux élèves.'); };
const canEditCatalogue = (actor: UserRec) => actor.role === 'admin' || actor.permissions.includes('catalogue');

// ---------------------------------------------------------------------------------------------------------------------
// Profils
// ---------------------------------------------------------------------------------------------------------------------

function profileOf(user: UserRec): CurrentProfileV2 {
  return { id: user.id, displayName: user.displayName, role: user.role, permissions: user.permissions, languageId: user.languageId,
    teacherId: user.teacherId, teacherProfile: user.teacherProfile };
}
const learnerRow = (user: UserRec) => ({ id: user.id, displayName: user.displayName, role: user.role, teacherId: user.teacherId, languageId: user.languageId });

function chooseLanguage(actor: UserRec, body: Json) {
  requireLearner(actor);
  const languageId = body.languageId;
  if (typeof languageId !== 'string' || !/^[a-z]{2}$/.test(languageId) || !findLanguage(languageId)) throw invalid('Langue inconnue.');
  if (actor.teacherId) throw forbidden('Votre langue a été choisie par votre professeur.');
  if (findLanguage(languageId)?.status !== 'available') throw conflict('Cette langue ouvrira bientôt : choisissez une langue disponible.');
  if (openPath(actor.id)) throw conflict('Un parcours est déjà en cours dans cette langue.');
  actor.languageId = languageId;
  return profileOf(actor);
}

function saveTeacherProfile(actor: UserRec, body: Json) {
  if (actor.role !== 'teacher') throw forbidden('Ce questionnaire est réservé aux professeurs.');
  const languages = Array.isArray(body.languages) ? body.languages : [];
  const levels = Array.isArray(body.levels) ? body.levels : [];
  if (!languages.length || languages.some((id) => typeof id !== 'string' || !findLanguage(id))) throw invalid('Choisissez au moins une langue connue.');
  if (languages.some((id) => findLanguage(String(id))?.status !== 'available')) throw conflict('Seules les langues ouvertes peuvent être enseignées pour le moment.');
  if (!levels.length || levels.some((code) => !levelCodes.includes(code as LevelCode))) throw invalid('Choisissez au moins un niveau entre A1 et C2.');
  const maxLearners = body.maxLearners ?? null;
  if (maxLearners !== null && (!Number.isInteger(maxLearners) || Number(maxLearners) < 1 || Number(maxLearners) > 500)) {
    throw invalid('Le nombre d’élèves doit être compris entre 1 et 500.');
  }
  const delay = body.gradingDelayHours ?? null;
  if (delay !== null && !gradingDelays.includes(delay as 24)) throw invalid('Délai de correction inconnu.');
  const bio = typeof body.bio === 'string' ? body.bio.trim() : actor.teacherProfile?.bio ?? '';
  if (bio.length > 500) throw invalid('La présentation ne doit pas dépasser 500 caractères.');
  const newAnswers = 'acceptingNewStudents' in body || 'courseCreationMode' in body;
  let acceptingNewStudents = actor.teacherProfile?.acceptingNewStudents ?? null;
  let courseCreationMode = actor.teacherProfile?.courseCreationMode ?? null;
  if (newAnswers) {
    if (typeof body.acceptingNewStudents !== 'boolean' || (body.courseCreationMode !== 'self' && body.courseCreationMode !== 'linguacap')) {
      throw invalid('Renseignez la disponibilité et le mode de construction des cours.');
    }
    acceptingNewStudents = body.acceptingNewStudents;
    courseCreationMode = body.courseCreationMode;
    const date = parisDate.format(new Date());
    const data = state();
    const answers = data.teacherResponses ?? [];
    data.teacherResponses = answers.filter((item) => item.teacherId !== actor.id || item.date !== date);
    data.teacherResponses.push({ teacherId: actor.id, date, accepting: acceptingNewStudents, mode: courseCreationMode });
  }
  actor.teacherProfile = {
    languages: [...new Set(languages.map(String))], levels: levelCodes.filter((code) => levels.includes(code)),
    maxLearners: maxLearners as number | null, gradingDelayHours: delay as TeacherProfile['gradingDelayHours'], bio,
    onboardedAt: actor.teacherProfile?.onboardedAt ?? now(),
    acceptingNewStudents, courseCreationMode,
  };
  return profileOf(actor);
}

function teacherCard(actor: UserRec): TeacherCard | null {
  requireLearner(actor);
  const teacher = actor.teacherId ? userById(actor.teacherId) : undefined;
  if (!teacher) return null;
  return { id: teacher.id, displayName: teacher.displayName, bio: teacher.teacherProfile?.bio ?? '',
    gradingDelayHours: teacher.teacherProfile?.gradingDelayHours ?? null, languages: teacher.teacherProfile?.languages ?? [] };
}

// ---------------------------------------------------------------------------------------------------------------------
// Langues et banque du test de niveau
// ---------------------------------------------------------------------------------------------------------------------

function languagesView(): Language[] {
  return staticLanguages.map((language) => ({
    id: language.id, name: language.name, nativeName: language.nativeName, status: language.status, position: language.position,
    placementAvailable: language.id === 'de' && state().placementTests.some((test) => test.languageId === 'de' && test.status === 'published'),
    levels: language.id === 'de' ? levelCodes.map((code) => ({
      code, title: levelTitle(code), published: Boolean(VERSIONS[code]), trackVersionId: VERSIONS[code]?.id ?? null,
      plannedMinutes: VERSIONS[code] ? plannedMinutes(code) : null, moduleCount: levelContent(code)?.modules.length ?? 0,
    })) : [],
  }));
}

const questionCount = (test: PlacementTestDocument) => test.tiers.reduce((sum, tier) => sum + tier.questions.length, 0);
const testSummary = (test: PlacementTestDocument): PlacementTestSummary => ({
  id: test.id, languageId: test.languageId, number: test.number, status: test.status, title: test.title, questionCount: questionCount(test),
  updatedAt: test.updatedAt, publishedAt: test.publishedAt,
});
function findTest(id: string) {
  const test = state().placementTests.find((item) => item.id === id);
  if (!test) throw notFound('Banque de test introuvable.');
  return test;
}
function placementChecks(test: PlacementTestDocument) {
  const issues: { path: string; message: string }[] = [];
  if (!test.title.trim()) issues.push({ path: 'title', message: 'Donnez un titre à la banque.' });
  if (!test.tiers.length) issues.push({ path: 'tiers', message: 'Ajoutez au moins un palier.' });
  test.tiers.forEach((tier, tierIndex) => {
    const base = `tiers[${tierIndex}]`;
    if (tier.questions.length < tier.drawCount) {
      issues.push({ path: `${base}.questions`, message: `Le palier ${tier.code} doit contenir au moins ${tier.drawCount} questions.` });
    }
    tier.questions.forEach((question, index) => {
      const path = `${base}.questions[${index}]`;
      if (!question.prompt.trim()) issues.push({ path: `${path}.prompt`, message: 'La consigne est vide.' });
      if (question.options.length < 2) issues.push({ path: `${path}.options`, message: 'Prévoyez au moins deux choix.' });
      if (question.options.filter((option) => option.correct).length !== 1) issues.push({ path: `${path}.options`, message: 'Une seule bonne réponse est attendue.' });
      if (question.competence === 'ecoute' && !question.placements.some((placement) => placement.usage === 'audio')) {
        issues.push({ path: `${path}.placements`, message: 'Une question d’écoute a besoin d’un son.' });
      }
    });
  });
  return { publishable: issues.length === 0, issues };
}
function createPlacementTest(actor: UserRec, body: Json) {
  if (!canEditCatalogue(actor)) throw forbidden('Réservé aux éditeurs du catalogue.');
  const languageId = String(body.languageId ?? '');
  if (!findLanguage(languageId)) throw invalid('Langue inconnue.');
  const source = typeof body.fromTestId === 'string' ? findTest(body.fromTestId) : undefined;
  const number = Math.max(0, ...state().placementTests.filter((test) => test.languageId === languageId).map((test) => test.number)) + 1;
  const test: PlacementTestDocument = {
    id: newId(), languageId, number, status: 'draft', updatedAt: now(), publishedAt: null,
    title: source?.title ?? `Test de niveau ${findLanguage(languageId)?.name.toLowerCase() ?? languageId}`,
    description: source?.description ?? '', tiers: structuredClone(source?.tiers ?? []),
  };
  state().placementTests.push(test);
  return { status: 201, body: test };
}
function updatePlacementTest(actor: UserRec, id: string, body: Json) {
  if (!canEditCatalogue(actor)) throw forbidden('Réservé aux éditeurs du catalogue.');
  const test = findTest(id);
  if (test.status !== 'draft') throw conflict('Seul un brouillon peut être modifié : créez un nouveau brouillon à partir de cette banque.');
  if (typeof body.title !== 'string' || typeof body.description !== 'string' || !Array.isArray(body.tiers)) throw invalid('Contenu de banque invalide.');
  test.title = body.title.slice(0, 120);
  test.description = body.description.slice(0, 2000);
  test.tiers = body.tiers as PlacementTierContent[];
  test.updatedAt = now();
  return { test, checks: placementChecks(test) };
}
function publishPlacementTest(actor: UserRec, id: string) {
  if (!canEditCatalogue(actor)) throw forbidden('Réservé aux éditeurs du catalogue.');
  const test = findTest(id);
  if (test.status !== 'draft') throw conflict('Cette banque est déjà publiée ou retirée.');
  const checks = placementChecks(test);
  if (!checks.publishable) throw conflict(`La banque n’est pas publiable : ${checks.issues[0].message}`);
  for (const other of state().placementTests) {
    if (other.languageId === test.languageId && other.status === 'published') { other.status = 'retired'; other.updatedAt = now(); }
  }
  test.status = 'published';
  test.publishedAt = now();
  test.updatedAt = now();
  const media = new Map<string, { assetId: string; version: number }>();
  for (const tier of test.tiers) for (const question of tier.questions) for (const placement of question.placements) {
    media.set(`${placement.assetId}@${placement.assetVersion}`, { assetId: placement.assetId, version: placement.assetVersion });
  }
  return { test: testSummary(test), media: [...media.values()] };
}

// ---------------------------------------------------------------------------------------------------------------------
// Test de niveau
// ---------------------------------------------------------------------------------------------------------------------

const RESULTS: Record<StartLevel, string> = {
  A0: 'Vous débutez : votre parcours commencera par le niveau A1, pas à pas.',
  A1: 'Vous comprenez des phrases simples du quotidien : vous pouvez viser le niveau A2.',
  A2: 'Vous vous débrouillez dans les situations courantes : le niveau B1 est votre prochaine étape.',
  B1: 'Vous comprenez l’essentiel de textes et de conversations variés : bravo !',
  B2: 'Niveau avancé.', C1: 'Niveau autonome.', C2: 'Niveau maîtrise.',
};

function placementView(attempt: PlacementRec, actor: UserRec): PlacementView {
  const owner = actor.id === attempt.learnerId;
  const audio = silentAudioUrl();
  const questions = owner && attempt.status === 'in_progress'
    ? attempt.questions.filter((question) => question.tier === attempt.currentTier).map((question) => ({
      id: question.id, competence: question.competence, prompt: question.prompt, options: question.options,
      placements: question.audio ? [{ position: 1, usage: 'audio' as const, url: audio, mimeType: audio ? 'audio/wav' : null, alt: null, caption: null }] : [],
    }))
    : [];
  const placed = attempt.placedLevel;
  return {
    id: attempt.id, learnerId: attempt.learnerId, languageId: attempt.languageId, testId: attempt.testId, testNumber: attempt.testNumber,
    status: attempt.status, currentTier: attempt.currentTier,
    tiers: attempt.tiers.map((tier) => ({ code: tier.code, title: tier.title, status: tier.status,
      questionCount: attempt.questions.filter((question) => question.tier === tier.code).length, passPercent: tier.passPercent,
      correct: tier.correct, total: tier.total, percent: tier.percent, competences: tier.competences })),
    questions,
    savedAnswers: owner ? Object.fromEntries(Object.entries(attempt.savedAnswers)
      .filter(([questionId]) => attempt.questions.some((question) => question.id === questionId && question.tier === attempt.currentTier))) : {},
    result: attempt.status === 'completed' && placed ? {
      placedLevel: placed, label: levelLabels[placed], summary: attempt.declaredBeginner
        ? 'Vous avez indiqué n’avoir jamais étudié la langue : votre parcours commencera par le niveau A1.' : RESULTS[placed],
      beyondTest: attempt.tiers.length > 0 && attempt.tiers.every((tier) => tier.status === 'passed'), declaredBeginner: attempt.declaredBeginner,
    } : null,
    startedAt: attempt.startedAt, completedAt: attempt.completedAt,
    retakeAvailableAt: attempt.status === 'completed' && attempt.completedAt && !attempt.declaredBeginner ? inHours(attempt.completedAt, 24) : null,
  };
}
const placementSummary = (attempt: PlacementRec): PlacementSummary => ({
  id: attempt.id, languageId: attempt.languageId, status: attempt.status, placedLevel: attempt.placedLevel,
  startedAt: attempt.startedAt, completedAt: attempt.completedAt,
});
const learnerPlacements = (learnerId: string) => state().placements.filter((attempt) => attempt.learnerId === learnerId)
  .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
const lastCompletedPlacement = (learnerId: string) => learnerPlacements(learnerId).find((attempt) => attempt.status === 'completed');

function findPlacement(id: string) {
  const attempt = state().placements.find((item) => item.id === id);
  if (!attempt) throw notFound('Tentative introuvable.');
  return attempt;
}

/** Tirage figé de toutes les questions des paliers, dans un ordre et avec des choix mélangés. */
function drawPlacement(test: PlacementTestDocument): PlacementQuestionRec[] {
  return test.tiers.flatMap((tier) => {
    const lecture = shuffle(tier.questions.filter((question) => question.competence === 'lecture'));
    const ecoute = shuffle(tier.questions.filter((question) => question.competence === 'ecoute'));
    const listening = Math.min(ecoute.length, Math.round(tier.drawCount / 3));
    const drawn = shuffle([...lecture.slice(0, tier.drawCount - listening), ...ecoute.slice(0, listening)]);
    return drawn.map((question: PlacementQuestionContent) => ({
      tier: tier.code, id: question.id, competence: question.competence, prompt: question.prompt,
      options: shuffle(question.options).map((option) => ({ id: option.id, text: option.label })),
      answer: question.options.find((option) => option.correct)?.id ?? '', audio: question.placements.some((placement) => placement.usage === 'audio'),
    }));
  });
}

function startPlacement(actor: UserRec, body: Json) {
  requireLearner(actor);
  const languageId = typeof body.languageId === 'string' ? body.languageId : actor.languageId;
  if (!languageId) throw conflict('Choisissez d’abord la langue que vous souhaitez apprendre.');
  if (findLanguage(languageId)?.status !== 'available') throw conflict('Cette langue ouvrira bientôt.');
  if (actor.languageId && actor.languageId !== languageId) throw conflict('Le test porte sur la langue de votre profil.');
  const open = learnerPlacements(actor.id).find((attempt) => attempt.status === 'in_progress');
  if (open && !body.restart && !body.declaredBeginner) return { status: 200, body: placementView(open, actor) };
  const last = lastCompletedPlacement(actor.id);
  if (!body.declaredBeginner && last?.completedAt && !last.declaredBeginner && new Date(inHours(last.completedAt, 24)) > new Date()) {
    throw conflict(`Vous pourrez repasser le test à partir du ${longMoment(inHours(last.completedAt, 24))}.`);
  }
  if (open) { open.status = 'abandoned'; open.currentTier = null; }
  const test = state().placementTests.find((item) => item.languageId === languageId && item.status === 'published');
  const started = now();
  if (body.declaredBeginner) {
    const attempt: PlacementRec = { id: newId(), learnerId: actor.id, languageId, testId: null, testNumber: null, status: 'completed',
      currentTier: null, tiers: [], questions: [], savedAnswers: {}, submitKeys: {}, declaredBeginner: true, placedLevel: 'A0',
      startedAt: started, completedAt: started };
    state().placements.push(attempt);
    return { status: 201, body: placementView(attempt, actor) };
  }
  if (!test) throw conflict('Le test de niveau n’est pas encore disponible pour cette langue.');
  const attempt: PlacementRec = {
    id: newId(), learnerId: actor.id, languageId, testId: test.id, testNumber: test.number, status: 'in_progress', currentTier: test.tiers[0].code,
    tiers: test.tiers.map((tier, index) => ({ code: tier.code, title: tier.title, passPercent: tier.passPercent, minCompetencePercent: tier.minCompetencePercent,
      status: index === 0 ? 'current' : 'locked', correct: null, total: null, percent: null, competences: null })),
    questions: drawPlacement(test), savedAnswers: {}, submitKeys: {}, declaredBeginner: false, placedLevel: null, startedAt: started, completedAt: null,
  };
  state().placements.push(attempt);
  return { status: 201, body: placementView(attempt, actor) };
}

function checkPlacementAnswers(attempt: PlacementRec, actor: UserRec, body: Json) {
  if (attempt.learnerId !== actor.id) throw forbidden('Seul l’élève répond à son test.');
  if (attempt.status !== 'in_progress') throw conflict('Ce test est terminé.');
  if (body.tier !== attempt.currentTier) throw conflict('Ce palier n’est plus en cours : rechargez le test.');
  const answers = body.answers;
  if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) throw invalid('Réponses invalides.');
  const questions = attempt.questions.filter((question) => question.tier === attempt.currentTier);
  for (const [questionId, optionId] of Object.entries(answers)) {
    const question = questions.find((item) => item.id === questionId);
    if (!question || typeof optionId !== 'string' || (optionId !== PLACEMENT_DONT_KNOW && !question.options.some((option) => option.id === optionId))) {
      throw invalid('Une réponse ne correspond à aucune question du palier.');
    }
  }
  return { answers: answers as Record<string, string>, questions };
}

function savePlacementAnswers(actor: UserRec, id: string, body: Json) {
  const attempt = findPlacement(id);
  const { answers } = checkPlacementAnswers(attempt, actor, body);
  Object.assign(attempt.savedAnswers, answers);
  return placementView(attempt, actor);
}

const submitKey = (key: string | undefined) => {
  if (!key || !/^[A-Za-z0-9_-]{8,128}$/.test(key)) throw invalid('Clé de remise invalide (en-tête Idempotency-Key).');
  return key;
};

function submitPlacementTier(actor: UserRec, id: string, body: Json, requestKey: string | undefined) {
  const key = submitKey(requestKey);
  const attempt = findPlacement(id);
  if (key && attempt.submitKeys[key]) {
    if (attempt.learnerId !== actor.id) throw forbidden();
    return placementView(attempt, actor);
  }
  const { answers, questions } = checkPlacementAnswers(attempt, actor, body);
  const merged = { ...attempt.savedAnswers, ...answers };
  const missing = questions.filter((question) => !merged[question.id]);
  if (missing.length) throw invalid(`Répondez aux ${missing.length} questions restantes (« Je ne sais pas » compte comme une réponse).`);
  const tier = attempt.tiers.find((item) => item.code === attempt.currentTier) as TierRec;
  const scores: Partial<Record<PlacementCompetence, CompetenceScore>> = {};
  for (const question of questions) {
    const score = scores[question.competence] ?? { correct: 0, total: 0, percent: 0 };
    score.total += 1;
    if (merged[question.id] === question.answer) score.correct += 1;
    score.percent = percentOf(score.correct, score.total);
    scores[question.competence] = score;
  }
  const correct = Object.values(scores).reduce((sum, score) => sum + (score?.correct ?? 0), 0);
  Object.assign(tier, { correct, total: questions.length, percent: percentOf(correct, questions.length), competences: scores });
  const passed = (tier.percent ?? 0) >= tier.passPercent && Object.values(scores).every((score) => (score?.percent ?? 0) >= tier.minCompetencePercent);
  tier.status = passed ? 'passed' : 'failed';
  attempt.savedAnswers = merged;
  if (key) attempt.submitKeys[key] = tier.code;
  const next = attempt.tiers[attempt.tiers.indexOf(tier) + 1];
  if (passed && next) {
    next.status = 'current';
    attempt.currentTier = next.code;
  } else {
    const lastPassed = [...attempt.tiers].reverse().find((item) => item.status === 'passed');
    attempt.status = 'completed';
    attempt.currentTier = null;
    attempt.placedLevel = lastPassed?.code ?? 'A0';
    attempt.completedAt = now();
  }
  return placementView(attempt, actor);
}

// ---------------------------------------------------------------------------------------------------------------------
// Planification (reprise de Planner.java : ordre conservé, une séance ne mélange jamais deux niveaux)
// ---------------------------------------------------------------------------------------------------------------------

const weeklyMinutesOf = (days: readonly Day[]) => days.reduce((sum, day) => sum + day.sessions * day.minutes, 0);
const progressKey = (level: string, itemId: string) => `${level}:${itemId}`;
const itemDone = (path: PathRec, level: string, itemId: string) => path.progress[progressKey(level, itemId)]?.status === 'completed';

function additionItems(addition: AdditionRec, levelCode: LevelCode): PlanItem[] {
  const source = levelContent(addition.sourceLevelCode);
  const module = source?.modules.find((item) => item.id === addition.moduleId);
  if (!module) return [];
  return module.activities.filter(([id]) => !addition.activityId || id === addition.activityId).map(([id, kind, title, minutes]) => ({
    id: `ajout-${shortHex(addition.id)}-${id}`, kind, title, minutes, moduleId: module.id, levelCode,
    sourceVersionId: addition.sourceTrackVersionId, sourceActivityId: id, additionId: addition.id,
  }));
}

/** Éléments restant à planifier pour un niveau : activités, révisions, bilans et ajouts du professeur. */
function levelItems(path: PathRec, levelCode: LevelCode): PlanItem[] {
  const level = levelContent(levelCode);
  if (!level) return [];
  const item = (id: string, kind: PlanItem['kind'], title: string, minutes: number, moduleId: string | null): PlanItem => ({
    id, kind, title, minutes, moduleId, levelCode, sourceVersionId: null, sourceActivityId: null, additionId: null,
  });
  const items: PlanItem[] = [];
  const midtermAfter = Math.floor((level.modules.length + 1) / 2);
  level.modules.forEach((module, index) => {
    const remaining = module.activities.filter(([id]) => !itemDone(path, levelCode, id));
    items.push(...remaining.map(([id, kind, title, minutes]) => item(id, kind, title, minutes, module.id)));
    const review = `revision-${module.id}`;
    if (remaining.length && !itemDone(path, levelCode, review)) items.push(item(review, 'review', `Révision · ${module.title}`, level.settings.reviewMinutes, module.id));
    if (index + 1 === midtermAfter && !itemDone(path, levelCode, MIDTERM)) items.push(item(MIDTERM, 'assessment', 'Bilan intermédiaire', level.settings.midtermMinutes, null));
  });
  if (!itemDone(path, levelCode, FINAL)) items.push(item(FINAL, 'assessment', 'Examen blanc', level.settings.finalMinutes, null));
  const added = path.additions.filter((addition) => !addition.removedAt && addition.stepLevel === levelCode);
  const next = added.filter((addition) => addition.placement === 'next').flatMap((addition) => additionItems(addition, levelCode))
    .filter((planItem) => !itemDone(path, levelCode, planItem.id));
  const end = added.filter((addition) => addition.placement === 'end_of_level').flatMap((addition) => additionItems(addition, levelCode))
    .filter((planItem) => !itemDone(path, levelCode, planItem.id));
  const finalIndex = items.findIndex((planItem) => planItem.id === FINAL);
  if (finalIndex >= 0) items.splice(finalIndex, 0, ...end); else items.push(...end);
  return [...next, ...items];
}
const openSteps = (path: PathRec) => path.steps.filter((step) => step.status === 'planned' || step.status === 'active').sort((a, b) => a.position - b.position);
const pathItems = (path: PathRec) => openSteps(path).flatMap((step) => levelItems(path, step.levelCode));

function moduleTitle(levelCode: string | null, moduleId: string | null) {
  for (const level of CONTENT) {
    if (levelCode && level.code !== levelCode && !moduleId?.startsWith(level.code.toLowerCase())) continue;
    const found = level.modules.find((module) => module.id === moduleId);
    if (found) return found.title;
  }
  return null;
}

interface Fill { sessions: PlannedSession[]; overflow: PlanItem[]; capacity: number; required: number; weeks: PathProposal['weeks'] }
function fill(from: string, target: string, availability: readonly Day[], items: readonly PlanItem[], maxDays = 730): Fill {
  const byWeekday = new Map(availability.map((day) => [day.weekday, day]));
  const slots: { date: string; slot: number; capacity: number; items: PlanItem[] }[] = [];
  const last = daysBetween(from, target) > maxDays ? addDays(from, maxDays) : target;
  for (let date = from; date <= last; date = addDays(date, 1)) {
    const day = byWeekday.get(weekdayOf(date));
    if (!day) continue;
    for (let slot = 1; slot <= day.sessions; slot++) slots.push({ date, slot, capacity: day.minutes, items: [] });
  }
  let index = 0;
  let used = 0;
  const overflow: PlanItem[] = [];
  for (const item of items) {
    let placed = false;
    while (index < slots.length) {
      const slot = slots[index];
      const empty = slot.items.length === 0;
      if (!empty && slot.items[0].levelCode !== item.levelCode) { index++; used = 0; continue; }
      if (item.minutes <= slot.capacity - used || (empty && item.minutes > slot.capacity)) {
        slot.items.push(item);
        used += item.minutes;
        if (used >= slot.capacity) { index++; used = 0; }
        placed = true;
        break;
      }
      index++;
      used = 0;
    }
    if (!placed) overflow.push(item);
  }
  const weeks = new Map<string, { start: string; availableMinutes: number; plannedMinutes: number }>();
  for (const slot of slots) {
    const start = mondayOf(slot.date);
    const week = weeks.get(start) ?? { start, availableMinutes: 0, plannedMinutes: 0 };
    week.availableMinutes += slot.capacity;
    week.plannedMinutes += slot.items.reduce((sum, item) => sum + item.minutes, 0);
    weeks.set(start, week);
  }
  return {
    sessions: slots.filter((slot) => slot.items.length).map((slot) => {
      const first = slot.items[0];
      return { date: slot.date, slot: slot.slot, dueAt: at(slot.date, 17 + slot.slot), capacity: slot.capacity, levelCode: first.levelCode,
        moduleId: first.moduleId ?? first.id, title: moduleTitle(first.levelCode, first.moduleId) ?? first.title,
        minutes: slot.items.reduce((sum, item) => sum + item.minutes, 0), items: slot.items };
    }),
    overflow, capacity: slots.reduce((sum, slot) => sum + slot.capacity, 0), required: items.reduce((sum, item) => sum + item.minutes, 0),
    weeks: [...weeks.values()],
  };
}

function difficultyOf(requiredMinutes: number, from: string, target: string): Difficulty {
  const days = daysBetween(from, target);
  const weekly = days >= 7 ? Math.ceil(requiredMinutes / (days / 7)) : Math.max(requiredMinutes, 841);
  const code = days < 7 ? 'unrealistic'
    : difficultyCodes.find((item) => difficultyThresholds[item] !== null && weekly <= (difficultyThresholds[item] as number)) ?? 'unrealistic';
  return { code, label: difficultyLabels[code], requiredWeeklyMinutes: weekly };
}

const weekdayNames = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
function suggestionsFor(from: string, target: string, availability: Day[], items: PlanItem[], engaged: boolean): Suggestion[] {
  const fits = (days: Day[], date: string) => fill(from, date, days, items).overflow.length === 0;
  const suggestions: Suggestion[] = [];
  if (availability.length) {
    const longer = availability.map((day) => ({ ...day, minutes: Math.min(240, day.minutes + 15) }));
    if (fits(longer, target)) suggestions.push({ kind: 'minutes', label: 'Ajouter 15 minutes à chaque séance', availability: longer, targetDate: target, requiresAmendment: false });
    const more = availability.map((day) => ({ ...day, sessions: Math.min(6, day.sessions + 1) }));
    if (fits(more, target)) suggestions.push({ kind: 'sessions', label: 'Prévoir une séance de plus chaque jour travaillé', availability: more, targetDate: target, requiresAmendment: false });
  }
  const typical = availability[0]?.minutes ?? 30;
  const days = [...availability];
  const added: number[] = [];
  for (let weekday = 1; weekday <= 7 && days.length < 7; weekday++) {
    if (days.some((day) => day.weekday === weekday)) continue;
    days.push({ weekday, sessions: 1, minutes: typical });
    added.push(weekday);
    if (fits(days, target)) {
      suggestions.push({ kind: 'days', label: added.length === 1 ? `Travailler aussi le ${weekdayNames[weekday - 1]}`
        : `Ajouter ${added.length} jours : ${added.map((item) => weekdayNames[item - 1]).join(', ')}`,
      availability: [...days].sort((a, b) => a.weekday - b.weekday), targetDate: target, requiresAmendment: false });
      break;
    }
  }
  if (availability.length) {
    for (let weeks = 1; weeks <= 104; weeks++) {
      const later = addDays(target, weeks * 7);
      if (fits(availability, later)) {
        suggestions.push({ kind: 'target_date', label: `Repousser la date visée au ${longDate(later)}`, availability, targetDate: later, requiresAmendment: engaged });
        break;
      }
    }
  }
  return suggestions;
}

const engagedContract = (path: PathRec) => path.contracts.find((contract) => contract.status === 'accepted') ?? null;
const pendingContract = (path: PathRec) => path.contracts.find((contract) => contract.status === 'pending_teacher' || contract.status === 'pending_learner') ?? null;

/** Nouvelle proposition de planning du parcours, depuis le début (brouillon) ou depuis aujourd'hui (parcours actif). */
function computeProposal(path: PathRec, options: { availability?: Day[]; targetDate?: string; from?: string } = {}): PathProposal {
  const availability = options.availability ?? path.availability;
  const target = options.targetDate ?? path.targetDate;
  const from = options.from ?? (path.status === 'draft' ? path.startDate : [today(), path.startDate, path.resumeDate ?? ''].sort().at(-1) as string);
  const items = pathItems(path);
  const result = fill(from, target, availability, items);
  const feasibilityPercent = result.capacity ? Math.round((result.required * 100) / result.capacity) : 999;
  const spans = new Map<LevelCode, LevelSpan>();
  for (const step of openSteps(path)) spans.set(step.levelCode, { levelCode: step.levelCode, stepPosition: step.position, firstDate: null, lastDate: null, minutes: 0, sessionCount: 0 });
  for (const session of result.sessions) {
    const span = session.levelCode ? spans.get(session.levelCode) : undefined;
    if (!span) continue;
    span.firstDate ??= session.date;
    span.lastDate = session.date;
    span.minutes += session.minutes;
    span.sessionCount += 1;
  }
  path.revisionCounter += 1;
  return {
    number: path.revisionCounter, baseRevision: path.validatedRevision, status: 'proposed', startDate: from, targetDate: target, availability,
    capacityMinutes: result.capacity, requiredMinutes: result.required, overflowCount: result.overflow.length, createdAt: now(),
    sessions: result.sessions, overflow: result.overflow, weeks: result.weeks,
    suggestions: result.overflow.length ? suggestionsFor(from, target, availability, items, Boolean(engagedContract(path))) : [],
    validatable: false, pathId: path.id, difficulty: difficultyOf(result.required, from, target),
    feasibility: { code: feasibilityPercent <= 85 ? 'comfortable' : feasibilityPercent <= 100 ? 'tight' : 'insufficient', loadPercent: feasibilityPercent },
    levels: [...spans.values()], blockingReason: null,
  };
}

function canValidateAs(path: PathRec, actor: UserRec) {
  const learner = userById(path.learnerId) as UserRec;
  if (path.status === 'draft') return actor.id === path.learnerId;
  return path.status === 'active' && (actor.id === path.learnerId || isReferent(actor, learner));
}
function blockingReason(path: PathRec, proposal: PathProposal, actor: UserRec | null): PathProposal['blockingReason'] {
  // Même ordre que PathRules.blockingReason : stale, objective_locked, commitment, overflow, not_allowed.
  if (proposal.baseRevision !== path.validatedRevision) return 'stale';
  const contract = engagedContract(path);
  if (contract && proposal.targetDate !== contract.terms.targetDate) return 'objective_locked';
  if (contract && weeklyMinutesOf(proposal.availability) < contract.terms.weeklyMinutes) return 'commitment';
  if (proposal.overflowCount > 0) return 'overflow';
  if (actor && !canValidateAs(path, actor)) return 'not_allowed';
  return null;
}
function decorate(path: PathRec, proposal: PathProposal, actor: UserRec | null): PathProposal {
  if (proposal.status === 'validated') return { ...proposal, validatable: false, blockingReason: null };
  const reason = blockingReason(path, proposal, actor);
  return { ...proposal, validatable: reason === null, blockingReason: reason };
}

// ---------------------------------------------------------------------------------------------------------------------
// Parcours
// ---------------------------------------------------------------------------------------------------------------------

const openPath = (learnerId: string) => state().paths.find((path) => path.learnerId === learnerId && (path.status === 'draft' || path.status === 'active'));
const latestPath = (learnerId: string) => openPath(learnerId)
  ?? state().paths.filter((path) => path.learnerId === learnerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
function findPath(id: string, actor: UserRec) {
  const path = state().paths.find((item) => item.id === id);
  if (!path) throw notFound('Parcours introuvable.');
  readable(actor, path.learnerId);
  return path;
}
const activeStep = (path: PathRec) => path.steps.find((step) => step.status === 'active');
const nextStep = (path: PathRec) => path.steps.filter((step) => step.status === 'planned').sort((a, b) => a.position - b.position)[0];

function buildSteps(path: PathRec) {
  const kept = path.steps.filter((step) => step.status === 'active' || step.status === 'completed');
  for (const step of path.steps) if (step.status === 'planned') step.status = 'withdrawn';
  const withdrawn = path.steps.filter((step) => step.status === 'withdrawn');
  const steps = [...kept];
  for (const code of levelsBetween(path.startLevel, path.targetLevel)) {
    if (steps.some((step) => step.levelCode === code)) continue;
    steps.push({ id: newId(), position: rankOf(code), levelCode: code, trackVersionId: VERSIONS[code].id, trackVersionNumber: VERSIONS[code].number,
      status: 'planned', enrollmentId: null, goalStatus: null, activatedAt: null, completedAt: null, finalDecision: null });
  }
  path.steps = [...steps, ...withdrawn.filter((step) => !steps.some((item) => item.levelCode === step.levelCode))];
}

function estimateFor(learner: UserRec, body: Json, path?: PathRec): Estimate {
  const placed = lastCompletedPlacement(learner.id)?.placedLevel ?? 'A0';
  const startLevel = (typeof body.startLevel === 'string' ? body.startLevel : path?.startLevel ?? placed) as StartLevel;
  if (rankOf(startLevel) < 0) throw invalid('Niveau de départ inconnu.');
  const targetLevel = body.targetLevel as LevelCode;
  if (!levelCodes.includes(targetLevel)) throw invalid('Niveau visé inconnu.');
  const startDate = isDate(body.startDate) ? body.startDate : path?.status === 'active' ? today() : path?.startDate ?? today();
  if (!isDate(body.targetDate)) throw invalid('Indiquez la date visée.');
  const targetDate = body.targetDate;
  if (targetDate <= startDate) throw invalid('La date visée doit suivre la date de début.');
  const targets = allowedTargets(startLevel);
  if (!targets.includes(targetLevel)) {
    throw conflict(targets.length ? `Ce niveau n’est pas encore proposé : choisissez parmi ${targets.join(', ')}.` : 'Aucun parcours publié ne dépasse ce niveau pour le moment.');
  }
  const levels = levelsBetween(startLevel, targetLevel).map((code) => ({ levelCode: code, trackVersionId: VERSIONS[code].id,
    plannedMinutes: path ? levelItems(path, code).reduce((sum, item) => sum + item.minutes, 0) : plannedMinutes(code) }));
  const requiredMinutes = levels.reduce((sum, level) => sum + level.plannedMinutes, 0);
  const difficulty = difficultyOf(requiredMinutes, startDate, targetDate);
  const weeks = Math.round((daysBetween(startDate, targetDate) / 7) * 10) / 10;
  const bands: DifficultyBand[] = difficultyCodes.map((code) => {
    const max = difficultyThresholds[code];
    const minWeeks = max ? Math.max(1, Math.ceil(requiredMinutes / max)) : null;
    return { code, label: difficultyLabels[code], maxWeeklyMinutes: max, minWeeks, earliestTargetDate: minWeeks ? addDays(startDate, minWeeks * 7) : null };
  });
  const weekly = difficulty.requiredWeeklyMinutes;
  let perDay = Math.max(15, roundUp5(Math.ceil((weekly * 1.15) / 5)));
  let weekdays = [1, 2, 3, 4, 5];
  if (perDay > 240) { weekdays = [1, 2, 3, 4, 5, 6, 7]; perDay = Math.max(15, roundUp5(Math.ceil((weekly * 1.15) / 7))); }
  const sessions = perDay > 60 ? 2 : 1;
  const minutes = Math.min(240, Math.max(10, roundUp5(Math.ceil(perDay / sessions))));
  return {
    languageId: learner.languageId ?? 'de', startLevel, targetLevel, startDate, targetDate, weeks, requiredMinutes, levels,
    requiredWeeklyMinutes: weekly, requiredDailyMinutes: { fiveDays: Math.ceil(weekly / 5), sevenDays: Math.ceil(weekly / 7) }, difficulty,
    bands, allowedTargets: targets, minTargetDate: bands.find((band) => band.code === 'very_intensive')?.earliestTargetDate ?? addDays(startDate, 7),
    maxTargetDate: addDays(startDate, 730), suggestedAvailability: weekdays.map((weekday) => ({ weekday, sessions, minutes })),
  };
}

function estimate(actor: UserRec, body: Json) {
  const path = typeof body.pathId === 'string' ? findPath(body.pathId, actor) : undefined;
  const learner = path ? learnerById(path.learnerId) : typeof body.learnerId === 'string' ? readable(actor, body.learnerId) : actor;
  requireLearner(learner);
  return estimateFor(learner, body, path);
}

function createPath(actor: UserRec, body: Json) {
  requireLearner(actor);
  if (openPath(actor.id)) throw conflict('Un parcours est déjà en cours : modifiez-le plutôt que d’en créer un autre.');
  if (typeof body.placementAttemptId !== 'string') throw invalid('Le résultat du test de niveau est attendu.');
  const placement = findPlacement(body.placementAttemptId);
  if (placement.learnerId !== actor.id || placement.status !== 'completed' || !placement.placedLevel) throw conflict('Terminez d’abord le test de niveau.');
  const startLevel = (body.startLevel ?? placement.placedLevel) as StartLevel;
  if (rankOf(startLevel) < 0 || rankOf(startLevel) > rankOf(placement.placedLevel)) throw conflict('Vous pouvez partir d’un niveau plus bas que votre résultat, pas plus haut.');
  if (!isDate(body.startDate) || body.startDate < today()) throw invalid('La date de début ne peut pas être passée.');
  const result = estimateFor(actor, { ...body, startLevel });
  if (result.difficulty.code === 'unrealistic') throw conflict('Ce rythme n’est pas tenable : choisissez une date visée plus lointaine.');
  const path: PathRec = {
    id: newId(), learnerId: actor.id, languageId: actor.languageId ?? 'de', status: 'draft', startLevel, targetLevel: result.targetLevel,
    startDate: result.startDate, targetDate: result.targetDate, initialTargetDate: result.targetDate, weeklyMinutes: result.requiredWeeklyMinutes,
    placementAttemptId: placement.id, origin: 'onboarding', paused: false, pausedAt: null, resumeDate: null, validatedRevision: 0, revisionCounter: 0,
    availability: result.suggestedAvailability, availabilityConfirmed: false, steps: [], proposal: null, validatedPlan: null, liveSessions: [],
    contracts: [], additions: [], progress: {}, createdBy: actor.id, createdAt: now(), endedAt: null,
  };
  buildSteps(path);
  path.proposal = computeProposal(path);
  state().paths.push(path);
  return { status: 201, body: pathView(path, actor) };
}

function changeObjective(actor: UserRec, path: PathRec, body: Json) {
  if (path.status !== 'draft' || actor.id !== path.learnerId) throw conflict('L’objectif se change par un avenant au contrat une fois le parcours démarré.');
  const placed = path.placementAttemptId ? findPlacement(path.placementAttemptId).placedLevel ?? 'A0' : 'A0';
  const startLevel = (body.startLevel ?? path.startLevel) as StartLevel;
  if (rankOf(startLevel) < 0 || rankOf(startLevel) > rankOf(placed)) throw conflict('Vous pouvez partir d’un niveau plus bas que votre résultat, pas plus haut.');
  const result = estimateFor(learnerById(path.learnerId), { ...body, startLevel });
  if (result.difficulty.code === 'unrealistic') throw conflict('Ce rythme n’est pas tenable : choisissez une date visée plus lointaine.');
  Object.assign(path, { startLevel, targetLevel: result.targetLevel, startDate: result.startDate, targetDate: result.targetDate,
    initialTargetDate: result.targetDate, weeklyMinutes: result.requiredWeeklyMinutes });
  if (!path.availabilityConfirmed) path.availability = result.suggestedAvailability;
  buildSteps(path);
  path.proposal = computeProposal(path);
  return pathView(path, actor);
}

function checkDays(value: unknown): Day[] {
  if (!Array.isArray(value) || value.length > 7) throw invalid('Les jours sont attendus (sept au plus).');
  const days = value.map((day) => day as Day);
  const seen = new Set<number>();
  for (const day of days) {
    if (!Number.isInteger(day?.weekday) || day.weekday < 1 || day.weekday > 7 || seen.has(day.weekday)) throw invalid('Jour de la semaine invalide.');
    if (!Number.isInteger(day.sessions) || day.sessions < 1 || day.sessions > 6) throw invalid('Entre 1 et 6 séances par jour.');
    if (!Number.isInteger(day.minutes) || day.minutes < 10 || day.minutes > 240) throw invalid('Une séance dure entre 10 et 240 minutes.');
    seen.add(day.weekday);
  }
  return days.map(({ weekday, sessions, minutes }) => ({ weekday, sessions, minutes })).sort((a, b) => a.weekday - b.weekday);
}

function changeAvailability(actor: UserRec, path: PathRec, body: Json) {
  if (!permissionsOf(path, actor).canEditAvailability) throw forbidden('Vous ne pouvez pas modifier les jours de ce parcours.');
  const days = checkDays(body.days ?? body.availability);
  if (body.targetDate !== undefined) {
    if (path.status !== 'draft') throw conflict('La date visée se change par un avenant au contrat.');
    if (!isDate(body.targetDate) || body.targetDate <= path.startDate) throw invalid('Date visée invalide.');
    path.targetDate = body.targetDate;
    path.initialTargetDate = body.targetDate;
  }
  path.availability = days;
  path.availabilityConfirmed = true;
  path.proposal = computeProposal(path);
  return decorate(path, path.proposal, actor);
}

function currentProposal(path: PathRec, actor: UserRec) {
  const proposal = path.proposal ?? path.validatedPlan;
  if (!proposal) throw notFound('Aucune proposition de planning.');
  return decorate(path, proposal, actor);
}

/** Séances réelles du niveau actif tirées de la révision validée (les séances terminées sont conservées). */
function materialize(path: PathRec) {
  const step = activeStep(path);
  const plan = path.validatedPlan;
  if (!step || !plan || !step.enrollmentId) return;
  path.liveSessions = path.liveSessions.filter((session) => session.levelCode !== step.levelCode || session.completedAt);
  for (const planned of plan.sessions.filter((session) => session.levelCode === step.levelCode)) {
    path.liveSessions.push({ id: newId(), enrollmentId: step.enrollmentId, stepPosition: step.position, levelCode: step.levelCode,
      date: planned.date, slot: planned.slot, dueAt: planned.dueAt, moduleId: planned.moduleId, title: planned.title, items: planned.items, completedAt: null });
  }
}

function validateCurrent(path: PathRec) {
  const proposal = path.proposal as PathProposal;
  proposal.status = 'validated';
  path.validatedPlan = proposal;
  path.validatedRevision = proposal.number;
  path.proposal = null;
  materialize(path);
  const step = activeStep(path);
  if (step && step.goalStatus === 'preparing') step.goalStatus = 'active';
}

function activate(step: StepRec) {
  Object.assign(step, { status: 'active', enrollmentId: newId(), goalStatus: 'preparing', activatedAt: now() });
}

function termsOf(path: PathRec, overrides: Partial<ContractTerms> = {}): ContractTerms {
  const base = { startLevel: path.startLevel, targetLevel: path.targetLevel, startDate: path.startDate, targetDate: path.targetDate,
    weeklyMinutes: path.weeklyMinutes, availability: path.availability, ...overrides };
  const required = levelsBetween(base.startLevel, base.targetLevel).reduce((sum, code) => sum + levelItems(path, code).reduce((total, item) => total + item.minutes, 0), 0);
  return { ...base, requiredMinutes: required, difficulty: difficultyOf(required, path.status === 'active' ? today() : base.startDate, base.targetDate) };
}

function validateProposal(actor: UserRec, path: PathRec, body: Json) {
  if (!path.proposal) throw conflict('Aucune proposition en attente de validation.');
  if (body.number !== path.proposal.number) throw conflict('Le planning a changé entre-temps : actualisez la proposition avant de la valider.');
  if (path.status === 'draft' && actor.id !== path.learnerId) throw forbidden('L’élève valide lui-même son planning pour démarrer son parcours.');
  const decorated = decorate(path, path.proposal, actor);
  if (!decorated.validatable) {
    throw conflict({ overflow: 'Certaines activités ne trouvent pas de place avant la date visée.', objective_locked: 'La date visée est fixée par le contrat.',
      commitment: 'Le temps prévu chaque semaine doit rester au moins égal à l’engagement du contrat.', not_allowed: 'Vous ne pouvez pas valider ce planning.',
      stale: 'Le planning a changé entre-temps.' }[decorated.blockingReason ?? 'not_allowed']);
  }
  if (path.status === 'draft') {
    const first = nextStep(path);
    if (!first) throw conflict('Aucun niveau à ouvrir.');
    activate(first);
    path.status = 'active';
    path.weeklyMinutes = Math.min(path.weeklyMinutes, weeklyMinutesOf(path.availability));
    validateCurrent(path);
    const learner = learnerById(path.learnerId);
    path.contracts.push({ number: 1, status: learner.teacherId ? 'pending_teacher' : 'accepted', proposedBy: 'learner', proposerId: learner.id,
      terms: termsOf(path), note: null, createdAt: now(), decidedAt: learner.teacherId ? null : now(), decidedBy: null, decisionNote: null });
  } else {
    validateCurrent(path);
  }
  return pathView(path, actor);
}

function pausePath(actor: UserRec, path: PathRec) {
  if (!permissionsOf(path, actor).canPause) throw forbidden('La pause est décidée par l’élève autonome ou par le professeur.');
  if (path.paused) throw conflict('Le parcours est déjà en pause.');
  path.paused = true;
  path.pausedAt = now();
  path.resumeDate = null;
  const step = activeStep(path);
  if (step) step.goalStatus = 'paused';
  return pathView(path, actor);
}

function resumePath(actor: UserRec, path: PathRec, body: Json) {
  if (!permissionsOf(path, actor).canPause) throw forbidden('La reprise est décidée par l’élève autonome ou par le professeur.');
  if (!path.paused) throw conflict('Le parcours n’est pas en pause.');
  if (!isDate(body.resumeDate) || body.resumeDate < today()) throw invalid('Choisissez une date de reprise à venir.');
  path.paused = false;
  path.pausedAt = null;
  path.resumeDate = body.resumeDate;
  const step = activeStep(path);
  if (step) step.goalStatus = 'active';
  path.proposal = computeProposal(path, { from: body.resumeDate });
  return decorate(path, path.proposal, actor);
}

/** Ouvre le niveau suivant : remise de l'examen blanc du niveau, ou passage forcé par le professeur. */
function openNextLevel(path: PathRec) {
  const current = activeStep(path);
  const next = nextStep(path);
  if (!current || !next) throw conflict('Aucun niveau suivant n’est prévu dans ce parcours.');
  current.status = 'completed';
  current.completedAt = now();
  activate(next);
  path.proposal = computeProposal(path, { from: today() });
  if (decorate(path, path.proposal, null).validatable) validateCurrent(path);
}

function advancePath(actor: UserRec, path: PathRec) {
  if (!permissionsOf(path, actor).canAdvance) {
    throw conflict('Le niveau suivant s’ouvre à la remise de l’examen blanc du niveau en cours.');
  }
  openNextLevel(path);
  return pathView(path, actor);
}

// ---------------------------------------------------------------------------------------------------------------------
// Droits et vues
// ---------------------------------------------------------------------------------------------------------------------

function permissionsOf(path: PathRec, actor: UserRec): PathPermissions {
  const learner = userById(path.learnerId) as UserRec;
  const owner = actor.id === path.learnerId;
  const referent = isReferent(actor, learner);
  const active = path.status === 'active';
  const pending = pendingContract(path);
  const step = activeStep(path);
  const proposal = path.proposal;
  return {
    canEditAvailability: (owner && (path.status === 'draft' || active)) || (referent && active),
    canValidate: Boolean(proposal && decorate(path, proposal, actor).validatable),
    canChangeObjective: owner && path.status === 'draft',
    canProposeContract: active && (owner || referent),
    canDecideContract: Boolean(pending && contractSide(pending, actor, path)),
    canPause: active && ((owner && !learner.teacherId) || referent),
    canAddCourses: active && referent,
    canAdvance: active && Boolean(nextStep(path)) && (referent
      || (owner && ['awaiting_grading', 'validated', 'to_consolidate'].includes(step?.goalStatus ?? ''))),
  };
}

/** La partie adverse d'un contrat en attente peut l'accepter ou le refuser. */
function contractSide(contract: ContractRec, actor: UserRec, path: PathRec) {
  const learner = userById(path.learnerId) as UserRec;
  if (contract.status === 'pending_teacher') return isReferent(actor, learner);
  if (contract.status === 'pending_learner') return actor.id === path.learnerId;
  return false;
}
function contractView(path: PathRec, contract: ContractRec, actor: UserRec): Contract {
  const side = contractSide(contract, actor, path);
  return { pathId: path.id, number: contract.number, status: contract.status, proposedBy: contract.proposedBy, proposerId: contract.proposerId,
    terms: contract.terms, note: contract.note, createdAt: contract.createdAt, decidedAt: contract.decidedAt, decidedBy: contract.decidedBy,
    decisionNote: contract.decisionNote, canAccept: side, canReject: side };
}

function sessionStatus(path: PathRec, session: LiveSession): PathSession['status'] {
  const done = session.items.filter((item) => itemDone(path, session.levelCode, item.id)).length;
  const started = session.items.some((item) => path.progress[progressKey(session.levelCode, item.id)]);
  if (done === session.items.length) return 'completed';
  if (started) return 'in_progress';
  return new Date(session.dueAt) < new Date() ? 'late' : 'planned';
}
function activityStatus(path: PathRec, level: string, itemId: string): 'todo' | 'started' | 'completed' {
  return path.progress[progressKey(level, itemId)]?.status === 'completed' ? 'completed' : path.progress[progressKey(level, itemId)] ? 'started' : 'todo';
}

function pathSessions(path: PathRec): PathSession[] {
  const live = path.liveSessions.map((session) => ({ session, locked: false }));
  const futureLevels = new Set(path.steps.filter((step) => step.status === 'planned').map((step) => step.levelCode));
  const projected = (path.validatedPlan?.sessions ?? []).filter((session) => session.levelCode && futureLevels.has(session.levelCode));
  const rows: PathSession[] = [
    ...live.map(({ session }) => {
      const firstProgress = session.items.map((item) => path.progress[progressKey(session.levelCode, item.id)]).find(Boolean);
      return {
        id: session.id, enrollmentId: session.enrollmentId, stepPosition: session.stepPosition, levelCode: session.levelCode, locked: false,
        position: 0, date: session.date, slot: session.slot, dueAt: session.dueAt, moduleId: session.moduleId, title: session.title,
        status: sessionStatus(path, session), estimatedMinutes: session.items.reduce((sum, item) => sum + item.minutes, 0),
        startedAt: firstProgress ? session.dueAt : null, completedAt: session.completedAt,
        activities: session.items.map((item, index) => ({ id: item.id, position: index + 1, kind: item.kind, title: item.title,
          estimatedMinutes: item.minutes, status: activityStatus(path, session.levelCode, item.id),
          completedAt: path.progress[progressKey(session.levelCode, item.id)]?.completedAt ?? null, added: Boolean(item.additionId) })),
      };
    }),
    ...projected.map((session) => ({
      id: null, enrollmentId: null, stepPosition: path.steps.find((step) => step.levelCode === session.levelCode)?.position ?? 0,
      levelCode: session.levelCode as LevelCode, locked: true, position: 0, date: session.date, slot: session.slot, dueAt: session.dueAt,
      moduleId: session.moduleId, title: session.title, status: 'locked' as const, estimatedMinutes: session.minutes, startedAt: null, completedAt: null,
      activities: session.items.map((item, index) => ({ id: item.id, position: index + 1, kind: item.kind, title: item.title,
        estimatedMinutes: item.minutes, status: 'todo' as const, completedAt: null, added: Boolean(item.additionId) })),
    })),
  ];
  rows.sort((a, b) => a.date.localeCompare(b.date) || a.slot - b.slot);
  rows.forEach((row, index) => { row.position = index + 1; });
  return rows;
}

function pathView(path: PathRec, actor: UserRec): PathView {
  const learner = userById(path.learnerId) as UserRec;
  const plan = path.status === 'draft' ? path.proposal : path.validatedPlan;
  const sessions = path.status === 'draft' ? [] : pathSessions(path);
  const proposal = path.proposal ?? path.validatedPlan;
  const current = engagedContract(path);
  const terms = termsOf(path);
  return {
    id: path.id, learnerId: path.learnerId, languageId: path.languageId, status: path.status, accompanied: Boolean(learner.teacherId),
    origin: path.origin, startLevel: path.startLevel, targetLevel: path.targetLevel, startDate: path.startDate, targetDate: path.targetDate,
    initialTargetDate: path.initialTargetDate, weeklyMinutes: path.weeklyMinutes, requiredMinutes: terms.requiredMinutes, difficulty: terms.difficulty,
    placementAttemptId: path.placementAttemptId, paused: path.paused, pausedAt: path.pausedAt, resumeDate: path.resumeDate,
    validatedRevision: path.validatedRevision,
    steps: [...path.steps].sort((a, b) => a.position - b.position).map((step) => {
      const span = plan?.levels.find((level) => level.levelCode === step.levelCode);
      const own = sessions.filter((session) => session.levelCode === step.levelCode);
      return {
        id: step.id, position: step.position, levelCode: step.levelCode, levelTitle: levelTitle(step.levelCode), trackVersionId: step.trackVersionId,
        trackVersionNumber: step.trackVersionNumber, status: step.status, enrollmentId: step.enrollmentId, goalStatus: step.goalStatus,
        plannedMinutes: plannedMinutes(step.levelCode), firstDate: own[0]?.date ?? span?.firstDate ?? null,
        lastDate: own.at(-1)?.date ?? span?.lastDate ?? null, sessionsTotal: own.length || span?.sessionCount || 0,
        sessionsCompleted: own.filter((session) => session.status === 'completed').length, finalDecision: step.finalDecision,
      };
    }),
    availability: path.availability,
    proposal: proposal ? { number: proposal.number, status: proposal.status, overflowCount: proposal.overflowCount,
      validatable: decorate(path, proposal, actor).validatable, createdAt: proposal.createdAt } : null,
    sessions,
    contract: { current: current ? contractView(path, current, actor) : null,
      pending: pendingContract(path) ? contractView(path, pendingContract(path) as ContractRec, actor) : null,
      engaged: path.contracts.some((contract) => contract.status === 'accepted' || contract.status === 'superseded') },
    permissions: permissionsOf(path, actor),
  };
}

function onboarding(actor: UserRec): OnboardingState {
  requireLearner(actor);
  const accompanied = Boolean(actor.teacherId);
  const teacher = actor.teacherId ? userById(actor.teacherId) : undefined;
  const attempts = learnerPlacements(actor.id).filter((attempt) => attempt.status !== 'abandoned');
  const placement = attempts[0];
  const path = latestPath(actor.id);
  const language = findLanguage(actor.languageId);
  const placed = placement?.status === 'completed' ? placement.placedLevel : null;
  const blockedReason: OnboardingState['blockedReason'] = actor.languageId && language?.status !== 'available' ? 'language_unavailable'
    : actor.languageId && !state().placementTests.some((test) => test.languageId === actor.languageId && test.status === 'published') && !placement ? 'placement_unavailable'
      : placed && !path && allowedTargets(placed).length === 0 ? 'no_target_available' : null;
  const started = path?.status === 'active' || path?.status === 'completed';
  const step = (id: OnboardingStep['id'], done: boolean, reachable: boolean): OnboardingStep => ({ id, status: done ? 'done' : reachable ? 'current' : 'todo' });
  const steps: OnboardingStep[] = [
    step('language', Boolean(actor.languageId), true),
    step('placement', placement?.status === 'completed', Boolean(actor.languageId)),
    step('result', placement?.status === 'completed', false),
    step('objective', Boolean(path), placement?.status === 'completed'),
    step('days', started || Boolean(path?.availabilityConfirmed), Boolean(path)),
    step('planning', started, Boolean(path?.availabilityConfirmed)),
    step('start', started, false),
  ];
  // Une seule étape en cours : la première qui n'est pas faite.
  let found = false;
  for (const item of steps) {
    if (item.status === 'done') continue;
    item.status = found ? 'todo' : 'current';
    found = true;
  }
  if (blockedReason) {
    const blocked = steps.find((item) => item.status === 'current');
    if (blocked) blocked.status = 'blocked';
  }
  return {
    accompanied, languageId: actor.languageId, languageLocked: accompanied && Boolean(actor.languageId),
    teacher: teacher ? { id: teacher.id, displayName: teacher.displayName } : null,
    placement: placement ? { attemptId: placement.id, status: placement.status, placedLevel: placement.placedLevel, completedAt: placement.completedAt } : null,
    path: path && path.status !== 'withdrawn' ? { id: path.id, status: path.status as 'draft' | 'active' | 'completed', validatedRevision: path.validatedRevision } : null,
    steps, completed: started, blockedReason,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Contrats
// ---------------------------------------------------------------------------------------------------------------------

function applyTerms(path: PathRec, terms: ContractTerms) {
  Object.assign(path, { startLevel: terms.startLevel, targetLevel: terms.targetLevel, targetDate: terms.targetDate,
    weeklyMinutes: terms.weeklyMinutes, availability: terms.availability });
  buildSteps(path);
  path.proposal = computeProposal(path);
  if (decorate(path, path.proposal, null).validatable) validateCurrent(path);
}

function proposeContract(actor: UserRec, path: PathRec, body: Json) {
  if (path.status !== 'active') throw conflict('Un contrat se propose sur un parcours démarré.');
  const learner = learnerById(path.learnerId);
  const owner = actor.id === learner.id;
  if (!owner && !isReferent(actor, learner)) throw forbidden('Seuls l’élève et son professeur référent proposent un contrat.');
  const proposedBy: ContractProposer = owner ? 'learner' : actor.role === 'admin' ? 'admin' : 'teacher';
  if (!levelCodes.includes(body.targetLevel as LevelCode)) throw invalid('Niveau visé inconnu.');
  if (!isDate(body.targetDate) || body.targetDate <= today()) throw invalid('La date visée doit être à venir.');
  if (!Number.isInteger(body.weeklyMinutes) || Number(body.weeklyMinutes) < 0 || Number(body.weeklyMinutes) > 5040) throw invalid('Engagement hebdomadaire invalide.');
  if (body.startLevel !== undefined && owner && body.startLevel !== path.startLevel) throw forbidden('Seul le professeur peut changer le niveau de départ.');
  const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 1000) : null;
  const availability = body.availability === undefined ? path.availability : checkDays(body.availability);
  const startLevel = (body.startLevel ?? path.startLevel) as StartLevel;
  const targetLevel = body.targetLevel as LevelCode;
  if (!allowedTargets(startLevel).includes(targetLevel) && !path.steps.some((step) => step.levelCode === targetLevel && step.status !== 'withdrawn')) {
    throw conflict('Ce niveau visé n’est pas proposé pour cet élève.');
  }
  const weeklyMinutes = Number(body.weeklyMinutes);
  if (weeklyMinutesOf(availability) < weeklyMinutes) throw conflict('Les jours choisis offrent moins de temps que l’engagement hebdomadaire proposé.');
  const terms = termsOf(path, { startLevel, targetLevel, targetDate: body.targetDate, weeklyMinutes, availability });
  if (terms.difficulty.code === 'unrealistic') throw conflict('Ce rythme n’est pas tenable : choisissez une date visée plus lointaine.');
  // Toute proposition dont le planning déborde est refusée.
  const trial: PathRec = structuredClone(path);
  Object.assign(trial, { startLevel, targetLevel, targetDate: body.targetDate, availability });
  buildSteps(trial);
  if (computeProposal(trial).overflowCount > 0) throw conflict('Le planning de cette proposition déborde : ajoutez du temps ou choisissez une date plus lointaine.');

  const pending = pendingContract(path);
  const decided = { decidedAt: now(), decidedBy: actor.id };
  let status: ContractStatus;
  if (pending) {
    const counter = (pending.status === 'pending_teacher' && proposedBy !== 'learner') || (pending.status === 'pending_learner' && proposedBy === 'learner');
    Object.assign(pending, counter ? { status: 'rejected', ...decided, decisionNote: note } : { status: 'withdrawn', ...decided });
    status = proposedBy === 'learner' ? 'pending_teacher' : 'pending_learner';
  } else if (proposedBy === 'learner') {
    status = learner.teacherId ? 'pending_teacher' : 'accepted';
  } else {
    status = 'pending_learner';
  }
  const contract: ContractRec = { number: Math.max(0, ...path.contracts.map((item) => item.number)) + 1, status, proposedBy, proposerId: actor.id,
    terms, note, createdAt: now(), decidedAt: status === 'accepted' ? now() : null, decidedBy: null, decisionNote: null };
  const engagedBefore = path.contracts.some((item) => item.status === 'accepted' || item.status === 'superseded');
  if (status === 'accepted') for (const item of path.contracts) if (item.status === 'accepted') item.status = 'superseded';
  path.contracts.push(contract);
  // Tant qu'aucun contrat n'a été accepté, les propositions de l'élève s'appliquent tout de suite.
  if (status === 'accepted' || (proposedBy === 'learner' && !engagedBefore)) applyTerms(path, terms);
  return { status: 201, body: contractView(path, contract, actor) };
}

function decideContract(actor: UserRec, path: PathRec, number: number, accept: boolean, body: Json) {
  const contract = path.contracts.find((item) => item.number === number);
  if (!contract) throw notFound('Contrat introuvable.');
  if (contract !== pendingContract(path)) throw conflict('Ce contrat n’attend plus de décision.');
  if (!contractSide(contract, actor, path)) throw forbidden('La décision revient à l’autre partie du contrat.');
  const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 1000) : null;
  Object.assign(contract, { decidedAt: now(), decidedBy: actor.id, decisionNote: note });
  if (accept) {
    for (const item of path.contracts) if (item.status === 'accepted') item.status = 'superseded';
    contract.status = 'accepted';
    applyTerms(path, contract.terms);
  } else {
    contract.status = 'rejected';
  }
  return pathView(path, actor);
}

function pendingContracts(actor: UserRec): PendingContract[] {
  if (actor.role !== 'teacher' && actor.role !== 'admin') throw forbidden('Réservé aux professeurs et à l’administration.');
  return state().paths.flatMap((path) => {
    const learner = userById(path.learnerId) as UserRec;
    const pending = pendingContract(path);
    if (!pending || pending.status !== 'pending_teacher' || !isReferent(actor, learner)) return [];
    return [{ pathId: path.id, learnerId: learner.id, learnerName: learner.displayName, languageId: path.languageId,
      contract: contractView(path, pending, actor),
      path: { startLevel: path.startLevel, targetLevel: path.targetLevel, targetDate: path.targetDate, status: path.status } }];
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// Ajouts de cours
// ---------------------------------------------------------------------------------------------------------------------

function additionView(path: PathRec, addition: AdditionRec): Addition {
  const items = additionItems(addition, addition.stepLevel);
  const done = items.filter((item) => itemDone(path, addition.stepLevel, item.id)).length;
  const started = items.some((item) => path.progress[progressKey(addition.stepLevel, item.id)]);
  return { id: addition.id, pathId: path.id, stepLevel: addition.stepLevel, sourceTrackVersionId: addition.sourceTrackVersionId,
    sourceLevelCode: addition.sourceLevelCode, moduleId: addition.moduleId, activityId: addition.activityId, title: addition.title,
    minutes: addition.minutes, placement: addition.placement, note: addition.note, addedBy: addition.addedBy, addedAt: addition.addedAt,
    removedAt: addition.removedAt, status: items.length && done === items.length ? 'completed' : started ? 'in_progress' : 'planned' };
}

function addCourse(actor: UserRec, path: PathRec, body: Json): { status: number; body: AdditionCreated } {
  if (!permissionsOf(path, actor).canAddCourses) throw forbidden('Les cours sont ajoutés par le professeur référent ou l’administration.');
  const step = path.steps.find((item) => item.levelCode === body.stepLevel && (item.status === 'active' || item.status === 'planned'));
  if (!step) throw conflict('Ce niveau n’est pas en cours ni prévu dans le parcours.');
  const source = typeof body.trackVersionId === 'string' ? versionLevel(body.trackVersionId) : undefined;
  if (!source) throw notFound('Version de parcours introuvable.');
  const module = source.modules.find((item) => item.id === body.moduleId);
  if (!module) throw notFound('Module introuvable dans cette version.');
  const activity = typeof body.activityId === 'string' ? module.activities.find(([id]) => id === body.activityId) : undefined;
  if (body.activityId !== undefined && !activity) throw notFound('Activité introuvable dans ce module.');
  if (body.placement !== 'next' && body.placement !== 'end_of_level') throw invalid('Placement attendu : next ou end_of_level.');
  const addition: AdditionRec = {
    id: newId(), stepLevel: step.levelCode, sourceTrackVersionId: VERSIONS[source.code].id, sourceLevelCode: source.code, moduleId: module.id,
    activityId: activity?.[0] ?? null, title: activity?.[2] ?? module.title,
    minutes: activity?.[3] ?? module.activities.reduce((sum, [, , , minutes]) => sum + minutes, 0), placement: body.placement,
    note: typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 500) : null, addedBy: actor.id, addedAt: now(), removedAt: null, removedBy: null,
  };
  path.additions.push(addition);
  path.proposal = computeProposal(path);
  return { status: 201, body: { addition: additionView(path, addition), proposal: decorate(path, path.proposal, actor) } };
}

function removeCourse(actor: UserRec, path: PathRec, additionId: string): AdditionRemoved {
  if (!permissionsOf(path, actor).canAddCourses) throw forbidden('Les cours sont retirés par le professeur référent ou l’administration.');
  const addition = path.additions.find((item) => item.id === additionId && !item.removedAt);
  if (!addition) throw notFound('Ajout introuvable.');
  if (additionView(path, addition).status === 'completed') throw conflict('Ce cours est déjà terminé : il reste dans le parcours.');
  addition.removedAt = now();
  addition.removedBy = actor.id;
  path.proposal = computeProposal(path);
  return { proposal: decorate(path, path.proposal, actor) };
}

// ---------------------------------------------------------------------------------------------------------------------
// Activités, séances, bibliothèque, exercices
// ---------------------------------------------------------------------------------------------------------------------

function syntheticQuestions(title: string): MockQuestion[] {
  return [1, 2, 3].map((number) => ({
    id: `q${number}`, prompt: `Question ${number} sur « ${title} » : choisissez la bonne réponse.`,
    options: [{ id: 'a', text: 'Première proposition' }, { id: 'b', text: 'Deuxième proposition (réponse attendue dans le simulateur)' }, { id: 'c', text: 'Troisième proposition' }],
    answer: 'b',
  }));
}
function activityContent(level: MockLevelContent, activityId: string) {
  const found = findActivity(level, activityId);
  if (!found) return undefined;
  const [id, kind, title, minutes, competences] = found.activity;
  const detail = DETAILS[id];
  const questions = detail?.questions.length ? detail.questions : kind === 'exercise' ? syntheticQuestions(title) : [];
  return {
    module: found.module, id, kind, title, minutes, competences, questions,
    lesson: detail?.lesson ?? (kind === 'lesson' ? { title, description: `${found.module.objective}\n\nCette leçon, « ${title} », fait partie du module « ${found.module.title} ». Le simulateur en présente un résumé : la vraie API sert la leçon complète, avec ses médias.` } : null),
    transcript: detail?.transcript ?? null,
  };
}
const lessonIdOf = (activityId: string) => `lecon-${activityId}`;
const withoutAnswers = (questions: MockQuestion[]) => questions.map(({ id, prompt, options }) => ({ id, prompt, options }));

function libraryView(actor: UserRec, query: URLSearchParams): Library {
  const learner = targetLearner(actor, query);
  const path = latestPath(learner.id);
  const step = path ? activeStep(path) : undefined;
  const grades = state().grades.filter((grade) => grade.learnerId === learner.id);
  return {
    languageId: learner.languageId,
    levels: (learner.languageId === 'de' ? publishedLevels() : []).map((code) => {
      const level = levelContent(code) as MockLevelContent;
      return {
        levelCode: code, levelTitle: levelTitle(code), trackVersionId: VERSIONS[code].id, number: VERSIONS[code].number,
        inPath: Boolean(path?.steps.some((item) => item.levelCode === code && item.status !== 'withdrawn')), current: step?.levelCode === code,
        modules: level.modules.map((module, index) => ({
          id: module.id, position: index + 1, title: module.title, objective: module.objective,
          activities: module.activities.map(([id, kind, title, minutes, competences]) => {
            const last = grades.filter((grade) => grade.activityId === id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
            return { id, kind, title, estimatedMinutes: minutes, competences, lessonId: lessonIdOf(id),
              lastResult: last ? { correct: last.correct, total: last.total, submittedAt: last.submittedAt } : null };
          }),
        })),
        practice: [{ kind: 'midterm' as const, title: `Bilan intermédiaire ${code}`, available: true },
          { kind: 'final' as const, title: `Examen blanc ${code}`, available: false }],
      };
    }),
  };
}

function libraryActivity(actor: UserRec, versionId: string, activityId: string): LibraryActivity {
  if (actor.role === 'staff' && !canEditCatalogue(actor)) throw forbidden();
  const level = versionLevel(versionId);
  if (!level) throw notFound('Version introuvable.');
  const content = activityContent(level, activityId);
  if (!content) throw notFound('Activité introuvable.');
  return {
    id: content.id, position: content.module.activities.findIndex(([id]) => id === content.id) + 1, kind: content.kind, title: content.title,
    estimatedMinutes: content.minutes, competences: content.competences, status: 'todo', state: {}, completedAt: null, attemptId: null,
    lesson: content.lesson ? { id: lessonIdOf(content.id), ...content.lesson } : null, transcript: content.transcript,
    questions: withoutAnswers(content.questions), placements: [], trackVersionId: versionId, levelCode: level.code,
    moduleId: content.module.id, moduleTitle: content.module.title,
  };
}

/** Corrigé d'un exercice : séance du parcours (avec activityId) ou exercice libre de la bibliothèque. */
function gradeQuiz(actor: UserRec, body: Json, key: string | undefined) {
  requireLearner(actor);
  if (typeof body.lessonId !== 'string' || typeof body.answers !== 'object' || body.answers === null) throw invalid('Exercice et réponses attendus.');
  const activityId = typeof body.activityId === 'string' ? body.activityId : body.lessonId.replace(/^lecon-/, '');
  const sourceId = activityId.replace(/^ajout-[0-9a-f]{6}-/, '');
  const level = CONTENT.find((item) => findActivity(item, sourceId));
  const content = level ? activityContent(level, sourceId) : undefined;
  if (!content || !content.questions.length) throw notFound('Exercice introuvable.');
  const existing = key ? state().grades.find((grade) => grade.id === `${actor.id}:${key}`) : undefined;
  if (existing) return gradeView(existing);
  const answers = body.answers as Record<string, string>;
  const grade: GradeRec = { id: key ? `${actor.id}:${key}` : newId(), learnerId: actor.id, lessonId: body.lessonId, activityId,
    sessionId: typeof body.sessionId === 'string' ? body.sessionId : null,
    correct: content.questions.filter((question) => answers[question.id] === question.answer).length, total: content.questions.length, submittedAt: now() };
  state().grades.push(grade);
  return gradeView(grade);
}
const gradeView = (grade: GradeRec) => ({ kind: 'quiz', id: grade.id.includes(':') ? fixedId(Math.abs(hash(grade.id))) : grade.id, lessonId: grade.lessonId,
  correct: grade.correct, total: grade.total, submittedAt: grade.submittedAt, sessionId: grade.sessionId, activityId: grade.activityId, moduleScores: null });
function hash(text: string) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) | 0;
  return value;
}

function sessionOwner(actor: UserRec, sessionId: string) {
  for (const path of state().paths) {
    const session = path.liveSessions.find((item) => item.id === sessionId);
    if (session) { readable(actor, path.learnerId); return { path, session }; }
  }
  throw notFound('Séance introuvable.');
}
function sessionSummary(path: PathRec, session: LiveSession, position: number) {
  const status = sessionStatus(path, session);
  return {
    id: session.id, position, moduleId: session.moduleId, title: session.title, dueAt: session.dueAt,
    status: status === 'locked' ? 'planned' : status, startedAt: null, completedAt: session.completedAt, slot: session.slot,
    estimatedMinutes: session.items.reduce((sum, item) => sum + item.minutes, 0),
    activities: session.items.map((item, index) => ({ id: item.id, position: index + 1, kind: item.kind, title: item.title, estimatedMinutes: item.minutes,
      status: activityStatus(path, session.levelCode, item.id), completedAt: path.progress[progressKey(session.levelCode, item.id)]?.completedAt ?? null })),
  };
}
function sessionDetail(actor: UserRec, sessionId: string) {
  const { path, session } = sessionOwner(actor, sessionId);
  const position = path.liveSessions.filter((item) => item.levelCode === session.levelCode).sort((a, b) => a.dueAt.localeCompare(b.dueAt)).indexOf(session) + 1;
  const level = levelContent(session.levelCode) as MockLevelContent;
  return {
    session: sessionSummary(path, session, position), enrollmentId: session.enrollmentId, trackVersionId: VERSIONS[session.levelCode].id, levelCode: session.levelCode,
    activities: session.items.map((item, index) => {
      const sourceLevel = item.sourceActivityId ? CONTENT.find((candidate) => findActivity(candidate, item.sourceActivityId as string)) ?? level : level;
      const content = activityContent(sourceLevel, item.sourceActivityId ?? item.id);
      const progress = path.progress[progressKey(session.levelCode, item.id)];
      return {
        id: item.id, position: index + 1, kind: item.kind, title: item.title, estimatedMinutes: item.minutes, competences: content?.competences ?? [],
        status: activityStatus(path, session.levelCode, item.id), state: progress?.state ?? {}, completedAt: progress?.completedAt ?? null, attemptId: null,
        lesson: content?.lesson ? { id: lessonIdOf(content.id), ...content.lesson }
          : item.kind === 'review' ? { id: `lecon-${item.id}`, title: item.title, description: 'Reprenez le vocabulaire et les phrases clés du module, puis refaites les exercices où vous avez hésité.' } : null,
        transcript: content?.transcript ?? null, questions: content ? withoutAnswers(content.questions) : [], placements: [],
      };
    }),
  };
}

function recordProgress(actor: UserRec, sessionId: string, activityId: string, body: Json) {
  const { path, session } = sessionOwner(actor, sessionId);
  if (actor.id !== path.learnerId) throw forbidden('Seul l’élève avance dans ses séances.');
  const item = session.items.find((candidate) => candidate.id === activityId);
  if (!item) throw notFound('Activité introuvable dans cette séance.');
  if (item.kind === 'assessment' && body.completed) throw conflict('Le bilan et l’examen blanc se terminent par leur remise.');
  const key = progressKey(session.levelCode, activityId);
  const previous = path.progress[key];
  path.progress[key] = {
    status: body.completed || previous?.status === 'completed' ? 'completed' : 'started',
    completedAt: previous?.completedAt ?? (body.completed ? now() : null),
    state: typeof body.state === 'object' && body.state !== null ? body.state as Json : previous?.state ?? {},
  };
  if (session.items.every((candidate) => itemDone(path, session.levelCode, candidate.id))) session.completedAt ??= now();
  const position = path.liveSessions.filter((candidate) => candidate.levelCode === session.levelCode).sort((a, b) => a.dueAt.localeCompare(b.dueAt)).indexOf(session) + 1;
  return sessionSummary(path, session, position);
}

/** Inscription du niveau actif, dans sa forme historique (GET /learning/enrollment), avec pathId. */
function enrollmentView(actor: UserRec, query: URLSearchParams) {
  const learner = targetLearner(actor, query);
  const path = latestPath(learner.id);
  const step = path && (activeStep(path) ?? [...path.steps].filter((item) => item.status === 'completed').sort((a, b) => b.position - a.position)[0]);
  if (!path || !step?.enrollmentId) return null;
  const own = path.liveSessions.filter((session) => session.levelCode === step.levelCode).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const level = levelContent(step.levelCode) as MockLevelContent;
  const lastDate = own.at(-1)?.date ?? path.targetDate;
  const proposal = path.proposal ?? path.validatedPlan;
  return {
    id: step.enrollmentId, learnerId: learner.id, levelCode: step.levelCode, trackVersionId: step.trackVersionId, trackVersionNumber: step.trackVersionNumber,
    assignedBy: path.createdBy, assignedAt: step.activatedAt ?? path.createdAt, status: step.status === 'active' ? 'active' : 'completed',
    sessions: own.map((session, index) => sessionSummary(path, session, index + 1)),
    goal: {
      startLevel: step.position === 1 ? path.startLevel : levelCodes[step.position - 2], targetLevel: step.levelCode, startDate: (step.activatedAt ?? now()).slice(0, 10),
      targetDate: step.levelCode === path.targetLevel ? path.targetDate : lastDate, initialTargetDate: path.initialTargetDate, template: 'custom',
      status: step.goalStatus ?? 'active', pausedAt: path.pausedAt, resumeDate: path.resumeDate,
      successCriteria: `Obtenir au moins ${level.settings.passPercent} % à l’examen blanc ${step.levelCode}.`,
      expectedCompetences: ['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'], prerequisiteLevel: step.position > 1 ? levelCodes[step.position - 2] : null,
      prerequisiteMet: true, acquiredModules: [], validatedRevision: path.validatedRevision, accompanied: Boolean(learner.teacherId),
      diagnosticLessonId: null, diagnosticAttemptId: null, diagnosticModules: null, diagnosticPrerequisite: null, startingPointConfirmedAt: step.activatedAt,
    },
    availability: path.availability,
    proposal: proposal ? { number: proposal.number, status: proposal.status, capacityMinutes: proposal.capacityMinutes, requiredMinutes: proposal.requiredMinutes,
      overflowCount: proposal.overflowCount, createdAt: proposal.createdAt, validatable: decorate(path, proposal, actor).validatable } : null,
    supersededSessions: 0, pathId: path.id,
  };
}
function pathOfEnrollment(actor: UserRec, enrollmentId: string) {
  const path = state().paths.find((item) => item.steps.some((step) => step.enrollmentId === enrollmentId));
  if (!path) throw notFound('Inscription introuvable.');
  readable(actor, path.learnerId);
  return path;
}

// ---------------------------------------------------------------------------------------------------------------------
// Entraînement et examens (simplifiés)
// ---------------------------------------------------------------------------------------------------------------------

const option = (labels: string[]) => labels.map((label, index) => ({ id: 'abcd'[index], label }));
function examParts(levelCode: LevelCode, kind: ExamKind, practice: boolean): PracticePart[] {
  const a2 = levelCode !== 'A1';
  const parts: PracticePart[] = [
    { id: 'lecture', competence: 'lecture', mode: 'closed', title: a2 ? 'Lire une annonce de logement' : 'Lire un message', criteria: [], selfPractice: false, placements: [],
      instructions: a2
        ? 'Lisez l’annonce, puis répondez aux questions.\n\nSchöne 2-Zimmer-Wohnung in Leipzig-Gohlis, 58 m², Balkon, 4. Stock ohne Aufzug.\nMiete: 620 € warm. Frei ab 1. März. Haustiere nach Absprache.\nBesichtigung: Samstag, 10 bis 12 Uhr.'
        : 'Lisez le message de Lena, puis répondez aux questions.\n\nHallo Paula,\nich bin heute im Café am Markt. Ich möchte einen Kaffee und eine Brezel.\nKommst du auch? Wir sind um drei Uhr da.\nLiebe Grüße, Lena',
      questions: a2 ? [
        { id: 'q1', prompt: 'Combien de pièces a l’appartement ?', options: option(['Deux', 'Trois', 'Quatre']) },
        { id: 'q2', prompt: 'Que comprend le loyer ?', options: option(['Les charges', 'Le garage', 'L’électricité seulement']) },
        { id: 'q3', prompt: 'Quand peut-on visiter ?', options: option(['Le samedi matin', 'Le vendredi soir', 'Tous les jours']) },
      ] : [
        { id: 'q1', prompt: 'Où est Lena aujourd’hui ?', options: option(['Au café', 'À la gare', 'Au supermarché']) },
        { id: 'q2', prompt: 'Que veut-elle commander ?', options: option(['Un café et un bretzel', 'Un thé et un gâteau', 'Une soupe']) },
        { id: 'q3', prompt: 'À quelle heure Paula peut-elle venir ?', options: option(['À trois heures', 'À deux heures', 'À quatre heures']) },
      ] },
    { id: 'ecoute', competence: 'ecoute', mode: 'closed', title: 'Écouter un dialogue', criteria: [], selfPractice: false,
      instructions: 'Écoutez le dialogue deux fois, puis répondez. (Le simulateur fournit un son muet.)',
      placements: [{ position: 1, assetId: `${levelCode.toLowerCase()}-${kind}-ecoute`, assetVersion: 1, usage: 'audio', alt: null, caption: 'Im Alltag' }],
      questions: [
        { id: 'q4', prompt: 'Où se passe la conversation ?', options: option(['Dans un magasin', 'À l’école', 'Chez le médecin']) },
        { id: 'q5', prompt: 'Que décide la personne ?', options: option(['Elle revient demain', 'Elle achète tout de suite', 'Elle appelle un ami']) },
      ] },
    { id: 'ecrit', competence: 'expression-ecrite', mode: 'written', title: 'Écrire un court message', questions: [], placements: [], selfPractice: practice,
      instructions: a2 ? 'Vous répondez à l’annonce : présentez-vous et proposez une date de visite (50 à 70 mots).' : 'Présentez-vous en 30 à 50 mots : prénom, âge, ville, ce que vous aimez manger.',
      criteria: [{ id: 'consigne', label: 'Respect de la consigne', maxPoints: 4 }, { id: 'vocabulaire', label: 'Vocabulaire', maxPoints: 3 }, { id: 'grammaire', label: 'Grammaire et orthographe', maxPoints: 3 }] },
  ];
  if (practice) {
    parts.push({ id: 'oral', competence: 'expression-orale', mode: 'oral', title: 'Parler une minute', questions: [], placements: [], selfPractice: true,
      instructions: 'Entraînez-vous à voix haute : présentez-vous et racontez votre journée pendant une minute.',
      criteria: [{ id: 'aisance', label: 'Aisance et clarté', maxPoints: 5 }, { id: 'prononciation', label: 'Prononciation', maxPoints: 5 }] });
  }
  return parts;
}
const CLOSED_ANSWERS: Record<string, string> = { q1: 'a', q2: 'a', q3: 'a', q4: 'a', q5: 'a' };
const examTitle = (kind: ExamKind, levelCode: string) => `${kind === 'final' ? 'Examen blanc' : 'Bilan intermédiaire'} ${levelCode}`;
function closedScores(parts: PracticePart[], answers: Record<string, Record<string, string>>) {
  const scores: Record<string, { correct: number; total: number }> = {};
  for (const part of parts.filter((item) => item.mode === 'closed')) {
    scores[part.id] = { correct: part.questions.filter((question) => answers[part.id]?.[question.id] === CLOSED_ANSWERS[question.id]).length, total: part.questions.length };
  }
  return scores;
}

function practiceView(attempt: PracticeRec): PracticeView {
  const parts = examParts(attempt.levelCode, attempt.kind, true);
  const audio = silentAudioUrl();
  return {
    id: attempt.id, learnerId: attempt.learnerId, trackVersionId: attempt.trackVersionId, levelCode: attempt.levelCode, kind: attempt.kind, mode: 'practice',
    status: attempt.status, definition: { title: examTitle(attempt.kind, attempt.levelCode), description: 'Entraînement libre : seules les parties fermées sont corrigées, sans révéler les bonnes réponses.',
      levelCode: attempt.levelCode, passPercent: levelContent(attempt.levelCode)?.settings.passPercent ?? 60, parts },
    answers: attempt.answers,
    media: Object.fromEntries(parts.flatMap((part) => part.placements).map((placement) => [`${placement.assetId}@${placement.assetVersion}`, audio ?? ''])),
    result: attempt.result, startedAt: attempt.startedAt, submittedAt: attempt.submittedAt,
    nextAttemptAt: attempt.submittedAt ? inHours(attempt.submittedAt, 12) : null,
  };
}
const practiceSummary = (attempt: PracticeRec): PracticeSummary => ({
  id: attempt.id, trackVersionId: attempt.trackVersionId, levelCode: attempt.levelCode, kind: attempt.kind, status: attempt.status,
  title: examTitle(attempt.kind, attempt.levelCode), percent: attempt.result?.percent ?? null, startedAt: attempt.startedAt, submittedAt: attempt.submittedAt,
});
function findPractice(actor: UserRec, id: string) {
  const attempt = state().practice.find((item) => item.id === id);
  if (!attempt) throw notFound('Entraînement introuvable.');
  if (attempt.learnerId !== actor.id) throw forbidden('Cet entraînement appartient à un autre élève.');
  return attempt;
}
function startPractice(actor: UserRec, body: Json) {
  requireLearner(actor);
  const level = typeof body.trackVersionId === 'string' ? versionLevel(body.trackVersionId) : undefined;
  if (!level) throw notFound('Version introuvable.');
  if (body.kind === 'final') throw conflict('L’examen blanc valide le passage de niveau : il reste réservé à votre parcours. Entraînez-vous sur le bilan intermédiaire.');
  if (body.kind !== 'midterm') throw invalid('Type d’entraînement inconnu.');
  const mine = state().practice.filter((item) => item.learnerId === actor.id && item.trackVersionId === body.trackVersionId && item.kind === 'midterm');
  const open = mine.find((item) => item.status === 'in_progress');
  if (open) return { status: 200, body: practiceView(open) };
  const last = mine.filter((item) => item.submittedAt).sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''))[0];
  if (last?.submittedAt && new Date(inHours(last.submittedAt, 12)) > new Date()) {
    throw conflict(`Prochain essai possible à partir du ${longMoment(inHours(last.submittedAt, 12))}.`);
  }
  const attempt: PracticeRec = { id: newId(), learnerId: actor.id, trackVersionId: body.trackVersionId as string, levelCode: level.code, kind: 'midterm',
    status: 'in_progress', answers: {}, submitKeys: [], result: null, startedAt: now(), submittedAt: null };
  state().practice.push(attempt);
  return { status: 201, body: practiceView(attempt) };
}
function savePractice(actor: UserRec, id: string, body: Json) {
  const attempt = findPractice(actor, id);
  if (attempt.status !== 'in_progress') throw conflict('Cet entraînement est déjà remis.');
  if (typeof body.answers !== 'object' || body.answers === null) throw invalid('Réponses attendues.');
  attempt.answers = body.answers as PracticeRec['answers'];
  return practiceView(attempt);
}
function submitPractice(actor: UserRec, id: string, requestKey: string | undefined) {
  const key = submitKey(requestKey);
  const attempt = findPractice(actor, id);
  if (attempt.status === 'submitted' && key && attempt.submitKeys.includes(key)) return practiceView(attempt);
  if (attempt.status !== 'in_progress') throw conflict('Cet entraînement est déjà remis.');
  const parts = examParts(attempt.levelCode, attempt.kind, true);
  const scores = closedScores(parts, attempt.answers);
  const correct = Object.values(scores).reduce((sum, score) => sum + score.correct, 0);
  const total = Object.values(scores).reduce((sum, score) => sum + score.total, 0);
  const percent = percentOf(correct, total);
  attempt.status = 'submitted';
  attempt.submittedAt = now();
  if (key) attempt.submitKeys.push(key);
  attempt.result = {
    percent, passed: percent >= (levelContent(attempt.levelCode)?.settings.passPercent ?? 60), parts: scores,
    competences: Object.fromEntries(parts.filter((part) => scores[part.id]).map((part) => [part.competence,
      { ...scores[part.id], percent: percentOf(scores[part.id].correct, scores[part.id].total) }])),
  };
  return practiceView(attempt);
}

function examView(exam: ExamRec, actor: UserRec) {
  const parts = examParts(exam.levelCode, exam.kind, false);
  const scores = exam.status === 'in_progress' ? null : closedScores(parts, exam.answers);
  const learner = userById(exam.learnerId) as UserRec;
  return {
    id: exam.id, enrollmentId: exam.enrollmentId, learnerId: exam.learnerId, kind: exam.kind, number: exam.number, status: exam.status,
    definition: { title: examTitle(exam.kind, exam.levelCode), description: 'Version simplifiée du simulateur : lecture, écoute et écrit.',
      passPercent: levelContent(exam.levelCode)?.settings.passPercent ?? 60, levelCode: exam.levelCode, parts },
    answers: exam.answers, texts: exam.texts, recordings: [],
    media: Object.fromEntries(parts.flatMap((part) => part.placements).map((placement) => [`${placement.assetId}@${placement.assetVersion}`, silentAudioUrl() ?? ''])),
    closedScores: scores && Object.fromEntries(Object.entries(scores).map(([part, score]) => [part, { points: score.correct, max: score.total, percent: percentOf(score.correct, score.total) }])),
    dueAt: exam.dueAt, startedAt: exam.startedAt, submittedAt: exam.submittedAt, onTime: !exam.dueAt || !exam.submittedAt || exam.submittedAt <= exam.dueAt,
    canGrade: exam.status === 'submitted' && isReferent(actor, learner), result: exam.result,
  };
}
const examSummary = (exam: ExamRec) => ({
  id: exam.id, kind: exam.kind, number: exam.number, status: exam.status, title: examTitle(exam.kind, exam.levelCode), startedAt: exam.startedAt,
  submittedAt: exam.submittedAt, dueAt: exam.dueAt, gradedAt: (exam.result?.gradedAt as string | undefined) ?? null, onTime: true,
  percent: (exam.result?.percent as number | undefined) ?? null, decision: (exam.result?.decision as string | undefined) ?? null,
});
function findExam(actor: UserRec, id: string) {
  const exam = state().exams.find((item) => item.id === id);
  if (!exam) throw notFound('Tentative introuvable.');
  readable(actor, exam.learnerId);
  return exam;
}
function startExam(actor: UserRec, body: Json) {
  requireLearner(actor);
  if (typeof body.enrollmentId !== 'string' || (body.kind !== 'midterm' && body.kind !== 'final')) throw invalid('Inscription et type attendus.');
  const path = pathOfEnrollment(actor, body.enrollmentId);
  const step = path.steps.find((item) => item.enrollmentId === body.enrollmentId) as StepRec;
  const reopen = step.status === 'completed' && step.goalStatus === 'to_consolidate' && body.kind === 'final';
  if (step.status !== 'active' && !reopen) throw conflict('Ce niveau est terminé.');
  const exams = state().exams.filter((exam) => exam.enrollmentId === body.enrollmentId && exam.kind === body.kind);
  const open = exams.find((exam) => exam.status === 'in_progress');
  if (open) return examView(open, actor);
  if (exams.some((exam) => exam.status === 'submitted')) throw conflict('Une tentative attend déjà sa correction.');
  const kind = body.kind as ExamKind;
  const slot = path.liveSessions.find((session) => session.levelCode === step.levelCode && session.items.some((item) => item.id === (kind === 'final' ? FINAL : MIDTERM)));
  const exam: ExamRec = { id: newId(), enrollmentId: body.enrollmentId, learnerId: actor.id, levelCode: step.levelCode, kind, number: exams.length + 1,
    status: 'in_progress', answers: {}, texts: {}, startedAt: now(), submittedAt: null, dueAt: slot?.dueAt ?? null, submitKeys: [], result: null };
  state().exams.push(exam);
  return { status: 201, body: examView(exam, actor) };
}
function submitExam(actor: UserRec, id: string, key: string | undefined) {
  const exam = findExam(actor, id);
  if (exam.learnerId !== actor.id) throw forbidden('Seul l’élève remet sa tentative.');
  if (exam.status !== 'in_progress') {
    if (key && exam.submitKeys.includes(key)) return examView(exam, actor);
    throw conflict('Cette tentative est déjà remise.');
  }
  exam.status = 'submitted';
  exam.submittedAt = now();
  if (key) exam.submitKeys.push(key);
  const path = pathOfEnrollment(actor, exam.enrollmentId);
  const step = path.steps.find((item) => item.enrollmentId === exam.enrollmentId) as StepRec;
  path.progress[progressKey(step.levelCode, exam.kind === 'final' ? FINAL : MIDTERM)] = { status: 'completed', completedAt: now(), state: {} };
  for (const session of path.liveSessions.filter((item) => item.levelCode === step.levelCode)) {
    if (session.items.every((item) => itemDone(path, step.levelCode, item.id))) session.completedAt ??= now();
  }
  if (exam.kind === 'final') {
    step.goalStatus = 'awaiting_grading';
    // Remise de l'examen blanc : le niveau suivant s'ouvre sans attendre la correction.
    if (step.status === 'active' && nextStep(path)) openNextLevel(path);
  }
  return examView(exam, actor);
}
function gradeExam(actor: UserRec, id: string, body: Json) {
  const exam = findExam(actor, id);
  const learner = learnerById(exam.learnerId);
  if (!isReferent(actor, learner) && !actor.permissions.includes('correction')) throw forbidden('Correction réservée au professeur référent.');
  if (exam.status !== 'submitted') throw conflict('Cette tentative n’attend pas de correction.');
  const parts = examParts(exam.levelCode, exam.kind, false);
  const closed = closedScores(parts, exam.answers);
  const given = (body.parts ?? {}) as Record<string, { points?: Record<string, number>; comment?: string }>;
  let points = Object.values(closed).reduce((sum, score) => sum + score.correct, 0);
  let max = Object.values(closed).reduce((sum, score) => sum + score.total, 0);
  for (const part of parts.filter((item) => item.mode !== 'closed')) {
    max += part.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0);
    points += part.criteria.reduce((sum, criterion) => sum + Math.min(criterion.maxPoints, Math.max(0, Number(given[part.id]?.points?.[criterion.id] ?? 0))), 0);
  }
  const percent = percentOf(points, max);
  const decision = percent >= (levelContent(exam.levelCode)?.settings.passPercent ?? 60) ? 'validated' : 'to_consolidate';
  exam.status = 'graded';
  exam.result = { percent, decision, gradedAt: now(), feedback: typeof body.feedback === 'string' ? body.feedback : null, scores: {}, comments: {}, review: [] };
  const path = pathOfEnrollment(actor, exam.enrollmentId);
  const step = path.steps.find((item) => item.enrollmentId === exam.enrollmentId) as StepRec;
  if (exam.kind === 'final') {
    step.goalStatus = decision;
    step.finalDecision = decision;
    if (decision === 'validated' && step.status === 'active' && !nextStep(path)) {
      step.status = 'completed';
      step.completedAt = now();
      path.status = 'completed';
      path.endedAt = now();
    }
  }
  return examView(exam, actor);
}

// ---------------------------------------------------------------------------------------------------------------------
// Suivi, invitations et comptes (le nécessaire pour les écrans existants)
// ---------------------------------------------------------------------------------------------------------------------

const visibleLearners = (actor: UserRec) => state().users.filter((user) => user.role === 'learner'
  && (actor.role === 'admin' || (actor.role === 'teacher' && user.teacherId === actor.id) || (actor.role === 'staff' && user.reviewerId === actor.id)));

function trackingOf(user: UserRec) {
  const path = latestPath(user.id);
  const step = path && activeStep(path);
  const sessions = path ? pathSessions(path).filter((session) => !session.locked) : [];
  const done = sessions.filter((session) => session.status === 'completed');
  return {
    enrollmentId: step?.enrollmentId ?? null, levelCode: step?.levelCode ?? null, goalStatus: step?.goalStatus ?? null,
    nextDueAt: sessions.find((session) => session.status !== 'completed')?.dueAt ?? null,
    lateSessions: sessions.filter((session) => session.status === 'late').length,
    pendingGrading: state().exams.filter((exam) => exam.learnerId === user.id && exam.status === 'submitted').length, alert: null,
    practiceMinutes: done.reduce((sum, session) => sum + session.estimatedMinutes, 0), sessionsCompleted: done.length, sessionsOnTime: done.length,
    lastActivityAt: done.at(-1)?.completedAt ?? null, alerts: [],
  };
}
function overview(actor: UserRec) {
  if (actor.role === 'learner') throw forbidden();
  const learners = visibleLearners(actor).map((user) => {
    const tracking = trackingOf(user);
    const results = state().grades.filter((grade) => grade.learnerId === user.id).map(gradeView);
    return { learnerId: user.id, profile: learnerRow(user), progress: { completedCount: tracking.sessionsCompleted, goal: tracking.levelCode ? { level: tracking.levelCode } : null },
      results, tracking };
  });
  return { learners, learnerCount: learners.length, goalsCount: learners.filter((row) => row.tracking.levelCode).length,
    learnersWithResults: learners.filter((row) => row.results.length).length, freshness: { syncedAt: now() } };
}
function learnerSheet(actor: UserRec, learnerId: string) {
  const learner = readable(actor, learnerId);
  const enrollment = enrollmentView(actor, new URLSearchParams({ learnerId }));
  const tracking = trackingOf(learner);
  return {
    profile: learnerRow(learner), enrollment, goal: enrollment ? { level: enrollment.levelCode, targetDate: enrollment.goal.targetDate } : null,
    results: state().grades.filter((grade) => grade.learnerId === learner.id).map(gradeView), completedCount: tracking.sessionsCompleted,
    messages: state().messages.filter((message) => message.learnerId === learner.id).map((message) => ({ id: message.id, text: message.text, sentAt: message.sentAt, resumedAt: null })),
    tracking, freshness: { syncedAt: now() },
  };
}
function invitationView(invitation: InvitationRec) {
  return { ...invitation, teacherName: invitation.teacherId ? userById(invitation.teacherId)?.displayName ?? null : null,
    invitedByName: userById(invitation.invitedBy)?.displayName ?? null, sentAt: invitation.lastSentAt };
}
function invite(actor: UserRec, body: Json) {
  if (actor.role !== 'teacher' && actor.role !== 'admin') throw forbidden();
  const email = String(body.email ?? '').trim().toLowerCase();
  const displayName = String(body.displayName ?? '').trim();
  const role = String(body.role ?? '') as Role;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !displayName) throw invalid('Adresse et nom attendus.');
  if (!['learner', 'teacher', 'staff'].includes(role) || (actor.role === 'teacher' && role !== 'learner')) throw forbidden('Rôle non autorisé.');
  const languageId = typeof body.languageId === 'string' ? body.languageId : role === 'learner' ? 'de' : null;
  if (languageId && findLanguage(languageId)?.status !== 'available') throw conflict('Cette langue n’est pas encore ouverte.');
  if (actor.role === 'teacher' && languageId && actor.teacherProfile && !actor.teacherProfile.languages.includes(languageId)) {
    throw conflict('Invitez dans une langue que vous enseignez.');
  }
  const invitation: InvitationRec = { id: newId(), email, displayName, role, teacherId: role === 'learner' ? (actor.role === 'teacher' ? actor.id : (body.teacherId as string | null) ?? null) : null,
    languageId: role === 'learner' ? languageId : null, invitedBy: actor.id, status: 'pending', sendCount: 1, createdAt: now(), lastSentAt: now(),
    expiresAt: inHours(now(), 24 * 7), acceptedAt: null, cancelledAt: null };
  state().invitations.unshift(invitation);
  return { status: 201, body: invitationView(invitation) };
}
function adminUser(user: UserRec) {
  return { id: user.id, displayName: user.displayName, email: user.email, role: user.role, status: user.status, permissions: user.permissions,
    teacherId: user.teacherId, teacherName: user.teacherId ? userById(user.teacherId)?.displayName ?? null : null, reviewerId: user.reviewerId,
    reviewerName: user.reviewerId ? userById(user.reviewerId)?.displayName ?? null : null, languageId: user.languageId,
    invitedAt: user.createdAt, activatedAt: user.createdAt, lastSeenAt: user.lastSeenAt, createdAt: user.createdAt };
}
const requireAdmin = (actor: UserRec) => { if (actor.role !== 'admin') throw forbidden('Réservé à l’administration.'); };
function adminDetail(id: string) {
  const user = userById(id);
  if (!user) throw notFound('Compte introuvable.');
  return { user: adminUser(user), teacherProfile: user.role === 'teacher' ? user.teacherProfile : null, teacherHistory: [], reviewerHistory: [] };
}
const emptyRate = { numerator: 0, denominator: 0, rate: null };
const parisDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });

function teacherOnboardingStats(from: string, to: string): TeacherOnboardingStats {
  const teachers = state().users.filter((user) => user.role === 'teacher' && user.status === 'active');
  const result: TeacherOnboardingStats = {
    teachers: teachers.length, byLanguage: {}, byLevel: {}, byMaxLearners: {}, byGradingDelayHours: {},
    byAvailability: { yes: 0, no: 0, unknown: 0 }, byCourseMode: { self: 0, linguacap: 0, unknown: 0 }, trend: [],
  };
  const increment = (bucket: Record<string, number>, key: string) => { bucket[key] = (bucket[key] ?? 0) + 1; };
  for (const { teacherProfile: profile } of teachers) {
    for (const id of profile?.languages.length ? profile.languages : ['unknown']) increment(result.byLanguage, id);
    for (const code of profile?.levels.length ? profile.levels : ['unknown']) increment(result.byLevel, code);
    increment(result.byMaxLearners, String(profile?.maxLearners ?? 'unknown'));
    increment(result.byGradingDelayHours, String(profile?.gradingDelayHours ?? 'unknown'));
    increment(result.byAvailability, profile?.acceptingNewStudents === true ? 'yes' : profile?.acceptingNewStudents === false ? 'no' : 'unknown');
    increment(result.byCourseMode, profile?.courseCreationMode ?? 'unknown');
  }
  const days = new Map<string, TeacherOnboardingStats['trend'][number]>();
  for (const item of state().teacherResponses ?? []) {
    if (item.date < from || item.date > to) continue;
    const day = days.get(item.date) ?? { date: item.date, responses: 0, accepting: 0, notAccepting: 0, self: 0, linguacap: 0 };
    day.responses++;
    if (item.accepting) day.accepting++;
    else day.notAccepting++;
    day[item.mode]++;
    days.set(item.date, day);
  }
  return { ...result, trend: [...days.values()].sort((a, b) => a.date.localeCompare(b.date)) };
}

// ---------------------------------------------------------------------------------------------------------------------
// Routage
// ---------------------------------------------------------------------------------------------------------------------

interface Context { actor: UserRec; body: Json; query: URLSearchParams; key: string | undefined; params: string[] }
type Handler = (context: Context) => unknown;
const UUID = '([0-9a-fA-F-]{36})';
const SLUG = '([a-z0-9][a-z0-9-]{0,79})';
const ANY = '([^/]+)';

const routes: [Method, RegExp, Handler][] = [
  // Profil et langues
  ['GET', /^\/me$/, ({ actor }) => profileOf(actor)],
  ['PUT', /^\/me\/language$/, ({ actor, body }) => chooseLanguage(actor, body)],
  ['PUT', /^\/me\/teacher-profile$/, ({ actor, body }) => saveTeacherProfile(actor, body)],
  ['GET', /^\/me\/teacher$/, ({ actor }) => teacherCard(actor)],
  ['GET', /^\/languages$/, () => languagesView()],
  ['GET', /^\/health$/, () => ({ status: 'ok' })],

  // Banque du test de niveau (éditeurs)
  ['GET', /^\/catalogue\/placement-tests$/, ({ actor }) => {
    if (!canEditCatalogue(actor)) throw forbidden('Réservé aux éditeurs du catalogue.');
    return state().placementTests.map(testSummary).sort((a, b) => b.number - a.number);
  }],
  ['POST', /^\/catalogue\/placement-tests$/, ({ actor, body }) => createPlacementTest(actor, body)],
  ['GET', new RegExp(`^/catalogue/placement-tests/${UUID}$`), ({ actor, params }) => {
    if (!canEditCatalogue(actor)) throw forbidden('Réservé aux éditeurs du catalogue.');
    return findTest(params[0]);
  }],
  ['PUT', new RegExp(`^/catalogue/placement-tests/${UUID}$`), ({ actor, params, body }) => updatePlacementTest(actor, params[0], body)],
  ['POST', new RegExp(`^/catalogue/placement-tests/${UUID}/publish$`), ({ actor, params }) => publishPlacementTest(actor, params[0])],

  // Test de niveau
  ['GET', /^\/assessments\/placements$/, ({ actor, query }) => learnerPlacements(targetLearner(actor, query).id).map(placementSummary)],
  ['POST', /^\/assessments\/placements$/, ({ actor, body }) => startPlacement(actor, body)],
  ['GET', new RegExp(`^/assessments/placements/${UUID}$`), ({ actor, params }) => {
    const attempt = findPlacement(params[0]);
    readable(actor, attempt.learnerId);
    return placementView(attempt, actor);
  }],
  ['PUT', new RegExp(`^/assessments/placements/${UUID}/answers$`), ({ actor, params, body }) => savePlacementAnswers(actor, params[0], body)],
  ['POST', new RegExp(`^/assessments/placements/${UUID}/submit$`), ({ actor, params, body, key }) => submitPlacementTier(actor, params[0], body, key)],

  // Entraînement
  ['GET', /^\/assessments\/practice$/, ({ actor }) => {
    requireLearner(actor);
    return state().practice.filter((item) => item.learnerId === actor.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt)).map(practiceSummary);
  }],
  ['POST', /^\/assessments\/practice$/, ({ actor, body }) => startPractice(actor, body)],
  ['GET', new RegExp(`^/assessments/practice/${UUID}$`), ({ actor, params }) => practiceView(findPractice(actor, params[0]))],
  ['PUT', new RegExp(`^/assessments/practice/${UUID}/answers$`), ({ actor, params, body }) => savePractice(actor, params[0], body)],
  ['POST', new RegExp(`^/assessments/practice/${UUID}/submit$`), ({ actor, params, key }) => submitPractice(actor, params[0], key)],

  // Accueil, parcours, planning
  ['GET', /^\/learning\/onboarding$/, ({ actor }) => onboarding(actor)],
  ['POST', /^\/learning\/paths\/estimate$/, ({ actor, body }) => estimate(actor, body)],
  ['POST', /^\/learning\/paths$/, ({ actor, body }) => createPath(actor, body)],
  ['GET', /^\/learning\/path$/, ({ actor, query }) => {
    const learner = targetLearner(actor, query);
    const path = latestPath(learner.id);
    return path ? pathView(path, actor) : null;
  }],
  ['PUT', new RegExp(`^/learning/paths/${UUID}/objective$`), ({ actor, params, body }) => changeObjective(actor, findPath(params[0], actor), body)],
  ['PUT', new RegExp(`^/learning/paths/${UUID}/availability$`), ({ actor, params, body }) => changeAvailability(actor, findPath(params[0], actor), body)],
  ['GET', new RegExp(`^/learning/paths/${UUID}/proposal$`), ({ actor, params }) => currentProposal(findPath(params[0], actor), actor)],
  ['POST', new RegExp(`^/learning/paths/${UUID}/proposal/validate$`), ({ actor, params, body }) => validateProposal(actor, findPath(params[0], actor), body)],
  ['POST', new RegExp(`^/learning/paths/${UUID}/pause$`), ({ actor, params }) => pausePath(actor, findPath(params[0], actor))],
  ['POST', new RegExp(`^/learning/paths/${UUID}/resume$`), ({ actor, params, body }) => resumePath(actor, findPath(params[0], actor), body)],
  ['POST', new RegExp(`^/learning/paths/${UUID}/advance$`), ({ actor, params }) => advancePath(actor, findPath(params[0], actor))],

  // Contrats
  ['GET', new RegExp(`^/learning/paths/${UUID}/contracts$`), ({ actor, params }) => {
    const path = findPath(params[0], actor);
    return [...path.contracts].sort((a, b) => b.number - a.number).map((contract) => contractView(path, contract, actor));
  }],
  ['POST', new RegExp(`^/learning/paths/${UUID}/contracts$`), ({ actor, params, body }) => proposeContract(actor, findPath(params[0], actor), body)],
  ['POST', new RegExp(`^/learning/paths/${UUID}/contracts/([1-9][0-9]{0,3})/(accept|reject)$`), ({ actor, params, body }) =>
    decideContract(actor, findPath(params[0], actor), Number(params[1]), params[2] === 'accept', body)],
  ['GET', /^\/learning\/contracts\/pending$/, ({ actor }) => pendingContracts(actor)],

  // Ajouts de cours
  ['GET', new RegExp(`^/learning/paths/${UUID}/additions$`), ({ actor, params }) => {
    const path = findPath(params[0], actor);
    return path.additions.map((addition) => additionView(path, addition));
  }],
  ['POST', new RegExp(`^/learning/paths/${UUID}/additions$`), ({ actor, params, body }) => addCourse(actor, findPath(params[0], actor), body)],
  ['POST', new RegExp(`^/learning/paths/${UUID}/additions/${UUID}/remove$`), ({ actor, params }) => removeCourse(actor, findPath(params[0], actor), params[1])],

  // Bibliothèque et exercices
  ['GET', /^\/learning\/library$/, ({ actor, query }) => libraryView(actor, query)],
  ['GET', new RegExp(`^/learning/library/${UUID}/activities/${SLUG}$`), ({ actor, params }) => libraryActivity(actor, params[0], params[1])],
  ['POST', /^\/assessments\/quiz$/, ({ actor, body, key }) => gradeQuiz(actor, body, key)],
  ['GET', /^\/assessments\/results$/, ({ actor, query }) => state().grades.filter((grade) => grade.learnerId === targetLearner(actor, query).id).map(gradeView)],

  // Inscription et séances (forme historique)
  ['GET', /^\/learning\/enrollment$/, ({ actor, query }) => enrollmentView(actor, query)],
  ['GET', new RegExp(`^/learning/sessions/${ANY}$`), ({ actor, params }) => sessionDetail(actor, params[0])],
  ['PUT', new RegExp(`^/learning/sessions/${ANY}/activities/${SLUG}/progress$`), ({ actor, params, body }) => recordProgress(actor, params[0], params[1], body)],
  ['GET', new RegExp(`^/learning/enrollments/${ANY}/proposal$`), ({ actor, params }) => currentProposal(pathOfEnrollment(actor, params[0]), actor)],
  ['PUT', new RegExp(`^/learning/enrollments/${ANY}/availability$`), ({ actor, params, body }) => changeAvailability(actor, pathOfEnrollment(actor, params[0]), body)],
  ['POST', new RegExp(`^/learning/enrollments/${ANY}/proposal/validate$`), ({ actor, params, body, query }) => {
    validateProposal(actor, pathOfEnrollment(actor, params[0]), body);
    return enrollmentView(actor, actor.role === 'learner' ? query : new URLSearchParams({ learnerId: pathOfEnrollment(actor, params[0]).learnerId }));
  }],
  ['POST', new RegExp(`^/learning/enrollments/${ANY}/pause$`), ({ actor, params }) => pausePath(actor, pathOfEnrollment(actor, params[0]))],
  ['POST', new RegExp(`^/learning/enrollments/${ANY}/resume$`), ({ actor, params, body }) => resumePath(actor, pathOfEnrollment(actor, params[0]), body)],
  ['GET', /^\/learning\/templates$/, () => []],

  // Examens (bilan intermédiaire et examen blanc simplifiés)
  ['GET', /^\/assessments\/exams$/, ({ actor, query }) => {
    const enrollmentId = query.get('enrollmentId') ?? '';
    readable(actor, pathOfEnrollment(actor, enrollmentId).learnerId);
    return state().exams.filter((exam) => exam.enrollmentId === enrollmentId).sort((a, b) => b.number - a.number).map(examSummary);
  }],
  ['POST', /^\/assessments\/exams$/, ({ actor, body }) => startExam(actor, body)],
  ['GET', new RegExp(`^/assessments/exams/${ANY}$`), ({ actor, params }) => examView(findExam(actor, params[0]), actor)],
  ['PUT', new RegExp(`^/assessments/exams/${ANY}/answers$`), ({ actor, params, body }) => {
    const exam = findExam(actor, params[0]);
    if (exam.learnerId !== actor.id || exam.status !== 'in_progress') throw conflict('Cette tentative n’est plus modifiable.');
    exam.answers = (body.answers ?? exam.answers) as ExamRec['answers'];
    exam.texts = (body.texts ?? exam.texts) as ExamRec['texts'];
    return examView(exam, actor);
  }],
  ['POST', new RegExp(`^/assessments/exams/${ANY}/submit$`), ({ actor, params, key }) => submitExam(actor, params[0], key)],
  ['POST', new RegExp(`^/assessments/exams/${ANY}/grading$`), ({ actor, params, body }) => gradeExam(actor, params[0], body)],
  ['GET', /^\/assessments\/grading$/, ({ actor }) => {
    if (actor.role === 'learner') throw forbidden();
    return state().exams.filter((exam) => exam.status === 'submitted' && isReferent(actor, learnerById(exam.learnerId))).map((exam) => ({
      id: exam.id, learnerId: exam.learnerId, learnerName: learnerById(exam.learnerId).displayName, kind: exam.kind, number: exam.number,
      levelCode: exam.levelCode, title: examTitle(exam.kind, exam.levelCode), submittedAt: exam.submittedAt, dueAt: exam.dueAt, onTime: true,
    }));
  }],

  // Suivi
  ['GET', /^\/tracking\/overview$/, ({ actor }) => overview(actor)],
  ['GET', new RegExp(`^/tracking/learners/${ANY}$`), ({ actor, params }) => learnerSheet(actor, params[0])],
  ['GET', /^\/tracking\/messages$/, ({ actor, query }) => {
    const learner = targetLearner(actor, query);
    return state().messages.filter((message) => message.learnerId === learner.id).map((message) => ({ id: message.id, text: message.text, sentAt: message.sentAt }));
  }],
  ['POST', /^\/tracking\/messages$/, ({ actor, body }) => {
    const learner = readable(actor, String(body.learnerId ?? ''));
    if (actor.id === learner.id) throw forbidden();
    const message: MessageRec = { id: newId(), learnerId: learner.id, authorId: actor.id, text: String(body.text ?? '').slice(0, 2000), sentAt: now() };
    state().messages.push(message);
    return { status: 201, body: { id: message.id, text: message.text, sentAt: message.sentAt } };
  }],
  ['GET', /^\/tracking\/kpis$/, ({ actor, query }) => {
    requireAdmin(actor);
    const from = query.get('from') || addDays(today(), -56);
    const to = query.get('to') || today();
    return { activation: emptyRate, activeLearners: [], activeLearnersTotal: 0, sessionsOnTime: emptyRate, goalsValidated: emptyRate, goalsAwaitingGrading: 0,
      progression: [], resumption: emptyRate, goals: state().paths.reduce((sum, path) => sum + path.steps.filter((step) => step.enrollmentId).length, 0),
      filters: { from, to }, freshness: { syncedAt: now(), lastStatus: 'succeeded' }, teacherOnboarding: teacherOnboardingStats(from, to) };
  }],

  // Élèves, invitations, comptes
  ['GET', /^\/learners$/, ({ actor }) => visibleLearners(actor).map(learnerRow)],
  ['GET', new RegExp(`^/learners/${ANY}$`), ({ actor, params }) => learnerRow(readable(actor, params[0]))],
  ['GET', /^\/invitations$/, ({ actor }) => state().invitations
    .filter((invitation) => actor.role === 'admin' || invitation.invitedBy === actor.id || invitation.teacherId === actor.id).map(invitationView)],
  ['POST', /^\/invitations$/, ({ actor, body }) => invite(actor, body)],
  ['POST', new RegExp(`^/invitations/${ANY}/(resend|cancel)$`), ({ actor, params }) => {
    const invitation = state().invitations.find((item) => item.id === params[0]);
    if (!invitation || (actor.role !== 'admin' && invitation.invitedBy !== actor.id)) throw notFound('Invitation introuvable.');
    if (params[1] === 'cancel') Object.assign(invitation, { status: 'cancelled', cancelledAt: now() });
    else Object.assign(invitation, { status: 'pending', sendCount: invitation.sendCount + 1, lastSentAt: now(), expiresAt: inHours(now(), 24 * 7) });
    return invitationView(invitation);
  }],
  ['GET', /^\/admin\/users$/, ({ actor }) => { requireAdmin(actor); return state().users.map(adminUser); }],
  ['GET', new RegExp(`^/admin/users/${ANY}$`), ({ actor, params }) => { requireAdmin(actor); return adminDetail(params[0]); }],
  ['PUT', new RegExp(`^/admin/users/${ANY}/(status|role|permissions|teacher|reviewer)$`), ({ actor, params, body }) => {
    requireAdmin(actor);
    const user = userById(params[0]);
    if (!user) throw notFound('Compte introuvable.');
    if (params[1] === 'status') user.status = body.status === 'disabled' ? 'disabled' : 'active';
    if (params[1] === 'role' && typeof body.role === 'string') user.role = body.role as Role;
    if (params[1] === 'permissions' && Array.isArray(body.permissions)) user.permissions = body.permissions as Permission[];
    if (params[1] === 'teacher') user.teacherId = (body.teacherId as string | null) ?? null;
    if (params[1] === 'reviewer') user.reviewerId = (body.reviewerId as string | null) ?? null;
    return adminDetail(user.id);
  }],

  // Catalogue (lecture seule) et médiathèque vide
  ['GET', /^\/tracks$/, () => publishedLevels().map((code) => {
    const level = levelContent(code) as MockLevelContent;
    return { versionId: VERSIONS[code].id, levelId: code.toLowerCase(), levelCode: code, levelTitle: levelTitle(code), language: 'de', languageId: 'de',
      number: VERSIONS[code].number, publishedAt: VERSIONS[code].publishedAt, moduleCount: level.modules.length,
      activityCount: level.modules.reduce((sum, module) => sum + module.activities.length, 0), totalMinutes: plannedMinutes(code),
      prerequisiteLevelCode: code === 'A1' ? null : levelCodes[rankOf(code) - 2], successCriteria: `Obtenir au moins ${level.settings.passPercent} % à l’examen blanc ${code}.` };
  })],
  ['GET', /^\/levels$/, () => publishedLevels().map((code, index) => ({ id: code.toLowerCase(), code, title: levelTitle(code), description: '', position: index + 1 }))],
  ['GET', /^\/catalogue\/levels$/, () => publishedLevels().map((code, index) => ({
    id: code.toLowerCase(), code, title: levelTitle(code), description: '', position: index + 1, status: 'published',
    prerequisiteLevelId: index ? levelCodes[index - 1].toLowerCase() : null, prerequisiteLevelCode: index ? levelCodes[index - 1] : null,
    versions: [{ id: VERSIONS[code].id, number: VERSIONS[code].number, status: 'published', publishedAt: VERSIONS[code].publishedAt, retiredAt: null, updatedAt: VERSIONS[code].publishedAt }],
  }))],
  ['GET', /^\/media$/, () => []],
  ['GET', /^\/media\/uploads$/, () => []],
];

/** Compte du jeton simulé « mock-<rôle> ». */
function actorOf(token: string | undefined): UserRec {
  const role = token?.startsWith('mock-') ? token.slice(5) : '';
  const user = mockAccounts[role] ? userById(mockAccounts[role]) : undefined;
  if (!user) throw new HttpError(401, 'UNAUTHENTICATED', 'Session requise.');
  if (user.status === 'disabled') throw forbidden('Ce compte est désactivé.');
  user.lastSeenAt = now();
  return user;
}

/** Remplace requestApi en mode simulateur : même signature, mêmes erreurs (Error avec le message de l'API). */
export async function mockRequest<T>(path: string, token?: string,
  options?: { method: 'POST' | 'PUT'; body?: unknown; idempotencyKey?: string }): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 160));
  const method: Method = options?.method ?? 'GET';
  const url = new URL(path, 'http://simulateur.local');
  try {
    const route = routes.find(([verb, pattern]) => verb === method && pattern.test(url.pathname));
    if (!route) throw notFound(`Route non simulée : ${method} ${url.pathname}.`);
    const actor = url.pathname === '/health' ? (undefined as unknown as UserRec) : actorOf(token);
    const body = (options ? options.body ?? {} : {}) as Json;
    if (method !== 'GET' && (typeof body !== 'object' || body === null || Array.isArray(body))) throw invalid('Un objet JSON est attendu.');
    const params = (route[1].exec(url.pathname) ?? []).slice(1);
    const result = route[2]({ actor, body, query: url.searchParams, key: options?.idempotencyKey, params });
    if (method !== 'GET') save();
    const payload = typeof result === 'object' && result !== null && 'status' in result && 'body' in result
      && typeof (result as { status: unknown }).status === 'number' && Object.keys(result).length === 2 ? (result as { body: unknown }).body : result;
    return structuredClone(payload ?? null) as T;
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 401 && token) window.dispatchEvent(new Event('linguacap:session-expired'));
      console.info(`[simulateur] ${method} ${url.pathname} → ${error.status} ${error.code} : ${error.message}`);
      throw new Error(error.message);
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Données initiales
// ---------------------------------------------------------------------------------------------------------------------

const q = (id: string, competence: PlacementCompetence, prompt: string, labels: [string, string, string]): PlacementQuestionContent => ({
  id, competence, moduleRef: null, prompt, options: labels.map((label, index) => ({ id: 'abc'[index], label, correct: index === 0 })),
  placements: competence === 'ecoute' ? [{ assetId: `placement-${id}`, assetVersion: 1, usage: 'audio', alt: null, caption: null,
    transcriptVisibility: 'hidden', decorative: false }] : [],
});
const tier = (code: LevelCode, title: string, questions: PlacementQuestionContent[]): PlacementTierContent => ({
  code, title, passPercent: 67, minCompetencePercent: 34, drawCount: 12, questions,
});
function placementBank(): PlacementTierContent[] {
  return [
    tier('A1', 'A1 · Découverte', [
      q('a1-l1', 'lecture', '« Guten Morgen! » se dit…', ['le matin', 'le soir', 'la nuit']),
      q('a1-l2', 'lecture', 'Complétez : Ich ___ Anna.', ['heiße', 'heißt', 'heißen']),
      q('a1-l3', 'lecture', '« Woher kommen Sie? » signifie…', ['D’où venez-vous ?', 'Où habitez-vous ?', 'Comment allez-vous ?']),
      q('a1-l4', 'lecture', 'Quel est le pluriel de « das Buch » ?', ['die Bücher', 'die Buchs', 'die Buche']),
      q('a1-l5', 'lecture', '« Der Kurs beginnt um halb neun. » À quelle heure commence le cours ?', ['8 h 30', '9 h 30', '9 h']),
      q('a1-l6', 'lecture', 'Complétez : Das ist ___ Tisch.', ['ein', 'eine', 'einen']),
      q('a1-l7', 'lecture', '« Bäckerei Schulz – Montag bis Samstag 6–18 Uhr, Sonntag geschlossen. » Quand la boulangerie est-elle fermée ?', ['Le dimanche', 'Le lundi', 'Le samedi']),
      q('a1-l8', 'lecture', 'Quel mot ne désigne pas un membre de la famille ?', ['der Bahnhof', 'die Schwester', 'der Onkel']),
      q('a1-e1', 'ecoute', 'Que boit la personne ?', ['Du café au lait', 'Du thé', 'De l’eau']),
      q('a1-e2', 'ecoute', 'De quel quai part le train pour Cologne ?', ['Du quai 3', 'Du quai 13', 'Du quai 30']),
      q('a1-e3', 'ecoute', 'D’où vient la personne ?', ['D’Autriche', 'De Hambourg', 'De Suisse']),
      q('a1-e4', 'ecoute', 'Combien coûte le sandwich ?', ['4,50 €', '5,40 €', '14,50 €']),
    ]),
    tier('A2', 'A2 · Survie', [
      q('a2-l1', 'lecture', 'Complétez : Gestern ___ ich ins Kino gegangen.', ['bin', 'habe', 'war']),
      q('a2-l2', 'lecture', '« Wegen Bauarbeiten fährt die Linie 5 bis Freitag nicht. » Que se passe-t-il ?', ['La ligne 5 ne circule pas jusqu’à vendredi', 'La ligne 5 circule seulement le vendredi', 'La ligne 5 est plus rapide']),
      q('a2-l3', 'lecture', '« Ich habe Kopfschmerzen. » La personne a mal…', ['à la tête', 'au ventre', 'au dos']),
      q('a2-l4', 'lecture', 'Complétez : Ich interessiere mich ___ Musik.', ['für', 'an', 'auf']),
      q('a2-l5', 'lecture', '« 2 Zimmer, Balkon, 650 € warm, ab 1. März. » Que comprend le prix ?', ['Les charges', 'Seulement le loyer', 'Le garage']),
      q('a2-l6', 'lecture', 'Complétez : Ich gebe ___ Freund ein Geschenk.', ['meinem', 'meinen', 'mein']),
      q('a2-l7', 'lecture', '« Sorry, ich komme 20 Minuten später, mein Bus hatte Verspätung. » Pourquoi la personne est-elle en retard ?', ['Son bus était en retard', 'Elle s’est réveillée tard', 'Elle a oublié le rendez-vous']),
      q('a2-l8', 'lecture', 'Quel est le contraire de « billig » ?', ['teuer', 'schnell', 'leicht']),
      q('a2-e1', 'ecoute', 'Que veut réserver la personne ?', ['Une chambre double', 'Une table pour deux', 'Un billet de train']),
      q('a2-e2', 'ecoute', 'Quel temps fera-t-il demain ?', ['Il pleuvra', 'Il fera beau', 'Il neigera']),
      q('a2-e3', 'ecoute', 'Où la personne a-t-elle mal ?', ['À la gorge', 'Au genou', 'Aux yeux']),
      q('a2-e4', 'ecoute', 'Quand a lieu le rendez-vous ?', ['Mardi à 10 h', 'Lundi à 14 h', 'Jeudi à 9 h']),
    ]),
    tier('B1', 'B1 · Seuil', [
      q('b1-l1', 'lecture', 'Complétez : Obwohl es regnete, ___ wir spazieren.', ['gingen', 'gehen wir', 'sind']),
      q('b1-l2', 'lecture', 'Complétez : Das ist der Mann, ___ ich gestern geholfen habe.', ['dem', 'den', 'der']),
      q('b1-l3', 'lecture', '« Bewerbungen bitte bis zum 15. Mai ausschließlich per E-Mail. » Comment faut-il postuler ?', ['Uniquement par courriel', 'Par courrier ou par courriel', 'Sur place']),
      q('b1-l4', 'lecture', '« Ich hätte gern mehr Zeit für meine Hobbys. » La personne exprime…', ['un souhait', 'un regret passé', 'un ordre']),
      q('b1-l5', 'lecture', 'Complétez : Wenn ich mehr Geld hätte, ___ ich reisen.', ['würde', 'werde', 'wurde']),
      q('b1-l6', 'lecture', '« Der Termin wurde auf nächste Woche verschoben. » Qu’est-il arrivé au rendez-vous ?', ['Il a été reporté', 'Il a été annulé', 'Il a été avancé']),
      q('b1-l7', 'lecture', 'Complétez : Ich freue mich ___ das Wochenende.', ['auf', 'über', 'für']),
      q('b1-l8', 'lecture', '« Trotz der hohen Preise sind die Konzerte immer ausverkauft. » Que dit le texte ?', ['Les concerts sont complets malgré les prix', 'Les concerts sont bon marché', 'Les concerts sont annulés']),
      q('b1-e1', 'ecoute', 'Pourquoi la personne change-t-elle de travail ?', ['Pour avoir des horaires plus souples', 'Pour gagner plus', 'Pour déménager']),
      q('b1-e2', 'ecoute', 'Que conseille le médecin ?', ['De se reposer quelques jours', 'De faire du sport', 'De partir en voyage']),
      q('b1-e3', 'ecoute', 'Quel est l’avis de la personne sur le film ?', ['Elle l’a trouvé trop long', 'Elle l’a adoré', 'Elle ne l’a pas vu']),
      q('b1-e4', 'ecoute', 'Qu’est-ce qui est annoncé ?', ['Un retard de 15 minutes', 'Un changement de quai', 'Une annulation']),
    ]),
  ];
}

function seed(): State {
  const created = addDays(today(), -30);
  const user = (id: string, displayName: string, role: Role, extra: Partial<UserRec> = {}): UserRec => ({
    id, displayName, role, email: `${displayName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.')}@exemple.fr`,
    permissions: [], teacherId: null, reviewerId: null, languageId: null, teacherProfile: null, status: 'active', createdAt: at(created, 9), lastSeenAt: null, ...extra,
  });
  current = {
    version: STATE_VERSION,
    users: [
      user(IDS.autonome, 'Hugo Petit', 'learner'),
      user(IDS.suivi, 'Léa Durand', 'learner', { teacherId: IDS.weber, languageId: 'de' }),
      user(IDS.yanis, 'Yanis Benali', 'learner', { teacherId: IDS.weber, languageId: 'de' }),
      user(IDS.awa, 'Awa Diallo', 'learner', { teacherId: IDS.weber, languageId: 'de' }),
      user(IDS.weber, 'Marie Weber', 'teacher', { teacherProfile: { languages: ['de'], levels: ['A1', 'A2'], maxLearners: 25, gradingDelayHours: 48,
        bio: 'Professeure d’allemand depuis douze ans, j’aime les cours vivants et les petits progrès de chaque semaine.', onboardedAt: at(created, 10),
        acceptingNewStudents: true, courseCreationMode: 'linguacap' } }),
      user(IDS.braun, 'Lukas Braun', 'teacher', { teacherProfile: { languages: ['de'], levels: [], maxLearners: null, gradingDelayHours: null, bio: '',
        onboardedAt: null, acceptingNewStudents: null, courseCreationMode: null } }),
      user(IDS.morel, 'Inès Morel', 'admin'),
      user(IDS.richter, 'Jonas Richter', 'staff', { permissions: ['catalogue', 'correction'] }),
    ],
    invitations: [],
    placementTests: [{ id: IDS.test, languageId: 'de', number: 1, status: 'published', title: 'Test de niveau d’allemand',
      description: 'Trois paliers alignés sur le cadre européen : A1, A2 puis B1. Le test s’arrête au premier palier non validé.',
      tiers: placementBank(), updatedAt: at(created, 9), publishedAt: at(created, 9) }],
    placements: [], paths: [], practice: [], grades: [], exams: [], messages: [],
    teacherResponses: [{ teacherId: IDS.weber, date: created, accepting: true, mode: 'linguacap' }],
  };
  const invitation = (learner: UserRec): InvitationRec => ({ id: newId(), email: learner.email, displayName: learner.displayName, role: 'learner',
    teacherId: IDS.weber, languageId: 'de', invitedBy: IDS.weber, status: 'accepted', sendCount: 1, createdAt: at(created, 11), lastSentAt: at(created, 11),
    expiresAt: at(addDays(created, 7), 11), acceptedAt: at(addDays(created, 1), 8), cancelledAt: null });
  current.invitations.push(...[IDS.suivi, IDS.yanis, IDS.awa].map((id) => invitation(userById(id) as UserRec)));

  // Yanis : parcours A1 → A2 démarré il y a dix jours, contrat n°1 en attente du professeur.
  seedPath(userById(IDS.yanis) as UserRec, { placed: 'A0', target: 'A2', startOffset: -10, months: 6, doneUntil: -3 });
  // Awa : parcours A2 démarré il y a trois semaines, contrat accepté et un module A1 ajouté par le professeur.
  const awa = seedPath(userById(IDS.awa) as UserRec, { placed: 'A1', target: 'A2', startOffset: -21, months: 4, doneUntil: -2 });
  const contract = awa.contracts[0];
  Object.assign(contract, { status: 'accepted', decidedAt: at(addDays(today(), -20), 9), decidedBy: IDS.weber, decisionNote: 'Très bon objectif, on y va !' });
  const weber = userById(IDS.weber) as UserRec;
  addCourse(weber, awa, { stepLevel: 'A2', trackVersionId: VERSIONS.A1.id, moduleId: 'a1-essen', placement: 'end_of_level', note: 'Pour revoir les quantités et les prix.' });
  fitAvailability(awa);
  contract.terms = termsOf(awa, { weeklyMinutes: contract.terms.weeklyMinutes });
  validateCurrent(awa);
  current.messages.push({ id: newId(), learnerId: IDS.awa, authorId: IDS.weber, text: 'Bravo pour cette belle régularité ! J’ai ajouté une révision du module « Essen » avant l’examen blanc.', sentAt: at(addDays(today(), -1), 9) });
  return current;
}

/** Données initiales : allonge les séances jusqu'à ce que le planning tienne (aucun débordement). */
function fitAvailability(path: PathRec) {
  path.proposal = computeProposal(path);
  while (path.proposal.overflowCount > 0 && path.availability.some((day) => day.minutes < 240)) {
    path.availability = path.availability.map((day) => ({ ...day, minutes: Math.min(240, day.minutes + 5) }));
    path.proposal = computeProposal(path);
  }
}

function seedPath(learner: UserRec, options:{ placed: StartLevel; target: LevelCode; startOffset: number; months: number; doneUntil: number }) {
  const startDate = addDays(today(), options.startOffset);
  const completedAt = at(addDays(startDate, -1), 10);
  const placement: PlacementRec = { id: newId(), learnerId: learner.id, languageId: 'de', testId: IDS.test, testNumber: 1, status: 'completed', currentTier: null,
    tiers: placementBank().map((item, index) => {
      const passed = rankOf(item.code) <= rankOf(options.placed);
      const reached = rankOf(item.code) <= rankOf(options.placed) + 1;
      return { code: item.code, title: item.title, passPercent: 67, minCompetencePercent: 34, status: !reached ? 'locked' : passed ? 'passed' : 'failed',
        correct: reached ? (passed ? 10 : 5) : null, total: reached ? 12 : null, percent: reached ? (passed ? 83 : 42) : null,
        competences: reached ? { lecture: { correct: passed ? 7 : 3, total: 8, percent: passed ? 88 : 38 }, ecoute: { correct: passed ? 3 : 2, total: 4, percent: passed ? 75 : 50 } } : null,
        ...(index < 0 ? {} : {}) };
    }),
    questions: [], savedAnswers: {}, submitKeys: {}, declaredBeginner: false, placedLevel: options.placed, startedAt: at(addDays(startDate, -1), 9), completedAt };
  state().placements.push(placement);
  const targetDate = addDays(startDate, options.months * 30);
  const result = estimateFor(learner, { startLevel: options.placed, targetLevel: options.target, startDate, targetDate });
  const path: PathRec = {
    id: newId(), learnerId: learner.id, languageId: 'de', status: 'draft', startLevel: options.placed, targetLevel: options.target, startDate, targetDate,
    initialTargetDate: targetDate, weeklyMinutes: result.requiredWeeklyMinutes, placementAttemptId: placement.id, origin: 'onboarding', paused: false, pausedAt: null,
    resumeDate: null, validatedRevision: 0, revisionCounter: 0, availability: result.suggestedAvailability, availabilityConfirmed: true, steps: [], proposal: null,
    validatedPlan: null, liveSessions: [], contracts: [], additions: [], progress: {}, createdBy: learner.id, createdAt: at(startDate, 8), endedAt: null,
  };
  buildSteps(path);
  state().paths.push(path);
  fitAvailability(path);
  validateProposal(learner, path, { number: (path.proposal as PathProposal).number });
  const step = activeStep(path) as StepRec;
  step.activatedAt = at(startDate, 8);
  for (const contract of path.contracts) contract.createdAt = at(startDate, 8);
  // Séances passées : terminées jusqu'à doneUntil, la suivante est en retard.
  for (const session of path.liveSessions) {
    if (session.date > addDays(today(), options.doneUntil)) continue;
    for (const item of session.items) {
      if (item.kind === 'assessment') continue;
      path.progress[progressKey(session.levelCode, item.id)] = { status: 'completed', completedAt: at(session.date, 19), state: {} };
    }
    if (session.items.every((item) => itemDone(path, session.levelCode, item.id))) session.completedAt = at(session.date, 19);
  }
  for (const grade of path.liveSessions.filter((session) => session.completedAt).flatMap((session) => session.items.filter((item) => item.kind === 'exercise')
    .map((item) => ({ session, item }))).slice(0, 6)) {
    state().grades.push({ id: newId(), learnerId: learner.id, lessonId: lessonIdOf(grade.item.id), activityId: grade.item.id, sessionId: grade.session.id,
      correct: 3 + (grade.item.id.length % 3), total: 6, submittedAt: grade.session.completedAt as string });
  }
  return path;
}

// ---------------------------------------------------------------------------------------------------------------------
// Contenus extraits de content/de/a1 et content/de/a2 (modules, activités ; quelques activités détaillées avec leurs corrigés)
// ---------------------------------------------------------------------------------------------------------------------

const CONTENT: MockLevelContent[] = [
  { code: 'A1', settings: {"reviewMinutes":10,"midtermMinutes":30,"finalMinutes":60,"passPercent":60}, modules: [
    {"id":"a1-hallo","title":"Hallo ! Se saluer et se présenter","objective":"Saluer et prendre congé selon le moment de la journée, se présenter (nom, origine, ville, langues), demander comment ça va, épeler son nom, choisir entre « du » et « Sie », et faire connaissance avec quelqu’un : …","prerequisites":[],"activities":[["a1-hallo-wortschatz","lesson","Les salutations",15,["lecture","ecoute"]],["a1-hallo-begruessungen","lesson","Écouter et répéter : saluer et dire comment ça va (voix natives)",10,["ecoute","expression-orale"]],["a1-hallo-dialog","lesson","Dialogue : le premier jour du cours",15,["ecoute","lecture"]],["a1-hallo-herkunft","exercise","Écouter : Woher kommen Sie ? Pays et drapeaux",10,["ecoute","lecture"]],["a1-hallo-alphabet","lesson","L’alphabet et épeler son nom",10,["ecoute","expression-orale"]],["a1-hallo-aussprache","lesson","Aussprache : l’alphabet et cinq lettres pièges",10,["ecoute","expression-orale"]],["a1-hallo-lesen","exercise","Lire : trois participants se présentent",10,["lecture"]],["a1-hallo-hoeren","exercise","Écouter : trois petites rencontres",10,["ecoute"]],["a1-hallo-hoersaal","exercise","Écouter : faire connaissance à l’université",12,["ecoute"]],["a1-hallo-grammatik","exercise","Grammaire : heißen, kommen, sein",10,["lecture","expression-ecrite"]],["a1-hallo-rollenspiel","lesson","Parler : faire connaissance (jeu de rôle)",15,["expression-orale"]],["a1-hallo-sprechen","lesson","Parler et écrire : se présenter",10,["expression-orale","expression-ecrite"]]]},
    {"id":"a1-zahlen","title":"Nombres, couleurs et coordonnées","objective":"Compter de 0 à 100, dire son âge, donner et noter un numéro de téléphone, une adresse avec son code postal et une adresse e-mail, nommer les couleurs, remplir un formulaire d’inscription simple, comprendre des prix …","prerequisites":["a1-hallo"],"activities":[["a1-zahlen-wortschatz","lesson","Les nombres de 0 à 100",15,["lecture","ecoute"]],["a1-zahlen-dialog","lesson","Dialogue : l’inscription au cours d’allemand",15,["ecoute","lecture"]],["a1-zahlen-farben","lesson","Les couleurs",10,["ecoute","expression-orale"]],["a1-zahlen-nachsprechen","lesson","Écouter et répéter : nombres et couleurs (voix natives)",10,["ecoute","expression-orale"]],["a1-zahlen-aussprache","lesson","Aussprache : ä, ö, ü et ß",12,["ecoute","expression-orale"]],["a1-zahlen-lesen","exercise","Lire : un formulaire et un e-mail",10,["lecture"]],["a1-zahlen-hoeren","exercise","Écouter : numéros, âge, e-mail et prix",10,["ecoute"]],["a1-zahlen-geld-lesen","exercise","Lire : euros ou francs ? Payer en voyage",12,["lecture"]],["a1-zahlen-geld-hoeren","exercise","Écouter : une enquête sur l’argent",12,["ecoute"]],["a1-zahlen-fotos","exercise","Lire : couleurs, argent et températures en photos",8,["lecture"]],["a1-zahlen-grammatik","exercise","Grammaire : verbes réguliers, haben, nombres et couleurs",10,["lecture","expression-ecrite"]],["a1-zahlen-sprechen","lesson","Parler et écrire : donner ses coordonnées",10,["expression-orale","expression-ecrite"]]]},
    {"id":"a1-kurs","title":"Au cours et à l’université : objets, matières, jours de la semaine","objective":"Nommer les objets de la salle de classe avec leur article (der, die, das), employer ein, eine, kein et keine au nominatif, former le pluriel des noms courants, parler de ses matières, dire les jours de la semaine et …","prerequisites":["a1-zahlen"],"activities":[["a1-kurs-wortschatz","lesson","Les objets de la salle de cours",15,["lecture","ecoute"]],["a1-kurs-dib-unterricht","lesson","Voix natives : sur le bureau et en cours",15,["ecoute","expression-orale"]],["a1-kurs-dialog","lesson","Dialogue : avant le premier cours",15,["ecoute","lecture"]],["a1-kurs-woche","lesson","La semaine, l’heure et les matières",15,["lecture","ecoute","expression-orale"]],["a1-kurs-aussprache","lesson","Aussprache : s, z et j",10,["ecoute","expression-orale"]],["a1-kurs-lesen","exercise","Lire : la semaine de Chloé à Vienne",10,["lecture"]],["a1-kurs-hoeren","exercise","Écouter : cinq scènes à l’université",10,["ecoute"]],["a1-kurs-was-ist-das","exercise","Was ist das ? Dessins, photos et voix native",10,["ecoute","lecture"]],["a1-kurs-studium-lesen","exercise","Lire : étudier en Allemagne, ça coûte cher ?",10,["lecture"]],["a1-kurs-netz-hoeren","exercise","Écouter : un sondage sur Internet à l’université",10,["ecoute"]],["a1-kurs-grammatik","exercise","Grammaire : articles, kein, pluriel, am et um",10,["lecture","expression-ecrite"]],["a1-kurs-sprechen","lesson","Parler et écrire : mon cours et ma semaine",10,["expression-orale","expression-ecrite"]]]},
    {"id":"a1-alltag","title":"Mein Tag : raconter sa journée","objective":"Dire l’heure dans la conversation (halb acht, Viertel nach neun, Viertel vor zwölf), raconter sa journée et ses repas avec les verbes séparables (aufstehen, anfangen, einkaufen, fernsehen, anrufen), placer le verbe …","prerequisites":["a1-kurs"],"activities":[["a1-alltag-wortschatz","lesson","Les actions de la journée",15,["lecture","ecoute"]],["a1-alltag-dib-tagesablauf","lesson","Voix natives : la journée et le trajet vers l’université",15,["ecoute","expression-orale"]],["a1-alltag-uhrzeit","lesson","Dire l’heure et situer dans la semaine",10,["ecoute","expression-orale"]],["a1-alltag-dib-zeit","exercise","Écouter : les mots du temps (voix native)",10,["ecoute"]],["a1-alltag-dialog","lesson","Dialogue : le matin dans la colocation",15,["ecoute","lecture"]],["a1-alltag-aussprache","lesson","Aussprache : v et w",10,["ecoute","expression-orale"]],["a1-alltag-lesen","exercise","Lire : la semaine de Daniel",10,["lecture"]],["a1-alltag-hoeren","exercise","Écouter : trois moments de la journée",10,["ecoute"]],["a1-alltag-sonntag-lesen","exercise","Lire : le dimanche en Allemagne",10,["lecture"]],["a1-alltag-sonntag-sprechen","lesson","Parler : organiser un dimanche ensemble",15,["expression-orale","expression-ecrite"]],["a1-alltag-grammatik","exercise","Grammaire : verbes séparables, heure et place du verbe",10,["lecture","expression-ecrite"]],["a1-alltag-sprechen","lesson","Parler et écrire : raconter sa journée",10,["expression-orale","expression-ecrite"]]]},
    {"id":"a1-essen","title":"Guten Appetit ! Manger, boire et faire les courses","objective":"Nommer les aliments et les boissons courants, dire ce qu’on aime ou non (gern, nicht gern), commander au café et au restaurant, faire ses courses en demandant une quantité et un prix (Was kostet …?, Ich möchte …) et …","prerequisites":["a1-alltag"],"activities":[["a1-essen-wortschatz","lesson","Les aliments et les boissons",15,["lecture","ecoute"]],["a1-essen-nachsprechen","lesson","Écouter et répéter : le petit-déjeuner et le déjeuner (voix authentiques)",12,["ecoute","expression-orale"]],["a1-essen-dialog","lesson","Dialogue : au café",15,["ecoute","lecture"]],["a1-essen-einkaufen","lesson","Faire les courses : quantités et prix",10,["ecoute","expression-orale"]],["a1-essen-obst-hoeren","exercise","Écouter : les fruits au marché, singulier et pluriel",10,["ecoute"]],["a1-essen-lesen","exercise","Lire : la carte d’un café",10,["lecture"]],["a1-essen-esskultur","exercise","Lire : manger en Allemagne",12,["lecture"]],["a1-essen-hoeren","exercise","Écouter : à la boulangerie, à la maison, au restaurant",10,["ecoute"]],["a1-essen-imbiss","exercise","Écouter : à l’Imbiss",10,["ecoute"]],["a1-essen-grammatik","exercise","Grammaire : einen, eine, ein, kein, gern et les prix",10,["lecture","expression-ecrite"]],["a1-essen-aussprache-ch","lesson","Aussprache : ch (ich-Laut / ach-Laut)",10,["ecoute","expression-orale"]],["a1-essen-sprechen","lesson","Parler et écrire : mes habitudes alimentaires",10,["expression-orale","expression-ecrite"]]]},
    {"id":"a1-freizeit","title":"Hast du Zeit ? Loisirs et rendez-vous","objective":"Parler de ses loisirs et de ses sports préférés avec « gern », « lieber » et « am liebsten », dire ce qu’on sait faire et ce qu’on veut faire avec « können » et « wollen », proposer une sortie, accepter ou refuser …","prerequisites":["a1-essen"],"activities":[["a1-freizeit-wortschatz","lesson","Les loisirs et les sorties",15,["lecture","ecoute"]],["a1-freizeit-nachsprechen","lesson","Écouter et répéter : loisirs et opinions (voix authentiques)",12,["ecoute","expression-orale"]],["a1-freizeit-dialog","lesson","Dialogue : des projets pour samedi",15,["ecoute","lecture"]],["a1-freizeit-wetter","lesson","Le temps qu’il fait",10,["ecoute","lecture"]],["a1-freizeit-lesen","exercise","Lire : petites annonces de loisirs",10,["lecture"]],["a1-freizeit-hoeren","exercise","Écouter : rendez-vous et météo",10,["ecoute"]],["a1-freizeit-stadion","exercise","Écouter : on va au stade ?",12,["ecoute"]],["a1-freizeit-sportarten","exercise","Écouter et regarder : quel sport est-ce ?",10,["ecoute"]],["a1-freizeit-sport","lesson","Parler : le sport à l’université et en club",12,["expression-orale"]],["a1-freizeit-grammatik","exercise","Grammaire : können, wollen, gern et lieber",10,["lecture","expression-ecrite"]],["a1-freizeit-aussprache-r","lesson","Aussprache : le r allemand",10,["ecoute","expression-orale"]],["a1-freizeit-sprechen","lesson","Parler et écrire : proposer un rendez-vous",10,["expression-orale","expression-ecrite"]]]},
    {"id":"a1-familie","title":"Herzlichen Glückwunsch ! Famille et fêtes","objective":"Présenter sa famille et sa situation familiale, employer les possessifs (mein, dein, sein, ihr, unser, euer) au nominatif et à l’accusatif, dire les mois, les saisons et une date, connaître les grandes fêtes …","prerequisites":["a1-freizeit"],"activities":[["a1-familie-wortschatz","lesson","La famille",15,["lecture","ecoute"]],["a1-familie-aussprache","lesson","Aussprache : ei, ie, eu, au",10,["ecoute","expression-orale"]],["a1-familie-dialog","lesson","Dialogue : les photos de famille",15,["ecoute","lecture"]],["a1-familie-heimat-hoeren","exercise","Écouter : « Was ist Heimat für Sie? »",10,["ecoute"]],["a1-familie-heimat-sprechen","lesson","Parler et écrire : ma Heimat en deux photos",15,["expression-orale","expression-ecrite"]],["a1-familie-kalender","lesson","L’année : mois, saisons, dates et fêtes",15,["lecture","ecoute"]],["a1-familie-natif-wortschatz","lesson","Écouter et répéter : la famille et les fêtes (voix natives)",15,["ecoute","expression-orale"]],["a1-familie-fotos","exercise","Photos : familles et fêtes en Allemagne",10,["lecture"]],["a1-familie-lesen","exercise","Lire : une année de fêtes en famille",10,["lecture"]],["a1-familie-hoeren","exercise","Écouter : anniversaires, photos et fêtes",10,["ecoute"]],["a1-familie-grammatik","exercise","Grammaire : possessifs, dates et vœux",10,["lecture","expression-ecrite"]],["a1-familie-sprechen","lesson","Parler et écrire : ma famille et une invitation",10,["expression-orale","expression-ecrite"]]]},
    {"id":"a1-stadt","title":"Wohnung und Stadt : logement et ville","objective":"Nommer les pièces et les meubles d’un logement et le décrire (groß, klein, hell, dunkel, modern, alt, teuer, billig) avec « es gibt » et « kein » à l’accusatif, comprendre de petites annonces, nommer les lieux de la …","prerequisites":["a1-familie"],"activities":[["a1-stadt-wortschatz","lesson","Les pièces, les meubles et les adjectifs",15,["lecture","ecoute"]],["a1-stadt-dialog","lesson","Dialogue : la visite d’un appartement",15,["ecoute","lecture"]],["a1-stadt-lesen","exercise","Lire : des petites annonces de logement",10,["lecture"]],["a1-stadt-weg","lesson","En ville : les lieux, les transports et le chemin",20,["ecoute","expression-orale"]],["a1-stadt-natif-weg","lesson","Écouter et répéter : demander et indiquer le chemin (voix natives)",15,["ecoute","expression-orale"]],["a1-stadt-aussprache","lesson","Aussprache : st, ß, z, kn, ps, pn + virelangue",10,["ecoute","expression-orale"]],["a1-stadt-hoeren","exercise","Écouter : trois scènes en ville",10,["ecoute"]],["a1-stadt-fotos","exercise","Photos : en ville",10,["lecture"]],["a1-stadt-paderborn-lesen","exercise","Lire : le blog de Yanis à Paderborn",15,["lecture"]],["a1-stadt-hamburg-hoeren","exercise","Écouter : un week-end à Hambourg",10,["ecoute"]],["a1-stadt-grammatik","exercise","Grammaire : es gibt, kein et l’impératif poli",10,["lecture","expression-ecrite"]],["a1-stadt-sprechen","lesson","Parler et écrire : mon logement et mon quartier",10,["expression-orale","expression-ecrite"]]]},
  ] },
  { code: 'A2', settings: {"reviewMinutes":10,"midtermMinutes":40,"finalMinutes":75,"passPercent":60}, modules: [
    {"id":"a2-reisen","title":"Gute Reise ! Voyager et raconter ses vacances","objective":"Réserver un billet de train et une chambre d’hôtel, se débrouiller à la gare et à la réception, dire où l’on part (nach Wien, in die Schweiz, ans Meer, in die Berge), parler du temps qu’il fait et raconter ses …","prerequisites":[],"activities":[["a2-reisen-wortschatz","lesson","Le vocabulaire du voyage et de la météo",15,["lecture","ecoute"]],["a2-reisen-dib-unterwegs","lesson","Écouter et répéter : en voyage, avec des voix natives",12,["ecoute","expression-orale"]],["a2-reisen-unterwegs","lesson","À la gare et à l’hôtel",10,["ecoute","expression-orale"]],["a2-reisen-dialog","lesson","Dialogue : « Wie war dein Urlaub ? »",15,["ecoute","lecture"]],["a2-reisen-lesen","exercise","Lire : un courriel de retour de vacances",12,["lecture"]],["a2-reisen-hoeren","exercise","Écouter : à la gare, au téléphone, à la radio",12,["ecoute"]],["a2-reisen-dib-wetter","exercise","Écouter : la météo avec des voix natives",10,["ecoute"]],["a2-reisen-balkonien","exercise","Lire : Urlaub auf Balkonien, les vacances à la maison",12,["lecture"]],["a2-reisen-planen","exercise","Écouter : organiser un voyage entre amis",10,["ecoute"]],["a2-reisen-grammatik","exercise","Grammaire : le Perfekt et les destinations",10,["lecture","expression-ecrite"]],["a2-reisen-aussprache","lesson","Prononciation : b, d, g en fin de mot (Auslautverhärtung)",12,["ecoute","expression-orale"]],["a2-reisen-sprechen","lesson","Parler et écrire : raconter ses dernières vacances",12,["expression-orale","expression-ecrite"]]]},
    {"id":"a2-gesundheit","title":"Gute Besserung ! Santé et forme","objective":"Nommer les parties du corps, dire où l’on a mal (Mir tut der Kopf weh.) et décrire ses symptômes, prendre rendez-vous chez le médecin, comprendre les conseils du médecin et du pharmacien, donner des conseils et des …","prerequisites":["a2-reisen"],"activities":[["a2-gesundheit-wortschatz","lesson","Le corps, les symptômes et les soins",12,["lecture","ecoute"]],["a2-gesundheit-dib-koerper","exercise","Écouter et nommer : les parties du corps",10,["ecoute","lecture"]],["a2-gesundheit-dialog","lesson","Dialogue : prendre rendez-vous et consulter",15,["ecoute","lecture"]],["a2-gesundheit-dib-aerzte","exercise","Écouter : douleurs et médecins, avec des voix natives",10,["ecoute"]],["a2-gesundheit-apotheke","lesson","À la pharmacie et à la maison : l’impératif",12,["ecoute","expression-orale"]],["a2-gesundheit-lesen","exercise","Lire : un forum santé",12,["lecture"]],["a2-gesundheit-sportblog","exercise","Lire : faire du sport pendant ses études en Allemagne",12,["lecture"]],["a2-gesundheit-fitbleiben","lesson","Parler et écrire : interviewer un partenaire sur le sport",12,["expression-orale","expression-ecrite"]],["a2-gesundheit-hoeren","exercise","Écouter : santé au quotidien",12,["ecoute"]],["a2-gesundheit-grammatik","exercise","Grammaire : datif, verbes de modalité, impératif",10,["lecture","expression-ecrite"]],["a2-gesundheit-aussprache","lesson","Prononciation : z, pf, sch, ch… et les cousins anglais",12,["ecoute","expression-orale"]],["a2-gesundheit-sprechen","lesson","Parler et écrire : dire qu’on est malade",12,["expression-orale","expression-ecrite"]]]},
    {"id":"a2-wohnen","title":"Wohnen : se loger et vivre ensemble","objective":"Comprendre une petite annonce de logement et ses abréviations (Zi., KM, NK, WG…), visiter et décrire un appartement, comparer location et achat, parler des règles d’une colocation et d’un immeuble (dürfen, müssen), …","prerequisites":["a2-gesundheit"],"activities":[["a2-wohnen-wortschatz","lesson","Le logement : pièces, meubles et petites annonces",15,["lecture","ecoute"]],["a2-wohnen-native-wortschatz","lesson","Écouter et répéter : les pièces au pluriel et les lieux de vie (voix natives)",12,["ecoute","expression-orale"]],["a2-wohnen-dialog","lesson","Dialogue : la visite d’un appartement",15,["ecoute","lecture"]],["a2-wohnen-lesen","exercise","Lire : trois petites annonces",12,["lecture"]],["a2-wohnen-kultur","lesson","Culture : vivre en colocation et dans un immeuble",8,["lecture"]],["a2-wohnen-aussprache","lesson","Prononciation : l’Umlaut — ä, ö, ü (voix natives)",12,["ecoute","expression-orale"]],["a2-wohnen-mieten","exercise","Lire : louer ou acheter ? Trois avis sur un forum",12,["lecture"]],["a2-wohnen-hoeren","exercise","Écouter : déménagement, voisin et colocation",12,["ecoute"]],["a2-wohnen-grammatik","exercise","Grammaire : Wo? ou Wohin? — stellen, stehen, legen, liegen, hängen",10,["lecture","expression-ecrite"]],["a2-wohnen-haus","exercise","Vocabulaire en images : une maison en coupe",10,["lecture"]],["a2-wohnen-wohnungstour","exercise","Écouter : Lea fait visiter son nouvel appartement",12,["ecoute"]],["a2-wohnen-sprechen","lesson","Parler et écrire : mon logement, ma réponse à une annonce",15,["expression-orale","expression-ecrite"]]]},
    {"id":"a2-arbeit","title":"Arbeit und Beruf : travail et métiers","objective":"Parler de son métier, de son lieu et de sa journée de travail, comprendre une offre d’emploi et le principe de l’Ausbildung, défendre un projet de formation, rédiger un CV et une courte candidature, téléphoner au …","prerequisites":["a2-wohnen"],"activities":[["a2-arbeit-wortschatz","lesson","Les métiers et les lieux de travail",12,["lecture","ecoute"]],["a2-arbeit-native-wortschatz","lesson","Écouter et répéter : métiers et vocabulaire de l’emploi (voix natives)",12,["ecoute","expression-orale"]],["a2-arbeit-dialog","lesson","Dialogue : l’entretien d’embauche",15,["ecoute","lecture"]],["a2-arbeit-lesen","exercise","Lire : une offre d’emploi",12,["lecture"]],["a2-arbeit-aussprache","lesson","Prononciation : le r allemand (virelangues, voix native)",10,["ecoute","expression-orale"]],["a2-arbeit-telefon","lesson","Stratégie : téléphoner au travail",10,["ecoute","expression-orale"]],["a2-arbeit-ausbildung","exercise","Lire : Moussa, apprenti dans un garage",12,["lecture"]],["a2-arbeit-schule-bilder","exercise","Lire des images : école, université et formation",10,["lecture"]],["a2-arbeit-diskussion","lesson","Parler : une Ausbildung à 29 ans ? Défendre son projet",12,["expression-orale","ecoute"]],["a2-arbeit-hoeren","exercise","Écouter : messages et conversations au travail",12,["ecoute"]],["a2-arbeit-grammatik","exercise","Grammaire : weil, dass, war et hatte",10,["lecture","expression-ecrite"]],["a2-arbeit-sprechen","lesson","Parler et écrire : mon parcours et ma candidature",15,["expression-orale","expression-ecrite"]]]},
    {"id":"a2-beziehungen","title":"Leute, die wir mögen : amis, relations et personnalité","objective":"Décrire l’apparence et le caractère d’une personne, parler de ses amis et de ses relations, raconter un souvenir d’enfance (als, ich durfte, ich musste), inviter quelqu’un puis accepter ou refuser poliment, accorder …","prerequisites":["a2-arbeit"],"activities":[["a2-beziehungen-wortschatz","lesson","Décrire une personne : apparence et caractère",15,["lecture","ecoute"]],["a2-beziehungen-native-wortschatz","lesson","Écouter et répéter : les gens qu’on connaît et comment on les décrit (voix natives)",15,["ecoute","expression-orale"]],["a2-beziehungen-aussprache","lesson","Prononciation : le -er final après une diphtongue (voix natives)",10,["ecoute","expression-orale"]],["a2-beziehungen-dialog","lesson","Dialogue : le nouveau collègue de Malik",15,["ecoute","lecture"]],["a2-beziehungen-einladen","lesson","Inviter, accepter, refuser poliment",10,["ecoute","expression-orale"]],["a2-beziehungen-lesen","exercise","Lire : se faire des amis dans une nouvelle ville",10,["lecture"]],["a2-beziehungen-hoeren","exercise","Écouter : micro-trottoir sur l’amitié",10,["ecoute"]],["a2-beziehungen-native-hoeren","exercise","Écouter : quand ça devient sérieux (voix native)",10,["ecoute"]],["a2-beziehungen-kindheit-lesen","exercise","Lire : une amitié d’enfance",10,["lecture"]],["a2-beziehungen-kindheit-erzaehlen","lesson","Parler et écrire : raconter un souvenir d’enfance",15,["expression-orale","expression-ecrite"]],["a2-beziehungen-grammatik","exercise","Grammaire : adjectifs, datif et verbes pronominaux",10,["lecture","expression-ecrite"]],["a2-beziehungen-sprechen","lesson","Parler et écrire : présenter un ami, répondre à une invitation",15,["expression-orale","expression-ecrite"]]]},
    {"id":"a2-kultur","title":"Typisch deutsch ? École, traditions, environnement","objective":"Distinguer clichés et réalités sur l’Allemagne, expliquer simplement le système scolaire et l’apprentissage (Ausbildung), trier ses déchets et parler d’écologie au quotidien, présenter les grandes fêtes de l’année, …","prerequisites":["a2-beziehungen"],"activities":[["a2-kultur-wortschatz","lesson","École, formation et environnement : les mots-clés",15,["lecture","ecoute"]],["a2-kultur-native-wortschatz","lesson","Écouter et répéter : clichés, valeurs et traditions (voix natives)",12,["ecoute","expression-orale"]],["a2-kultur-dialog","lesson","Dialogue : le tri des déchets en colocation",15,["ecoute","lecture"]],["a2-kultur-native-umwelt","exercise","Écouter : les mots de l’environnement (voix native)",10,["ecoute"]],["a2-kultur-lesen","exercise","Lire : l’école et l’apprentissage expliqués par une amie",10,["lecture"]],["a2-kultur-feste","lesson","Culture : fêtes et jours fériés en Allemagne",10,["lecture","ecoute"]],["a2-kultur-bilder","exercise","Lire et observer : traditions et lieux en images",8,["lecture"]],["a2-kultur-hoeren","exercise","Écouter : micro-trottoir « Qu’est-ce qui est typiquement allemand ? »",10,["ecoute"]],["a2-kultur-dach-lesen","exercise","Lire : une langue, plusieurs pays",12,["lecture"]],["a2-kultur-du-sie-hoeren","exercise","Écouter : du ou Sie ? Les codes de politesse",10,["ecoute"]],["a2-kultur-grammatik","exercise","Grammaire : comparer et donner son avis",10,["lecture","expression-ecrite"]],["a2-kultur-sprechen","lesson","Parler et écrire : typiquement allemand, typiquement de chez moi",15,["expression-orale","expression-ecrite"]]]},
    {"id":"a2-berlin","title":"Auf nach Berlin ! Ville et histoire","objective":"Présenter les grands monuments de Berlin, raconter simplement l’histoire du Mur (1961, 1989, 1990) avec le prétérit des verbes de modalité, de sein, de haben et de « es gibt », situer des événements dans le temps …","prerequisites":["a2-kultur"],"activities":[["a2-berlin-wortschatz","lesson","Berlin : monuments, histoire et transports",12,["lecture","ecoute"]],["a2-berlin-dialog","lesson","Dialogue : demander son chemin à Berlin",15,["ecoute","lecture"]],["a2-berlin-lesen","exercise","Lire : l’histoire du Mur de Berlin",12,["lecture"]],["a2-berlin-geschichte-woerter","exercise","Écouter : les mots de l’histoire allemande (enregistrement natif)",10,["ecoute"]],["a2-berlin-hoeren","exercise","Écouter : annonce, visite guidée et rendez-vous",12,["ecoute"]],["a2-berlin-kieze","exercise","Lire : Berlin aujourd’hui, une ville de quartiers",12,["lecture"]],["a2-berlin-sehenswuerdigkeiten","exercise","Photos : reconnaître cinq symboles de Berlin",10,["lecture"]],["a2-berlin-grammatik","exercise","Grammaire : le prétérit et les indications de temps",10,["lecture","expression-ecrite"]],["a2-berlin-wegbeschreibung","lesson","Écouter et répéter : demander et indiquer le chemin",10,["ecoute","expression-orale"]],["a2-berlin-wege","exercise","En ville : comprendre et donner un itinéraire",10,["lecture","expression-orale"]],["a2-berlin-tagesplan","exercise","Écouter : le programme d’une journée à Berlin",12,["ecoute"]],["a2-berlin-sprechen","lesson","Parler et écrire : une carte postale de Berlin",12,["expression-orale","expression-ecrite"]]]},
    {"id":"a2-einkaufen","title":"Achats, vêtements et services","objective":"Décrire des vêtements (pièce, couleur, taille, matière), essayer et acheter dans un magasin, échanger un article ou faire une réclamation, se débrouiller au guichet de la poste et de la banque, accorder l’adjectif …","prerequisites":["a2-berlin"],"activities":[["a2-einkaufen-wortschatz","lesson","Les vêtements, le magasin, la poste et la banque",12,["lecture","ecoute"]],["a2-einkaufen-kleidung-hoeren","lesson","Écouter et répéter : les vêtements et leur pluriel",10,["ecoute","expression-orale"]],["a2-einkaufen-dialog","lesson","Dialogue : essayer et acheter une veste",15,["ecoute","lecture"]],["a2-einkaufen-kleidung-bilder","exercise","Dessins : nommer des vêtements et les demander au magasin",8,["lecture"]],["a2-einkaufen-lesen","exercise","Lire : les conditions d’échange d’un magasin",12,["lecture"]],["a2-einkaufen-hoeren","exercise","Écouter : à la poste, à la banque et au magasin",12,["ecoute"]],["a2-einkaufen-geschaefte","exercise","Écouter : les magasins de la ville, article et pluriel",10,["ecoute"]],["a2-einkaufen-grammatik","exercise","Grammaire : dieser, welcher et les demandes polies",10,["lecture","expression-ecrite"]],["a2-einkaufen-stil","lesson","Parler et écrire : mon style et ma façon d’acheter",12,["expression-orale","expression-ecrite"]],["a2-einkaufen-service","exercise","À la poste et à la banque : que dites-vous ?",10,["lecture","expression-orale"]],["a2-einkaufen-bargeld","exercise","Lire : payer en liquide ou par carte ?",12,["lecture"]],["a2-einkaufen-sprechen","lesson","Parler et écrire : faire une réclamation",12,["expression-orale","expression-ecrite"]]]},
  ] },
];

const DETAILS: Record<string, MockActivityDetail> = {
  "a1-hallo-dialog": {"lesson":{"title":"Der erste Kurstag — Le premier jour du cours","description":"Anna et Jonas se rencontrent au cours d’allemand de Frau Weber, à Würzburg. Écoutez le dialogue une première fois sans lire, puis une deuxième fois en suivant le texte.\n\nDIALOGUE\nFrau Weber : Guten Morgen! Ich bin Frau Weber, Ihre Lehrerin. Wie heißen Sie?\nAnna : Guten Morgen! Ich heiße Anna Rossi.\nFrau Weber : Woher kommen Sie, Frau Rossi?\nAnna : Ich komme aus Italien, aus Mailand. Aber ich wohne jetzt hier in Würzburg.\nJonas : Hallo Anna! Ich bin Jonas. Ich komme aus Frankreich.\nAnna : Hallo Jonas! Freut mich. Wie geht's?\nJonas : Gut, danke! Und dir?\nAnna : Auch gut, danke.\n\nGRAMMAIRE : TROIS VERBES UTILES\n• heißen (s’appeler) : ich heiße — du heißt — Sie heißen\n• kommen (venir) : ich komme — du kommst — Sie kommen\n• sein (être) : ich bin — du bist — Sie sind — er/sie ist\n\nLES QUESTIONS EN W\n• Wie heißt du? / Wie heißen Sie? — Comment tu t’appelles ? / Comment vous appelez-vous ?\n• Woher kommst du? — D’où viens-tu ?\n• Wo wohnst du? — Où habites-tu ?\n• Wie geht's? — Comment ça va ? (familier) / Wie geht es Ihnen? (poli)\nDans une question en W, le verbe conjugué est en deuxième position, juste après le mot interrogatif."},"transcript":null,"questions":[]},
  "a1-hallo-herkunft": {"lesson":{"title":"Woher kommst du? — Länder","description":"Écoutez l’enregistrement authentique (voix native, manuel Deutsch im Blick) : deux questions pour demander l’origine, puis une liste de pays. Répondez ensuite aux questions ; certaines s’appuient sur une photo. Vous pouvez réécouter autant de fois que nécessaire ; la transcription s’affichera après votre réponse.\n\nMOTS UTILES\n• Woher kommst du? / Woher kommen Sie? — D’où viens-tu ? / D’où venez-vous ?\n• kommen aus — venir de : Ich komme aus Kanada.\n• das Land, die Länder — le pays, les pays\n\nPAYS AVEC OU SANS ARTICLE\nLa plupart des pays n’ont pas d’article : Ich komme aus Deutschland, aus Frankreich, aus Belgien. Quelques-uns en ont un : die Schweiz, die Türkei, die Niederlande et die USA (ces deux derniers sont au pluriel). Après aus, l’article change : aus der Schweiz, aus der Türkei, aus den Niederlanden, aus den USA.\n\nLES VILLES ONT AUSSI UN NOM ALLEMAND\nBeaucoup de villes étrangères ont un nom allemand : Lisbonne se dit Lissabon, Bruxelles se dit Brüssel, Copenhague se dit Kopenhagen. Cherchez-en d’autres sur la carte météo de la dernière question.\n\nEnregistrements et images : Deutsch im Blick (COERLL, Université du Texas à Austin), CC BY 4.0."},"transcript":null,"questions":[{"id":"q1","prompt":"Comment demande-t-on à une personne adulte qu’on ne connaît pas d’où elle vient ?","options":[{"id":"a","text":"Woher kommst du?"},{"id":"b","text":"Wo wohnen Sie?"},{"id":"c","text":"Woher kommen Sie?"},{"id":"d","text":"Wie heißen Sie?"}],"answer":"c"},{"id":"q2","prompt":"Voici le drapeau des États-Unis (die USA). Quelle phrase entend-on dans l’enregistrement ?","options":[{"id":"a","text":"Ich komme aus USA."},{"id":"b","text":"Ich komme aus den USA."},{"id":"c","text":"Ich komme aus die USA."},{"id":"d","text":"Ich komme von den USA."}],"answer":"b"},{"id":"q3","prompt":"Welches Land ist das? Le nom de ce pays est dans l’enregistrement.","options":[{"id":"a","text":"Österreich"},{"id":"b","text":"Belgien"},{"id":"c","text":"die Schweiz"},{"id":"d","text":"Deutschland"}],"answer":"d"},{"id":"q4","prompt":"Lesquels de ces pays entend-on avec l’article « die » ?","options":[{"id":"a","text":"die Schweiz und die Türkei"},{"id":"b","text":"die Spanien und die Polen"},{"id":"c","text":"die Österreich und die Ungarn"},{"id":"d","text":"die Frankreich und die Italien"}],"answer":"a"},{"id":"q5","prompt":"Quel autre nom entend-on juste après « die Niederlande » ?","options":[{"id":"a","text":"Belgien"},{"id":"b","text":"Holland"},{"id":"c","text":"Luxemburg"},{"id":"d","text":"Dänemark"}],"answer":"b"},{"id":"q6","prompt":"Sur cette carte météo, les villes portent leur nom allemand. Anna, du dialogue, vient de Milan, dans le nord de l’Italie. Comment dit-on « Milan » en allemand ?","options":[{"id":"a","text":"Rom"},{"id":"b","text":"Nizza"},{"id":"c","text":"Madrid"},{"id":"d","text":"Mailand"}],"answer":"d"}]},
  "a1-hallo-grammatik": {"lesson":{"title":"Ich heiße, du heißt, Sie heißen","description":"Choisissez la forme qui complète correctement chaque phrase. Rappel : ich -e, du -st, er/sie -t, Sie -en ; le verbe « sein » est irrégulier (ich bin, du bist, er ist, Sie sind)."},"transcript":null,"questions":[{"id":"q1","prompt":"Ich … Jonas.","options":[{"id":"a","text":"heißt"},{"id":"b","text":"heiße"},{"id":"c","text":"heißen"}],"answer":"b"},{"id":"q2","prompt":"Woher … du?","options":[{"id":"a","text":"kommst"},{"id":"b","text":"komme"},{"id":"c","text":"kommen"}],"answer":"a"},{"id":"q3","prompt":"Wie … Sie, bitte?","options":[{"id":"a","text":"heißt"},{"id":"b","text":"heiße"},{"id":"c","text":"heißen"}],"answer":"c"},{"id":"q4","prompt":"Das … Frau Weber, unsere Lehrerin.","options":[{"id":"a","text":"bin"},{"id":"b","text":"ist"},{"id":"c","text":"bist"},{"id":"d","text":"sind"}],"answer":"b"},{"id":"q5","prompt":"… wohnst du? — In Würzburg.","options":[{"id":"a","text":"Wie"},{"id":"b","text":"Woher"},{"id":"c","text":"Wo"}],"answer":"c"},{"id":"q6","prompt":"À la banque, vous saluez l’employé que vous ne connaissez pas. Que dites-vous ?","options":[{"id":"a","text":"Hallo! Wie geht's dir?"},{"id":"b","text":"Guten Tag! Wie geht es Ihnen?"},{"id":"c","text":"Tschüs! Bis bald!"}],"answer":"b"}]},
  "a2-reisen-dialog": {"lesson":{"title":"Wie war dein Urlaub? — Raconter ses vacances au passé","description":"Lundi matin, Julia et Tarek se retrouvent devant la machine à café du bureau. Ils rentrent tous les deux de vacances. Écoutez le dialogue une première fois sans lire, puis une deuxième fois en suivant le texte. Repérez les verbes au passé.\n\nDIALOGUE\nJulia : Hallo Tarek! Du bist ja ganz braun. Wie war dein Urlaub?\nTarek : Hallo Julia! Super, danke. Ich war mit meiner Familie zwei Wochen in Kroatien, am Meer.\nJulia : Toll! Seid ihr geflogen?\nTarek : Nein, wir sind mit dem Auto gefahren. Die Fahrt hat elf Stunden gedauert, das war ziemlich anstrengend.\nJulia : Elf Stunden! Und wo habt ihr übernachtet?\nTarek : Wir haben eine Ferienwohnung in Split gemietet, direkt am Strand. Ich bin jeden Morgen im Meer geschwommen.\nJulia : Und wie war das Wetter?\nTarek : Fantastisch. Die Sonne hat jeden Tag geschienen, und es waren über dreißig Grad. Und du? Du bist doch nach Wien gefahren, oder?\nJulia : Ja, mit dem Nachtzug. Ich bin am Samstagmorgen angekommen und habe gleich die Altstadt besichtigt. Am Nachmittag habe ich Schloss Schönbrunn gesehen, und im Café habe ich natürlich eine Sachertorte gegessen.\nTarek : Lecker! Hat dir Wien gefallen?\nJulia : Sehr! Nur am Sonntag hat es den ganzen Tag geregnet. Da bin ich ins Museum gegangen.\nTarek : Und hast du mir etwas mitgebracht?\nJulia : Na klar, Mozartkugeln! Hier, nimm eine!\n\nGRAMMAIRE : LE PASSÉ COMPOSÉ (PERFEKT)\nPour raconter au passé à l’oral et dans les messages, l’allemand emploie surtout le Perfekt : l’auxiliaire haben ou sein, conjugué, en 2e position, et le participe passé à la fin de la phrase.\n• Ich habe die Altstadt besichtigt.   • Wir sind mit dem Auto gefahren.   • Am Sonntag hat es geregnet.\nDans une question sans mot interrogatif, l’auxiliaire vient en 1re position : Seid ihr geflogen? Hat dir Wien gefallen?\n\nHABEN OU SEIN ?\n• La plupart des verbes se conjuguent avec haben : Ich habe ein Hotel gebucht. Sie hat eine Sachertorte gegessen.\n• On emploie sein avec les verbes de déplacement (fahren, fliegen, gehen, kommen, reisen, wandern, schwimmen), avec les verbes de changement d’état (aufstehen, einschlafen) et avec bleiben : Ich bin nach Wien gefahren. Wir sind zu Hause geblieben.\n\nLE PARTICIPE PASSÉ\n• Verbes réguliers : ge- + radical + -t : machen → gemacht, buchen → gebucht, mieten → gemietet, dauern → gedauert, regnen → geregnet\n• Verbes irréguliers : ge- + radical (souvent modifié) + -en : fahren → gefahren, sehen → gesehen, essen → gegessen, fliegen → geflogen, schwimmen → geschwommen, scheinen → geschienen, gehen → gegangen\n• Verbes à particule séparable : ge- se place entre la particule et le radical : ankommen → angekommen, einkaufen → eingekauft, mitbringen → mitgebracht\n• Pas de ge- pour les verbes en -ieren ni pour les verbes à préfixe inséparable (be-, ver-, er-, ge-, et über- dans übernachten) : reservieren → reserviert, besichtigen → besichtigt, besuchen → besucht, verpassen → verpasst, übernachten → übernachtet, gefallen → gefallen\n\nSEIN ET HABEN AU PASSÉ\nPour ces deux verbes, on emploie plutôt le prétérit : ich war, du warst, er/sie war, wir waren, ihr wart, sie/Sie waren ; ich hatte, du hattest, er/sie hatte, wir hatten.\n• Wie war dein Urlaub? — Comment se sont passées tes vacances ?   • Ich war zwei Wochen am Meer.   • Wir hatten Glück mit dem Wetter."},"transcript":null,"questions":[]},
  "a2-reisen-grammatik": {"lesson":{"title":"Ich bin gefahren, ich habe gebucht","description":"Choisissez la forme qui complète correctement chaque phrase.\n\nRAPPELS\n• Perfekt : haben ou sein en 2e position, participe passé à la fin. sein avec les verbes de déplacement et avec bleiben.\n• Participes : gemacht, gesehen, eingekauft ; pas de ge- pour les verbes en -ieren et à préfixe inséparable (reserviert, besucht).\n• Wohin? (accusatif) : nach + ville ou pays sans article ; in + pays avec article ou région (in die Türkei) ; an + eau (an den See). Wo? (datif) : am See, in der Türkei."},"transcript":null,"questions":[{"id":"q1","prompt":"Letzten Sommer … wir nach Portugal geflogen.","options":[{"id":"a","text":"haben"},{"id":"b","text":"sind"},{"id":"c","text":"waren"},{"id":"d","text":"hatten"}],"answer":"b"},{"id":"q2","prompt":"Ich habe das Hotel schon im Januar …","options":[{"id":"a","text":"gebucht"},{"id":"b","text":"gebuchen"},{"id":"c","text":"buchte"},{"id":"d","text":"bebucht"}],"answer":"a"},{"id":"q3","prompt":"Wann seid ihr in Hamburg …?","options":[{"id":"a","text":"angekommt"},{"id":"b","text":"geankommen"},{"id":"c","text":"ankommen"},{"id":"d","text":"angekommen"}],"answer":"d"},{"id":"q4","prompt":"Am Samstag haben wir das Schloss …","options":[{"id":"a","text":"gebesichtigt"},{"id":"b","text":"besichtigen"},{"id":"c","text":"besichtigt"},{"id":"d","text":"gesichtigt"}],"answer":"c"},{"id":"q5","prompt":"Im Juli fahren wir … Schweiz, nach Zürich.","options":[{"id":"a","text":"in die"},{"id":"b","text":"nach der"},{"id":"c","text":"in der"},{"id":"d","text":"zur"}],"answer":"a"},{"id":"q6","prompt":"Ich liebe den Strand! Nächste Woche fahre ich endlich …","options":[{"id":"a","text":"am Meer"},{"id":"b","text":"nach Meer"},{"id":"c","text":"ins Meer"},{"id":"d","text":"ans Meer"}],"answer":"d"},{"id":"q7","prompt":"Wo warst du im Urlaub? — Ich war zwei Wochen …","options":[{"id":"a","text":"in die Berge"},{"id":"b","text":"in den Bergen"},{"id":"c","text":"nach den Bergen"},{"id":"d","text":"an die Berge"}],"answer":"b"},{"id":"q8","prompt":"Au guichet, vous voulez savoir si vous devez changer de train. Que demandez-vous ?","options":[{"id":"a","text":"Hat der Zug Verspätung?"},{"id":"b","text":"Von welchem Gleis fährt der Zug ab?"},{"id":"c","text":"Muss ich umsteigen?"},{"id":"d","text":"Ist das Frühstück inklusive?"}],"answer":"c"}]},
};
