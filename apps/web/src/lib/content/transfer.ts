import 'server-only';

import { and, eq } from 'drizzle-orm';
import JSZip from 'jszip';
import { z } from 'zod';

import { db } from '@/db';
import { assets, cvFiles, entries, revisions, slugRedirects } from '@/db/schema';

import {
  contentTypeSchema,
  flattenIssues,
  slugSchema,
  statusSchema,
  titleFor,
  validateData,
  type ContentType,
} from './schemas';

/**
 * Export/import format (version 1). Uploaded binaries stay in the object
 * store; the export carries their URLs and metadata so content can be
 * restored against the same store.
 */
const isoOrNull = z.string().datetime({ offset: true }).nullable();

export const exportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  entries: z.array(
    z.object({
      type: contentTypeSchema,
      slug: slugSchema,
      status: statusSchema,
      data: z.record(z.string(), z.unknown()),
      sortOrder: z.number().int().default(0),
      publishedAt: isoOrNull.default(null),
      publishAt: isoOrNull.default(null),
    }),
  ),
  assets: z
    .array(
      z.object({
        url: z.string().min(1),
        pathname: z.string().min(1),
        contentType: z.string(),
        size: z.number().int(),
        width: z.number().int().nullable(),
        height: z.number().int().nullable(),
        altText: z.string(),
        caption: z.string().nullable(),
      }),
    )
    .default([]),
  cvFiles: z
    .array(
      z.object({
        url: z.string().min(1),
        pathname: z.string().min(1),
        label: z.string(),
        size: z.number().int(),
        isCurrent: z.boolean(),
        uploadedAt: z.string(),
      }),
    )
    .default([]),
  redirects: z
    .array(z.object({ type: contentTypeSchema, fromSlug: slugSchema, toSlug: slugSchema }))
    .default([]),
});

export type ExportBundle = z.infer<typeof exportSchema>;

