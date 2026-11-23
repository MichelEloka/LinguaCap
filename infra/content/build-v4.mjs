#!/usr/bin/env node
// Construction de la V4 officielle (format 4) : le kit V4 composé à partir de la V2 de référence (content/base/de), des
// ateliers V3 (content/v3/source) et des ajouts V4 (content/v4/source), complété par les illustrations V4
// (content/v4/source/images-v4.json) et par les couches pédagogiques rédigées module par module
// (content/v4/pedagogy/<niveau>/<moduleId>.mjs et _level.mjs, format décrit dans content/v4/pedagogy/README.md).
//
// Usage :
//   node infra/content/build-v4.mjs                                   A1 et A2 dans content/de (modules périmés supprimés)
//   node infra/content/build-v4.mjs --level a1 --out target/v4-preview   aperçu d'un niveau, sans toucher content/de
//   node infra/content/build-v4.mjs --kit target/linguacap-cours-v4-kit   en plus : kit hors ligne (A1.html, A2.html, médias)
//   options : --level a1|a2 (répétable), --out <dossier>, --pedagogy <dossier de couches>, --kit <dossier>,
//             --prune-audio (supprime de content/de/media/audio les sons qu'aucun niveau n'emploie), --quiet
//
// Fait automatiquement : retrait des activités « -correction », explications reprises des quiz des ateliers, mission
// provisoire tirée de la tâche des ateliers (à relire), sons et supports des questions dictation et speak, son du
// lexique (segments), prérequis en chaîne dans l'ordre du niveau, profils audio, level.json au format 4.
// Les sons (synthesize-v3.py) et les images (render-images.mjs) sont produits ensuite, dans content/de/media.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONTROL_DESCRIPTION, composeCredits, composeLevel, voiceAttribution } from './build-v3.mjs';
import {
  QUESTION_TYPES, allMedia, audioFile, availableLevels, contentDir, imageFile, loadLevel, loadPlacement, placementMedia, root,
} from './content-lib.mjs';
import { renderWorkbook } from './render-v3-workbook.mjs';

export const FORMAT = 4;
const LEVELS = ['a1', 'a2'];
/** Fourchettes de durée des activités (EVO-041), remplacées par minutes de _level.mjs. */
export const BUDGETS = { a1: { min: 2200, max: 2300 }, a2: { min: 2050, max: 2200 } };
/** Mots minimum de la partie écrite d'une mission, si la couche ne le précise pas. */
const MIN_WORDS = { a1: 25, a2: 40 };
const V4_CONTROL_DESCRIPTION = 'Faites une première écoute pour la situation générale. Lisez les questions, puis réécoutez pour les détails. Répondez de mémoire aux questions de réemploi. Après la validation, chaque question affiche la réponse attendue et une explication.';
const SLOW_PROFILE = 'a1-debut';
const LEXICON_PAUSE = 0.9;
// Voix du lexique : Thorsten (sprecher). Sur des mots isolés, Kerstin est mal reconnue (contrôle par reconnaissance
// vocale du lexique a1-abc : 19 % de mots en écart contre 3 % pour Thorsten) ; sur des phrases, l'écart est faible.
const LEXICON_VOICE = 'sprecher';

const LAYER_KEYS = new Set(['module', 'title', 'objective', 'grammarFocus', 'vocabulary', 'media', 'activities', 'add', 'order']);
const PATCH_KEYS = new Set(['kind', 'title', 'estimatedMinutes', 'competences', 'lesson', 'explanations', 'feedback', 'questions',
  'addQuestions', 'removeQuestions', 'placements', 'mission']);
const LEVEL_KEYS = new Set(['order', 'minutes', 'settings', 'midtermTitle', 'midtermDescription', 'finalTitle', 'finalDescription']);

