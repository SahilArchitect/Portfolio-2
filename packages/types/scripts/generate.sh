#!/usr/bin/env bash
# Generate TypeScript types from the FastAPI Pydantic schemas.
#
# Source of truth: /services/api/app/schemas/*.py
# Output:          /packages/types/src/generated/api.ts
#
# Pipeline:
#   1. Boot the FastAPI app and read its OpenAPI schema.
#   2. Convert the schema components into TypeScript declarations.
#
# Why OpenAPI as the bridge (not direct Pydantic introspection)? It is the same
# contract the API actually serves, so consumers follow the runtime spec.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT_DIR="$ROOT/packages/types/src/generated"
OUT_FILE="$OUT_DIR/api.ts"

mkdir -p "$OUT_DIR"

PYTHON_BIN="$ROOT/.venv/bin/python"
if [ ! -x "$PYTHON_BIN" ]; then
  PYTHON_BIN="uv run python"
fi

echo "→ generating TS types from services/api OpenAPI → $OUT_FILE"
( cd "$ROOT/services/api" && $PYTHON_BIN "$ROOT/packages/types/scripts/openapi_to_ts.py" --output "$OUT_FILE" )

echo "✓ generated $OUT_FILE"
