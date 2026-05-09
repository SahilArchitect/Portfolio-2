import { AdminShell, Panel, SectionTitle } from '@/components/AdminShell';
import { AdminConsolePulse } from '@/components/AdminMotionSurfaces';
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

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function arrayValue<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeAnalytics(value: unknown): AnalyticsState {
  const data = record(value);
  return {
    pageViews: arrayValue(data.pageViews ?? data.page_views, fallbackAnalytics.pageViews),
    searchQueries: arrayValue(
      data.searchQueries ?? data.search_queries,
      fallbackAnalytics.searchQueries,
    ),
    funnel: arrayValue(data.funnel ?? data.drop_off_funnel, fallbackAnalytics.funnel),
  };
}

function normalizeLlmCost(value: unknown): LlmCostState {
  const data = record(value);
  const perDay = data.spendByDay ?? data.per_day;
  const perEndpoint = data.spendByEndpoint ?? data.per_endpoint;
  const histogram = data.tokenHistogram ?? data.token_histogram;

  return {
    spendByDay: Array.isArray(perDay)
      ? perDay
      : Object.entries(record(perDay)).map(([date, cost]) => ({
          date,
          cost_usd: Number(cost) || 0,
          calls: 0,
        })),
    spendByEndpoint: Array.isArray(perEndpoint)
      ? perEndpoint
      : Object.entries(record(perEndpoint)).map(([endpoint, cost]) => ({
          endpoint,
          cost_usd: Number(cost) || 0,
          tokens: 0,
        })),
    tokenHistogram: Array.isArray(histogram)
      ? histogram
      : Object.entries(record(histogram)).map(([bucket, calls]) => ({
          bucket,
          calls: Number(calls) || 0,
        })),
    slowestCalls: arrayValue(data.slowestCalls ?? data.slowest_20, fallbackLlmCost.slowestCalls),
  };
}

export default async function AdminHome() {
  const admin = await requireAdmin();
  const analytics = normalizeAnalytics(
    await adminGet<unknown>('/admin/analytics', fallbackAnalytics),
  );
  const llm = normalizeLlmCost(await adminGet<unknown>('/admin/llm/cost', fallbackLlmCost));
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

      <AdminConsolePulse />

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <Panel>
          <SectionTitle
            title="LLM spend trend"
            detail="Per-day cost and call volume from /admin/llm/cost."
          />
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
