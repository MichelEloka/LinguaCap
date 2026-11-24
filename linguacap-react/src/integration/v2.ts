/*
 * Contrat JSON de l'incrément « Parcours » : langues, test de niveau, entraînement, parcours multi-niveaux,
 * contrats, ajouts de cours et bibliothèque. Les records Java sérialisent à l'identique : un champ facultatif
 * vaut `null` explicitement, il n'est jamais absent. Erreurs : `{ code, message }` (INVALID_INPUT 400,
 * FORBIDDEN 403, NOT_FOUND 404, CONFLICT 409).
 *
 * Ce module ne contient que des types et de petites aides de libellés : aucun appel réseau.
 * Les ajouts de la V4 (questions typées, missions, lexique) sont décrits dans v4.ts.
 */
import type { ActivityKind, QuestionView, ServedMission } from './v4';

// ---------------------------------------------------------------------------------------------------------------------
// Fondations
// ---------------------------------------------------------------------------------------------------------------------

export type LevelCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type StartLevel = 'A0' | LevelCode;
/** Disponibilité d'un jour de la semaine (1 = lundi … 7 = dimanche). */
export interface Day { weekday: number; sessions: number; minutes: number }
export interface CompetenceScore { correct: number; total: number; percent: number }
export interface ApiErrorBody { code: 'INVALID_INPUT' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | string; message: string }

