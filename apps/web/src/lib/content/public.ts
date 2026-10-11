import 'server-only';

import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';

import { db } from '@/db';
import { assets, cvFiles, entries, slugRedirects } from '@/db/schema';
import { bitflipDataSchema, type BitflipData } from '@/lib/markdown/bitflip';
import type { ImageDims } from '@/lib/markdown/render';
import { storage } from '@/lib/storage';

import { visibleProfile } from './profile';
import { toPublic, type PublicEntry } from './visibility';
import { dataSchemas, type ContentType, type ProfileData } from './schemas';

export { toPublic, type PublicEntry };

/** Every public query carries this tag; every admin mutation invalidates it. */
export const CONTENT_TAG = 'content';

function sortKey(type: ContentType, entry: PublicEntry<ContentType>): string {
  const data = entry.data as Record<string, unknown>;
  const field =
    type === 'note' || type === 'log'
      ? data.date
      : type === 'reproduction'
        ? entry.publishedAt
        : data.startMonth;
  return typeof field === 'string' ? field : '';
}

export async function listPublic<T extends ContentType>(type: T): Promise<PublicEntry<T>[]> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('hours');
  const rows = await db
    .select()
    .from(entries)
    .where(and(eq(entries.type, type), eq(entries.status, 'published')));
  const now = new Date();
  return rows
    .map((row) => toPublic(type, row, now))
    .filter((entry): entry is PublicEntry<T> => entry !== null)
    .sort((a, b) => sortKey(type, b).localeCompare(sortKey(type, a)));
}

export async function getPublic<T extends ContentType>(
  type: T,
  slug: string,
): Promise<PublicEntry<T> | null> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('hours');
  const [row] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.type, type), eq(entries.slug, slug)))
    .limit(1);
  return row ? toPublic(type, row, new Date()) : null;
}

/** Where an old slug now lives, if it was renamed after publishing. */
export async function getSlugRedirect(type: ContentType, slug: string): Promise<string | null> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('hours');
  const [row] = await db
    .select({ to: slugRedirects.toSlug })
    .from(slugRedirects)
    .where(and(eq(slugRedirects.type, type), eq(slugRedirects.fromSlug, slug)))
    .limit(1);
  return row?.to ?? null;
}

export async function getProfile(): Promise<ProfileData | null> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('hours');
  const [row] = await db.select().from(entries).where(eq(entries.type, 'profile')).limit(1);
  if (!row || row.status !== 'published') return null;
  const parsed = dataSchemas.profile.safeParse(row.data);
  return parsed.success ? visibleProfile(parsed.data) : null;
}

export async function getCurrentCv() {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('hours');
  const [row] = await db.select().from(cvFiles).where(eq(cvFiles.isCurrent, true)).limit(1);
  return row ? { url: row.url, label: row.label, uploadedAt: row.uploadedAt.toISOString() } : null;
}

/** Date of the most recent change to anything visible on the public site. */
export async function getLastUpdated(): Promise<string | null> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('hours');
  const rows = await db
    .select()
    .from(entries)
    .where(eq(entries.status, 'published'))
    .orderBy(desc(entries.updatedAt));
  const now = new Date();
  // The profile is always public (its TODO fields are filtered individually), so its edits count.
  const latest = rows.find(
    (row) => row.type === 'profile' || toPublic(row.type as ContentType, row, now) !== null,
  );
  const cv = await getCurrentCv();
  const dates = [latest?.updatedAt.toISOString(), cv?.uploadedAt].filter(
    (d): d is string => typeof d === 'string',
  );
  return dates.sort().at(-1) ?? null;
}

export async function getImageDims(): Promise<ImageDims> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('hours');
  const rows = await db
    .select({ url: assets.url, width: assets.width, height: assets.height })
    .from(assets)
    .where(isNotNull(assets.width));
  const dims: ImageDims = {};
  for (const row of rows) {
    if (row.width && row.height) dims[row.url] = { width: row.width, height: row.height };
  }
  return dims;
}

/**
 * Data for an interactive figure. Only files uploaded through the admin are
 * read (never arbitrary URLs), and anything that fails validation yields
 * null so the figure is simply not rendered.
 */
export async function loadBitflipData(src: string): Promise<BitflipData | null> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('hours');
  const [asset] = await db.select().from(assets).where(eq(assets.url, src)).limit(1);
  if (!asset || asset.contentType !== 'application/json') return null;
  const body = await storage().read(asset.url);
  if (!body) return null;
  try {
    const parsed = bitflipDataSchema.safeParse(JSON.parse(body.toString('utf8')));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Params for generateStaticParams. Cache Components requires at least one,
 * so an empty list becomes a placeholder slug that renders notFound().
 */
export function slugParams(items: { slug: string }[]): { slug: string }[] {
  return items.length ? items.map((item) => ({ slug: item.slug })) : [{ slug: '__none__' }];
}
