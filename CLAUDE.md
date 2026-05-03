# SafePickup — Architecture & Working Rules

This file is loaded into every Claude Code session. Read it first.
Deep-dive docs live in `docs/ARCHITECTURE.md` and `docs/PATTERNS.md`.

## Product context

SafePickup is the **back-office** for a school car-pool / pickup product.
Mobile (parents/guardians) is a separate app — **out of scope** here.

This repo ships **4 portals** as one Next.js 15 App Router app
(each portal is its own subtree and may be deployed to its own domain).

| Portal       | Route       | Theme   | Audience                        |
| ------------ | ----------- | ------- | ------------------------------- |
| Admin        | `/admin`    | Purple  | School admins (CRM, settings)   |
| Staff        | `/staff`    | Blue    | School staff (pickup board)     |
| Business     | `/business` | Orange  | Internal ops (analytics, BLE, payouts) |
| TV Display   | `/tv`       | Dark    | TVs at school gates (full-screen, no chrome) |

The active portal is registered in [`src/config/portals.ts`](src/config/portals.ts).
TV uses `layout: 'fullscreen'` (no `PortalShell`); the others use `layout: 'shell'`.

## Critical rules

1. **Transparent proxy.** The catch-all at `src/app/api/[...path]/route.ts`
   forwards every request 1:1 to `BACKEND_API_URL + /api + path`. There is
   no per-endpoint code on our side. **Never** add a `route.ts` under
   `src/app/api/*` for individual endpoints.
2. **Fixtures only while backend is unfinished.** When a backend endpoint
   isn't shipped yet, add an entry to `src/mocks/fixtures.ts`. As soon as
   the backend ships that path, delete the fixture or flip its domain via
   `API_REAL_DOMAINS` in `.env.local`.
3. **Dark mode is OFF.** Use `bg-white`, `bg-zinc-50`. Themes are scoped via
   `theme-admin` / `theme-staff` / `theme-business` / `theme-tv` wrappers.
4. **`use client` only when needed.** Default to server components.

## Source-of-truth map

| Concern         | Single source                              |
| --------------- | ------------------------------------------ |
| Types           | `src/types/` (barrel: `@/types`)           |
| Enums / unions  | `src/types/enums.ts`                       |
| API catch-all   | `src/app/api/[...path]/route.ts`           |
| API dispatcher  | `src/server/dispatch.ts` (mock or proxy)   |
| API keys (FE)   | `src/lib/api/keys.ts` → `apiKeys.X`        |
| Client fetching | `useApi(key)` / `useApiMutation(factory)`  |
| Server fetching | `getApi(key)` (`@/lib/api/get-api`)        |
| Mock data       | `src/mocks/db.ts`, `src/mocks/fixtures.ts` |
| Env (server)    | `src/server/env.ts` (zod-validated)        |
| Upstream client | `src/server/upstream.ts` (axios)           |
| Portal config   | `src/config/portals.ts`                    |
| Site config     | `src/config/site.ts`                       |
| Global state    | `src/hooks/use-app-store.ts` (Zustand)     |
| Auth state      | `src/hooks/use-auth-store.ts` (Zustand)    |
| Async state     | React Query (provider in `src/lib/query-provider.tsx`) |
| Shared UI       | `src/components/shared/` and `ui/`         |
| Layout shell    | `src/components/layout/PortalShell.tsx`    |
| i18n config     | `src/i18n/config.ts` (locales, default)    |
| i18n messages   | `src/messages/{th,en}.json`                |
| Locale switch   | `src/components/shared/LocaleSwitcher.tsx` |

## How to add a new endpoint

If the backend already serves it: **just call it.** No server-side code.

1. Add a key factory in `src/lib/api/keys.ts`:
   ```ts
   things: { list: () => ({ path: '/v1/things', queryKey: ['things','list'] }) }
   ```
2. Use from a page:
   ```ts
   const { data } = useApi<Thing[]>(apiKeys.things.list());        // client
   const data = await getApi<Thing[]>(apiKeys.things.list());      // server
   ```

