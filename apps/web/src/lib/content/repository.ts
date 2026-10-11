import 'server-only';

import { createHash, randomBytes } from 'node:crypto';

import { and, count, desc, eq, gt, inArray, ne, sql } from 'drizzle-orm';

import { db } from '@/db';
import { entries, previewTokens, revisions, slugRedirects, type Entry } from '@/db/schema';
import { slugify, uniqueSlug } from '@/lib/slug';

import { defaultData } from './defaults';
import {
  CONTENT_TYPES,
  STATUSES,
  findTodos,
  publishProblems,
  titleFor,
  validateData,
  type ContentType,
  type Status,
} from './schemas';

export type Snapshot = {
  title: string;
  slug: string;
  status: Status;
  data: Record<string, unknown>;
  publishAt: string | null;
};

export type MutationResult<T = Entry> =
  { ok: true; value: T } | { ok: false; errors: Record<string, string> };

/** Autosaves within this window update the previous autosave revision instead of adding one. */
const AUTOSAVE_COALESCE_MS = 10 * 60 * 1000;

function snapshotOf(entry: Entry): Snapshot {
  return {
    title: entry.title,
    slug: entry.slug,
    status: entry.status as Status,
    data: entry.data,
    publishAt: entry.publishAt?.toISOString() ?? null,
  };
}

async function takenSlugs(type: ContentType, exceptId?: string): Promise<Set<string>> {
  const rows = await db
    .select({ slug: entries.slug })
    .from(entries)
    .where(
      exceptId ? and(eq(entries.type, type), ne(entries.id, exceptId)) : eq(entries.type, type),
    );
  return new Set(rows.map((row) => row.slug));
}

export async function getEntry(id: string): Promise<Entry | null> {
  const [row] = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  return row ?? null;
}

export async function listEntries(type: ContentType, status?: Status) {
  return db
    .select()
    .from(entries)
    .where(
      status ? and(eq(entries.type, type), eq(entries.status, status)) : eq(entries.type, type),
    )
    .orderBy(entries.sortOrder, desc(entries.updatedAt));
}

export async function createEntry(
  type: ContentType,
  data: Record<string, unknown> = defaultData(type),
  options: { slug?: string; status?: Status } = {},
): Promise<MutationResult> {
  const valid = validateData(type, data);
  if (!valid.ok) return valid;
  const title = titleFor(type, valid.data);
  const base = options.slug ?? (type === 'log' ? `log-${Date.now().toString(36)}` : slugify(title));
  const slug = uniqueSlug(base, await takenSlugs(type));
  const status = options.status ?? 'draft';
  const [row] = await db
    .insert(entries)
    .values({
      type,
      slug,
      title,
      status,
      data: valid.data,
      publishedAt: status === 'published' ? new Date() : null,
    })
    .returning();
  if (!row) throw new Error('insert failed');
  await db.insert(revisions).values({ entryId: row.id, kind: 'create', snapshot: snapshotOf(row) });
  return { ok: true, value: row };
}

export type SaveInput = {
  slug: string;
  data: Record<string, unknown>;
  publishAt?: string | null;
};

export async function saveEntry(
  id: string,
  input: SaveInput,
  kind: 'autosave' | 'save' | 'restore' = 'save',
): Promise<MutationResult> {
  const current = await getEntry(id);
  if (!current) return { ok: false, errors: { _: 'Entry not found' } };
  const type = current.type as ContentType;
  const valid = validateData(type, input.data);
  if (!valid.ok) return valid;
  if (current.status === 'published') {
    const problems = publishProblems(type, valid.data as Record<string, unknown>);
    if (problems.length)
      return {
        ok: false,
        errors: { _: `Published entries must stay publishable: ${problems.join('; ')}` },
      };
  }

  const slug = type === 'profile' ? current.slug : input.slug;
  if (slug !== current.slug && (await takenSlugs(type, id)).has(slug)) {
    return { ok: false, errors: { slug: 'Another entry already uses this slug' } };
  }

  const updated = await db.transaction(async (tx) => {
    // Slug-change safety: once an entry has been public, its old URL keeps working.
    if (slug !== current.slug && current.publishedAt) {
      await tx
        .update(slugRedirects)
        .set({ toSlug: slug })
        .where(and(eq(slugRedirects.type, type), eq(slugRedirects.toSlug, current.slug)));
      await tx
        .delete(slugRedirects)
        .where(and(eq(slugRedirects.type, type), eq(slugRedirects.fromSlug, slug)));
      await tx
        .insert(slugRedirects)
        .values({ type, fromSlug: current.slug, toSlug: slug })
        .onConflictDoUpdate({
          target: [slugRedirects.type, slugRedirects.fromSlug],
          set: { toSlug: slug },
        });
    }

    const [row] = await tx
      .update(entries)
      .set({
        slug,
        title: titleFor(type, valid.data),
        data: valid.data,
        publishAt:
          input.publishAt === undefined
            ? current.publishAt
            : input.publishAt
              ? new Date(input.publishAt)
              : null,
        updatedAt: new Date(),
      })
      .where(eq(entries.id, id))
      .returning();
    if (!row) throw new Error('update failed');

    const [last] = await tx
      .select()
      .from(revisions)
      .where(eq(revisions.entryId, id))
      .orderBy(desc(revisions.createdAt))
      .limit(1);
    const coalesce =
      kind === 'autosave' &&
      last?.kind === 'autosave' &&
      Date.now() - last.createdAt.getTime() < AUTOSAVE_COALESCE_MS;
    if (coalesce && last) {
      await tx
        .update(revisions)
        .set({ snapshot: snapshotOf(row), createdAt: new Date() })
        .where(eq(revisions.id, last.id));
    } else {
      await tx.insert(revisions).values({ entryId: id, kind, snapshot: snapshotOf(row) });
    }
    return row;
  });
  return { ok: true, value: updated };
}

