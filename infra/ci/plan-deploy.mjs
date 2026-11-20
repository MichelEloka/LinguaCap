import { spawnSync } from 'node:child_process';

// Ordre de livraison : les services qui fournissent les données avant la passerelle qui les consomme.
const serviceNames = [
  'identity', 'catalogue', 'media', 'learning', 'assessment', 'tracking', 'api-gateway',
];
const allServicesFiles = new Set([
  'pom.xml', 'Dockerfile', 'mvnw', 'mvnw.cmd', '.java-version',
  'services/pom.xml', 'services/Dockerfile', 'services/mvnw', 'services/mvnw.cmd',
  'infra/ci/supabase-prod-ca.pem',
]);
const dbFiles = new Set(['infra/pilot/db-grants.sql']);

function parseArguments(args) {
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (!['--all', '--base', '--head'].includes(flag) || Object.hasOwn(options, flag)) {
      throw new Error('Arguments attendus : --base COMMIT --head COMMIT, ou --all.');
    }
    if (flag === '--all') {
      options[flag] = true;
      continue;
    }
    const value = args[++index];
    if (value === undefined || value.startsWith('--')) {
      throw new Error('Indique une valeur après ' + flag + '.');
    }
    options[flag] = value;
  }
  if (options['--all']) return { force: true };
  if (!Object.hasOwn(options, '--base') || !options['--head']) {
    throw new Error('Indique les commits --base et --head, ou demande un rejeu avec --all.');
  }
  return { base: options['--base'], head: options['--head'] };
}

function runGit(args) {
  return spawnSync('git', args, { maxBuffer: 32 * 1024 * 1024, windowsHide: true });
}

function resolveCommit(value, kind) {
  const result = runGit(['rev-parse', '--verify', '--quiet', '--end-of-options', value + '^{commit}']);
  const sha = result.stdout?.toString('utf8').trim();
  if (result.status !== 0 || !sha || !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(sha)) {
    throw new Error('Commit ' + kind + ' introuvable. Récupère l’historique complet, '
      + 'commits de livraison compris, ou lance un rejeu explicite avec --all.');
  }
  return sha;
}

function pathChanges(base, head) {
  const result = runGit([
    'diff', '--no-ext-diff', '--no-textconv', '--name-status', '-z', '--find-renames', base, head, '--',
  ]);
  if (result.status !== 0) throw new Error('La comparaison des commits Git a échoué.');
  const fields = result.stdout.toString('utf8').split('\0');
  const paths = new Set();
  for (let index = 0; index < fields.length - 1; ) {
    const status = fields[index++];
    const path = fields[index++];
    if (!path || !/^[ACDMRTUXB]\d*$/.test(status)) {
      throw new Error('Git a renvoyé un état de fichier inattendu.');
    }
    if (status[0] !== 'C') paths.add(path);
    if (status[0] === 'R' || status[0] === 'C') {
      const destination = fields[index++];
      if (!destination) throw new Error('Le chemin de destination du changement Git est absent.');
      paths.add(destination);
    }
  }
  return paths;
}

function fromPaths(paths) {
  const changedServices = new Set();
  let frontend = false;
  let database = false;
  for (const path of paths) {
    if (/\.mdx?$/i.test(path)) continue;

    if (path.startsWith('linguacap-react/') || path.startsWith('workers/') || path === '.nvmrc') frontend = true;
    if (path.startsWith('supabase/migrations/') || dbFiles.has(path)) database = true;

    if (allServicesFiles.has(path) || path.startsWith('services/shared/')
        || path.startsWith('.mvn/') || path.startsWith('services/.mvn/')) {
      for (const service of serviceNames) changedServices.add(service);
    } else {
      const service = /^services\/([^/]+)\//.exec(path)?.[1];
      if (serviceNames.includes(service)) changedServices.add(service);
    }
  }
  return {
    services: serviceNames.filter(service => changedServices.has(service)),
    frontend,
    database,
  };
}

function plan(args) {
  const { base, head, force } = parseArguments(args);
  const all = { services: serviceNames, frontend: true, database: true };
  if (force) return all;

  const headSha = resolveCommit(head, 'cible');
  if (base === '' || /^(?:null|all|0{40}|0{64})$/i.test(base)) return all;
  return fromPaths(pathChanges(resolveCommit(base, 'de référence'), headSha));
}

try {
  const result = plan(process.argv.slice(2));
  console.log('services=' + JSON.stringify(result.services));
  console.log('frontend=' + result.frontend);
  console.log('database=' + result.database);
} catch (error) {
  console.error('Plan de déploiement : ' + error.message);
  process.exitCode = 1;
}