The catch-all proxies `/api/v1/things` → `BACKEND_API_URL/api/v1/things`.

If the backend hasn't shipped it yet, also add a fixture so dev keeps
working — append one entry to `src/mocks/fixtures.ts`:

```ts
{
  method: 'GET',
  path: '/v1/things',
  handler: async () => mockDB.things,
},
```

Delete the fixture (or flip the domain via `API_REAL_DOMAINS=things` in
`.env.local`) once the backend is live. Pages don't change.

## How to add a new page

1. Place it under `src/app/(portals)/<portal>/<path>/page.tsx`.
2. If it's interactive, mark `'use client'` at the top — otherwise leave it as a server component and use `getApi`.
3. Pull data via `useApi` / `getApi`. Don't import from `@/mocks/services/*` in new code.
4. Reuse `CRMTableWrapper`, `CRMFilterBar`, `CRMField`, `CRMStatCards`, `MockMap` from `src/components/shared/`.
5. If new types are needed, add them under `src/types/` and re-export from `src/types/index.ts`. Never inline a domain type.
6. **Localise every UI string.** Add keys to both `src/messages/th.json` and `src/messages/en.json` under the matching namespace (`Admin.<Page>.*`, `Business.<Page>.*`, etc.). Use `useTranslations('Admin.MyPage')` (client) or `getTranslations('Admin.MyPage')` (server).

## How to add a new portal

1. Add an entry to `portals` in [`src/config/portals.ts`](src/config/portals.ts) with `id`, `name`, `basePath`, `themeClass`, `layout`, `navItems`.
2. Add the theme block in `src/app/globals.css`.
3. Create `src/app/(portals)/<portal>/layout.tsx` that wraps children with `<PortalShell portalId="..." />` (skip for `fullscreen` portals).
4. Add the portal card on the landing page (`src/app/page.tsx`).

## Environment variables

Server-side env is validated by **zod** at startup (`src/server/env.ts`) — the
process refuses to boot on a malformed `.env`. Never read `process.env`
directly in handler code; always go through `env`.

Local: copy `.env.example` to `.env.local` and edit. Production: inject via
the platform (Vercel, Docker secrets, etc).

| Variable                | Purpose |
|-------------------------|---------|
| `BACKEND_API_URL`       | Real upstream backend (e.g. `https://api-dev.studentpickup.app`). Empty = mock-only. |
| `BACKEND_API_TIMEOUT_MS`| Axios timeout for upstream calls (default `15000`). |
| `BACKEND_API_TOKEN`     | Optional bearer token forwarded as `Authorization: Bearer <token>`. |
| `API_MODE`              | `mock` (default) or `real` — global default for handlers. |
| `API_REAL_DOMAINS`      | CSV of domain keys forced to `real` (e.g. `students,staff`). |
| `API_MOCK_DOMAINS`      | CSV forced to `mock`. |
| `NEXT_PUBLIC_APP_NAME`  | Client-readable app name. |

Precedence inside `dispatch()`: `API_REAL_DOMAINS` > `API_MOCK_DOMAINS` >
empty `BACKEND_API_URL` (forces mock) > `API_MODE`.

The "domain" key is the first non-version segment of the path. So
`/v1/auth/me` → `auth`, `/v1/students/s1` → `students`,
`/v1/tv/schools/.../queue` → `tv`.

## Tech stack

- **Next.js 16.x** App Router (read `node_modules/next/dist/docs/` if APIs feel unfamiliar — this Next has breaking changes vs older training data).
- **React 19**, **TypeScript strict**.
- **Tailwind v4** + **shadcn/ui** (primitives in `src/components/ui/`).
- **State:** Zustand (sync), React Query v5 (async).
- **HTTP client:** axios via `apiClient` (`src/lib/api/client.ts`). Never new up `axios` directly in components.
- **Forms:** react-hook-form + zod (resolvers).
- **Icons:** lucide-react.
- **i18n:** `next-intl` with cookie-based locale (`NEXT_LOCALE`). Locales: `th`
  (default) and `en`. Messages live in `src/messages/{th,en}.json`. Switching
  is via `<LocaleSwitcher />` (already mounted in `PortalShell` + landing/login).

