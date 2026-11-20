import { expect, test } from '@playwright/test';
import worker from '../../workers/web-proxy/src/index';

const site = 'https://app.example.test';
const assets = { fetch: async () => new Response('asset') };

test('le proxy distingue le site, une route inconnue et une API non configurée', async () => {
  const page = await worker.fetch(new Request(`${site}/eleve`), { ASSETS: assets });
  expect(await page.text()).toBe('asset');

  const unknown = await worker.fetch(new Request(`${site}/api/v2/health`), { ASSETS: assets });
  expect(unknown.status).toBe(404);

  const missing = await worker.fetch(new Request(`${site}/api/v1/health`), { ASSETS: assets });
  expect(missing.status).toBe(503);
  expect(await missing.json()).toMatchObject({ code: 'API_UNCONFIGURED' });
});

test('le proxy contrôle les en-têtes internes et désactive le cache de l’API', async () => {
  const originalFetch = globalThis.fetch;
  const requests: { url: string; headers: Headers; redirect?: RequestRedirect }[] = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), headers: new Headers(init?.headers), redirect: init?.redirect });
    return Response.json({ status: 'ok' }, { headers: { 'set-cookie': 'upstream=private', 'cache-control': 'public' } });
  };
  try {
    const response = await worker.fetch(new Request(`${site}/api/v1/health?detail=1`, {
      headers: { 'x-linguacap-origin': 'valeur-client', 'x-serverless-authorization': 'valeur-client', authorization: 'Bearer exemple' },
    }), { ASSETS: assets, API_UPSTREAM: 'https://api.example.test', API_ORIGIN_SECRET: 'exemple-normalise' });
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe('https://api.example.test/api/v1/health?detail=1');
    expect(requests[0].redirect).toBe('manual');
    expect(requests[0].headers.get('x-linguacap-origin')).toBe('exemple-normalise');
    expect(requests[0].headers.get('x-serverless-authorization')).toBeNull();
    expect(requests[0].headers.get('authorization')).toBe('Bearer exemple');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('set-cookie')).toBeNull();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('le proxy impose HTTPS et ajoute les en-têtes de sécurité au site comme à l’API', async () => {
  const insecure = await worker.fetch(new Request('http://app.example.test/espace?x=1'), { ASSETS: assets });
  expect(insecure.status).toBe(301);
  expect(insecure.headers.get('location')).toBe('https://app.example.test/espace?x=1');

  for (const path of ['/espace', '/api/v1/health']) {
    const response = await worker.fetch(new Request(`${site}${path}`), { ASSETS: assets });
    expect(response.headers.get('strict-transport-security')).toBe('max-age=31536000');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(response.headers.get('permissions-policy')).toContain('microphone=(self)');
  }
});
