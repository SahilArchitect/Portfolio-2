import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="content" className="mx-auto max-w-measure px-4 pt-16 sm:px-0">
      <p className="meta">404 · not found</p>
      <h1 className="mt-2 text-2xl font-semibold">This page does not exist.</h1>
      <p className="mt-4">
        It may have moved. Try the <Link href="/">home page</Link>, <Link href="/research">research</Link>, or{' '}
        <Link href="/notes">notes</Link>.
      </p>
    </main>
  );
}
