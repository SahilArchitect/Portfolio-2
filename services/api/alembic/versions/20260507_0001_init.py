"""init: pgvector + projects, posts, now_entries, inquiries, resume_variants, admin_users

Revision ID: 0001_init
Revises:
Create Date: 2026-05-07
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

revision: str = "0001_init"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

EMBEDDING_DIM = 1536


def upgrade() -> None:
    # 1. Extension. CREATE EXTENSION IF NOT EXISTS vector — must come first.
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # 2. projects
    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("slug", sa.String(140), nullable=False),
        sa.Column("summary", sa.String(400), nullable=False),
        sa.Column("body_md", sa.Text(), nullable=False),
        sa.Column("role", sa.String(80), nullable=False, server_default=""),
        sa.Column(
            "stack",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default=sa.text("ARRAY[]::varchar[]"),
        ),
        sa.Column("repo_url", sa.String(500), nullable=True),
        sa.Column("live_url", sa.String(500), nullable=True),
        sa.Column("cover_image_url", sa.String(500), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("started_on", sa.Date(), nullable=True),
        sa.Column("shipped_on", sa.Date(), nullable=True),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.false()),
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
        sa.UniqueConstraint("slug", name="uq_projects_slug"),
    )
    op.create_index("ix_projects_status", "projects", ["status"])
    op.create_index("ix_projects_shipped_on", "projects", ["shipped_on"])
    op.execute(
        "CREATE INDEX ix_projects_embedding_hnsw ON projects "
        "USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)"
    )

    # 3. posts
    op.create_table(
        "posts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("summary", sa.String(400), nullable=True),
        sa.Column("body_md", sa.Text(), nullable=False),
        sa.Column("source", sa.String(20), nullable=False, server_default="native"),
        sa.Column("canonical_url", sa.String(500), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "tags",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default=sa.text("ARRAY[]::varchar[]"),
        ),
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
        sa.UniqueConstraint("slug", name="uq_posts_slug"),
        sa.UniqueConstraint("canonical_url", name="uq_posts_canonical_url"),
    )
    op.create_index("ix_posts_source", "posts", ["source"])
    op.create_index("ix_posts_published_at", "posts", ["published_at"])
    op.execute(
        "CREATE INDEX ix_posts_embedding_hnsw ON posts "
        "USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)"
    )

    # 4. now_entries
    op.create_table(
        "now_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("headline", sa.String(140), nullable=False),
        sa.Column("body_md", sa.Text(), nullable=False),
        sa.Column("mood", sa.String(40), nullable=True),
        sa.Column("is_current", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "posted_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
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
    op.create_index("ix_now_entries_posted_at", "now_entries", ["posted_at"])
    op.execute(
        "CREATE UNIQUE INDEX uq_now_entries_one_current ON now_entries (is_current) "
        "WHERE is_current = true"
    )

    # 5. inquiries
    op.create_table(
        "inquiries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("company", sa.String(120), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("intent", sa.String(40), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="new"),
        sa.Column("ip_address", postgresql.INET(), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
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
    op.create_index("ix_inquiries_email", "inquiries", ["email"])
    op.create_index("ix_inquiries_status", "inquiries", ["status"])

    # 6. resume_variants
    op.create_table(
        "resume_variants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("label", sa.String(80), nullable=False),
        sa.Column("slug", sa.String(80), nullable=False),
        sa.Column("body_md", sa.Text(), nullable=False),
        sa.Column("pdf_url", sa.String(500), nullable=True),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.false()),
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
        sa.UniqueConstraint("slug", name="uq_resume_variants_slug"),
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_resume_variants_one_default ON resume_variants (is_default) "
        "WHERE is_default = true"
    )

    # 7. admin_users
    op.create_table(
        "admin_users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("display_name", sa.String(80), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
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
        sa.UniqueConstraint("email", name="uq_admin_users_email"),
    )


def downgrade() -> None:
    op.drop_table("admin_users")
    op.execute("DROP INDEX IF EXISTS uq_resume_variants_one_default")
    op.drop_table("resume_variants")
    op.drop_index("ix_inquiries_status", table_name="inquiries")
    op.drop_index("ix_inquiries_email", table_name="inquiries")
    op.drop_table("inquiries")
    op.execute("DROP INDEX IF EXISTS uq_now_entries_one_current")
    op.drop_index("ix_now_entries_posted_at", table_name="now_entries")
    op.drop_table("now_entries")
    op.execute("DROP INDEX IF EXISTS ix_posts_embedding_hnsw")
    op.drop_index("ix_posts_published_at", table_name="posts")
    op.drop_index("ix_posts_source", table_name="posts")
    op.drop_table("posts")
    op.execute("DROP INDEX IF EXISTS ix_projects_embedding_hnsw")
    op.drop_index("ix_projects_shipped_on", table_name="projects")
    op.drop_index("ix_projects_status", table_name="projects")
    op.drop_table("projects")
    # Leave the extension in place — other tools may depend on it.
