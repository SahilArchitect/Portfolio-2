"""Index project and post markdown into pgvector-backed content chunks."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Literal
from uuid import UUID

from opentelemetry import trace
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ContentChunk, Post, Project
from app.rag.chunker import chunk_text
from app.rag.embedder import embed

tracer = trace.get_tracer(__name__)

SourceType = Literal["project", "post"]


def _excerpt(text: str, fallback: str | None = None) -> str:
    cleaned = " ".join((fallback or text).split())
    return cleaned[:400]


def _average_embedding(vectors: list[list[float]]) -> list[float] | None:
    if not vectors:
        return None
    dims = len(vectors[0])
    return [sum(vector[i] for vector in vectors) / len(vectors) for i in range(dims)]


async def index_document(
    *,
    session: AsyncSession,
    source_type: SourceType,
    source_id: UUID,
    title: str,
    slug: str,
    markdown: str,
    summary: str | None = None,
    endpoint: str = "rag.index_document",
) -> list[list[float]]:
    """Chunk, embed, and upsert a project/post into `content_chunks`.

    The source row keeps the average embedding for legacy detail endpoints and
    quick "related post" lookup, while retrieval uses the chunk rows.
    """
    chunks = chunk_text(markdown)
    if not chunks:
        await session.execute(
            delete(ContentChunk).where(
                ContentChunk.source_type == source_type,
                ContentChunk.source_id == source_id,
            )
        )
        return []

    with tracer.start_as_current_span("rag.index_document") as span:
        span.set_attribute("source_type", source_type)
        span.set_attribute("source_id", str(source_id))
        span.set_attribute("chunk_count", len(chunks))

        vectors = await embed(chunks, endpoint=endpoint)
        indexed_at = datetime.now(UTC)

        for index, (body_md, vector) in enumerate(zip(chunks, vectors, strict=True)):
            doc_id = f"{source_type}:{slug}:{index}"
            stmt = insert(ContentChunk).values(
                source_type=source_type,
                source_id=source_id,
                doc_id=doc_id,
                chunk_index=index,
                title=title,
                slug=slug,
                excerpt=_excerpt(body_md, summary if index == 0 else None),
                body_md=body_md,
                embedding=vector,
                embedding_indexed_at=indexed_at,
            )
            await session.execute(
                stmt.on_conflict_do_update(
                    index_elements=["source_type", "source_id", "chunk_index"],
                    set_={
                        "doc_id": stmt.excluded.doc_id,
                        "title": stmt.excluded.title,
                        "slug": stmt.excluded.slug,
                        "excerpt": stmt.excluded.excerpt,
                        "body_md": stmt.excluded.body_md,
                        "embedding": stmt.excluded.embedding,
                        "embedding_indexed_at": stmt.excluded.embedding_indexed_at,
                        "updated_at": indexed_at,
                    },
                )
            )

        await session.execute(
            delete(ContentChunk).where(
                ContentChunk.source_type == source_type,
                ContentChunk.source_id == source_id,
                ContentChunk.chunk_index >= len(chunks),
            )
        )

        return vectors


async def refresh_dirty_embeddings(session: AsyncSession, batch_size: int = 32) -> dict[str, int]:
    """Refresh dirty project/post embeddings and their chunk indexes."""
    refreshed = {"projects": 0, "posts": 0, "chunks": 0}

    project_rows = await session.scalars(
        select(Project)
        .where(
            (Project.embedding.is_(None))
            | (Project.embedding_indexed_at.is_(None))
            | (Project.embedding_indexed_at < Project.updated_at)
        )
        .order_by(Project.updated_at.asc())
        .limit(batch_size)
    )
    for project in project_rows:
        vectors = await index_document(
            session=session,
            source_type="project",
            source_id=project.id,
            title=project.title,
            slug=project.slug,
            markdown=f"{project.summary}\n\n{project.body_md}",
            summary=project.summary,
            endpoint="worker.refresh_embeddings.project",
        )
        project.embedding = _average_embedding(vectors)
        project.embedding_indexed_at = datetime.now(UTC)
        refreshed["projects"] += 1
        refreshed["chunks"] += len(vectors)

    post_rows = await session.scalars(
        select(Post)
        .where(
            (Post.embedding.is_(None))
            | (Post.embedding_indexed_at.is_(None))
            | (Post.embedding_indexed_at < Post.updated_at)
        )
        .order_by(Post.updated_at.asc())
        .limit(batch_size)
    )
    for post in post_rows:
        vectors = await index_document(
            session=session,
            source_type="post",
            source_id=post.id,
            title=post.title,
            slug=post.slug,
            markdown=post.body_md,
            summary=post.summary,
            endpoint="worker.refresh_embeddings.post",
        )
        post.embedding = _average_embedding(vectors)
        post.embedding_indexed_at = datetime.now(UTC)
        refreshed["posts"] += 1
        refreshed["chunks"] += len(vectors)

    await session.commit()
    return refreshed
