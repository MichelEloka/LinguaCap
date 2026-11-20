#!/usr/bin/env node
// Contrôle des contenus pédagogiques (DEV-094) : structure, identifiants, corrigés, supports, textes alternatifs,
// transcriptions et couverture des quatre compétences. Usage :
//   node infra/content/check-content.mjs                      tous les niveaux de content/de
//   node infra/content/check-content.mjs content/de/a1/02-zahlen.json   un module
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sources = join(root, 'resource-langue', 'extraits');
const icons = new Set(readFileSync(join(root, 'infra/content/icons.txt'), 'utf8').split(/\r?\n/).filter(Boolean));
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COMPETENCES = ['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'];
const VOICES = new Set(['sprecherin', 'sprecher', 'frau', 'mann']);
const SETTINGS = new Set(['cafe', 'street', 'home', 'classroom', 'office', 'station', 'park', 'shop', 'doctor', 'party',
  'kitchen', 'hotel', 'city', 'beach']);
const VISIBILITY = new Set(['on_demand', 'after_answer', 'hidden']);

const errors = [];
const warnings = [];
const fail = (where, message) => errors.push(`${where} : ${message}`);
const warn = (where, message) => warnings.push(`${where} : ${message}`);
const text = (value) => (typeof value === 'string' ? value.trim() : '');
const sized = (where, value, min, max, label) => {
  const length = text(value).length;
  if (length < min || length > max) fail(where, `${label} doit compter ${min} à ${max} caractères (actuellement ${length})`);
};

function checkQuestions(where, questions, { min, max, moduleRefs }) {
  if (!Array.isArray(questions) || questions.length < min || questions.length > max) {
    fail(where, `${min} à ${max} questions attendues`);
    return;
  }
  const ids = new Set();
  questions.forEach((question, index) => {
    const at = `${where} › question ${question?.id ?? index + 1}`;
    if (!ID.test(question?.id ?? '') || ids.has(question.id)) fail(at, 'identifiant invalide ou en double');
    ids.add(question.id);
    sized(at, question.prompt, 3, 500, 'l’énoncé');
    if (moduleRefs && !moduleRefs.has(question.moduleRef)) fail(at, `moduleRef « ${question.moduleRef} » inconnu`);
    const options = question.options ?? [];
    if (options.length < 3 || options.length > 4) fail(at, '3 ou 4 choix attendus');
    const optionIds = new Set();
    for (const option of options) {
      if (!ID.test(option?.id ?? '') || optionIds.has(option.id)) fail(at, `choix « ${option?.id} » invalide ou en double`);
      optionIds.add(option.id);
      sized(at, option.label, 1, 300, `le libellé du choix ${option.id}`);
      if (typeof option.correct !== 'boolean') fail(at, `le choix ${option.id} doit indiquer correct: true ou false`);
    }
    if (options.filter((option) => option.correct === true).length !== 1) fail(at, 'une seule bonne réponse attendue');
    const labels = options.map((option) => text(option.label).toLowerCase());
    if (new Set(labels).size !== labels.length) fail(at, 'deux choix ont le même libellé');
  });
}

