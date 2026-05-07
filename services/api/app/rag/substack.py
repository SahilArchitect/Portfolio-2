"""Substack RSS ingestion helpers used by the admin manual trigger."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

import feedparser
import httpx
from markdownify import markdownify as html_to_markdown
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import get_settings
from app.db.models import Post
from app.rag.indexer import index_document

log = logging.getLogger(__name__)


def _entry_datetime(entry: Any) -> datetime:
    parsed = getattr(entry, "published_parsed", None) or getattr(entry, "updated_parsed", None)
    if parsed:
        return datetime(*parsed[:6], tzinfo=UTC)
    return datetime.now(UTC)


def _entry_html(entry: Any) -> str:
    content = getattr(entry, "content", None)
    if content:
        first = content[0]
        if isinstance(first, dict):
            return str(first.get("value") or "")
        return str(getattr(first, "value", ""))
    return str(getattr(entry, "summary", "") or "")


async def _fetch_full_html(url: str) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.text
    except Exception as exc:
        log.warning("Failed to fetch Substack HTML for %s: %s", url, exc)
        return None


async def ingest_substack_feed(session: AsyncSession) -> dict[str, int]:
    """Pull Substack RSS, insert new posts, and index them when keys are configured."""
    settings = get_settings()
    if not settings.substack_feed_url:
        return {"seen": 0, "inserted": 0, "indexed": 0, "skipped": 0}

    feed = feedparser.parse(settings.substack_feed_url)
    inserted = 0
    indexed = 0
    skipped = 0

    for entry in feed.entries:
        canonical_url = str(getattr(entry, "link", "") or getattr(entry, "id", "") or "")
        if not canonical_url:
            skipped += 1
            continue

        existing = await session.scalar(select(Post).where(Post.canonical_url == canonical_url))
        if existing is not None:
            skipped += 1
            continue

        title = str(getattr(entry, "title", "Untitled post")).strip() or "Untitled post"
        full_html = await _fetch_full_html(canonical_url)
        markdown = html_to_markdown(full_html or _entry_html(entry)).strip()
        if not markdown:
            markdown = str(getattr(entry, "summary", title))
        summary = " ".join(markdown.split())[:400] or None

        base_slug = slugify(title)[:200] or "substack-post"
        slug = base_slug
        suffix = 2
        while await session.scalar(select(Post).where(Post.slug == slug)):
            slug = f"{base_slug}-{suffix}"[:220]
            suffix += 1

        post = Post(
            title=title,
            slug=slug,
            summary=summary,
            body_md=markdown,
            source="substack",
            canonical_url=canonical_url,
            published_at=_entry_datetime(entry),
            tags=[str(tag.term).lower() for tag in getattr(entry, "tags", []) if getattr(tag, "term", "")],
        )
        session.add(post)
        await session.flush()
        inserted += 1

        if settings.openai_api_key:
            vectors = await index_document(
                session=session,
                source_type="post",
                source_id=post.id,
                title=post.title,
                slug=post.slug,
                markdown=post.body_md,
                summary=post.summary,
                endpoint="worker.ingest_substack",
            )
            if vectors:
                post.embedding = [
                    sum(vector[i] for vector in vectors) / len(vectors)
                    for i in range(len(vectors[0]))
                ]
                post.embedding_indexed_at = datetime.now(UTC)
                indexed += len(vectors)

    await session.commit()
    return {"seen": len(feed.entries), "inserted": inserted, "indexed": indexed, "skipped": skipped}
