"""Feature flag schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from .common import ORMModel


class FeatureFlag(BaseModel):
    name: str = Field(description="Flag name, alphanumeric + underscores.")
    enabled: bool = Field(description="Whether the flag is currently enabled.")


class FeatureFlagCreate(FeatureFlag):
    description: str | None = Field(default=None, max_length=200)


class FeatureFlagUpdate(BaseModel):
    enabled: bool | None = None
    description: str | None = Field(default=None, max_length=200)


class FeatureFlagRead(FeatureFlag, ORMModel):
    description: str | None = None
    created_at: datetime
    updated_at: datetime
