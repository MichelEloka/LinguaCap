#!/usr/bin/env node
// Contrôle des contenus pédagogiques (DEV-094) : structure, identifiants, corrigés, supports, textes alternatifs,
// transcriptions et couverture des quatre compétences. Au format 4 (V4 : level.json « format: 4 ») s'ajoutent les
// questions typées et leurs explications, les missions, le vocabulaire, les gabarits d'illustration V4, les budgets de
// durée, le débit des sons A1 et la taille du document importé. Usage :
//   node infra/content/check-content.mjs                      tous les niveaux de content/de et le test de niveau
//   node infra/content/check-content.mjs target/v4-preview/a1   un niveau construit ailleurs (aperçu de build-v4)
//   node infra/content/check-content.mjs content/de/a1/02-zahlen.json   un module
//   node infra/content/check-content.mjs content/de/placement/placement.json   le test de niveau seul
//   --strict : les règles de complétude V4 (explications, vocabulaire, exercices typés, missions relues…) sont des
//   erreurs pour tous les modules ; sans --strict, elles ne le sont que pour les modules dotés d'une couche pédagogique.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  QUESTION_TYPES, audioManifest, availableLevels, baseAudioDir, courseLevelIds, levelFormat, questionType, spokenLines,
} from './content-lib.mjs';
import { MAX_BODY, buildDocument } from './import-content.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sources = join(root, 'resource-langue', 'extraits');
const icons = new Set(readFileSync(join(root, 'infra/content/icons.txt'), 'utf8').split(/\r?\n/).filter(Boolean));
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COMPETENCES = ['lecture', 'ecoute', 'expression-ecrite', 'expression-orale'];
const VOICES = new Set(['sprecherin', 'sprecher', 'frau', 'mann']);
const SETTINGS = new Set(['cafe', 'street', 'home', 'classroom', 'office', 'station', 'park', 'shop', 'doctor', 'party',
  'kitchen', 'hotel', 'city', 'beach']);
const VISIBILITY = new Set(['on_demand', 'after_answer', 'hidden']);
const PARTS_OF_SPEECH = new Set(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'number',
  'expression', 'other']);
/** Modules de sons du début de l'A1 : 6 mots de vocabulaire suffisent, pas de dictée. */
const SOUND_MODULES = new Set(['a1-abc', 'a1-voyelles', 'a1-rythme']);

const errors = [];
const warnings = [];
const fail = (where, message) => errors.push(`${where} : ${message}`);
const warn = (where, message) => warnings.push(`${where} : ${message}`);
const text = (value) => (typeof value === 'string' ? value.trim() : '');
const sized = (where, value, min, max, label) => {
  const length = text(value).length;
  if (length < min || length > max) fail(where, `${label} doit compter ${min} à ${max} caractères (actuellement ${length})`);
};
const strict = process.argv.includes('--strict');
/** Règle de complétude V4 : erreur pour un module doté d'une couche (ou avec --strict), avertissement sinon. */
const need = (where, message, enforced) => (strict || enforced ? fail : warn)(where, message);
const normalized = (value) => text(value).toLowerCase().normalize('NFC').replace(/[.,;:!?¿¡"«»()[\]…–—/]/g, ' ')
  .replace(/\s+/g, ' ').trim();
const wordCount = (value) => text(value).split(/\s+/).filter(Boolean).length;
// Nombre écrit en lettres (mot entier). L'article ein, eine, einen… n'en est pas un ; seul « eins » compte. Les dizaines
// sont énumérées pour ne pas confondre Leipzig ou fleißig avec un nombre.
const TENS = '(?:zwanzig|dreißig|vierzig|fünfzig|sechzig|siebzig|achtzig|neunzig)';
const NUMBER_WORD = new RegExp(`(?<!\\p{L})(?:null|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf`
  + `|(?:drei|vier|fünf|sech|sieb|acht|neun)zehn|(?:(?:ein|zwei|drei|vier|fünf|sechs|sieben|acht|neun)und)?${TENS}`
  + `|\\p{L}*hundert\\p{L}*|\\p{L}*tausend\\p{L}*)(?!\\p{L})`, 'iu');
// Graphies de remplacement (ä → ae, ß → ss…) à éviter dans les réponses canoniques : l'élève apprend la graphie exacte.
const TRANSLITERATED = /\b(fuer|ueber\w*|muess\w*|koenn\w*|moecht\w*|schoen\w*|maedchen|faehrt|frueh\w*|tuer|spaet\w*|zurueck|hoer\w*|groess\w*|natuerlich|kaese|buero|wuensch\w*|gruen\w*|fuenf\w*|zwoelf|schluessel|kueche|gemuese|muenchen|koeln|oesterreich|aerzt\w*|strasse|gross|heiss\w*|weiss|fuss\w*|gruss|suess|dreissig|schliess\w*|spass|aussen)\b/i;

/**
 * Médias du niveau contrôlé : son dossier media (content/de/media ou la sortie de build-v4), puis content/de/media et,
 * pour les enregistrements natifs, la V2 de référence dont ils sont tirés.
 */
let mediaRoot = join(root, 'content/de/media');
const mediaFile = (kind, name) => [join(mediaRoot, kind, name), join(root, 'content/de/media', kind, name)].find(existsSync);

function checkQuestions(where, questions, { min, max, moduleRefs, typed = false, format = 3, enforced = false }) {
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
    if (format >= 4 && typed) {
      const explanation = text(question.explanation);
      if (!explanation) need(at, 'explication manquante (explanation, 10 à 600 caractères : pourquoi c’est juste)', enforced);
      else if (explanation.length < 10 || explanation.length > 600) fail(at, `explication de 10 à 600 caractères (actuellement ${explanation.length})`);
      else if (explanation.length > 400) warn(at, `explication longue (${explanation.length} caractères, 400 conseillés)`);
    }
    const type = questionType(question);
    if (!QUESTION_TYPES.includes(type)) {
      fail(at, `type « ${type} » inconnu (${QUESTION_TYPES.join(', ')})`);
      return;
    }
    if (type !== 'choice') {
      if (!typed || format < 4) fail(at, 'seul le type choice est admis ici');
      else checkTypedQuestion(at, question, type);
      return;
    }
    const options = question.options ?? [];
    if (options.length < 3 || options.length > 4) fail(at, '3 ou 4 choix attendus');
    const optionIds = new Set();
    for (const option of options) {
      if (!ID.test(option?.id ?? '') || optionIds.has(option.id)) fail(at, `choix « ${option?.id} » invalide ou en double`);
      optionIds.add(option.id);
      sized(at, option.label, 1, 300, `le libellé du choix ${option.id}`);
      if (typeof option.correct !== 'boolean') fail(at, `le choix ${option.id} doit indiquer correct: true ou false`);
      if (option.feedback !== undefined && option.feedback !== null) sized(at, option.feedback, 1, 500, `le retour du choix ${option.id}`);
    }
    if (options.filter((option) => option.correct === true).length !== 1) fail(at, 'une seule bonne réponse attendue');
    const labels = options.map((option) => text(option.label).toLowerCase());
    if (new Set(labels).size !== labels.length) fail(at, 'deux choix ont le même libellé');
  });
}

