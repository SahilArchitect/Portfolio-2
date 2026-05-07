# syntax=docker/dockerfile:1.7
FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:0.4.27 /uv /uvx /usr/local/bin/

WORKDIR /app

# Workspace layout: copy the root + the api + the worker (api depends on neither but
# the workspace declares both, so uv resolves the lock against the full set).
COPY pyproject.toml ./
COPY README.md ./
COPY services/api/pyproject.toml services/api/pyproject.toml
COPY services/api/README.md services/api/README.md
COPY services/worker/pyproject.toml services/worker/pyproject.toml
COPY services/worker/README.md services/worker/README.md

RUN uv sync --frozen --no-install-project --package engine-room-api 2>/dev/null || \
    uv sync --no-install-project --package engine-room-api

COPY services/api ./services/api

RUN uv sync --package engine-room-api

EXPOSE 8000

CMD ["uv", "run", "--package", "engine-room-api", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
