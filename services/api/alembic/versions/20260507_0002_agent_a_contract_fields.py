"""agent a: display order, flags, inquiry scoring, content chunks

Revision ID: 0002_agent_a_contract_fields
Revises: 0001_init
Create Date: 2026-05-07
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

revision: str = "0002_agent_a_contract_fields"
down_revision: str | None = "0001_init"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

EMBEDDING_DIM = 1536


def upgrade() -> None:
    op.add_column(
        "projects",
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_projects_display_order", "projects", ["display_order"])
    op.alter_column("projects", "display_order", server_default=None)

    op.add_column("inquiries", sa.Column("priority_score", sa.Integer(), nullable=True))
    op.add_column("inquiries", sa.Column("classified_type", sa.String(40), nullable=True))
    op.add_column("inquiries", sa.Column("priority_reason", sa.String(300), nullable=True))
    op.create_index("ix_inquiries_priority_score", "inquiries", ["priority_score"])
    op.create_index("ix_inquiries_classified_type", "inquiries", ["classified_type"])

    op.create_table(
        "feature_flags",
        sa.Column("name", sa.String(80), primary_key=True),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("description", sa.String(200), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "content_chunks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("source_type", sa.String(20), nullable=False),
        sa.Column("source_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("doc_id", sa.String(260), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(220), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("excerpt", sa.String(400), nullable=False, server_default=""),
        sa.Column("body_md", sa.Text(), nullable=False),
        sa.Column("score_hint", sa.Float(), nullable=True),
        sa.Column("embedding", Vector(EMBEDDING_DIM), nullable=True),
        sa.Column("embedding_indexed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint(
            "source_type",
            "source_id",
            "chunk_index",
            name="uq_content_chunks_source_chunk",
        ),
    )
    op.create_index("ix_content_chunks_source_type", "content_chunks", ["source_type"])
    op.create_index("ix_content_chunks_source_id", "content_chunks", ["source_id"])
    op.create_index("ix_content_chunks_doc_id", "content_chunks", ["doc_id"])
    op.create_index(
        "ix_content_chunks_source_slug",
        "content_chunks",
        ["source_type", "slug"],
    )
    op.execute(
        "CREATE INDEX ix_content_chunks_embedding_hnsw ON content_chunks "
        "USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_content_chunks_embedding_hnsw")
    op.drop_index("ix_content_chunks_source_slug", table_name="content_chunks")
    op.drop_index("ix_content_chunks_doc_id", table_name="content_chunks")
    op.drop_index("ix_content_chunks_source_id", table_name="content_chunks")
    op.drop_index("ix_content_chunks_source_type", table_name="content_chunks")
    op.drop_table("content_chunks")

    op.drop_table("feature_flags")

    op.drop_index("ix_inquiries_classified_type", table_name="inquiries")
    op.drop_index("ix_inquiries_priority_score", table_name="inquiries")
    op.drop_column("inquiries", "priority_reason")
    op.drop_column("inquiries", "classified_type")
    op.drop_column("inquiries", "priority_score")

    op.drop_index("ix_projects_display_order", table_name="projects")
    op.drop_column("projects", "display_order")
