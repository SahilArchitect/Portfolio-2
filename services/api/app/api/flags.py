# ruff: noqa: B008
"""Feature flag endpoints."""

from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException, status
from opentelemetry import trace
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, require_admin
from app.core.settings import get_settings
from app.db.models import FeatureFlag as FeatureFlagModel
from app.schemas.flags import FeatureFlagCreate, FeatureFlagRead, FeatureFlagUpdate

tracer = trace.get_tracer(__name__)
public_router = APIRouter(prefix="/api/flags", tags=["flags"])
admin_router = APIRouter(
    prefix="/admin/flags",
    tags=["admin:flags"],
    dependencies=[Depends(require_admin)],
)

_FLAG_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9_:-]{1,79}$")


def _validate_name(name: str) -> None:
    if not _FLAG_RE.match(name):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Flag names must be 2-80 chars: letters, numbers, _, :, -.",
        )


@public_router.get(
    "",
    response_model=dict[str, bool],
    summary="Public feature flags",
    description="Returns server-side feature flags readable by the public web app.",
)
async def public_flags(session: AsyncSession = Depends(get_session)) -> dict[str, bool]:
    with tracer.start_as_current_span("api.flags.list"):
        flags = dict(get_settings().default_flags)
        rows = await session.scalars(select(FeatureFlagModel).order_by(FeatureFlagModel.name.asc()))
        for row in rows:
            flags[row.name] = row.enabled
        return flags


@admin_router.get("", response_model=list[FeatureFlagRead], summary="List feature flags")
async def admin_list_flags(session: AsyncSession = Depends(get_session)) -> list[FeatureFlagRead]:
    with tracer.start_as_current_span("admin.flags.list"):
        rows = await session.scalars(select(FeatureFlagModel).order_by(FeatureFlagModel.name.asc()))
        return [FeatureFlagRead.model_validate(row) for row in rows]


@admin_router.post(
    "",
    response_model=FeatureFlagRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a feature flag",
)
async def admin_create_flag(
    payload: FeatureFlagCreate,
    session: AsyncSession = Depends(get_session),
) -> FeatureFlagRead:
    with tracer.start_as_current_span("admin.flags.create"):
        _validate_name(payload.name)
        row = FeatureFlagModel(
            name=payload.name,
            enabled=payload.enabled,
            description=payload.description,
        )
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return FeatureFlagRead.model_validate(row)


@admin_router.patch("/{name}", response_model=FeatureFlagRead, summary="Update a feature flag")
async def admin_update_flag(
    name: str,
    payload: FeatureFlagUpdate,
    session: AsyncSession = Depends(get_session),
) -> FeatureFlagRead:
    with tracer.start_as_current_span("admin.flags.update"):
        row = await session.get(FeatureFlagModel, name)
        if row is None:
            raise HTTPException(status_code=404, detail="Feature flag not found.")
        updates = payload.model_dump(exclude_none=True)
        for field, value in updates.items():
            setattr(row, field, value)
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return FeatureFlagRead.model_validate(row)


@admin_router.delete("/{name}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a feature flag")
async def admin_delete_flag(
    name: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    with tracer.start_as_current_span("admin.flags.delete"):
        row = await session.get(FeatureFlagModel, name)
        if row is None:
            raise HTTPException(status_code=404, detail="Feature flag not found.")
        await session.delete(row)
        await session.commit()
