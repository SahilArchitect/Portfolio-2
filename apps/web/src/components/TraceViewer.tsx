'use client';

import useSWR from 'swr';

import { cn } from '@engine-room/ui';

import { clientFetchMetrics } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { PublicMetricsView, PublicTraceView } from '@/lib/view-models';

type TraceViewerProps = {
  initialData: PublicMetricsView;
};

export function TraceViewer({ initialData }: TraceViewerProps) {
  const { data } = useSWR('public-traces', clientFetchMetrics, {
    fallbackData: initialData,
    refreshInterval: 10_000,
  });

  const metrics = data ?? initialData;
  const traces = metrics.traces.slice(0, 50);

  return (
    <div className="rounded-xl border border-border bg-bg-elev">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">Read-only trace stream</p>
          <h2 className="mt-2 font-display text-display-sm font-medium text-fg">Last 50 redacted traces</h2>
        </div>
        <p className="font-mono text-mono-sm text-fg-muted">Payloads hidden. IDs truncated.</p>
      </div>

      <div tabIndex={0} className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border font-mono text-mono-sm text-fg-muted">
              <th className="px-5 py-3 font-medium">Trace</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Duration</th>
              <th className="px-5 py-3 font-medium">Spans</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Started</th>
            </tr>
          </thead>
          <tbody>
            {traces.map((trace) => (
              <TraceRow key={trace.id} trace={trace} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TraceRow({ trace }: { trace: PublicTraceView }) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-5 py-4">
        <p className="font-mono text-mono-sm text-fg">{trace.id.slice(0, 12)}</p>
        <p className="mt-1 text-body-sm text-fg-muted">{trace.name}</p>
      </td>
      <td className="px-5 py-4 font-mono text-mono-sm text-fg-muted">{trace.service}</td>
      <td className="px-5 py-4 font-mono text-mono-sm text-fg">{trace.durationMs}ms</td>
      <td className="px-5 py-4 font-mono text-mono-sm text-fg-muted">{trace.spans}</td>
      <td className="px-5 py-4">
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 font-mono text-mono-sm',
            trace.status === 'ok'
              ? 'border-border text-success'
              : 'border-border-strong text-danger',
          )}
        >
          {trace.status}
        </span>
      </td>
      <td className="px-5 py-4 font-mono text-mono-sm text-fg-muted">{formatDate(trace.startedAt)}</td>
    </tr>
  );
}
