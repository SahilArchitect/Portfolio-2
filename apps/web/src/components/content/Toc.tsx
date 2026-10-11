export type TocItem = { id: string; label: string };

/**
 * Table of contents. On wide screens it sits in a sticky right rail outside
 * the text column; on small screens it is a collapsed <details> above the text.
 * No JavaScript.
 */
export function Toc({ items }: { items: TocItem[] }) {
  if (items.length < 3) return null;
  const list = (
    <ol className="meta space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className="text-muted no-underline hover:text-accent">
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <>
      <details className="mt-6 xl:hidden">
        <summary className="meta cursor-pointer">Contents</summary>
        <nav aria-label="Contents" className="mt-2">
          {list}
        </nav>
      </details>
      <nav
        aria-label="Contents"
        className="absolute top-0 left-full ml-12 hidden h-full w-48 xl:block"
      >
        <div className="sticky top-8">
          <p className="meta mb-2 text-fg">Contents</p>
          {list}
        </div>
      </nav>
    </>
  );
}