const stringList = (value, min, max, maxLength) => Array.isArray(value) && value.length >= min && value.length <= max
  && value.every((item) => typeof item === 'string' && item.trim().length >= 1 && item.length <= maxLength);
const transliterated = (at, value) => {
  const match = TRANSLITERATED.exec(text(value));
  if (match) warn(at, `« ${match[0]} » : écrire la graphie allemande exacte (ä, ö, ü, ß) dans la réponse canonique`);
};

/** Questions typées (format 4) : champs propres au type, tailles et cohérence des solutions. */
function checkTypedQuestion(at, question, type) {
  if (question.options?.length) fail(at, `une question ${type} n’a pas de choix (options)`);
  if (type === 'fill') {
    sized(at, question.text, 3, 1000, 'le texte à trous');
    const markers = [...text(question.text).matchAll(/\[\[([^\]]*)\]\]/g)].map((match) => match[1]);
    const blanks = question.blanks ?? [];
    if (!Array.isArray(blanks) || blanks.length < 1 || blanks.length > 8) fail(at, '1 à 8 trous attendus');
    const ids = (blanks ?? []).map((blank) => String(blank?.id ?? ''));
    if (markers.length !== new Set(markers).size) fail(at, 'un marqueur [[id]] apparaît deux fois');
    if (ids.length !== new Set(ids).size) fail(at, 'deux trous ont le même identifiant');
    if (markers.slice().sort().join('|') !== ids.slice().sort().join('|')) {
      fail(at, `les marqueurs [[${markers.join(']], [[')}]] du texte doivent correspondre aux trous (${ids.join(', ')})`);
    }
    for (const blank of blanks ?? []) {
      if (!/^[a-z0-9]{1,8}$/.test(String(blank?.id ?? ''))) fail(at, `identifiant de trou « ${blank?.id} » invalide`);
      if (!stringList(blank?.accept, 1, 10, 80)) fail(at, `trou ${blank?.id} : 1 à 10 réponses acceptées de 80 caractères au plus`);
      else transliterated(at, blank.accept[0]);
      if (!Number.isInteger(blank?.size) || blank.size < 1 || blank.size > 60) fail(at, `trou ${blank?.id} : taille (size) de 1 à 60`);
      if (blank?.hint !== null && blank?.hint !== undefined) sized(at, blank.hint, 1, 120, `l’indice du trou ${blank.id}`);
    }
  } else if (type === 'order') {
    const answers = question.answers;
    if (!Array.isArray(answers) || answers.length < 1 || answers.length > 8
        || !answers.every((answer) => stringList(answer, 2, 16, 80))) {
      fail(at, 'answers : 1 à 8 solutions de 2 à 16 jetons (80 caractères au plus chacun)');
      return;
    }
    const multiset = (answer) => answer.map((token) => token.trim()).sort().join('\u0000');
    if (answers.some((answer) => multiset(answer) !== multiset(answers[0]))) fail(at, 'toutes les solutions utilisent les mêmes jetons');
    if (new Set(answers.map((answer) => answer.join('\u0000'))).size !== answers.length) fail(at, 'deux solutions identiques');
    // Comme au catalogue : il doit exister une disposition fausse (sinon les jetons ne peuvent pas être mélangés).
    const counts = {};
    for (const token of answers[0]) counts[token.trim()] = (counts[token.trim()] ?? 0) + 1;
    let arrangements = 1;
    let placed = 0;
    for (const count of Object.values(counts)) {
      for (let index = 1; index <= count && arrangements < 1e6; index++) arrangements = (arrangements * ++placed) / index;
    }
    const distinct = new Set(answers.map((answer) => answer.map((token) => token.trim()).join('\u0000'))).size;
    if (arrangements <= distinct) fail(at, 'toutes les dispositions des jetons sont justes : rien à remettre en ordre');
    if (answers[0].length < 3) warn(at, 'deux jetons seulement : l’exercice se réduit à un choix binaire');
    transliterated(at, answers[0].join(' '));
  } else if (type === 'match') {
    const pairs = question.pairs;
    if (!Array.isArray(pairs) || pairs.length < 2 || pairs.length > 8) {
      fail(at, '2 à 8 paires attendues (6 conseillées)');
      return;
    }
    if (pairs.length > 6) warn(at, `${pairs.length} paires : 6 au plus sont conseillées`);
    for (const pair of pairs) {
      sized(at, pair?.left, 1, 120, 'un élément de gauche');
      sized(at, pair?.right, 1, 120, 'un élément de droite');
    }
    const lefts = pairs.map((pair) => text(pair?.left).toLowerCase());
    const rights = pairs.map((pair) => text(pair?.right).toLowerCase());
    if (new Set(lefts).size !== lefts.length || new Set(rights).size !== rights.length) fail(at, 'paires uniques à gauche et à droite');
  } else if (type === 'dictation') {
    if (!stringList(question.accept, 1, 5, 300)) fail(at, 'accept : 1 à 5 phrases de 300 caractères au plus');
    else {
      transliterated(at, question.accept[0]);
      if (normalized(question.prompt).includes(normalized(question.accept[0]))) fail(at, 'la phrase dictée apparaît dans la consigne');
      if (wordCount(question.accept[0]) > 25) warn(at, `dictée longue (${wordCount(question.accept[0])} mots)`);
    }
    if (question.voice !== undefined && !VOICES.has(question.voice)) fail(at, `voix « ${question.voice} » inconnue`);
    if (question.showWordCount !== undefined && typeof question.showWordCount !== 'boolean') fail(at, 'showWordCount : true ou false');
  } else if (type === 'speak') {
    sized(at, question.text, 2, 300, 'le texte à répéter');
    const count = wordCount(question.text);
    if (count < 2 || count > 12) fail(at, `2 à 12 mots à répéter (actuellement ${count})`);
    if (!stringList(question.accept, 1, 5, 300)) fail(at, 'accept : 1 à 5 formulations acceptées');
    if (!Number.isInteger(question.threshold) || question.threshold < 50 || question.threshold > 100) fail(at, 'seuil (threshold) de 50 à 100');
    if (question.voice !== undefined && !VOICES.has(question.voice)) fail(at, `voix « ${question.voice} » inconnue`);
    if (NUMBER_WORD.test(text(question.text)) && !(question.accept ?? []).some((value) => /\d/.test(value))) {
      warn(at, 'nombre en toutes lettres : ajouter dans accept une variante en chiffres (la reconnaissance vocale écrit souvent 15)');
    }
    transliterated(at, question.text);
  }
}

