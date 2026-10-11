export type RssItem = { title: string; link: string; date: string; description?: string; category?: string };

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildRss(opts: { title: string; link: string; description: string; selfUrl: string; items: RssItem[] }) {
  const items = opts.items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>${
        item.category ? `\n      <category>${escapeXml(item.category)}</category>` : ''
      }${item.description ? `\n      <description>${escapeXml(item.description)}</description>` : ''}
    </item>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(opts.title)}</title>
    <link>${escapeXml(opts.link)}</link>
    <description>${escapeXml(opts.description)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(opts.selfUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}
