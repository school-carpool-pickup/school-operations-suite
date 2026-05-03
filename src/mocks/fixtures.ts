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
  AdminStudent,
  AnalyticsSummary,
  ApiEnvelope,
  Beacon,
  Family,
  GateQueueSnapshot,
  LoginData,
  Pickup,
  School,
  Staff,
  Student,
  StudentStats,
  Transaction,
  UserMe,
  ValidateData,
} from '@/types';
import { envelope, GateQueueStatus, GateQueueType } from '@/types';
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

const SCHOOLS: School[] = [
  {
    id: 'bis',
    name: 'Bangkok International School',
    shortCode: 'BIS',
    timezone: 'Asia/Bangkok',
  },
  {
    id: 'sa',
    name: 'Sathorn Academy',
    shortCode: 'SA',
    timezone: 'Asia/Bangkok',
  },
];

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

const TV_QUEUE_SAMPLE: GateQueueSnapshot = {
  gateName: 'Gate B - Side Entrance',
  queue: [
    {
      id: 'B-002',
      status: GateQueueStatus.Preparing,
      type: GateQueueType.Carpool,
      students: [
        {
          name: 'Hana Tanaka',
          grade: 'Grade 3',
          initials: 'HT',
          color: 'bg-blue-600',
        },
        {
          name: 'Lily Chen',
          grade: 'Carpool',
          initials: 'LC',
          color: 'bg-purple-600',
        },
      ],
      parent: {
        name: 'Somchai Tanaka',
        role: 'Parent',
        initials: 'ST',
        color: 'bg-emerald-600',
      },
      vehicle: {
        plate: 'NS-1234',
        desc: 'Toyota Fortuner (Silver)',
        type: 'car',
      },
    },
  ],
  stats: { inQueue: 0, preparing: 1 },
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
      return envelope<ValidateData>({ valid: true });
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

  // ─── Students ───────────────────────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/students`,
    handler: async (): Promise<Student[]> => {
      await delay(500);
      return mockDB.students;
    },
  },
  {
    method: 'GET',
    path: `${V}/students/stats`,
    handler: async (): Promise<StudentStats> => {
      await delay(300);
      const total = mockDB.students.length;
      return {
        total,
        pickedUp: mockDB.students.filter((s) => s.pickupStatus === 'Picked Up')
          .length,
        ready: mockDB.students.filter(
          (s) => s.pickupStatus === 'Ready for Pickup',
        ).length,
        inClass: mockDB.students.filter((s) => s.pickupStatus === 'In Class')
          .length,
        enrolled: mockDB.students.filter((s) => s.status === 'enrolled').length,
        withNotes: mockDB.students.filter((s) => s.notes !== '-').length,
      };
    },
  },
  {
    method: 'GET',
    path: `${V}/students/:id`,
    handler: async ({ params }): Promise<Student> => {
      await delay(200);
      const student = mockDB.students.find((s) => s.id === params.id);
      if (!student) throw fixtureNotFound(`Student ${params.id}`);
      return student;
    },
  },

  // ─── Staff ──────────────────────────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/staff`,
    handler: async (): Promise<Staff[]> => {
      await delay(400);
      return mockDB.staff;
    },
  },
  {
    method: 'GET',
    path: `${V}/staff/:id`,
    handler: async ({ params }): Promise<Staff> => {
      await delay(200);
      const member = mockDB.staff.find((s) => s.id === params.id);
      if (!member) throw fixtureNotFound(`Staff ${params.id}`);
      return member;
    },
  },

  // ─── Families ───────────────────────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/families`,
    handler: async (): Promise<Family[]> => {
      await delay(600);
      return mockDB.families;
    },
  },
  {
    method: 'GET',
    path: `${V}/families/:id`,
    handler: async ({ params }): Promise<Family> => {
      await delay(200);
      const family = mockDB.families.find((f) => f.id === params.id);
      if (!family) throw fixtureNotFound(`Family ${params.id}`);
      return family;
    },
  },

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

  // ─── Pickups ────────────────────────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/pickups`,
    handler: async ({ query }): Promise<Pickup[]> => {
      await delay(350);
      const status = query.get('status');
      const lane = query.get('lane');
      let result: Pickup[] = mockDB.pickups;
      if (status) result = result.filter((p) => p.status === status);
      if (lane) result = result.filter((p) => p.lane === lane);
      return result;
    },
  },
  {
    method: 'GET',
    path: `${V}/pickups/:id`,
    handler: async ({ params }): Promise<Pickup> => {
      await delay(200);
      const pickup = mockDB.pickups.find((p) => p.id === params.id);
      if (!pickup) throw fixtureNotFound(`Pickup ${params.id}`);
      return pickup;
    },
  },

  // ─── Beacons ────────────────────────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/beacons`,
    handler: async (): Promise<Beacon[]> => {
      await delay(600);
      return mockDB.beacons;
    },
  },
  {
    method: 'GET',
    path: `${V}/beacons/:id`,
    handler: async ({ params }): Promise<Beacon> => {
      await delay(200);
      const beacon = mockDB.beacons.find((b) => b.id === params.id);
      if (!beacon) throw fixtureNotFound(`Beacon ${params.id}`);
      return beacon;
    },
  },

  // ─── Transactions / Analytics ───────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/transactions`,
    handler: async (): Promise<Transaction[]> => {
      await delay(700);
      return mockDB.transactions;
    },
  },
  {
    method: 'GET',
    path: `${V}/transactions/:id`,
    handler: async ({ params }): Promise<Transaction> => {
      await delay(200);
      const tx = mockDB.transactions.find((t) => t.id === params.id);
      if (!tx) throw fixtureNotFound(`Transaction ${params.id}`);
      return tx;
    },
  },
  {
    method: 'GET',
    path: `${V}/analytics/summary`,
    handler: async (): Promise<AnalyticsSummary> => {
      await delay(400);
      const activeBeacons = mockDB.beacons.filter(
        (b) => b.status === 'online',
      ).length;
      const totalRevenue = mockDB.transactions
        .filter((t) => t.status === 'completed')
        .reduce((sum, current) => sum + current.amount, 0);
      return {
        activeBeacons,
        totalBeacons: mockDB.beacons.length,
        totalRevenue: totalRevenue.toFixed(2),
        pendingTransactions: mockDB.transactions.filter(
          (t) => t.status === 'pending',
        ).length,
      };
    },
  },

  // ─── Schools ────────────────────────────────────────────────────────────
  // Backend hasn't shipped public school endpoints yet (only an internal
  // repository — see backend-service/internal/modules/school/repository.go).
  // These mock entries match the envelope shape the real endpoints will use,
  // so when /api/v1/schools ships the only change is removing the fixtures.
  {
    method: 'GET',
    path: `${V}/schools`,
    handler: async (): Promise<ApiEnvelope<School[]>> => {
      await delay(300);
      return envelope(SCHOOLS);
    },
  },
  {
    method: 'GET',
    path: `${V}/schools/:id`,
    handler: async ({ params }): Promise<ApiEnvelope<School>> => {
      await delay(150);
      const school = SCHOOLS.find((s) => s.id === params.id);
      if (!school) throw fixtureNotFound(`School ${params.id}`);
      return envelope(school);
    },
  },

  // ─── TV / Gates ─────────────────────────────────────────────────────────
  {
    method: 'GET',
    path: `${V}/tv/schools/:schoolId/gates/:gateId/queue`,
    domain: 'tv',
    handler: async (): Promise<GateQueueSnapshot> => {
      await delay(200);
      return TV_QUEUE_SAMPLE;
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