const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const words = (text) => String(text ?? '').trim().split(/\s+/).filter(Boolean);
const clip = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`);

/** Identifiant d'une entrée de lexique tiré du mot : minuscules, translittération, tirets. */
export function slugOf(text) {
  return String(text).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'mot';
}

/** Ligne prononcée pour une entrée de lexique : « der Kopf, die Köpfe », « anfangen », « die Eltern ». */
export function lexiconLine(entry) {
  if (entry.partOfSpeech !== 'noun') return entry.word.trim();
  const article = entry.article ?? (/pluriel/i.test(entry.note ?? '') ? 'die' : null);
  const head = article ? `${article} ${entry.word.trim()}` : entry.word.trim();
  const plural = typeof entry.plural === 'string' ? entry.plural.trim() : '';
  if (!plural || /^[-–—]$/.test(plural)) return head;
  return `${head}, ${/^die\s/i.test(plural) ? plural : `die ${plural}`}`;
}

/** Seuil par défaut d'une répétition : 80 jusqu'à 3 mots, 75 au-delà. */
export const defaultThreshold = (text) => (words(text).length <= 3 ? 80 : 75);

/**
 * Mission provisoire tirée de la tâche d'un atelier : préparation, partie orale, partie écrite et vérification.
 * Trois rédactions existent (« Préparation (4 min). … », paragraphes « 3 min — … » et puces « 5 min • … »).
 */
export function missionFromTask(task, levelId) {
  const text = String(task ?? '').trim();
  const parts = {};
  const marked = [...text.matchAll(/(Préparation|Oral|Écrit|Vérification) \(\d+ min\)\.\s*/g)];
  if (marked.length >= 2) {
    marked.forEach((match, index) => {
      const end = index + 1 < marked.length ? marked[index + 1].index : text.length;
      parts[{ Préparation: 'prep', Oral: 'oral', Écrit: 'written', Vérification: 'verify' }[match[1]]] =
        text.slice(match.index + match[0].length, end).trim();
    });
  } else {
    // Étapes « 3 min — … » (paragraphes) ou « 5 min • … » (lignes) : préparation, oral, écrit éventuel, vérification.
    const steps = [];
    const others = [];
    for (const block of text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)) {
      const lines = block.split(/\n(?=\d+ min\s*[—•-])/);
      for (const line of lines) {
        if (/^\d+ min\s*[—•-]/.test(line)) steps.push(line.replace(/^\d+ min\s*[—•-]\s*/, '').trim());
        else others.push(line);
      }
    }
    const success = others.find((paragraph) => /^Réussi si/i.test(paragraph));
    const model = others.find((paragraph) => /^Modèle\b/.test(paragraph));
    if (steps.length >= 3) {
      parts.prep = steps[0];
      parts.oral = steps[1];
      const writes = /(?<!\p{L})(Écrivez|Rédigez)(?!\p{L})/u.test(steps[2]);
      if (writes) parts.written = steps[2];
      parts.verify = steps.slice(writes ? 3 : 2).join(' ');
    }
    if (model && parts.oral) parts.oral = `${parts.oral}\n\n${model}`;
    if (success) parts.verify = [parts.verify, success].filter(Boolean).join(' ');
  }
  const minWords = Number(/(\d+)\s*à\s*\d+\s*mots/.exec(parts.written ?? '')?.[1] ?? MIN_WORDS[levelId] ?? 25);
  const sentences = (parts.verify ?? '').split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 10 && sentence.length <= 160);
  const checklist = sentences.slice(0, 6);
  if (checklist.length < 2) {
    checklist.splice(0, checklist.length,
      ...(parts.oral ? ['J’ai enregistré la partie orale demandée, sans lire mes notes mot à mot.'] : []),
      ...(parts.written ? ['J’ai écrit le message demandé avec toutes les informations utiles.'] : []),
      'J’ai relu ma production : informations exactes, verbe à la bonne place et orthographe.');
  }
  return {
    description: text,
    mission: {
      oral: parts.oral ? { prompt: clip(parts.oral, 1000), maxSeconds: 120 } : null,
      written: parts.written ? { prompt: clip(parts.written, 1000), maxChars: 1500, minWords: Math.min(200, minWords) } : null,
      checklist,
    },
  };
}

/** Collecte des problèmes : les erreurs empêchent l'écriture, les avertissements sont affichés. */
function reporter() {
  const errors = [];
  const warnings = [];
  return {
    errors, warnings,
    fail: (where, message) => errors.push(`${where} : ${message}`),
    warn: (where, message) => warnings.push(`${where} : ${message}`),
  };
}

async function loadLayer(file) {
  const loaded = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
  return loaded.default;
}

/** Couches d'un niveau : _level.mjs et un fichier par module (les fichiers commençant par « _ » ou « . » sont ignorés). */
async function loadLayers(pedagogyDir, levelId, report) {
  const directory = join(pedagogyDir, levelId);
  const layers = new Map();
  let levelLayer = null;
  if (!existsSync(directory)) return { layers, levelLayer, directory };
  for (const name of readdirSync(directory).sort()) {
    if (!name.endsWith('.mjs')) continue;
    const file = join(directory, name);
    const where = relative(root, file).replace(/\\/g, '/');
    let layer;
    try {
      layer = await loadLayer(file);
    } catch (error) {
      report.fail(where, `lecture impossible (${error.message})`);
      continue;
    }
    if (name === '_level.mjs') {
      if (!isObject(layer)) report.fail(where, 'export par défaut : un objet { order, minutes, settings… } attendu');
      else {
        for (const key of Object.keys(layer)) if (!LEVEL_KEYS.has(key)) report.fail(where, `clé « ${key} » inconnue`);
        levelLayer = { ...layer, where };
      }
      continue;
    }
    if (name.startsWith('_') || name.startsWith('.')) continue;
    const moduleId = basename(name, '.mjs');
    if (!isObject(layer)) {
      report.fail(where, 'export par défaut : un objet { module, … } attendu');
      continue;
    }
    if (layer.module !== moduleId) report.fail(where, `module « ${layer.module} » : le fichier doit s'appeler ${layer.module}.mjs`);
    for (const key of Object.keys(layer)) if (!LAYER_KEYS.has(key)) report.fail(where, `clé « ${key} » inconnue`);
    layers.set(moduleId, { ...layer, where });
  }
  return { layers, levelLayer, directory };
}

