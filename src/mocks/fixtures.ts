/**
 * Mock fixtures — used ONLY while the real backend isn't shipped.
 *
 * Each fixture is matched by `METHOD + path-with-:params`. When a fixture
 * matches, its handler returns the response body the proxy would otherwise
 * fetch from `BACKEND_API_URL`.
 *
 * As the real backend ships endpoints, delete the matching fixture entries
 * (or flip the domain via `API_REAL_DOMAINS=<domain>` in `.env.local`).
 *
 * Add a fixture by appending an entry below — no other file changes needed.
 */

import type {
  AdminFamily,
  AdminGrade,
  AdminLane,
  AdminLaneRule,
  AdminPickup,
  AdminPickupSummary,
  AdminSchoolConfig,
  AdminStudent,
  ApiEnvelope,
  LoginData,
  UserMe,
  ValidateData,
} from '@/types';
import { AdminPickupStage, envelope } from '@/types';
import { mockDB } from './db';

const V = '/v1';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface FixtureContext {
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
}

export type FixtureHandler<T = unknown> = (
  ctx: FixtureContext,
) => T | Promise<T>;

export interface FixtureDef {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  /** Optional override; defaults to first non-version path segment. */
  domain?: string;
  handler: FixtureHandler;
}
/**
 * Synthesise admin-shaped students from the existing mockDB students.
 * Splits the legacy `grade` field ("Grade 3 - 3A") into separate `grade`
 * and `section` to match the backend response.
 */
function mockAdminStudents(): AdminStudent[] {
  const SCHOOL_ID = 'bis';
  return mockDB.students.map((s) => {
    const [grade = '', section = ''] = s.grade
      .split(' - ')
      .map((p) => p.trim());
    const family = mockDB.families.find((f) =>
      f.name.toLowerCase().includes(s.family.toLowerCase()),
    );
    return {
      id: s.id,
      school_id: SCHOOL_ID,
      family_id: family?.id ?? '',
      first_name: s.name.split(' ')[0] ?? '',
      last_name: s.name.split(' ').slice(1).join(' ') || s.family,
      grade,
      section,
      school_email: s.email,
      date_of_birth: '2016-05-12',
      blood_type: 'O+',
      photo_url: '',
      preferred_gate: 'Gate A',
      photo_consent: true,
      status: s.status === 'enrolled' ? 'enrolled' : 'enrolled',
      notes: s.notes === '-' ? '' : s.notes,
    } satisfies AdminStudent;
  });
}

/**
 * Synthesise a small list of admin-shaped families so the paginated mock
 * has enough rows to exercise the UI. Built lazily so we don't pay JSON
 * costs unless the fixture is hit.
 */
function mockAdminFamilies(): AdminFamily[] {
  const SCHOOL_ID = 'bis';
  return mockDB.families.map((f, i) => ({
    id: f.id,
    family_name: f.name,
    school_id: SCHOOL_ID,
    status: f.status === 'banned' ? 'inactive' : 'active',
    joined_at: new Date(2024, 0, 1 + i).toISOString(),
    members: Array.from({ length: f.membersCount }).map((_, m) => ({
      id: `${f.id}-m${m + 1}`,
      school_id: SCHOOL_ID,
      family_id: f.id,
      first_name: m === 0 ? f.primaryContact.split(' ')[0] : `Member${m + 1}`,
      last_name: f.name.replace(/\s*Family$/, ''),
      email: `${f.id}.m${m + 1}@example.com`,
      phone: '',
      role: m === 0 ? 'primary_parent' : 'parent',
      status: 'active',
      invite_status: null,
      line_id: null,
      profile_complete: true,
      last_login: null,
      created_at: '2024-01-01T00:00:00Z',
    })),
  }));
}

/**
 * Synthesise admin-pickup rows (backend `AdminPickupListResponse` shape)
 * from the legacy mockDB.pickups entries. Newest first, mirroring the
 * real endpoint's default ordering.
 */
