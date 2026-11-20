#!/usr/bin/env node
// Import des parcours A1/A2 (DEV-093, DEV-095) par l'API publique, avec un compte autorisé à éditer le catalogue :
// les sons et images sont déposés dans la médiathèque (réutilisés s'ils n'ont pas changé), puis le brouillon du niveau
// reçoit modules, diagnostic, bilan et examen blanc ; il est publié si --publish est demandé et que le contrôle passe.
//
// Usage :
//   node infra/content/import-content.mjs --dry-run
//   node infra/content/import-content.mjs --api https://linguacap.emichfer.org/api/v1 \
//     --supabase https://<projet>.supabase.co --publishable-key <clé publique> --email <adresse> [--level a1] [--publish]
// Le mot de passe est demandé sans écho (ou LINGUACAP_PASSWORD) ; LINGUACAP_TOKEN permet de fournir un jeton de session.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';
import {
  allMedia, audioFile, availableLevels, creditOf, imageFile, loadLevel, root, transcriptOf,
} from './content-lib.mjs';

const MAX_BODY = 1024 * 1024;
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

/** Document de version attendu par PUT /catalogue/versions/{id}, les médias étant résolus en (assetId, version). */
export function buildDocument(level, assets) {
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
  const questions = (list, diagnostic = false) => (list ?? []).map((question) => ({
    id: question.id, prompt: question.prompt, moduleRef: diagnostic ? question.moduleRef : null,
    options: question.options.map((option) => ({ id: option.id, label: option.label, correct: option.correct })),
  }));
  // Transcription de l'activité : celle des sons qui y sont placés, à lire selon la visibilité choisie.
  const transcript = (activity) => {
    if (activity.lesson?.transcript) return activity.lesson.transcript;
    const keys = [...new Set((activity.placements ?? []).filter((item) => item.usage === 'audio').map((item) => item.media))];
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
      })),
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

export async function importContent({ api, token, publishable, levels = availableLevels(), publish = false,
  statePath, log = console.log }) {
  const state = statePath && existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : { media: {}, levels: {} };
  const saveState = () => {
    if (!statePath) return;
    mkdirSync(dirname(statePath), { recursive: true });
    writeFileSync(statePath, JSON.stringify(state, null, 2));
  };
  async function call(path, { method = 'GET', body, expect = [200, 201] } = {}) {
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
  }

  const catalogue = await call('/catalogue/levels');
  const a2 = catalogue.find((level) => level.id === 'a2');
  if (a2 && a2.prerequisiteLevelId !== 'a1') log('Attention : le niveau A2 ne requiert pas encore le niveau A1 (Catalogue › niveaux).');
  let library = await call('/media');
  const byTitle = new Map(library.map((asset) => [asset.title, asset]));
  const results = [];

  for (const levelId of levels) {
    const level = loadLevel(levelId);
    const assets = new Map();
    const pending = [];
    let reused = 0;
    for (const media of allMedia(level)) {
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
          saveState();
          log(`  ${uploaded}/${pending.length} fichiers déposés…`);
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker));
    saveState();
    log(`${levelId.toUpperCase()} · médias : ${uploaded} déposé(s), ${reused} déjà à jour.`);

    const document = buildDocument(level, assets);
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
    saveState();
    results.push(result);
    library = await call('/media');
  }
  return results;
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

async function main() {
  const args = process.argv.slice(2);
  const option = (name) => {
    const index = args.indexOf(`--${name}`);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const levels = option('level') ? [option('level')] : availableLevels();
  if (args.includes('--dry-run')) {
    for (const levelId of levels) {
      const level = loadLevel(levelId);
      const assets = new Map();
      let bytes = 0;
      for (const media of allMedia(level)) {
        const { file } = mediaFile(media);
        if (!existsSync(file)) throw new Error(`Fichier manquant pour ${media.key} : ${file}`);
        bytes += readFileSync(file).length;
        assets.set(media.key, { assetId: `a-${media.key}`.slice(0, 60), version: 1 });
      }
      const size = Buffer.byteLength(JSON.stringify(buildDocument(level, assets)));
      console.log(`${levelId.toUpperCase()} · ${assets.size} médias (${(bytes / 1048576).toFixed(1)} Mo) · document ${(size / 1024).toFixed(0)} Ko`
        + (size > MAX_BODY ? ' — TROP VOLUMINEUX' : ''));
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
  await importContent({ api, token, publishable, levels, publish: args.includes('--publish'), statePath });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
