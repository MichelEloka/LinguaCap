#!/usr/bin/env node
// Construction des niveaux B (format 5) à partir des sources natives content/b/source/<niveau> : un module complet par
// fichier (<moduleId>.mjs), l'ordre et les réglages du niveau (_level.mjs), le diagnostic, le bilan et l'examen blanc
// (_evaluations.mjs) et les médias libres ajoutés aux modules (_media.mjs). Format décrit dans content/b/README.md.
//
// Usage :
//   node infra/content/build-b.mjs --level b1                          content/de/b1 (modules périmés supprimés) et crédits
//   node infra/content/build-b.mjs --level b1 --out target/b-preview    aperçu complet, sans toucher content/de
//   node infra/content/build-b.mjs --level b1 --only b1-arbeit,b1-arbeit-atelier --out target/b-preview-r2
//                                                                      aperçu partiel (level.json « partial: true »)
//   options : --level (répétable ; défaut : tous les dossiers de content/b/source), --out <dossier>,
//             --only <id,id…> (répétable, exige --out), --source <dossier> (défaut content/b/source), --quiet,
//             --workbook <dossier> : cahier hors ligne <NIVEAU>.html (construction complète ; chemins des médias
//             « content/de/media/… », relatifs à la racine du dépôt)
//
// Fait automatiquement (fonctions partagées avec la V4, build-common.mjs) : activités, questions et supports normalisés
// (seuil des répétitions, tailles des trous, transcription après la réponse dans un exercice d'écoute), sons des dictées
// et répétitions (<activité>-<question>, voix variées), son du lexique (<module>-lexique, segments), crédit des voix,
// prérequis en chaîne dans l'ordre de _level.mjs, profils audio (début puis suite), level.json au format 5, crédits.
// Les sons (synthesize-v3.py) et les images (render-images.mjs) sont produits ensuite, dans content/de/media.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  clone, composeCredits, isObject, normalizeActivity, normalizePlacement, pruneMedia, questionMedia, reporter, vocabulary,
  voiceCreditOf, writeJson, writeLevel,
} from './build-common.mjs';
import { QUESTION_TYPES, contentDir, root } from './content-lib.mjs';
import { isLevelId, profileOf } from './level-profiles.mjs';
import { renderWorkbook } from './render-v3-workbook.mjs';

export const FORMAT = 5;
const MODULE_KEYS = new Set(['id', 'title', 'objective', 'grammarFocus', 'sources', 'audioProfile', 'vocabulary', 'media', 'activities']);
const LEVEL_KEYS = new Set(['order', 'minutes', 'audio', 'catalogue', 'settings', 'midtermTitle', 'midtermDescription', 'finalTitle',
  'finalDescription']);
const CATALOGUE_KEYS = new Set(['title', 'description', 'position', 'prerequisiteLevelId']);
const EVALUATION_KEYS = new Set(['diagnostic', 'assessments', 'media', 'default']);
const ADDITION_KEYS = new Set(['module', 'media', 'placement', 'after', 'before', 'activity']);
const ACTIVITY_KEYS = new Set(['id', 'kind', 'title', 'estimatedMinutes', 'competences', 'lesson', 'questions', 'placements', 'mission']);
const LESSON_KEYS = new Set(['title', 'description']);
const MISSION_KEYS = new Set(['oral', 'written', 'checklist', 'criteria']);
const QUESTION_KEYS = new Set(['id', 'type', 'prompt', 'explanation', 'options', 'text', 'blanks', 'answers', 'pairs', 'accept', 'voice',
  'threshold', 'showWordCount']);
const PLACEMENT_KEYS = new Set(['media', 'usage', 'alt', 'caption', 'transcriptVisibility', 'decorative', 'questionId', 'optionId']);
const MEDIA_KEYS = new Set(['key', 'kind', 'title', 'alt', 'script', 'segments', 'audioProfile', 'native', 'transcript', 'photo', 'image',
  'credit', 'license', 'sourceUrl']);