/** Questions de l'atelier : explication reprise du troisième élément du quiz. */
function workshopExplanations(module, spec) {
  const control = module.activities.find((activity) => activity.id === `${module.id}-controle`);
  if (!control || !Array.isArray(spec?.quiz)) return;
  control.lesson.description = control.lesson.description === CONTROL_DESCRIPTION
    ? V4_CONTROL_DESCRIPTION : control.lesson.description;
  spec.quiz.forEach(([, , explanation], index) => {
    const question = control.questions.find((item) => item.id === `q${index + 1}`);
    if (question && typeof explanation === 'string' && explanation.trim()) question.explanation = explanation.trim();
  });
}

/** Activité « mission » d'un atelier : mission provisoire tirée de la tâche, à relire par la couche. */
function workshopMission(module, spec, levelId) {
  const activity = module.activities.find((item) => item.id === `${module.id}-mission`);
  if (!activity || !spec?.task) return;
  const { description, mission } = missionFromTask(spec.task, levelId);
  activity.kind = 'mission';
  activity.title = clip(`Mission : ${module.title.charAt(0).toLowerCase()}${module.title.slice(1)}`, 120);
  activity.lesson = { ...activity.lesson, title: activity.title, description };
  activity.mission = mission;
  activity.competences = [...(mission.oral ? ['expression-orale'] : []), ...(mission.written ? ['expression-ecrite'] : [])];
  activity.questions = [];
  activity.draft = 'mission provisoire tirée de la tâche de l’atelier : à relire et à réécrire dans la couche';
}

function normalizePlacement(placement, mediaByKey) {
  const media = mediaByKey.get(placement.media);
  const usage = placement.usage ?? (media?.kind === 'audio' ? 'audio' : 'illustration');
  return {
    ...placement, usage,
    transcriptVisibility: placement.transcriptVisibility ?? (usage === 'audio' ? 'on_demand' : 'hidden'),
    decorative: Boolean(placement.decorative),
  };
}

/** Champs par défaut d'une question typée ; les champs fournis par la couche sont conservés tels quels. */
function normalizeQuestion(question) {
  const type = question.type ?? 'choice';
  const normalized = { ...question, type };
  if (type === 'choice') {
    normalized.options = (question.options ?? []).map((option) => ({ ...option }));
  } else if (type === 'fill') {
    normalized.blanks = (question.blanks ?? []).map((blank) => ({
      ...blank, id: String(blank.id),
      size: blank.size ?? Math.min(30, Math.max(3, ...(blank.accept ?? []).map((value) => String(value).length + 1))),
      hint: blank.hint ?? null,
    }));
  } else if (type === 'dictation') {
    normalized.showWordCount = question.showWordCount ?? true;
  } else if (type === 'speak') {
    normalized.accept = question.accept ?? (question.text ? [question.text] : []);
    normalized.threshold = question.threshold ?? defaultThreshold(question.text);
  }
  return normalized;
}