function mockAdminPickups(): AdminPickup[] {
  const splitName = (full: string) => {
    const [first = '', ...rest] = full.trim().split(/\s+/);
    return { first, last: rest.join(' ') };
  };
  return mockDB.pickups.map((p, i) => {
    const stage =
      p.status === 'Completed'
        ? AdminPickupStage.Completed
        : AdminPickupStage.Queued;
    return {
      id: p.id,
      pickup_code: p.id,
      stage,
      // Lowercase to match the real endpoint's labels.
      stage_label:
        stage === AdminPickupStage.Completed ? 'completed' : 'queued',
      lane: p.lane,
      vehicle: {
        id: `veh-${i + 1}`,
        license_plate: p.vehicle,
        brand: '',
        model: '',
        color: '',
        vehicle_type: p.isCarpool ? 'taxi' : 'private',
      },
      students: p.students.map((name, j) => {
        const { first, last } = splitName(name);
        return {
          id: `${p.id}-s${j + 1}`,
          first_name: first,
          last_name: last,
          grade: '',
          section: '',
        };
      }),
      family: (() => {
        const { last } = splitName(p.parent);
        return { id: `fam-${i + 1}`, family_name: last || p.parent };
      })(),
      queued_at: null,
      created_at: new Date(Date.now() - i * 15 * 60_000).toISOString(),
      updated_at: new Date(Date.now() - i * 10 * 60_000).toISOString(),
    };
  });
}

/**
 * Mutable in-memory store for the grade/lane/lane-rule mocks. The settings
 * page does CRUD against these, so we keep the running state in module
 * scope (resets on dev-server reload — fine for mock work).
 */
const mockState = (() => {
  const SCHOOL_ID = 'bis';

  const grades: AdminGrade[] = [
    { id: 1, school_id: SCHOOL_ID, name: 'Grade 1', lane_id: 1 },
    { id: 2, school_id: SCHOOL_ID, name: 'Grade 2', lane_id: 1 },
    { id: 3, school_id: SCHOOL_ID, name: 'Grade 3', lane_id: 1 },
    { id: 4, school_id: SCHOOL_ID, name: 'Grade 4', lane_id: 1 },
    { id: 5, school_id: SCHOOL_ID, name: 'Grade 5', lane_id: 2 },
    { id: 6, school_id: SCHOOL_ID, name: 'Grade 6', lane_id: 2 },
    { id: 7, school_id: SCHOOL_ID, name: 'Grade 7', lane_id: 2 },
    { id: 8, school_id: SCHOOL_ID, name: 'Grade 8', lane_id: 2 },
    { id: 9, school_id: SCHOOL_ID, name: 'Grade 9', lane_id: null },
  ];

  const lanes: AdminLane[] = [
    {
      id: 1,
      school_id: SCHOOL_ID,
      name: 'Gate A - Elementary',
      code: 'GATE-A',
    },
    {
      id: 2,
      school_id: SCHOOL_ID,
      name: 'Gate B - Middle School',
      code: 'GATE-B',
    },
  ];

  const laneRules: AdminLaneRule[] = [
    {
      id: 1,
      school_id: SCHOOL_ID,
      name: 'Oldest Child Lane Override',
      priority_type: 'oldest_child',
      is_active: true,
    },
  ];

  let nextGradeId = 10;
  let nextLaneId = 3;
  let nextLaneRuleId = 2;

  return {
    grades,
    lanes,
    laneRules,
    nextGradeId: () => nextGradeId++,
    nextLaneId: () => nextLaneId++,
    nextLaneRuleId: () => nextLaneRuleId++,
  };
})();

/** Lane → expanded grade objects, for GET-by-id eager loading. */
function expandLane(lane: AdminLane): AdminLane {
  return {
    ...lane,
    grades: mockState.grades.filter((g) => g.lane_id === lane.id),
  };
}
// In-memory set of invited admin-user emails — mirrors the backend's
// uniqueness check so a repeat POST returns code 40901 ("resource already
// exists") and the FE can exercise the localized "already invited" toast.
const invitedEmails = new Set<string>();

// Singleton school config for the mock — mirrors the backend's one row per
// school. PUT mutates it so the settings form round-trips in mock mode.
let schoolConfigState: AdminSchoolConfig = {
  school_id: 'bis',
  config: {
    geofence: 500,
    ble_beacon: 15,
    latitude: 13.7563,
    longitude: 100.5018,
  },
};

