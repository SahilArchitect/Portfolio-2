/**
 * Typography — one display face, one mono. Period.
 *
 * Tracking is tight on display sizes (negative letter-spacing) and
 * comfortable on body. Mono opens slightly for legibility at micro sizes.
 */

export const fontFamilies = {
  display: '"Söhne", "Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", "Berkeley Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
} as const;

/** [fontSize, lineHeight, letterSpacingEm] */
export type TypeScale = readonly [string, string, string];

export const typeScale = {
  'display-xl': ['64px', '68px', '-0.025em'] as const,
  'display-lg': ['44px', '48px', '-0.02em'] as const,
  'display-md': ['32px', '36px', '-0.015em'] as const,
  'display-sm': ['24px', '30px', '-0.01em'] as const,
  body: ['16px', '26px', '0em'] as const,
  'body-sm': ['14px', '22px', '0em'] as const,
  micro: ['13px', '20px', '0.01em'] as const,
  'mono-sm': ['13px', '20px', '0em'] as const,
} as const satisfies Record<string, TypeScale>;

export type TypeScaleToken = keyof typeof typeScale;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;
