import { bibtexFor } from '@/lib/content/cite';
import type { PublicEntry } from '@/lib/content/public';
import { formatMonthRange } from '@/lib/dates';
import { absoluteUrl } from '@/lib/site';
import { renderMarkdownCached } from '@/lib/markdown/cached';
import { loadFigureData } from '@/lib/markdown/figures';

import { ChipRow, MetaLine, StatusBadge } from './bits';
import { CopyButton } from './CopyButton';
import { JsonLd } from './JsonLd';
import { MarkdownBlocks } from './MarkdownBlocks';
import { Toc } from './Toc';

const SECTIONS = [
  ['threatModel', 'Threat model'],
  ['method', 'Method'],
  ['results', 'Results'],
  ['limitations', 'Limitations'],
  ['nextSteps', 'Next steps'],
  ['reproduce', 'Reproduce'],
] as const;

/** Fixed-order research write-up; shared by the public page and draft previews. */
export async function ProjectArticle({
  project,
  author,
}: {
  project: PublicEntry<'project'>;
  author: string;
}) {
  const { data } = project;
  const rendered = await Promise.all(
    SECTIONS.map(async ([key, label]) => {
      const source = data.sections[key] ?? '';
      const result = await renderMarkdownCached(source, 2);
      const blocks =
        key === 'results' && data.interactiveFigure
          ? [...result.blocks, { kind: 'figure' as const, figure: data.interactiveFigure }]
          : result.blocks;
      return { key, label, id: label.toLowerCase().replace(/\s+/g, '-'), blocks };
    }),
  );
  const present = rendered.filter((section) => section.blocks.length > 0);
  const figures = await loadFigureData(present.flatMap((s) => s.blocks));
  const path = `/research/${project.slug}`;
  const bibtex = bibtexFor({
    author,
    title: data.title,
    dateLike: data.endMonth || data.startMonth,
    path,
  });
  const toc = [
    { id: 'summary', label: 'Summary' },
    ...present.map((s) => ({ id: s.id, label: s.label })),
    { id: 'cite', label: 'Cite' },
  ];

  return (
    <article className="relative pt-6 sm:pt-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ScholarlyArticle',
          headline: data.title,
          abstract: data.summary,
          author: { '@type': 'Person', name: author },
          url: absoluteUrl(path),
          keywords: data.tags.join(', '),
          ...(project.publishedAt ? { datePublished: project.publishedAt } : {}),
          dateModified: project.updatedAt,
        }}
      />
      <header className="space-y-2">
        <h1 className="text-[1.6rem] leading-tight font-semibold">{data.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusBadge status={data.projectStatus} />
          <MetaLine
            parts={[formatMonthRange(data.startMonth, data.endMonth), data.tags.join(', ')]}
          />
        </div>
        <ChipRow
          links={[
            { label: 'code', href: data.links.code },
            { label: 'write-up', href: data.links.writeup },
            { label: 'data', href: data.links.data },
            { label: 'bib', href: '#cite' },
          ]}
        />
      </header>
      <Toc items={toc} />

      <section id="summary" className="mt-8">
        <h2 className="sr-only-heading">Summary</h2>
        <p className="text-[1.05em]">{data.summary}</p>
      </section>

      {present.map((section) => (
        <section key={section.key} id={section.id} className="mt-10 scroll-mt-6">
          <h2 className="mb-3 text-xl font-semibold">{section.label}</h2>
          <MarkdownBlocks blocks={section.blocks} figures={figures} />
        </section>
      ))}

      <section id="cite" className="mt-10 scroll-mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Cite</h2>
          <CopyButton text={bibtex} label="copy bibtex" />
        </div>
        <pre className="overflow-x-auto rounded border border-rule bg-bg-subtle p-3 font-mono text-[0.78rem] leading-relaxed">
          {bibtex}
        </pre>
      </section>
    </article>
  );
}
