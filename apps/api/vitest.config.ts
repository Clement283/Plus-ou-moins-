import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig(async () => {
  const migrations = await readD1Migrations(new URL('./migrations', import.meta.url).pathname);
  return {
    // Les tests n'utilisent pas le vrai assets.generated.ts (gitignoré, produit au déploiement) : petite fixture.
    resolve: { alias: { './assets.generated': new URL('./test/fixtures/assets.ts', import.meta.url).pathname } },
    test: {
      include: ['test/**/*.test.ts'],
      setupFiles: ['./test/apply-migrations.ts'],
      poolOptions: {
        workers: {
          // Pas de wrangler.toml ici : les tests n'ont pas besoin du dossier d'assets (../web/dist).
          main: './src/index.ts',
          miniflare: {
            compatibilityDate: '2025-09-01',
            d1Databases: ['DB'],
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
