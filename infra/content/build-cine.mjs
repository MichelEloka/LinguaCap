#!/usr/bin/env node
// Construction du Ciné-club (EVO-055) : sources content/cine/<langue>/<filmId>.mjs (export par défaut { film, sequences })
// → content/<langue>/cine/<filmId>.json, document de film au format 1, c'est-à-dire exactement le corps de
// PUT /catalogue/films/{filmId} (précisions du contrat du lot C1). Guide : content/README.md, section « Ciné-club ».
//
// Usage :
//   node infra/content/build-cine.mjs                          tous les films (documents périmés supprimés)
//   node infra/content/build-cine.mjs --film nicos-weg-a1      un film (répétable, ou liste « a,b »)
//   node infra/content/build-cine.mjs --out target/cine-preview   aperçu : <sortie>/<langue>/cine/<filmId>.json
//   options : --lang de (répétable ; défaut : tous les dossiers de content/cine), --quiet
//
// Fait automatiquement : fiche du film complétée (fournisseur youtube, adresse de la vidéo, chaîne, crédit et note de
// licence par défaut), identifiants et positions des séquences (<filmId>-01…), bornes « m:ss » ou « h:mm:ss » converties
// en secondes, mots-clés complétés (article, pluriel, remarque à null), questions normalisées puis mises au format du
// document de version (type, moduleRef null, explication, choix, clé « spec » : celle de import-content.mjs).
// Les contrôles de fond (bornes, durées, liste autorisée des vidéos, crédit, balisage, questions, citations) sont ceux
// de check-content.mjs --films ; la construction ne refuse que les fautes de forme.
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizeQuestion, reporter, writeJson } from './build-common.mjs';
import { questionType, root } from './content-lib.mjs';
import { questionSpec } from './import-content.mjs';
import { PROFILES } from './level-profiles.mjs';

export const FILM_FORMAT = 1;
export const sourceRoot = join(root, 'content', 'cine');
const FILM_KEYS = new Set(['id', 'languageId', 'levelId', 'title', 'description', 'provider', 'videoId', 'channel', 'videoUrl',
  'courseUrl', 'credit', 'licenseNote', 'durationSeconds', 'position']);
const SEQUENCE_KEYS = new Set(['id', 'position', 'title', 'episodes', 'start', 'end', 'approx', 'context', 'keywords', 'questions']);
const KEYWORD_KEYS = new Set(['word', 'article', 'plural', 'translation', 'note']);
const QUESTION_KEYS = new Set(['id', 'type', 'prompt', 'explanation', 'options', 'text', 'blanks', 'answers', 'pairs']);
const OPTION_KEYS = new Set(['id', 'label', 'correct', 'feedback']);
/** Types admis dans une séquence : corrigés par la clé d'exercice, sans son (ni dictée ni répétition). */
export const FILM_QUESTION_TYPES = ['choice', 'fill', 'order', 'match'];
const DEFAULTS = { provider: 'youtube', channel: 'Deutsch lernen mit der DW',
  credit: 'Film : Nicos Weg, Deutsche Welle (Deutsch lernen mit der DW), lecteur YouTube' };

const unknownKeys = (value, allowed) => Object.keys(value ?? {}).filter((key) => !allowed.has(key));
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const where = (file) => relative(root, file).replace(/\\/g, '/');

