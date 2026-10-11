import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

import { db } from '@/db';
import { accounts, sessions, users, verificationTokens } from '@/db/schema';
import { allowedGithubId } from '@/lib/server/identity';

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Database sessions so "log out everywhere" can revoke them server-side.
  session: { strategy: 'database', maxAge: SESSION_MAX_AGE, updateAge: 60 * 60 * 24 },
  // Reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET.
  providers: [GitHub],
  pages: { signIn: '/admin/login', error: '/admin/login' },
  trustHost: true,
  callbacks: {
    // Single owner: only the GitHub account named in ADMIN_ALLOWED_IDENTITY may sign in.
    signIn({ account, profile }) {
      const allowed = allowedGithubId();
      return Boolean(
        allowed && account?.provider === 'github' && String(profile?.id ?? '') === allowed,
      );
    },
  },
});
