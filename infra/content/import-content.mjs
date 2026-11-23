#!/usr/bin/env node
// Import des parcours A1/A2 (DEV-093, DEV-095) par l'API publique, avec un compte autorisé à éditer le catalogue :
// les sons et images sont déposés dans la médiathèque (réutilisés s'ils n'ont pas changé), puis le brouillon du niveau
// reçoit modules, diagnostic, bilan et examen blanc ; il est publié si --publish est demandé et que le contrôle passe.
// Avec --placement, c'est le test de niveau (content/de/placement/placement.json) qui est importé de la même façon :
// sons d'écoute déposés, brouillon de la banque enregistré, contrôlé, puis publié avec ses médias.
//
// Usage :
//   node infra/content/import-content.mjs --dry-run [--placement]
//   node infra/content/import-content.mjs --api https://linguacap.emichfer.org/api/v1 \
//     --supabase https://<projet>.supabase.co --publishable-key <clé publique> --email <adresse> [--level a1] [--publish]
//   node infra/content/import-content.mjs --api … --supabase … --publishable-key … --email … --placement [--publish]
// Le mot de passe est demandé sans écho (ou LINGUACAP_PASSWORD) ; LINGUACAP_TOKEN permet de fournir un jeton de session.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';
import {
  allMedia, audioFile, audioManifest, availableLevels, creditOf, imageFile, levelFormat, loadLevel, loadPlacement,
  placementMedia, questionType, root, transcriptOf,
} from './content-lib.mjs';

/** Taille maximale d'un document envoyé (passerelle, catalogue et importeur : 2 Mo). */
export const MAX_BODY = 2 * 1024 * 1024;
const sha256 = (data) => createHash('sha256').update(data).digest('hex');

/** Titre de l'élément de médiathèque : titre du contenu suivi de sa clé, unique et retrouvable. */
export function assetTitle(media) {
  const suffix = ` [${media.key}]`;
  return media.title.trim().slice(0, 120 - suffix.length).trim() + suffix;
}

function mediaFile(media) {
  const file = media.kind === 'audio' ? audioFile(media) : imageFile(media);
  const mimeType = media.kind === 'audio' ? 'audio/mpeg' : file.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
  return { file, mimeType };
}

/**
 * Clé de correction d'une question typée (format 4), champs propres au type seulement :
 * fill {text, blanks}, order {answers}, match {pairs}, dictation {accept, showWordCount}, speak {text, accept, threshold}.
 */
export function questionSpec(question) {
  switch (questionType(question)) {
    case 'fill':
      return { text: question.text, blanks: (question.blanks ?? []).map((blank) => ({
        id: String(blank.id), accept: blank.accept, size: blank.size ?? null, hint: blank.hint ?? null })) };
    case 'order':
      return { answers: question.answers };
    case 'match':
      return { pairs: (question.pairs ?? []).map((pair) => ({ left: pair.left, right: pair.right })) };
    case 'dictation':
      return { accept: question.accept, showWordCount: question.showWordCount ?? true };
    case 'speak':
      return { text: question.text, accept: question.accept ?? [question.text], threshold: question.threshold ?? null };
    default:
      return null;
  }
}

/**
 * Son d'une entrée de vocabulaire : segment de la ligne dans le son du lexique (manifeste de synthesize-v3.py), avec
 * l'élément de médiathèque déposé. null tant que le son ou ses segments manquent.
 */
function vocabularyAudio(entry, assets, manifest) {
  if (!entry.audio) return null;
  const asset = assets.get(entry.audio.media);
  const segment = manifest?.[entry.audio.media]?.segments?.[entry.audio.line];
  if (!asset || !segment) return null;
  return { assetId: asset.assetId, assetVersion: asset.version, start: segment.start, end: segment.end };
}

/**
 * Document de version attendu par PUT /catalogue/versions/{id}, les médias étant résolus en (assetId, version).
 * Au format 4, les questions portent leur type, leur explication et leur clé (spec), les choix leur retour, les
 * activités « mission » leur mission et les modules leur vocabulaire (segments du son du lexique, d'après manifest).
 */
