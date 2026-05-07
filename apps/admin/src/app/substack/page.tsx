import { AdminShell } from '@/components/AdminShell';
import { SubstackManager } from '@/components/SubstackManager';
import { adminGet } from '@/lib/api';
import { fallbackSubstack, type SubstackState } from '@/lib/fallbacks';
import { requireAdmin } from '@/lib/session';

export default async function SubstackPage() {
  const admin = await requireAdmin();
  const state = await adminGet<SubstackState>('/admin/substack', fallbackSubstack);

  return (
    <AdminShell
      email={admin.email}
      title="Substack Ingestion"
      eyebrow="Operations"
      description="Control RSS ingestion, embedding settings, and manual worker re-syncs without exposing worker HTTP."
    >
      <SubstackManager state={state} />
    </AdminShell>
  );
}
