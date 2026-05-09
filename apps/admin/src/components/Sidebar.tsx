'use client';

import { motion, useReducedMotion } from 'framer-motion';
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
  const reducedMotion = useReducedMotion();

  return (
    <motion.aside
      className={cn(
        'border-border bg-bg/85 relative z-[2] flex h-dvh w-60 shrink-0 flex-col overflow-hidden border-r backdrop-blur-xl',
        className,
      )}
      initial={reducedMotion ? false : { opacity: 0, x: -24 }}
      animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="border-accent/20 bg-accent/5 pointer-events-none absolute -left-24 top-28 h-48 w-48 rotate-45 border"
        aria-hidden
        animate={reducedMotion ? undefined : { rotateZ: [45, 70, 45], y: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="border-border flex h-16 items-center border-b px-4">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: -8 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35 }}
        >
          <p className="font-display text-accent text-[13px] font-black uppercase tracking-[4px] [font-family:Orbitron,monospace] [text-shadow:0_0_20px_var(--accent)]">
            SAHIL.ADMIN
          </p>
          <p className="text-fg-muted font-mono text-[10px] uppercase tracking-[2px]">
            Ops console
          </p>
        </motion.div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin navigation">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item, index) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <motion.li
                key={item.href}
                initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * index, duration: 0.24 }}
                whileHover={reducedMotion ? undefined : { x: 4 }}
              >
                <Link
                  href={item.href}
                  data-cursor="hover"
                  className={cn(
                    'flex min-h-11 items-center gap-2 border px-2.5 font-mono text-[12px] uppercase tracking-[1px] transition',
                    active
                      ? 'border-border-strong bg-accent-muted text-accent shadow-[0_0_18px_rgba(0,255,242,0.08)]'
                      : 'text-fg-muted hover:border-border hover:bg-bg-elev hover:text-accent border-transparent',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>
      <div className="border-border border-t px-4 py-3">
        <p className="text-fg-muted font-mono text-[10px] uppercase leading-5 tracking-[2px]">
          Token-auth API calls. No client secrets.
        </p>
      </div>
    </motion.aside>
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
  return baseIcon(
    <path
      d="M2.5 2.5h4v4h-4v-4zM9.5 2.5h4v4h-4v-4zM2.5 9.5h4v4h-4v-4zM9.5 9.5h4v4h-4v-4z"
      stroke="currentColor"
      strokeWidth="1.5"
    />,
    className,
  );
}

function StackIcon({ className }: IconProps) {
  return baseIcon(
    <path
      d="M8 2l5.5 3L8 8 2.5 5 8 2zM3 8l5 2.75L13 8M3 11l5 2.75L13 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />,
    className,
  );
}

function CircleIcon({ className }: IconProps) {
  return baseIcon(
    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />,
    className,
  );
}

function PointerIcon({ className }: IconProps) {
  return baseIcon(
    <path
      d="M3 2.5l9.5 4-4 1.5-1.5 4L3 2.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />,
    className,
  );
}

function FileIcon({ className }: IconProps) {
  return baseIcon(
    <path
      d="M4 2.5h5l3 3v8H4v-11zM9 2.5v3h3M6 8h4M6 10.5h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />,
    className,
  );
}

function FeedIcon({ className }: IconProps) {
  return baseIcon(
    <path
      d="M3 4.5a8.5 8.5 0 018.5 8.5M3 8a5 5 0 015 5M4 12.25a.75.75 0 100 1.5.75.75 0 000-1.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />,
    className,
  );
}

function InboxIcon({ className }: IconProps) {
  return baseIcon(
    <path
      d="M2.5 5.5h11v7h-11v-7zM2.5 5.5l2-3h7l2 3M5 9h1.5l1 1.5h1L9.5 9H11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />,
    className,
  );
}

function PulseIcon({ className }: IconProps) {
  return baseIcon(
    <path
      d="M2 8h2.5l1.25-3 3 7 1.5-4H14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    className,
  );
}

function FlagIcon({ className }: IconProps) {
  return baseIcon(
    <path
      d="M4 14V2.5h7.5l-1 2 1 2H4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />,
    className,
  );
}

function ChartIcon({ className }: IconProps) {
  return baseIcon(
    <path
      d="M3 13.5h10M4.5 11V7M8 11V3M11.5 11V5.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />,
    className,
  );
}
