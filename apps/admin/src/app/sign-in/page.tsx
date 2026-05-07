import { AuthError } from 'next-auth';

import { signIn } from '@/auth';

async function signInAdmin(formData: FormData) {
  'use server';

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const callbackUrl = String(formData.get('callbackUrl') ?? '/') || '/';

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return;
    }
    throw error;
  }
}

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
        <form action={signInAdmin} className="mt-6 grid gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <label className="grid gap-1.5">
            <span className="font-mono text-micro uppercase tracking-wider text-fg-muted">Email</span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="rounded-md border border-border bg-bg px-3 py-2 font-display text-body-sm text-fg placeholder:text-fg-muted focus:border-border-strong focus:outline-none"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="font-mono text-micro uppercase tracking-wider text-fg-muted">Admin code</span>
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Paste ADMIN_TOKEN or ADMIN_PASSCODE"
              className="rounded-md border border-border bg-bg px-3 py-2 font-display text-body-sm text-fg placeholder:text-fg-muted focus:border-border-strong focus:outline-none"
            />
          </label>
          <button
            type="submit"
            data-cursor="hover"
            className="rounded-md border border-border-strong bg-accent-muted px-3 py-2 font-mono text-mono-sm font-medium text-fg hover:border-accent"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
