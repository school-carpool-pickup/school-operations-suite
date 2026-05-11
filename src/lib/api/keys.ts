/**
 * Typed API key registry. Pages call `apiKeys.students.list()` instead of
 * passing path strings around — single place to change a URL when the
 * backend renames an endpoint, plus stable React Query keys.
 *
 * Paths must match the upstream backend exactly. The catch-all route at
 * `src/app/api/[...path]/route.ts` is a transparent proxy:
 *
 *   client GET /api/v1/auth/me  →  server  →  BACKEND_API_URL/api/v1/auth/me
 *
 * Bump `API_VERSION_PREFIX` in lockstep with the backend.
 */

import type {
  AdminFamilyBulkDeleteInput,
  AdminFamilyListParams,
  AdminFamilyUpdateInput,
  AdminGradeCreateInput,
  AdminGradeListParams,
  AdminGradeUpdateInput,
  AdminLaneCreateInput,
  AdminLaneRuleCreateInput,
  AdminLaneRuleUpdateInput,
  AdminLaneUpdateInput,
  AdminStudentBulkDeleteInput,
  AdminStudentListParams,
  AdminStudentUpdateInput,
  LoginRequest,
} from '@/types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiKey<TBody = unknown> {
  /** Path WITHOUT the `/api` prefix — e.g. `/v1/students/s1`. */
  path: string;
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  body?: TBody;
  /** Stable React Query key. */
  queryKey: readonly unknown[];
}

const V = '/v1';
const k = (...parts: readonly unknown[]): readonly unknown[] => parts;

