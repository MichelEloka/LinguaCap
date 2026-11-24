#!/usr/bin/env node
// Illustrations des contenus (DEV-094) : pictogrammes Lucide (licence ISC) composés en vignettes, en image seule ou
// en scène avec personnages et bulles, puis capturés en PNG par le navigateur de test. Les photos et dessins repris de
// Deutsch im Blick (CC BY 4.0) et les photos téléchargées sous licence libre (« libre/… », niveaux B) sont recadrés et
// réduits en JPEG. Tous les niveaux disponibles de content/de (A1, A2, B1…) sont parcourus.
// Usage : node infra/content/render-images.mjs [--force] [--content <dossier>] [clé …]   (PLAYWRIGHT_CHANNEL=msedge sous Windows)
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { allMedia, availableLevels, imageDir, imageFile, loadLevel, root, sourceFile } from './content-lib.mjs';

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
    const color = item.color ?? PALETTE[(index + seed) % PALETTE.length];
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
  const color = image.color ?? PALETTE[seed % PALETTE.length];
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

// Gabarits ajoutés pour la V4 : documents fictifs (affiche, formulaire, horaire, message, ticket, billet), horloges,
// trajets, plans, mots et lettres. Mêmes cartes blanches, même palette et même police que les vignettes ci-dessus.
// Dans les textes, un passage entre crochets (« sch[ö]n », « [weil] ») est mis en couleur.
const INK = '#1c2b45';
const MUTED = '#5c6b82';
const LIGHT = 'linear-gradient(135deg,#f8f9fa,#eef3fb)';
const CARD = 'background:#fff;border-radius:22px;box-shadow:0 4px 14px rgba(30,50,90,.10)';
const backgroundOf = (image) => (SETTINGS[image.setting]
  ? `linear-gradient(160deg,${SETTINGS[image.setting].from},${SETTINGS[image.setting].to})` : LIGHT);
// Une unité reste sur la ligne de son nombre (« 9.13 Uhr », « Gleis 4 », « 2 MB ») : espace insécable.
const rich = (text, color) => escape(text)
  .replace(/(\d) (Uhr|€|MB|Euro|Minuten)(?=[\s.,;:!?)\]]|$)/g, '$1 $2').replace(/\b(Gleis|Raum|Bus|Linie) (\d)/g, '$1 $2')
  .replace(/\[([^\]]+)\]/g, `<b style="color:${color}">$1</b>`);
const colorOf = (image, seed, index = 0) => image.color ?? PALETTE[(index + seed) % PALETTE.length];
// Un bloc marqué data-fit trop rempli voit son corps de texte réduit pixel par pixel, jusqu'à 16 px au plus petit.
const FIT = `<script>for(const box of document.querySelectorAll('[data-fit]')){let size=parseFloat(getComputedStyle(box).fontSize);
  while((box.scrollHeight>box.clientHeight+1||box.scrollWidth>box.clientWidth+1)&&size>16){size-=1;box.style.fontSize=size+'px';}}</script>`;
const PAPER_STYLE = `.head{display:flex;align-items:center;gap:20px;padding-bottom:16px;border-bottom:2px solid #e9edf3;margin-bottom:16px}
  .hbadge{width:80px;height:80px;border-radius:50%;display:grid;place-items:center;flex:none}
  .title{font-size:32px;font-weight:700;color:${INK};line-height:1.15}
  .subtitle{font-size:22px;font-weight:600;color:${MUTED};margin-top:4px;line-height:1.2}
  .body{flex:1;min-height:0;overflow:hidden}
  .meta{font-size:.78em;color:${MUTED};margin-bottom:.25em}.meta span{display:inline-block;min-width:5.2em;font-weight:700}
  .meta+.line{margin-top:.7em}.row+.line,.line+.row{margin-top:.6em}
  .line{display:flex;gap:.45em;align-items:flex-start;margin:.3em 0;line-height:1.34;color:${INK}}
  .licon{flex:none;display:grid;place-items:center;height:1.34em}.licon svg{width:1.05em;height:1.05em}
  .fields+.line{margin-top:.7em}.center{margin:auto 0}
  .row{display:flex;justify-content:space-between;align-items:baseline;gap:1em;padding:.32em .5em;border-bottom:1px solid #edf0f5;
    color:${INK}}
  .row.odd{background:#f6f8fb}.key{color:${MUTED};font-weight:600}.value{font-weight:700;text-align:right}
  .button{display:inline-block;margin-top:.7em;color:#fff;font-weight:700;padding:.32em 1.1em;border-radius:999px}
  .foot{font-size:21px;color:${MUTED};padding-top:12px;border-top:2px dashed #e3e8ef;margin-top:12px;line-height:1.3}`;

function paperHead(doc, color, size = 80) {
  return `<div class="head"><div class="hbadge" style="background:${color}1a;width:${size}px;height:${size}px">
    ${icon(doc.icon ?? 'file-text', Math.round(size * 0.55), color)}</div><div><div class="title">${rich(doc.title, color)}</div>
    ${doc.subtitle ? `<div class="subtitle">${rich(doc.subtitle, color)}</div>` : ''}</div></div>`;
}

function paperBlocks(doc, color) {
  const meta = (doc.meta ?? []).map(([key, value]) => `<div class="meta"><span>${escape(key)}</span>${rich(value, color)}</div>`);
  const toLine = (line) => {
    const entry = typeof line === 'string' ? { text: line } : line;
    const mark = entry.icon ? `<span class="licon">${icon(entry.icon, 30, color, 2)}</span>` : '';
    return `<div class="line">${mark}<span>${rich(entry.text, color)}</span></div>`;
  };
  const intro = (doc.intro ?? []).map(toLine);
  const lines = (doc.lines ?? []).map(toLine);
  const rows = (doc.rows ?? []).map(([key, value], index) => `<div class="row${index % 2 ? '' : ' odd'}">
    <span class="key">${rich(key, color)}</span><span class="value">${rich(value, color)}</span></div>`);
  const button = doc.button ? `<div class="button" style="background:${color}">${escape(doc.button)}</div>` : '';
  return [...meta, ...intro, ...rows, ...lines, button].join('');
}

