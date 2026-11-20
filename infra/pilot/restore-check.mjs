#!/usr/bin/env node
// Contrôle de restauration (DEV-108) : la sauvegarde est restaurée dans une base PostgreSQL 17 jetable, puis le nombre
// de lignes de chaque table est comparé à celui relevé lors de l'export. Les fichiers Storage sont recomptés.
// Usage : node infra/pilot/restore-check.mjs <dossier de sauvegarde>
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { countSql, parseCounts } from './backup.mjs';

const image = 'postgres:17-alpine';

function countFiles(directory) {
  if (!existsSync(directory)) return { files: 0, bytes: 0 };
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = countFiles(path);
      files += nested.files;
      bytes += nested.bytes;
    } else {
      files++;
      bytes += statSync(path).size;
    }
  }
  return { files, bytes };
}

export function restoreCheck(folder) {
  folder = resolve(folder);
  const manifest = JSON.parse(readFileSync(join(folder, 'manifest.json'), 'utf8'));
  const dump = readFileSync(join(folder, manifest.dump.file));
  const problems = [];
  if (createHash('sha256').update(dump).digest('hex') !== manifest.dump.sha256) problems.push('empreinte de l’export différente');

  const name = `linguacap-restore-${randomBytes(4).toString('hex')}`;
  const password = randomBytes(12).toString('hex');
  execFileSync('docker', ['run', '-d', '--rm', '--name', name, '-e', `POSTGRES_PASSWORD=${password}`, image], { stdio: 'ignore' });
  try {
    const psql = (sql) => execFileSync('docker', ['exec', name, 'psql', '-U', 'postgres', '-XAtc', sql], { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    for (let attempt = 0; ; attempt++) {
      try { psql('select 1'); break; } catch (error) {
        if (attempt > 60) throw error;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
      }
    }
    // Rôles applicatifs attendus par les objets restaurés (politiques, valeurs par défaut).
    psql(`do $$ begin
      ${['anon', 'authenticated', 'service_role'].map((role) => `if not exists (select from pg_roles where rolname = '${role}') then create role ${role}; end if;`).join(' ')}
    end $$; create schema if not exists auth; create schema if not exists extensions;
    create or replace function auth.uid() returns uuid language sql stable as 'select null::uuid';`);
    execFileSync('docker', ['exec', '-i', name, 'pg_restore', '-U', 'postgres', '-d', 'postgres', '--no-owner', '--no-privileges'],
      { input: dump, stdio: ['pipe', 'ignore', 'pipe'], maxBuffer: 1024 * 1024 * 512 });
    const restored = parseCounts(psql(countSql));
    for (const [table, expected] of Object.entries(manifest.tables)) {
      if (restored[table] !== expected) problems.push(`${table} : ${restored[table] ?? 'aucune'} lignes restaurées pour ${expected} exportées`);
    }
  } finally {
    execFileSync('docker', ['stop', name], { stdio: 'ignore' });
  }
  for (const [bucket, expected] of Object.entries(manifest.storage ?? {})) {
    const found = countFiles(join(folder, 'storage', bucket));
    if (found.files !== expected.files || found.bytes !== expected.bytes) {
      problems.push(`Storage ${bucket} : ${found.files} fichiers (${found.bytes} octets) pour ${expected.files} (${expected.bytes})`);
    }
  }
  return { tables: Object.keys(manifest.tables).length, rows: Object.values(manifest.tables).reduce((a, b) => a + b, 0), problems };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const folder = process.argv[2];
  if (!folder) throw new Error('Indiquez le dossier de sauvegarde.');
  const result = restoreCheck(folder);
  if (result.problems.length) {
    console.error(result.problems.join('\n'));
    process.exit(1);
  }
  console.log(`Restauration vérifiée : ${result.tables} tables, ${result.rows} lignes identiques à l’export.`);
}