/** Applique la retouche d'une activité (couche) ; null retire l'activité. */
function patchActivity(activity, patch, where, report, mediaByKey) {
  for (const key of Object.keys(patch)) if (!PATCH_KEYS.has(key)) report.fail(where, `clé « ${key} » inconnue`);
  for (const key of ['kind', 'title', 'estimatedMinutes', 'competences']) {
    if (patch[key] !== undefined) activity[key] = clone(patch[key]);
  }
  if (patch.lesson) activity.lesson = { ...activity.lesson, ...clone(patch.lesson) };
  if (patch.questions) activity.questions = clone(patch.questions);
  for (const id of patch.removeQuestions ?? []) {
    if (!activity.questions.some((question) => question.id === id)) report.fail(where, `removeQuestions : question « ${id} » absente`);
    activity.questions = activity.questions.filter((question) => question.id !== id);
  }
  for (const question of clone(patch.addQuestions) ?? []) {
    if (activity.questions.some((item) => item.id === question.id)) report.fail(where, `addQuestions : question « ${question.id} » déjà présente`);
    else activity.questions.push(question);
  }
  for (const [id, text] of Object.entries(patch.explanations ?? {})) {
    const question = activity.questions.find((item) => item.id === id);
    if (!question) report.fail(where, `explanations : question « ${id} » absente`);
    else question.explanation = text;
  }
  for (const [id, byOption] of Object.entries(patch.feedback ?? {})) {
    const question = activity.questions.find((item) => item.id === id);
    if (!question) {
      report.fail(where, `feedback : question « ${id} » absente`);
      continue;
    }
    for (const [optionId, text] of Object.entries(byOption ?? {})) {
      const option = (question.options ?? []).find((item) => item.id === optionId);
      if (!option) report.fail(where, `feedback : choix « ${optionId} » absent de ${id}`);
      else option.feedback = text;
    }
  }
  if (Array.isArray(patch.placements)) {
    activity.placements = clone(patch.placements).map((placement) => normalizePlacement(placement, mediaByKey));
  } else if (isObject(patch.placements)) {
    const removed = new Set(patch.placements.remove ?? []);
    for (const key of removed) {
      if (!activity.placements.some((placement) => placement.media === key)) report.fail(where, `placements.remove : « ${key} » absent`);
    }
    activity.placements = activity.placements.filter((placement) => !removed.has(placement.media));
    for (const placement of clone(patch.placements.add) ?? []) activity.placements.push(normalizePlacement(placement, mediaByKey));
  } else if (patch.placements !== undefined) {
    report.fail(where, 'placements : liste complète ou { add, remove } attendus');
  }
  if (patch.mission !== undefined) {
    activity.mission = clone(patch.mission);
    if (patch.kind === undefined && patch.mission) activity.kind = 'mission';
    delete activity.draft;
  }
}

function normalizeActivity(activity) {
  const kind = activity.kind ?? ((activity.questions ?? []).length ? 'exercise' : activity.mission ? 'mission' : 'lesson');
  const normalized = {
    ...activity, kind,
    lesson: { title: activity.lesson?.title ?? activity.title, description: activity.lesson?.description ?? '',
      transcript: activity.lesson?.transcript ?? null },
    questions: kind === 'exercise' ? (activity.questions ?? []).map(normalizeQuestion) : [],
    placements: activity.placements ?? [],
  };
  if (kind === 'mission') {
    const mission = activity.mission ?? {};
    normalized.mission = {
      oral: mission.oral ? { ...mission.oral, maxSeconds: mission.oral.maxSeconds ?? 120 } : null,
      written: mission.written ? { ...mission.written, maxChars: mission.written.maxChars ?? 1500 } : null,
      checklist: mission.checklist ?? [],
    };
  } else {
    delete normalized.mission;
    delete normalized.draft;
  }
  return normalized;
}

/** Couche d'un module : titre, objectif, médias, retouches, ajouts et ordre des activités, vocabulaire. */
function applyLayer(module, layer, levelId, report) {
  const where = layer.where;
  if (layer.title !== undefined) module.title = layer.title;
  if (layer.objective !== undefined) module.objective = layer.objective;
  if (layer.grammarFocus !== undefined) module.grammarFocus = clone(layer.grammarFocus);
  const layerMedia = new Set();
  for (const media of clone(layer.media) ?? []) {
    if (!media?.key) {
      report.fail(where, 'média sans clé');
      continue;
    }
    const index = module.media.findIndex((item) => item.key === media.key);
    const entry = media.kind === 'audio' && media.script ? { ...voiceAttribution, ...media } : media;
    if (index >= 0) module.media[index] = entry;
    else module.media.push(entry);
    layerMedia.add(media.key);
  }
  const mediaByKey = new Map(module.media.map((item) => [item.key, item]));
  const ids = new Set(module.activities.map((activity) => activity.id));
  for (const [id, patch] of Object.entries(layer.activities ?? {})) {
    const at = `${where} › ${id}`;
    if (!ids.has(id)) {
      report.fail(at, `activité absente du module (activités : ${[...ids].join(', ')})`);
      continue;
    }
    if (patch === null) {
      module.activities = module.activities.filter((activity) => activity.id !== id);
      continue;
    }
    if (!isObject(patch)) {
      report.fail(at, 'null ou objet de retouche attendu');
      continue;
    }
    patchActivity(module.activities.find((activity) => activity.id === id), patch, at, report, mediaByKey);
  }
  for (const [index, addition] of (layer.add ?? []).entries()) {
    const at = `${where} › add[${index}]`;
    const activity = clone(addition?.activity);
    if (!isObject(activity) || !activity.id) {
      report.fail(at, '{ after, activity: { id, … } } attendu');
      continue;
    }
    if (module.activities.some((item) => item.id === activity.id)) {
      report.fail(at, `activité « ${activity.id} » déjà présente`);
      continue;
    }
    activity.placements = (activity.placements ?? []).map((placement) => normalizePlacement(placement, mediaByKey));
    const anchor = addition.after ?? addition.before;
    const position = anchor === undefined ? -1 : module.activities.findIndex((item) => item.id === anchor);
    if (anchor !== undefined && position < 0) {
      report.fail(at, `activité de référence « ${anchor} » absente`);
      continue;
    }
    if (position < 0) module.activities.push(activity);
    else module.activities.splice(addition.after !== undefined ? position + 1 : position, 0, activity);
  }
  if (layer.order) {
    const current = module.activities.map((activity) => activity.id);
    const wanted = layer.order;
    if (wanted.length !== current.length || new Set(wanted).size !== wanted.length || wanted.some((id) => !current.includes(id))) {
      report.fail(`${where} › order`, `permutation exacte des activités attendue : ${current.join(', ')}`);
    } else {
      module.activities = wanted.map((id) => module.activities.find((activity) => activity.id === id));
    }
  }
  if (layer.vocabulary !== undefined) {
    if (!Array.isArray(layer.vocabulary)) report.fail(`${where} › vocabulary`, 'liste attendue');
    else module.vocabulary = clone(layer.vocabulary);
  }
  return layerMedia;
}

