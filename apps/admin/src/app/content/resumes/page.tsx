import { AdminShell } from '@/components/AdminShell';
import { ResumeManager } from '@/components/ResumeManager';
import { adminCollection } from '@/lib/api';
import { fallbackResumeVariants, type ResumeVariantRow } from '@/lib/fallbacks';
import { requireAdmin } from '@/lib/session';

export default async function ResumesPage() {
  const admin = await requireAdmin();
  const variants = await adminCollection<ResumeVariantRow>('/admin/resume-variants', fallbackResumeVariants);
  const normalized = variants.map((variant) => ({
    ...variant,
    role_keywords: Array.isArray(variant.role_keywords) ? variant.role_keywords : [],
  }));

  return (
    <AdminShell
      email={admin.email}
      title="Resume Variants"
      eyebrow="Content"
      description="Upload and tag resume variants so the hire flow can select the right version for each role."
    >
      <ResumeManager variants={normalized} />
    </AdminShell>
  );
}
