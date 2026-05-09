"""Admin-editable site settings."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class HeroVariant(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(min_length=2, max_length=40)
    label: str = Field(min_length=2, max_length=80)
    body_copy: str = Field(min_length=10, max_length=260, alias="copy")
    allocation: int = Field(ge=0, le=100)
    impressions: int = Field(default=0, ge=0)
    inquiries: int = Field(default=0, ge=0)


class HeroExperiment(BaseModel):
    variants: list[HeroVariant]

    @field_validator("variants")
    @classmethod
    def validate_variants(cls, variants: list[HeroVariant]) -> list[HeroVariant]:
        if len(variants) != 2:
            raise ValueError("Hero test must have exactly two variants.")
        if sum(variant.allocation for variant in variants) != 100:
            raise ValueError("Hero allocations must add up to 100.")
        return variants


class SyncLogRow(BaseModel):
    id: str = Field(min_length=2, max_length=80)
    level: Literal["info", "warning", "error"]
    message: str = Field(min_length=2, max_length=240)
    created_at: str


class SubstackState(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    last_sync_at: str | None = Field(default=None, alias="lastSyncAt")
    embedding_model: Literal["text-embedding-3-small", "text-embedding-3-large"] = Field(
        default="text-embedding-3-small",
        alias="embeddingModel",
    )
    chunk_size: int = Field(default=512, ge=256, le=1024, multiple_of=64, alias="chunkSize")
    recent_log: list[SyncLogRow] = Field(default_factory=list, alias="recentLog")


class SubstackSettingsUpdate(BaseModel):
    embedding_model: Literal["text-embedding-3-small", "text-embedding-3-large"]
    chunk_size: int = Field(ge=256, le=1024, multiple_of=64)