/**
 * Illustrations V4 (images-v4.json) : média et support ajoutés à l'activité qui les emploie. Une illustration prévue pour
 * une activité « -correction » (retirée) récapitule les réponses d'un exercice : elle passe à l'activité qui suivait la
 * correction (la mission), jamais avant la réponse.
 */
function mergeImages(modules, images, report, replacedBy) {
  const meta = new Map();
  const byId = new Map(modules.map((module) => [module.id, module]));
  for (const entry of images) {
    const module = byId.get(entry.module);
    if (!module) continue;
    const target = replacedBy.get(entry.activity) ?? entry.activity;
    const activity = module.activities.find((item) => item.id === target);
    if (!activity) {
      report.warn(`images-v4 › ${entry.media}`, `activité ${entry.activity} absente du kit : illustration ignorée`);
      continue;
    }
    if (!module.media.some((item) => item.key === entry.media)) {
      module.media.push({
        key: entry.media, kind: 'image', title: entry.title, alt: entry.alt,
        ...(entry.credit ? { credit: entry.credit } : {}), ...(entry.license ? { license: entry.license } : {}),
        image: entry.image,
      });
    }
    if (activity.placements.some((placement) => placement.media === entry.media)) continue;
    activity.placements.push({
      media: entry.media, usage: 'illustration', ...(entry.caption ? { caption: entry.caption } : {}),
      transcriptVisibility: 'hidden', decorative: false,
      ...(entry.questionId ? { questionId: entry.questionId } : {}), ...(entry.optionId ? { optionId: entry.optionId } : {}),
    });
    meta.set(entry.media, entry);
  }
  return meta;
}

/**
 * Supports rattachés à une question ou à un choix : après les couches, la question doit exister. Une illustration V4
 * de choix est retrouvée par le libellé de son choix si les identifiants ont changé ; sinon le support est retiré.
 */
function reconcilePlacements(module, imageMeta, report) {
  for (const activity of module.activities) {
    activity.placements = activity.placements.filter((placement) => {
      if (!placement.questionId) return true;
      const at = `${module.id} › ${activity.id} › support ${placement.media}`;
      let question = activity.questions.find((item) => item.id === placement.questionId);
      const entry = imageMeta.get(placement.media);
      const label = (value) => String(value ?? '').trim().toLowerCase();
      if (placement.optionId && entry?.optionLabel) {
        const matches = (item) => (item.options ?? []).some((option) => label(option.label) === label(entry.optionLabel));
        if (!question || !matches(question)) question = activity.questions.find((item) => label(item.prompt) === label(entry.question) && matches(item)) ?? question;
        const option = question && (question.options ?? []).find((item) => label(item.label) === label(entry.optionLabel));
        if (option) {
          placement.questionId = question.id;
          placement.optionId = option.id;
          return true;
        }
        // L'image illustre un choix précis : sans choix de même libellé, elle ne correspond plus à la question.
        report.warn(at, `aucun choix « ${entry.optionLabel} » dans ${placement.questionId} : illustration de choix retirée`);
        return false;
      }
      if (!question) {
        report.warn(at, `question ${placement.questionId} absente : support retiré`);
        return false;
      }
      if (placement.optionId && !(question.options ?? []).some((option) => option.id === placement.optionId)) {
        report.warn(at, `choix ${placement.optionId} absent de ${question.id} : support retiré`);
        return false;
      }
      return true;
    });
  }
}

