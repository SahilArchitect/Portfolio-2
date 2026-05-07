"""Substack ingestion job."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

import feedparser
import httpx
from markdownify import markdownify as html_to_markdown
from slugify import slugify
from sqlalchemy import text

from ._shared import session_scope, substack_feed_url
from .embeddings import refresh_embeddings

log = logging.getLogger(__name__)

_POST_BY_CANONICAL = text("SELECT id FROM posts WHERE canonical_url = :canonical_url LIMIT 1")
_POST_BY_SLUG = text("SELECT id FROM posts WHERE slug = :slug LIMIT 1")
_INSERT_POST = text(
    """
    INSERT INTO posts (
        id, title, slug, summary, body_md, source, canonical_url, published_at, tags,
        created_at, updated_at
    )
    VALUES (
        CAST(:id AS uuid), :title, :slug, :summary, :body_md, 'substack',
        :canonical_url, :published_at, CAST(:tags AS varchar[]), NOW(), NOW()
    )
    RETURNING id::text
    """
)


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


def _entry_tags(entry: Any) -> list[str]:
    tags = []
    for tag in getattr(entry, "tags", []) or []:
        value = tag.get("term") if isinstance(tag, dict) else getattr(tag, "term", "")
        if value:
            tags.append(str(value).strip().lower())
    return tags


async def _fetch_full_html(url: str) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.text
    except Exception as exc:
        log.warning("Substack full HTML fetch failed for %s: %s", url, exc)
        return None


async def _unique_slug(session, title: str) -> str:  # type: ignore[no-untyped-def]
    base = slugify(title)[:200] or "substack-post"
    slug = base
    suffix = 2
    while await session.scalar(_POST_BY_SLUG, {"slug": slug}):
        slug = f"{base}-{suffix}"[:220]
        suffix += 1
    return slug


async def ingest_substack() -> dict[str, int]:
    """Pull RSS, dedupe by canonical_url, insert posts, then refresh embeddings."""
    feed_url = substack_feed_url()
    if not feed_url:
        log.warning("SUBSTACK_FEED_URL not configured; skipping")
        return {"seen": 0, "inserted": 0, "skipped": 0, "embedded_chunks": 0}

    feed = feedparser.parse(feed_url)
    inserted = 0
    skipped = 0

    async with session_scope() as session:
        for entry in feed.entries:
            canonical_url = str(getattr(entry, "link", "") or getattr(entry, "id", "") or "")
            if not canonical_url:
                skipped += 1
                continue
            if await session.scalar(_POST_BY_CANONICAL, {"canonical_url": canonical_url}):
                skipped += 1
                continue

            title = str(getattr(entry, "title", "Untitled post")).strip() or "Untitled post"
            html = await _fetch_full_html(canonical_url)
            markdown = html_to_markdown(html or _entry_html(entry)).strip()
            if not markdown:
                markdown = str(getattr(entry, "summary", title))
            summary = " ".join(markdown.split())[:400] or None

            await session.execute(
                _INSERT_POST,
                {
                    "title": title,
                    "id": str(uuid4()),
                    "slug": await _unique_slug(session, title),
                    "summary": summary,
                    "body_md": markdown,
                    "canonical_url": canonical_url,
                    "published_at": _entry_datetime(entry),
                    "tags": _entry_tags(entry),
                },
            )
            inserted += 1
        await session.commit()

    embedding_result = await refresh_embeddings() if inserted else {"chunks": 0}
    result = {
        "seen": len(feed.entries),
        "inserted": inserted,
        "skipped": skipped,
        "embedded_chunks": int(embedding_result.get("chunks", 0)),
    }
    log.info("ingest_substack completed: %s", result)
    return result
