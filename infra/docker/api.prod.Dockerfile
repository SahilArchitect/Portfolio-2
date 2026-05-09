# syntax=docker/dockerfile:1.7
# Production FastAPI image: deterministic deps, source mounted by PYTHONPATH,
# non-root runtime, and a contract healthcheck against /api/health.

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

RUN uv sync --frozen --no-dev --package engine-room-api --no-install-workspace

COPY services/api services/api

FROM python:3.12-alpine AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/services/api" \
    PORT=8000

RUN apk add --no-cache ca-certificates libpq \
    && addgroup -S -g 10001 app \
    && adduser -S -D -H -u 10001 -G app app \
    && mkdir -p /app/storage/uploads \
    && chown -R app:app /app/storage

WORKDIR /app

COPY --from=deps --chown=app:app /app/.venv /app/.venv
COPY --from=deps --chown=app:app /app/services/api /app/services/api

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=3)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
