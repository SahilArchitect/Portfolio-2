# AGENTS — Phase 2 contracts

This document is **authoritative** for all Phase 2 parallel build agents. If an agent's work disagrees with anything here, **this doc wins over the brief**.

Letter assignments (Phase 2):
- **Agent A** — Backend: `services/api` + `services/worker`
- **Agent B** — Public site: `apps/web`
- **Agent C** — Admin console: `apps/admin`
- **Agent D** — Infra, seed data, observability

Each agent MUST:
- Import shared types from `@engine-room/types` — never redefine them.
- Import design tokens from `@engine-room/ui/tokens` and motion variants from `@engine-room/ui/motion` — never inline magic values.
- Stay out of other agents' owned paths.

---

## Agent A — Backend (`services/api` + `services/worker`)

### Owns
- Every router in `services/api/app/api/`.
- All persistence in `services/api/app/db/` (no new raw DDL — use Alembic).
- RAG pipeline: `services/api/app/rag/` (directory, not a single file).
- LLM gateway abstraction: `services/api/app/llm/`.
- Authoritative Pydantic schemas in `services/api/app/schemas/`.
- Worker jobs in `services/worker/app/jobs/` (fills in Phase 1 stubs).
- APScheduler entry in `services/worker/app/scheduler.py`.

### API endpoints (complete surface)

#### Public (no auth)
| Method | Path | Returns | Notes |
|---|---|---|---|
| GET | `/api/health` | `{"status": "ok", "db": bool, "redis": bool, "vector_index": bool}` | Liveness + component checks. This is the canonical health endpoint for app callers and deploy checks. |
| GET | `/api/projects` | `list[ProjectRead]` | `?status=published` only; ordered by `display_order` |
| GET | `/api/projects/{slug}` | `ProjectRead` | 404 if not published |
| GET | `/api/posts` | `list[PostRead]` + pagination | `?q=` full-text, `?semantic=` vector search, `?tag=` filter |
| GET | `/api/posts/{slug}` | `PostRead` + related | includes `related: list[PostRead]` (top-3 cosine) |
| GET | `/api/now` | `NowEntryRead` | Latest `is_current=true` entry |
| GET | `/api/resume` | `ResumeVariantRead` | Default variant (`is_default=true`) |
| GET | `/api/resume/{slug}` | `ResumeVariantRead` | |
| POST | `/api/inquiries` | `InquiryRead` | Rate-limited (Redis DB 1, 5/hour per IP); runs LLM priority scoring inline |
| POST | `/api/search` | `SearchResponse` | Unified RAG search: project + post corpora, returns answer + citations |
| GET | `/api/metrics/public` | `PublicMetrics` | Latency, throughput, RAG query count (last 24h) — no sensitive data |
| GET | `/api/flags` | `dict[str, bool]` | Feature flags readable by the public web app |

#### Admin (validated via `Authorization: Bearer <ADMIN_TOKEN>` header — not NextAuth; simple shared secret from env `ADMIN_TOKEN`)
| Method | Path | Notes |
|---|---|---|
| GET/POST | `/admin/projects` | All statuses |
| GET/PATCH/DELETE | `/admin/projects/{id}` | |
| GET/POST | `/admin/posts` | |
| GET/PATCH/DELETE | `/admin/posts/{id}` | |
| GET/POST | `/admin/now-entries` | Enforces at most one `is_current=true` |
| GET/PATCH/DELETE | `/admin/now-entries/{id}` | |
| GET/PATCH | `/admin/inquiries` | Status transitions only |
| GET/POST/PATCH/DELETE | `/admin/resume-variants` | Enforces exactly one `is_default=true` |
| GET/POST/PATCH/DELETE | `/admin/flags` | Feature flag CRUD |
| POST | `/admin/worker/trigger/{job_id}` | Manual worker trigger. Valid job_ids: `ingest_substack`, `refresh_embeddings`. Worker never serves HTTP; this API endpoint calls the job function directly. |
| GET | `/admin/llm/cost` | Per-day spend, per-endpoint, token histograms, slowest 20 calls |
| GET | `/admin/analytics` | Anonymized page views, search queries, drop-off |

