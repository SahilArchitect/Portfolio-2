# ruff: noqa: B008
"""Contact-form inquiry endpoints."""

from __future__ import annotations

import json
import logging
from typing import Any
from uuid import UUID

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from opentelemetry import trace
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_redis_ratelimit, get_session, require_admin
from app.api.rate_limit import check_rate_limit, client_ip
from app.core.settings import get_settings
from app.db.models import Inquiry
from app.llm.gateway import complete
from app.schemas.inquiry import (
    InquiryCreate,
    InquiryRead,
    InquiryStatus,
    InquiryStatusUpdate,
    InquiryType,
)

log = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

public_router = APIRouter(prefix="/api/inquiries", tags=["inquiries"])
admin_router = APIRouter(
    prefix="/admin/inquiries",
    tags=["admin:inquiries"],
    dependencies=[Depends(require_admin)],
)

_RATE_LIMIT = 5
_RATE_WINDOW_SECONDS = 60


def _heuristic_score(payload: InquiryCreate) -> dict[str, Any]:
    text = f"{payload.intent or ''} {payload.company or ''} {payload.message}".lower()
    if any(word in text for word in ("spam", "seo", "crypto", "guest post", "backlink")):
        return {
            "priority_score": 5,
            "classified_type": InquiryType.SPAM,
            "priority_reason": "Looks promotional or spam-like.",
        }
    if any(word in text for word in ("hire", "role", "recruit", "job", "interview")):
        return {
            "priority_score": 85,
            "classified_type": InquiryType.RECRUITER,
            "priority_reason": "Mentions hiring or recruiting intent.",
        }
    if any(word in text for word in ("founder", "startup", "cofounder", "investor")):
        return {
            "priority_score": 75,
            "classified_type": InquiryType.FOUNDER,
            "priority_reason": "Likely founder or startup opportunity.",
        }
    return {
        "priority_score": 45,
        "classified_type": InquiryType.OTHER,
        "priority_reason": "General inbound inquiry.",
    }


async def score_inquiry(payload: InquiryCreate) -> dict[str, Any]:
    """Score an inquiry inline via the LLM gateway, with a no-key local fallback."""
    settings = get_settings()
    if not settings.anthropic_api_key:
        return _heuristic_score(payload)

    system = (
        "Classify this portfolio contact inquiry. Return only JSON with keys "
        "priority_score (0-100 integer), classified_type "
        "(recruiter|founder|spam|other), priority_reason (short string)."
    )
    user = {
        "name": payload.name,
        "email": str(payload.email),
        "company": payload.company,
        "intent": payload.intent,
        "message": payload.message,
    }
    try:
        raw = await complete(
            system=system,
            messages=[{"role": "user", "content": json.dumps(user)}],
            max_tokens=300,
            endpoint="api.inquiries.priority_score",
        )
        parsed = json.loads(raw)
        score = int(parsed.get("priority_score", 45))
        classified = InquiryType(parsed.get("classified_type", "other"))
        reason = str(parsed.get("priority_reason", "LLM classified inquiry."))[:300]
        return {
            "priority_score": max(0, min(100, score)),
            "classified_type": classified,
            "priority_reason": reason,
        }
    except Exception as exc:
        log.warning("Inquiry LLM scoring failed; using heuristic fallback: %s", exc)
        return _heuristic_score(payload)


@public_router.post(
    "",
    response_model=InquiryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Submit an inquiry",
    description="Stores a contact form submission after rate limiting and inline priority scoring.",
)
async def create_inquiry(
    payload: InquiryCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
    redis: aioredis.Redis = Depends(get_redis_ratelimit),
) -> InquiryRead:
    with tracer.start_as_current_span("api.inquiries.create") as span:
        ip = client_ip(request)
        span.set_attribute("client_ip_present", bool(ip))
        await check_rate_limit(
            redis,
            ip=ip,
            endpoint="/api/inquiries",
            limit=_RATE_LIMIT,
            window_seconds=_RATE_WINDOW_SECONDS,
        )
        scored = await score_inquiry(payload)
        inquiry = Inquiry(
            name=payload.name,
            email=str(payload.email),
            company=payload.company,
            message=payload.message,
            intent=payload.intent,
            ip_address=ip if ip != "unknown" else None,
            user_agent=request.headers.get("user-agent", "")[:500] or None,
            priority_score=scored["priority_score"],
            classified_type=str(scored["classified_type"]),
            priority_reason=scored["priority_reason"],
        )
        session.add(inquiry)
        await session.commit()
        await session.refresh(inquiry)
        span.set_attribute("priority_score", inquiry.priority_score or 0)
        span.set_attribute("classified_type", inquiry.classified_type or "")
        return InquiryRead.model_validate(inquiry)


@admin_router.get(
    "",
    response_model=list[InquiryRead],
    summary="List inquiries",
    description="Admin inbox sorted by LLM priority score, with optional status/type filters.",
)
async def admin_list_inquiries(
    status_filter: InquiryStatus | None = Query(default=None, alias="status"),
    classified_type: InquiryType | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_session),
) -> list[InquiryRead]:
    with tracer.start_as_current_span("admin.inquiries.list"):
        stmt = select(Inquiry)
        if status_filter is not None:
            stmt = stmt.where(Inquiry.status == status_filter)
        if classified_type is not None:
            stmt = stmt.where(Inquiry.classified_type == str(classified_type))
        stmt = (
            stmt.order_by(desc(Inquiry.priority_score).nullslast(), Inquiry.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        rows = await session.scalars(stmt)
        return [InquiryRead.model_validate(row) for row in rows]


@admin_router.patch(
    "/{inquiry_id}",
    response_model=InquiryRead,
    summary="Update inquiry status",
    description="Admin status transition endpoint. Only the status can change here.",
)
async def admin_update_inquiry_status(
    inquiry_id: UUID,
    payload: InquiryStatusUpdate,
    session: AsyncSession = Depends(get_session),
) -> InquiryRead:
    with tracer.start_as_current_span("admin.inquiries.status"):
        row = await session.get(Inquiry, inquiry_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Inquiry not found.")
        row.status = payload.status
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return InquiryRead.model_validate(row)
