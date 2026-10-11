import type { Metadata } from 'next';

import { LOG_PAGE_SIZE, LogList } from '@/components/content/LogList';
import { listPublic } from '@/lib/content/public';

export const metadata: Metadata = { title: 'Log', alternates: { canonical: '/log' } };

export default async function LogPage() {
  const all = await listPublic('log');
  return <LogList items={all.slice(0, LOG_PAGE_SIZE)} page={1} pages={Math.max(1, Math.ceil(all.length / LOG_PAGE_SIZE))} />;
}
