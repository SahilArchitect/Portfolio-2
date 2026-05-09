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
        <p className="font-mono text-[10px] uppercase tracking-[2px] text-warning">{formatMonth(entry.updatedAt)}</p>

        <Link href="/now" data-cursor="hover" className="group">
          <h3 className="mt-1 font-display text-[20px] font-bold uppercase tracking-[2px] text-fg group-hover:text-accent [font-family:Orbitron,monospace]">
            {entry.headline}
          </h3>
        </Link>

        <p className="mt-3 font-mono text-[12px] leading-7 text-fg/65">{bodyPreview}</p>

        {entry.mood && (
          <span className="cyber-tag mt-4 inline-block">
            {entry.mood}
          </span>
        )}
      </div>
    </div>
  );
}