### RAG pipeline (`services/api/app/rag/`)
- **Chunker** (`rag/chunker.py`): 512-token chunks, 64-token overlap, respects markdown headings.
- **Embedder** (`rag/embedder.py`): OpenAI API, model from env `EMBEDDING_MODEL` (default: `text-embedding-3-small`). **MUST pass `dimensions=1536`** to every embed call — this is the only legal vector size in the schema. Never produce another dim count.
- **Retriever** (`rag/retriever.py`): pgvector HNSW `<=>` cosine, top-k=6, MMR rerank λ=0.5. Merges `projects` + `posts` corpora.
- **Generator** (`rag/generator.py`): Anthropic SDK (Claude Sonnet). System prompt enforces "cite using [doc-id] markers, never invent." Streaming via SSE.
- **LLM Gateway** (`llm/gateway.py`): Thin wrapper with retry, timeout, cost tracking (model × tokens → USD), request logging to Redis for `/admin/llm/cost`.

### Worker jobs (`services/worker/app/jobs/`)
Fill in the Phase 1 stubs:
- `substack.py` — Pull RSS feed from `SUBSTACK_FEED_URL`. Dedupe by `canonical_url`. HTML→markdown via markdownify. Chunk + embed. Upsert.
- `embeddings.py` — Find rows where `embedding IS NULL OR embedding_indexed_at < updated_at`. Batch 32. Call embedder with `dimensions=1536`. Write back.
- `inquiries.py` — NULL out `ip_address` on inquiries > 30 days old.

Worker NEVER serves HTTP. Manual trigger goes through `POST /admin/worker/trigger/{job_id}` in the API. If any brief mentions a worker-served `/worker/run-now` endpoint, that wording is superseded by this contract.

### Observability
- OTel instrumentation on FastAPI, SQLAlchemy, Redis, httpx clients.
- RAG spans: `rag.embed` (chunk_count, model), `rag.retrieve` (top_k, scores), `rag.complete` (tokens_in, tokens_out, cost_usd).

### Tests (`services/api/tests/`)
- pytest + httpx AsyncClient.
- Happy path + edge cases for `/api/search` and `/api/inquiries`.
- ≥70% coverage on `app/rag/` and `app/llm/`.

### Hard rules
- Schemas are the public contract. Shape changes → regenerate `@engine-room/types` in the same change.
- Vector columns are **exactly 1536 dims**. Never change without a migration + index rebuild.
- All DDL via Alembic migrations only.
- Every endpoint emits an OTel span.
- Rate limits: Redis DB 1, keyed `{ip}:{route}`.

---

## Agent B — Public site (`apps/web`)

### Owns
All public routes: `/`, `/work`, `/work/[slug]`, `/writing`, `/writing/[slug]`, `/now`, `/traces`, `/hire`.

### Reads from API (all via Next.js `fetch` with `{ next: { revalidate: 60 } }` unless noted)
- `GET /api/projects` → project list
- `GET /api/projects/{slug}` → project detail
- `GET /api/posts` → writing list; `?q=` for full-text; `?semantic=` for vector
- `GET /api/posts/{slug}` → post detail (includes `related`)
- `GET /api/now` → now entry
- `GET /api/resume` + `GET /api/resume/{slug}` → resume variants
- `POST /api/inquiries` → contact form (server action)
- `POST /api/search` → command-palette semantic search
- `GET /api/metrics/public` → live metrics on `/traces` (SWR, 10s poll)
- `GET /api/flags` → feature flags (revalidate: 30)

### Dependencies to add to `apps/web/package.json`
```json
"cmdk": "^1.0.0",
"swr": "^2.2.5",
"@radix-ui/react-dialog": "^1.1.2",
"react-markdown": "^9.0.1",
"remark-gfm": "^4.0.0"
```

WebGL/Canvas hero: implement with a vanilla canvas element (no three.js — keep it <8KB). A single deliberate object (e.g., a slowly rotating wireframe dodecahedron drawn with 2D projection, or a particle field). Disable under `prefers-reduced-motion`. Do NOT use any WebGL library.

### Pages
| Route | Description |
|---|---|
| `/` | Hero (stagger by word) + featured projects grid + latest writing + now-snippet + footer |
| `/work` | All projects list, hover-expand |
| `/work/[slug]` | Scrollytelling: SVG architecture diagram assembles on scroll, live metrics widget (SWR from `/api/metrics/public`), related writing |
| `/writing` | Post list, full-text search bar, ⌘K toggles semantic mode, tag filters |
| `/writing/[slug]` | Post detail, reading progress bar, related posts |
| `/now` | Reverse-chron now-log |
| `/traces` | Public OTel trace viewer, last 50 traces, redacted, live SWR poll |
| `/hire` | Command-palette-driven: calendar embed, resume variant picker, contact form |