export async function buildExport(): Promise<ExportBundle> {
  const [rows, assetRows, cvRows, redirectRows] = await Promise.all([
    db.select().from(entries).orderBy(entries.type, entries.slug),
    db.select().from(assets),
    db.select().from(cvFiles),
    db.select().from(slugRedirects),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: rows.map((row) => ({
      type: row.type as ContentType,
      slug: row.slug,
      status: row.status as 'draft' | 'published' | 'archived',
      data: row.data,
      sortOrder: row.sortOrder,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      publishAt: row.publishAt?.toISOString() ?? null,
    })),
    assets: assetRows.map(
      ({ url, pathname, contentType, size, width, height, altText, caption }) => ({
        url,
        pathname,
        contentType,
        size,
        width,
        height,
        altText,
        caption,
      }),
    ),
    cvFiles: cvRows.map(({ url, pathname, label, size, isCurrent, uploadedAt }) => ({
      url,
      pathname,
      label,
      size,
      isCurrent,
      uploadedAt: uploadedAt.toISOString(),
    })),
    redirects: redirectRows.map(({ type, fromSlug, toSlug }) => ({
      type: type as ContentType,
      fromSlug,
      toSlug,
    })),
  };
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

/** One Markdown file per long-form entry, with YAML front matter, for reading outside the site. */
function toMarkdownFile(entry: ExportBundle['entries'][number]): string | null {
  const data = entry.data as Record<string, unknown>;
  const str = (key: string) => (typeof data[key] === 'string' ? (data[key] as string) : '');
  const front = [
    '---',
    `type: ${entry.type}`,
    `slug: ${entry.slug}`,
    `status: ${entry.status}`,
    `title: ${yamlString(titleFor(entry.type, data))}`,
    ...(Array.isArray(data.tags) ? [`tags: ${JSON.stringify(data.tags)}`] : []),
    '---',
    '',
  ].join('\n');
  if (entry.type === 'note') return `${front}${str('bodyMarkdown')}\n`;
  if (entry.type === 'project') {
    const sections = (data.sections ?? {}) as Record<string, string>;
    const parts = [`${str('summary')}\n`];
    for (const [key, label] of [
      ['threatModel', 'Threat model'],
      ['method', 'Method'],
      ['results', 'Results'],
      ['limitations', 'Limitations'],
      ['nextSteps', 'Next steps'],
      ['reproduce', 'Reproduce'],
    ] as const) {
      if (sections[key]?.trim()) parts.push(`## ${label}\n\n${sections[key]}\n`);
    }
    return `${front}${parts.join('\n')}`;
  }
  if (entry.type === 'reproduction') {
    const rows = Array.isArray(data.rows) ? (data.rows as Record<string, string>[]) : [];
    const table = rows.length
      ? `| Metric | Reported | Mine | Notes |\n|---|---|---|---|\n${rows.map((r) => `| ${r.metric} | ${r.reported} | ${r.mine} | ${r.notes} |`).join('\n')}\n`
      : '';
    return `${front}**Claim:** ${str('claim')}\n\n${table}\n## Differences in setup\n\n${str('setupDifferences')}\n\n## What I learned\n\n${str('lessons')}\n`;
  }
  return null;
}

export async function buildExportZip(bundle: ExportBundle): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file('content.json', JSON.stringify(bundle, null, 2));
  zip.file(
    'README.txt',
    'content.json is the complete export (import it from Admin -> Settings).\nmarkdown/ holds readable copies of notes, projects and reproductions.\nUploaded files are referenced by URL and remain in the object store.\n',
  );
  for (const entry of bundle.entries) {
    const md = toMarkdownFile(entry);
    if (md) zip.file(`markdown/${entry.type}/${entry.slug}.md`, md);
  }
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

export type ImportReport = {
  created: number;
  updated: number;
  assets: number;
  cvFiles: number;
  redirects: number;
};

/** Validates the whole bundle first; writes nothing unless every entry is valid. */
export async function importBundle(
  raw: unknown,
): Promise<{ ok: true; report: ImportReport } | { ok: false; errors: Record<string, string> }> {
  const parsed = exportSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: flattenIssues(parsed.error.issues) };
  const bundle = parsed.data;

  const errors: Record<string, string> = {};
  const validated = bundle.entries.map((entry, index) => {
    const result = validateData(entry.type, entry.data);
    if (!result.ok) {
      for (const [key, message] of Object.entries(result.errors)) {
        errors[`entries[${index}] ${entry.type}/${entry.slug}: ${key}`] = message;
      }
      return null;
    }
    return { ...entry, data: result.data as Record<string, unknown> };
  });
  if (Object.keys(errors).length) return { ok: false, errors };
  if (bundle.cvFiles.filter((cv) => cv.isCurrent).length > 1) {
    return { ok: false, errors: { cvFiles: 'At most one CV can be current' } };
  }

  const report: ImportReport = { created: 0, updated: 0, assets: 0, cvFiles: 0, redirects: 0 };
  await db.transaction(async (tx) => {
    for (const entry of validated) {
      if (!entry) continue;
      const values = {
        title: titleFor(entry.type, entry.data),
        status: entry.status,
        data: entry.data,
        sortOrder: entry.sortOrder,
        publishedAt: entry.publishedAt ? new Date(entry.publishedAt) : null,
        publishAt: entry.publishAt ? new Date(entry.publishAt) : null,
      };
      const [existing] = await tx
        .select({ id: entries.id })
        .from(entries)
        .where(and(eq(entries.type, entry.type), eq(entries.slug, entry.slug)))
        .limit(1);
      const [row] = existing
        ? await tx
            .update(entries)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(entries.id, existing.id))
            .returning()
        : await tx
            .insert(entries)
            .values({ ...values, type: entry.type, slug: entry.slug })
            .returning();
      if (!row) continue;
      await tx.insert(revisions).values({
        entryId: row.id,
        kind: 'import',
        snapshot: {
          title: row.title,
          slug: row.slug,
          status: row.status,
          data: row.data,
          publishAt: entry.publishAt,
        },
      });
      if (existing) report.updated += 1;
      else report.created += 1;
    }
    for (const asset of bundle.assets) {
      await tx
        .insert(assets)
        .values(asset)
        .onConflictDoUpdate({
          target: assets.url,
          set: {
            altText: asset.altText,
            caption: asset.caption,
            width: asset.width,
            height: asset.height,
          },
        });
      report.assets += 1;
    }
    if (bundle.cvFiles.some((cv) => cv.isCurrent)) {
      await tx.update(cvFiles).set({ isCurrent: false });
    }
    for (const cv of bundle.cvFiles) {
      const [existing] = await tx
        .select({ id: cvFiles.id })
        .from(cvFiles)
        .where(eq(cvFiles.url, cv.url))
        .limit(1);
      const values = { ...cv, uploadedAt: new Date(cv.uploadedAt) };
      if (existing) await tx.update(cvFiles).set(values).where(eq(cvFiles.id, existing.id));
      else await tx.insert(cvFiles).values(values);
      report.cvFiles += 1;
    }
    for (const redirect of bundle.redirects) {
      await tx
        .insert(slugRedirects)
        .values(redirect)
        .onConflictDoUpdate({
          target: [slugRedirects.type, slugRedirects.fromSlug],
          set: { toSlug: redirect.toSlug },
        });
      report.redirects += 1;
    }
  });
  return { ok: true, report };
}
