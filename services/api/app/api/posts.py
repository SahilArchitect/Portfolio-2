# ruff: noqa: B008
"""Posts router — public + admin endpoints.

Public:
  GET /api/posts          ?q= full-text, ?semantic= vector, ?tag= filter
  GET /api/posts/{slug}   includes related: list[PostRead] (top-3 cosine)

Admin:
  GET/POST /admin/posts
  GET/PATCH/DELETE /admin/posts/{id}
"""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from opentelemetry import trace
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, require_admin
from app.db.models import Post
from app.rag.embedder import embed
from app.schemas.post import PostCreate, PostRead, PostUpdate

log = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

public_router = APIRouter(prefix="/api/posts", tags=["posts"])
admin_router = APIRouter(
    prefix="/admin/posts",
    tags=["admin:posts"],
    dependencies=[Depends(require_admin)],
)


# ── Helpers ──────────────────────────────────────────────────────────────────

async def _get_related(post: Post, session: AsyncSession, k: int = 3) -> list[PostRead]:
    """Return top-k cosine-similar posts using pgvector."""
    if post.embedding is None:
        return []
    vec_str = "[" + ",".join(str(v) for v in post.embedding) + "]"
    rows = await session.execute(
        text(
            """
            SELECT * FROM posts
            WHERE id != :pid AND embedding IS NOT NULL
            ORDER BY embedding <=> :vec::vector
            LIMIT :k
            """
        ),
        {"pid": str(post.id), "vec": vec_str, "k": k},
    )
    related = []
    for row in rows.mappings():
        p = Post(**{c: row[c] for c in row.keys()})
        related.append(PostRead.model_validate(p))
    return related


# ── Public ──────────────────────────────────────────────────────────────────

@public_router.get(
    "",
    response_model=list[PostRead],
    summary="List posts",
    description="Lists Substack/native posts with pagination headers and optional full-text, semantic, or tag filtering.",
)
async def list_posts(
    response: Response,
    q: str | None = Query(default=None, description="Full-text search (ilike)."),
    semantic: str | None = Query(default=None, description="Semantic (vector) search query."),
    tag: str | None = Query(default=None, description="Filter by tag."),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_session),
) -> list[PostRead]:
    with tracer.start_as_current_span("api.posts.list"):
        if semantic:
            # Vector search path.
            vecs = await embed([semantic], endpoint="api.posts.semantic_search")
            vec_str = "[" + ",".join(str(v) for v in vecs[0]) + "]"
            sql = text(
                """
                SELECT * FROM posts
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> :vec::vector
                LIMIT :limit OFFSET :offset
                """
            )
            rows = await session.execute(sql, {"vec": vec_str, "limit": limit, "offset": offset})
            posts = [Post(**{c: row[c] for c in row.keys()}) for row in rows.mappings()]
            total = len(posts)
        else:
            stmt = select(Post).order_by(Post.published_at.desc()).limit(limit).offset(offset)
            count_stmt = select(func.count()).select_from(Post)
            if q:
                stmt = stmt.where(Post.title.ilike(f"%{q}%") | Post.body_md.ilike(f"%{q}%"))
                count_stmt = count_stmt.where(
                    Post.title.ilike(f"%{q}%") | Post.body_md.ilike(f"%{q}%")
                )
            if tag:
                stmt = stmt.where(Post.tags.contains([tag]))
                count_stmt = count_stmt.where(Post.tags.contains([tag]))
            posts = list(await session.scalars(stmt))
            total = int(await session.scalar(count_stmt) or 0)

        response.headers["X-Total-Count"] = str(total)
        response.headers["X-Limit"] = str(limit)
        response.headers["X-Offset"] = str(offset)
        response.headers["X-Has-Next"] = "true" if offset + limit < total else "false"
        return [PostRead.model_validate(p) for p in posts]


@public_router.get(
    "/{slug}",
    response_model=PostRead,
    summary="Get post detail",
    description="Returns one post with top-3 related posts by cosine similarity.",
)
async def get_post(slug: str, session: AsyncSession = Depends(get_session)) -> PostRead:
    with tracer.start_as_current_span("api.posts.get"):
        stmt = select(Post).where(Post.slug == slug)
        row = await session.scalar(stmt)
        if row is None:
            raise HTTPException(status_code=404, detail="Post not found.")
        related = await _get_related(row, session)
        result = PostRead.model_validate(row)
        result.related = related
        return result


# ── Admin ────────────────────────────────────────────────────────────────────

@admin_router.get("", response_model=list[PostRead])
async def admin_list_posts(
    session: AsyncSession = Depends(get_session),
) -> list[PostRead]:
    with tracer.start_as_current_span("admin.posts.list"):
        rows = await session.scalars(select(Post).order_by(Post.published_at.desc()))
        return [PostRead.model_validate(r) for r in rows]


@admin_router.post("", response_model=PostRead, status_code=status.HTTP_201_CREATED)
async def admin_create_post(
    payload: PostCreate,
    session: AsyncSession = Depends(get_session),
) -> PostRead:
    with tracer.start_as_current_span("admin.posts.create"):
        slug = payload.resolve_slug()
        post = Post(
            title=payload.title,
            slug=slug,
            summary=payload.summary,
            body_md=payload.body_md,
            source=payload.source,
            canonical_url=str(payload.canonical_url) if payload.canonical_url else None,
            published_at=payload.published_at,
            tags=payload.tags,
        )
        session.add(post)
        await session.commit()
        await session.refresh(post)
        return PostRead.model_validate(post)


@admin_router.get("/{post_id}", response_model=PostRead)
async def admin_get_post(
    post_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> PostRead:
    with tracer.start_as_current_span("admin.posts.get"):
        row = await session.get(Post, post_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Post not found.")
        return PostRead.model_validate(row)


@admin_router.patch("/{post_id}", response_model=PostRead)
async def admin_update_post(
    post_id: UUID,
    payload: PostUpdate,
    session: AsyncSession = Depends(get_session),
) -> PostRead:
    with tracer.start_as_current_span("admin.posts.update"):
        row = await session.get(Post, post_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Post not found.")
        updates = payload.model_dump(exclude_none=True)
        for field, value in updates.items():
            if field == "canonical_url" and value is not None:
                value = str(value)
            setattr(row, field, value)
        if "body_md" in updates or "title" in updates:
            row.embedding = None
            row.embedding_indexed_at = None
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return PostRead.model_validate(row)


@admin_router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_post(
    post_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> None:
    with tracer.start_as_current_span("admin.posts.delete"):
        row = await session.get(Post, post_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Post not found.")
        await session.delete(row)
        await session.commit()
