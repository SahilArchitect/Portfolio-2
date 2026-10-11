import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { CONTENT_TAG, getImageDims } from '@/lib/content/public';

import { renderMarkdown, type Rendered } from './render';

/**
 * Markdown rendering for public pages, cached per (source, heading offset).
 * Rendering is pure, so caching it is safe; it also keeps the renderer's
 * internals (Shiki, KaTeX) out of the prerender's "unstable value" checks.
 */
export async function renderMarkdownCached(
  source: string,
  headingOffset: number,
): Promise<Rendered> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('max');
  return renderMarkdown(source, { headingOffset, imageDims: await getImageDims() });
}
