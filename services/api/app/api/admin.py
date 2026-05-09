# ruff: noqa: B008
"""Admin-only operational endpoints."""

from __future__ import annotations

import json
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException, status
from opentelemetry import trace
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_redis_cache, get_session, require_admin
from app.db.models import Inquiry, SiteSetting
from app.rag.indexer import refresh_dirty_embeddings
from app.rag.substack import ingest_substack_feed
from app.schemas.site_settings import HeroExperiment, SubstackSettingsUpdate, SubstackState

tracer = trace.get_tracer(__name__)
router = APIRouter(prefix="/admin", tags=["admin:ops"], dependencies=[Depends(require_admin)])

DEFAULT_HERO_EXPERIMENT = {
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
}

DEFAULT_SUBSTACK_STATE = {
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
}


async def _setting(session: AsyncSession, key: str, fallback: dict[str, Any]) -> dict[str, Any]:
    row = await session.get(SiteSetting, key)
    if row is None or not isinstance(row.value, dict):
        return dict(fallback)
    return row.value


async def _save_setting(session: AsyncSession, key: str, value: dict[str, Any]) -> None:
    row = await session.get(SiteSetting, key)
    if row is None:
        row = SiteSetting(key=key, value=value)
    else:
        row.value = value
    session.add(row)
    await session.commit()
    await session.refresh(row)


def _sync_log(level: str, message: str) -> dict[str, str]:
    return {
        "id": f"sync-{uuid4().hex[:10]}",
        "level": level,
        "message": message,
        "created_at": datetime.now(UTC).isoformat(),
    }


def _prepend_log(state: dict[str, Any], level: str, message: str) -> dict[str, Any]:
    logs = state.get("recentLog") if isinstance(state.get("recentLog"), list) else []
    return {
        **state,
        "lastSyncAt": datetime.now(UTC).isoformat(),
        "recentLog": [_sync_log(level, message), *logs][:20],
    }


@router.get("/hero", response_model=list[dict[str, Any]], summary="Get editable hero variants")
async def get_hero_variants(session: AsyncSession = Depends(get_session)) -> list[dict[str, Any]]:
    with tracer.start_as_current_span("admin.hero.get"):
        state = HeroExperiment.model_validate(
            await _setting(session, "hero_experiment", DEFAULT_HERO_EXPERIMENT)
        )
        return [variant.model_dump(by_alias=True) for variant in state.variants]


@router.patch("/hero", response_model=list[dict[str, Any]], summary="Save editable hero variants")
async def save_hero_variants(
    payload: HeroExperiment,
    session: AsyncSession = Depends(get_session),
) -> list[dict[str, Any]]:
    with tracer.start_as_current_span("admin.hero.update"):
        value = payload.model_dump(by_alias=True)
        await _save_setting(session, "hero_experiment", value)
        return [variant.model_dump(by_alias=True) for variant in payload.variants]


@router.get("/substack", response_model=SubstackState, summary="Get Substack ingestion controls")
async def get_substack_state(session: AsyncSession = Depends(get_session)) -> SubstackState:
    with tracer.start_as_current_span("admin.substack.get"):
        return SubstackState.model_validate(
            await _setting(session, "substack_state", DEFAULT_SUBSTACK_STATE)
        )


@router.patch("/substack/settings", response_model=SubstackState, summary="Save Substack settings")
async def save_substack_settings(
    payload: SubstackSettingsUpdate,
    session: AsyncSession = Depends(get_session),
) -> SubstackState:
    with tracer.start_as_current_span("admin.substack.settings"):
        state = await _setting(session, "substack_state", DEFAULT_SUBSTACK_STATE)
        next_state = {
            **state,
            "embeddingModel": payload.embedding_model,
            "chunkSize": payload.chunk_size,
        }
        await _save_setting(session, "substack_state", next_state)
        return SubstackState.model_validate(next_state)


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
            state = await _setting(session, "substack_state", DEFAULT_SUBSTACK_STATE)
            await _save_setting(
                session,
                "substack_state",
                _prepend_log(state, "info", "Substack RSS sync completed."),
            )
        elif job_id == "refresh_embeddings":
            result = await refresh_dirty_embeddings(session)
            state = await _setting(session, "substack_state", DEFAULT_SUBSTACK_STATE)
            await _save_setting(
                session,
                "substack_state",
                _prepend_log(state, "info", "Dirty embedding refresh completed."),
            )
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
