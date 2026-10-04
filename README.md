# The Engine Room

Sahil Bhatti's portfolio site and a working demonstration of production AI backend infrastructure: RAG, LLM observability, admin operations, Substack ingestion, and deployable services.

## First Run In 5 Minutes

Prerequisites: Node 20+, pnpm 9.12, Python 3.12, uv, Docker.

```bash
corepack enable
corepack prepare pnpm@9.12.0 --activate
pnpm install
uv sync --all-packages --all-extras
cp infra/.env.example .env
docker compose -f infra/docker-compose.yml up -d postgres redis
cd services/api && uv run --package engine-room-api alembic upgrade head && cd ../..
uv run python infra/seed.py
```

Start the apps in separate terminals:

```bash
uv run --package engine-room-api uvicorn app.main:app --app-dir services/api --reload --port 8000
```

```bash
PYTHONPATH=services/worker:services/api uv run --package engine-room-worker python -m app.scheduler
```

```bash
pnpm dev
```

Local URLs:

- Public site: `http://localhost:3000`
- Admin console: `http://localhost:3001`
- API health: `http://localhost:8000/api/health`
- API docs: `http://localhost:8000/docs`

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind, Framer Motion
- Backend: FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic
- Data: PostgreSQL 16 + pgvector, Redis
- AI: OpenAI embeddings, Anthropic generation through an LLM gateway
- Auth: NextAuth email magic link for the admin app, `ADMIN_TOKEN` for admin API calls
- Observability: OpenTelemetry collector, console exporter in dev, configurable OTLP export in prod
- Deploy: Docker Compose production stack, Caddy auto-TLS, Fly.io configs, GitHub Actions

## Layout

```text
apps/web              Public Next.js site
apps/admin            Admin Next.js console
services/api          FastAPI backend and Alembic migrations
services/worker       APScheduler ingestion/maintenance worker
packages/ui           Shared design tokens, motion, primitives
packages/types        Generated TypeScript API types
infra                 Docker, Fly, OTel, seed, backup, env templates
docs/AGENTS.md        Phase 2 parallel-agent contracts
```

## Common Commands

```bash
pnpm lint
pnpm typecheck
pnpm build
uv run ruff check services infra/seed.py
cd services/api && uv run --package engine-room-api alembic check
uv run --package engine-room-api pytest services/api/tests
```

## Production Compose

```bash
cp infra/.env.production.example infra/.env.production
# edit infra/.env.production: domains, secrets, provider keys, backup bucket
docker compose --env-file infra/.env.production -f infra/docker-compose.prod.yml up -d --build
```

Caddy is the only public container. It serves the public site at `DOMAIN`, the admin app at `ADMIN_DOMAIN`, and proxies `/api/*` to FastAPI.

## Fly.io Deploy

```bash
fly apps create engine-room-api
fly apps create engine-room-web
fly apps create engine-room-admin
fly postgres create --name engine-room-db --region sjc --volume-size 10
fly postgres attach --app engine-room-api engine-room-db
fly secrets set --app engine-room-api ADMIN_TOKEN=... OPENAI_API_KEY=... ANTHROPIC_API_KEY=...
fly secrets set --app engine-room-admin AUTH_SECRET=... ADMIN_EMAIL=... ADMIN_TOKEN=... RESEND_API_KEY=... EMAIL_FROM=...
fly deploy --config infra/fly/api.fly.toml --remote-only
fly deploy --config infra/fly/web.fly.toml --remote-only
fly deploy --config infra/fly/admin.fly.toml --remote-only
```

GitHub Actions deploys the three Fly apps on pushes to `main` when `FLY_API_TOKEN` is configured.

## Operations

Seed data after migrations:

```bash
uv run python infra/seed.py
```

Back up Postgres to S3-compatible storage:

```bash
export BACKUP_DATABASE_URL=postgresql://engine_room:password@host:5432/engine_room
export S3_BUCKET=engine-room-backups
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
infra/backup.sh
```


## Personal workout journal

The Trident mobile tracker is available at **/trident** (redirects to /trident/index.html).
It is a standalone static app under apps/web/public/trident, so it does not inherit
portfolio layout scripts or change API routing. Its service worker is scoped to
/trident/ and caches only its own app shell.

