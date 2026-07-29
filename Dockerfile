# syntax=docker/dockerfile:1

# Meticulous hosts this image for the duration of a test run, so it must be
# linux/amd64, must listen on the PORT it injects, and must answer 2xx on GET /.

FROM node:24-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set by the Meticulous workflow, unset for a real production build. The former
# marks this as a build under test; the latter turns on source maps.
ARG METICULOUS_BUILD
ARG METICULOUS_SOURCE_MAPS
ENV METICULOUS_BUILD=$METICULOUS_BUILD
ENV METICULOUS_SOURCE_MAPS=$METICULOUS_SOURCE_MAPS
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Bind to every interface, not just loopback, so the host can reach the app.
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# `output: "standalone"` emits a server plus only the node_modules it needs;
# static assets are not included in it and have to be copied alongside.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Documentation only — Meticulous injects PORT, and server.js honours it.
EXPOSE 3000

CMD ["node", "server.js"]
