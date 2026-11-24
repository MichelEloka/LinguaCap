// Catalogue et médiathèque (outil des éditeurs) : versions A1 construites à partir des vrais contenus (content/de/a1),
// brouillon avec quelques points à compléter, médiathèque réaliste (fichiers, poids, crédits) et dépôt simulé.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { day } from './00-core.mjs';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const read = (path) => JSON.parse(readFileSync(join(repo, 'content', 'de', path), 'utf8'));
const level = read('a1/level.json');
const files = level.modules.map((item) => read(`a1/${item.file}`));
const media = new Map([...files.flatMap((file) => file.media ?? []), ...(level.media ?? [])].map((item) => [item.key, item]));
/** Première leçon du module « Essen » (illustrée), ouverte dans l'aperçu élève : son titre suit le contenu. */
const essenLesson = files.find((file) => file.id === 'a1-essen').activities.find((activity) => activity.kind === 'lesson').title;

function fileOf(key) {
  for (const [folder, ext, type] of [['images', 'png', 'image/png'], ['images', 'jpg', 'image/jpeg'], ['audio', 'mp3', 'audio/mpeg']]) {
    const path = join(repo, 'content', 'de', 'media', folder, `${key}.${ext}`);
    if (existsSync(path)) return { url: `/__media/${folder}/${key}.${ext}`, mimeType: type, size: statSync(path).size };
  }
  return null;
}
const transcriptOf = (item) => item?.transcript ?? (item?.script ? item.script.filter((line) => line.text).map((line) => line.name ? `${line.name} : ${line.text}` : line.text).join('\n') : null);
const creditOf = (item) => item.photo || item.native
  ? { source: 'Deutsch im Blick (COERLL, Université du Texas à Austin)', license: 'CC BY 4.0' }
  : item.kind === 'audio' ? { source: 'Synthèse vocale Piper (voix Thorsten)', license: 'CC0 1.0' } : { source: 'LinguaCap · pictogrammes Lucide', license: 'ISC' };

const placementOf = (placement) => ({
  assetId: placement.media, assetVersion: 1, usage: placement.usage,
  alt: placement.usage === 'illustration' ? placement.alt ?? media.get(placement.media)?.alt ?? null : null,
  caption: placement.caption ?? null, transcriptVisibility: placement.transcriptVisibility ?? (placement.usage === 'audio' ? 'on_demand' : 'hidden'),
  decorative: Boolean(placement.decorative), questionId: placement.questionId ?? null, optionId: placement.optionId ?? null,
});
/** Champs propres au type d'une question (document de version V4) ; null pour un choix. */
function specOf(question) {
  switch (question.type ?? 'choice') {
    case 'fill': return { text: question.text, blanks: question.blanks };
    case 'order': return { answers: question.answers };
    case 'match': return { pairs: question.pairs };
    case 'dictation': return { accept: question.accept, showWordCount: Boolean(question.showWordCount) };
    case 'speak': return { text: question.text, accept: question.accept ?? [question.text], threshold: question.threshold ?? 75 };
    default: return null;
  }
}
const questionOf = (question) => ({ id: question.id, type: question.type ?? 'choice', prompt: question.prompt, moduleRef: question.moduleRef ?? null,
  explanation: question.explanation ?? null,
  options: (question.options ?? []).map((option) => ({ id: option.id, label: option.label, correct: Boolean(option.correct),
    ...(option.feedback ? { feedback: option.feedback } : {}) })),
  spec: specOf(question) });
/** Lexique du module : le son est un segment du média « <module>-lexique », résolu à l'import (ici, segments réguliers). */
const vocabularyOf = (file) => (file.vocabulary ?? []).map(({ audio, ...entry }, index) => ({ ...entry,
  audio: audio ? { assetId: audio.media, assetVersion: 1, start: Math.round(index * 2.5 * 100) / 100, end: Math.round((index * 2.5 + 1.6) * 100) / 100 } : null }));
