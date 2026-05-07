import { AdminShell, Panel, SectionTitle } from '@/components/AdminShell';
import { EndpointBarChart, SpendLineChart, TokenHistogram } from '@/components/Charts';
import { SlowCallsTable } from '@/components/SlowCallsTable';
import { StatCard } from '@/components/StatCard';
import { adminGet } from '@/lib/api';
import { fallbackLlmCost, type LlmCostState } from '@/lib/fallbacks';
import { formatCurrency } from '@/lib/format';
import { requireAdmin } from '@/lib/session';

export default async function LlmPage() {
  const admin = await requireAdmin();
  const cost = await adminGet<LlmCostState>('/admin/llm/cost', fallbackLlmCost);
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
