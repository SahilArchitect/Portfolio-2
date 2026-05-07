'use client';

import { motion } from 'framer-motion';

import { fadeUp, stagger } from '@engine-room/ui/motion';

import { HeroCanvas } from './HeroCanvas';

const POSITIONING = 'I build AI backend systems that are observable, recoverable, and honest about their limits.';

export function Hero() {
  const words = POSITIONING.split(' ');

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-64px)] w-full max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">The Engine Room</p>
        <motion.h1
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mt-6 max-w-4xl font-display text-display-lg font-medium text-fg sm:text-display-xl"
        >
          {words.map((word, index) => (
            <motion.span key={`${word}-${index}`} variants={fadeUp} className="mr-3 inline-block">
              {word}
            </motion.span>
          ))}
        </motion.h1>
        <motion.p variants={fadeUp} initial="hidden" animate="visible" className="mt-6 max-w-2xl text-body text-fg-muted">
          This portfolio is a working system: API contracts, RAG search, live metrics, redacted traces, and a contact flow scored like production infrastructure.
        </motion.p>
      </div>
      <HeroCanvas />
    </section>
  );
}
