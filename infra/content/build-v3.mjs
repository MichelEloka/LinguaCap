#!/usr/bin/env node
// Prépare un dépôt minimal autonome dans target, à partir du contenu versionné.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { allMedia, imageFile, loadLevel, root } from './content-lib.mjs';
import { renderWorkbook } from './render-v3-workbook.mjs';
import sounds from '../../content/v3/source/a1-sons.mjs';

const edition = process.argv.includes('--v4') ? 'v4' : 'v3';
const bundle = join(root, 'target', `linguacap-cours-${edition}-kit`);
const content = join(bundle, 'content', 'de');
const sourceNote = 'LinguaCap V3, textes et exercices originaux inspirés par la progression de Deutsch im Blick (COERLL) et Der und mehr (KSU).';
const levels = ['a1', 'a2'];
const voiceAttribution = {
  credit: 'LinguaCap, synthèse Piper avec Thorsten Müller (CC0) et Kerstin, préentraînée sur la voix de Cori Samuel (Hi-Fi TTS, CC BY 4.0)',
  license: 'Jeux de données des voix : CC0 et CC BY 4.0',
};

function write(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function copy(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}

function audioPlacement(key, visibility) {
  return { media: key, usage: 'audio', transcriptVisibility: visibility, decorative: false };
}

function activity(moduleId, suffix, title, estimatedMinutes, competences, description, placements = [], questions = []) {
  return {
    id: `${moduleId}-${suffix}`, kind: questions.length ? 'exercise' : 'lesson', title, estimatedMinutes, competences,
    lesson: { title, description, transcript: null }, placements, questions,
  };
}

function speech(key, title, script) {
  return { key, kind: 'audio', title, script, ...voiceAttribution };
}

function makeWorkshop(spec, id, prerequisites, audioProfile, nativeByKey) {
  const { title, goal, guide, drill, dialogue, quiz, task } = spec;
  const dialog = speech(`${id}-dialogue`, `${title} · scène`, dialogue.map((line, index) => ({
    voice: index % 2 ? 'mann' : 'frau',
    ...(typeof line === 'string' ? { text: line } : line),
  })));
  const soundModel = spec.soundModel && speech(`${id}-modele`, `${title} · modèles`,
    spec.soundModel.flatMap((text, index) => [
      ...(index ? [{ pause: 0.9 }] : []),
      { voice: 'sprecherin', text },
    ]));
  const native = spec.native && { ...nativeByKey.get(spec.native), key: `${id}-natif`, v3SourceKey: spec.native };
  const model = soundModel || native;
  const questions = quiz.map(([prompt, choices], index) => ({
    id: `q${index + 1}`, prompt,
    options: choices.map((_, rank) => {
      const position = (rank + index * 2) % choices.length;
      return { id: 'abcd'[rank], label: choices[position], correct: position === 0 };
    }),
  }));
  const correction = quiz.map(([prompt, [answer], feedback], index) =>
    `${index + 1}. ${prompt}\n${answer} — ${feedback}`).join('\n\n');
  return {
    id, title, objective: goal, prerequisites, audioProfile,
    sources: [
      ...(spec.sources ?? [sourceNote]),
      ...(native ? ['Deutsch im Blick, phonétique chapitre 1, voix originale, tempo ajusté, CC BY 4.0.'] : []),
    ],
    media: [...(model ? [model] : []), dialog],
    activities: [
      activity(id, 'guide', spec.guideTitle ?? 'Comprendre et repérer', 20, model ? ['lecture', 'ecoute', 'expression-orale'] : ['lecture'],
        guide, model ? [audioPlacement(model.key, 'on_demand')] : []),
      activity(id, 'pratique', spec.drillTitle ?? 'Écouter et s’entraîner', 20, ['ecoute', 'expression-orale'],
        drill, [audioPlacement(dialog.key, 'on_demand')]),
      ...(spec.lesson ? [
        activity(id, 'approfondir', spec.lessonTitle, 20, ['lecture', 'expression-ecrite'], spec.lesson),
      ] : []),
      activity(id, 'controle', 'Vérifier sa compréhension', 12, ['ecoute', 'lecture'],
        'Faites une première écoute pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Répondez de mémoire aux questions de réemploi. Vérifiez ensuite vos réponses dans l’activité suivante.',
        [audioPlacement(dialog.key, 'after_answer')], questions),
      activity(id, 'correction', 'Comprendre ses réponses', 8, ['lecture', 'expression-ecrite'],
        `CORRECTION COMMENTÉE · 8 MIN\n\n${correction}\n\nSans regarder le corrigé, reformulez deux réponses dans votre cahier. Rejouez la phrase qui vous a aidé à les trouver.`),
      activity(id, 'mission', 'Réaliser la mission', 20, ['expression-ecrite', 'expression-orale'], task),
    ],
  };
}

function extendModules(modules, extensions, nativeByKey) {
  const after = new Map();
  const moduleIds = new Set(modules.map(({ id }) => id));
  for (const spec of extensions) {
    if (!moduleIds.has(spec.after) || after.has(spec.after) || moduleIds.has(spec.id)) {
      throw new Error(`Impossible d’insérer le module ${spec.id} après ${spec.after}.`);
    }
    if (!spec.lessonTitle || !spec.lesson || !spec.soundModel?.length || !spec.sources?.length) {
      throw new Error(`Le module ${spec.id} requiert une troisième leçon, un modèle audio et des sources.`);
    }
    after.set(spec.after, spec);
  }
  return modules.flatMap((module) => {
    const prerequisites = module.prerequisites.map((key) => after.get(key)?.id ?? key);
    const preceding = { ...module, prerequisites };
    const spec = after.get(module.id);
    if (!spec) return [preceding];
    return [preceding, makeWorkshop(spec, spec.id, [module.id], spec.audioProfile ?? module.audioProfile, nativeByKey)];
  });
}

function withModuleProfiles(module, levelId, index, prerequisites) {
  const early = index < (levelId === 'a1' ? 3 : 4);
  prepareAudioReferences(module.media, module.activities);
  return { ...module, prerequisites, audioProfile: `${levelId}-${early ? 'debut' : 'suite'}` };
}

function prepareAudioReferences(media, activities) {
  const renamed = new Map();
  for (const item of media) {
    if (item.kind !== 'audio') continue;
    if (item.native) {
      item.v3SourceKey = item.key;
    } else {
      const legacyKey = item.key;
      item.key += '-v3';
      renamed.set(legacyKey, item.key);
      Object.assign(item, voiceAttribution);
    }
  }
  for (const activity of activities) {
    for (const placement of activity.placements ?? []) {
      if (renamed.has(placement.media)) placement.media = renamed.get(placement.media);
    }
  }
}

async function compileLevel(levelId) {
  const level = loadLevel(levelId);
  const base = level.modules;
  delete level.moduleFiles;
  const nativeByKey = new Map(allMedia({ ...level, modules: base }).filter((media) => media.native).map((media) => [media.key, media]));
  const workshops = (await import(`../../content/v3/source/${levelId}.mjs`)).default;
  if (workshops.length !== base.length || base.some(({ id }) => workshops.filter((item) => item.id === id).length !== 1)) {
    throw new Error(`Un atelier par module est attendu pour ${levelId}.`);
  }
  let modules = [];
  let previous = null;
  if (levelId === 'a1') {
    for (const spec of sounds) {
      const profile = spec.id === 'a1-abc' ? 'a1-alphabet' : 'a1-debut';
      modules.push(makeWorkshop(spec, spec.id, previous ? [previous] : [], profile, nativeByKey));
      previous = spec.id;
    }
  }
  for (const [index, module] of base.entries()) {
    const baseModule = withModuleProfiles(module, levelId, index, previous ? [previous] : module.prerequisites);
    modules.push(baseModule);
    const workshop = workshops.find(({ id }) => id === module.id);
    previous = `${module.id}-atelier`;
    modules.push(makeWorkshop(workshop, previous, [module.id], baseModule.audioProfile, nativeByKey));
  }
  if (edition === 'v4') {
    const extensions = (await import(`../../content/v4/source/${levelId}.mjs`)).default;
    if (extensions.length !== 2 || new Set(extensions.map(({ id }) => id)).size !== extensions.length) {
      throw new Error(`Deux nouveaux modules aux identifiants distincts sont attendus pour ${levelId}.`);
    }
    modules = extendModules(modules, extensions, nativeByKey);
  }
  const files = modules.map(({ id }, index) => ({ id, file: `${String(index + 1).padStart(2, '0')}-${id}.json` }));
  // Les deux évaluations interviennent après les séquences d’apprentissage de leur niveau.
  prepareAudioReferences(level.media, level.assessments.flatMap(({ parts }) => parts));
  level.media.forEach((media) => { if (media.script) media.audioProfile = `${levelId}-suite`; });
  if (levelId === 'a1') {
    level.diagnostic.description = 'Vous vous familiarisez peut-être avec l’allemand pour la première fois. Répondez comme vous le pouvez, sans dictionnaire. Vous pouvez commencer par l’alphabet, les sons et l’épellation avant de travailler les échanges simples. Prévoyez environ 10 minutes pour les 12 questions de ce point de départ.';
    level.assessments.find(({ kind }) => kind === 'midterm').description =
      'Ce bilan de 30 minutes reprend les premières séquences du parcours, de l’épellation aux horaires de la journée. Lisez trois documents, écoutez cinq scènes, puis préparez un message écrit et un court enregistrement. Chaque compétence compte pour 5 points. Après correction, refaites un exercice et une mission sur votre point le plus fragile.';
    const oral = level.assessments.find(({ kind }) => kind === 'final').parts.find(({ mode }) => mode === 'oral');
    oral.instructions = oral.instructions.replace('Name · Alter', 'Name (épelez votre nom) · Alter');
    oral.criteria[0].label = 'Tâches réalisées : présentation avec nom épelé, une question et une réponse par carte, trois demandes adaptées';
  }
  if (edition === 'v4' && levelId === 'a2') {
    const final = level.assessments.find(({ kind }) => kind === 'final');
    final.description = final.description.replace('sur l’ensemble des huit modules', 'sur les grands thèmes du niveau A2');
  }
  const directory = join(content, levelId);
  write(join(directory, 'level.json'), { ...level, modules: files });
  modules.forEach((module, index) => write(join(directory, files[index].file), module));
  writeFileSync(join(bundle, `${levelId.toUpperCase()}.html`), renderWorkbook({ ...level, modules }, edition.toUpperCase()));

  // Les images sont distribuées depuis les médias préparés. L’outil audio prépare les MP3 à l’étape suivante.
  for (const media of allMedia({ ...level, modules })) {
    if (media.kind !== 'image') continue;
    const name = `${media.key}.${media.photo ? 'jpg' : 'png'}`;
    copy(imageFile(media), join(content, 'media', 'images', name));
  }
  console.log(`${levelId.toUpperCase()} · ${modules.length} modules · ${modules.reduce((total, module) =>
    total + module.activities.reduce((minutes, entry) => minutes + entry.estimatedMinutes, 0), 0)} min.`);
}

for (const level of levels) await compileLevel(level);
const kit = ['check-content.mjs', 'content-lib.mjs', 'import-content.mjs', 'icons.txt'];
for (const name of kit) copy(join(root, 'infra', 'content', name), join(bundle, 'infra', 'content', name));
const credits = JSON.parse(readFileSync(join(root, 'content', 'de', 'media', 'credits.json'), 'utf8'));
credits.sources[0].changes += ' ; tempo de plusieurs enregistrements adapté au niveau en V3, hauteur conservée';
const voices = credits.sources.find(({ name }) => name.startsWith('Piper'));
Object.assign(voices, {
  name: 'Piper 1.8 · Thorsten et Kerstin',
  author: 'Thorsten Müller, OHF Voice et Cori Samuel (Hi-Fi TTS, locutrice 92)',
  license: 'Données Thorsten et modèle de base rdh : CC0. Données Kerstin : CC0. Voix de base Hi-Fi TTS de Cori Samuel : CC BY 4.0.',
  url: 'https://huggingface.co/rhasspy/piper-voices/tree/cf910fb59f1d79ab3b625a63993a108751c6c25d/de/de_DE',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  used: `Toutes les synthèses vocales du kit ${edition.toUpperCase()}, avec débits progressifs par niveau.`,
});
write(join(content, 'media', 'credits.json'), credits);
copy(join(root, 'content', edition, 'README.md'), join(bundle, 'README.md'));
console.log(bundle);
