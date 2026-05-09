'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function AdminAmbient3D() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="border-accent/15 bg-accent/5 absolute -right-28 top-20 h-80 w-80 border shadow-[0_0_90px_rgba(0,255,242,0.08)] [transform-style:preserve-3d]"
        animate={
          reducedMotion
            ? undefined
            : {
                rotateX: [62, 72, 62],
                rotateY: [0, 360],
                z: [0, 64, 0],
              }
        }
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="border-warning/20 bg-warning/5 absolute -bottom-32 left-8 h-72 w-72 rotate-45 border shadow-[0_0_90px_rgba(255,107,0,0.08)]"
        animate={reducedMotion ? undefined : { y: [0, -30, 0], rotateZ: [45, 58, 45] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="from-accent/10 absolute inset-x-0 top-0 h-56 bg-gradient-to-b to-transparent" />
    </div>
  );
}

export function AdminAuthFrame({
  tone = 'default',
  children,
}: {
  tone?: 'default' | 'danger' | 'success';
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const glow =
    tone === 'danger'
      ? 'shadow-[0_0_80px_rgba(248,113,113,0.1)]'
      : tone === 'success'
        ? 'shadow-[0_0_80px_rgba(0,255,65,0.1)]'
        : 'shadow-[0_0_80px_rgba(0,255,242,0.1)]';

  return (
    <main className="cyber-page relative grid min-h-dvh place-items-center overflow-hidden px-6 py-20">
      <AdminAmbient3D />
      <motion.section
        className={`cyber-panel relative z-[1] w-full max-w-md p-6 ${glow}`}
        initial={reducedMotion ? false : { opacity: 0, y: 30, rotateX: 12 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        whileHover={reducedMotion ? undefined : { rotateX: -1.5, rotateY: 2, y: -4 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          className="border-accent/20 absolute -inset-2 -z-10 border"
          animate={reducedMotion ? undefined : { opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {children}
      </motion.section>
    </main>
  );
}

export function AdminConsolePulse() {
  const reducedMotion = useReducedMotion();
  const nodes = ['API', 'RAG', 'CMS', 'AUTH', 'LLM'];

  return (
    <motion.section
      className="cyber-panel relative mt-4 overflow-hidden p-4"
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative grid min-h-40 gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="relative z-[1]">
          <p className="text-warning font-mono text-[9px] uppercase tracking-[4px]">
            {'//'} Live control layer
          </p>
          <h2 className="font-display text-fg mt-2 text-[18px] font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
            Operations Depth Map
          </h2>
          <p className="text-fg/65 mt-2 max-w-xl font-mono text-[12px] leading-6">
            Content, analytics, inquiries, and model spend stay visible from one command surface.
          </p>
        </div>
        <div className="relative min-h-36 [perspective:900px]">
          <motion.div
            className="border-accent/20 bg-accent/5 absolute inset-x-4 top-8 h-24 border"
            style={{ transformStyle: 'preserve-3d' }}
            animate={reducedMotion ? undefined : { rotateX: [62, 66, 62], rotateZ: [0, 360] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          />
          {nodes.map((node, index) => (
            <motion.span
              key={node}
              className="border-border-strong bg-bg/80 text-accent absolute border px-2 py-1 font-mono text-[10px] uppercase tracking-[2px] shadow-[0_0_18px_rgba(0,255,242,0.1)]"
              style={{
                left: `${10 + index * 18}%`,
                top: `${24 + (index % 2) * 42}%`,
                transformStyle: 'preserve-3d',
              }}
              animate={
                reducedMotion ? undefined : { y: [0, index % 2 ? 12 : -12, 0], rotateY: [0, 18, 0] }
              }
              transition={{ duration: 5 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {node}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
