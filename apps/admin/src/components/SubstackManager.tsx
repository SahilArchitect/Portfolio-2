'use client';

import { useState, useTransition } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/DataTable';
import { StatusPill } from '@/components/StatusPill';
import { ActionStatus, Field, SecondaryButton, SubmitButton, inputClass } from '@/components/FormControls';
import { saveSubstackSettings, triggerSubstackSync } from '@/lib/actions';
import { formatDateTime } from '@/lib/format';
import type { ActionResult } from '@/lib/api';
import type { SubstackState, SyncLogRow } from '@/lib/fallbacks';

const logColumns: ColumnDef<SyncLogRow>[] = [
  {
    accessorKey: 'level',
    header: 'Level',
    cell: ({ row }) => <StatusPill status={row.original.level === 'error' ? 'spam' : row.original.level === 'warning' ? 'draft' : 'published'} />,
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => <span className="text-fg">{row.original.message}</span>,
  },
  {
    accessorKey: 'created_at',
    header: 'Time',
    cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{formatDateTime(row.original.created_at)}</span>,
  },
];

export function SubstackManager({ state }: { state: SubstackState }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function runSync() {
    startTransition(() => {
      void triggerSubstackSync().then(setResult);
    });
  }

  function submit(formData: FormData) {
    startTransition(() => {
      void saveSubstackSettings(formData).then(setResult);
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]">
      <section className="rounded-lg border border-border bg-bg-elev p-4">
        <h2 className="font-display text-display-sm font-medium text-fg">Ingestion controls</h2>
        <dl className="mt-4 grid gap-3 border-b border-border pb-4">
          <div>
            <dt className="font-mono text-micro uppercase tracking-wider text-fg-muted">Last sync</dt>
            <dd className="mt-1 font-display text-body-sm text-fg">{formatDateTime(state.lastSyncAt)}</dd>
          </div>
          <div>
            <dt className="font-mono text-micro uppercase tracking-wider text-fg-muted">Embedding model</dt>
            <dd className="mt-1 font-mono text-mono-sm text-fg">{state.embeddingModel}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <SecondaryButton onClick={runSync} disabled={pending}>Manual re-sync</SecondaryButton>
          <ActionStatus result={result} />
        </div>
        <form action={submit} className="mt-6 grid gap-3">
          <Field label="Embedding model">
            <select name="embedding_model" defaultValue={state.embeddingModel} className={inputClass}>
              <option value="text-embedding-3-small">text-embedding-3-small</option>
              <option value="text-embedding-3-large">text-embedding-3-large</option>
            </select>
          </Field>
          <Field label="Chunk size">
            <input name="chunk_size" type="number" min="256" max="1024" step="64" defaultValue={state.chunkSize} className={inputClass} />
          </Field>
          <SubmitButton pending={pending}>Save settings</SubmitButton>
        </form>
      </section>

      <section className="rounded-lg border border-border bg-bg-elev p-4">
        <h2 className="font-display text-display-sm font-medium text-fg">Recent sync log</h2>
        <p className="mt-1 text-body-sm text-fg-muted">Worker status is read-only here; manual trigger routes through the API.</p>
        <div className="mt-4">
          <DataTable columns={logColumns} data={state.recentLog} />
        </div>
      </section>
    </div>
  );
}
