/** Allow-list of interactive figure components that Markdown may embed. */
export const FIGURE_TYPES = ['bitflip-curve'] as const;
export type FigureType = (typeof FIGURE_TYPES)[number];

export function isFigureType(value: string): value is FigureType {
  return (FIGURE_TYPES as readonly string[]).includes(value);
}
