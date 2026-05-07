# Infra

Production and local deployment artifacts for The Engine Room.

## Local data services

```bash
cp infra/.env.example .env
docker compose -f infra/docker-compose.yml up -d postgres redis
```

## Production compose

```bash
cp infra/.env.production.example infra/.env.production
# edit infra/.env.production with real domains/secrets
docker compose --env-file infra/.env.production -f infra/docker-compose.prod.yml up -d --build
```

Services exposed publicly: Caddy only (`80`, `443`). API, worker, Postgres, Redis, OTel collector, web, and admin stay on the internal Docker network.

## Fly.io

Configs live in `infra/fly/`:

```bash
fly apps create engine-room-api
fly apps create engine-room-web
fly apps create engine-room-admin
fly postgres create --name engine-room-db --region sjc --volume-size 10
fly postgres attach --app engine-room-api engine-room-db
fly deploy --config infra/fly/api.fly.toml --remote-only
fly deploy --config infra/fly/web.fly.toml --remote-only
fly deploy --config infra/fly/admin.fly.toml --remote-only
```

Set runtime secrets with `fly secrets set --app <app> KEY=value` before deploying production traffic.

## Operations

```bash
uv run python infra/seed.py
infra/backup.sh
```

`infra/seed.py` is idempotent and uses asyncpg directly. `infra/backup.sh` streams `pg_dump --format=custom` to S3-compatible storage.
