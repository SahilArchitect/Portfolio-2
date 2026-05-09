'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { cn } from '@engine-room/ui';

import { SearchIcon } from './Icons';

type WritingSearchProps = {
  q?: string;
  semantic?: string;
  activeTag?: string;
  tags: string[];
};

export function WritingSearch({ q, semantic, activeTag, tags }: WritingSearchProps) {
  const [query, setQuery] = useState(q ?? semantic ?? '');
  const [semanticMode, setSemanticMode] = useState(Boolean(semantic));
  const router = useRouter();

  function submit() {
    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) params.set(semanticMode ? 'semantic' : 'q', trimmed);
    if (activeTag) params.set('tag', activeTag);
    const qs = params.toString();
    router.push(qs ? `/writing?${qs}` : '/writing');
  }

  return (
    <div className="cyber-panel p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label className="sr-only" htmlFor="writing-search">Search writing</label>
        <div className="flex min-h-11 flex-1 items-center border border-border bg-bg px-3 focus-within:border-border-strong">
          <SearchIcon className="mr-3 h-4 w-4 shrink-0 text-fg-muted" />
          <input
            id="writing-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                event.stopPropagation();
                setSemanticMode((value) => !value);
              }
            }}
            placeholder="Search essays, systems notes, and Substack mirrors"
            className="h-11 flex-1 bg-transparent font-mono text-body text-fg placeholder:text-fg-muted focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setSemanticMode((value) => !value)}
          data-cursor="hover"
          className={cn(
            'min-h-11 border px-3 py-2 font-mono text-mono-sm',
            semanticMode ? 'border-border-strong text-accent' : 'border-border text-fg-muted hover:text-accent',
          )}
        >
          {semanticMode ? 'Semantic on' : 'Full-text'}
        </button>
        <button
          type="submit"
          data-cursor="hover"
          className="cyber-button px-4 py-2"
        >
          <span>Search</span>
        </button>
      </form>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/writing"
            data-cursor="hover"
            className={cn(
              'border px-2.5 py-0.5 font-mono text-mono-sm',
              !activeTag ? 'border-border-strong text-accent' : 'border-border text-fg-muted hover:text-accent',
            )}
          >
            All
          </Link>
          {tags.map((tag) => {
            const params = new URLSearchParams();
            params.set('tag', tag);
            if (q) params.set('q', q);
            if (semantic) params.set('semantic', semantic);
            return (
              <Link
                key={tag}
                href={`/writing?${params.toString()}`}
                data-cursor="hover"
                className={cn(
                  'border px-2.5 py-0.5 font-mono text-mono-sm',
                  activeTag === tag ? 'border-border-strong text-accent' : 'border-border text-fg-muted hover:text-accent',
                )}
              >
                {tag}
              </Link>
            );
          })}
        </div>
      )}

      <p className="mt-4 font-mono text-mono-sm text-fg-muted">
        Focus the input and press Cmd/Ctrl K to toggle semantic search without opening the global palette.
      </p>
    </div>
  );
}
