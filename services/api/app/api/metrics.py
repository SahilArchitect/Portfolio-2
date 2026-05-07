# ruff: noqa: B008
"""Public metrics endpoint and small Redis-backed metric recorder."""

from __future__ import annotations

import statistics
import time
from datetime import UTC, datetime

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends
from opentelemetry import trace

from app.api.deps import get_redis_cache
from app.schemas.metrics import PublicMetrics

tracer = trace.get_tracer(__name__)
router = APIRouter(prefix="/api/metrics", tags=["metrics"])

_DAY_SECONDS = 24 * 60 * 60
_RAG_QUERY_KEY = "metrics:rag:queries"
_RAG_LATENCY_KEY = "metrics:rag:latency_ms"
_API_REQUEST_KEY = "metrics:api:requests"


async def record_api_request(redis: aioredis.Redis, route: str) -> None:
    now = time.time()
    member = f"{now:.6f}:{route}"
    try:
        pipe = redis.pipeline()
        pipe.zadd(_API_REQUEST_KEY, {member: now})
        pipe.zremrangebyscore(_API_REQUEST_KEY, 0, now - _DAY_SECONDS)
        await pipe.execute()
    except Exception:
        return


async def record_rag_query(redis: aioredis.Redis, latency_ms: float) -> None:
    now = time.time()
    member = f"{now:.6f}:{latency_ms:.2f}"
    try:
        pipe = redis.pipeline()
        pipe.zadd(_RAG_QUERY_KEY, {member: now})
        pipe.zadd(_RAG_LATENCY_KEY, {member: now})
        pipe.zremrangebyscore(_RAG_QUERY_KEY, 0, now - _DAY_SECONDS)
        pipe.zremrangebyscore(_RAG_LATENCY_KEY, 0, now - _DAY_SECONDS)
        await pipe.execute()
    except Exception:
        return


def _percentile(values: list[float], percentile: float) -> float:
    if not values:
        return 0.0
    values = sorted(values)
    index = min(len(values) - 1, round((len(values) - 1) * percentile))
    return float(values[index])


def _hourly_sparkline(members: list[str], now: float) -> list[int]:
    buckets = [0] * 24
    start = now - _DAY_SECONDS
    for member in members:
        try:
            ts = float(member.split(":", 1)[0])
        except ValueError:
            continue
        if ts < start:
            continue
        bucket = min(23, max(0, int((ts - start) // 3600)))
        buckets[bucket] += 1
    return buckets


@router.get(
    "/public",
    response_model=PublicMetrics,
    summary="Public latency and throughput metrics",
    description="Returns redacted aggregate metrics for the public traces page.",
)
async def get_public_metrics(redis: aioredis.Redis = Depends(get_redis_cache)) -> PublicMetrics:
    with tracer.start_as_current_span("api.metrics.public"):
        now = time.time()
        since = now - _DAY_SECONDS
        try:
            rag_members = [m async for m in redis.zscan_iter(_RAG_QUERY_KEY)]
            api_count = await redis.zcount(_API_REQUEST_KEY, since, now)
        except Exception:
            rag_members = []
            api_count = 0

        # redis-py zscan_iter yields (member, score) tuples.
        rag_raw = [m[0] if isinstance(m, tuple) else m for m in rag_members]
        latencies: list[float] = []
        for member in rag_raw:
            try:
                latencies.append(float(str(member).split(":", 1)[1]))
            except (IndexError, ValueError):
                continue

        median = float(statistics.median(latencies)) if latencies else 0.0
        p99 = _percentile(latencies, 0.99)
        rag_count = len(rag_raw)
        return PublicMetrics(
            rag_queries_24h=rag_count,
            requests_24h=int(api_count),
            throughput_per_minute=round(int(api_count) / 1440, 4),
            median_latency_ms=round(median, 2),
            p99_latency_ms=round(p99, 2),
            sparkline=_hourly_sparkline([str(m) for m in rag_raw], now),
            updated_at=datetime.now(UTC),
        )
