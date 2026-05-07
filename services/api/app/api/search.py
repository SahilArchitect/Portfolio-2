# ruff: noqa: B008
"""Unified semantic search endpoint backed by the RAG pipeline."""

from __future__ import annotations

import time

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException, Request, status
from opentelemetry import trace
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_redis_cache, get_redis_ratelimit, get_session
from app.api.metrics import record_rag_query
from app.api.rate_limit import check_rate_limit, client_ip
from app.rag.pipeline import run_search
from app.schemas.search import SearchRequest, SearchResponse

tracer = trace.get_tracer(__name__)
router = APIRouter(prefix="/api/search", tags=["search"])
_RATE_LIMIT = 20
_RATE_WINDOW_SECONDS = 60


@router.post(
    "",
    response_model=SearchResponse,
    summary="Unified semantic search",
    description="Searches projects and posts, then synthesizes an answer with citations.",
)
async def search(
    payload: SearchRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
    redis: aioredis.Redis = Depends(get_redis_cache),
    ratelimit_redis: aioredis.Redis = Depends(get_redis_ratelimit),
) -> SearchResponse:
    with tracer.start_as_current_span("api.search") as span:
        span.set_attribute("query_len", len(payload.query))
        await check_rate_limit(
            ratelimit_redis,
            ip=client_ip(request),
            endpoint="/api/search",
            limit=_RATE_LIMIT,
            window_seconds=_RATE_WINDOW_SECONDS,
        )
        start = time.perf_counter()
        try:
            response = await run_search(payload.query, session=session)
        except HTTPException:
            raise
        except Exception as exc:
            span.record_exception(exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Search backend unavailable.",
            ) from exc
        finally:
            latency_ms = (time.perf_counter() - start) * 1000
            span.set_attribute("latency_ms", latency_ms)
            await record_rag_query(redis, latency_ms)
        return response
