"""Embedding refresh job."""

from __future__ import annotations

import logging
from uuid import uuid4

from sqlalchemy import text

from ._shared import average_embedding, chunk_text, embed_texts, session_scope, vector_literal

log = logging.getLogger(__name__)

_DIRTY_PROJECTS = text(
    """
    SELECT id::text AS id, title, slug, summary, body_md
    FROM projects
    WHERE embedding IS NULL
       OR embedding_indexed_at IS NULL
       OR embedding_indexed_at < updated_at
    ORDER BY updated_at ASC
    LIMIT :limit
    """
)

_DIRTY_POSTS = text(
    """
    SELECT id::text AS id, title, slug, summary, body_md
    FROM posts
    WHERE embedding IS NULL
       OR embedding_indexed_at IS NULL
       OR embedding_indexed_at < updated_at
    ORDER BY updated_at ASC
    LIMIT :limit
    """
)

_UPSERT_CHUNK = text(
    """
    INSERT INTO content_chunks (
        id, source_type, source_id, doc_id, chunk_index, title, slug, excerpt,
        body_md, embedding, embedding_indexed_at, created_at, updated_at
    )
    VALUES (
        CAST(:id AS uuid), :source_type, CAST(:source_id AS uuid), :doc_id,
        :chunk_index, :title, :slug, :excerpt, :body_md, CAST(:embedding AS vector),
        NOW(), NOW(), NOW()
    )
    ON CONFLICT (source_type, source_id, chunk_index)
    DO UPDATE SET
        doc_id = EXCLUDED.doc_id,
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        excerpt = EXCLUDED.excerpt,
        body_md = EXCLUDED.body_md,
        embedding = EXCLUDED.embedding,
        embedding_indexed_at = NOW(),
        updated_at = NOW()
    """
)

_DELETE_STALE_CHUNKS = text(
    """
    DELETE FROM content_chunks
    WHERE source_type = :source_type
      AND source_id = CAST(:source_id AS uuid)
      AND chunk_index >= :chunk_count
    """
)

_UPDATE_PROJECT_EMBEDDING = text(
    """
    UPDATE projects
    SET embedding = CAST(:embedding AS vector), embedding_indexed_at = NOW(), updated_at = NOW()
    WHERE id = CAST(:id AS uuid)
    """
)

_UPDATE_POST_EMBEDDING = text(
    """
    UPDATE posts
    SET embedding = CAST(:embedding AS vector), embedding_indexed_at = NOW(), updated_at = NOW()
    WHERE id = CAST(:id AS uuid)
    """
)


def _excerpt(text_value: str, summary: str | None = None) -> str:
    return " ".join((summary or text_value).split())[:400]


async def _index_rows(rows, source_type: str, update_sql) -> dict[str, int]:  # type: ignore[no-untyped-def]
    refreshed = 0
    chunk_count = 0
    async with session_scope() as session:
        for row in rows:
            markdown = row.body_md if source_type == "post" else f"{row.summary}\n\n{row.body_md}"
            chunks = chunk_text(markdown)
            if not chunks:
                continue
            vectors = await embed_texts(chunks)
            if not vectors:
                log.warning("OPENAI_API_KEY not configured; skipped embedding refresh")
                break

            for index, (chunk, vector) in enumerate(zip(chunks, vectors, strict=True)):
                await session.execute(
                    _UPSERT_CHUNK,
                    {
                        "id": str(uuid4()),
                        "source_type": source_type,
                        "source_id": row.id,
                        "doc_id": f"{source_type}:{row.slug}:{index}",
                        "chunk_index": index,
                        "title": row.title,
                        "slug": row.slug,
                        "excerpt": _excerpt(chunk, row.summary if index == 0 else None),
                        "body_md": chunk,
                        "embedding": vector_literal(vector),
                    },
                )
            await session.execute(
                _DELETE_STALE_CHUNKS,
                {
                    "source_type": source_type,
                    "source_id": row.id,
                    "chunk_count": len(chunks),
                },
            )
            averaged = average_embedding(vectors)
            if averaged is not None:
                await session.execute(
                    update_sql,
                    {"id": row.id, "embedding": vector_literal(averaged)},
                )
            refreshed += 1
            chunk_count += len(chunks)
        await session.commit()
    return {"documents": refreshed, "chunks": chunk_count}


async def refresh_embeddings(batch_size: int = 32) -> dict[str, int]:
    """Embed dirty projects/posts and upsert 512-token content chunks."""
    async with session_scope() as session:
        projects = list((await session.execute(_DIRTY_PROJECTS, {"limit": batch_size})).all())
        posts = list((await session.execute(_DIRTY_POSTS, {"limit": batch_size})).all())

    project_result = await _index_rows(projects, "project", _UPDATE_PROJECT_EMBEDDING)
    post_result = await _index_rows(posts, "post", _UPDATE_POST_EMBEDDING)
    result = {
        "projects": project_result["documents"],
        "posts": post_result["documents"],
        "chunks": project_result["chunks"] + post_result["chunks"],
    }
    log.info("refresh_embeddings completed: %s", result)
    return result