export function buildDocument(level, assets, { manifest = {} } = {}) {
  const v4 = levelFormat(level) >= 4;
  const media = new Map(allMedia(level).map((item) => [item.key, item]));
  const placement = (item) => {
    const target = media.get(item.media);
    const asset = assets.get(item.media);
    if (!target || !asset) throw new Error(`Média ${item.media} non résolu.`);
    const illustration = item.usage === 'illustration';
    return {
      assetId: asset.assetId, assetVersion: asset.version, usage: item.usage,
      alt: illustration && !item.decorative ? (item.alt ?? target.alt ?? '').trim() : '',
      caption: item.caption?.trim() || null,
      transcriptVisibility: item.transcriptVisibility ?? 'hidden',
      decorative: Boolean(item.decorative), questionId: item.questionId ?? null, optionId: item.optionId ?? null,
    };
  };
  const questions = (list, diagnostic = false) => (list ?? []).map((question) => {
    const options = (question.options ?? []).map((option) => ({ id: option.id, label: option.label, correct: option.correct,
      ...(v4 && option.feedback ? { feedback: option.feedback } : {}) }));
    if (!v4) return { id: question.id, prompt: question.prompt, moduleRef: diagnostic ? question.moduleRef : null, options };
    const type = questionType(question);
    return {
      id: question.id, type, prompt: question.prompt, moduleRef: diagnostic ? question.moduleRef : null,
      explanation: question.explanation?.trim() || null, options: type === 'choice' ? options : [], spec: questionSpec(question),
    };
  });
  // Transcription de l'activité : celle des sons qui y sont placés, à lire selon la visibilité choisie. Les sons des
  // questions dictation et speak n'y figurent pas : la phrase dictée ne doit pas être lisible avant la réponse.
  const transcript = (activity) => {
    if (activity.lesson?.transcript) return activity.lesson.transcript;
    const hidden = new Set((activity.questions ?? []).filter((question) => ['dictation', 'speak'].includes(questionType(question)))
      .map((question) => question.id));
    const keys = [...new Set((activity.placements ?? [])
      .filter((item) => item.usage === 'audio' && !(item.questionId && hidden.has(item.questionId))).map((item) => item.media))];
    return keys.length ? keys.map((key) => transcriptOf(media.get(key))).join('\n\n') : null;
  };
  return {
    settings: level.settings,
    diagnostic: level.diagnostic ? {
      title: level.diagnostic.title, description: level.diagnostic.description ?? '',
      questions: questions(level.diagnostic.questions, true),
    } : null,
    modules: level.modules.map((module) => ({
      id: module.id, title: module.title, objective: module.objective, prerequisites: module.prerequisites ?? [],
      activities: module.activities.map((activity) => ({
        id: activity.id, kind: activity.kind, title: activity.title, estimatedMinutes: activity.estimatedMinutes,
        competences: activity.competences,
        lesson: { title: activity.lesson.title, description: activity.lesson.description, transcript: transcript(activity) },
        questions: activity.kind === 'exercise' ? questions(activity.questions) : [],
        placements: (activity.placements ?? []).map(placement),
        ...(v4 ? { mission: activity.kind === 'mission' ? {
          oral: activity.mission?.oral ? { prompt: activity.mission.oral.prompt, maxSeconds: activity.mission.oral.maxSeconds ?? 120 } : null,
          written: activity.mission?.written ? { prompt: activity.mission.written.prompt,
            maxChars: activity.mission.written.maxChars ?? 1500, minWords: activity.mission.written.minWords ?? 0 } : null,
          checklist: activity.mission?.checklist ?? [],
        } : null } : {}),
      })),
      ...(v4 ? { vocabulary: (module.vocabulary ?? []).map((entry) => ({
        id: entry.id, word: entry.word, article: entry.article ?? null, plural: entry.plural ?? null,
        partOfSpeech: entry.partOfSpeech, translation: entry.translation, example: entry.example ?? null, note: entry.note ?? null,
        audio: vocabularyAudio(entry, assets, manifest),
      })) } : {}),
    })),
    assessments: (level.assessments ?? []).map((assessment) => ({
      kind: assessment.kind, title: assessment.title, description: assessment.description ?? '',
      parts: assessment.parts.map((part) => ({
        id: part.id, competence: part.competence, mode: part.mode, title: part.title, instructions: part.instructions,
        questions: questions(part.questions), criteria: part.criteria ?? [], placements: (part.placements ?? []).map(placement),
      })),
    })),
  };
}

