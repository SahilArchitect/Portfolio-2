import { notFound, redirect } from 'next/navigation';

import { auth } from '@/auth';

const OWNER_EMAIL = 'sahil@bysahil.dev';

function adminEmails() {
  const configured = [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return new Set([...configured, OWNER_EMAIL]);
}

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();

  if (!email) redirect('/sign-in');
  if (!adminEmails().has(email)) notFound();

  return { email };
}
