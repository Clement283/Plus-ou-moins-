export type EmbeddedAsset = { body: string; base64: boolean; type: string; etag: string };

const NO_CACHE = new Set(['/index.html', '/sw.js', '/registerSW.js', '/manifest.webmanifest']);
const decoded = new Map<string, Uint8Array>();

function bytes(path: string, a: EmbeddedAsset): Uint8Array | string {
  if (!a.base64) return a.body;
  let b = decoded.get(path);
  if (!b) {
    const bin = atob(a.body);
    b = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    decoded.set(path, b);
  }
  return b;
}

/** Sert les fichiers embarqués ; repli SPA (index.html) pour tout chemin sans extension. */
export function serveStatic(req: Request, assets: Record<string, EmbeddedAsset>): Response {
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
  let path: string;
  try {
    path = decodeURIComponent(new URL(req.url).pathname);
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  if (path === '/') path = '/index.html';
  let file = assets[path];
  if (!file) {
    const last = path.slice(path.lastIndexOf('/') + 1);
    if (last.includes('.') || path.startsWith('/api/')) return new Response('Not found', { status: 404 });
    path = '/index.html';
    file = assets[path];
    if (!file) return new Response('Not found', { status: 404 });
  }
  const headers = new Headers({
    'content-type': file.type,
    etag: file.etag,
    'cache-control': path.startsWith('/assets/') && !NO_CACHE.has(path) ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  const inm = req.headers.get('if-none-match');
  if (inm && inm.split(',').some((t) => t.trim().replace(/^W\//, '') === file.etag)) return new Response(null, { status: 304, headers });
  return new Response(req.method === 'HEAD' ? null : bytes(path, file), { status: 200, headers });
}
