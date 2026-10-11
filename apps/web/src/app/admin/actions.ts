'use server';

import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { signOut } from '@/auth';
import { db } from '@/db';
import { assets, cvFiles, sessions } from '@/db/schema';
import { CONTENT_TAG } from '@/lib/content/public';
import * as repo from '@/lib/content/repository';
import { contentTypeSchema, entryInputSchema, statusSchema, type ContentType } from '@/lib/content/schemas';
import { importBundle } from '@/lib/content/transfer';
import { bitflipDataSchema, type BitflipData } from '@/lib/markdown/bitflip';
import { renderMarkdown, type RenderBlock } from '@/lib/markdown/render';
import { getImageDims } from '@/lib/content/public';
import { requireOwner } from '@/lib/server/owner';
import { rateLimit } from '@/lib/server/rate-limit';
import { SITE_URL } from '@/lib/site';
import { randomObjectName, storage } from '@/lib/storage';
import { sniffUpload } from '@/lib/upload-validation';

export type ActionResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; errors: Record<string, string> };

/** Owner check + per-owner rate limit for every mutation. */
async function guard(): Promise<string> {
  const owner = await requireOwner();
  if (!(await rateLimit(`mutation:${owner}`, 600, 60))) {
    throw new Error('Too many requests; slow down for a minute.');
  }
  return owner;
}

function fail(message: string): { ok: false; errors: Record<string, string> } {
  return { ok: false, errors: { _: message } };
}

