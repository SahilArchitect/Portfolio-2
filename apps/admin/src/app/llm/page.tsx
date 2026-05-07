import { AdminShell, Panel, SectionTitle } from '@/components/AdminShell';
import { EndpointBarChart, SpendLineChart, TokenHistogram } from '@/components/Charts';
import { SlowCallsTable } from '@/components/SlowCallsTable';
import { StatCard } from '@/components/StatCard';
import { adminGet } from '@/lib/api';
import { fallbackLlmCost, type LlmCostState } from '@/lib/fallbacks';
import { formatCurrency } from '@/lib/format';
import { requireAdmin } from '@/lib/session';

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
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
    slowestCalls: Array.isArray(data.slowestCalls)
      ? data.slowestCalls
      : Array.isArray(data.slowest_20)
        ? data.slowest_20
        : fallbackLlmCost.slowestCalls,
  };
}

export default async function LlmPage() {
  const admin = await requireAdmin();
  const cost = normalizeLlmCost(await adminGet<unknown>('/admin/llm/cost', fallbackLlmCost));
  const totalCost = cost.spendByDay.reduce((sum, day) => sum + day.cost_usd, 0);
  const totalCalls = cost.spendByDay.reduce((sum, day) => sum + day.calls, 0);
  const totalTokens = cost.spendByEndpoint.reduce((sum, endpoint) => sum + endpoint.tokens, 0);

  return (
    <AdminShell
      email={admin.email}
      title="LLM Cost Monitor"
      eyebrow="Operations"
      description="Request logs, token distribution, per-endpoint spend, and slowest LLM calls."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Spend MTD" value={formatCurrency(totalCost)} />
        <StatCard label="LLM calls" value={totalCalls} />
        <StatCard label="Tokens" value={totalTokens.toLocaleString()} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel>
          <SectionTitle title="Spend by day" />
          <SpendLineChart data={cost.spendByDay} />
        </Panel>
        <Panel>
          <SectionTitle title="Endpoint breakdown" />
          <EndpointBarChart data={cost.spendByEndpoint} />
        </Panel>
        <Panel>
          <SectionTitle title="Token histogram" />
          <TokenHistogram data={cost.tokenHistogram} />
        </Panel>
        <Panel>
          <SectionTitle title="Slowest 20 calls" />
          <SlowCallsTable calls={cost.slowestCalls.slice(0, 20)} />
        </Panel>
      </div>
    </AdminShell>
  );
}
