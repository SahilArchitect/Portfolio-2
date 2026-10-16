import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { entries } from '@/db/schema';
import { getOwnerId, requireOwner } from '@/lib/server/owner';
import { rateLimit } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
const TYPE = 'private-phd-atlas';
const SLUG = 'owner-2027';
const privateHeaders = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive' };
const empty = { progress: {}, custom: [], reviewedAt: null };

export async function GET() {
  const owner = await getOwnerId();
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders });
  const [row] = await db.select({ data: entries.data }).from(entries)
    .where(and(eq(entries.type, TYPE), eq(entries.slug, SLUG))).limit(1);
  return NextResponse.json({ state: row?.data ?? empty }, { headers: privateHeaders });
}

export async function POST(request: Request) {
  const owner = await requireOwner().catch(() => null);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders });
  if (!(await rateLimit(`phd-atlas:${owner}`, 120, 60)))
    return NextResponse.json({ error: 'Too many saves' }, { status: 429, headers: privateHeaders });
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host || (() => { try { return new URL(origin).host !== host; } catch { return true; } })())
    return NextResponse.json({ error: 'Cross origin not allowed' }, { status: 403, headers: privateHeaders });
  const raw = await request.text();
  if (raw.length > 512_000) return NextResponse.json({ error: 'Payload too large' }, { status: 413, headers: privateHeaders });
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: privateHeaders });
  }
  if (!payload || typeof payload !== 'object' || !('state' in payload))
    return NextResponse.json({ error: 'Missing state' }, { status: 400, headers: privateHeaders });
  const state: unknown = (payload as { state: unknown }).state;
  if (!state || typeof state !== 'object' || Array.isArray(state))
    return NextResponse.json({ error: 'Invalid state' }, { status: 400, headers: privateHeaders });
  const value = state as Record<string, unknown>;
  if (!value.progress || typeof value.progress !== 'object' || Array.isArray(value.progress) ||
      !Array.isArray(value.custom) || value.custom.length > 1000 ||
      (value.reviewedAt !== null && value.reviewedAt !== undefined && typeof value.reviewedAt !== 'string'))
    return NextResponse.json({ error: 'Malformed state' }, { status: 400, headers: privateHeaders });
  const data = { progress: value.progress, custom: value.custom, reviewedAt: value.reviewedAt ?? null };
  await db.insert(entries).values({
    type: TYPE, slug: SLUG, title: 'Private PhD Atlas state',
    status: 'draft', data
  }).onConflictDoUpdate({
    target: [entries.type, entries.slug],
    set: { data, updatedAt: new Date() }
  });
  return NextResponse.json({ ok: true }, { headers: privateHeaders });
}