/** Sons des questions dictation et speak : un MP3 par question, support rattaché à la question. */
function questionMedia(module, levelId) {
  for (const activity of module.activities) {
    for (const question of activity.questions) {
      if (!['dictation', 'speak'].includes(question.type)) continue;
      const key = `${activity.id}-${question.id}`;
      const text = question.type === 'dictation' ? question.accept?.[0] : question.text;
      if (!module.media.some((item) => item.key === key) && typeof text === 'string' && text.trim()) {
        module.media.push({
          key, kind: 'audio',
          title: clip(`${question.type === 'dictation' ? 'Dictée' : 'Modèle à répéter'} ${question.id} · ${activity.title}`, 120),
          script: [{ voice: question.voice ?? 'sprecherin', text: text.trim() }],
          ...(levelId === 'a1' ? { audioProfile: SLOW_PROFILE } : {}),
          ...voiceAttribution,
        });
      }
      if (!activity.placements.some((placement) => placement.media === key)) {
        activity.placements.push({
          media: key, usage: 'audio', questionId: question.id,
          transcriptVisibility: question.type === 'dictation' ? 'after_answer' : 'on_demand', decorative: false,
        });
      }
    }
  }
}

/** Vocabulaire : identifiants, champs par défaut et son du lexique (une réplique par entrée, segments). */
function vocabulary(module, report) {
  const entries = module.vocabulary ?? [];
  const key = `${module.id}-lexique`;
  const seen = new Set();
  module.vocabulary = entries.map((entry, line) => {
    let id = entry.id ?? slugOf(entry.word ?? `mot-${line + 1}`);
    if (!entry.id) for (let rank = 2; seen.has(id); rank++) id = `${slugOf(entry.word ?? 'mot')}-${rank}`;
    if (seen.has(id)) report.fail(`${module.id} › vocabulaire`, `identifiant « ${id} » en double`);
    seen.add(id);
    if (entry.audio) report.fail(`${module.id} › vocabulaire › ${id}`, 'audio est calculé par la construction : ne pas l’indiquer');
    return {
      id, word: entry.word, article: entry.article ?? null, plural: entry.plural ?? null, partOfSpeech: entry.partOfSpeech,
      translation: entry.translation, example: entry.example ?? null, note: entry.note ?? null, audio: { media: key, line },
    };
  });
  module.media = module.media.filter((item) => item.key !== key);
  if (!module.vocabulary.length) return;
  module.media.push({
    key, kind: 'audio', title: clip(`Lexique · ${module.title}`, 120), segments: true, audioProfile: SLOW_PROFILE,
    script: module.vocabulary.flatMap((entry, index) => [
      ...(index ? [{ pause: LEXICON_PAUSE }] : []),
      { voice: LEXICON_VOICE, text: lexiconLine(entry) },
    ]),
    ...voiceAttribution,
  });
}

/** Médias du kit qui ne servent plus après les couches (activité retirée…) ; ceux d'une couche restent signalés. */
function pruneMedia(module, layerMedia, imageMeta, report) {
  const used = new Set(module.activities.flatMap((activity) => activity.placements.map((placement) => placement.media)));
  module.media = module.media.filter((item) => {
    if (used.has(item.key) || item.key === `${module.id}-lexique`) return true;
    if (layerMedia.has(item.key)) {
      report.warn(`${module.id} › média ${item.key}`, 'déclaré par la couche mais jamais placé');
      return true;
    }
    // Une illustration V4 dessinée pour ce module ne doit pas disparaître sans qu'on le voie (liste de supports remplacée…).
    if (imageMeta.has(item.key)) report.warn(`${module.id} › média ${item.key}`, 'illustration V4 plus placée par la couche : retirée');
    return false;
  });
}

