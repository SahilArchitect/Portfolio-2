'use client';

import { useMemo, useState, useTransition } from 'react';
import { Reorder, motion } from 'framer-motion';
import type { ColumnDef } from '@tanstack/react-table';

import { fadeUp } from '@engine-room/ui/motion';
import { DataTable } from '@/components/DataTable';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { StatusPill } from '@/components/StatusPill';
import { ActionStatus, Field, SecondaryButton, SubmitButton, inputClass } from '@/components/FormControls';
import { deleteProject, reorderProjects, saveProject } from '@/lib/actions';
import { formatDate } from '@/lib/format';
import type { ActionResult } from '@/lib/api';
import type { ProjectRow } from '@/lib/fallbacks';

const blankProject: ProjectRow = {
  id: '',
  title: '',
  slug: '',
  summary: '',
  body_md: '## Problem\n\n## System\n\n## Result\n',
  role: '',
  stack: [],
  status: 'draft',
  featured: false,
  display_order: 0,
  live_url: null,
  repo_url: null,
  shipped_on: null,
  updated_at: new Date().toISOString(),
};

export function ProjectsManager({ projects }: { projects: ProjectRow[] }) {
  const ordered = useMemo(
    () => [...projects].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [projects],
  );
  const [items, setItems] = useState(ordered);
  const [selected, setSelected] = useState<ProjectRow>(ordered[0] ?? blankProject);
  const [body, setBody] = useState(selected.body_md);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<ProjectRow>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Project',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-fg">{row.original.title}</p>
            <p className="font-mono text-mono-sm text-fg-muted">/{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        accessorKey: 'stack',
        header: 'Stack',
        cell: ({ row }) => <span className="text-fg-muted">{row.original.stack.join(', ') || 'None'}</span>,
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated',
        cell: ({ row }) => <span className="font-mono text-mono-sm text-fg-muted">{formatDate(row.original.updated_at)}</span>,
      },
    ],
    [],
  );

  function choose(project: ProjectRow) {
    setSelected(project);
    setBody(project.body_md);
    setResult(null);
  }

  function newProject() {
    choose(blankProject);
  }

  function submit(formData: FormData) {
    formData.set('body_md', body);
    startTransition(() => {
      void saveProject(formData).then(setResult);
    });
  }

  function remove() {
    if (!selected.id) return;
    startTransition(() => {
      void deleteProject(selected.id).then(setResult);
    });
  }

  function persistOrder(next: ProjectRow[]) {
    setItems(next);
    startTransition(() => {
      void reorderProjects(next.map((item) => item.id)).then(setResult);
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)]">
      <div className="grid gap-4">
        <section className="rounded-lg border border-border bg-bg-elev p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-display-sm font-medium text-fg">Project inventory</h2>
              <p className="mt-1 text-body-sm text-fg-muted">TanStack table sorted by any column.</p>
            </div>
            <SecondaryButton onClick={newProject}>New project</SecondaryButton>
          </div>
          <DataTable columns={columns} data={items} onRowClick={choose} />
        </section>

        <section className="rounded-lg border border-border bg-bg-elev p-4">
          <h2 className="font-display text-display-sm font-medium text-fg">Display order</h2>
          <p className="mt-1 text-body-sm text-fg-muted">Drag rows to update display_order through server actions.</p>
          <Reorder.Group axis="y" values={items} onReorder={persistOrder} className="mt-4 grid gap-2">
            {items.map((project) => (
              <Reorder.Item
                key={project.id}
                value={project}
                layout
                className="cursor-grab rounded-md border border-border bg-bg px-3 py-2 active:cursor-grabbing"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-body-sm text-fg">{project.title}</p>
                    <p className="font-mono text-mono-sm text-fg-muted">Order {project.display_order}</p>
                  </div>
                  <span className="font-mono text-mono-sm text-fg-muted">Drag</span>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </section>
      </div>

      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-lg border border-border bg-bg-elev p-4"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-display-sm font-medium text-fg">
              {selected.id ? 'Edit project' : 'Create project'}
            </h2>
            <p className="mt-1 text-body-sm text-fg-muted">Markdown preview is live. Token actions stay server-side.</p>
          </div>
          {selected.id ? <SecondaryButton onClick={remove} disabled={pending}>Delete</SecondaryButton> : null}
        </div>
        <form action={submit} className="grid gap-3">
          <input type="hidden" name="id" value={selected.id} />
          <Field label="Title">
            <input className={inputClass} name="title" defaultValue={selected.title} required />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Slug">
              <input className={inputClass} name="slug" defaultValue={selected.slug} />
            </Field>
            <Field label="Status">
              <select className={inputClass} name="status" defaultValue={selected.status}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>
          <Field label="Summary">
            <textarea className={inputClass} name="summary" defaultValue={selected.summary} rows={3} required />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Role">
              <input className={inputClass} name="role" defaultValue={selected.role} />
            </Field>
            <Field label="Stack tags">
              <input className={inputClass} name="stack" defaultValue={selected.stack.join(', ')} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Live URL">
              <input className={inputClass} name="live_url" defaultValue={selected.live_url ?? ''} />
            </Field>
            <Field label="Repo URL">
              <input className={inputClass} name="repo_url" defaultValue={selected.repo_url ?? ''} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Shipped on">
              <input className={inputClass} name="shipped_on" type="date" defaultValue={selected.shipped_on ?? ''} />
            </Field>
            <Field label="Display order">
              <input className={inputClass} name="display_order" type="number" defaultValue={selected.display_order} />
            </Field>
          </div>
          <Field label="Body markdown">
            <MarkdownEditor value={body} onChange={setBody} rows={14} />
          </Field>
          <label className="flex items-center gap-2 font-mono text-mono-sm text-fg-muted">
            <input name="featured" type="checkbox" defaultChecked={selected.featured} className="h-4 w-4 accent-[var(--accent)]" />
            Featured on home
          </label>
          <div className="flex items-center gap-3">
            <SubmitButton pending={pending}>Save project</SubmitButton>
            <ActionStatus result={result} />
          </div>
        </form>
      </motion.section>
    </div>
  );
}
