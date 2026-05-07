'use client';

import { useMemo, useState, useTransition } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/DataTable';
import { ActionStatus, Field, SecondaryButton, SubmitButton, inputClass } from '@/components/FormControls';
import { deleteFeatureFlag, saveFeatureFlag, toggleFeatureFlag } from '@/lib/actions';
import { formatDateTime } from '@/lib/format';
import type { ActionResult } from '@/lib/api';
import type { FeatureFlagRow } from '@/lib/fallbacks';

export function FlagsManager({ flags }: { flags: FeatureFlagRow[] }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(name: string, enabled: boolean) {
    startTransition(() => {
      void toggleFeatureFlag(name, enabled).then(setResult);
    });
  }

  function remove(name: string) {
    startTransition(() => {
      void deleteFeatureFlag(name).then(setResult);
    });
  }

  function createFlag(formData: FormData) {
    startTransition(() => {
      void saveFeatureFlag(formData).then(setResult);
    });
  }

  const columns = useMemo<ColumnDef<FeatureFlagRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Flag',
        cell: ({ row }) => (
          <div>
            <p className="font-mono text-mono-sm text-fg">{row.original.name}</p>
            <p className="text-body-sm text-fg-muted">{row.original.description}</p>
          </div>
        ),
      },
      {
        accessorKey: 'enabled',
        header: 'Enabled',
        cell: ({ row }) => (
          <button
            type="button"
            disabled={pending}
            onClick={() => toggle(row.original.name, !row.original.enabled)}
            className="rounded-full border border-border px-3 py-1 font-mono text-mono-sm text-fg hover:border-border-strong disabled:opacity-50"
          >
            {row.original.enabled ? 'On' : 'Off'}
          </button>
        ),
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{formatDateTime(row.original.updated_at)}</span>,
      },
      {
        id: 'delete',
        header: 'Delete',
        cell: ({ row }) => (
          <button
            type="button"
            disabled={pending}
            onClick={() => remove(row.original.name)}
            className="rounded border border-border px-2 py-1 font-mono text-mono-sm text-danger hover:border-border-strong disabled:opacity-50"
          >
            Delete
          </button>
        ),
      },
    ],
    [pending],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="rounded-lg border border-border bg-bg-elev p-4">
        <h2 className="font-display text-display-sm font-medium text-fg">Server-side flags</h2>
        <p className="mt-1 text-body-sm text-fg-muted">Public web reads these through /api/flags.</p>
        <div className="mt-4">
          <DataTable columns={columns} data={flags} />
        </div>
        <div className="mt-3">
          <ActionStatus result={result} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-bg-elev p-4">
        <h2 className="font-display text-display-sm font-medium text-fg">Create flag</h2>
        <form action={createFlag} className="mt-4 grid gap-3">
          <Field label="Name">
            <input className={inputClass} name="name" placeholder="enable_feature" required />
          </Field>
          <Field label="Description">
            <textarea className={inputClass} name="description" rows={4} />
          </Field>
          <label className="flex items-center gap-2 font-mono text-mono-sm text-fg-muted">
            <input name="enabled" type="checkbox" className="h-4 w-4 accent-[var(--accent)]" />
            Enabled
          </label>
          <SubmitButton>Create flag</SubmitButton>
        </form>
      </section>
    </div>
  );
}
