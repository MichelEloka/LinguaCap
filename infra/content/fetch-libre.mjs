#!/usr/bin/env node
// Médias sous licence libre des niveaux B (plan B §3.7) : recherche et téléchargement depuis Wikimedia Commons, contrôle
// du type et de l'empreinte, entrée du registre versionné content/b/libre/registre.json. Les fichiers téléchargés sont
// des données non fiables : ils vont dans un dossier dédié hors dépôt (resource-langue/libre/<source>/, ignoré par Git),
// ne sont jamais exécutés et ne sont lus ensuite que par le rendu des images (photo en data:) ou par ffmpeg.
// Les métadonnées de l'API (auteur, licence, description) sont recopiées telles quelles, puis relues par un humain.
//
// Usage (depuis la racine du dépôt) :
//   node infra/content/fetch-libre.mjs search "<recherche>" [--limit 20]
//       candidats Commons (JPEG) : licence, taille, restrictions ; rien n'est téléchargé
//   node infra/content/fetch-libre.mjs info "File:<titre>"
//       métadonnées d'un fichier (licence, auteur, empreinte, restrictions, catégories)
//   node infra/content/fetch-libre.mjs fetch "File:<titre>" --as <nom.jpg> --title "<titre court>" [--persons false]
//       [--changes "recadrée, réduite"] [--width 1920] [--max-mb 25]
//       télécharge dans resource-langue/libre/commons/<nom> la vignette Commons de --width pixels (les originaux sont
//       refusés aux clients automatiques, HTTP 429), ou l'original s'il est plus petit (empreinte SHA-1 alors vérifiée
//       contre celle de Commons) ; contrôle le type (octets magiques), l'orientation et la licence (liste blanche), puis
//       écrit l'entrée du registre (empreintes du fichier téléchargé, références de l'original)
//   node infra/content/fetch-libre.mjs verify
//       relit le registre : licence admise, fichier présent (sinon simple avertissement), empreintes et type
// Options communes : --dest <dossier> (défaut resource-langue/libre), --registry <fichier> (défaut content/b/libre/registre.json).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const API = 'https://commons.wikimedia.org/w/api.php';
// Agent générique et descriptif, comme le demande la politique des API Wikimedia (aucune donnée personnelle).
const USER_AGENT = 'libre-media-registry/1.0 (open-licence educational media; Node.js fetch)';

/** Licences admises (plan B §3.4 et §7 : CC BY-SA pour les médias seulement), forme du registre ← nom court Commons. */
export const LICENSES = new Map([
  ['CC0', 'CC0'], ['CC0 1.0', 'CC0'], ['Public domain', 'Domaine public'], ['PD', 'Domaine public'],
  ['CC BY 2.0 FR', 'CC BY 2.0 FR'], ['CC BY 2.5', 'CC BY 2.5'], ['CC BY 3.0', 'CC BY 3.0'], ['CC BY 4.0', 'CC BY 4.0'],
  ['CC BY-SA 3.0', 'CC BY-SA 3.0'], ['CC BY-SA 4.0', 'CC BY-SA 4.0'],
]);
export const LICENSE_WHITELIST = new Set(LICENSES.values());
const LICENSE_URLS = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'Domaine public': 'https://creativecommons.org/publicdomain/mark/1.0/',
  'CC BY 2.0 FR': 'https://creativecommons.org/licenses/by/2.0/fr/',
  'CC BY 2.5': 'https://creativecommons.org/licenses/by/2.5/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
};

/** Types admis, reconnus à leurs octets magiques : tout le reste (SVG, HTML, archives, exécutables) est refusé. */
export function sniff(buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { type: 'jpeg', extension: 'jpg' };
  if (buffer.readUInt32BE(0) === 0x89504e47 && buffer.readUInt32BE(4) === 0x0d0a1a0a) return { type: 'png', extension: 'png' };
  if (buffer.toString('latin1', 0, 4) === 'OggS') return { type: 'ogg', extension: 'ogg' };
  if (buffer.toString('latin1', 0, 4) === 'fLaC') return { type: 'flac', extension: 'flac' };
  if (buffer.toString('latin1', 0, 4) === 'RIFF' && buffer.toString('latin1', 8, 12) === 'WAVE') return { type: 'wav', extension: 'wav' };
  if (buffer.toString('latin1', 0, 3) === 'ID3' || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)) return { type: 'mp3', extension: 'mp3' };
  return null;
}

