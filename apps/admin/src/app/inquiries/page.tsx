import { AdminShell } from '@/components/AdminShell';
import { InquiryInbox } from '@/components/InquiryInbox';
import { adminCollection } from '@/lib/api';
import { fallbackInquiries, type InquiryRow } from '@/lib/fallbacks';
import { requireAdmin } from '@/lib/session';

export default async function InquiriesPage() {
  const admin = await requireAdmin();
  const inquiries = await adminCollection<InquiryRow>('/admin/inquiries', fallbackInquiries);

  return (
    <AdminShell
      email={admin.email}
      title="Inquiries"
      eyebrow="Operations"
      description="LLM-triaged contact inbox sorted by priority, with status transitions and mailto replies."
    >
      <InquiryInbox inquiries={inquiries} />
    </AdminShell>
  );
}
