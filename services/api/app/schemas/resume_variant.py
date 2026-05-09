"""ResumeVariant — multiple tailored resumes (e.g., 'AI infra lead', 'staff backend')."""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field

from .common import ORMModel, Timestamped


class ResumeVariantBase(BaseModel):
    label: str = Field(
        min_length=2,
        max_length=80,
        description="Human-readable label. Shown in the variant picker.",
        examples=["AI Infrastructure Lead"],
    )
    slug: str = Field(
        min_length=2,
        max_length=80,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        description="URL slug, served as `/resume/{slug}`.",
        examples=["ai-infra-lead"],
    )
    body_md: str = Field(
        min_length=10,
        description="Markdown source. Rendered to HTML and PDF on demand.",
    )
    pdf_url: str | None = Field(
        default=None,
        description="Download URL for the uploaded or externally hosted PDF.",
    )
    role_keywords: list[str] = Field(
        default_factory=list,
        description="Role tags used by the hire page variant picker.",
        examples=[["AI backend", "RAG", "FastAPI"]],
    )
    is_default: bool = Field(
        default=False,
        description="Surface as the default variant on /resume. Exactly one should be default.",
    )


class ResumeVariantCreate(ResumeVariantBase):
    pass


class ResumeVariantUpdate(BaseModel):
    label: str | None = None
    slug: str | None = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    body_md: str | None = None
    pdf_url: str | None = None
    role_keywords: list[str] | None = None
    is_default: bool | None = None


class ResumeVariantRead(ResumeVariantBase, ORMModel, Timestamped):
    id: UUID