const isText = (value, max = 300) => typeof value === 'string' && value.trim().length >= 1 && value.length <= max;
const isPoint = (value) => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite);
const isRect = (value) => Array.isArray(value) && value.length === 4 && value.every(Number.isFinite);
const checkIcon = (at, name, optional = false) => {
  if (optional && name === undefined) return;
  if (!icons.has(name)) fail(at, `pictogramme « ${name} » inconnu`);
};
/** Documents (affiche, carte, formulaire…) : titre, sous-titre, lignes et paires clé/valeur. */
function checkPaper(at, doc) {
  if (!isText(doc.title, 120)) fail(at, 'un document a un titre (120 caractères au plus)');
  if (doc.subtitle !== undefined && !isText(doc.subtitle, 160)) fail(at, 'sous-titre de 160 caractères au plus');
  checkIcon(at, doc.icon, true);
  for (const field of ['meta', 'rows']) {
    for (const pair of doc[field] ?? []) if (!Array.isArray(pair) || pair.length !== 2 || !pair.every((cell) => isText(cell))) fail(at, `${field} : paires [clé, valeur]`);
  }
  for (const field of ['intro', 'lines']) {
    for (const line of doc[field] ?? []) {
      const entry = typeof line === 'string' ? { text: line } : line;
      if (!isText(entry?.text, 400)) fail(at, `${field} : ligne de 400 caractères au plus`);
      checkIcon(at, entry?.icon, true);
    }
  }
}

/** Gabarits ajoutés en V4 dans render-images.mjs : champs attendus par le rendu, pictogrammes et lieux connus. */
const LAYOUTS = {
  grid: (at, image) => {
    const items = image.items ?? [];
    if (items.length < 2 || items.length > 6) fail(at, 'une grille compte 2 à 6 pictogrammes');
    for (const cell of items) {
      checkIcon(at, cell.icon);
      sized(at, cell.label, 1, 32, 'une étiquette');
    }
  },
  single: (at, image) => checkIcon(at, image.icon),
  scene: (at, image) => {
    if (!SETTINGS.has(image.setting)) fail(at, `lieu « ${image.setting} » inconnu`);
    if ((image.people ?? []).length > 3) fail(at, 'trois personnes au plus');
    for (const person of image.people ?? []) {
      sized(at, person.name, 1, 20, 'le nom');
      if (person.say !== undefined) sized(at, person.say, 1, 32, 'une bulle');
    }
    if ((image.items ?? []).length > 4) fail(at, 'quatre objets au plus');
    for (const icon of image.items ?? []) checkIcon(at, icon);
  },
  document: (at, image) => {
    checkPaper(at, image);
    if (![image.meta, image.intro, image.rows, image.lines].some((list) => list?.length)) fail(at, 'un document a au moins une ligne');
  },
  cards: (at, image) => {
    if (!Array.isArray(image.cards) || image.cards.length < 2 || image.cards.length > 4) fail(at, '2 à 4 cartes');
    for (const card of image.cards ?? []) checkPaper(at, card);
  },
  form: (at, image) => {
    checkPaper(at, image);
    if (!Array.isArray(image.fields) || image.fields.length < 1 || image.fields.length > 12) fail(at, '1 à 12 champs');
    for (const field of image.fields ?? []) {
      if (!isText(field.label, 60)) fail(at, 'libellé de champ de 60 caractères au plus');
      if (field.value !== undefined && field.value !== null && typeof field.value !== 'string') fail(at, 'valeur de champ : texte');
    }
  },
  table: (at, image) => {
    checkPaper(at, { ...image, rows: undefined });
    if (!Array.isArray(image.rows) || image.rows.length < 1 || image.rows.length > 10) fail(at, '1 à 10 lignes de tableau');
    const width = image.columns?.length ?? image.rows?.[0]?.length;
    for (const row of image.rows ?? []) if (!Array.isArray(row) || row.length !== width || !row.every((cell) => typeof cell === 'string')) fail(at, `lignes de ${width} cellules`);
    for (const index of image.highlight ?? []) if (!Number.isInteger(index) || index < 0 || index >= (image.rows ?? []).length) fail(at, `ligne mise en avant ${index} inexistante`);
    if (image.rowIcons) {
      if (image.rowIcons.length !== (image.rows ?? []).length) fail(at, 'un pictogramme par ligne (rowIcons)');
      for (const icon of image.rowIcons) checkIcon(at, icon);
    }
  },
  messages: (at, image) => {
    checkPaper(at, image);
    if (!Array.isArray(image.messages) || image.messages.length < 1 || image.messages.length > 8) fail(at, '1 à 8 messages');
    for (const message of image.messages ?? []) {
      if (!isText(message.text, 400)) fail(at, 'message de 400 caractères au plus');
      if (message.side !== undefined && !['left', 'right'].includes(message.side)) fail(at, 'côté left ou right');
    }
  },
  receipt: (at, image) => {
    if (!isText(image.title, 80)) fail(at, 'un ticket de caisse a un titre');
    if (!Array.isArray(image.lines) || image.lines.length < 1 || image.lines.length > 10
        || !image.lines.every((line) => Array.isArray(line) && line.length === 2 && line.every((cell) => isText(cell, 80)))) {
      fail(at, '1 à 10 lignes [article, montant]');
    }
    if (!Array.isArray(image.total) || image.total.length !== 2 || !image.total.every((cell) => isText(cell, 40))) fail(at, 'total [libellé, montant]');
    checkIcon(at, image.icon, true);
  },
  ticket: (at, image) => {
    checkPaper(at, image);
    if (!Array.isArray(image.fields) || image.fields.length < 1 || image.fields.length > 9
        || !image.fields.every((field) => Array.isArray(field) && field.length === 2 && field.every((cell) => isText(cell, 60)))) {
      fail(at, '1 à 9 champs [libellé, valeur]');
    }
  },
  clocks: (at, image) => {
    if (!Array.isArray(image.items) || image.items.length < 1 || image.items.length > 4) fail(at, '1 à 4 horloges');
    for (const item of image.items ?? []) {
      if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(item.time ?? '')) fail(at, `heure « ${item.time} » au format hh:mm`);
      if (!isText(item.label, 60)) fail(at, 'chaque horloge a une étiquette');
      checkIcon(at, item.icon, true);
    }
  },
  route: (at, image) => {
    if (!Array.isArray(image.steps) || image.steps.length < 2 || image.steps.length > 5) fail(at, '2 à 5 étapes');
    for (const step of image.steps ?? []) {
      checkIcon(at, step.icon);
      if (!isText(step.label, 60)) fail(at, 'chaque étape a une étiquette');
    }
    if ((image.links ?? []).length > Math.max(0, (image.steps ?? []).length - 1)) fail(at, 'une liaison de moins que d’étapes');
    for (const link of image.links ?? []) if (link) checkIcon(at, link.icon, true);
    checkIcon(at, image.noteIcon, true);
  },
  plan: (at, image) => {
    for (const street of image.streets ?? []) if (!Array.isArray(street.points) || street.points.length < 2 || !street.points.every(isPoint)) fail(at, 'rue : 2 points [x, y] ou plus');
    if (image.room !== undefined && !isRect(image.room)) fail(at, 'pièce [x, y, largeur, hauteur]');
    for (const piece of image.furniture ?? []) if (!isRect(piece.rect) || !isText(piece.label, 40)) fail(at, 'meuble : rect [x, y, l, h] et étiquette');
    for (const opening of image.openings ?? []) if (!isRect(opening.at)) fail(at, 'ouverture : at [x1, y1, x2, y2]');
    for (const arrow of [...(image.route ? [{ points: image.route }] : []), ...(image.arrows ?? [])]) {
      if (!Array.isArray(arrow.points) || arrow.points.length < 2 || !arrow.points.every(isPoint)) fail(at, 'trajet : 2 points [x, y] ou plus');
    }
    for (const label of image.labels ?? []) if (!isPoint(label.at) || !isText(label.text, 60)) fail(at, 'étiquette : at [x, y] et texte');
    for (const place of image.places ?? []) {
      checkIcon(at, place.icon);
      if (!isPoint(place.at)) fail(at, 'lieu : at [x, y]');
    }
    if (!(image.streets?.length || image.room || image.places?.length)) fail(at, 'un plan a des rues, une pièce ou des lieux');
  },
  words: (at, image) => {
    if (!Array.isArray(image.groups) || image.groups.length < 1 || image.groups.length > 6) fail(at, '1 à 6 groupes de mots');
    for (const group of image.groups ?? []) {
      if (!isText(group.title, 40)) fail(at, 'chaque groupe a un titre');
      if (!stringList(group.words, 1, 8, 60)) fail(at, '1 à 8 mots par groupe');
    }
  },
  letters: (at, image) => {
    if (!Array.isArray(image.rows) || image.rows.length < 1 || image.rows.length > 5) fail(at, '1 à 5 rangées de lettres');
    for (const row of image.rows ?? []) {
      const entries = typeof row === 'string' ? [...row].map((letter) => ({ letter })) : row;
      if (!Array.isArray(entries) || entries.length < 1 || entries.length > 12 || !entries.every((entry) => isText(entry?.letter, 4))) {
        fail(at, 'rangée de 1 à 12 lettres');
      }
    }
  },
  dates: (at, image) => {
    if (!Array.isArray(image.items) || image.items.length < 1 || image.items.length > 5) fail(at, '1 à 5 dates');
    for (const item of image.items ?? []) {
      if (!isText(item.month, 20) || !isText(String(item.day ?? ''), 4) || !isText(item.label, 60)) fail(at, 'date : mois, jour et étiquette');
    }
  },
};