### Global
- `<Cursor />` from `@engine-room/ui` in root layout.
- ⌘K command palette: routes to pages, runs `/api/search`, copies email, downloads resume. Use `cmdk` lib, restyled to design tokens. Animate with `commandPaletteEnter`.
- Dark default, light toggle, persisted in localStorage, no flash (script in `<head>` before hydration).
- `AnimatePresence` page transitions in `app/template.tsx` using `pageEnter` variant.
- `<MotionConfig reducedMotion="user">` in root layout.

### Hard rules
- SSR every public route. JS-disabled visitors see complete content.
- No gradients (one hero element exempt). No glass-morphism. No shadow stacks.
- Every interactive surface gets `data-cursor="hover"` or is a native `<a>`/`<button>`.
- Lighthouse perf ≥ 95, a11y = 100.
- Hero canvas asset renders nothing (graceful no-op) when `prefers-reduced-motion`.
- Self-host and preload the display and mono fonts.

---

## Agent C — Admin console (`apps/admin`)

### Owns
All routes inside `apps/admin/src/app/`.

### Auth
NextAuth v5, email magic-link. Allowlist a **single** email from env `ADMIN_EMAIL`. Middleware redirects unauthenticated requests to `/sign-in`; non-allowlisted emails see a 404 after auth.

All API calls from the admin app pass `Authorization: Bearer ${process.env.ADMIN_TOKEN}` in server actions.

### Dependencies to add to `apps/admin/package.json`
```json
"@tanstack/react-table": "^8.20.5",
"recharts": "^2.13.0",
"react-markdown": "^9.0.1",
"remark-gfm": "^4.0.0",
"cmdk": "^1.0.0"
```

### Routes
| Path | Description |
|---|---|
| `/` | Dashboard KPIs: visitors today, top pages, RAG query count, LLM cost MTD, inquiries pending |
| `/content/projects` | CRUD projects; drag-to-reorder (updates `display_order`); inline markdown editor with live preview |
| `/content/now` | CRUD now-entries |
| `/content/hero` | Edit hero copy; A/B test slot (50/50, results visible) |
| `/content/resumes` | Upload and tag resume PDF variants by role keyword |
| `/substack` | Last sync time; manual re-sync button (`POST /admin/worker/trigger/ingest_substack`); embedding model selector; chunk size tuner; recent sync log |
| `/inquiries` | Inbox sorted by LLM priority score; filter by type (recruiter/founder/spam); reply via `mailto:` |
| `/llm` | Cost monitor from `/admin/llm/cost`: per-day spend, per-endpoint breakdown, token histograms, slowest 20 calls |
| `/flags` | Toggle feature flags via `/admin/flags` |
| `/analytics` | Privacy-respecting aggregates from `/admin/analytics`: page views, search queries (anonymized), drop-off funnel |

### Charts
Use `recharts` only — no other chart library. Match design tokens: never use Recharts default colors. Use `var(--fg)`, `var(--fg-muted)`, `var(--accent)` etc. in Recharts `stroke`/`fill` props.

### Tables
Use `@tanstack/react-table`. Apply design tokens.

### Motion
Restrained: layout animations on row reorder, `fadeUp` on dialog enter, no scroll choreography. Admin must feel fast, not theatrical.

### Hard rules
- All admin routes go through the existing `middleware.ts` (already implemented in Phase 1).
- Use the same Tailwind preset as the public site.
- `commandPaletteEnter` on the ⌘K palette.
- Never redefine types — import from `@engine-room/types`.
- Charts use only design token colors.

---

## Agent D — Infra, Seed data, Observability

### Owns
- `infra/` (all contents).
- `infra/seed.py`.
- `infra/backup.sh`.
- GitHub Actions in `.github/workflows/`.
- `fly.toml` configs.
- `infra/otel-collector.yml`.
- Root `README.md` overhaul.

### Deliverables
- **Production Dockerfiles** (`infra/docker/api.prod.Dockerfile`, `worker.prod.Dockerfile`, `web.prod.Dockerfile`, `admin.prod.Dockerfile`): multi-stage, non-root user, alpine. Dev Dockerfiles remain unchanged.
- **`infra/docker-compose.prod.yml`**: postgres+pgvector, redis, api, worker, web, admin, caddy. Includes `infra/Caddyfile` with auto-TLS reverse proxy.
- **`fly.toml` configs** in `infra/fly/`: `api.fly.toml`, `web.fly.toml`, `admin.fly.toml`. Health checks wired. Concurrency limits appropriate to Fly's free tier. Volume mount for Postgres.
- **GitHub Actions** in `.github/workflows/`: `ci.yml` (lint + typecheck + test on PR), `deploy.yml` (build + deploy to Fly on push to main).
- **`infra/.env.production.example`**: every required prod var with safe defaults.
- **`infra/seed.py`**: populates Postgres with 2 placeholder projects (`lazarus-engine`, `llm-gateway`) with realistic copy, 1 now-entry, 0 posts (worker fills), 1 admin user. Uses `asyncpg` directly to avoid importing the full app.
- **`infra/backup.sh`**: `pg_dump` to S3-compatible storage (env-configured). Cron-ready (no hardcoded schedule).
- **`infra/otel-collector.yml`**: receives OTLP from the Python services; exports to console in dev, configurable OTLP endpoint in prod.
- **Root `README.md`**: clear "first run in 5 minutes" path with copy-pasteable commands.

