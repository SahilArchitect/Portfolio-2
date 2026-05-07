"""Embedder — calls OpenAI with dimensions=1536 (non-negotiable).

Batches up to 512 texts per API call.
"""

from __future__ import annotations

import logging

from opentelemetry import trace

from app.llm.gateway import embed as _gateway_embed

log = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

_BATCH_SIZE = 512


async def embed(texts: list[str], endpoint: str = "rag.embed") -> list[list[float]]:
    """Embed a list of texts into 1536-dim vectors.

    Batches internally (max 512 per call). Always passes dimensions=1536.

    Args:
        texts: Strings to embed. May be empty — returns [] in that case.
        endpoint: Label for cost/tracing purposes.

    Returns:
        List of 1536-dim float vectors, in the same order as input.
    """
    if not texts:
        return []

    with tracer.start_as_current_span("rag.embed") as span:
        span.set_attribute("chunk_count", len(texts))

        results: list[list[float]] = []
        for i in range(0, len(texts), _BATCH_SIZE):
            batch = texts[i : i + _BATCH_SIZE]
            log.debug("Embedding batch %d-%d of %d", i, i + len(batch), len(texts))
            vecs = await _gateway_embed(batch, endpoint=endpoint)
            results.extend(vecs)

        span.set_attribute("vectors_produced", len(results))
        return results
