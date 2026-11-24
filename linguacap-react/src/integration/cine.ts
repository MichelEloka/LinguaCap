/*
 * Contrat JSON du Ciné-club (EVO-055, contrat 1.13.0, précisions du lot Services « cine-contrat ») : films du catalogue lus
 * par le lecteur YouTube officiel, séquences en trois temps (avant, regarder, après), carnet de mots de l'élève et
 * recommandations du professeur. Mêmes conventions que v2.ts et v4.ts : records Java sérialisés tels quels, `null`
 * explicite, aucun champ omis ; temps en secondes entières ; erreurs `{ code, message }` (INVALID_INPUT 400, FORBIDDEN 403,
 * NOT_FOUND 404, CONFLICT 409).
 *
 * Droits : la vidéo n'est jamais téléchargée ni recopiée ; seul le lecteur officiel `www.youtube-nocookie.com` est intégré,
 * après un clic explicite de l'élève (préférence mémorisée sous `lc-youtube-consent`, révocable). Les questions, résumés,
 * mots-clés et explications sont originaux.
 *
 * Ce module ne contient que des types et de petites aides (bornes, adresses du lecteur, consentement, contrôles du
 * document) : aucun appel réseau.
 */
import type { LevelCode } from './v2';
import type { DraftQuestionV4, GermanArticle, QuestionType, QuestionView } from './v4';

// ---------------------------------------------------------------------------------------------------------------------
// Catalogue : films et séquences (lecture : GET /films?languageId=&level=, GET /films/{filmId} ; jamais de corrigé)
// ---------------------------------------------------------------------------------------------------------------------

/** Mot-clé d'une séquence, donné avant de regarder (texte seul, sans son). */
export interface FilmKeyword {
  word: string;
  article: GermanArticle | null;
  plural: string | null;
  translation: string;
  note: string | null;
}

/**
 * Séquence d'un film : bornes `start` et `end` en secondes dans la vidéo (`approx` : à vérifier en regardant), contexte
 * « avant de regarder » (balisage ` [fr] ` / ` [fr?] ` comme les cours), mots-clés et leçon des questions « après »
 * (`cine-<sequenceId>`, remise par POST /assessments/exercises sans séance). `questions` : vues élève dans
 * GET /films/{filmId}, null dans la liste GET /films (lisibles aussi par GET /lessons/{lessonId}).
 */
export interface FilmSequence {
  id: string;
  filmId: string;
  position: number;
  title: string;
  start: number;
  end: number;
  approx: boolean;
  context: string;
  keywords: FilmKeyword[];
  lessonId: string;
  questionCount: number;
  questions: QuestionView[] | null;
}

/** Film publié (`catalogue.films`). `levelId` en minuscules (`a1`), `levelCode` en majuscules (`A1`). */
export interface Film {
  id: string;
  languageId: string;
  levelId: string;
  levelCode: LevelCode;
  title: string;
  description: string;
  provider: 'youtube';
  /** Identifiant YouTube (11 caractères). */
  videoId: string;
  channel: string;
  videoUrl: string;
  /** Cours gratuit de l'éditeur du film (lien affiché avec le crédit). */
  courseUrl: string;
  credit: string;
  licenseNote: string;
  durationSeconds: number;
  position: number;
  sequences: FilmSequence[];
}

// ---------------------------------------------------------------------------------------------------------------------
// Apprentissage : carnet de mots, recommandations, vue Ciné-club de l'élève
// ---------------------------------------------------------------------------------------------------------------------

/** Origine d'un mot noté : séquence de film, activité (lexique d'un module) ou saisie libre. */
export type WordSourceKind = 'film' | 'activity' | 'manual';

/**
 * Mot du carnet (`learning.learner_words`) : 3 000 mots au plus par élève, unique par (mot sans casse, source).
 * `sourceId` : identifiant de séquence (`film`), `<trackVersionId>/<moduleId>` pour le lexique d'un module (`activity`),
 * null pour une saisie libre (`manual`).
 */
