import { BitflipCurve } from '@/components/figures/BitflipCurve';
import type { BitflipData } from '@/lib/markdown/bitflip';
import type { RenderBlock } from '@/lib/markdown/render';

export type FigureDataMap = Record<string, BitflipData | null>;

/**
 * Renders sanitized HTML blocks and allow-listed interactive figures in
 * order. Shared by public pages and the admin preview, so preview = reality.
 * A figure whose data is missing or invalid renders nothing.
 */
export function MarkdownBlocks({
  blocks,
  figures,
}: {
  blocks: RenderBlock[];
  figures: FigureDataMap;
}) {
  const hasMath = blocks.some((b) => b.kind === 'html' && b.html.includes('class="katex'));
  return (
    <div className="space-y-4">
      {/* KaTeX styles only where math appears; React hoists this into <head>. */}
      {/* eslint-disable-next-line @next/next/no-css-tags -- intentional: loaded only on pages with math */}
      {hasMath && <link rel="stylesheet" href="/katex/katex.min.css" precedence="default" />}
      {blocks.map((block, index) => {
        if (block.kind === 'html') {
          return (
            <div key={index} className="prose" dangerouslySetInnerHTML={{ __html: block.html }} />
          );
        }
        const data = figures[block.figure.data];
        return data ? <BitflipCurve key={index} data={data} /> : null;
      })}
    </div>
  );
}