// Affiche, avis, annonce, courriel ou carte : un document sur fond clair ou aux couleurs d'un lieu (setting).
function documentLayout(image, seed) {
  const color = colorOf(image, seed);
  const sign = image.variant === 'sign' ? ` .head{margin:-30px -42px 18px;padding:22px 42px;background:${color}14;
    border-radius:22px 22px 0 0;border-bottom:none}.line{font-weight:600}` : '';
  const centered = image.variant === 'sign' || image.center;
  return { width: 960, height: 640, html: `<style>${STYLE}${PAPER_STYLE}${sign}
    .canvas{width:960px;height:640px;background:${backgroundOf(image)};padding:36px 64px;display:flex}
    .paper{${CARD};flex:1;display:flex;flex-direction:column;padding:30px 42px;min-width:0}
    .body{font-size:${image.size ?? 28}px;display:flex;flex-direction:column}</style>
    <div class="canvas"><div class="paper">${paperHead(image, color)}<div class="body" data-fit>
    <div${centered ? ' class="center"' : ''}>${paperBlocks(image, color)}</div></div>
    ${image.footer ? `<div class="foot">${rich(image.footer, color)}</div>` : ''}</div></div>${FIT}` };
}

// Deux à quatre petits documents côte à côte : annonces, panneaux, notes.
function cardsLayout(image, seed) {
  const cards = image.cards.map((card, index) => {
    const color = colorOf(card, seed, index);
    return `<div class="paper">${paperHead(card, color, 64)}<div class="body" data-fit>
      <div${image.center ? ' class="center"' : ''}>${paperBlocks(card, color)}</div></div></div>`;
  }).join('');
  const columns = image.cards.length === 4 ? 2 : image.cards.length;
  const height = image.height ?? 640;
  return { width: 960, height, html: `<style>${STYLE}${PAPER_STYLE}
    .canvas{width:960px;height:${height}px;background:${backgroundOf(image)};padding:32px;display:grid;
      grid-template-columns:repeat(${columns},minmax(0,1fr));gap:22px}
    .paper{${CARD};display:flex;flex-direction:column;padding:24px 26px;min-width:0;min-height:0}
    .title{font-size:27px}.subtitle{font-size:20px}.head{gap:14px;padding-bottom:12px;margin-bottom:12px}
    .body{font-size:${image.size ?? 25}px;display:flex;flex-direction:column}</style><div class="canvas">${cards}</div>${FIT}` };
}

// Formulaire rempli : champs en deux colonnes, valeurs saisies dans la couleur du document.
function formLayout(image, seed) {
  const color = colorOf(image, seed);
  const fields = image.fields.map((field) => `<div class="field${field.wide ? ' wide' : ''}">
    <div class="flabel">${escape(field.label)}${field.note ? ` <i>(${escape(field.note)})</i>` : ''}</div>
    <div class="fbox">${field.value ? rich(field.value, color) : '&nbsp;'}</div></div>`).join('');
  return { width: 960, height: 640, html: `<style>${STYLE}${PAPER_STYLE}
    .canvas{width:960px;height:640px;background:${backgroundOf(image)};padding:36px 64px;display:flex}
    .paper{${CARD};flex:1;display:flex;flex-direction:column;padding:30px 42px;min-width:0}
    .body{font-size:${image.size ?? 27}px}
    .fields{display:grid;grid-template-columns:1fr 1fr;gap:.5em 1em}.wide{grid-column:1/-1}
    .flabel{font-size:.72em;font-weight:700;color:${MUTED};margin-bottom:.18em}.flabel i{font-weight:600}
    .fbox{border:2px solid #dfe5ee;border-radius:12px;padding:.2em .55em;min-height:1.85em;font-weight:600;color:${color};
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis}</style>
    <div class="canvas"><div class="paper">${paperHead(image, color)}<div class="body" data-fit><div class="fields">${fields}</div>
    ${paperBlocks({ lines: image.lines }, color)}</div>
    ${image.footer ? `<div class="foot">${rich(image.footer, color)}</div>` : ''}</div></div>${FIT}` };
}

// Tableau : horaire de départ, emploi du temps, comparaison. Une ligne peut être mise en avant (highlight).
function tableLayout(image, seed) {
  const color = colorOf(image, seed);
  const highlight = new Set(image.highlight ?? []);
  const iconCell = (index) => (image.rowIcons ? `<td class="ic">${icon(image.rowIcons[index], 32, color, 2)}</td>` : '');
  const headCells = (image.columns ?? []).map((cell) => `<th>${rich(cell, color)}</th>`).join('');
  const head = image.columns ? `<tr>${image.rowIcons ? '<th></th>' : ''}${headCells}</tr>` : '';
  const rows = image.rows.map((row, index) => `<tr${highlight.has(index) ? ' class="hl"' : ''}>${iconCell(index)}${row
    .map((cell) => `<td>${rich(cell, color)}</td>`).join('')}</tr>`).join('');
  return { width: 960, height: 640, html: `<style>${STYLE}${PAPER_STYLE}
    .canvas{width:960px;height:640px;background:${backgroundOf(image)};padding:36px 64px;display:flex}
    .paper{${CARD};flex:1;display:flex;flex-direction:column;padding:30px 42px;min-width:0}
    .body{font-size:${image.size ?? 27}px;display:flex;flex-direction:column}
    table{width:100%;border-collapse:separate;border-spacing:0}
    th{background:${color}14;color:${color};text-align:left;font-size:.8em;padding:.42em .6em;font-weight:700}
    th:first-child{border-radius:12px 0 0 12px}th:last-child{border-radius:0 12px 12px 0}
    td{padding:.46em .6em;border-bottom:1px solid #edf0f5;color:${INK};font-weight:600;line-height:1.25;vertical-align:middle;white-space:pre-line}
    tr.hl td{background:${color}12;font-weight:700}td.ic{width:1px;padding-right:0}td.ic svg{display:block}</style>
    <div class="canvas"><div class="paper">${paperHead(image, color)}<div class="body" data-fit>
    <div${image.center ? ' class="center"' : ''}><table>${head}${rows}</table>${paperBlocks({ lines: image.lines }, color)}</div></div>
    ${image.footer ? `<div class="foot">${rich(image.footer, color)}</div>` : ''}</div></div>${FIT}` };
}

