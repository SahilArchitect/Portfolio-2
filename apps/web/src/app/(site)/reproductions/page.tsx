import type { Metadata } from 'next';
import Link from 'next/link';

import { MetaLine } from '@/components/content/bits';
import { listPublic } from '@/lib/content/public';

export const metadata: Metadata = {
  title: 'Reproductions',
  description: 'Re-implementations of published papers: reported results next to mine.',
  alternates: { canonical: '/reproductions' },
};

export default async function ReproductionsIndex() {
  const items = await listPublic('reproduction');
  return (
    <div className="pt-6 sm:pt-10">
      <h1 className="text-[1.6rem] font-semibold">Reproductions</h1>
      <p className="mt-2 text-muted">Re-implementations of published papers, with reported results next to mine.</p>
      {items.length === 0 && <p className="mt-6 text-muted">Nothing published yet.</p>}
      <ul className="mt-6">
        {items.map((item) => (
          <li key={item.id} className="border-t border-rule py-4">
            <Link href={`/reproductions/${item.slug}`} className="font-semibold text-fg no-underline hover:text-accent hover:underline">
              {item.data.paperTitle}
            </Link>
            <MetaLine
              className="mt-1"
              parts={[item.data.venue, item.data.year ? String(item.data.year) : null, `${item.data.rows.length} metric${item.data.rows.length === 1 ? '' : 's'}`]}
            />
            {item.data.claim && <p className="mt-1 line-clamp-2 text-[0.95em]">{item.data.claim}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
