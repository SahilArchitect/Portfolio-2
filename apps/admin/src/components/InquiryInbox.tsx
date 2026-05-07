'use client';

import { useMemo, useState, useTransition } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/DataTable';
import { StatusPill } from '@/components/StatusPill';
import { ActionStatus, SecondaryButton } from '@/components/FormControls';
import { updateInquiryStatus } from '@/lib/actions';
import { formatDateTime } from '@/lib/format';
import type { ActionResult } from '@/lib/api';
import type { InquiryRow } from '@/lib/fallbacks';

const FILTERS = ['all', 'recruiter', 'founder', 'spam'] as const;

export function InquiryInbox({ inquiries }: { inquiries: InquiryRow[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      inquiries
        .filter((inquiry) => filter === 'all' || inquiry.intent === filter)
        .sort((a, b) => b.priority_score - a.priority_score),
    [filter, inquiries],
  );

  function setStatus(id: string, status: string) {
    startTransition(() => {
      void updateInquiryStatus(id, status).then(setResult);
    });
  }

  const columns = useMemo<ColumnDef<InquiryRow>[]>(
    () => [
      {
        accessorKey: 'priority_score',
        header: 'Score',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-accent">{row.original.priority_score}</span>,
      },
      {
        accessorKey: 'name',
        header: 'Sender',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-fg">{row.original.name}</p>
            <p className="font-mono text-mono-sm text-fg-muted">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: 'intent',
        header: 'Type',
        cell: ({ row }) => <StatusPill status={row.original.intent} />,
      },
      {
        accessorKey: 'message',
        header: 'Message',
        cell: ({ row }) => <p className="max-w-md truncate text-fg-muted">{row.original.message}</p>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        accessorKey: 'created_at',
        header: 'Received',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{formatDateTime(row.original.created_at)}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <a
              href={`mailto:${row.original.email}?subject=Re: The Engine Room`}
              className="rounded border border-border px-2 py-1 font-mono text-mono-sm text-fg-muted hover:border-border-strong hover:text-fg"
            >
              Reply
            </a>
            <button
              type="button"
              disabled={pending}
              onClick={() => setStatus(row.original.id, 'read')}
              className="rounded border border-border px-2 py-1 font-mono text-mono-sm text-fg-muted hover:border-border-strong hover:text-fg disabled:opacity-50"
            >
              Read
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setStatus(row.original.id, 'spam')}
              className="rounded border border-border px-2 py-1 font-mono text-mono-sm text-danger hover:border-border-strong disabled:opacity-50"
            >
              Spam
            </button>
          </div>
        ),
      },
    ],
    [pending],
  );

  return (
    <section className="rounded-lg border border-border bg-bg-elev p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-display-sm font-medium text-fg">Triaged inbox</h2>
          <p className="mt-1 text-body-sm text-fg-muted">Sorted by LLM priority score, then filtered by classified type.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <SecondaryButton key={item} onClick={() => setFilter(item)}>
              {item}
            </SecondaryButton>
          ))}
        </div>
      </div>
      <DataTable columns={columns} data={filtered} />
      <div className="mt-3">
        <ActionStatus result={result} />
      </div>
    </section>
  );
}
