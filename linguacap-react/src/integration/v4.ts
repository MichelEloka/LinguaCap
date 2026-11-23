/*
 * Contrat JSON de la V4 « Contenus et pédagogie » : questions typées (compléter, remettre en ordre, associer, dictée,
 * répétition orale), corrigé par question après la remise, répétition orale validée, missions remises au professeur,
 * file de corrections et lexique du module. Mêmes conventions que v2.ts : les records Java sérialisent à l'identique,
 * un champ facultatif vaut `null` explicitement ; erreurs `{ code, message }` (INVALID_INPUT 400, FORBIDDEN 403,
 * NOT_FOUND 404, CONFLICT 409).
 *
 * Ce module ne contient que des types et de petites aides (libellés, lecture de l'état sauvegardé, découpage d'un
 * texte à trous) : aucun appel réseau.
 */
import type { LevelCode } from './v2';

// ---------------------------------------------------------------------------------------------------------------------
// Types d'activité et de question
// ---------------------------------------------------------------------------------------------------------------------

/** Types d'activité du catalogue, de la séance et de la bibliothèque (V4 : `mission` en plus). */
export type ActivityKind = 'lesson' | 'exercise' | 'review' | 'assessment' | 'mission';
export const activityKinds: readonly ActivityKind[] = ['lesson', 'exercise', 'review', 'assessment', 'mission'];

/** Types de question. Une question sans `type` (ancien contenu, éditeur, B1 de démonstration) vaut `choice`. */
export type QuestionType = 'choice' | 'fill' | 'order' | 'match' | 'dictation' | 'speak';
export const questionTypes: readonly QuestionType[] = ['choice', 'fill', 'order', 'match', 'dictation', 'speak'];

/** Type d'une question, `choice` par défaut (`type` absent ou nul). */
export function questionTypeOf(question: { type?: string | null }): QuestionType {
  return question.type && (questionTypes as readonly string[]).includes(question.type) ? question.type as QuestionType : 'choice';
}

// ---------------------------------------------------------------------------------------------------------------------
// Vue élève d'une question (servie par le catalogue, transmise telle quelle par Apprentissage)
// Jamais d'`accept`, `answers`, `pairs`, `correct`, `feedback`, `explanation` ni `spec` : le corrigé reste au serveur.
// ---------------------------------------------------------------------------------------------------------------------

/** Élément affiché d'une question : choix, jeton (`order`) ou élément à associer (`match`). Ids opaques. */
export interface QuestionItem { id: string; text: string }

/** Choix unique (clé `text` conservée). */
export interface ChoiceQuestionView { id: string; type: 'choice'; prompt: string; options: QuestionItem[] }
/** Trou d'un texte à compléter : `size` = largeur conseillée en caractères. */
export interface FillBlankView { id: string; size: number; hint: string | null }
/** Texte à trous : chaque trou apparaît dans `text` sous la forme `[[id]]` (voir `fillSegments`). */
export interface FillQuestionView { id: string; type: 'fill'; prompt: string; text: string; blanks: FillBlankView[] }
/**
 * Phrase à remettre en ordre. Jetons d'id opaque (`k` + 6 caractères hexadécimaux), dans un ordre déterministe qui
 * n'est jamais une solution.
 */
export interface OrderQuestionView { id: string; type: 'order'; prompt: string; tokens: QuestionItem[] }
/** Associer chaque élément de gauche à un élément de droite (ids opaques, `right` jamais dans l'ordre de la solution). */
export interface MatchQuestionView { id: string; type: 'match'; prompt: string; left: QuestionItem[]; right: QuestionItem[] }
/** Dictée : le son est un support de la question (`questionId`) ; `wordCount` seulement si le contenu l'affiche. */
export interface DictationQuestionView { id: string; type: 'dictation'; prompt: string; wordCount: number | null }
/** Répétition orale : phrase modèle (son de question disponible à la demande) et seuil de réussite (50 à 100). */
export interface SpeakQuestionView { id: string; type: 'speak'; prompt: string; text: string; threshold: number }

/** Question telle que la voit l'élève (séance, bibliothèque, aperçu). */
export type QuestionView =
  | ChoiceQuestionView | FillQuestionView | OrderQuestionView | MatchQuestionView | DictationQuestionView | SpeakQuestionView;

/** Vue d'une question selon son type. */
export interface QuestionViewByType {
  choice: ChoiceQuestionView; fill: FillQuestionView; order: OrderQuestionView;
  match: MatchQuestionView; dictation: DictationQuestionView; speak: SpeakQuestionView;
}

