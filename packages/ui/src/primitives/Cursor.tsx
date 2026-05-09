/**
 * Custom cursor — 8px circle that scales to 32px over interactive elements.
 *
 * Mount once in the app's root layout (inside <body>). Hidden on touch devices
 * via the `(pointer: coarse)` media query and on `prefers-reduced-motion: reduce`.
 *
 * Detection of "interactive" is delegated to the DOM: any element with a
 * `data-cursor="hover"` attribute, plus tags like <a>, <button>, [role=button],
 * and <input>/<textarea>. App primitives should add `data-cursor="hover"` to
 * any custom interactive surface.
 */

'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

import { SPRING_SNAPPY } from '../tokens/motion';

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]';

export interface CursorProps {
  /** Override the resting size in px. Defaults to 8. */
  size?: number;
  /** Override the hover size in px. Defaults to 32. */
  hoverSize?: number;
}

export function Cursor({ size = 20, hoverSize = 42 }: CursorProps) {
  const reduced = useReducedMotion() ?? false;
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, SPRING_SNAPPY);
  const sy = useSpring(y, SPRING_SNAPPY);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fineCursor = window.matchMedia('(pointer: fine)').matches;
    if (!fineCursor || reduced) return;

    setEnabled(true);
    document.documentElement.dataset.cursor = 'custom';

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest(INTERACTIVE_SELECTOR)));
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      delete document.documentElement.dataset.cursor;
    };
  }, [reduced, x, y]);

  if (!enabled) return null;

  const targetSize = hovering ? hoverSize : size;

  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[9999]" style={{ x: sx, y: sy }}>
      <motion.div
        className="rounded-full border border-accent shadow-[0_0_18px_rgba(0,255,242,0.45)]"
        animate={{
          width: targetSize,
          height: targetSize,
          x: -targetSize / 2,
          y: -targetSize / 2,
          backgroundColor: hovering ? 'rgba(0,255,242,0.08)' : 'rgba(0,255,242,0)',
          opacity: hovering ? 1 : 0.95,
        }}
        transition={SPRING_SNAPPY}
      />
      <div className="absolute left-0 top-0 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
    </motion.div>
  );
}
