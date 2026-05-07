#!/usr/bin/env python3
"""Idempotent production seed data for The Engine Room.

Uses asyncpg directly by contract: no app imports, no SQLAlchemy metadata, no
Pydantic models. Run after Alembic migrations:

    uv run python infra/seed.py
"""

from __future__ import annotations

import asyncio
import os
import uuid
from collections.abc import Mapping
from datetime import UTC, date, datetime
from typing import Any

import asyncpg

PROJECTS = [
    {
        "id": uuid.uuid5(uuid.NAMESPACE_URL, "engine-room/project/lazarus-engine"),
        "title": "Lazarus Engine",
        "slug": "lazarus-engine",
        "summary": (
            "A recovery-first orchestration layer that turns brittle AI workflows into "
            "observable, resumable execution traces."
        ),
        "body_md": """## Problem
AI backends fail in unglamorous places: partial tool output, dropped context, retry storms, and silent cost drift.

## Build
Lazarus Engine models long-running AI work as resumable jobs with explicit checkpoints, typed tool envelopes, and audit-grade traces. The system favors boring recovery paths over magic retries.

## Outcome
The project demonstrates production habits around failure handling, observability, and operator control instead of a thin prompt wrapper.
""".strip(),
        "role": "Sole engineer",
        "stack": ["FastAPI", "Postgres", "Redis", "OpenTelemetry", "LLM orchestration"],
        "repo_url": None,
        "live_url": None,
        "cover_image_url": None,
        "status": "published",
        "started_on": date(2026, 1, 5),
        "shipped_on": date(2026, 3, 18),
        "featured": True,
        "display_order": 10,
    },
    {
        "id": uuid.uuid5(uuid.NAMESPACE_URL, "engine-room/project/llm-gateway"),
        "title": "LLM Gateway",
        "slug": "llm-gateway",
        "summary": (
            "A thin provider boundary for retries, timeouts, request logging, token accounting, "
            "and cost-aware model calls."
        ),
        "body_md": """## Problem
Portfolio AI demos often call vendors directly from feature code, making latency, cost, and failure modes impossible to inspect.

## Build
LLM Gateway centralizes model calls behind a small interface. Every request carries timeout policy, retry metadata, token counts, and cost attribution for downstream dashboards.

## Outcome
The result is intentionally small: a credible production seam that makes RAG, inquiry scoring, and future model swaps observable instead of hidden.
""".strip(),
        "role": "Backend engineer",
        "stack": ["Python", "Anthropic", "OpenAI", "Redis", "OpenTelemetry"],
        "repo_url": None,
        "live_url": None,
        "cover_image_url": None,
        "status": "published",
        "started_on": date(2026, 2, 10),
        "shipped_on": date(2026, 4, 2),
        "featured": True,
        "display_order": 20,
    },
]

NOW_ENTRY = {
    "id": uuid.uuid5(uuid.NAMESPACE_URL, "engine-room/now/current"),
    "headline": "Building production-grade AI backend portfolio systems",
    "body_md": (
        "Current focus: tightening the portfolio into a proof surface for backend AI work: "
        "RAG quality, LLM observability, admin operations, and deployable infrastructure."
    ),
    "mood": "focused",
    "is_current": True,
}


def _dsn() -> str:
    raw = os.getenv("DATABASE_URL") or os.getenv("BACKUP_DATABASE_URL")
    if not raw:
        return "postgresql://engine_room:engine_room@localhost:5432/engine_room"
    return raw.replace("postgresql+asyncpg://", "postgresql://", 1)


async def _columns(conn: asyncpg.Connection, table: str) -> set[str]:
    rows = await conn.fetch(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        """,
        table,
    )
    if not rows:
        raise RuntimeError(f"table {table!r} not found; run Alembic migrations first")
    return {row["column_name"] for row in rows}


def _filtered(row: Mapping[str, Any], columns: set[str]) -> dict[str, Any]:
    now = datetime.now(UTC)
    out = {key: value for key, value in row.items() if key in columns}
    if "created_at" in columns:
        out["created_at"] = now
    if "updated_at" in columns:
        out["updated_at"] = now
    return out


async def _upsert_by_unique(
    conn: asyncpg.Connection,
    table: str,
    row: Mapping[str, Any],
    unique_column: str,
    columns: set[str],
) -> None:
    values = _filtered(row, columns)
    names = list(values)
    placeholders = ", ".join(f"${idx}" for idx in range(1, len(names) + 1))
    quoted_names = ", ".join(names)
    update_names = [name for name in names if name not in {"id", unique_column, "created_at"}]
    updates = ", ".join(f"{name} = EXCLUDED.{name}" for name in update_names)
    if not updates:
        updates = f"{unique_column} = EXCLUDED.{unique_column}"

    await conn.execute(
        f"""
        INSERT INTO {table} ({quoted_names})
        VALUES ({placeholders})
        ON CONFLICT ({unique_column}) DO UPDATE SET {updates}
        """,
        *[values[name] for name in names],
    )


async def _seed_projects(conn: asyncpg.Connection) -> None:
    columns = await _columns(conn, "projects")
    for project in PROJECTS:
        await _upsert_by_unique(conn, "projects", project, "slug", columns)


async def _seed_now(conn: asyncpg.Connection) -> None:
    columns = await _columns(conn, "now_entries")
    current = await conn.fetchrow("SELECT id FROM now_entries WHERE is_current = true LIMIT 1")
    if current and current["id"] != NOW_ENTRY["id"]:
        print("now_entries: existing current entry found; leaving it unchanged")
        return

    row = _filtered(NOW_ENTRY, columns)
    names = list(row)
    placeholders = ", ".join(f"${idx}" for idx in range(1, len(names) + 1))
    quoted_names = ", ".join(names)
    update_names = [name for name in names if name not in {"id", "created_at"}]
    updates = ", ".join(f"{name} = EXCLUDED.{name}" for name in update_names)

    await conn.execute(
        f"""
        INSERT INTO now_entries ({quoted_names})
        VALUES ({placeholders})
        ON CONFLICT (id) DO UPDATE SET {updates}
        """,
        *[row[name] for name in names],
    )


async def _seed_admin(conn: asyncpg.Connection) -> None:
    columns = await _columns(conn, "admin_users")
    email = (os.getenv("ADMIN_EMAIL") or "sahil@example.com").strip().lower()
    admin = {
        "id": uuid.uuid5(uuid.NAMESPACE_URL, f"engine-room/admin/{email}"),
        "email": email,
        "display_name": "Sahil Bhatti",
        "is_active": True,
        "last_login_at": None,
    }
    await _upsert_by_unique(conn, "admin_users", admin, "email", columns)


async def main() -> None:
    conn = await asyncpg.connect(_dsn())
    try:
        async with conn.transaction():
            await _seed_projects(conn)
            await _seed_now(conn)
            await _seed_admin(conn)
        print("seed complete: 2 projects, 1 now-entry, 0 posts, 1 admin user")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
