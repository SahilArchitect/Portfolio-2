import 'server-only';

import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { auth } from '@/auth';
import { db } from '@/db';
import { accounts } from '@/db/schema';

import { allowedGithubId } from './identity';

export class UnauthorizedError extends Error {
  constructor() {
    super('Not signed in as the site owner');
  }
}

/** The owner's user id when the current request carries a valid owner session, else null. */
export const getOwnerId = cache(async (): Promise<string | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  const allowed = allowedGithubId();
  if (!userId || !allowed) return null;
  // Re-check on every request: changing ADMIN_ALLOWED_IDENTITY locks out old sessions.
  const [link] = await db
    .select({ id: accounts.providerAccountId })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.provider, 'github'),
        eq(accounts.providerAccountId, allowed),
      ),
    )
    .limit(1);
  return link ? userId : null;
});

/** For server actions and route handlers: throws if not the owner. */
export async function requireOwner(): Promise<string> {
  const id = await getOwnerId();
  if (!id) throw new UnauthorizedError();
  return id;
}

/** For admin pages: redirects to the login page if not the owner. */
export async function requireOwnerPage(): Promise<string> {
  const id = await getOwnerId();
  if (!id) redirect('/admin/login');
  return id;
}
