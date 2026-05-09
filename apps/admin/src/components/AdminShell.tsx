'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { AdminAmbient3D } from '@/components/AdminMotionSurfaces';
import { Sidebar } from '@/components/Sidebar';
import { CommandPalette } from '@/components/CommandPalette';
import { cn } from '@engine-room/ui';

interface AdminShellProps {
  email: string;
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AdminShell({
  email,
  title,
  eyebrow = 'Admin',
  description,
  actions,
  children,
  className,
}: AdminShellProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="cyber-page bg-bg/80 text-fg relative flex min-h-dvh overflow-hidden">
      <AdminAmbient3D />
      <Sidebar className="hidden lg:flex" />
      <div className="relative z-[1] min-w-0 flex-1">
        <motion.header
          className="z-sticky border-border bg-bg/85 sticky top-0 border-b backdrop-blur-xl"
          initial={reducedMotion ? false : { opacity: 0, y: -14 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
            <div className="min-w-0">
              <p className="text-fg-muted truncate font-mono text-[10px] uppercase tracking-[2px]">
                operator::{email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CommandPalette />
              <motion.a
                href="/api/auth/signout"
                data-cursor="hover"
                className="border-border text-fg-muted hover:border-border-strong hover:text-accent min-h-11 border px-3 py-2 font-mono text-[10px] uppercase tracking-[2px] transition hover:shadow-[0_0_24px_rgba(0,255,242,0.08)]"
                whileHover={reducedMotion ? undefined : { y: -2, rotateX: -4 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              >
                Sign out
              </motion.a>
            </div>
          </div>
        </motion.header>
        <motion.main
          className={cn('mx-auto w-full max-w-7xl px-4 py-8 pb-16 lg:px-6', className)}
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="border-border mb-6 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between"
            style={{ transformStyle: 'preserve-3d' }}
            whileHover={reducedMotion ? undefined : { rotateX: 0.6, rotateY: -0.8 }}
          >
            <div>
              <p className="text-warning font-mono text-[9px] uppercase tracking-[4px]">
                {'//'} {eyebrow}
              </p>
              <h1 className="font-display text-display-md text-fg mt-2 font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
                {title}
              </h1>
              {description ? (
                <p className="text-fg/65 mt-2 max-w-2xl font-mono text-[13px] leading-7">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
          </motion.div>
          {children}
        </motion.main>
        <div className="border-border bg-bg/90 text-fg-muted fixed bottom-0 left-0 right-0 z-[1000] hidden items-center gap-8 border-t px-6 py-2 font-mono text-[9px] uppercase tracking-[2px] backdrop-blur md:flex">
          <span>
            <span className="text-success">ADMIN</span>
            <span className="text-accent/30 px-1">::</span>ONLINE
          </span>
          <span>
            <span className="text-success">AUTH</span>
            <span className="text-accent/30 px-1">::</span>TOKEN-GATED
          </span>
          <span>
            <span className="text-success">MODE</span>
            <span className="text-accent/30 px-1">::</span>CONTENT-OPS
          </span>
        </div>
      </div>
    </div>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      className={cn('cyber-panel hover:border-border-strong p-4 transition', className)}
      whileHover={reducedMotion ? undefined : { y: -3, rotateX: 0.4 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.section>
  );
}

export function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-fg text-[18px] font-bold uppercase tracking-[2px] [font-family:Orbitron,monospace]">
          {title}
        </h2>
        {detail ? (
          <p className="text-fg/65 mt-1 font-mono text-[12px] leading-6">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}
