"""Runtime configuration. Read from environment via pydantic-settings.

Every setting is documented inline; new settings must be added to
`/infra/.env.example` in the same change to keep the contract honest.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    environment: Literal["development", "staging", "production"] = Field(
        default="development",
        description="Deployment environment. Controls log verbosity and OTel exporter.",
    )

    api_host: str = Field(default="0.0.0.0", description="Bind address for uvicorn.")
    api_port: int = Field(default=8000, description="Bind port for uvicorn.")
    api_cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://localhost:3001"],
        description="Allowed CORS origins. Web is :3000, admin is :3001.",
    )

    database_url: PostgresDsn = Field(
        default=PostgresDsn(
            "postgresql+asyncpg://engine_room:engine_room@localhost:5432/engine_room"
        ),
        description="Async SQLAlchemy DSN to Postgres + pgvector.",
    )

    redis_url: RedisDsn = Field(
        default=RedisDsn("redis://localhost:6379/0"),
        description="Redis connection URL. DB 0 = cache, DB 1 = rate limits, DB 2 = queues.",
    )

    openai_api_key: str | None = Field(
        default=None,
        description="OpenAI key for embeddings (text-embedding-3-small, 1536 dims).",
    )
    anthropic_api_key: str | None = Field(
        default=None, description="Anthropic key for chat/RAG completions."
    )
    embedding_model: str = Field(
        default="text-embedding-3-small",
        description="Must produce 1536-dim vectors (matches the schema column).",
    )

    admin_emails: list[str] = Field(
        default_factory=list,
        description="Email allowlist for admin magic-link auth. Single-admin in practice.",
    )

    admin_token: str = Field(
        default="",
        description="Shared secret for admin API auth. Set in production env.",
    )

    public_api_base_url: str = Field(
        default="",
        description="Public API origin used when generating browser-downloadable asset URLs.",
    )
    resume_upload_dir: str = Field(
        default="storage/uploads",
        description="Directory where admin-uploaded resume PDFs are stored and served from /uploads.",
    )

    substack_feed_url: str = Field(
        default="",
        description="Substack RSS feed URL for the worker ingestion job.",
    )

    default_flags: dict[str, bool] = Field(
        default_factory=dict,
        description="Default feature flag values seeded on startup.",
    )

    otel_service_name: str = Field(default="engine-room-api")
    otel_exporter_otlp_endpoint: str | None = Field(
        default=None,
        description="OTLP endpoint. If unset, the dev console exporter is used.",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
