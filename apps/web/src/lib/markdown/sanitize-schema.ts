import { defaultSchema, type Options as SanitizeSchema } from 'rehype-sanitize';

const defaultAttributes = defaultSchema.attributes ?? {};

/**
 * GitHub's sanitization schema, tightened:
 * - links may only use http(s) and mailto; images only http(s) or relative URLs
 * - <code> keeps language and math classes so Shiki and KaTeX can run afterwards
 * - <div> may carry exactly the two attributes used by ::figure placeholders
 */
export const sanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'figure', 'figcaption'],
  attributes: {
    ...defaultAttributes,
    code: [['className', /^language-./, 'math-inline', 'math-display']],
    div: [...(defaultAttributes.div ?? []), 'dataFigure', 'dataSrc'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    a: [...(defaultAttributes.a ?? []).filter((a) => a !== 'href'), 'href'],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
    cite: ['http', 'https'],
  },
};
