# bysahil.dev

Source for [bysahil.dev](https://www.bysahil.dev), Sahil Bhatti's research website (security of AI
systems), with a private admin at `/admin` for editing everything from the browser.

- **Public site:** Home, Research, Reproductions, Notes, CV, Log, plus RSS (`/feed.xml`),
  `/sitemap.xml`, `/robots.txt` and a custom 404. Pages are prerendered and served statically.
  Saving in the admin invalidates the cache, so changes are live within seconds.
- **Admin:** single owner (GitHub sign-in restricted to one account), Markdown editor with live
  preview, autosave, revision history, preview links, uploads, export and import.

## Stack

| Concern    | Choice                                                                   |
| ---------- | ------------------------------------------------------------------------ |
| Framework  | Next.js 16 (App Router, Cache Components), React 19, TypeScript strict   |
| Styling    | Tailwind CSS 4, design tokens as CSS variables (`src/app/globals.css`)   |
| Database   | PostgreSQL via Drizzle ORM + SQL migrations (`apps/web/drizzle/`)        |
| Files      | Vercel Blob (prod) / local disk (dev), behind `src/lib/storage`          |
| Auth       | Auth.js v5, GitHub OAuth, database sessions (7 days)                     |
| Markdown   | unified: GFM, footnotes, KaTeX, Shiki, `rehype-sanitize` (strict schema) |
| Validation | Zod schemas shared by forms, server actions and import                   |
| Tests      | Vitest (unit), Playwright (end-to-end)                                   |

Layout: everything lives in `apps/web` (pnpm workspace).

```text
apps/web/
  src/app/(site)/        public pages (prerendered; ensureStatic = 'navigation')
  src/app/admin/         admin (owner-only) and its server actions
  src/app/api/           auth, admin export, admin preview
  src/lib/content/       schemas, public read gate, repository, import/export
  src/lib/markdown/      renderer + sanitizer schema
  src/db/                Drizzle schema; legacy-content.ts = old site's content (seeded as archived)
  drizzle/               SQL migrations
  scripts/               migrate, seed, e2e-prepare
  tests/unit, tests/e2e  Vitest and Playwright
```

## Run locally

Prerequisites: Node 22 (`.nvmrc`), pnpm 9 (`corepack enable`), and Docker for Postgres. Any
Postgres 14+ also works.

```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d     # Postgres on :5432 (user/pass/db: site)
cp .env.example apps/web/.env                         # then fill in AUTH_* (see below)
pnpm db:migrate
pnpm db:seed                                          # idempotent; never overwrites edits
pnpm dev                                              # http://localhost:3000
```

Without `BLOB_READ_WRITE_TOKEN`, uploads are stored in `apps/web/.data/` and served from `/files/…`.

To sign in locally, create a second GitHub OAuth App with callback
`http://localhost:3000/api/auth/callback/github` and put its ID and secret in `apps/web/.env`.

## Environment variables

All variables are documented in [`.env.example`](.env.example).

| Variable                                | Required             | Purpose                                                       |
| --------------------------------------- | -------------------- | ------------------------------------------------------------- |
| `DATABASE_URL`                          | yes                  | Postgres connection string (pooled Neon URL in production)    |
| `NEXT_PUBLIC_SITE_URL`                  | yes                  | Canonical origin, e.g. `https://www.bysahil.dev`              |
| `AUTH_SECRET`                           | yes                  | Auth.js secret: `openssl rand -base64 32`                     |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | yes                  | GitHub OAuth App credentials                                  |
| `ADMIN_ALLOWED_IDENTITY`                | yes                  | `github:<numeric user id>`, the only account that may sign in |
| `BLOB_READ_WRITE_TOKEN`                 | prod                 | Vercel Blob token (set automatically when a store is linked)  |
| `NEXT_PUBLIC_ANALYTICS`                 | no (default `false`) | Reserved flag for cookieless analytics; off                   |

## Tests and checks

```bash
pnpm lint
pnpm typecheck
pnpm test                 # Vitest: schemas, slugs, renderer + sanitizer, BibTeX, redirects, uploads
pnpm format:check

# End-to-end: needs a database whose name ends in _test (the script refuses anything else)
DATABASE_URL=postgres://site:site@localhost:5432/site_test pnpm test:e2e
```

`test:e2e` resets the test database, migrates, seeds, creates an owner session directly in the
database, builds, and runs Playwright against the production server. CI
(`.github/workflows/ci.yml`) runs all of the above on every pull request and push to `main`.

## Deploy (Vercel)

The site deploys through Vercel's Git integration: pull requests get preview deployments, and
merging to `main` deploys production.

One-time setup for the `portfolio-2-web` project:

1. **Root directory** `apps/web`, framework Next.js. Install and build commands stay at their defaults.
2. **Database:** Storage → Marketplace → **Neon** → create and connect. This sets `DATABASE_URL`.
   Use the pooled connection string.
3. **Files:** Storage → **Blob** → create and connect. This sets `BLOB_READ_WRITE_TOKEN`.
4. **GitHub OAuth App** at <https://github.com/settings/developers>: homepage
   `https://www.bysahil.dev`, callback `https://www.bysahil.dev/api/auth/callback/github`. Copy
   the ID and secret into `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`.
