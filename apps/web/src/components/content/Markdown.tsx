import { renderMarkdownCached } from '@/lib/markdown/cached';
import { loadFigureData } from '@/lib/markdown/figures';

import { MarkdownBlocks } from './MarkdownBlocks';

export async function Markdown({
  source,
  headingOffset = 1,
}: {
  source: string;
  headingOffset?: number;
}) {
  if (!source.trim()) return null;
  const { blocks } = await renderMarkdownCached(source, headingOffset);
  return <MarkdownBlocks blocks={blocks} figures={await loadFigureData(blocks)} />;
}
