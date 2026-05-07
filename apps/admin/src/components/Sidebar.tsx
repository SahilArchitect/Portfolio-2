'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@engine-room/ui';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: GridIcon },
  { label: 'Projects', href: '/content/projects', icon: StackIcon },
  { label: 'Now', href: '/content/now', icon: CircleIcon },
  { label: 'Hero', href: '/content/hero', icon: PointerIcon },
  { label: 'Resumes', href: '/content/resumes', icon: FileIcon },
  { label: 'Substack', href: '/substack', icon: FeedIcon },
  { label: 'Inquiries', href: '/inquiries', icon: InboxIcon },
  { label: 'LLM Cost', href: '/llm', icon: PulseIcon },
  { label: 'Flags', href: '/flags', icon: FlagIcon },
  { label: 'Analytics', href: '/analytics', icon: ChartIcon },
] as const;

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn('flex h-full w-56 shrink-0 flex-col border-r border-border bg-bg', className)}>
      <div className="flex h-14 items-center border-b border-border px-4">
        <div>
          <p className="font-mono text-micro font-semibold uppercase tracking-wider text-fg">
            Engine Room
          </p>
          <p className="font-mono text-mono-sm text-fg-muted">Admin console</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin navigation">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-cursor="hover"
                  className={cn(
                    'flex min-h-10 items-center gap-2 rounded-md px-2.5 font-display text-body-sm',
                    active
                      ? 'border border-border-strong bg-accent-muted text-fg'
                      : 'border border-transparent text-fg-muted hover:border-border hover:bg-bg-elev hover:text-fg',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-border px-4 py-3">
        <p className="font-mono text-mono-sm text-fg-muted">
          Token-auth API calls. No client secrets.
        </p>
      </div>
    </aside>
  );
}

export { NAV_ITEMS };

type IconProps = { className?: string };

function baseIcon(path: React.ReactNode, className?: string) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      {path}
    </svg>
  );
}

function GridIcon({ className }: IconProps) {
  return baseIcon(<path d="M2.5 2.5h4v4h-4v-4zM9.5 2.5h4v4h-4v-4zM2.5 9.5h4v4h-4v-4zM9.5 9.5h4v4h-4v-4z" stroke="currentColor" strokeWidth="1.5" />, className);
}

function StackIcon({ className }: IconProps) {
  return baseIcon(<path d="M8 2l5.5 3L8 8 2.5 5 8 2zM3 8l5 2.75L13 8M3 11l5 2.75L13 11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />, className);
}

function CircleIcon({ className }: IconProps) {
  return baseIcon(<circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />, className);
}

function PointerIcon({ className }: IconProps) {
  return baseIcon(<path d="M3 2.5l9.5 4-4 1.5-1.5 4L3 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />, className);
}

function FileIcon({ className }: IconProps) {
  return baseIcon(<path d="M4 2.5h5l3 3v8H4v-11zM9 2.5v3h3M6 8h4M6 10.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />, className);
}

function FeedIcon({ className }: IconProps) {
  return baseIcon(<path d="M3 4.5a8.5 8.5 0 018.5 8.5M3 8a5 5 0 015 5M4 12.25a.75.75 0 100 1.5.75.75 0 000-1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />, className);
}

function InboxIcon({ className }: IconProps) {
  return baseIcon(<path d="M2.5 5.5h11v7h-11v-7zM2.5 5.5l2-3h7l2 3M5 9h1.5l1 1.5h1L9.5 9H11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />, className);
}

function PulseIcon({ className }: IconProps) {
  return baseIcon(<path d="M2 8h2.5l1.25-3 3 7 1.5-4H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />, className);
}

function FlagIcon({ className }: IconProps) {
  return baseIcon(<path d="M4 14V2.5h7.5l-1 2 1 2H4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />, className);
}

function ChartIcon({ className }: IconProps) {
  return baseIcon(<path d="M3 13.5h10M4.5 11V7M8 11V3M11.5 11V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />, className);
}