// Fil de messages (téléphone ou messagerie) : bulles à gauche pour l'interlocuteur, à droite pour soi.
function messagesLayout(image, seed) {
  const color = colorOf(image, seed);
  const messages = image.messages.map((message) => `<div class="msg ${message.side ?? 'left'}">
    ${message.from ? `<div class="from">${escape(message.from)}${message.time ? ` · ${escape(message.time)}` : ''}</div>` : ''}
    <div class="text">${rich(message.text, color)}</div></div>`).join('');
  return { width: 960, height: 640, html: `<style>${STYLE}${PAPER_STYLE}
    .canvas{width:960px;height:640px;background:${backgroundOf(image)};padding:36px 64px;display:flex}
    .paper{${CARD};flex:1;display:flex;flex-direction:column;padding:26px 36px;min-width:0}
    .body{font-size:${image.size ?? 26}px;display:flex;flex-direction:column;gap:.5em}
    .msg{max-width:80%;display:flex;flex-direction:column;align-items:flex-start}.msg.right{align-self:flex-end;align-items:flex-end}
    .from{font-size:.68em;font-weight:700;color:${MUTED};margin:0 .5em .15em}
    .text{padding:.42em .75em;border-radius:20px;line-height:1.32;color:${INK}}
    .left .text{background:#f1f3f5;border-bottom-left-radius:6px}.right .text{background:${color}1f;border-bottom-right-radius:6px}
    </style><div class="canvas"><div class="paper">${paperHead(image, color, 72)}<div class="body" data-fit>${messages}</div></div></div>${FIT}` };
}

// Ticket de caisse dentelé, avec à droite le pictogramme de l'article.
function receiptLayout(image, seed) {
  const color = colorOf(image, seed);
  const teeth = 22;
  const edge = Array.from({ length: teeth * 2 + 1 }, (_, index) =>
    `${(100 - (index * 100) / (teeth * 2)).toFixed(2)}% ${index % 2 ? '100%' : 'calc(100% - 14px)'}`).join(',');
  const lines = image.lines.map(([label, amount]) => `<div class="rline"><span>${rich(label, color)}</span>
    <span class="amount">${escape(amount)}</span></div>`).join('');
  const notes = (image.notes ?? []).map((note) => `<div class="rnote">${rich(note, color)}</div>`).join('');
  return { width: 960, height: 640, html: `<style>${STYLE}
    .canvas{width:960px;height:640px;background:${backgroundOf(image)};display:flex;align-items:center;justify-content:space-around;
      padding:0 40px}
    .receipt{width:450px;background:#fff;padding:30px 34px 44px;color:${INK};
      clip-path:polygon(0 0,100% 0,${edge});border-radius:6px 6px 0 0;font-variant-numeric:tabular-nums;max-height:600px}
    .shop{font-size:28px;font-weight:700;text-align:center}.info{font-size:19px;color:${MUTED};text-align:center;margin-top:4px}
    .rule{border-top:2px dashed #cfd6e0;margin:14px 0}
    .rline{display:flex;justify-content:space-between;gap:14px;font-size:22px;line-height:1.35;margin:4px 0}
    .amount{white-space:nowrap;font-weight:600}
    .total{display:flex;justify-content:space-between;font-size:27px;font-weight:700}
    .rwrap{filter:drop-shadow(0 4px 10px rgba(30,50,90,.14))}
    .rnote{font-size:19px;color:${MUTED};text-align:center;margin-top:6px;line-height:1.3}
    .disc{width:300px;height:300px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 6px 18px ${color}33}
    </style><div class="canvas"><div class="rwrap"><div class="receipt"><div class="shop">${escape(image.title)}</div>
    ${image.subtitle ? `<div class="info">${escape(image.subtitle)}</div>` : ''}<div class="rule"></div>${lines}<div class="rule"></div>
    <div class="total"><span>${escape(image.total[0])}</span><span>${escape(image.total[1])}</span></div>${notes}</div></div>
    <div class="disc">${icon(image.icon ?? 'receipt', 180, color)}</div></div>` };
}

// Billet de transport : champs à gauche, souche à droite avec le prix.
function ticketLayout(image, seed) {
  const color = colorOf(image, seed);
  const fields = image.fields.map(([label, value]) => `<div class="tfield"><div class="tlabel">${escape(label)}</div>
    <div class="tvalue">${rich(value, color)}</div></div>`).join('');
  return { width: 960, height: 400, html: `<style>${STYLE}${PAPER_STYLE}
    .canvas{width:960px;height:400px;background:${backgroundOf(image)};display:grid;place-items:center}
    .ticket{${CARD};width:880px;height:330px;display:flex;overflow:hidden}
    .main{flex:1;padding:24px 32px;min-width:0}.head{margin-bottom:14px;padding-bottom:12px}
    .tfields{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 20px}
    .tlabel{font-size:18px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:.04em}
    .tvalue{font-size:27px;font-weight:700;color:${INK};white-space:nowrap}
    .stub{width:200px;border-left:3px dashed #d5dce6;background:${color}12;display:flex;flex-direction:column;align-items:center;
      justify-content:center;gap:10px;color:${color}}
    .price{font-size:38px;font-weight:800}.stubnote{font-size:19px;font-weight:700;color:${MUTED};text-align:center;padding:0 12px}
    </style><div class="canvas"><div class="ticket"><div class="main">${paperHead(image, color, 68)}<div class="tfields">${fields}</div></div>
    <div class="stub">${icon(image.icon ?? 'ticket', 64, color)}<div class="price">${escape(image.price ?? '')}</div>
    ${image.stub ? `<div class="stubnote">${escape(image.stub)}</div>` : ''}</div></div></div>` };
}

