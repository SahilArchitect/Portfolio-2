/**
 * Spacing — 4px base. Sections breathe with deliberate vertical rhythm:
 *   desktop: 120-160px between major sections
 *   mobile : 72-96px
 *
 * Aggressive whitespace is a non-negotiable design principle. Components
 * should feel under-decorated until you give them room.
 */

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  48: '192px',
} as const;

export const sectionRhythm = {
  desktop: { min: '120px', max: '160px' },
  mobile: { min: '72px', max: '96px' },
} as const;

export const radii = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

/** Hairlines only — no shadow stacks. Used for hover-state borders, focus rings. */
export const hairlines = {
  thin: '1px',
  medium: '1.5px',
} as const;

/** Z-index scale — kept short on purpose. */
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  cursor: 9999,
} as const;
