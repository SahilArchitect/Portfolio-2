import type { Metadata } from 'next';

import { PostCard } from '@/components/PostCard';
import { Section } from '@/components/Section';
import { WritingSearch } from '@/components/WritingSearch';
import { fetchPosts } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Substack mirror with full-text and semantic search.',
};

type WritingPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function WritingPage({ searchParams }: WritingPageProps) {
  const q = first(searchParams?.q);
  const semantic = first(searchParams?.semantic);
  const tag = first(searchParams?.tag);
  const [posts, allPosts] = await Promise.all([
    fetchPosts({ q, semantic, tag }),
    fetchPosts(),
  ]);
  const tags = Array.from(new Set(allPosts.flatMap((post) => post.tags))).sort();

  return (
    <main id="content">
      <Section
        eyebrow="Writing"
        title="Substack mirror with system-aware search."
        intro="Full-text search keeps the list fast. Semantic search is available from this page and the global command palette when the backend is online."
      >
        <WritingSearch q={q} semantic={semantic} activeTag={tag} tags={tags} />

        <div className="cyber-panel mt-8 px-6">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.slug} post={post} />)
          ) : (
            <p className="py-12 text-center font-mono text-mono-sm text-fg-muted">No posts matched this query.</p>
          )}
        </div>
      </Section>
    </main>
  );
}