function checkMedia(where, media, keys) {
  if (!Array.isArray(media)) {
    fail(where, 'media doit être une liste');
    return;
  }
  for (const item of media) {
    const at = `${where} › média ${item?.key}`;
    if (!ID.test(item?.key ?? '') || item.key.length > 64) fail(at, 'clé invalide');
    if (keys.has(item.key)) fail(at, 'clé déjà utilisée dans le niveau');
    keys.set(item.key, item);
    sized(at, item.title, 3, 120, 'le titre');
    if (item.credit !== undefined) sized(at, item.credit, 5, 200, 'le crédit (source)');
    if (item.license !== undefined) sized(at, item.license, 2, 120, 'la licence');
    if (item.kind === 'audio') {
      if (item.native) {
        // Enregistrement repris d'une ressource libre : le MP3 préparé est versionné, la source peut manquer en CI.
        if (!text(item.native.file)) fail(at, 'un enregistrement natif indique son fichier source');
        else if (!existsSync(join(sources, item.native.file)) && !existsSync(join(root, 'content/de/media/audio', `${item.key}.mp3`))) {
          fail(at, `fichier source ${item.native.file} introuvable et son non préparé`);
        }
        const clip = item.native.clip;
        if (clip !== undefined && (!Array.isArray(clip) || clip.length !== 2 || !(clip[0] >= 0) || !(clip[1] > clip[0])
            || clip[1] - clip[0] > 240)) {
          fail(at, 'extrait [début, fin] en secondes, 4 minutes au plus');
        }
        sized(at, item.transcript, 3, 4000, 'la transcription');
        continue;
      }
      if (!Array.isArray(item.script) || !item.script.some((line) => text(line.text))) {
        fail(at, 'un son de synthèse a un script');
        continue;
      }
      let characters = 0;
      for (const line of item.script) {
        if ('pause' in line) {
          if (typeof line.pause !== 'number' || line.pause < 0.3 || line.pause > 3) fail(at, 'pause de 0,3 à 3 secondes');
          continue;
        }
        if (!VOICES.has(line.voice)) fail(at, `voix « ${line.voice} » inconnue`);
        sized(at, line.text, 1, 400, 'une réplique');
        if (line.say !== undefined) sized(at, line.say, 1, 400, 'la prononciation imposée (say)');
        if (line.name !== undefined) sized(at, line.name, 1, 20, 'le nom du locuteur');
        if (/[«»]|\bfrançais\b/i.test(line.text ?? '')) warn(at, 'le son ne doit contenir que de l’allemand');
        characters += text(line.text).length;
      }
      if (characters > 2500) fail(at, 'son trop long (2 500 caractères au plus)');
    } else if (item.kind === 'image') {
      sized(at, item.alt, 10, 300, 'le texte alternatif');
      const image = item.image ?? {};
      if (item.photo) {
        // Photo ou dessin repris d'un manuel sous licence libre, recadrage facultatif en fractions [x, y, largeur, hauteur].
        if (!text(item.photo.file)) fail(at, 'une image reprise indique son fichier source');
        else if (!existsSync(join(sources, item.photo.file)) && !existsSync(join(root, 'content/de/media/images', `${item.key}.jpg`))) {
          fail(at, `fichier source ${item.photo.file} introuvable et image non préparée`);
        }
        const crop = item.photo.crop;
        if (crop !== undefined && (!Array.isArray(crop) || crop.length !== 4 || crop.some((value) => !(value >= 0 && value <= 1))
            || crop[0] + crop[2] > 1.0001 || crop[1] + crop[3] > 1.0001 || crop[2] < 0.1 || crop[3] < 0.1)) {
          fail(at, 'recadrage [x, y, largeur, hauteur] en fractions de l’image');
        }
        if (item.image) fail(at, 'une image est soit reprise (photo), soit composée (image)');
      } else if (image.layout === 'grid') {
        const items = image.items ?? [];
        if (items.length < 2 || items.length > 6) fail(at, 'une grille compte 2 à 6 pictogrammes');
        for (const cell of items) {
          if (!icons.has(cell.icon)) fail(at, `pictogramme « ${cell.icon} » inconnu`);
          sized(at, cell.label, 1, 32, 'une étiquette');
        }
      } else if (image.layout === 'single') {
        if (!icons.has(image.icon)) fail(at, `pictogramme « ${image.icon} » inconnu`);
      } else if (image.layout === 'scene') {
        if (!SETTINGS.has(image.setting)) fail(at, `lieu « ${image.setting} » inconnu`);
        if ((image.people ?? []).length > 3) fail(at, 'trois personnes au plus');
        for (const person of image.people ?? []) {
          sized(at, person.name, 1, 20, 'le nom');
          if (person.say !== undefined) sized(at, person.say, 1, 32, 'une bulle');
        }
        if ((image.items ?? []).length > 4) fail(at, 'quatre objets au plus');
        for (const icon of image.items ?? []) if (!icons.has(icon)) fail(at, `pictogramme « ${icon} » inconnu`);
      } else {
        fail(at, 'mise en page grid, single ou scene attendue');
      }
    } else {
      fail(at, 'kind audio ou image attendu');
    }
  }
}

