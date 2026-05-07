'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/DataTable';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { LlmSlowCall } from '@/lib/fallbacks';

export function SlowCallsTable({ calls }: { calls: LlmSlowCall[] }) {
  const columns = useMemo<ColumnDef<LlmSlowCall>[]>(
    () => [
      {
        accessorKey: 'endpoint',
        header: 'Endpoint',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg">{row.original.endpoint}</span>,
      },
      {
        accessorKey: 'model',
        header: 'Model',
        cell: ({ row }) => <span className="text-fg-muted">{row.original.model}</span>,
      },
      {
        accessorKey: 'duration_ms',
        header: 'Latency',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-warning">{row.original.duration_ms}ms</span>,
      },
      {
        accessorKey: 'cost_usd',
        header: 'Cost',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{formatCurrency(row.original.cost_usd)}</span>,
      },
      {
        accessorKey: 'created_at',
        header: 'Time',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{formatDateTime(row.original.created_at)}</span>,
      },
    ],
    [],
  );

  return <DataTable columns={columns} data={calls} />;
}
