import { Suspense } from 'react';

import { signIn } from '@/auth';

export const metadata = { title: 'Sign in' };

const ERRORS: Record<string, string> = {
  AccessDenied: 'That GitHub account is not allowed to sign in.',
  Configuration: 'Sign-in is not configured on this deployment (check AUTH_* environment variables).',
};

async function Message({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { error } = await searchParams;
  const code = typeof error === 'string' ? error : undefined;
  if (!code) return null;
  return (
    <p role="alert" className="mt-4 rounded border border-rule bg-bg-subtle p-3 text-sm">
      {ERRORS[code] ?? 'Sign-in failed. Try again.'}
    </p>
  );
}

export default function LoginPage(props: PageProps<'/admin/login'>) {
  return (
    <main className="mx-auto max-w-sm px-4 pt-24">
      <p className="meta">bysahil.dev · admin</p>
      <h1 className="mt-1 text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Owner only. There is no sign-up.</p>
      <form
        action={async () => {
          'use server';
          await signIn('github', { redirectTo: '/admin' });
        }}
        className="mt-6"
      >
        <button type="submit" className="w-full rounded bg-fg px-4 py-2.5 text-bg hover:opacity-90">
          Continue with GitHub
        </button>
      </form>
      <Suspense fallback={null}>
        <Message searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}
