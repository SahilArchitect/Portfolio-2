# syntax=docker/dockerfile:1.7
# Production APScheduler worker image. The worker never serves HTTP; manual
# triggers go through the API admin endpoint by contract.

FROM python:3.12-alpine AS deps

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

RUN apk add --no-cache build-base ca-certificates curl libffi-dev openssl-dev postgresql-dev

COPY --from=ghcr.io/astral-sh/uv:0.4.27 /uv /uvx /usr/local/bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY README.md ./
COPY services/api/pyproject.toml services/api/pyproject.toml
COPY services/api/README.md services/api/README.md
COPY services/worker/pyproject.toml services/worker/pyproject.toml
COPY services/worker/README.md services/worker/README.md

RUN uv sync --frozen --no-dev --package engine-room-worker --no-install-workspace

COPY services/api services/api
COPY services/worker services/worker

FROM python:3.12-alpine AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/services/worker:/app/services/api"

RUN apk add --no-cache ca-certificates libpq \
    && addgroup -S -g 10001 app \
    && adduser -S -D -H -u 10001 -G app app

WORKDIR /app

COPY --from=deps --chown=app:app /app/.venv /app/.venv
COPY --from=deps --chown=app:app /app/services/api /app/services/api
COPY --from=deps --chown=app:app /app/services/worker /app/services/worker

USER app

CMD ["python", "-m", "app.scheduler"]
