'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { motion } from 'framer-motion';

import { cn } from '@engine-room/ui';
import { cardHover } from '@engine-room/ui/motion';

import { ArrowUpRightIcon } from './Icons';
import type { ProjectView } from '@/lib/view-models';

type ProjectCardProps = {
  project: ProjectView;
  className?: string;
};

export function ProjectCard({ project, className }: ProjectCardProps) {
  const stackPreview = project.stack.slice(0, 4);
  const extraStack = Math.max(0, project.stack.length - stackPreview.length);
  const accentClass = project.displayOrder % 3 === 2
    ? 'cyber-project-accent-orange'
    : project.displayOrder % 3 === 0
      ? 'cyber-project-accent-green'
      : '';

  return (
    <motion.article
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={cn('group h-full', className)}
    >
      <Link href={`/work/${project.slug}` as Route} className="block h-full" data-cursor="hover">
        <div className="cyber-project-card flex h-full flex-col">
          <div className={cn('cyber-project-accent', accentClass)} />
          {project.coverImageUrl ? (
            <div className="m-6 mb-0 aspect-video overflow-hidden border border-border bg-bg">
              <Image
                src={project.coverImageUrl}
                alt=""
                width={800}
                height={450}
                unoptimized
                className="h-full w-full object-cover grayscale"
              />
            </div>
          ) : (
            <div className="m-6 mb-0 aspect-video overflow-hidden border border-border bg-bg/70 p-4">
              <div className="flex h-full flex-col justify-between font-mono text-[10px] leading-6 text-accent/35">
                <span># mission/{project.slug}</span>
                <span>async def ship_system():</span>
                <span className="pl-4">observe()</span>
                <span className="pl-4">recover()</span>
                <span className="pl-4">deploy()</span>
                <span className="text-right text-fg-muted">PROJECT-{String(project.displayOrder).padStart(3, '0')}</span>
              </div>
            </div>
          )}

          <div className="flex flex-1 flex-col p-7">
            <p className="font-mono text-[9px] uppercase tracking-[4px] text-fg-muted">
              PROJECT-{String(project.displayOrder).padStart(3, '0')} {'//'} {project.role}
            </p>
            <h3 className="mt-3 font-display text-[clamp(16px,2vw,22px)] font-bold uppercase tracking-[2px] text-fg [font-family:Orbitron,monospace]">
              {project.title}
            </h3>
            <p className="mt-4 flex-1 font-mono text-[12px] leading-7 text-fg/65">{project.summary}</p>

            {stackPreview.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {stackPreview.map((tag) => (
                  <span key={tag} className="cyber-tag">
                    {tag}
                  </span>
                ))}
                {extraStack > 0 && <span className="cyber-tag">+{extraStack}</span>}
              </div>
            )}

            <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[3px] text-accent opacity-0 transition group-hover:opacity-100">
              <span>Explore System</span>
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
