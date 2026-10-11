import { describe, expect, it } from 'vitest';

import { slugify, uniqueSlug } from '@/lib/slug';

describe('slugify', () => {
  it('lowercases, strips accents and punctuation', () => {
    expect(slugify('Fault Injection: Bit-Flips & DNNs!')).toBe(
      'fault-injection-bit-flips-and-dnns',
    );
    expect(slugify('Über Café — Résumé')).toBe('uber-cafe-resume');
    expect(slugify('  --Hello--  ')).toBe('hello');
    expect(slugify('日本語')).toBe('');
  });

  it('cuts long titles at a word boundary', () => {
    const slug = slugify('a'.repeat(30) + ' ' + 'b'.repeat(30) + ' ' + 'c'.repeat(30), 80);
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith('-')).toBe(false);
  });

  it('makes slugs unique', () => {
    expect(uniqueSlug('note', new Set())).toBe('note');
    expect(uniqueSlug('note', new Set(['note', 'note-2']))).toBe('note-3');
    expect(uniqueSlug('', new Set())).toBe('untitled');
  });
});
