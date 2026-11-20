// Crée et envoie l'invitation du premier administrateur LinguaCap (DEV-012).
// Refuse si un administrateur actif existe déjà : les comptes suivants s'invitent depuis l'application.
//
// Local (Supabase local démarré) :
//   node infra/pilot/bootstrap-admin.mjs --local --email admin@exemple.fr --name "Prénom Nom"
// Hébergé (variables dans le processus, jamais dans le dépôt) :
//   SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_DATABASE_URL (rôle propriétaire, pooler en mode session)
//   et facultativement LINGUACAP_SITE_URL (https://linguacap.emichfer.org par défaut).
//   node infra/pilot/bootstrap-admin.mjs --email admin@exemple.fr --name "Prénom Nom"
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { localSupabase, root } from './local.mjs';

const { values } = parseArgs({
  options: { email: { type: 'string' }, name: { type: 'string' }, local: { type: 'boolean', default: false } },
});
const email = values.email?.trim().toLowerCase() ?? '';
const name = values.name?.trim() ?? '';
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || name.length > 140) {
  console.error('Usage : node infra/pilot/bootstrap-admin.mjs [--local] --email adresse --name "Nom affiché"');
  process.exit(2);
}

function target() {
  if (values.local) {
    const local = localSupabase();
    return {
      api: local.api, key: local.secret, site: 'http://127.0.0.1:5186',
      psql: (args) => ['docker', ['exec', '-i', local.container, 'psql', '-U', 'postgres', '-d', 'postgres', ...args]],
    };
  }
  const missing = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_DATABASE_URL'].filter((name) => !process.env[name]);
  if (missing.length) throw new Error('Variables requises : ' + missing.join(', '));
  const api = new URL(process.env.SUPABASE_URL);
  if (api.protocol !== 'https:') throw new Error('SUPABASE_URL doit utiliser HTTPS.');
  const ca = fileURLToPath(new URL('../ci/supabase-prod-ca.pem', import.meta.url));
  const separator = process.env.SUPABASE_DATABASE_URL.includes('?') ? '&' : '?';
  // L'adresse de la base passe par l'environnement du conteneur, jamais par la ligne de commande.
  process.env.LINGUACAP_BOOTSTRAP_DB = `${process.env.SUPABASE_DATABASE_URL}${separator}sslmode=verify-full&sslrootcert=/ca.pem`;
  return {
    api: api.origin, key: process.env.SUPABASE_SECRET_KEY,
    site: (process.env.LINGUACAP_SITE_URL ?? 'https://linguacap.emichfer.org').replace(/\/+$/, ''),
    psql: (args) => ['docker', ['run', '--rm', '-i', '-e', 'LINGUACAP_BOOTSTRAP_DB', '-v', `${ca}:/ca.pem:ro`,
      'postgres:17-alpine', 'sh', '-c', 'exec psql "$LINGUACAP_BOOTSTRAP_DB" "$@"', 'psql', ...args]],
  };
}

function sql(runner, statement, variables) {
  const args = ['-X', '-q', '-At', '-v', 'ON_ERROR_STOP=1',
    ...Object.entries(variables).flatMap(([key, value]) => ['-v', `${key}=${value}`])];
  const [command, commandArgs] = runner(args);
  try {
    return execFileSync(command, commandArgs, { cwd: root, input: statement, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    const detail = String(error.stderr ?? '').match(/ERROR:\s+(.*)/)?.[1] ?? 'la requête SQL a échoué.';
    throw new Error(detail);
  }
}

async function invite(config) {
  const response = await fetch(`${config.api}/auth/v1/invite?redirect_to=${encodeURIComponent(config.site + '/activer-compte')}`, {
    method: 'POST',
    headers: {
      apikey: config.key, 'Content-Type': 'application/json', Accept: 'application/json',
      ...(config.key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${config.key}` }),
    },
    body: JSON.stringify({ email, data: { display_name: name } }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.json().catch(() => ({}));
  if (response.ok && body.id) return body.id;
  if (['email_exists', 'user_already_exists'].includes(body.error_code)) return null;
  throw new Error(`Supabase Auth a refusé l’invitation (HTTP ${response.status}).`);
}

try {
  const config = target();
  const invitationId = sql(config.psql, "select identity.bootstrap_admin_invitation(:'email', :'name');", { email, name });
  const userId = await invite(config);
  if (!userId) {
    console.log(`Invitation administrateur enregistrée pour ${email}. Cette adresse a déjà un mot de passe : `
      + 'la connexion active directement le compte administrateur.');
    process.exit(0);
  }
  sql(config.psql, `
    update identity.invitations
       set invited_user_id = :'user', sent_at = coalesce(sent_at, now()), last_sent_at = now(), send_count = send_count + 1
     where id = :'invitation';
    insert into identity.outbox_events (id, type, subject_kind, subject_id, data)
    values (gen_random_uuid(), 'identity.invitation_sent', 'invitation', :'invitation',
            jsonb_build_object('role', 'admin', 'bootstrap', true));
  `, { invitation: invitationId, user: userId });
  console.log(`Invitation administrateur envoyée à ${email}. Le lien mène à ${config.site}/activer-compte.`);
} catch (error) {
  console.error(`Premier administrateur : ${error.message}`);
  process.exit(1);
}
