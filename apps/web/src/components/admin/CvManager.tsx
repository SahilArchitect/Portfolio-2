'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteCvAction, setCurrentCvAction, uploadCvAction } from '@/app/admin/actions';

import { useToast } from './Toaster';

export type CvRow = {
  id: string;
  url: string;
  label: string;
  size: number;
  isCurrent: boolean;
  uploadedAt: string;
};

export function CvManager({ files }: { files: CvRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function upload(form: FormData) {
    const file = form.get('file');
    if (file instanceof File && file.size > 4 * 1024 * 1024)
      return toast('The PDF must be 4 MB or smaller', 'error');
    setBusy(true);
    const result = await uploadCvAction(form);
    setBusy(false);
    if (!result.ok) return toast(Object.values(result.errors).join('; '), 'error');
    toast('CV uploaded and set as current');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        action={upload}
        className="flex flex-wrap items-end gap-3 rounded border border-rule p-3"
      >
        <label className="block">
          <span className="meta block text-fg">PDF</span>
          <input name="file" type="file" accept="application/pdf" required className="text-sm" />
        </label>
        <label className="block">
          <span className="meta block text-fg">Label</span>
          <input
            name="label"
            required
            placeholder="e.g. 2026-10 PhD applications"
            className="rounded border border-rule bg-bg px-2 py-1 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-fg px-3 py-1.5 text-sm text-bg disabled:opacity-50"
        >
          {busy ? 'Uploading…' : 'Upload as current'}
        </button>
      </form>
      <ul className="divide-y divide-rule border-y border-rule">
        {files.map((file) => (
          <li key={file.id} className="flex flex-wrap items-baseline gap-3 py-2 text-sm">
            <a href={file.url} target="_blank" rel="noopener">
              {file.label}
            </a>
            <span className="meta">
              {file.uploadedAt.slice(0, 10)} · {(file.size / 1024).toFixed(0)} KB
            </span>
            {file.isCurrent ? (
              <span className="meta rounded-sm bg-badge px-1.5 text-fg">current (public)</span>
            ) : (
              <>
                <button
                  type="button"
                  className="text-accent underline"
                  onClick={async () => {
                    const r = await setCurrentCvAction(file.id);
                    toast(r.ok ? 'Now current' : 'Failed', r.ok ? 'ok' : 'error');
                    router.refresh();
                  }}
                >
                  make current
                </button>
                <button
                  type="button"
                  className="text-muted underline"
                  onClick={async () => {
                    if (!window.confirm('Delete this CV version?')) return;
                    const r = await deleteCvAction(file.id);
                    if (!r.ok) return toast(Object.values(r.errors).join('; '), 'error');
                    router.refresh();
                  }}
                >
                  delete
                </button>
              </>
            )}
          </li>
        ))}
        {files.length === 0 && (
          <li className="py-2 text-sm text-muted">
            No CV uploaded. The public CV link stays hidden until you upload one.
          </li>
        )}
      </ul>
    </div>
  );
}
