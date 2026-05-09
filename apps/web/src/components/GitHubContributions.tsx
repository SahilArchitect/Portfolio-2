'use client';

/* eslint-disable @next/next/no-img-element */
import { motion, useReducedMotion } from 'framer-motion';

import {
  GITHUB_CONTRIBUTIONS_GRAPH_URL,
  GITHUB_DISPLAY,
  GITHUB_URL,
  GITHUB_USERNAME,
} from '@/lib/site';

type ContributionLevel = 0 | 1 | 2 | 3 | 4;

const weeks: ContributionLevel[][] = Array.from({ length: 52 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => {
    const seed = (week * 13 + day * 7 + (week % 5) * 3) % 19;
    if (seed < 4) return 0;
    if (seed < 8) return 1;
    if (seed < 12) return 2;
    if (seed < 16) return 3;
    return 4;
  }),
);

const levelClass = [
  'border-border bg-bg/80',
  'border-accent/20 bg-accent/15',
  'border-accent/30 bg-accent/30 shadow-[0_0_8px_rgba(0,255,242,0.12)]',
  'border-success/40 bg-success/45 shadow-[0_0_10px_rgba(0,255,65,0.16)]',
  'border-warning/50 bg-warning/75 shadow-[0_0_12px_rgba(255,107,0,0.2)]',
] as const;

export function GitHubContributions() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="hover"
      aria-label={`Open ${GITHUB_USERNAME} on GitHub`}
      className="cyber-panel hover:border-border-strong group block p-4 text-left transition md:p-6"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="border-border flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-warning font-mono text-[9px] uppercase tracking-[4px]">
            GitHub signal
          </p>
          <h3 className="font-display text-fg mt-2 text-[18px] font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
            Contribution Graph
          </h3>
        </div>
        <p className="text-accent group-hover:text-success font-mono text-[11px] uppercase tracking-[2px] transition">
          {GITHUB_DISPLAY}
        </p>
      </div>

      <div className="border-border bg-bg/70 relative mt-6 overflow-hidden border p-4">
        <motion.div
          className="via-accent/10 pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent to-transparent"
          aria-hidden
          animate={prefersReducedMotion ? undefined : { x: ['-30%', '520%'] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
        />

        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[720px] grid-flow-col grid-rows-7 gap-1">
            {weeks.flatMap((week, weekIndex) =>
              week.map((level, dayIndex) => (
                <motion.span
                  key={`${weekIndex}-${dayIndex}`}
                  className={`h-3 w-3 border ${levelClass[level]}`}
                  initial={prefersReducedMotion ? false : { opacity: 0.25, scale: 0.7 }}
                  whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: Math.min((weekIndex * 7 + dayIndex) * 0.0025, 0.55),
                    duration: 0.18,
                  }}
                />
              )),
            )}
          </div>
        </div>

        <div className="border-border mt-5 overflow-x-auto border bg-[#050b0d] p-3">
          <img
            src={GITHUB_CONTRIBUTIONS_GRAPH_URL}
            alt={`${GITHUB_USERNAME} GitHub contributions graph`}
            loading="lazy"
            decoding="async"
            className="h-auto w-full min-w-[720px] opacity-90 mix-blend-screen saturate-150"
          />
        </div>
      </div>

      <div className="text-fg-muted mt-5 grid gap-3 font-mono text-[11px] uppercase tracking-[2px] sm:grid-cols-3">
        <span className="border-border bg-bg/60 border px-3 py-2">Public activity</span>
        <span className="border-border bg-bg/60 border px-3 py-2">Repos + commits</span>
        <span className="border-border bg-bg/60 border px-3 py-2">Open profile</span>
      </div>
    </motion.a>
  );
}
