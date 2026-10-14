import { getLastUpdated } from '@/lib/content/public';
import { isoDay } from '@/lib/dates';
import { SOURCE_URL } from '@/lib/site';

export async function SiteFooter() {
  const lastUpdated = await getLastUpdated();
  return (
    <footer className="site-footer meta mx-auto mt-20 flex max-w-measure flex-wrap gap-x-3 gap-y-1 border-t border-rule px-4 pt-4 pb-10 sm:px-0">
      <span className="footer-note">A personal corner of the web.</span>
      {lastUpdated && <span>Last updated: {isoDay(lastUpdated)}</span>}
      {lastUpdated && <span aria-hidden="true">·</span>}
      <a href="/feed.xml">RSS</a>
      <span aria-hidden="true">·</span>
      <a href={SOURCE_URL} rel="noopener noreferrer">
        source
      </a>
    </footer>
  );
}
