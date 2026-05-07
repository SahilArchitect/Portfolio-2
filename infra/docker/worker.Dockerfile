# syntax=docker/dockerfile:1.7
FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/services/worker:/app/services/api"

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:0.4.27 /uv /uvx /usr/local/bin/

WORKDIR /app

COPY pyproject.toml ./
COPY README.md ./
COPY services/api/pyproject.toml services/api/pyproject.toml
COPY services/api/README.md services/api/README.md
COPY services/worker/pyproject.toml services/worker/pyproject.toml
COPY services/worker/README.md services/worker/README.md

RUN uv sync --no-install-project --package engine-room-worker

# Worker depends on the api package (shared models / schemas), so copy both.
COPY services/api ./services/api
COPY services/worker ./services/worker

RUN uv sync --package engine-room-worker

CMD ["python", "-m", "app.scheduler"]
