export default function CheckInboxPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 py-20">
      <section className="rounded-xl border border-border bg-bg-elev p-6">
        <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">Check inbox</p>
        <h1 className="mt-3 font-display text-display-md font-medium text-fg">Magic link sent</h1>
        <p className="mt-3 text-body-sm text-fg-muted">
          Open the email on this device. In local development, the dev transport prints the link to the server logs.
        </p>
      </section>
    </main>
  );
}
