'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/DataTable';
import { percent } from '@/lib/format';

type QueryRow = { query: string; count: number; zero_result_rate: number };

export function SearchQueriesTable({ queries }: { queries: QueryRow[] }) {
  const columns = useMemo<ColumnDef<QueryRow>[]>(
    () => [
      {
        accessorKey: 'query',
        header: 'Anonymized query',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg">{row.original.query}</span>,
      },
      {
        accessorKey: 'count',
        header: 'Count',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{row.original.count}</span>,
      },
      {
        accessorKey: 'zero_result_rate',
        header: 'Zero-result rate',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-warning">{percent(row.original.zero_result_rate)}</span>,
      },
    ],
    [],
  );

  return <DataTable columns={columns} data={queries} />;
}
