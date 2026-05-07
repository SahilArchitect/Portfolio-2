import Link from 'next/link';
import type { Route } from 'next';

import { ArrowUpRightIcon } from './Icons';
import type { ProjectView } from '@/lib/view-models';

type WorkListProps = {
  projects: ProjectView[];
};

export function WorkList({ projects }: WorkListProps) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-bg-elev">
      {projects.map((project) => (
        <Link key={project.slug} href={`/work/${project.slug}` as Route} data-cursor="hover" className="group block">
          <article className="grid gap-4 p-6 sm:grid-cols-[80px_1fr_auto] sm:items-start">
            <p className="font-mono text-mono-sm text-fg-muted">{String(project.displayOrder).padStart(2, '0')}</p>
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="font-display text-display-sm font-medium text-fg group-hover:text-accent">{project.title}</h2>
                <p className="font-mono text-mono-sm text-fg-muted">{project.role}</p>
              </div>
              <p className="mt-3 max-w-3xl text-body-sm text-fg-muted">{project.summary}</p>
              <div className="grid overflow-hidden sm:grid-rows-[0fr] sm:group-hover:grid-rows-[1fr]">
                <div className="min-h-0">
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.stack.map((item) => (
                      <span key={item} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-mono-sm text-fg-muted">
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