export async function setStatus(id: string, status: Status): Promise<MutationResult> {
  const current = await getEntry(id);
  if (!current) return { ok: false, errors: { _: 'Entry not found' } };
  if (!STATUSES.includes(status)) return { ok: false, errors: { _: 'Unknown status' } };
  if (status === 'published') {
    const problems = publishProblems(current.type as ContentType, current.data);
    if (problems.length) return { ok: false, errors: { _: problems.join('; ') } };
  }
  if (current.type === 'profile' && status !== 'published') {
    return { ok: false, errors: { _: 'The site profile is always published' } };
  }
  const [row] = await db
    .update(entries)
    .set({
      status,
      publishedAt:
        status === 'published' ? (current.publishedAt ?? new Date()) : current.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(entries.id, id))
    .returning();
  if (!row) throw new Error('update failed');
  await db.insert(revisions).values({ entryId: id, kind: status, snapshot: snapshotOf(row) });
  return { ok: true, value: row };
}

/** Permanent deletion is only allowed for archived entries (soft delete first). */
export async function deleteEntryPermanently(id: string): Promise<MutationResult<null>> {
  const current = await getEntry(id);
  if (!current) return { ok: false, errors: { _: 'Entry not found' } };
  if (current.status !== 'archived') {
    return { ok: false, errors: { _: 'Archive the entry before deleting it permanently' } };
  }
  await db.delete(entries).where(eq(entries.id, id));
  return { ok: true, value: null };
}

export async function listRevisions(entryId: string) {
  return db
    .select()
    .from(revisions)
    .where(eq(revisions.entryId, entryId))
    .orderBy(desc(revisions.createdAt));
}

export async function restoreRevision(revisionId: string): Promise<MutationResult> {
  const [revision] = await db.select().from(revisions).where(eq(revisions.id, revisionId)).limit(1);
  if (!revision) return { ok: false, errors: { _: 'Revision not found' } };
  const snapshot = revision.snapshot as Snapshot;
  return saveEntry(
    revision.entryId,
    { slug: snapshot.slug, data: snapshot.data, publishAt: snapshot.publishAt },
    'restore',
  );
}

export async function reorderEntries(type: ContentType, orderedIds: string[]) {
  await db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(entries)
        .set({ sortOrder: index })
        .where(and(eq(entries.id, id), eq(entries.type, type)));
    }
  });
}

// --- Preview links ---

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createPreviewToken(entryId: string, days = 7) {
  const token = randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await db.insert(previewTokens).values({ tokenHash: hashToken(token), entryId, expiresAt });
  return { token, expiresAt };
}

export async function entryForPreviewToken(token: string): Promise<Entry | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const [row] = await db
    .select({ entry: entries })
    .from(previewTokens)
    .innerJoin(entries, eq(previewTokens.entryId, entries.id))
    .where(
      and(eq(previewTokens.tokenHash, hashToken(token)), gt(previewTokens.expiresAt, new Date())),
    )
    .limit(1);
  return row?.entry ?? null;
}

export async function revokePreviewTokens(entryId: string) {
  await db.delete(previewTokens).where(eq(previewTokens.entryId, entryId));
}

// --- Dashboard ---

export async function dashboardCounts() {
  const rows = await db
    .select({ type: entries.type, status: entries.status, n: count() })
    .from(entries)
    .groupBy(entries.type, entries.status);
  const result = Object.fromEntries(
    CONTENT_TYPES.map((type) => [type, { draft: 0, published: 0, archived: 0 }]),
  ) as Record<ContentType, Record<Status, number>>;
  for (const row of rows) {
    const bucket = result[row.type as ContentType];
    if (bucket && (STATUSES as readonly string[]).includes(row.status)) {
      bucket[row.status as Status] = Number(row.n);
    }
  }
  return result;
}

export async function recentEdits(limit = 10) {
  return db
    .select({
      id: revisions.id,
      kind: revisions.kind,
      createdAt: revisions.createdAt,
      entryId: entries.id,
      type: entries.type,
      title: entries.title,
    })
    .from(revisions)
    .innerJoin(entries, eq(revisions.entryId, entries.id))
    .orderBy(desc(revisions.createdAt))
    .limit(limit);
}

export async function entriesWithTodos() {
  const rows = await db
    .select()
    .from(entries)
    .where(inArray(entries.status, ['draft', 'published']))
    .orderBy(entries.type, entries.title);
  return rows
    .map((row) => ({ entry: row, fields: findTodos({ title: row.title, ...row.data }) }))
    .filter((item) => item.fields.length > 0);
}

export async function allEntries() {
  return db.select().from(entries).orderBy(entries.type, entries.sortOrder, entries.slug);
}

export async function entryUsingUrl(url: string) {
  return db
    .select({ id: entries.id, type: entries.type, title: entries.title })
    .from(entries)
    .where(sql`${entries.data}::text like ${'%' + url.replace(/[%_]/g, '\\$&') + '%'}`);
}
