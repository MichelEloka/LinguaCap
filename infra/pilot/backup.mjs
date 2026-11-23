#!/usr/bin/env node
// Sauvegarde du pilote (DEV-108) : export PostgreSQL des schémas des services et copie des fichiers Storage.
// Usage :
//   node infra/pilot/backup.mjs --out <dossier> --db-url <url PostgreSQL> [--storage <url Supabase>]
// Le mot de passe et la clé serveur sont lus dans l'environnement (SUPABASE_DATABASE_URL, SUPABASE_SECRET_KEY) ou
// demandés sans écho : rien n'est écrit dans l'historique du terminal. Le dossier produit contient des données
// personnelles : le garder hors du dépôt, sur un support chiffré.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';

export const schemas = ['identity', 'catalogue', 'media', 'learning', 'assessment', 'tracking'];
export const buckets = ['linguacap-course', 'linguacap-productions'];
const image = 'postgres:17-alpine';

function docker(args, input) {
  return execFileSync('docker', args, { input, maxBuffer: 1024 * 1024 * 512, stdio: ['pipe', 'pipe', 'inherit'] });
}

/** Nombre de lignes de chaque table des schémas des services, en une requête, pour contrôler une restauration. */
export const countSql = `select table_schema || '.' || table_name || '|' ||
    (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name), false, true, '')))[1]::text
  from information_schema.tables where table_type = 'BASE TABLE'
    and table_schema in (${schemas.map((name) => `'${name}'`).join(',')}) order by 1;`;

export function parseCounts(output) {
  return Object.fromEntries(output.trim().split('\n').filter(Boolean).map((line) => {
    const [table, count] = line.split('|');
    return [table, Number(count)];
  }));
}

export function rowCounts(dbUrl) {
  return parseCounts(docker(['run', '--rm', '--network', 'host', image, 'psql', dbUrl, '-XAtc', countSql]).toString());
}

async function listObjects(storage, key, bucket, prefix = '') {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const response = await fetchWithRetry(`${storage}/storage/v1/object/list/${bucket}`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!response.ok) throw new Error(`Liste de ${bucket}/${prefix} refusée (HTTP ${response.status}).`);
    const page = await response.json();
    for (const item of page) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) files.push(...await listObjects(storage, key, bucket, path));
      else files.push(path);
    }
    if (page.length < 1000) return files;
  }
}

export async function backup({ out, dbUrl, storage, storageKey, log = console.log }) {
  out = resolve(out);
  mkdirSync(out, { recursive: true });
  const manifest = { createdAt: new Date().toISOString(), schemas, tables: {}, storage: {} };
  // Export au format personnalisé de pg_restore : structure et données des schémas, sans propriétaires ni droits
  // (les rôles se recréent avec db-grants.sql).
  const dump = docker(['run', '--rm', '--network', 'host', image, 'pg_dump', dbUrl, '--format=custom', '--no-owner',
    '--no-privileges', ...schemas.map((name) => `--schema=${name}`)]);
  writeFileSync(join(out, 'linguacap.dump'), dump);
  manifest.dump = { file: 'linguacap.dump', bytes: dump.length, sha256: createHash('sha256').update(dump).digest('hex') };
  manifest.tables = rowCounts(dbUrl);
  log(`Base : ${Object.keys(manifest.tables).length} tables, ${Object.values(manifest.tables).reduce((a, b) => a + b, 0)} lignes.`);
  if (storage && storageKey) {
    for (const bucket of buckets) {
      const files = await listObjects(storage, storageKey, bucket);
      let bytes = 0;
      for (const path of files) {
        const response = await fetchWithRetry(`${storage}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`, {
          headers: { apikey: storageKey, Authorization: `Bearer ${storageKey}` },
        });
        if (!response.ok) throw new Error(`Téléchargement de ${bucket}/${path} refusé (HTTP ${response.status}).`);
        const data = Buffer.from(await response.arrayBuffer());
        const target = join(out, 'storage', bucket, ...path.split('/'));
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, data);
        bytes += data.length;
      }
      manifest.storage[bucket] = { files: files.length, bytes };
      log(`Storage ${bucket} : ${files.length} fichiers, ${(bytes / 1048576).toFixed(1)} Mo.`);
    }
  }
  writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

/** Une coupure réseau passagère (connexion expirée, réinitialisée) ne doit pas faire échouer une copie de mille fichiers. */
async function fetchWithRetry(url, options, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(url, { ...options, signal: AbortSignal.timeout(60_000) });
    } catch (error) {
      if (attempt >= attempts) throw error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000 * attempt));
    }
  }
}

async function secret(name, label) {
  if (process.env[name]) return process.env[name];
  const input = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  input._writeToOutput = (text) => { if (text.includes(label)) process.stdout.write(text); };
  const value = await new Promise((resolveValue) => input.question(`${label} : `, resolveValue));
  input.close();
  process.stdout.write('\n');
  return value.trim();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2);
  const option = (name) => { const index = args.indexOf(`--${name}`); return index >= 0 ? args[index + 1] : undefined; };
  const out = option('out');
  if (!out) throw new Error('Indiquez le dossier de sauvegarde (--out).');
  const dbUrl = option('db-url') ?? await secret('SUPABASE_DATABASE_URL', 'URL PostgreSQL de la base (avec mot de passe)');
  const storage = option('storage');
  const storageKey = storage ? await secret('SUPABASE_SECRET_KEY', 'Clé serveur Supabase') : undefined;
  await backup({ out, dbUrl, storage, storageKey });
  console.log(`Sauvegarde écrite dans ${resolve(out)}.`);
}