/** Construit un niveau : composition du kit, illustrations V4, couches, médias générés, ordre et prérequis. */
export async function buildLevel(levelId, { pedagogyDir = join(root, 'content', 'v4', 'pedagogy'), images = null, report }) {
  const { level, modules: kitModules, specs } = await composeLevel(levelId, { edition: 'v4' });
  const { layers, levelLayer } = await loadLayers(pedagogyDir, levelId, report);
  // Activités « -correction » retirées : la correction s'affiche désormais après la remise de l'exercice.
  const replacedBy = new Map();
  for (const module of kitModules) {
    module.activities.forEach((activity, index) => {
      const next = module.activities.slice(index + 1).find((item) => !item.id.endsWith('-correction'));
      if (activity.id.endsWith('-correction') && next) replacedBy.set(activity.id, next.id);
    });
  }
  let modules = kitModules.map((module) => ({
    ...module, vocabulary: [], activities: module.activities.filter((activity) => !activity.id.endsWith('-correction')),
  }));
  for (const module of modules) {
    for (const activity of module.activities) activity.placements = activity.placements ?? [];
    const spec = specs.get(module.id);
    if (spec) {
      workshopExplanations(module, spec);
      workshopMission(module, spec, levelId);
    }
  }
  const imageMeta = mergeImages(modules, images ?? [], report, replacedBy);
  const known = new Set(modules.map((module) => module.id));
  for (const [moduleId, layer] of layers) {
    if (!known.has(moduleId)) report.fail(layer.where, `module inconnu du niveau ${levelId} (modules : ${[...known].join(', ')})`);
  }
  for (const module of modules) {
    const layer = layers.get(module.id);
    const layerMedia = layer ? applyLayer(module, layer, levelId, report) : new Set();
    module.layer = layer ? layer.where : null;
    module.activities = module.activities.map(normalizeActivity);
    reconcilePlacements(module, imageMeta, report);
    questionMedia(module, levelId);
    vocabulary(module, report);
    const mediaByKey = new Map(module.media.map((item) => [item.key, item]));
    for (const activity of module.activities) {
      activity.placements = activity.placements.map((placement) => normalizePlacement(placement, mediaByKey));
    }
    pruneMedia(module, layerMedia, imageMeta, report);
    if (!module.grammarFocus?.length) delete module.grammarFocus;
  }
  const where = levelLayer?.where ?? `content/v4/pedagogy/${levelId}/_level.mjs`;
  if (levelLayer?.order) {
    const ids = modules.map((module) => module.id);
    const wanted = levelLayer.order;
    if (wanted.length !== ids.length || new Set(wanted).size !== wanted.length || wanted.some((id) => !ids.includes(id))) {
      report.fail(`${where} › order`, `permutation exacte des modules attendue : ${ids.join(', ')}`);
    } else {
      modules = wanted.map((id) => modules.find((module) => module.id === id));
    }
  }
  modules.forEach((module, index) => { module.prerequisites = index ? [modules[index - 1].id] : []; });
  if (levelLayer?.settings) Object.assign(level.settings, clone(levelLayer.settings));
  // Titres et descriptions du bilan intermédiaire (midterm) et de l'examen blanc (final) : le point de coupure du bilan
  // suit l'ordre des modules, son titre et sa description doivent le refléter.
  for (const kind of ['midterm', 'final']) {
    const assessment = level.assessments.find((item) => item.kind === kind);
    for (const [field, property] of [[`${kind}Title`, 'title'], [`${kind}Description`, 'description']]) {
      const value = levelLayer?.[field];
      if (value === undefined) continue;
      if (typeof value !== 'string' || !value.trim()) report.fail(`${where} › ${field}`, 'texte attendu');
      else assessment[property] = value.trim();
    }
  }
  const minutes = levelLayer?.minutes ?? BUDGETS[levelId];
  const { modules: _base, ...rest } = level;
  const ordered = modules.map((module) => {
    const { id, title, objective, prerequisites, audioProfile, sources, grammarFocus, layer, vocabulary: entries, activities, media } = module;
    return { id, title, objective, prerequisites, audioProfile, sources, ...(grammarFocus ? { grammarFocus } : {}), layer,
      vocabulary: entries, activities, media };
  });
  return {
    level: { levelId, format: FORMAT, layer: levelLayer?.where ?? null, activityMinutes: { min: minutes.min, max: minutes.max },
      ...rest },
    modules: ordered,
    layered: Boolean(levelLayer) || layers.size > 0,
  };
}

