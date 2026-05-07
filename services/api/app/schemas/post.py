"""Post — Substack content ingested by the worker, plus any first-party essays.

Posts are the second corpus (after Projects) that powers RAG over the user's
voice. Embeddings are 1536-dim from text-embedding-3-small by default.
"""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl, field_validator
from slugify import slugify

from .common import ORMModel, Timestamped


class PostSource(StrEnum):
    SUBSTACK = "substack"
    NATIVE = "native"


class PostBase(BaseModel):
    title: str = Field(min_length=2, max_length=200, examples=["The shape of an AI engineer's day"])
    slug: str = Field(
        min_length=2,
        max_length=220,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        examples=["the-shape-of-an-ai-engineers-day"],
    )
    summary: str | None = Field(
        default=None,
        max_length=400,
        description="Hand-written or model-generated dek. May be null for raw imports.",
    )
    body_md: str = Field(min_length=10, description="Markdown body. Substack HTML is converted.")
    source: PostSource = Field(default=PostSource.NATIVE, examples=[PostSource.SUBSTACK])
    canonical_url: HttpUrl | None = Field(
        default=None,
        description="Original URL on Substack. Required for SUBSTACK posts; "
        "validators enforce this.",
        examples=["https://sahilbhatti.substack.com/p/the-shape-of-an-ai-engineers-day"],
    )
    published_at: datetime = Field(description="Publication time, UTC.")
    tags: list[str] = Field(default_factory=list, examples=[["ai", "infra", "career"]])

    @field_validator("tags")
    @classmethod
    def _strip_tags(cls, v: list[str]) -> list[str]:
        return [t.strip().lower() for t in v if t.strip()]


class PostCreate(PostBase):
    slug: str | None = Field(default=None)  # type: ignore[assignment]

    def resolve_slug(self) -> str:
        return self.slug or slugify(self.title)


class PostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    summary: str | None = None
    body_md: str | None = None
    canonical_url: HttpUrl | None = None
    published_at: datetime | None = None
    tags: list[str] | None = None


class PostRead(PostBase, ORMModel, Timestamped):
    id: UUID
    embedding_indexed_at: datetime | None = Field(
        default=None,
        description="When the post body was last embedded. Null = pending re-embedding.",
    )
    related: list[PostRead] | None = Field(
        default=None,
        description="Top-3 cosine-similar posts. Only populated on detail endpoint.",
    )


# Required for the self-referential `related` field.
PostRead.model_rebuild()
