# ruff: noqa: B008
"""Now-entries router."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from opentelemetry import trace
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session, require_admin
from app.db.models import NowEntry
from app.schemas.now_entry import NowEntryCreate, NowEntryRead, NowEntryUpdate

tracer = trace.get_tracer(__name__)

public_router = APIRouter(prefix="/api/now", tags=["now"])
admin_router = APIRouter(
    prefix="/admin/now-entries",
    tags=["admin:now-entries"],
    dependencies=[Depends(require_admin)],
)


# ── Public ──────────────────────────────────────────────────────────────────

@public_router.get("", response_model=NowEntryRead)
async def get_current_now(session: AsyncSession = Depends(get_session)) -> NowEntryRead:
    with tracer.start_as_current_span("api.now.get"):
        stmt = select(NowEntry).where(NowEntry.is_current == True).limit(1)  # noqa: E712
        row = await session.scalar(stmt)
        if row is None:
            raise HTTPException(status_code=404, detail="No current now entry.")
        return NowEntryRead.model_validate(row)


# ── Admin ────────────────────────────────────────────────────────────────────

@admin_router.get("", response_model=list[NowEntryRead])
async def admin_list_now_entries(session: AsyncSession = Depends(get_session)) -> list[NowEntryRead]:
    with tracer.start_as_current_span("admin.now.list"):
        rows = await session.scalars(select(NowEntry).order_by(NowEntry.posted_at.desc()))
        return [NowEntryRead.model_validate(r) for r in rows]


@admin_router.post("", response_model=NowEntryRead, status_code=status.HTTP_201_CREATED)
async def admin_create_now_entry(
    payload: NowEntryCreate,
    session: AsyncSession = Depends(get_session),
) -> NowEntryRead:
    with tracer.start_as_current_span("admin.now.create"):
        if payload.is_current:
            # Enforce at most one current entry.
            await session.execute(
                update(NowEntry).where(NowEntry.is_current == True).values(is_current=False)  # noqa: E712
            )
        entry = NowEntry(
            headline=payload.headline,
            body_md=payload.body_md,
            mood=payload.mood,
            is_current=payload.is_current,
        )
        session.add(entry)
        await session.commit()
        await session.refresh(entry)
        return NowEntryRead.model_validate(entry)


@admin_router.get("/{entry_id}", response_model=NowEntryRead)
async def admin_get_now_entry(
    entry_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> NowEntryRead:
    with tracer.start_as_current_span("admin.now.get"):
        row = await session.get(NowEntry, entry_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Now entry not found.")
        return NowEntryRead.model_validate(row)


@admin_router.patch("/{entry_id}", response_model=NowEntryRead)
async def admin_update_now_entry(
    entry_id: UUID,
    payload: NowEntryUpdate,
    session: AsyncSession = Depends(get_session),
) -> NowEntryRead:
    with tracer.start_as_current_span("admin.now.update"):
        row = await session.get(NowEntry, entry_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Now entry not found.")
        if payload.is_current:
            await session.execute(
                update(NowEntry)
                .where(NowEntry.is_current == True, NowEntry.id != entry_id)  # noqa: E712
                .values(is_current=False)
            )
        updates = payload.model_dump(exclude_none=True)
        for field, value in updates.items():
            setattr(row, field, value)
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return NowEntryRead.model_validate(row)


@admin_router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_now_entry(
    entry_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> None:
    with tracer.start_as_current_span("admin.now.delete"):
        row = await session.get(NowEntry, entry_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Now entry not found.")
        await session.delete(row)
        await session.commit()
