// Lecture des contenus pédagogiques (content/de) partagée par l'importeur, le rendu des images et les contrôles.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const contentDir = join(root, 'content', 'de');
export const audioDir = join(contentDir, 'media', 'audio');
export const imageDir = join(contentDir, 'media', 'images');
/**
 * V2 de référence (A1, A2), source de la construction V4 : modules JSON et MP3 d'origine. Les enregistrements natifs
 * de content/de sont tirés de ces MP3 (ralentis au besoin) et portent souvent la même clé : ils ne doivent pas les écraser.
 */
export const baseDir = join(root, 'content', 'base', 'de');
export const baseAudioDir = join(baseDir, 'media', 'audio');
/** Extraits des ressources sous licence libre (non versionnés) : enregistrements et images de Deutsch im Blick. */
export const sourcesDir = join(root, 'resource-langue', 'extraits');
/** Fichiers téléchargés sous licence libre (Commons, Wikinews…), non versionnés ; registre versionné dans content/b/libre. */
export const libreDir = join(root, 'resource-langue', 'libre');
export const registryFile = join(root, 'content', 'b', 'libre', 'registre.json');
/** Identifiant de niveau de parcours (échelle CECRL) : un dossier content/de/<id> avec level.json est un niveau disponible. */
export const LEVEL_ID = /^[abc][12]$/;

/**
 * Fichier source d'un enregistrement natif ou d'une photo : « libre/… » se lit sous resource-langue/libre (téléchargements
 * sous licence libre), tout autre chemin sous resource-langue/extraits (Deutsch im Blick).
 */
export function sourceFile(path) {
  const value = String(path ?? '');
  return value.startsWith('libre/') ? join(root, 'resource-langue', value) : join(sourcesDir, value);
}
export const isLibre = (path) => String(path ?? '').startsWith('libre/');

/** Registre des fichiers téléchargés : chemin « libre/… » → entrée (empreinte, source, auteur, licence, URL…). */
export function loadRegistry(file = registryFile) {
  if (!existsSync(file)) return new Map();
  const registry = JSON.parse(readFileSync(file, 'utf8'));
  return new Map((registry.files ?? []).map((entry) => [entry.path, entry]));
}

/**
 * Voix de synthèse : nom employé dans les scripts → { model, speaker? }. Les quatre voix de base (Kerstin, Thorsten) sont
 * toujours connues ; infra/content/tts/voices.json (lot médias) ajoute les voix des niveaux B. Sans ce fichier, les voix
 * prévues (frau2, frau3, mann2, mann3) restent admises et sont synthétisées par les voix de base (repli signalé).
 */
export const voicesFile = join(root, 'infra', 'content', 'tts', 'voices.json');
export const BASE_VOICES = {
  frau: { model: 'de_DE-kerstin-medium' }, sprecherin: { model: 'de_DE-kerstin-medium' },
  mann: { model: 'de_DE-thorsten-medium' }, sprecher: { model: 'de_DE-thorsten-medium' },
};
export const PLANNED_VOICES = {
  frau2: { model: 'de_DE-kerstin-medium' }, frau3: { model: 'de_DE-kerstin-medium' },
  mann2: { model: 'de_DE-thorsten-medium' }, mann3: { model: 'de_DE-thorsten-medium' },
};
export function loadVoices(file = voicesFile) {
  if (!existsSync(file)) return { voices: { ...BASE_VOICES, ...PLANNED_VOICES }, configured: false };
  const configured = JSON.parse(readFileSync(file, 'utf8'));
  const voices = { ...BASE_VOICES };
  for (const [name, value] of Object.entries(configured)) {
    if (name.startsWith('_') || !value || typeof value !== 'object' || typeof value.model !== 'string') continue;
    voices[name] = { model: value.model, ...(Number.isInteger(value.speaker) ? { speaker: value.speaker } : {}) };
  }
  return { voices, configured: true };
}

/** Types de question du format 4 ; une question sans type est un choix (formats antérieurs, B1). */
export const QUESTION_TYPES = ['choice', 'fill', 'order', 'match', 'dictation', 'speak'];
export const questionType = (question) => question?.type ?? 'choice';
/** Format du niveau : 4 pour la V4 (questions typées, missions, lexique), sinon formats antérieurs. */
export const levelFormat = (level) => (Number.isInteger(level?.format) ? level.format : 3);

/** Origine et licence enregistrées dans la médiathèque (crédit « source · licence »). */
export const CREDITS = {
  dib: { source: 'Deutsch im Blick, 2e éd., COERLL, Université du Texas à Austin', license: 'CC BY 4.0' },
  piper: { source: 'LinguaCap, voix de synthèse Piper Thorsten (voix féminines par transformation)', license: 'Voix CC0' },
  lucide: { source: 'LinguaCap, pictogrammes Lucide', license: 'ISC' },
};

