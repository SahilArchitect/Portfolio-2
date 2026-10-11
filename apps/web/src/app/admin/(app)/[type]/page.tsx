import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { NewEntryButton } from '@/components/admin/NewEntryButton';
import { TYPE_LABELS } from '@/lib/content/fields';
import { createEntry, listEntries } from '@/lib/content/repository';
import { contentTypeSchema, STATUSES, type Status } from '@/lib/content/schemas';
import { requireOwnerPage } from '@/lib/server/owner';

export default async function EntryList(props: PageProps<'/admin/[type]'>) {
  await requireOwnerPage();
  const { type: rawType } = await props.params;
  const parsed = contentTypeSchema.safeParse(rawType);
  if (!parsed.success) notFound();
  const type = parsed.data;

  if (type === 'profile') {
    const [profile] = await listEntries('profile');
    if (profile) redirect(`/admin/profile/${profile.id}`);
    const created = await createEntry('profile', undefined, {
      slug: 'profile',
      status: 'published',
    });
    if (created.ok) redirect(`/admin/profile/${created.value.id}`);
    notFound();
  }

  const { status: rawStatus } = await props.searchParams;
  const status = STATUSES.includes(rawStatus as Status) ? (rawStatus as Status) : undefined;
  const rows = await listEntries(type, status);
  const labels = TYPE_LABELS[type];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{labels.plural}</h1>
        <NewEntryButton type={type} label={`New ${labels.singular.toLowerCase()}`} />
      </div>
      <nav aria-label="Filter by status" className="meta mt-4 flex gap-3">
        <Link
          href={`/admin/${type}`}
          aria-current={!status ? 'page' : undefined}
          className={!status ? 'text-fg' : ''}
        >
          all
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/${type}?status=${s}`}
            aria-current={status === s ? 'page' : undefined}
            className={status === s ? 'text-fg' : ''}
          >
            {s}
          </Link>
        ))}
      </nav>
      <ul className="mt-4 divide-y divide-rule border-y border-rule">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
            <Link
              href={`/admin/${type}/${row.id}`}
              className="min-w-0 flex-1 text-fg no-underline hover:text-accent"
            >
              {row.title}
            </Link>
            <span className="meta">
              {row.status} · {row.slug} · {row.updatedAt.toISOString().slice(0, 10)}
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="py-3 text-sm text-muted">Nothing here yet.</li>}
      </ul>
    </div>
  );
}
