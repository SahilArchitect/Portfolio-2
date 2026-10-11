import { describe, expect, it } from 'vitest';

import { educationSchema } from '@/lib/content/schemas';
import { renderMarkdown } from '@/lib/markdown/render';

async function html(md: string, offset = 0) {
  const { blocks } = await renderMarkdown(md, { headingOffset: offset });
  return blocks
    .map((b) => (b.kind === 'html' ? b.html : `[figure ${b.figure.type} ${b.figure.data}]`))
    .join('\n');
}

describe('markdown renderer — sanitization', () => {
  it('drops raw HTML including <script>', async () => {
    const out = await html(
      'Hello <script>alert(1)</script> world\n\n<img src=x onerror=alert(1)>\n\n<iframe src="https://evil"></iframe>',
    );
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/onerror/i);
    expect(out).not.toMatch(/<iframe/i);
    expect(out).toContain('Hello');
  });

  it('strips javascript:, data: and vbscript: links', async () => {
    const out = await html(
      '[a](javascript:alert(1)) [b](data:text/html,x) [c](vbscript:x) [d](https://ok.org)',
    );
    expect(out).not.toMatch(/javascript:/i);
    expect(out).not.toMatch(/data:text/i);
    expect(out).not.toMatch(/vbscript:/i);
    expect(out).toContain('href="https://ok.org"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it('strips javascript: image sources', async () => {
    const out = await html('![x](javascript:alert(1))');
    expect(out).not.toMatch(/javascript:/i);
  });

  it('does not let directives inject attributes', async () => {
    const out = await html(
      '::figure{type="bitflip-curve" data="/x.json" onclick="alert(1)"}\n\n::evil{onload="x"}',
    );
    expect(out).not.toMatch(/onclick|onload/);
    expect(out).toContain('[figure bitflip-curve /x.json]');
  });
});

describe('markdown renderer — features', () => {
  it('renders GFM tables, task lists and footnotes', async () => {
    const out = await html(
      '| a | b |\n|---|---|\n| 1 | 2 |\n\n- [x] done\n\nText[^1]\n\n[^1]: Note.',
    );
    expect(out).toContain('<table>');
    expect(out).toContain('type="checkbox"');
    expect(out).toMatch(/footnote/);
  });

  it('renders KaTeX math', async () => {
    const out = await html('Inline $E=mc^2$ and\n\n$$\n\\sum_i x_i\n$$');
    expect(out).toContain('class="katex"');
    expect(out).toContain('katex-display');
  });

  it('highlights code with Shiki in both themes', async () => {
    const out = await html('```python\nprint("hi")\n```');
    expect(out).toContain('class="shiki');
    expect(out).toContain('--shiki-dark');
  });

  it('turns a lone image into a numbered figure with caption', async () => {
    const out = await html(
      '![Accuracy plot](https://x.public.blob.vercel-storage.com/a.png "Accuracy vs bits")',
    );
    expect(out).toMatch(
      /<figure><img[^>]*alt="Accuracy plot"[^>]*><figcaption>Accuracy vs bits<\/figcaption><\/figure>/,
    );
    expect(out).not.toMatch(/title=/);
  });

  it('offsets heading levels and collects headings', async () => {
    const { headings, blocks } = await renderMarkdown('# Top\n\n## Sub', { headingOffset: 1 });
    const out = blocks.map((b) => (b.kind === 'html' ? b.html : '')).join('');
    expect(out).toContain('<h2 id="top">Top</h2>');
    expect(out).toContain('<h3 id="sub">Sub</h3>');
    expect(headings.map((h) => h.id)).toEqual(['top', 'sub']);
  });

  it('keeps ordinary colons in prose', async () => {
    const out = await html('Ratio:high and note:this stay intact.');
    expect(out).toContain('Ratio:high');
    expect(out).toContain('note:this');
  });

  it('ignores unknown figure types', async () => {
    const { blocks } = await renderMarkdown('::figure{type="iframe" data="https://evil"}');
    expect(blocks.some((b) => b.kind === 'figure')).toBe(false);
  });
});

describe('markdown renderer — CV free-text fields', () => {
  it('renders a Markdown link in Education notes as an <a> tag', async () => {
    const { notes } = educationSchema.parse({
      degree: 'B.Tech',
      institution: 'Example University',
      startMonth: '2020-08',
      notes: 'Thesis: [PDF](https://example.org/thesis.pdf)',
    });
    // Same heading offset as the public <Markdown> component.
    const out = await html(notes ?? '', 1);
    expect(out).toMatch(/<a [^>]*href="https:\/\/example\.org\/thesis\.pdf"[^>]*>PDF<\/a>/);
    expect(out).not.toContain('[PDF]');
  });
});