/** Banque attendue par PUT /catalogue/placement-tests/{id}, les sons étant résolus en (assetId, version). */
export function buildPlacementDocument(placement, assets) {
  const media = new Map((placement.media ?? []).map((item) => [item.key, item]));
  const support = (item) => {
    const target = media.get(item.media);
    const asset = assets.get(item.media);
    if (!target || !asset) throw new Error(`Média ${item.media} non résolu.`);
    const illustration = item.usage === 'illustration';
    return {
      assetId: asset.assetId, assetVersion: asset.version, usage: item.usage,
      alt: illustration && !item.decorative ? (item.alt ?? target.alt ?? '').trim() : null,
      caption: item.caption?.trim() || null, transcriptVisibility: item.transcriptVisibility ?? 'hidden',
      decorative: Boolean(item.decorative),
    };
  };
  return {
    title: placement.title, description: placement.description ?? '',
    tiers: placement.tiers.map((tier) => ({
      code: tier.code, title: tier.title, passPercent: tier.passPercent, minCompetencePercent: tier.minCompetencePercent,
      drawCount: tier.drawCount,
      questions: tier.questions.map((question) => ({
        id: question.id, competence: question.competence, moduleRef: question.moduleRef ?? null, prompt: question.prompt,
        options: question.options.map((option) => ({ id: option.id, label: option.label, correct: option.correct })),
        placements: (question.placements ?? []).map(support),
      })),
    })),
  };
}

