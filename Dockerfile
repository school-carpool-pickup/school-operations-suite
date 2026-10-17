# syntax=docker/dockerfile:1.7
#
# One image per portal. The same Dockerfile builds all four:
#
#   docker build --build-arg PORTAL=admin    -t safepickup-admin .
#   docker build --build-arg PORTAL=staff    -t safepickup-staff .
#   docker build --build-arg PORTAL=business -t safepickup-business .
#   docker build --build-arg PORTAL=tv       -t safepickup-tv .
#
# (`docker compose -f docker-compose.portals.yml build` does all four.) Each image carries only its own
# portal's pages — `scripts/build-portal.ts` stashes the other portals before
# `next build` and the build fails if any of their code leaks in.
#
# Runtime config is plain env (see docs/DEPLOYMENT.md): BACKEND_API_URL is read
# when the server starts, so one image runs against any backend. Only
# NEXT_PUBLIC_* values are baked in at build time.

ARG NODE_VERSION=22.13.1
ARG BUN_VERSION=1.3.12

FROM oven/bun:${BUN_VERSION} AS bun

# ── Dependencies ────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS deps
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
# No git checkout in here, so skip the husky `prepare` hook.
ENV HUSKY=0
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Build one portal ────────────────────────────────────────────────────────
FROM deps AS build
ARG PORTAL
ARG NEXT_PUBLIC_APP_NAME=SafePickup
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
RUN case "$PORTAL" in admin|staff|business|tv) ;; \
      *) echo "Set --build-arg PORTAL=admin|staff|business|tv (got '$PORTAL')" >&2; exit 1 ;; \
    esac
COPY . .
RUN bun scripts/build-portal.ts "$PORTAL" \
 && bun scripts/build-portal.ts verify "$PORTAL"
# `standalone` holds server.js plus the traced node_modules; the static assets
# and public/ are not copied in by Next and have to be added beside it.
RUN mkdir -p /out \
 && cp -R ".next-$PORTAL/standalone/." /out/ \
 && cp -R ".next-$PORTAL/static" "/out/.next-$PORTAL/static" \
 && cp -R public /out/public

# ── Runtime ─────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ARG PORTAL
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    PORTAL=${PORTAL}
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 3000
# `/` answers with a redirect to /<portal> without touching the backend, so
# this checks the Node server alone — a backend outage doesn't restart it.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/',{redirect:'manual'}).then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