const unknownKeys = (value, allowed) => Object.keys(value ?? {}).filter((key) => !allowed.has(key));
const where = (file) => relative(root, file).replace(/\\/g, '/');

async function importFile(file) {
  return import(`${pathToFileURL(file).href}?t=${Date.now()}`);
}

/** Contrôle de forme (clés inconnues, types) avant la construction : une faute de frappe ne passe pas en silence. */
function checkShape(module, at, report) {
  for (const key of unknownKeys(module, MODULE_KEYS)) report.fail(at, `clé « ${key} » inconnue (${[...MODULE_KEYS].join(', ')})`);
  if (!Array.isArray(module.activities)) report.fail(at, 'activities : liste attendue');
  for (const field of ['vocabulary', 'media', 'sources', 'grammarFocus']) {
    if (module[field] !== undefined && !Array.isArray(module[field])) report.fail(at, `${field} : liste attendue`);
  }
  for (const media of module.media ?? []) checkMediaShape(media, `${at} › média ${media?.key}`, report);
  for (const activity of module.activities ?? []) checkActivityShape(activity, `${at} › ${activity?.id}`, report);
}

function checkMediaShape(media, at, report) {
  if (!isObject(media) || !media.key) {
    report.fail(at, 'média sans clé');
    return;
  }
  for (const key of unknownKeys(media, MEDIA_KEYS)) report.fail(at, `clé « ${key} » inconnue`);
}

function checkActivityShape(activity, at, report) {
  if (!isObject(activity) || !activity.id) {
    report.fail(at, 'activité sans identifiant');
    return;
  }
  for (const key of unknownKeys(activity, ACTIVITY_KEYS)) report.fail(at, `clé « ${key} » inconnue (${[...ACTIVITY_KEYS].join(', ')})`);
  if (activity.lesson !== undefined && !isObject(activity.lesson)) report.fail(at, 'lesson : { description } attendu');
  for (const key of unknownKeys(activity.lesson, LESSON_KEYS)) report.fail(at, `lesson : clé « ${key} » inconnue`);
  if (activity.mission !== undefined && activity.mission !== null) {
    for (const key of unknownKeys(activity.mission, MISSION_KEYS)) report.fail(at, `mission : clé « ${key} » inconnue`);
  }
  if (activity.questions !== undefined && !Array.isArray(activity.questions)) report.fail(at, 'questions : liste attendue');
  for (const question of activity.questions ?? []) {
    const questionAt = `${at} › question ${question?.id}`;
    if (!isObject(question)) {
      report.fail(questionAt, 'objet attendu (choice(), fill()… de content/b/lib.mjs)');
      continue;
    }
    for (const key of unknownKeys(question, QUESTION_KEYS)) report.fail(questionAt, `clé « ${key} » inconnue`);
    if (question.type !== undefined && !QUESTION_TYPES.includes(question.type)) report.fail(questionAt, `type « ${question.type} » inconnu`);
  }
  if (activity.placements !== undefined && !Array.isArray(activity.placements)) report.fail(at, 'placements : liste attendue');
  for (const placement of activity.placements ?? []) {
    for (const key of unknownKeys(placement, PLACEMENT_KEYS)) report.fail(`${at} › support ${placement?.media}`, `clé « ${key} » inconnue`);
  }
}

