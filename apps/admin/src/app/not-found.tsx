export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 py-20">
      <section className="rounded-xl border border-border bg-bg-elev p-6">
        <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">404</p>
        <h1 className="mt-3 font-display text-display-md font-medium text-fg">Not found</h1>
        <p className="mt-3 text-body-sm text-fg-muted">This route is unavailable for the current session.</p>
      </section>
    </main>
  );
}
