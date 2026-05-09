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
        "id": uuid.uuid5(uuid.NAMESPACE_URL, "engine-room/project/llm-gateway"),
        "title": "LLM Gateway",
        "slug": "llm-gateway",
        "summary": (
            "A self-hosted LLM API gateway for routing, rate limiting, cost tracking, "
            "and model abstraction."
        ),
        "body_md": """## What it is
A self-hosted LLM API gateway that sits between product code and model providers. It handles request routing, rate limiting, cost tracking, and provider/model abstraction behind a backend API.

## Stack
FastAPI, Pydantic v2, PostgreSQL, and Docker.

## Why it matters
Technical founders need LLM systems that are deployable, inspectable, and cost-aware. A gateway is the control plane that makes model usage visible instead of scattered across feature code.
""".strip(),
        "role": "AI backend / LLM infrastructure",
        "stack": ["FastAPI", "Pydantic v2", "PostgreSQL", "Docker"],
        "repo_url": None,
        "live_url": None,
        "cover_image_url": None,
        "status": "published",
        "started_on": date(2026, 2, 10),
        "shipped_on": None,
        "featured": True,
        "display_order": 10,
    },
    {
        "id": uuid.uuid5(uuid.NAMESPACE_URL, "engine-room/project/lazarus-engine"),
        "title": "Lazarus Engine",
        "slug": "lazarus-engine",
        "summary": (
            "A C++ legacy code migration tool using tree-sitter AST extraction, "
            "pgvector embeddings, and LLM-generated modernization."
        ),
        "body_md": """## What it is
A legacy modernization system for C++ codebases. It parses source code with tree-sitter, extracts AST-aware structure, stores semantic embeddings in pgvector, and uses LLM APIs to generate more modern, idiomatic code.

## Stack
C++, Python, tree-sitter, PostgreSQL/pgvector, and LLM APIs.

## Differentiator
Legacy modernization is a $50B+ problem. The hard part is not only generation; it is preserving behavior, extracting structure, and making modernization reviewable.
""".strip(),
        "role": "Legacy modernization / AI systems",
        "stack": ["C++", "Python", "tree-sitter", "pgvector", "LLM APIs"],
        "repo_url": None,
        "live_url": None,
        "cover_image_url": None,
        "status": "published",
        "started_on": date(2026, 1, 5),
        "shipped_on": None,
        "featured": True,
        "display_order": 20,
    },
    {
        "id": uuid.uuid5(uuid.NAMESPACE_URL, "engine-room/project/mtech-thesis"),
        "title": "Encrypted Network Traffic Classification",
        "slug": "encrypted-network-traffic-classification",
        "summary": "IIT Jammu M.Tech thesis on ML-based encrypted network traffic classification without decryption.",
        "body_md": """## Institution
IIT Jammu, M.Tech Data Science, 2022.

## What it involved
Machine-learning-based classification of encrypted network traffic without decrypting payloads, keeping the classification problem privacy-preserving.
""".strip(),
        "role": "M.Tech thesis",
        "stack": ["Machine Learning", "Network Traffic", "Privacy-preserving ML"],
        "repo_url": None,
        "live_url": None,
        "cover_image_url": None,
        "status": "published",
        "started_on": date(2021, 1, 1),
        "shipped_on": date(2022, 1, 1),
        "featured": True,
        "display_order": 30,
    },
    {
        "id": uuid.uuid5(uuid.NAMESPACE_URL, "engine-room/project/car-brand-classification"),
        "title": "Car Brand Classification",
        "slug": "car-brand-classification",
        "summary": "A transfer-learning computer vision project using ResNet-50 for multi-class car brand image classification.",
        "body_md": """## What it is
A multi-class image classification project for identifying car brands from images.

## Model
ResNet-50 with transfer learning.
""".strip(),
        "role": "Computer vision project",
        "stack": ["ResNet-50", "Transfer Learning", "Deep Learning"],
        "repo_url": None,
        "live_url": None,
        "cover_image_url": None,
        "status": "published",
        "started_on": date(2021, 1, 1),
        "shipped_on": None,
        "featured": True,
        "display_order": 40,
    },
    {
        "id": uuid.uuid5(uuid.NAMESPACE_URL, "engine-room/project/covid-xray-detection"),
        "title": "COVID-19 Detection from Chest X-rays",
        "slug": "covid-19-detection-chest-xrays",
        "summary": "A deep-learning medical imaging project for binary COVID-19 detection from chest X-ray images.",
        "body_md": """## What it is
A binary classification project using deep learning on chest X-ray images.

## Task
Detect COVID-19 from medical imaging inputs.
""".strip(),
        "role": "Medical imaging ML project",
        "stack": ["Deep Learning", "Medical Imaging", "Image Classification"],
        "repo_url": None,
        "live_url": None,
        "cover_image_url": None,
        "status": "published",
        "started_on": date(2020, 1, 1),
        "shipped_on": None,
        "featured": True,
        "display_order": 50,
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

RESUME_VARIANTS = [
    {
        "id": uuid.uuid5(uuid.NAMESPACE_URL, "engine-room/resume/ai-backend-engineer"),
        "label": "AI Backend Engineer",
        "slug": "ai-backend-engineer",
        "body_md": "## Focus\nFastAPI, RAG systems, LLM gateways, and observability.",
        "pdf_url": "https://www.bysahil.dev/resume/ai-backend-engineer.pdf",
        "role_keywords": ["AI backend", "RAG", "FastAPI"],
        "is_default": True,
    }
]

FEATURE_FLAGS = [
    {
        "name": "hire_calendar_embed",
        "enabled": True,
        "description": "Show the booking calendar on /hire.",
    },
    {
        "name": "show_traces_page",
        "enabled": True,
        "description": "Expose redacted public traces.",
    },
]

SITE_SETTINGS = [
    {
        "key": "hero_experiment",
        "value": {
            "variants": [
                {
                    "id": "variant-a",
                    "label": "Systems Positioning",
                    "copy": "I build AI backend systems that stay observable when the demo ends.",
                    "allocation": 50,
                    "impressions": 0,
                    "inquiries": 0,
                },
                {
                    "id": "variant-b",
                    "label": "Hiring Positioning",
                    "copy": "AI backend engineer focused on RAG, LLM gateways, and production traces.",
                    "allocation": 50,
                    "impressions": 0,
                    "inquiries": 0,
                },
            ]
        },
    },
    {
        "key": "substack_state",
        "value": {
            "lastSyncAt": None,
            "embeddingModel": "text-embedding-3-small",
            "chunkSize": 512,
            "recentLog": [
                {
                    "id": "sync-pending",
                    "level": "info",
                    "message": "Worker has not reported a sync yet.",
                    "created_at": "2026-05-07T00:00:00+00:00",
                }
            ],
        },
    },
]


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
    email = (os.getenv("ADMIN_EMAIL") or "sahil@bysahil.dev").strip().lower()
    admin = {
        "id": uuid.uuid5(uuid.NAMESPACE_URL, f"engine-room/admin/{email}"),
        "email": email,
        "display_name": "Sahil Bhatti",
        "is_active": True,
        "last_login_at": None,
    }
    await _upsert_by_unique(conn, "admin_users", admin, "email", columns)


async def _seed_resumes(conn: asyncpg.Connection) -> None:
    columns = await _columns(conn, "resume_variants")
    for resume in RESUME_VARIANTS:
        if resume["is_default"]:
            await conn.execute("UPDATE resume_variants SET is_default = false WHERE is_default = true")
        await _upsert_by_unique(conn, "resume_variants", resume, "slug", columns)


async def _seed_flags(conn: asyncpg.Connection) -> None:
    columns = await _columns(conn, "feature_flags")
    for flag in FEATURE_FLAGS:
        await _upsert_by_unique(conn, "feature_flags", flag, "name", columns)


async def _seed_site_settings(conn: asyncpg.Connection) -> None:
    columns = await _columns(conn, "site_settings")
    for setting in SITE_SETTINGS:
        await _upsert_by_unique(conn, "site_settings", setting, "key", columns)


async def main() -> None:
    conn = await asyncpg.connect(_dsn())
    try:
        async with conn.transaction():
            await _seed_projects(conn)
            await _seed_now(conn)
            await _seed_resumes(conn)
            await _seed_flags(conn)
            await _seed_site_settings(conn)
            await _seed_admin(conn)
        print("seed complete: 5 projects, 1 now-entry, 1 resume, 2 flags, 2 settings, 1 admin user")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