function checkPlacements(where, placements, questions, keys, used) {
  for (const placement of placements ?? []) {
    const at = `${where} › support ${placement?.media}`;
    const media = keys.get(placement?.media);
    if (!media) {
      fail(at, 'média inconnu');
      continue;
    }
    used.add(placement.media);
    if ((placement.usage === 'audio') !== (media.kind === 'audio') || !['audio', 'illustration'].includes(placement.usage)) {
      fail(at, 'usage audio pour un son, illustration pour une image');
    }
    if (!VISIBILITY.has(placement.transcriptVisibility ?? 'hidden')) fail(at, 'transcriptVisibility invalide');
    if (placement.usage === 'illustration' && !placement.decorative) sized(at, placement.alt ?? media.alt, 10, 300, 'le texte alternatif');
    if (placement.caption) sized(at, placement.caption, 1, 300, 'la légende');
    if (placement.questionId) {
      const question = (questions ?? []).find((item) => item.id === placement.questionId);
      if (!question) fail(at, `question « ${placement.questionId} » inconnue`);
      else if (placement.optionId && !question.options.some((option) => option.id === placement.optionId)) {
        fail(at, `choix « ${placement.optionId} » inconnu`);
      }
    } else if (placement.optionId) {
      fail(at, 'un choix illustré indique aussi sa question');
    }
  }
}

function checkModule(file, module, context) {
  const where = basename(file);
  if (!ID.test(module.id ?? '') || module.id.length > 40) fail(where, 'identifiant de module invalide');
  if (context.moduleIds.has(module.id)) fail(where, `module « ${module.id} » en double`);
  sized(where, module.title, 3, 120, 'le titre');
  sized(where, module.objective, 10, 500, 'l’objectif');
  if (!Array.isArray(module.sources) || module.sources.length === 0) fail(where, 'indiquer au moins une source');
  for (const prerequisite of module.prerequisites ?? []) {
    if (!context.moduleIds.has(prerequisite)) fail(where, `prérequis « ${prerequisite} » : un module précédent du niveau est attendu`);
  }
  checkMedia(where, module.media, context.keys);
  const activities = module.activities ?? [];
  if (activities.length < 5 || activities.length > 12) fail(where, '5 à 12 activités attendues');
  let minutes = 0;
  const used = new Set();
  for (const activity of activities) {
    const at = `${where} › ${activity?.id}`;
    if (!ID.test(activity?.id ?? '') || activity.id.length > 40 || !activity.id.startsWith(`${module.id}-`)
        || activity.id.startsWith('revision-')) {
      fail(at, `identifiant invalide : préfixe « ${module.id}- », 40 caractères au plus`);
    }
    if (context.activityIds.has(activity.id)) fail(at, 'identifiant d’activité en double dans le niveau');
    context.activityIds.add(activity.id);
    if (!['lesson', 'exercise'].includes(activity.kind)) fail(at, 'kind lesson ou exercise attendu');
    sized(at, activity.title, 3, 120, 'le titre');
    if (!Number.isInteger(activity.estimatedMinutes) || activity.estimatedMinutes < 5 || activity.estimatedMinutes > 20) {
      fail(at, 'durée de 5 à 20 minutes');
    }
    minutes += activity.estimatedMinutes ?? 0;
    if (!Array.isArray(activity.competences) || activity.competences.length === 0
        || activity.competences.some((competence) => !COMPETENCES.includes(competence))) {
      fail(at, 'compétences invalides');
    }
    for (const competence of activity.competences ?? []) context.coverage[competence] = (context.coverage[competence] ?? 0) + 1;
    const lesson = activity.lesson ?? {};
    sized(at, lesson.title, 3, 120, 'le titre de la leçon');
    sized(at, lesson.description, 20, 5000, 'le texte affiché');
    if (activity.kind === 'exercise') {
      checkQuestions(at, activity.questions, { min: 4, max: 8 });
      context.questions += (activity.questions ?? []).length;
    } else if ((activity.questions ?? []).length > 0) {
      fail(at, 'une leçon n’a pas de questions');
    }
    checkPlacements(at, activity.placements, activity.questions, context.keys, used);
    const audio = (activity.placements ?? []).filter((placement) => placement.usage === 'audio');
    if (activity.competences?.includes('ecoute') && audio.length === 0) fail(at, 'une activité d’écoute a un son');
    if (activity.kind === 'exercise' && activity.competences?.includes('ecoute')
        && audio.some((placement) => placement.transcriptVisibility === 'on_demand')) {
      warn(at, 'la transcription d’un exercice d’écoute s’affiche plutôt après la réponse (after_answer)');
    }
  }
  if (minutes < 55 || minutes > 180) fail(where, `durée du module : 55 à 180 minutes (actuellement ${minutes})`);
  for (const item of module.media ?? []) if (!used.has(item.key)) fail(`${where} › média ${item.key}`, 'jamais utilisé');
  context.minutes += minutes;
  context.moduleIds.add(module.id);
  context.activities += activities.length;
}

