'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/DataTable';

type TopPageRow = { path: string; views: number; visitors: number };

export function TopPagesTable({ data }: { data: TopPageRow[] }) {
  const columns = useMemo<ColumnDef<TopPageRow>[]>(
    () => [
      {
        accessorKey: 'path',
        header: 'Page',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg">{row.original.path}</span>,
      },
      {
        accessorKey: 'views',
        header: 'Views',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{row.original.views}</span>,
      },
      {
        accessorKey: 'visitors',
        header: 'Visitors',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{row.original.visitors}</span>,
      },
    ],
    [],
  );

  return <DataTable columns={columns} data={data} />;
}