// Horloge à aiguilles (heure « hh:mm ») dessinée en SVG.
function clockFace(time, color, size) {
  const [hours, minutes] = time.split(':').map(Number);
  const ticks = Array.from({ length: 12 }, (_, index) => {
    const major = index % 3 === 0;
    return `<line x1="0" y1="${major ? -62 : -67}" x2="0" y2="-75" stroke="${major ? INK : '#9aa5b5'}" stroke-width="${major ? 5 : 3}"
      stroke-linecap="round" transform="rotate(${index * 30})"/>`;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="-90 -90 180 180" aria-hidden="true">
    <circle r="84" fill="#fff" stroke="${color}" stroke-width="7"/>${ticks}
    <line x1="0" y1="6" x2="0" y2="-42" stroke="${INK}" stroke-width="9" stroke-linecap="round"
      transform="rotate(${((hours % 12) + minutes / 60) * 30})"/>
    <line x1="0" y1="8" x2="0" y2="-64" stroke="${color}" stroke-width="5.5" stroke-linecap="round" transform="rotate(${minutes * 6})"/>
    <circle r="7" fill="${INK}"/></svg>`;
}

function clocksLayout(image, seed) {
  const cells = image.items.map((item, index) => {
    const color = item.color ?? PALETTE[(index + seed) % PALETTE.length];
    return `<div class="cell">${clockFace(item.time, color, 168)}<div class="clabel">${rich(item.label, color)}</div>
      ${item.sub ? `<div class="csub">${item.icon ? icon(item.icon, 26, color, 2) : ''}<span>${rich(item.sub, color)}</span></div>` : ''}</div>`;
  }).join('');
  return { width: 960, height: 400, html: `<style>${STYLE}
    .canvas{width:960px;height:400px;background:${backgroundOf(image)};padding:28px;display:grid;
      grid-template-columns:repeat(${image.items.length},minmax(0,1fr));gap:20px}
    .cell{${CARD};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:16px 10px}
    .clabel{font-size:25px;font-weight:700;color:${INK};text-align:center;line-height:1.15}
    .csub{display:flex;align-items:center;gap:6px;font-size:21px;font-weight:600;color:${MUTED};text-align:center;line-height:1.2}
    </style><div class="canvas">${cells}</div>` };
}

// Trajet ou frise : étapes reliées par un trait, avec sur chaque liaison le moyen de transport (ou rien pour une frise).
function routeLayout(image, seed) {
  const color = colorOf(image, seed);
  const parts = image.steps.flatMap((step, index) => {
    const stepColor = step.color ?? PALETTE[(index * 2 + seed) % PALETTE.length];
    const node = `<div class="step"><div class="sbadge">${icon(step.icon, 62, stepColor)}</div>
      <div class="slabel">${rich(step.label, stepColor)}</div>${step.sub ? `<div class="ssub">${rich(step.sub, stepColor)}</div>` : ''}</div>`;
    const link = image.links?.[index];
    if (index === image.steps.length - 1) return [node];
    const chip = link ? `<div class="chip">${link.icon ? icon(link.icon, 26, color, 2) : ''}<span>${rich(link.label, color)}</span></div>` : '';
    return [node, `<div class="link"><div class="track"></div>${chip}</div>`];
  }).join('');
  const height = image.height ?? 400;
  const reach = ((image.stepWidth ?? 200) - 122) / 2;
  const track = `${image.variant === 'timeline' ? 'solid' : 'dashed'} ${color}99`;
  return { width: 960, height, html: `<style>${STYLE}
    .canvas{width:960px;height:${height}px;background:${backgroundOf(image)};padding:26px 30px;display:flex;flex-direction:column;
      justify-content:center;gap:18px}
    .rtitle{font-size:28px;font-weight:700;color:${INK};text-align:center}
    .steps{display:flex;align-items:flex-start}
    .step{width:${image.stepWidth ?? 200}px;flex:none;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
    .sbadge{width:122px;height:122px;border-radius:50%;background:#fff;display:grid;place-items:center;
      box-shadow:0 6px 16px rgba(30,50,90,.14);position:relative;z-index:1}
    .slabel{font-size:25px;font-weight:700;color:${INK};line-height:1.15}
    .ssub{font-size:20px;font-weight:600;color:${MUTED};line-height:1.2;white-space:pre-line}
    .link{flex:1;position:relative;height:122px;min-width:60px}
    .track{position:absolute;left:-${reach}px;right:-${reach}px;top:59px;border-top:5px ${track}}
    .chip{position:absolute;z-index:2;left:50%;top:61px;transform:translate(-50%,-50%);background:#fff;border-radius:999px;padding:6px 14px;
      display:flex;align-items:center;gap:6px;font-size:20px;font-weight:700;color:${INK};white-space:nowrap;
      box-shadow:0 3px 10px rgba(30,50,90,.12)}
    .rnote{align-self:center;${CARD};padding:10px 22px;font-size:22px;font-weight:600;color:${INK};display:flex;gap:10px;
      align-items:center}</style>
    <div class="canvas">${image.title ? `<div class="rtitle">${rich(image.title, color)}</div>` : ''}<div class="steps">${parts}</div>
    ${image.note ? `<div class="rnote">${icon(image.noteIcon ?? 'info', 28, color, 2)}<span>${rich(image.note, color)}</span></div>` : ''}
    </div>` };
}

// Plan schématique : rues (ou murs d'une pièce), lieux posés en coordonnées de l'image, trajet en pointillés fléché.
function planLayout(image, seed) {
  const color = colorOf(image, seed);
  const svgLine = (points) => points.map(([x, y]) => `${x},${y}`).join(' ');
  const streets = (image.streets ?? []).map((street) => {
    const width = street.width ?? 46;
    const [lx, ly] = street.labelAt ?? street.points[0];
    return `<polyline points="${svgLine(street.points)}" fill="none" stroke="#c7d2df" stroke-width="${width + 8}" stroke-linecap="round"
      stroke-linejoin="round"/><polyline points="${svgLine(street.points)}" fill="none" stroke="#fff" stroke-width="${width}"
      stroke-linecap="round" stroke-linejoin="round"/>${street.name ? `<text x="${lx}" y="${ly}" transform="rotate(${street.rotate ?? 0} ${lx} ${ly})"
      text-anchor="middle" dominant-baseline="central" font-size="19" font-weight="700" fill="${MUTED}">${escape(street.name)}</text>` : ''}`;
  }).join('');
  const room = image.room ? (() => {
    const [x, y, w, h] = image.room;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fffdf8" stroke="#8a96a8" stroke-width="12"/>`;
  })() : '';
  const openings = (image.openings ?? []).map((opening) => {
    const [x1, y1, x2, y2] = opening.at;
    const stroke = opening.kind === 'window' ? '#74c0fc' : '#c8a27a';
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="16" stroke-linecap="butt"/>`;
  }).join('');
  const furniture = (image.furniture ?? []).map((piece, index) => {
    const tint = piece.color ?? PALETTE[(index + seed + 2) % PALETTE.length];
    const [x, y, w, h] = piece.rect;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${piece.ghost ? 'none' : `${tint}22`}" stroke="${tint}"
      stroke-width="3"${piece.ghost ? ' stroke-dasharray="10 8" opacity=".75"' : ''}/><text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle"
      dominant-baseline="central" font-size="21" font-weight="700" fill="${piece.ghost ? MUTED : INK}">${escape(piece.label)}</text>`;
  }).join('');
  const arrows = [...(image.route ? [{ points: image.route }] : []), ...(image.arrows ?? [])].map((arrow) =>
    `<polyline points="${svgLine(arrow.points)}" fill="none" stroke="${arrow.color ?? color}" stroke-width="9" stroke-dasharray="18 13"
      stroke-linecap="round" stroke-linejoin="round" marker-end="url(#head-${(arrow.color ?? color).slice(1)})"/>`).join('');
  const heads = [...new Set([color, ...(image.arrows ?? []).map((arrow) => arrow.color ?? color)])].map((value) =>
    `<marker id="head-${value.slice(1)}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="${value}"/></marker>`).join('');
  const labels = (image.labels ?? []).map((label) => `<div class="tag" style="left:${label.at[0]}px;top:${label.at[1]}px">
    ${rich(label.text, color)}</div>`).join('');
  const places = (image.places ?? []).map((place, index) => {
    const placeColor = place.color ?? PALETTE[(index + seed + 1) % PALETTE.length];
    const [x, y] = place.at;
    return `<div class="place ${place.labelSide ?? 'bottom'}" style="left:${x}px;top:${y}px"><div class="pbadge">
      ${icon(place.icon, 50, placeColor)}</div>${place.label ? `<div class="plabel">${rich(place.label, placeColor)}</div>` : ''}</div>`;
  }).join('');
  const legend = image.legend ? `<div class="legend" style="${image.legendAt ?? 'right:26px;bottom:24px'}">${image.legend.map((line) =>
    `<div>${rich(line, color)}</div>`).join('')}</div>` : '';
  const background = image.room ? LIGHT : backgroundOf({ setting: image.setting ?? 'street' });
  return { width: 960, height: 640, html: `<style>${STYLE}
    .canvas{width:960px;height:640px;background:${background}}.map{position:absolute;left:0;top:0}
    .place{position:absolute;width:0;height:0}
    .pbadge{position:absolute;left:-44px;top:-44px;width:88px;height:88px;border-radius:24px;background:#fff;display:grid;place-items:center;
      box-shadow:0 4px 12px rgba(30,50,90,.16)}
    .plabel{position:absolute;white-space:nowrap;background:rgba(255,255,255,.92);border-radius:999px;padding:3px 13px;font-size:21px;
      font-weight:700;color:${INK};box-shadow:0 2px 8px rgba(30,50,90,.10)}
    .bottom .plabel{left:0;top:52px;transform:translateX(-50%)}.top .plabel{left:0;bottom:52px;transform:translateX(-50%)}
    .right .plabel{left:54px;top:0;transform:translateY(-50%)}.left .plabel{right:54px;top:0;transform:translateY(-50%)}
    .tag{position:absolute;transform:translate(-50%,-50%);background:${color};color:#fff;border-radius:999px;padding:4px 14px;
      font-size:21px;font-weight:700;white-space:nowrap}.tag b{color:#fff!important}
    .legend{position:absolute;${CARD};padding:14px 20px;font-size:22px;font-weight:600;color:${INK};line-height:1.35;max-width:430px}
    </style><div class="canvas"><svg class="map" width="960" height="640" viewBox="0 0 960 640"><defs>${heads}</defs>${room}${streets}${openings}
    ${furniture}${arrows}</svg>${places}${labels}${legend}</div>` };
}

// Mots groupés par son ou par graphie : le passage entre crochets est en couleur.
function wordsLayout(image, seed) {
  const groups = image.groups;
  const columns = groups.length <= 3 ? groups.length : groups.length === 4 ? 2 : 3;
  const height = groups.length > 3 ? 640 : 400;
  const cells = groups.map((group, index) => {
    const color = group.color ?? PALETTE[(index + seed) % PALETTE.length];
    return `<div class="cell"><div class="pill" style="background:${color}1a;color:${color}">${rich(group.title, color)}</div>
      <div class="words">${group.words.map((word) => `<div>${rich(word, color)}</div>`).join('')}</div>
      ${group.note ? `<div class="wnote">${rich(group.note, color)}</div>` : ''}</div>`;
  }).join('');
  return { width: 960, height, html: `<style>${STYLE}
    .canvas{width:960px;height:${height}px;background:${backgroundOf(image)};padding:28px;display:grid;
      grid-template-columns:repeat(${columns},minmax(0,1fr));gap:22px;align-content:center}
    .cell{${CARD};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:18px 14px;
      min-height:${height > 400 ? 262 : 300}px}
    .pill{font-size:${image.titleSize ?? 34}px;font-weight:800;padding:4px 22px;border-radius:999px;white-space:nowrap}
    .words{font-size:${image.wordSize ?? 31}px;font-weight:600;color:${INK};text-align:center;line-height:1.3}
    .wnote{font-size:19px;font-weight:600;color:${MUTED};text-align:center}</style><div class="canvas">${cells}</div>` };
}

// Lettres en tuiles, avec leur nom sous la lettre si besoin ; les lettres de accent sont en couleur.
function lettersLayout(image, seed) {
  const color = colorOf(image, seed);
  const accent = new Set(image.accent ?? []);
  const rows = image.rows.map((row) => (typeof row === 'string' ? [...row].map((letter) => ({ letter })) : row));
  const longest = Math.max(...rows.map((row) => row.length));
  const tile = Math.min(image.tile ?? 112, Math.floor((960 - 72 - (longest - 1) * 14) / longest));
  const named = rows.some((row) => row.some((entry) => entry.name));
  const height = image.height ?? (rows.length > 2 ? 640 : 400);
  let count = 0;
  const html = rows.map((row) => `<div class="lrow">${row.map((entry) => {
    const tint = image.colorful ? PALETTE[(count++ + seed) % PALETTE.length] : color;
    const on = image.colorful || accent.has(entry.letter);
    const style = on ? ` style="background:${tint}14;box-shadow:0 4px 14px ${tint}33;color:${tint}"` : '';
    return `<div class="tile${on ? ' on' : ''}"${style}><div class="letter">${escape(entry.letter)}</div>
      ${entry.name ? `<div class="lname">${escape(entry.name)}</div>` : ''}</div>`;
  }).join('')}</div>`).join('');
  return { width: 960, height, html: `<style>${STYLE}
    .canvas{width:960px;height:${height}px;background:${backgroundOf(image)};padding:28px 36px;display:flex;flex-direction:column;
      justify-content:center;gap:${image.rowGap ?? 16}px}
    .lrow{display:flex;justify-content:center;gap:14px}
    .tile{${CARD};width:${tile}px;height:${Math.round(tile * (named ? 1.22 : 1))}px;display:flex;flex-direction:column;align-items:center;
      justify-content:center;gap:2px}
    .letter{font-size:${Math.round(tile * 0.5)}px;font-weight:700;color:${INK};line-height:1}
    .lname{font-size:${Math.max(18, Math.round(tile * 0.15))}px;font-weight:700;color:${MUTED}}
    .tile.on .letter,.tile.on .lname{color:inherit}</style>
    <div class="canvas">${html}</div>` };
}

// Feuillets de calendrier : jour, mois et formule allemande sous chaque feuillet.
function datesLayout(image, seed) {
  const cells = image.items.map((item, index) => {
    const color = item.color ?? PALETTE[(index + seed) % PALETTE.length];
    return `<div class="date"><div class="sheet"><div class="month" style="background:${color}">${escape(item.month)}</div>
      <div class="day">${escape(item.day)}</div></div><div class="dlabel">${rich(item.label, color)}</div>
      ${item.sub ? `<div class="dsub">${rich(item.sub, color)}</div>` : ''}</div>`;
  }).join('');
  return { width: 960, height: 400, html: `<style>${STYLE}
    .canvas{width:960px;height:400px;background:${backgroundOf(image)};padding:28px;display:grid;
      grid-template-columns:repeat(${image.items.length},minmax(0,1fr));gap:22px;align-items:center}
    .date{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
    .sheet{${CARD};width:190px;overflow:hidden}.month{color:#fff;font-size:25px;font-weight:700;padding:8px 0;text-align:center}
    .day{font-size:78px;font-weight:800;color:${INK};text-align:center;line-height:1.25}
    .dlabel{font-size:25px;font-weight:700;color:${INK};line-height:1.2}.dsub{font-size:20px;font-weight:600;color:${MUTED}}
    </style><div class="canvas">${cells}</div>` };
}

// Gabarits des niveaux B : article de presse (surtitre, titre, signature, chapeau, paragraphes), graphique en barres
// horizontales (valeurs affichées, une barre mise en avant) et fil de forum (messages signés).
const number = (value) => String(value).replace('.', ',');

function articleLayout(image, seed) {
  const color = colorOf(image, seed);
  const paragraphs = image.paragraphs.map((paragraph) => `<p>${rich(paragraph, color)}</p>`).join('');
  return { width: 960, height: 640, html: `<style>${STYLE}
    .canvas{width:960px;height:640px;background:${backgroundOf(image)};padding:32px 56px;display:flex}
    .paper{${CARD};flex:1;display:flex;flex-direction:column;padding:28px 40px;min-width:0}
    .masthead{display:flex;align-items:center;gap:12px;color:${color};font-size:19px;font-weight:800;letter-spacing:.08em;
      text-transform:uppercase;padding-bottom:12px;border-bottom:3px solid ${color};margin-bottom:16px}
    .title{font-size:36px;font-weight:800;color:${INK};line-height:1.12;margin-bottom:8px}
    .byline{font-size:18px;font-weight:600;color:${MUTED};margin-bottom:12px}
    .body{flex:1;min-height:0;overflow:hidden;font-size:${image.size ?? 23}px;color:${INK};line-height:1.42}
    .lead{font-weight:700;margin-bottom:.55em}.body p{margin:0 0 .5em}</style>
    <div class="canvas"><div class="paper"><div class="masthead">${icon(image.icon ?? 'newspaper', 26, color, 2)}
    <span>${escape(image.kicker ?? 'Lokales')}</span></div><div class="title">${rich(image.title, color)}</div>
    ${image.byline ? `<div class="byline">${escape(image.byline)}</div>` : ''}
    <div class="body" data-fit>${image.lead ? `<div class="lead">${rich(image.lead, color)}</div>` : ''}${paragraphs}</div>
    </div></div>${FIT}` };
}

function chartLayout(image, seed) {
  const color = colorOf(image, seed);
  const bars = image.bars;
  const top = Math.max(...bars.map((bar) => bar.value), 1);
  const height = bars.length <= 3 ? 400 : 640;
  const rows = bars.map((bar, index) => {
    const on = image.highlight === index;
    const width = Math.max(1.5, (bar.value / top) * 82).toFixed(1);
    return `<div class="bar${on ? ' on' : ''}"><div class="blabel">${rich(bar.label, color)}</div><div class="track">
      <div class="fill" style="width:${width}%;background:${on ? color : `${color}66`}"></div>
      <span class="bvalue">${escape(number(bar.value))}${image.unit ? `&nbsp;${escape(image.unit)}` : ''}</span></div></div>`;
  }).join('');
  return { width: 960, height, html: `<style>${STYLE}
    .canvas{width:960px;height:${height}px;background:${backgroundOf(image)};padding:30px 56px;display:flex}
    .paper{${CARD};flex:1;display:flex;flex-direction:column;padding:26px 38px;min-width:0}
    .chead{display:flex;align-items:center;gap:16px;margin-bottom:18px}
    .cbadge{width:64px;height:64px;border-radius:50%;background:${color}1a;display:grid;place-items:center;flex:none}
    .ctitle{font-size:29px;font-weight:800;color:${INK};line-height:1.15}
    .bars{flex:1;display:flex;flex-direction:column;justify-content:space-evenly;gap:10px}
    .bar{display:grid;grid-template-columns:250px 1fr;align-items:center;gap:18px}
    .blabel{font-size:23px;font-weight:600;color:${INK};text-align:right;line-height:1.15}
    .track{position:relative;height:40px;display:flex;align-items:center}
    .fill{height:100%;border-radius:0 12px 12px 0;min-width:6px}
    .bvalue{margin-left:12px;font-size:23px;font-weight:800;color:${INK};white-space:nowrap}
    .bar.on .blabel{font-weight:800;color:${color}}
    .source{font-size:18px;color:${MUTED};margin-top:14px;padding-top:10px;border-top:2px dashed #e3e8ef}</style>
    <div class="canvas"><div class="paper"><div class="chead"><div class="cbadge">${icon('chart-bar', 36, color)}</div>
    <div class="ctitle">${rich(image.title, color)}</div></div><div class="bars">${rows}</div>
    ${image.source ? `<div class="source">${escape(image.source)}</div>` : ''}</div></div>` };
}

function forumLayout(image, seed) {
  const color = colorOf(image, seed);
  const posts = image.posts.map((post, index) => {
    const tint = PALETTE[(index * 2 + seed + 1) % PALETTE.length];
    return `<div class="post"><div class="avatar" style="background:${tint}">${escape(post.author.trim().charAt(0).toUpperCase())}</div>
      <div class="pbody"><div class="pmeta"><b>${escape(post.author)}</b>${post.date ? ` · ${escape(post.date)}` : ''}</div>
      <div class="ptext">${rich(post.text, color)}</div></div></div>`;
  }).join('');
  return { width: 960, height: 640, html: `<style>${STYLE}${PAPER_STYLE}
    .canvas{width:960px;height:640px;background:${backgroundOf(image)};padding:32px 56px;display:flex}
    .paper{${CARD};flex:1;display:flex;flex-direction:column;padding:24px 34px;min-width:0}
    .head{margin-bottom:12px;padding-bottom:12px}
    .body{font-size:${image.size ?? 22}px;display:flex;flex-direction:column;gap:.55em}
    .post{display:flex;gap:.7em;align-items:flex-start;background:#f6f8fb;border-radius:18px;padding:.6em .8em}
    .avatar{width:2.1em;height:2.1em;border-radius:50%;color:#fff;font-weight:800;display:grid;place-items:center;flex:none}
    .pbody{min-width:0}.pmeta{font-size:.8em;color:${MUTED};margin-bottom:.15em}.pmeta b{color:${INK}}
    .ptext{color:${INK};line-height:1.34}</style>
    <div class="canvas"><div class="paper">${paperHead({ title: image.title, subtitle: image.subtitle, icon: image.icon ?? 'messages-square' }, color, 68)}
    <div class="body" data-fit>${posts}</div></div></div>${FIT}` };
}

const LAYOUTS = {
  grid, single, scene, document: documentLayout, cards: cardsLayout, form: formLayout, table: tableLayout,
  messages: messagesLayout, receipt: receiptLayout, ticket: ticketLayout, clocks: clocksLayout, route: routeLayout,
  plan: planLayout, words: wordsLayout, letters: lettersLayout, dates: datesLayout,
  article: articleLayout, chart: chartLayout, forum: forumLayout,
};

/**
 * Dimensions d'un JPEG lues dans son marqueur de début d'image (SOF0 à SOF3, sans dépendance) ; une orientation EXIF de 5
 * à 8 (photo tournée d'un quart de tour) inverse largeur et hauteur, le navigateur appliquant l'orientation au rendu.
 */
function jpegSize(buffer, label) {
  let offset = 2;
  let orientation = 1;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) throw new Error(`${label} : JPEG illisible (marqueur attendu à l’octet ${offset})`);
    const marker = buffer[offset + 1];
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 2);
    if (marker === 0xe1 && buffer.toString('latin1', offset + 4, offset + 10) === 'Exif\0\0') {
      const tiff = offset + 10;
      const little = buffer.toString('latin1', tiff, tiff + 2) === 'II';
      const read16 = (at) => (little ? buffer.readUInt16LE(at) : buffer.readUInt16BE(at));
      const read32 = (at) => (little ? buffer.readUInt32LE(at) : buffer.readUInt32BE(at));
      const ifd = tiff + read32(tiff + 4);
      for (let entry = 0; entry < read16(ifd) && ifd + 2 + entry * 12 + 12 <= offset + 2 + length; entry++) {
        const at = ifd + 2 + entry * 12;
        if (read16(at) === 0x0112) orientation = read16(at + 8);
      }
    }
    if (marker >= 0xc0 && marker <= 0xc3) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return orientation >= 5 && orientation <= 8 ? { width: height, height: width } : { width, height };
    }
    offset += 2 + length;
  }
  throw new Error(`${label} : dimensions du JPEG introuvables`);
}

