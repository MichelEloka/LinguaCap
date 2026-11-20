#!/usr/bin/env node
// Illustrations des contenus (DEV-094) : pictogrammes Lucide (licence ISC) composés en vignettes, en image seule ou
// en scène avec personnages et bulles, puis capturés en PNG par le navigateur de test. Les photos et dessins repris de
// Deutsch im Blick (CC BY 4.0) sont recadrés et réduits en JPEG.
// Usage : node infra/content/render-images.mjs [--force] [clé …]   (PLAYWRIGHT_CHANNEL=msedge sous Windows)
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { allMedia, availableLevels, imageDir, imageFile, loadLevel, root, sourcesDir } from './content-lib.mjs';

const require = createRequire(join(root, 'linguacap-react', 'package.json'));
const lucide = require('lucide-react');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { chromium } = require('@playwright/test');

// Nom Lucide (« building-2 », « grid-2x2 ») → composant exporté (« Building2 », « Grid2x2 »), comme le fait Lucide.
const pascal = (name) => name.replace(/(^\w|-\w)/g, (part) => part.replace('-', '').toUpperCase());
const components = { get: (name) => lucide[pascal(name)] };

const PALETTE = ['#1f6feb', '#d9480f', '#2b8a3e', '#9c36b5', '#c2255c', '#0b7285'];
const SETTINGS = {
  cafe: { icon: 'coffee', from: '#fff4e6', to: '#ffe8cc' },
  street: { icon: 'signpost', from: '#e7f5ff', to: '#d0ebff' },
  home: { icon: 'house', from: '#fff9db', to: '#fff3bf' },
  classroom: { icon: 'school', from: '#ebfbee', to: '#d3f9d8' },
  office: { icon: 'briefcase', from: '#f1f3f5', to: '#e9ecef' },
  station: { icon: 'train-front', from: '#e3fafc', to: '#c5f6fa' },
  park: { icon: 'trees', from: '#ebfbee', to: '#c3fae8' },
  shop: { icon: 'store', from: '#fff0f6', to: '#ffdeeb' },
  doctor: { icon: 'stethoscope', from: '#e7f5ff', to: '#dbe4ff' },
  party: { icon: 'party-popper', from: '#f8f0fc', to: '#f3d9fa' },
  kitchen: { icon: 'cooking-pot', from: '#fff4e6', to: '#ffec99' },
  hotel: { icon: 'hotel', from: '#f3f0ff', to: '#e5dbff' },
  city: { icon: 'building-2', from: '#edf2ff', to: '#dbe4ff' },
  beach: { icon: 'sun', from: '#e3fafc', to: '#fff3bf' },
};

function icon(name, size, color, stroke = 1.75) {
  const component = components.get(name);
  if (!component) throw new Error(`Pictogramme inconnu : ${name}`);
  return renderToStaticMarkup(createElement(component, { size, color, strokeWidth: stroke, 'aria-hidden': true }));
}

const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const STYLE = `*{box-sizing:border-box;margin:0}body{font-family:"Segoe UI","Noto Sans",Arial,sans-serif;background:transparent}
.canvas{position:relative;overflow:hidden;border-radius:28px}`;

function grid(image, seed) {
  const items = image.items;
  const columns = items.length <= 3 ? items.length : items.length === 4 ? 2 : 3;
  const cells = items.map((item, index) => {
    const color = PALETTE[(index + seed) % PALETTE.length];
    return `<div class="cell"><div class="badge" style="background:${color}1a">${icon(item.icon, 92, color)}</div>
      <div class="label">${escape(item.label)}</div></div>`;
  }).join('');
  return { width: 960, height: items.length > 3 ? 640 : 400, html: `<style>${STYLE}
    .canvas{width:960px;height:${items.length > 3 ? 640 : 400}px;background:linear-gradient(135deg,#f8f9fa,#eef3fb);padding:28px;
      display:grid;grid-template-columns:repeat(${columns},1fr);gap:22px;align-content:center}
    .cell{background:#fff;border-radius:22px;box-shadow:0 4px 14px rgba(30,50,90,.10);display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:16px;padding:18px;min-height:250px}
    .badge{width:150px;height:150px;border-radius:50%;display:grid;place-items:center}
    .label{font-size:30px;font-weight:600;color:#1c2b45;text-align:center;line-height:1.2}</style>
    <div class="canvas">${cells}</div>` };
}

function single(image, seed) {
  const color = PALETTE[seed % PALETTE.length];
  return { width: 480, height: 480, html: `<style>${STYLE}
    .canvas{width:480px;height:480px;background:${color}14;display:grid;place-items:center}
    .disc{width:340px;height:340px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 6px 18px ${color}33}</style>
    <div class="canvas"><div class="disc">${icon(image.icon, 210, color)}</div></div>` };
}

