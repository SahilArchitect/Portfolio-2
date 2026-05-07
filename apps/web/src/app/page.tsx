import Link from 'next/link';

import { Hero } from '@/components/Hero';
import { NowSnippet } from '@/components/NowSnippet';
import { PostCard } from '@/components/PostCard';
import { ProjectCard } from '@/components/ProjectCard';
import { Section } from '@/components/Section';
import { fetchNow, fetchPosts, fetchProjects } from '@/lib/api';

export default async function HomePage() {
  const [projects, posts, now] = await Promise.all([fetchProjects(), fetchPosts(), fetchNow()]);
  const featured = projects.filter((project) => project.featured).slice(0, 2);
  const latestPosts = posts.slice(0, 3);

  return (
    <main id="content">
      <Hero />

      <Section
        eyebrow="Selected work"
        title="Systems that show their seams."
        intro="The projects are framed as operating rooms: API edges, recovery paths, telemetry, and decisions you can inspect instead of vague polish."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <Link href="/work" data-cursor="hover" className="mt-6 inline-flex rounded-md border border-border px-4 py-2 font-mono text-mono-sm text-fg-muted hover:border-border-strong hover:text-fg">
          View all work
        </Link>
      </Section>

      <Section
        eyebrow="Latest writing"
        title="Notes from the backend layer."
        intro="Substack mirrors land here with full-text search now and semantic search through the command palette."
        className="pt-0"
      >
        <div className="rounded-xl border border-border bg-bg-elev px-6">
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <Link href="/writing" data-cursor="hover" className="mt-6 inline-flex rounded-md border border-border px-4 py-2 font-mono text-mono-sm text-fg-muted hover:border-border-strong hover:text-fg">
          Read writing
        </Link>
      </Section>

      <Section eyebrow="Now" title="Current operating state." className="pt-0">
        <div className="rounded-xl border border-border bg-bg-elev p-6">
          <NowSnippet entry={now} />
        </div>
      </Section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-border px-6 py-10 font-mono text-mono-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
        <span>The Engine Room</span>
        <span>AI backend systems, exposed carefully.</span>
      </footer>
    </main>
  );
}
