# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Workspace manifests first for cached install.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile=false --filter @engine-room/web... --filter @engine-room/ui --filter @engine-room/types

# Source for the things we actually need to build.
COPY packages/ui packages/ui
COPY packages/types packages/types
COPY apps/web apps/web

RUN pnpm --filter @engine-room/web build

EXPOSE 3000
CMD ["pnpm", "--filter", "@engine-room/web", "start"]
