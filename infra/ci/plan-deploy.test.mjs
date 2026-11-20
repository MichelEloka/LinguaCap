import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./plan-deploy.mjs', import.meta.url));
const allServices = ['identity', 'catalogue', 'media', 'learning', 'assessment', 'tracking', 'api-gateway'];

test('sélectionne les cibles à partir de deux commits Git', () => {
  const temporaryRoot = realpathSync(tmpdir());
  const repo = realpathSync(mkdtempSync(join(temporaryRoot, 'linguacap-cd-')));
  try {
    const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
    const write = (name, body) => {
      const path = join(repo, name);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, body);
    };
    const commit = label => {
      git('add', '--all');
      git('-c', 'user.name=CI', '-c', 'user.email=ci@example.invalid', 'commit', '-qm', label);
      return git('rev-parse', 'HEAD');
    };
    const plan = (...args) => {
      const output = execFileSync(process.execPath, [script, ...args], { cwd: repo, encoding: 'utf8' });
      return Object.fromEntries(output.trim().split(/\r?\n/).map(line => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), JSON.parse(line.slice(separator + 1))];
      }));
    };
    const diff = (base, head) => plan('--base', base, '--head', head);

    git('init', '-q');
    git('config', 'core.autocrlf', 'false');
    write('services/catalogue/example.java', 'first content\n');
    write('services/assessment/old.java', 'will be deleted\n');
    const original = commit('baseline');

    write('services/catalogue/example.java', 'changed content\n');
    write('services/media/new.java', 'new file\n');
    rmSync(join(repo, 'services/assessment/old.java'));
    write('linguacap-react/src/nouveau.tsx', 'updated UI\n');
    const edited = commit('modify, add and delete');
    assert.deepEqual(diff(original, edited), {
      services: ['catalogue', 'media', 'assessment'], frontend: true, database: false,
    });

    renameSync(join(repo, 'services/catalogue/example.java'), join(repo, 'services/media/example.java'));
    const renamed = commit('rename between services');
    assert.deepEqual(diff(edited, renamed), {
      services: ['catalogue', 'media'], frontend: false, database: false,
    });

    write('supabase/migrations/1.sql', 'select 1;\n');
    const migrated = commit('migration');
    assert.deepEqual(diff(renamed, migrated), { services: [], frontend: false, database: true });

    write('infra/pilot/db-grants.sql', 'grant usage;\n');
    const granted = commit('database grants');
    assert.deepEqual(diff(migrated, granted), { services: [], frontend: false, database: true });

    write('services/shared/src/shared.java', 'shared implementation\n');
    const shared = commit('shared changes');
    assert.deepEqual(diff(granted, shared), { services: allServices, frontend: false, database: false });

    write('services/Dockerfile', 'FROM scratch\n');
    const image = commit('common container');
    assert.deepEqual(diff(shared, image), { services: allServices, frontend: false, database: false });

    write('.java-version', '21\n');
    const java = commit('java version');
    assert.deepEqual(diff(image, java), { services: allServices, frontend: false, database: false });

    write('infra/ci/supabase-prod-ca.pem', '-----BEGIN CERTIFICATE-----\n');
    const certificate = commit('database certificate');
    assert.deepEqual(diff(java, certificate), { services: allServices, frontend: false, database: false });

    write('.nvmrc', '24\n');
    const node = commit('node version');
    assert.deepEqual(diff(certificate, node), { services: [], frontend: true, database: false });

    write('services/api-gateway/src/Gateway.java', 'gateway\n');
    write('services/identity/src/Identity.java', 'identity\n');
    const consumerLast = commit('gateway and identity');
    assert.deepEqual(diff(node, consumerLast).services, ['identity', 'api-gateway'],
      'la passerelle est livrée après les services qu’elle appelle');

    write('.github/workflows/cd.yml', 'name: CD\n');
    write('infra/pilot/README.md', '# Notes\n');
    write('services/media/README.md', '# Média\n');
    const documentation = commit('workflow and docs only');
    const empty = { services: [], frontend: false, database: false };
    assert.deepEqual(diff(consumerLast, documentation), empty);
    assert.deepEqual(diff(documentation, documentation), empty);

    const full = { services: allServices, frontend: true, database: true };
    assert.deepEqual(diff('0'.repeat(40), documentation), full);
    assert.deepEqual(diff('null', documentation), full);
    assert.deepEqual(plan('--all'), full);
    const missing = spawnSync(process.execPath, [script, '--base', 'f'.repeat(40), '--head', documentation], {
      cwd: repo, encoding: 'utf8',
    });
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /introuvable.*--all/);
    assert.equal(missing.stdout, '');
  } finally {
    if (dirname(repo) === temporaryRoot) rmSync(repo, { recursive: true, force: true });
  }
});
