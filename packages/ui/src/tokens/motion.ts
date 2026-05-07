/**
 * Motion tokens — spring physics, not eased curves.
 *
 * Eased curves are reserved for non-organic UI (progress bars, scrubbers).
 * Everything else uses springs. Reduced-motion is honored globally via
 * the `prefers-reduced-motion` media query — all spring/transition work
 * collapses to opacity-only changes when set.
 */

import type { Transition } from 'framer-motion';

/** Canonical spring — used for the vast majority of motion. */
export const SPRING = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
  mass: 0.8,
} as const satisfies Transition;

/** Tighter spring for micro-interactions (buttons, hover, cursor). */
export const SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.6,
} as const satisfies Transition;

/** Looser spring for long-range layout reflow (panel resize, page enter). */
export const SPRING_GENTLE = {
  type: 'spring',
  stiffness: 180,
  damping: 26,
  mass: 1,
} as const satisfies Transition;

/** Eased curves — strictly for non-organic motion (progress bars, scrubbers). */
export const EASE = {
  productive: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  decelerate: { duration: 0.4, ease: [0, 0, 0.2, 1] },
} as const satisfies Record<string, Transition>;

export const durations = {
  instant: 0,
  micro: 0.12,
  quick: 0.2,
  base: 0.3,
  slow: 0.5,
} as const;
