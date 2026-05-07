/**
 * Top-level token barrel — equivalent to importing from `@engine-room/ui/tokens`.
 *
 * The `tokens.ts` path is the canonical reference called out in the design brief.
 * Internally, tokens are split across `src/tokens/{colors,typography,spacing,motion,breakpoints}.ts`
 * for modularity; this file is the public re-export.
 */

export * from './tokens/index';
