"""Shared mixins and primitives for schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    """Base for read-side schemas. Permits attribute-based loading from ORM rows."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class Timestamped(BaseModel):
    """Mixin for created_at / updated_at on read-side shapes."""

    created_at: datetime = Field(description="UTC creation timestamp.")
    updated_at: datetime = Field(description="UTC last-update timestamp.")


class Pagination(BaseModel):
    """Standard pagination envelope. Cursor-based to keep things stable under writes."""

    limit: int = Field(default=20, ge=1, le=100, examples=[20])
    cursor: str | None = Field(
        default=None,
        description="Opaque cursor returned from the previous page. Pass null for the first page.",
        examples=[None],
    )
    next_cursor: str | None = Field(
        default=None,
        description="Cursor to fetch the next page, or null when exhausted.",
        examples=["eyJpZCI6IjEyMyJ9"],
    )
