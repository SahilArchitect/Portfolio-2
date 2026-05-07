"""LLM gateway — wraps OpenAI and Anthropic clients.

Features:
- Retry with exponential backoff (max 3 attempts, 429/500 errors only).
- Timeout: 30s for embeddings, 120s for completions.
- Cost tracking: logs each call to Redis as llm:cost:{date}:{model}.
- Request logging for /admin/llm/cost.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import math
import time
import uuid
from collections.abc import AsyncIterator, Coroutine
from datetime import UTC, datetime
from typing import Any

import anthropic
import openai
import redis.asyncio as aioredis
from opentelemetry import trace

from app.core.settings import get_settings

log = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
_BACKGROUND_TASKS: set[asyncio.Task[None]] = set()
_EMBEDDING_DIM = 1536

# Approximate costs in USD per 1M tokens.
_COST_TABLE: dict[str, dict[str, float]] = {
    "text-embedding-3-small": {"in": 0.02, "out": 0.0},
    "text-embedding-3-large": {"in": 0.13, "out": 0.0},
    # claude-sonnet-4-6: $3/$15 per 1M in/out
    "claude-sonnet-4-6": {"in": 3.0, "out": 15.0},
}


def _cost_usd(model: str, tokens_in: int, tokens_out: int) -> float:
    rates = _COST_TABLE.get(model, {"in": 0.0, "out": 0.0})
    return (tokens_in * rates["in"] + tokens_out * rates["out"]) / 1_000_000


def _local_embedding(text: str) -> list[float]:
    values = [0.0] * _EMBEDDING_DIM
    tokens = [token for token in text.lower().replace("-", " ").split() if token]
    for token in tokens:
        digest = hashlib.sha256(token.encode()).digest()
        index = int.from_bytes(digest[:2], "big") % _EMBEDDING_DIM
        sign = 1.0 if digest[2] % 2 == 0 else -1.0
        values[index] += sign
    norm = math.sqrt(sum(value * value for value in values))
    if norm == 0:
        return values
    return [value / norm for value in values]


def _schedule_cost_log(coro: Coroutine[Any, Any, None]) -> None:
    task = asyncio.create_task(coro)
    _BACKGROUND_TASKS.add(task)
    task.add_done_callback(_BACKGROUND_TASKS.discard)


def _get_redis() -> aioredis.Redis:
    settings = get_settings()
    return aioredis.from_url(str(settings.redis_url), decode_responses=True)


async def _log_cost(
    *,
    model: str,
    tokens_in: int,
    tokens_out: int,
    cost_usd: float,
    duration_ms: float,
    endpoint: str = "",
) -> None:
    """Log call cost to Redis for /admin/llm/cost reporting."""
    try:
        redis = _get_redis()
        date_str = datetime.now(UTC).strftime("%Y-%m-%d")
        key = f"llm:cost:{date_str}:{model}"
        call_id = str(uuid.uuid4())
        entry = {
            "id": call_id,
            "date": date_str,
            "model": model,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "cost_usd": round(cost_usd, 8),
            "duration_ms": round(duration_ms, 2),
            "endpoint": endpoint,
            "ts": datetime.now(UTC).isoformat(),
        }
        async with redis:
            pipe = redis.pipeline()
            pipe.hset(
                key,
                mapping={
                    f"{call_id}:tokens_in": tokens_in,
                    f"{call_id}:tokens_out": tokens_out,
                    f"{call_id}:cost_usd": round(cost_usd, 8),
                    f"{call_id}:duration_ms": round(duration_ms, 2),
                    f"{call_id}:endpoint": endpoint,
                    f"{call_id}:ts": datetime.now(UTC).isoformat(),
                },
            )
            pipe.lpush("llm:requests", json.dumps(entry))
            pipe.ltrim("llm:requests", 0, 9999)
            # TTL: 90 days of cost data
            pipe.expire(key, 90 * 86400)
            pipe.expire("llm:requests", 90 * 86400)
            await pipe.execute()
    except Exception as exc:
        log.warning("Cost logging to Redis failed: %s", exc)


def _is_retryable(exc: Exception) -> bool:
    if isinstance(exc, openai.RateLimitError | openai.InternalServerError):
        return True
    if isinstance(exc, anthropic.RateLimitError | anthropic.InternalServerError):
        return True
    return False


async def _with_retry(fn, max_attempts: int = 3):
    """Run fn with exponential-backoff retry on 429/500 errors."""
    for attempt in range(max_attempts):
        try:
            return await fn()
        except Exception as exc:
            if not _is_retryable(exc) or attempt == max_attempts - 1:
                raise
            wait = 2**attempt
            log.warning("LLM call failed (attempt %d/%d), retrying in %ds: %s", attempt + 1, max_attempts, wait, exc)
            await asyncio.sleep(wait)


async def embed(texts: list[str], endpoint: str = "embed") -> list[list[float]]:
    """Embed texts via OpenAI. ALWAYS uses dimensions=1536.

    Args:
        texts: List of text strings to embed.
        endpoint: Caller label for cost tracking.

    Returns:
        List of 1536-dim embedding vectors.
    """
    settings = get_settings()
    if not settings.openai_api_key:
        log.warning("OPENAI_API_KEY not configured; using local deterministic embeddings")
        return [_local_embedding(text) for text in texts]

    client = openai.AsyncOpenAI(
        api_key=settings.openai_api_key,
        timeout=30.0,
    )
    model = settings.embedding_model

    async def _call() -> list[list[float]]:
        response = await client.embeddings.create(
            model=model,
            input=texts,
            dimensions=1536,  # Hard constraint — never change.
        )
        return [item.embedding for item in response.data]

    with tracer.start_as_current_span("llm.embed") as span:
        span.set_attribute("llm.model", model)
        span.set_attribute("llm.endpoint", endpoint)
        span.set_attribute("chunk_count", len(texts))

        t0 = time.perf_counter()
        try:
            result = await _with_retry(_call)
        finally:
            duration_ms = (time.perf_counter() - t0) * 1000

        # Estimate token count as ~4 chars/token for cost logging.
        tokens_in = sum(max(1, len(t) // 4) for t in texts)
        cost = _cost_usd(model, tokens_in, 0)
        span.set_attribute("llm_tokens_in", tokens_in)
        span.set_attribute("llm_tokens_out", 0)
        span.set_attribute("llm_cost_usd", cost)
        _schedule_cost_log(
            _log_cost(
                model=model,
                tokens_in=tokens_in,
                tokens_out=0,
                cost_usd=cost,
                duration_ms=duration_ms,
                endpoint=endpoint,
            )
        )
        return result


async def complete_stream(
    *,
    system: str,
    messages: list[dict[str, Any]],
    model: str = "claude-sonnet-4-6",
    max_tokens: int = 2048,
    endpoint: str = "complete",
) -> AsyncIterator[str]:
    """Stream a completion from Anthropic.

    Yields text tokens as they arrive. Logs cost after the stream closes.
    """
    settings = get_settings()
    client = anthropic.AsyncAnthropic(
        api_key=settings.anthropic_api_key,
        timeout=120.0,
    )

    t0 = time.perf_counter()
    tokens_in = 0
    tokens_out = 0

    async def _run_stream():
        nonlocal tokens_in, tokens_out
        async with client.messages.stream(
            model=model,
            system=system,
            messages=messages,
            max_tokens=max_tokens,
        ) as stream:
            async for text in stream.text_stream:
                yield text
            # Capture usage after stream completes.
            final = await stream.get_final_message()
            tokens_in = final.usage.input_tokens
            tokens_out = final.usage.output_tokens

    with tracer.start_as_current_span("llm.complete_stream") as span:
        span.set_attribute("llm.model", model)
        span.set_attribute("llm.endpoint", endpoint)
        try:
            async for token in _run_stream():
                yield token
        finally:
            duration_ms = (time.perf_counter() - t0) * 1000
            cost = _cost_usd(model, tokens_in, tokens_out)
            span.set_attribute("llm_tokens_in", tokens_in)
            span.set_attribute("llm_tokens_out", tokens_out)
            span.set_attribute("llm_cost_usd", cost)
            _schedule_cost_log(
                _log_cost(
                    model=model,
                    tokens_in=tokens_in,
                    tokens_out=tokens_out,
                    cost_usd=cost,
                    duration_ms=duration_ms,
                    endpoint=endpoint,
                )
            )


async def complete(
    *,
    system: str,
    messages: list[dict[str, Any]],
    model: str = "claude-sonnet-4-6",
    max_tokens: int = 2048,
    endpoint: str = "complete",
) -> str:
    """Non-streaming completion from Anthropic. Used for priority scoring."""
    settings = get_settings()
    client = anthropic.AsyncAnthropic(
        api_key=settings.anthropic_api_key,
        timeout=120.0,
    )

    async def _call():
        return await client.messages.create(
            model=model,
            system=system,
            messages=messages,
            max_tokens=max_tokens,
        )

    with tracer.start_as_current_span("llm.complete") as span:
        span.set_attribute("llm.model", model)
        span.set_attribute("llm.endpoint", endpoint)

        t0 = time.perf_counter()
        response = await _with_retry(_call)
        duration_ms = (time.perf_counter() - t0) * 1000

        tokens_in = response.usage.input_tokens
        tokens_out = response.usage.output_tokens
        cost = _cost_usd(model, tokens_in, tokens_out)
        span.set_attribute("llm_tokens_in", tokens_in)
        span.set_attribute("llm_tokens_out", tokens_out)
        span.set_attribute("llm_cost_usd", cost)

        _schedule_cost_log(
            _log_cost(
                model=model,
                tokens_in=tokens_in,
                tokens_out=tokens_out,
                cost_usd=cost,
                duration_ms=duration_ms,
                endpoint=endpoint,
            )
        )

        return response.content[0].text