const modules = files.map((file) => ({
  id: file.id, title: file.title, objective: file.objective, prerequisites: file.prerequisites ?? [], vocabulary: vocabularyOf(file),
  activities: file.activities.map((activity) => ({
    id: activity.id, kind: activity.kind, title: activity.title, estimatedMinutes: activity.estimatedMinutes, competences: activity.competences ?? [],
    mission: activity.kind === 'mission' ? activity.mission ?? null : null,
    lesson: activity.lesson ? { title: activity.lesson.title, description: activity.lesson.description, transcript: activity.lesson.transcript ?? null } : null,
    questions: (activity.questions ?? []).map(questionOf), placements: (activity.placements ?? []).map(placementOf),
  })),
}));
const content = {
  settings: level.settings,
  diagnostic: { title: level.diagnostic.title, description: level.diagnostic.description, questions: level.diagnostic.questions.map(questionOf) },
  modules,
  assessments: level.assessments.map((assessment) => ({ kind: assessment.kind, title: assessment.title, description: assessment.description,
    parts: assessment.parts.map((part) => ({ id: part.id, competence: part.competence, mode: part.mode, title: part.title, instructions: part.instructions,
      questions: (part.questions ?? []).map(questionOf), criteria: part.criteria ?? [], placements: (part.placements ?? []).map(placementOf) })) })),
};

const header = (id, number, status) => ({ id, levelId: 'a1', levelCode: 'A1', levelTitle: 'Allemand A1', number, status,
  publishedAt: status === 'draft' ? null : day(-21), updatedAt: status === 'draft' ? day(0, 10) : day(-21) });

// Brouillon v3 : un nouveau module en cours d'écriture, une photo sans texte alternatif, un critère sans libellé.
const draft = structuredClone(content);
const essen = draft.modules.findIndex((module) => module.id === 'a1-essen');
const photo = draft.modules[essen].activities[0].placements.findIndex((placement) => placement.assetId === 'a1-essen-spaghettieis-foto');
if (photo >= 0) draft.modules[essen].activities[0].placements[photo].alt = '';
draft.modules.push({
  id: 'a1-unterwegs', title: 'Unterwegs : premiers voyages', objective: '', prerequisites: ['a1-stadt'],
  activities: [
    { id: 'a1-unterwegs-bahnhof', kind: 'lesson', title: 'Am Bahnhof', estimatedMinutes: 15, competences: ['lecture', 'ecoute'],
      lesson: { title: 'Am Bahnhof', description: '', transcript: null }, questions: [], placements: [] },
    { id: 'a1-unterwegs-fahrplan', kind: 'exercise', title: 'Lire un horaire de train', estimatedMinutes: 10, competences: ['lecture'],
      lesson: { title: 'Der Fahrplan', description: 'Lisez l’horaire, puis répondez aux questions.\n\nABFAHRT\nICE 1537 — Berlin Hbf — 9:12 — Gleis 4\nRE 4 — Köln — 9:20 — Gleis 2', transcript: null },
      questions: [{ id: 'q1', type: 'choice', prompt: 'Où part le train pour Berlin ?', moduleRef: null, explanation: null, spec: null,
        options: [{ id: 'a', label: 'Voie 4', correct: false }, { id: 'b', label: 'Voie 2', correct: false }, { id: 'c', label: 'Voie 9', correct: false }] }],
      placements: [] },
  ],
});
const unterwegs = draft.modules.length - 1;
const finalIndex = draft.assessments.findIndex((assessment) => assessment.kind === 'final');
const writing = draft.assessments[finalIndex].parts.findIndex((part) => part.mode === 'written');
draft.assessments[finalIndex].parts[writing].criteria[2] = { ...draft.assessments[finalIndex].parts[writing].criteria[2], label: '' };
const writingLabel = `« ${draft.assessments[finalIndex].parts[writing].title} » du examen blanc`;
const draftChecks = { publishable: false, issues: [
  { path: `modules[${unterwegs}].objective`, message: 'Décrivez ce que l’élève saura faire après « Unterwegs : premiers voyages ».' },
  { path: `modules[${unterwegs}].activities[0].lesson`, message: 'Rédigez le titre et le texte de la leçon « Am Bahnhof ».' },
  { path: `modules[${unterwegs}].activities[1].questions[0].options`, message: 'Indiquez une seule bonne réponse pour « Où part le train pour Berlin ? ».' },
  { path: `modules[${essen}].activities[0].placements[${photo}].alt`, message: 'Rédigez le texte alternatif de l’image a1-essen-spaghettieis-foto ou marquez-la comme décorative.' },
  { path: `assessments[${finalIndex}].parts[${writing}].criteria`, message: `Chaque critère de la partie ${writingLabel} doit avoir un libellé.` },
] };