/** Relit une question servie par un ancien service (`{id, prompt, options}` sans `type`) comme un choix. */
export function asQuestionView(question: QuestionView | { id: string; prompt: string; options: QuestionItem[]; type?: undefined | null }): QuestionView {
  return question.type ? question as QuestionView : { ...question, type: 'choice' } as ChoiceQuestionView;
}

/** Segment d'un texte à trous : texte brut ou trou `[[id]]`. */
export type FillSegment = { kind: 'text'; text: string } | { kind: 'blank'; id: string };
const blankMarker = /\[\[([A-Za-z0-9_-]{1,20})\]\]/g;

/** Découpe le texte d'une question `fill` en morceaux de texte et en trous, dans l'ordre. */
export function fillSegments(text: string): FillSegment[] {
  const segments: FillSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(blankMarker)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ kind: 'text', text: text.slice(last, index) });
    segments.push({ kind: 'blank', id: match[1] });
    last = index + match[0].length;
  }
  if (last < text.length) segments.push({ kind: 'text', text: text.slice(last) });
  return segments;
}

/** Nombre de mots d'un texte (séparés par des espaces), pour les compteurs et le seuil par défaut. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/u).filter(Boolean).length;
}

/** Seuil par défaut d'une répétition orale : 80 jusqu'à 3 mots, 75 au-delà. */
export function defaultSpeakThreshold(text: string): number {
  return countWords(text) <= 3 ? 80 : 75;
}

/** Caractères allemands proposés sous les champs de saisie (insérés au curseur). */
export const germanCharacters = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'] as const;

// ---------------------------------------------------------------------------------------------------------------------
// Réponses de l'élève : POST /assessments/exercises (en-tête Idempotency-Key)
// ---------------------------------------------------------------------------------------------------------------------

export interface ChoiceAnswer { choice: string }
/** {blankId: texte saisi} */
export interface FillAnswer { blanks: Record<string, string> }
/** Ids des jetons dans l'ordre choisi (tous les jetons, chacun une fois). */
export interface OrderAnswer { order: string[] }
/** {id de gauche: id de droite} */
export interface MatchAnswer { pairs: Record<string, string> }
/** Texte de la dictée (500 caractères au plus). */
export interface DictationAnswer { text: string }
/** Essai de répétition de la même manche (`roundId`) : réussi, troisième échec ou enregistrement envoyé. */
export interface SpeakAnswer { speechAttemptId: string }

export type ExerciseAnswer = ChoiceAnswer | FillAnswer | OrderAnswer | MatchAnswer | DictationAnswer | SpeakAnswer;
/** Réponse attendue selon le type de question. */
export interface ExerciseAnswerByType {
  choice: ChoiceAnswer; fill: FillAnswer; order: OrderAnswer; match: MatchAnswer; dictation: DictationAnswer; speak: SpeakAnswer;
}
/** {questionId: réponse} : toutes les questions de la leçon doivent avoir une réponse. */
export type ExerciseAnswers = Record<string, ExerciseAnswer>;

/** Corps de POST /assessments/exercises. `sessionId` et `activityId` sont indissociables (remise en séance). */
export interface ExerciseSubmitRequest {
  lessonId: string;
  /** Manche de l'exercice (uuid créé par l'interface ; « Refaire » en crée une nouvelle). */
  roundId: string;
  sessionId?: string; activityId?: string;
  answers: ExerciseAnswers;
}

/** Limites contrôlées par Évaluations (400 au-delà). */
export const exerciseLimits = {
  questions: 30, textChars: 500, blankChars: 80, tokens: 16, pairs: 8, stateBytes: 8192,
} as const;

/** État sauvegardé d'un exercice (`activity_progress.state`, 8 Ko au plus). */
export interface ExerciseState { answers: ExerciseAnswers; roundId: string }

/** Lit l'état sauvegardé d'un exercice ; l'ancien `{answers: {q1: 'b'}}` est relu comme `{q1: {choice: 'b'}}`. */
export function readExerciseState(state: unknown): { answers: ExerciseAnswers; roundId: string | null } {
  const value = state && typeof state === 'object' ? state as { answers?: unknown; roundId?: unknown } : {};
  const answers: ExerciseAnswers = {};
  if (value.answers && typeof value.answers === 'object') {
    for (const [questionId, answer] of Object.entries(value.answers as Record<string, unknown>)) {
      if (typeof answer === 'string') answers[questionId] = { choice: answer };
      else if (answer && typeof answer === 'object') answers[questionId] = answer as ExerciseAnswer;
    }
  }
  return { answers, roundId: typeof value.roundId === 'string' ? value.roundId : null };
}

