# ruff: noqa: B008
"""FastAPI dependencies — DB session, Redis, admin auth."""

from __future__ import annotations

import redis.asyncio as aioredis
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.db import get_session as _get_session
from app.core.settings import get_settings

_bearer = HTTPBearer(auto_error=False)


async def get_session():
    """Yield an async SQLAlchemy session."""
    async for session in _get_session():
        yield session


def get_redis_cache() -> aioredis.Redis:
    """Return a Redis client for DB 0 (cache)."""
    settings = get_settings()
    base = str(settings.redis_url).rsplit("/", 1)[0]
    return aioredis.from_url(f"{base}/0", decode_responses=True)


def get_redis_ratelimit() -> aioredis.Redis:
    """Return a Redis client for DB 1 (rate limits)."""
    settings = get_settings()
    base = str(settings.redis_url).rsplit("/", 1)[0]
    return aioredis.from_url(f"{base}/1", decode_responses=True)


async def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Security(_bearer),
) -> None:
    """Dependency that validates the admin Bearer token.

    Raises 401 if the header is missing or incorrect.
    """
    settings = get_settings()
    if not settings.admin_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin token not configured on server.",
        )
    if credentials is None or credentials.credentials != settings.admin_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