/** Sources d'un niveau : modules (tous, ou ceux de --only), _level.mjs, _evaluations.mjs et _media.mjs. */
async function loadSources(directory, only, report) {
  const modules = new Map();
  const files = readdirSync(directory).filter((name) => name.endsWith('.mjs')).sort();
  let levelSource = null;
  let evaluations = null;
  let additions = [];
  for (const name of files) {
    const file = join(directory, name);
    const at = where(file);
    if (name.startsWith('.')) continue;
    if (name.startsWith('_')) {
      if (!['_level.mjs', '_evaluations.mjs', '_media.mjs'].includes(name)) continue;
      let loaded;
      try {
        loaded = await importFile(file);
      } catch (error) {
        report.fail(at, `lecture impossible (${error.message})`);
        continue;
      }
      if (name === '_level.mjs') {
        if (!isObject(loaded.default)) report.fail(at, 'export par défaut : un objet { order, minutes, catalogue, settings… } attendu');
        else {
          for (const key of unknownKeys(loaded.default, LEVEL_KEYS)) report.fail(at, `clé « ${key} » inconnue (${[...LEVEL_KEYS].join(', ')})`);
          for (const key of unknownKeys(loaded.default.catalogue, CATALOGUE_KEYS)) report.fail(`${at} › catalogue`, `clé « ${key} » inconnue`);
          levelSource = { ...loaded.default, where: at };
        }
      } else if (name === '_evaluations.mjs') {
        for (const key of unknownKeys(loaded, EVALUATION_KEYS)) report.fail(at, `export « ${key} » inconnu (diagnostic, assessments, media)`);
        evaluations = { diagnostic: loaded.diagnostic, assessments: loaded.assessments, media: loaded.media ?? [], where: at };
      } else {
        if (!Array.isArray(loaded.default)) report.fail(at, 'export par défaut : une liste d’ajouts attendue');
        else additions = loaded.default.map((entry, index) => ({ entry, at: `${at} › [${index}]` }));
      }
      continue;
    }
    const moduleId = basename(name, '.mjs');
    if (only && !only.has(moduleId)) continue;
    let loaded;
    try {
      loaded = (await importFile(file)).default;
    } catch (error) {
      report.fail(at, `lecture impossible (${error.message})`);
      continue;
    }
    if (!isObject(loaded)) {
      report.fail(at, 'export par défaut : un objet { id, title, objective, … } attendu');
      continue;
    }
    if (loaded.id !== moduleId) report.fail(at, `id « ${loaded.id} » : le fichier doit s'appeler ${loaded.id}.mjs`);
    checkShape(loaded, at, report);
    modules.set(moduleId, { module: clone(loaded), where: at });
  }
  for (const id of only ?? []) if (!modules.has(id)) report.fail(where(directory), `--only : module « ${id} » introuvable (${id}.mjs)`);
  return { modules, levelSource, evaluations, additions };
}

/**
 * Ajouts de _media.mjs : média ajouté au module, support ajouté à une activité, ou activité complète insérée après (ou
 * avant) une activité de référence. Un ajout visant un module non construit (aperçu partiel) est ignoré.
 */
function mergeAdditions(additions, modules, partial, report) {
  for (const { entry, at } of additions) {
    if (!isObject(entry)) {
      report.fail(at, '{ module, media, placement } ou { module, after, activity } attendu');
      continue;
    }
    for (const key of unknownKeys(entry, ADDITION_KEYS)) report.fail(at, `clé « ${key} » inconnue (${[...ADDITION_KEYS].join(', ')})`);
    const target = modules.get(entry.module)?.module;
    if (!target) {
      if (!partial) report.fail(at, `module « ${entry.module} » inconnu du niveau`);
      continue;
    }
    const added = [].concat(entry.media ?? []);
    for (const media of added) {
      checkMediaShape(media, `${at} › média ${media?.key}`, report);
      if ((target.media ?? []).some((item) => item.key === media?.key)) report.fail(at, `média « ${media?.key} » déjà présent dans ${target.id}`);
      else (target.media ??= []).push(clone(media));
    }
    if (entry.activity !== undefined) {
      const activity = clone(entry.activity);
      checkActivityShape(activity, `${at} › ${activity?.id}`, report);
      const anchor = entry.after ?? entry.before;
      const position = anchor === undefined ? -1 : target.activities.findIndex((item) => item.id === anchor);
      if (target.activities.some((item) => item.id === activity?.id)) report.fail(at, `activité « ${activity?.id} » déjà présente`);
      else if (anchor !== undefined && position < 0) report.fail(at, `activité de référence « ${anchor} » absente de ${target.id}`);
      else if (position < 0) target.activities.push(activity);
      else target.activities.splice(entry.after !== undefined ? position + 1 : position, 0, activity);
    }
    if (entry.placement !== undefined) {
      const { activity: activityId, ...placement } = entry.placement ?? {};
      const activity = target.activities.find((item) => item.id === activityId);
      const media = placement.media ?? (added.length === 1 ? added[0].key : undefined);
      for (const key of unknownKeys(placement, PLACEMENT_KEYS)) report.fail(`${at} › placement`, `clé « ${key} » inconnue`);
      if (!activity) report.fail(`${at} › placement`, `activité « ${activityId} » absente de ${target.id}`);
      else if (!media) report.fail(`${at} › placement`, 'média à placer non précisé (placement.media)');
      else (activity.placements ??= []).push({ ...placement, media });
    }
  }
}