export const apiKeys = {
  auth: {
    /** Validate the current access token. Method = GET; the Authorization
     *  header is added automatically by the apiClient interceptor. */
    validate: (): ApiKey => ({
      path: `${V}/auth/validate`,
      method: 'GET',
      queryKey: k('auth', 'validate'),
    }),
    /** Login with grant_type=password / refresh_token / assertion. */
    login: (input: LoginRequest): ApiKey<LoginRequest> => ({
      path: `${V}/auth/login`,
      method: 'POST',
      body: input,
      queryKey: k('auth', 'login'),
    }),
    logout: (): ApiKey => ({
      path: `${V}/auth/logout`,
      method: 'POST',
      queryKey: k('auth', 'logout'),
    }),
  },
  students: {
    list: (): ApiKey => ({
      path: `${V}/students`,
      queryKey: k('students', 'list'),
    }),
    stats: (): ApiKey => ({
      path: `${V}/students/stats`,
      queryKey: k('students', 'stats'),
    }),
    byId: (id: string): ApiKey => ({
      path: `${V}/students/${id}`,
      queryKey: k('students', 'byId', id),
    }),
  },
  staff: {
    list: (): ApiKey => ({ path: `${V}/staff`, queryKey: k('staff', 'list') }),
    byId: (id: string): ApiKey => ({
      path: `${V}/staff/${id}`,
      queryKey: k('staff', 'byId', id),
    }),
  },
  users: {
    /** Current authenticated user. Reads JWT bearer from apiClient interceptor. */
    me: (): ApiKey => ({ path: `${V}/users/me`, queryKey: k('users', 'me') }),
  },
  adminFamilies: {
    list: (params?: AdminFamilyListParams): ApiKey => ({
      path: `${V}/admin/families`,
      query: params as Record<string, string | number | undefined> | undefined,
      queryKey: k('admin', 'families', 'list', params ?? {}),
    }),
    update: (
      id: string,
      input: AdminFamilyUpdateInput,
    ): ApiKey<AdminFamilyUpdateInput> => ({
      path: `${V}/admin/families/${id}`,
      method: 'PUT',
      body: input,
      queryKey: k('admin', 'families', 'update', id),
    }),
    bulkDelete: (
      input: AdminFamilyBulkDeleteInput,
    ): ApiKey<AdminFamilyBulkDeleteInput> => ({
      path: `${V}/admin/families/bulk-delete`,
      method: 'POST',
      body: input,
      queryKey: k('admin', 'families', 'bulkDelete'),
    }),
  },
  adminGrades: {
    list: (params?: AdminGradeListParams): ApiKey => ({
      path: `${V}/admin/grades`,
      query: params as Record<string, string | boolean | undefined> | undefined,
      queryKey: k('admin', 'grades', 'list', params ?? {}),
    }),
    byId: (id: number): ApiKey => ({
      path: `${V}/admin/grades/${id}`,
      queryKey: k('admin', 'grades', 'byId', id),
    }),
    create: (input: AdminGradeCreateInput): ApiKey<AdminGradeCreateInput> => ({
      path: `${V}/admin/grades`,
      method: 'POST',
      body: input,
      queryKey: k('admin', 'grades', 'create'),
    }),
    update: (
      id: number,
      input: AdminGradeUpdateInput,
    ): ApiKey<AdminGradeUpdateInput> => ({
      path: `${V}/admin/grades/${id}`,
      method: 'PUT',
      body: input,
      queryKey: k('admin', 'grades', 'update', id),
    }),
    delete: (id: number): ApiKey => ({
      path: `${V}/admin/grades/${id}`,
      method: 'DELETE',
      queryKey: k('admin', 'grades', 'delete', id),
    }),
  },
  adminLanes: {
    list: (): ApiKey => ({
      path: `${V}/admin/lanes`,
      queryKey: k('admin', 'lanes', 'list'),
    }),
    byId: (id: number): ApiKey => ({
      path: `${V}/admin/lanes/${id}`,
      queryKey: k('admin', 'lanes', 'byId', id),
    }),
    create: (input: AdminLaneCreateInput): ApiKey<AdminLaneCreateInput> => ({
      path: `${V}/admin/lanes`,
      method: 'POST',
      body: input,
      queryKey: k('admin', 'lanes', 'create'),
    }),
    update: (
      id: number,
      input: AdminLaneUpdateInput,
    ): ApiKey<AdminLaneUpdateInput> => ({
      path: `${V}/admin/lanes/${id}`,
      method: 'PUT',
      body: input,
      queryKey: k('admin', 'lanes', 'update', id),
    }),
    delete: (id: number): ApiKey => ({
      path: `${V}/admin/lanes/${id}`,
      method: 'DELETE',
      queryKey: k('admin', 'lanes', 'delete', id),
    }),
  },
  adminLaneRules: {
    list: (): ApiKey => ({
      path: `${V}/admin/lane-rules`,
      queryKey: k('admin', 'laneRules', 'list'),
    }),
    byId: (id: number): ApiKey => ({
      path: `${V}/admin/lane-rules/${id}`,
      queryKey: k('admin', 'laneRules', 'byId', id),
    }),
    create: (
      input: AdminLaneRuleCreateInput,
    ): ApiKey<AdminLaneRuleCreateInput> => ({
      path: `${V}/admin/lane-rules`,
      method: 'POST',
      body: input,
      queryKey: k('admin', 'laneRules', 'create'),
    }),
    update: (
      id: number,
      input: AdminLaneRuleUpdateInput,
    ): ApiKey<AdminLaneRuleUpdateInput> => ({
      path: `${V}/admin/lane-rules/${id}`,
      method: 'PUT',
      body: input,
      queryKey: k('admin', 'laneRules', 'update', id),
    }),
    delete: (id: number): ApiKey => ({
      path: `${V}/admin/lane-rules/${id}`,
      method: 'DELETE',
      queryKey: k('admin', 'laneRules', 'delete', id),
    }),
  },
  adminStudents: {
    list: (params?: AdminStudentListParams): ApiKey => ({
      path: `${V}/admin/students`,
      query: params as Record<string, string | number | undefined> | undefined,
      queryKey: k('admin', 'students', 'list', params ?? {}),
    }),
    update: (
      id: string,
      input: AdminStudentUpdateInput,
    ): ApiKey<AdminStudentUpdateInput> => ({
      path: `${V}/admin/students/${id}`,
      method: 'PUT',
      body: input,
      queryKey: k('admin', 'students', 'update', id),
    }),
    bulkDelete: (
      input: AdminStudentBulkDeleteInput,
    ): ApiKey<AdminStudentBulkDeleteInput> => ({
      path: `${V}/admin/students/bulk-delete`,
      method: 'POST',
      body: input,
      queryKey: k('admin', 'students', 'bulkDelete'),
    }),
  },
  families: {
    list: (): ApiKey => ({
      path: `${V}/families`,
      queryKey: k('families', 'list'),
    }),
    byId: (id: string): ApiKey => ({
      path: `${V}/families/${id}`,
      queryKey: k('families', 'byId', id),
    }),
  },
  pickups: {
    list: (filters?: { status?: string; lane?: string }): ApiKey => ({
      path: `${V}/pickups`,
      query: filters,
      queryKey: k('pickups', 'list', filters ?? {}),
    }),
    byId: (id: string): ApiKey => ({
      path: `${V}/pickups/${id}`,
      queryKey: k('pickups', 'byId', id),
    }),
  },
  beacons: {
    list: (): ApiKey => ({
      path: `${V}/beacons`,
      queryKey: k('beacons', 'list'),
    }),
    byId: (id: string): ApiKey => ({
      path: `${V}/beacons/${id}`,
      queryKey: k('beacons', 'byId', id),
    }),
  },
  transactions: {
    list: (): ApiKey => ({
      path: `${V}/transactions`,
      queryKey: k('transactions', 'list'),
    }),
    byId: (id: string): ApiKey => ({
      path: `${V}/transactions/${id}`,
      queryKey: k('transactions', 'byId', id),
    }),
  },
  analytics: {
    summary: (): ApiKey => ({
      path: `${V}/analytics/summary`,
      queryKey: k('analytics', 'summary'),
    }),
  },
  schools: {
    list: (): ApiKey => ({
      path: `${V}/schools`,
      queryKey: k('schools', 'list'),
    }),
    byId: (id: string): ApiKey => ({
      path: `${V}/schools/${id}`,
      queryKey: k('schools', 'byId', id),
    }),
  },
  tv: {
    gateQueue: (schoolId: string, gateId: string): ApiKey => ({
      path: `${V}/tv/schools/${schoolId}/gates/${gateId}/queue`,
      queryKey: k('tv', 'gateQueue', schoolId, gateId),
    }),
  },
} as const;
