import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const businessServices = ['identity', 'catalogue', 'media', 'learning', 'assessment', 'tracking'];

export function localSupabase() {
  const options = { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] };
  const status = process.platform === 'win32'
    ? execFileSync('cmd.exe', ['/d', '/s', '/c', 'npx --yes supabase status -o env'], options)
    : execFileSync('npx', ['--yes', 'supabase', 'status', '-o', 'env'], options);
  const env = Object.fromEntries([...status.matchAll(/^([A-Z_]+)="?([^"\r\n]+)"?\r?$/gm)]
    .map(([, key, value]) => [key, value]));
  const api = new URL(env.API_URL);
  const database = new URL(env.DB_URL);
  if (!['localhost', '127.0.0.1'].includes(api.hostname) || !['localhost', '127.0.0.1'].includes(database.hostname)) {
    throw new Error('La recette locale requiert des adresses Supabase locales.');
  }
  const config = readFileSync(new URL('../../supabase/config.toml', import.meta.url), 'utf8');
  const container = 'supabase_db_' + config.match(/^project_id\s*=\s*"([\w-]+)"/m)?.[1];
  return { api: api.origin, jdbc: `jdbc:postgresql://${database.host}/${database.pathname.slice(1)}`,
    publishable: env.PUBLISHABLE_KEY || env.ANON_KEY,
    secret: env.SECRET_KEY || env.SERVICE_ROLE_KEY, mail: env.MAILPIT_URL, container };
}

export function localSql(container, sql) {
  return execFileSync('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres',
    '-X', '-q', '-v', 'ON_ERROR_STOP=1'], {
    encoding: 'utf8', input: sql, stdio: ['pipe', 'pipe', 'inherit'],
  });
}
