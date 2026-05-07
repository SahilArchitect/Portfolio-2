/**
 * Reduced motion — non-negotiable. Globally honored.
 *
 * Wrap motion-heavy trees with the <MotionConfig reducedMotion="user">
 * provided in the apps' root layout, then read this hook for variant
 * overrides where you'd like to fully suppress transforms (not just the
 * spring physics).
 */

'use client';

import { useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export interface UseMotionResult {
  /** True when the user has requested reduced motion. */
  reduced: boolean;
  /**
   * Returns variants stripped of transforms — only opacity changes survive.
   * Pass your variant; receive a safe variant that respects user preference.
   */
  safe: (variants: Variants) => Variants;
}

const STRIP_KEYS = new Set(['x', 'y', 'scale', 'scaleX', 'scaleY', 'rotate', 'rotateX', 'rotateY']);

const stripTransforms = (state: unknown): Record<string, unknown> => {
  if (typeof state !== 'object' || state === null) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state as Record<string, unknown>)) {
    if (STRIP_KEYS.has(key)) continue;
    out[key] = value;
  }
  return out;
};

export function useMotion(): UseMotionResult {
  const reduced = useReducedMotion() ?? false;
  return {
    reduced,
    safe: (variants) => {
      if (!reduced) return variants;
      const safeVariants: Variants = {};
      for (const [name, state] of Object.entries(variants)) {
        if (typeof state === 'function') {
          // Framer's variant resolver signature is (custom, current, velocity).
          // We forward all three through, then strip transforms from the result.
          safeVariants[name] = ((...args: Parameters<typeof state>) =>
            stripTransforms(state(...args))) as Variants[string];
        } else {
          safeVariants[name] = stripTransforms(state) as Variants[string];
        }
      }
      return safeVariants;
    },
  };
}
