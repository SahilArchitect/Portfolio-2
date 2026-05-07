import Link from 'next/link';

import { CommandPalette } from './CommandPalette';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Work', href: '/work' },
  { label: 'Writing', href: '/writing' },
  { label: 'Now', href: '/now' },
  { label: 'Traces', href: '/traces' },
  { label: 'Hire', href: '/hire' },
] as const;

export function SiteHeader() {
  return (
    <header data-site-header className="sticky top-0 z-sticky border-b border-border bg-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" data-cursor="hover" className="font-display text-body-sm font-medium text-fg">
          Sahil Bhatti
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-5 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} data-cursor="hover" className="font-mono text-mono-sm text-fg-muted hover:text-fg">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CommandPalette />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
