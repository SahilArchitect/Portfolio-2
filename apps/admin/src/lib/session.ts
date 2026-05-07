import { notFound, redirect } from 'next/navigation';

import { auth } from '@/auth';

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) redirect('/sign-in');
  if (!adminEmail || email !== adminEmail) notFound();

  return { email };
}