## Aesthetic bar

"Vibrant colors, glassmorphism, dynamic animations." This is a **demo-grade**
product, not a basic MVP. Polished hover states, generous spacing, professional
density. When in doubt, lean visual.

## Tooling

```bash
bun run dev          # Next dev server (all 4 portals served from one app)
bun run typecheck    # tsc --noEmit
bun run lint         # biome check
bun run lint:fix     # biome check --write
bun run format       # biome format --write
bun run test         # vitest run (CI/manual)
bun run check        # typecheck + lint + test
```

**Pre-commit** runs `lint-staged` (biome --write on staged files) + `typecheck`.
Tests are NOT run on pre-commit (too slow); run them manually or in CI.

## Production builds (per portal)

Each portal ships as **its own deploy artifact** so admin's bundle never
contains business/staff/tv code. Dev is unchanged: `bun dev` still serves
everything from one app.

```bash
bun run build:admin      # → .next-admin/   (only /admin/* + /api + /login)
bun run build:staff      # → .next-staff/
bun run build:business   # → .next-business/
bun run build:tv         # → .next-tv/      (only /tv/*)
bun run build:portals    # all four, sequentially
bun run build:verify <portal>   # grep dist for cross-portal leakage
bun run build:sizes      # report total + standalone bundle size per portal
```

How it works (see `scripts/build-portal.ts`):
- Stash other portals' directories (`src/app/(portals)/<other>` and the shared
  landing page) into `.build-stash/`, set `BUILD_PORTAL=<id>`, run `next build`,
  then restore. A startup recovery pass restores leftovers from a SIGKILL'd run.
- `next.config.ts` reads `BUILD_PORTAL` and switches to `distDir: .next-<id>`,
  `output: 'standalone'`, plus a `/` → `/<id>` redirect so the deployed
  domain (e.g. `admin.safepickup.com/`) lands in the right portal.
- Each `.next-<id>/standalone/server.js` is a self-contained Node server
  ready to drop into a container or PaaS.

Run after build to confirm no cross-portal references in the dist:
```bash
bun run build:verify admin    # ✓ no `staff` references, ✓ no `business`, ✓ no `tv`
```

To run a built portal locally:
```bash
bun run start:admin           # serves .next-admin/
```

## Things to avoid

- ❌ Importing from `@/mocks/services/*` in new code (legacy only). Use `useApi` / `getApi`.
- ❌ Creating new files under `src/app/api/`. The catch-all is the only entry.
- ❌ Per-endpoint server handlers. The proxy is transparent; if the backend
  has it, just add the key. For unfinished backends, append to `fixtures.ts`.
- ❌ Inline `interface Student { ... }` in pages — import from `@/types`.
- ❌ Hard-coded status strings like `'Ready for Pickup'` — use enums from `@/types/enums.ts`.
- ❌ Direct `axios.get('/something')` — go through `useApi` / `apiClient`.
- ❌ Hard-coded UI strings — every user-facing literal goes through `t('Namespace.key')`. Add to `src/messages/th.json` AND `src/messages/en.json`.
- ❌ Using `bg-zinc-900` or otherwise re-introducing dark mode.
- ❌ Editing `next.config.ts` or `tsconfig.json` casually — flag the change.

## Repo conventions

- **Imports** ordered automatically by Biome (`assist.actions.source.organizeImports`).
- **Indent** 2 spaces, single quotes (Biome config).
- **Component files**: `PascalCase.tsx`. **Hooks**: `use-kebab-case.ts`. **Utility**: `kebab-case.ts`.
- **Path alias**: `@/*` → `src/*`.
- **No emoji** in code/docs unless the user asked.
