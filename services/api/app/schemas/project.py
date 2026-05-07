"""Project — a portfolio piece. Each entry is shippable work the user wants to surface."""

from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl, field_validator
from slugify import slugify

from .common import ORMModel, Timestamped


class ProjectStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ProjectBase(BaseModel):
    title: str = Field(
        min_length=2,
        max_length=120,
        description="Display title.",
        examples=["RAG-powered changelog assistant"],
    )
    slug: str = Field(
        min_length=2,
        max_length=140,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="URL slug. Auto-generated from title on Create if omitted.",
        examples=["rag-powered-changelog-assistant"],
    )
    summary: str = Field(
        min_length=10,
        max_length=400,
        description="Card-level one-liner. Shown in lists and previews.",
        examples=[
            "A retrieval-augmented assistant that answers product questions from a "
            "live changelog index."
        ],
    )
    body_md: str = Field(
        min_length=10,
        description="Markdown body. Rendered server-side on the public site.",
        examples=["## Why\nProduct teams write changelogs nobody reads..."],
    )
    role: str = Field(
        max_length=80,
        description="The user's role on the project.",
        examples=["Sole engineer"],
    )
    stack: list[str] = Field(
        default_factory=list,
        description="Tech stack tags. Order matters — most prominent first.",
        examples=[["FastAPI", "pgvector", "Next.js", "OpenAI"]],
    )
    repo_url: HttpUrl | None = Field(
        default=None, examples=["https://github.com/sahilbhatti/changelog-rag"]
    )
    live_url: HttpUrl | None = Field(default=None, examples=["https://changelog.example.com"])
    cover_image_url: HttpUrl | None = Field(
        default=None,
        description="16:9 hero image. Stored in S3 / Vercel Blob; CDN-served.",
    )
    status: ProjectStatus = Field(
        default=ProjectStatus.DRAFT,
        description="Visibility. Only `published` appears on the public site.",
    )
    started_on: date | None = Field(default=None, examples=["2025-01-12"])
    shipped_on: date | None = Field(default=None, examples=["2025-03-04"])
    featured: bool = Field(
        default=False,
        description="Pin to the home grid. At most 4 should be featured at once.",
    )
    display_order: int = Field(
        default=0,
        ge=0,
        description="Manual ordering for public project lists. Lower values appear first.",
        examples=[10],
    )

    @field_validator("stack")
    @classmethod
    def _strip_stack(cls, v: list[str]) -> list[str]:
        return [s.strip() for s in v if s.strip()]


class ProjectCreate(ProjectBase):
    """POST /projects payload. `slug` may be omitted; the API will derive it."""

    slug: str | None = Field(  # type: ignore[assignment]
        default=None,
        description="Optional. If omitted, derived from `title` via slugify.",
    )

    def resolve_slug(self) -> str:
        return self.slug or slugify(self.title)


class ProjectUpdate(BaseModel):
    """PATCH /projects/{id}. Every field optional; embedding is recomputed server-side."""

    title: str | None = None
    slug: str | None = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    summary: str | None = None
    body_md: str | None = None
    role: str | None = None
    stack: list[str] | None = None
    repo_url: HttpUrl | None = None
    live_url: HttpUrl | None = None
    cover_image_url: HttpUrl | None = None
    status: ProjectStatus | None = None
    started_on: date | None = None
    shipped_on: date | None = None
    featured: bool | None = None
    display_order: int | None = Field(default=None, ge=0)


class ProjectRead(ProjectBase, ORMModel, Timestamped):
    id: UUID
    embedding_indexed_at: datetime | None = Field(
        default=None,
        description="When the project's body was last embedded into pgvector. "
        "Null = pending re-embedding.",
    )
