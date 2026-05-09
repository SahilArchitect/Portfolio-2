'use client';

import { useMemo, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import type { ColumnDef } from '@tanstack/react-table';

import { fadeUp } from '@engine-room/ui/motion';
import { DataTable } from '@/components/DataTable';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { StatusPill } from '@/components/StatusPill';
import { ActionStatus, Field, SecondaryButton, SubmitButton, inputClass } from '@/components/FormControls';
import { deleteResumeVariant, saveResumeVariant } from '@/lib/actions';
import { formatDate } from '@/lib/format';
import type { ActionResult } from '@/lib/api';
import type { ResumeVariantRow } from '@/lib/fallbacks';

const blankResume: ResumeVariantRow = {
  id: '',
  label: '',
  slug: '',
  body_md: '## Summary\n\n## Experience\n',
  pdf_url: null,
  is_default: false,
  role_keywords: [],
  updated_at: new Date().toISOString(),
};

export function ResumeManager({ variants }: { variants: ResumeVariantRow[] }) {
  const [selected, setSelected] = useState(variants[0] ?? blankResume);
  const [body, setBody] = useState(selected.body_md);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<ResumeVariantRow>[]>(
    () => [
      {
        accessorKey: 'label',
        header: 'Variant',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-fg">{row.original.label}</p>
            <p className="font-mono text-mono-sm text-fg-muted">/{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: 'is_default',
        header: 'Default',
        cell: ({ row }) => <StatusPill status={row.original.is_default ? 'published' : 'draft'} />,
      },
      {
        accessorKey: 'role_keywords',
        header: 'Role tags',
        cell: ({ row }) => <span className="text-fg-muted">{row.original.role_keywords.join(', ') || 'None'}</span>,
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{formatDate(row.original.updated_at)}</span>,
      },
    ],
    [],
  );

  function choose(variant: ResumeVariantRow) {
    setSelected(variant);
    setBody(variant.body_md);
    setResult(null);
  }

  function submit(formData: FormData) {
    formData.set('body_md', body);
    startTransition(() => {
      void saveResumeVariant(formData).then(setResult);
    });
  }

  function remove() {
    if (!selected.id) return;
    startTransition(() => {
      void deleteResumeVariant(selected.id).then(setResult);
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)]">
      <section className="cyber-panel p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[18px] font-bold uppercase tracking-[2px] text-fg [font-family:Orbitron,monospace]">Resume variants</h2>
            <p className="mt-1 font-mono text-[12px] leading-6 text-fg/65">Tag variants by role so /hire can pick the right PDF.</p>
          </div>
          <SecondaryButton onClick={() => choose(blankResume)}>New variant</SecondaryButton>
        </div>
        <DataTable columns={columns} data={variants} onRowClick={choose} />
      </section>

      <motion.section variants={fadeUp} initial="hidden" animate="visible" className="cyber-panel p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[18px] font-bold uppercase tracking-[2px] text-fg [font-family:Orbitron,monospace]">
              {selected.id ? 'Edit resume' : 'Create resume'}
            </h2>
            <p className="mt-1 font-mono text-[12px] leading-6 text-fg/65">PDF upload stores a browser-downloadable URL; markdown remains the editable source.</p>
          </div>
          {selected.id ? <SecondaryButton onClick={remove} disabled={pending}>Delete</SecondaryButton> : null}
        </div>
        <form key={selected.id || 'new-resume'} action={submit} className="grid gap-3">
          <input type="hidden" name="id" value={selected.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Label">
              <input className={inputClass} name="label" defaultValue={selected.label} required />
            </Field>
            <Field label="Slug">
              <input className={inputClass} name="slug" defaultValue={selected.slug} required />
            </Field>
          </div>
          <Field label="Role keywords">
            <input className={inputClass} name="role_keywords" defaultValue={selected.role_keywords.join(', ')} />
          </Field>
          <Field label="PDF URL">
            <input className={inputClass} name="pdf_url" defaultValue={selected.pdf_url ?? ''} placeholder="https://.../resume.pdf" />
          </Field>
          {selected.pdf_url ? (
            <a
              href={selected.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="w-fit font-mono text-[10px] uppercase tracking-[2px] text-accent hover:text-fg"
            >
              Test current PDF download
            </a>
          ) : null}
          <Field label="Upload PDF">
            <input className={inputClass} name="pdf_file" type="file" accept="application/pdf" />
          </Field>
          <Field label="Resume markdown">
            <MarkdownEditor value={body} onChange={setBody} rows={14} />
          </Field>
          <label className="flex items-center gap-2 font-mono text-mono-sm text-fg-muted">
            <input name="is_default" type="checkbox" defaultChecked={selected.is_default} className="h-4 w-4 accent-[var(--accent)]" />
            Default variant
          </label>
          <div className="flex items-center gap-3">
            <SubmitButton pending={pending}>Save resume</SubmitButton>
            <ActionStatus result={result} />
          </div>
        </form>
      </motion.section>
    </div>
  );
}