const versions = {
  'v-a1-3': { ...header('v-a1-3', 3, 'draft'), ...draft },
  'v-a1-2': { ...header('v-a1-2', 2, 'published'), ...content },
  'v-a1-1': { ...header('v-a1-1', 1, 'retired'), ...content },
};

const catalogue = [
  { id: 'a1', code: 'A1', title: 'Allemand A1', description: 'Premiers pas : se présenter, compter, parler de son quotidien et se repérer en ville.', position: 1,
    status: 'published', prerequisiteLevelId: null, prerequisiteLevelCode: null, versions: [
      { id: 'v-a1-3', number: 3, status: 'draft', publishedAt: null, retiredAt: null, updatedAt: day(0, 10) },
      { id: 'v-a1-2', number: 2, status: 'published', publishedAt: day(-21), retiredAt: null, updatedAt: day(-21) },
      { id: 'v-a1-1', number: 1, status: 'retired', publishedAt: day(-80), retiredAt: day(-21), updatedAt: day(-80) }] },
  { id: 'a2', code: 'A2', title: 'Allemand A2', description: 'Échanges du quotidien : voyages, santé, logement, travail et culture.', position: 2,
    status: 'published', prerequisiteLevelId: 'a1', prerequisiteLevelCode: 'A1', versions: [
      { id: 'v-a2-2', number: 2, status: 'published', publishedAt: day(-12), retiredAt: null, updatedAt: day(-12) },
      { id: 'v-a2-1', number: 1, status: 'retired', publishedAt: day(-70), retiredAt: day(-12), updatedAt: day(-70) }] },
  { id: 'b1', code: 'B1', title: 'Allemand B1', description: 'Raconter, expliquer, défendre un avis et agir dans la vie courante et au travail.', position: 3,
    status: 'published', prerequisiteLevelId: 'a2', prerequisiteLevelCode: 'A2', versions: [
      { id: 'v-b1-1', number: 1, status: 'published', publishedAt: day(0, 9), retiredAt: null, updatedAt: day(0, 9) }] },
  { id: 'b2', code: 'B2', title: 'Allemand B2', description: 'Argumenter, nuancer et comprendre des textes complexes.', position: 4, status: 'draft',
    prerequisiteLevelId: 'b1', prerequisiteLevelCode: 'B1', versions: [] },
];

// Médiathèque : le module « Essen » complet et quelques médias d'autres modules.
const libraryKeys = [...files.find((file) => file.id === 'a1-essen').media.map((item) => item.key),
  ...['a1-familie-foto-hochzeit-bild', 'a1-familie-dialog-audio', 'a1-stadt-wohnung-bild', 'a1-alltag-bus-foto', 'a1-freizeit-aktivitaeten-native']];
