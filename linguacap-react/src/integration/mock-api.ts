/*
 * Simulateur en mémoire de l'API LinguaCap, pour développer les écrans sans services (`npm run dev:mock`).
 *
 * - Chargé seulement en développement quand VITE_LINGUACAP_MOCK=1 (voir api.ts) : jamais dans un build.
 * - Rôle choisi par `?as=eleve-autonome | eleve-suivi | eleve-parcours | professeur | professeur-nouveau | admin | equipe`,
 *   ou à la connexion par l'adresse saisie (« prof… », « nouveau… », « admin… », « parcours… », « suivi… », « equipe… »,
 *   sinon élève autonome). `eleve-parcours` (Nora Lefèvre) a un parcours A1 → A2 qui commence aujourd'hui : ses premières
 *   séances portent les activités V4 du module « a1-hallo » (exercice typé, répétition orale, mission, lexique).
 * - État gardé en mémoire et recopié dans sessionStorage (une reprise de Vite ne le perd pas) ; `?reset` repart des données
 *   initiales, `window.linguacapMock.reset()` aussi. Se déconnecter puis se reconnecter sous un autre rôle garde l'état :
 *   un contrat envoyé par l'élève suivi apparaît chez le professeur.
 * - Couvre les routes de l'incrément « Parcours » (formes de v2.ts), celles de la V4 « Contenus et pédagogie » (formes de
 *   v4.ts : exercices typés et corrigé, répétition orale, missions, file de corrections, lexique) et les routes historiques
 *   utiles aux écrans (profil, inscription, séances, résultats, examens simplifiés, suivi, invitations, comptes). Une route
 *   absente répond 404 « Route non simulée ».
 * - Contenus V4 d'exemple : modules « a1-hallo », « a1-zahlen » et « a2-gesundheit » (questions de chaque type, répétition
 *   orale, missions, lexique) ; Léa (élève suivie) a un exercice « à revoir » et une mission à reprendre, Yanis une mission
 *   et une répétition enregistrée en attente chez Marie Weber.
 * - Niveaux dynamiques (cours B1 et B2) : les niveaux du catalogue (`LEVELS_META` : titre, position, prérequis) et leurs
 *   versions publiées (`VERSIONS`) alimentent toutes les routes de niveaux (/languages, /public/languages sans session,
 *   /tracks, /levels, /catalogue/levels, modèles de rythme). B1 est publié (24 modules du gabarit « thème + atelier »),
 *   B2 existe en brouillon (« Bientôt »). Module B1 détaillé : « b1-arbeit » (consignes bilingues ` [fr] `, exercices,
 *   répétition, lexique) et ses missions sur grille dans « b1-arbeit-atelier » ; Léa a une mission orale B1 corrigée sur
 *   grille (points, score sur 20). Une mission écrite B1 remise depuis la bibliothèque arrive chez Marie Weber.
 * - Ciné-club (EVO-055, formes de cine.ts) : un film par niveau publié (Nicos Weg A1, A2, B1), deux séquences d'exemple
 *   chacun (questions choix, trous, ordre, paires) ; carnet de mots, recommandations des professeurs, vue /learning/cine
 *   et éditeur (GET|PUT /catalogue/films, publication, retrait). Léa a fait la séquence A1 n° 1 (4/5), noté quatre mots
 *   et reçu de Marie Weber la proposition de la séquence A1 n° 2.
 */
import type {
  Addition, AdditionCreated, AdditionRemoved, CompetenceScore, Contract, ContractProposer, ContractStatus, ContractTerms,
  CurrentProfileV2, Day, Difficulty, DifficultyBand, DifficultyCode, Estimate, ExamKind, Language, LevelCode, LevelSpan, Library,
  LibraryActivity, OnboardingState, OnboardingStep, PathPermissions, PathProposal, PathSession, PathStatus, PathStep, PathView,
  PendingContract, PlacementAttemptStatus, PlacementCompetence, PlacementQuestionContent, PlacementSummary, PlacementTestDocument,
  PlacementTestSummary, PlacementTier, PlacementTierContent, PlacementView, PlanItem, PlannedSession, PracticePart, PracticeSummary,
  CourseCreationMode, LearnerLearningState, PracticeView, PublicLanguage, StartLevel, Suggestion, TeacherCard, TeacherOnboardingStats,
  TeacherProfile, TemplateView,
} from './v2';
import { difficultyCodes, difficultyLabels, difficultyThresholds, gradingDelays, levelCodes, levelLabels, levelRank, PLACEMENT_DONT_KNOW } from './v2';
import type {
  AnswerNotice, DictationSpec, DictationWord, DraftQuestionV4, ExerciseResult, FillSpec, Grade, Lexicon,
  LexiconEntry, MatchSpec, MissionCriterion, MissionDecision, MissionDefinition, MissionSnapshot, MissionStatus, MissionSummary, MissionView,
  OrderSpec, QuestionItem, QuestionReview, QuestionView, RecordingRef, ReviewerKind, ReviewItem, ReviewQueueItem, SpeakSpec, SpeechAttemptView,
  SpeechMode, SpeechReviewStatus,
} from './v4';
import { countWords, exerciseLimits, missionCriteriaOf, missionLimits, missionMaxScore, speechLimits } from './v4';
import type {
  CineFilm, CineOverview, Film, FilmDocument, FilmEditorDocument, FilmFields, FilmKeyword, FilmRecommendation, FilmSequence, FilmSequenceFields,
  FilmStatus, FilmSummary, LearnerWord, WordSourceKind,
} from './cine';
import { cineLessonId, cineLimits, filmCompletenessIssues, filmStructureIssues, moduleWordSource } from './cine';
import { pilotToday } from './pilot-day';

/**
 * Langues du catalogue (`catalogue.languages`, migration 20261128000100) : le simulateur a sa propre table, comme le serveur,
 * et ne lit pas la liste statique de l'interface (domain/languages.ts, réservée au mode démonstration).
 */
interface MockLanguage { id: string; name: string; nativeName: string; status: 'available' | 'coming_soon'; position: number }
const staticLanguages: MockLanguage[] = ([
  ['de', 'Allemand', 'Deutsch', 'available'], ['en', 'Anglais', 'English'], ['es', 'Espagnol', 'Español'], ['it', 'Italien', 'Italiano'],
  ['pt', 'Portugais', 'Português'], ['nl', 'Néerlandais', 'Nederlands'], ['fr', 'Français langue étrangère', 'Français'], ['ar', 'Arabe', 'العربية'],
  ['zh', 'Chinois (mandarin)', '中文'], ['ja', 'Japonais', '日本語'], ['ru', 'Russe', 'Русский'], ['ko', 'Coréen', '한국어'], ['tr', 'Turc', 'Türkçe'],
  ['pl', 'Polonais', 'Polski'],
] as const).map(([id, name, nativeName, status], index) => ({ id, name, nativeName, status: status ?? 'coming_soon', position: index + 1 }));
const findLanguage = (id: string | null | undefined) => (id ? staticLanguages.find((language) => language.id === id) : undefined);

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
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
// Jour du pilote, comme le serveur (fuseau de Paris), quel que soit le fuseau du navigateur.
const today = () => pilotToday();
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

/**
 * Son muet (une seconde par défaut) : les sons du test, des examens, des dictées, des répétitions et du lexique ne sont
 * pas servis par le simulateur. Le lexique utilise un son plus long, pour que ses segments (start/end) existent.
 */
const silentAudio = new Map<number, string | null>();
function silentAudioUrl(seconds = 1): string | null {
  if (silentAudio.has(seconds)) return silentAudio.get(seconds) ?? null;
  if (typeof URL === 'undefined' || typeof Blob === 'undefined' || !('createObjectURL' in URL)) { silentAudio.set(seconds, null); return null; }
  const rate = 8000;
  const size = rate * seconds;
  const bytes = new Uint8Array(44 + size);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  text(0, 'RIFF'); view.setUint32(4, 36 + size, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true);
  view.setUint32(28, rate, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true); text(36, 'data'); view.setUint32(40, size, true);
  bytes.fill(128, 44);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
  silentAudio.set(seconds, url);
  return url;
}

// ---------------------------------------------------------------------------------------------------------------------
// Contenus (extraits des vrais modules A1 et A2, voir la fin du fichier)
// ---------------------------------------------------------------------------------------------------------------------

interface MockModule {
  id: string; title: string; objective: string; prerequisites: string[];
  activities: [string, 'lesson' | 'exercise' | 'mission', string, number, string[]][];
}
interface MockLevelContent {
  code: LevelCode; settings: { reviewMinutes: number; midtermMinutes: number; finalMinutes: number; passPercent: number }; modules: MockModule[];
}
interface MockQuestion { id: string; prompt: string; options: { id: string; text: string }[]; answer: string }
interface MockActivityDetail { lesson: { title: string; description: string } | null; transcript: string | null; questions: MockQuestion[] }
/** Activité V4 : questions au format du document de version (corrigé compris) et mission. */
interface MockV4Detail {
  lesson: { title: string; description: string } | null; transcript: string | null; questions: DraftQuestionV4[];
  mission?: MissionDefinition;
}
interface MockVocabulary {
  id: string; word: string; article: LexiconEntry['article']; plural: string | null; partOfSpeech: LexiconEntry['partOfSpeech'];
  translation: string; example: string | null; note: string | null;
}

/** Versions publiées, par niveau : un niveau est ouvert si et seulement s'il en a une (comme le catalogue). */
const VERSIONS: Record<string, { id: string; number: number; publishedAt: string }> = {
  A1: { id: 'b1000000-0000-4000-8000-0000000000a1', number: 2, publishedAt: '2026-11-12T09:00:00.000Z' },
  A2: { id: 'b1000000-0000-4000-8000-0000000000a2', number: 2, publishedAt: '2026-11-12T09:00:00.000Z' },
  B1: { id: 'b1000000-0000-4000-8000-0000000000b1', number: 1, publishedAt: '2026-11-24T09:00:00.000Z' },
};
/**
 * Niveaux d'allemand du catalogue (`catalogue.levels`) : titre, description, position et prérequis. Publiés ou non : B2 est
 * un brouillon sans version (« Bientôt »). L'échelle `levelCodes` sert seulement à valider et à classer un code.
 */
interface LevelMeta { code: LevelCode; title: string; description: string; position: number; prerequisite: LevelCode | null }
const LEVELS_META: LevelMeta[] = [
  { code: 'A1', title: 'Allemand A1', description: 'S’exprimer dans des situations simples du quotidien.', position: 1, prerequisite: null },
  { code: 'A2', title: 'Allemand A2', description: 'Préparer des échanges simples sur sa vie de tous les jours.', position: 2, prerequisite: 'A1' },
  { code: 'B1', title: 'Allemand B1', description: 'Raconter, expliquer, défendre un avis et agir dans la vie courante et au travail.', position: 3, prerequisite: 'A2' },
  { code: 'B2', title: 'Allemand B2', description: 'Argumenter, nuancer et comprendre des textes complexes.', position: 4, prerequisite: 'B1' },
];
const MIDTERM = 'bilan-intermediaire';
const FINAL = 'examen-blanc';
const levelMeta = (code: string) => LEVELS_META.find((level) => level.code === code);
const levelTitle = (code: string) => levelMeta(code)?.title ?? `Allemand ${code}`;
/** Niveaux du catalogue dans l'ordre de leur position. */
const catalogueLevels = () => [...LEVELS_META].sort((a, b) => a.position - b.position);
const prerequisiteOf = (code: string): LevelCode | null => levelMeta(code)?.prerequisite ?? null;

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
/** Niveaux ouverts (une version publiée), dans l'ordre du catalogue. */
const publishedLevels = (): LevelCode[] => catalogueLevels().filter((level) => VERSIONS[level.code]).map((level) => level.code);
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
interface ProgressRec { status: 'started' | 'completed'; completedAt: string | null; state: Json; attemptId?: string | null }
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
  /** V4 : remise typée (/assessments/exercises), clé de remise, manche, corrigé figé, répétitions en attente et questions à revoir. */
  typed?: boolean; key?: string; roundId?: string; review?: QuestionReview[]; pending?: number; flagged?: string[];
}
interface SpeechRec {
  id: string; learnerId: string; lessonId: string; questionId: string; roundId: string; sessionId: string | null; activityId: string | null;
  attempt: number; mode: SpeechMode; transcript: string | null; score: number | null; threshold: number; passed: boolean;
  reviewStatus: SpeechReviewStatus; comment: string | null; recording: RecordingRef | null; uploads: Record<string, string>;
  quizAttemptId: string | null; reviewedBy: string | null; reviewedAt: string | null; submittedAt: string | null; createdAt: string;
}
interface MissionRec {
  id: string; learnerId: string; trackVersionId: string; levelCode: LevelCode; moduleId: string; activityId: string; lessonId: string;
  sessionId: string | null; sessionActivityId: string | null; number: number; status: MissionStatus; title: string; definition: MissionSnapshot;
  text: string; checklist: number[]; recording: RecordingRef | null; uploads: Record<string, string>;
  reviewerId: string | null; reviewerKind: ReviewerKind | null; submitKey: string | null; submittedAt: string | null;
  decision: MissionDecision | null; comment: string | null; reviewedBy: string | null; reviewedAt: string | null; createdAt: string; updatedAt: string;
  /** Retour sur grille (niveaux B) : points par critère, score et total ; null sans grille ou avant le retour. */
  points: Record<string, number> | null; score: number | null; maxScore: number | null;
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
  speech: SpeechRec[]; missions: MissionRec[];
  /** Brouillons de version créés dans l'éditeur du catalogue (documents au format 4). */
  catalogueDrafts?: Json[];
  /** Ciné-club : films du catalogue (documents d'import), carnet de mots et recommandations des professeurs. */
  films: FilmRec[]; words: WordRec[]; filmRecommendations: RecommendationRec[];
}
interface FilmRec { document: FilmDocument; status: FilmStatus; updatedAt: string; publishedAt: string | null }
interface WordRec {
  id: string; learnerId: string; languageId: string; word: string; note: string; sourceKind: WordSourceKind; sourceId: string | null;
  createdAt: string; updatedAt: string;
}
type RecommendationRec = FilmRecommendation;

/**
 * 2 : V4 (exercices typés, répétitions orales, missions) ; 4 : niveaux B (B1 publié, missions sur grille) ; 5 : Ciné-club
 * (films, carnet de mots, recommandations). Un état enregistré d'une autre version est abandonné.
 */