function scene(image, seed) {
  const setting = SETTINGS[image.setting];
  const people = image.people ?? [];
  const persons = people.map((person, index) => {
    const color = PALETTE[(index * 2 + seed) % PALETTE.length];
    return `<div class="person">${person.say ? `<div class="bubble">${escape(person.say)}</div>` : '<div class="bubble empty"></div>'}
      <div class="avatar" style="background:${color}">${icon('user-round', 96, '#ffffff', 2)}</div>
      <div class="name">${escape(person.name)}</div></div>`;
  }).join('');
  const items = (image.items ?? []).map((name, index) =>
    `<div class="item">${icon(name, 58, PALETTE[(index + seed + 3) % PALETTE.length])}</div>`).join('');
  return { width: 960, height: 600, html: `<style>${STYLE}
    .canvas{width:960px;height:600px;background:linear-gradient(160deg,${setting.from},${setting.to})}
    .backdrop{position:absolute;right:-40px;top:-30px;opacity:.13}
    .ground{position:absolute;left:0;right:0;bottom:0;height:120px;background:rgba(255,255,255,.55)}
    .people{position:absolute;left:40px;right:40px;bottom:36px;display:flex;justify-content:space-around;align-items:flex-end;gap:24px}
    .person{display:flex;flex-direction:column;align-items:center;gap:12px;width:280px}
    .bubble{position:relative;background:#fff;border-radius:22px;padding:16px 20px;font-size:27px;font-weight:600;color:#1c2b45;
      text-align:center;line-height:1.25;box-shadow:0 4px 14px rgba(30,50,90,.12);max-width:280px}
    .bubble:after{content:"";position:absolute;bottom:-14px;left:50%;margin-left:-14px;border:14px solid transparent;
      border-top-color:#fff;border-bottom:0}
    .bubble.empty{visibility:hidden;min-height:60px}
    .avatar{width:150px;height:150px;border-radius:50%;display:grid;place-items:center;box-shadow:0 6px 16px rgba(0,0,0,.15)}
    .name{font-size:26px;font-weight:700;color:#1c2b45;background:rgba(255,255,255,.85);padding:4px 16px;border-radius:999px}
    .items{position:absolute;left:36px;top:30px;display:flex;gap:16px}
    .item{width:96px;height:96px;border-radius:24px;background:#fff;display:grid;place-items:center;box-shadow:0 4px 12px rgba(30,50,90,.12)}
    </style><div class="canvas"><div class="backdrop">${icon(setting.icon, 380, '#1c2b45', 1.5)}</div><div class="ground"></div>
    <div class="items">${items}</div><div class="people">${persons}</div></div>` };
}

// Photo ou dessin d'un manuel : recadrage en fractions, réduction à 960 × 640 au plus, sans agrandir au-delà de 1,5.
function photo(media) {
  const file = join(sourcesDir, media.photo.file);
  const buffer = readFileSync(file);
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error(`${media.key} : PNG attendu pour ${media.photo.file}`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const [x, y, w, h] = media.photo.crop ?? [0, 0, 1, 1];
  const cropWidth = width * w;
  const cropHeight = height * h;
  const scale = Math.min(960 / cropWidth, 640 / cropHeight, 1.5);
  const outWidth = Math.round(cropWidth * scale);
  const outHeight = Math.round(cropHeight * scale);
  return { width: outWidth, height: outHeight, type: 'jpeg', digestOf: createHash('sha256').update(buffer).digest('hex'),
    html: `<style>*{margin:0}.canvas{position:relative;overflow:hidden;width:${outWidth}px;height:${outHeight}px;background:#fff}
    .canvas img{position:absolute;left:${(-x * width * scale).toFixed(1)}px;top:${(-y * height * scale).toFixed(1)}px;
    width:${(width * scale).toFixed(1)}px;height:${(height * scale).toFixed(1)}px}</style>
    <div class="canvas"><img src="data:image/png;base64,${buffer.toString('base64')}" alt=""></div>` };
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((value) => !value.startsWith('--'));
mkdirSync(imageDir, { recursive: true });
const manifestFile = join(imageDir, 'manifest.json');
const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : {};
const jobs = [];
for (const levelId of availableLevels()) {
  for (const media of allMedia(loadLevel(levelId))) {
    if (media.kind !== 'image' || (only.length && !only.includes(media.key))) continue;
    let rendered;
    let digest;
    if (media.photo) {
      if (!existsSync(join(sourcesDir, media.photo.file))) {
        if (!existsSync(imageFile(media))) throw new Error(`${media.key} : source ${media.photo.file} absente`);
        continue; // image déjà préparée et versionnée, ressources non disponibles sur ce poste
      }
      rendered = photo(media);
      digest = createHash('sha256').update(JSON.stringify(media.photo) + rendered.digestOf).digest('hex');
    } else {
      const seed = [...media.key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const layout = { grid, single, scene }[media.image.layout];
      rendered = layout(media.image, seed);
      digest = createHash('sha256').update(rendered.html).digest('hex');
    }
    if (!force && manifest[media.key] === digest && existsSync(imageFile(media))) continue;
    jobs.push({ media, rendered, digest });
  }
}
if (jobs.length) {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const { media, rendered, digest } of jobs) {
    await page.setViewportSize({ width: rendered.width, height: rendered.height });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${rendered.html}</body></html>`);
    await page.waitForLoadState('load');
    await page.locator('.canvas').screenshot(rendered.type === 'jpeg'
      ? { path: imageFile(media), type: 'jpeg', quality: 85 }
      : { path: imageFile(media), omitBackground: true });
    manifest[media.key] = digest;
  }
  await browser.close();
  writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
}
console.log(`${jobs.length} illustration(s) générées.`);