export interface LearnerWord {
  id: string;
  learnerId: string;
  languageId: string;
  word: string;
  /** Traduction ou remarque (200 caractères au plus ; chaîne vide si rien). */
  note: string;
  sourceKind: WordSourceKind;
  sourceId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** POST /learning/words (l'élève seulement). */
export interface NewLearnerWord { word: string; note: string; sourceKind: WordSourceKind; sourceId: string | null }
/** PATCH /learning/words/{wordId} : au moins un des deux champs. */
export interface LearnerWordPatch { word?: string; note?: string }

export type RecommenderRole = 'teacher' | 'reviewer' | 'admin';
/** Séquence proposée par le professeur (`learning.film_recommendations`) ; `note` vaut '' sans mot du professeur. */
export interface FilmRecommendation {
  id: string;
  learnerId: string;
  filmId: string;
  sequenceId: string;
  recommendedBy: string;
  recommendedByRole: RecommenderRole;
  note: string;
  createdAt: string;
  dismissedAt: string | null;
}

/** POST /learning/film-recommendations (référent, correcteur désigné, administration ; 403 pour un tiers). */
export interface NewFilmRecommendation { learnerId: string; sequenceId: string; note: string }

/** Dernier résultat de l'élève sur la leçon d'une séquence (résultats d'Évaluations par `lessonId`). */
export interface CineResult { attemptId: string; correct: number; total: number; submittedAt: string }

/** Séquence vue par l'élève dans GET /learning/cine : dernier résultat, mots notés pour elle, proposition en cours. */
export interface CineSequence extends Omit<FilmSequence, 'questions'> {
  lastResult: CineResult | null;
  words: LearnerWord[];
  recommendation: FilmRecommendation | null;
}
export interface CineFilm extends Omit<Film, 'sequences'> { sequences: CineSequence[] }

/**
 * GET /learning/cine?level=&learnerId= : films publiés de la langue de l'élève, ses résultats et ses mots par séquence,
 * les propositions en cours (plus récente d'abord) et le nombre de mots du carnet. `lastResult` vaut null partout si
 * Évaluations ne répond pas.
 */
export interface CineOverview {
  learnerId: string;
  languageId: string | null;
  level: string | null;
  films: CineFilm[];
  recommendations: FilmRecommendation[];
  wordCount: number;
}

// ---------------------------------------------------------------------------------------------------------------------
// Éditeur du catalogue (administration ou permission Catalogue) : document de film au format 1
// GET /catalogue/films, GET|PUT /catalogue/films/{filmId}, POST /catalogue/films/{filmId}/publish|retire
// ---------------------------------------------------------------------------------------------------------------------

/** Champs du film dans le document (tout autre champ est refusé en 400, sauf les champs de lecture seule ignorés). */
export interface FilmFields {
  id: string;
  languageId: string;
  /** Niveau de la langue, en minuscules (`a1`). */
  levelId: string;
  title: string;
  description: string;
  provider: 'youtube';
  videoId: string;
  channel: string;
  videoUrl: string;
  courseUrl: string;
  credit: string;
  licenseNote: string;
  durationSeconds: number;
  position: number;
}
/** Séquence du document : questions au format du document de version (corrigé compris), types choix, trous, ordre, paires. */
export interface FilmSequenceFields {
  id: string;
  position: number;
  title: string;
  start: number;
  end: number;
  approx: boolean;
  context: string;
  keywords: FilmKeyword[];
  questions: DraftQuestionV4[];
}
/** Corps de PUT /catalogue/films/{filmId} (= fichier `content/de/cine/<filmId>.json`). */
export interface FilmDocument { format?: 1; film: FilmFields; sequences: FilmSequenceFields[] }

export type FilmStatus = 'draft' | 'published';
export interface FilmIssue { path: string; message: string }
/** Complétude exigée pour publier (et pour enregistrer un film publié) ; un brouillon peut rester incomplet. */
export interface FilmChecks { publishable: boolean; issues: FilmIssue[] }

/** GET /catalogue/films : tous statuts, par niveau puis position ; aussi la réponse de publish et retire. */
export interface FilmSummary {
  id: string;
  languageId: string;
  levelId: string;
  levelCode: LevelCode;
  title: string;
  videoId: string;
  durationSeconds: number;
  position: number;
  status: FilmStatus;
  sequenceCount: number;
  publishedAt: string | null;
  updatedAt: string;
}
/** GET et PUT /catalogue/films/{filmId} : document avec corrigé, champs de lecture seule et contrôles de complétude. */
export interface FilmEditorDocument {
  film: FilmFields & { levelCode: LevelCode; status: FilmStatus; publishedAt: string | null; updatedAt: string };
  sequences: (FilmSequenceFields & { lessonId: string })[];
  checks: FilmChecks;
}

// ---------------------------------------------------------------------------------------------------------------------
// Limites (contrôlées aussi par les services : 400 au-delà)
// ---------------------------------------------------------------------------------------------------------------------

export const cineLimits = {
  wordChars: 80, noteChars: 200, wordsPerLearner: 3000, recommendationNoteChars: 300,
  sequenceMinSeconds: 180, sequenceMaxSeconds: 900, keywordsMin: 4, keywordsMax: 10, questionsMin: 5, questionsMax: 8,
  filmIdChars: 48, sequenceIdChars: 59, filmTitleChars: 120, sequenceTitleChars: 160, descriptionChars: 2000, channelChars: 120,
  urlChars: 300, creditChars: 300, licenseChars: 1000, contextChars: 4000, keywordChars: 80, translationChars: 160, keywordNoteChars: 120,
  durationMin: 60, durationMax: 14400, positionMax: 100, sequencesMax: 40,
} as const;

/** Types de question des séquences (corrigés par la clé d'exercice) : ni dictée ni répétition orale. */
export const cineQuestionTypes: readonly QuestionType[] = ['choice', 'fill', 'order', 'match'];

export const wordSourceLabels: Record<WordSourceKind, string> = { film: 'Ciné-club', activity: 'Cours', manual: 'Saisie libre' };
/** Qui propose : libellé vu par l'élève. */
export const recommenderLabels: Record<RecommenderRole, string> = { teacher: 'votre professeur', reviewer: 'votre correcteur', admin: 'l’équipe LinguaCap' };

/** Leçon des questions d'une séquence. */
export const cineLessonId = (sequenceId: string) => `cine-${sequenceId}`;
/** Source d'un mot noté depuis le lexique d'un module. */
export const moduleWordSource = (trackVersionId: string, moduleId: string) => `${trackVersionId}/${moduleId}`;
/** Adresse de la séquence dans l'espace de l'élève. */
export const sequenceHref = (filmId: string, sequenceId: string) => `/espace/cine/${encodeURIComponent(filmId)}/${encodeURIComponent(sequenceId)}`;
/** Ciné-club d'un niveau dans la bibliothèque. */
export const cineLibraryHref = (levelCode?: string | null) => `/espace/bibliotheque?${levelCode ? `niveau=${encodeURIComponent(levelCode)}&` : ''}vue=cine`;

// ---------------------------------------------------------------------------------------------------------------------
// Temps
// ---------------------------------------------------------------------------------------------------------------------

/** 450 → « 7:30 », 3725 → « 1:02:05 ». */
export function formatTimecode(total: number): string {
  const seconds = Math.max(0, Math.floor(total));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

/** « 7:30 », « 1:02:05 », « 450 » → secondes ; null si la saisie n'est pas un temps. */
export function parseTimecode(value: string): number | null {
  const text = value.trim();
  if (/^\d{1,5}$/.test(text)) return Number(text);
  const match = /^(?:(\d{1,2}):)?(\d{1,3}):(\d{2})$/.exec(text);
  if (!match) return null;
  const [, hours, minutes, seconds] = match;
  if (Number(seconds) > 59 || (hours !== undefined && Number(minutes) > 59)) return null;
  return Number(hours ?? 0) * 3600 + Number(minutes) * 60 + Number(seconds);
}

/** Durée lisible : « 45 s », « 7 min 30 », « 12 min », « 1 h 43 ». */
export function formatDuration(total: number): string {
  if (total < 60) return `${Math.max(0, Math.round(total))} s`;
  const minutes = Math.round(total / 60);
  if (total < 600) {
    const seconds = Math.round(total % 60);
    return seconds ? `${Math.floor(total / 60)} min ${String(seconds).padStart(2, '0')}` : `${Math.floor(total / 60)} min`;
  }
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return rest ? `${Math.floor(minutes / 60)} h ${String(rest).padStart(2, '0')}` : `${Math.floor(minutes / 60)} h`;
}

// ---------------------------------------------------------------------------------------------------------------------
// Lecteur YouTube (domaine sans cookie, aucun script externe) et consentement
// ---------------------------------------------------------------------------------------------------------------------

/** Seule origine intégrée (CSP `frame-src`). */
export const youtubeOrigin = 'https://www.youtube-nocookie.com';
export const youtubeConsentKey = 'lc-youtube-consent';
export const isVideoId = (value: string) => /^[A-Za-z0-9_-]{11}$/.test(value);
/** Adresse canonique d'une vidéo (forme exigée par le catalogue). */
export const youtubeVideoUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

/** Identifiant d'une vidéo collée sous forme d'adresse (watch, youtu.be, embed, shorts) ou déjà nue ; null sinon. */
export function videoIdFrom(input: string): string | null {
  const text = input.trim();
  if (isVideoId(text)) return text;
  try {
    const url = new URL(text);
    const candidate = url.hostname.endsWith('youtu.be') ? url.pathname.slice(1)
      : url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean).pop() ?? '';
    return isVideoId(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

/**
 * Adresse du lecteur intégré : bornes de la séquence, sous-titres allemands proposés, pas de vidéos d'autres chaînes à
 * la fin, contrôle par `postMessage` (enablejsapi) limité à l'origine de l'application.
 */
export function youtubeEmbedUrl(videoId: string, options: { start?: number; end?: number; autoplay?: boolean; origin?: string } = {}): string {
  const params = new URLSearchParams({ rel: '0', cc_load_policy: '1', cc_lang_pref: 'de', hl: 'de', playsinline: '1', enablejsapi: '1' });
  if (options.start !== undefined) params.set('start', String(Math.max(0, Math.floor(options.start))));
  if (options.end !== undefined) params.set('end', String(Math.max(1, Math.ceil(options.end))));
  if (options.autoplay) params.set('autoplay', '1');
  if (options.origin) params.set('origin', options.origin);
  return `${youtubeOrigin}/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}

/** Lien vers la vidéo sur YouTube (ouvert seulement si l'élève le suit). */
export function youtubeWatchUrl(videoUrl: string, start?: number): string {
  if (!start) return videoUrl;
  try {
    const url = new URL(videoUrl);
    url.searchParams.set('t', `${Math.floor(start)}s`);
    return url.toString();
  } catch {
    return videoUrl;
  }
}

/** Accord mémorisé sur cet appareil pour charger le lecteur YouTube. */
export function readYoutubeConsent(): boolean {
  try { return window.localStorage.getItem(youtubeConsentKey) === 'granted'; } catch { return false; }
}
export function writeYoutubeConsent(granted: boolean) {
  try {
    if (granted) window.localStorage.setItem(youtubeConsentKey, 'granted');
    else window.localStorage.removeItem(youtubeConsentKey);
  } catch { /* stockage indisponible : l'accord vaut pour cette page seulement */ }
}

// ---------------------------------------------------------------------------------------------------------------------
// Contrôles d'un document de film (éditeur et simulateur ; le service Catalogue applique les mêmes règles)
// ---------------------------------------------------------------------------------------------------------------------

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const blankPattern = /\[\[([A-Za-z0-9_-]{1,20})\]\]/g;
const filled = (value: string | null | undefined) => Boolean(value && value.trim());
const httpsUrl = (value: string) => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
const within = (value: string | null | undefined, max: number) => (value ?? '').length <= max;
const integer = (value: number, min: number, max: number) => Number.isInteger(value) && value >= min && value <= max;

/**
 * Structure du document (refus en 400 à l'enregistrement) : identifiants, tailles, liens, bornes des séquences (entières,
 * 3 à 15 min, dans la vidéo), mots-clés renseignés, types de question.
 */
export function filmStructureIssues(document: FilmDocument): FilmIssue[] {
  const issues: FilmIssue[] = [];
  const { film, sequences } = document;
  const push = (path: string, message: string) => issues.push({ path, message });
  if (!slugPattern.test(film.id) || film.id.length > cineLimits.filmIdChars) push('film.id', 'Identifiant du film : minuscules, chiffres et tirets, 48 caractères au plus (nicos-weg-a1).');
  if (!filled(film.levelId)) push('film.levelId', 'Niveau du film à choisir.');
  if (!filled(film.title) || !within(film.title, cineLimits.filmTitleChars)) push('film.title', 'Titre du film : 1 à 120 caractères.');
  if (!within(film.description, cineLimits.descriptionChars)) push('film.description', 'Description : 2 000 caractères au plus.');
  if (film.provider !== 'youtube' || !isVideoId(film.videoId)) push('film.videoId', 'Identifiant YouTube de 11 caractères attendu.');
  if (!filled(film.channel) || !within(film.channel, cineLimits.channelChars)) push('film.channel', 'Chaîne de diffusion à saisir (120 caractères au plus).');
  if (isVideoId(film.videoId) && film.videoUrl !== youtubeVideoUrl(film.videoId)) push('film.videoUrl', `Lien de la vidéo attendu : ${youtubeVideoUrl(film.videoId)}.`);
  if (!httpsUrl(film.courseUrl) || !within(film.courseUrl, cineLimits.urlChars)) push('film.courseUrl', 'Lien du cours gratuit de l’éditeur (https) à saisir.');
  if (!filled(film.credit) || !within(film.credit, cineLimits.creditChars)) push('film.credit', 'Crédit visible à saisir (film, éditeur, lecteur YouTube).');
  if (!within(film.licenseNote, cineLimits.licenseChars)) push('film.licenseNote', 'Note de licence : 1 000 caractères au plus.');
  if (!integer(film.durationSeconds, cineLimits.durationMin, cineLimits.durationMax)) push('film.durationSeconds', 'Durée de la vidéo : de 1 minute à 4 heures.');
  if (!integer(film.position, 1, cineLimits.positionMax)) push('film.position', 'Position parmi les films du niveau : de 1 à 100.');
  if (sequences.length > cineLimits.sequencesMax) push('sequences', '40 séquences au plus.');
  const ids = new Set<string>();
  const positions = new Set<number>();
  sequences.forEach((sequence, index) => {
    const at = `sequences[${index}]`;
    if (!sequence.id.startsWith(`${film.id}-`) || !slugPattern.test(sequence.id) || sequence.id.length > cineLimits.sequenceIdChars) {
      push(`${at}.id`, `Identifiant de séquence : « ${film.id}-01 » (commence par l’identifiant du film).`);
    } else if (ids.has(sequence.id)) push(`${at}.id`, 'Identifiant déjà pris par une autre séquence.');
    ids.add(sequence.id);
    if (positions.has(sequence.position)) push(`${at}.position`, 'Position déjà prise par une autre séquence.');
    positions.add(sequence.position);
    if (!filled(sequence.title) || !within(sequence.title, cineLimits.sequenceTitleChars)) push(`${at}.title`, 'Titre de la séquence : 1 à 160 caractères.');
    if (!Number.isInteger(sequence.start) || !Number.isInteger(sequence.end) || sequence.start < 0 || sequence.end <= sequence.start) {
      push(`${at}.end`, 'Bornes en secondes entières : la fin doit suivre le début.');
    } else {
      const length = sequence.end - sequence.start;
      if (length < cineLimits.sequenceMinSeconds || length > cineLimits.sequenceMaxSeconds) {
        push(`${at}.end`, `Durée de ${formatDuration(length)} : une séquence dure de 3 à 15 minutes.`);
      }
      if (film.durationSeconds > 0 && sequence.end > film.durationSeconds) push(`${at}.end`, 'La fin dépasse la durée de la vidéo.');
    }
    if (!filled(sequence.context) || !within(sequence.context, cineLimits.contextChars)) push(`${at}.context`, 'Contexte « avant de regarder » : 1 à 4 000 caractères.');
    sequence.keywords.forEach((keyword, position) => {
      if (!filled(keyword.word) || !within(keyword.word, cineLimits.keywordChars) || !filled(keyword.translation) || !within(keyword.translation, cineLimits.translationChars)
        || !within(keyword.plural, cineLimits.keywordChars) || !within(keyword.note, cineLimits.keywordNoteChars)) {
        push(`${at}.keywords[${position}]`, 'Mot-clé : mot (80 caractères) et traduction (160) obligatoires, remarque de 120 caractères au plus.');
      }
    });
    const questionIds = new Set<string>();
    sequence.questions.forEach((question, position) => {
      const where = `${at}.questions[${position}]`;
      if (!filled(question.id) || questionIds.has(question.id)) push(`${where}.id`, 'Identifiant de question manquant ou en double.');
      questionIds.add(question.id);
      if (!(cineQuestionTypes as readonly string[]).includes(question.type ?? 'choice')) {
        push(`${where}.type`, 'Type non proposé au Ciné-club : choix, texte à trous, ordre ou associations.');
      }
    });
  });
  const ordered = sequences.map((sequence, index) => ({ sequence, index })).sort((a, b) => a.sequence.start - b.sequence.start);
  for (let index = 1; index < ordered.length; index++) {
    const previous = ordered[index - 1].sequence;
    const { sequence, index: position } = ordered[index];
    if (sequence.start < previous.end) push(`sequences[${position}].start`, `Chevauche la séquence « ${previous.title || previous.id} ».`);
  }
  return issues;
}

/** Complétude d'une question (une seule bonne réponse, trous, ordre, paires, explication). */
function questionIssues(question: DraftQuestionV4, at: string): FilmIssue[] {
  const issues: FilmIssue[] = [];
  const push = (path: string, message: string) => issues.push({ path, message });
  const type = question.type ?? 'choice';
  if (!filled(question.prompt)) push(`${at}.prompt`, 'Consigne de la question à rédiger.');
  if (!filled(question.explanation)) push(`${at}.explanation`, 'Explication à rédiger (affichée dans le corrigé).');
  if (type === 'choice') {
    if (question.options.length < 2) push(`${at}.options`, 'Au moins deux choix.');
    if (question.options.filter((option) => option.correct).length !== 1) push(`${at}.options`, 'Une seule bonne réponse à cocher.');
    if (question.options.some((option) => !filled(option.label))) push(`${at}.options`, 'Chaque choix doit avoir un libellé.');
  } else if (type === 'fill') {
    const spec = question.spec as { text?: string; blanks?: { id: string; accept: string[] }[] } | null;
    const markers = [...(spec?.text ?? '').matchAll(blankPattern)].map((match) => match[1]);
    if (!markers.length) push(`${at}.spec`, 'Le texte doit contenir au moins un trou [[1]].');
    if ((spec?.blanks ?? []).some((blank) => !blank.accept.some(filled)) || markers.some((id) => !(spec?.blanks ?? []).some((blank) => blank.id === id))) {
      push(`${at}.spec`, 'Chaque trou du texte doit avoir sa réponse attendue.');
    }
  } else if (type === 'order') {
    const spec = question.spec as { answers?: string[][] } | null;
    if ((spec?.answers?.[0]?.filter(filled).length ?? 0) < 2) push(`${at}.spec`, 'La phrase à remettre en ordre compte au moins deux éléments.');
  } else if (type === 'match') {
    const spec = question.spec as { pairs?: { left: string; right: string }[] } | null;
    const pairs = spec?.pairs ?? [];
    if (pairs.length < 2 || pairs.some((pair) => !filled(pair.left) || !filled(pair.right))) push(`${at}.spec`, 'Au moins deux paires complètes à associer.');
  }
  return issues;
}

/** Complétude exigée pour publier : ≥ 1 séquence, contexte, 4 à 10 mots-clés, 5 à 8 questions complètes. */
export function filmCompletenessIssues(document: FilmDocument): FilmIssue[] {
  const issues: FilmIssue[] = [];
  if (!document.sequences.length) issues.push({ path: 'sequences', message: 'Au moins une séquence pour publier.' });
  document.sequences.forEach((sequence, index) => {
    const at = `sequences[${index}]`;
    if (sequence.keywords.length < cineLimits.keywordsMin || sequence.keywords.length > cineLimits.keywordsMax) {
      issues.push({ path: `${at}.keywords`, message: `De ${cineLimits.keywordsMin} à ${cineLimits.keywordsMax} mots-clés (${sequence.keywords.length} aujourd’hui).` });
    }
    if (sequence.questions.length < cineLimits.questionsMin || sequence.questions.length > cineLimits.questionsMax) {
      issues.push({ path: `${at}.questions`, message: `De ${cineLimits.questionsMin} à ${cineLimits.questionsMax} questions (${sequence.questions.length} aujourd’hui).` });
    }
    sequence.questions.forEach((question, position) => issues.push(...questionIssues(question, `${at}.questions[${position}]`)));
  });
  return issues;
}
