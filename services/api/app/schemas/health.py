"""Healthcheck schema."""

from __future__ import annotations

from pydantic import BaseModel, Field


class HealthRead(BaseModel):
    status: str = Field(description="'ok' when all dependencies are reachable, else 'degraded'.")
    db: bool = Field(description="Database connectivity status.")
    redis: bool = Field(description="Redis connectivity status.")
    vector_index: bool = Field(description="pgvector extension and HNSW index availability.")
