'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

export type NoteListItem = { slug: string; title: string; date: string; tags: string[]; minutes: number };

/** Client-side tag filter and title search. Press "/" to focus the search box. */
export function NotesList({ notes }: { notes: NoteListItem[] }) {
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const search = useRef<HTMLInputElement>(null);
  const tags = useMemo(() => [...new Set(notes.flatMap((n) => n.tags))].sort(), [notes]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        search.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const shown = notes.filter(
    (n) => (!tag || n.tags.includes(tag)) && (!q || n.title.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q))),
  );

  return (
    <div className="mt-6">
      <label className="meta flex items-center gap-2 rounded border border-rule px-2 py-1.5 focus-within:border-accent">
        <span aria-hidden="true">/</span>
        <span className="sr-only">Search notes</span>
        <input
          ref={search}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="search notes (press /)"
          className="w-full bg-transparent text-fg outline-none placeholder:text-muted"
        />
      </label>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1" role="group" aria-label="Filter by tag">
          <button type="button" onClick={() => setTag(null)} aria-pressed={tag === null} className={`chip cursor-pointer ${tag === null ? 'text-fg' : 'text-accent'}`}>
            all
          </button>
          {tags.map((t) => (
            <button key={t} type="button" onClick={() => setTag(tag === t ? null : t)} aria-pressed={tag === t} className={`chip cursor-pointer ${tag === t ? 'font-semibold text-fg' : 'text-accent'}`}>
              {t}
            </button>
          ))}
        </div>
      )}
      <ul className="mt-5">
        {shown.map((note) => (
          <li key={note.slug} className="border-t border-rule py-3">
            <Link href={`/notes/${note.slug}`} className="font-semibold text-fg no-underline hover:text-accent hover:underline">
              {note.title}
            </Link>
            <p className="meta mt-0.5">
              {[note.date, note.tags.join(', '), `${note.minutes} min`].filter(Boolean).join(' · ')}
            </p>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="mt-4 text-muted">No notes match.</p>}
    </div>
  );
}
