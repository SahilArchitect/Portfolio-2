'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteAssetAction, updateAssetAction } from '@/app/admin/actions';

import { useToast } from './Toaster';
import { UploadDialog } from './UploadDialog';

export type AssetRow = {
  id: string;
  url: string;
  contentType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string;
  caption: string | null;
  usedIn: string[];
};

function snippetFor(asset: AssetRow): string {
  if (asset.contentType === 'application/json')
    return `::figure{type="bitflip-curve" data="${asset.url}"}`;
  if (asset.contentType === 'application/pdf') return `[PDF](${asset.url})`;
  return `![${asset.altText}](${asset.url}${asset.caption ? ` "${asset.caption}"` : ''})`;
}

function AssetItem({ asset }: { asset: AssetRow }) {
  const router = useRouter();
  const toast = useToast();
  const [alt, setAlt] = useState(asset.altText);
  const [caption, setCaption] = useState(asset.caption ?? '');
  const isImage = asset.contentType.startsWith('image/');
  return (
    <li className="grid gap-3 border-t border-rule py-4 sm:grid-cols-[8rem_1fr]">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset.url}
          alt={asset.altText}
          className="max-h-28 w-full border border-rule object-contain"
        />
      ) : (
        <span className="meta">{asset.contentType}</span>
      )}
      <div className="min-w-0 space-y-2">
        <p className="meta break-all">
          {asset.url} · {(asset.size / 1024).toFixed(0)} KB
          {asset.width ? ` · ${asset.width}×${asset.height}` : ''}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="meta">alt text{isImage ? ' (required)' : ''}</span>
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="mt-0.5 w-full rounded border border-rule bg-bg px-2 py-1 text-sm"
            />
          </label>
          <label className="block">
            <span className="meta">caption / label</span>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-0.5 w-full rounded border border-rule bg-bg px-2 py-1 text-sm"
            />
          </label>
        </div>
        <p className="meta">Used in: {asset.usedIn.length ? asset.usedIn.join(', ') : 'nothing'}</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            className="text-accent underline"
            onClick={async () => {
              const r = await updateAssetAction(asset.id, alt, caption);
              toast(r.ok ? 'Saved' : Object.values(r.errors).join('; '), r.ok ? 'ok' : 'error');
            }}
          >
            save
          </button>
          <button
            type="button"
            className="text-accent underline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(snippetFor(asset));
                toast('Markdown copied');
              } catch {
                toast(snippetFor(asset));
              }
            }}
          >
            copy markdown
          </button>
          <button
            type="button"
            className="text-muted underline hover:text-red-700"
            onClick={async () => {
              if (!window.confirm('Delete this file permanently?')) return;
              const r = await deleteAssetAction(asset.id);
              if (!r.ok) return toast(Object.values(r.errors).join('; '), 'error');
              toast('Deleted');
              router.refresh();
            }}
          >
            delete
          </button>
        </div>
      </div>
    </li>
  );
}

export function AssetManager({ assets }: { assets: AssetRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-rule px-3 py-1.5 text-sm hover:border-accent"
      >
        + Upload (PNG, JPEG, WebP, PDF, figure JSON · max 4 MB)
      </button>
      <ul className="mt-4">
        {assets.map((asset) => (
          <AssetItem key={asset.id} asset={asset} />
        ))}
      </ul>
      {open && (
        <UploadDialog
          accept="image/png,image/jpeg,image/webp,application/pdf,application/json,.json"
          onClose={() => setOpen(false)}
          onUploaded={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
