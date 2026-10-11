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
      <Link
        href="/"
        className="flex items-center gap-2 self-center font-semibold text-fg no-underline hover:text-accent"
      >
        {/* Same SB mark as the favicon (src/app/icon.svg), drawn in theme colours. */}
        <svg viewBox="0 0 32 32" aria-hidden="true" className="h-7 w-7 shrink-0">
          <rect width="32" height="32" rx="6" fill="var(--fg)" />
          <text
            x="16"
            y="22.5"
            fontFamily="Georgia, serif"
            fontSize="18"
            fontWeight="600"
            textAnchor="middle"
            fill="var(--bg)"
          >
            SB
          </text>
        </svg>
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
