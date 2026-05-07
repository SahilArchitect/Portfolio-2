/**
 * Motion barrel. Import from `@engine-room/ui/motion`.
 *
 * Required exports per the design brief:
 *   fadeUp, stagger, cardHover, pageEnter, scrollReveal, commandPaletteEnter
 *
 * Plus springs and the reduced-motion hook.
 */

export {
  fadeUp,
  stagger,
  cardHover,
  pageEnter,
  scrollReveal,
  commandPaletteEnter,
  progressFill,
  SPRING,
  SPRING_GENTLE,
  SPRING_SNAPPY,
  EASE,
} from './variants';

export { useMotion } from './reduced-motion';
export type { UseMotionResult } from './reduced-motion';
