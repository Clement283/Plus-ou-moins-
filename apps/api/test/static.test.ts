import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

describe('embedded static files', () => {
  it('/ serves index.html as text/html, no-cache', async () => {
    const res = await SELF.fetch('https://x/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(res.headers.get('cache-control')).toBe('no-cache');
    expect(await res.text()).toContain('<title>PWA</title>');
  });
  it('hashed asset is cached long', async () => {
    const res = await SELF.fetch('https://x/assets/index-abc12345.js');
    expect(res.headers.get('content-type')).toContain('text/javascript');
    expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
  });
  it('sw.js n\'est pas mis en cache', async () => {
    expect((await SELF.fetch('https://x/sw.js')).headers.get('cache-control')).toBe('no-cache');
  });
  it('binary decoded from base64', async () => {
    const res = await SELF.fetch('https://x/icons/icon.png');
    expect(res.headers.get('content-type')).toBe('image/png');
    expect([...new Uint8Array(await res.arrayBuffer())].slice(1, 4)).toEqual([0x50, 0x4e, 0x47]);
  });
  it('/cours/c04 falls back to index.html (SPA)', async () => {
    const res = await SELF.fetch('https://x/cours/c04');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });
  it('unknown file with extension is 404', async () => {
    expect((await SELF.fetch('https://x/nope.png')).status).toBe(404);
  });
  it('ETag with If-None-Match gives 304', async () => {
    const first = await SELF.fetch('https://x/assets/index-abc12345.js');
    const etag = first.headers.get('etag')!;
    await first.arrayBuffer();
    const res = await SELF.fetch('https://x/assets/index-abc12345.js', { headers: { 'if-none-match': etag } });
    expect(res.status).toBe(304);
  });
  it('HEAD supported without body', async () => {
    const res = await SELF.fetch('https://x/', { method: 'HEAD' });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('');
  });
  it('/api inconnu stays a JSON 404', async () => {
    const res = await SELF.fetch('https://x/api/nope');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not found' });
  });
});
