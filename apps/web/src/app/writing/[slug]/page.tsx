import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { PostCard } from '@/components/PostCard';
import { ReadingProgress } from '@/components/ReadingProgress';
import { Section } from '@/components/Section';
import { fetchPost, fetchPosts } from '@/lib/api';
import { formatDate } from '@/lib/format';

type PostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  if (!post) return { title: 'Post not found' };

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await fetchPost(params.slug);
  if (!post) notFound();

  return (
    <main id="content">
      <ReadingProgress />
      <Section className="pb-12">
        <article className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-wrap items-center gap-3 font-mono text-mono-sm text-fg-muted">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span>{post.readingMinutes} min read</span>
            {post.canonicalUrl && (
              <a href={post.canonicalUrl} data-cursor="hover" className="text-accent hover:text-fg">
                Substack original
              </a>
            )}
          </div>
          <h1 className="font-display text-display-lg font-medium text-fg">{post.title}</h1>
          <p className="mt-5 text-body text-fg-muted">{post.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-mono-sm text-fg-muted">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-12 rounded-xl border border-border bg-bg-elev p-6">
            <MarkdownRenderer content={post.body} />
          </div>
        </article>
      </Section>

      <Section eyebrow="Related" title="Continue with nearby systems notes." className="pt-0">
        <div className="rounded-xl border border-border bg-bg-elev px-6">
          {post.related.map((related) => (
            <PostCard key={related.slug} post={related} />
          ))}
        </div>
      </Section>
    </main>
  );
}
