import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LOG_PAGE_SIZE, LogList } from '@/components/content/LogList';
import { listPublic } from '@/lib/content/public';

export const metadata: Metadata = { title: 'Log', robots: { index: false, follow: true } };

export async function generateStaticParams() {
  const pages = Math.ceil((await listPublic('log')).length / LOG_PAGE_SIZE);
  // Always return at least one param so the route has a prerendered shell.
  return Array.from({ length: Math.max(1, pages - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export default async function LogPageN({ params }: PageProps<'/log/page/[n]'>) {
  const { n } = await params;
  const page = Number(n);
  const all = await listPublic('log');
  const pages = Math.max(1, Math.ceil(all.length / LOG_PAGE_SIZE));
  if (!Number.isInteger(page) || page < 2 || page > pages) notFound();
  return (
    <LogList
      items={all.slice((page - 1) * LOG_PAGE_SIZE, page * LOG_PAGE_SIZE)}
      page={page}
      pages={pages}
    />
  );
}
