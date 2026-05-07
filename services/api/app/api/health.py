# ruff: noqa: B008
"""Health endpoint for deploy checks and app callers."""

from __future__ import annotations

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends
from opentelemetry import trace
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_redis_cache, get_session
from app.schemas.health import HealthRead

tracer = trace.get_tracer(__name__)
router = APIRouter(prefix="/api/health", tags=["health"])


@router.get(
    "",
    response_model=HealthRead,
    summary="Healthcheck",
    description="Reports liveness plus database, Redis, and pgvector index availability.",
)
async def healthcheck(
    session: AsyncSession = Depends(get_session),
    redis: aioredis.Redis = Depends(get_redis_cache),
) -> HealthRead:
    with tracer.start_as_current_span("api.health"):
        db_ok = False
        redis_ok = False
        vector_ok = False

        try:
            await session.execute(text("SELECT 1"))
            db_ok = True
            result = await session.execute(
                text(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM pg_indexes
                        WHERE indexname IN (
                            'ix_content_chunks_embedding_hnsw',
                            'ix_projects_embedding_hnsw',
                            'ix_posts_embedding_hnsw'
                        )
                    )
                    """
                )
            )
            vector_ok = bool(result.scalar())
        except Exception:
            db_ok = False
            vector_ok = False

        try:
            redis_ok = bool(await redis.ping())
        except Exception:
            redis_ok = False

        status = "ok" if db_ok and redis_ok and vector_ok else "degraded"
        return HealthRead(status=status, db=db_ok, redis=redis_ok, vector_index=vector_ok)
