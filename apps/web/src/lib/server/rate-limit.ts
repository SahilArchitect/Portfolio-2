import 'server-only';

import { sql } from 'drizzle-orm';

import { db } from '@/db';

/**
 * Fixed-window counter stored in Postgres, so limits hold across serverless
 * instances. Returns false once `limit` hits within `windowSeconds`.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const rows = await db.execute<{ count: number }>(sql`
    insert into rate_limits (key, count, reset_at)
    values (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
    on conflict (key) do update set
      count = case when rate_limits.reset_at < now() then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at < now()
        then now() + make_interval(secs => ${windowSeconds}) else rate_limits.reset_at end
    returning count
  `);
  const count = Number(rows[0]?.count ?? 0);
  return count <= limit;
}

export function clientIp(headers: Headers): string {
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}
