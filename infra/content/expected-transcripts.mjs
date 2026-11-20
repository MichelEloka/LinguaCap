#!/usr/bin/env node
// Écrit le texte attendu de chaque son (clé → texte prononcé) pour le contrôle par reconnaissance vocale.
// Usage : node infra/content/expected-transcripts.mjs <fichier de sortie> [a1|a2 …]
import { writeFileSync } from 'node:fs';
import { allMedia, availableLevels, loadLevel, spokenText } from './content-lib.mjs';

const [output, ...levels] = process.argv.slice(2);
const expected = {};
for (const levelId of levels.length ? levels : availableLevels()) {
  let level;
  try {
    level = loadLevel(levelId);
  } catch {
    // Niveau en cours de rédaction : seuls les modules présents sont contrôlés.
    continue;
  }
  for (const media of allMedia(level)) if (media.kind === 'audio') expected[media.key] = spokenText(media);
}
writeFileSync(output, JSON.stringify(expected, null, 2));
console.log(`${Object.keys(expected).length} son(s) attendus.`);