/** Orientation EXIF d'un JPEG (1 = normale) : une photo tournée par ses métadonnées fausserait le recadrage. */
export function jpegOrientation(buffer) {
  let offset = 2;
  while (offset + 4 < buffer.length && buffer[offset] === 0xff) {
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker === 0xe1 && buffer.toString('latin1', offset + 4, offset + 10) === 'Exif\0\0') {
      const tiff = offset + 10;
      const little = buffer.toString('latin1', tiff, tiff + 2) === 'II';
      const u16 = (at) => (little ? buffer.readUInt16LE(at) : buffer.readUInt16BE(at));
      const u32 = (at) => (little ? buffer.readUInt32LE(at) : buffer.readUInt32BE(at));
      const ifd = tiff + u32(tiff + 4);
      for (let entry = 0; entry < u16(ifd); entry++) {
        const at = ifd + 2 + entry * 12;
        if (u16(at) === 0x0112) return u16(at + 8);
      }
      return 1;
    }
    if (marker === 0xda) break;
    offset += 2 + length;
  }
  return 1;
}

/** Dimensions d'un JPEG (marqueurs SOF0 à SOF2) ou d'un PNG. */
export function imageSize(buffer) {
  if (buffer.readUInt32BE(0) === 0x89504e47) return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  let offset = 2;
  while (offset + 9 < buffer.length && buffer[offset] === 0xff) {
    const marker = buffer[offset + 1];
    if (marker >= 0xc0 && marker <= 0xc2) return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    offset += 2 + buffer.readUInt16BE(offset + 2);
  }
  return null;
}

const plain = (html) => String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"').replace(/&#0?39;/g, '’').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
  // Requêtes espacées ; en cas de limitation (HTTP 429 ou réponse non JSON), nouvel essai après une pause croissante.
  for (let attempt = 1; ; attempt++) {
    await sleep(attempt === 1 ? 1000 : 5000 * attempt);
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
    const body = await response.text();
    if (response.ok && body.startsWith('{')) return JSON.parse(body);
    if (attempt >= 4) throw new Error(`API Commons : HTTP ${response.status} ${body.slice(0, 80)}`);
  }
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

const IMAGEINFO = {
  prop: 'imageinfo|categories', iiprop: 'url|sha1|size|mime|extmetadata', cllimit: 'max',
  iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Credit|Restrictions|ImageDescription|UsageTerms|AttributionRequired|Copyrighted|DateTimeOriginal|ObjectName',
};

function describe(page) {
  const info = page.imageinfo?.[0];
  if (!info) return null;
  const meta = Object.fromEntries(Object.entries(info.extmetadata ?? {}).map(([key, value]) => [key, plain(value?.value)]));
  const licenseName = meta.LicenseShortName ?? '';
  const license = LICENSES.get(licenseName) ?? null;
  const categories = (page.categories ?? []).map((category) => category.title.replace(/^Category:/, ''));
  const flags = [];
  if (meta.Restrictions) flags.push(`restrictions : ${meta.Restrictions}`);
  if (categories.some((category) => /personality rights|trademark|logo|brand/i.test(category))) flags.push('catégorie personnes, marque ou logo');
  return {
    title: page.title, pageUrl: info.descriptionurl, fileUrl: clean(info.url), thumbUrl: info.thumburl ? clean(info.thumburl) : null,
    thumbWidth: info.thumbwidth ?? null, thumbHeight: info.thumbheight ?? null, sha1: info.sha1, size: info.size, width: info.width,
    height: info.height, mime: info.mime, licenseName, license, licenseUrl: (license && LICENSE_URLS[license]) || meta.LicenseUrl || null,
    author: (meta.Artist || meta.Credit || '').replace(/^(Photo|Foto|Photograph|Author|Autor)s*:s*/i, ''), credit: meta.Credit || '', description: meta.ImageDescription || '',
    objectName: meta.ObjectName || '', date: meta.DateTimeOriginal || '', flags, categories,
  };
}

/** Adresse sans paramètres de suivi (utm_…). */
const clean = (address) => { const url = new URL(address); url.search = ''; return url.toString(); };

async function fileInfo(title, width = null) {
  const data = await api({ action: 'query', titles: title, ...IMAGEINFO, ...(width ? { iiurlwidth: String(width) } : {}) });
  const page = data.query?.pages?.[0];
  if (!page || page.missing) throw new Error(`${title} : fichier introuvable sur Commons`);
  const info = describe(page);
  if (!info) throw new Error(`${title} : pas d'informations de fichier`);
  return info;
}

