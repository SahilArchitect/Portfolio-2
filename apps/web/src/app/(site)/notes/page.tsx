import type { Metadata } from 'next';

import { NotesList } from '@/components/content/NotesList';
import { listPublic } from '@/lib/content/public';
import { readingMinutes } from '@/lib/dates';

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Paper-reading notes and short technical write-ups.',
  alternates: { canonical: '/notes' },
};

export default async function NotesIndex() {
  const notes = await listPublic('note');
  return (
    <div className="pt-6 sm:pt-10">
      <h1 className="text-[1.6rem] font-semibold">Notes</h1>
      <p className="mt-2 text-muted">Paper-reading notes and short technical write-ups.</p>
      {notes.length === 0 ? (
        <p className="mt-6 text-muted">Nothing published yet.</p>
      ) : (
        <NotesList
          notes={notes.map((n) => ({
            slug: n.slug,
            title: n.data.title,
            date: n.data.date,
            tags: n.data.tags,
            minutes: readingMinutes(n.data.bodyMarkdown),
          }))}
        />
      )}
    </div>
  );
}
