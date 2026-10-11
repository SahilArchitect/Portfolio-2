/**
 * Prepares the end-to-end test database: resets it, migrates, seeds, and
 * creates an owner session directly in the database (no GitHub round-trip,
 * and no test-only code path in the app). Writes Playwright storage state.
 *
 * Refuses to run unless DATABASE_URL points at a database whose name ends in "_test".
 */
import 'dotenv/config';

import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test')) {
  throw new Error(`Refusing to reset a non-test database: ${url ?? '(unset)'}`);
}
const allowed = (process.env.ADMIN_ALLOWED_IDENTITY ?? '').replace(/^github:/, '');
if (!/^\d+$/.test(allowed)) throw new Error('ADMIN_ALLOWED_IDENTITY must be set for e2e');

const sql = postgres(url, { max: 1 });
await sql.unsafe(
  'drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;',
);
await sql.end();

execSync('tsx scripts/migrate.ts', { stdio: 'inherit' });
execSync('tsx scripts/seed.ts', { stdio: 'inherit' });

const db = postgres(url, { max: 1 });
const userId = crypto.randomUUID();
const token = randomBytes(32).toString('hex');
await db`insert into "user" (id, name) values (${userId}, 'E2E Owner')`;
await db`insert into account ("userId", type, provider, "providerAccountId") values (${userId}, 'oauth', 'github', ${allowed})`;
await db`insert into session ("sessionToken", "userId", expires) values (${token}, ${userId}, now() + interval '1 day')`;
await db.end();

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3100';
mkdirSync('tests/e2e/.auth', { recursive: true });
writeFileSync(
  'tests/e2e/.auth/owner.json',
  JSON.stringify({
    cookies: [
      {
        name: 'authjs.session-token',
        value: token,
        domain: new URL(baseURL).hostname,
        path: '/',
        expires: Math.floor(Date.now() / 1000) + 86400,
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ],
    origins: [],
  }),
);
console.log('e2e database ready');
