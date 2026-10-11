import { describe, expect, it } from 'vitest';

import { findTodos, hasTodo, publishProblems, titleFor, validateData } from '@/lib/content/schemas';
import { visibleProfile } from '@/lib/content/profile';
import { defaultData } from '@/lib/content/defaults';
import { CONTENT_TYPES } from '@/lib/content/schemas';

describe('content schemas', () => {
  it('accepts every default draft', () => {
    for (const type of CONTENT_TYPES) {
      expect(validateData(type, defaultData(type)).ok, type).toBe(true);
    }
  });

  it('rejects malformed months but allows TODO markers in drafts', () => {
    const base = { title: 'X', projectStatus: 'ongoing' } as const;
    expect(validateData('project', { ...base, startMonth: '2026-13' }).ok).toBe(false);
    expect(validateData('project', { ...base, startMonth: 'Oct 2026' }).ok).toBe(false);
    expect(validateData('project', { ...base, startMonth: '2026-10' }).ok).toBe(true);
    expect(validateData('project', { ...base, startMonth: 'TODO: month' }).ok).toBe(true);
  });

  it('limits log entries to 200 characters', () => {
    expect(validateData('log', { date: '2026-10-11', text: 'a'.repeat(200) }).ok).toBe(true);
    const tooLong = validateData('log', { date: '2026-10-11', text: 'a'.repeat(201) });
    expect(tooLong.ok).toBe(false);
    if (!tooLong.ok) expect(Object.keys(tooLong.errors)).toContain('text');
  });

  it('rejects javascript: and other non-http URLs', () => {
    const r = validateData('log', { date: '2026-10-11', text: 'x', url: 'javascript:alert(1)' });
    expect(r.ok).toBe(false);
    expect(
      validateData('log', { date: '2026-10-11', text: 'x', url: 'https://example.org' }).ok,
    ).toBe(true);
  });

  it('finds TODO markers anywhere and blocks publishing', () => {
    const data = {
      title: 'T',
      sections: { method: 'fine', results: 'TODO: add table' },
      tags: ['TODO: tag'],
    };
    expect(findTodos(data)).toEqual(['sections.results', 'tags[0]']);
    expect(hasTodo('nothing here')).toBe(false);
    expect(publishProblems('note', data)).toHaveLength(2);
  });

  it('requires a summary and thumbnail alt text to publish a project', () => {
    const problems = publishProblems('project', {
      title: 'P',
      summary: '',
      startMonth: '2026-01',
      projectStatus: 'ongoing',
      thumbnailUrl: 'https://x.public.blob.vercel-storage.com/a.png',
      thumbnailAlt: '',
    });
    expect(problems.join(' ')).toMatch(/summary/);
    expect(problems.join(' ')).toMatch(/thumbnailAlt/);
  });

  it('derives titles per type', () => {
    expect(titleFor('teaching', { course: 'ML', institution: 'IIT Jammu' })).toBe('ML · IIT Jammu');
    expect(titleFor('reproduction', { paperTitle: 'Paper' })).toBe('Paper');
  });

  it('hides TODO fields, an unreviewed bio and the location from the public profile', () => {
    const parsed = validateData('profile', {
      name: 'S',
      bioMarkdown: 'bio',
      bioReviewed: false,
      interests: ['TODO: review', 'Model extraction'],
      email: 'a@b.dev',
      location: 'Amsterdam',
      showLocation: false,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const visible = visibleProfile(parsed.data);
    expect(visible.bioMarkdown).toBe('');
    expect(visible.interests).toEqual(['Model extraction']);
    expect(visible.location).toBe('');
    expect(visibleProfile({ ...parsed.data, bioReviewed: true }).bioMarkdown).toBe('bio');
  });
});
