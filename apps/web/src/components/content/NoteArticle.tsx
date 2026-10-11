import type { PublicEntry } from '@/lib/content/public';
import { readingMinutes } from '@/lib/dates';
import { absoluteUrl } from '@/lib/site';

import { MetaLine } from './bits';
import { JsonLd } from './JsonLd';
import { Markdown } from './Markdown';

export function NoteArticle({ note, author }: { note: PublicEntry<'note'>; author: string }) {
  const { data } = note;
  return (
    <article className="pt-6 sm:pt-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: data.title,
          author: { '@type': 'Person', name: author },
          datePublished: data.date,
          dateModified: note.updatedAt,
          url: absoluteUrl(`/notes/${note.slug}`),
          keywords: data.tags.join(', '),
        }}
      />
      <h1 className="text-[1.6rem] leading-tight font-semibold">{data.title}</h1>
      <MetaLine className="mt-2" parts={[data.date, data.tags.join(', '), `${readingMinutes(data.bodyMarkdown)} min read`]} />
      {data.paperRef && <p className="meta mt-1">re: {data.paperRef}</p>}
      <div className="mt-8">
        <Markdown source={data.bodyMarkdown} headingOffset={1} />
      </div>
    </article>
  );
}