/** Nouvelle manche d'exercice. */
export function newRoundId(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------------------------------------------------
// Résultat : réponse de POST /assessments/exercises et de GET /assessments/exercises/{attemptId}
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Note d'une remise, sur toutes les routes (y compris GET /assessments/results). V4 : `pending` (répétitions envoyées
 * en enregistrement, en attente du professeur), `flagged` (questions « à revoir ») et `typed` ; valeurs 0, [] et false
 * pour l'historique.
 */
export interface Grade {
  id: string; lessonId: string; correct: number; total: number; submittedAt: string;
  sessionId: string | null; activityId: string | null;
  kind: 'quiz' | 'diagnostic';
  /** Diagnostic : bonnes réponses et total par module (ou « prerequis »). */
  moduleScores: Record<string, { correct: number; total: number }> | null;
  pending: number; flagged: string[]; typed: boolean;
}

export type QuestionReviewStatus = 'correct' | 'incorrect' | 'pending' | 'flagged';
/** Remarques d'une réponse acceptée : graphie translittérée (ae, oe, ue, ss), majuscule du nom, faute de frappe (dictée). */
export type AnswerNotice = 'transliteration' | 'case' | 'typo';
export type DictationWordStatus = 'ok' | 'near' | 'translit' | 'missing' | 'wrong' | 'extra';
export interface DictationWord { expected: string | null; given: string | null; status: DictationWordStatus }

interface QuestionReviewBase<T extends QuestionType, Given, Expected, Detail> {
  id: string; type: T; status: QuestionReviewStatus;
  /** Ajout d'Évaluations au plan : énoncé de la question, pour un corrigé lisible seul (tiroir « Voir le corrigé »). */
  prompt: string;
  /** Réponse remise (forme de la requête). */
  given: Given | null;
  expected: Expected;
  /** Explication du contenu (null pour une ancienne tentative, corrigée à la volée). */
  explanation: string | null;
  /** Retour propre au choix donné (`choice`) ; null sinon. */
  feedback: string | null;
  notices: AnswerNotice[];
  detail: Detail | null;
}
// Évaluations joint aux réponses et aux corrigés les textes utiles à l'affichage (ajouts au plan, facultatifs pour les
// anciennes remises) : libellé du choix donné, phrase formée, texte à trous, libellés des éléments associés, texte reconnu.
export type ChoiceReview = QuestionReviewBase<'choice', ChoiceAnswer & { label?: string }, { optionId: string; label: string }, null>;
export type FillReview = QuestionReviewBase<'fill', FillAnswer, { blanks: Record<string, string[]>; text?: string },
  { blanks: Record<string, { correct: boolean; notices: AnswerNotice[] }> }>;
export type OrderReview = QuestionReviewBase<'order', OrderAnswer & { sentence?: string }, { sentence: string; alternatives: string[] }, null>;
export type MatchReview = QuestionReviewBase<'match', MatchAnswer,
  { pairs: Record<string, string>; /** Texte de chaque élément, à gauche et à droite, par identifiant. */ labels?: Record<string, string> },
  { pairs: Record<string, boolean> }>;
export type DictationReview = QuestionReviewBase<'dictation', DictationAnswer, { text: string }, { score: number; words: DictationWord[] }>;
export type SpeakReview = QuestionReviewBase<'speak', SpeakAnswer & { transcript?: string | null }, { text: string }, {
  score: number | null; transcript: string | null; attempts: number; mode: SpeechMode; reviewStatus: SpeechReviewStatus;
  /** Commentaire du professeur après sa décision sur un enregistrement. */
  comment?: string | null;
}>;
/** Correction d'une question, figée à la remise (`quiz_attempts.review`). */
export type QuestionReview = ChoiceReview | FillReview | OrderReview | MatchReview | DictationReview | SpeakReview;

/**
 * Réponse de POST /assessments/exercises et de GET /assessments/exercises/{attemptId}. Une manche (`roundId`) se remet une
 * fois : la même remise rejouée renvoie la même correction, d'autres réponses dans la même manche sont refusées (409).
 */
