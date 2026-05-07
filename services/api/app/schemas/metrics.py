"""Public metrics schema — RAG throughput and latency (no PII)."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class PublicMetrics(BaseModel):
    rag_queries_24h: int = Field(description="Number of RAG search queries in the last 24 hours.")
    requests_24h: int = Field(description="Total measured public API requests in the last 24 hours.")
    throughput_per_minute: float = Field(description="Average measured throughput over the last 24h.")
    median_latency_ms: float = Field(description="Median end-to-end RAG latency in milliseconds.")
    p99_latency_ms: float = Field(description="99th-percentile RAG latency in milliseconds.")
    sparkline: list[int] = Field(
        default_factory=list,
        description="Hourly RAG query counts, oldest to newest, 24 entries.",
    )
    updated_at: datetime = Field(description="When this aggregate was generated.")
