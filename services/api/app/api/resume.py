# ruff: noqa: B008
"""Resume variants router."""

from __future__ import annotations

from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from opentelemetry import trace
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, require_admin
from app.core.settings import get_settings
from app.db.models import ResumeVariant
from app.schemas.resume_variant import ResumeVariantCreate, ResumeVariantRead, ResumeVariantUpdate

tracer = trace.get_tracer(__name__)
MAX_RESUME_UPLOAD_BYTES = 5 * 1024 * 1024

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

def _public_upload_url(request: Request, filename: str) -> str:
    settings = get_settings()
    base = settings.public_api_base_url.rstrip("/") or str(request.base_url).rstrip("/")
    return f"{base}/uploads/resumes/{filename}"


@admin_router.post("/upload")
async def admin_upload_resume_pdf(
    request: Request,
    file: UploadFile = File(...),
) -> dict[str, str]:
    with tracer.start_as_current_span("admin.resume.upload"):
        original_filename = file.filename or ""
        is_pdf = file.content_type == "application/pdf" or original_filename.lower().endswith(".pdf")
        if not is_pdf:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are accepted.")

        content = await file.read(MAX_RESUME_UPLOAD_BYTES + 1)
        if len(content) > MAX_RESUME_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="PDF must be 5 MB or smaller.",
            )

        filename = f"{uuid4().hex}.pdf"
        upload_dir = Path(get_settings().resume_upload_dir) / "resumes"
        upload_dir.mkdir(parents=True, exist_ok=True)
        (upload_dir / filename).write_bytes(content)

        return {"pdf_url": _public_upload_url(request, filename)}


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
            role_keywords=payload.role_keywords,
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
