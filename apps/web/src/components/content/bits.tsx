import Link from 'next/link';

/** Monospace metadata line: parts joined by a middle dot, empty parts dropped. */
export function MetaLine({
  parts,
  className = '',
}: {
  parts: (string | null | undefined | false)[];
  className?: string;
}) {
  const visible = parts.filter((part): part is string => Boolean(part));
  if (visible.length === 0) return null;
  return <p className={`meta ${className}`}>{visible.join(' · ')}</p>;
}

export function Chip({ href, children }: { href: string; children: React.ReactNode }) {
  const external = /^https?:\/\//.test(href);
  if (!external) {
    return (
      <Link href={href} className="chip">
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className="chip" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function StatusBadge({ status }: { status: 'ongoing' | 'completed' }) {
  return (
    <span className="meta rounded-sm bg-badge px-1.5 py-0.5 text-fg">
      {status === 'ongoing' ? '● ongoing' : '○ completed'}
    </span>
  );
}

export function ChipRow({ links }: { links: { label: string; href?: string | null }[] }) {
  const shown = links.filter((link): link is { label: string; href: string } => Boolean(link.href));
  if (shown.length === 0) return null;
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1">
      {shown.map((link) => (
        <Chip key={link.label} href={link.href}>
          {link.label}
        </Chip>
      ))}
    </p>
  );
}
