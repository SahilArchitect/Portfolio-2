import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

declare global {
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set. See .env.example.');
  // `prepare: false` keeps us compatible with transaction-mode poolers (Neon, PgBouncer).
  return postgres(url, { max: process.env.VERCEL ? 1 : 5, prepare: false });
}

// Reuse one client across hot reloads in dev and warm invocations in prod.
const client = globalThis.__pgClient ?? createClient();
if (process.env.NODE_ENV !== 'production') globalThis.__pgClient = client;

export const db = drizzle(client, { schema });
export { schema };
