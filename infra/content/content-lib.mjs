// Lecture des contenus pédagogiques (content/de) partagée par l'importeur, le rendu des images et les contrôles.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const contentDir = join(root, 'content', 'de');
export const audioDir = join(contentDir, 'media', 'audio');
export const imageDir = join(contentDir, 'media', 'images');
/** Extraits des ressources sous licence libre (non versionnés) : enregistrements et images de Deutsch im Blick. */
export const sourcesDir = join(root, 'resource-langue', 'extraits');

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

/** Niveau complet : réglages, évaluations et modules dans l'ordre de level.json. */
export function loadLevel(levelId) {
  const directory = join(contentDir, levelId);
  const level = JSON.parse(readFileSync(join(directory, 'level.json'), 'utf8'));
  const modules = (level.modules ?? []).map((entry) => {
    const file = join(directory, entry.file);
    if (!existsSync(file)) throw new Error(`Module ${entry.file} introuvable pour ${levelId}.`);
    return JSON.parse(readFileSync(file, 'utf8'));
  });
  return { ...level, moduleFiles: level.modules, modules };
}

export function availableLevels() {
  return ['a1', 'a2'].filter((levelId) => existsSync(join(contentDir, levelId, 'level.json')));
}

/** Tous les médias d'un niveau, modules et évaluations, avec leur niveau. */
export function allMedia(level) {
  return [...level.modules.flatMap((module) => module.media ?? []), ...(level.media ?? [])];
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

export function audioFile(media) {
  return join(audioDir, `${media.key}.mp3`);
}

/** Les photos et dessins repris d'un manuel sont en JPEG, les illustrations composées en PNG. */
export function imageFile(media) {
  return join(imageDir, `${media.key}.${media.photo ? 'jpg' : 'png'}`);
}
