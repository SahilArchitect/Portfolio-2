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

  return (
    <motion.article
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={cn('group h-full', className)}
    >
      <Link href={`/work/${project.slug}` as Route} className="block h-full" data-cursor="hover">
        <div className="flex h-full flex-col rounded-lg border border-border bg-bg-elev p-6 hover:border-border-strong">
          {project.coverImageUrl ? (
            <div className="mb-5 aspect-video overflow-hidden rounded-md border border-border bg-bg">
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
            <div className="mb-5 aspect-video rounded-md border border-border bg-bg p-4">
              <div className="flex h-full items-end justify-between font-mono text-mono-sm text-fg-muted">
                <span>{project.slug}</span>
                <span>{String(project.displayOrder).padStart(2, '0')}</span>
              </div>
            </div>
          )}

          <p className="font-mono text-mono-sm text-fg-muted">{project.role}</p>
          <h3 className="mt-2 font-display text-display-sm font-medium text-fg">{project.title}</h3>
          <p className="mt-3 flex-1 text-body-sm text-fg-muted">{project.summary}</p>

          {stackPreview.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {stackPreview.map((tag) => (
                <span key={tag} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-mono-sm text-fg-muted">
                  {tag}
                </span>
              ))}
              {extraStack > 0 && (
                <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-mono-sm text-fg-muted">
                  +{extraStack}
                </span>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 font-mono text-mono-sm text-accent opacity-0 group-hover:opacity-100">
            <span>Open system</span>
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
