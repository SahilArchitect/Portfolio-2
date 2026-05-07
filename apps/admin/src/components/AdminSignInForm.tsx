'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export function AdminSignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setPending(false);
    if (result?.ok && result.url) {
      window.location.assign(result.url);
      return;
    }

    setError(true);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
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
      {error ? (
        <p className="text-body-sm text-danger">Use the allowlisted email and current admin code.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        data-cursor="hover"
        className="rounded-md border border-border-strong bg-accent-muted px-3 py-2 font-mono text-mono-sm font-medium text-fg hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
