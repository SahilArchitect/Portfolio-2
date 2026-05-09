'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import { cn } from '@engine-room/ui';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse font-mono text-body-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={cn(
                    'border-b border-border bg-bg-elev px-3 py-2 text-left font-mono text-[9px] uppercase tracking-[3px] text-fg-muted',
                    header.column.getCanSort() && 'cursor-pointer select-none hover:text-accent',
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && (
                    <span className="ml-1 text-accent">↑</span>
                  )}
                  {header.column.getIsSorted() === 'desc' && (
                    <span className="ml-1 text-accent">↓</span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={cn(
                'border-b border-border transition-colors',
                onRowClick && 'cursor-pointer hover:bg-accent-muted',
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 text-fg">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center font-mono text-micro text-fg-muted"
              >
                No data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
