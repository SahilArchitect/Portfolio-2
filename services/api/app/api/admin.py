# ruff: noqa: B008
"""Admin-only operational endpoints."""

from __future__ import annotations

import json
from datetime import UTC, datetime, timedelta
from typing import Any

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException, status
from opentelemetry import trace
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_redis_cache, get_session, require_admin
from app.db.models import Inquiry
from app.rag.indexer import refresh_dirty_embeddings
from app.rag.substack import ingest_substack_feed

tracer = trace.get_tracer(__name__)
router = APIRouter(prefix="/admin", tags=["admin:ops"], dependencies=[Depends(require_admin)])


@router.post(
    "/worker/trigger/{job_id}",
    summary="Trigger a worker job manually",
    description="Runs the named worker job function inline from the API process.",
)
async def trigger_worker_job(
    job_id: str,
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    with tracer.start_as_current_span("admin.worker.trigger") as span:
        span.set_attribute("job_id", job_id)
        if job_id == "ingest_substack":
            result = await ingest_substack_feed(session)
        elif job_id == "refresh_embeddings":
            result = await refresh_dirty_embeddings(session)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unknown job_id. Expected ingest_substack or refresh_embeddings.",
            )
        return {"job_id": job_id, "status": "completed", "result": result}


@router.get(
    "/llm/cost",
    summary="LLM cost monitor",
    description="Per-day spend, endpoint breakdown, token totals, and slowest recent calls.",
)
async def get_llm_cost(redis: aioredis.Redis = Depends(get_redis_cache)) -> dict[str, Any]:
    with tracer.start_as_current_span("admin.llm.cost"):
        try:
            raw_entries = await redis.lrange("llm:requests", 0, 9999)
        except Exception:
            raw_entries = []

        entries: list[dict[str, Any]] = []
        for raw in raw_entries:
            try:
                entries.append(json.loads(raw))
            except (TypeError, json.JSONDecodeError):
                continue

        per_day: dict[str, float] = {}
        per_endpoint: dict[str, float] = {}
        token_histogram = {"0-1k": 0, "1k-10k": 0, "10k+": 0}

        for entry in entries:
            date = str(entry.get("date") or "")[:10]
            endpoint = str(entry.get("endpoint") or "unknown")
            cost = float(entry.get("cost_usd") or 0)
            tokens = int(entry.get("tokens_in") or 0) + int(entry.get("tokens_out") or 0)
            per_day[date] = round(per_day.get(date, 0.0) + cost, 8)
            per_endpoint[endpoint] = round(per_endpoint.get(endpoint, 0.0) + cost, 8)
            if tokens < 1000:
                token_histogram["0-1k"] += 1
            elif tokens < 10000:
                token_histogram["1k-10k"] += 1
            else:
                token_histogram["10k+"] += 1

        slowest = sorted(entries, key=lambda item: float(item.get("duration_ms") or 0), reverse=True)[
            :20
        ]
        month_prefix = datetime.now(UTC).strftime("%Y-%m")
        mtd = round(sum(cost for day, cost in per_day.items() if day.startswith(month_prefix)), 8)

        return {
            "spend_mtd_usd": mtd,
            "per_day": per_day,
            "per_endpoint": per_endpoint,
            "token_histogram": token_histogram,
            "slowest_20": slowest,
        }


@router.get(
    "/analytics",
    summary="Privacy-respecting aggregate analytics",
    description="Returns aggregate admin analytics with no raw visitor identifiers.",
)
async def get_admin_analytics(session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    with tracer.start_as_current_span("admin.analytics"):
        since = datetime.now(UTC) - timedelta(days=30)
        pending = await session.scalar(
            select(func.count()).select_from(Inquiry).where(Inquiry.status == "new")
        )
        return {
            "page_views": [],
            "search_queries": [],
            "drop_off_funnel": [],
            "inquiries_pending": int(pending or 0),
            "window_start": since.isoformat(),
            "window_end": datetime.now(UTC).isoformat(),
        }