export const fixtures: readonly FixtureDef[] = [
  // ─── Auth ───────────────────────────────────────────────────────────────
  // The real backend wraps every response in `{ data, error, ... }`. Mocks
  // mirror that shape exactly so client code is identical in mock + real.
  {
    method: 'POST',
    path: `${V}/auth/login`,
    handler: async ({ body }): Promise<ApiEnvelope<LoginData>> => {
      await delay(300);
      const input = (body ?? {}) as { username?: string };
      const user =
        mockDB.users.find((u) => u.email === input.username) ?? mockDB.users[0];
      return envelope<LoginData>({
        access_token: `mock.${user.id}.${Date.now()}`,
        refresh_token: `mock-refresh.${user.id}`,
        expires_in: 60 * 60, // 1 hour
        token_type: 'Bearer',
        user_id: user.id,
        roles: [user.role],
      });
    },
  },
  {
    method: 'GET',
    path: `${V}/auth/validate`,
    handler: async (): Promise<ApiEnvelope<ValidateData>> => {
      await delay(100);
      return envelope<ValidateData>({
        valid: true,
        roles: ['owner'],
        permissions: [],
      });
    },
  },
  {
    method: 'POST',
    path: `${V}/auth/logout`,
    handler: async (): Promise<ApiEnvelope<{ ok: boolean }>> => {
      await delay(100);
      return envelope({ ok: true });
    },
  },

  // ─── Users ──────────────────────────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/users/me`,
    handler: async (): Promise<ApiEnvelope<UserMe>> => {
      await delay(150);
      return envelope<UserMe>({
        id: 'u-mock-admin',
        school_id: 'bis',
        family_id: null,
        first_name: 'Khun',
        last_name: 'Pranee',
        email: 'pranee@bis.ac.th',
        phone: '',
        role: 'admin',
        status: 'active',
        invite_status: null,
        line_id: null,
        profile_complete: true,
        last_login: new Date().toISOString(),
        created_at: '2024-01-01T00:00:00Z',
      });
    },
  },

  // NOTE (KAN-26): the flat `/v1/students*`, `/v1/staff*`, `/v1/families*`,
  // `/v1/schools*` and `/v1/pickups*` fixtures were removed together with
  // their apiKey groups — the backend never shipped those paths (its lists
  // live under `/v1/admin/*`) and nothing consumed them anymore.

  // ─── Admin → Families ───────────────────────────────────────────────────
  // Mirrors GET/PUT/POST(bulk-delete) under /api/v1/admin/families. Mock
  // returns the same envelope shape (data + page/size/total/totalPage) the
  // real backend uses, so the page works identically against either.
  {
    method: 'GET',
    path: `${V}/admin/families`,
    handler: async ({ query }): Promise<ApiEnvelope<AdminFamily[]>> => {
      await delay(400);
      const page = Math.max(1, Number(query.get('page') ?? 1));
      const size = Math.max(1, Number(query.get('size') ?? 10));
      const search = (query.get('search') ?? '').toLowerCase().trim();
      const filterField = query.get('filter_field');
      const filterValue = query.get('filter_value');

      let rows: AdminFamily[] = mockAdminFamilies();
      if (search) {
        rows = rows.filter((r) => r.family_name.toLowerCase().includes(search));
      }
      if (filterField === 'status' && filterValue) {
        rows = rows.filter((r) => r.status === filterValue);
      }

      const total = rows.length;
      const totalPage = Math.max(1, Math.ceil(total / size));
      const slice = rows.slice((page - 1) * size, page * size);

      return {
        data: slice,
        error: { code: '', message: '' },
        page,
        size,
        total,
        totalPage,
        warning: '',
      };
    },
  },
  {
    method: 'PUT',
    path: `${V}/admin/families/:id`,
    handler: async ({ body }): Promise<ApiEnvelope<string>> => {
      await delay(250);
      const input = (body ?? {}) as { family_name?: string; status?: string };
      if (!input.family_name) {
        return {
          data: '',
          error: { code: '40001', message: 'family_name is required' },
          page: 0,
          size: 0,
          total: 0,
          totalPage: 0,
          warning: '',
        };
      }
      return envelope('success');
    },
  },
  {
    method: 'POST',
    path: `${V}/admin/families/bulk-delete`,
    handler: async (): Promise<ApiEnvelope<string>> => {
      await delay(300);
      return envelope('success');
    },
  },

  // ─── Admin → Students ───────────────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/admin/students`,
    handler: async ({ query }): Promise<ApiEnvelope<AdminStudent[]>> => {
      await delay(400);
      const page = Math.max(1, Number(query.get('page') ?? 1));
      const size = Math.max(1, Number(query.get('size') ?? 10));
      const search = (query.get('search') ?? '').toLowerCase().trim();
      const filterField = query.get('filter_field');
      const filterValue = query.get('filter_value');

      let rows: AdminStudent[] = mockAdminStudents();
      if (search) {
        rows = rows.filter((r) => {
          const haystack =
            `${r.first_name} ${r.last_name} ${r.school_email} ${r.id}`.toLowerCase();
          return haystack.includes(search);
        });
      }
      if (filterField === 'grade' && filterValue) {
        rows = rows.filter((r) => r.grade === filterValue);
      }

      const total = rows.length;
      const totalPage = Math.max(1, Math.ceil(total / size));
      const slice = rows.slice((page - 1) * size, page * size);

      return {
        data: slice,
        error: { code: '', message: '' },
        page,
        size,
        total,
        totalPage,
        warning: '',
      };
    },
  },
  {
    method: 'PUT',
    path: `${V}/admin/students/:id`,
    handler: async ({ body }): Promise<ApiEnvelope<string>> => {
      await delay(250);
      const input = (body ?? {}) as { first_name?: string; last_name?: string };
      if (!input.first_name || !input.last_name) {
        return {
          data: '',
          error: { code: '40001', message: 'first_name + last_name required' },
          page: 0,
          size: 0,
          total: 0,
          totalPage: 0,
          warning: '',
        };
      }
      return envelope('success');
    },
  },
  {
    method: 'POST',
    path: `${V}/admin/students/bulk-delete`,
    handler: async (): Promise<ApiEnvelope<string>> => {
      await delay(300);
      return envelope('success');
    },
  },

  // ─── Admin → Grades ─────────────────────────────────────────────────────
  // CRUD over the in-memory mockState. Backend uses int64 IDs; the
  // dispatcher passes them through as URL strings, we coerce with Number().
  {
    method: 'GET',
    path: `${V}/admin/grades`,
    handler: async ({ query }): Promise<ApiEnvelope<AdminGrade[]>> => {
      await delay(200);
      const filter = query.get('is_unassigned');
      const isUnassigned =
        filter === '1' || filter === 'true' || filter === 'TRUE';
      let rows = mockState.grades;
      if (filter !== null) {
        rows = rows.filter((g) =>
          isUnassigned ? g.lane_id == null : g.lane_id != null,
        );
      }
      return envelope(rows);
    },
  },
  {
    method: 'GET',
    path: `${V}/admin/grades/:id`,
    handler: async ({ params }): Promise<ApiEnvelope<AdminGrade>> => {
      await delay(150);
      const id = Number(params.id);
      const grade = mockState.grades.find((g) => g.id === id);
      if (!grade) throw fixtureNotFound(`Grade ${id}`);
      return envelope(grade);
    },
  },
  {
    method: 'POST',
    path: `${V}/admin/grades`,
    handler: async ({ body }): Promise<ApiEnvelope<AdminGrade>> => {
      await delay(200);
      const input = (body ?? {}) as { name?: string };
      if (!input.name?.trim()) {
        return {
          data: { id: 0, school_id: '', name: '', lane_id: null },
          error: { code: '40001', message: 'name is required' },
          page: 0,
          size: 0,
          total: 0,
          totalPage: 0,
          warning: '',
        };
      }
      const created: AdminGrade = {
        id: mockState.nextGradeId(),
        school_id: 'bis',
        name: input.name.trim(),
        lane_id: null,
      };
      mockState.grades.push(created);
      return envelope(created);
    },
  },
  {
    method: 'PUT',
    path: `${V}/admin/grades/:id`,
    handler: async ({ params, body }): Promise<ApiEnvelope<string>> => {
      await delay(200);
      const id = Number(params.id);
      const grade = mockState.grades.find((g) => g.id === id);
      if (!grade) throw fixtureNotFound(`Grade ${id}`);
      const input = (body ?? {}) as { name?: string; lane_id?: number | null };
      if (input.name) grade.name = input.name;
      if ('lane_id' in input) grade.lane_id = input.lane_id ?? null;
      return envelope('success');
    },
  },
  {
    method: 'DELETE',
    path: `${V}/admin/grades/:id`,
    handler: async ({ params }): Promise<ApiEnvelope<string>> => {
      await delay(200);
      const id = Number(params.id);
      const idx = mockState.grades.findIndex((g) => g.id === id);
      if (idx < 0) throw fixtureNotFound(`Grade ${id}`);
      mockState.grades.splice(idx, 1);
      return envelope('success');
    },
  },

  // ─── Admin → User Invitations ───────────────────────────────────────────
  {
    method: 'POST',
    path: `${V}/admin/users/invitations`,
    handler: async ({
      body,
    }): Promise<
      ApiEnvelope<{ id: string; email: string; role: string; status: string }>
    > => {
      await delay(200);
      const input = (body ?? {}) as { email?: string; role?: string };
      const email = (input.email ?? '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return {
          data: { id: '', email: '', role: '', status: '' },
          error: { code: '40001', message: 'invalid email' },
          page: 0,
          size: 0,
          total: 0,
          totalPage: 0,
          warning: '',
        };
      }
      if (invitedEmails.has(email)) {
        return {
          data: { id: '', email: '', role: '', status: '' },
          error: { code: '40901', message: 'resource already exists' },
          page: 0,
          size: 0,
          total: 0,
          totalPage: 0,
          warning: '',
        };
      }
      invitedEmails.add(email);
      return envelope({
        id: `inv-${invitedEmails.size}`,
        email,
        role: input.role ?? 'staff',
        status: 'sent',
      });
    },
  },

  // ─── Admin → School Config ──────────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/admin/school-configs`,
    handler: async (): Promise<ApiEnvelope<AdminSchoolConfig>> => {
      await delay(150);
      return envelope(schoolConfigState);
    },
  },
  {
    method: 'PUT',
    path: `${V}/admin/school-configs`,
    handler: async ({ body }): Promise<ApiEnvelope<AdminSchoolConfig>> => {
      await delay(250);
      const input = (body ?? {}) as Partial<AdminSchoolConfig['config']>;
      schoolConfigState = {
        ...schoolConfigState,
        config: {
          geofence: input.geofence ?? schoolConfigState.config.geofence,
          ble_beacon: input.ble_beacon ?? schoolConfigState.config.ble_beacon,
          latitude: input.latitude ?? schoolConfigState.config.latitude,
          longitude: input.longitude ?? schoolConfigState.config.longitude,
        },
      };
      return envelope(schoolConfigState);
    },
  },

  // ─── Admin → Lanes ──────────────────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/admin/lanes`,
    handler: async (): Promise<ApiEnvelope<AdminLane[]>> => {
      await delay(200);
      return envelope(mockState.lanes.map(expandLane));
    },
  },
  {
    method: 'GET',
    path: `${V}/admin/lanes/:id`,
    handler: async ({ params }): Promise<ApiEnvelope<AdminLane>> => {
      await delay(150);
      const id = Number(params.id);
      const lane = mockState.lanes.find((l) => l.id === id);
      if (!lane) throw fixtureNotFound(`Lane ${id}`);
      return envelope(expandLane(lane));
    },
  },
  {
    method: 'POST',
    path: `${V}/admin/lanes`,
    handler: async ({ body }): Promise<ApiEnvelope<AdminLane>> => {
      await delay(250);
      const input = (body ?? {}) as {
        name?: string;
        code?: string;
        grade_ids?: number[];
      };
      if (!input.name?.trim() || !input.code?.trim()) {
        return {
          data: { id: 0, school_id: '', name: '', code: '' },
          error: { code: '40001', message: 'name and code are required' },
          page: 0,
          size: 0,
          total: 0,
          totalPage: 0,
          warning: '',
        };
      }
      // Mirror the backend's "all grade_ids must be currently unassigned"
      // check so the UI exercises the same conflict path.
      const conflicting = (input.grade_ids ?? []).filter((gid) => {
        const g = mockState.grades.find((x) => x.id === gid);
        return g && g.lane_id != null;
      });
      if (conflicting.length > 0) {
        return {
          data: { id: 0, school_id: '', name: '', code: '' },
          error: {
            code: '40901',
            message: `grade(s) already assigned: ${conflicting.join(', ')}`,
          },
          page: 0,
          size: 0,
          total: 0,
          totalPage: 0,
          warning: '',
        };
      }
      const created: AdminLane = {
        id: mockState.nextLaneId(),
        school_id: 'bis',
        name: input.name.trim(),
        code: input.code.trim(),
      };
      mockState.lanes.push(created);
      // Attach grades.
      for (const gid of input.grade_ids ?? []) {
        const g = mockState.grades.find((x) => x.id === gid);
        if (g) g.lane_id = created.id;
      }
      return envelope(expandLane(created));
    },
  },
  {
    method: 'PUT',
    path: `${V}/admin/lanes/:id`,
    handler: async ({ params, body }): Promise<ApiEnvelope<string>> => {
      await delay(250);
      const id = Number(params.id);
      const lane = mockState.lanes.find((l) => l.id === id);
      if (!lane) throw fixtureNotFound(`Lane ${id}`);
      const input = (body ?? {}) as {
        name?: string;
        code?: string;
        grade_ids?: number[];
      };
      if (input.name) lane.name = input.name;
      if (input.code) lane.code = input.code;
      if (input.grade_ids) {
        // Clear current grades, then re-attach the new set.
        for (const g of mockState.grades) {
          if (g.lane_id === id) g.lane_id = null;
        }
        for (const gid of input.grade_ids) {
          const g = mockState.grades.find((x) => x.id === gid);
          if (g) g.lane_id = id;
        }
      }
      return envelope('success');
    },
  },
  {
    method: 'DELETE',
    path: `${V}/admin/lanes/:id`,
    handler: async ({ params }): Promise<ApiEnvelope<string>> => {
      await delay(200);
      const id = Number(params.id);
      const idx = mockState.lanes.findIndex((l) => l.id === id);
      if (idx < 0) throw fixtureNotFound(`Lane ${id}`);
      // Orphan the grades.
      for (const g of mockState.grades) {
        if (g.lane_id === id) g.lane_id = null;
      }
      mockState.lanes.splice(idx, 1);
      return envelope('success');
    },
  },

  // ─── Admin → Lane Rules ─────────────────────────────────────────────────
  // Backend module not yet implemented (see audit). Fixtures here let the
  // UI develop in parallel; remove once the real endpoints ship.
  {
    method: 'GET',
    path: `${V}/admin/lane-rules`,
    handler: async (): Promise<ApiEnvelope<AdminLaneRule[]>> => {
      await delay(200);
      return envelope(mockState.laneRules);
    },
  },
  {
    method: 'GET',
    path: `${V}/admin/lane-rules/:id`,
    handler: async ({ params }): Promise<ApiEnvelope<AdminLaneRule>> => {
      await delay(150);
      const id = Number(params.id);
      const rule = mockState.laneRules.find((r) => r.id === id);
      if (!rule) throw fixtureNotFound(`Lane rule ${id}`);
      return envelope(rule);
    },
  },
  {
    method: 'POST',
    path: `${V}/admin/lane-rules`,
    handler: async ({ body }): Promise<ApiEnvelope<AdminLaneRule>> => {
      await delay(200);
      const input = (body ?? {}) as Partial<AdminLaneRule>;
      const willBeActive = input.is_active ?? false;
      // Product invariant: only one rule active at a time. If this one is
      // active, deactivate everyone else.
      if (willBeActive) {
        for (const r of mockState.laneRules) r.is_active = false;
      }
      const created: AdminLaneRule = {
        id: mockState.nextLaneRuleId(),
        school_id: 'bis',
        name: input.name ?? 'Untitled Rule',
        priority_type: input.priority_type ?? 'oldest_child',
        is_active: willBeActive,
      };
      mockState.laneRules.push(created);
      return envelope(created);
    },
  },
  {
    method: 'PUT',
    path: `${V}/admin/lane-rules/:id`,
    handler: async ({ params, body }): Promise<ApiEnvelope<string>> => {
      await delay(200);
      const id = Number(params.id);
      const rule = mockState.laneRules.find((r) => r.id === id);
      if (!rule) throw fixtureNotFound(`Lane rule ${id}`);
      const patch = (body ?? {}) as Partial<AdminLaneRule>;
      // Same "one active at a time" invariant on update.
      if (patch.is_active === true) {
        for (const r of mockState.laneRules) {
          if (r.id !== id) r.is_active = false;
        }
      }
      Object.assign(rule, patch);
      return envelope('success');
    },
  },
  {
    method: 'DELETE',
    path: `${V}/admin/lane-rules/:id`,
    handler: async ({ params }): Promise<ApiEnvelope<string>> => {
      await delay(200);
      const id = Number(params.id);
      const idx = mockState.laneRules.findIndex((r) => r.id === id);
      if (idx < 0) throw fixtureNotFound(`Lane rule ${id}`);
      mockState.laneRules.splice(idx, 1);
      return envelope('success');
    },
  },

  // ─── Admin → Pickups ────────────────────────────────────────────────────
  // Mirrors GET /api/v1/admin/pickup (singular). Same envelope + pagination
  // as the real endpoint so the admin dashboard works identically against
  // either. Rows are synthesised from the legacy mockDB.pickups shape.
  {
    method: 'GET',
    path: `${V}/admin/pickup`,
    handler: async ({ query }): Promise<ApiEnvelope<AdminPickup[]>> => {
      await delay(350);
      const page = Math.max(1, Number(query.get('page') ?? 1));
      const size = Math.max(1, Number(query.get('size') ?? 10));
      const search = (query.get('search') ?? '').toLowerCase().trim();

      let rows = mockAdminPickups();
      if (search) {
        rows = rows.filter((r) =>
          r.students.some((s) =>
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(search),
          ),
        );
      }

      const total = rows.length;
      const totalPage = Math.max(1, Math.ceil(total / size));
      const slice = rows.slice((page - 1) * size, page * size);

      return {
        data: slice,
        error: { code: '', message: '' },
        page,
        size,
        total,
        totalPage,
        warning: '',
      };
    },
  },
  {
    method: 'GET',
    path: `${V}/admin/pickup/summary`,
    handler: async (): Promise<ApiEnvelope<AdminPickupSummary>> => {
      await delay(200);
      const rows = mockAdminPickups();
      const count = (label: string) =>
        rows.filter((r) => r.stage_label === label).length;
      return envelope<AdminPickupSummary>({
        status: {
          active: count('active'),
          prepare: count('prepare'),
          queued: count('queued'),
          completed: count('completed'),
          cancelled: count('cancelled'),
        },
      });
    },
  },
  // The real endpoints reply 204 with no body; fixtures return an empty
  // envelope (dispatch always responds 200 for mocks) — callers ignore the
  // body either way.
  {
    method: 'POST',
    path: `${V}/admin/pickup/:id/complete`,
    handler: async ({ params }): Promise<ApiEnvelope<null>> => {
      await delay(250);
      const row = mockDB.pickups.find((p) => p.id === params.id);
      if (!row) throw fixtureNotFound(`Pickup ${params.id}`);
      (row as { status: string }).status = 'Completed';
      return envelope(null);
    },
  },
  {
    method: 'POST',
    path: `${V}/admin/pickup/:id/unmark`,
    handler: async ({ params }): Promise<ApiEnvelope<null>> => {
      await delay(250);
      const row = mockDB.pickups.find((p) => p.id === params.id);
      if (!row) throw fixtureNotFound(`Pickup ${params.id}`);
      (row as { status: string }).status = 'Queued';
      return envelope(null);
    },
  },
];

// ─── Matcher + helpers ────────────────────────────────────────────────────

export interface FixtureMatch {
  fixture: FixtureDef;
  params: Record<string, string>;
}

export function findFixture(method: string, path: string): FixtureMatch | null {
  const target = splitPath(path);
  for (const fixture of fixtures) {
    if (fixture.method !== method) continue;
    const pattern = splitPath(fixture.path);
    if (pattern.length !== target.length) continue;

    const params: Record<string, string> = {};
    let matched = true;
    for (let i = 0; i < pattern.length; i++) {
      const p = pattern[i];
      const t = target[i];
      if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(t);
      else if (p !== t) {
        matched = false;
        break;
      }
    }
    if (matched) return { fixture, params };
  }
  return null;
}

function splitPath(p: string): string[] {
  return p.split('/').filter(Boolean);
}

export class FixtureNotFoundError extends Error {
  status = 404 as const;
  constructor(what: string) {
    super(`${what} not found`);
    this.name = 'FixtureNotFoundError';
  }
}

function fixtureNotFound(what: string): FixtureNotFoundError {
  return new FixtureNotFoundError(what);
}
