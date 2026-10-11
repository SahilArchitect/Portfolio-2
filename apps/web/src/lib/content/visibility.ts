import type { Entry } from '@/db/schema';

import { dataSchemas, hasTodo, type ContentType, type DataFor } from './schemas';

export type PublicEntry<T extends ContentType> = {
  id: string;
  slug: string;
  title: string;
  data: DataFor<T>;
  publishedAt: string | null;
  updatedAt: string;
  sortOrder: number;
};

/**
 * The single gate between the database and the public site. An entry is
 * public only if it is published, its scheduled time has passed, it parses
 * against its schema, and nothing in it still says TODO:.
 */
export function toPublic<T extends ContentType>(
  type: T,
  row: Entry,
  now: Date,
): PublicEntry<T> | null {
  if (row.type !== type || row.status !== 'published') return null;
  if (row.publishAt && row.publishAt > now) return null;
  if (hasTodo(row.title) || hasTodo(row.data)) return null;
  const parsed = dataSchemas[type].safeParse(row.data);
  if (!parsed.success) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    data: parsed.data as DataFor<T>,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    sortOrder: row.sortOrder,
  };
}
