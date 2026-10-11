import { citationKey, toBibtex } from '@/lib/bibtex';
import { absoluteUrl } from '@/lib/site';

/** BibTeX for a page on this site. The year is taken from the content's own date. */
export function bibtexFor(opts: { author: string; title: string; dateLike: string; path: string }) {
  const year = /^(\d{4})/.exec(opts.dateLike)?.[1] ?? String(new Date().getFullYear());
  return toBibtex({
    key: citationKey(opts.author, year, opts.title),
    author: opts.author,
    title: opts.title,
    year,
    url: absoluteUrl(opts.path),
  });
}
