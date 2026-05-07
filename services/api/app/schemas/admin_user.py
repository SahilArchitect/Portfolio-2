"""AdminUser — the small handful of identities allowed into the admin app.

Auth itself is NextAuth (magic-link) on the admin frontend; the API stores
the user record and any session-derived state. Email is the principal.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from .common import ORMModel, Timestamped


class AdminUserBase(BaseModel):
    email: str = Field(examples=["sahil@example.com"])
    display_name: str | None = Field(default=None, max_length=80, examples=["Sahil Bhatti"])
    is_active: bool = Field(default=True)

    @field_validator("email")
    @classmethod
    def _validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or "." not in normalized.rsplit("@", 1)[-1]:
            raise ValueError("valid email address required")
        return normalized


class AdminUserCreate(AdminUserBase):
    pass


class AdminUserRead(AdminUserBase, ORMModel, Timestamped):
    id: UUID
    last_login_at: datetime | None = Field(
        default=None, description="Most recent successful magic-link login."
    )
