'use client';

import { cn } from '@engine-room/ui';

type Status = 'new' | 'read' | 'replied' | 'spam' | 'published' | 'draft' | 'archived' | string;

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-accent-muted text-accent',
  read: 'bg-[var(--bg-elev)] text-fg-muted border border-border',
  replied: 'bg-[rgba(74,222,128,0.12)] text-success',
  spam: 'bg-[rgba(248,113,113,0.12)] text-danger',
  published: 'bg-[rgba(74,222,128,0.12)] text-success',
  draft: 'bg-[var(--bg-elev)] text-fg-muted border border-border',
  archived: 'bg-[rgba(248,113,113,0.12)] text-danger',
};

interface StatusPillProps {
  status: Status;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const styles = STATUS_STYLES[status] ?? 'bg-[var(--bg-elev)] text-fg-muted border border-border';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-mono-sm font-medium uppercase tracking-wider',
        styles,
        className,
      )}
    >
      {status}
    </span>
  );
}
