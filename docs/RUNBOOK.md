# The Engine Room Runbook

## Production URLs

- Public app: `https://engine-room-web.fly.dev`
- Admin app: `https://engine-room-admin.fly.dev`
- API health: `https://engine-room-api.fly.dev/api/health`
- Custom domains come from `DOMAIN`, `ADMIN_DOMAIN`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_API_BASE_URL`.

## Current Deploy Status

This workspace is not a Git checkout, so `gh workflow run deploy.yml` cannot be dispatched from here. `gh auth status` is valid for `SahilArchitect`, but there is no local `.git` remote. `flyctl` is also not installed locally.

Before production deploy:

```bash
git clone <production-repo-url>
cd <production-repo>
brew install flyctl
flyctl auth login
```

The existing GitHub Actions workflow deploys three Fly apps: `engine-room-api`, `engine-room-web`, and `engine-room-admin`.

## Deploy

1. Verify secrets and variables are set:

```bash
gh secret list
gh variable list
```

Required GitHub/Fly values:

- `FLY_API_TOKEN`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`

Required Fly app secrets:

```bash
fly secrets list --app engine-room-api
fly secrets list --app engine-room-admin
fly secrets list --app engine-room-web
```

2. Trigger deploy:

```bash
gh workflow run deploy.yml
gh run watch
```

3. Verify all apps:

```bash
fly status --app engine-room-api
fly status --app engine-room-web
fly status --app engine-room-admin
curl -fsS https://engine-room-api.fly.dev/api/health
```

Expected health response:

```json
{ "status": "ok", "db": true, "redis": true, "vector_index": true }
```

## Seed Production

`infra/seed.py` is idempotent. It upserts projects/admin user and preserves an existing current `now` entry.

```bash
export DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/engine_room'
export ADMIN_EMAIL='sahil@bysahil.dev'
uv run python infra/seed.py
```

Expected output:

```text
seed complete: 2 projects, 1 now-entry, 0 posts, 1 admin user
```

## Re-Ingest Substack

The scheduled worker runs `ingest_substack` every 30 minutes and refreshes embeddings after inserts.

For Docker/Compose production:

```bash
docker compose --env-file infra/.env.production -f infra/docker-compose.prod.yml exec worker \
  python -c "import asyncio; from app.jobs.substack import ingest_substack; print(asyncio.run(ingest_substack()))"
```

For current Fly deployment, note that the workflow only deploys API, web, and admin. There is no worker Fly app in `infra/fly/`. Until that exists, run ingestion from a trusted machine with production `DATABASE_URL`, `REDIS_URL`, `SUBSTACK_FEED_URL`, and provider keys set:

```bash
cd services/worker
uv run python -c "import asyncio; from app.jobs.substack import ingest_substack; print(asyncio.run(ingest_substack()))"
```

Then verify embeddings:

```bash
cd services/worker
uv run python -c "import asyncio; from app.jobs.embeddings import refresh_embeddings; print(asyncio.run(refresh_embeddings()))"
```

## Rotate Secrets

1. Generate new values:

```bash
openssl rand -base64 32
```

2. Rotate API secrets:

```bash
fly secrets set --app engine-room-api ADMIN_TOKEN='...' OPENAI_API_KEY='...' ANTHROPIC_API_KEY='...'
```

3. Rotate admin secrets:

```bash
fly secrets set --app engine-room-admin AUTH_SECRET='...' ADMIN_TOKEN='...' RESEND_API_KEY='...' EMAIL_FROM='sahil@bysahil.dev'
```

4. Restart and verify:

```bash
fly apps restart engine-room-api
fly apps restart engine-room-admin
curl -fsS https://engine-room-api.fly.dev/api/health
```

## Admin Login

1. Open `https://engine-room-admin.fly.dev/sign-in`.
2. Enter the allowlisted `ADMIN_EMAIL`.
3. Open the Resend magic-link email.
4. After login, edit projects, flags, resumes, hero copy, and now entries from the admin app.

In local development, if `RESEND_API_KEY` is unset, the magic link is printed to admin server logs.

## Add A New Project

1. Log into admin.
2. Go to `Content -> Projects`.
3. Add title, slug, summary, body, role, stack, status, URLs, and display order.
4. Publish the project.
5. Refresh embeddings:

```bash
cd services/worker
uv run python -c "import asyncio; from app.jobs.embeddings import refresh_embeddings; print(asyncio.run(refresh_embeddings()))"
```

6. Verify:

```bash
curl -fsSI https://engine-room-web.fly.dev/work/<slug>
```

## Add A Resume Variant

1. Upload the PDF to the configured public storage/CDN.
2. Log into admin.
3. Go to `Content -> Resumes`.
4. Add label, slug, file URL, role keywords, and default flag if needed.
5. Verify the public resume selector or default resume URL.

## Logs And Metrics

- API logs: `fly logs --app engine-room-api`
- Web logs: `fly logs --app engine-room-web`
- Admin logs: `fly logs --app engine-room-admin`
- Fly app metrics: Fly dashboard for each app.
- Public app metrics surface: `/api/metrics/public`
- Traces: OTLP exporter configured by `OTEL_EXPORTER_OTLP_ENDPOINT`; Compose includes `otel-collector`.
- Rate limit data: Redis DB 1 via `REDIS_URL`.

## Production Readiness Checks

- Regenerate API types: `pnpm types:generate`
- Migration drift: `cd services/api && ../../.venv/bin/alembic check`
- TypeScript: `pnpm -r typecheck`
- Python tests: `uv run pytest`
- JS lint: `pnpm -r lint`
- Python lint: `uv run ruff check services infra/seed.py`
- API health: `curl -fsS https://engine-room-api.fly.dev/api/health`
- Axe: run axe-core against `/`, `/work/<slug>`, and `/writing/<slug>`.
- Lighthouse targets: performance >= 95, accessibility 100, best practices >= 95, SEO 100.

## Common Failure Modes

- `gh workflow run` fails: run it from the real Git checkout with a remote, not this workspace copy.
- `flyctl: command not found`: install with `brew install flyctl`.
- API health reports `db:false`: verify Fly Postgres attachment or `DATABASE_URL`.
- API health reports `redis:false`: verify Redis service/URL and network reachability.
- Search returns 502: run embeddings refresh and confirm provider keys or deterministic local fallback.
- Admin magic link never arrives: verify `RESEND_API_KEY`, `EMAIL_FROM`, `AUTH_SECRET`, and `ADMIN_EMAIL`.
- Admin edits 401: `ADMIN_TOKEN` mismatch between admin app and API.
- Public site does not reflect admin edits: check API cache/revalidation window and confirm the admin mutation succeeded.
- Substack ingest inserts zero posts: verify `SUBSTACK_FEED_URL`; duplicate canonical URLs are skipped by design.
- Embeddings stay empty: verify `OPENAI_API_KEY` in production or inspect worker logs.
- CORS failures: set `API_CORS_ORIGINS` to exact production origins only, for example `["https://bysahil.dev","https://admin.bysahil.dev"]`.
- Admin pages indexed: verify `https://engine-room-admin.fly.dev/robots.txt` returns `Disallow: /`.
