# ruff: noqa: B008
"""Projects router — public + admin endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from opentelemetry import trace
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, require_admin
from app.db.models import Project
from app.schemas.project import ProjectCreate, ProjectRead, ProjectStatus, ProjectUpdate

tracer = trace.get_tracer(__name__)

public_router = APIRouter(prefix="/api/projects", tags=["projects"])
admin_router = APIRouter(
    prefix="/admin/projects",
    tags=["admin:projects"],
    dependencies=[Depends(require_admin)],
)


# ── Public ──────────────────────────────────────────────────────────────────

@public_router.get(
    "",
    response_model=list[ProjectRead],
    summary="List projects",
    description="Lists published projects ordered by display_order.",
)
async def list_projects(
    status: ProjectStatus | None = Query(default=ProjectStatus.PUBLISHED),
    session: AsyncSession = Depends(get_session),
) -> list[ProjectRead]:
    with tracer.start_as_current_span("api.projects.list"):
        stmt = (
            select(Project)
            .where(Project.status == status)
            .order_by(Project.display_order.asc(), Project.shipped_on.desc().nullslast())
        )
        rows = await session.scalars(stmt)
        return [ProjectRead.model_validate(r) for r in rows]


@public_router.get(
    "/{slug}",
    response_model=ProjectRead,
    summary="Get project detail",
    description="Returns one published project by slug.",
)
async def get_project(slug: str, session: AsyncSession = Depends(get_session)) -> ProjectRead:
    with tracer.start_as_current_span("api.projects.get"):
        stmt = select(Project).where(Project.slug == slug, Project.status == ProjectStatus.PUBLISHED)
        row = await session.scalar(stmt)
        if row is None:
            raise HTTPException(status_code=404, detail="Project not found.")
        return ProjectRead.model_validate(row)


# ── Admin ────────────────────────────────────────────────────────────────────

@admin_router.get("", response_model=list[ProjectRead])
async def admin_list_projects(session: AsyncSession = Depends(get_session)) -> list[ProjectRead]:
    with tracer.start_as_current_span("admin.projects.list"):
        rows = await session.scalars(
            select(Project).order_by(Project.display_order.asc(), Project.created_at.desc())
        )
        return [ProjectRead.model_validate(r) for r in rows]


@admin_router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def admin_create_project(
    payload: ProjectCreate,
    session: AsyncSession = Depends(get_session),
) -> ProjectRead:
    with tracer.start_as_current_span("admin.projects.create"):
        slug = payload.resolve_slug()
        project = Project(
            title=payload.title,
            slug=slug,
            summary=payload.summary,
            body_md=payload.body_md,
            role=payload.role,
            stack=payload.stack,
            repo_url=str(payload.repo_url) if payload.repo_url else None,
            live_url=str(payload.live_url) if payload.live_url else None,
            cover_image_url=str(payload.cover_image_url) if payload.cover_image_url else None,
            status=payload.status,
            started_on=payload.started_on,
            shipped_on=payload.shipped_on,
            featured=payload.featured,
            display_order=payload.display_order,
        )
        session.add(project)
        await session.commit()
        await session.refresh(project)
        return ProjectRead.model_validate(project)


@admin_router.get("/{project_id}", response_model=ProjectRead)
async def admin_get_project(
    project_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> ProjectRead:
    with tracer.start_as_current_span("admin.projects.get"):
        row = await session.get(Project, project_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Project not found.")
        return ProjectRead.model_validate(row)


@admin_router.patch("/{project_id}", response_model=ProjectRead)
async def admin_update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    session: AsyncSession = Depends(get_session),
) -> ProjectRead:
    with tracer.start_as_current_span("admin.projects.update"):
        row = await session.get(Project, project_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Project not found.")
        updates = payload.model_dump(exclude_none=True)
        for field, value in updates.items():
            if field in ("repo_url", "live_url", "cover_image_url") and value is not None:
                value = str(value)
            setattr(row, field, value)
        # Reset embedding so worker re-embeds.
        if "body_md" in updates or "title" in updates or "summary" in updates:
            row.embedding = None
            row.embedding_indexed_at = None
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return ProjectRead.model_validate(row)


@admin_router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_project(
    project_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> None:
    with tracer.start_as_current_span("admin.projects.delete"):
        row = await session.get(Project, project_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Project not found.")
        await session.delete(row)
        await session.commit()
