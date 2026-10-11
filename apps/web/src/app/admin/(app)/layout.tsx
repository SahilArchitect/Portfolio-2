import Link from 'next/link';
import { Suspense } from 'react';

import { Toaster } from '@/components/admin/Toaster';
import { ThemeToggle } from '@/components/site/ThemeToggle';
import { requireOwnerPage } from '@/lib/server/owner';

import { signOutAction } from '../actions';

const NAV = [
  ['/admin', 'Dashboard'],
  ['/admin/profile', 'Profile'],
  ['/admin/project', 'Projects'],
  ['/admin/reproduction', 'Reproductions'],
  ['/admin/note', 'Notes'],
  ['/admin/log', 'Log'],
  ['/admin/education', 'Education'],
  ['/admin/teaching', 'Teaching'],
  ['/admin/featured', 'Featured order'],
  ['/admin/assets', 'Assets'],
  ['/admin/cv', 'CV files'],
  ['/admin/settings', 'Settings'],
] as const;

async function Gate({ children }: { children: React.ReactNode }) {
  await requireOwnerPage();
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Toaster>
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/admin" className="font-semibold text-fg no-underline">
            admin
          </Link>
          <nav aria-label="Admin" className="flex flex-1 flex-wrap gap-x-3 gap-y-1 text-sm">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className="text-muted no-underline hover:text-accent">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <a href="/" target="_blank" rel="noopener" className="no-underline">
              Preview site ↗
            </a>
            <ThemeToggle />
            <form action={signOutAction}>
              <button type="submit" className="text-muted hover:text-fg">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Suspense fallback={<p className="meta">Loading…</p>}>
          <Gate>{children}</Gate>
        </Suspense>
      </main>
    </Toaster>
  );
}
