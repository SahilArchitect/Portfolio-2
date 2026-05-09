'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { cn } from '@engine-room/ui';
import { commandPaletteEnter } from '@engine-room/ui/motion';

const COMMANDS = [
  { label: 'Dashboard', href: '/', group: 'Navigate' },
  { label: 'Projects', href: '/content/projects', group: 'Content' },
  { label: 'Now entries', href: '/content/now', group: 'Content' },
  { label: 'Hero A/B test', href: '/content/hero', group: 'Content' },
  { label: 'Resume variants', href: '/content/resumes', group: 'Content' },
  { label: 'Substack ingestion', href: '/substack', group: 'Operations' },
  { label: 'Inquiries', href: '/inquiries', group: 'Operations' },
  { label: 'LLM cost monitor', href: '/llm', group: 'Operations' },
  { label: 'Feature flags', href: '/flags', group: 'Operations' },
  { label: 'Analytics', href: '/analytics', group: 'Operations' },
] as const satisfies ReadonlyArray<{ label: string; href: Route; group: string }>;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function select(href: Route) {
    router.push(href);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-cursor="hover"
        className="hidden min-h-11 items-center gap-2 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[2px] text-fg-muted hover:border-border-strong hover:text-accent sm:flex"
      >
        <SearchIcon className="h-3.5 w-3.5" />
        Command
        <kbd className="border border-border px-1 text-fg-muted">⌘K</kbd>
      </button>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              key="command-backdrop"
              type="button"
              aria-label="Close command palette"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-overlay bg-bg/90 backdrop-blur"
            />
            <motion.div
              key="command-palette"
              variants={commandPaletteEnter}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-1/2 top-20 z-modal w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
            >
              <Command className="cyber-panel">
                <div className="flex items-center border-b border-border px-4">
                  <SearchIcon className="mr-3 h-4 w-4 text-fg-muted" />
                  <Command.Input
                    autoFocus
                    placeholder="Jump to route or action"
                    className="h-12 flex-1 bg-transparent font-mono text-body-sm text-fg placeholder:text-fg-muted focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="border border-border px-2 py-1 font-mono text-mono-sm text-fg-muted hover:border-border-strong hover:text-accent"
                  >
                    Esc
                  </button>
                </div>
                <Command.List className="max-h-96 overflow-y-auto p-2">
                  <Command.Empty className="px-3 py-8 text-center font-mono text-mono-sm text-fg-muted">
                    No command found.
                  </Command.Empty>
                  {['Navigate', 'Content', 'Operations'].map((group) => (
                    <Command.Group key={group} heading={group} className={groupClass}>
                      {COMMANDS.filter((item) => item.group === group).map((item) => (
                        <Command.Item
                          key={item.href}
                          value={item.label}
                          onSelect={() => select(item.href)}
                          className={itemClass}
                        >
                          <PageIcon className="mr-3 h-4 w-4 text-fg-muted" />
                          <span>{item.label}</span>
                          <span className="ml-auto font-mono text-mono-sm text-fg-muted">
                            {item.href}
                          </span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>
              </Command>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

const groupClass =
  'mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-mono-sm [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-fg-muted';

const itemClass = cn(
  'flex cursor-pointer items-center px-3 py-2.5 font-mono text-body-sm text-fg',
  'hover:bg-accent-muted data-[selected=true]:bg-accent-muted data-[selected=true]:text-accent',
);

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path d="M4 2.5h5l3 3v8H4v-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 2.5v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
