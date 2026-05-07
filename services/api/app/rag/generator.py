"""Generator — streams Anthropic completions grounded in retrieved chunks.

System prompt instructs the model to cite using [doc-id] markers and never
invent information not in the provided context.
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator

from opentelemetry import trace

from app.core.settings import get_settings
from app.llm.gateway import complete_stream
from app.rag.retriever import RetrievedChunk

log = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

_SYSTEM_PROMPT = (
    "You are Sahil Bhatti's portfolio assistant. "
    "Answer based ONLY on the provided context. "
    "Cite sources using [doc-id] markers whenever you reference information. "
    "Never invent information not in the context. "
    "If the context does not contain enough information to answer, say so honestly."
)


def _build_context(chunks: list[RetrievedChunk]) -> str:
    parts = []
    for chunk in chunks:
        parts.append(
            f"[{chunk.doc_id}] ({chunk.source_type}: {chunk.title})\n{chunk.body_md[:1500]}"
        )
    return "\n\n---\n\n".join(parts)


async def generate_stream(
    query: str,
    chunks: list[RetrievedChunk],
) -> AsyncIterator[str]:
    """Stream answer tokens from Anthropic given a query and retrieved chunks.

    Args:
        query: The user's natural-language question.
        chunks: Retrieved and MMR-reranked context chunks.

    Yields:
        Text tokens as they arrive from the API.
    """
    if not chunks:
        yield "I don't have enough information in the portfolio context to answer that question."
        return

    if not get_settings().anthropic_api_key:
        highlights = []
        for chunk in chunks[:3]:
            source = chunk.excerpt or " ".join(chunk.body_md.split())[:240]
            highlights.append(f"{source} [{chunk.doc_id}]")
        yield " ".join(highlights)
        return

    context = _build_context(chunks)
    user_message = f"Context:\n{context}\n\nQuestion: {query}"

    with tracer.start_as_current_span("rag.complete") as span:
        span.set_attribute("chunk_count", len(chunks))
        span.set_attribute("query_len", len(query))

        async for token in complete_stream(
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
            model="claude-sonnet-4-6",
            endpoint="rag.complete",
        ):
            yield token
