import { diffLines } from 'diff';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { RestoreButton } from '@/components/admin/RestoreButton';
import { getEntry, listRevisions } from '@/lib/content/repository';
import { requireOwnerPage } from '@/lib/server/owner';

/** Pretty JSON with Markdown fields expanded so line diffs are readable. */
function readable(snapshot: Record<string, unknown>): string {
  return JSON.stringify(snapshot, null, 2).replace(/\\n/g, '\n');
}

export default async function Revisions(props: PageProps<'/admin/[type]/[id]/revisions'>) {
  await requireOwnerPage();
  const { type, id } = await props.params;
  const search = await props.searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const entry = await getEntry(id);
  if (!entry || entry.type !== type) notFound();
  const revisions = await listRevisions(id);
  const a = revisions.find((r) => r.id === search.a) ?? revisions[1];
  const b = revisions.find((r) => r.id === search.b) ?? revisions[0];
  const parts = a && b ? diffLines(readable(a.snapshot), readable(b.snapshot)) : [];
  const entryPath = `/admin/${type}/${id}`;

  return (
    <div>
      <Link href={entryPath} className="meta no-underline">
        ← {entry.title}
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Revision history</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-[22rem_1fr]">
        <ol className="space-y-1 text-sm" data-testid="revision-list">
          {revisions.map((rev) => (
            <li
              key={rev.id}
              className={`flex flex-wrap items-baseline gap-x-2 rounded px-2 py-1 ${rev.id === b?.id || rev.id === a?.id ? 'bg-bg-subtle' : ''}`}
            >
              <time className="meta" dateTime={rev.createdAt.toISOString()}>
                {rev.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
              </time>
              <span className="meta">{rev.kind}</span>
              <Link href={`?a=${rev.id}&b=${b?.id ?? ''}`} className="text-xs">
                from
              </Link>
              <Link href={`?a=${a?.id ?? ''}&b=${rev.id}`} className="text-xs">
                to
              </Link>
              <RestoreButton revisionId={rev.id} entryPath={entryPath} />
            </li>
          ))}
        </ol>
        <div>
          {a && b ? (
            <>
              <p className="meta mb-2">
                diff {a.createdAt.toISOString().slice(0, 16)} ({a.kind}) →{' '}
                {b.createdAt.toISOString().slice(0, 16)} ({b.kind})
              </p>
              <pre className="overflow-x-auto rounded border border-rule p-2 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {parts.map((part, i) => (
                  <span
                    key={i}
                    className={
                      part.added
                        ? 'bg-green-500/15 text-fg'
                        : part.removed
                          ? 'bg-red-500/15 text-fg line-through decoration-red-500/40'
                          : 'text-muted'
                    }
                  >
                    {part.added ? '+ ' : part.removed ? '- ' : ''}
                    {part.value}
                  </span>
                ))}
              </pre>
            </>
          ) : (
            <p className="text-sm text-muted">Only one revision so far.</p>
          )}
        </div>
      </div>
    </div>
  );
}
