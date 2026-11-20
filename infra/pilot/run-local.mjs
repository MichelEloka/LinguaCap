import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { businessServices, localSql, localSupabase, root } from './local.mjs';

const local = localSupabase();
const frontend = join(root, 'linguacap-react');
const services = ['api-gateway', ...businessServices];
const releases = services.map((name) => join(root, 'services', name, 'target', 'quarkus-app', 'quarkus-run.jar'));
if (releases.some((path) => !existsSync(path))) throw new Error('Compilez les services Maven avant le démarrage.');
const java = process.env.JAVA_HOME
  ? join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : 'java';

const env = {
  ...process.env,
  QUARKUS_HTTP_HOST: '127.0.0.1',
  LINGUACAP_CLOUD_RUN: 'false',
  LINGUACAP_INTERNAL_SECRET: randomBytes(32).toString('hex'),
  LINGUACAP_SCHEDULER_ACCOUNT: '',
  API_ORIGIN_SECRET: '',
  SUPABASE_URL: local.api,
  SUPABASE_PUBLIC_URL: local.api,
  SUPABASE_PUBLISHABLE_KEY: local.publishable,
  SUPABASE_SECRET_KEY: local.secret,
  SITE_URL: 'http://127.0.0.1:5186/activer-compte',
  DB_JDBC_URL: local.jdbc,
};
// La recette lance le traitement périodique de Suivi avec ce secret, à la place de Cloud Scheduler.
writeFileSync(join(tmpdir(), 'linguacap-recette-secret'), env.LINGUACAP_INTERNAL_SECRET, { mode: 0o600 });
const passwords = businessServices.map(() => randomBytes(32).toString('hex'));
const roles = businessServices.map((service, index) => `
  DO $$ BEGIN CREATE ROLE lingua_${service} LOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  ALTER ROLE lingua_${service} PASSWORD '${passwords[index]}';`
).join('\n');
localSql(local.container, roles + '\n' + readFileSync(new URL('db-grants.sql', import.meta.url), 'utf8'));
execFileSync(process.execPath, [join(root, 'scripts', 'seed-course-media.mjs')], {
  cwd: root, env: { ...env, SUPABASE_SEED_STORAGE_KEY: local.secret }, stdio: 'inherit',
});

let control = null;
const children = new Map();
const launches = new Map();
const paused = new Set();
function start(name, command, args, config, cwd = root) {
  launches.set(name, () => start(name, command, args, config, cwd));
  const child = spawn(command, args, { cwd, env: config, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (data) => {
      process.stdout.write(`[${name}] ${data}`);
    });
  }
  child.on('error', (error) => { console.error(name, error.message); stop(1); });
  child.on('exit', (code) => {
    if (!stopping && !paused.has(name)) { console.error(`${name} s’est arrêté.`); stop(code || 1); }
  });
  children.set(name, child);
}

let stopping = false;
function stop(code) {
  stopping = true;
  for (const child of children.values()) child.kill();
  control?.close();
  process.exitCode = code;
}

for (const [index, name] of services.entries()) {
  start(name, java, ['-XX:ActiveProcessorCount=2', '-Xmx160m', '-jar', releases[index]], {
    ...env, PORT: String(8080 + index),
    DB_USER: index ? `lingua_${name}` : '', DB_PASSWORD: index ? passwords[index - 1] : '',
  });
}
start('web', process.execPath, [join(frontend, 'node_modules', 'vite', 'bin', 'vite.js'),
  '--mode', 'integration', '--port', '5186', '--strictPort'], {
  ...process.env, VITE_SUPABASE_URL: local.api, VITE_SUPABASE_PUBLISHABLE_KEY: local.publishable,
  LINGUACAP_API_PROXY: 'http://127.0.0.1:8080',
}, frontend);
// Pilotage de la recette (DEV-101) : arrêter puis relancer un service pour éprouver une indisponibilité temporaire.
// Réservé à la boucle locale et au secret interne de la recette.
control = createServer((request, response) => {
  const [, action, name] = (request.url ?? '').split('/');
  if (request.method !== 'POST' || request.headers['x-linguacap-internal'] !== env.LINGUACAP_INTERNAL_SECRET
      || !launches.has(name) || name === 'web' || !['stop', 'start'].includes(action)) {
    response.writeHead(404).end();
    return;
  }
  if (action === 'stop') {
    const child = children.get(name);
    paused.add(name);
    if (child.exitCode !== null) { response.writeHead(204).end(); return; }
    child.once('exit', () => response.writeHead(204).end());
    child.kill();
  } else {
    if (!paused.has(name)) { response.writeHead(409).end(); return; }
    paused.delete(name);
    launches.get(name)();
    response.writeHead(202).end();
  }
}).listen(8099, '127.0.0.1');
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
