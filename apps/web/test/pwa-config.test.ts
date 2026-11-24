// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { build } from 'vite';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

describe('service worker généré', () => {
  it('prend la main seul (skipWaiting + clientsClaim), même sans registerSW injecté dans index.html', async () => {
    const out = mkdtempSync(join(tmpdir(), 'pwa-'));
    try {
      await build({ configFile: resolve(__dirname, '../vite.config.ts'), logLevel: 'silent', build: { outDir: out, emptyOutDir: true } });
      const sw = readFileSync(join(out, 'sw.js'), 'utf8');
      expect(sw).toMatch(/skipWaiting\(\)/);
      expect(sw).toMatch(/clientsClaim\(\)/);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 120000);
});
