import { describe, expect, it } from 'vitest';

import type { Entry } from '@/db/schema';
import { toPublic } from '@/lib/content/visibility';

function row(overrides: Partial<Entry>): Entry {
  return {
    id: 'id',
    type: 'note',
    slug: 's',
    title: 'Note',
    status: 'published',
    data: { title: 'Note', date: '2026-10-11', tags: [], bodyMarkdown: 'Body' },
    sortOrder: 0,
    publishedAt: new Date('2026-10-01'),
    publishAt: null,
    createdAt: new Date('2026-10-01'),
    updatedAt: new Date('2026-10-01'),
    ...overrides,
  };
}
const now = new Date('2026-10-11T12:00:00Z');

describe('public visibility gate', () => {
  it('shows published, valid, TODO-free entries', () => {
    expect(toPublic('note', row({}), now)?.slug).toBe('s');
  });
  it('hides drafts and archived entries', () => {
    expect(toPublic('note', row({ status: 'draft' }), now)).toBeNull();
    expect(toPublic('note', row({ status: 'archived' }), now)).toBeNull();
  });
  it('hides entries with TODO: anywhere', () => {
    expect(
      toPublic(
        'note',
        row({ data: { title: 'Note', date: '2026-10-11', bodyMarkdown: 'TODO: write' } }),
        now,
      ),
    ).toBeNull();
    expect(toPublic('note', row({ title: 'TODO: title' }), now)).toBeNull();
  });
  it('hides entries scheduled in the future', () => {
    expect(toPublic('note', row({ publishAt: new Date('2026-10-12') }), now)).toBeNull();
    expect(toPublic('note', row({ publishAt: new Date('2026-10-10') }), now)).not.toBeNull();
  });
  it('hides rows that fail schema validation or belong to another type', () => {
    expect(toPublic('note', row({ data: { title: 'x' } }), now)).toBeNull();
    expect(toPublic('project', row({}), now)).toBeNull();
  });
});
