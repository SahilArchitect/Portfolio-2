/**
 * Named Framer Motion variants — the only motion vocabulary apps should use.
 *
 * NEVER write inline `transition={{ ease: 'easeOut' }}` in app code. NEVER use
 * bare CSS transitions for entrance. Compose from these primitives.
 *
 * All variants honor `prefers-reduced-motion` automatically when consumed via
 * the `useMotion()` hook (see `./reduced-motion.ts`), which collapses transforms
 * to opacity-only fades.
 */

import type { Variants } from 'framer-motion';

import { EASE, SPRING, SPRING_GENTLE, SPRING_SNAPPY } from '../tokens/motion';

/**
 * fadeUp — the default reveal. Used everywhere a single element enters.
 * 16px translate is intentional: large enough to read as motion, small
 * enough to feel composed.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { ...SPRING, mass: 0.5 },
  },
};

/**
 * stagger — parent variant. Children inherit `visible` and animate one after another.
 * Pair with fadeUp on each child. delayChildren keeps the first child from popping
 * before the parent settles.
 */
export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

/**
 * cardHover — used on every interactive surface that isn't a button.
 * No scale, no shadow stack. A 1.5px hairline border lift via opacity,
 * plus a 2px Y nudge. Apple-grade restraint.
 */
export const cardHover: Variants = {
  rest: { y: 0 },
  hover: {
    y: -2,
    transition: SPRING_SNAPPY,
  },
  tap: {
    y: 0,
    scale: 0.99,
    transition: { ...SPRING_SNAPPY, mass: 0.4 },
  },
};

/**
 * pageEnter — top-level page transition. Wrap each route's <main> in a
 * <motion.main variants={pageEnter} initial="hidden" animate="visible" exit="exit" />.
 * AnimatePresence in the root layout handles the orchestration.
 */
export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_GENTLE,
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { ...SPRING_GENTLE, mass: 0.5 },
  },
};

/**
 * scrollReveal — driven by `useInView({ once: true, margin: '-10% 0px' })`.
 * Slightly more travel than fadeUp because scroll-triggered reveals need
 * to register at a glance.
 */
export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

/**
 * commandPaletteEnter — for the ⌘K palette. Two-axis: scale from 0.96 +
 * fade. Snappier spring because it must feel under your finger.
 */
export const commandPaletteEnter: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_SNAPPY,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -4,
    transition: { ...SPRING_SNAPPY, mass: 0.4 },
  },
};

/**
 * progressFill — the only place we use eased curves. Progress bars are
 * mechanical, not organic. A spring would feel wrong.
 */
export const progressFill: Variants = {
  hidden: { scaleX: 0 },
  visible: (custom: number) => ({
    scaleX: custom,
    transition: EASE.decelerate,
  }),
};

/** Re-export springs so app code can compose without re-importing tokens. */
export { SPRING, SPRING_GENTLE, SPRING_SNAPPY, EASE } from '../tokens/motion';