5. Set `AUTH_SECRET`, `ADMIN_ALLOWED_IDENTITY=github:26546141` and
   `NEXT_PUBLIC_SITE_URL=https://www.bysahil.dev`.
6. **Migrate and seed the production database** once, from your machine:
   ```bash
   cd apps/web
   DATABASE_URL='<neon url>' pnpm db:migrate
   DATABASE_URL='<neon url>' pnpm db:seed
   ```
   Run `db:migrate` again whenever a new file appears in `apps/web/drizzle/`.
7. Redeploy. Public pages are prerendered at build time, so the build needs `DATABASE_URL`.

The old `portfolio-2-admin` project (admin.bysahil.dev) is no longer needed. Point that domain at
a redirect to `https://www.bysahil.dev/admin`, or remove it.

## Using the admin

Sign in at `/admin` with GitHub. Only the account in `ADMIN_ALLOWED_IDENTITY` is accepted, and
there is no sign-up.

- **Dashboard:** counts per type and status, the last 10 edits, every entry that still contains
  `TODO:`, and "New …" buttons.
- **Editing:** every field is validated as you type. Drafts autosave to the database after about
  3 s ("Saved · 12:41"), and the browser warns before you leave with unsaved changes.
  **Cmd/Ctrl+S** saves; **Cmd/Ctrl+Enter** publishes (asks first).
- **Markdown:** GFM tables, footnotes, `$math$` / `$$display math$$`, fenced code with syntax
  highlighting. `![alt](url "caption")` on its own line becomes a numbered figure. Drag an image
  onto the editor to upload it; alt text is required. On a phone, the editor switches to
  Edit/Preview tabs.
- **Interactive figure:** upload a JSON file under **Assets**, shaped as
  `{ "series": [{ "name": "random", "points": [[0, 0.93], [10, 0.71]] }] }`, then insert
  `::figure{type="bitflip-curve" data="<asset url>"}` or pick it in a project's "Interactive
  figure" field. If there's no valid data, nothing renders.
- **Statuses:** `draft` → `published` → `archived`. Archive is the soft delete. Archived entries
  can be deleted permanently (you type `DELETE` to confirm). Anything containing `TODO:` cannot be
  published, and is filtered from public pages anyway.
- **Slugs** follow the title until you edit them. Renaming a published slug creates a redirect
  from the old URL automatically.
- **Revision history:** every save creates a revision (autosaves within 10 minutes merge into
  one). You can diff any two revisions and restore one in a click.
- **Preview links:** "Create preview link" copies an unguessable URL that expires in 7 days.
  "Revoke preview links" kills every link for that entry.
- **Scheduled publishing:** set a time on a published entry. It appears within the hour after
  that time (the cache lifetime).
- **Featured order** reorders home-page projects. Research interests are reordered in **Profile**.
- **CV files:** upload a PDF; the newest becomes current and the only one linked publicly.
  Earlier versions stay listed.
- **Profile:** the bio is hidden until you tick "Bio reviewed". Interests containing `TODO:` are
  hidden.
- **Settings:** export everything (zip with `content.json` + Markdown copies), import a
  `content.json` (fully validated first; nothing is written if anything is invalid), and "Log out
  everywhere" (deletes all sessions).

## Backups

- **Export:** Admin → Settings → Download export. Keep a copy after big edits.
- **Database:** Neon keeps point-in-time history (the length depends on the plan). Also take a
  scheduled dump, for example a weekly GitHub Action or cron job:
  `pg_dump "$DATABASE_URL" --no-owner --format=custom > bysahil-$(date +%F).dump`, stored outside
  Vercel.
- **Files:** Blob files are referenced by URL in the export. For an offline copy, list and
  download them with the Vercel CLI (`vercel blob list`).

## Security notes

- Every admin page, server action and admin route re-checks the owner session against the
  database. The proxy only does a cheap redirect.
- Mutations: server actions verify `Origin`, and the proxy additionally rejects admin `POST`s
  whose `Origin` is missing or foreign. Login and mutations are rate-limited (Postgres-backed).
- Markdown never passes raw HTML. Output is sanitized (http/https/mailto links only), and
  directives are allow-listed.
- Uploads are typed by magic bytes. Only PNG, JPEG, WebP, PDF and figure JSON are accepted; SVG
  is rejected. Files get random names (max 4 MB because of Vercel's request limit).
- Headers: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `X-Frame-Options`. The CSP allows `'unsafe-inline'` scripts because Cache Components serves
  prerendered shells, which cannot carry per-request nonces. No third-party script origins are
  allowed.

## Retired URLs

`/work` → `/research`, `/work/encrypted-network-traffic-classification` →
`/research/encrypted-traffic-classification`, and `/writing` → `/notes` all redirect (308).
`/hire`, `/now`, `/traces`, the old project and post URLs, and `/resume/ai-backend-engineer.pdf`
answer **410 Gone**. See `src/lib/legacy-routes.ts`.

The unlinked side projects `/trident`, `/tracker` and `/harsimran` are still reachable by direct
URL but are `noindex` and disallowed in `robots.txt`.