const STATE_VERSION = 5;
const STORAGE_KEY = 'linguacap-mock-state';
const IDS = {
  autonome: fixedId(0x101), suivi: fixedId(0x102), yanis: fixedId(0x103), awa: fixedId(0x104), parcours: fixedId(0x105),
  weber: fixedId(0x201), braun: fixedId(0x202), morel: fixedId(0x301), richter: fixedId(0x401),
  test: 'c1000000-0000-4000-8000-000000000001',
};
/** Rôle du simulateur → compte simulé. */
export const mockAccounts: Record<string, string> = {
  'eleve-autonome': IDS.autonome, 'eleve-suivi': IDS.suivi, 'eleve-parcours': IDS.parcours, professeur: IDS.weber, 'professeur-nouveau': IDS.braun,
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

/** Banque du test de niveau publiée d'une langue (la plus récente). */
const publishedTest = (languageId: string) => state().placementTests.filter((test) => test.languageId === languageId && test.status === 'published')
  .sort((a, b) => b.number - a.number)[0];

/** GET /languages : tous les niveaux du catalogue (publiés ou non), dans l'ordre des positions, et les paliers du test. */
function languagesView(): Language[] {
  return staticLanguages.map((language) => ({
    id: language.id, name: language.name, nativeName: language.nativeName, status: language.status, position: language.position,
    placementAvailable: Boolean(publishedTest(language.id)),
    levels: language.id === 'de' ? catalogueLevels().map(({ code, title, position, prerequisite }) => ({
      code, title, published: Boolean(VERSIONS[code]), trackVersionId: VERSIONS[code]?.id ?? null,
      plannedMinutes: VERSIONS[code] ? plannedMinutes(code) : null, moduleCount: VERSIONS[code] ? levelContent(code)?.modules.length ?? 0 : 0,
      position, prerequisiteCode: prerequisite,
    })) : [],
    placementTiers: publishedTest(language.id)?.tiers.map((tier) => tier.code) ?? [],
  }));
}

/** GET /public/languages (sans session) : langues ayant un niveau publié, et leurs seuls niveaux publiés. */
function publicLanguagesView(): PublicLanguage[] {
  return languagesView().flatMap((language) => {
    const levels = language.levels.filter((level) => level.published).map(({ code, title, position, moduleCount, plannedMinutes: minutes }) =>
      ({ code, title, position, moduleCount, plannedMinutes: minutes }));
    return levels.length ? [{ id: language.id, name: language.name, nativeName: language.nativeName, position: language.position, levels }] : [];
  });
}

/**
 * GET /learning/templates : durées par niveau publié. A1 et A2 gardent leurs durées calibrées ; tout autre niveau suit la
 * formule d'Apprentissage, max(1, ceil(minutes prévues × 1,25 / minutes par semaine / 4,345)).
 */
function templatesView(): TemplateView[] {
  const templates = [
    { id: 'standard' as const, name: 'Standard', description: 'Une séance de 30 minutes du lundi au vendredi.', sessions: 1, minutes: 30, days: 5,
      overrides: { A1: 5, A2: 5 } as Record<string, number> },
    { id: 'intensive' as const, name: 'Intensif', description: 'Deux séances de 45 minutes chaque jour ; durée selon le niveau.', sessions: 2, minutes: 45, days: 7,
      overrides: { A1: 1, A2: 2 } as Record<string, number> },
  ];
  return templates.map((template) => {
    const weekly = template.days * template.sessions * template.minutes;
    return {
      id: template.id, name: template.name, description: template.description,
      days: Array.from({ length: template.days }, (_, index) => ({ weekday: index + 1, sessions: template.sessions, minutes: template.minutes })),
      durations: publishedLevels().map((code) => {
        const minutes = plannedMinutes(code);
        return { levelCode: code, plannedMinutes: minutes, months: template.overrides[code] ?? Math.max(1, Math.ceil((minutes * 1.25) / weekly / 4.345)) };
      }),
      a1Duration: `P${template.overrides.A1}M`, a2Duration: `P${template.overrides.A2}M`,
    };
  });
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
  A0: 'Vous débutez',
  A1: 'Vous comprenez des phrases simples du quotidien',
  A2: 'Vous vous débrouillez dans les situations courantes',
  B1: 'Vous comprenez l’essentiel de textes et de conversations variés',
  B2: 'Vous comprenez des textes complexes et argumentés', C1: 'Vous vous exprimez avec aisance', C2: 'Vous maîtrisez la langue',
};
/**
 * Résumé du test de niveau, comme Évaluations : seul le niveau suivant **publié** est annoncé comme une étape ; un niveau
 * suivant non publié « arrive bientôt » ; sans niveau suivant au catalogue, aucune annonce.
 */
function placementResultText(placed: StartLevel): string {
  const next = catalogueLevels().find((level) => (placed === 'A0' ? level.prerequisite === null : level.prerequisite === placed));
  if (!next) return `${RESULTS[placed]}.`;
  if (!VERSIONS[next.code]) return `Vous avez validé le palier ${placed} : le parcours ${next.code} arrive bientôt.`;
  return placed === 'A0' ? `${RESULTS.A0} : votre parcours commencera par le niveau ${next.code}, pas à pas.`
    : `${RESULTS[placed]} : le niveau ${next.code} est votre prochaine étape.`;
}

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
        ? 'Vous avez indiqué n’avoir jamais étudié la langue : votre parcours commencera par le niveau A1.' : placementResultText(placed),
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

/** Questions d'exemple d'un exercice sans contenu détaillé : la deuxième proposition est toujours juste. */
/** Niveaux B : consignes en allemand simple avec la traduction française à côté (marqueur ` [fr] `). */
const bilingualLevel = (code: string) => levelRank(code) >= levelRank('B1');
function syntheticQuestions(title: string, levelCode: string): DraftQuestionV4[] {
  return [1, 2, 3].map((number) => ({
    id: `q${number}`, type: 'choice', moduleRef: null,
    prompt: bilingualLevel(levelCode) ? `Frage ${number} zu „${title}“: Wählen Sie die richtige Antwort. [fr] Question ${number} sur « ${title} » : choisissez la bonne réponse.`
      : `Question ${number} sur « ${title} » : choisissez la bonne réponse.`,
    explanation: 'Dans le simulateur, la deuxième proposition est toujours la réponse attendue ; la vraie API sert l’explication rédigée pour chaque question.',
    options: [
      { id: 'a', label: 'Première proposition', correct: false, feedback: null },
      { id: 'b', label: 'Deuxième proposition (réponse attendue dans le simulateur)', correct: true, feedback: null },
      { id: 'c', label: 'Troisième proposition', correct: false, feedback: null },
    ],
    spec: null,
  }));
}
/** Question historique (choix unique) au format du document de version, avec l'explication ajoutée par la V4 s'il y en a une. */
const legacyQuestion = (activityId: string, question: MockQuestion): DraftQuestionV4 => ({
  id: question.id, type: 'choice', prompt: question.prompt, moduleRef: null, explanation: EXPLANATIONS[activityId]?.[question.id] ?? null,
  options: question.options.map((option) => ({ id: option.id, label: option.text, correct: option.id === question.answer, feedback: null })),
  spec: null,
});
function activityContent(level: MockLevelContent, activityId: string) {
  const found = findActivity(level, activityId);
  if (!found) return undefined;
  const [id, kind, title, minutes, competences] = found.activity;
  const v4 = V4_DETAILS[id];
  const detail = DETAILS[id];
  const questions: DraftQuestionV4[] = v4 ? v4.questions
    : detail?.questions.length ? detail.questions.map((question) => legacyQuestion(id, question))
      : kind === 'exercise' ? syntheticQuestions(title, level.code) : [];
  // Mission d'un niveau B sans contenu détaillé : définition courte, notée sur la grille standard du niveau.
  const fallback = !v4 && kind === 'mission' && bilingualLevel(level.code) ? summaryMission(id, title) : undefined;
  const source = v4 ?? fallback;
  const summary = bilingualLevel(level.code)
    ? `${found.module.objective}\n\nDer Simulator zeigt eine Zusammenfassung dieser Lektion. [fr] Le simulateur présente un résumé de cette leçon, « ${title} » : la vraie API sert la leçon complète, avec ses médias.`
    : `${found.module.objective}\n\nCette leçon, « ${title} », fait partie du module « ${found.module.title} ». Le simulateur en présente un résumé : la vraie API sert la leçon complète, avec ses médias.`;
  return {
    module: found.module, level, id, kind, title, minutes, competences, questions,
    // Comme Apprentissage : la grille est toujours servie avec la mission ([] sans grille).
    mission: source?.mission ? { description: source.lesson?.description ?? '', ...source.mission, criteria: missionCriteriaOf(source.mission) } : null,
    lesson: source?.lesson ?? detail?.lesson ?? (kind === 'lesson' ? { title, description: summary } : null),
    transcript: source?.transcript ?? detail?.transcript ?? null,
  };
}
type MockContent = NonNullable<ReturnType<typeof activityContent>>;
const lessonIdOf = (activityId: string) => `lecon-${activityId}`;
/** Activité du catalogue d'une leçon : « lecon-<activité> », aussi pour un cours ajouté (« ajout-xxxxxx-<activité> »). */
function contentOfLesson(lessonId: string): MockContent | undefined {
  const activityId = lessonId.replace(/^lecon-/, '').replace(/^ajout-[0-9a-f]{6}-/, '');
  const level = CONTENT.find((item) => findActivity(item, activityId));
  return level ? activityContent(level, activityId) : undefined;
}
const isTyped = (questions: DraftQuestionV4[]) => questions.some((question) => (question.type ?? 'choice') !== 'choice');

// --- Vue élève : identifiants opaques et ordre déterministe (jamais une solution) --------------------------------------

function hex6(text: string) {
  let value = 0x811c9dc5;
  for (const char of text) value = Math.imul(value ^ (char.codePointAt(0) ?? 0), 0x01000193) >>> 0;
  return value.toString(16).padStart(8, '0').slice(0, 6);
}
function orderTokens(lessonId: string, question: DraftQuestionV4): QuestionItem[] {
  const { answers } = question.spec as OrderSpec;
  const tokens = answers[0].map((text, index) => ({ id: `k${hex6(`${lessonId}|${question.id}|${text}|${index}`)}`, text }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const shown = normalizeAnswer(tokens.map((token) => token.text).join(' '));
  if (tokens.length > 1 && answers.some((answer) => normalizeAnswer(answer.join(' ')) === shown)) tokens.push(tokens.shift() as QuestionItem);
  return tokens;
}
function matchItems(lessonId: string, question: DraftQuestionV4) {
  const { pairs } = question.spec as MatchSpec;
  const left = pairs.map((pair, index) => ({ id: `l${hex6(`${lessonId}|${question.id}|${pair.left}|${index}`)}`, text: pair.left }));
  const right = pairs.map((pair, index) => ({ id: `r${hex6(`${lessonId}|${question.id}|${pair.right}|${index}`)}`, text: pair.right, index }))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (right.length > 1 && right.every((item, position) => item.index === position)) right.push(right.shift() as (typeof right)[number]);
  const solution: Record<string, string> = Object.fromEntries(left.map((item, index) => [item.id, (right.find((entry) => entry.index === index) as (typeof right)[number]).id]));
  return { left, right: right.map(({ id, text }) => ({ id, text })), solution };
}
/** Vue d'une question sans corrigé (forme servie par le catalogue). */
function questionView(lessonId: string, question: DraftQuestionV4): QuestionView {
  const base = { id: question.id, prompt: question.prompt };
  switch (question.type ?? 'choice') {
    case 'fill': {
      const spec = question.spec as FillSpec;
      return { ...base, type: 'fill', text: spec.text, blanks: spec.blanks.map(({ id, accept, size, hint }) => ({
        id, size: size ?? Math.max(4, ...accept.map((value) => value.length + 2)), hint: hint ?? null })) };
    }
    case 'order': return { ...base, type: 'order', tokens: orderTokens(lessonId, question) };
    case 'match': {
      const { left, right } = matchItems(lessonId, question);
      return { ...base, type: 'match', left, right };
    }
    case 'dictation': {
      const spec = question.spec as DictationSpec;
      return { ...base, type: 'dictation', wordCount: spec.showWordCount ? countWords(spec.accept[0]) : null };
    }
    case 'speak': {
      const spec = question.spec as SpeakSpec;
      return { ...base, type: 'speak', text: spec.text, threshold: spec.threshold };
    }
    default: return { ...base, type: 'choice', options: question.options.map((option) => ({ id: option.id, text: option.label })) };
  }
}
/** Sons des dictées (transcription après la réponse) et des répétitions (à la demande), rattachés à leur question. */
function questionPlacements(activityId: string, questions: DraftQuestionV4[], answered: boolean) {
  return questions.filter((question) => question.type === 'dictation' || question.type === 'speak').map((question, index) => ({
    position: index + 1, assetId: `${activityId}-${question.id}`, assetVersion: 1, usage: 'audio' as const, alt: null, caption: null,
    transcriptAvailable: question.type === 'speak' || answered, decorative: false, questionId: question.id, optionId: null,
    url: silentAudioUrl(), mimeType: 'audio/wav',
  }));
}

// --- Règles de correction (version simplifiée d'AnswerRules) -----------------------------------------------------------

const UNITS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn',
  'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
/** Nombre de 0 à 9 999 en toutes lettres (21 → einundzwanzig). */
function numberWords(value: number): string {
  if (value < 20) return UNITS[value];
  if (value < 100) {
    const unit = value % 10;
    return unit ? `${unit === 1 ? 'ein' : UNITS[unit]}und${TENS[Math.floor(value / 10)]}` : TENS[value / 10];
  }
  if (value < 1000) {
    const rest = value % 100;
    return `${Math.floor(value / 100) === 1 ? 'ein' : UNITS[Math.floor(value / 100)]}hundert${rest ? numberWords(rest) : ''}`;
  }
  const rest = value % 1000;
  return `${Math.floor(value / 1000) === 1 ? 'ein' : numberWords(Math.floor(value / 1000))}tausend${rest ? numberWords(rest) : ''}`;
}
/** Mots d'une réponse, casse conservée : NFC, espaces insécables, guillemets et ponctuation retirés, nombres en lettres. */
function answerWords(text: string): string[] {
  return text.normalize('NFC').replace(/[   ]/g, ' ').replace(/[’‘]/g, '\'').replace(/["„“”«»‚]/g, '')
    .replace(/(\d)\.(?=\d{3}(?!\d))/g, '$1')
    .replace(/[.,;:!?¿¡()[\]…–—/]/g, ' ')
    .replace(/\d+/g, (digits) => (Number(digits) <= 9999 ? numberWords(Number(digits)) : digits))
    .split(/\s+/).filter((word) => word && word !== '-');
}
const lower = (word: string) => word.toLocaleLowerCase('de-DE');
const normalizeAnswer = (text: string) => answerWords(text).map(lower).join(' ');
const transliterate = (word: string) => word.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
function levenshtein(a: string, b: string) {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    previous = row;
  }
  return previous[b.length];
}
type WordMatch = 'ok' | 'translit' | 'near' | 'wrong';
function compareWord(expected: string, given: string): WordMatch {
  const e = lower(expected);
  const g = lower(given);
  if (e === g) return 'ok';
  if (transliterate(e) === transliterate(g)) return 'translit';
  return levenshtein(e, g) <= (e.length >= 8 ? 2 : 1) ? 'near' : 'wrong';
}
/** Nom tapé en minuscule (accepté avec la remarque « case ») ; le premier mot d'une phrase n'est pas contrôlé. */
const caseSlip = (expected: string, given: string) => expected[0] !== lower(expected[0]) && given[0] === lower(given[0]) && given[0] !== given[0].toLocaleUpperCase('de-DE');

/** Réponse courte (trou) : exacte à la normalisation près, avec les remarques translittération et casse. */
function matchText(given: string, accepted: string[]): { correct: boolean; notices: AnswerNotice[] } {
  const words = answerWords(given);
  let best: { correct: boolean; notices: AnswerNotice[] } = { correct: false, notices: [] };
  for (const option of accepted) {
    const expected = answerWords(option);
    if (expected.length !== words.length || !expected.length) continue;
    const matches = expected.map((word, index) => compareWord(word, words[index]));
    if (!matches.every((match) => match === 'ok' || match === 'translit')) continue;
    const notices: AnswerNotice[] = [];
    if (matches.includes('translit')) notices.push('transliteration');
    if (expected.some((word, index) => matches[index] === 'ok' && caseSlip(word, words[index]))) notices.push('case');
    if (!notices.length) return { correct: true, notices };
    best = { correct: true, notices };
  }
  return best;
}
/** Alignement mot à mot (Levenshtein sur les mots) : un mot « near » coûte 0,5, un mot manquant, faux ou en trop 1. */
function alignWords(expected: string[], given: string[]) {
  const step: Record<WordMatch, number> = { ok: 0, translit: 0, near: 0.5, wrong: 1 };
  const cost = Array.from({ length: expected.length + 1 }, (_, i) => Array.from({ length: given.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= expected.length; i++) {
    for (let j = 1; j <= given.length; j++) {
      cost[i][j] = Math.min(cost[i - 1][j - 1] + step[compareWord(expected[i - 1], given[j - 1])], cost[i - 1][j] + 1, cost[i][j - 1] + 1);
    }
  }
  const words: DictationWord[] = [];
  let i = expected.length;
  let j = given.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const match = compareWord(expected[i - 1], given[j - 1]);
      if (cost[i][j] === cost[i - 1][j - 1] + step[match]) {
        words.unshift({ expected: expected[i - 1], given: given[j - 1], status: match });
        i--; j--;
        continue;
      }
    }
    if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      words.unshift({ expected: expected[i - 1], given: null, status: 'missing' });
      i--;
      continue;
    }
    words.unshift({ expected: null, given: given[j - 1], status: 'extra' });
    j--;
  }
  const total = cost[expected.length][given.length];
  return { words, cost: total, score: Math.max(0, Math.round(100 * (1 - total / Math.max(expected.length, given.length, 1)))) };
}
/** Meilleur score de répétition sur les transcriptions proposées × les réponses acceptées. */
function speechScore(spec: SpeakSpec, transcripts: string[]) {
  let best = { score: 0, transcript: transcripts[0] ?? '' };
  for (const transcript of transcripts) {
    for (const accepted of spec.accept) {
      const { score } = alignWords(answerWords(accepted), answerWords(transcript));
      if (score > best.score) best = { score, transcript };
    }
  }
  return best;
}

// --- Exercices typés : remise et corrigé ---------------------------------------------------------------------------------

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);
const speechOfRound = (learnerId: string, roundId: string, questionId: string) => state().speech
  .filter((item) => item.learnerId === learnerId && item.roundId === roundId && item.questionId === questionId).sort((a, b) => a.attempt - b.attempt);
const failuresUpTo = (attempt: SpeechRec) => speechOfRound(attempt.learnerId, attempt.roundId, attempt.questionId)
  .filter((item) => item.mode === 'recognition' && !item.passed && item.attempt <= attempt.attempt).length;

function gradeQuestion(actor: UserRec, lessonId: string, roundId: string, question: DraftQuestionV4, answer: unknown): { review: QuestionReview; speech?: SpeechRec } {
  const common = { id: question.id, prompt: question.prompt, explanation: question.explanation ?? null };
  const wrongShape = () => invalid(`Réponse invalide pour la question ${question.id}.`);
  if (!isObject(answer)) throw wrongShape();
  switch (question.type ?? 'choice') {
    case 'fill': {
      const spec = question.spec as FillSpec;
      const given = answer.blanks;
      if (!isObject(given) || Object.values(given).some((value) => typeof value !== 'string' || value.length > exerciseLimits.blankChars)) throw wrongShape();
      const blanks = Object.fromEntries(spec.blanks.map((blank) => [blank.id, matchText(String(given[blank.id] ?? ''), blank.accept)]));
      const correct = Object.values(blanks).every((blank) => blank.correct);
      return { review: { ...common, type: 'fill', status: correct ? 'correct' : 'incorrect', given: { blanks: given as Record<string, string> },
        expected: { blanks: Object.fromEntries(spec.blanks.map((blank) => [blank.id, blank.accept])), text: spec.text }, feedback: null,
        notices: [...new Set(Object.values(blanks).flatMap((blank) => (blank.correct ? blank.notices : [])))], detail: { blanks } } };
    }
    case 'order': {
      const tokens = orderTokens(lessonId, question);
      const order = answer.order;
      if (!Array.isArray(order) || order.length !== tokens.length || order.length > exerciseLimits.tokens
        || [...order].sort().join('|') !== tokens.map((token) => token.id).sort().join('|')) throw wrongShape();
      const sentence = (order as string[]).map((id) => (tokens.find((token) => token.id === id) as QuestionItem).text).join(' ');
      const { answers } = question.spec as OrderSpec;
      const correct = answers.some((candidate) => normalizeAnswer(candidate.join(' ')) === normalizeAnswer(sentence));
      return { review: { ...common, type: 'order', status: correct ? 'correct' : 'incorrect', given: { order: order as string[], sentence },
        expected: { sentence: answers[0].join(' '), alternatives: answers.slice(1).map((candidate) => candidate.join(' ')) },
        feedback: null, notices: [], detail: null } };
    }
    case 'match': {
      const { left, right, solution } = matchItems(lessonId, question);
      const pairs = answer.pairs;
      if (!isObject(pairs) || Object.keys(pairs).length > exerciseLimits.pairs
        || Object.entries(pairs).some(([key, value]) => !left.some((item) => item.id === key) || !right.some((item) => item.id === value))) throw wrongShape();
      const detail = Object.fromEntries(left.map((item) => [item.id, pairs[item.id] === solution[item.id]]));
      return { review: { ...common, type: 'match', status: Object.values(detail).every(Boolean) ? 'correct' : 'incorrect',
        given: { pairs: pairs as Record<string, string> },
        expected: { pairs: solution, labels: Object.fromEntries([...left, ...right].map((item) => [item.id, item.text])) },
        feedback: null, notices: [], detail: { pairs: detail } } };
    }
    case 'dictation': {
      const spec = question.spec as DictationSpec;
      if (typeof answer.text !== 'string' || answer.text.length > exerciseLimits.textChars) throw wrongShape();
      const words = answerWords(answer.text);
      const best = spec.accept.map((accepted) => ({ accepted, ...alignWords(answerWords(accepted), words) })).sort((a, b) => a.cost - b.cost)[0];
      const correct = !best.words.some((word) => word.status === 'missing' || word.status === 'wrong' || word.status === 'extra');
      const notices: AnswerNotice[] = [];
      if (best.words.some((word) => word.status === 'translit')) notices.push('transliteration');
      if (best.words.some((word) => word.status === 'near')) notices.push('typo');
      if (best.words.some((word, index) => index > 0 && word.status === 'ok' && word.expected && word.given && caseSlip(word.expected, word.given))) notices.push('case');
      return { review: { ...common, type: 'dictation', status: correct ? 'correct' : 'incorrect', given: { text: answer.text },
        expected: { text: best.accepted }, feedback: null, notices, detail: { score: best.score, words: best.words } } };
    }
    case 'speak': {
      const spec = question.spec as SpeakSpec;
      if (typeof answer.speechAttemptId !== 'string') throw wrongShape();
      const speech = state().speech.find((item) => item.id === answer.speechAttemptId && item.learnerId === actor.id);
      if (!speech || speech.lessonId !== lessonId || speech.questionId !== question.id || speech.roundId !== roundId) {
        throw conflict(`Essai de répétition introuvable pour la question ${question.id} de cette manche.`);
      }
      const attempts = speechOfRound(actor.id, roundId, question.id);
      const failures = attempts.filter((item) => item.mode === 'recognition' && !item.passed).length;
      let status: QuestionReview['status'] | null = null;
      if (speech.passed) status = 'correct';
      else if (speech.mode === 'recording') status = speech.reviewStatus === 'pending' ? 'pending' : speech.reviewStatus === 'rejected' ? 'flagged' : null;
      else if (failures >= speechLimits.failuresBeforeSkip) status = 'flagged';
      if (!status) throw conflict('Répétez la phrase jusqu’à la réussir, ou passez à la suite après trois essais.');
      return { speech, review: { ...common, type: 'speak', status, given: { speechAttemptId: speech.id, transcript: speech.transcript }, expected: { text: spec.text },
        feedback: null, notices: [], detail: { score: speech.score, transcript: speech.transcript, attempts: attempts.length, mode: speech.mode, reviewStatus: speech.reviewStatus } } };
    }
    default: {
      const chosen = question.options.find((option) => option.id === answer.choice);
      if (!chosen) throw wrongShape();
      const right = question.options.find((option) => option.correct) ?? question.options[0];
      return { review: { ...common, type: 'choice', status: chosen.correct ? 'correct' : 'incorrect', given: { choice: chosen.id, label: chosen.label },
        expected: { optionId: right.id, label: right.label }, feedback: chosen.feedback ?? null, notices: [], detail: null } };
    }
  }
}

const publicGradeId = (grade: GradeRec) => (grade.id.includes(':') ? fixedId(Math.abs(hash(grade.id))) : grade.id);
const gradeView = (grade: GradeRec): Grade => ({
  kind: 'quiz', id: publicGradeId(grade), lessonId: grade.lessonId, correct: grade.correct, total: grade.total, submittedAt: grade.submittedAt,
  sessionId: grade.sessionId, activityId: grade.activityId, moduleScores: null, pending: grade.pending ?? 0, flagged: grade.flagged ?? [], typed: grade.typed ?? false,
});
function hash(text: string) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) | 0;
  return value;
}
const lastGrade = (learnerId: string, activityId: string) => state().grades
  .filter((grade) => grade.learnerId === learnerId && grade.activityId === activityId).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
const isUuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(value);
/** sessionId et l'identifiant d'activité de séance sont indissociables ; la séance doit appartenir à l'élève. */
function sessionContext(actor: UserRec, sessionId: unknown, activityId: unknown) {
  if ((sessionId === undefined || sessionId === null) !== (activityId === undefined || activityId === null)) throw invalid('La séance et son activité vont ensemble.');
  if (sessionId === undefined || sessionId === null) return null;
  if (typeof sessionId !== 'string' || typeof activityId !== 'string') throw invalid('Séance ou activité invalide.');
  const { path, session } = sessionOwner(actor, sessionId);
  if (path.learnerId !== actor.id) throw forbidden();
  const item = session.items.find((candidate) => candidate.id === activityId);
  if (!item) throw notFound('Activité introuvable dans cette séance.');
  return { path, session, item };
}

/** Questions corrigées d'une leçon : activité d'un niveau, ou séquence d'un film publié du Ciné-club (`cine-<séquence>`). */
function exerciseOfLesson(lessonId: string): { activityId: string | null; questions: DraftQuestionV4[] } | undefined {
  const cine = cineSequenceOfLesson(lessonId);
  if (cine) return cine.film.status === 'published' ? { activityId: null, questions: cine.sequence.questions } : undefined;
  const content = contentOfLesson(lessonId);
  return content ? { activityId: content.id, questions: content.questions } : undefined;
}

/** POST /assessments/exercises : corrige chaque question, fige le corrigé et rattache les essais de répétition. */
function gradeExercise(actor: UserRec, body: Json, key: string | undefined): ExerciseResult {
  requireLearner(actor);
  if (typeof body.lessonId !== 'string' || !isUuid(body.roundId) || !isObject(body.answers)) throw invalid('Leçon, manche (roundId) et réponses attendues.');
  const context = sessionContext(actor, body.sessionId, body.activityId);
  const content = exerciseOfLesson(body.lessonId);
  if (!content || !content.questions.length) throw notFound('Exercice introuvable.');
  const existing = key ? state().grades.find((grade) => grade.key === `${actor.id}:${key}`) : undefined;
  if (existing?.review) return { grade: gradeView(existing), questions: existing.review };
  const answers = body.answers;
  // Une manche se remet une fois : les mêmes réponses renvoient la même correction, d'autres réponses sont refusées.
  const sameRound = state().grades.find((grade) => grade.learnerId === actor.id && grade.roundId === body.roundId && grade.lessonId === body.lessonId);
  if (sameRound?.review) {
    const replay = sameRound.review.every((item) => JSON.stringify(item.given && Object.fromEntries(Object.entries(item.given)
      .filter(([name]) => !['label', 'sentence', 'transcript'].includes(name)))) === JSON.stringify(answers[item.id]));
    if (replay) return { grade: gradeView(sameRound), questions: sameRound.review };
    throw conflict('Cette manche est déjà remise : recommencez l’exercice pour une nouvelle manche.');
  }
  if (Object.keys(answers).length > exerciseLimits.questions) throw invalid(`${exerciseLimits.questions} réponses au plus.`);
  const missing = content.questions.filter((question) => !(question.id in answers));
  if (missing.length) throw invalid(`Répondez à toutes les questions (${missing.map((question) => question.id).join(', ')}).`);
  const graded = content.questions.map((question) => gradeQuestion(actor, body.lessonId as string, body.roundId as string, question, answers[question.id]));
  const review = graded.map((item) => item.review);
  const grade: GradeRec = {
    id: newId(), key: key ? `${actor.id}:${key}` : undefined, learnerId: actor.id, lessonId: body.lessonId,
    activityId: context ? context.item.id : content.activityId, sessionId: context ? context.session.id : null,
    correct: review.filter((item) => item.status === 'correct').length, total: review.length, submittedAt: now(),
    typed: true, roundId: body.roundId as string, review,
    pending: review.filter((item) => item.status === 'pending').length, flagged: review.filter((item) => item.status === 'flagged').map((item) => item.id),
  };
  for (const { speech } of graded) if (speech) speech.quizAttemptId = grade.id;
  state().grades.push(grade);
  return { grade: gradeView(grade), questions: review };
}

/** GET /assessments/exercises/{attemptId} : corrigé figé, ou calculé à la volée (sans explication) pour une ancienne remise. */
function exerciseResult(actor: UserRec, attemptId: string): ExerciseResult {
  const grade = state().grades.find((item) => publicGradeId(item) === attemptId);
  if (!grade) throw notFound('Remise introuvable.');
  readable(actor, grade.learnerId);
  if (grade.review) return { grade: gradeView(grade), questions: grade.review };
  const content = contentOfLesson(grade.lessonId) ?? contentOfLesson(grade.activityId ?? '');
  const questions: QuestionReview[] = (content?.questions ?? []).filter((question) => (question.type ?? 'choice') === 'choice').map((question, index) => {
    const right = question.options.find((option) => option.correct) ?? question.options[0];
    return { id: question.id, prompt: question.prompt, type: 'choice', status: index < grade.correct ? 'correct' : 'incorrect', given: null,
      expected: { optionId: right.id, label: right.label }, explanation: null, feedback: null, notices: [], detail: null };
  });
  return { grade: gradeView(grade), questions };
}

/** Ancienne route des quiz : refusée (409) pour une leçon qui contient des questions typées. */
function gradeQuiz(actor: UserRec, body: Json, key: string | undefined) {
  requireLearner(actor);
  if (typeof body.lessonId !== 'string' || typeof body.answers !== 'object' || body.answers === null) throw invalid('Exercice et réponses attendus.');
  const activityId = typeof body.activityId === 'string' ? body.activityId : body.lessonId.replace(/^lecon-/, '');
  const sourceId = activityId.replace(/^ajout-[0-9a-f]{6}-/, '');
  const level = CONTENT.find((item) => findActivity(item, sourceId));
  const content = level ? activityContent(level, sourceId) : undefined;
  if (!content || !content.questions.length) throw notFound('Exercice introuvable.');
  if (isTyped(content.questions)) throw conflict('Cette leçon contient des questions typées : remettez-la avec /assessments/exercises.');
  const existing = key ? state().grades.find((grade) => grade.id === `${actor.id}:${key}`) : undefined;
  if (existing) return gradeView(existing);
  const answers = body.answers as Record<string, string>;
  const grade: GradeRec = { id: key ? `${actor.id}:${key}` : newId(), learnerId: actor.id, lessonId: body.lessonId, activityId,
    sessionId: typeof body.sessionId === 'string' ? body.sessionId : null,
    correct: content.questions.filter((question) => question.options.find((option) => option.correct)?.id === answers[question.id]).length,
    total: content.questions.length, submittedAt: now() };
  state().grades.push(grade);
  return gradeView(grade);
}

// --- Répétition orale ----------------------------------------------------------------------------------------------------

/** Correcteur d'un élève : professeur référent, sinon correcteur désigné ; l'administration voit tout. */
function graderOf(learner: UserRec): { id: string; kind: ReviewerKind } | null {
  if (learner.teacherId) return { id: learner.teacherId, kind: 'teacher' };
  if (learner.reviewerId) return { id: learner.reviewerId, kind: 'reviewer' };
  return null;
}
const isGrader = (actor: UserRec, learner: UserRec) => actor.role === 'admin'
  || (graderOf(learner)?.id === actor.id && (actor.role === 'teacher' || actor.permissions.includes('correction')));
const recordingView = (recording: RecordingRef | null): RecordingRef | null => (recording ? { ...recording, url: silentAudioUrl(3) } : null);

function speechView(item: SpeechRec): SpeechAttemptView {
  const failures = failuresUpTo(item);
  const spec = contentOfLesson(item.lessonId)?.questions.find((question) => question.id === item.questionId)?.spec as SpeakSpec | undefined;
  return {
    id: item.id, learnerId: item.learnerId, text: spec?.text ?? null, lessonId: item.lessonId, questionId: item.questionId, roundId: item.roundId, attempt: item.attempt, mode: item.mode,
    score: item.score, passed: item.passed, threshold: item.threshold, failures, canSkip: failures >= speechLimits.failuresBeforeSkip,
    transcript: item.transcript, reviewStatus: item.reviewStatus, comment: item.comment, recording: recordingView(item.recording), createdAt: item.createdAt,
  };
}
function speakQuestion(lessonId: unknown, questionId: unknown) {
  if (typeof lessonId !== 'string' || typeof questionId !== 'string') throw invalid('Leçon et question attendues.');
  const content = contentOfLesson(lessonId);
  const question = content?.questions.find((item) => item.id === questionId);
  if (!content || !question) throw notFound('Question introuvable.');
  if (question.type !== 'speak') throw conflict('Cette question n’est pas une répétition orale.');
  return { content, question, spec: question.spec as SpeakSpec };
}
function newSpeech(actor: UserRec, body: Json, mode: SpeechMode, spec: SpeakSpec): SpeechRec {
  if (!isUuid(body.roundId)) throw invalid('Manche (roundId) attendue.');
  const context = sessionContext(actor, body.sessionId, body.activityId);
  const previous = speechOfRound(actor.id, body.roundId, String(body.questionId));
  if (previous.length >= speechLimits.attemptsPerRound) throw conflict('Dix essais au plus par manche : recommencez l’exercice.');
  return {
    id: newId(), learnerId: actor.id, lessonId: String(body.lessonId), questionId: String(body.questionId), roundId: body.roundId,
    sessionId: context?.session.id ?? null, activityId: context?.item.id ?? null, attempt: previous.length + 1, mode, transcript: null, score: null,
    threshold: spec.threshold, passed: false, reviewStatus: mode === 'recording' ? 'uploading' : 'auto', comment: null, recording: null, uploads: {},
    quizAttemptId: null, reviewedBy: null, reviewedAt: null, submittedAt: null, createdAt: now(),
  };
}
/** POST /assessments/speech : le serveur recalcule le score à partir des transcriptions du navigateur. */
function speechAttempt(actor: UserRec, body: Json): SpeechAttemptView {
  requireLearner(actor);
  const { spec } = speakQuestion(body.lessonId, body.questionId);
  const transcripts = body.transcripts;
  if (!Array.isArray(transcripts) || !transcripts.length || transcripts.length > speechLimits.transcripts
    || transcripts.some((value) => typeof value !== 'string' || value.length > speechLimits.transcriptChars)) throw invalid('Une à cinq transcriptions de 300 caractères au plus.');
  const item = newSpeech(actor, body, 'recognition', spec);
  const best = speechScore(spec, transcripts as string[]);
  Object.assign(item, { transcript: best.transcript, score: best.score, passed: best.score >= spec.threshold });
  state().speech.push(item);
  return speechView(item);
}
/** POST /assessments/speech/recordings : essai « enregistrement » et réservation du dépôt dans Médias. */
function reserveSpeechRecording(actor: UserRec, body: Json) {
  requireLearner(actor);
  const { spec } = speakQuestion(body.lessonId, body.questionId);
  const mimeType = checkRecording(body);
  const item = newSpeech(actor, body, 'recording', spec);
  const upload = { id: newId(), uploadUrl: null, maxBytes: RECORDING_MAX_BYTES };
  item.uploads[upload.id] = mimeType;
  state().speech.push(item);
  return { status: 201, body: { attempt: speechView(item), upload } };
}
function findSpeech(actor: UserRec, id: string) {
  const item = state().speech.find((candidate) => candidate.id === id);
  if (!item) throw notFound('Essai introuvable.');
  const learner = learnerById(item.learnerId);
  if (actor.id !== learner.id && !isGrader(actor, learner)) throw forbidden('Cet essai n’est pas confié à votre compte.');
  return item;
}
function finalizeSpeechRecording(actor: UserRec, id: string, productionId: string): SpeechAttemptView {
  const item = findSpeech(actor, id);
  if (item.learnerId !== actor.id) throw forbidden();
  const mimeType = item.uploads[productionId];
  if (!mimeType) throw notFound('Dépôt introuvable.');
  if (item.reviewStatus !== 'uploading') throw conflict('Cet enregistrement est déjà envoyé.');
  Object.assign(item, { recording: { productionId, mimeType, url: null }, reviewStatus: 'pending', submittedAt: now() });
  return speechView(item);
}
/** POST /assessments/speech/{id}/review : la décision met aussi à jour la remise de l'exercice (correct ou à revoir). */
function reviewSpeech(actor: UserRec, id: string, body: Json): SpeechAttemptView {
  const item = findSpeech(actor, id);
  if (!isGrader(actor, learnerById(item.learnerId))) throw forbidden('Seul le correcteur de l’élève valide ses répétitions.');
  if (item.reviewStatus !== 'pending') throw conflict('Cette répétition n’attend pas de validation.');
  if (body.decision !== 'validated' && body.decision !== 'rejected') throw invalid('Décision attendue : validated ou rejected.');
  if (body.comment !== undefined && (typeof body.comment !== 'string' || body.comment.length > 1000)) throw invalid('Commentaire de 1 000 caractères au plus.');
  const validated = body.decision === 'validated';
  Object.assign(item, { reviewStatus: body.decision, passed: validated, comment: typeof body.comment === 'string' && body.comment.trim() ? body.comment.trim() : null,
    reviewedBy: actor.id, reviewedAt: now() });
  const grade = state().grades.find((candidate) => candidate.id === item.quizAttemptId);
  const entry = grade?.review?.find((question) => question.id === item.questionId);
  if (grade && entry && entry.status === 'pending' && entry.type === 'speak') {
    grade.pending = Math.max(0, (grade.pending ?? 0) - 1);
    if (validated) grade.correct += 1;
    else grade.flagged = [...new Set([...(grade.flagged ?? []), item.questionId])];
    entry.status = validated ? 'correct' : 'flagged';
    if (entry.detail) Object.assign(entry.detail, { reviewStatus: item.reviewStatus, comment: item.comment });
  }
  return speechView(item);
}

