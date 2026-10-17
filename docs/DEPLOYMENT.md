# Deploying the portals

Production ships as **four Docker images**, one per portal, all built from the
same `Dockerfile`.

| Image                 | Serves        | Domain root `/` goes to | Sign-in page |
| --------------------- | ------------- | ----------------------- | ------------ |
| `safepickup-admin`    | `/admin/*`    | `/admin`                | `/login`     |
| `safepickup-staff`    | `/staff/*`    | `/staff`                | `/login`     |
| `safepickup-business` | `/business/*` | `/business`             | `/login`     |
| `safepickup-tv`       | `/tv/*`       | `/tv/login`             | `/tv/login`  |

Each image contains only its own portal. `scripts/build-portal.ts` removes the
other three before `next build`, and the image build fails if any of their
code still ends up in the bundle. Asking one image for another portal's path
returns 404.

## How requests flow

```
browser ──▶ portal container ──▶ BACKEND_API_URL
            (/api/* proxied server-side)
```

The browser only ever talks to its own portal's domain. Every API call goes
to that container's `/api/*`, which forwards it to `BACKEND_API_URL`. So:

- the backend needs **no CORS setup** for the portal domains, and its URL is
  never exposed to the browser;
- each container needs **outbound** access to the backend.

## Build

```bash
# All four (linux/amd64, named safepickup-<portal>:latest)
docker compose -f docker-compose.portals.yml build

# One portal
docker compose -f docker-compose.portals.yml build admin
# …or without compose
docker build --build-arg PORTAL=admin -t safepickup-admin .

# Tag for a registry and push
IMAGE_PREFIX=<registry>/safepickup TAG=v1.0.0 \
  docker compose -f docker-compose.portals.yml build --push
```

Images default to `linux/amd64`, the architecture servers run. On an Apple
Silicon Mac, `PLATFORM=linux/arm64` builds faster for local-only use. An arm64
image pushed to an amd64 server fails with `exec format error`.

The only build-time setting is `NEXT_PUBLIC_APP_NAME` (build arg, default
`SafePickup`). Everything else is read at runtime, so one image runs against
dev, UAT or production.

## Run

| Variable                 | Required | Default | Purpose                                                        |
| ------------------------ | -------- | ------- | -------------------------------------------------------------- |
| `BACKEND_API_URL`        | yes      | —       | Backend every `/api/*` call is forwarded to. Empty = every API call returns 503. |
| `BACKEND_API_TIMEOUT_MS` | no       | `15000` | Timeout for each forwarded call.                               |
| `BACKEND_API_TOKEN`      | no       | —       | Sent as `Authorization: Bearer …` on forwarded calls.          |
| `PORT`                   | no       | `3000`  | Port the server listens on.                                    |

- Listens on **port 3000**, runs as the non-root `node` user.
- **Stateless.** Sessions live in the browser (JWT). Run as many replicas as
  you like, with no volumes and no sticky sessions.
- **Health check:** `GET /` answers `307` without calling the backend, so a
  backend outage doesn't get the portal restarted. The image's own
  `HEALTHCHECK` uses it; point a platform's liveness/readiness probe at the
  same path and treat any status below 500 as healthy.
- About 280 MB per image (Node 22 slim plus the traced server).

Smoke-test all four locally (ports 3001–3004):

```bash
BACKEND_API_URL=https://api-dev.studentpickup.app \
  docker compose -f docker-compose.portals.yml up
```

## Domains

One domain per image, with TLS terminated at the load balancer or ingress, for
example:

| Domain                | Image                 |
| --------------------- | --------------------- |
| `admin.<domain>`      | `safepickup-admin`    |
| `staff.<domain>`      | `safepickup-staff`    |
| `business.<domain>`   | `safepickup-business` |
| `tv.<domain>`         | `safepickup-tv`       |

## Still to decide before go-live

- **Registry** the images are pushed to, and **where they run**.
- **Domains** for the four portals.
- **Production backend URL.** `api.safepickup.com` is not deployed yet;
  `api-dev.studentpickup.app` is the live dev backend.
- **CI.** Build and push on a tag (or on `main`) once the registry is known.

## Verified (2026-10-17)

- All four images build for linux/amd64, and each passes the
  cross-portal leak check.
- Run against the backend, each container redirects `/` to its entry,
  serves its own pages and static assets, 404s on other portals, proxies
  `/api/*` (backend answers 401 unauthenticated), and reports `healthy`.
- Signed in through the admin and staff containers. Student CRM and the
  pickup board load real data.
