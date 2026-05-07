'use client';

import useSWR from 'swr';

import { cn } from '@engine-room/ui';
import { cssVarNames } from '@engine-room/ui/tokens';

import { clientFetchMetrics } from '@/lib/api';
import { compactNumber } from '@/lib/format';
import type { PublicMetricsView } from '@/lib/view-models';

const tokenVar = {
  accent: `var(${cssVarNames.accent})`,
  borderStrong: `var(${cssVarNames.borderStrong})`,
};

type MetricsWidgetProps = {
  initialData: PublicMetricsView;
  compact?: boolean;
  className?: string;
};

export function MetricsWidget({ initialData, compact = false, className }: MetricsWidgetProps) {
  const { data } = useSWR('public-metrics', clientFetchMetrics, {
    fallbackData: initialData,
    refreshInterval: 10_000,
  });

  const metrics = data ?? initialData;
  const max = Math.max(...metrics.sparkline, 1);
  const points = metrics.sparkline
    .map((value, index) => {
      const x = (index / Math.max(metrics.sparkline.length - 1, 1)) * 100;
      const y = 36 - (value / max) * 34;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <div className={cn('rounded-xl border border-border bg-bg-elev p-5', className)}>
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">Live public metrics</p>
        <time dateTime={metrics.updatedAt} className="font-mono text-mono-sm text-fg-muted">
          10s poll
        </time>
      </div>

      <div className={cn('mt-5 grid gap-4', compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4')}>
        <Metric label="RAG queries" value={compactNumber(metrics.ragQueries24h)} detail="24h" />
        <Metric label="Median" value={`${metrics.medianLatencyMs}ms`} detail="latency" />
        <Metric label="P99" value={`${metrics.p99LatencyMs}ms`} detail="latency" />
        <Metric label="Throughput" value={`${metrics.throughputPerMin}/m`} detail="public" />
      </div>

      <svg viewBox="0 0 100 38" role="img" aria-label="Request throughput sparkline" className="mt-5 h-12 w-full overflow-visible">
        <polyline points={points} fill="none" stroke={tokenVar.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="0" x2="100" y1="37" y2="37" stroke={tokenVar.borderStrong} strokeWidth="1" />
      </svg>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3">
      <p className="font-mono text-mono-sm text-fg-muted">{label}</p>
      <p className="mt-2 font-display text-display-sm font-medium text-fg">{value}</p>
      <p className="mt-1 font-mono text-mono-sm text-fg-muted">{detail}</p>
    </div>
  );
}
