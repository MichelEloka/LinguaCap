interface Environment {
  ASSETS: { fetch(request: Request): Promise<Response> };
  API_UPSTREAM?: string;
  API_ORIGIN_SECRET?: string;
}

const forwardedHeaders = ['accept', 'authorization', 'content-type', 'idempotency-key'] as const;
const returnedHeaders = ['content-type', 'retry-after', 'x-request-id'] as const;

function errorResponse(status: number, code: string, message: string): Response {
  return Response.json({ code, message }, { status, headers: { 'cache-control': 'no-store' } });
}

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    const incoming = new URL(request.url);
    const isApi = incoming.pathname === '/api' || incoming.pathname.startsWith('/api/');
    if (!isApi) return env.ASSETS.fetch(request);
    if (incoming.pathname !== '/api/v1' && !incoming.pathname.startsWith('/api/v1/')) {
      return errorResponse(404, 'API_ROUTE_NOT_FOUND', 'Cette route API est inconnue.');
    }

    let target: URL;
    try {
      if (!env.API_UPSTREAM || !env.API_ORIGIN_SECRET) throw new Error('Missing origin configuration');
      target = new URL(env.API_UPSTREAM);
      if (target.protocol !== 'https:' || target.username || target.password) {
        throw new Error('Invalid origin');
      }
    } catch {
      return errorResponse(503, 'API_UNCONFIGURED', 'La passerelle API est à configurer pour cet environnement.');
    }

    target.pathname = incoming.pathname;
    target.search = incoming.search;
    const headers = new Headers();
    for (const name of forwardedHeaders) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set('x-linguacap-origin', env.API_ORIGIN_SECRET);

    try {
      const response = await fetch(target, {
        method: request.method,
        headers,
        body: request.body,
        redirect: 'manual',
        signal: AbortSignal.timeout(10000),
      });
      if (response.status >= 300 && response.status < 400) {
        return errorResponse(502, 'INVALID_UPSTREAM_REDIRECT', 'La passerelle API a renvoyé une redirection inattendue.');
      }

      const responseHeaders = new Headers({ 'cache-control': 'no-store' });
      for (const name of returnedHeaders) {
        const value = response.headers.get(name);
        if (value) responseHeaders.set(name, value);
      }
      return new Response(response.body, { status: response.status, headers: responseHeaders });
    } catch {
      return errorResponse(502, 'API_UNREACHABLE', 'La passerelle API est momentanément inaccessible.');
    }
  },
};
