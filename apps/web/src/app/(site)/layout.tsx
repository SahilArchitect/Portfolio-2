import './retro.css';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';

// Public pages must be fully static: build fails if one reads request data,
// and unknown slugs wait for the static result (so missing pages are real 404s).
export const ensureStatic = 'navigation';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="retro-site">
      <a
        href="#content"
        className="meta sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-bg focus:p-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" className="page mx-auto max-w-measure px-4 sm:px-0">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
