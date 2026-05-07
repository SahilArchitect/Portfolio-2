'use client';

import { useMemo, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import type { ColumnDef } from '@tanstack/react-table';

import { fadeUp } from '@engine-room/ui/motion';
import { DataTable } from '@/components/DataTable';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { StatusPill } from '@/components/StatusPill';
import { ActionStatus, Field, SecondaryButton, SubmitButton, inputClass } from '@/components/FormControls';
import { deleteNowEntry, saveNowEntry } from '@/lib/actions';
import { formatDateTime } from '@/lib/format';
import type { ActionResult } from '@/lib/api';
import type { NowEntryRow } from '@/lib/fallbacks';

const blankEntry: NowEntryRow = {
  id: '',
  headline: '',
  body_md: 'What changed this week?\n',
  mood: null,
  is_current: true,
  posted_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function NowManager({ entries }: { entries: NowEntryRow[] }) {
  const [selected, setSelected] = useState(entries[0] ?? blankEntry);
  const [body, setBody] = useState(selected.body_md);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<NowEntryRow>[]>(
    () => [
      {
        accessorKey: 'headline',
        header: 'Headline',
        cell: ({ row }) => <span className="font-medium text-fg">{row.original.headline}</span>,
      },
      {
        accessorKey: 'is_current',
        header: 'Current',
        cell: ({ row }) => <StatusPill status={row.original.is_current ? 'published' : 'draft'} />,
      },
      {
        accessorKey: 'mood',
        header: 'Mood',
        cell: ({ row }) => <span className="text-fg-muted">{row.original.mood ?? 'None'}</span>,
      },
      {
        accessorKey: 'posted_at',
        header: 'Posted',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{formatDateTime(row.original.posted_at)}</span>,
      },
    ],
    [],
  );

  function choose(entry: NowEntryRow) {
    setSelected(entry);
    setBody(entry.body_md);
    setResult(null);
  }

  function submit(formData: FormData) {
    formData.set('body_md', body);
    startTransition(() => {
      void saveNowEntry(formData).then(setResult);
    });
  }

  function remove() {
    if (!selected.id) return;
    startTransition(() => {
      void deleteNowEntry(selected.id).then(setResult);
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)]">
      <section className="rounded-lg border border-border bg-bg-elev p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-display-sm font-medium text-fg">Now log</h2>
            <p className="mt-1 text-body-sm text-fg-muted">Newest entries first. Only one can be current.</p>
          </div>
          <SecondaryButton onClick={() => choose(blankEntry)}>New entry</SecondaryButton>
        </div>
        <DataTable columns={columns} data={entries} onRowClick={choose} />
      </section>

      <motion.section variants={fadeUp} initial="hidden" animate="visible" className="rounded-lg border border-border bg-bg-elev p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-display-sm font-medium text-fg">
              {selected.id ? 'Edit now entry' : 'Create now entry'}
            </h2>
            <p className="mt-1 text-body-sm text-fg-muted">Short status updates for /now.</p>
          </div>
          {selected.id ? <SecondaryButton onClick={remove} disabled={pending}>Delete</SecondaryButton> : null}
        </div>
        <form action={submit} className="grid gap-3">
          <input type="hidden" name="id" value={selected.id} />
          <Field label="Headline">
            <input className={inputClass} name="headline" defaultValue={selected.headline} required />
          </Field>
          <Field label="Mood">
            <input className={inputClass} name="mood" defaultValue={selected.mood ?? ''} />
          </Field>
          <Field label="Body markdown">
            <MarkdownEditor value={body} onChange={setBody} rows={12} />
          </Field>
          <label className="flex items-center gap-2 font-mono text-mono-sm text-fg-muted">
            <input name="is_current" type="checkbox" defaultChecked={selected.is_current} className="h-4 w-4 accent-[var(--accent)]" />
            Mark as current
          </label>
          <div className="flex items-center gap-3">
            <SubmitButton pending={pending}>Save now entry</SubmitButton>
            <ActionStatus result={result} />
          </div>
        </form>
      </motion.section>
    </div>
  );
}
