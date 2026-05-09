import Link from 'next/link';

import { CommandPalette } from './CommandPalette';

const NAV_ITEMS = [
  { label: 'About', href: '/#about' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Timeline', href: '/#experience' },
  { label: 'Target', href: '/#target-role' },
  { label: 'Contact', href: '/#contact' },
] as const;

export function SiteHeader() {
  return (
    <header data-site-header className="fixed left-0 right-0 top-0 z-[1000] border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-5 md:px-10">
        <Link
          href="/"
          data-cursor="hover"
          className="font-display text-[13px] font-black uppercase tracking-[4px] text-accent [font-family:Orbitron,monospace] [text-shadow:0_0_20px_var(--accent)]"
        >
          SAHIL.EXE
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-cursor="hover"
              className="group font-mono text-[11px] uppercase tracking-[3px] text-fg-muted transition hover:text-accent hover:[text-shadow:0_0_10px_var(--accent)]"
            >
              <span className="mr-1 text-success opacity-0 transition group-hover:opacity-100">&gt;</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <CommandPalette />
          <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-success sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
            Available for remote
          </div>
        </div>
      </div>
    </header>
  );
}
