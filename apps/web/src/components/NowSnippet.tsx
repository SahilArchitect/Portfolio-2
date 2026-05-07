import Link from 'next/link';

import { cn } from '@engine-room/ui';

import { formatMonth } from '@/lib/format';
import type { NowEntryView } from '@/lib/view-models';

type NowSnippetProps = {
  entry: NowEntryView;
  className?: string;
};

export function NowSnippet({ entry, className }: NowSnippetProps) {
  const bodyPreview = entry.body.split('\n\n').slice(0, 2).join(' ').replace(/#+\s/g, '').trim();

  return (
    <div className={cn('flex gap-4', className)}>
      <div className="mt-1.5 shrink-0">
        <span className="block h-2 w-2 rounded-full bg-accent" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-mono text-mono-sm text-fg-muted">{formatMonth(entry.updatedAt)}</p>

        <Link href="/now" data-cursor="hover" className="group">
          <h3 className="mt-1 font-display text-display-sm font-medium text-fg group-hover:text-accent">
            {entry.headline}
          </h3>
        </Link>

        <p className="mt-3 text-body-sm text-fg-muted">{bodyPreview}</p>

        {entry.mood && (
          <span className="mt-4 inline-block rounded-full border border-border px-2.5 py-0.5 font-mono text-mono-sm text-fg-muted">
            {entry.mood}
          </span>
        )}
      </div>
    </div>
  );
}
