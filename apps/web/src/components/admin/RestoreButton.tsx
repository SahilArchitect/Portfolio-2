'use client';

import { useRouter } from 'next/navigation';

import { restoreRevisionAction } from '@/app/admin/actions';

import { useToast } from './Toaster';

export function RestoreButton({
  revisionId,
  entryPath,
}: {
  revisionId: string;
  entryPath: string;
}) {
  const router = useRouter();
  const toast = useToast();
  return (
    <button
      type="button"
      className="text-sm text-accent underline"
      onClick={async () => {
        if (!window.confirm('Restore this revision? The current version stays in the history.'))
          return;
        const result = await restoreRevisionAction(revisionId);
        if (!result.ok) return toast(Object.values(result.errors).join('; '), 'error');
        toast('Revision restored');
        router.push(entryPath);
        router.refresh();
      }}
    >
      restore
    </button>
  );
}