export type EntryState = {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  status: string;
  data: Record<string, unknown>;
  publishAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

function toState(entry: NonNullable<Awaited<ReturnType<typeof repo.getEntry>>>): EntryState {
  return {
    id: entry.id,
    type: entry.type as ContentType,
    slug: entry.slug,
    title: entry.title,
    status: entry.status,
    data: entry.data,
    publishAt: entry.publishAt?.toISOString() ?? null,
    publishedAt: entry.publishedAt?.toISOString() ?? null,
    updatedAt: entry.updatedAt.toISOString(),
  };
}

// --- Entries ---

export async function createEntryAction(type: string): Promise<void> {
  await guard();
  const parsed = contentTypeSchema.safeParse(type);
  if (!parsed.success || parsed.data === 'profile') throw new Error('Unknown content type');
  const result = await repo.createEntry(parsed.data);
  if (!result.ok) throw new Error(Object.values(result.errors).join('; '));
  redirect(`/admin/${parsed.data}/${result.value.id}`);
}

export async function saveEntryAction(
  id: string,
  input: unknown,
  kind: 'autosave' | 'save' = 'save',
): Promise<ActionResult<EntryState>> {
  await guard();
  const parsed = entryInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  const result = await repo.saveEntry(id, { slug: parsed.data.slug, data: parsed.data.data, publishAt: parsed.data.publishAt }, kind);
  if (!result.ok) return result;
  updateTag(CONTENT_TAG);
  return { ok: true, value: toState(result.value) };
}

export async function setStatusAction(id: string, status: string): Promise<ActionResult<EntryState>> {
  await guard();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return fail('Unknown status');
  const result = await repo.setStatus(id, parsed.data);
  if (!result.ok) return result;
  updateTag(CONTENT_TAG);
  return { ok: true, value: toState(result.value) };
}

export async function deleteEntryAction(id: string, type: string): Promise<ActionResult> {
  await guard();
  const result = await repo.deleteEntryPermanently(id);
  if (!result.ok) return result;
  updateTag(CONTENT_TAG);
  redirect(`/admin/${contentTypeSchema.parse(type)}`);
}

export async function restoreRevisionAction(revisionId: string): Promise<ActionResult<EntryState>> {
  await guard();
  const result = await repo.restoreRevision(revisionId);
  if (!result.ok) return result;
  updateTag(CONTENT_TAG);
  return { ok: true, value: toState(result.value) };
}

export async function reorderAction(type: string, ids: string[]): Promise<ActionResult> {
  await guard();
  const parsed = contentTypeSchema.safeParse(type);
  if (!parsed.success || !Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) return fail('Invalid order');
  await repo.reorderEntries(parsed.data, ids);
  updateTag(CONTENT_TAG);
  return { ok: true, value: undefined };
}

export async function createPreviewLinkAction(id: string, days = 7): Promise<ActionResult<{ url: string; expiresAt: string }>> {
  await guard();
  const entry = await repo.getEntry(id);
  if (!entry || !['project', 'note', 'reproduction'].includes(entry.type)) return fail('Previews exist for projects, notes and reproductions');
  const { token, expiresAt } = await repo.createPreviewToken(id, Math.min(30, Math.max(1, days)));
  const host = (await headers()).get('host');
  const origin = host ? `${host.startsWith('localhost') ? 'http' : 'https'}://${host}` : SITE_URL;
  return { ok: true, value: { url: `${origin}/preview/${token}`, expiresAt: expiresAt.toISOString() } };
}

export async function revokePreviewLinksAction(id: string): Promise<ActionResult> {
  await guard();
  await repo.revokePreviewTokens(id);
  return { ok: true, value: undefined };
}

// --- Markdown preview (same renderer as the public site) ---

export async function previewMarkdownAction(
  source: string,
  headingOffset = 1,
): Promise<{ blocks: RenderBlock[]; figures: Record<string, BitflipData | null> }> {
  await requireOwner();
  if (typeof source !== 'string' || source.length > 200_000) return { blocks: [], figures: {} };
  const { blocks } = await renderMarkdown(source, { headingOffset, imageDims: await getImageDims() });
  // Read figure data straight from the store (uncached) so a just-uploaded file previews immediately.
  const figures: Record<string, BitflipData | null> = {};
  for (const block of blocks) {
    if (block.kind !== 'figure' || block.figure.data in figures) continue;
    const [asset] = await db.select().from(assets).where(eq(assets.url, block.figure.data)).limit(1);
    const body = asset?.contentType === 'application/json' ? await storage().read(asset.url) : null;
    let data: BitflipData | null = null;
    try {
      const parsed = body ? bitflipDataSchema.safeParse(JSON.parse(body.toString('utf8'))) : null;
      data = parsed?.success ? parsed.data : null;
    } catch {
      data = null;
    }
    figures[block.figure.data] = data;
  }
  return { blocks, figures };
}

// --- Assets ---

export type AssetState = { id: string; url: string; contentType: string; width: number | null; height: number | null; altText: string; caption: string | null };

export async function uploadAssetAction(formData: FormData): Promise<ActionResult<AssetState>> {
  await guard();
  const file = formData.get('file');
  const altText = String(formData.get('altText') ?? '').trim();
  const caption = String(formData.get('caption') ?? '').trim();
  if (!(file instanceof File)) return fail('No file received');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffUpload(bytes, ['png', 'jpg', 'webp', 'pdf', 'json']);
  if (!sniffed.ok) return fail(sniffed.error);
  if (sniffed.contentType.startsWith('image/') && !altText) {
    return { ok: false, errors: { altText: 'Alt text is required for images' } };
  }
  if (sniffed.extension === 'json') {
    const parsed = bitflipDataSchema.safeParse(JSON.parse(new TextDecoder().decode(bytes)));
    if (!parsed.success) return fail(`JSON does not match the figure format: ${parsed.error.issues[0]?.message ?? 'invalid'}`);
  }
  const stored = await storage().put(randomObjectName('uploads', sniffed.extension), Buffer.from(bytes), sniffed.contentType);
  const [row] = await db
    .insert(assets)
    .values({
      url: stored.url,
      pathname: stored.pathname,
      contentType: sniffed.contentType,
      size: bytes.byteLength,
      width: sniffed.width ?? null,
      height: sniffed.height ?? null,
      altText,
      caption: caption || null,
    })
    .returning();
  if (!row) return fail('Could not save the asset');
  updateTag(CONTENT_TAG);
  return {
    ok: true,
    value: { id: row.id, url: row.url, contentType: row.contentType, width: row.width, height: row.height, altText: row.altText, caption: row.caption },
  };
}

export async function updateAssetAction(id: string, altText: string, caption: string): Promise<ActionResult> {
  await guard();
  const [row] = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  if (!row) return fail('Asset not found');
  if (row.contentType.startsWith('image/') && !altText.trim()) return { ok: false, errors: { altText: 'Alt text is required' } };
  await db.update(assets).set({ altText: altText.trim().slice(0, 500), caption: caption.trim().slice(0, 500) || null }).where(eq(assets.id, id));
  updateTag(CONTENT_TAG);
  return { ok: true, value: undefined };
}

export async function deleteAssetAction(id: string): Promise<ActionResult> {
  await guard();
  const [row] = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  if (!row) return fail('Asset not found');
  const usedIn = await repo.entryUsingUrl(row.url);
  if (usedIn.length) return fail(`Still used in: ${usedIn.map((u) => u.title).join(', ')}`);
  await storage().delete(row.pathname);
  await db.delete(assets).where(eq(assets.id, id));
  updateTag(CONTENT_TAG);
  return { ok: true, value: undefined };
}

// --- CV files ---

export async function uploadCvAction(formData: FormData): Promise<ActionResult> {
  await guard();
  const file = formData.get('file');
  const label = String(formData.get('label') ?? '').trim().slice(0, 120);
  if (!(file instanceof File)) return fail('No file received');
  if (!label) return { ok: false, errors: { label: 'Give this version a label' } };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffUpload(bytes, ['pdf']);
  if (!sniffed.ok) return fail(sniffed.error);
  const stored = await storage().put(randomObjectName('cv', 'pdf'), Buffer.from(bytes), 'application/pdf');
  await db.transaction(async (tx) => {
    await tx.update(cvFiles).set({ isCurrent: false }).where(eq(cvFiles.isCurrent, true));
    await tx.insert(cvFiles).values({ url: stored.url, pathname: stored.pathname, label, size: bytes.byteLength, isCurrent: true });
  });
  updateTag(CONTENT_TAG);
  return { ok: true, value: undefined };
}

export async function setCurrentCvAction(id: string): Promise<ActionResult> {
  await guard();
  await db.transaction(async (tx) => {
    await tx.update(cvFiles).set({ isCurrent: false }).where(eq(cvFiles.isCurrent, true));
    await tx.update(cvFiles).set({ isCurrent: true }).where(eq(cvFiles.id, id));
  });
  updateTag(CONTENT_TAG);
  return { ok: true, value: undefined };
}

export async function deleteCvAction(id: string): Promise<ActionResult> {
  await guard();
  const [row] = await db.select().from(cvFiles).where(eq(cvFiles.id, id)).limit(1);
  if (!row) return fail('CV not found');
  if (row.isCurrent) return fail('Make another version current before deleting this one');
  await storage().delete(row.pathname);
  await db.delete(cvFiles).where(eq(cvFiles.id, id));
  return { ok: true, value: undefined };
}

// --- Import / sessions ---

export async function importAction(formData: FormData): Promise<ActionResult<string>> {
  await guard();
  const file = formData.get('file');
  if (!(file instanceof File)) return fail('No file received');
  if (file.size > 4 * 1024 * 1024) return fail('Import file must be 4 MB or smaller');
  let raw: unknown;
  try {
    raw = JSON.parse(await file.text());
  } catch {
    return fail('The file is not valid JSON (use content.json from an export)');
  }
  const result = await importBundle(raw);
  if (!result.ok) return result;
  updateTag(CONTENT_TAG);
  const r = result.report;
  return { ok: true, value: `Imported: ${r.created} new, ${r.updated} updated entries; ${r.assets} assets; ${r.cvFiles} CV files; ${r.redirects} redirects.` };
}

/** Revokes every session (all devices), including this one. */
export async function logoutEverywhereAction(): Promise<void> {
  await requireOwner();
  await db.delete(sessions);
  redirect('/admin/login');
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/admin/login' });
}
