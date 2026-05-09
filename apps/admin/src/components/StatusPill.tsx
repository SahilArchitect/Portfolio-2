'use client';

import { cn } from '@engine-room/ui';

type Status = 'new' | 'read' | 'replied' | 'spam' | 'published' | 'draft' | 'archived' | string;

const STATUS_STYLES: Record<string, string> = {
  new: 'border border-border-strong bg-accent-muted text-accent',
  read: 'border border-border bg-bg-elev text-fg-muted',
  replied: 'border border-success/40 bg-[rgba(0,255,65,0.12)] text-success',
  spam: 'border border-danger/40 bg-[rgba(248,113,113,0.12)] text-danger',
  published: 'border border-success/40 bg-[rgba(0,255,65,0.12)] text-success',
  draft: 'border border-border bg-bg-elev text-fg-muted',
  archived: 'border border-danger/40 bg-[rgba(248,113,113,0.12)] text-danger',
};

interface StatusPillProps {
  status: Status;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const styles = STATUS_STYLES[status] ?? 'border border-border bg-bg-elev text-fg-muted';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[2px]',
        styles,
        className,
      )}
    >
      {status}
    </span>
  );
}