function checkImage(at, image) {
  const layout = LAYOUTS[image.layout];
  if (!layout) {
    fail(at, `mise en page « ${image.layout} » inconnue (${Object.keys(LAYOUTS).join(', ')})`);
    return;
  }
  if (image.setting !== undefined && !SETTINGS.has(image.setting)) fail(at, `lieu « ${image.setting} » inconnu`);
  layout(at, image);
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
      if (item.segments !== undefined && typeof item.segments !== 'boolean') fail(at, 'segments : true ou false');
      if (item.native) {
        // Enregistrement repris d'une ressource libre : le MP3 préparé est versionné, la source peut manquer en CI.
        // En V4, le MP3 d'origine de la V2 de référence (content/base/de/media/audio) sert de source au son ralenti.
        if (!text(item.native.file)) fail(at, 'un enregistrement natif indique son fichier source');
        else if (!existsSync(join(sources, item.native.file)) && !mediaFile('audio', `${item.key}.mp3`)
            && !existsSync(join(baseAudioDir, `${item.v3SourceKey ?? item.key}.mp3`))) {
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
        else if (!existsSync(join(sources, item.photo.file)) && !mediaFile('images', `${item.key}.jpg`)) {
          fail(at, `fichier source ${item.photo.file} introuvable et image non préparée`);
        }
        const crop = item.photo.crop;
        if (crop !== undefined && (!Array.isArray(crop) || crop.length !== 4 || crop.some((value) => !(value >= 0 && value <= 1))
            || crop[0] + crop[2] > 1.0001 || crop[1] + crop[3] > 1.0001 || crop[2] < 0.1 || crop[3] < 0.1)) {
          fail(at, 'recadrage [x, y, largeur, hauteur] en fractions de l’image');
        }
        if (item.image) fail(at, 'une image est soit reprise (photo), soit composée (image)');
      } else {
        // Illustration composée : vignettes, image seule, scène et gabarits V4 de render-images.mjs.
        checkImage(at, image);
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
      else if (placement.optionId && !(question.options ?? []).some((option) => option.id === placement.optionId)) {
        fail(at, `choix « ${placement.optionId} » inconnu`);
      }
    } else if (placement.optionId) {
      fail(at, 'un choix illustré indique aussi sa question');
    }
  }
}

// Une activité ne renvoie plus à un corrigé séparé : la correction s'affiche après la remise de l'exercice.
const ANNOUNCES_CORRECTION = /activité suivante|\b(?:le|un|du|au|ce|les|des|aux)\s+corrigés?(?!\p{L})|^\s*corrigés?(?!\p{L})/imu;
// Consignes à faire hors de l'application (papier, cartes, partenaire) ; « cahier » seul peut traduire das Heft.
const OFF_APP = /\btracez|\bdessinez|sur une (?:feuille|fiche papier)|(?:dans|sur|à) (?:votre|ton|un|le|son) cahier|\bcartons\b|\bpartenaire/i;
/** Durées conseillées (EVO-041) : leçon 10–15, exercice 8–12, répétition 8–10, mission 15–20 minutes. */
const DURATIONS = { lesson: [10, 15], exercise: [8, 12], speak: [8, 10], mission: [15, 20] };

