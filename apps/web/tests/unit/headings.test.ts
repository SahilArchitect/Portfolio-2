import { describe, expect, it } from 'vitest';

import { renderMarkdown } from '@/lib/markdown/render';

async function tags(md: string, headingOffset: number) {
  const { blocks } = await renderMarkdown(md, { headingOffset });
  const html = blocks.map((b) => (b.kind === 'html' ? b.html : '')).join('');
  return [...html.matchAll(/<(h[1-6])/g)].map((m) => m[1]);
}

describe('heading normalisation', () => {
  it('maps the top heading to offset + 1 whether the author used # or ##', async () => {
    expect(await tags('# A\n\n## B', 1)).toEqual(['h2', 'h3']);
    expect(await tags('## A\n\n### B', 1)).toEqual(['h2', 'h3']);
    expect(await tags('## A\n\n### B', 2)).toEqual(['h3', 'h4']);
  });
});
