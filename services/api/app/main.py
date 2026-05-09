"""FastAPI entrypoint.

Phase 1: app construction, OTel wiring, healthcheck.
Phase 2 will mount the routers under `app/api/`.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

from app.api import admin, flags, health, inquiries, metrics, now, posts, projects, resume, search
from app.api.deps import get_redis_cache
from app.api.metrics import record_api_request
from app.core.db import engine
from app.core.otel import setup_otel
from app.core.settings import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    setup_otel(settings)
    SQLAlchemyInstrumentor().instrument(engine=engine().sync_engine)
    yield
    await engine().dispose()


def create_app() -> FastAPI:
    settings = get_settings()
    upload_root = Path(settings.resume_upload_dir)
    upload_root.mkdir(parents=True, exist_ok=True)

    app = FastAPI(
        title="Engine Room API",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.api_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    FastAPIInstrumentor.instrument_app(app)
    app.mount("/uploads", StaticFiles(directory=upload_root), name="uploads")

    app.include_router(health.router)
    app.include_router(projects.public_router)
    app.include_router(posts.public_router)
    app.include_router(now.public_router)
    app.include_router(resume.public_router)
    app.include_router(inquiries.public_router)
    app.include_router(search.router)
    app.include_router(metrics.router)
    app.include_router(flags.public_router)

    app.include_router(projects.admin_router)
    app.include_router(posts.admin_router)
    app.include_router(now.admin_router)
    app.include_router(resume.admin_router)
    app.include_router(inquiries.admin_router)
    app.include_router(flags.admin_router)
    app.include_router(admin.router)

    @app.middleware("http")
    async def public_metrics_middleware(request, call_next):  # type: ignore[no-untyped-def]
        response = await call_next(request)
        if request.url.path.startswith(("/api/", "/admin/")):
            redis = get_redis_cache()
            try:
                await record_api_request(redis, request.url.path)
            finally:
                await redis.aclose()
        return response

    @app.get("/healthz")
    async def healthz() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