/** Mission (format 4) : parties orale et écrite, liste de vérification et compétences cohérentes. */
function checkMission(at, activity, enforced) {
  const mission = activity.mission;
  if (!mission || typeof mission !== 'object') {
    fail(at, 'une activité mission décrit sa mission (oral, written, checklist)');
    return;
  }
  if (!mission.oral && !mission.written) fail(at, 'une mission a une partie orale, une partie écrite ou les deux');
  if (mission.oral) {
    sized(at, mission.oral.prompt, 10, 1000, 'la consigne orale');
    if (!Number.isInteger(mission.oral.maxSeconds) || mission.oral.maxSeconds < 30 || mission.oral.maxSeconds > 120) {
      fail(at, 'durée d’enregistrement (maxSeconds) de 30 à 120 secondes');
    }
  }
  if (mission.written) {
    sized(at, mission.written.prompt, 10, 1000, 'la consigne écrite');
    if (!Number.isInteger(mission.written.maxChars) || mission.written.maxChars < 200 || mission.written.maxChars > 1500) {
      fail(at, 'texte (maxChars) de 200 à 1 500 caractères');
    }
    if (!Number.isInteger(mission.written.minWords) || mission.written.minWords < 0 || mission.written.minWords > 200) {
      fail(at, 'nombre minimal de mots (minWords) de 0 à 200');
    }
    if (mission.written.minWords * 4 > mission.written.maxChars) warn(at, 'minWords difficile à tenir dans maxChars');
  }
  if (!stringList(mission.checklist, 2, 6, 160) || mission.checklist.some((item) => item.trim().length < 3)) {
    fail(at, '2 à 6 points de vérification de 160 caractères au plus');
  }
  const competences = activity.competences ?? [];
  if (mission.oral && !competences.includes('expression-orale')) fail(at, 'une partie orale implique la compétence expression-orale');
  if (mission.written && !competences.includes('expression-ecrite')) fail(at, 'une partie écrite implique la compétence expression-ecrite');
  if (!mission.oral && competences.includes('expression-orale')) fail(at, 'expression-orale sans partie orale');
  if (!mission.written && competences.includes('expression-ecrite')) fail(at, 'expression-ecrite sans partie écrite');
  if ((activity.questions ?? []).length) fail(at, 'une mission n’a pas de questions');
  if (activity.draft) need(at, `mission provisoire (${activity.draft})`, enforced);
}

/** Vocabulaire du module (format 4) : champs, article et majuscule des noms, référence au son du lexique. */
function checkVocabulary(where, module, keys, enforced, used) {
  const entries = module.vocabulary;
  if (!Array.isArray(entries)) {
    fail(where, 'vocabulary : liste attendue');
    return;
  }
  const [min, max] = SOUND_MODULES.has(module.id) ? [6, 30] : [10, 30];
  if (entries.length < min || entries.length > max) need(where, `vocabulaire de ${min} à ${max} entrées (actuellement ${entries.length})`, enforced);
  const ids = new Set();
  for (const entry of entries) {
    const at = `${where} › vocabulaire ${entry?.id ?? entry?.word}`;
    if (!ID.test(entry?.id ?? '') || entry.id.length > 64 || ids.has(entry.id)) fail(at, 'identifiant invalide ou en double');
    ids.add(entry?.id);
    sized(at, entry?.word, 1, 80, 'le mot');
    sized(at, entry?.translation, 1, 160, 'la traduction');
    if (!PARTS_OF_SPEECH.has(entry?.partOfSpeech)) fail(at, `nature « ${entry?.partOfSpeech} » inconnue (${[...PARTS_OF_SPEECH].join(', ')})`);
    if (![null, 'der', 'die', 'das'].includes(entry?.article ?? null)) fail(at, 'article der, die, das ou null');
    if (entry?.plural !== null && entry?.plural !== undefined) sized(at, entry.plural, 1, 80, 'le pluriel');
    if (entry?.note !== null && entry?.note !== undefined) sized(at, entry.note, 1, 120, 'la note');
    if (entry?.partOfSpeech === 'noun') {
      if (!entry.article && !/pluriel/i.test(entry.note ?? '')) fail(at, 'un nom a son article (sauf note « toujours au pluriel »)');
      if (!/^\p{Lu}/u.test(text(entry.word))) fail(at, 'un nom commence par une majuscule');
    } else if (entry?.article) {
      fail(at, 'seul un nom a un article');
    }
    transliterated(at, entry?.word);
    if (entry?.example === null || entry?.example === undefined) warn(at, 'exemple manquant');
    else {
      sized(at, entry.example, 3, 300, 'l’exemple');
      const example = text(entry.example).toLowerCase();
      const word = text(entry.word).toLowerCase().replace(/^(sich|der|die|das)\s+/, '');
      // Verbe séparable (note « séparable : an|fangen ») : la particule ou la base suffit (« Der Kurs fängt an »).
      const separable = /(\p{L}+)\|(\p{L}+)/u.exec(entry.note ?? '')?.slice(1) ?? [];
      const stems = [word, word.replace(/(en|n|e)$/, ''), text(entry.plural).toLowerCase(), ...word.split(/[|\s]+/),
        ...separable.map((part) => part.toLowerCase())].filter((stem) => stem.length >= 3);
      if (!stems.some((stem) => example.includes(stem))) warn(at, `l’exemple ne contient pas « ${entry.word} »`);
    }
    const audio = entry?.audio;
    const media = audio && keys.get(audio.media);
    if (!audio || !media) fail(at, 'référence audio { media, line } vers le son du lexique attendue');
    else {
      if (media.kind !== 'audio' || media.segments !== true) fail(at, `le son ${audio.media} doit être un son à segments (segments: true)`);
      if (!Number.isInteger(audio.line) || audio.line < 0 || audio.line >= spokenLines(media).length) fail(at, `ligne ${audio.line} absente du son ${audio.media}`);
      used.add(audio.media);
    }
  }
}