export interface ExerciseResult { grade: Grade; questions: QuestionReview[] }

// ---------------------------------------------------------------------------------------------------------------------
// Répétition orale (EVO-043)
// ---------------------------------------------------------------------------------------------------------------------

export type SpeechMode = 'recognition' | 'recording';
export type SpeechReviewStatus = 'auto' | 'uploading' | 'pending' | 'validated' | 'rejected';

/** Contexte d'un essai : `sessionId` et `activityId` sont indissociables (absents en bibliothèque). */
interface SpeechContext { lessonId: string; questionId: string; roundId: string; sessionId?: string; activityId?: string }
/** Corps de POST /assessments/speech : transcriptions proposées par le navigateur (5 au plus, 300 caractères chacune). */
export interface SpeechAttemptRequest extends SpeechContext { transcripts: string[] }
/** Corps de POST /assessments/speech/recordings (navigateur sans reconnaissance vocale, ou micro refusé). */
export interface SpeechRecordingRequest extends SpeechContext { mimeType: string; size: number }
/** Corps de POST /assessments/speech/{speechId}/review (correcteur). */
export interface SpeechReviewRequest { decision: 'validated' | 'rejected'; comment?: string }

/** Enregistrement d'un élève (répétition ou mission) : `url` de lecture de cinq minutes, ou null. */
export interface RecordingRef { productionId: string; mimeType: string; url: string | null }

/** Réponse de POST /assessments/speech, de …/finalize, de GET /assessments/speech/{speechId} et de …/review. */
export interface SpeechAttemptView {
  id: string;
  /** Ajout d'Évaluations au plan : élève de l'essai. */
  learnerId: string;
  lessonId: string; questionId: string; roundId: string;
  /** Numéro de l'essai dans la manche (1 à 10). */
  attempt: number;
  mode: SpeechMode;
  score: number | null; passed: boolean; threshold: number;
  /** Échecs de la manche pour cette question ; `canSkip` dès 3 échecs. */
  failures: number; canSkip: boolean;
  transcript: string | null;
  /** Ajout d'Évaluations au plan : phrase à répéter (pour la file du professeur). */
  text: string | null;
  reviewStatus: SpeechReviewStatus; comment: string | null;
  recording: RecordingRef | null;
  createdAt: string;
}

/** Réservation d'un dépôt d'enregistrement dans Médias (dépôt direct ; `uploadUrl` null : rien à téléverser). */
export interface UploadReservation { id: string; uploadUrl: string | null; maxBytes: number }
/** Réponse 201 de POST /assessments/speech/recordings. */
export interface SpeechRecordingReservation { attempt: SpeechAttemptView; upload: UploadReservation }

export const speechLimits = { transcripts: 5, transcriptChars: 300, attemptsPerRound: 10, failuresBeforeSkip: 3 } as const;

/** Mention affichée avec le bouton « Parler ». */
export const speechRecognitionNotice = 'La reconnaissance vocale est assurée par votre navigateur (Chrome ou Edge) : votre voix est '
  + 'transmise au service de reconnaissance de son éditeur ; LinguaCap ne reçoit que le texte reconnu et le score.';
/** Repli quand la reconnaissance manque ou que le micro est refusé. */
export const speechFallbackLabel = 'Enregistrer pour mon professeur';

// ---------------------------------------------------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------------------------------------------------

/** Partie orale : enregistrement de 30 à 120 secondes (arrêt automatique côté navigateur). */
export interface MissionOral { prompt: string; maxSeconds: number }
/** Partie écrite : 200 à 1 500 caractères au plus, `minWords` de 0 à 200. */
export interface MissionWritten { prompt: string; maxChars: number; minWords: number }
/**
 * Définition d'une mission (contenu, document du catalogue, `ActivityDetail.mission`) : au moins une partie, liste de
 * vérification de 2 à 6 points (160 caractères au plus). La situation et la consigne sont la description de la leçon.
 */
export interface MissionDefinition { oral: MissionOral | null; written: MissionWritten | null; checklist: string[] }
/** Définition figée dans une remise : la consigne (`description`) en plus. */
export interface MissionSnapshot extends MissionDefinition { description: string }
/**
 * Définition servie avec l'activité (`ActivityDetail.mission`, `LibraryActivity.mission`) : Apprentissage y joint la
 * consigne (`description`, aussi dans `lesson.description`).
 */
export interface ServedMission extends MissionDefinition { description?: string }

