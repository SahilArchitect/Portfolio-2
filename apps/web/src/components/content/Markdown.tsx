import { getImageDims } from '@/lib/content/public';
import { loadFigureData } from '@/lib/markdown/figures';
import { renderMarkdown } from '@/lib/markdown/render';

import { MarkdownBlocks } from './MarkdownBlocks';

export async function Markdown({
  source,
  headingOffset = 1,
}: {
  source: string;
  headingOffset?: number;
}) {
  if (!source.trim()) return null;
  const { blocks } = await renderMarkdown(source, {
    headingOffset,
    imageDims: await getImageDims(),
  });
  return <MarkdownBlocks blocks={blocks} figures={await loadFigureData(blocks)} />;
}
