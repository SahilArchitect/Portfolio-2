"""Redis-backed IP rate limiting for public endpoints."""

from __future__ import annotations

import logging

import redis.asyncio as aioredis
from fastapi import HTTPException, Request, status

log = logging.getLogger(__name__)


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


async def check_rate_limit(
    redis: aioredis.Redis,
    *,
    ip: str,
    endpoint: str,
    limit: int,
    window_seconds: int,
) -> None:
    key = f"ratelimit:{ip}:{endpoint}"
    try:
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, window_seconds)
        if int(count) > limit:
            ttl = await redis.ttl(key)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Try again in {max(ttl, 1)} seconds.",
            )
    except HTTPException:
        raise
    except Exception as exc:
        log.warning("Rate limit unavailable for %s, allowing request: %s", endpoint, exc)
