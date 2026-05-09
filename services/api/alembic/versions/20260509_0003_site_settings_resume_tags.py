"""site settings and resume role keywords

Revision ID: 0003_site_settings_resume_tags
Revises: 0002_agent_a_contract_fields
Create Date: 2026-05-09
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003_site_settings_resume_tags"
down_revision: str | None = "0002_agent_a_contract_fields"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "resume_variants",
        sa.Column(
            "role_keywords",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default=sa.text("ARRAY[]::varchar[]"),
        ),
    )
    op.alter_column("resume_variants", "role_keywords", server_default=None)

    op.create_table(
        "site_settings",
        sa.Column("key", sa.String(80), primary_key=True),
        sa.Column("value", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
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


def downgrade() -> None:
    op.drop_table("site_settings")
    op.drop_column("resume_variants", "role_keywords")
