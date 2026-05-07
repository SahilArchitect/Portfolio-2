# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile=false --filter @engine-room/admin... --filter @engine-room/ui --filter @engine-room/types

COPY packages/ui packages/ui
COPY packages/types packages/types
COPY apps/admin apps/admin

RUN pnpm --filter @engine-room/admin build

EXPOSE 3001
CMD ["pnpm", "--filter", "@engine-room/admin", "start"]
