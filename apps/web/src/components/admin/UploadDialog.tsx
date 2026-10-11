'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { uploadAssetAction, type AssetState } from '@/app/admin/actions';

import { useToast } from './Toaster';

const CLIENT_LIMIT = 4 * 1024 * 1024;

/** Upload with required alt text for images. Files are validated again on the server. */
export function UploadDialog({
  initialFile,
  accept,
  onClose,
  onUploaded,
}: {
  initialFile?: File;
  accept: string;
  onClose: () => void;
  onUploaded: (asset: AssetState) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const toast = useToast();
  const [file, setFile] = useState<File | undefined>(initialFile);
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isImage = !file || file.type.startsWith('image/');

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    // React events bubble through the portal to the entry editor's form;
    // letting this one through would also save (and remount) the editor.
    event.stopPropagation();
    if (!file) return setError('Choose a file');
    if (file.size > CLIENT_LIMIT) return setError('Files must be 4 MB or smaller');
    if (isImage && !alt.trim()) return setError('Alt text is required for images');
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set('file', file);
    form.set('altText', alt);
    form.set('caption', caption);
    try {
      const result = await uploadAssetAction(form);
      if (!result.ok) {
        setError(Object.values(result.errors).join('; '));
        return;
      }
      toast('Uploaded');
      onUploaded(result.value);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Portalled so this <form> is never nested inside the entry editor's <form>:
  // the browser would then submit natively and reload the page mid-upload.
  return createPortal(
    <dialog
      ref={dialog}
      onClose={onClose}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded border border-rule bg-bg p-0 text-fg backdrop:bg-black/40"
    >
      <form onSubmit={submit} className="space-y-3 p-4">
        <h2 className="font-semibold">Upload file</h2>
        <input
          type="file"
          accept={accept}
          onChange={(event) => setFile(event.target.files?.[0])}
          className="block w-full text-sm"
        />
        {file && (
          <p className="meta">
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </p>
        )}
        {isImage && (
          <label className="block">
            <span className="meta text-fg">Alt text (required)</span>
            <input
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              className="mt-1 w-full rounded border border-rule bg-bg px-2 py-1.5"
              required
            />
          </label>
        )}
        <label className="block">
          <span className="meta text-fg">Caption (optional)</span>
          <input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="mt-1 w-full rounded border border-rule bg-bg px-2 py-1.5"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="rounded border border-rule px-3 py-1 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-fg px-3 py-1 text-sm text-bg disabled:opacity-50"
          >
            {busy ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
