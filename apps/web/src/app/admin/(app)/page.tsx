import Link from 'next/link';

import { NewEntryButton } from '@/components/admin/NewEntryButton';
import { TYPE_LABELS } from '@/lib/content/fields';
import { dashboardCounts, entriesWithTodos, recentEdits } from '@/lib/content/repository';
import { CONTENT_TYPES } from '@/lib/content/schemas';
import { requireOwnerPage } from '@/lib/server/owner';

export const metadata = { title: 'Dashboard' };

export default async function Dashboard() {
  await requireOwnerPage();
  const [counts, edits, todos] = await Promise.all([
    dashboardCounts(),
    recentEdits(10),
    entriesWithTodos(),
  ]);
  const types = CONTENT_TYPES.filter((t) => t !== 'profile');

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {types.map((type) => (
            <NewEntryButton key={type} type={type} label={TYPE_LABELS[type].singular} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="meta mb-2 uppercase">Content</h2>
        <table className="w-full max-w-xl text-sm tabular-nums">
          <thead>
            <tr className="border-b border-rule text-left">
              <th className="py-1 font-medium">Type</th>
              <th className="py-1 font-medium">Published</th>
              <th className="py-1 font-medium">Draft</th>
              <th className="py-1 font-medium">Archived</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type} className="border-b border-rule">
                <td className="py-1">
                  <Link href={`/admin/${type}`}>{TYPE_LABELS[type].plural}</Link>
                </td>
                <td className="py-1">{counts[type].published}</td>
                <td className="py-1">{counts[type].draft}</td>
                <td className="py-1">{counts[type].archived}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="meta mb-2 uppercase">Still contains TODO: ({todos.length})</h2>
        {todos.length === 0 ? (
          <p className="text-sm text-muted">Nothing left to fill in.</p>
        ) : (
          <ul className="space-y-1.5 text-sm" data-testid="todo-list">
            {todos.map(({ entry, fields }) => (
              <li key={entry.id}>
                <Link href={`/admin/${entry.type}/${entry.id}`}>{entry.title}</Link>{' '}
                <span className="meta">
                  {entry.type} · {entry.status} · {fields.slice(0, 4).join(', ')}
                  {fields.length > 4 ? ` +${fields.length - 4}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="meta mb-2 uppercase">Last 10 edits</h2>
        <ul className="space-y-1 text-sm">
          {edits.map((edit) => (
            <li key={edit.id} className="grid grid-cols-[10.5rem_1fr] gap-2">
              <time className="meta" dateTime={edit.createdAt.toISOString()}>
                {edit.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
              </time>
              <span>
                <Link href={`/admin/${edit.type}/${edit.entryId}`}>{edit.title}</Link>{' '}
                <span className="meta">{edit.kind}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
