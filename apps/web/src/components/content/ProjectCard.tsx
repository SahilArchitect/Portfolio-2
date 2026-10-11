import Image from 'next/image';
import Link from 'next/link';

import type { PublicEntry } from '@/lib/content/public';
import type { ImageDims } from '@/lib/markdown/render';
import { formatMonth } from '@/lib/dates';

import { ChipRow, MetaLine, StatusBadge } from './bits';

export function ProjectCard({
  project,
  dims,
}: {
  project: PublicEntry<'project'>;
  dims: ImageDims;
}) {
  const { data } = project;
  const thumb = data.thumbnailUrl ? dims[data.thumbnailUrl] : undefined;
  return (
    <article className="grid gap-4 border-t border-rule py-5 sm:grid-cols-[9rem_1fr]">
      {data.thumbnailUrl && thumb ? (
        <Image
          src={data.thumbnailUrl}
          alt={data.thumbnailAlt}
          width={thumb.width}
          height={thumb.height}
          sizes="(min-width: 640px) 9rem, 100vw"
          className="h-auto w-full border border-rule bg-white object-contain sm:w-36"
        />
      ) : (
        <div className="hidden sm:block" aria-hidden="true" />
      )}
      <div className="min-w-0 space-y-1.5">
        <h3 className="leading-snug font-semibold">
          <Link
            href={`/research/${project.slug}`}
            className="text-fg no-underline hover:text-accent hover:underline"
          >
            {data.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-[0.95em]">{data.summary}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusBadge status={data.projectStatus} />
          <MetaLine parts={[formatMonth(data.startMonth), data.tags.join(', ')]} />
        </div>
        <ChipRow
          links={[
            { label: 'code', href: data.links.code },
            { label: 'write-up', href: data.links.writeup || `/research/${project.slug}` },
            { label: 'data', href: data.links.data },
          ]}
        />
      </div>
    </article>
  );
}
