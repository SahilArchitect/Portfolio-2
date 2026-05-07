# engine-room-worker

APScheduler worker. Owns scheduled background work — primarily Substack ingestion and embedding refresh.

## Run

```bash
uv sync
uv run python -m app.scheduler
```

## Jobs (Phase 2)

- `ingest_substack` — every 30m. Pulls the configured RSS feed, dedupes against `posts.canonical_url`, converts HTML→markdown, persists.
- `refresh_embeddings` — every 5m. Finds rows with `embedding IS NULL OR embedding_indexed_at < updated_at`, embeds, writes back.
- `prune_inquiries_pii` — daily. NULLs `ip_address` after 30 days and truncates user agents.