The page is public and marked noindex; that is not access control. Workout records
stay in each visitor's browser. No personal baseline is embedded in public source.
Save a weekly JSON backup to Files/iCloud Drive and use the Markdown coaching export
for reviewing weights, reps, RIR and recovery. There is no automatic cloud sync.

On iPhone, open the page in Safari, then Share → Add to Home Screen. Open it once
online before relying on offline use.

Run tracker logic tests with **pnpm --filter @engine-room/web test:trident**.

Trident prescription revision 2026-09-08-r2 uses 4×12 compounds and three-set isolations, with rotating arms, twice-weekly pec deck and more abs/wrist work. Historical session definitions are retained for compatible backup imports and review; current sessions never overwrite same-day older-revision records.

Trident revision 2026-09-09-r3 adds Friday incline barbell bench press (4×12), bringing Friday to 33 sets. Both prior prescriptions remain available for saved sessions and imports.

## Stride study tracker

Stride is available at **/tracker** and is featured in the home-page Mission Logs. Its source lives in the public [`SahilArchitect/stride-daily-progress`](https://github.com/SahilArchitect/stride-daily-progress) repository.

The static export is committed under `apps/web/public/tracker`. Rebuild and sync it from the Stride repository with `npm run build:portfolio` before deploying portfolio updates. Study progress stays in the browser's IndexedDB and is never sent to the portfolio API.

## Trident Forge web companion (2026-10-04)

Open **https://www.bysahil.dev/trident**. Today, Workout, Nutrition and Progress mirror the native app's navigation, palette, imagery and domain workflows. Workout adds focused exercise logging, comparable exercise history, PR markers, Epley estimates on supported loads, and rest timers. Progress shows direct muscle sets, recorded volume, observed bodyweight trends and daily/weekly DeepSeek reviews. Apple Health, Live Activities and native widgets remain iOS capabilities.

The meal source is the agreed 2026-10-04 Markdown plan in the private fitness project: 1,855 kcal and 132.6 g protein as rounded row totals, targets 1,850 kcal / 130–150 g protein. Carbohydrate and fat values remain unknown. Meal snapshots, workouts, check-ins and coaching reviews export together; historical sessions preserve their original prescription. Browser storage is per device, with no cloud sync.

### Private AI configuration

Set **DEEPSEEK_API_KEY**, **TRIDENT_COACH_TOKEN**, and optionally **DEEPSEEK_MODEL** (default deepseek-flash) as private server environment variables in Vercel, then redeploy. Never prefix these with NEXT_PUBLIC or commit .env files. Enter the private coach access code under Settings → DeepSeek coach; this access code is kept in session storage only. The provider key never enters the browser in server-key mode. The optional personal-key connection holds that key in tab memory only. The same-origin POST /trident-coach proxy transmits selected logs to DeepSeek; it persists no workouts or credentials on the server and returns no secrets.

Automatic daily reviews run after finishing workouts, and a due weekly review runs on the next visit after the previous week ends, once a coach connection exists. The browser cannot perform unattended reviews while closed. Reviews can also be generated manually for selected dates. Load guidance requires all prescribed sets and both unilateral sides at target reps/RIR; pain, deloads and incomplete sets cannot qualify for progression. Exact next loads require the athlete's actual equipment increment, bounded conservatively. Unknown increments are never invented. Assistance decreases for progression.

Split changes require at least twelve finished sessions spanning three weeks with repeated recovery or pain signals. The model must also justify a balanced supported schedule. Apply an offered change from the next Monday; completed and draft sessions retain their original plan. Future exercise hints stay tied to exercise, load basis and equipment, and expire after fourteen days.

Validation: **pnpm --filter @engine-room/web test:trident**. Production build: **pnpm --filter @engine-room/web build**. Mobile and desktop integration checks cover meals, persistence, set logging, coaching rendering, JSON export and layout. Live DeepSeek daily and weekly integration checks use synthetic training fixtures only. Service-worker shell cache is trident-shell-v9; close old tabs and reopen online to activate an update.

Production verification: the hosted app and private server-key connection are confirmed live at https://www.bysahil.dev/trident. Daily and weekly DeepSeek calls both return validated reviews; the unauthenticated paid endpoint returns 401. Mobile/desktop production integration checks pass. A further same-load/both-side PR regression check passes (31 domain/API tests total); offline shell cache is now trident-shell-v10.