/** Crédit d'un média : celui indiqué dans le contenu, sinon celui de sa technique de production. */
export function creditOf(media) {
  if (media.credit) return { source: media.credit, license: media.license ?? 'CC BY 4.0' };
  if (media.kind === 'audio') return media.native ? CREDITS.dib : CREDITS.piper;
  return media.photo ? CREDITS.dib : CREDITS.lucide;
}

/** Niveau complet : réglages, évaluations et modules dans l'ordre de level.json (content/de, ou base indiquée). */
export function loadLevel(levelId, base = contentDir) {
  const directory = join(base, levelId);
  const level = JSON.parse(readFileSync(join(directory, 'level.json'), 'utf8'));
  const modules = (level.modules ?? []).map((entry) => {
    const file = join(directory, entry.file);
    if (!existsSync(file)) throw new Error(`Module ${entry.file} introuvable pour ${levelId}.`);
    return JSON.parse(readFileSync(file, 'utf8'));
  });
  return { ...level, moduleFiles: level.modules, modules };
}

/**
 * Niveaux disponibles : dossiers <base>/<id> (a1 … c2) qui ont un level.json, dans l'ordre de l'échelle CECRL. Un niveau
 * construit partiellement (aperçu « --only » de build-b, « partial: true ») n'est jamais un niveau disponible de content/de.
 */
export function availableLevels(base = contentDir) {
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && LEVEL_ID.test(entry.name) && existsSync(join(base, entry.name, 'level.json')))
    .map((entry) => entry.name).sort();
}

/** Tous les médias d'un niveau, modules et évaluations, avec leur niveau. */
export function allMedia(level) {
  return [...level.modules.flatMap((module) => module.media ?? []), ...(level.media ?? [])];
}

/** Banque du test de niveau (content/de/placement/placement.json) : paliers, questions, sons d'écoute. */
export const placementFile = join(contentDir, 'placement', 'placement.json');

/** Test de niveau source, ou null s'il n'est pas encore rédigé. */
export function loadPlacement() {
  return existsSync(placementFile) ? JSON.parse(readFileSync(placementFile, 'utf8')) : null;
}

/** Médias du test de niveau, chacun avec le palier (a1, a2, b1…) de la question qui l'utilise. */
export function placementMedia(placement) {
  const tiers = new Map();
  for (const tier of placement?.tiers ?? []) {
    for (const question of tier.questions ?? []) {
      for (const item of question.placements ?? []) if (!tiers.has(item.media)) tiers.set(item.media, tier.code.toLowerCase());
    }
  }
  return (placement?.media ?? []).map((media) => ({ ...media, tier: tiers.get(media.key) ?? null }));
}

/** Transcription affichée à l'élève : une réplique par ligne, précédée du nom du locuteur s'il est donné. */
export function transcriptOf(media) {
  if (media.native) return media.transcript.trim();
  const lines = [];
  for (const line of media.script ?? []) {
    if (!line.text) continue;
    lines.push(line.name ? `${line.name} : ${line.text.trim()}` : line.text.trim());
  }
  return lines.join('\n');
}

/** Texte prononcé seul (sans noms), pour le contrôle par reconnaissance vocale. */
export function spokenText(media) {
  if (media.native) return media.transcript.trim();
  return (media.script ?? []).filter((line) => line.text).map((line) => line.text.trim()).join(' ');
}

/**
 * Répliques prononcées d'un son de synthèse, sans les pauses. Pour un son à segments (lexique), le numéro de ligne
 * d'une entrée (audio.line) et l'indice du segment dans le manifeste désignent cette liste.
 */
export function spokenLines(media) {
  return (media.script ?? []).filter((line) => typeof line.text === 'string' && line.text.trim());
}

export function audioFile(media, directory = audioDir) {
  return join(directory, `${media.key}.mp3`);
}

/**
 * Manifeste des sons générés (synthesize-v3.py) : clé → { audioProfile, seconds, sha256, segments?… }. Les sons à
 * segments (lexique) y portent un segment { start, end } en secondes par réplique prononcée. Objet vide s'il manque.
 */
export function audioManifest(directory = audioDir) {
  const file = join(directory, 'manifest-v3.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).items ?? {} : {};
}

/** Les photos et dessins repris d'un manuel sont en JPEG, les illustrations composées en PNG. */
export function imageFile(media) {
  return join(imageDir, `${media.key}.${media.photo ? 'jpg' : 'png'}`);
}
