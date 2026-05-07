# engine-room-api

FastAPI backend for The Engine Room. **Owns all persistent data** — every other surface (web, admin, worker) reads through this service or its types.

## Run

```bash
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

## Layout

```
app/
  main.py              FastAPI entrypoint, OTel wiring, router mount
  core/
    settings.py        Pydantic settings (env-backed)
    db.py              Async engine + session factory
    otel.py            OpenTelemetry setup (console exporter in dev)
  schemas/             Pydantic v2 models — the public type contract
  db/
    models.py          SQLAlchemy 2.0 declarative models
    base.py            DeclarativeBase + naming convention
  api/                 (Phase 2) routers
  services/            (Phase 2) RAG, ingestion, etc.
alembic/
  env.py               Async migration runner
  versions/0001_init.py  pgvector + all tables + indexes
```

## Contracts

See `/docs/AGENTS.md`. Schemas in `app/schemas/` are the source of truth for cross-service types — `packages/types` regenerates from them.
