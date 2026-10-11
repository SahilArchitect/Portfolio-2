import { ImportForm } from '@/components/admin/ImportForm';
import { requireOwnerPage } from '@/lib/server/owner';

import { logoutEverywhereAction } from '../../actions';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  await requireOwnerPage();
  return (
    <div className="max-w-2xl space-y-10">
      <h1 className="text-xl font-semibold">Settings</h1>
      <section>
        <h2 className="font-semibold">Export all content</h2>
        <p className="mt-1 text-sm text-muted">
          A zip with <code>content.json</code> (complete, re-importable) and Markdown copies of notes, projects and
          reproductions. Uploaded files stay in storage and are referenced by URL.
        </p>
        <a href="/api/admin/export" className="mt-2 inline-block rounded border border-rule px-3 py-1.5 text-sm no-underline hover:border-accent">
          Download export
        </a>
      </section>
      <section>
        <h2 className="font-semibold">Import</h2>
        <p className="mt-1 mb-2 text-sm text-muted">
          Upload a <code>content.json</code>. Every entry is validated first; if anything is invalid, nothing is written.
        </p>
        <ImportForm />
      </section>
      <section>
        <h2 className="font-semibold">Sessions</h2>
        <p className="mt-1 text-sm text-muted">Sessions last 7 days. This signs out every device, including this one.</p>
        <form action={logoutEverywhereAction} className="mt-2">
          <button type="submit" className="rounded border border-red-700 px-3 py-1.5 text-sm text-red-700 dark:text-red-400">
            Log out everywhere
          </button>
        </form>
      </section>
    </div>
  );
}