export const levelCodes: readonly LevelCode[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const startLevels: readonly StartLevel[] = ['A0', ...levelCodes];

// ---------------------------------------------------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Niveau d'une langue au catalogue (GET /languages), dans l'ordre de `position`. Source de vérité de la disponibilité :
 * `published` (une version attribuable existe). L'échelle `levelCodes` ne dit jamais qu'un niveau est ouvert.
 */
export interface LanguageLevel {
  code: LevelCode; title: string; published: boolean; trackVersionId: string | null;
  plannedMinutes: number | null; moduleCount: number;
  /** Position au catalogue (1 = premier niveau) ; null si elle n'est pas renseignée (trié en dernier). */
  position: number | null;
  /** Niveau prérequis au catalogue (`A2` pour `B1`) ; null pour un premier niveau. */
  prerequisiteCode: LevelCode | null;
}
/** GET /languages (utilisateur connecté). */
export interface Language {
  id: string; name: string; nativeName: string; status: 'available' | 'coming_soon';
  position: number; placementAvailable: boolean; levels: LanguageLevel[];
  /** Codes des paliers de la banque de test publiée, dans l'ordre (`['A1','A2','B1']`) ; [] sans banque publiée. */
  placementTiers: LevelCode[];
}
/** Niveau publié d'une langue, vu sans compte (vitrine, connexion, pied de page). */
export interface PublicLanguageLevel {
  code: LevelCode; title: string;
  /** Position au catalogue ; null si elle n'est pas renseignée (trié en dernier). */
  position: number | null;
  moduleCount: number;
  /** Durée prévue de la version publiée (activités, révisions, bilan et examen blanc). */
  plannedMinutes: number | null;
}
/**
 * GET /public/languages (sans authentification, `Cache-Control: public, max-age=300`) : langues ayant au moins un
 * niveau publié, et leurs seuls niveaux publiés dans l'ordre de `position`. Une langue sans niveau publié est absente.
 */
export interface PublicLanguage {
  id: string; name: string; nativeName: string; position: number; levels: PublicLanguageLevel[];
}
export type PlacementTestStatus = 'draft' | 'published' | 'retired';
/** GET /catalogue/placement-tests */
export interface PlacementTestSummary {
  id: string; languageId: string; number: number; status: PlacementTestStatus;
  title: string; questionCount: number; updatedAt: string; publishedAt: string | null;
}
export interface PlacementPlacementContent {
  assetId: string; assetVersion: number; usage: 'audio' | 'illustration'; alt: string | null; caption: string | null;
  transcriptVisibility: 'hidden' | 'on_demand' | 'after_answer'; decorative: boolean;
}
export interface PlacementQuestionContent {
  id: string; competence: 'lecture' | 'ecoute'; moduleRef: string | null; prompt: string;
  options: { id: string; label: string; correct: boolean }[];
  placements: PlacementPlacementContent[];
}
export interface PlacementTierContent {
  code: LevelCode; title: string; passPercent: number; minCompetencePercent: number;
  drawCount: number; questions: PlacementQuestionContent[];
}
/** Corps de PUT /catalogue/placement-tests/{testId}. */
export interface PlacementTestContent { title: string; description: string; tiers: PlacementTierContent[] }
/** GET /catalogue/placement-tests/{testId}, réponse 201 de POST /catalogue/placement-tests. */
export interface PlacementTestDocument extends PlacementTestContent {
  id: string; languageId: string; number: number;
  status: PlacementTestStatus; updatedAt: string; publishedAt: string | null;
}
/** Contrôles de publication (forme `Checks` existante du catalogue). */
export interface Checks { publishable: boolean; issues: { path: string; message: string }[] }
/** Média publié avec une banque de test ou une version. */
export interface MediaRef { assetId: string; version: number }
/** Corps de POST /catalogue/placement-tests. */
export interface PlacementTestCreateRequest { languageId: string; fromTestId?: string }
/** Réponse de PUT /catalogue/placement-tests/{testId}. */
export interface PlacementTestSaved { test: PlacementTestDocument; checks: Checks }
/** Réponse de POST /catalogue/placement-tests/{testId}/publish. */
export interface PlacementTestPublished { test: PlacementTestSummary; media: MediaRef[] }
/** Ajout de l'incrément à GET /tracks (et à GET /v1/internal/tracks/{id}). */
export interface TrackLanguageFields { languageId: string }

// ---------------------------------------------------------------------------------------------------------------------
// Identités
// ---------------------------------------------------------------------------------------------------------------------

export type GradingDelayHours = 24 | 48 | 72 | 168;
export type CourseCreationMode = 'self' | 'linguacap';
export const gradingDelays: readonly GradingDelayHours[] = [24, 48, 72, 168];
export interface TeacherProfile {
  languages: string[]; levels: LevelCode[]; maxLearners: number | null;
  gradingDelayHours: GradingDelayHours | null; bio: string; onboardedAt: string | null;
  acceptingNewStudents: boolean | null; courseCreationMode: CourseCreationMode | null;
}
/** GET /me, PUT /me/language, PUT /me/teacher-profile. */
export interface CurrentProfileV2 {
  id: string; displayName: string; role: 'learner' | 'teacher' | 'admin' | 'staff';
  permissions: ('catalogue' | 'correction')[]; languageId: string | null; teacherId: string | null;
  teacherProfile: TeacherProfile | null;
}
/** Corps de PUT /me/language. */
export interface LanguageChoiceRequest { languageId: string }
/** Corps de PUT /me/teacher-profile. */
export interface TeacherProfileRequest {
  languages: string[]; levels: LevelCode[]; maxLearners?: number | null;
  gradingDelayHours?: GradingDelayHours | null; bio?: string;
  acceptingNewStudents: boolean; courseCreationMode: CourseCreationMode;
}
export interface TeacherOnboardingStats {
  teachers: number;
  byLanguage: Record<string, number>;
  byLevel: Record<string, number>;
  byAvailability: Record<'yes' | 'no' | 'unknown', number>;
  byCourseMode: Record<CourseCreationMode | 'unknown', number>;
  byMaxLearners: Record<string, number>;
  byGradingDelayHours: Record<string, number>;
  trend: { date: string; responses: number; accepting: number; notAccepting: number; self: number; linguacap: number }[];
}
/** GET /me/teacher (ou `null` pour un élève autonome). */
export interface TeacherCard { id: string; displayName: string; bio: string; gradingDelayHours: number | null; languages: string[] }
/** Ajouts de l'incrément aux lignes de GET /learners, /learners/{id} et GET/POST /invitations. */
export interface LanguageIdField { languageId: string | null }
/** Ajout au corps de POST /invitations. */
export interface InvitationLanguageRequest { languageId?: string }

// ---------------------------------------------------------------------------------------------------------------------
// Test de niveau
// ---------------------------------------------------------------------------------------------------------------------

export type PlacementCompetence = 'lecture' | 'ecoute';
export type PlacementAttemptStatus = 'in_progress' | 'completed' | 'abandoned';
/** Valeur de réponse « Je ne sais pas » (comptée fausse). */
export const PLACEMENT_DONT_KNOW = 'dontknow';
export interface PlacementTier {
  code: LevelCode; title: string; status: 'locked' | 'current' | 'passed' | 'failed';
  questionCount: number; passPercent: number; correct: number | null; total: number | null; percent: number | null;
  competences: Partial<Record<PlacementCompetence, CompetenceScore>> | null;
}
export interface PlacementQuestionPlacement {
  position: number; usage: 'audio' | 'illustration'; url: string | null; mimeType: string | null;
  alt: string | null; caption: string | null;
}
/**
 * Question du palier en cours, sans corrigé. `options` ne contient pas « Je ne sais pas » : l'interface l'ajoute et
 * envoie la valeur PLACEMENT_DONT_KNOW, que le serveur accepte et compte fausse.
 */
export interface PlacementQuestion {
  id: string; competence: PlacementCompetence; prompt: string;
  options: { id: string; text: string }[];
  placements: PlacementQuestionPlacement[];
}
export interface PlacementResult { placedLevel: StartLevel; label: string; summary: string; beyondTest: boolean; declaredBeginner: boolean }
/** GET /assessments/placements/{attemptId} ; POST, PUT answers et POST submit. Sans questions pour un tiers. */
export interface PlacementView {
  id: string; learnerId: string; languageId: string; testId: string | null; testNumber: number | null;
  status: PlacementAttemptStatus; currentTier: LevelCode | null; tiers: PlacementTier[];
  questions: PlacementQuestion[]; savedAnswers: Record<string, string>; result: PlacementResult | null;
  startedAt: string; completedAt: string | null; retakeAvailableAt: string | null;
}
/** GET /assessments/placements[?learnerId] */
export interface PlacementSummary {
  id: string; languageId: string; status: PlacementAttemptStatus;
  placedLevel: StartLevel | null; startedAt: string; completedAt: string | null;
}
/** Corps de POST /assessments/placements. */
export interface PlacementStartRequest { languageId?: string; restart?: boolean; declaredBeginner?: boolean }
/** Corps de PUT …/answers et de POST …/submit (avec l'en-tête Idempotency-Key) : `answers` = {questionId: optionId}. */
export interface PlacementAnswersRequest { tier: LevelCode; answers: Record<string, string> }

// ---------------------------------------------------------------------------------------------------------------------
// Entraînement (définition = celle d'ExamView sans corrigés ; answers = {partId: {questionId: optionId}})
// ---------------------------------------------------------------------------------------------------------------------

export type ExamKind = 'midterm' | 'final';
export interface PracticePart {
  id: string; competence: string; mode: 'closed' | 'written' | 'oral'; title: string; instructions: string;
  questions: { id: string; prompt: string; options: { id: string; label: string }[] }[];
  placements: { position: number; assetId: string; assetVersion: number; usage: 'audio' | 'illustration'; alt: string | null; caption: string | null }[];
  criteria: { id: string; label: string; maxPoints: number }[]; selfPractice: boolean;
}
export interface PracticeResult {
  percent: number; passed: boolean; parts: Record<string, { correct: number; total: number }>;
  competences: Record<string, CompetenceScore>;
}
/** GET /assessments/practice/{attemptId} ; POST, PUT answers et POST submit. */
export interface PracticeView {
  id: string; learnerId: string; trackVersionId: string; levelCode: LevelCode; kind: ExamKind;
  mode: 'practice'; status: 'in_progress' | 'submitted';
  definition: { title: string; description: string; levelCode: LevelCode; passPercent: number; parts: PracticePart[] };
  /** Réponses : {partId: {questionId: optionId}}. */
  answers: Record<string, Record<string, string>>;
  /** Adresses de lecture : clé « assetId@version » → url. */
  media: Record<string, string>;
  result: PracticeResult | null;
  startedAt: string; submittedAt: string | null; nextAttemptAt: string | null;
}
/** GET /assessments/practice */
export interface PracticeSummary {
  id: string; trackVersionId: string; levelCode: LevelCode; kind: ExamKind;
  status: 'in_progress' | 'submitted'; title: string; percent: number | null; startedAt: string; submittedAt: string | null;
}
/**
 * Corps de POST /assessments/practice. Seul le bilan intermédiaire (`midterm`) est proposé en entraînement libre :
 * l'examen de passage de niveau (`final`) est refusé avec un 409 explicite.
 */
export interface PracticeStartRequest { trackVersionId: string; kind: ExamKind }
/** Corps de PUT /assessments/practice/{attemptId}/answers. */
export interface PracticeAnswersRequest { answers: Record<string, Record<string, string>> }

// ---------------------------------------------------------------------------------------------------------------------
// Apprentissage : estimation, accueil, parcours, planning
// ---------------------------------------------------------------------------------------------------------------------

export type DifficultyCode = 'light' | 'moderate' | 'sustained' | 'intensive' | 'very_intensive' | 'unrealistic';
export interface Difficulty { code: DifficultyCode; label: string; requiredWeeklyMinutes: number }
export interface DifficultyBand {
  code: DifficultyCode; label: string; maxWeeklyMinutes: number | null;
  minWeeks: number | null; earliestTargetDate: string | null;
}
/** Corps de POST /learning/paths/estimate. */
export interface EstimateRequest {
  learnerId?: string; pathId?: string; startLevel?: StartLevel; targetLevel: LevelCode;
  startDate?: string; targetDate: string;
}
export interface EstimateLevel { levelCode: LevelCode; trackVersionId: string; plannedMinutes: number }
/** Réponse de POST /learning/paths/estimate. */
export interface Estimate {
  languageId: string; startLevel: StartLevel; targetLevel: LevelCode; startDate: string; targetDate: string;
  weeks: number; requiredMinutes: number; levels: EstimateLevel[];
  requiredWeeklyMinutes: number; requiredDailyMinutes: { fiveDays: number; sevenDays: number }; difficulty: Difficulty;
  bands: DifficultyBand[]; allowedTargets: LevelCode[]; minTargetDate: string; maxTargetDate: string; suggestedAvailability: Day[];
}
/** Durée conseillée d'un niveau publié pour un modèle de rythme (mois entiers, au moins 1). */
export interface TemplateDuration { levelCode: LevelCode; months: number; plannedMinutes: number }
/**
 * Élément de GET /learning/templates (modèles Standard et Intensif). `durations` : un élément par niveau publié, dans
 * l'ordre du catalogue. A1 et A2 gardent leurs durées calibrées ; tout autre niveau suit
 * `max(1, ceil(plannedMinutes × 1,10 / minutes par semaine du modèle / 4,345))`.
 */
export interface TemplateView {
  id: 'standard' | 'intensive'; name: string; description: string; days: Day[];
  durations: TemplateDuration[];
  /** @deprecated Durée ISO 8601 (`P5M`) du niveau A1 : lire `durations`. */
  a1Duration: string;
  /** @deprecated Durée ISO 8601 (`P5M`) du niveau A2 : lire `durations`. */
  a2Duration: string;
}

export type OnboardingStepId = 'language' | 'placement' | 'result' | 'objective' | 'days' | 'planning' | 'start';
export interface OnboardingStep { id: OnboardingStepId; status: 'done' | 'current' | 'todo' | 'skipped' | 'blocked' }
export type OnboardingBlockedReason = 'language_unavailable' | 'placement_unavailable' | 'no_target_available';
/** GET /learning/onboarding */
export interface OnboardingState {
  accompanied: boolean; languageId: string | null; languageLocked: boolean;
  teacher: { id: string; displayName: string } | null;
  placement: { attemptId: string; status: PlacementAttemptStatus; placedLevel: StartLevel | null; completedAt: string | null } | null;
  path: { id: string; status: 'draft' | 'active' | 'completed'; validatedRevision: number } | null;
  steps: OnboardingStep[]; completed: boolean;
  blockedReason: null | OnboardingBlockedReason;
}

/**
 * Accueil et parcours d'un élève lus en direct par Suivi auprès d'Apprentissage (EVO-039) : champ `learning` de
 * GET /tracking/overview (chaque élève) et GET /tracking/learners/{id}. `null` quand Apprentissage n'a pas répondu :
 * la vue reste servie avec la synthèse du Suivi. Le parcours est visible dès sa création, brouillon compris.
 */
export interface LearnerLearningState {
  learnerId: string; languageId: string | null;
  onboarding: {
    /** Mêmes étapes que GET /learning/onboarding ; `completed` : le parcours a démarré. */
    steps: OnboardingStep[]; completed: boolean; blockedReason: null | OnboardingBlockedReason;
    /** Dernière tentative du test de niveau ; `declaredBeginner` : « débutant déclaré », sans test. */
    placement: { attemptId: string; status: PlacementAttemptStatus; placedLevel: StartLevel | null; declaredBeginner: boolean; completedAt: string | null } | null;
  };
  /** Parcours ouvert (brouillon ou en cours), sinon le plus récent. Niveau, inscription et état : null pour un brouillon. */
  path: {
    id: string; status: Exclude<PathStatus, 'withdrawn'>; startLevel: StartLevel; targetLevel: LevelCode; targetDate: string;
    activeLevel: LevelCode | null; enrollmentId: string | null; goalStatus: string | null; validatedRevision: number; createdAt: string;
  } | null;
}
/** Corps de POST /learning/paths. */
export interface PathCreateRequest { placementAttemptId: string; targetLevel: LevelCode; startDate: string; targetDate: string; startLevel?: StartLevel }
/** Corps de PUT /learning/paths/{pathId}/objective (brouillon seulement). */
export interface ObjectiveRequest { targetLevel: LevelCode; startDate: string; targetDate: string; startLevel?: StartLevel }
/** Corps de PUT /learning/paths/{pathId}/availability (`targetDate` : brouillon seulement). */
export interface AvailabilityRequest { days: Day[]; targetDate?: string }
/** Corps de POST /learning/paths/{pathId}/proposal/validate. */
export interface ValidateProposalRequest { number: number }
/** Corps de POST /learning/paths/{pathId}/resume. */
export interface ResumeRequest { resumeDate: string }

/** V4 : `mission` en plus (activité remise au professeur). */
export type PlanItemKind = 'lesson' | 'exercise' | 'review' | 'assessment' | 'mission';
export interface PlanItem {
  id: string; kind: PlanItemKind; title: string; minutes: number;
  moduleId: string | null; levelCode: LevelCode | null; sourceVersionId: string | null; sourceActivityId: string | null; additionId: string | null;
}
export interface PlannedSession {
  date: string; slot: number; dueAt: string; title: string; moduleId: string; minutes: number;
  capacity: number; levelCode: LevelCode | null; items: PlanItem[];
}
export interface Suggestion {
  kind: 'minutes' | 'sessions' | 'days' | 'target_date'; label: string; availability: Day[];
  targetDate: string; requiresAmendment: boolean;
}
export interface LevelSpan {
  levelCode: LevelCode; stepPosition: number; firstDate: string | null; lastDate: string | null;
  minutes: number; sessionCount: number;
}
export type FeasibilityCode = 'comfortable' | 'tight' | 'insufficient';
export type BlockingReason = 'overflow' | 'objective_locked' | 'commitment' | 'not_allowed' | 'stale';
/** GET /learning/paths/{pathId}/proposal ; PUT availability ; POST resume. Sur-ensemble de l'ancienne `Proposal`. */
export interface PathProposal {
  number: number; baseRevision: number; status: 'proposed' | 'validated'; startDate: string;
  targetDate: string; availability: Day[]; capacityMinutes: number; requiredMinutes: number; overflowCount: number;
  createdAt: string; sessions: PlannedSession[]; overflow: PlanItem[];
  weeks: { start: string; availableMinutes: number; plannedMinutes: number }[]; suggestions: Suggestion[];
  validatable: boolean; pathId: string; difficulty: Difficulty;
  feasibility: { code: FeasibilityCode; loadPercent: number }; levels: LevelSpan[];
  blockingReason: null | BlockingReason;
}
export type PathStatus = 'draft' | 'active' | 'completed' | 'withdrawn';
export type PathStepStatus = 'planned' | 'active' | 'completed' | 'withdrawn';
export interface PathStep {
  id: string; position: number; levelCode: LevelCode; levelTitle: string; trackVersionId: string;
  trackVersionNumber: number; status: PathStepStatus; enrollmentId: string | null;
  goalStatus: string | null; plannedMinutes: number; firstDate: string | null; lastDate: string | null;
  sessionsTotal: number; sessionsCompleted: number; finalDecision: null | 'validated' | 'to_consolidate';
}
export type PathSessionStatus = 'planned' | 'in_progress' | 'completed' | 'late' | 'locked';
export interface PathSessionActivity {
  id: string; position: number; kind: string; title: string; estimatedMinutes: number;
  status: 'todo' | 'started' | 'completed'; completedAt: string | null; added: boolean;
}
/** Séance du parcours. Niveau futur : `id: null`, `locked: true`, `status: 'locked'` (projection, sans lien). */
export interface PathSession {
  id: string | null; enrollmentId: string | null; stepPosition: number; levelCode: LevelCode;
  locked: boolean; position: number; date: string; slot: number; dueAt: string; moduleId: string; title: string;
  status: PathSessionStatus; estimatedMinutes: number;
  startedAt: string | null; completedAt: string | null;
  activities: PathSessionActivity[];
}

// ---------------------------------------------------------------------------------------------------------------------
// Contrats
// ---------------------------------------------------------------------------------------------------------------------

export interface ContractTerms {
  startLevel: StartLevel; targetLevel: LevelCode; startDate: string; targetDate: string;
  weeklyMinutes: number; availability: Day[]; requiredMinutes: number; difficulty: Difficulty;
}
export type ContractStatus = 'pending_teacher' | 'pending_learner' | 'accepted' | 'rejected' | 'superseded' | 'withdrawn';
export type ContractProposer = 'learner' | 'teacher' | 'admin' | 'system';
/** Élément de GET /learning/paths/{pathId}/contracts (récents d'abord) ; réponse 201 de POST …/contracts. */
export interface Contract {
  pathId: string; number: number;
  status: ContractStatus;
  proposedBy: ContractProposer; proposerId: string | null; terms: ContractTerms; note: string | null;
  createdAt: string; decidedAt: string | null; decidedBy: string | null; decisionNote: string | null;
  canAccept: boolean; canReject: boolean;
}
/** Corps de POST /learning/paths/{pathId}/contracts (proposition, contre-proposition ou avenant). */
export interface ContractRequest {
  targetLevel: LevelCode; targetDate: string; weeklyMinutes: number;
  availability?: Day[]; startLevel?: StartLevel; note?: string;
}
/** Corps de POST …/contracts/{number}/accept et …/reject. */
export interface ContractDecisionRequest { note?: string }

export interface PathPermissions {
  canEditAvailability: boolean; canValidate: boolean; canChangeObjective: boolean; canProposeContract: boolean;
  canDecideContract: boolean; canPause: boolean; canAddCourses: boolean; canAdvance: boolean;
}
/** GET /learning/path[?learnerId] (ou `null`), et la plupart des actions sur un parcours. */
export interface PathView {
  id: string; learnerId: string; languageId: string; status: PathStatus;
  accompanied: boolean; origin: 'onboarding' | 'assignment' | 'migration'; startLevel: StartLevel; targetLevel: LevelCode;
  startDate: string; targetDate: string; initialTargetDate: string; weeklyMinutes: number; requiredMinutes: number;
  difficulty: Difficulty; placementAttemptId: string | null; paused: boolean; pausedAt: string | null; resumeDate: string | null;
  validatedRevision: number; steps: PathStep[]; availability: Day[];
  proposal: { number: number; status: 'proposed' | 'validated'; overflowCount: number; validatable: boolean; createdAt: string } | null;
  /** Brouillon : [] (voir la proposition). */
  sessions: PathSession[];
  contract: { current: Contract | null; pending: Contract | null; engaged: boolean };
  permissions: PathPermissions;
}
/** GET /learning/contracts/pending (professeur, administration). */
export interface PendingContract {
  pathId: string; learnerId: string; learnerName: string; languageId: string; contract: Contract;
  path: { startLevel: StartLevel; targetLevel: LevelCode; targetDate: string; status: PathStatus };
}

// ---------------------------------------------------------------------------------------------------------------------
// Ajouts de cours
// ---------------------------------------------------------------------------------------------------------------------

export type AdditionPlacement = 'next' | 'end_of_level';
/** Corps de POST /learning/paths/{pathId}/additions. */
export interface AdditionRequest {
  stepLevel: LevelCode; trackVersionId: string; moduleId: string; activityId?: string;
  placement: AdditionPlacement; note?: string;
}
export interface Addition {
  id: string; pathId: string; stepLevel: LevelCode; sourceTrackVersionId: string; sourceLevelCode: LevelCode;
  moduleId: string; activityId: string | null; title: string; minutes: number; placement: AdditionPlacement;
  note: string | null; addedBy: string; addedAt: string; removedAt: string | null; status: 'planned' | 'in_progress' | 'completed';
}
/** Réponse 201 de POST …/additions. */
export interface AdditionCreated { addition: Addition; proposal: PathProposal }
/** Réponse de POST …/additions/{additionId}/remove. */
export interface AdditionRemoved { proposal: PathProposal }

// ---------------------------------------------------------------------------------------------------------------------
// Bibliothèque
// ---------------------------------------------------------------------------------------------------------------------

/** V4 : `kind` peut valoir `mission` ; `toReview` signale un dernier résultat avec des questions « à revoir ». */
export interface LibraryActivityItem {
  id: string; kind: 'lesson' | 'exercise' | 'mission'; title: string; estimatedMinutes: number;
  competences: string[]; lessonId: string | null; lastResult: { correct: number; total: number; submittedAt: string } | null;
  toReview: boolean;
}
/** V4 : `vocabularyCount` = nombre d'entrées du lexique du module (0 sans lexique). */
export interface LibraryModule {
  id: string; position: number; title: string; objective: string; activities: LibraryActivityItem[]; vocabularyCount: number;
}
export interface LibraryLevel {
  levelCode: LevelCode; levelTitle: string; trackVersionId: string; number: number;
  inPath: boolean; current: boolean;
  modules: LibraryModule[];
  /** Entraînement proposé : le bilan intermédiaire seulement (`final` reste `available: false`). */
  practice: { kind: ExamKind; title: string; available: boolean }[];
}
/** GET /learning/library[?learnerId] : `languageId` null (et aucun niveau) tant que l'élève autonome n'a pas choisi sa langue. */
export interface Library { languageId: string | null; levels: LibraryLevel[] }
/** Support d'une activité de bibliothèque, avec son adresse de lecture temporaire (forme d'ActivityDetail). */
export interface LibraryPlacement {
  position: number; assetId: string; assetVersion: number; usage: 'illustration' | 'audio';
  alt: string | null; caption: string | null; decorative: boolean; questionId: string | null; optionId: string | null;
  transcriptAvailable: boolean; url: string | null; mimeType: string | null;
}
/**
 * GET /learning/library/{versionId}/activities/{activityId} : forme d'`ActivityDetail` (CourseResource), sans corrigé,
 * avec `status: 'todo'`, `state: {}`, `completedAt: null`, `attemptId: null`, plus la version et le module.
 * V4 : questions typées (`QuestionView`, voir v4.ts), `kind` `mission` et sa définition.
 */
export interface LibraryActivity {
  id: string; position: number; kind: ActivityKind; title: string; estimatedMinutes: number;
  competences: string[]; status: 'todo'; state: Record<string, never>; completedAt: null; attemptId: null;
  lesson: { id: string; title: string; description: string } | null;
  transcript: string | null;
  questions: QuestionView[];
  placements: LibraryPlacement[];
  trackVersionId: string; levelCode: LevelCode; moduleId: string; moduleTitle: string;
  mission: ServedMission | null;
}
/** Ajout de l'incrément à GET /learning/enrollment. */
export interface EnrollmentPathField { pathId: string | null }

// ---------------------------------------------------------------------------------------------------------------------
// Libellés (français, ton bienveillant)
// ---------------------------------------------------------------------------------------------------------------------

/** Libellés des niveaux, alignés sur le résultat du test de niveau. */
export const levelLabels: Record<StartLevel, string> = {
  A0: 'Débutant', A1: 'A1 · Découverte', A2: 'A2 · Survie', B1: 'B1 · Seuil',
  B2: 'B2 · Avancé', C1: 'C1 · Autonome', C2: 'C2 · Maîtrise',
};
export function levelLabel(code: string | null | undefined): string {
  return code && code in levelLabels ? levelLabels[code as StartLevel] : code ?? '';
}
/** Rang d'un niveau : A0 = 0, A1 = 1 … C2 = 6 (−1 si inconnu). */
export function levelRank(code: string | null | undefined): number {
  return code ? startLevels.indexOf(code as StartLevel) : -1;
}

export const difficultyLabels: Record<DifficultyCode, string> = {
  light: 'Léger', moderate: 'Modéré', sustained: 'Soutenu', intensive: 'Intensif',
  very_intensive: 'Très intensif', unrealistic: 'Irréaliste',
};
/** Barème des charges hebdomadaires (minutes par semaine) ; `null` = au-delà. */
export const difficultyThresholds: Record<DifficultyCode, number | null> = {
  light: 150, moderate: 300, sustained: 450, intensive: 630, very_intensive: 840, unrealistic: null,
};
export const difficultyCodes: readonly DifficultyCode[] = ['light', 'moderate', 'sustained', 'intensive', 'very_intensive', 'unrealistic'];
/** Ton de badge conseillé pour une difficulté. */
export const difficultyTones: Record<DifficultyCode, 'green' | 'blue' | 'violet' | 'amber' | 'red'> = {
  light: 'green', moderate: 'green', sustained: 'blue', intensive: 'violet', very_intensive: 'amber', unrealistic: 'red',
};

export const feasibilityLabels: Record<FeasibilityCode, string> = {
  comfortable: 'Confortable', tight: 'Serré', insufficient: 'Insuffisant',
};

export const blockingReasonMessages: Record<BlockingReason, string> = {
  overflow: 'Certaines activités ne trouvent pas de place avant la date visée : ajoutez du temps ou repoussez la date.',
  objective_locked: 'Le niveau visé et la date cible sont fixés par le contrat : proposez un avenant pour les changer.',
  commitment: 'Le temps prévu chaque semaine doit rester au moins égal à l’engagement du contrat.',
  not_allowed: 'Cette action n’est pas possible pour votre profil.',
  stale: 'Le planning a changé entre-temps : actualisez la proposition avant de la valider.',
};

export const contractStatusLabels: Record<ContractStatus, string> = {
  pending_teacher: 'En attente du professeur', pending_learner: 'En attente de l’élève', accepted: 'En vigueur',
  rejected: 'Refusé', superseded: 'Remplacé', withdrawn: 'Retiré',
};
export const contractStatusTones: Record<ContractStatus, 'amber' | 'blue' | 'green' | 'red' | 'neutral'> = {
  pending_teacher: 'amber', pending_learner: 'blue', accepted: 'green', rejected: 'red', superseded: 'neutral', withdrawn: 'neutral',
};
export const contractProposerLabels: Record<ContractProposer, string> = {
  learner: 'Élève', teacher: 'Professeur', admin: 'Administration', system: 'LinguaCap',
};

export const pathStatusLabels: Record<PathStatus, string> = {
  draft: 'Brouillon', active: 'En cours', completed: 'Terminé', withdrawn: 'Arrêté',
};
export const pathStepStatusLabels: Record<PathStepStatus, string> = {
  planned: 'Prévu', active: 'En cours', completed: 'Terminé', withdrawn: 'Retiré',
};

export const onboardingStepLabels: Record<OnboardingStepId, string> = {
  language: 'Langue', placement: 'Test', result: 'Votre niveau', objective: 'Objectif et durée',
  days: 'Mes jours', planning: 'Mon planning', start: 'C’est parti',
};
export const onboardingBlockedMessages: Record<OnboardingBlockedReason, string> = {
  language_unavailable: 'Cette langue n’est pas encore ouverte. Nous vous préviendrons dès son ouverture.',
  placement_unavailable: 'Le test de niveau n’est pas encore disponible pour cette langue.',
  no_target_available: 'Votre niveau dépasse les parcours publiés pour le moment. La bibliothèque reste à votre disposition.',
};

export const placementTierStatusLabels: Record<PlacementTier['status'], string> = {
  locked: 'À venir', current: 'En cours', passed: 'Réussi', failed: 'Non validé',
};
export const competenceLabels: Record<string, string> = {
  lecture: 'Lecture', ecoute: 'Écoute', 'expression-ecrite': 'Expression écrite', 'expression-orale': 'Expression orale',
  vocabulaire: 'Vocabulaire', grammaire: 'Grammaire',
};

export const examKindLabels: Record<ExamKind, string> = { midterm: 'Bilan intermédiaire', final: 'Examen blanc' };
export const additionPlacementLabels: Record<AdditionPlacement, string> = {
  next: 'Dès la prochaine séance', end_of_level: 'Avant l’examen blanc du niveau',
};
export const additionStatusLabels: Record<Addition['status'], string> = {
  planned: 'Prévu', in_progress: 'En cours', completed: 'Terminé',
};

/** Jours de la semaine (index 0 = lundi = weekday 1). */
export const weekdayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const;
export const weekdayShortLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;
export function weekdayLabel(weekday: number): string {
  return weekdayLabels[weekday - 1] ?? '';
}

export const gradingDelayLabels: Record<GradingDelayHours, string> = {
  24: 'Sous 24 heures', 48: 'Sous 48 heures', 72: 'Sous 3 jours', 168: 'Sous une semaine',
};

/** Durée lisible : « 45 min », « 1 h », « 2 h 05 ». */
export function formatMinutes(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h} h${m ? ` ${String(m).padStart(2, '0')}` : ''}` : `${m} min`;
}

/** Capacité hebdomadaire d'un ensemble de jours, en minutes. */
export function weeklyCapacity(days: readonly Day[]): number {
  return days.reduce((sum, day) => sum + day.sessions * day.minutes, 0);
}