function checkModule(file, module, context) {
  const where = basename(file);
  const format = context.format ?? 3;
  const enforced = Boolean(module.layer);
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
  const [minActivities, maxActivities] = format >= 4 ? [4, 16] : [5, 12];
  if (activities.length < minActivities || activities.length > maxActivities) fail(where, `${minActivities} à ${maxActivities} activités attendues`);
  let minutes = 0;
  const used = new Set();
  const kinds = format >= 4 ? ['lesson', 'exercise', 'mission'] : ['lesson', 'exercise'];
  for (const activity of activities) {
    const at = `${where} › ${activity?.id}`;
    if (!ID.test(activity?.id ?? '') || activity.id.length > 40 || !activity.id.startsWith(`${module.id}-`)
        || activity.id.startsWith('revision-')) {
      fail(at, `identifiant invalide : préfixe « ${module.id}- », 40 caractères au plus`);
    }
    if (context.activityIds.has(activity.id)) fail(at, 'identifiant d’activité en double dans le niveau');
    context.activityIds.add(activity.id);
    if (!kinds.includes(activity.kind)) fail(at, `kind ${kinds.join(', ')} attendu`);
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
    const questions = activity.questions ?? [];
    if (activity.kind === 'exercise') {
      checkQuestions(at, questions, format >= 4 ? { min: 3, max: 10, typed: true, format, enforced } : { min: 4, max: 8 });
      context.questions += questions.length;
    } else if (questions.length > 0) {
      fail(at, activity.kind === 'mission' ? 'une mission n’a pas de questions' : 'une leçon n’a pas de questions');
    }
    if (format >= 4) {
      if (activity.id.endsWith('-correction')) fail(at, 'activité de correction séparée : la correction s’affiche après la remise de l’exercice');
      const shown = `${activity.title ?? ''}\n${lesson.title ?? ''}\n${lesson.description ?? ''}`;
      const announce = ANNOUNCES_CORRECTION.exec(shown);
      if (announce) fail(at, `le texte annonce un corrigé (« ${announce[0].trim()} ») : la correction s’affiche après la remise`);
      const offApp = OFF_APP.exec(`${lesson.description ?? ''}\n${JSON.stringify(activity.mission ?? '')}`);
      if (offApp && activity.kind !== 'exercise') warn(at, `consigne hors application (« ${offApp[0]} ») : à réécrire pour l’application`);
      if (activity.kind === 'mission') checkMission(at, activity, enforced);
      else if (activity.mission !== undefined && activity.mission !== null) fail(at, 'seule une activité mission porte une mission');
      const speakOnly = activity.kind === 'exercise' && questions.length && questions.every((question) => question.type === 'speak');
      const [low, high] = DURATIONS[speakOnly ? 'speak' : activity.kind] ?? [5, 20];
      if (enforced && (activity.estimatedMinutes < low || activity.estimatedMinutes > high)) {
        warn(at, `durée conseillée de ${low} à ${high} minutes (actuellement ${activity.estimatedMinutes})`);
      }
      checkQuestionSupports(at, activity);
    }
    checkPlacements(at, activity.placements, activity.questions, context.keys, used);
    const audio = (activity.placements ?? []).filter((placement) => placement.usage === 'audio');
    if (activity.competences?.includes('ecoute') && audio.length === 0) fail(at, 'une activité d’écoute a un son');
    const speakSupports = new Set(questions.filter((question) => question.type === 'speak').map((question) => question.id));
    if (activity.kind === 'exercise' && activity.competences?.includes('ecoute')
        && audio.some((placement) => placement.transcriptVisibility === 'on_demand' && !speakSupports.has(placement.questionId))) {
      warn(at, 'la transcription d’un exercice d’écoute s’affiche plutôt après la réponse (after_answer)');
    }
  }
  if (minutes < 55 || minutes > 180) fail(where, `durée du module : 55 à 180 minutes (actuellement ${minutes})`);
  if (format >= 4) {
    checkVocabulary(where, module, context.keys, enforced, used);
    checkModuleCompleteness(where, module, context, enforced);
  }
  for (const item of module.media ?? []) if (!used.has(item.key)) fail(`${where} › média ${item.key}`, 'jamais utilisé');
  context.minutes += minutes;
  context.moduleIds.add(module.id);
  context.activities += activities.length;
}

/** Sons des questions dictation et speak : un son rattaché à la question, sans autre transcription consultable. */
function checkQuestionSupports(at, activity) {
  const placements = activity.placements ?? [];
  for (const question of activity.questions ?? []) {
    if (!['dictation', 'speak'].includes(question.type)) continue;
    const sounds = placements.filter((placement) => placement.questionId === question.id && placement.usage === 'audio');
    if (sounds.length !== 1) {
      fail(`${at} › question ${question.id}`, `un son rattaché à la question ${question.type} attendu (${sounds.length} trouvé)`);
      continue;
    }
    const visibility = sounds[0].transcriptVisibility ?? 'hidden';
    if (question.type === 'dictation' && !['after_answer', 'hidden'].includes(visibility)) {
      fail(`${at} › question ${question.id}`, 'la transcription d’une dictée reste masquée jusqu’à la réponse (after_answer ou hidden)');
    }
    if (question.type === 'speak' && visibility !== 'on_demand') warn(`${at} › question ${question.id}`, 'le modèle à répéter s’affiche à la demande (on_demand)');
  }
  if ((activity.questions ?? []).some((question) => question.type === 'dictation')) {
    const speak = new Set((activity.questions ?? []).filter((question) => question.type === 'speak').map((question) => question.id));
    const visible = placements.filter((placement) => placement.usage === 'audio' && placement.transcriptVisibility === 'on_demand'
      && !speak.has(placement.questionId));
    if (visible.length) fail(at, `une activité avec dictée n’affiche aucune autre transcription à la demande (${visible.map((item) => item.media).join(', ')})`);
  }
}

