'use client';

import { cn } from '@engine-room/ui';
import type { ActionResult } from '@/lib/api';

export const inputClass = cn(
  'w-full rounded-md border border-border bg-bg px-3 py-2 font-display text-body-sm text-fg',
  'placeholder:text-fg-muted focus:border-border-strong focus:outline-none',
);

export const textareaClass = cn(
  inputClass,
  'min-h-28 resize-y font-mono text-mono-sm',
);

export const labelClass = 'font-mono text-micro uppercase tracking-wider text-fg-muted';

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('grid gap-1.5', className)}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function SubmitButton({ children, pending }: { children: React.ReactNode; pending?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      data-cursor="hover"
      className="rounded-md border border-border-strong bg-accent-muted px-3 py-2 font-mono text-mono-sm font-medium text-fg hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Saving...' : children}
    </button>
  );
}

export function SecondaryButton({
  children,
  type = 'button',
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-cursor="hover"
      className="rounded-md border border-border px-3 py-2 font-mono text-mono-sm text-fg-muted hover:border-border-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function ActionStatus({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return (
    <p className={cn('font-mono text-mono-sm', result.ok ? 'text-success' : 'text-danger')}>
      {result.message}
    </p>
  );
}