export type MissionStatus = 'draft' | 'submitted' | 'sent' | 'reviewed';
export type MissionDecision = 'validated' | 'to_redo';
export type ReviewerKind = 'teacher' | 'reviewer';

/**
 * Corps de POST /assessments/missions : 201 et un nouveau brouillon, ou 200 et la dernière remise de ce contexte.
 * `restart: true` (après `to_redo` ou `sent`) ouvre un brouillon numéroté +1, prérempli avec le texte précédent.
 */
export interface MissionStartRequest {
  trackVersionId: string; activityId: string; sessionId?: string; sessionActivityId?: string; restart?: boolean;
}
/** Corps de PUT /assessments/missions/{missionId} (brouillon) : `checklist` = indices cochés (0 = premier point). */
export interface MissionUpdateRequest { text?: string; checklist?: number[] }
/** Corps de POST /assessments/missions/{missionId}/recordings. */
export interface MissionRecordingRequest { mimeType: string; size: number }
/** Corps de POST /assessments/missions/{missionId}/review (correcteur). */
export interface MissionReviewRequest { decision: MissionDecision; comment: string }

/** Réponse de GET, PUT, …/finalize, …/submit et …/review sur /assessments/missions/{missionId}. */
export interface MissionView {
  id: string; learnerId: string; trackVersionId: string; levelCode: LevelCode; moduleId: string; activityId: string;
  sessionId: string | null; sessionActivityId: string | null;
  /** Numéro de la remise pour cette activité (1, puis +1 à chaque reprise). */
  number: number;
  title: string;
  definition: MissionSnapshot;
  status: MissionStatus;
  text: string; checklist: number[];
  recording: RecordingRef | null;
  /** Destinataire : professeur référent, sinon correcteur désigné ; null = envoyée sans destinataire (`sent`). */
  reviewerKind: ReviewerKind | null;
  submittedAt: string | null;
  review: { decision: MissionDecision; comment: string | null; reviewedAt: string } | null;
  canReview: boolean;
  createdAt: string; updatedAt: string;
}
/** Élément de GET /assessments/missions[?learnerId] (récentes d'abord). */
export interface MissionSummary {
  id: string; activityId: string; title: string; levelCode: LevelCode; moduleId: string; status: MissionStatus;
  decision: MissionDecision | null; submittedAt: string | null; reviewedAt: string | null; sessionId: string | null;
}

export const missionLimits = {
  textChars: 1500, minSeconds: 30, maxSeconds: 120, checklistMin: 2, checklistMax: 6, checklistItemChars: 160,
  writtenMinChars: 200, writtenMaxChars: 1500, minWordsMax: 200, commentChars: 2000,
} as const;

// ---------------------------------------------------------------------------------------------------------------------
// File de corrections : GET /assessments/reviews (professeur, correcteur, administration)
// ---------------------------------------------------------------------------------------------------------------------

export type ReviewQueueKind = 'mission' | 'speech';
export interface ReviewQueueItem {
  kind: ReviewQueueKind; id: string; learnerId: string; learnerName: string; title: string;
  levelCode: LevelCode | null; context: 'session' | 'library'; submittedAt: string;
}

// ---------------------------------------------------------------------------------------------------------------------
// Lexique du module
// ---------------------------------------------------------------------------------------------------------------------

export type PartOfSpeech =
  | 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'pronoun' | 'number' | 'expression' | 'other';
export const partsOfSpeech: readonly PartOfSpeech[] = [
  'noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'number', 'expression', 'other',
];
export type GermanArticle = 'der' | 'die' | 'das';

/** Segment du son de lexique du module (secondes), avec son adresse de lecture temporaire. */
export interface LexiconAudio { url: string | null; start: number; end: number }
export interface LexiconEntry {
  id: string; word: string;
  /** Obligatoire pour un nom, sauf « toujours au pluriel » (voir `note`). */
  article: GermanArticle | null;
  plural: string | null; partOfSpeech: PartOfSpeech; translation: string;
  example: string | null;
  /** 120 caractères au plus : « séparable : an|fangen », « + accusatif », « toujours au pluriel »… */
  note: string | null;
  audio: LexiconAudio | null;
}
/**
 * GET /learning/library/{versionId}/modules/{moduleId}/lexicon et `SessionDetail.lexicon` : les sons d'un même module
 * partagent souvent la même adresse (un fichier, un segment par entrée).
 */