function writeJson(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

/** Écrit le niveau dans <sortie>/<niveau> ; les fichiers de modules d'une construction précédente sont supprimés. */
export function writeLevel(output, { level, modules }) {
  const directory = join(output, level.levelId);
  const files = modules.map(({ id }, index) => ({ id, file: `${String(index + 1).padStart(2, '0')}-${id}.json` }));
  mkdirSync(directory, { recursive: true });
  const keep = new Set(['level.json', ...files.map(({ file }) => file)]);
  for (const name of readdirSync(directory)) if (name.endsWith('.json') && !keep.has(name)) rmSync(join(directory, name));
  writeJson(join(directory, 'level.json'), { ...level, modules: files });
  modules.forEach((module, index) => writeJson(join(directory, files[index].file), module));
  return files;
}

/**
 * Kit hors ligne (A1.html, A2.html, JSON, médias et outils d'import) à partir de la V4 construite ; les sons et images
 * sont copiés depuis content/de/media, à produire avant (synthesize-v3.py, render-images.mjs).
 */
export function writeKit(kit, built) {
  const content = join(kit, 'content', 'de');
  const missing = [];
  for (const result of built) {
    writeLevel(content, result);
    const level = { ...result.level, modules: result.modules };
    writeFileSync(join(kit, `${result.level.levelId.toUpperCase()}.html`), renderWorkbook(level, 'V4'));
    for (const media of allMedia(level)) {
      const from = media.kind === 'image' ? imageFile(media) : audioFile(media);
      if (!existsSync(from)) {
        missing.push(media.key);
        continue;
      }
      const target = join(content, 'media', media.kind === 'image' ? 'images' : 'audio', basename(from));
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(from, target);
    }
  }
  const manifest = join(contentDir, 'media', 'audio', 'manifest-v3.json');
  if (existsSync(manifest)) copyFileSync(manifest, join(content, 'media', 'audio', 'manifest-v3.json'));
  writeJson(join(content, 'media', 'credits.json'), composeCredits('v4'));
  for (const name of ['check-content.mjs', 'content-lib.mjs', 'import-content.mjs', 'icons.txt']) {
    mkdirSync(join(kit, 'infra', 'content'), { recursive: true });
    copyFileSync(join(root, 'infra', 'content', name), join(kit, 'infra', 'content', name));
  }
  copyFileSync(join(root, 'content', 'v4', 'README.md'), join(kit, 'README.md'));
  if (missing.length) console.warn(`Avertissement · kit : ${missing.length} média(s) absents de content/de/media (${missing.slice(0, 5).join(', ')}…)`);
  console.log(`Kit hors ligne écrit dans ${relative(root, kit).replace(/\\/g, '/')}.`);
}

/**
 * Sons périmés de content/de/media/audio : MP3 qu'aucun niveau de content/de ni le test de niveau n'emploie plus
 * (activité retirée par une couche, clé renommée). Ils sont supprimés avec leur entrée du manifeste de synthèse.
 */
export function pruneAudio() {
  const directory = join(contentDir, 'media', 'audio');
  const used = new Set([
    ...availableLevels().flatMap((levelId) => allMedia(loadLevel(levelId))),
    ...placementMedia(loadPlacement()),
  ].filter((media) => media.kind === 'audio').map((media) => `${media.key}.mp3`));
  const removed = readdirSync(directory).filter((name) => name.endsWith('.mp3') && !used.has(name));
  for (const name of removed) rmSync(join(directory, name));
  const manifestFile = join(directory, 'manifest-v3.json');
  if (existsSync(manifestFile)) {
    const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
    for (const key of Object.keys(manifest.items ?? {})) if (!used.has(`${key}.mp3`)) delete manifest.items[key];
    writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
  }
  console.log(`${removed.length} son(s) périmé(s) supprimé(s) de content/de/media/audio.`);
}

export function loadImages(file = join(root, 'content', 'v4', 'source', 'images-v4.json')) {
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, 'utf8')).images ?? [];
  } catch (error) {
    // Le fichier est produit au fil de l'eau par l'atelier des illustrations : une écriture en cours n'arrête pas la construction.
    console.warn(`Avertissement · images-v4.json illisible (${error.message}) : illustrations V4 ignorées.`);
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);
  const values = (name) => args.flatMap((value, index) => (value === `--${name}` ? [args[index + 1]] : []));
  const levels = values('level').length ? values('level') : LEVELS;
  if (levels.some((levelId) => !LEVELS.includes(levelId))) throw new Error(`Niveaux possibles : ${LEVELS.join(', ')}.`);
  const output = values('out')[0] ? resolve(values('out')[0]) : contentDir;
  const pedagogyDir = values('pedagogy')[0] ? resolve(values('pedagogy')[0]) : join(root, 'content', 'v4', 'pedagogy');
  const images = loadImages();
  const report = reporter();
  const built = [];
  for (const levelId of levels) built.push(await buildLevel(levelId, { pedagogyDir, images, report }));
  if (!args.includes('--quiet')) for (const message of report.warnings) console.log(`Avertissement · ${message}`);
  if (report.errors.length) {
    for (const message of report.errors) console.error(`Erreur · ${message}`);
    console.error(`${report.errors.length} erreur(s) dans les couches : rien n’a été écrit.`);
    process.exit(1);
  }
  for (const result of built) {
    writeLevel(output, result);
    const activities = result.modules.flatMap((module) => module.activities);
    const minutes = activities.reduce((total, activity) => total + activity.estimatedMinutes, 0);
    const questions = activities.reduce((total, activity) => total + activity.questions.length, 0);
    const typed = activities.flatMap((activity) => activity.questions).filter((question) => question.type !== 'choice').length;
    const layered = result.modules.filter((module) => module.layer).length;
    console.log(`${result.level.levelId.toUpperCase()} · ${result.modules.length} modules (${layered} avec couche) · `
      + `${activities.length} activités · ${minutes} min (cible ${result.level.activityMinutes.min}–${result.level.activityMinutes.max}) · `
      + `${questions} questions dont ${typed} typées · ${activities.filter((activity) => activity.kind === 'mission').length} missions · `
      + `${result.modules.reduce((total, module) => total + module.vocabulary.length, 0)} mots`);
  }
  writeJson(join(output, 'media', 'credits.json'), composeCredits('v4'));
  console.log(`Écrit dans ${relative(root, output).replace(/\\/g, '/') || '.'} (types : ${QUESTION_TYPES.join(', ')}).`);
  if (values('kit')[0]) writeKit(resolve(values('kit')[0]), built);
  if (args.includes('--prune-audio')) {
    if (output !== contentDir) throw new Error('--prune-audio ne vaut que pour content/de (sans --out).');
    pruneAudio();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exit(1);
  });
}
