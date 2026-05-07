import { AdminSignInForm } from '@/components/AdminSignInForm';

export default function SignInPage({ searchParams }: { searchParams?: { callbackUrl?: string } }) {
  const callbackUrl = searchParams?.callbackUrl ?? '/';

  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 py-20">
      <section className="w-full rounded-xl border border-border bg-bg-elev p-6">
        <p className="font-mono text-micro uppercase tracking-wider text-fg-muted">Engine Room</p>
        <h1 className="mt-3 font-display text-display-md font-medium text-fg">Admin sign in</h1>
        <p className="mt-3 text-body-sm text-fg-muted">
          Enter the allowlisted email and admin code.
        </p>
        <AdminSignInForm callbackUrl={callbackUrl} />
      </section>
    </main>
  );
}