function checkLevel(directory) {
  const levelFile = join(directory, 'level.json');
  const level = JSON.parse(readFileSync(levelFile, 'utf8'));
  const where = `${basename(directory)}/level.json`;
  const context = { moduleIds: new Set(), activityIds: new Set(), keys: new Map(), coverage: {}, minutes: 0, activities: 0, questions: 0 };
  if (!['a1', 'a2'].includes(level.levelId)) fail(where, 'levelId a1 ou a2 attendu');
  for (const entry of level.modules ?? []) {
    if (levelOnly) {
      context.moduleIds.add(entry.id);
      continue;
    }
    const file = join(directory, entry.file ?? '');
    if (!existsSync(file)) {
      fail(where, `module ${entry.file} introuvable`);
      continue;
    }
    const module = JSON.parse(readFileSync(file, 'utf8'));
    if (module.id !== entry.id) fail(where, `le fichier ${entry.file} doit contenir le module ${entry.id}`);
    checkModule(file, module, context);
  }
  const settings = level.settings ?? {};
  if (COMPETENCES.some((competence) => !(settings.expectedCompetences ?? []).includes(competence))) {
    fail(where, 'les quatre compétences sont attendues');
  }
  sized(where, settings.successCriteria, 20, 2000, 'les critères de réussite');
  if (!(settings.passPercent >= 50 && settings.passPercent <= 80)) fail(where, 'seuil de réussite de 50 à 80 %');
  checkMedia(where, level.media ?? [], context.keys);
  const used = new Set();
  const moduleRefs = new Set([...context.moduleIds, 'prerequis']);
  const diagnostic = level.diagnostic ?? {};
  sized(`${where} › diagnostic`, diagnostic.title, 3, 120, 'le titre');
  checkQuestions(`${where} › diagnostic`, diagnostic.questions, { min: 8, max: 16, moduleRefs });
  const refs = new Set((diagnostic.questions ?? []).map((question) => question.moduleRef));
  if (level.levelId === 'a2' && !refs.has('prerequis')) fail(`${where} › diagnostic`, 'le diagnostic A2 vérifie le prérequis A1');
  for (const kind of ['midterm', 'final']) {
    const assessment = (level.assessments ?? []).find((item) => item.kind === kind);
    const at = `${where} › ${kind}`;
    if (!assessment) {
      fail(at, 'évaluation manquante');
      continue;
    }
    sized(at, assessment.title, 3, 120, 'le titre');
    const parts = assessment.parts ?? [];
    const covered = new Set(parts.map((part) => part.competence));
    if (COMPETENCES.some((competence) => !covered.has(competence))) fail(at, 'une partie par compétence attendue');
    const partIds = new Set();
    for (const part of parts) {
      const partAt = `${at} › ${part.id}`;
      if (!ID.test(part.id ?? '') || partIds.has(part.id)) fail(partAt, 'identifiant invalide ou en double');
      partIds.add(part.id);
      sized(partAt, part.title, 3, 120, 'le titre');
      sized(partAt, part.instructions, 10, 4000, 'la consigne');
      const expectedMode = part.competence === 'expression-ecrite' ? 'written' : part.competence === 'expression-orale' ? 'oral' : 'closed';
      if (part.mode !== expectedMode) fail(partAt, `mode ${expectedMode} attendu pour ${part.competence}`);
      if (part.mode === 'closed') {
        checkQuestions(partAt, part.questions, { min: 4, max: 10 });
        if ((part.criteria ?? []).length) fail(partAt, 'une partie fermée n’a pas de grille');
      } else {
        if ((part.questions ?? []).length) fail(partAt, 'une production n’a pas de questions fermées');
        const criteria = part.criteria ?? [];
        if (criteria.length < 2 || criteria.length > 5) fail(partAt, '2 à 5 critères de grille');
        for (const criterion of criteria) {
          if (!ID.test(criterion.id ?? '')) fail(partAt, `critère « ${criterion.id} » invalide`);
          sized(partAt, criterion.label, 3, 200, 'le libellé du critère');
          if (!Number.isInteger(criterion.maxPoints) || criterion.maxPoints < 1 || criterion.maxPoints > 20) fail(partAt, 'points de 1 à 20');
        }
      }
      checkPlacements(partAt, part.placements, part.questions, context.keys, used);
      if (part.competence === 'ecoute' && !(part.placements ?? []).some((placement) => placement.usage === 'audio')) {
        fail(partAt, 'la partie d’écoute a un son');
      }
    }
  }
  for (const item of level.media ?? []) if (!used.has(item.key)) fail(`${where} › média ${item.key}`, 'jamais utilisé');
  for (const competence of levelOnly ? [] : COMPETENCES) {
    if ((context.coverage[competence] ?? 0) < 4) fail(where, `compétence ${competence} trop peu travaillée (${context.coverage[competence] ?? 0} activités)`);
  }
  const audio = [...context.keys.values()].filter((item) => item.kind === 'audio').length;
  const images = context.keys.size - audio;
  console.log(`${level.levelId.toUpperCase()} · ${context.moduleIds.size} modules · ${context.activities} activités · ${context.minutes} min · `
    + `${context.questions} questions d’exercice · ${audio} sons · ${images} images · compétences ${COMPETENCES.map((c) => `${c} ${context.coverage[c] ?? 0}`).join(', ')}`);
}

