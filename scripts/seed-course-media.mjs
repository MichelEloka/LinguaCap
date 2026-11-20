import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';

const BUCKET = 'linguacap-course';
const assets = [
  { file: 'kaffee.jpg', mimeType: 'image/jpeg' },
  { file: 'kaffee.wav', mimeType: 'audio/wav' },
];

async function main() {
  const origin = storageOrigin();
  const key = process.env.SUPABASE_SEED_STORAGE_KEY;
  if (!key || !(key.startsWith('sb_secret_') || key.split('.').length === 3)) {
    throw new Error('Définissez SUPABASE_SEED_STORAGE_KEY avec une clé serveur Supabase.');
  }

  const auth = { apikey: key };
  if (!key.startsWith('sb_secret_')) {
    auth.Authorization = 'Bearer ' + key;
  }
  for (const asset of assets) {
    await upload(origin, auth, asset);
  }
}

function storageOrigin() {
  const configured = process.env.SUPABASE_URL;
  if (!configured) {
    throw new Error('Définissez SUPABASE_URL pour le projet Supabase cible.');
  }

  let url;
  try {
    url = new URL(configured);
  } catch {
    throw new Error('SUPABASE_URL doit être une URL Supabase valide.');
  }
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SUPABASE_URL doit contenir uniquement l’origine du projet.');
  }
  const loopback = ['127.0.0.1', '[::1]', 'localhost'].includes(url.hostname);
  if (loopback && ['http:', 'https:'].includes(url.protocol)) {
    return url.origin;
  }
  if (url.protocol === 'https:' && /^([a-z0-9]+)\.supabase\.co$/.test(url.hostname)
      && !url.port && process.argv.includes('--allow-remote')) {
    return url.origin;
  }
  throw new Error('Utilisez Supabase local ou autorisez explicitement le projet distant avec --allow-remote.');
}

async function upload(origin, auth, asset) {
  const body = await readFile(new URL('../linguacap-react/public/media/' + asset.file, import.meta.url));
  const base = origin + '/storage/v1/object';
  const object = '/' + BUCKET + '/a1/' + asset.file;
  const options = { redirect: 'error', signal: AbortSignal.timeout(15_000) };
  const response = await fetch(base + object, {
    ...options,
    method: 'POST',
    headers: { ...auth, 'content-type': asset.mimeType, 'x-upsert': 'false' },
    body,
  });
  if (response.ok) {
    console.log('Déposé : ' + asset.file);
    return;
  }

  const existing = await fetch(base + '/authenticated' + object, {
    ...options,
    headers: auth,
  });
  if (existing.ok) {
    const existingBody = Buffer.from(await existing.arrayBuffer());
    if (existingBody.equals(body)) {
      console.log('Déjà présent : ' + asset.file);
      return;
    }
    throw new Error('Objet existant différent ; conservé : ' + asset.file);
  }
  throw new Error('Dépôt impossible pour ' + asset.file + ' (HTTP ' + response.status + ').');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Le dépôt des médias a échoué.');
  process.exitCode = 1;
});
