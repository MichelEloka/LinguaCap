#!/usr/bin/env node
// Écrit le texte attendu de chaque son (clé → texte prononcé) pour le contrôle par reconnaissance vocale.
// Usage : node infra/content/expected-transcripts.mjs <fichier de sortie> [a1|a2|placement …] [--segments]
//   sans niveau : tous les niveaux et le test de niveau.
//   --content <dossier> : niveaux construits ailleurs (aperçu de build-v4), manifeste dans <dossier>/media/audio.
//   --segments : ajoute une entrée par ligne des sons à segments (lexique) : « clé@n » → { key, text, start, end },
//                d'après le manifeste audio (le segment est découpé puis retranscrit seul).
import { existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  allMedia, audioManifest, contentDir, courseLevelIds, loadLevel, loadPlacement, placementMedia, spokenLines, spokenText,
} from './content-lib.mjs';

const args = process.argv.slice(2);
const contentIndex = args.indexOf('--content');
const base = contentIndex >= 0 ? resolve(args[contentIndex + 1]) : contentDir;
const [output, ...targets] = args.filter((value, index) => !value.startsWith('--') && (contentIndex < 0 || index !== contentIndex + 1));
const withSegments = args.includes('--segments');
const manifest = withSegments ? audioManifest(join(base, 'media', 'audio')) : {};
const levels = courseLevelIds.filter((levelId) => existsSync(join(base, levelId, 'level.json')));
const expected = {};
for (const target of targets.length ? targets : [...levels, ...(base === contentDir ? ['placement'] : [])]) {
  if (target === 'placement') {
    for (const media of placementMedia(loadPlacement())) if (media.kind === 'audio') expected[media.key] = spokenText(media);
    continue;
  }
  let level;
  try {
    level = loadLevel(target, base);
  } catch {
    // Niveau en cours de rédaction : seuls les modules présents sont contrôlés.
    continue;
  }
  for (const media of allMedia(level)) {
    if (media.kind !== 'audio') continue;
    expected[media.key] = spokenText(media);
    const segments = manifest[media.key]?.segments;
    if (!media.segments || !segments) continue;
    spokenLines(media).forEach((line, index) => {
      if (segments[index]) expected[`${media.key}@${index}`] = { key: media.key, text: line.text.trim(), ...segments[index] };
    });
  }
}
writeFileSync(output, JSON.stringify(expected, null, 2));
console.log(`${Object.keys(expected).length} son(s) ou segment(s) attendus.`);