/** « 7:30 », « 1:02:05 » ou un nombre de secondes → secondes entières ; NaN si la valeur n'est pas un temps. */
export function seconds(value) {
  if (Number.isFinite(value)) return value;
  const match = /^(?:(\d{1,2}):)?(\d{1,3}):(\d{2})$/.exec(String(value ?? '').trim());
  if (!match || Number(match[3]) > 59 || (match[1] !== undefined && Number(match[2]) > 59)) return Number.NaN;
  return Number(match[1] ?? 0) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

/** Question au format du document de version (VersionDocument.Question), comme buildDocument d'import-content.mjs. */
export function documentQuestion(question) {
  const type = questionType(question);
  return {
    id: question.id, type, prompt: question.prompt, moduleRef: null, explanation: question.explanation?.trim() || null,
    options: type === 'choice' ? (question.options ?? []).map((option) => ({ id: option.id, label: option.label,
      correct: option.correct, ...(option.feedback ? { feedback: option.feedback } : {}) })) : [],
    spec: questionSpec(question),
  };
}

/** Document de film (format 1) construit d'une source ; les fautes de forme sont signalées à report. */
export function buildFilm(source, { languageId, fileId, at, report }) {
  const film = source?.film;
  if (!isObject(film) || !Array.isArray(source?.sequences)) {
    report.fail(at, 'export par défaut { film, sequences } attendu');
    return null;
  }
  for (const key of unknownKeys(source, new Set(['film', 'sequences']))) report.fail(at, `clé « ${key} » inconnue (film, sequences)`);
  for (const key of unknownKeys(film, FILM_KEYS)) report.fail(`${at} › film`, `clé « ${key} » inconnue (${[...FILM_KEYS].join(', ')})`);
  if (film.id !== fileId) report.fail(`${at} › film`, `id « ${film.id} » : le fichier doit s’appeler <id>.mjs (${fileId})`);
  const profile = PROFILES[film.levelId] ?? PROFILES.b2;
  const document = {
    format: FILM_FORMAT,
    film: {
      id: film.id, languageId: film.languageId ?? languageId, levelId: film.levelId, title: film.title,
      description: film.description ?? '', provider: film.provider ?? DEFAULTS.provider, videoId: film.videoId,
      channel: film.channel ?? DEFAULTS.channel,
      videoUrl: film.videoUrl ?? `https://www.youtube.com/watch?v=${film.videoId}`,
      courseUrl: film.courseUrl, credit: film.credit ?? DEFAULTS.credit, licenseNote: film.licenseNote ?? '',
      durationSeconds: seconds(film.durationSeconds), position: film.position ?? 1,
    },
    sequences: [],
  };
  source.sequences.forEach((sequence, index) => {
    const position = sequence?.position ?? index + 1;
    const id = sequence?.id ?? `${film.id}-${String(position).padStart(2, '0')}`;
    const here = `${at} › séquence ${id}`;
    if (!isObject(sequence)) {
      report.fail(here, 'objet attendu');
      return;
    }
    for (const key of unknownKeys(sequence, SEQUENCE_KEYS)) report.fail(here, `clé « ${key} » inconnue (${[...SEQUENCE_KEYS].join(', ')})`);
    const start = seconds(sequence.start);
    const end = seconds(sequence.end);
    if (!Number.isInteger(start) || !Number.isInteger(end)) report.fail(here, 'start et end : secondes entières ou « m:ss », « h:mm:ss »');
    if (!Array.isArray(sequence.keywords)) report.fail(here, 'keywords : liste attendue (nom(), mot())');
    if (!Array.isArray(sequence.questions)) report.fail(here, 'questions : liste attendue (choice(), fill(), order(), match())');
    const keywords = (sequence.keywords ?? []).map((keyword, rank) => {
      for (const key of unknownKeys(keyword, KEYWORD_KEYS)) report.fail(`${here} › mot-clé ${rank + 1}`, `clé « ${key} » inconnue`);
      return { word: keyword?.word, article: keyword?.article ?? null, plural: keyword?.plural ?? null,
        translation: keyword?.translation, note: keyword?.note ?? null };
    });
    const questions = (sequence.questions ?? []).map((question) => {
      const label = `${here} › question ${question?.id}`;
      for (const key of unknownKeys(question, QUESTION_KEYS)) report.fail(label, `clé « ${key} » inconnue (${[...QUESTION_KEYS].join(', ')})`);
      for (const option of question?.options ?? []) {
        for (const key of unknownKeys(option, OPTION_KEYS)) report.fail(label, `choix ${option?.id} : clé « ${key} » inconnue`);
      }
      if (!FILM_QUESTION_TYPES.includes(questionType(question))) {
        report.fail(label, `type « ${questionType(question)} » : ${FILM_QUESTION_TYPES.join(', ')} seulement dans une séquence`);
      }
      return documentQuestion(normalizeQuestion(question, profile));
    });
    document.sequences.push({ id, position, title: sequence.title, start, end, approx: Boolean(sequence.approx),
      context: sequence.context, keywords, questions });
  });
  return document;
}

/** Sources d'une langue : <filmId>.mjs (les fichiers « _… » et lib.mjs sont des aides, pas des films). */
export function filmSources(languageId, base = sourceRoot) {
  const directory = join(base, languageId);
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter((name) => name.endsWith('.mjs') && !name.startsWith('_')).sort()
    .map((name) => ({ fileId: name.slice(0, -4), file: join(directory, name) }));
}

export async function buildCine({ languages, films = null, out = null, quiet = false, log = console.log } = {}) {
  const report = reporter();
  const written = [];
  const langs = languages ?? (existsSync(sourceRoot) ? readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^[a-z]{2}$/.test(entry.name)).map((entry) => entry.name).sort() : []);
  for (const languageId of langs) {
    const sources = filmSources(languageId).filter(({ fileId }) => !films || films.includes(fileId));
    const output = out ? join(resolve(out), languageId, 'cine') : join(root, 'content', languageId, 'cine');
    const documents = [];
    for (const { fileId, file } of sources) {
      const at = where(file);
      let source;
      try {
        source = (await import(`${pathToFileURL(file).href}?t=${Date.now()}`)).default;
      } catch (error) {
        report.fail(at, `lecture impossible : ${error.message}`);
        continue;
      }
      const document = buildFilm(source, { languageId, fileId, at, report });
      if (document) documents.push(document);
    }
    if (report.errors.length) continue;
    for (const document of documents) {
      const file = join(output, `${document.film.id}.json`);
      writeJson(file, document);
      written.push(file);
      const questions = document.sequences.reduce((total, sequence) => total + sequence.questions.length, 0);
      const minutes = document.sequences.reduce((total, sequence) => total + (sequence.end - sequence.start), 0) / 60;
      const approx = document.sequences.filter((sequence) => sequence.approx).length;
      if (!quiet) {
        log(`${document.film.id} · ${document.sequences.length} séquences · ${Math.round(minutes)} min · ${questions} questions`
          + (approx ? ` · ${approx} à bornes approchées` : '') + ` → ${where(file)}`);
      }
    }
    // Construction complète : un document sans source (film renommé ou supprimé) est retiré.
    if (!films && existsSync(output)) {
      const keep = new Set(documents.map((document) => `${document.film.id}.json`));
      for (const name of readdirSync(output)) {
        if (name.endsWith('.json') && !keep.has(name)) {
          rmSync(join(output, name));
          if (!quiet) log(`${where(join(output, name))} supprimé (plus de source).`);
        }
      }
    }
  }
  for (const message of report.warnings) log(`Avertissement · ${message}`);
  return { errors: report.errors, written };
}

async function main() {
  const args = process.argv.slice(2);
  const values = (name) => args.flatMap((value, index) => (args[index - 1] === `--${name}` ? value.split(',') : []))
    .map((value) => value.trim()).filter(Boolean);
  const films = values('film');
  const languages = values('lang');
  const [out] = values('out');
  const { errors } = await buildCine({ languages: languages.length ? languages : undefined, films: films.length ? films : null,
    out: out ?? null, quiet: args.includes('--quiet') });
  for (const message of errors) console.error(`Erreur · ${message}`);
  if (errors.length) {
    console.error(`${errors.length} erreur(s) : rien n’a été écrit.`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