export interface Lexicon { trackVersionId: string; levelCode: LevelCode; moduleId: string; moduleTitle: string; entries: LexiconEntry[] }

// ---------------------------------------------------------------------------------------------------------------------
// Ajouts aux réponses existantes (compatibles)
// ---------------------------------------------------------------------------------------------------------------------

/** Exercice à reprendre listé dans la révision du module (`revision-<module>`). */
export interface ReviewItem {
  activityId: string; title: string; trackVersionId: string; flagged: string[]; lastResult: { correct: number; total: number };
}
/** Ajouts de la V4 à chaque `ActivityDetail` de GET /learning/sessions/{sessionId}. */
export interface ActivityDetailV4Fields {
  kind: ActivityKind;
  questions: QuestionView[];
  mission: ServedMission | null;
  /** Version et activité du catalogue d'origine (aussi pour un cours ajouté par le professeur). */
  contentVersionId: string | null; contentActivityId: string | null;
  /** Révision du module seulement (`revision-<module>`) ; null ailleurs. */
  reviewItems: ReviewItem[] | null;
}
/** Ajout de la V4 à GET /learning/sessions/{sessionId} : lexique du module de la séance (null si indisponible). */
export interface SessionDetailV4Fields { lexicon: Lexicon | null }
/** Ajout de la V4 à `LibraryModule` (GET /learning/library). */
export interface LibraryModuleV4Fields { vocabularyCount: number }
/** Ajouts de la V4 à `LibraryActivityItem` : `toReview` = dernier résultat avec des questions à revoir. */
export interface LibraryActivityItemV4Fields { kind: 'lesson' | 'exercise' | 'mission'; toReview: boolean }
/** Ajouts de la V4 à GET /learning/library/{versionId}/activities/{activityId}. */
export interface LibraryActivityV4Fields { kind: ActivityKind; questions: QuestionView[]; mission: ServedMission | null }

// ---------------------------------------------------------------------------------------------------------------------
// Document du catalogue (éditeur, PUT /catalogue/versions/{versionId}) : corrigé visible des seuls éditeurs
// ---------------------------------------------------------------------------------------------------------------------

/** Choix de réponse avec son corrigé et son retour propre (500 caractères au plus ; absent s'il n'y en a pas). */
export interface DraftOptionV4 { id: string; label: string; correct: boolean; feedback?: string | null }
/**
 * Trou d'une question `fill`. Le catalogue accepte aussi un document sans `size` ni `hint` (contenus importés) : un
 * lecteur du document doit alors prendre une largeur par défaut et `null` ; la vue élève sert toujours `size`.
 */
export interface FillBlankSpec { id: string; accept: string[]; size: number; hint: string | null }
/** `text` contient un marqueur `[[id]]` par trou. */
export interface FillSpec { text: string; blanks: FillBlankSpec[] }
/** Toutes les solutions acceptées, chacune découpée en jetons (même multiensemble de jetons pour toutes). */
export interface OrderSpec { answers: string[][] }
export interface MatchSpec { pairs: { left: string; right: string }[] }
export interface DictationSpec { accept: string[]; showWordCount: boolean }
export interface SpeakSpec { text: string; accept: string[]; threshold: number }
export interface QuestionSpecByType { fill: FillSpec; order: OrderSpec; match: MatchSpec; dictation: DictationSpec; speak: SpeakSpec }
export type QuestionSpec = FillSpec | OrderSpec | MatchSpec | DictationSpec | SpeakSpec;

/**
 * Question du document de version (`VersionDocument.Question`). `type: null` vaut `choice` ; `options` est vide hors
 * `choice` ; `spec` est null pour `choice`. Le diagnostic et les parties d'évaluation restent en `choice`.
 */
export interface DraftQuestionV4 {
  id: string; type: QuestionType | null; prompt: string; moduleRef: string | null;
  /** 1 500 caractères au plus (obligatoire dans les contenus au format 4). */
  explanation: string | null;
  options: DraftOptionV4[];
  spec: QuestionSpec | null;
}
/** Son de lexique au catalogue : segment d'un média publié avec la version. */
export interface VocabularyAudioRef { assetId: string; assetVersion: number; start: number; end: number }
/** Entrée de `DraftModule.vocabulary` (catalogue). */
export interface DraftVocabularyEntry extends Omit<LexiconEntry, 'audio'> { audio: VocabularyAudioRef | null }
/** Ajout de la V4 à `DraftActivity` (null hors mission). */
export interface DraftActivityV4Fields { kind: ActivityKind; mission: MissionDefinition | null }
/** Ajout de la V4 à `DraftModule`. */
export interface DraftModuleV4Fields { vocabulary: DraftVocabularyEntry[] }

