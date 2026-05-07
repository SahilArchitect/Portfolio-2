/**
 * NextAuth (v5) — single-admin credentials auth.
 *
 * Uses JWT sessions so the admin app works on serverless hosts without a
 * database-backed Auth.js adapter.
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const OWNER_EMAIL = 'sahil@bysahil.dev';

function adminEmails() {
  const configured = [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return new Set([...configured, OWNER_EMAIL]);
}

function adminSecret() {
  return (
    process.env.ADMIN_PASSCODE ??
    process.env.ADMIN_PASSWORD ??
    process.env.ADMIN_TOKEN ??
    ''
  ).trim();
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

const credentialsProvider = Credentials({
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Admin code', type: 'password' },
  },
  async authorize(credentials) {
    const email = stringValue(credentials.email).toLowerCase();
    const password = stringValue(credentials.password);
    const secret = adminSecret();

    if (!email || !password || !secret) return null;
    if (!adminEmails().has(email)) return null;
    if (password !== secret) return null;

    return {
      id: email,
      email,
      name: 'Admin',
    };
  },
});

export const authConfig = {
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [credentialsProvider],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string;
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in/error',
    verifyRequest: '/sign-in/check-inbox',
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
