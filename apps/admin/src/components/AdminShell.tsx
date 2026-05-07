'use client';

import { Sidebar } from '@/components/Sidebar';
import { CommandPalette } from '@/components/CommandPalette';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@engine-room/ui';

interface AdminShellProps {
  email: string;
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AdminShell({
  email,
  title,
  eyebrow = 'Admin',
  description,
  actions,
  children,
  className,
}: AdminShellProps) {
  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <Sidebar className="hidden lg:flex" />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-sticky border-b border-border bg-bg/95">
          <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
            <div className="min-w-0">
              <p className="truncate font-mono text-mono-sm text-fg-muted">{email}</p>
            </div>
            <div className="flex items-center gap-2">
              <CommandPalette />
              <ThemeToggle />
              <a
                href="/api/auth/signout"
                data-cursor="hover"
                className="rounded-md border border-border px-3 py-1.5 font-mono text-mono-sm text-fg-muted hover:border-border-strong hover:text-fg"
              >
                Sign out
              </a>
            </div>
          </div>
        </header>
        <main className={cn('mx-auto w-full max-w-7xl px-4 py-6 lg:px-6', className)}>
          <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">{eyebrow}</p>
              <h1 className="mt-2 font-display text-display-md font-medium text-fg">{title}</h1>
              {description ? <p className="mt-2 max-w-2xl text-body-sm text-fg-muted">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('rounded-lg border border-border bg-bg-elev p-4', className)}>{children}</section>;
}

export function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-display-sm font-medium text-fg">{title}</h2>
        {detail ? <p className="mt-1 text-body-sm text-fg-muted">{detail}</p> : null}
      </div>
    </div>
  );
}
