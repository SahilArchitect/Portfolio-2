"""APScheduler entrypoint.

Registers the ingestion, embedding-refresh, and privacy-pruning jobs. The
worker uses direct SQL against the same database schema as the API.
"""

from __future__ import annotations

import asyncio
import logging
import signal

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from .jobs.embeddings import refresh_embeddings
from .jobs.inquiries import prune_inquiries_pii
from .jobs.substack import ingest_substack

log = logging.getLogger("engine-room-worker")


def _build_scheduler() -> AsyncIOScheduler:
    sched = AsyncIOScheduler(timezone="UTC")
    sched.add_job(
        ingest_substack,
        trigger=CronTrigger(minute="*/30"),
        id="ingest_substack",
        replace_existing=True,
    )
    sched.add_job(
        refresh_embeddings,
        trigger=IntervalTrigger(minutes=5),
        id="refresh_embeddings",
        replace_existing=True,
    )
    sched.add_job(
        prune_inquiries_pii,
        trigger=CronTrigger(hour=3, minute=0),
        id="prune_inquiries_pii",
        replace_existing=True,
    )
    return sched


async def _run() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
    sched = _build_scheduler()
    sched.start()
    log.info("scheduler started; jobs=%s", [j.id for j in sched.get_jobs()])

    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop.set)

    await stop.wait()
    log.info("shutting down")
    sched.shutdown(wait=True)


def main() -> None:
    asyncio.run(_run())


if __name__ == "__main__":
    main()
