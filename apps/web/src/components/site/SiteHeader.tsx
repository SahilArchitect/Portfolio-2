import Link from 'next/link';

import { ThemeToggle } from './ThemeToggle';

const NAV = [
  { href: '/research', label: 'Research' },
  { href: '/reproductions', label: 'Reproductions' },
  { href: '/notes', label: 'Notes' },
  { href: '/cv', label: 'CV' },
] as const;

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-measure flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-4 pt-6 pb-4 sm:px-0 sm:pt-10">
      <Link href="/" className="font-semibold text-fg no-underline hover:text-accent">
        Sahil Bhatti
      </Link>
      <nav
        aria-label="Main"
        className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.95rem]"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-fg no-underline hover:text-accent hover:underline"
          >
            {item.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
