import { listPublic } from '@/lib/content/public';
import { buildRss, type RssItem } from '@/lib/rss';
import { SITE_DESCRIPTION, SITE_TITLE, absoluteUrl } from '@/lib/site';

export async function GET() {
  const [notes, projects, log] = await Promise.all([
    listPublic('note'),
    listPublic('project'),
    listPublic('log'),
  ]);
  const items: RssItem[] = [
    ...notes.map((n) => ({
      title: n.data.title,
      link: absoluteUrl(`/notes/${n.slug}`),
      date: n.data.date,
      description: n.data.summary,
      category: 'note',
    })),
    ...projects.map((p) => ({
      title: p.data.title,
      link: absoluteUrl(`/research/${p.slug}`),
      date: p.publishedAt ?? p.updatedAt,
      description: p.data.summary,
      category: 'research',
    })),
    ...log.map((l) => ({
      title: l.data.text,
      link: l.data.url && /^https?:/.test(l.data.url) ? l.data.url : absoluteUrl('/log'),
      date: l.data.date,
      category: 'log',
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  const xml = buildRss({
    title: SITE_TITLE,
    link: absoluteUrl('/'),
    description: SITE_DESCRIPTION,
    selfUrl: absoluteUrl('/feed.xml'),
    items,
  });
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
