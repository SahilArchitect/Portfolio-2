'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { cn } from '@engine-room/ui';
import { commandPaletteEnter } from '@engine-room/ui/motion';

import { clientFetchResume, clientSearchSite } from '@/lib/api';
import { CONTACT_EMAIL } from '@/lib/site';
import type { SearchResponseView } from '@/lib/view-models';
import { DownloadIcon, MailIcon, PageIcon, SearchIcon } from './Icons';

const NAVIGATION_ITEMS = [
  { label: 'Home', href: '/', shortcut: 'G H' },
  { label: 'Work', href: '/work', shortcut: 'G W' },
  { label: 'Writing', href: '/writing', shortcut: 'G B' },
  { label: 'Now', href: '/now', shortcut: 'G N' },
  { label: 'Traces', href: '/traces', shortcut: 'G T' },
  { label: 'Hire', href: '/hire', shortcut: 'G C' },
] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponseView | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSearchResult(null);
      setSearching(false);
    }
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResult(null);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        setSearchResult(await clientSearchSite(trimmed));
      } catch {
        setSearchResult({
          answer: 'Semantic search is unavailable right now. Navigation commands still work.',
          citations: [],
        });
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  const copyEmail = useCallback(() => {
    navigator.clipboard
      .writeText(CONTACT_EMAIL)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => undefined);
  }, []);

  const downloadResume = useCallback(async () => {
    try {
      const resume = await clientFetchResume();
      window.location.assign(resume.fileUrl);
    } catch {
      router.push('/hire#resume');
    } finally {
      setOpen(false);
    }
  }, [router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-cursor="hover"
        aria-label="Open command palette"
        className="border-border text-fg-muted hover:border-border-strong hover:text-accent hidden min-h-11 items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-[2px] transition sm:flex"
      >
        <span>Search</span>
        <kbd className="flex items-center gap-0.5 opacity-70">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        data-cursor="hover"
        aria-label="Open command palette"
        className="border-border text-fg-muted hover:border-border-strong hover:text-accent flex h-11 w-11 items-center justify-center border sm:hidden"
      >
        <SearchIcon className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="z-overlay bg-bg/90 fixed inset-0 backdrop-blur"
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="palette"
              variants={commandPaletteEnter}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="z-modal fixed left-1/2 top-24 w-[calc(100%-32px)] max-w-2xl -translate-x-1/2"
            >
              <Command label="Command palette" className="cyber-panel" shouldFilter={!query.trim()}>
                <div className="border-border flex items-center border-b px-4">
                  <SearchIcon className="text-fg-muted mr-3 h-4 w-4 shrink-0" />
                  <Command.Input
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Ask about projects, traces, writing..."
                    className="text-fg placeholder:text-fg-muted h-14 flex-1 bg-transparent font-mono text-[14px] focus:outline-none"
                  />
                  {searching && (
                    <span className="text-mono-sm text-fg-muted font-mono">Searching</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    data-cursor="hover"
                    className="border-border text-mono-sm text-fg-muted hover:border-border-strong hover:text-accent ml-3 border px-1.5 py-0.5 font-mono"
                  >
                    Esc
                  </button>
                </div>

                <Command.List className="max-h-96 overflow-y-auto p-2">
                  <Command.Empty className="text-mono-sm text-fg-muted px-4 py-8 text-center font-mono">
                    No command matched.
                  </Command.Empty>

                  {searchResult && (
                    <Command.Group heading="Semantic answer" className={groupClass}>
                      <div className="px-3 py-3">
                        <p className="text-body-sm text-fg">{searchResult.answer}</p>
                        {searchResult.citations.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {searchResult.citations.map((citation) => (
                              <a
                                key={citation.docId}
                                href={citation.url ?? '#'}
                                target={citation.url ? '_blank' : undefined}
                                rel={citation.url ? 'noopener noreferrer' : undefined}
                                className="border-border text-mono-sm text-fg-muted hover:border-border-strong hover:text-fg rounded-full border px-2.5 py-0.5 font-mono"
                              >
                                {citation.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </Command.Group>
                  )}

                  <Command.Group heading="Navigation" className={groupClass}>
                    {NAVIGATION_ITEMS.map((item) => (
                      <Command.Item
                        key={item.href}
                        value={item.label}
                        onSelect={() => {
                          router.push(item.href);
                          setOpen(false);
                        }}
                        data-cursor="hover"
                        className={itemClass}
                      >
                        <PageIcon className="text-fg-muted mr-3 h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <span className="text-mono-sm text-fg-muted font-mono opacity-70">
                          {item.shortcut}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  <Command.Group heading="Actions" className={groupClass}>
                    <Command.Item
                      value="copy email"
                      onSelect={copyEmail}
                      data-cursor="hover"
                      className={itemClass}
                    >
                      <MailIcon className="text-fg-muted mr-3 h-4 w-4 shrink-0" />
                      <span className="flex-1">
                        {copied ? 'Email copied' : 'Copy email address'}
                      </span>
                    </Command.Item>

                    <Command.Item
                      value="download resume"
                      onSelect={downloadResume}
                      data-cursor="hover"
                      className={itemClass}
                    >
                      <DownloadIcon className="text-fg-muted mr-3 h-4 w-4 shrink-0" />
                      <span className="flex-1">Download default resume</span>
                    </Command.Item>
                  </Command.Group>
                </Command.List>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const groupClass =
  'mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-mono-sm [&_[cmdk-group-heading]]:text-fg-muted';

const itemClass = cn(
  'text-fg flex cursor-pointer items-center px-3 py-2.5 font-mono text-[13px]',
  'hover:bg-accent-muted data-[selected=true]:bg-accent-muted data-[selected=true]:text-accent',
  'aria-selected:bg-accent-muted aria-selected:text-accent',
);