export const library = libraryKeys.map((key, index) => {
  const item = media.get(key);
  const file = fileOf(key);
  if (!item || !file) return null;
  const credit = creditOf(item);
  const missing = key === 'a1-essen-trauben-bild';
  const versionsOf = key === 'a1-essen-dialog-bild'
    ? [{ version: 2, mimeType: file.mimeType, sizeBytes: Math.round(file.size * .92), status: 'draft', createdAt: day(-1, 9) },
      { version: 1, mimeType: file.mimeType, sizeBytes: file.size, status: 'published', createdAt: day(-40) }]
    : key === 'a1-essen-markt-foto'
      ? [{ version: 2, mimeType: file.mimeType, sizeBytes: file.size, status: 'published', createdAt: day(-6) },
        { version: 1, mimeType: file.mimeType, sizeBytes: Math.round(file.size * 1.4), status: 'archived', createdAt: day(-60) }]
      : [{ version: 1, mimeType: file.mimeType, sizeBytes: file.size, status: 'published', createdAt: day(-index - 3) }];
  return {
    id: key, kind: item.kind, title: item.title, mimeType: file.mimeType, alt: item.alt ?? null, transcript: item.kind === 'audio' ? transcriptOf(item) : null,
    credit: missing ? null : `${credit.source} · ${credit.license}`, source: missing ? null : credit.source, license: missing ? null : credit.license,
    status: 'published', updatedAt: versionsOf[0].createdAt, versions: versionsOf,
  };
}).filter(Boolean);
const uploads = [
  { id: 'up-3', assetId: 'a1-essen-dialog-bild', replaces: true, kind: 'image', title: 'Au café', mimeType: 'image/png', size: 214000, status: 'available',
    reason: null, version: 2, createdAt: day(-1, 9), expiresAt: day(-1, 10), uploadUrl: null, maxBytes: 5242880 },
  { id: 'up-2', assetId: 'brezel', replaces: false, kind: 'image', title: 'Bretzel du marché', mimeType: 'image/png', size: 182000, status: 'rejected',
    reason: 'Le contenu du fichier ne correspond pas à une image PNG.', version: null, createdAt: day(-2, 15), expiresAt: day(-2, 16), uploadUrl: null, maxBytes: 5242880 },
  { id: 'up-1', assetId: 'a1-essen-hoeren-audio', replaces: false, kind: 'audio', title: 'À la boulangerie, à la maison, au restaurant', mimeType: 'audio/mpeg',
    size: 1480000, status: 'available', reason: null, version: 1, createdAt: day(-4, 11), expiresAt: day(-4, 12), uploadUrl: null, maxBytes: 15728640 },
];

/** Remplace la médiathèque et le catalogue simulés par le noyau, puis recharge la page. */
async function richData(page) {
  await page.route('**/api/v1/media', (route) => route.request().method() === 'GET' ? route.fulfill({ json: library }) : route.fallback());
  await page.route('**/api/v1/media/uploads', (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: uploads });
    pendingTitle = route.request().postDataJSON()?.title ?? pendingTitle;
    return route.fallback();
  });
  await page.route('**/api/v1/catalogue/levels', (route) => route.request().method() === 'GET' ? route.fulfill({ json: catalogue }) : route.fallback());
  await page.reload({ waitUntil: 'networkidle' });
}
const photoFile = { name: 'broetchen-markt.jpg', mimeType: 'image/jpeg', buffer: readFileSync(join(repo, 'content', 'de', 'media', 'images', 'a1-essen-broetchen-foto.jpg')) };

