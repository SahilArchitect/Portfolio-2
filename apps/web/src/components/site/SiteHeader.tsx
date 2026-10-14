import Link from 'next/link';

import { ThemeToggle } from './ThemeToggle';

const NAV = [
  { href: '/research', label: 'Research' },
  { href: '/reproductions', label: 'Reproductions' },
  { href: '/notes', label: 'Notes' },
  { href: '/log', label: 'Log' },
  { href: '/cv', label: 'CV' },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header mx-auto flex max-w-measure flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-4 pt-6 pb-4 sm:px-0 sm:pt-10">
      <Link
        href="/"
        aria-label="Sahil Bhatti"
        className="flex items-center gap-2 self-center font-semibold text-fg no-underline hover:text-accent"
      >
        <span aria-hidden="true">~/</span> bysahil.dev
      </Link>
      <nav
        aria-label="Main"
        className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.95rem]"
      >
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="directory-link">
            {item.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
