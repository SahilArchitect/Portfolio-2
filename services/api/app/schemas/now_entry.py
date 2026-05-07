"""NowEntry — the /now page. A timestamped status post: what the user is doing this week."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from .common import ORMModel, Timestamped


class NowEntryBase(BaseModel):
    headline: str = Field(
        min_length=2,
        max_length=140,
        description="One-line summary. Shown in the timeline.",
        examples=["Prototyping a multi-agent code reviewer"],
    )
    body_md: str = Field(
        min_length=2,
        max_length=4000,
        description="Markdown. Short — this is a status, not an essay.",
        examples=["Spent the week wiring tool-use traces into Honeycomb..."],
    )
    mood: str | None = Field(
        default=None,
        max_length=40,
        description="Optional one-word mood. Surfaced as a small chip.",
        examples=["focused"],
    )
    is_current: bool = Field(
        default=True,
        description="The single current entry. The API enforces at most one `is_current=True`.",
    )


class NowEntryCreate(NowEntryBase):
    pass


class NowEntryUpdate(BaseModel):
    headline: str | None = None
    body_md: str | None = None
    mood: str | None = None
    is_current: bool | None = None


class NowEntryRead(NowEntryBase, ORMModel, Timestamped):
    id: UUID
    posted_at: datetime = Field(description="When the entry was first posted.")
