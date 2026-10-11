import type { PublicEntry } from '@/lib/content/public';
import { bibtexFor } from '@/lib/content/cite';
import { absoluteUrl } from '@/lib/site';

import { ChipRow, MetaLine } from './bits';
import { CopyButton } from './CopyButton';
import { JsonLd } from './JsonLd';
import { Markdown } from './Markdown';

export async function ReproductionArticle({
  entry,
  author,
}: {
  entry: PublicEntry<'reproduction'>;
  author: string;
}) {
  const { data } = entry;
  const path = `/reproductions/${entry.slug}`;
  const bibtex = bibtexFor({
    author,
    title: `Reproducing "${data.paperTitle}"`,
    dateLike: entry.publishedAt ?? entry.updatedAt,
    path,
  });
  return (
    <article className="pt-6 sm:pt-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: `Reproducing: ${data.paperTitle}`,
          author: { '@type': 'Person', name: author },
          url: absoluteUrl(path),
          dateModified: entry.updatedAt,
        }}
      />
      <p className="meta">reproduction</p>
      <h1 className="mt-1 text-[1.5rem] leading-tight font-semibold">{data.paperTitle}</h1>
      <MetaLine
        className="mt-2"
        parts={[data.paperAuthors, data.venue, data.year ? String(data.year) : null]}
      />
      <div className="mt-2">
        <ChipRow
          links={[
            { label: 'paper', href: data.paperUrl },
            { label: 'code', href: data.codeUrl },
            { label: 'bib', href: '#cite' },
          ]}
        />
      </div>

      {data.claim && (
        <section className="mt-8 border-l-2 border-accent pl-4">
          <h2 className="meta mb-1 uppercase">Claim being reproduced</h2>
          <p>{data.claim}</p>
        </section>
      )}

      {data.rows.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">Reported vs. mine</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.92em] tabular-nums">
              <thead>
                <tr className="border-b border-fg text-left">
                  <th scope="col" className="py-1.5 pr-4 font-semibold">Metric</th>
                  <th scope="col" className="py-1.5 pr-4 font-semibold">Reported</th>
                  <th scope="col" className="py-1.5 pr-4 font-semibold">Mine</th>
                  <th scope="col" className="py-1.5 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.metric} className="border-b border-rule align-top">
                    <th scope="row" className="py-1.5 pr-4 text-left font-normal">{row.metric}</th>
                    <td className="py-1.5 pr-4 font-mono text-[0.85em]">{row.reported || '—'}</td>
                    <td className="py-1.5 pr-4 font-mono text-[0.85em]">{row.mine || '—'}</td>
                    <td className="py-1.5 text-[0.92em] text-muted">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.seeds !== undefined && (
            <p className="meta mt-2">
              mine: mean ± std over {data.seeds} seed{data.seeds === 1 ? '' : 's'}
            </p>
          )}
        </section>
      )}

      {data.setupDifferences.trim() && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">Differences in setup</h2>
          <Markdown source={data.setupDifferences} headingOffset={2} />
        </section>
      )}
      {data.lessons.trim() && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">What I learned</h2>
          <Markdown source={data.lessons} headingOffset={2} />
        </section>
      )}

      <section id="cite" className="mt-10 scroll-mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Cite</h2>
          <CopyButton text={bibtex} label="copy bibtex" />
        </div>
        <pre className="overflow-x-auto rounded border border-rule bg-bg-subtle p-3 font-mono text-[0.78rem]">
          {bibtex}
        </pre>
      </section>
    </article>
  );
}
