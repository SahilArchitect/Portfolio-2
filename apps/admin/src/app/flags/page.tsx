import { AdminShell } from '@/components/AdminShell';
import { FlagsManager } from '@/components/FlagsManager';
import { adminCollection } from '@/lib/api';
import { fallbackFlags, type FeatureFlagRow } from '@/lib/fallbacks';
import { requireAdmin } from '@/lib/session';

export default async function FlagsPage() {
  const admin = await requireAdmin();
  const flags = await adminCollection<FeatureFlagRow>('/admin/flags', fallbackFlags);

  return (
    <AdminShell
      email={admin.email}
      title="Feature Flags"
      eyebrow="Operations"
      description="Server-side toggles consumed by the public app through the flags API."
    >
      <FlagsManager flags={flags} />
    </AdminShell>
  );
}
