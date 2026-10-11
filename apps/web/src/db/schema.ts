import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

/**
 * Every editable content type lives in one table. `data` holds the
 * type-specific fields and is validated by the Zod schema for `type`
 * (see src/lib/content/schemas.ts) on every write and import.
 */
export const entries = pgTable(
  'entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    status: text('status').notNull().default('draft'),
    data: jsonb('data').notNull().$type<Record<string, unknown>>(),
    sortOrder: integer('sort_order').notNull().default(0),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    publishAt: timestamp('publish_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('entries_type_slug_idx').on(t.type, t.slug),
    index('entries_type_status_idx').on(t.type, t.status),
  ],
);

export const revisions = pgTable(
  'revisions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => entries.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    snapshot: jsonb('snapshot').notNull().$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('revisions_entry_idx').on(t.entryId, t.createdAt)],
);

export const slugRedirects = pgTable(
  'slug_redirects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(),
    fromSlug: text('from_slug').notNull(),
    toSlug: text('to_slug').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('slug_redirects_from_idx').on(t.type, t.fromSlug)],
);

export const previewTokens = pgTable('preview_tokens', {
  tokenHash: text('token_hash').primaryKey(),
  entryId: uuid('entry_id')
    .notNull()
    .references(() => entries.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull().unique(),
  pathname: text('pathname').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  altText: text('alt_text').notNull().default(''),
  caption: text('caption'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cvFiles = pgTable(
  'cv_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    url: text('url').notNull(),
    pathname: text('pathname').notNull(),
    label: text('label').notNull(),
    size: integer('size').notNull(),
    isCurrent: boolean('is_current').notNull().default(false),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // At most one current CV; the admin action keeps it at exactly one.
  (t) => [
    uniqueIndex('cv_files_one_current_idx')
      .on(t.isCurrent)
      .where(sql`${t.isCurrent}`),
  ],
);

export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  resetAt: timestamp('reset_at', { withTimezone: true }).notNull(),
});

// --- Auth.js tables (shape required by @auth/drizzle-adapter) ---

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export type Entry = typeof entries.$inferSelect;
export type Revision = typeof revisions.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type CvFile = typeof cvFiles.$inferSelect;