// --level-only : contrôle level.json (diagnostic, évaluations, médias) sans relire les fichiers de modules.
const levelOnly = process.argv.includes('--level-only');
const targets = process.argv.slice(2).filter((argument) => argument !== '--level-only');
if (targets.length === 0) {
  for (const level of ['a1', 'a2']) {
    const directory = join(root, 'content/de', level);
    if (existsSync(join(directory, 'level.json'))) checkLevel(directory);
  }
} else {
  for (const target of targets) {
    const path = resolve(target);
    if (statSync(path).isDirectory()) {
      checkLevel(path);
    } else {
      const context = { moduleIds: new Set(), activityIds: new Set(), keys: new Map(), coverage: {}, minutes: 0, activities: 0, questions: 0 };
      const module = JSON.parse(readFileSync(path, 'utf8'));
      // Un module seul peut citer des prérequis du niveau : ils sont acceptés s'ils figurent dans level.json.
      const levelFile = join(dirname(path), 'level.json');
      if (existsSync(levelFile)) {
        // Les modules qui précèdent dans level.json sont des prérequis possibles, même s'ils ne sont pas encore écrits.
        for (const entry of JSON.parse(readFileSync(levelFile, 'utf8')).modules ?? []) {
          if (entry.id === module.id) break;
          context.moduleIds.add(entry.id);
        }
      } else {
        for (const prerequisite of module.prerequisites ?? []) context.moduleIds.add(prerequisite);
      }
      checkModule(path, module, context);
      console.log(`${basename(path)} · ${context.activities} activités · ${context.minutes} min · ${context.questions} questions · ${context.keys.size} médias`);
    }
  }
}
for (const message of warnings) console.log(`Avertissement · ${message}`);
for (const message of errors) console.error(`Erreur · ${message}`);
if (errors.length) {
  console.error(`${errors.length} erreur(s).`);
  process.exit(1);
}
console.log('Contenus conformes.');
