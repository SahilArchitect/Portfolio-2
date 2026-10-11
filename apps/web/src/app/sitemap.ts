import type { MetadataRoute } from 'next';

import { getLastUpdated, listPublic } from '@/lib/content/public';
import { absoluteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, reproductions, notes, lastUpdated] = await Promise.all([
    listPublic('project'),
    listPublic('reproduction'),
    listPublic('note'),
    getLastUpdated(),
  ]);
  const site = lastUpdated ? new Date(lastUpdated) : undefined;
  return [
    ...['/', '/research', '/reproductions', '/notes', '/cv', '/log'].map((path) => ({
      url: absoluteUrl(path),
      lastModified: site,
    })),
    ...projects.map((p) => ({ url: absoluteUrl(`/research/${p.slug}`), lastModified: new Date(p.updatedAt) })),
    ...reproductions.map((r) => ({ url: absoluteUrl(`/reproductions/${r.slug}`), lastModified: new Date(r.updatedAt) })),
    ...notes.map((n) => ({ url: absoluteUrl(`/notes/${n.slug}`), lastModified: new Date(n.updatedAt) })),
  ];
}
