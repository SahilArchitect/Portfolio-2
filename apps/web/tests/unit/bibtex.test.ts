import { describe, expect, it } from 'vitest';

import { citationKey, escapeBibtex, toBibtex } from '@/lib/bibtex';

describe('bibtex', () => {
  it('builds a key from surname, year and first meaningful word', () => {
    expect(citationKey('Sahil Bhatti', 2026, 'On the Bit-Flip Robustness of DNNs')).toBe(
      'bhatti2026bit',
    );
  });

  it('escapes special characters', () => {
    expect(escapeBibtex('50% of A & B_c {x} #1 $')).toBe('50\\% of A \\& B\\_c \\{x\\} \\#1 \\$');
  });

  it('produces a well-formed @misc entry', () => {
    const bib = toBibtex({
      key: 'bhatti2026fault',
      author: 'Sahil Bhatti',
      title: 'Fault attacks & defenses',
      year: 2026,
      url: 'https://www.bysahil.dev/research/x',
    });
    expect(bib).toMatch(/^@misc\{bhatti2026fault,\n/);
    expect(bib).toContain('title = {{Fault attacks \\& defenses}}');
    expect(bib).toContain('url = {https://www.bysahil.dev/research/x}');
    expect(bib.trim().endsWith('}')).toBe(true);
    // Balanced braces
    expect(bib.replace(/\\[{}]/g, '').split('{').length).toBe(
      bib.replace(/\\[{}]/g, '').split('}').length,
    );
  });
});
