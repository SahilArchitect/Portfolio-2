"""RAG pipeline orchestrator — ties embedder, retriever, and generator together.

Handles /api/search endpoint logic:
- Cache results in Redis DB 0 keyed by sha256(query), TTL 5m.
- Returns (answer, citations) for non-streaming callers.
- Emits OTel spans across the full request.
"""

from __future__ import annotations

import hashlib
import json
import logging
from collections.abc import AsyncIterator

import redis.asyncio as aioredis
from opentelemetry import trace
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import get_settings
from app.rag.embedder import embed
from app.rag.generator import generate_stream
from app.rag.retriever import RetrievedChunk, retrieve
from app.schemas.search import Citation, SearchResponse

log = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

_CACHE_TTL = 300  # 5 minutes


def _cache_key(query: str) -> str:
    return "rag:cache:" + hashlib.sha256(query.encode()).hexdigest()


def _get_redis() -> aioredis.Redis:
    settings = get_settings()
    # Build cache URL on DB 0.
    base = str(settings.redis_url).rsplit("/", 1)[0]
    return aioredis.from_url(f"{base}/0", decode_responses=True)


async def _get_cached(query: str) -> SearchResponse | None:
    try:
        redis = _get_redis()
        async with redis:
            raw = await redis.get(_cache_key(query))
            if raw:
                data = json.loads(raw)
                return SearchResponse.model_validate(data)
    except Exception as exc:
        log.warning("Redis cache read error: %s", exc)
    return None


async def _set_cached(query: str, response: SearchResponse) -> None:
    try:
        redis = _get_redis()
        async with redis:
            await redis.setex(
                _cache_key(query),
                _CACHE_TTL,
                response.model_dump_json(),
            )
    except Exception as exc:
        log.warning("Redis cache write error: %s", exc)


def _chunks_to_citations(chunks: list[RetrievedChunk]) -> list[Citation]:
    seen: set[str] = set()
    citations = []
    for chunk in chunks:
        if chunk.doc_id not in seen:
            seen.add(chunk.doc_id)
            citations.append(
                Citation(
                    doc_id=chunk.doc_id,
                    title=chunk.title,
                    slug=chunk.slug,
                    excerpt=chunk.excerpt[:300],
                )
            )
    return citations


async def run_search(
    query: str,
    session: AsyncSession,
    use_cache: bool = True,
) -> SearchResponse:
    """Execute the full RAG pipeline and return a structured response.

    1. Check Redis cache (sha256(query), TTL 5m).
    2. Embed query.
    3. Retrieve top-6 chunks via pgvector HNSW + MMR.
    4. Generate answer via Anthropic (non-streaming, collects full text).
    5. Cache and return.

    Args:
        query: User's question string.
        session: DB session for vector retrieval.
        use_cache: Whether to check/populate the Redis cache.

    Returns:
        SearchResponse with answer text and citations.
    """
    with tracer.start_as_current_span("rag.pipeline") as span:
        span.set_attribute("query", query[:200])

        if use_cache:
            cached = await _get_cached(query)
            if cached is not None:
                span.set_attribute("cache_hit", True)
                return cached

        span.set_attribute("cache_hit", False)

        # Embed the query.
        vecs = await embed([query], endpoint="rag.query_embed")
        query_vec = vecs[0]

        # Retrieve context.
        chunks = await retrieve(query_vec, session=session, k=6)

        # Generate answer (collect full stream).
        answer_parts: list[str] = []
        async for token in generate_stream(query, chunks):
            answer_parts.append(token)
        answer = "".join(answer_parts)

        citations = _chunks_to_citations(chunks)
        response = SearchResponse(answer=answer, citations=citations)

        if use_cache:
            await _set_cached(query, response)

        return response


async def run_search_stream(
    query: str,
    session: AsyncSession,
) -> AsyncIterator[str]:
    """Streaming variant of run_search. Yields answer tokens as SSE.

    Note: Does not cache (streaming responses can't be cached by the pipeline).
    """
    vecs = await embed([query], endpoint="rag.query_embed_stream")
    query_vec = vecs[0]
    chunks = await retrieve(query_vec, session=session, k=6)
    async for token in generate_stream(query, chunks):
        yield token
