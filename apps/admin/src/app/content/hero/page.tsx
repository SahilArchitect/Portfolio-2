import { AdminShell } from '@/components/AdminShell';
import { HeroManager } from '@/components/HeroManager';
import { adminGet } from '@/lib/api';
import { fallbackHeroVariants, type HeroVariant } from '@/lib/fallbacks';
import { requireAdmin } from '@/lib/session';

export default async function HeroPage() {
  const admin = await requireAdmin();
  const variants = await adminGet<HeroVariant[]>('/admin/hero', fallbackHeroVariants);

  return (
    <AdminShell
      email={admin.email}
      title="Hero A/B Test"
      eyebrow="Content"
      description="Edit the public positioning sentence and monitor the 50/50 experiment results."
    >
      <HeroManager variants={variants} />
    </AdminShell>
  );
}
