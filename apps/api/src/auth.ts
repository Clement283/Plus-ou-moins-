import type { Context, MiddlewareHandler } from 'hono';

export type Role = 'eleve' | 'suiveur';
export type AuthUser = { id: string; name: string; role: Role };
export type Env = { DB: D1Database; ASSETS?: Fetcher };
export type AppEnv = { Bindings: Env; Variables: { user: AuthUser } };

export async function sha256Hex(s: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Un jeton valide (haché en base) donne l'utilisateur ; sinon 401. Les jetons n'expirent pas. */
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const m = /^Bearer (\S+)$/.exec(c.req.header('authorization') ?? '');
  if (!m || !m[1]) return c.json({ error: 'unauthorized' }, 401);
  const row = await c.env.DB.prepare(
    'SELECT u.id, u.name, u.role FROM tokens t JOIN users u ON u.id = t.user_id WHERE t.token_hash = ?',
  )
    .bind(await sha256Hex(m[1]))
    .first<AuthUser>();
  if (!row) return c.json({ error: 'unauthorized' }, 401);
  c.set('user', row);
  await next();
};

export function requireRole(c: Context<AppEnv>, role: Role): boolean {
  return c.get('user').role === role;
}
