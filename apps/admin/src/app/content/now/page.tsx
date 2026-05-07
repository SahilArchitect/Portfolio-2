import { AdminShell } from '@/components/AdminShell';
import { NowManager } from '@/components/NowManager';
import { adminCollection } from '@/lib/api';
import { fallbackNowEntries, type NowEntryRow } from '@/lib/fallbacks';
import { requireAdmin } from '@/lib/session';

export default async function NowPage() {
  const admin = await requireAdmin();
  const entries = await adminCollection<NowEntryRow>('/admin/now-entries', fallbackNowEntries);

  return (
    <AdminShell
      email={admin.email}
      title="Now Entries"
      eyebrow="Content"
      description="Maintain the reverse-chron now log and enforce the single current entry contract."
    >
      <NowManager entries={entries} />
    </AdminShell>
  );
}
