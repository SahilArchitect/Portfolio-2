import 'server-only';

import { loadBitflipData } from '@/lib/content/public';

import type { RenderBlock } from './render';

/** Loads (validated) data for every figure referenced in the blocks, keyed by source URL. */
export async function loadFigureData(blocks: RenderBlock[]) {
  const sources = [...new Set(blocks.flatMap((b) => (b.kind === 'figure' ? [b.figure.data] : [])))];
  const loaded = await Promise.all(
    sources.map(async (src) => [src, await loadBitflipData(src)] as const),
  );
  return Object.fromEntries(loaded);
}
