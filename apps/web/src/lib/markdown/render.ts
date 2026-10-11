import rehypeShiki from '@shikijs/rehype';
import type { Element, ElementContent, Root as HastRoot, RootContent } from 'hast';
import { toHtml } from 'hast-util-to-html';
import type { Paragraph, Root as MdastRoot, Text } from 'mdast';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit, SKIP } from 'unist-util-visit';

import { FIGURE_TYPES, isFigureType, type FigureType } from './figure-types';
import { sanitizeSchema } from './sanitize-schema';

export type FigureRef = { type: FigureType; data: string };
export type RenderBlock = { kind: 'html'; html: string } | { kind: 'figure'; figure: FigureRef };
export type Heading = { id: string; text: string; depth: number };
export type ImageDims = Record<string, { width: number; height: number } | undefined>;

export type RenderOptions = {
  /** Added to every heading level, e.g. 1 turns `#` into <h2>. */
  headingOffset?: number;
  /** Known dimensions of uploaded images, keyed by URL, for width/height attributes. */
  imageDims?: ImageDims;
};

export type Rendered = { blocks: RenderBlock[]; headings: Heading[] };

/**
 * `::figure{type="bitflip-curve" data="/..."}` becomes a placeholder element that
 * survives sanitization (only these two data attributes are allowed on <div>).
 * Unknown leaf/container directives are dropped; inline `:text` directives are
 * restored to literal text so prose like "ratio:high" is not swallowed.
 */
function remarkFigures() {
  return (tree: MdastRoot) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (node.type === 'textDirective') {
        const label = node.children
          .map((child) => ('value' in child ? String(child.value) : ''))
          .join('');
        const text: Text = { type: 'text', value: `:${node.name}${label ? `[${label}]` : ''}` };
        parent.children.splice(index, 1, text as never);
        return [SKIP, index];
      }
      if (node.type !== 'leafDirective' && node.type !== 'containerDirective') return;
      const type = node.attributes?.type ?? '';
      const data = node.attributes?.data ?? '';
      if (node.name === 'figure' && isFigureType(type) && data) {
        const placeholder: Paragraph = {
          type: 'paragraph',
          children: [],
          data: {
            hName: 'div',
            hProperties: { dataFigure: type, dataSrc: data },
          },
        };
        parent.children.splice(index, 1, placeholder as never);
        return [SKIP, index + 1];
      }
      parent.children.splice(index, 1);
      return [SKIP, index];
    });
  };
}

function isElement(node: RootContent | ElementContent | undefined, tag?: string): node is Element {
  return !!node && node.type === 'element' && (!tag || node.tagName === tag);
}

/** A paragraph holding only an image becomes a numbered <figure>; title -> caption. */
function rehypeFigures(options: { imageDims?: ImageDims }) {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'img') {
        const src = String(node.properties.src ?? '');
        const dims = options.imageDims?.[src];
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
        if (dims) {
          node.properties.width = dims.width;
          node.properties.height = dims.height;
        }
      }
      if (node.tagName !== 'p' || !parent || index === undefined) return;
      const meaningful = node.children.filter(
        (child) => !(child.type === 'text' && !child.value.trim()),
      );
      const img = meaningful[0];
      if (meaningful.length !== 1 || !isElement(img, 'img')) return;
      const caption = typeof img.properties.title === 'string' ? img.properties.title : '';
      delete img.properties.title;
      const figure: Element = {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [
          img,
          {
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: caption ? [{ type: 'text', value: caption }] : [],
          },
        ],
      };
      parent.children.splice(index, 1, figure);
    });
  };
}

function rehypeHeadingOffset(options: { offset: number }) {
  return (tree: HastRoot) => {
    if (!options.offset) return;
    visit(tree, 'element', (node) => {
      const match = /^h([1-6])$/.exec(node.tagName);
      if (match) node.tagName = `h${Math.min(6, Number(match[1]) + options.offset)}`;
    });
  };
}

/** External links open normally but never leak the referrer or grant opener access. */
function rehypeExternalLinks() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = String(node.properties.href ?? '');
      if (/^https?:\/\//i.test(href)) node.properties.rel = ['noopener', 'noreferrer'];
    });
  };
}

function textOf(node: ElementContent): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(textOf).join('');
  return '';
}

function buildProcessor(options: RenderOptions) {
  return (
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkDirective)
      .use(remarkFigures)
      // Raw HTML in Markdown is never passed through.
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(rehypeSanitize, sanitizeSchema)
      // Everything after this point is our own trusted transformation.
      .use(rehypeHeadingOffset, { offset: options.headingOffset ?? 0 })
      .use(rehypeSlug)
      .use(rehypeFigures, { imageDims: options.imageDims })
      .use(rehypeExternalLinks)
      .use(rehypeKatex, { strict: false, output: 'htmlAndMathml' })
      .use(rehypeShiki, {
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: false,
        lazy: true,
        fallbackLanguage: 'text',
      })
  );
}

export async function renderMarkdown(
  source: string,
  options: RenderOptions = {},
): Promise<Rendered> {
  if (!source.trim()) return { blocks: [], headings: [] };
  const processor = buildProcessor(options);
  const tree = (await processor.run(processor.parse(source))) as HastRoot;

  const headings: Heading[] = [];
  const blocks: RenderBlock[] = [];
  let pending: RootContent[] = [];
  const flush = () => {
    if (pending.length === 0) return;
    const html = toHtml({ type: 'root', children: pending });
    if (html.trim()) blocks.push({ kind: 'html', html });
    pending = [];
  };

  for (const node of tree.children) {
    if (isElement(node) && /^h[2-3]$/.test(node.tagName) && node.properties.id) {
      headings.push({
        id: String(node.properties.id),
        text: node.children.map(textOf).join('').trim(),
        depth: Number(node.tagName[1]),
      });
    }
    const figureType = isElement(node, 'div') ? node.properties.dataFigure : undefined;
    if (isElement(node, 'div') && typeof figureType === 'string' && isFigureType(figureType)) {
      flush();
      blocks.push({
        kind: 'figure',
        figure: { type: figureType, data: String(node.properties.dataSrc ?? '') },
      });
      continue;
    }
    pending.push(node);
  }
  flush();
  return { blocks, headings };
}

export { FIGURE_TYPES };
