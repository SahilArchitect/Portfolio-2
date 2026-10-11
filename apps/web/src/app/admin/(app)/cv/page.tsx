import { desc } from 'drizzle-orm';

import { CvManager } from '@/components/admin/CvManager';
import { db } from '@/db';
import { cvFiles } from '@/db/schema';
import { requireOwnerPage } from '@/lib/server/owner';

export const metadata = { title: 'CV files' };

export default async function CvFilesPage() {
  await requireOwnerPage();
  const rows = await db.select().from(cvFiles).orderBy(desc(cvFiles.uploadedAt));
  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">CV files</h1>
      <p className="mt-1 text-sm text-muted">Only the current version is linked publicly. Earlier versions are kept here.</p>
      <div className="mt-4">
        <CvManager files={rows.map((r) => ({ id: r.id, url: r.url, label: r.label, size: r.size, isCurrent: r.isCurrent, uploadedAt: r.uploadedAt.toISOString() }))} />
      </div>
    </div>
  );
}