// ---------------------------------------------------------------------------------------------------------------------
// Routes internes (documentation : non exposées par la passerelle)
// ---------------------------------------------------------------------------------------------------------------------

/** GET /v1/internal/lessons/{lessonId}/exercise-key (Catalogue → Évaluations). */
export interface ExerciseKey {
  lessonId: string; versionId: string; frozen: boolean;
  questions: {
    id: string; type: QuestionType; prompt: string; explanation: string | null;
    options: DraftOptionV4[];
    text: string | null; blanks: FillBlankSpec[] | null;
    tokens: QuestionItem[] | null; answers: string[][] | null;
    left: QuestionItem[] | null; right: QuestionItem[] | null; pairs: Record<string, string> | null;
    accept: string[] | null; threshold: number | null;
  }[];
}

// ---------------------------------------------------------------------------------------------------------------------
// Libellés (français, ton bienveillant)
// ---------------------------------------------------------------------------------------------------------------------

type Tone = 'blue' | 'green' | 'amber' | 'neutral' | 'violet' | 'red';

export const activityKindLabels: Record<ActivityKind, string> = {
  lesson: 'Leçon', exercise: 'Exercice', review: 'Révision', assessment: 'Évaluation', mission: 'Mission',
};
export const questionTypeLabels: Record<QuestionType, string> = {
  choice: 'Choix', fill: 'Compléter', order: 'Remettre en ordre', match: 'Associer', dictation: 'Dictée', speak: 'Répéter à voix haute',
};
export const questionReviewStatusLabels: Record<QuestionReviewStatus, string> = {
  correct: 'Juste', incorrect: 'Faux', pending: 'En attente de validation', flagged: 'À revoir',
};
export const questionReviewStatusTones: Record<QuestionReviewStatus, Tone> = {
  correct: 'green', incorrect: 'red', pending: 'amber', flagged: 'violet',
};
export const answerNoticeLabels: Record<AnswerNotice, string> = {
  transliteration: 'Graphie à retenir', case: 'Majuscule du nom', typo: 'Petite faute de frappe',
};
export const answerNoticeHints: Record<AnswerNotice, string> = {
  transliteration: 'Réponse acceptée : écrivez plutôt ä, ö, ü et ß (barre de caractères sous le champ).',
  case: 'Réponse acceptée : en allemand, les noms prennent toujours une majuscule.',
  typo: 'Réponse acceptée malgré une lettre de travers : relisez l’orthographe attendue.',
};
export const dictationWordStatusLabels: Record<DictationWordStatus, string> = {
  ok: 'Juste', near: 'Presque', translit: 'Graphie à retenir', missing: 'Manquant', wrong: 'Faux', extra: 'En trop',
};
export const speechReviewStatusLabels: Record<SpeechReviewStatus, string> = {
  auto: 'Validée automatiquement', uploading: 'Envoi en cours', pending: 'En attente de validation',
  validated: 'Validée par le professeur', rejected: 'À reprendre',
};
export const missionStatusLabels: Record<MissionStatus, string> = {
  draft: 'Brouillon', submitted: 'En attente de retour', sent: 'Envoyée', reviewed: 'Corrigée',
};
export const missionStatusTones: Record<MissionStatus, Tone> = {
  draft: 'neutral', submitted: 'amber', sent: 'blue', reviewed: 'green',
};
export const missionDecisionLabels: Record<MissionDecision, string> = { validated: 'Validée', to_redo: 'À reprendre' };
export const missionDecisionTones: Record<MissionDecision, Tone> = { validated: 'green', to_redo: 'amber' };
export const reviewerKindLabels: Record<ReviewerKind, string> = { teacher: 'Professeur référent', reviewer: 'Correcteur' };
export const reviewQueueKindLabels: Record<ReviewQueueKind, string> = { mission: 'Mission', speech: 'Prononciation' };
export const partOfSpeechLabels: Record<PartOfSpeech, string> = {
  noun: 'Nom', verb: 'Verbe', adjective: 'Adjectif', adverb: 'Adverbe', preposition: 'Préposition',
  conjunction: 'Conjonction', pronoun: 'Pronom', number: 'Nombre', expression: 'Expression', other: 'Autre',
};
