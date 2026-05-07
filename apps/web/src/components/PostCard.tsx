import Link from 'next/link';
import type { Route } from 'next';

import { cn } from '@engine-room/ui';

import { formatDate } from '@/lib/format';
import type { PostView } from '@/lib/view-models';

type PostCardProps = {
  post: PostView;
  className?: string;
};

export function PostCard({ post, className }: PostCardProps) {
  return (
    <article className={cn('group border-b border-border py-7 last:border-b-0', className)}>
      <Link href={`/writing/${post.slug}` as Route} className="block" data-cursor="hover">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="max-w-2xl font-display text-display-sm font-medium text-fg group-hover:text-accent">
            {post.title}
          </h3>
          <time dateTime={post.publishedAt} className="shrink-0 font-mono text-mono-sm text-fg-muted">
            {formatDate(post.publishedAt)}
          </time>
        </div>

        <p className="mt-3 max-w-3xl text-body-sm text-fg-muted">{post.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-mono-sm text-fg-muted">{post.readingMinutes} min read</span>
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border px-2 py-px font-mono text-mono-sm text-fg-muted">
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </article>
  );
}
