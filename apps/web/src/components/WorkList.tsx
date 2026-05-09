import Link from 'next/link';
import type { Route } from 'next';

import { ArrowUpRightIcon } from './Icons';
import type { ProjectView } from '@/lib/view-models';

type WorkListProps = {
  projects: ProjectView[];
};

export function WorkList({ projects }: WorkListProps) {
  return (
    <div className="cyber-panel divide-y divide-border">
      {projects.map((project) => (
        <Link key={project.slug} href={`/work/${project.slug}` as Route} data-cursor="hover" className="group block">
          <article className="grid gap-4 p-6 transition hover:bg-accent-muted sm:grid-cols-[100px_1fr_auto] sm:items-start">
            <p className="font-mono text-[9px] uppercase tracking-[4px] text-fg-muted">PROJECT-{String(project.displayOrder).padStart(3, '0')}</p>
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="font-display text-[clamp(16px,2vw,22px)] font-bold uppercase tracking-[2px] text-fg group-hover:text-accent [font-family:Orbitron,monospace]">
                  {project.title}
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-[2px] text-warning">{project.role}</p>
              </div>
              <p className="mt-3 max-w-3xl font-mono text-[12px] leading-7 text-fg/65">{project.summary}</p>
              <div className="grid overflow-hidden sm:grid-rows-[0fr] sm:group-hover:grid-rows-[1fr]">
                <div className="min-h-0">
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.stack.map((item) => (
                      <span key={item} className="cyber-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <ArrowUpRightIcon className="hidden h-5 w-5 text-fg-muted group-hover:text-accent sm:block" />
          </article>
        </Link>
      ))}
    </div>
  );
}