### Hard rules
- Do NOT touch any app code (`apps/`, `services/`, `packages/`).
- Do NOT add new env vars without adding them to both `.env.example` and `.env.production.example`.
- Production containers run as non-root.
- Seed data must be idempotent (re-running doesn't create duplicates).

---

## Shared contracts

### Authentication
- **Public routes**: no auth.
- **Admin API routes**: `Authorization: Bearer <ADMIN_TOKEN>` header (env var `ADMIN_TOKEN`). Simple secret — not NextAuth. The admin *app* reads `ADMIN_TOKEN` from server-side env and attaches it to all server actions.
- **Admin app**: NextAuth magic-link, allowlist via `ADMIN_EMAIL` env var (single email).

### Embedding model
- Default: `text-embedding-3-small`.
- Configurable via env `EMBEDDING_MODEL`.
- **MUST pass `dimensions=1536`** on every OpenAI embed call — this is the only legal dimension in the DB schema and HNSW index. Violating this breaks vector search silently.

### Types
- Source of truth: `services/api/app/schemas/`.
- Codegen: `pnpm types:generate` → `packages/types/src/generated/api.ts`.
- Frontends import `@engine-room/types`. No redefinitions.

### API base URLs
- Browser-visible calls use `NEXT_PUBLIC_API_BASE_URL`, defaulting to same-origin when unset.
- Server-side Next.js calls use `API_INTERNAL_BASE_URL`, defaulting to `NEXT_PUBLIC_API_BASE_URL`, then `http://localhost:8000`.
- Admin server actions attach `Authorization: Bearer ${ADMIN_TOKEN}` and must never expose `ADMIN_TOKEN` to client components.

### Design tokens
- Source of truth: `packages/ui/src/tokens/`.
- Tailwind preset wires them as CSS variables. Both apps extend the preset.
- Colors: `bg`, `bg-elev`, `fg`, `fg-muted`, `border`, `border-strong`, `accent`, `accent-muted`, `danger`, `success`, `warning`. **No others.**
- Type: `display-xl`, `display-lg`, `display-md`, `display-sm`, `body`, `body-sm`, `micro`, `mono-sm`. **No inline `text-[27px]`.**

### Motion
- Source of truth: `packages/ui/src/motion/`.
- Exported variants: `fadeUp`, `stagger`, `cardHover`, `pageEnter`, `scrollReveal`, `commandPaletteEnter`, `progressFill`.
- Springs: `SPRING {260/30/0.8}`, `SPRING_SNAPPY {420/32/0.6}`, `SPRING_GENTLE {180/26/1.0}`.
- No bare CSS transitions for entrance. No inline easing curves.

### Cursor
- Mount `<Cursor />` in each app's root layout `<body>` (once per app). Already wired in Phase 1 for web; admin should add it too.

### Theme
- Dark default. `light` class on `<html>` for light. Apps respect `prefers-color-scheme` on first paint, stored override thereafter.

### Worker / HTTP
- The worker (`services/worker`) NEVER serves HTTP.
- Manual job triggers go through `POST /admin/worker/trigger/{job_id}` in `services/api`; do not implement `/worker/run-now`.

---

## What you cannot do

- Define new tables, indexes, or migrations outside `services/api/alembic/versions/`.
- Add new colors, fonts, or motion presets without amending the token files first.
- Inline magic values (color, type size, spacing not from the token set).
- Use shadow stacks, glass-morphism, or gradients (one hero element exception, web only).
- Write CSS keyframes for entrance — use Framer.
- Import from another agent's package directly. Cross only via `@engine-room/types` and `@engine-room/ui`.
- Serve HTTP from the worker process.
- Use any chart library other than `recharts` in the admin app.
- Change embedding dimensions to anything other than 1536.
