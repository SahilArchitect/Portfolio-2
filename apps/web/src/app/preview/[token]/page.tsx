import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { NoteArticle } from '@/components/content/NoteArticle';
import { ProjectArticle } from '@/components/content/ProjectArticle';
import { ReproductionArticle } from '@/components/content/ReproductionArticle';
import { SiteHeader } from '@/components/site/SiteHeader';
import { dataSchemas, type ContentType } from '@/lib/content/schemas';
import { entryForPreviewToken } from '@/lib/content/repository';
import type { PublicEntry } from '@/lib/content/public';

export const metadata: Metadata = { title: 'Draft preview', robots: { index: false, follow: false } };

async function Preview({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await entryForPreviewToken(token);
  if (!row) notFound();
  const type = row.type as ContentType;
  const parsed = dataSchemas[type].safeParse(row.data);
  if (!parsed.success) notFound();
  const entry = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    data: parsed.data,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    sortOrder: row.sortOrder,
  };
  const author = 'Sahil Bhatti';
  if (type === 'project') return <ProjectArticle project={entry as PublicEntry<'project'>} author={author} />;
  if (type === 'note') return <NoteArticle note={entry as PublicEntry<'note'>} author={author} />;
  if (type === 'reproduction') return <ReproductionArticle entry={entry as PublicEntry<'reproduction'>} author={author} />;
  notFound();
}

export default function PreviewPage(props: PageProps<'/preview/[token]'>) {
  return (
    <>
      <p className="meta bg-badge px-4 py-2 text-center text-fg" role="status">
        Draft preview — not published. This link expires.
      </p>
      <SiteHeader />
      <main id="content" className="page mx-auto max-w-measure px-4 pb-16 sm:px-0">
        <Suspense fallback={<p className="meta pt-10">Loading preview…</p>}>
          <Preview params={props.params} />
        </Suspense>
      </main>
    </>
  );
}
