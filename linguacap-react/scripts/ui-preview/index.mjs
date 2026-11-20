#!/usr/bin/env node
// Aperçu visuel des écrans de production (mode API) sans serveur : l'interface tourne avec Vite, l'API et Supabase
// sont simulés par Playwright avec les données des modules fixtures/*.mjs (et les vrais contenus A1/A2).
//
//   node scripts/ui-preview/index.mjs                 tous les écrans, bureau et mobile
//   node scripts/ui-preview/index.mjs eleve-seance    un ou plusieurs écrans par nom
//   options : --out <dossier> (défaut : dossier temporaire « linguacap-ui »), --full (page entière), --desktop, --mobile
//
// Chaque module de fixtures exporte `screens` ([{ name, role, path, setup?(page) }]) et `api(role, method, path, body)`
// qui renvoie la réponse JSON simulée (ou undefined si la route ne le concerne pas). Les captures sont des PNG
// « <format>-<nom>.png » ; les appels non simulés et les erreurs de la page sont signalés.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, '..', '..');
const repo = join(app, '..');
const require = createRequire(join(app, 'package.json'));
const { chromium } = require('@playwright/test');

const args = process.argv.slice(2);
const option = (name) => { const index = args.indexOf(`--${name}`); return index >= 0 ? args[index + 1] : undefined; };
const out = option('out') ?? join(tmpdir(), 'linguacap-ui');
const wanted = args.filter((value, index) => !value.startsWith('--') && args[index - 1] !== '--out');
const full = args.includes('--full');
const formats = [[1366, 900, 'desk'], [390, 844, 'mob']].filter(([, , tag]) =>
  !(args.includes('--desktop') && tag === 'mob') && !(args.includes('--mobile') && tag === 'desk'));
mkdirSync(out, { recursive: true });

const modules = [];
for (const file of readdirSync(join(here, 'fixtures')).filter((name) => name.endsWith('.mjs')).sort()) {
  modules.push(await import(pathToFileURL(join(here, 'fixtures', file)).href));
}
const screens = modules.flatMap((module) => module.screens ?? []).filter((screen) => !wanted.length || wanted.includes(screen.name));
if (!screens.length) throw new Error(`Aucun écran : ${wanted.join(', ')}`);
const profiles = Object.assign({}, ...modules.map((module) => module.profiles ?? {}));

const port = await new Promise((resolve) => { const server = createServer().listen(0, () => { const { port: free } = server.address(); server.close(() => resolve(free)); }); });
const vite = spawn(process.execPath, [join(app, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(port), '--strictPort', '--host', '127.0.0.1'], {
  cwd: app, env: { ...process.env, VITE_LINGUACAP_MODE: 'api', VITE_SUPABASE_URL: 'http://127.0.0.1:54399', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_apercu' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
const base = `http://127.0.0.1:${port}`;
for (let attempt = 0; ; attempt++) {
  try { if ((await fetch(base)).ok) break; } catch { /* démarrage */ }
  if (attempt > 80) throw new Error('Vite ne démarre pas.');
  await new Promise((resolve) => setTimeout(resolve, 250));
}

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) });
try {
  for (const screen of screens) {
    for (const [width, height, tag] of formats) {
      const context = await browser.newContext({ viewport: { width, height }, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
      const profile = profiles[screen.role] ?? { id: 'visiteur' };
      const session = { access_token: `apercu-${screen.role}`, refresh_token: 'r', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer', user: { id: profile.id, aud: 'authenticated', role: 'authenticated', email: `${screen.role}@exemple.fr`, app_metadata: {}, user_metadata: {}, created_at: '2026-11-01T08:00:00Z' } };
      // Rôle « visitor » : pas de session (pages publiques, connexion).
      if (screen.role !== 'visitor') await context.addInitScript((value) => localStorage.setItem('sb-127-auth-token', value), JSON.stringify(session));
      await context.route('http://127.0.0.1:54399/**', (route) => route.fulfill({ json: session.user }));
      const missing = new Set();
      await context.route('**/api/v1/**', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const path = url.pathname.replace(/^\/api\/v1/, '') + url.search;
        let body;
        try { body = request.postDataJSON(); } catch { body = undefined; }
        for (const module of modules) {
          const result = await module.api?.(screen.role, request.method(), path, body);
          if (result !== undefined) return route.fulfill(result?.__status ? { status: result.__status, json: result.body ?? {} } : { json: result });
        }
        missing.add(`${request.method()} ${path}`);
        return route.fulfill({ status: 404, json: { code: 'NOT_FOUND', message: 'Route non simulée dans l’aperçu.' } });
      });
      await context.route('**/__media/**', (route) => {
        const file = join(repo, 'content', 'de', 'media', new URL(route.request().url()).pathname.replace('/__media/', ''));
        if (!existsSync(file)) return route.fulfill({ status: 404, body: '' });
        const type = file.endsWith('.mp3') ? 'audio/mpeg' : file.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
        return route.fulfill({ status: 200, body: readFileSync(file), headers: { 'content-type': type } });
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base + screen.path, { waitUntil: 'networkidle' });
      if (screen.setup) await screen.setup(page);
      await page.waitForTimeout(600);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const file = join(out, `${tag}-${screen.name}.png`);
      await page.screenshot({ path: file, fullPage: full });
      console.log(`${tag}-${screen.name}.png${overflow > 0 ? ` · DÉBORDEMENT ${overflow}px` : ''}${missing.size ? ` · non simulé : ${[...missing].join(', ')}` : ''}${errors.length ? ` · ERREURS : ${errors.slice(0, 3).join(' | ')}` : ''}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  vite.kill();
}
console.log(`Captures dans ${out}`);
