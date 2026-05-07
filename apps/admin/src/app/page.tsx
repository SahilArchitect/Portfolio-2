import { AdminShell, Panel, SectionTitle } from '@/components/AdminShell';
import { SpendLineChart } from '@/components/Charts';
import { TopPagesTable } from '@/components/TopPagesTable';
import { StatCard } from '@/components/StatCard';
import { adminCollection, adminGet } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { requireAdmin } from '@/lib/session';
import {
  fallbackAnalytics,
  fallbackInquiries,
  fallbackLlmCost,
  type AnalyticsState,
  type InquiryRow,
  type LlmCostState,
} from '@/lib/fallbacks';

export default async function AdminHome() {
  const admin = await requireAdmin();
  const analytics = await adminGet<AnalyticsState>('/admin/analytics', fallbackAnalytics);
  const llm = await adminGet<LlmCostState>('/admin/llm/cost', fallbackLlmCost);
  const inquiries = await adminCollection<InquiryRow>('/admin/inquiries', fallbackInquiries);

  const visitorsToday = analytics.pageViews.reduce((sum, page) => sum + page.visitors, 0);
  const ragQueries = analytics.searchQueries.reduce((sum, query) => sum + query.count, 0);
  const llmCostMtd = llm.spendByDay.reduce((sum, day) => sum + day.cost_usd, 0);
  const inquiriesPending = inquiries.filter((inquiry) => inquiry.status === 'new').length;

  return (
    <AdminShell
      email={admin.email}
      title="Dashboard"
      description="Operational snapshot for content, RAG usage, LLM spend, and hiring inbox health."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Visitors today" value={visitorsToday} />
        <StatCard label="Top pages" value={analytics.pageViews.length} />
        <StatCard label="RAG queries" value={ragQueries} />
        <StatCard label="LLM cost MTD" value={formatCurrency(llmCostMtd)} />
        <StatCard label="Inquiries pending" value={inquiriesPending} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <Panel>
          <SectionTitle title="LLM spend trend" detail="Per-day cost and call volume from /admin/llm/cost." />
          <SpendLineChart data={llm.spendByDay} />
        </Panel>
        <Panel>
          <SectionTitle title="Top pages" detail="Privacy-preserving aggregate analytics." />
          <TopPagesTable data={analytics.pageViews} />
        </Panel>
      </div>
    </AdminShell>
  );
}
