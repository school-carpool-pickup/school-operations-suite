# Patterns Cookbook

Copy-paste recipes for common tasks. Pair with `docs/ARCHITECTURE.md`.

## 1. Fetch a list in a client component

```tsx
'use client';

import { useApi, apiKeys } from '@/lib/api';
import type { Student } from '@/types';

export function StudentList() {
  const { data, isLoading, error } = useApi<Student[]>(apiKeys.students.list());

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message={error.message} />;
  return <ul>{data?.map((s) => <li key={s.id}>{s.name}</li>)}</ul>;
}
```

## 2. Fetch in a server component

```tsx
import { getApi } from '@/lib/api/get-api';
import { apiKeys } from '@/lib/api';
import type { Student } from '@/types';

export default async function StudentsPage() {
  const students = await getApi<Student[]>(apiKeys.students.list());
  return <StudentTable rows={students} />;
}
```

## 3. Mutation (create / update / delete)

```tsx
'use client';

import { useApiMutation, apiKeys } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export function CreateStudentButton() {
  const qc = useQueryClient();
  const create = useApiMutation<Student, StudentInput>(
    (input) => ({ ...apiKeys.students.list(), method: 'POST', body: input }),
    { onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }) },
  );

  return (
    <Button
      onClick={() => create.mutate({ name: '...', email: '...', grade: '...', teacher: '...', family: '...' })}
      disabled={create.isPending}
    >
      Create
    </Button>
  );
}
```

> Better long-term: add a dedicated `apiKeys.students.create(input)` factory
> so callers don't manually compose `method`/`body`.

## 4. Filtered list with query params

```tsx
const { data } = useApi<Pickup[]>(apiKeys.pickups.list({ status: 'Ready', lane: 'Lane A' }));
```

The proxy forwards the query string to the upstream verbatim. While the
backend isn't ready, the matching fixture in `src/mocks/fixtures.ts` reads
`ctx.query` (a `URLSearchParams`) directly.

## 5. Adding an enum value

Add it to `src/types/enums.ts`:

```ts
export const PickupStatus = {
  ...,
  RescheduleRequested: 'Reschedule Requested',
} as const;
```

Then use it as `PickupStatus.RescheduleRequested` everywhere — never the
literal string.

## 6. Sharing UI

Before building a new component, check `src/components/shared/`:

- `CRMFilterBar` — filter dropdowns row
- `CRMField` — generic form field (text/email/switch/checkbox/select/textarea/date/file)
- `CRMTableWrapper` — table shell
- `CRMStatCards` — stat tiles
- `MockMap` — placeholder map

shadcn primitives are in `src/components/ui/`. Add new shared components
under `src/components/shared/` once they're reused in 2+ places.

## 7. Switching a domain from mock to real

Zero code changes. Only env.

```bash
# .env.local
BACKEND_API_URL=https://api-dev.studentpickup.app
API_MODE=mock
# Flip just one domain to live; everything else stays on mock fixtures:
API_REAL_DOMAINS=students
```

After restart, every `/api/v1/students/...` request goes upstream:

```
client GET /api/v1/students/s1
  → catch-all
  → dispatch (domain='students' → not in mock list, in real list)
  → upstream.get('/api/v1/students/s1')
  → https://api-dev.studentpickup.app/api/v1/students/s1
```

Cookies, Authorization, and other forwardable headers ride along. The
upstream's status code is returned to the client unchanged. `staff`,
`families`, etc. continue to use fixtures until you flip them too.

When the whole backend is live, switch globally:

```bash
API_MODE=real        # forwards every domain
API_REAL_DOMAINS=    # (empty)
```

…and start deleting fixture entries.

## 7a. Adding a fixture for an unfinished endpoint

```ts
// src/mocks/fixtures.ts
{
  method: 'GET',
  path: '/v1/things/:id',
  handler: async ({ params }) => {
    const t = mockDB.things.find((t) => t.id === params.id);
    if (!t) throw new FixtureNotFoundError(`Thing ${params.id}`);
    return t;
  },
},
```

That's the entire change. Static paths (e.g. `/v1/things/stats`) must come
**before** their dynamic siblings (`/v1/things/:id`) so they win the
first-match lookup.

## 8. Server-only utilities

Anything that imports `@/server/*` should be referenced only from:

- `src/app/api/[...path]/route.ts`
- `src/lib/api/get-api.ts`
- server components

`get-api.ts` has `import 'server-only'` at the top so accidental client-side
imports fail at build time. If you create new server utils, do the same.

## 9. i18n — translating a string

Default locale is `th`; `en` is the fallback. Every user-facing string lives
in `src/messages/{th,en}.json` under a namespace.

**Client component:**

```tsx
'use client';
import { useTranslations } from 'next-intl';

export function MyButton() {
  const t = useTranslations('Admin.Students');
  return <button type="button">{t('saveChanges')}</button>;
}
```

**Server component:**

```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('Admin.Students');
  return <h1>{t('title')}</h1>;
}
```

**Adding a key:** edit *both* JSON files in lockstep. Mismatched keys cause
runtime errors when the user switches locale.

```json
// en.json
"Admin": { "Students": { "saveChanges": "Save Changes" } }

// th.json
"Admin": { "Students": { "saveChanges": "บันทึกการเปลี่ยนแปลง" } }
```

**Interpolation:**

```json
"welcome": "Hello {name}"
```
```tsx
t('welcome', { name: user.name });
```

**Plurals:**

```json
"items": "{count, plural, =0 {No items} one {# item} other {# items}}"
```

**Rich markup** (anchors, `<strong>`, etc.):

```tsx
t.rich('confirmRemoval', {
  name: 'Khun Somchai',
  strong: (chunks) => <strong>{chunks}</strong>,
});
```

**Switching locale:** `<LocaleSwitcher />` is already mounted in `PortalShell`
and the landing/login pages. It calls the `setLocaleCookie` server action and
refreshes the route.

**What NOT to translate:**
- Mock data values (real names, phone numbers, plates)
- CSS class names, IDs, hrefs
- Status enum string values (the underlying data — translate the *display label* via separate keys instead)
- Brand names ("SafePickup")
- Display tokens that are intentionally always English (e.g. TV gate badges
  `PREPARING`, `CARPOOL` — short uppercase reads better at distance)

## 10. Adding a new locale

1. Add `'fr'` (or whatever) to `locales` in `src/i18n/config.ts` + entries in
   `localeNames` and `localeShortLabels`.
2. Create `src/messages/fr.json` mirroring `en.json`'s structure.
3. The `LocaleSwitcher` and request handler pick it up automatically.
