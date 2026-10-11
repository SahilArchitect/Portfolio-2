import { desc } from 'drizzle-orm';

import { AssetManager } from '@/components/admin/AssetManager';
import { db } from '@/db';
import { assets, entries } from '@/db/schema';
import { requireOwnerPage } from '@/lib/server/owner';

export const metadata = { title: 'Assets' };

export default async function AssetsPage() {
  await requireOwnerPage();
  const [rows, all] = await Promise.all([
    db.select().from(assets).orderBy(desc(assets.createdAt)),
    db.select({ title: entries.title, data: entries.data }).from(entries),
  ]);
  const haystack = all.map((e) => ({ title: e.title, text: JSON.stringify(e.data) }));
  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold">Assets</h1>
      <p className="mt-1 text-sm text-muted">
        Figures, write-up PDFs and figure data. File names are randomised; SVG is not accepted. A figure JSON looks like{' '}
        <code className="font-mono text-xs">{'{ "series": [{ "name": "random", "points": [[0, 0.93], [10, 0.71]] }] }'}</code>.
      </p>
      <div className="mt-4">
        <AssetManager
          assets={rows.map((a) => ({
            id: a.id,
            url: a.url,
            contentType: a.contentType,
            size: a.size,
            width: a.width,
            height: a.height,
            altText: a.altText,
            caption: a.caption,
            usedIn: haystack.filter((h) => h.text.includes(a.url)).map((h) => h.title),
          }))}
        />
      </div>
    </div>
  );
}
