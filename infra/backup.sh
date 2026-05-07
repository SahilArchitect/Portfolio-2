#!/usr/bin/env bash
set -euo pipefail

# Cron-ready Postgres backup to S3-compatible object storage.
# Required env: S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.
# Optional env: BACKUP_DATABASE_URL, DATABASE_URL, S3_ENDPOINT_URL, S3_PREFIX, AWS_REGION.

require() {
  if [[ -z "${!1:-}" ]]; then
    echo "missing required env var: $1" >&2
    exit 2
  fi
}

require S3_BUCKET
require AWS_ACCESS_KEY_ID
require AWS_SECRET_ACCESS_KEY

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump is required" >&2
  exit 2
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required" >&2
  exit 2
fi

RAW_DATABASE_URL="${BACKUP_DATABASE_URL:-${DATABASE_URL:-}}"
if [[ -z "${RAW_DATABASE_URL}" ]]; then
  echo "set BACKUP_DATABASE_URL or DATABASE_URL" >&2
  exit 2
fi

DUMP_DATABASE_URL="${RAW_DATABASE_URL/postgresql+asyncpg:\/\//postgresql:\/\/}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
PREFIX="${S3_PREFIX:-engine-room/postgres}"
PREFIX="${PREFIX%/}"
OBJECT_KEY="${PREFIX}/${STAMP}.dump"
DESTINATION="s3://${S3_BUCKET}/${OBJECT_KEY}"

AWS_ARGS=()
if [[ -n "${S3_ENDPOINT_URL:-}" ]]; then
  AWS_ARGS+=(--endpoint-url "${S3_ENDPOINT_URL}")
fi

export AWS_REGION="${AWS_REGION:-us-east-1}"

pg_dump --format=custom --no-owner --no-acl "${DUMP_DATABASE_URL}" \
  | aws "${AWS_ARGS[@]}" s3 cp - "${DESTINATION}" --content-type application/octet-stream

echo "backup uploaded: ${DESTINATION}"
