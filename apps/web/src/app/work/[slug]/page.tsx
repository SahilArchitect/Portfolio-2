import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { PostCard } from '@/components/PostCard';
import { ScrollyArchitecture } from '@/components/ScrollyArchitecture';
import { Section } from '@/components/Section';
import { fetchPosts, fetchProject, fetchProjects } from '@/lib/api';
import { fallbackMetrics } from '@/lib/fallbacks';

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const projects = await fetchProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await fetchProject(params.slug);
  if (!project) return { title: 'Project not found' };

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const [project, posts] = await Promise.all([
    fetchProject(params.slug),
    fetchPosts(),
  ]);

  if (!project) notFound();

  const related = posts.filter((post) =>
    post.tags.some((tag) => project.stack.join(' ').toLowerCase().includes(tag.toLowerCase())),
  ).slice(0, 3);

  return (
    <main id="content" aria-label="Project content">
      <Section
        eyebrow={project.role}
        title={project.title}
        intro={project.summary}
        className="pb-12"
        headingLevel="h1"
      >
        <div className="flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <span key={item} className="cyber-tag">
              {item}
            </span>
          ))}
        </div>
      </Section>

      <ScrollyArchitecture project={project} metrics={fallbackMetrics} />

      <Section eyebrow="Deep dive" title="The decisions behind the system.">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="cyber-panel p-6">
            <MarkdownRenderer content={project.body} />
          </article>
          <div className="space-y-5">
            <div className="cyber-panel p-5">
              <p className="font-mono text-[9px] uppercase tracking-[4px] text-warning">Embedded demo</p>
              <a
                href={project.demoUrl ?? '/traces'}
                data-cursor="hover"
                className="mt-3 inline-flex font-mono text-mono-sm text-fg-muted hover:text-accent"
              >
                Open demo
              </a>
              <iframe
                title={`${project.title} demo`}
                src={project.demoUrl ?? '/traces'}
                loading="lazy"
                sandbox="allow-scripts allow-popups allow-forms"
                aria-hidden="true"
                tabIndex={-1}
                className="mt-4 h-80 w-full border border-border bg-bg"
              />
            </div>
            <div className="cyber-panel p-5">
              <p className="font-mono text-[9px] uppercase tracking-[4px] text-warning">Links</p>
              <div className="mt-4 grid gap-2 font-mono text-mono-sm">
                {project.liveUrl && <a href={project.liveUrl} data-cursor="hover" className="text-fg-muted hover:text-accent">Live system</a>}
                {project.repoUrl && <a href={project.repoUrl} data-cursor="hover" className="text-fg-muted hover:text-accent">Repository</a>}
                {!project.liveUrl && !project.repoUrl && <p className="text-fg-muted">Private proof surface. Public traces stay visible.</p>}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Related writing" title="Notes that connect to this build." className="pt-0">
        <div className="cyber-panel px-6">
          {(related.length ? related : posts.slice(0, 3)).map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </Section>
    </main>
  );
}
