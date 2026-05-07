"""Retriever — pgvector HNSW cosine search with MMR rerank.

Searches `content_chunks`, which is built from the projects + posts corpora.
MMR rerank with λ=0.5, initial pool = k*3.
"""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass

from opentelemetry import trace
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

log = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)


@dataclass
class RetrievedChunk:
    doc_id: str
    source_type: str  # "project" | "post"
    title: str
    slug: str
    excerpt: str
    body_md: str
    score: float  # cosine similarity (1 - distance)
    embedding: list[float] | None = None


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b, strict=False))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _mmr_rerank(
    query_vec: list[float],
    candidates: list[RetrievedChunk],
    k: int,
    lam: float = 0.5,
) -> list[RetrievedChunk]:
    """Maximal Marginal Relevance rerank.

    Selects k chunks balancing relevance (sim to query) and diversity
    (dissimilarity to already-selected chunks). λ=0.5 balances both.
    """
    selected: list[RetrievedChunk] = []
    remaining = list(candidates)

    while remaining and len(selected) < k:
        best_score = -float("inf")
        best_chunk = None

        for chunk in remaining:
            if chunk.embedding is None:
                relevance = chunk.score
            else:
                relevance = _cosine_similarity(query_vec, chunk.embedding)

            if not selected:
                redundancy = 0.0
            else:
                similarities = [
                    _cosine_similarity(chunk.embedding or [], sel.embedding or [])
                    for sel in selected
                    if chunk.embedding and sel.embedding
                ]
                redundancy = max(similarities) if similarities else 0.0

            mmr_score = lam * relevance - (1 - lam) * redundancy
            if mmr_score > best_score:
                best_score = mmr_score
                best_chunk = chunk

        if best_chunk is not None:
            selected.append(best_chunk)
            remaining.remove(best_chunk)

    return selected


async def retrieve(
    query_vec: list[float],
    session: AsyncSession,
    k: int = 6,
) -> list[RetrievedChunk]:
    """Retrieve top-k chunks from indexed project + post chunks.

    Fetches k*3 candidates from each table, merges, then MMR-reranks to k.

    Args:
        query_vec: 1536-dim query embedding.
        session: Async DB session.
        k: Final number of chunks to return.

    Returns:
        MMR-reranked list of up to k RetrievedChunks.
    """
    pool_size = k * 3
    vec_str = "[" + ",".join(str(v) for v in query_vec) + "]"

    with tracer.start_as_current_span("rag.retrieve") as span:
        span.set_attribute("top_k", k)
        span.set_attribute("pool_size", pool_size)

        chunks_sql = text(
            """
            SELECT
                doc_id,
                source_type,
                title,
                slug,
                excerpt,
                body_md,
                1 - (embedding <=> CAST(:vec AS vector)) AS score,
                embedding::text AS embedding_text
            FROM content_chunks
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:vec AS vector)
            LIMIT :pool_size
            """
        )

        candidates: list[RetrievedChunk] = []

        rows = await session.execute(chunks_sql, {"vec": vec_str, "pool_size": pool_size})
        for row in rows.mappings():
            # Parse pgvector text back to list[float] for MMR.
            emb: list[float] | None = None
            if row["embedding_text"]:
                try:
                    raw = row["embedding_text"].strip("[]")
                    emb = [float(x) for x in raw.split(",") if x]
                except Exception:
                    emb = None

            candidates.append(
                RetrievedChunk(
                    doc_id=row["doc_id"],
                    source_type=row["source_type"],
                    title=row["title"],
                    slug=row["slug"],
                    excerpt=row["excerpt"] or "",
                    body_md=row["body_md"],
                    score=float(row["score"]),
                    embedding=emb,
                )
            )

        # Sort merged pool by score descending before MMR.
        candidates.sort(key=lambda c: c.score, reverse=True)
        span.set_attribute("candidates_total", len(candidates))

        reranked = _mmr_rerank(query_vec, candidates, k=k)
        log.debug("Retrieved %d candidates, reranked to %d", len(candidates), len(reranked))

        scores = [round(c.score, 4) for c in reranked]
        span.set_attribute("top_k_scores", str(scores))

        return reranked
