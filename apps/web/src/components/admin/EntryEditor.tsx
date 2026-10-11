'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createPreviewLinkAction,
  deleteEntryAction,
  revokePreviewLinksAction,
  saveEntryAction,
  setStatusAction,
  type EntryState,
} from '@/app/admin/actions';
import {
  FIELDS,
  HAS_SLUG_URL,
  TYPE_LABELS,
  getPath,
  publicPathFor,
  setPath,
} from '@/lib/content/fields';
import { dataSchemas, flattenIssues, publishProblems, titleFor } from '@/lib/content/schemas';
import { slugify } from '@/lib/slug';

import { FieldControl, type AssetOption } from './fields';
import { useToast } from './Toaster';

const AUTOSAVE_MS = 3000;

type SaveState = { kind: 'idle' | 'saving' | 'saved' | 'error'; at?: string; message?: string };

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function EntryEditor({ initial, assets }: { initial: EntryState; assets: AssetOption[] }) {
  const toast = useToast();
  const [entry, setEntry] = useState(initial);
  const [data, setData] = useState<Record<string, unknown>>(initial.data);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(
    initial.status !== 'draft' || initial.slug !== slugify(initial.title),
  );
  const [publishAt, setPublishAt] = useState(initial.publishAt ?? '');
  const [dirty, setDirty] = useState(false);
  const [save, setSave] = useState<SaveState>({ kind: 'saved', at: initial.updatedAt });
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const saving = useRef(false);
  const type = entry.type;
  const fields = FIELDS[type];

  const clientErrors = useMemo(() => {
    const parsed = dataSchemas[type].safeParse(data);
    return parsed.success ? {} : flattenIssues(parsed.error.issues);
  }, [data, type]);
  const errors = { ...serverErrors, ...clientErrors };
  const hasErrors = Object.keys(clientErrors).length > 0;

  function update(path: string, value: unknown) {
    setData((current) => {
      const next = setPath(current, path, value);
      if (!slugTouched && entry.status === 'draft' && HAS_SLUG_URL[type]) {
        const derived = slugify(titleFor(type, next));
        if (derived) setSlug(derived);
      }
      return next;
    });
    setDirty(true);
  }

  const doSave = useCallback(
    async (kind: 'autosave' | 'save') => {
      if (saving.current) return null;
      if (hasErrors) {
        setSave({ kind: 'error', message: 'Fix the highlighted fields to save' });
        return null;
      }
      saving.current = true;
      setSave({ kind: 'saving' });
      try {
        const result = await saveEntryAction(
          entry.id,
          { type, slug, data, publishAt: publishAt ? new Date(publishAt).toISOString() : null },
          kind,
        );
        if (!result.ok) {
          setServerErrors(result.errors);
          setSave({ kind: 'error', message: Object.values(result.errors)[0] ?? 'Not saved' });
          if (kind === 'save') toast(Object.values(result.errors).join('; '), 'error');
          return null;
        }
        setServerErrors({});
        setEntry(result.value);
        setDirty(false);
        setSave({ kind: 'saved', at: result.value.updatedAt });
        if (kind === 'save') toast('Saved');
        return result.value;
      } catch (error) {
        setSave({ kind: 'error', message: (error as Error).message });
        if (kind === 'save') toast((error as Error).message, 'error');
        return null;
      } finally {
        saving.current = false;
      }
    },
    [data, entry.id, hasErrors, publishAt, slug, toast, type],
  );

  // Autosave drafts to the database a few seconds after the last change.
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => void doSave('autosave'), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [dirty, doSave]);

  async function changeStatus(status: 'draft' | 'published' | 'archived') {
    if (dirty && !(await doSave('save'))) return;
    if (status === 'published') {
      const problems = publishProblems(type, data);
      if (problems.length) {
        toast(`Cannot publish: ${problems.join('; ')}`, 'error');
        return;
      }
      if (!window.confirm(`Publish "${titleFor(type, data)}"? It will be public within seconds.`))
        return;
    }
    const result = await setStatusAction(entry.id, status);
    if (!result.ok) {
      toast(Object.values(result.errors).join('; '), 'error');
      return;
    }
    setEntry(result.value);
    toast(
      status === 'published'
        ? 'Published'
        : status === 'archived'
          ? 'Archived (hidden publicly)'
          : 'Moved to draft',
    );
  }

  // Cmd/Ctrl+S saves; Cmd/Ctrl+Enter publishes (with confirmation).
  const keyHandler = useRef<(event: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyHandler.current = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key === 's') {
        event.preventDefault();
        void doSave('save');
      } else if (event.key === 'Enter' && type !== 'profile') {
        event.preventDefault();
        void changeStatus('published');
      }
    };
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => keyHandler.current(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  async function makePreviewLink() {
    if (dirty && !(await doSave('save'))) return;
    const result = await createPreviewLinkAction(entry.id, 7);
    if (!result.ok) return toast(Object.values(result.errors).join('; '), 'error');
    setPreviewUrl(result.value.url);
    try {
      await navigator.clipboard.writeText(result.value.url);
      toast('Preview link copied (expires in 7 days)');
    } catch {
      toast('Preview link created (expires in 7 days)');
    }
  }

  async function revokePreviews() {
    const result = await revokePreviewLinksAction(entry.id);
    if (result.ok) {
      setPreviewUrl(null);
      toast('All preview links for this entry revoked');
    }
  }

  async function deletePermanently() {
    const typed = window.prompt(
      `This permanently deletes "${entry.title}" and its history. Type DELETE to confirm.`,
    );
    if (typed !== 'DELETE') return;
    const result = await deleteEntryAction(entry.id, type);
    if (result && !result.ok) toast(Object.values(result.errors).join('; '), 'error');
  }

  const statusLine =
    save.kind === 'saving'
      ? 'Saving…'
      : save.kind === 'error'
        ? `Not saved · ${save.message ?? ''}`
        : dirty
          ? 'Unsaved changes'
          : save.at
            ? `Saved · ${timeOf(save.at)}`
            : '';
  const publicPath = publicPathFor(type, entry.slug);

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-20 -mx-4 border-b border-rule bg-bg/95 px-4 py-2 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Link href={`/admin/${type}`} className="meta no-underline">
            ← {TYPE_LABELS[type].plural}
          </Link>
          <span
            className="meta rounded-sm bg-badge px-1.5 py-0.5 text-fg"
            data-testid="entry-status"
          >
            {entry.status}
          </span>
          <span
            className={`meta ${save.kind === 'error' ? 'text-red-700 dark:text-red-400' : ''}`}
            data-testid="save-status"
            aria-live="polite"
          >
            {statusLine}
          </span>
          <div className="ml-auto flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() => void doSave('save')}
              className="rounded border border-rule px-3 py-1 hover:border-accent"
              title="Cmd/Ctrl+S"
            >
              Save
            </button>
            {type !== 'profile' && entry.status !== 'published' && (
              <button
                type="button"
                onClick={() => void changeStatus('published')}
                className="rounded bg-fg px-3 py-1 text-bg hover:opacity-90"
                title="Cmd/Ctrl+Enter"
              >
                Publish
              </button>
            )}
            {type !== 'profile' && entry.status === 'published' && (
              <button
                type="button"
                onClick={() => void changeStatus('draft')}
                className="rounded border border-rule px-3 py-1"
              >
                Unpublish
              </button>
            )}
            {type !== 'profile' && entry.status !== 'archived' && (
              <button
                type="button"
                onClick={() => void changeStatus('archived')}
                className="rounded border border-rule px-3 py-1"
              >
                Archive
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {entry.status === 'published' && (
          <a href={publicPath} target="_blank" rel="noopener">
            View live ↗
          </a>
        )}
        {['project', 'note', 'reproduction'].includes(type) && (
          <>
            <button
              type="button"
              onClick={() => void makePreviewLink()}
              className="text-accent underline"
            >
              Create preview link
            </button>
            <button
              type="button"
              onClick={() => void revokePreviews()}
              className="text-muted underline"
            >
              Revoke preview links
            </button>
          </>
        )}
        <Link href={`/admin/${type}/${entry.id}/revisions`}>Revision history</Link>
      </div>
      {previewUrl && (
        <p className="meta mt-2 break-all" data-testid="preview-url">
          {previewUrl}
        </p>
      )}

      {errors._ && (
        <p
          role="alert"
          className="mt-4 rounded border border-red-700 p-2 text-sm text-red-700 dark:text-red-400"
        >
          {errors._}
        </p>
      )}

      <form
        className="mt-6 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void doSave('save');
        }}
        noValidate
      >
        {HAS_SLUG_URL[type] && (
          <label className="block">
            <span className="meta text-fg">Slug</span>
            <input
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value.toLowerCase());
                setSlugTouched(true);
                setDirty(true);
              }}
              className="mt-1 w-full rounded border border-rule bg-bg px-2 py-1.5 font-mono text-sm"
              aria-invalid={Boolean(errors.slug)}
            />
            <span className="meta mt-1 block">
              {publicPathFor(type, slug)}
              {entry.publishedAt && slug !== initial.slug && ' — the old URL will redirect here'}
            </span>
            {errors.slug && (
              <span className="mt-1 block text-sm text-red-700 dark:text-red-400">
                {errors.slug}
              </span>
            )}
          </label>
        )}

        {fields.map((field) => (
          <FieldControl
            key={field.path}
            field={field}
            value={getPath(data, field.path)}
            error={errors[field.path]}
            errors={errors}
            onChange={(value) => update(field.path, value)}
            onAltChange={field.altPath ? (alt) => update(field.altPath as string, alt) : undefined}
            assets={assets}
          />
        ))}

        {type !== 'profile' && (
          <label className="block max-w-xs">
            <span className="meta text-fg">Scheduled publish (optional)</span>
            <input
              type="datetime-local"
              value={publishAt ? publishAt.slice(0, 16) : ''}
              onChange={(event) => {
                setPublishAt(event.target.value);
                setDirty(true);
              }}
              className="mt-1 w-full rounded border border-rule bg-bg px-2 py-1.5 text-sm"
            />
            <span className="meta mt-1 block">
              A published entry stays hidden until this time (within the hour).
            </span>
          </label>
        )}
      </form>

      {entry.status === 'archived' && (
        <section className="mt-12 border-t border-rule pt-4">
          <h2 className="meta uppercase">Danger zone</h2>
          <button
            type="button"
            onClick={() => void deletePermanently()}
            className="mt-2 rounded border border-red-700 px-3 py-1 text-sm text-red-700 dark:text-red-400"
          >
            Delete permanently…
          </button>
        </section>
      )}
    </div>
  );
}
