'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

import { SPRING_SNAPPY } from '@engine-room/ui/motion';

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, SPRING_SNAPPY);

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-modal h-1 w-full origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}
