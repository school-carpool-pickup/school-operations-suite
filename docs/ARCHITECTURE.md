# Architecture

Deep-dive companion to [`CLAUDE.md`](../CLAUDE.md). Read CLAUDE.md first.

## Layer diagram

```
                ┌────────────────────────────────────────────┐
                │  Pages (src/app/(portals)/...)             │
                │  Server components → getApi(key)           │
                │  Client components → useApi(key)           │
                └──────────────┬─────────────────────────────┘
                               │
                               │  apiKeys.X.Y()  ← typed keys
                               ▼
        ┌──────────────────────────────────────────────┐
        │  src/lib/api                                 │
        │   ├ client.ts        axios baseURL=/api      │
        │   ├ use-api.ts       useApi / useApiMutation │
        │   ├ get-api.ts       getApi (server-only)    │
        │   └ keys.ts          apiKeys registry        │
        └──────────────┬───────────────────────────────┘
                       │
            (HTTP)     │     (in-process)
                       ▼
        ┌──────────────────────────────────────────────┐
        │  src/app/api/[...path]/route.ts              │
        │  Thin catch-all → dispatch()                 │
        └──────────────┬───────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────────┐
        │  src/server/dispatch.ts                      │
        │  Proxies every request to the backend        │
        └──────────────────────┬───────────────────────┘
                               │
                             proxy
                               ▼
                    src/server/upstream.ts
                    axios → BACKEND_API_URL
                    + /api + path  (1:1)
```

## Pure passthrough

Concrete example. Client calls `useApi(apiKeys.auth.me())`:

1. `apiKeys.auth.me()` → `{ path: '/v1/auth/me' }`
2. `apiClient.get('/v1/auth/me')` (baseURL=`/api`) → fetches `/api/v1/auth/me`
3. `src/app/api/[...path]/route.ts` catches it, captures `path=['v1','auth','me']`
4. `dispatch({ method: 'GET', path: '/v1/auth/me', ... })` forwards to
   `BACKEND_API_URL/api/v1/auth/me` with the same method, query string, body,
   and forwardable headers (cookies, Authorization, etc) —
   `validateStatus: () => true` so upstream's status code is returned
   unchanged.

No per-endpoint server code. Adding `/v1/orders/by-day` to the backend needs
ZERO changes here — the client just calls it.

## Types vs. inline interfaces

Every domain type lives in `src/types/<domain>.ts` and is re-exported from the
barrel `src/types/index.ts`. Pages import via `@/types` — always the canonical
definition, never an inline interface.

Status / role values are **`as const` objects + union types**, not TS `enum`:

```ts
export const PickupStatus = { Queued: 'Queued', ... } as const;
export type PickupStatus = typeof PickupStatus[keyof typeof PickupStatus];
```

This works with JSON, has zero runtime cost, and keeps type widening sane.

## State

- **Sync, app-wide:** Zustand stores in `src/hooks/use-*-store.ts`.
- **Async, server data:** React Query — *only* via `useApi` / `useApiMutation`.
  Don't call `useQuery` directly in pages; the wrapper enforces `apiKeys`
  and a single axios pipeline.

## No mock layer

There are no fixtures and no mock DB. Every call proxies to `BACKEND_API_URL`.
If a backend endpoint isn't shipped yet, the page renders the shared
`NotConnected` empty state instead of calling it — never fake the data. When
the backend adds an endpoint, add the `apiKeys` factory and call it; nothing
else changes.

## Auth

`/v1/auth/me` is served by the real backend with cookie-based sessions; the
proxy forwards cookies automatically. `useAuthStore` (Zustand) holds
session-derived UI state separately.

## Adding a new domain (checklist)

- [ ] `src/types/<domain>.ts` — interfaces + enums (re-export from `types/index.ts`)
- [ ] `src/lib/api/keys.ts` — `apiKeys.<domain>.X()` factories with `/v1/...` paths
- [ ] **If backend is live:** that's it. `useApi` / `getApi` work.
- [ ] **If backend isn't live yet:** render `NotConnected` on the page instead of calling the endpoint — no fixtures.

## Per-portal production builds

### Why split

Each portal will ship to its own domain (`admin.safepickup.com`,
`staff.safepickup.com`, …). The deploy artifact for one portal must not
contain another portal's pages — both for bundle hygiene and for not
exposing routes that aren't part of that audience.

### Strategy

We don't split into a monorepo. The codebase stays single — types, components,
hooks, the API router, i18n messages are all shared. The split happens
**only at production build time** via filesystem stash:

```
                                            BUILD_PORTAL=admin
                                                    ↓
src/app/(portals)/admin/      ←── kept
src/app/(portals)/staff/      ──→ .build-stash/...   (moved out for the build)
src/app/(portals)/business/   ──→ .build-stash/...
src/app/(portals)/tv/         ──→ .build-stash/...
src/app/page.tsx              ──→ .build-stash/...   (replaced by `/` → `/admin` redirect)
src/app/login/page.tsx        ←── kept (admin/staff/business share /login)

next build                      → .next-admin/  (distDir set in next.config.ts)
                                   .next-admin/standalone/server.js  ← deploy this

restore stashed files           ← always (try/finally + signal traps + crash recovery)
```

### Files involved

| File | Role |
|------|------|
| `scripts/build-portal.ts` | Orchestrator — stash, build, verify, sizes |
| `next.config.ts` | Reads `BUILD_PORTAL`; sets `distDir`, `output: 'standalone'`, `redirects()` |
| `package.json` | `build:<portal>`, `start:<portal>`, `build:verify`, `build:sizes` |

### Safety nets

- **try/finally** restores stashed files after each build, success or fail.
- **SIGINT/SIGTERM traps** restore on Ctrl+C.
- **Crash recovery** at script startup walks `.build-stash/` from a previous
  SIGKILL'd run and moves files back before doing anything else.
- **tsconfig snapshot** — Next mutates `tsconfig.json` during build to add
  the new `distDir`'s types. The script snapshots and restores so the
  dev tsconfig stays clean and successive portal builds don't accumulate
  cross-portal type conflicts.

### Verification

`bun run build:verify <portal>` greps the dist for `(portals)/<other>/`
references. After every per-portal build, run this — should be:

```
✓ no `staff` references
✓ no `business` references
✓ no `tv` references
```

### Bundle sizes (after first run)

```
admin      total ~48 MB    standalone ~32 MB
staff      total ~45 MB    standalone ~32 MB
business   total ~46 MB    standalone ~32 MB
tv         total ~40 MB    standalone ~31 MB
```

The ~30 MB floor is the Node + React + Next runtime; the per-portal delta
(~1–3 MB) is the actual page code that differs.