// --- Missions ------------------------------------------------------------------------------------------------------------

const RECORDING_MAX_BYTES = 26_214_400;
const RECORDING_TYPES = ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav'];
function checkRecording(body: Json) {
  if (typeof body.mimeType !== 'string' || !RECORDING_TYPES.includes(body.mimeType)) throw invalid('Formats acceptés : WebM, Ogg, MP3, MP4 ou WAV.');
  if (typeof body.size !== 'number' || body.size < 1 || body.size > RECORDING_MAX_BYTES) throw invalid('L’enregistrement dépasse 25 Mo.');
  return body.mimeType;
}
const canReviewMission = (actor: UserRec, mission: MissionRec) => mission.status === 'submitted'
  && (actor.role === 'admin' || (mission.reviewerId === actor.id && (actor.role === 'teacher' || actor.permissions.includes('correction'))));
function missionView(mission: MissionRec, actor: UserRec): MissionView {
  return {
    id: mission.id, learnerId: mission.learnerId, trackVersionId: mission.trackVersionId, levelCode: mission.levelCode, moduleId: mission.moduleId,
    activityId: mission.activityId, sessionId: mission.sessionId, sessionActivityId: mission.sessionActivityId, number: mission.number, title: mission.title,
    definition: mission.definition, status: mission.status, text: mission.text, checklist: mission.checklist, recording: recordingView(mission.recording),
    reviewerKind: mission.reviewerKind, submittedAt: mission.submittedAt,
    // Les points n'apparaissent qu'avec le retour, jamais avant.
    review: mission.status === 'reviewed' && mission.decision ? { decision: mission.decision, comment: mission.comment, reviewedAt: mission.reviewedAt as string,
      points: mission.points, score: mission.score, maxScore: mission.maxScore } : null,
    canReview: canReviewMission(actor, mission), createdAt: mission.createdAt, updatedAt: mission.updatedAt,
  };
}
const missionSummary = (mission: MissionRec): MissionSummary => ({
  id: mission.id, activityId: mission.activityId, title: mission.title, levelCode: mission.levelCode, moduleId: mission.moduleId, status: mission.status,
  decision: mission.decision, submittedAt: mission.submittedAt, reviewedAt: mission.reviewedAt, sessionId: mission.sessionId,
  score: mission.status === 'reviewed' ? mission.score : null, maxScore: mission.status === 'reviewed' ? mission.maxScore : null,
});
function findMission(actor: UserRec, id: string) {
  const mission = state().missions.find((item) => item.id === id);
  if (!mission) throw notFound('Mission introuvable.');
  const learner = learnerById(mission.learnerId);
  if (actor.id !== learner.id && actor.role !== 'admin' && mission.reviewerId !== actor.id && !(actor.role === 'teacher' && learner.teacherId === actor.id)) {
    throw forbidden('Cette mission n’est pas confiée à votre compte.');
  }
  return mission;
}
function ownDraft(actor: UserRec, id: string) {
  const mission = findMission(actor, id);
  if (mission.learnerId !== actor.id) throw forbidden('Seul l’élève modifie sa mission.');
  if (mission.status !== 'draft') throw conflict('Cette mission est déjà envoyée.');
  return mission;
}
/** POST /assessments/missions : dernière remise de ce contexte (200), ou nouveau brouillon (201). */
function openMission(actor: UserRec, body: Json) {
  requireLearner(actor);
  if (!isUuid(body.trackVersionId) || typeof body.activityId !== 'string') throw invalid('Version et activité attendues.');
  const level = versionLevel(body.trackVersionId);
  const content = level ? activityContent(level, body.activityId) : undefined;
  if (!level || !content) throw notFound('Activité introuvable.');
  if (content.kind !== 'mission' || !content.mission) throw conflict('Cette activité n’est pas une mission.');
  const context = sessionContext(actor, body.sessionId, body.sessionActivityId);
  const sessionId = context?.session.id ?? null;
  const sessionActivityId = context?.item.id ?? null;
  const mine = state().missions.filter((item) => item.learnerId === actor.id && item.trackVersionId === body.trackVersionId && item.activityId === content.id)
    .sort((a, b) => b.number - a.number);
  const latest = mine.find((item) => item.sessionId === sessionId && item.sessionActivityId === sessionActivityId);
  if (body.restart === true) {
    const previous = latest ?? mine[0];
    if (!previous || !(previous.status === 'sent' || (previous.status === 'reviewed' && previous.decision === 'to_redo'))) {
      throw conflict('Une mission se reprend après un retour « à reprendre » ou un envoi sans correcteur.');
    }
  } else if (latest) {
    return { status: 200, body: missionView(latest, actor) };
  }
  const draft = mine.find((item) => item.status === 'draft');
  if (draft) {
    Object.assign(draft, { sessionId, sessionActivityId, updatedAt: now() });
    return { status: 200, body: missionView(draft, actor) };
  }
  const stamp = now();
  const mission: MissionRec = {
    id: newId(), learnerId: actor.id, trackVersionId: body.trackVersionId, levelCode: level.code, moduleId: content.module.id, activityId: content.id,
    lessonId: lessonIdOf(content.id), sessionId, sessionActivityId, number: (mine[0]?.number ?? 0) + 1, status: 'draft', title: content.title,
    definition: { ...content.mission, description: content.lesson?.description ?? '' }, text: body.restart === true ? mine[0]?.text ?? '' : '',
    checklist: [], recording: null, uploads: {}, reviewerId: null, reviewerKind: null, submitKey: null, submittedAt: null, decision: null, comment: null,
    reviewedBy: null, reviewedAt: null, createdAt: stamp, updatedAt: stamp, points: null, score: null, maxScore: null,
  };
  state().missions.push(mission);
  return { status: 201, body: missionView(mission, actor) };
}
function saveMission(actor: UserRec, id: string, body: Json): MissionView {
  const mission = ownDraft(actor, id);
  if (body.text !== undefined) {
    // Comme Évaluations : 3 000 caractères au plus, la limite de la mission, et pas de texte sans partie écrite.
    if (typeof body.text !== 'string' || body.text.length > missionLimits.textChars) {
      throw invalid(`Le texte compte ${missionLimits.textChars.toLocaleString('fr-FR')} caractères au plus.`);
    }
    const written = mission.definition.written;
    if (!written && body.text.trim()) throw invalid('Cette mission n’attend pas de texte écrit.');
    if (written && body.text.length > written.maxChars) throw invalid(`Le texte de cette mission compte ${written.maxChars} caractères au plus.`);
    mission.text = body.text;
  }
  if (body.checklist !== undefined) {
    const items = body.checklist;
    if (!Array.isArray(items) || new Set(items).size !== items.length
      || items.some((value) => !Number.isInteger(value) || value < 0 || value >= mission.definition.checklist.length)) throw invalid('Liste de vérification invalide.');
    mission.checklist = [...(items as number[])].sort((a, b) => a - b);
  }
  mission.updatedAt = now();
  return missionView(mission, actor);
}
function reserveMissionRecording(actor: UserRec, id: string, body: Json) {
  const mission = ownDraft(actor, id);
  if (!mission.definition.oral) throw conflict('Cette mission n’a pas de partie orale.');
  const mimeType = checkRecording(body);
  const upload = { id: newId(), uploadUrl: null, maxBytes: RECORDING_MAX_BYTES };
  mission.uploads[upload.id] = mimeType;
  return upload;
}
function finalizeMissionRecording(actor: UserRec, id: string, productionId: string): MissionView {
  const mission = ownDraft(actor, id);
  const mimeType = mission.uploads[productionId];
  if (!mimeType) throw notFound('Dépôt introuvable.');
  Object.assign(mission, { recording: { productionId, mimeType, url: null }, updatedAt: now() });
  return missionView(mission, actor);
}
/** POST …/submit : liste entièrement cochée, texte et enregistrement exigés selon les parties ; destinataire selon l'élève. */
function submitMission(actor: UserRec, id: string, key: string | undefined): MissionView {
  const mission = findMission(actor, id);
  if (mission.learnerId !== actor.id) throw forbidden('Seul l’élève envoie sa mission.');
  if (mission.status !== 'draft') {
    if (key && mission.submitKey === key) return missionView(mission, actor);
    throw conflict('Cette mission est déjà envoyée.');
  }
  const { written, oral, checklist } = mission.definition;
  if (mission.checklist.length !== checklist.length) throw conflict('Cochez chaque point de la liste avant d’envoyer.');
  if (written) {
    if (!mission.text.trim()) throw conflict('Écrivez votre texte avant d’envoyer.');
    if (mission.text.length > written.maxChars) throw conflict(`Le texte dépasse ${written.maxChars} caractères.`);
    if (countWords(mission.text) < written.minWords) throw conflict(`Écrivez au moins ${written.minWords} mots.`);
  }
  if (oral && !mission.recording) throw conflict('Enregistrez votre partie orale avant d’envoyer.');
  const grader = graderOf(actor);
  Object.assign(mission, { status: grader ? 'submitted' : 'sent', reviewerId: grader?.id ?? null, reviewerKind: grader?.kind ?? null,
    submitKey: key ?? null, submittedAt: now(), updatedAt: now() });
  return missionView(mission, actor);
}
function reviewMission(actor: UserRec, id: string, body: Json): MissionView {
  const mission = findMission(actor, id);
  if (!canReviewMission(actor, mission)) {
    if (mission.status !== 'submitted') throw conflict('Cette mission n’attend pas de retour.');
    throw forbidden('Cette mission est confiée à un autre correcteur.');
  }
  if (body.decision !== 'validated' && body.decision !== 'to_redo') throw invalid('Décision attendue : validated ou to_redo.');
  if (typeof body.comment !== 'string' || body.comment.length > missionLimits.commentChars) throw invalid('Commentaire de 2 000 caractères au plus.');
  if (body.decision === 'to_redo' && !body.comment.trim()) throw invalid('Expliquez à l’élève ce qu’il doit reprendre.');
  const { points, score, maxScore } = rubricPoints(mission.definition, body.points);
  Object.assign(mission, { status: 'reviewed', decision: body.decision, comment: body.comment.trim() || null, reviewedBy: actor.id, reviewedAt: now(), updatedAt: now(),
    points, score, maxScore });
  return missionView(mission, actor);
}
/**
 * Points d'un retour, comme Évaluations : avec une grille, un entier de 0 à maxPoints pour chaque critère, aucune clé
 * inconnue ; sans grille, aucun point. La décision reste celle du correcteur.
 */
function rubricPoints(definition: MissionSnapshot, given: unknown) {
  const criteria = missionCriteriaOf(definition);
  if (!criteria.length) {
    if (given !== undefined && given !== null) throw invalid('Cette mission n’est pas notée sur une grille : envoyez la décision sans points.');
    return { points: null, score: null, maxScore: null };
  }
  if (typeof given !== 'object' || given === null || Array.isArray(given)) throw invalid('Notez chaque critère de la grille avant d’envoyer le retour.');
  const values = given as Json;
  const unknown = Object.keys(values).filter((key) => !criteria.some((criterion) => criterion.id === key));
  if (unknown.length) throw invalid(`Critère inconnu dans la notation : ${unknown.join(', ')}.`);
  const points: Record<string, number> = {};
  for (const criterion of criteria) {
    const value = values[criterion.id];
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > criterion.maxPoints) {
      throw invalid(`Notez le critère « ${criterion.label} » de 0 à ${criterion.maxPoints} points.`);
    }
    points[criterion.id] = value;
  }
  return { points, score: Object.values(points).reduce((sum, value) => sum + value, 0), maxScore: missionMaxScore(criteria) };
}

// --- Catalogue : documents de version au format 4 (éditeur) -------------------------------------------------------------

/** Document d'une version publiée, construit à partir des contenus du simulateur (questions typées, missions, lexique). */
function versionDocument(code: LevelCode): Json {
  const level = levelContent(code) as MockLevelContent;
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    id: VERSIONS[code].id, levelId: code.toLowerCase(), levelCode: code, levelTitle: levelTitle(code), number: VERSIONS[code].number,
    status: 'published', publishedAt: VERSIONS[code].publishedAt, updatedAt: VERSIONS[code].publishedAt,
    settings: { expectedCompetences: ['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'],
      successCriteria: `Obtenir au moins ${level.settings.passPercent} % à l’examen blanc ${code}.`, ...level.settings },
    diagnostic: null,
    modules: level.modules.map((module) => ({
      id: module.id, title: module.title, objective: module.objective, prerequisites: module.prerequisites,
      vocabulary: (VOCABULARY[module.id] ?? []).map((entry, index) => ({ ...entry,
        audio: { assetId: `${module.id}-lexique`, assetVersion: 1, start: round(0.3 + index * 2.5), end: round(1.9 + index * 2.5) } })),
      activities: module.activities.map(([id, kind, title, minutes, competences]) => {
        const content = activityContent(level, id) as MockContent;
        return {
          id, kind, title, estimatedMinutes: minutes, competences,
          lesson: content.lesson ? { title: content.lesson.title, description: content.lesson.description, transcript: content.transcript } : null,
          // Le retour d'un choix est absent (et non nul) quand il n'y en a pas, comme dans le catalogue.
          questions: content.questions.map((question) => ({ ...question,
            options: question.options.map(({ feedback, ...option }) => (feedback ? { ...option, feedback } : option)) })),
          placements: [], mission: content.mission ? { oral: content.mission.oral, written: content.mission.written,
            checklist: content.mission.checklist, criteria: missionCriteriaOf(content.mission) } : null,
        };
      }),
    })),
    assessments: [],
  };
}
function catalogueVersion(actor: UserRec, id: string): Json {
  if (!canEditCatalogue(actor)) throw forbidden('Réservé aux éditeurs du catalogue.');
  const draft = (state().catalogueDrafts ?? []).find((item) => item.id === id);
  if (draft) return draft;
  const code = Object.entries(VERSIONS).find(([, version]) => version.id === id)?.[0];
  if (!code) throw notFound('Version introuvable.');
  return versionDocument(code as LevelCode);
}
/** POST /catalogue/levels/{levelId}/versions : brouillon copié de la version publiée, ou vide pour un niveau pas encore publié. */
function createCatalogueDraft(actor: UserRec, levelId: string) {
  const code = levelId.toUpperCase();
  const meta = levelMeta(code);
  if (!meta) throw notFound('Niveau introuvable.');
  if (!canEditCatalogue(actor)) throw forbidden('Réservé aux éditeurs du catalogue.');
  const existing: Json = VERSIONS[code] ? catalogueVersion(actor, VERSIONS[code].id) : {
    levelId: code.toLowerCase(), levelCode: code, levelTitle: meta.title,
    settings: { expectedCompetences: ['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'], successCriteria: '', reviewMinutes: 15,
      midtermMinutes: 60, finalMinutes: 120, passPercent: 60 },
    diagnostic: null, modules: [], assessments: [],
  };
  const drafts = (state().catalogueDrafts ??= []);
  if (drafts.some((item) => item.levelCode === code)) throw conflict('Un brouillon existe déjà pour ce niveau.');
  const draft: Json = { ...structuredClone(existing), id: newId(), number: (VERSIONS[code]?.number ?? 0) + 1, status: 'draft', publishedAt: null, updatedAt: now() };
  drafts.push(draft);
  return { status: 201, body: draft };
}
/** PUT /catalogue/versions/{id} : seul un brouillon se modifie ; le simulateur ne contrôle pas le document. */
function saveCatalogueDraft(actor: UserRec, id: string, body: Json) {
  const draft = catalogueVersion(actor, id);
  if (draft.status !== 'draft') throw conflict('Une version publiée ne se modifie pas : créez un brouillon.');
  Object.assign(draft, { settings: body.settings ?? draft.settings, diagnostic: body.diagnostic ?? null, modules: body.modules ?? draft.modules,
    assessments: body.assessments ?? draft.assessments, updatedAt: now() });
  return { version: draft, checks: { publishable: true, issues: [] } };
}

// --- File de corrections et lexique --------------------------------------------------------------------------------------

