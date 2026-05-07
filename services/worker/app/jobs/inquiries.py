"""Inquiry PII pruning job."""

from __future__ import annotations

import logging

from sqlalchemy import text

from ._shared import session_scope

log = logging.getLogger(__name__)

_PRUNE_SQL = text(
    """
    UPDATE inquiries
    SET ip_address = NULL,
        user_agent = CASE
            WHEN user_agent IS NULL THEN NULL
            ELSE LEFT(user_agent, 64)
        END,
        updated_at = NOW()
    WHERE ip_address IS NOT NULL
      AND created_at < NOW() - INTERVAL '30 days'
    RETURNING id
    """
)


async def prune_inquiries_pii() -> dict[str, int]:
    """NULL out stored IP addresses on inquiries older than 30 days."""
    async with session_scope() as session:
        rows = (await session.execute(_PRUNE_SQL)).all()
        await session.commit()
    result = {"pruned": len(rows)}
    log.info("prune_inquiries_pii completed: %s", result)
    return result
