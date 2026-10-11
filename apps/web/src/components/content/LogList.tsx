import Link from 'next/link';

import type { PublicEntry } from '@/lib/content/public';

export const LOG_PAGE_SIZE = 30;

export function LogList({ items, page, pages }: { items: PublicEntry<'log'>[]; page: number; pages: number }) {
  return (
    <div className="pt-6 sm:pt-10">
      <h1 className="text-[1.6rem] font-semibold">Log</h1>
      {items.length === 0 && <p className="mt-6 text-muted">Nothing logged yet.</p>}
      <ul className="mt-6 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="grid grid-cols-[6.5rem_1fr] gap-x-3">
            <time className="meta pt-[0.2em]" dateTime={item.data.date}>
              {item.data.date}
            </time>
            <span>{item.data.url ? <a href={item.data.url}>{item.data.text}</a> : item.data.text}</span>
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <nav aria-label="Pagination" className="meta mt-8 flex gap-4">
          {page > 1 && <Link href={page === 2 ? '/log' : `/log/page/${page - 1}`}>← newer</Link>}
          <span>
            page {page} of {pages}
          </span>
          {page < pages && <Link href={`/log/page/${page + 1}`}>older →</Link>}
        </nav>
      )}
    </div>
  );
}
