"""Inquiry — contact-form submissions. Stored, rate-limited, and notifiable."""

from __future__ import annotations

from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from .common import ORMModel, Timestamped


class InquiryStatus(StrEnum):
    NEW = "new"
    READ = "read"
    REPLIED = "replied"
    SPAM = "spam"
    ARCHIVED = "archived"


class InquiryType(StrEnum):
    RECRUITER = "recruiter"
    FOUNDER = "founder"
    SPAM = "spam"
    OTHER = "other"


class InquiryBase(BaseModel):
    name: str = Field(min_length=1, max_length=120, examples=["Avery Tan"])
    email: str = Field(examples=["avery@example.com"])
    company: str | None = Field(default=None, max_length=120, examples=["Atlas Robotics"])
    message: str = Field(
        min_length=10,
        max_length=4000,
        description="Free-form message. Markdown is NOT rendered — treated as plain text.",
        examples=["Hi! We're hiring an AI infra lead and your last post was the spec we wanted."],
    )
    intent: str | None = Field(
        default=None,
        max_length=40,
        description="Optional taxonomy: 'hire', 'collab', 'speaking', 'other'.",
        examples=["hire"],
    )

    @field_validator("email")
    @classmethod
    def _validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or "." not in normalized.rsplit("@", 1)[-1]:
            raise ValueError("valid email address required")
        return normalized


class InquiryCreate(InquiryBase):
    """POST /inquiries — public; rate-limited via Redis."""


class InquiryRead(InquiryBase, ORMModel, Timestamped):
    id: UUID
    status: InquiryStatus = Field(default=InquiryStatus.NEW)
    ip_address: str | None = Field(
        default=None,
        description="Captured for spam triage. Hashed before write per privacy policy.",
    )
    user_agent: str | None = Field(default=None, max_length=500)
    priority_score: int | None = Field(
        default=None,
        ge=0,
        le=100,
        description="LLM-derived urgency score. Higher means more important.",
    )
    classified_type: InquiryType | None = Field(
        default=None,
        description="LLM-derived routing class for the admin inbox.",
    )
    priority_reason: str | None = Field(
        default=None,
        max_length=300,
        description="Short reason for the priority score.",
    )

    @field_validator("ip_address", mode="before")
    @classmethod
    def _stringify_ip(cls, value: object) -> str | None:
        if value is None:
            return None
        return str(value)


class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus = Field(description="Allowed admin status transition.")
