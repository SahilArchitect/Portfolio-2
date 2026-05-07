import { AdminShell, Panel, SectionTitle } from '@/components/AdminShell';
import { FunnelChart, PageViewsChart } from '@/components/Charts';
import { SearchQueriesTable } from '@/components/SearchQueriesTable';
import { TopPagesTable } from '@/components/TopPagesTable';
import { adminGet } from '@/lib/api';
import { fallbackAnalytics, type AnalyticsState } from '@/lib/fallbacks';
import { requireAdmin } from '@/lib/session';

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
    searchQueries: arrayValue(data.searchQueries ?? data.search_queries, fallbackAnalytics.searchQueries),
    funnel: arrayValue(data.funnel ?? data.drop_off_funnel, fallbackAnalytics.funnel),
  };
}

export default async function AnalyticsPage() {
  const admin = await requireAdmin();
  const analytics = normalizeAnalytics(await adminGet<unknown>('/admin/analytics', fallbackAnalytics));

  return (
    <AdminShell
      email={admin.email}
      title="Analytics"
      eyebrow="Operations"
      description="Privacy-respecting aggregate analytics: page views, anonymized search queries, and funnel health."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <SectionTitle title="Page views" />
          <PageViewsChart data={analytics.pageViews} />
        </Panel>
        <Panel>
          <SectionTitle title="Drop-off funnel" />
          <FunnelChart data={analytics.funnel} />
        </Panel>
        <Panel>
          <SectionTitle title="Top pages" />
          <TopPagesTable data={analytics.pageViews} />
        </Panel>
        <Panel>
          <SectionTitle title="Search queries" detail="Stored without personal identifiers." />
          <SearchQueriesTable queries={analytics.searchQueries} />
        </Panel>
      </div>
    </AdminShell>
  );
}