export const screens = [
  { name: 'equipe-catalogue-complet', role: 'staff', path: '/espace/catalogue', setup: richData },
  { name: 'equipe-niveau', role: 'staff', path: '/espace/catalogue', setup: async (page) => {
    await richData(page);
    await page.getByRole('button', { name: 'Modifier le niveau A1' }).click();
  } },
  { name: 'equipe-version', role: 'staff', path: '/espace/catalogue/versions/v-a1-3', setup: richData },
  { name: 'equipe-version-module', role: 'staff', path: '/espace/catalogue/versions/v-a1-3', setup: async (page) => {
    await richData(page);
    await page.getByRole('button', { name: /Unterwegs/ }).first().click();
  } },
  { name: 'equipe-version-point', role: 'staff', path: '/espace/catalogue/versions/v-a1-3', setup: async (page) => {
    await richData(page);
    await page.getByRole('button', { name: /texte alternatif de l’image/ }).click();
    await page.waitForTimeout(700);
  } },
  { name: 'equipe-version-reglages', role: 'staff', path: '/espace/catalogue/versions/v-a1-3', setup: async (page) => {
    await richData(page);
    await page.getByRole('tab', { name: 'Réglages' }).click();
  } },
  { name: 'equipe-version-exercice', role: 'staff', path: '/espace/catalogue/versions/v-a1-3', setup: async (page) => {
    await richData(page);
    await page.getByRole('button', { name: /Indiquez une seule bonne réponse/ }).click();
    await page.waitForTimeout(700);
  } },
  { name: 'equipe-version-diagnostic', role: 'staff', path: '/espace/catalogue/versions/v-a1-3', setup: async (page) => {
    await richData(page);
    await page.getByRole('tab', { name: /Diagnostic/ }).click();
  } },
  { name: 'equipe-version-evaluations', role: 'staff', path: '/espace/catalogue/versions/v-a1-3', setup: async (page) => {
    await richData(page);
    await page.getByRole('tab', { name: /Évaluations/ }).click();
    await page.getByRole('radio', { name: /Examen blanc/ }).click();
  } },
  { name: 'equipe-version-publiee', role: 'staff', path: '/espace/catalogue/versions/v-a1-2', setup: richData },
  { name: 'equipe-apercu', role: 'staff', path: '/espace/catalogue/versions/v-a1-2', setup: async (page) => {
    await richData(page);
    await page.getByLabel('Activité à prévisualiser').selectOption({ label: essenLesson });
    await page.getByRole('button', { name: 'Ouvrir l’aperçu élève' }).click();
    await page.getByRole('dialog').getByRole('img').first().waitFor();
  } },
  { name: 'equipe-mediatheque-grille', role: 'staff', path: '/espace/mediatheque', setup: richData },
  { name: 'equipe-depots', role: 'staff', path: '/espace/mediatheque', setup: async (page) => {
    await richData(page);
    await page.getByRole('tab', { name: /Mes dépôts/ }).click();
  } },
  { name: 'equipe-media-fiche', role: 'staff', path: '/espace/mediatheque', setup: async (page) => {
    await richData(page);
    await page.getByRole('button', { name: 'Ouvrir la fiche de Un étal de fruits et légumes au marché' }).click();
    await page.getByRole('dialog').getByRole('img').first().waitFor();
  } },
  { name: 'equipe-media-son', role: 'staff', path: '/espace/mediatheque', setup: async (page) => {
    await richData(page);
    await page.getByRole('button', { name: 'Ouvrir la fiche de Dialogue : au café' }).click();
  } },
  { name: 'equipe-depot', role: 'staff', path: '/espace/mediatheque', setup: async (page) => {
    await richData(page);
    await page.getByRole('button', { name: 'Déposer un média' }).click();
    await page.getByRole('dialog').getByLabel(/^Fichier/).setInputFiles(photoFile);
  } },
  { name: 'equipe-depot-envoi', role: 'staff', path: '/espace/mediatheque', setup: async (page) => {
    await richData(page);
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' };
    await page.route('**/storage/v1/object/upload/**', (route) => route.fulfill({ status: 200, headers: cors, json: { Key: 'medias/broetchen-markt' } }));
    await page.getByRole('button', { name: 'Déposer un média' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^Fichier/).setInputFiles(photoFile);
    await dialog.getByLabel('Titre').fill('Petits pains au marché');
    await dialog.getByLabel('Texte alternatif').fill('Une corbeille de petits pains ronds et dorés.');
    await dialog.getByLabel('Source').fill('Deutsch im Blick (COERLL)');
    await dialog.getByLabel('Licence').fill('CC BY 4.0');
    await dialog.getByRole('button', { name: 'Déposer' }).click();
    await page.waitForTimeout(300);
  } },
];

// Parcours des ancres de la recette navigateur (infra/pilot/smoke.mjs) : échoue si un rôle, un libellé ou un texte attendu manque.
screens.push({ name: 'equipe-recette-ancres', role: 'staff', path: '/espace/mediatheque', setup: async (page) => {
  const { expect } = await import(pathToFileURL(join(repo, 'linguacap-react', 'node_modules', '@playwright', 'test', 'index.mjs')).href);
  await richData(page);
  await page.route('**/storage/v1/object/upload/**', (route) => route.fulfill({ status: 200, json: { Key: 'medias/brezel' },
    headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST, OPTIONS' } }));
  await expect(page.getByRole('heading', { name: 'Médiathèque' })).toBeVisible();
  await page.getByRole('button', { name: 'Déposer un média' }).click();
  const uploadDialog = page.getByRole('dialog');
  await uploadDialog.getByLabel(/^Fichier/).setInputFiles({ name: 'brezel.png', mimeType: 'image/png',
    buffer: readFileSync(join(repo, 'content', 'de', 'media', 'images', 'a1-essen-apfel-bild.png')) });
  await uploadDialog.getByLabel('Titre').fill('Bretzel du navigateur');
  await uploadDialog.getByLabel('Texte alternatif').fill('Un bretzel photographié de près.');
  await uploadDialog.getByLabel('Source').fill('Recette navigateur');
  await uploadDialog.getByLabel('Licence').fill('CC0 1.0');
  await uploadDialog.getByRole('button', { name: 'Déposer' }).click();
  await expect(page.getByText('« Bretzel du navigateur » est disponible en version 1.')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('link', { name: 'Catalogue', exact: true }).first().click();
  await page.getByRole('link', { name: 'Ouvrir A1 version 2' }).click();
  await expect(page.getByRole('heading', { name: 'A1 · version 2' })).toBeVisible();
  await expect(page.getByText('Cette version est figée')).toBeVisible();
  await page.getByLabel('Activité à prévisualiser').selectOption({ label: essenLesson });
  await page.getByRole('button', { name: 'Ouvrir l’aperçu élève' }).click();
  await expect(page.getByRole('dialog').getByRole('img', { name: /^Six vignettes : une tasse de café/ })).toBeVisible({ timeout: 15_000 });
  console.log('Ancres de la recette : toutes présentes.');
} });

let pendingTitle = 'Nouveau média';

export function api(role, method, rawPath, body) {
  const path = rawPath.split('?')[0];
  const version = /^\/catalogue\/versions\/([^/]+)$/.exec(path);
  if (version && method === 'GET') return versions[version[1]] ?? { ...header(version[1], 2, 'published'), ...content };
  if (version && method === 'PUT') return { version: { ...versions[version[1]], ...body, updatedAt: new Date().toISOString() }, checks: draftChecks };
  const checks = /^\/catalogue\/versions\/([^/]+)\/checks$/.exec(path);
  if (checks) return versions[checks[1]]?.status === 'draft' ? draftChecks : { publishable: true, issues: [] };
  const mediaVersion = /^\/media\/([^/]+)\/versions\/(\d+)$/.exec(path);
  if (mediaVersion) {
    const key = decodeURIComponent(mediaVersion[1]);
    const file = fileOf(key);
    if (!file) return { __status: 404, body: { code: 'NOT_FOUND', message: 'Ce fichier est introuvable.' } };
    const item = media.get(key);
    return { url: file.url, mimeType: file.mimeType, version: Number(mediaVersion[2]), status: 'published', alt: item?.alt ?? null,
      transcript: item?.kind === 'audio' ? transcriptOf(item) : null };
  }
  if (path === '/media/uploads' && method === 'POST') {
    pendingTitle = body?.title ?? pendingTitle;
    return { id: 'up-4', assetId: 'broetchen-markt', replaces: false, kind: 'image', title: body?.title ?? 'Nouveau média', mimeType: body?.mimeType ?? 'image/jpeg',
      size: body?.size ?? 0, status: 'pending', reason: null, version: null, createdAt: new Date().toISOString(), expiresAt: day(1),
      uploadUrl: 'http://127.0.0.1:54399/storage/v1/object/upload/sign/medias/broetchen-markt', maxBytes: 5242880 };
  }
  if (/^\/media\/uploads\/[^/]+\/finalize$/.test(path)) {
    // Contrôle volontairement lent : la capture montre la progression.
    return new Promise((resolve) => setTimeout(() => resolve({ ...uploads[0], id: 'up-4', title: pendingTitle, version: 1, status: 'available' }), 6000));
  }
  return undefined;
}