/** Supports : son d'un exercice d'écoute transcrit après la réponse ; image masquée de la transcription. */
function placementDefaults(activity, mediaByKey) {
  const listening = (activity.kind ?? (activity.questions?.length ? 'exercise' : 'lesson')) === 'exercise'
    && (activity.competences ?? []).includes('ecoute');
  return (activity.placements ?? []).map((placement) => {
    const audio = (placement.usage ?? (mediaByKey.get(placement.media)?.kind === 'audio' ? 'audio' : 'illustration')) === 'audio';
    if (placement.transcriptVisibility !== undefined || !audio || !listening) return placement;
    return { ...placement, transcriptVisibility: 'after_answer' };
  });
}

/** Médias d'un auteur : crédit des voix pour un son de synthèse (sauf crédit fourni). */
function withCredits(media) {
  return media.map((item) => (item.kind === 'audio' && Array.isArray(item.script) && !item.credit
    ? { ...item, ...voiceCreditOf(item.script) } : item));
}

/** Construit un niveau B : sources, ajouts de médias, normalisation, ordre, prérequis, profils audio, évaluations. */
export async function buildLevel(levelId, { sourceDir = join(root, 'content', 'b', 'source'), only = null, report }) {
  const profile = profileOf(levelId, { warn: (message) => report.warn(levelId, message) });
  const directory = join(sourceDir, levelId);
  const partial = Boolean(only);
  if (!existsSync(directory)) {
    report.fail(where(directory), 'dossier de sources introuvable');
    return null;
  }
  const { modules: sources, levelSource, evaluations, additions } = await loadSources(directory, only, report);
  const levelWhere = levelSource?.where ?? `${where(directory)}/_level.mjs`;
  if (!levelSource && !partial) report.fail(levelWhere, 'fichier de niveau manquant (ordre, budget, catalogue, réglages)');
  if (!evaluations && !partial) report.fail(`${where(directory)}/_evaluations.mjs`, 'diagnostic, bilan et examen blanc manquants');

  // Ordre du niveau : celui de _level.mjs (permutation exacte des modules en construction complète).
  const order = Array.isArray(levelSource?.order) ? levelSource.order : null;
  if (levelSource && !order) report.fail(levelWhere, 'order : liste des modules attendue');
  if (order && new Set(order).size !== order.length) report.fail(`${levelWhere} › order`, 'module en double');
  if (order && !partial) {
    const missing = order.filter((id) => !sources.has(id));
    const extra = [...sources.keys()].filter((id) => !order.includes(id));
    if (missing.length) report.fail(`${levelWhere} › order`, `fichier absent pour ${missing.join(', ')}`);
    if (extra.length) report.fail(`${levelWhere} › order`, `module absent de l'ordre : ${extra.join(', ')}`);
  }
  // Sans _level.mjs (aperçu) : ordre de --only, sinon alphabétique avec chaque thème avant son atelier.
  const themeFirst = (id) => `${id.replace(/-atelier$/, '')}\u0000${/-atelier$/.test(id) ? 1 : 0}`;
  const ids = order ? order.filter((id) => sources.has(id))
    : [...only ?? []].filter((id) => sources.has(id));
  for (const id of [...sources.keys()].sort((left, right) => themeFirst(left).localeCompare(themeFirst(right)))) {
    if (!ids.includes(id)) ids.push(id);
  }
  const rank = new Map((order ?? ids).map((id, index) => [id, index + 1]));

  mergeAdditions(additions, sources, partial, report);

  const debutModules = levelSource?.audio?.debutModules ?? profile.audio?.debutModules ?? 0;
  const modules = ids.map((id, index) => {
    const { module: source, where: at } = sources.get(id);
    const media = withCredits(source.media ?? []);
    const mediaByKey = new Map(media.map((item) => [item.key, item]));
    const module = {
      id: source.id, title: source.title, objective: source.objective, sources: source.sources,
      audioProfile: source.audioProfile ?? (order && (rank.get(id) ?? index + 1) <= debutModules ? profile.audio.debut : profile.audio.suite),
      grammarFocus: source.grammarFocus, layer: at, vocabulary: source.vocabulary ?? [], media,
      activities: (source.activities ?? []).filter(isObject).map((activity) => ({ ...activity, placements: placementDefaults(activity, mediaByKey) })),
    };
    module.activities = module.activities.map((activity) => normalizeActivity(activity, profile));
    questionMedia(module, profile);
    vocabulary(module, report, profile);
    const allByKey = new Map(module.media.map((item) => [item.key, item]));
    for (const activity of module.activities) {
      activity.placements = activity.placements.map((placement) => normalizePlacement(placement, allByKey));
    }
    pruneMedia(module, new Set(media.map((item) => item.key)), new Map(), report);
    if (!module.grammarFocus?.length) delete module.grammarFocus;
    return module;
  });
  modules.forEach((module, index) => { module.prerequisites = index ? [modules[index - 1].id] : []; });

  // Évaluations : diagnostic, bilan (midterm) et examen blanc (final), titres et descriptions de _level.mjs.
  const levelMedia = withCredits(clone(evaluations?.media ?? []));
  const levelByKey = new Map(levelMedia.map((item) => [item.key, item]));
  const assessments = clone(evaluations?.assessments ?? []).map((assessment) => ({
    ...assessment,
    parts: (assessment.parts ?? []).map((part) => ({
      ...part, criteria: part.criteria ?? [],
      placements: (part.placements ?? []).map((placement) => normalizePlacement({
        ...placement, transcriptVisibility: placement.transcriptVisibility ?? 'hidden' }, levelByKey)),
    })),
  }));
  for (const kind of ['midterm', 'final']) {
    const assessment = assessments.find((item) => item.kind === kind);
    for (const [field, property] of [[`${kind}Title`, 'title'], [`${kind}Description`, 'description']]) {
      const value = levelSource?.[field];
      if (value === undefined) continue;
      if (typeof value !== 'string' || !value.trim()) report.fail(`${levelWhere} › ${field}`, 'texte attendu');
      else if (assessment) assessment[property] = value.trim();
      else if (evaluations) report.fail(`${levelWhere} › ${field}`, `évaluation ${kind} absente de _evaluations.mjs`);
    }
  }
  const minutes = levelSource?.minutes ?? profile.budget;
  const shaped = modules.map((module) => {
    const { id, title, objective, prerequisites, audioProfile, sources: moduleSources, grammarFocus, layer, vocabulary: entries,
      activities, media } = module;
    return { id, title, objective, prerequisites, audioProfile, sources: moduleSources, ...(grammarFocus ? { grammarFocus } : {}), layer,
      vocabulary: entries, activities, media };
  });
  return {
    level: {
      levelId, format: FORMAT, layer: null, source: where(directory), ...(partial ? { partial: true, ...(order ? { plannedOrder: order } : {}) } : {}),
      activityMinutes: { min: minutes.min, max: minutes.max },
      ...(levelSource?.catalogue ? { catalogue: clone(levelSource.catalogue) } : {}),
      settings: clone(levelSource?.settings ?? {}),
      ...(evaluations?.diagnostic ? { diagnostic: clone(evaluations.diagnostic) } : {}),
      assessments, media: levelMedia,
    },
    modules: shaped,
    numbers: partial ? new Map(shaped.map((module) => [module.id, rank.get(module.id)])) : null,
  };
}