// Photo ou dessin (manuel sous licence libre, ou fichier téléchargé « libre/… » listé au registre), PNG ou JPEG :
// recadrage en fractions, réduction à 960 × 640 au plus, sans agrandir au-delà de 1,5. Pas de SVG (risque de script).
function photo(media) {
  const file = sourceFile(media.photo.file);
  const buffer = readFileSync(file);
  const png = buffer.length > 24 && buffer.readUInt32BE(0) === 0x89504e47;
  const jpeg = buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (!png && !jpeg) throw new Error(`${media.key} : PNG ou JPEG attendu pour ${media.photo.file}`);
  const { width, height } = png ? { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) } : jpegSize(buffer, media.key);
  const mime = png ? 'image/png' : 'image/jpeg';
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
    <div class="canvas"><img src="data:${mime};base64,${buffer.toString('base64')}" alt=""></div>` };
}

const args = process.argv.slice(2);
const force = args.includes('--force');
// --content <dossier> : niveaux construits ailleurs (aperçu de build-b), images écrites dans <dossier>/media/images.
const contentIndex = args.indexOf('--content');
const base = contentIndex >= 0 ? resolve(args[contentIndex + 1]) : null;
const only = args.filter((value, index) => !value.startsWith('--') && (contentIndex < 0 || index !== contentIndex + 1));
const outputDir = base ? join(base, 'media', 'images') : imageDir;
const outputFile = (media) => (base ? join(outputDir, `${media.key}.${media.photo ? 'jpg' : 'png'}`) : imageFile(media));
mkdirSync(outputDir, { recursive: true });
const manifestFile = join(outputDir, 'manifest.json');
const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : {};
// Illustrations des modules ajoutés en V4, décrites dans content/v4/source/images-v4.json et rendues dans le même dossier.
const v4File = join(root, 'content', 'v4', 'source', 'images-v4.json');
const v4Media = existsSync(v4File) && !base ? JSON.parse(readFileSync(v4File, 'utf8')).images
  .map((entry) => ({ key: entry.media, kind: 'image', image: entry.image })) : [];
const jobs = [];
// La V4 officielle (content/de) reprend les illustrations de images-v4.json : chaque clé n'est rendue qu'une fois.
const seen = new Set();
const levelMedia = availableLevels(base ?? undefined).flatMap((levelId) => allMedia(loadLevel(levelId, base ?? undefined)));
for (const media of [...levelMedia, ...v4Media]) {
  if (media.kind !== 'image' || (only.length && !only.includes(media.key)) || seen.has(media.key)) continue;
  seen.add(media.key);
  let rendered;
  let digest;
  if (media.photo) {
    if (!existsSync(sourceFile(media.photo.file))) {
      if (!existsSync(outputFile(media)) && !existsSync(imageFile(media))) throw new Error(`${media.key} : source ${media.photo.file} absente`);
      continue; // image déjà préparée et versionnée, ressources non disponibles sur ce poste
    }
    rendered = photo(media);
    digest = createHash('sha256').update(JSON.stringify(media.photo) + rendered.digestOf).digest('hex');
  } else {
    const seed = [...media.key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const layout = LAYOUTS[media.image.layout];
    if (!layout) throw new Error(`${media.key} : mise en page « ${media.image.layout} » inconnue`);
    rendered = layout(media.image, seed);
    digest = createHash('sha256').update(rendered.html).digest('hex');
  }
  if (!force && manifest[media.key] === digest && existsSync(outputFile(media))) continue;
  jobs.push({ media, rendered, digest });
}
if (jobs.length) {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const { media, rendered, digest } of jobs) {
    await page.setViewportSize({ width: rendered.width, height: rendered.height });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${rendered.html}</body></html>`);
    await page.waitForLoadState('load');
    await page.locator('.canvas').screenshot(rendered.type === 'jpeg'
      ? { path: outputFile(media), type: 'jpeg', quality: 85 }
      : { path: outputFile(media), omitBackground: true });
    manifest[media.key] = digest;
  }
  await browser.close();
  writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
}
console.log(`${jobs.length} illustration(s) générées.`);
