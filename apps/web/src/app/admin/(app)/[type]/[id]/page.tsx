import { desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { EntryEditor } from '@/components/admin/EntryEditor';
import { db } from '@/db';
import { assets } from '@/db/schema';
import { getEntry } from '@/lib/content/repository';
import type { ContentType } from '@/lib/content/schemas';
import { requireOwnerPage } from '@/lib/server/owner';

export default async function EditEntry(props: PageProps<'/admin/[type]/[id]'>) {
  await requireOwnerPage();
  const { type, id } = await props.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const entry = await getEntry(id);
  if (!entry || entry.type !== type) notFound();
  const assetRows = await db.select().from(assets).orderBy(desc(assets.createdAt));
  return (
    <EntryEditor
      key={entry.updatedAt.toISOString()}
      initial={{
        id: entry.id,
        type: entry.type as ContentType,
        slug: entry.slug,
        title: entry.title,
        status: entry.status,
        data: entry.data,
        publishAt: entry.publishAt?.toISOString() ?? null,
        publishedAt: entry.publishedAt?.toISOString() ?? null,
        updatedAt: entry.updatedAt.toISOString(),
      }}
      assets={assetRows.map((a) => ({ id: a.id, url: a.url, contentType: a.contentType, altText: a.altText, caption: a.caption }))}
    />
  );
}
