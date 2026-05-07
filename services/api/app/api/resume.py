# ruff: noqa: B008
"""Resume variants router."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from opentelemetry import trace
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, require_admin
from app.db.models import ResumeVariant
from app.schemas.resume_variant import ResumeVariantCreate, ResumeVariantRead, ResumeVariantUpdate

tracer = trace.get_tracer(__name__)

public_router = APIRouter(prefix="/api/resume", tags=["resume"])
admin_router = APIRouter(
    prefix="/admin/resume-variants",
    tags=["admin:resume-variants"],
    dependencies=[Depends(require_admin)],
)


# ── Public ──────────────────────────────────────────────────────────────────

@public_router.get("", response_model=ResumeVariantRead)
async def get_default_resume(session: AsyncSession = Depends(get_session)) -> ResumeVariantRead:
    with tracer.start_as_current_span("api.resume.default"):
        stmt = select(ResumeVariant).where(ResumeVariant.is_default == True).limit(1)  # noqa: E712
        row = await session.scalar(stmt)
        if row is None:
            raise HTTPException(status_code=404, detail="No default resume variant.")
        return ResumeVariantRead.model_validate(row)


@public_router.get("/{slug}", response_model=ResumeVariantRead)
async def get_resume_by_slug(
    slug: str,
    session: AsyncSession = Depends(get_session),
) -> ResumeVariantRead:
    with tracer.start_as_current_span("api.resume.get"):
        stmt = select(ResumeVariant).where(ResumeVariant.slug == slug)
        row = await session.scalar(stmt)
        if row is None:
            raise HTTPException(status_code=404, detail="Resume variant not found.")
        return ResumeVariantRead.model_validate(row)


# ── Admin ────────────────────────────────────────────────────────────────────

@admin_router.get("", response_model=list[ResumeVariantRead])
async def admin_list_resume_variants(
    session: AsyncSession = Depends(get_session),
) -> list[ResumeVariantRead]:
    with tracer.start_as_current_span("admin.resume.list"):
        rows = await session.scalars(select(ResumeVariant).order_by(ResumeVariant.created_at.desc()))
        return [ResumeVariantRead.model_validate(r) for r in rows]


@admin_router.post("", response_model=ResumeVariantRead, status_code=status.HTTP_201_CREATED)
async def admin_create_resume_variant(
    payload: ResumeVariantCreate,
    session: AsyncSession = Depends(get_session),
) -> ResumeVariantRead:
    with tracer.start_as_current_span("admin.resume.create"):
        if payload.is_default:
            await session.execute(
                update(ResumeVariant).where(ResumeVariant.is_default == True).values(is_default=False)  # noqa: E712
            )
        variant = ResumeVariant(
            label=payload.label,
            slug=payload.slug,
            body_md=payload.body_md,
            pdf_url=str(payload.pdf_url) if payload.pdf_url else None,
            is_default=payload.is_default,
        )
        session.add(variant)
        await session.commit()
        await session.refresh(variant)
        return ResumeVariantRead.model_validate(variant)


@admin_router.get("/{variant_id}", response_model=ResumeVariantRead)
async def admin_get_resume_variant(
    variant_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> ResumeVariantRead:
    with tracer.start_as_current_span("admin.resume.get"):
        row = await session.get(ResumeVariant, variant_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Resume variant not found.")
        return ResumeVariantRead.model_validate(row)


@admin_router.patch("/{variant_id}", response_model=ResumeVariantRead)
async def admin_update_resume_variant(
    variant_id: UUID,
    payload: ResumeVariantUpdate,
    session: AsyncSession = Depends(get_session),
) -> ResumeVariantRead:
    with tracer.start_as_current_span("admin.resume.update"):
        row = await session.get(ResumeVariant, variant_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Resume variant not found.")
        if payload.is_default:
            await session.execute(
                update(ResumeVariant)
                .where(ResumeVariant.is_default == True, ResumeVariant.id != variant_id)  # noqa: E712
                .values(is_default=False)
            )
        updates = payload.model_dump(exclude_none=True)
        for field, value in updates.items():
            setattr(row, field, value)
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return ResumeVariantRead.model_validate(row)


@admin_router.delete("/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_resume_variant(
    variant_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> None:
    with tracer.start_as_current_span("admin.resume.delete"):
        row = await session.get(ResumeVariant, variant_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Resume variant not found.")
        await session.delete(row)
        await session.commit()
