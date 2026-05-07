/**
 * NextAuth (v5) — email magic-link, single-admin allowlist.
 *
 * Reads ADMIN_EMAIL (single address) from env. Falls back to a console-logging
 * dev transport when RESEND_API_KEY is not set.
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import type { Adapter, AdapterUser, VerificationToken } from 'next-auth/adapters';
import Resend from 'next-auth/providers/resend';

const OWNER_EMAIL = 'sahil@bysahil.dev';

function adminEmails() {
  const configured = [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return new Set([...configured, OWNER_EMAIL]);
}

const usersById = new Map<string, AdapterUser>();
const usersByEmail = new Map<string, AdapterUser>();
const verificationTokens = new Map<string, VerificationToken>();

function tokenKey(identifier: string, token: string) {
  return `${identifier.toLowerCase()}:${token}`;
}

function memoryMagicLinkAdapter(): Adapter {
  return {
    async createUser(user) {
      const email = user.email.toLowerCase();
      const existing = usersByEmail.get(email);
      if (existing) return existing;
      const created: AdapterUser = {
        id: crypto.randomUUID(),
        email,
        emailVerified: user.emailVerified ?? null,
        name: user.name ?? null,
        image: user.image ?? null,
      };
      usersById.set(created.id, created);
      usersByEmail.set(email, created);
      return created;
    },
    async getUser(id) {
      return usersById.get(id) ?? null;
    },
    async getUserByEmail(email) {
      return usersByEmail.get(email.toLowerCase()) ?? null;
    },
    async getUserByAccount() {
      return null;
    },
    async updateUser(user) {
      const existing = usersById.get(user.id);
      if (!existing) throw new Error('User not found');
      const updated = { ...existing, ...user };
      usersById.set(updated.id, updated);
      usersByEmail.set(updated.email.toLowerCase(), updated);
      return updated;
    },
    async deleteUser(id) {
      const existing = usersById.get(id);
      if (existing) usersByEmail.delete(existing.email.toLowerCase());
      usersById.delete(id);
    },
    async linkAccount(account) {
      return account;
    },
    async unlinkAccount() {},
    async createVerificationToken(token) {
      verificationTokens.set(tokenKey(token.identifier, token.token), token);
      return token;
    },
    async useVerificationToken(params) {
      const key = tokenKey(params.identifier, params.token);
      const token = verificationTokens.get(key) ?? null;
      verificationTokens.delete(key);
      return token;
    },
  };
}

// Dev transport: logs the magic link to stderr when RESEND_API_KEY is absent.
function devTransport() {
  return {
    async sendVerificationRequest({
      identifier,
      url,
    }: {
      identifier: string;
      url: string;
    }) {
      console.error(
        `[auth/dev-transport] Magic link for ${identifier}:\n  ${url}\n`,
      );
    },
  };
}

const resendApiKey = process.env.RESEND_API_KEY;

const emailProvider = resendApiKey
  ? Resend({
      from: process.env.EMAIL_FROM ?? 'noreply@example.com',
      apiKey: resendApiKey,
    })
  : // Minimal no-op provider that uses the dev transport above.
    // We still need the Resend provider shape; we pass a dummy key and
    // override sendVerificationRequest via the auth config sendVerificationRequest.
    Resend({
      from: process.env.EMAIL_FROM ?? 'noreply@example.com',
      apiKey: 'dev-no-key',
      sendVerificationRequest: devTransport().sendVerificationRequest,
    });

export const authConfig = {
  adapter: memoryMagicLinkAdapter(),
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [emailProvider],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;
      return adminEmails().has(email);
    },
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