/** Appels à l'API avec le jeton de l'éditeur ; un statut inattendu interrompt l'import avec le message du service. */
function apiClient(api, token) {
  return async function call(path, { method = 'GET', body, expect = [200, 201] } = {}) {
    const response = await fetch(api + path, {
      method, signal: AbortSignal.timeout(60_000),
      headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!expect.includes(response.status)) {
      throw new Error(`${method} ${path} → HTTP ${response.status} ${payload.code ?? ''} ${payload.message ?? ''}`.trim());
    }
    return payload;
  };
}

/** État local de l'import (identifiants des médias déposés, contenus publiés), un fichier par environnement. */
function importState(statePath) {
  const saved = statePath && existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : {};
  const state = { media: {}, levels: {}, placement: {}, ...saved };
  const save = () => {
    if (!statePath) return;
    mkdirSync(dirname(statePath), { recursive: true });
    writeFileSync(statePath, JSON.stringify(state, null, 2));
  };
  return { state, save };
}

/**
 * Dépose dans la médiathèque les fichiers d'une liste de médias, en réutilisant ceux qui n'ont pas changé (empreinte de
 * l'état local, sinon titre, taille et type) ; renvoie clé → { assetId, version }. Partagé par les niveaux et le test.
 */
export async function uploadMedia({ call, token, publishable, mediaList, state, save, label, log = console.log }) {
  const library = await call('/media');
  const byTitle = new Map(library.map((asset) => [asset.title, asset]));
  const assets = new Map();
  const pending = [];
  let reused = 0;
  for (const media of mediaList) {
    const { file, mimeType } = mediaFile(media);
    if (!existsSync(file)) throw new Error(`Fichier manquant pour ${media.key} : ${file}`);
    const bytes = readFileSync(file);
    const digest = sha256(bytes);
    const credit = creditOf(media);
    const meta = {
      title: assetTitle(media), source: credit.source, license: credit.license,
      alt: media.kind === 'image' ? media.alt.trim() : null,
      transcript: media.kind === 'audio' ? transcriptOf(media) : null,
    };
    const known = state.media[media.key];
    const existing = (known && library.find((asset) => asset.id === known.assetId)) || byTitle.get(meta.title);
    const latest = existing?.versions?.filter((version) => version.status !== 'retired')
      .sort((left, right) => right.version - left.version)[0];
    const unchanged = existing && latest && (known?.assetId === existing.id && known.sha256 === digest
      ? known.version === latest.version : !known && latest.sizeBytes === bytes.length && latest.mimeType === mimeType);
    if (unchanged) {
      assets.set(media.key, { assetId: existing.id, version: latest.version });
      state.media[media.key] = { assetId: existing.id, version: latest.version, sha256: digest };
      reused++;
      if (existing.alt !== meta.alt || existing.transcript !== meta.transcript || existing.source !== meta.source
          || existing.license !== meta.license || existing.title !== meta.title) {
        await call(`/media/${existing.id}`, { method: 'PUT', body: meta });
      }
      continue;
    }
    pending.push({ media, bytes, digest, mimeType, meta, assetId: existing?.id ?? null });
  }

  // Dépôts en parallèle limité : chaque dépôt est finalisé avant d'en réserver d'autres (20 en attente au plus).
  let uploaded = 0;
  const queue = [...pending];
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const reservation = await call('/media/uploads', { method: 'POST', expect: [201], body: {
        assetId: job.assetId, title: job.assetId ? '' : job.meta.title, mimeType: job.mimeType, size: job.bytes.length,
        source: job.meta.source, license: job.meta.license, alt: job.meta.alt, transcript: job.meta.transcript,
      } });
      const sent = await fetch(reservation.uploadUrl, {
        method: 'POST', body: job.bytes, signal: AbortSignal.timeout(120_000),
        headers: { Authorization: `Bearer ${token}`, apikey: publishable, 'Content-Type': job.mimeType, 'x-upsert': 'false' },
      });
      if (!sent.ok) throw new Error(`Envoi de ${job.media.key} refusé par le stockage (HTTP ${sent.status}).`);
      const done = await call(`/media/uploads/${reservation.id}/finalize`, { method: 'POST', body: {} });
      if (done.status !== 'available') throw new Error(`Fichier ${job.media.key} refusé : ${done.reason ?? done.status}`);
      if (job.assetId) await call(`/media/${done.assetId}`, { method: 'PUT', body: job.meta });
      assets.set(job.media.key, { assetId: done.assetId, version: done.version });
      state.media[job.media.key] = { assetId: done.assetId, version: done.version, sha256: job.digest };
      uploaded++;
      if (uploaded % 20 === 0) {
        save();
        log(`  ${uploaded}/${pending.length} fichiers déposés…`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker));
  save();
  log(`${label} · médias : ${uploaded} déposé(s), ${reused} déjà à jour.`);
  return assets;
}

export async function importContent({ api, token, publishable, levels = availableLevels(), publish = false,
  statePath, log = console.log }) {
  const { state, save } = importState(statePath);
  const call = apiClient(api, token);
  const catalogue = await call('/catalogue/levels');
  const a2 = catalogue.find((level) => level.id === 'a2');
  if (a2 && a2.prerequisiteLevelId !== 'a1') log('Attention : le niveau A2 ne requiert pas encore le niveau A1 (Catalogue › niveaux).');
  const results = [];

  for (const levelId of levels) {
    const level = loadLevel(levelId);
    const assets = await uploadMedia({ call, token, publishable, mediaList: allMedia(level), state, save,
      label: levelId.toUpperCase(), log });

    const document = buildDocument(level, assets, { manifest: audioManifest() });
    const silent = unresolvedVocabulary(level, document);
    if (silent) throw new Error(`${levelId.toUpperCase()} : ${silent} mot(s) du lexique sans segment audio (régénérez les sons avec synthesize-v3.py).`);
    const body = JSON.stringify(document);
    if (Buffer.byteLength(body) > MAX_BODY) throw new Error(`Document ${levelId} trop volumineux (${Buffer.byteLength(body)} octets).`);
    const digest = sha256(body);
    const levelState = state.levels[levelId];
    const current = (await call('/catalogue/levels')).find((item) => item.id === levelId);
    if (!current) throw new Error(`Niveau ${levelId} absent du catalogue.`);
    const published = current.versions.find((version) => version.status === 'published');
    if (levelState?.digest === digest && published?.id === levelState.versionId) {
      log(`${levelId.toUpperCase()} · version ${published.number} déjà publiée avec ce contenu.`);
      results.push({ levelId, versionId: published.id, number: published.number, published: true, unchanged: true });
      continue;
    }
    const draft = current.versions.find((version) => version.status === 'draft')
      ?? await call(`/catalogue/levels/${levelId}/versions`, { method: 'POST', body: {}, expect: [201] });
    const saved = await call(`/catalogue/versions/${draft.id}`, { method: 'PUT', body: document });
    if (!saved.checks.publishable) {
      for (const issue of saved.checks.issues.slice(0, 20)) log(`  · ${issue.path} : ${issue.message}`);
      throw new Error(`${levelId.toUpperCase()} : brouillon ${saved.version.number} enregistré mais incomplet.`);
    }
    log(`${levelId.toUpperCase()} · brouillon ${saved.version.number} enregistré et complet (${(body.length / 1024).toFixed(0)} Ko).`);
    let result = { levelId, versionId: draft.id, number: saved.version.number, published: false };
    if (publish) {
      const done = await call(`/catalogue/versions/${draft.id}/publish`, { method: 'POST', body: {} });
      log(`${levelId.toUpperCase()} · version ${done.version.number} publiée (${done.media.length} médias publiés avec elle).`);
      state.levels[levelId] = { versionId: draft.id, digest };
      result = { ...result, published: true };
    }
    save();
    results.push(result);
  }
  return results;
}

/**
 * Test de niveau : sons déposés, brouillon de la langue repris ou créé, banque enregistrée et contrôlée, publiée si
 * demandé (la banque publiée précédente est alors retirée). Une banque déjà publiée avec ce contenu reste telle quelle.
 */
export async function importPlacement({ api, token, publishable, publish = false, statePath, log = console.log }) {
  const placement = loadPlacement();
  if (!placement) throw new Error('Test de niveau introuvable : content/de/placement/placement.json');
  const { state, save } = importState(statePath);
  const call = apiClient(api, token);
  const label = `Test de niveau (${placement.languageId})`;
  const assets = await uploadMedia({ call, token, publishable, mediaList: placementMedia(placement), state, save, label, log });
  const document = buildPlacementDocument(placement, assets);
  const body = JSON.stringify(document);
  if (Buffer.byteLength(body) > MAX_BODY) throw new Error(`Test de niveau trop volumineux (${Buffer.byteLength(body)} octets).`);
  const digest = sha256(body);
  const tests = (await call('/catalogue/placement-tests')).filter((test) => test.languageId === placement.languageId);
  const published = tests.find((test) => test.status === 'published');
  const known = state.placement[placement.languageId];
  if (known?.digest === digest && published?.id === known.testId) {
    log(`${label} · banque ${published.number} déjà publiée avec ce contenu.`);
    return { testId: published.id, number: published.number, published: true, unchanged: true };
  }
  const draft = tests.find((test) => test.status === 'draft')
    ?? await call('/catalogue/placement-tests', { method: 'POST', body: { languageId: placement.languageId }, expect: [201] });
  const saved = await call(`/catalogue/placement-tests/${draft.id}`, { method: 'PUT', body: document });
  if (!saved.checks.publishable) {
    for (const issue of saved.checks.issues.slice(0, 20)) log(`  · ${issue.path} : ${issue.message}`);
    throw new Error(`${label} : brouillon ${saved.test.number} enregistré mais incomplet.`);
  }
  const count = document.tiers.reduce((total, tier) => total + tier.questions.length, 0);
  log(`${label} · brouillon ${saved.test.number} enregistré et complet (${document.tiers.length} paliers, ${count} questions).`);
  if (!publish) return { testId: draft.id, number: saved.test.number, published: false };
  const done = await call(`/catalogue/placement-tests/${draft.id}/publish`, { method: 'POST', body: {} });
  log(`${label} · banque ${done.test.number} publiée (${done.media.length} médias publiés avec elle).`);
  state.placement[placement.languageId] = { testId: draft.id, digest };
  save();
  return { testId: draft.id, number: done.test.number, published: true };
}

async function password() {
  if (process.env.LINGUACAP_PASSWORD) return process.env.LINGUACAP_PASSWORD;
  const input = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  input._writeToOutput = (text) => { if (text.includes('Mot de passe')) process.stdout.write(text); };
  const value = await new Promise((resolve) => input.question('Mot de passe : ', resolve));
  input.close();
  process.stdout.write('\n');
  return value;
}

/** Entrées de vocabulaire dont le son n'a pas pu être résolu (segment absent du manifeste audio). */
function unresolvedVocabulary(level, document) {
  const expected = level.modules.flatMap((module) => (module.vocabulary ?? []).filter((entry) => entry.audio)).length;
  const resolved = (document.modules ?? []).flatMap((module) => module.vocabulary ?? []).filter((entry) => entry.audio).length;
  return expected - resolved;
}

/** Fichiers présents et taille du document envoyé, sans appel à l'API (médias fictifs). */
function dryRun(label, mediaList, build, check = () => 0) {
  const assets = new Map();
  let bytes = 0;
  const missing = [];
  for (const media of mediaList) {
    const { file } = mediaFile(media);
    if (!existsSync(file)) missing.push(`${media.key} : ${file}`);
    else bytes += readFileSync(file).length;
    assets.set(media.key, { assetId: `a-${media.key}`.slice(0, 60), version: 1 });
  }
  const document = build(assets);
  const size = Buffer.byteLength(JSON.stringify(document));
  const silent = check(document);
  console.log(`${label} · ${assets.size} médias (${(bytes / 1048576).toFixed(1)} Mo) · document ${(size / 1024).toFixed(0)} Ko`
    + (size > MAX_BODY ? ' — TROP VOLUMINEUX' : '') + (silent ? ` · ${silent} mot(s) du lexique sans segment audio` : ''));
  for (const line of missing.slice(0, 10)) console.error(`  Fichier manquant · ${line}`);
  if (missing.length > 10) console.error(`  … et ${missing.length - 10} autre(s).`);
  return missing.length === 0 && size <= MAX_BODY && !silent;
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name) => {
    const index = args.indexOf(`--${name}`);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const levels = option('level') ? [option('level')] : availableLevels();
  const placementOnly = args.includes('--placement');
  if (args.includes('--dry-run')) {
    if (placementOnly) {
      const placement = loadPlacement();
      if (!placement) throw new Error('Test de niveau introuvable : content/de/placement/placement.json');
      if (!dryRun('Test de niveau', placementMedia(placement), (assets) => buildPlacementDocument(placement, assets))) process.exitCode = 1;
      return;
    }
    for (const levelId of levels) {
      const level = loadLevel(levelId);
      const ready = dryRun(levelId.toUpperCase(), allMedia(level), (assets) => buildDocument(level, assets, { manifest: audioManifest() }),
        (document) => unresolvedVocabulary(level, document));
      if (!ready) process.exitCode = 1;
    }
    return;
  }
  const api = (option('api') ?? 'http://127.0.0.1:8080/api/v1').replace(/\/$/, '');
  const supabase = option('supabase');
  const publishable = option('publishable-key') ?? process.env.LINGUACAP_PUBLISHABLE_KEY;
  if (!publishable) throw new Error('Indiquez la clé publique Supabase (--publishable-key).');
  let token = process.env.LINGUACAP_TOKEN;
  if (!token) {
    const email = option('email');
    if (!supabase || !email) throw new Error('Indiquez --supabase et --email (ou LINGUACAP_TOKEN).');
    const response = await fetch(`${supabase.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: { apikey: publishable, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: await password() }),
    });
    const session = await response.json();
    if (!response.ok || !session.access_token) throw new Error('Connexion refusée : vérifiez l’adresse et le mot de passe.');
    token = session.access_token;
  }
  const statePath = join(root, 'infra', 'content', '.import-state', `${new URL(api).host.replace(/[^a-z0-9.-]/gi, '_')}.json`);
  const publish = args.includes('--publish');
  if (placementOnly) {
    await importPlacement({ api, token, publishable, publish, statePath });
    return;
  }
  await importContent({ api, token, publishable, levels, publish, statePath });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