function reviewQueue(actor: UserRec): ReviewQueueItem[] {
  if (actor.role === 'learner') throw forbidden();
  if (actor.role === 'staff' && !actor.permissions.includes('correction')) throw forbidden('Réservé aux correcteurs.');
  const missions = state().missions.filter((mission) => canReviewMission(actor, mission)).map((mission): ReviewQueueItem => ({
    kind: 'mission', id: mission.id, learnerId: mission.learnerId, learnerName: learnerById(mission.learnerId).displayName, title: mission.title,
    levelCode: mission.levelCode, context: mission.sessionId ? 'session' : 'library', submittedAt: mission.submittedAt as string,
  }));
  const speech = state().speech.filter((item) => item.reviewStatus === 'pending' && isGrader(actor, learnerById(item.learnerId))).map((item): ReviewQueueItem => {
    const content = contentOfLesson(item.lessonId);
    const spec = content?.questions.find((question) => question.id === item.questionId)?.spec as SpeakSpec | undefined;
    return { kind: 'speech', id: item.id, learnerId: item.learnerId, learnerName: learnerById(item.learnerId).displayName,
      title: `Prononciation : « ${spec?.text ?? item.questionId} »`, levelCode: content?.level.code ?? null,
      context: item.sessionId ? 'session' : 'library', submittedAt: item.submittedAt ?? item.createdAt };
  });
  return [...missions, ...speech].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

/** Ligne du son de lexique : « der Kopf, die Köpfe » pour un nom, le mot seul sinon. */
const spokenLine = (entry: MockVocabulary) => (entry.partOfSpeech === 'noun'
  ? [`${entry.article ?? 'die'} ${entry.word}`, entry.plural ? `die ${entry.plural}` : null].filter(Boolean).join(', ') : entry.word);
function lexiconOf(level: MockLevelContent, module: MockModule): Lexicon {
  const url = silentAudioUrl(60);
  let cursor = 0.3;
  const round = (value: number) => Math.round(value * 100) / 100;
  const entries = (VOCABULARY[module.id] ?? []).map((entry): LexiconEntry => {
    const length = 0.6 + 0.07 * spokenLine(entry).length;
    const audio = { url, start: round(cursor), end: round(cursor + length) };
    cursor += length + 0.9;
    return { ...entry, audio };
  });
  return { trackVersionId: VERSIONS[level.code].id, levelCode: level.code, moduleId: module.id, moduleTitle: module.title, entries };
}
function moduleLexicon(actor: UserRec, versionId: string, moduleId: string): Lexicon {
  if (actor.role === 'staff' && !canEditCatalogue(actor)) throw forbidden();
  const level = versionLevel(versionId);
  const module = level?.modules.find((item) => item.id === moduleId);
  if (!level || !module) throw notFound('Module introuvable.');
  return lexiconOf(level, module);
}
/** Révision du module : exercices dont le dernier résultat contient des questions « à revoir ». */
function reviewItemsOf(learnerId: string, level: MockLevelContent, moduleId: string | null): ReviewItem[] {
  const module = level.modules.find((item) => item.id === moduleId);
  return (module?.activities ?? []).filter(([, kind]) => kind === 'exercise').flatMap(([id, , title]) => {
    const last = lastGrade(learnerId, id);
    return last?.flagged?.length ? [{ activityId: id, title, trackVersionId: VERSIONS[level.code].id, flagged: last.flagged,
      lastResult: { correct: last.correct, total: last.total } }] : [];
  });
}

function libraryView(actor: UserRec, query: URLSearchParams): Library {
  const learner = targetLearner(actor, query);
  const path = latestPath(learner.id);
  const step = path ? activeStep(path) : undefined;
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
            const last = lastGrade(learner.id, id);
            return { id, kind, title, estimatedMinutes: minutes, competences, lessonId: lessonIdOf(id),
              lastResult: last ? { correct: last.correct, total: last.total, submittedAt: last.submittedAt } : null, toReview: Boolean(last?.flagged?.length) };
          }),
          vocabularyCount: VOCABULARY[module.id]?.length ?? 0,
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
    // Comme l'API : la transcription d'un exercice attend la réponse (elle contient souvent la solution).
    lesson: content.lesson ? { id: lessonIdOf(content.id), ...content.lesson } : null, transcript: content.kind === 'exercise' ? null : content.transcript,
    questions: content.questions.map((question) => questionView(lessonIdOf(content.id), question)),
    placements: questionPlacements(content.id, content.questions, false), trackVersionId: versionId, levelCode: level.code,
    moduleId: content.module.id, moduleTitle: content.module.title, mission: content.mission,
  };
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
  const module = level.modules.find((item) => item.id === session.moduleId);
  const lexicon = module && VOCABULARY[module.id]?.length ? lexiconOf(level, module) : null;
  return {
    session: sessionSummary(path, session, position), enrollmentId: session.enrollmentId, trackVersionId: VERSIONS[session.levelCode].id, levelCode: session.levelCode,
    lexicon,
    activities: session.items.map((item, index) => {
      const sourceLevel = item.sourceActivityId ? CONTENT.find((candidate) => findActivity(candidate, item.sourceActivityId as string)) ?? level : level;
      const content = activityContent(sourceLevel, item.sourceActivityId ?? item.id);
      const progress = path.progress[progressKey(session.levelCode, item.id)];
      const status = activityStatus(path, session.levelCode, item.id);
      return {
        id: item.id, position: index + 1, kind: item.kind, title: item.title, estimatedMinutes: item.minutes, competences: content?.competences ?? [],
        status, state: progress?.state ?? {}, completedAt: progress?.completedAt ?? null, attemptId: progress?.attemptId ?? null,
        lesson: content?.lesson ? { id: lessonIdOf(content.id), ...content.lesson }
          : item.kind === 'review' ? { id: `lecon-${item.id}`, title: item.title, description: 'Reprenez le vocabulaire et les phrases clés du module, puis refaites les exercices où vous avez hésité.' } : null,
        transcript: content?.kind === 'exercise' && status !== 'completed' ? null : content?.transcript ?? null,
        questions: content ? content.questions.map((question) => questionView(lessonIdOf(content.id), question)) : [],
        placements: content ? questionPlacements(content.id, content.questions, status === 'completed') : [],
        mission: content?.mission ?? null,
        contentVersionId: content ? item.sourceVersionId ?? VERSIONS[content.level.code].id : null,
        contentActivityId: content?.id ?? null,
        reviewItems: item.kind === 'review' ? reviewItemsOf(path.learnerId, level, item.moduleId) : null,
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
  if (item.kind === 'mission' && body.completed) {
    // Comme Apprentissage : la mission doit être envoyée, depuis cette séance et cette activité.
    const mission = state().missions.find((candidate) => candidate.id === body.attemptId && candidate.learnerId === actor.id);
    if (!mission || !['submitted', 'sent', 'reviewed'].includes(mission.status) || mission.sessionId !== session.id || mission.sessionActivityId !== item.id) {
      throw conflict('Envoyez la mission avant de terminer l’activité.');
    }
  }
  const key = progressKey(session.levelCode, activityId);
  const previous = path.progress[key];
  path.progress[key] = {
    status: body.completed || previous?.status === 'completed' ? 'completed' : 'started',
    completedAt: previous?.completedAt ?? (body.completed ? now() : null),
    state: typeof body.state === 'object' && body.state !== null ? body.state as Json : previous?.state ?? {},
    attemptId: typeof body.attemptId === 'string' ? body.attemptId : previous?.attemptId ?? null,
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
type ExamQuestion = PracticePart['questions'][number];
interface ExamContent {
  readingTitle: string; reading: string; readingQuestions: ExamQuestion[]; listening: string; listeningQuestions: ExamQuestion[];
  writing: string; writingCriteria: MissionCriterion[]; speaking: string; speakingCriteria: MissionCriterion[];
}
/**
 * Parties d'évaluation du simulateur, par niveau de contenu : celles du niveau le plus proche en dessous (A1, A2 ou B1).
 * B1 : consignes en allemand avec la traduction française (` [fr] `) et grilles d'écrit et d'oral du niveau (20 points).
 * La première option est toujours la bonne réponse (CLOSED_ANSWERS).
 */
function examContent(levelCode: LevelCode): ExamContent {
  const shared = {
    listeningQuestions: [
      { id: 'q4', prompt: 'Où se passe la conversation ?', options: option(['Dans un magasin', 'À l’école', 'Chez le médecin']) },
      { id: 'q5', prompt: 'Que décide la personne ?', options: option(['Elle revient demain', 'Elle achète tout de suite', 'Elle appelle un ami']) },
    ],
    listening: 'Écoutez le dialogue deux fois, puis répondez. (Le simulateur fournit un son muet.)',
    writingCriteria: [{ id: 'consigne', label: 'Respect de la consigne', maxPoints: 4 }, { id: 'vocabulaire', label: 'Vocabulaire', maxPoints: 3 },
      { id: 'grammaire', label: 'Grammaire et orthographe', maxPoints: 3 }],
    speaking: 'Entraînez-vous à voix haute : présentez-vous et racontez votre journée pendant une minute.',
    speakingCriteria: [{ id: 'aisance', label: 'Aisance et clarté', maxPoints: 5 }, { id: 'prononciation', label: 'Prononciation', maxPoints: 5 }],
  };
  if (bilingualLevel(levelCode)) {
    return {
      readingTitle: 'Lesen : eine Nachricht im Büro',
      reading: 'Lesen Sie die Nachricht. Beantworten Sie dann die Fragen. [fr] Lisez le message, puis répondez aux questions.\n\n'
        + 'Liebe Kolleginnen und Kollegen,\nab Montag gilt in unserem Büro eine neue Regel: Wer zu Hause arbeiten möchte, trägt das bis Freitagmittag '
        + 'in den gemeinsamen Kalender ein. So wissen alle, wer im Haus ist, und wir können Besprechungen besser planen. Wichtig: Die Teamsitzung '
        + 'am Mittwoch um 9 Uhr findet weiterhin im Büro statt.\nViele Grüße\nAnna Brandt',
      readingQuestions: [
        { id: 'q1', prompt: 'Was ist neu? [fr] Qu’est-ce qui change ?',
          options: option(['Man trägt die Tage im Homeoffice in einen Kalender ein.', 'Niemand darf mehr zu Hause arbeiten.', 'Die Teamsitzung findet jetzt online statt.']) },
        { id: 'q2', prompt: 'Bis wann muss man sich eintragen? [fr] Jusqu’à quand faut-il s’inscrire ?',
          options: option(['bis Freitagmittag', 'bis Montagmorgen', 'bis Mittwoch um 9 Uhr']) },
        { id: 'q3', prompt: 'Wo findet die Teamsitzung statt? [fr] Où a lieu la réunion d’équipe ?', options: option(['im Büro', 'zu Hause', 'online']) },
      ],
      listening: 'Hören Sie das Gespräch zweimal. Beantworten Sie dann die Fragen. [fr] Écoutez la conversation deux fois, puis répondez. '
        + '(Le simulateur fournit un son muet.)',
      listeningQuestions: [
        { id: 'q4', prompt: 'Warum ruft die Frau an? [fr] Pourquoi la femme appelle-t-elle ?',
          options: option(['Sie möchte einen Termin verschieben.', 'Sie möchte eine Rechnung bezahlen.', 'Sie sucht eine Wohnung.']) },
        { id: 'q5', prompt: 'Was schlägt der Mann vor? [fr] Que propose l’homme ?',
          options: option(['einen Termin am Donnerstagnachmittag', 'einen Termin am Montagmorgen', 'einen Rückruf am Abend']) },
      ],
      writing: 'Schreiben Sie Anna Brandt eine kurze Antwort: Sie können am Mittwoch nicht ins Büro kommen. Nennen Sie den Grund und machen Sie '
        + 'einen Vorschlag (80 bis 100 Wörter). [fr] Répondez brièvement à Anna Brandt : vous ne pouvez pas venir au bureau mercredi. Donnez la '
        + 'raison et faites une proposition (80 à 100 mots).',
      writingCriteria: B1_GRIDS.schreiben,
      speaking: 'Sprechen Sie etwa zwei Minuten: Wo arbeiten Sie am liebsten, im Büro oder zu Hause? Begründen Sie Ihre Meinung. '
        + '[fr] Parlez environ deux minutes : où préférez-vous travailler, au bureau ou chez vous ? Justifiez votre avis.',
      speakingCriteria: B1_GRIDS.sprechen,
    };
  }
  if (levelCode === 'A1') {
    return {
      ...shared, readingTitle: 'Lire un message',
      reading: 'Lisez le message de Lena, puis répondez aux questions.\n\nHallo Paula,\nich bin heute im Café am Markt. Ich möchte einen Kaffee und eine Brezel.\nKommst du auch? Wir sind um drei Uhr da.\nLiebe Grüße, Lena',
      readingQuestions: [
        { id: 'q1', prompt: 'Où est Lena aujourd’hui ?', options: option(['Au café', 'À la gare', 'Au supermarché']) },
        { id: 'q2', prompt: 'Que veut-elle commander ?', options: option(['Un café et un bretzel', 'Un thé et un gâteau', 'Une soupe']) },
        { id: 'q3', prompt: 'À quelle heure Paula peut-elle venir ?', options: option(['À trois heures', 'À deux heures', 'À quatre heures']) },
      ],
      writing: 'Présentez-vous en 30 à 50 mots : prénom, âge, ville, ce que vous aimez manger.',
    };
  }
  return {
    ...shared, readingTitle: 'Lire une annonce de logement',
    reading: 'Lisez l’annonce, puis répondez aux questions.\n\nSchöne 2-Zimmer-Wohnung in Leipzig-Gohlis, 58 m², Balkon, 4. Stock ohne Aufzug.\nMiete: 620 € warm. Frei ab 1. März. Haustiere nach Absprache.\nBesichtigung: Samstag, 10 bis 12 Uhr.',
    readingQuestions: [
      { id: 'q1', prompt: 'Combien de pièces a l’appartement ?', options: option(['Deux', 'Trois', 'Quatre']) },
      { id: 'q2', prompt: 'Que comprend le loyer ?', options: option(['Les charges', 'Le garage', 'L’électricité seulement']) },
      { id: 'q3', prompt: 'Quand peut-on visiter ?', options: option(['Le samedi matin', 'Le vendredi soir', 'Tous les jours']) },
    ],
    writing: 'Vous répondez à l’annonce : présentez-vous et proposez une date de visite (50 à 70 mots).',
  };
}
function examParts(levelCode: LevelCode, kind: ExamKind, practice: boolean): PracticePart[] {
  const content = examContent(levelCode);
  const b = bilingualLevel(levelCode);
  const parts: PracticePart[] = [
    { id: 'lecture', competence: 'lecture', mode: 'closed', title: content.readingTitle, criteria: [], selfPractice: false, placements: [],
      instructions: content.reading, questions: content.readingQuestions },
    { id: 'ecoute', competence: 'ecoute', mode: 'closed', title: b ? 'Hören : ein Telefongespräch' : 'Écouter un dialogue', criteria: [], selfPractice: false,
      instructions: content.listening,
      placements: [{ position: 1, assetId: `${levelCode.toLowerCase()}-${kind}-ecoute`, assetVersion: 1, usage: 'audio', alt: null, caption: 'Im Alltag' }],
      questions: content.listeningQuestions },
    { id: 'ecrit', competence: 'expression-ecrite', mode: 'written', title: b ? 'Schreiben : eine kurze Antwort' : 'Écrire un court message', questions: [], placements: [],
      selfPractice: practice, instructions: content.writing, criteria: content.writingCriteria },
  ];
  if (practice) {
    parts.push({ id: 'oral', competence: 'expression-orale', mode: 'oral', title: b ? 'Sprechen : seine Meinung sagen' : 'Parler une minute', questions: [], placements: [],
      selfPractice: true, instructions: content.speaking, criteria: content.speakingCriteria });
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
  // En pause : seules les séances échues avant la pause sont en retard, la prochaine échéance est la reprise.
  const paused = step?.goalStatus === 'paused' ? path?.pausedAt ?? now() : null;
  return {
    enrollmentId: step?.enrollmentId ?? null, levelCode: step?.levelCode ?? null, goalStatus: step?.goalStatus ?? null,
    resumeDate: path?.resumeDate ?? null,
    nextDueAt: paused ? (path?.resumeDate ? `${path.resumeDate}T00:00:00+01:00` : null)
      : sessions.find((session) => session.status !== 'completed')?.dueAt ?? null,
    lateSessions: sessions.filter((session) => session.status === 'late' && (!paused || new Date(session.dueAt) < new Date(paused))).length,
    pendingGrading: state().exams.filter((exam) => exam.learnerId === user.id && exam.status === 'submitted').length, alert: null,
    practiceMinutes: done.reduce((sum, session) => sum + session.estimatedMinutes, 0), sessionsCompleted: done.length, sessionsOnTime: done.length,
    lastActivityAt: done.at(-1)?.completedAt ?? null, alerts: [],
  };
}
/**
 * Accueil et parcours lus « en direct » (champ `learning` de /tracking/overview et /tracking/learners/{id}, EVO-039) :
 * le parcours est visible dès sa création, brouillon compris, sans attendre la synchronisation du Suivi.
 */
function learningState(user: UserRec): LearnerLearningState {
  const welcome = onboarding(user);
  const attempt = welcome.placement ? learnerPlacements(user.id).find((item) => item.id === welcome.placement?.attemptId) : undefined;
  const latest = latestPath(user.id);
  const path = latest && latest.status !== 'withdrawn' ? latest : null;
  const shown = path && (activeStep(path) ?? [...path.steps].filter((step) => step.status === 'completed').sort((a, b) => b.position - a.position)[0]);
  return {
    learnerId: user.id, languageId: user.languageId ?? path?.languageId ?? null,
    onboarding: { steps: welcome.steps, completed: welcome.completed, blockedReason: welcome.blockedReason,
      placement: welcome.placement ? { ...welcome.placement, declaredBeginner: Boolean(attempt?.declaredBeginner) } : null },
    path: path ? { id: path.id, status: path.status as 'draft' | 'active' | 'completed', startLevel: path.startLevel, targetLevel: path.targetLevel,
      targetDate: path.targetDate, activeLevel: shown?.levelCode ?? null, enrollmentId: shown?.enrollmentId ?? null, goalStatus: shown?.goalStatus ?? null,
      validatedRevision: path.validatedRevision, createdAt: path.createdAt } : null,
  };
}
/** Débutant (départ A0) : parcours déjà adapté, sans diagnostic (EVO-038). Le simulateur ne propose aucun diagnostic. */
function diagnosticRefused(path: PathRec): never {
  if (path.startLevel === 'A0') throw conflict('Pas de diagnostic pour un débutant : le parcours commence par les toutes premières bases.');
  throw notFound('Le simulateur ne propose pas de diagnostic initial.');
}
function overview(actor: UserRec) {
  if (actor.role === 'learner') throw forbidden();
  const learners = visibleLearners(actor).map((user) => {
    const tracking = trackingOf(user);
    const results = state().grades.filter((grade) => grade.learnerId === user.id).map(gradeView);
    return { learnerId: user.id, profile: learnerRow(user), progress: { completedCount: tracking.sessionsCompleted, goal: tracking.levelCode ? { level: tracking.levelCode } : null },
      results, tracking, learning: learningState(user) };
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
    tracking, learning: learningState(learner), freshness: { syncedAt: now() },
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
// Ciné-club (EVO-055) : films du catalogue, leçons des séquences, carnet de mots et recommandations des professeurs
// (formes du contrat 1.13.0, précisions « cine-contrat » du lot Services)
// ---------------------------------------------------------------------------------------------------------------------

const filmRecs = () => state().films;
const byPosition = <T extends { position: number }>(items: T[]) => [...items].sort((a, b) => a.position - b.position);
const filmLevel = (record: FilmRec) => record.document.film.levelId.toUpperCase() as LevelCode;
function sequenceOf(sequenceId: string): { film: FilmRec; sequence: FilmSequenceFields } | undefined {
  for (const film of filmRecs()) {
    const sequence = film.document.sequences.find((item) => item.id === sequenceId);
    if (sequence) return { film, sequence };
  }
  return undefined;
}
const cineSequenceOfLesson = (lessonId: string) => (lessonId.startsWith('cine-') ? sequenceOf(lessonId.slice(5)) : undefined);

function sequenceView(filmId: string, sequence: FilmSequenceFields, withQuestions: boolean): FilmSequence {
  const lessonId = cineLessonId(sequence.id);
  return { id: sequence.id, filmId, position: sequence.position, title: sequence.title, start: sequence.start, end: sequence.end,
    approx: sequence.approx, context: sequence.context, keywords: sequence.keywords.map((keyword) => ({ ...keyword })), lessonId,
    questionCount: sequence.questions.length, questions: withQuestions ? sequence.questions.map((question) => questionView(lessonId, question)) : null };
}
/** Film servi aux élèves (jamais de corrigé) : questions vues élève seulement pour GET /films/{filmId}. */
function filmView(record: FilmRec, withQuestions: boolean): Film {
  const { film, sequences } = record.document;
  return { ...film, levelCode: filmLevel(record), sequences: byPosition(sequences).map((sequence) => sequenceView(film.id, sequence, withQuestions)) };
}
/** Films publiés dont le niveau est publié, par position du niveau puis du film. */
const publishedFilms = (languageId: string | null, level: string | null) => filmRecs()
  .filter((record) => record.status === 'published' && VERSIONS[filmLevel(record)] && (!languageId || record.document.film.languageId === languageId)
    && (!level || filmLevel(record) === level))
  .sort((a, b) => (levelMeta(filmLevel(a))?.position ?? 99) - (levelMeta(filmLevel(b))?.position ?? 99) || a.document.film.position - b.document.film.position);

/** GET /films/{filmId} : un film publié ; un brouillon pour un éditeur du catalogue (aperçu élève). */
function readFilm(actor: UserRec, id: string): Film {
  const record = filmRecs().find((item) => item.document.film.id === id);
  if (!record || (record.status !== 'published' && !canEditCatalogue(actor))) throw notFound('Film introuvable.');
  return filmView(record, true);
}
/** GET /lessons/{lessonId} : questions d'une séquence sans corrigé (leçon sans version du niveau du film). */
function cineLesson(actor: UserRec, lessonId: string) {
  const found = cineSequenceOfLesson(lessonId);
  if (!found || (found.film.status !== 'published' && !canEditCatalogue(actor))) throw notFound('Leçon introuvable.');
  return { id: lessonId, title: found.sequence.title, level: filmLevel(found.film), description: found.sequence.context, transcript: null, mediaIds: [],
    questions: found.sequence.questions.map((question) => questionView(lessonId, question)) };
}

// --- Carnet de mots ------------------------------------------------------------------------------------------------------

/** Lecture du carnet, des recommandations et de la vue Ciné-club : l'élève, son référent, son correcteur, l'administration. */
function wordReader(actor: UserRec, query: URLSearchParams) {
  const learnerId = query.get('learnerId');
  if (!learnerId && actor.role !== 'learner') throw invalid('Précisez l’élève consulté (learnerId).');
  const learner = learnerId ? learnerById(learnerId) : actor;
  if (!(actor.id === learner.id || isReferent(actor, learner) || isGrader(actor, learner))) throw forbidden('Cet élève n’est pas suivi par votre compte.');
  return learner;
}
const wordView = (word: WordRec): LearnerWord => ({ ...word });
const wordsOf = (learnerId: string) => state().words.filter((word) => word.learnerId === learnerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
const sameWord = (a: string, b: string) => a.trim().toLocaleLowerCase('de-DE') === b.trim().toLocaleLowerCase('de-DE');

function checkWordFields(body: Json, partial: boolean) {
  const word = body.word === undefined && partial ? undefined : typeof body.word === 'string' ? body.word.trim() : null;
  const note = body.note === undefined && partial ? undefined : body.note === null ? '' : typeof body.note === 'string' ? body.note.trim() : null;
  if (word === null || (word !== undefined && (word.length < 1 || word.length > cineLimits.wordChars))) throw invalid(`Le mot compte de 1 à ${cineLimits.wordChars} caractères.`);
  if (note === null || (note !== undefined && note.length > cineLimits.noteChars)) throw invalid(`La note compte ${cineLimits.noteChars} caractères au plus.`);
  return { word, note };
}
/** POST /learning/words (l'élève seulement) : unique par (mot sans casse, source), 3 000 mots au plus. */
function addWord(actor: UserRec, body: Json) {
  requireLearner(actor);
  const { word, note } = checkWordFields(body, false);
  const sourceKind = body.sourceKind;
  if (sourceKind !== 'film' && sourceKind !== 'activity' && sourceKind !== 'manual') throw invalid('Source du mot invalide (film, activity ou manual).');
  const sourceId = body.sourceId ?? null;
  if (sourceKind === 'manual' && sourceId !== null) throw invalid('Un mot saisi librement n’a pas de source.');
  if (sourceKind === 'activity' && (typeof sourceId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9:/._-]{0,119}$/.test(sourceId))) throw invalid('Activité d’origine invalide.');
  if (sourceKind === 'film' && (typeof sourceId !== 'string' || !sequenceOf(sourceId))) throw notFound('Séquence introuvable.');
  const mine = wordsOf(actor.id);
  if (mine.some((item) => sameWord(item.word, word as string) && item.sourceId === sourceId)) throw conflict('Ce mot est déjà dans votre carnet pour cette source.');
  if (mine.length >= cineLimits.wordsPerLearner) throw conflict(`Votre carnet compte déjà ${cineLimits.wordsPerLearner} mots : supprimez-en avant d’en ajouter.`);
  const created = now();
  const record: WordRec = { id: newId(), learnerId: actor.id, languageId: actor.languageId ?? 'de', word: word as string, note: note ?? '',
    sourceKind, sourceId: sourceId as string | null, createdAt: created, updatedAt: created };
  state().words.push(record);
  return { status: 201, body: wordView(record) };
}
function ownWord(actor: UserRec, id: string) {
  requireLearner(actor);
  const word = state().words.find((item) => item.id === id && item.learnerId === actor.id);
  if (!word) throw notFound('Mot introuvable dans votre carnet.');
  return word;
}
/** PATCH /learning/words/{wordId} : mot et note (au moins un). */
function updateWord(actor: UserRec, id: string, body: Json): LearnerWord {
  const record = ownWord(actor, id);
  const { word, note } = checkWordFields(body, true);
  if (word === undefined && note === undefined) throw invalid('Rien à modifier : précisez le mot ou la note.');
  if (word !== undefined && wordsOf(actor.id).some((item) => item.id !== id && sameWord(item.word, word) && item.sourceId === record.sourceId)) {
    throw conflict('Ce mot est déjà dans votre carnet pour cette source.');
  }
  Object.assign(record, { ...(word !== undefined ? { word } : {}), ...(note !== undefined ? { note } : {}), updatedAt: now() });
  return wordView(record);
}
/** DELETE /learning/words/{wordId} : `{ id, deleted: true }`. */
function deleteWord(actor: UserRec, id: string) {
  const record = ownWord(actor, id);
  state().words = state().words.filter((item) => item !== record);
  return { id, deleted: true };
}

// --- Recommandations -----------------------------------------------------------------------------------------------------

const recommendationView = (record: RecommendationRec): FilmRecommendation => ({ ...record });
const recommendationsOf = (learnerId: string) => state().filmRecommendations.filter((item) => item.learnerId === learnerId)
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

/** POST /learning/film-recommendations : référent, correcteur désigné (Correction), administration ; 403 pour un tiers. */
function recommendSequence(actor: UserRec, body: Json) {
  const learner = learnerById(typeof body.learnerId === 'string' ? body.learnerId : '');
  const role: FilmRecommendation['recommendedByRole'] | null = actor.role === 'admin' ? 'admin' : isReferent(actor, learner) ? 'teacher'
    : learner.reviewerId === actor.id && actor.permissions.includes('correction') ? 'reviewer' : null;
  if (!role) throw forbidden('Seul le professeur référent, le correcteur désigné ou l’administration peut proposer une séquence à cet élève.');
  const found = typeof body.sequenceId === 'string' ? sequenceOf(body.sequenceId) : undefined;
  if (!found || found.film.status !== 'published' || found.film.document.film.languageId !== (learner.languageId ?? 'de')) throw notFound('Séquence introuvable.');
  const note = body.note === null || body.note === undefined ? '' : typeof body.note === 'string' ? body.note.trim() : null;
  if (note === null || note.length > cineLimits.recommendationNoteChars) throw invalid(`La note compte ${cineLimits.recommendationNoteChars} caractères au plus.`);
  if (recommendationsOf(learner.id).some((item) => item.sequenceId === found.sequence.id && !item.dismissedAt)) {
    throw conflict('Cette séquence est déjà proposée à cet élève.');
  }
  const record: RecommendationRec = { id: newId(), learnerId: learner.id, filmId: found.film.document.film.id, sequenceId: found.sequence.id,
    recommendedBy: actor.id, recommendedByRole: role, note, createdAt: now(), dismissedAt: null };
  state().filmRecommendations.push(record);
  return { status: 201, body: recommendationView(record) };
}
/** POST /learning/film-recommendations/{id}/dismiss : l'élève écarte la proposition. */
function dismissRecommendation(actor: UserRec, id: string): FilmRecommendation {
  requireLearner(actor);
  const record = state().filmRecommendations.find((item) => item.id === id && item.learnerId === actor.id);
  if (!record) throw notFound('Recommandation introuvable.');
  record.dismissedAt ??= now();
  return recommendationView(record);
}

/** GET /learning/cine?level=&learnerId= : films publiés de la langue de l'élève, dernier résultat et mots par séquence. */
function cineView(actor: UserRec, query: URLSearchParams): CineOverview {
  const learner = wordReader(actor, query);
  const level = query.get('level');
  const words = wordsOf(learner.id);
  const active = recommendationsOf(learner.id).filter((item) => !item.dismissedAt);
  // Un correcteur désigné ne lit pas les résultats de l'élève (Évaluations) : lastResult vaut null pour lui.
  const scores = actor.id === learner.id || isReferent(actor, learner);
  const grades = scores ? state().grades.filter((grade) => grade.learnerId === learner.id && grade.lessonId.startsWith('cine-'))
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)) : [];
  const films: CineFilm[] = publishedFilms(learner.languageId ?? 'de', level).map((record) => {
    const { sequences, ...film } = filmView(record, false);
    return { ...film, sequences: sequences.map(({ questions: _questions, ...sequence }) => {
      const last = grades.find((grade) => grade.lessonId === sequence.lessonId);
      const recommendation = active.find((item) => item.sequenceId === sequence.id);
      return { ...sequence, words: words.filter((word) => word.sourceKind === 'film' && word.sourceId === sequence.id).map(wordView),
        lastResult: last ? { attemptId: publicGradeId(last), correct: last.correct, total: last.total, submittedAt: last.submittedAt } : null,
        recommendation: recommendation ? recommendationView(recommendation) : null };
    }) };
  });
  return { learnerId: learner.id, languageId: learner.languageId, level, films, wordCount: words.length,
    recommendations: active.filter((item) => films.some((film) => film.id === item.filmId)).map(recommendationView) };
}

// --- Éditeur du catalogue ------------------------------------------------------------------------------------------------

const requireCatalogue = (actor: UserRec) => { if (!canEditCatalogue(actor)) throw forbidden('Réservé aux éditeurs du catalogue.'); };
function filmRecord(id: string) {
  const record = filmRecs().find((item) => item.document.film.id === id);
  if (!record) throw notFound('Film introuvable.');
  return record;
}
const filmSummary = (record: FilmRec): FilmSummary => {
  const { film, sequences } = record.document;
  return { id: film.id, languageId: film.languageId, levelId: film.levelId, levelCode: filmLevel(record), title: film.title, videoId: film.videoId,
    durationSeconds: film.durationSeconds, position: film.position, status: record.status, sequenceCount: sequences.length,
    publishedAt: record.publishedAt, updatedAt: record.updatedAt };
};
const filmChecks = (document: FilmDocument) => {
  const issues = filmCompletenessIssues(document);
  return { publishable: issues.length === 0, issues };
};
const filmEditorDocument = (record: FilmRec): FilmEditorDocument => {
  const document = structuredClone(record.document);
  return {
    film: { ...document.film, levelCode: filmLevel(record), status: record.status, publishedAt: record.publishedAt, updatedAt: record.updatedAt },
    sequences: byPosition(document.sequences).map((sequence) => ({ ...sequence, lessonId: cineLessonId(sequence.id) })),
    checks: filmChecks(document),
  };
};

const FILM_FIELDS = ['id', 'languageId', 'levelId', 'title', 'description', 'provider', 'videoId', 'channel', 'videoUrl', 'courseUrl', 'credit',
  'licenseNote', 'durationSeconds', 'position'];
const FILM_READ_ONLY = ['levelCode', 'status', 'publishedAt', 'updatedAt'];
const SEQUENCE_FIELDS = ['id', 'position', 'title', 'start', 'end', 'approx', 'context', 'keywords', 'questions'];

/**
 * PUT /catalogue/films/{filmId} : document au format 1. Structure contrôlée (400 avec le premier point, champ inconnu
 * compris), séquence d'un autre film refusée (409), complétude exigée pour un film déjà publié (409) ; statut conservé.
 */
function saveFilm(actor: UserRec, id: string, body: Json): FilmEditorDocument {
  requireCatalogue(actor);
  const { film, sequences, format } = body as { film?: Json; sequences?: unknown; format?: unknown };
  if (!isObject(film) || !Array.isArray(sequences)) throw invalid('Document de film attendu : { film, sequences }.');
  if (format !== undefined && format !== 1) throw invalid('Format de document inconnu (1 attendu).');
  const unknownTop = Object.keys(body).filter((key) => !['format', 'film', 'sequences', 'checks'].includes(key));
  const unknownFilm = Object.keys(film).filter((key) => !FILM_FIELDS.includes(key) && !FILM_READ_ONLY.includes(key));
  const unknownSequence = sequences.flatMap((sequence) => (isObject(sequence) ? Object.keys(sequence) : ['?']))
    .filter((key) => !SEQUENCE_FIELDS.includes(key) && key !== 'lessonId');
  const unknown = [...unknownTop, ...unknownFilm, ...unknownSequence];
  if (unknown.length) throw invalid(`Champ inconnu dans le document du film : ${unknown[0]}.`);
  if (film.id !== id) throw invalid('L’identifiant du film ne correspond pas à l’adresse.');
  const document: FilmDocument = {
    format: 1,
    film: Object.fromEntries(FILM_FIELDS.map((key) => [key, film[key]])) as unknown as FilmFields,
    sequences: (sequences as Json[]).map((sequence) => ({ ...Object.fromEntries(SEQUENCE_FIELDS.map((key) => [key, sequence[key]])), approx: sequence.approx === true }) as unknown as FilmSequenceFields),
  };
  if (!levelMeta(String(document.film.levelId).toUpperCase())) throw invalid(`Film ${id} : niveau inconnu au catalogue.`);
  const issues = filmStructureIssues(document);
  if (issues.length) throw invalid(`Film ${id}, ${issues[0].path} : ${issues[0].message}`);
  const taken = filmRecs().find((item) => item.document.film.id !== id && item.document.sequences.some((sequence) => document.sequences.some((other) => other.id === sequence.id)));
  if (taken) throw conflict(`Une séquence appartient déjà au film « ${taken.document.film.title} ».`);
  const existing = filmRecs().find((item) => item.document.film.id === id);
  if (existing?.status === 'published') {
    const missing = filmCompletenessIssues(document);
    if (missing.length) throw conflict(`Film publié : ${missing[0].message} (${missing[0].path}).`);
  }
  if (existing) Object.assign(existing, { document, updatedAt: now() });
  else filmRecs().push({ document, status: 'draft', updatedAt: now(), publishedAt: null });
  return filmEditorDocument(filmRecord(id));
}
/** POST …/publish (409 si incomplet ; déjà publié : renvoyé tel quel) et …/retire (409 s'il n'est pas publié). */
function setFilmStatus(actor: UserRec, id: string, status: FilmStatus): FilmSummary {
  requireCatalogue(actor);
  const record = filmRecord(id);
  if (status === 'published') {
    if (record.status === 'published') return filmSummary(record);
    const missing = filmCompletenessIssues(record.document);
    if (missing.length) throw conflict(`Publication impossible : ${missing[0].message}`);
    record.publishedAt = now();
  } else if (record.status !== 'published') {
    throw conflict('Ce film n’est pas publié.');
  }
  record.status = status;
  record.updatedAt = now();
  return filmSummary(record);
}

/** Réponses d'une séquence (données initiales : un résultat déjà remis par Léa), fausses pour les questions `wrong`. */
function cineAnswers(lessonId: string, questions: DraftQuestionV4[], wrong: string[]) {
  return Object.fromEntries(questions.map((question) => {
    const miss = wrong.includes(question.id);
    switch (question.type ?? 'choice') {
      case 'fill': return [question.id, { blanks: Object.fromEntries((question.spec as FillSpec).blanks.map((blank) => [blank.id, miss ? 'x' : blank.accept[0]])) }];
      case 'order': {
        const tokens = orderTokens(lessonId, question);
        const used = new Set<string>();
        const order = (question.spec as OrderSpec).answers[0].map((text) => {
          const token = tokens.find((item) => item.text === text && !used.has(item.id)) as QuestionItem;
          used.add(token.id);
          return token.id;
        });
        return [question.id, { order: miss ? [...order].reverse() : order }];
      }
      case 'match': {
        const { solution, right } = matchItems(lessonId, question);
        return [question.id, { pairs: miss ? Object.fromEntries(Object.keys(solution).map((key, index) => [key, right[(index + 1) % right.length].id])) : solution }];
      }
      default: return [question.id, { choice: (question.options.find((option) => option.correct === !miss) ?? question.options[0]).id }];
    }
  }));
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
  // Seule route lue sans session (vitrine, connexion) : niveaux publiés seulement.
  ['GET', /^\/public\/languages$/, () => publicLanguagesView()],

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
  ['GET', new RegExp(`^/learning/library/${UUID}/modules/${SLUG}/lexicon$`), ({ actor, params }) => moduleLexicon(actor, params[0], params[1])],

  // V4 : exercices typés et corrigé, répétition orale, missions, file de corrections
  ['POST', /^\/assessments\/exercises$/, ({ actor, body, key }) => gradeExercise(actor, body, key)],
  ['GET', new RegExp(`^/assessments/exercises/${ANY}$`), ({ actor, params }) => exerciseResult(actor, params[0])],
  ['POST', /^\/assessments\/speech$/, ({ actor, body }) => speechAttempt(actor, body)],
  ['POST', /^\/assessments\/speech\/recordings$/, ({ actor, body }) => reserveSpeechRecording(actor, body)],
  ['GET', new RegExp(`^/assessments/speech/${UUID}$`), ({ actor, params }) => speechView(findSpeech(actor, params[0]))],
  ['POST', new RegExp(`^/assessments/speech/${UUID}/recordings/${UUID}/finalize$`), ({ actor, params }) => finalizeSpeechRecording(actor, params[0], params[1])],
  ['POST', new RegExp(`^/assessments/speech/${UUID}/review$`), ({ actor, params, body }) => reviewSpeech(actor, params[0], body)],
  ['GET', /^\/assessments\/missions$/, ({ actor, query }) => state().missions.filter((mission) => mission.learnerId === targetLearner(actor, query).id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(missionSummary)],
  ['POST', /^\/assessments\/missions$/, ({ actor, body }) => openMission(actor, body)],
  ['GET', new RegExp(`^/assessments/missions/${UUID}$`), ({ actor, params }) => missionView(findMission(actor, params[0]), actor)],
  ['PUT', new RegExp(`^/assessments/missions/${UUID}$`), ({ actor, params, body }) => saveMission(actor, params[0], body)],
  ['POST', new RegExp(`^/assessments/missions/${UUID}/recordings$`), ({ actor, params, body }) => reserveMissionRecording(actor, params[0], body)],
  ['POST', new RegExp(`^/assessments/missions/${UUID}/recordings/${UUID}/finalize$`), ({ actor, params }) => finalizeMissionRecording(actor, params[0], params[1])],
  ['POST', new RegExp(`^/assessments/missions/${UUID}/submit$`), ({ actor, params, key }) => submitMission(actor, params[0], key)],
  ['POST', new RegExp(`^/assessments/missions/${UUID}/review$`), ({ actor, params, body }) => reviewMission(actor, params[0], body)],
  ['GET', /^\/assessments\/reviews$/, ({ actor }) => reviewQueue(actor)],
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
  ['GET', new RegExp(`^/learning/enrollments/${ANY}/diagnostic$`), ({ actor, params }) => diagnosticRefused(pathOfEnrollment(actor, params[0]))],
  ['POST', new RegExp(`^/learning/enrollments/${ANY}/diagnostic$`), ({ actor, params }) => diagnosticRefused(pathOfEnrollment(actor, params[0]))],
  ['GET', /^\/learning\/templates$/, () => templatesView()],

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
      prerequisiteLevelCode: prerequisiteOf(code), successCriteria: `Obtenir au moins ${level.settings.passPercent} % à l’examen blanc ${code}.` };
  })],
  // Comme le catalogue : /levels ne liste que les niveaux ouverts, /catalogue/levels tous les niveaux (brouillons compris).
  ['GET', /^\/levels$/, () => publishedLevels().map((code) => {
    const meta = levelMeta(code) as LevelMeta;
    return { id: code.toLowerCase(), code, title: meta.title, description: meta.description, position: meta.position };
  })],
  ['GET', /^\/catalogue\/levels$/, () => catalogueLevels().map(({ code, title, description, position, prerequisite }) => ({
    id: code.toLowerCase(), code, title, description, position, status: VERSIONS[code] ? 'published' : 'draft',
    prerequisiteLevelId: prerequisite?.toLowerCase() ?? null, prerequisiteLevelCode: prerequisite,
    versions: [
      ...(state().catalogueDrafts ?? []).filter((draft) => draft.levelCode === code).map((draft) => ({ id: draft.id, number: draft.number, status: 'draft',
        publishedAt: null, retiredAt: null, updatedAt: draft.updatedAt })),
      ...(VERSIONS[code] ? [{ id: VERSIONS[code].id, number: VERSIONS[code].number, status: 'published', publishedAt: VERSIONS[code].publishedAt, retiredAt: null,
        updatedAt: VERSIONS[code].publishedAt }] : [])],
  }))],
  // Documents de version au format 4 (questions typées, missions, lexique) pour l'éditeur du catalogue.
  ['GET', new RegExp(`^/catalogue/versions/${UUID}$`), ({ actor, params }) => catalogueVersion(actor, params[0])],
  ['GET', new RegExp(`^/catalogue/versions/${UUID}/checks$`), ({ actor, params }) => {
    catalogueVersion(actor, params[0]);
    return { publishable: true, issues: [] };
  }],
  ['PUT', new RegExp(`^/catalogue/versions/${UUID}$`), ({ actor, params, body }) => saveCatalogueDraft(actor, params[0], body)],
  ['POST', /^\/catalogue\/levels\/([abc][12])\/versions$/, ({ actor, params }) => createCatalogueDraft(actor, params[0])],
  ['GET', /^\/media$/, () => []],
  ['GET', /^\/media\/uploads$/, () => []],

  // Ciné-club : films publiés, questions des séquences (leçons sans version), carnet de mots, recommandations, éditeur
  ['GET', /^\/films$/, ({ query }) => publishedFilms(query.get('languageId'), query.get('level')).map((record) => filmView(record, false))],
  ['GET', new RegExp(`^/films/${SLUG}$`), ({ actor, params }) => readFilm(actor, params[0])],
  ['GET', /^\/lessons\/(cine-[a-z0-9][a-z0-9-]{0,79})$/, ({ actor, params }) => cineLesson(actor, params[0])],
  ['GET', /^\/learning\/cine$/, ({ actor, query }) => cineView(actor, query)],
  ['GET', /^\/learning\/words$/, ({ actor, query }) => wordsOf(wordReader(actor, query).id).map(wordView)],
  ['POST', /^\/learning\/words$/, ({ actor, body }) => addWord(actor, body)],
  ['PATCH', new RegExp(`^/learning/words/${UUID}$`), ({ actor, params, body }) => updateWord(actor, params[0], body)],
  ['DELETE', new RegExp(`^/learning/words/${UUID}$`), ({ actor, params }) => deleteWord(actor, params[0])],
  ['GET', /^\/learning\/film-recommendations$/, ({ actor, query }) => recommendationsOf(wordReader(actor, query).id).map(recommendationView)],
  ['POST', /^\/learning\/film-recommendations$/, ({ actor, body }) => recommendSequence(actor, body)],
  ['POST', new RegExp(`^/learning/film-recommendations/${UUID}/dismiss$`), ({ actor, params }) => dismissRecommendation(actor, params[0])],
  ['GET', /^\/catalogue\/films$/, ({ actor }) => {
    requireCatalogue(actor);
    return [...filmRecs()].sort((a, b) => levelRank(filmLevel(a)) - levelRank(filmLevel(b)) || a.document.film.position - b.document.film.position)
      .map(filmSummary);
  }],
  ['GET', new RegExp(`^/catalogue/films/${SLUG}$`), ({ actor, params }) => { requireCatalogue(actor); return filmEditorDocument(filmRecord(params[0])); }],
  ['PUT', new RegExp(`^/catalogue/films/${SLUG}$`), ({ actor, params, body }) => saveFilm(actor, params[0], body)],
  ['POST', new RegExp(`^/catalogue/films/${SLUG}/(publish|retire)$`), ({ actor, params }) =>
    setFilmStatus(actor, params[0], params[1] === 'publish' ? 'published' : 'draft')],
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
  options?: { method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; idempotencyKey?: string }): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 160));
  const method: Method = options?.method ?? 'GET';
  const url = new URL(path, 'http://simulateur.local');
  try {
    const route = routes.find(([verb, pattern]) => verb === method && pattern.test(url.pathname));
    if (!route) throw notFound(`Route non simulée : ${method} ${url.pathname}.`);
    // /health et /public/languages se lisent sans session (comme la passerelle).
    const actor = url.pathname === '/health' || url.pathname === '/public/languages' ? (undefined as unknown as UserRec) : actorOf(token);
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
      user(IDS.parcours, 'Nora Lefèvre', 'learner', { teacherId: IDS.weber, languageId: 'de' }),
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
    speech: [], missions: [], films: cineFilms(), words: [], filmRecommendations: [],
  };
  const invitation = (learner: UserRec): InvitationRec => ({ id: newId(), email: learner.email, displayName: learner.displayName, role: 'learner',
    teacherId: IDS.weber, languageId: 'de', invitedBy: IDS.weber, status: 'accepted', sendCount: 1, createdAt: at(created, 11), lastSentAt: at(created, 11),
    expiresAt: at(addDays(created, 7), 11), acceptedAt: at(addDays(created, 1), 8), cancelledAt: null });
  current.invitations.push(...[IDS.suivi, IDS.yanis, IDS.awa, IDS.parcours].map((id) => invitation(userById(id) as UserRec)));

  // Yanis : parcours A1 → A2 démarré il y a dix jours, contrat n°1 en attente du professeur.
  seedPath(userById(IDS.yanis) as UserRec, { placed: 'A0', target: 'A2', startOffset: -10, months: 6, doneUntil: -3 });
  // Nora : parcours A1 → A2 démarré aujourd'hui, contrat accepté, aucune séance faite (activités V4 du module « a1-hallo »).
  const nora = seedPath(userById(IDS.parcours) as UserRec, { placed: 'A0', target: 'A2', startOffset: 0, months: 8, doneUntil: -1 });
  Object.assign(nora.contracts[0], { status: 'accepted', decidedAt: at(today(), 8), decidedBy: IDS.weber, decisionNote: 'Bienvenue, Nora : on y va !' });
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
  seedV4();
  seedCine();
  return current;
}

/**
 * Données V4 : pour Léa (bibliothèque), une répétition « à revoir », un exercice typé corrigé et une mission à reprendre ;
 * pour Yanis (séance), une mission et une répétition enregistrée qui attendent Marie Weber ; pour Awa, une mission validée.
 */
function seedV4() {
  const lea = userById(IDS.suivi) as UserRec;
  const yanis = userById(IDS.yanis) as UserRec;
  const awa = userById(IDS.awa) as UserRec;
  const weber = userById(IDS.weber) as UserRec;
  const ago = (days: number, hour: number) => at(addDays(today(), -days), hour);
  const missionRec = (id: string) => state().missions.find((item) => item.id === id) as MissionRec;
  const gradeRec = (id: string) => state().grades.find((item) => item.id === id) as GradeRec;
  const speakLesson = lessonIdOf('a1-hallo-nachsprechen');
  const practiceLesson = lessonIdOf('a1-hallo-ueben');

  // Léa : trois échecs sur s3, la phrase passe « à revoir ».
  const round = fixedId(0x501);
  const say = (questionId: string, transcript: string) => speechAttempt(lea, { lessonId: speakLesson, questionId, roundId: round, transcripts: [transcript] });
  const tries = [say('s1', 'Guten Morgen'), say('s2', 'Ich heiße Anna'), say('s3', 'Ich komme'), say('s3', 'Ich bin aus Frankfurt'),
    say('s3', 'Komme aus Frankfurt'), say('s4', 'Ich spreche Deutsch und Französisch')];
  const spoken = gradeExercise(lea, { lessonId: speakLesson, roundId: round, answers: {
    s1: { speechAttemptId: tries[0].id }, s2: { speechAttemptId: tries[1].id }, s3: { speechAttemptId: tries[4].id }, s4: { speechAttemptId: tries[5].id },
  } }, 'apercu-lea-repeter');
  gradeRec(spoken.grade.id).submittedAt = ago(2, 18);
  for (const attempt of state().speech) if (attempt.roundId === round) attempt.createdAt = ago(2, 18);

  // Léa : exercice typé avec une graphie translittérée acceptée, un trou faux, une association inversée et un mauvais choix.
  const practice = V4_DETAILS['a1-hallo-ueben'].questions;
  const order = questionView(practiceLesson, practice[2]) as Extract<QuestionView, { type: 'order' }>;
  const { left, solution } = matchItems(practiceLesson, practice[3]);
  const written = gradeExercise(lea, { lessonId: practiceLesson, roundId: fixedId(0x502), answers: {
    q1: { blanks: { 1: 'heisse', 2: 'komme' } }, q2: { blanks: { 1: 'ist', 2: 'sind' } },
    q3: { order: ['Welche', 'Sprachen', 'sprichst', 'du', 'gut?'].map((text) => (order.tokens.find((token) => token.text === text) as QuestionItem).id) },
    q4: { pairs: { ...solution, [left[0].id]: solution[left[1].id], [left[1].id]: solution[left[0].id] } }, q5: { choice: 'a' },
  } }, 'apercu-lea-ueben');
  gradeRec(written.grade.id).submittedAt = ago(1, 19);

  // Léa : mission de bibliothèque envoyée à Marie Weber, à reprendre.
  const sendMission = (learner: UserRec, body: Json, text: string, key: string) => {
    const mission = openMission(learner, body).body;
    saveMission(learner, mission.id, { text, checklist: mission.definition.checklist.map((_, index) => index) });
    const upload = reserveMissionRecording(learner, mission.id, { mimeType: 'audio/webm', size: 180_000 });
    finalizeMissionRecording(learner, mission.id, upload.id);
    return submitMission(learner, mission.id, key);
  };
  const leaMission = sendMission(lea, { trackVersionId: VERSIONS.A1.id, activityId: 'a1-hallo-mission' },
    'Hallo! Ich heiße Léa Durand und ich komme aus Frankreich, aus Lyon. Jetzt ich wohne in Würzburg. Ich spreche Französisch, Englisch und ein bisschen Deutsch. Ich bin Studentin. Freut mich!',
    'apercu-lea-mission');
  reviewMission(weber, leaMission.id, { decision: 'to_redo', comment: 'Très bon début, Léa ! Une seule chose à corriger : après « Jetzt », le verbe vient en 2e position (« Jetzt wohne ich in Würzburg. »). Réenregistrez-vous en articulant bien « Würzburg ».' });
  Object.assign(missionRec(leaMission.id), { createdAt: ago(4, 17), submittedAt: ago(4, 18), reviewedAt: ago(3, 9), updatedAt: ago(3, 9) });

  // Yanis : mission envoyée depuis sa séance, en attente de Marie Weber.
  const path = latestPath(yanis.id);
  const sessionWith = (activityId: string) => path?.liveSessions.find((session) => session.items.some((item) => item.id === activityId));
  const missionSession = sessionWith('a1-hallo-mission');
  if (missionSession) {
    const mission = sendMission(yanis, { trackVersionId: VERSIONS.A1.id, activityId: 'a1-hallo-mission', sessionId: missionSession.id, sessionActivityId: 'a1-hallo-mission' },
      'Guten Tag! Ich heiße Yanis Benali. Ich komme aus Algerien, aber ich wohne jetzt in Marseille. Ich spreche Arabisch, Französisch und ein bisschen Deutsch. Ich lerne Deutsch, weil ich in Berlin studieren möchte. Tschüs!',
      'apercu-yanis-mission');
    recordProgress(yanis, missionSession.id, 'a1-hallo-mission', { completed: true, attemptId: mission.id });
    Object.assign(missionRec(mission.id), { createdAt: ago(1, 18), submittedAt: ago(1, 19), updatedAt: ago(1, 19) });
  }
  // Yanis : trois phrases réussies et une répétition enregistrée pour le professeur (navigateur sans reconnaissance vocale).
  const speakSession = sessionWith('a1-hallo-nachsprechen');
  if (speakSession) {
    const context = { lessonId: speakLesson, roundId: fixedId(0x503), sessionId: speakSession.id, activityId: 'a1-hallo-nachsprechen' };
    const passed = (questionId: string, transcript: string) => ({ speechAttemptId: speechAttempt(yanis, { ...context, questionId, transcripts: [transcript] }).id });
    const answers: Json = { s1: passed('s1', 'Guten Morgen'), s2: passed('s2', 'Ich heiße Anna'), s3: passed('s3', 'Ich komme aus Frankreich') };
    const reserved = reserveSpeechRecording(yanis, { ...context, questionId: 's4', mimeType: 'audio/webm', size: 64_000 }).body;
    finalizeSpeechRecording(yanis, reserved.attempt.id, reserved.upload.id);
    const result = gradeExercise(yanis, { ...context, answers: { ...answers, s4: { speechAttemptId: reserved.attempt.id } } }, 'apercu-yanis-repeter');
    recordProgress(yanis, speakSession.id, 'a1-hallo-nachsprechen', { completed: true, attemptId: result.grade.id, state: {} });
    gradeRec(result.grade.id).submittedAt = ago(2, 19);
    for (const attempt of state().speech) if (attempt.roundId === context.roundId) Object.assign(attempt, { createdAt: ago(2, 19), submittedAt: attempt.submittedAt && ago(2, 19) });
  }

  // Awa : mission de bibliothèque validée.
  const awaMission = sendMission(awa, { trackVersionId: VERSIONS.A2.id, activityId: 'a2-gesundheit-mission' },
    'Sehr geehrte Damen und Herren, ich habe am Donnerstag um 10 Uhr einen Termin bei Dr. Brandt. Leider kann ich nicht kommen, weil ich arbeiten muss. Wie besprochen komme ich am Freitag um 9 Uhr. Vielen Dank für Ihr Verständnis! Mit freundlichen Grüßen Awa Diallo',
    'apercu-awa-mission');
  reviewMission(weber, awaMission.id, { decision: 'validated', comment: 'Parfait, Awa : la subordonnée avec « weil » est juste et la formule de politesse aussi. Bravo !' });
  Object.assign(missionRec(awaMission.id), { createdAt: ago(6, 17), submittedAt: ago(6, 18), reviewedAt: ago(5, 10), updatedAt: ago(5, 10) });

  // Léa : mission orale B1 de la bibliothèque, corrigée sur la grille (16 / 20, validée), avec le modèle de commentaire.
  const interview = openMission(lea, { trackVersionId: VERSIONS.B1.id, activityId: 'b1-arbeit-atelier-sprechen' }).body;
  saveMission(lea, interview.id, { checklist: interview.definition.checklist.map((_, index) => index) });
  const take = reserveMissionRecording(lea, interview.id, { mimeType: 'audio/webm', size: 1_400_000 });
  finalizeMissionRecording(lea, interview.id, take.id);
  const answered = submitMission(lea, interview.id, 'apercu-lea-mission-b1');
  reviewMission(weber, answered.id, { decision: 'validated', points: { aufgabe: 4, kohaerenz: 3, wortschatz: 3, strukturen: 3, aussprache: 3 },
    comment: 'Points forts : trois réponses complètes et une question finale très polie (« Könnten Sie mir sagen, wann die Probezeit endet? »).\n'
      + 'À retravailler : après « weil », le verbe va à la fin (St : « weil ich gern mit Menschen arbeite ») ; l’accent de « Erfahrung » tombe sur « fah ».\n'
      + 'Relance : quelle question poseriez-vous sur l’équipe ou sur les horaires ?' });
  Object.assign(missionRec(answered.id), { createdAt: ago(3, 17), submittedAt: ago(3, 18), reviewedAt: ago(2, 9), updatedAt: ago(2, 9) });
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
      path.progress[progressKey(session.levelCode, item.id)] = { status: 'completed', completedAt: at(session.date, 17), state: {} };
    }
    if (session.items.every((item) => itemDone(path, session.levelCode, item.id))) session.completedAt = at(session.date, 17);
  }
  for (const grade of path.liveSessions.filter((session) => session.completedAt).flatMap((session) => session.items.filter((item) => item.kind === 'exercise'
    && !(V4_DETAILS[item.id] && isTyped(V4_DETAILS[item.id].questions)))
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

// ---------------------------------------------------------------------------------------------------------------------
// Contenus V4 d'exemple : une question de chaque type, une répétition orale, deux missions et deux lexiques
// ---------------------------------------------------------------------------------------------------------------------

const choice = (id: string, prompt: string, explanation: string, options: [string, boolean, string | null][]): DraftQuestionV4 => ({
  id, type: 'choice', prompt, moduleRef: null, explanation, spec: null,
  options: options.map(([label, correct, feedback], index) => ({ id: 'abcd'[index], label, correct, feedback })),
});
const typed = (id: string, type: NonNullable<DraftQuestionV4['type']>, prompt: string, explanation: string, spec: DraftQuestionV4['spec']): DraftQuestionV4 => ({
  id, type, prompt, moduleRef: null, explanation, options: [], spec,
});
const speak = (id: string, text: string, explanation: string): DraftQuestionV4 =>
  typed(id, 'speak', 'Écoutez, puis répétez la phrase à voix haute.', explanation, { text, accept: [text], threshold: countWords(text) <= 3 ? 80 : 75 });
const dictation = (id: string, accept: string[], explanation: string): DraftQuestionV4 =>
  typed(id, 'dictation', 'Écoutez et écrivez la phrase.', explanation, { accept, showWordCount: true });

/** Activités ajoutées par la V4 : [module, activité placée après, tuple de l'activité]. */
const V4_ACTIVITIES: [string, string, MockModule['activities'][number]][] = [
  ['a1-hallo', 'a1-hallo-grammatik', ['a1-hallo-ueben', 'exercise', 'S’entraîner : heißen, kommen, sein', 10, ['lecture', 'expression-ecrite']]],
  ['a1-hallo', 'a1-hallo-ueben', ['a1-hallo-nachsprechen', 'exercise', 'Répéter à voix haute : se présenter', 8, ['ecoute', 'expression-orale']]],
  ['a1-hallo', 'a1-hallo-sprechen', ['a1-hallo-mission', 'mission', 'Mission : se présenter au groupe', 15, ['expression-orale', 'expression-ecrite']]],
  ['a1-zahlen', 'a1-zahlen-hoeren', ['a1-zahlen-diktat', 'exercise', 'Dictée : âge, prix et couleurs', 8, ['ecoute', 'expression-ecrite']]],
  ['a2-gesundheit', 'a2-gesundheit-grammatik', ['a2-gesundheit-ueben', 'exercise', 'S’entraîner : weil, dass et les verbes à préposition', 10, ['lecture', 'expression-ecrite']]],
  ['a2-gesundheit', 'a2-gesundheit-sprechen', ['a2-gesundheit-mission', 'mission', 'Mission : déplacer un rendez-vous chez le médecin', 20, ['expression-orale', 'expression-ecrite']]],
];

const V4_DETAILS: Record<string, MockV4Detail> = {
  'a1-hallo-ueben': {
    lesson: { title: 'Ich heiße, ich komme, ich bin', description: 'Complétez, remettez en ordre et associez pour vérifier les trois verbes de la présentation et la place du verbe.\n\nRAPPEL\n• heißen : ich heiße, du heißt, er/sie heißt, Sie heißen\n• kommen : ich komme, du kommst, er/sie kommt, Sie kommen\n• sein : ich bin, du bist, er/sie ist, Sie sind\n• Question en W : le mot interrogatif, puis le verbe conjugué en 2e position (Woher kommen Sie?).' },
    transcript: null,
    questions: [
      typed('q1', 'fill', 'Complétez avec la forme du verbe indiqué.',
        'Avec « ich », le verbe se termine par -e : ich heiße, ich komme. Les formes « heißt » et « kommst » correspondent à « du ».',
        { text: 'Ich [[1]] Anna und ich [[2]] aus Italien.', blanks: [{ id: '1', accept: ['heiße'], size: 7, hint: 'heißen' }, { id: '2', accept: ['komme'], size: 7, hint: 'kommen' }] }),
      typed('q2', 'fill', 'Complétez avec le verbe « sein ».',
        '« Das » (c’est) et « sie » (elle, ici Frau Weber) demandent la 3e personne du singulier : « ist ». « sind » va avec « wir », « sie » (ils) et « Sie » (vous de politesse).',
        { text: 'Das [[1]] Frau Weber. Sie kommt aus Wien und [[2]] sehr nett.', blanks: [{ id: '1', accept: ['ist'], size: 5, hint: null }, { id: '2', accept: ['ist'], size: 5, hint: null }] }),
      typed('q3', 'order', 'Remettez les mots dans l’ordre pour poser la question.',
        'Le groupe interrogatif « Welche Sprachen » occupe la 1re place, le verbe conjugué « sprichst » la 2e, puis vient le sujet « du ». « gut » se place après le sujet.',
        { answers: [['Welche', 'Sprachen', 'sprichst', 'du', 'gut?']] }),
      typed('q4', 'match', 'Associez chaque question à la réponse qui convient.',
        '« Wie » demande comment, « Woher » d’où l’on vient (réponse avec « aus »), « Wo » où l’on habite (réponse avec « in »). « Wie geht\'s? » demande des nouvelles.',
        { pairs: [{ left: 'Wie heißt du?', right: 'Ich heiße Jonas.' }, { left: 'Woher kommst du?', right: 'Aus Frankreich.' },
          { left: 'Wo wohnst du?', right: 'In Würzburg.' }, { left: 'Wie geht\'s?', right: 'Gut, danke!' }] }),
      choice('q5', 'Vous demandez son nom à votre nouvelle voisine, une dame âgée que vous ne connaissez pas. Que dites-vous ?',
        'Avec un adulte qu’on ne connaît pas, on vouvoie : « Sie » et le verbe en -en, « Wie heißen Sie? ».', [
          ['Wie heißt du?', false, '« du » s’emploie avec la famille, les amis, les enfants et entre jeunes : ici, c’est trop familier.'],
          ['Wie heißen Sie?', true, null],
          ['Wie heißen du?', false, '« heißen » va avec « Sie » ; avec « du », la forme est « heißt ».'],
        ]),
    ],
  },
  'a1-hallo-nachsprechen': {
    lesson: { title: 'Nachsprechen — Répéter', description: 'Écoutez chaque phrase, puis répétez-la à voix haute avec le bouton « Parler ». Votre navigateur reconnaît ce que vous dites et LinguaCap le compare à la phrase modèle.\n\nAprès trois essais, vous pouvez passer à la suite : la phrase sera notée « à revoir ». Sans reconnaissance vocale, enregistrez-vous pour votre professeur.' },
    transcript: null,
    questions: [
      speak('s1', 'Guten Morgen!', 'Le « g » de « Guten » est toujours dur, comme dans « gâteau » ; le « r » de « Morgen » se prononce au fond de la gorge.'),
      speak('s2', 'Ich heiße Anna.', '« ei » se prononce [aï] et « ß » est un « s » dur : « heiße » se dit [haïsse].'),
      speak('s3', 'Ich komme aus Frankreich.', 'Après « i » ou « ei », « ch » est un souffle doux (ich-Laut) : « ich », « Frankreich ».'),
      speak('s4', 'Ich spreche Deutsch und Französisch.', '« sp » en début de mot se prononce [chp] : « spreche ». « eu » se dit [oï] : « Deutsch ».'),
    ],
  },
  'a1-hallo-mission': {
    lesson: { title: 'Sich vorstellen — Se présenter', description: 'Votre cours d’allemand commence. Frau Weber demande à chaque participant de se présenter au groupe, à l’oral puis par écrit sur le forum du cours.\n\nCONSIGNE\nPrésentez-vous : votre nom, votre pays d’origine, votre ville et les langues que vous parlez. Terminez par une formule de politesse.\n\nEXPRESSIONS UTILES\n• Ich heiße … / Mein Name ist …\n• Ich komme aus … Ich wohne in …\n• Ich spreche … und ein bisschen Deutsch.\n• Freut mich! / Bis bald!' },
    transcript: null,
    questions: [],
    mission: {
      oral: { prompt: 'Enregistrez votre présentation (30 secondes à une minute et demie) : nom, origine, ville et langues.', maxSeconds: 90 },
      written: { prompt: 'Écrivez votre message de présentation pour le forum du cours (25 mots au moins).', maxChars: 600, minWords: 25 },
      checklist: [
        'J’ai dit mon nom avec « Ich heiße … » ou « Mein Name ist … ».',
        'J’ai dit d’où je viens et où j’habite (kommen aus, wohnen in).',
        'J’ai cité au moins une langue que je parle.',
        'J’ai relu mon texte : verbe en 2e position, majuscule aux noms.',
      ],
    },
  },
  'a1-zahlen-diktat': {
    lesson: { title: 'Diktat — Dictée', description: 'Écoutez chaque phrase autant de fois que nécessaire, puis écrivez-la. Les nombres peuvent s’écrire en chiffres ou en lettres. Utilisez la barre ä ö ü ß pour les lettres allemandes.' },
    transcript: null,
    questions: [
      dictation('d1', ['Ich bin zwanzig Jahre alt.'], '« Jahre » est un nom : il prend une majuscule. Pour donner son âge, on dit « Ich bin … Jahre alt ».'),
      dictation('d2', ['Der Kaffee kostet drei Euro fünfzig.', 'Der Kaffee kostet 3,50 Euro.'],
        'Pour un prix, on dit les euros puis les centimes : « drei Euro fünfzig » (3,50 €). « Euro » reste au singulier après un nombre.'),
      dictation('d3', ['Mein Fahrrad ist blau.'], 'Après « ist », la couleur est un adjectif : elle s’écrit en minuscule et ne change pas. « Fahrrad » est un nom : majuscule.'),
    ],
  },
  'a2-gesundheit-ueben': {
    lesson: { title: 'Weil, dass und Verben mit Präposition', description: 'Après « weil » (parce que) et « dass » (que), le verbe conjugué part à la fin de la phrase. « denn » (car) ne change pas l’ordre des mots.\n\n• Ich bleibe zu Hause, weil ich krank bin.\n• Der Arzt sagt, dass ich viel trinken soll.\n• Ich bleibe zu Hause, denn ich bin krank.\n\nCertains verbes se construisent avec une préposition et un cas fixes : warten auf + accusatif, sprechen mit + datif.' },
    transcript: null,
    questions: [
      typed('g1', 'order', 'Remettez les mots dans l’ordre.',
        '« weil » introduit une subordonnée : le sujet « ich » suit la conjonction et le verbe conjugué « habe » se place à la fin.',
        { answers: [['Ich bleibe zu Hause,', 'weil', 'ich', 'Fieber', 'habe.']] }),
      typed('g2', 'order', 'Remettez les mots dans l’ordre.',
        'Après « dass », le verbe conjugué va à la fin ; avec un verbe de modalité, l’infinitif « trinken » se place juste avant lui : « … trinken soll ».',
        { answers: [['Der Arzt sagt,', 'dass', 'ich', 'viel', 'Wasser', 'trinken', 'soll.']] }),
      typed('g3', 'fill', 'Complétez avec « weil » ou « dass ».',
        '« glauben, dass … » introduit ce que l’on pense ; la cause s’exprime avec « weil » (ou « da »). Dans les deux cas, le verbe conjugué (hast, geht) est à la fin.',
        { text: 'Ich glaube, [[1]] du Fieber hast. Du solltest zum Arzt gehen, [[2]] es dir nicht gut geht.',
          blanks: [{ id: '1', accept: ['dass'], size: 6, hint: null }, { id: '2', accept: ['weil', 'da'], size: 6, hint: null }] }),
      typed('g4', 'match', 'Associez chaque verbe à la préposition et au cas qu’il demande.',
        'Ces constructions s’apprennent avec le verbe : auf den Bus warten, an den Termin denken, mit dem Arzt sprechen, Angst vor der Spritze haben.',
        { pairs: [{ left: 'warten', right: 'auf + accusatif' }, { left: 'denken', right: 'an + accusatif' },
          { left: 'sprechen', right: 'mit + datif' }, { left: 'Angst haben', right: 'vor + datif' }] }),
      dictation('g5', ['Mir tut der Kopf weh.'], 'La personne qui a mal est au datif (mir) et la partie du corps est le sujet (der Kopf) ; la particule « weh » se place à la fin.'),
      choice('g6', 'Votre collègue tousse depuis une semaine. Quel conseil lui donnez-vous ?',
        'Pour conseiller, on emploie « sollte » conjugué en 2e position et l’infinitif à la fin : « Du solltest zum Arzt gehen. »', [
          ['Du solltest zum Arzt gehen.', true, null],
          ['Du solltest zum Arzt gegangen.', false, 'Après un verbe de modalité comme « sollte », le verbe reste à l’infinitif : « gehen ».'],
          ['Du solltest zum Arzt zu gehen.', false, '« zu » + infinitif ne s’emploie pas après un verbe de modalité.'],
        ]),
    ],
  },
  'a2-gesundheit-mission': {
    lesson: { title: 'Einen Termin verschieben — Déplacer un rendez-vous', description: 'Vous avez rendez-vous jeudi à 10 heures chez le docteur Brandt, mais votre responsable vous demande de travailler ce jour-là. Vous appelez le cabinet, puis vous confirmez par courriel.\n\nCONSIGNE\nAu téléphone : saluez, donnez votre nom, expliquez pourquoi vous ne pouvez pas venir (avec « weil ») et proposez un autre jour. Par écrit : confirmez le nouveau rendez-vous en quelques phrases.\n\nEXPRESSIONS UTILES\n• Ich habe am Donnerstag um 10 Uhr einen Termin.\n• Leider kann ich nicht kommen, weil …\n• Geht es auch am Freitag?\n• Mit freundlichen Grüßen' },
    transcript: null,
    questions: [],
    mission: {
      oral: { prompt: 'Laissez un message sur le répondeur du cabinet (une minute au plus).', maxSeconds: 60 },
      written: { prompt: 'Écrivez le courriel de confirmation au cabinet (40 mots au moins).', maxChars: 800, minWords: 40 },
      checklist: [
        'J’ai salué et donné mon nom.',
        'J’ai expliqué pourquoi je ne peux pas venir, avec « weil » et le verbe à la fin.',
        'J’ai proposé un autre jour et une heure.',
        'J’ai terminé le courriel par « Mit freundlichen Grüßen ».',
      ],
    },
  },
};

/** Explications ajoutées par la V4 aux questions historiques (les autres restent sans explication dans le simulateur). */
const EXPLANATIONS: Record<string, Record<string, string>> = {
  'a1-hallo-grammatik': {
    q1: 'Avec « ich », le verbe prend la terminaison -e : « ich heiße ». « heißt » va avec « du » ou « er/sie », « heißen » avec « Sie » ou « wir ».',
    q2: 'Avec « du », la terminaison est -st : « du kommst ». Le verbe se place juste après le mot interrogatif « Woher ».',
    q3: '« Sie » (vous de politesse) se conjugue comme le pluriel : le verbe se termine par -en, « Sie heißen ».',
    q4: '« Das ist … » présente une personne ou une chose : « sein » se conjugue « ist » à la 3e personne du singulier.',
    q5: 'La réponse « In Würzburg » indique où l’on habite : on demande avec « Wo ». « Woher » demande l’origine (réponse avec « aus »).',
    q6: 'On vouvoie un adulte inconnu, surtout dans un cadre officiel : « Guten Tag! Wie geht es Ihnen? ». « Hallo » et « Wie geht\'s dir? » sont familiers, « Tschüs » sert à partir.',
  },
};

const word = (id: string, value: string, partOfSpeech: MockVocabulary['partOfSpeech'], translation: string, example: string,
  extra: Partial<Pick<MockVocabulary, 'article' | 'plural' | 'note'>> = {}): MockVocabulary => ({
  id, word: value, article: extra.article ?? null, plural: extra.plural ?? null, partOfSpeech, translation, example, note: extra.note ?? null,
});
const VOCABULARY: Record<string, MockVocabulary[]> = {
  'a1-hallo': [
    word('hallo', 'Hallo!', 'expression', 'Salut ! Bonjour !', 'Hallo, ich bin Jonas.', { note: 'familier' }),
    word('guten-morgen', 'Guten Morgen!', 'expression', 'Bonjour ! (le matin)', 'Guten Morgen, Frau Weber!'),
    word('tschuess', 'Tschüs!', 'expression', 'Salut ! (pour partir)', 'Tschüs, bis morgen!', { note: 'familier ; poli : Auf Wiedersehen!' }),
    word('heissen', 'heißen', 'verb', 's’appeler', 'Wie heißen Sie?', { note: 'ich heiße, du heißt' }),
    word('kommen', 'kommen', 'verb', 'venir', 'Ich komme aus Frankreich.', { note: '+ aus : venir de' }),
    word('wohnen', 'wohnen', 'verb', 'habiter', 'Ich wohne in Würzburg.', { note: '+ in : habiter à' }),
    word('sprechen', 'sprechen', 'verb', 'parler', 'Ich spreche Französisch und Deutsch.', { note: 'irrégulier : du sprichst, er spricht' }),
    word('name', 'Name', 'noun', 'le nom', 'Mein Name ist Anna Rossi.', { article: 'der', plural: 'Namen' }),
    word('land', 'Land', 'noun', 'le pays', 'Aus welchem Land kommst du?', { article: 'das', plural: 'Länder' }),
    word('sprache', 'Sprache', 'noun', 'la langue', 'Welche Sprachen sprichst du?', { article: 'die', plural: 'Sprachen' }),
    word('lehrerin', 'Lehrerin', 'noun', 'la professeure', 'Frau Weber ist meine Lehrerin.', { article: 'die', plural: 'Lehrerinnen', note: 'masculin : der Lehrer' }),
    word('leute', 'Leute', 'noun', 'les gens', 'Die Leute im Kurs sind nett.', { note: 'toujours au pluriel : die Leute' }),
    word('woher', 'woher', 'adverb', 'd’où', 'Woher kommen Sie?'),
    word('freut-mich', 'Freut mich!', 'expression', 'Enchanté(e) !', 'Freut mich, Anna!'),
  ],
  'a2-gesundheit': [
    word('kopf', 'Kopf', 'noun', 'la tête', 'Mein Kopf tut weh.', { article: 'der', plural: 'Köpfe' }),
    word('bauch', 'Bauch', 'noun', 'le ventre', 'Mir tut der Bauch weh.', { article: 'der', plural: 'Bäuche' }),
    word('hals', 'Hals', 'noun', 'la gorge, le cou', 'Mein Hals tut weh.', { article: 'der', plural: 'Hälse' }),
    word('ruecken', 'Rücken', 'noun', 'le dos', 'Der Rücken tut mir weh.', { article: 'der', plural: 'Rücken' }),
    word('fieber', 'Fieber', 'noun', 'la fièvre', 'Ich habe seit gestern Fieber.', { article: 'das' }),
    word('erkaeltung', 'Erkältung', 'noun', 'le rhume', 'Ich habe eine Erkältung.', { article: 'die', plural: 'Erkältungen' }),
    word('termin', 'Termin', 'noun', 'le rendez-vous', 'Ich möchte einen Termin vereinbaren.', { article: 'der', plural: 'Termine' }),
    word('rezept', 'Rezept', 'noun', 'l’ordonnance', 'Der Arzt schreibt mir ein Rezept.', { article: 'das', plural: 'Rezepte', note: 'aussi : la recette de cuisine' }),
    word('apotheke', 'Apotheke', 'noun', 'la pharmacie', 'Die Apotheke ist gleich um die Ecke.', { article: 'die', plural: 'Apotheken' }),
    word('wehtun', 'wehtun', 'verb', 'faire mal', 'Mir tut der Kopf weh.', { note: 'séparable : weh|tun ; + datif : mir tut … weh' }),
    word('sich-ausruhen', 'sich ausruhen', 'verb', 'se reposer', 'Du solltest dich ausruhen.', { note: 'séparable et pronominal : ich ruhe mich aus' }),
    word('krank', 'krank', 'adjective', 'malade', 'Ich bin krank und bleibe zu Hause.'),
    word('gesund', 'gesund', 'adjective', 'en bonne santé', 'Obst und Gemüse sind gesund.'),
    word('gute-besserung', 'Gute Besserung!', 'expression', 'Bon rétablissement !', 'Gute Besserung, Tarek!'),
  ],
};

// Les activités V4 rejoignent leurs modules à la suite de l'activité indiquée.
for (const [moduleId, after, activity] of V4_ACTIVITIES) {
  const module = CONTENT.flatMap((level) => level.modules).find((item) => item.id === moduleId);
  if (!module || module.activities.some(([id]) => id === activity[0])) continue;
  const index = module.activities.findIndex(([id]) => id === after);
  module.activities.splice(index < 0 ? module.activities.length : index + 1, 0, activity);
}

// ---------------------------------------------------------------------------------------------------------------------
// Niveau B1 (cours B1 et B2) : gabarit « thème + atelier » du plan B (12 thèmes × 2 modules, identifiants d'activité fixés),
// module « b1-arbeit » détaillé (consignes bilingues, exercices typés, répétition, lexique) et missions sur grille de son
// atelier. Les autres activités B1 sont résumées par le simulateur (questions et missions courtes, consignes bilingues).
// ---------------------------------------------------------------------------------------------------------------------

/** Consigne B1 : allemand simple, puis la traduction française affichée à côté (comme `bi()` de content/b/lib.mjs). */
function bi(de: string, fr: string) { return `${de} [fr] ${fr}`; }

/** Grilles standard des missions B1 (`GRIDS.b1` de content/b/lib.mjs) : 4 critères à l'écrit, 5 à l'oral, 20 points. */
const B1_GRIDS: { schreiben: MissionCriterion[]; sprechen: MissionCriterion[] } = {
  schreiben: [
    { id: 'aufgabe', label: 'Tâche : tous les points sont traités, destinataire et registre (du / Sie) respectés', maxPoints: 5 },
    { id: 'kohaerenz', label: 'Cohérence : texte organisé (début, développement, fin), connecteurs variés', maxPoints: 5 },
    { id: 'wortschatz', label: 'Vocabulaire : précis et assez varié pour le thème, formules adaptées', maxPoints: 5 },
    { id: 'strukturen', label: 'Structures : subordonnées et verbe à la bonne place ; les erreurs ne gênent pas la compréhension', maxPoints: 5 },
  ],
  sprechen: [
    { id: 'aufgabe', label: 'Tâche : tous les points sont traités dans le temps imparti', maxPoints: 4 },
    { id: 'kohaerenz', label: 'Cohérence et aisance : discours suivi, idées reliées, peu d’hésitations', maxPoints: 4 },
    { id: 'wortschatz', label: 'Vocabulaire : précis, formules d’usage adaptées', maxPoints: 4 },
    { id: 'strukturen', label: 'Structures : phrases variées, verbe à la bonne place', maxPoints: 4 },
    { id: 'aussprache', label: 'Prononciation et intonation : compréhensible, accent de phrase juste', maxPoints: 4 },
  ],
};

/** Consignes standard B1 (`C` de content/b/lib.mjs). */
const B1_C = {
  lesen: bi('Lesen Sie den Text. Beantworten Sie dann die Fragen.', 'Lisez le texte, puis répondez aux questions.'),
  richtigFalsch: 'Richtig, falsch oder steht nicht im Text? [fr] Vrai, faux ou non mentionné dans le texte ?',
  sprechen: bi('Hören Sie und sprechen Sie nach.', 'Écoutez, puis répétez à voix haute.'),
};

/** Répétition B1 : consigne bilingue, seuil 75 (70 au-delà de 10 mots), nombres acceptés aussi en chiffres. */
const bSpeak = (id: string, text: string, explanation: string, accept: string[] = [text]): DraftQuestionV4 =>
  typed(id, 'speak', B1_C.sprechen, explanation, { text, accept, threshold: countWords(text) > 10 ? 70 : 75 });
/** Choix « richtig / falsch / steht nicht im Text » : l'affirmation, puis la consigne traduite. */
const richtigFalsch = (id: string, statement: string, answer: 0 | 1 | 2, explanation: string): DraftQuestionV4 =>
  choice(id, `${statement} ${B1_C.richtigFalsch}`, explanation,
    (['richtig', 'falsch', 'steht nicht im Text'] as const).map((label, index) => [label, index === answer, null]));

/**
 * Thèmes B1 (annexe modules du plan B) : identifiant, titre et objectif du module thème, second document, titre et objectif
 * de l'atelier, missions écrite et orale.
 */
const B1_THEMES: [string, string, string, 'hoeren2' | 'lesen2', string, string, string, string][] = [
  ['neuanfang', 'Neuanfang : raconter un nouveau départ',
    'Raconter dans l’ordre une étape de sa vie, situer les moments (als, nachdem, bevor, seitdem) et réagir au récit de quelqu’un.', 'hoeren2',
    'Neuanfang, atelier : se présenter à un nouveau groupe', 'Écrire à un nouveau groupe pour se présenter et raconter à l’oral un tournant de sa vie.',
    'se présenter au nouveau groupe', 'raconter un tournant'],
  ['beziehungen', 'Beziehungen : parler de ses relations et de ses sentiments',
    'Décrire une amitié ou une relation familiale, dire ce que l’on ressent et montrer de la compréhension (sich freuen auf, sich ärgern über, darauf, worüber).', 'lesen2',
    'Beziehungen, atelier : conseiller une amie, régler un malentendu', 'Répondre à une amie qui demande conseil, s’excuser et proposer une solution.',
    'conseiller une amie', 's’excuser et proposer une solution'],
  ['wohnen', 'Wohnen : vivre ensemble dans un immeuble',
    'Comprendre un règlement intérieur, décrire un problème du logement et préciser de qui ou de quoi l’on parle (relatives).', 'hoeren2',
    'Wohnen, atelier : signaler un problème et proposer un accord', 'Écrire à la régie pour signaler un problème et trouver un accord avec un voisin.',
    'écrire à la régie', 'trouver un accord avec un voisin'],
  ['arbeit', 'Arbeit : comprendre une offre et préparer un entretien',
    'Comprendre une offre d’emploi, présenter ses compétences avec un exemple et poser des questions polies (Könnten Sie mir sagen, … ?).', 'lesen2',
    'Arbeit, atelier : postuler et se présenter en entretien', 'Écrire une candidature formelle par courriel et répondre à trois questions d’entretien.',
    'postuler par courriel', 'répondre à trois questions d’entretien'],
  ['gesundheit', 'Gesundheit : prendre soin de sa santé',
    'Décrire des symptômes et leur évolution, comprendre des conseils et un message du cabinet, poser une condition (wenn, falls).', 'hoeren2',
    'Gesundheit, atelier : organiser un rendez-vous et donner des conseils', 'Déplacer un rendez-vous par un message formel court et conseiller un ami sur sa santé.',
    'déplacer un rendez-vous au cabinet', 'donner des conseils santé à un ami'],
  ['lernen', 'Lernen : choisir une formation',
    'Comparer des offres de cours, exprimer un but (um … zu, damit) et comprendre les conditions d’inscription.', 'lesen2',
    'Lernen, atelier : se renseigner et motiver son choix', 'Se renseigner par écrit auprès d’une école et comparer deux formations à l’oral.',
    'se renseigner auprès d’une école', 'comparer deux formations'],
  ['unterwegs', 'Unterwegs : voyager malgré les imprévus',
    'Comprendre une annonce de perturbation, comparer deux options de trajet et exprimer une concession (obwohl, trotzdem).', 'hoeren2',
    'Unterwegs, atelier : prévenir un groupe et réorganiser le trajet', 'Prévenir un groupe d’un changement de programme et planifier un trajet à deux.',
    'prévenir le groupe d’un changement', 'planifier un trajet à deux'],
  ['konsum', 'Konsum : acheter, réclamer, obtenir une solution',
    'Comprendre des conditions de retour et de garantie, décrire un défaut et comprendre qui fait quoi (passif, etwas reparieren lassen).', 'lesen2',
    'Konsum, atelier : écrire une réclamation efficace', 'Écrire une réclamation structurée et négocier une solution au téléphone.',
    'écrire une réclamation', 'négocier une solution au téléphone'],
  ['medien', 'Medien : s’informer et vérifier une information',
    'Distinguer fait, opinion et rumeur, rapporter ce qu’une source dit (dass, ob, laut) et comprendre une émission de radio locale.', 'lesen2',
    'Medien, atelier : relayer une information fiable', 'Donner son avis sur un forum et présenter une information avec sa source.',
    'donner son avis sur un forum', 'présenter une information et sa source'],
  ['umwelt', 'Umwelt : agir pour son quartier et l’environnement',
    'Comprendre des propositions, comparer des options, faire une hypothèse et dire ce que l’on ferait (Konjunktiv II, je … desto).', 'hoeren2',
    'Umwelt, atelier : défendre une proposition, présenter un thème', 'Écrire une proposition au conseil de quartier et présenter un thème en trois minutes.',
    'faire une proposition au conseil de quartier', 'présenter un thème en trois minutes'],
  ['gesellschaft', 'Gesellschaft : s’engager dans une association',
    'Comprendre une annonce d’association et ses conditions, s’informer sur l’engagement bénévole et faire une démarche simple.', 'lesen2',
    'Gesellschaft, atelier : transmettre une information à un groupe', 'Proposer sa candidature comme bénévole et réagir à un exposé.',
    'proposer sa candidature comme bénévole', 'réagir à un exposé'],
  ['kultur', 'Kultur : sorties culturelles et fêtes',
    'Comprendre un programme culturel, nuancer un avis, recommander une sortie et parler de traditions.', 'lesen2',
    'Kultur, atelier : organiser un événement et faire le bilan', 'Inviter et faire le bilan d’une fête par écrit, organiser une fête à deux à l’oral.',
    'inviter et faire le bilan d’une fête', 'organiser une fête à deux'],
];

/** Titres propres au module détaillé « b1-arbeit » (les autres modules prennent les titres du gabarit). */
const B1_TITLES: Record<string, string> = {
  'b1-arbeit-einstieg': 'Mise en route : chercher un nouveau poste',
  'b1-arbeit-lesen': 'Comprendre : une offre d’emploi',
  'b1-arbeit-hoeren': 'Comprendre : l’appel de la responsable du recrutement',
  'b1-arbeit-entdecken': 'Découvrir : demander poliment',
  'b1-arbeit-regel': 'À retenir : questions polies et indirectes',
  'b1-arbeit-grammatik': 'S’entraîner : questions polies et indirectes',
  'b1-arbeit-wortschatz': 'S’entraîner : le vocabulaire de la candidature',
  'b1-arbeit-redemittel': 'Répéter à voix haute : se présenter en entretien',
  'b1-arbeit-lesen2': 'Comprendre : une passation de poste',
  'b1-arbeit-kontrolle': 'Vérifier : Arbeit',
};

/** Les 24 modules B1, prérequis en chaîne, activités et durées du gabarit (thème 126 min, atelier 118 min). */
function b1Modules(): MockModule[] {
  const modules: MockModule[] = [];
  for (const [theme, title, objective, second, atelierTitle, atelierObjective, written, oral] of B1_THEMES) {
    const id = `b1-${theme}`;
    const name = title.split(' : ')[1] ?? title;
    const entry = (suffix: string, kind: 'lesson' | 'exercise' | 'mission', label: string, minutes: number, competences: string[]):
      MockModule['activities'][number] => [`${id}-${suffix}`, kind, B1_TITLES[`${id}-${suffix}`] ?? label, minutes, competences];
    modules.push({ id, title, objective, prerequisites: modules.length ? [modules[modules.length - 1].id] : [], activities: [
      entry('einstieg', 'lesson', `Mise en route : ${name}`, 10, ['lecture', 'expression-orale']),
      entry('lesen', 'exercise', 'Comprendre : un texte', 20, ['lecture']),
      entry('hoeren', 'exercise', 'Comprendre : une conversation', 18, ['ecoute']),
      entry('entdecken', 'exercise', 'Découvrir : la règle', 10, ['lecture']),
      entry('regel', 'lesson', 'À retenir : la règle', 8, ['lecture']),
      entry('grammatik', 'exercise', 'S’entraîner : grammaire', 12, ['lecture', 'expression-ecrite']),
      entry('wortschatz', 'exercise', 'S’entraîner : vocabulaire et formules', 12, ['lecture', 'expression-ecrite']),
      entry('redemittel', 'exercise', 'Répéter à voix haute : formules utiles', 9, ['expression-orale']),
      entry(second, 'exercise', second === 'hoeren2' ? 'Comprendre : un message enregistré' : 'Comprendre : un second texte', 15,
        [second === 'hoeren2' ? 'ecoute' : 'lecture']),
      entry('kontrolle', 'exercise', `Vérifier : ${title.split(' : ')[0]}`, 12, ['lecture', 'ecoute']),
    ] });
    const atelier = `${id}-atelier`;
    const step = (suffix: string, kind: 'lesson' | 'exercise' | 'mission', label: string, minutes: number, competences: string[]):
      MockModule['activities'][number] => [`${atelier}-${suffix}`, kind, label, minutes, competences];
    modules.push({ id: atelier, title: atelierTitle, objective: atelierObjective, prerequisites: [id], activities: [
      step('modell', 'lesson', 'Un modèle : bien écrire et bien dire', 12, ['lecture', 'ecoute']),
      step('interaktion', 'exercise', 'Réagir en situation', 10, ['ecoute', 'expression-orale']),
      step('mediation', 'exercise', 'Médiation : transmettre l’essentiel', 15, ['lecture', 'expression-ecrite']),
      step('korrektur', 'exercise', 'Corriger : les erreurs typiques', 10, ['lecture', 'expression-ecrite']),
      step('pruefung', 'exercise', 'Entraînement au format de l’examen', 20, ['lecture']),
      step('schreiben', 'mission', `Mission : ${written}`, 25, ['expression-ecrite']),
      step('sprechen', 'mission', `Mission : ${oral}`, 20, ['expression-orale']),
      step('bilan', 'lesson', 'Faire le point', 6, ['lecture']),
    ] });
  }
  return modules;
}

/** Mission B1 résumée par le simulateur : consigne courte et grille standard du niveau. */
function summaryMission(activityId: string, title: string): MockV4Detail {
  const oral = activityId.endsWith('-sprechen');
  return {
    lesson: { title: title.replace(/^Mission : /, ''), description: bi('Der Simulator zeigt diese Mission in Kurzform. Lesen Sie die Aufgabe und die Bewertungskriterien.',
      'Le simulateur présente cette mission en version courte. Lisez la consigne et les critères d’évaluation.') },
    transcript: null, questions: [],
    mission: oral
      ? { oral: { prompt: bi('Nehmen Sie Ihren Beitrag auf (etwa zwei Minuten).', 'Enregistrez votre intervention (environ deux minutes).'), maxSeconds: 150 },
        written: null, checklist: ['J’ai traité chaque point de la consigne.', 'J’ai relié mes idées (zuerst, außerdem, deshalb, zum Schluss).',
          'J’ai parlé de façon suivie, sans lire un texte.'], criteria: B1_GRIDS.sprechen }
      : { oral: null, written: { prompt: bi('Schreiben Sie Ihren Text (100 bis 150 Wörter).', 'Écrivez votre texte (100 à 150 mots).'), maxChars: 1500, minWords: 100 },
        checklist: ['J’ai traité chaque point de la consigne.', 'J’ai choisi le registre (du ou Sie) et les formules d’appel et de fin qui conviennent.',
          'J’ai relu la place du verbe et les terminaisons.'], criteria: B1_GRIDS.schreiben },
  };
}

/** Module « b1-arbeit » et son atelier : consignes bilingues, questions de chaque type, missions sur grille. */
const B1_DETAILS: Record<string, MockV4Detail> = {
  'b1-arbeit-einstieg': {
    lesson: { title: 'Eine neue Stelle — Un nouveau poste', description: [
      'Herr Diallo arbeitet seit drei Jahren in einem Supermarkt. Jetzt sucht er eine neue Stelle mit festen Arbeitszeiten.',
      '[fr] M. Diallo travaille depuis trois ans dans un supermarché. Il cherche maintenant un poste avec des horaires fixes.',
      '',
      'FRAGEN ZUM EINSTIEG',
      '[fr] Questions pour commencer',
      '• Wo haben Sie schon gearbeitet? [fr] Où avez-vous déjà travaillé ?',
      '• Was ist Ihnen bei einer Stelle wichtig: das Gehalt, die Kollegen oder die Arbeitszeiten? [fr] Qu’est-ce qui compte pour vous dans un poste : le salaire, les collègues ou les horaires ?',
      '• Wie bereiten Sie sich auf ein Vorstellungsgespräch vor? [fr] Comment vous préparez-vous à un entretien d’embauche ?',
      '',
      'DAS KÖNNEN SIE NACH DIESEM MODUL',
      '[fr] Ce que vous saurez faire après ce module',
      '• Ich kann eine Stellenanzeige verstehen. [fr] Je peux comprendre une offre d’emploi.',
      '• Ich kann meine Kenntnisse mit einem Beispiel vorstellen. [fr] Je peux présenter mes compétences avec un exemple.',
      '• Ich kann im Gespräch höflich Fragen stellen. [fr] Je peux poser des questions polies pendant un entretien.',
      '',
      'WICHTIGE WÖRTER',
      '[fr] Mots-clés',
      '• die Stellenanzeige — l’offre d’emploi',
      '• sich bewerben um + Akk. — postuler à',
      '• die Berufserfahrung — l’expérience professionnelle',
      '• die Kenntnisse — les connaissances, les compétences',
      '• in Vollzeit, in Teilzeit — à temps plein, à temps partiel',
      '• die Probezeit — la période d’essai',
      '• das Gehalt — le salaire',
      '• der Kollege, die Kollegin — le collègue, la collègue',
    ].join('\n') },
    transcript: null, questions: [],
  },
  'b1-arbeit-lesen': {
    lesson: { title: 'Eine Stellenanzeige — Une offre d’emploi', description: [
      B1_C.lesen,
      '',
      'STRATEGIE',
      '[fr] Stratégie',
      'Lesen Sie zuerst nur die Überschrift und die erste Zeile: Welche Stelle wird angeboten?',
      '[fr] Lisez d’abord seulement le titre et la première ligne : quel poste est proposé ?',
      'Lesen Sie dann die Fragen und suchen Sie die Antworten im Text.',
      '[fr] Lisez ensuite les questions et cherchez les réponses dans le texte.',
      '',
      'Biomarkt am Lindenplatz, Leipzig: Wir suchen eine Verkäuferin oder einen Verkäufer (m/w/d) in Teilzeit.',
      'Wir sind ein kleiner Biomarkt im Leipziger Westen und suchen ab dem 1. März Verstärkung für unser Team.',
      'Bei uns beraten Sie unsere Kundinnen und Kunden, räumen Waren ein und arbeiten an der Kasse.',
      'Sie haben Erfahrung im Verkauf, sprechen gut Deutsch und arbeiten gern im Team. Kenntnisse über Bio-Produkte sind ein Plus, aber keine Voraussetzung.',
      'Wir bieten Ihnen 25 Stunden pro Woche, feste Arbeitszeiten von Montag bis Freitag, eine Probezeit von drei Monaten und 10 % Rabatt auf unsere Produkte.',
      'Interessiert? Dann schicken Sie Ihre Bewerbung mit Lebenslauf bis zum 15. Februar per E-Mail an Frau Keller: bewerbung@biomarkt-lindenplatz.example',
    ].join('\n') },
    transcript: null,
    questions: [
      choice('q1', bi('Was sucht der Biomarkt?', 'Que cherche le magasin bio ?'),
        'La première ligne annonce « eine Verkäuferin oder einen Verkäufer (m/w/d) in Teilzeit » : un poste de vente à temps partiel (25 heures par semaine). La caisse n’est qu’une des tâches, et le poste n’est pas à temps plein. « m/w/d » (männlich, weiblich, divers) figure dans toutes les offres allemandes.', [
          ['eine Kassiererin oder einen Kassierer in Vollzeit', false, 'Le travail en caisse est une des tâches, mais le poste est à temps partiel (« in Teilzeit », 25 heures).'],
          ['eine Verkäuferin oder einen Verkäufer in Teilzeit', true, null],
          ['eine Auszubildende oder einen Auszubildenden', false, 'L’annonce ne parle pas de formation (Ausbildung) : elle demande de l’expérience dans la vente.'],
        ]),
      richtigFalsch('q2', 'Man muss Erfahrung mit Bio-Produkten haben.', 1,
        'Faux : « Kenntnisse über Bio-Produkte sind ein Plus, aber keine Voraussetzung » : c’est un atout, pas une condition (Voraussetzung). Ce n’est pas « non mentionné », puisque le texte en parle.'),
      richtigFalsch('q3', 'Die Arbeitszeiten sind jede Woche anders.', 1,
        'Faux : l’annonce promet des « feste Arbeitszeiten von Montag bis Freitag », des horaires fixes du lundi au vendredi.'),
      richtigFalsch('q4', 'Neue Mitarbeiter bekommen ein Monatsticket für Bus und Bahn.', 2,
        'Non mentionné : l’employeur offre 10 % de réduction sur les produits, mais le texte ne dit rien d’un abonnement de transport. « Faux » serait trop fort : le texte ne dit pas non plus le contraire.'),
      typed('q5', 'fill', bi('Ergänzen Sie die Angaben aus der Anzeige.', 'Complétez avec les informations de l’annonce.'),
        '« 25 Stunden pro Woche » ; « eine Probezeit von drei Monaten » devient ici « drei Monate » (accusatif de durée après « dauert ») ; « per E-Mail ». Les nombres peuvent s’écrire en chiffres ou en lettres.',
        { text: 'Die Stelle hat [[1]] Stunden pro Woche. Die Probezeit dauert drei [[2]]. Man schickt die Bewerbung per [[3]].',
          blanks: [{ id: '1', accept: ['25', 'fünfundzwanzig'], size: 6, hint: null }, { id: '2', accept: ['Monate'], size: 8, hint: null },
            { id: '3', accept: ['E-Mail', 'Mail', 'Email'], size: 7, hint: null }] }),
      typed('q6', 'match', bi('Ordnen Sie zu: Was bedeuten die Wörter aus der Anzeige?', 'Associez chaque mot de l’annonce à son explication.'),
        '« Teilzeit » : moins d’heures qu’un poste complet ; « Probezeit » : les premiers mois dans un nouveau poste ; « Voraussetzung » : ce qu’il faut absolument avoir ; « Verstärkung » : une personne de plus pour l’équipe.',
        { pairs: [{ left: 'die Teilzeit', right: 'weniger Stunden als eine volle Stelle' }, { left: 'die Probezeit', right: 'die ersten Monate in einer neuen Stelle' },
          { left: 'die Voraussetzung', right: 'etwas, das man unbedingt haben muss' }, { left: 'die Verstärkung', right: 'eine neue Person für das Team' }] }),
    ],
  },
  'b1-arbeit-regel': {
    lesson: { title: 'Höflich fragen — Demander poliment', description: [
      'À RETENIR',
      '• Pour demander poliment : Könnten Sie …? Würden Sie …? Ich hätte gern … Wäre es möglich, …?',
      '• Le Konjunktiv II de politesse : können → könnte, haben → hätte, sein → wäre ; pour les autres verbes, würde + infinitif à la fin.',
      '• Question indirecte avec un mot interrogatif : …, wann, wo, wie lange + sujet + compléments + verbe conjugué à la fin.',
      '• Question indirecte sans mot interrogatif (réponse oui ou non) : …, ob + sujet + compléments + verbe conjugué à la fin.',
      '',
      'EXEMPLES',
      '• Können Sie mir helfen? → Könnten Sie mir helfen?',
      '• Wann beginnt das Gespräch? → Könnten Sie mir sagen, wann das Gespräch beginnt?',
      '• Ist die Stelle noch frei? → Ich möchte wissen, ob die Stelle noch frei ist.',
      '',
      'ATTENTION',
      '« ob » traduit le « si » d’une question indirecte. « wenn » exprime une condition ou une répétition : « Ich möchte wissen, wenn … » est faux.',
    ].join('\n') },
    transcript: null, questions: [],
  },
  'b1-arbeit-grammatik': {
    lesson: { title: 'Höfliche und indirekte Fragen — Questions polies et indirectes', description: [
      'Ergänzen Sie und bilden Sie Sätze. [fr] Complétez et formez des phrases.',
      '',
      'RAPPEL',
      '• Könnten Sie …? Würden Sie …? Ich hätte gern … Es wäre schön, wenn …',
      '• Question indirecte : le verbe conjugué va à la fin (…, wann das Gespräch beginnt).',
      '• Sans mot interrogatif : ob (…, ob die Stelle noch frei ist).',
    ].join('\n') },
    transcript: null,
    questions: [
      typed('g1', 'fill', bi('Ergänzen Sie die höfliche Form.', 'Complétez avec la forme polie.'),
        '« Könnten Sie … ? » (ou « Würden Sie … ? ») rend la demande polie ; l’infinitif « schicken » reste à la fin. « Ich hätte gern … » est la forme polie de « Ich will … » : « hätte » est le Konjunktiv II de « haben ».',
        { text: '[[1]] Sie mir bitte die Adresse schicken? Ich [[2]] gern mehr Informationen über die Stelle.',
          blanks: [{ id: '1', accept: ['Könnten', 'Würden'], size: 9, hint: 'können' }, { id: '2', accept: ['hätte'], size: 7, hint: 'haben' }] }),
      typed('g2', 'order', bi('Bilden Sie eine indirekte Frage.', 'Formez une question indirecte.'),
        'Dans une question indirecte, le mot interrogatif « wann » ouvre la subordonnée et le verbe conjugué « beginnt » va à la fin. Erreur fréquente : garder l’ordre de la question directe (« wann beginnt das Gespräch »).',
        { answers: [['Könnten Sie mir sagen,', 'wann', 'das', 'Gespräch', 'beginnt?']] }),
      typed('g3', 'order', bi('Bilden Sie eine indirekte Frage mit „ob“.', 'Formez une question indirecte avec « ob ».'),
        'La question directe « Ist die Stelle noch frei? » n’a pas de mot interrogatif : la question indirecte commence par « ob » (si) et le verbe « ist » passe à la fin.',
        { answers: [['Ich möchte wissen,', 'ob', 'die', 'Stelle', 'noch', 'frei', 'ist.']] }),
      choice('g4', bi('Welche Frage ist höflich und richtig?', 'Quelle question est polie et correcte ?'),
        'Après « Könnten Sie mir sagen, … », la question devient indirecte : le verbe conjugué « muss » va à la fin. La deuxième phrase garde l’ordre de la question directe ; la troisième est un ordre, peu poli en entretien.', [
          ['Könnten Sie mir sagen, wo ich mich anmelden muss?', true, null],
          ['Könnten Sie mir sagen, wo muss ich mich anmelden?', false, 'Dans la question indirecte, le verbe conjugué « muss » se place à la fin.'],
          ['Sagen Sie mir, wo ich mich anmelden muss!', false, 'La phrase est correcte, mais c’est un ordre : en entretien, on demande au Konjunktiv II.'],
        ]),
      typed('g5', 'fill', bi('Ergänzen Sie „wäre“ oder „würde“.', 'Complétez avec « wäre » ou « würde ».'),
        '« Es wäre schön, wenn … » (ce serait bien si…) : « wäre » est le Konjunktiv II de « sein ». « Ich würde gern … arbeiten » exprime un souhait poli : « würde » + infinitif à la fin.',
        { text: 'Es [[1]] schön, wenn ich am Montag anfangen könnte. Ich [[2]] auch gern im Team arbeiten.',
          blanks: [{ id: '1', accept: ['wäre'], size: 7, hint: null }, { id: '2', accept: ['würde'], size: 7, hint: null }] }),
      choice('g6', bi('Was passt? „Ich ___ gern einen Termin am Vormittag.“', 'Qu’est-ce qui convient ?'),
        '« Ich hätte gern + accusatif » demande poliment quelque chose (ici, un rendez-vous). « würde » demande un infinitif (Ich würde gern … kommen) et « wäre » ne prend pas de complément d’objet.', [
          ['würde', false, '« würde » s’emploie avec un infinitif à la fin : « Ich würde gern am Vormittag kommen. »'],
          ['hätte', true, null],
          ['wäre', false, '« wäre » (serait) ne peut pas avoir « einen Termin » comme complément d’objet.'],
        ]),
    ],
  },
  'b1-arbeit-redemittel': {
    lesson: { title: 'Im Vorstellungsgespräch — En entretien', description: [
      B1_C.sprechen,
      'Diese Sätze helfen Ihnen im Vorstellungsgespräch. [fr] Ces phrases vous aideront pendant l’entretien.',
    ].join('\n') },
    transcript: null,
    questions: [
      bSpeak('r1', 'Ich habe drei Jahre Erfahrung im Verkauf.',
        '« Erfahrung » s’emploie ici sans article. L’accent tombe sur « fah » : Er-FAH-rung. Le nombre peut aussi être reconnu en chiffres.',
        ['Ich habe drei Jahre Erfahrung im Verkauf.', 'Ich habe 3 Jahre Erfahrung im Verkauf.']),
      bSpeak('r2', 'Ich arbeite gern im Team und bin zuverlässig.',
        '« zuverlässig » (fiable) : le « z » se prononce [ts] et l’accent tombe sur la première syllabe, ZU-verlässig.'),
      bSpeak('r3', 'Könnten Sie mir sagen, wann die Probezeit endet?',
        'Question indirecte polie : « wann » ouvre la subordonnée et le verbe « endet » va à la fin. Faites monter la voix sur la fin de la question.'),
      bSpeak('r4', 'Wäre es möglich, schon im März anzufangen?',
        '« anzufangen » : avec un verbe séparable, « zu » se place entre la particule et le verbe (an-zu-fangen).'),
      bSpeak('r5', 'Ich würde mich sehr freuen, von Ihnen zu hören.',
        'Formule de fin d’entretien ou de courriel. « würde » + infinitif à la fin : « freuen » ; « mich » est le pronom réfléchi de « sich freuen ».'),
    ],
  },
  'b1-arbeit-atelier-schreiben': {
    lesson: { title: 'Bewerbung per E-Mail — Candidature par courriel', description: [
      'Sie haben die Anzeige des Biomarkts am Lindenplatz gelesen (Verkäufer/in in Teilzeit). Sie möchten sich um die Stelle bewerben.',
      '[fr] Vous avez lu l’annonce du magasin bio du Lindenplatz (vendeur ou vendeuse à temps partiel). Vous voulez postuler.',
      '',
      'Schreiben Sie eine E-Mail an Frau Keller (120 bis 150 Wörter).',
      '[fr] Écrivez un courriel à Mme Keller (120 à 150 mots).',
      '• Warum schreiben Sie? [fr] Pourquoi écrivez-vous ?',
      '• Welche Erfahrung haben Sie? Nennen Sie ein Beispiel. [fr] Quelle expérience avez-vous ? Donnez un exemple.',
      '• Warum passt die Stelle zu Ihnen? [fr] Pourquoi le poste vous convient-il ?',
      '• Stellen Sie eine höfliche Frage, zum Beispiel zur Probezeit. [fr] Posez une question polie, par exemple sur la période d’essai.',
      '',
      'Achten Sie auf Anrede und Gruß: Sie schreiben formell.',
      '[fr] Soignez la formule d’appel et la formule finale : vous écrivez dans un registre formel.',
    ].join('\n') },
    transcript: null, questions: [],
    mission: {
      oral: null,
      written: { prompt: bi('Schreiben Sie Ihre Bewerbung per E-Mail (120 bis 150 Wörter).', 'Écrivez votre candidature par courriel (120 à 150 mots).'),
        maxChars: 1500, minWords: 120 },
      checklist: [
        'J’ai salué Mme Keller avec une formule formelle (Sehr geehrte Frau Keller,).',
        'J’ai dit pourquoi j’écris et présenté une expérience avec un exemple.',
        'J’ai posé une question polie au Konjunktiv II (Könnten Sie …, Wäre es möglich, …).',
        'J’ai terminé par une formule finale (Mit freundlichen Grüßen) et relu la place du verbe.',
      ],
      criteria: B1_GRIDS.schreiben,
    },
  },
  'b1-arbeit-atelier-sprechen': {
    lesson: { title: 'Vorstellungsgespräch — Entretien d’embauche', description: [
      'Frau Keller ruft Sie an und stellt Ihnen drei Fragen. Antworten Sie in einer Aufnahme (etwa zwei Minuten).',
      '[fr] Mme Keller vous appelle et vous pose trois questions. Répondez dans un enregistrement (environ deux minutes).',
      '',
      '1. Erzählen Sie kurz etwas über sich. [fr] Présentez-vous brièvement.',
      '2. Warum möchten Sie bei uns arbeiten? [fr] Pourquoi voulez-vous travailler chez nous ?',
      '3. Haben Sie noch Fragen an uns? [fr] Avez-vous des questions à nous poser ?',
    ].join('\n') },
    transcript: null, questions: [],
    mission: {
      oral: { prompt: bi('Nehmen Sie Ihre Antworten auf (höchstens zweieinhalb Minuten).', 'Enregistrez vos réponses (deux minutes et demie au plus).'), maxSeconds: 150 },
      written: null,
      checklist: [
        'Je me suis présenté(e) en quelques phrases : formation et expérience.',
        'J’ai donné deux raisons, reliées par « weil » ou « denn ».',
        'J’ai posé une question polie (Könnten Sie mir sagen, … ?).',
        'J’ai parlé de façon suivie, sans lire un texte.',
      ],
      criteria: B1_GRIDS.sprechen,
    },
  },
};

const B1_VOCABULARY: Record<string, MockVocabulary[]> = {
  'b1-arbeit': [
    word('stellenanzeige', 'Stellenanzeige', 'noun', 'l’offre d’emploi', 'Ich habe die Stellenanzeige gestern gelesen.', { article: 'die', plural: 'Stellenanzeigen' }),
    word('sich-bewerben', 'sich bewerben', 'verb', 'postuler', 'Ich bewerbe mich um die Stelle als Verkäufer.', { note: '+ um (accusatif) ; ich habe mich beworben' }),
    word('bewerbung', 'Bewerbung', 'noun', 'la candidature', 'Bitte schicken Sie Ihre Bewerbung per E-Mail.', { article: 'die', plural: 'Bewerbungen' }),
    word('lebenslauf', 'Lebenslauf', 'noun', 'le CV', 'Ich schicke Ihnen meinen Lebenslauf.', { article: 'der', plural: 'Lebensläufe' }),
    word('berufserfahrung', 'Berufserfahrung', 'noun', 'l’expérience professionnelle', 'Haben Sie Berufserfahrung im Verkauf?', { article: 'die' }),
    word('kenntnisse', 'Kenntnisse', 'noun', 'les connaissances, les compétences', 'Gute Deutschkenntnisse sind wichtig.',
      { note: 'presque toujours au pluriel : die Kenntnisse' }),
    word('vollzeit', 'Vollzeit', 'noun', 'le temps plein', 'Ich möchte nicht in Vollzeit arbeiten.', { article: 'die', note: 'in Vollzeit arbeiten' }),
    word('teilzeit', 'Teilzeit', 'noun', 'le temps partiel', 'Die Stelle ist in Teilzeit.', { article: 'die', note: 'in Teilzeit arbeiten' }),
    word('probezeit', 'Probezeit', 'noun', 'la période d’essai', 'Die Probezeit dauert drei Monate.', { article: 'die', plural: 'Probezeiten' }),
    word('gehalt', 'Gehalt', 'noun', 'le salaire', 'Das Gehalt kommt am Ende des Monats.', { article: 'das', plural: 'Gehälter' }),
    word('kollege', 'Kollege', 'noun', 'le collègue', 'Ich frage meinen Kollegen.', { article: 'der', plural: 'Kollegen', note: 'n-Deklination : den, dem, des Kollegen ; féminin : die Kollegin' }),
    word('vorstellungsgespraech', 'Vorstellungsgespräch', 'noun', 'l’entretien d’embauche', 'Morgen habe ich ein Vorstellungsgespräch.', { article: 'das', plural: 'Vorstellungsgespräche' }),
    word('zuverlaessig', 'zuverlässig', 'adjective', 'fiable', 'Ich bin pünktlich und zuverlässig.'),
    word('erfahrung-sammeln', 'Erfahrung sammeln', 'expression', 'acquérir de l’expérience', 'Ich habe im Hotel Erfahrung gesammelt.'),
    word('koennten-sie', 'Könnten Sie mir sagen, …?', 'expression', 'Pourriez-vous me dire… ?', 'Könnten Sie mir sagen, wann ich anfangen kann?',
      { note: 'question indirecte : le verbe conjugué va à la fin' }),
  ],
};

// Le niveau B1 rejoint les contenus du simulateur (réglages du plan B : révision 15 min, bilan 60, examen blanc 120).
CONTENT.push({ code: 'B1', settings: { reviewMinutes: 15, midtermMinutes: 60, finalMinutes: 120, passPercent: 60 }, modules: b1Modules() });
Object.assign(V4_DETAILS, B1_DETAILS);
Object.assign(VOCABULARY, B1_VOCABULARY);

// ---------------------------------------------------------------------------------------------------------------------
// Ciné-club (EVO-055) : un film par niveau publié (Nicos Weg A1, A2 et B1 de la Deutsche Welle, lus dans le lecteur
// YouTube officiel) avec deux séquences d'exemple chacun. Contextes, mots-clés, questions et explications sont des exemples
// originaux du simulateur, sans reprise de la DW ; les vrais contenus viennent de content/de/cine (lot Contenus).
// Léa (élève suivie) a fait la première séquence A1, noté quelques mots et reçu une proposition de Marie Weber.
// ---------------------------------------------------------------------------------------------------------------------

const keyword = (word: string, translation: string, article: FilmKeyword['article'] = null, plural: string | null = null, note: string | null = null): FilmKeyword =>
  ({ word, article, plural, translation, note });
const DW_CREDIT = 'Film : Nicos Weg, Deutsche Welle (Deutsch lernen mit der DW), lecteur YouTube';
const DW_LICENSE = 'Vidéo de la Deutsche Welle lue dans le lecteur officiel de YouTube, jamais copiée. Questions, résumés et explications : contenus LinguaCap originaux.';
const DW_COURSE = 'https://learngerman.dw.com/de/nicos-weg/c-36519687';

function cineFilm(level: LevelCode, videoId: string, minutes: number, description: string, sequences: Omit<FilmSequenceFields, 'position'>[]): FilmRec {
  const id = `nicos-weg-${level.toLowerCase()}`;
  return {
    status: 'published', updatedAt: '2026-11-24T09:00:00.000Z', publishedAt: '2026-11-24T09:00:00.000Z',
    document: { format: 1, film: { id, languageId: 'de', levelId: level.toLowerCase(), title: `Nicos Weg ${level}`, description, provider: 'youtube', videoId,
      channel: 'Deutsch lernen mit der DW', videoUrl: `https://www.youtube.com/watch?v=${videoId}`, courseUrl: DW_COURSE, credit: DW_CREDIT,
      licenseNote: DW_LICENSE, durationSeconds: minutes * 60, position: 1 },
    sequences: sequences.map((sequence, index) => ({ ...sequence, position: index + 1 })) },
  };
}

function cineFilms(): FilmRec[] {
  return [
    cineFilm('A1', '4-eDoThe6qo', 103, 'Nico arrive en Allemagne sans connaître personne. Premières rencontres, premiers mots, premières démarches : suivez ses débuts en allemand très simple.', [
      { id: 'nicos-weg-a1-01', title: 'Hallo! · Bonjour !', start: 0, end: 420, approx: true,
        context: 'Nico kommt in Deutschland an. Er kennt hier niemanden. [fr] Nico arrive en Allemagne. Il ne connaît personne ici.\n• Was glauben Sie: Wer hilft Nico? [fr] À votre avis : qui va aider Nico ?\n• Hören Sie gut zu: Wie begrüßen sich die Personen? Wie stellen sie sich vor? [fr] Écoutez bien : comment les personnes se saluent-elles ? Comment se présentent-elles ?',
        keywords: [keyword('Hallo!', 'Salut ! Bonjour !'), keyword('heißen', 's’appeler', null, null, 'Ich heiße Nico.'), keyword('Name', 'le nom', 'der', 'Namen'),
          keyword('kommen aus', 'venir de', null, null, 'Ich komme aus Spanien.'), keyword('Stadt', 'la ville', 'die', 'Städte'), keyword('Entschuldigung!', 'Pardon ! Excusez-moi !')],
        questions: [
          choice('q1', 'Comment se présente-t-on le plus simplement en allemand ?',
            'Pour donner son prénom, on dit « Ich heiße … » (ou « Ich bin … »). « haben » signifie « avoir » et « aus » introduit l’origine.', [
              ['Ich heiße Nico.', true, null], ['Ich habe Nico.', false, '« haben » veut dire « avoir » : on ne l’emploie pas pour son nom.'],
              ['Ich bin aus Nico.', false, '« aus » introduit un pays ou une ville d’origine, pas un prénom.']]),
          typed('q2', 'fill', 'Complétez la présentation.', 'Avec « ich », le verbe se termine par -e : « ich heiße ». L’origine se dit avec « aus » : « Ich komme aus Spanien ».',
            { text: 'Ich [[1]] Nico. Ich komme [[2]] Spanien.', blanks: [{ id: '1', accept: ['heiße', 'heisse'], size: 7, hint: 'heißen' }, { id: '2', accept: ['aus'], size: 5, hint: null }] }),
          typed('q3', 'order', 'Remettez les mots dans l’ordre pour poser la question.',
            'Question avec un mot interrogatif : « Woher » en 1re position, le verbe conjugué « kommst » en 2e, puis le sujet « du ».', { answers: [['Woher', 'kommst', 'du?']] }),
          typed('q4', 'match', 'Associez chaque formule à sa traduction.',
            'Les formules de base de la politesse : saluer (Guten Tag), prendre congé (Tschüss), s’excuser (Entschuldigung), remercier (Danke).',
            { pairs: [{ left: 'Guten Tag!', right: 'Bonjour !' }, { left: 'Tschüss!', right: 'Au revoir !' }, { left: 'Entschuldigung!', right: 'Pardon !' }, { left: 'Danke!', right: 'Merci !' }] }),
          choice('q5', 'Vous saluez une dame âgée que vous ne connaissez pas. Que dites-vous ?',
            '« Guten Tag! » convient à tout le monde, à toute heure de la journée. « Hallo » reste familier et « Tschüss » sert à prendre congé.', [
              ['Guten Tag!', true, null], ['Hallo, du!', false, 'Trop familier : on ne tutoie pas une personne âgée inconnue.'],
              ['Tschüss!', false, '« Tschüss » se dit en partant, pas en arrivant.']]),
        ] },
      { id: 'nicos-weg-a1-02', title: 'Wo ist …? · Où est… ?', start: 420, end: 930, approx: true,
        context: 'Nico sucht seinen Weg in der Stadt. Er fragt Leute auf der Straße. [fr] Nico cherche son chemin en ville. Il interroge des passants.\n• Wie fragt man höflich nach dem Weg? [fr] Comment demande-t-on poliment son chemin ?\n• Achten Sie auf die Wörter links, rechts und geradeaus. [fr] Repérez les mots « à gauche », « à droite » et « tout droit ».',
        keywords: [keyword('wo', 'où'), keyword('links', 'à gauche'), keyword('rechts', 'à droite'), keyword('geradeaus', 'tout droit'),
          keyword('Straße', 'la rue', 'die', 'Straßen'), keyword('Bahnhof', 'la gare', 'der', 'Bahnhöfe')],
        questions: [
          choice('q1', 'Pour demander poliment son chemin à un inconnu, on commence par…',
            '« Entschuldigung » attire l’attention poliment avant une question. « Tschüss » termine une conversation et « Danke » remercie.', [
              ['Entschuldigung, …', true, null], ['Tschüss, …', false, '« Tschüss » sert à prendre congé.'], ['Danke, …', false, 'On remercie après la réponse, pas avant la question.']]),
          typed('q2', 'match', 'Associez chaque indication à sa traduction.', '« links » : à gauche, « rechts » : à droite, « geradeaus » : tout droit, « zurück » : en arrière.',
            { pairs: [{ left: 'links', right: 'à gauche' }, { left: 'rechts', right: 'à droite' }, { left: 'geradeaus', right: 'tout droit' }, { left: 'zurück', right: 'en arrière' }] }),
          typed('q3', 'fill', 'Complétez la question.', '« wo » demande le lieu où se trouve quelque chose : « Wo ist der Bahnhof? ». « woher » demande l’origine.',
            { text: 'Entschuldigung, [[1]] ist der Bahnhof?', blanks: [{ id: '1', accept: ['wo'], size: 5, hint: 'où' }] }),
          typed('q4', 'order', 'Remettez la réponse dans l’ordre.', 'À l’impératif de politesse, le verbe vient en premier, suivi de « Sie » : « Gehen Sie hier links. ».',
            { answers: [['Gehen', 'Sie', 'hier', 'links.']] }),
          choice('q5', 'Que signifie « Das weiß ich leider nicht » ?',
            '« leider » signifie « malheureusement » et « nicht » porte la négation : la personne ne connaît pas le chemin.', [
              ['Malheureusement, je ne sais pas.', true, null], ['Je le sais très bien.', false, '« nicht » marque la négation.'],
              ['C’est tout près d’ici.', false, 'Il n’y a ici aucune indication de lieu.']]),
        ] },
    ]),
    cineFilm('A2', 'Lg5P2w_Ro1c', 111, 'Nico trouve ses repères : travail, collègues, projets. Une langue du quotidien, plus riche, pour parler de soi et de son avenir.', [
      { id: 'nicos-weg-a2-01', title: 'Ein neuer Job · Un nouveau travail', start: 0, end: 480, approx: true,
        context: 'Nico sucht Arbeit und schreibt Bewerbungen. Bald hat er ein Vorstellungsgespräch. [fr] Nico cherche du travail et envoie des candidatures. Il a bientôt un entretien d’embauche.\n• Welche Fragen stellt man in einem Vorstellungsgespräch? [fr] Quelles questions pose-t-on lors d’un entretien d’embauche ?\n• Achten Sie darauf, wie Nico über seine Erfahrung spricht. [fr] Repérez comment Nico parle de son expérience.',
        keywords: [keyword('Bewerbung', 'la candidature', 'die', 'Bewerbungen'), keyword('sich bewerben um', 'postuler à', null, null, 'Ich bewerbe mich um die Stelle.'),
          keyword('Lebenslauf', 'le CV', 'der', 'Lebensläufe'), keyword('Vorstellungsgespräch', 'l’entretien d’embauche', 'das', 'Vorstellungsgespräche'),
          keyword('Erfahrung', 'l’expérience', 'die', 'Erfahrungen'), keyword('Stelle', 'le poste', 'die', 'Stellen')],
        questions: [
          choice('q1', 'Que signifie « sich bewerben » ?', '« sich bewerben (um) » : postuler à un poste. Ne le confondez pas avec « sich beschweren » (se plaindre).', [
            ['postuler à un emploi', true, null], ['se plaindre', false, 'Se plaindre se dit « sich beschweren ».'], ['s’habiller', false, 'S’habiller se dit « sich anziehen ».']]),
          typed('q2', 'fill', 'Complétez avec le verbe « sich bewerben ».', 'Verbe pronominal : « ich bewerbe mich ». Le « e » du radical reste : bewerb-e.',
            { text: 'Ich [[1]] mich um die Stelle als Mechaniker.', blanks: [{ id: '1', accept: ['bewerbe'], size: 9, hint: 'sich bewerben' }] }),
          typed('q3', 'order', 'Remettez les mots dans l’ordre.', 'Dans la subordonnée introduite par « weil », le verbe conjugué « brauche » passe à la fin.',
            { answers: [['Ich', 'suche', 'Arbeit,', 'weil', 'ich', 'Geld', 'brauche.']] }),
          typed('q4', 'match', 'Associez chaque mot à sa traduction.', 'Le vocabulaire de la recherche d’emploi : CV, candidature, salaire et poste.',
            { pairs: [{ left: 'der Lebenslauf', right: 'le CV' }, { left: 'die Bewerbung', right: 'la candidature' }, { left: 'das Gehalt', right: 'le salaire' }, { left: 'die Stelle', right: 'le poste' }] }),
          choice('q5', 'Lors d’un entretien, quelle question est polie et adaptée ?',
            'Le subjonctif « könnte » rend la demande polie et la question porte sur le travail. Les deux autres sont familières ou déplacées.', [
              ['Wann könnte ich anfangen?', true, null], ['Was willst du von mir?', false, 'Le tutoiement et le ton sont déplacés en entretien.'],
              ['Wie alt bist du?', false, 'Question personnelle et tutoiement : à éviter face à un recruteur.']]),
        ] },
      { id: 'nicos-weg-a2-02', title: 'In der Werkstatt · À l’atelier', start: 480, end: 1020, approx: true,
        context: 'Nico arbeitet in einer Werkstatt. Er lernt neue Kollegen und viele neue Wörter kennen. [fr] Nico travaille dans un atelier. Il fait la connaissance de nouveaux collègues et apprend beaucoup de mots.\n• Welche Werkzeuge kennen Sie schon auf Deutsch? [fr] Quels outils connaissez-vous déjà en allemand ?\n• Wer erklärt Nico die Arbeit? [fr] Qui explique le travail à Nico ?',
        keywords: [keyword('Werkstatt', 'l’atelier', 'die', 'Werkstätten'), keyword('Werkzeug', 'l’outil', 'das', 'Werkzeuge'), keyword('reparieren', 'réparer'),
          keyword('Kollege', 'le collègue', 'der', 'Kollegen'), keyword('pünktlich', 'à l’heure, ponctuel'), keyword('Feierabend', 'la fin de la journée de travail', 'der')],
        questions: [
          choice('q1', 'Que fait-on dans une « Werkstatt » ?', '« die Werkstatt » est un atelier : on y fabrique ou on y répare des objets et des véhicules.', [
            ['On répare des objets ou des véhicules.', true, null], ['On achète des vêtements.', false, 'Un magasin de vêtements se dit « das Bekleidungsgeschäft ».'],
            ['On réserve une chambre.', false, 'On réserve une chambre à l’hôtel (« das Hotel »).']]),
          typed('q2', 'fill', 'Complétez la demande.', 'Avec un verbe de modalité (« kannst »), l’infinitif « geben » va à la fin de la phrase.',
            { text: 'Kannst du mir das Werkzeug [[1]]?', blanks: [{ id: '1', accept: ['geben'], size: 7, hint: 'donner' }] }),
          typed('q3', 'match', 'Associez chaque verbe à sa traduction.', 'Quatre verbes utiles au travail : réparer, commencer, arrêter, aider.',
            { pairs: [{ left: 'reparieren', right: 'réparer' }, { left: 'anfangen', right: 'commencer' }, { left: 'aufhören', right: 'arrêter' }, { left: 'helfen', right: 'aider' }] }),
          typed('q4', 'order', 'Remettez les mots dans l’ordre.', 'Le verbe de modalité « muss » est en 2e position, l’infinitif « sein » à la fin.',
            { answers: [['Ich', 'muss', 'morgen', 'pünktlich', 'sein.']] }),
          choice('q5', '« Feierabend! » signifie…', '« der Feierabend » désigne la fin de la journée de travail. Le piège : « die Feier » (la fête).', [
            ['C’est la fin de la journée de travail !', true, null], ['C’est la fête !', false, '« Feier » ressemble à « fête », mais « Feierabend » désigne la fin du travail.'],
            ['Bon appétit !', false, 'Bon appétit se dit « Guten Appetit! ».']]),
        ] },
    ]),
    cineFilm('B1', 'LkufozluseI', 113, 'Nico construit sa vie en Allemagne : formation, logement, décisions. Des échanges plus longs et plus nuancés, au rythme de la vie courante.', [
      { id: 'nicos-weg-b1-01', title: 'Neue Pläne · De nouveaux projets', start: 0, end: 540, approx: true,
        context: 'Nico hat in Deutschland Fuß gefasst. Jetzt denkt er über seine berufliche Zukunft nach. [fr] Nico a pris ses marques en Allemagne. Il réfléchit maintenant à son avenir professionnel.\n• Welche Entscheidungen muss man treffen, wenn man eine Ausbildung beginnt? [fr] Quelles décisions faut-il prendre quand on commence une formation ?\n• Achten Sie auf Sätze mit „wenn“ und „obwohl“. [fr] Repérez les phrases avec « wenn » et « obwohl ».',
        keywords: [keyword('Zukunft', 'l’avenir', 'die'), keyword('sich entscheiden', 'se décider'), keyword('Vertrag', 'le contrat', 'der', 'Verträge'),
          keyword('Prüfung', 'l’examen', 'die', 'Prüfungen'), keyword('Fuß fassen', 'prendre ses marques, s’installer'), keyword('Herausforderung', 'le défi', 'die', 'Herausforderungen')],
        questions: [
          choice('q1', 'Was bedeutet „Fuß fassen“? [fr] Que signifie « Fuß fassen » ?', '« Fuß fassen » : trouver sa place quelque part, s’y installer durablement. Rien à voir avec la marche (« zu Fuß gehen »).', [
            ['sich einleben und eine sichere Position finden', true, null], ['zu Fuß gehen', false, '« zu Fuß gehen » veut dire « aller à pied ».'],
            ['jemanden festhalten', false, '« festhalten » signifie « retenir, tenir fermement ».']]),
          typed('q2', 'fill', 'Ergänzen Sie den passenden Konnektor. [fr] Complétez avec le connecteur qui convient.',
            '« obwohl » (bien que) introduit une concession : on va au cours malgré la fatigue. « weil » donnerait une cause, ce qui n’a pas de sens ici.',
            { text: '[[1]] ich müde bin, gehe ich heute noch zum Kurs.', blanks: [{ id: '1', accept: ['Obwohl'], size: 8, hint: null }] }),
          typed('q3', 'order', 'Bilden Sie einen Satz. [fr] Formez une phrase.', 'La subordonnée en « wenn » vient en tête : le verbe principal « mache » suit immédiatement la virgule, avant le sujet.',
            { answers: [['Wenn', 'ich', 'die', 'Prüfung', 'bestehe,', 'mache', 'ich', 'eine', 'Reise.']] }),
          typed('q4', 'match', 'Ordnen Sie zu. [fr] Associez.', '« eine Prüfung bestehen » : réussir un examen ; « kündigen » : démissionner ou résilier ; « unterschreiben » : signer.',
            { pairs: [{ left: 'sich entscheiden', right: 'se décider' }, { left: 'eine Prüfung bestehen', right: 'réussir un examen' },
              { left: 'unterschreiben', right: 'signer' }, { left: 'kündigen', right: 'démissionner' }] }),
          choice('q5', 'Welcher Satz ist höflich, um um einen Termin zu bitten? [fr] Quelle phrase est polie pour demander un rendez-vous ?',
            'Le subjonctif II « Hätten Sie … ? » formule une demande polie. « Ich will » et l’impératif sont trop directs.', [
              ['Hätten Sie nächste Woche Zeit für ein Gespräch?', true, null], ['Ich will morgen einen Termin.', false, '« Ich will » paraît exigeant.'],
              ['Gib mir einen Termin!', false, 'L’impératif tutoyé est impoli dans ce contexte.']]),
        ] },
      { id: 'nicos-weg-b1-02', title: 'Wohnungssuche · Chercher un logement', start: 540, end: 1110, approx: true,
        context: 'Nico sucht eine neue Wohnung. In einer großen Stadt ist das nicht einfach. [fr] Nico cherche un nouveau logement. Dans une grande ville, ce n’est pas simple.\n• Welche Unterlagen braucht man für eine Wohnungsbewerbung? [fr] De quels documents a-t-on besoin pour candidater à un logement ?\n• Was ist Ihnen bei einer Wohnung wichtig? [fr] Qu’est-ce qui compte pour vous dans un logement ?',
        keywords: [keyword('Miete', 'le loyer', 'die', 'Mieten'), keyword('Kaution', 'la caution', 'die', 'Kautionen'), keyword('Vermieter', 'le bailleur', 'der', 'Vermieter'),
          keyword('Besichtigung', 'la visite', 'die', 'Besichtigungen'), keyword('Nebenkosten', 'les charges', null, null, 'Toujours au pluriel : die Nebenkosten.'), keyword('möbliert', 'meublé')],
        questions: [
          choice('q1', 'Was sind „Nebenkosten“? [fr] Que sont les « Nebenkosten » ?', 'Les « Nebenkosten » sont les charges : eau, chauffage, ordures, s’ajoutant au loyer de base (« Kaltmiete »).', [
            ['Kosten für Wasser, Heizung und Müll, zusätzlich zur Miete', true, null], ['die Kosten für einen Umzug', false, 'Les frais de déménagement sont des « Umzugskosten ».'],
            ['eine Strafe für zu spätes Zahlen', false, 'Une pénalité de retard se dit « die Mahngebühr ».']]),
          typed('q2', 'fill', 'Ergänzen Sie die Präposition. [fr] Complétez avec la préposition.', '« sich interessieren für » + accusatif : « Ich interessiere mich für die Wohnung ».',
            { text: 'Ich interessiere mich [[1]] die Wohnung in der Lindenstraße.', blanks: [{ id: '1', accept: ['für', 'fuer'], size: 5, hint: null }] }),
          typed('q3', 'match', 'Ordnen Sie zu. [fr] Associez.', 'Le vocabulaire de la location : caution, visite, bail et loyer charges comprises (« Warmmiete »).',
            { pairs: [{ left: 'die Kaution', right: 'la caution' }, { left: 'die Besichtigung', right: 'la visite' }, { left: 'der Mietvertrag', right: 'le bail' },
              { left: 'die Warmmiete', right: 'le loyer charges comprises' }] }),
          typed('q4', 'order', 'Bilden Sie eine höfliche Frage. [fr] Formez une question polie.', 'Question indirecte : après « Könnten Sie mir sagen, », le mot interrogatif « wann » ouvre une subordonnée et le verbe « ist » passe à la fin.',
            { answers: [['Könnten', 'Sie', 'mir', 'sagen,', 'wann', 'die', 'Besichtigung', 'ist?']] }),
          choice('q5', '„Die Wohnung ist schon vergeben.“ bedeutet… [fr] « Die Wohnung ist schon vergeben. » signifie…', '« vergeben » signifie ici « attribué » : quelqu’un d’autre a obtenu le logement. Le piège : « geben » (donner) ne veut pas dire « gratuit ».', [
            ['Jemand anderes hat die Wohnung schon bekommen.', true, null], ['Die Wohnung ist kostenlos.', false, 'Gratuit se dit « kostenlos » ou « umsonst ».'],
            ['Die Wohnung ist schon renoviert.', false, 'Rénové se dit « renoviert ».']]),
        ] },
    ]),
  ];
}

/** Léa : première séquence A1 faite (une erreur), trois mots notés (film, cours, saisie libre) et une proposition de Marie Weber. */
function seedCine() {
  const store = current as State;
  const lea = userById(IDS.suivi) as UserRec;
  const lessonId = cineLessonId('nicos-weg-a1-01');
  const questions = sequenceOf('nicos-weg-a1-01')?.sequence.questions ?? [];
  const result = gradeExercise(lea, { lessonId, roundId: fixedId(0x901), answers: cineAnswers(lessonId, questions, ['q4']) }, undefined);
  const grade = store.grades.find((item) => item.id === result.grade.id);
  if (grade) grade.submittedAt = at(addDays(today(), -2), 18);
  const word = (value: string, note: string, sourceKind: WordSourceKind, sourceId: string | null, daysAgo: number): WordRec => ({
    id: newId(), learnerId: lea.id, languageId: 'de', word: value, note, sourceKind, sourceId, createdAt: at(addDays(today(), -daysAgo), 18),
    updatedAt: at(addDays(today(), -daysAgo), 18),
  });
  store.words.push(
    word('Entschuldigung', 'pardon, excusez-moi', 'film', 'nicos-weg-a1-01', 2),
    word('Woher kommst du?', 'D’où viens-tu ?', 'film', 'nicos-weg-a1-01', 2),
    word('der Name', 'le nom (pl. die Namen)', 'activity', moduleWordSource(VERSIONS.A1.id, 'a1-hallo'), 5),
    word('gemütlich', 'confortable, chaleureux', 'manual', null, 1),
  );
  store.filmRecommendations.push({ id: fixedId(0x902), learnerId: lea.id, filmId: 'nicos-weg-a1', sequenceId: 'nicos-weg-a1-02', recommendedBy: IDS.weber,
    recommendedByRole: 'teacher', note: 'Pour réviser les indications de chemin avant notre prochaine séance.', createdAt: at(addDays(today(), -1), 9), dismissedAt: null });
}