function stats(result) {
  const activities = result.modules.flatMap((module) => module.activities);
  const questions = activities.flatMap((activity) => activity.questions);
  const media = [...result.modules.flatMap((module) => module.media), ...result.level.media];
  const count = (type) => questions.filter((question) => question.type === type).length;
  return `${result.level.levelId.toUpperCase()}${result.level.partial ? ' (aperçu partiel)' : ''} · ${result.modules.length} modules · `
    + `${activities.length} activités · ${activities.reduce((total, activity) => total + activity.estimatedMinutes, 0)} min `
    + `(cible ${result.level.activityMinutes.min}–${result.level.activityMinutes.max}) · ${questions.length} questions dont `
    + `${questions.length - count('choice')} typées (${count('speak')} speak, ${count('dictation')} dictées) · `
    + `${activities.filter((activity) => activity.kind === 'mission').length} missions · `
    + `${result.modules.reduce((total, module) => total + module.vocabulary.length, 0)} mots · `
    + `${media.filter((item) => item.kind === 'audio').length} sons · ${media.filter((item) => item.kind === 'image').length} images`;
}

async function main() {
  const args = process.argv.slice(2);
  const values = (name) => args.flatMap((value, index) => (value === `--${name}` ? [args[index + 1]] : []));
  const sourceDir = values('source')[0] ? resolve(values('source')[0]) : join(root, 'content', 'b', 'source');
  const levels = values('level').length ? values('level')
    : existsSync(sourceDir) ? readdirSync(sourceDir).filter((name) => isLevelId(name)).sort() : [];
  if (!levels.length) throw new Error(`Aucun niveau à construire dans ${where(sourceDir)} (--level b1).`);
  for (const levelId of levels) if (!isLevelId(levelId)) throw new Error(`Niveau « ${levelId} » invalide (a1 … c2).`);
  const only = values('only').length ? new Set(values('only').flatMap((value) => String(value).split(',')).map((id) => id.trim()).filter(Boolean)) : null;
  const output = values('out')[0] ? resolve(values('out')[0]) : contentDir;
  if (only && output === contentDir) throw new Error('--only construit un aperçu partiel : indiquez --out <dossier> (rien de partiel dans content/de).');
  const report = reporter();
  const built = [];
  for (const levelId of levels) {
    const result = await buildLevel(levelId, { sourceDir, only, report });
    if (result) built.push(result);
  }
  if (!args.includes('--quiet')) for (const message of report.warnings) console.log(`Avertissement · ${message}`);
  if (report.errors.length) {
    for (const message of report.errors) console.error(`Erreur · ${message}`);
    console.error(`${report.errors.length} erreur(s) dans les sources : rien n’a été écrit.`);
    process.exit(1);
  }
  for (const result of built) {
    const files = writeLevel(output, result, { numbers: result.numbers });
    console.log(stats(result));
    if (result.level.partial) console.log(`  Modules : ${files.map(({ file }) => file).join(', ')}`);
  }
  writeJson(join(output, 'media', 'credits.json'), composeCredits(output));
  console.log(`Écrit dans ${relative(root, output).replace(/\\/g, '/') || '.'}.`);
  const workbook = values('workbook')[0] ? resolve(values('workbook')[0]) : null;
  for (const result of workbook ? built : []) {
    if (result.level.partial || !result.level.diagnostic) {
      console.warn(`Avertissement · cahier ${result.level.levelId.toUpperCase()} non écrit : construction partielle ou évaluations manquantes.`);
      continue;
    }
    mkdirSync(workbook, { recursive: true });
    const file = join(workbook, `${result.level.levelId.toUpperCase()}.html`);
    writeFileSync(file, renderWorkbook({ ...result.level, modules: result.modules }, 'B'));
    console.log(`Cahier hors ligne : ${relative(root, file).replace(/\\/g, '/')}.`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exit(1);
  });
}