function option(args, name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : fallback;
}

function readRegistry(file) {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { files: [] };
}

function writeRegistry(file, registry) {
  registry.files.sort((a, b) => a.path.localeCompare(b.path));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(registry, null, 2)}\n`);
}

const digest = (algorithm, buffer) => createHash(algorithm).update(buffer).digest('hex');
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;

async function search(query, limit) {
  const data = await api({ action: 'query', generator: 'search', gsrsearch: `${query} filemime:image/jpeg`, gsrnamespace: '6',
    gsrlimit: String(limit), ...IMAGEINFO });
  const pages = (data.query?.pages ?? []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  for (const page of pages) {
    const info = describe(page);
    if (!info) continue;
    const ok = info.license ? 'OK ' : 'NON';
    console.log(`${ok} ${info.licenseName.padEnd(14)} ${String(info.width).padStart(5)}×${String(info.height).padEnd(5)} `
      + `${(info.size / 1048576).toFixed(1).padStart(5)} Mo  ${info.title}${info.flags.length ? `  ⚠ ${info.flags.join(' ; ')}` : ''}`);
  }
}

/** Fichier servi par Wikimedia (original ou vignette), sans redirection ; patience en cas de limitation (HTTP 429). */
async function download(url, title) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, redirect: 'error' });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    await response.body?.cancel();
    if (response.status !== 429 || attempt >= 6) throw new Error(`${title} : HTTP ${response.status}`);
    const wait = Number(response.headers.get('retry-after')) || 15 * attempt;
    console.log(`… limitation du serveur, nouvel essai dans ${wait} s`);
    await sleep(Math.min(wait, 120) * 1000);
  }
}

async function fetchFile(title, args, dest, registryFile) {
  const name = option(args, 'as');
  const shortTitle = option(args, 'title');
  const persons = option(args, 'persons', 'false') === 'true';
  const changes = option(args, 'changes', 'recadrée, réduite');
  const maxBytes = Number(option(args, 'max-mb', '25')) * 1048576;
  // Les originaux sont refusés aux clients automatiques (HTTP 429) : on prend la vignette Commons de --width pixels
  // (1920 par défaut, largement assez pour une image de 960 × 640 ; largeurs usuelles : 960, 1280, 1920), ou
  // l'original s'il est plus petit.
  const width = Number(option(args, 'width', '1920'));
  if (!name || !SAFE_NAME.test(name)) throw new Error('--as <nom> : lettres ASCII, chiffres, « . », « _ » ou « - »');
  if (!shortTitle) throw new Error('--title « titre court » attendu');
  const info = await fileInfo(title, width);
  if (!info.license) throw new Error(`${title} : licence « ${info.licenseName} » hors de la liste blanche`);
  if (info.flags.length) throw new Error(`${title} : ${info.flags.join(' ; ')} (à écarter)`);
  if (info.size > maxBytes) throw new Error(`${title} : ${(info.size / 1048576).toFixed(1)} Mo, au-delà de --max-mb`);
  // Seules les largeurs usuelles des vignettes (960, 1280, 1920…) sont servies ; une autre largeur renvoie l'original.
  const thumbnail = Boolean(info.thumbUrl && info.thumbUrl.includes('/thumb/') && info.thumbWidth < info.width);
  const url = new URL(thumbnail ? info.thumbUrl : info.fileUrl);
  if (url.protocol !== 'https:' || !['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(url.hostname)) {
    throw new Error(`${title} : adresse de fichier inattendue`);
  }
  // Dossier dédié à la source, créé vide au premier usage ; le fichier est d'abord écrit sous un nom temporaire.
  const directory = join(dest, 'commons');
  mkdirSync(directory, { recursive: true });
  const target = join(directory, name);
  if (!resolve(target).startsWith(resolve(directory) + sep)) throw new Error('chemin de destination invalide');
  const buffer = await download(url, title);
  if (buffer.length > maxBytes) throw new Error(`${title} : fichier trop gros`);
  const kind = sniff(buffer);
  if (!kind) throw new Error(`${title} : type refusé (ni JPEG, PNG, OGG, FLAC, WAV ni MP3)`);
  if (!name.toLowerCase().endsWith(`.${kind.extension}`)) throw new Error(`${title} : ${kind.type} reçu, extension .${kind.extension} attendue`);
  const sha1 = digest('sha1', buffer);
  // L'empreinte annoncée par Commons est celle de l'original : elle se vérifie quand on télécharge l'original.
  if (!thumbnail && sha1 !== info.sha1) throw new Error(`${title} : empreinte SHA-1 différente de celle de Commons`);
  const orientation = kind.type === 'jpeg' ? jpegOrientation(buffer) : 1;
  if (orientation !== 1) throw new Error(`${title} : orientation EXIF ${orientation}, à écarter (recadrage faussé)`);
  const size = ['jpeg', 'png'].includes(kind.type) ? imageSize(buffer) : null;
  const temporary = `${target}.part`;
  writeFileSync(temporary, buffer);
  if (existsSync(target)) rmSync(target);
  renameSync(temporary, target);
  const path = relative(dest, target).split(sep).join('/');
  const registry = readRegistry(registryFile);
  const entry = {
    path: `libre/${path}`, sha1, sha256: digest('sha256', buffer), bytes: buffer.length, type: kind.type,
    ...(size ? { width: size.width, height: size.height } : {}),
    source: 'Wikimedia Commons', title: shortTitle, commonsTitle: info.title, author: info.author,
    license: info.license, licenseUrl: info.licenseUrl, url: info.pageUrl, fileUrl: url.toString(),
    original: { url: info.fileUrl, sha1: info.sha1, width: info.width, height: info.height, bytes: info.size },
    retrieved: new Date().toISOString().slice(0, 10), persons,
    changes: thumbnail ? `vignette Commons de ${info.thumbWidth} px, ${changes}` : changes,
  };
  registry.files = registry.files.filter((item) => item.path !== entry.path);
  registry.files.push(entry);
  writeRegistry(registryFile, registry);
  console.log(`${entry.path} · ${entry.license} · ${entry.author} · ${size ? `${size.width}×${size.height}` : kind.type} · ${(buffer.length / 1048576).toFixed(1)} Mo`);
}

function verify(dest, registryFile) {
  const registry = readRegistry(registryFile);
  let errors = 0;
  let missing = 0;
  const paths = new Set();
  for (const entry of registry.files ?? []) {
    const at = entry.path;
    const problems = [];
    if (paths.has(at)) problems.push('entrée en double');
    paths.add(at);
    if (!/^libre\/[a-z0-9-]+\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(at ?? '')) problems.push('chemin invalide');
    if (!LICENSE_WHITELIST.has(entry.license)) problems.push(`licence « ${entry.license} » hors liste blanche`);
    for (const field of ['author', 'title', 'url', 'licenseUrl', 'source', 'retrieved', 'sha1', 'sha256']) {
      if (!String(entry[field] ?? '').trim()) problems.push(`${field} manquant`);
    }
    if (typeof entry.persons !== 'boolean') problems.push('persons : true ou false');
    const file = join(dest, at.replace(/^libre\//, ''));
    if (!existsSync(file)) {
      missing++;
    } else {
      const buffer = readFileSync(file);
      if (digest('sha1', buffer) !== entry.sha1 || digest('sha256', buffer) !== entry.sha256) problems.push('empreinte différente');
      if (!sniff(buffer)) problems.push('type refusé');
    }
    if (problems.length) {
      errors++;
      console.log(`✗ ${at} : ${problems.join(' ; ')}`);
    }
  }
  console.log(`${registry.files?.length ?? 0} fichier(s) au registre · ${errors} en erreur · ${missing} absent(s) de ${relative(root, dest) || dest}`);
  if (errors) process.exitCode = 1;
}

async function main() {
  const args = process.argv.slice(2);
  const [command, subject] = args;
  const dest = resolve(root, option(args, 'dest', 'resource-langue/libre'));
  const registryFile = resolve(root, option(args, 'registry', 'content/b/libre/registre.json'));
  if (command === 'search' && subject) await search(subject, Number(option(args, 'limit', '20')));
  else if (command === 'info' && subject) console.log(JSON.stringify(await fileInfo(subject), null, 2));
  else if (command === 'fetch' && subject) await fetchFile(subject, args, dest, registryFile);
  else if (command === 'verify') verify(dest, registryFile);
  else {
    console.log('Usage : fetch-libre.mjs search "<recherche>" | info "File:…" | fetch "File:…" --as <nom> --title "<titre>" | verify');
    process.exitCode = 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