/** Contenu attendu de chaque module V4 (§3.2 du plan) : exercices typés, répétition, dictées, illustration, grammaire. */
function checkModuleCompleteness(where, module, context, enforced) {
  const exercises = (module.activities ?? []).filter((activity) => activity.kind === 'exercise');
  const typedOf = (activity) => activity.questions.filter((question) => ['fill', 'order', 'match', 'dictation'].includes(question.type)).length;
  if (!exercises.some((activity) => typedOf(activity) >= 4)) {
    need(where, 'un exercice d’au moins 4 questions typées (fill, order, match ou dictation) attendu', enforced);
  }
  if (!exercises.some((activity) => activity.questions.length >= 4 && activity.questions.length <= 6
      && activity.questions.every((question) => question.type === 'speak'))) {
    need(where, 'un exercice « Répéter à voix haute » de 4 à 6 questions speak attendu', enforced);
  }
  const dictations = exercises.flatMap((activity) => activity.questions).filter((question) => question.type === 'dictation').length;
  const wantsDictation = context.levelId === 'a2' || (context.levelId === 'a1' && context.dictationFrom !== undefined
    && context.moduleIndex >= context.dictationFrom);
  if (wantsDictation && (dictations < 2 || dictations > 4)) need(where, `2 à 4 dictées attendues (actuellement ${dictations})`, enforced);
  const illustrated = (module.activities ?? []).some((activity) => (activity.placements ?? []).some((placement) =>
    placement.usage === 'illustration' && !placement.decorative));
  if (!illustrated) need(where, 'au moins une illustration non décorative attendue', enforced);
  if (module.grammarFocus?.length && !exercises.some((activity) => /^S[’']entraîner/.test(activity.title ?? '') && activity.questions.length >= 6)) {
    need(where, `module de grammaire (${module.grammarFocus.join(', ')}) : un exercice « S’entraîner : … » d’au moins 6 questions attendu`, enforced);
  }
  if (module.grammarFocus !== undefined && !stringList(module.grammarFocus, 0, 6, 40)) fail(where, 'grammarFocus : liste de repères courts');
}

function checkLevel(directory) {
  const levelFile = join(directory, 'level.json');
  const level = JSON.parse(readFileSync(levelFile, 'utf8'));
  const where = `${basename(directory)}/level.json`;
  const format = levelFormat(level);
  mediaRoot = join(directory, '..', 'media');
  const entries = level.modules ?? [];
  const context = { moduleIds: new Set(), activityIds: new Set(), keys: new Map(), coverage: {}, minutes: 0, activities: 0, questions: 0,
    format, levelId: level.levelId, dictationFrom: entries.findIndex((entry) => entry.id === 'a1-zahlen') };
  if (context.dictationFrom < 0) context.dictationFrom = undefined;
  if (!courseLevelIds.includes(level.levelId)) fail(where, `levelId attendu parmi ${courseLevelIds.join(', ')}`);
  const modules = [];
  for (const [index, entry] of entries.entries()) {
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
    context.moduleIndex = index;
    checkModule(file, module, context);
    modules.push(module);
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
  if (['a2', 'b1'].includes(level.levelId) && !refs.has('prerequis')) {
    fail(`${where} › diagnostic`, 'le diagnostic vérifie les acquis du niveau précédent');
  }
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
  if (format >= 4 && !levelOnly) checkLevelV4(where, level, modules, context);
  const audio = [...context.keys.values()].filter((item) => item.kind === 'audio').length;
  const images = context.keys.size - audio;
  const typed = modules.flatMap((module) => module.activities ?? []).flatMap((activity) => activity.questions ?? [])
    .filter((question) => questionType(question) !== 'choice').length;
  const v4 = format >= 4 ? ` dont ${typed} typées · ${modules.flatMap((module) => module.activities ?? [])
    .filter((activity) => activity.kind === 'mission').length} missions · ${modules.reduce((total, module) => total + (module.vocabulary ?? []).length, 0)} mots` : '';
  console.log(`${level.levelId.toUpperCase()} · ${context.moduleIds.size} modules · ${context.activities} activités · ${context.minutes} min · `
    + `${context.questions} questions d’exercice${v4} · ${audio} sons · ${images} images · compétences ${COMPETENCES.map((c) => `${c} ${context.coverage[c] ?? 0}`).join(', ')}`);
}

/**
 * Règles de niveau du format 4 : budget de durée (EVO-041), place du bilan, débit des sons A1 (EVO-040) d'après le
 * manifeste audio, segments du lexique et taille du document importé (2 Mo).
 */
function checkLevelV4(where, level, modules, context) {
  const enforced = Boolean(level.layer);
  const budget = level.activityMinutes;
  if (!budget || !Number.isInteger(budget.min) || !Number.isInteger(budget.max) || budget.min > budget.max) {
    fail(where, 'activityMinutes { min, max } attendu (build-v4)');
  } else if (context.minutes < budget.min || context.minutes > budget.max) {
    need(where, `durée des activités ${context.minutes} min hors de la fourchette ${budget.min}–${budget.max} min (_level.mjs)`, enforced);
  }
  const ids = modules.map((module) => module.id);
  const midterm = Math.ceil(ids.length / 2);
  if (ids[midterm] === `${ids[midterm - 1]}-atelier`) {
    warn(where, `le bilan intermédiaire tombe après le module ${midterm} (${ids[midterm - 1]}) et le sépare de son atelier`);
  }
  // Un titre ou une description qui cite des numéros de modules doit suivre le point de coupure (⌈n/2⌉).
  const bilan = (level.assessments ?? []).find((assessment) => assessment.kind === 'midterm');
  for (const [field, value] of [['midtermTitle', bilan?.title], ['midtermDescription', bilan?.description]]) {
    const range = /modules?\s+(\d+)\s*(?:à|-|–)\s*(\d+)/i.exec(value ?? '');
    if (range && Number(range[2]) !== midterm) {
      warn(`${where} › midterm`, `« ${range[0]} » alors que le bilan porte sur les modules 1 à ${midterm} : corriger ${field} dans _level.mjs`);
    }
  }
  const audioDirectory = join(mediaRoot, 'audio');
  const manifest = audioManifest(audioDirectory);
  const sounds = [...context.keys.values()].filter((item) => item.kind === 'audio');
  if (!Object.keys(manifest).length) {
    warn(where, `manifeste audio absent (${join(audioDirectory, 'manifest-v3.json')}) : débit et segments non contrôlés`);
  } else {
    let missing = 0;
    for (const media of sounds) {
      const entry = manifest[media.key];
      if (!entry || !existsSync(join(audioDirectory, `${media.key}.mp3`))) {
        missing++;
        continue;
      }
      const at = `${where} › son ${media.key}`;
      if (level.levelId === 'a1' && media.script && !(entry.lengthScale >= 1.3)) fail(at, `débit A1 trop rapide (lengthScale ${entry.lengthScale}, 1,30 au moins)`);
      if (level.levelId === 'a1' && media.native && !(entry.nativeTempo <= 0.88)) fail(at, `enregistrement A1 trop rapide (tempo ${entry.nativeTempo}, 0,88 au plus)`);
      if (media.segments) {
        const segments = entry.segments ?? [];
        if (segments.length !== spokenLines(media).length
            || segments.some((segment) => !(segment.start >= 0) || !(segment.end > segment.start) || segment.end > entry.seconds + 0.05)) {
          fail(at, `segments du lexique incohérents (${segments.length} pour ${spokenLines(media).length} lignes) : régénérer le son`);
        }
      }
    }
    if (missing) warn(where, `${missing} son(s) pas encore générés (synthesize-v3.py)`);
  }
  // Taille du document envoyé au catalogue (PUT /catalogue/versions/{id}), médias résolus par des identifiants fictifs.
  const assets = new Map([...context.keys.keys()].map((key) => [key, { assetId: `a-${key}`.slice(0, 60), version: 1 }]));
  try {
    const size = Buffer.byteLength(JSON.stringify(buildDocument({ ...level, modules }, assets, { manifest })));
    if (size > MAX_BODY) fail(where, `document d’import de ${(size / 1024).toFixed(0)} Ko : 2 Mo au plus`);
    else if (size > MAX_BODY * 0.85) warn(where, `document d’import de ${(size / 1024).toFixed(0)} Ko, proche de la limite de 2 Mo`);
    console.log(`${level.levelId.toUpperCase()} · document d’import ${(size / 1024).toFixed(0)} Ko`);
  } catch (error) {
    fail(where, `document d’import impossible à construire : ${error.message}`);
  }
}

const TIER_CODES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Test de niveau : paliers successifs à partir de A1, banque de 18 questions par palier (12 lecture, 6 écoute) pour
 * 12 tirées (8 et 4), trois choix et une seule bonne réponse, un son par question d'écoute (transcription masquée).
 */
function checkPlacement(file) {
  const placement = JSON.parse(readFileSync(file, 'utf8'));
  const where = 'placement/placement.json';
  const keys = new Map();
  if (!/^[a-z]{2}$/.test(placement.languageId ?? '')) fail(where, 'languageId : code de langue à deux lettres');
  sized(where, placement.title, 3, 120, 'le titre');
  sized(where, placement.description, 20, 2000, 'la présentation');
  if (!Array.isArray(placement.sources) || placement.sources.length === 0) fail(where, 'indiquer au moins une source');
  checkMedia(where, placement.media ?? [], keys);
  // Modules des parcours de chaque niveau : moduleRef (facultatif) rattache une question à un module pour les statistiques.
  const modulesOf = (code) => {
    const levelFile = join(root, 'content/de', code.toLowerCase(), 'level.json');
    return existsSync(levelFile) ? new Set((JSON.parse(readFileSync(levelFile, 'utf8')).modules ?? []).map((entry) => entry.id)) : null;
  };
  const ids = new Set();
  const used = new Set();
  const tiers = placement.tiers ?? [];
  if (tiers.length === 0) fail(where, 'au moins un palier attendu');
  tiers.forEach((tier, index) => {
    const at = `${where} › palier ${tier.code}`;
    if (TIER_CODES.indexOf(tier.code) !== index) fail(at, 'les paliers se suivent à partir de A1 (A1, A2, B1…)');
    sized(at, tier.title, 3, 120, 'le titre');
    if (!(tier.passPercent >= 50 && tier.passPercent <= 90)) fail(at, 'seuil de réussite de 50 à 90 %');
    if (!(tier.minCompetencePercent >= 0 && tier.minCompetencePercent <= tier.passPercent)) {
      fail(at, 'seuil par compétence de 0 % au seuil de réussite');
    }
    const questions = tier.questions ?? [];
    if (!Number.isInteger(tier.drawCount) || tier.drawCount < 1 || tier.drawCount > questions.length) {
      fail(at, `drawCount de 1 à ${questions.length} (taille de la banque)`);
    }
    const count = { lecture: 0, ecoute: 0 };
    let longest = 0;
    const keysUsed = {};
    const modules = modulesOf(tier.code ?? '');
    for (const question of questions) {
      const questionAt = `${at} › question ${question?.id}`;
      if (!ID.test(question?.id ?? '') || ids.has(question.id)) fail(questionAt, 'identifiant invalide ou en double dans le test');
      ids.add(question.id);
      if (!['lecture', 'ecoute'].includes(question.competence)) fail(questionAt, 'compétence lecture ou ecoute attendue');
      else count[question.competence]++;
      sized(questionAt, question.prompt, 10, 1500, 'l’énoncé');
      if (question.moduleRef !== null && question.moduleRef !== undefined
          && !(modules ? modules.has(question.moduleRef) : ID.test(question.moduleRef))) {
        fail(questionAt, `moduleRef « ${question.moduleRef} » : un module du parcours ${tier.code} ou null`);
      }
      const options = question.options ?? [];
      if (options.length !== 3) fail(questionAt, 'trois choix attendus (le choix « Je ne sais pas » est ajouté au test)');
      const optionIds = new Set();
      for (const option of options) {
        if (!ID.test(option?.id ?? '') || option.id === 'dontknow' || optionIds.has(option.id)) {
          fail(questionAt, `choix « ${option?.id} » invalide, réservé ou en double`);
        }
        optionIds.add(option.id);
        sized(questionAt, option.label, 1, 300, `le libellé du choix ${option.id}`);
        if (typeof option.correct !== 'boolean') fail(questionAt, `le choix ${option.id} doit indiquer correct: true ou false`);
      }
      const right = options.filter((option) => option.correct === true);
      if (right.length !== 1) fail(questionAt, 'une seule bonne réponse attendue');
      const labels = options.map((option) => text(option.label).toLowerCase());
      if (new Set(labels).size !== labels.length) fail(questionAt, 'deux choix ont le même libellé');
      if (right.length === 1) {
        keysUsed[right[0].id] = (keysUsed[right[0].id] ?? 0) + 1;
        const lengths = options.map((option) => text(option.label).length);
        const max = Math.max(...lengths);
        if (text(right[0].label).length === max && lengths.filter((length) => length === max).length === 1) longest++;
      }
      checkPlacements(questionAt, question.placements, [], keys, used);
      const sounds = (question.placements ?? []).filter((item) => item.usage === 'audio');
      if (question.competence === 'ecoute' && sounds.length !== 1) fail(questionAt, 'une question d’écoute a exactement un son');
      if (question.competence === 'lecture' && sounds.length > 0) fail(questionAt, 'une question de lecture n’a pas de son');
      if (sounds.some((item) => (item.transcriptVisibility ?? 'hidden') !== 'hidden')) {
        fail(questionAt, 'la transcription d’un son du test reste masquée (hidden)');
      }
      for (const item of sounds) {
        if (!existsSync(join(root, 'content/de/media/audio', `${item.media}.mp3`))) warn(questionAt, `son ${item.media}.mp3 pas encore généré`);
      }
    }
    if (count.lecture < 8 || count.ecoute < 4) fail(at, `au moins 8 questions de lecture et 4 d’écoute (actuellement ${count.lecture} et ${count.ecoute})`);
    if (count.lecture !== 12 || count.ecoute !== 6) warn(at, `banque attendue : 12 lecture et 6 écoute (actuellement ${count.lecture} et ${count.ecoute})`);
    // Pas d'indice de forme : la bonne réponse n'est ni toujours au même rang, ni trop souvent le choix le plus long.
    if (Object.values(keysUsed).some((value) => value > questions.length / 2)) warn(at, 'bonne réponse trop souvent au même rang');
    if (longest > questions.length / 3) warn(at, `bonne réponse strictement la plus longue dans ${longest} questions sur ${questions.length}`);
    console.log(`Test de niveau ${tier.code} · ${questions.length} questions (${count.lecture} lecture, ${count.ecoute} écoute) · `
      + `${tier.drawCount} tirées · seuil ${tier.passPercent} %`);
  });
  for (const item of placement.media ?? []) {
    if (!used.has(item.key)) fail(`${where} › média ${item.key}`, 'jamais utilisé');
    if (!/^placement-/.test(item.key ?? '')) fail(`${where} › média ${item.key}`, 'la clé d’un son du test commence par « placement- »');
  }
}

// --level-only : contrôle level.json (diagnostic, évaluations, médias) sans relire les fichiers de modules.
const levelOnly = process.argv.includes('--level-only');
const targets = process.argv.slice(2).filter((argument) => !['--level-only', '--strict'].includes(argument));
if (targets.length === 0) {
  for (const level of availableLevels()) {
    const directory = join(root, 'content/de', level);
    checkLevel(directory);
  }
  const placement = join(root, 'content/de/placement/placement.json');
  if (existsSync(placement) && !levelOnly) checkPlacement(placement);
} else {
  for (const target of targets) {
    const path = resolve(target);
    if (basename(path) === 'placement.json') {
      checkPlacement(path);
    } else if (statSync(path).isDirectory()) {
      checkLevel(path);
    } else {
      const context = { moduleIds: new Set(), activityIds: new Set(), keys: new Map(), coverage: {}, minutes: 0, activities: 0, questions: 0 };
      const module = JSON.parse(readFileSync(path, 'utf8'));
      mediaRoot = join(dirname(path), '..', 'media');
      // Un module seul peut citer des prérequis du niveau : ils sont acceptés s'ils figurent dans level.json.
      const levelFile = join(dirname(path), 'level.json');
      if (existsSync(levelFile)) {
        // Les modules qui précèdent dans level.json sont des prérequis possibles, même s'ils ne sont pas encore écrits.
        const level = JSON.parse(readFileSync(levelFile, 'utf8'));
        Object.assign(context, { format: levelFormat(level), levelId: level.levelId });
        for (const [index, entry] of (level.modules ?? []).entries()) {
          if (entry.id === 'a1-zahlen') context.dictationFrom = index;
          if (entry.id === module.id) {
            context.moduleIndex = index;
            break;
          }
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
