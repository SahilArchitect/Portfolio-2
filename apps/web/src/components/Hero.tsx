'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const PHRASES = [
  'I build production-grade LLM systems.',
  'RAG pipelines. Inference APIs. Vector search.',
  'Python · FastAPI · Pydantic v2 · pgvector.',
  'Remote-first · IST timezone · async-ready.',
  'High focus. Low noise. Shipped systems.',
];

export function Hero() {
  const typewriter = useTypewriter(PHRASES);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative z-[1] flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-10 pt-24 text-center md:px-10"
    >
      <HeroOrbit3D reducedMotion={prefersReducedMotion} />

      <p className="cyber-fade-up text-warning mb-5 font-mono text-[11px] uppercase tracking-[6px] [animation-delay:.3s]">
        {'//'} AI.BACKEND.LLM.INFRASTRUCTURE
      </p>

      <motion.div
        className="cyber-fade-up relative mb-7 h-40 w-40 [animation-delay:.4s] sm:h-48 sm:w-48"
        style={{ transformStyle: 'preserve-3d' }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                rotateX: [0, 4, -3, 0],
                rotateY: [0, -5, 5, 0],
                z: [0, 14, 0],
              }
        }
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.035, rotateX: -5, rotateY: 7 }}
      >
        <div className="border-accent/40 absolute inset-0 border shadow-[0_0_42px_rgba(0,255,242,0.16)]" />
        <div className="border-warning/25 absolute -inset-3 border" />
        <div className="border-success/20 absolute -inset-7 rotate-45 border opacity-70 shadow-[0_0_32px_rgba(0,255,65,0.08)]" />
        <Image
          src="/sahil-profile.jpeg"
          alt="Sahil Bhatti"
          width={192}
          height={192}
          priority
          className="contrast-110 h-full w-full object-cover object-center grayscale-[.08]"
        />
        <span className="border-border-strong bg-bg text-accent absolute -bottom-3 left-1/2 -translate-x-1/2 border px-3 py-1 font-mono text-[9px] uppercase tracking-[3px]">
          operator verified
        </span>
      </motion.div>

      <h1 className="cyber-hero-name cyber-fade-up mb-2 [animation-delay:.5s]">
        <span className="cyber-glitch" data-text="SAHIL">
          SAHIL
        </span>
      </h1>

      <p className="cyber-fade-up text-fg-muted mb-10 font-mono text-[clamp(11px,2vw,14px)] uppercase tracking-[6px] [animation-delay:.7s]">
        <span className="text-success">AI Backend Engineer</span> .{' '}
        <span className="text-success">LLM Infrastructure Engineer</span>
      </p>

      <p className="cyber-fade-up text-fg/70 mb-8 max-w-3xl font-mono text-[13px] leading-7 [animation-delay:.8s]">
        I build production-grade LLM systems: RAG pipelines, inference APIs, and vector search
        infrastructure for remote-first startups.
      </p>

      <div className="cyber-typewriter cyber-fade-up text-success mb-12 h-9 font-mono text-[clamp(18px,3vw,26px)] [animation-delay:1s] [font-family:VT323,monospace]">
        {typewriter}
      </div>

      <div className="cyber-fade-up mb-12 grid w-full max-w-4xl grid-cols-2 gap-6 [animation-delay:1.1s] sm:flex sm:justify-center sm:gap-10">
        <HeroStat value="IIT" label="Jammu / M.Tech DS" />
        <HeroStat value="7.93" label="M.Tech CGPA" />
        <HeroStat value="IST" label="Remote / Async" />
        <HeroStat value="2024+" label="LLM Infra Focus" />
      </div>

      <div className="cyber-fade-up flex flex-col gap-5 [animation-delay:1.3s] sm:flex-row">
        <Link href="#projects" data-cursor="hover" className="cyber-button">
          <span>View Projects</span>
        </Link>
        <Link href="#contact" data-cursor="hover" className="cyber-button cyber-button-orange">
          <span>Open Comms</span>
        </Link>
      </div>

      <div className="cyber-scroll-hint text-fg-muted absolute bottom-8 left-1/2 flex flex-col items-center gap-2 font-mono text-[9px] uppercase tracking-[3px]">
        <span>Scroll</span>
        <span className="from-accent block h-10 w-px bg-gradient-to-b to-transparent" />
      </div>
    </section>
  );
}

function HeroOrbit3D({ reducedMotion }: { reducedMotion: boolean | null }) {
  const nodes = [
    { label: 'RAG', className: 'left-[12%] top-[18%] text-accent', depth: 46 },
    { label: 'API', className: 'right-[16%] top-[22%] text-success', depth: 72 },
    { label: 'PGV', className: 'bottom-[26%] left-[18%] text-warning', depth: 58 },
    { label: 'LLM', className: 'bottom-[30%] right-[14%] text-accent', depth: 84 },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 hidden [perspective:1100px] md:block"
      aria-hidden
    >
      <motion.div
        className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2"
        style={{ transformStyle: 'preserve-3d' }}
        animate={reducedMotion ? undefined : { rotateX: [58, 62, 58], rotateZ: [0, 360] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
      >
        <span className="border-accent/20 absolute inset-0 rounded-full border shadow-[0_0_80px_rgba(0,255,242,0.08)]" />
        <span className="border-warning/20 absolute inset-12 rounded-full border" />
        <span className="border-success/20 absolute inset-24 rounded-full border" />
      </motion.div>
      {nodes.map((node, index) => (
        <motion.span
          key={node.label}
          className={`border-current/30 bg-bg/70 absolute border px-3 py-1 font-mono text-[10px] uppercase tracking-[3px] shadow-[0_0_24px_rgba(0,255,242,0.1)] backdrop-blur ${node.className}`}
          style={{ transformStyle: 'preserve-3d' }}
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, index % 2 ? -18 : 18, 0],
                  rotateY: [0, index % 2 ? -22 : 22, 0],
                  z: [node.depth, node.depth + 36, node.depth],
                }
          }
          transition={{ duration: 7 + index, repeat: Infinity, ease: 'easeInOut' }}
        >
          {node.label}
        </motion.span>
      ))}
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="font-display text-accent block text-[28px] font-bold [font-family:Orbitron,monospace] [text-shadow:0_0_20px_var(--accent)]">
        {value}
      </span>
      <span className="text-fg-muted block font-mono text-[9px] uppercase tracking-[3px]">
        {label}
      </span>
    </div>
  );
}

function useTypewriter(phrases: string[]) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex] ?? '';
    const delay = deleting ? 30 : charIndex === phrase.length ? 2200 : 70;

    const timeout = window.setTimeout(() => {
      if (!deleting && charIndex < phrase.length) {
        setCharIndex((value) => value + 1);
        return;
      }

      if (!deleting && charIndex === phrase.length) {
        setDeleting(true);
        return;
      }

      if (deleting && charIndex > 0) {
        setCharIndex((value) => value - 1);
        return;
      }

      setDeleting(false);
      setPhraseIndex((value) => (value + 1) % phrases.length);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex, phrases]);

  return (phrases[phraseIndex] ?? '').slice(0, charIndex);
}
