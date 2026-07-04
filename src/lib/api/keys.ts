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
  AdminNotificationInput,
  AdminPickupListParams,
  AdminSchoolConfigUpdateInput,
  AdminSchoolInput,
  AdminSchoolListParams,
  AdminStudentBulkDeleteInput,
  AdminStudentListParams,
  AdminStudentUpdateInput,
  AdminUserChangePasswordInput,
  AdminUserInviteInput,
  AdminUserListParams,
  AdminUserUpdateInput,
  AdminUserUpdateMeInput,
  LoginRequest,
  RegisterRequest,
  TransactionListParams,
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
    /** Complete an emailed invitation (register_token) by setting the
     *  profile + password. Unauthenticated. */
    register: (input: RegisterRequest): ApiKey<RegisterRequest> => ({
      path: `${V}/auth/register`,
      method: 'POST',
      body: input,
      queryKey: k('auth', 'register'),
    }),
    logout: (): ApiKey => ({
      path: `${V}/auth/logout`,
      method: 'POST',
      queryKey: k('auth', 'logout'),
    }),
  },
  // NOTE (KAN-26): the old flat `students`, `staff`, `families`, `schools`
  // and `pickups` key groups pointed at paths the backend never shipped
  // (`/v1/students`, `/v1/staff`, …) and 404'd when flipped to real. They
  // had no remaining consumers and were removed — use the `admin*` groups,
  // which mirror the real `/v1/admin/*` modules.
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
    delete: (id: string): ApiKey => ({
      path: `${V}/admin/families/${id}`,
      method: 'DELETE',
      queryKey: k('admin', 'families', 'delete', id),
    }),
  },
  adminUsers: {
    list: (params?: AdminUserListParams): ApiKey => ({
      path: `${V}/admin/users`,
      query: params as Record<string, string | number | undefined> | undefined,
      queryKey: k('admin', 'users', 'list', params ?? {}),
    }),
    byId: (id: string): ApiKey => ({
      path: `${V}/admin/users/${id}`,
      queryKey: k('admin', 'users', 'byId', id),
    }),
    /** Invite a staff member by email. Backend only accepts `role=staff`. */
    invite: (input: AdminUserInviteInput): ApiKey<AdminUserInviteInput> => ({
      path: `${V}/admin/users/invitations`,
      method: 'POST',
      body: input,
      queryKey: k('admin', 'users', 'invite'),
    }),
    update: (
      id: string,
      input: AdminUserUpdateInput,
    ): ApiKey<AdminUserUpdateInput> => ({
      path: `${V}/admin/users/${id}`,
      method: 'PUT',
      body: input,
      queryKey: k('admin', 'users', 'update', id),
    }),
    delete: (id: string): ApiKey => ({
      path: `${V}/admin/users/${id}`,
      method: 'DELETE',
      queryKey: k('admin', 'users', 'delete', id),
    }),
    /** Current internal user's own profile. */
    me: (): ApiKey => ({
      path: `${V}/admin/users/me`,
      queryKey: k('admin', 'users', 'me'),
    }),
    updateMe: (
      input: AdminUserUpdateMeInput,
    ): ApiKey<AdminUserUpdateMeInput> => ({
      path: `${V}/admin/users/me`,
      method: 'PUT',
      body: input,
      queryKey: k('admin', 'users', 'updateMe'),
    }),
    changePassword: (
      input: AdminUserChangePasswordInput,
    ): ApiKey<AdminUserChangePasswordInput> => ({
      path: `${V}/admin/users/me/password`,
      method: 'PUT',
      body: input,
      queryKey: k('admin', 'users', 'changePassword'),
    }),
  },
  adminNotifications: {
    broadcast: (
      input: AdminNotificationInput,
    ): ApiKey<AdminNotificationInput> => ({
      path: `${V}/admin/notifications/broadcast`,
      method: 'POST',
      body: input,
      queryKey: k('admin', 'notifications', 'broadcast'),
    }),
    sendToUser: (
      id: string,
      input: AdminNotificationInput,
    ): ApiKey<AdminNotificationInput> => ({
      path: `${V}/admin/notifications/user/${id}`,
      method: 'POST',
      body: input,
      queryKey: k('admin', 'notifications', 'sendToUser', id),
    }),
  },
  adminSchools: {
    list: (params?: AdminSchoolListParams): ApiKey => ({
      path: `${V}/admin/schools`,
      query: params as Record<string, string | number | undefined> | undefined,
      queryKey: k('admin', 'schools', 'list', params ?? {}),
    }),
    byId: (id: string): ApiKey => ({
      path: `${V}/admin/schools/${id}`,
      queryKey: k('admin', 'schools', 'byId', id),
    }),
    create: (input: AdminSchoolInput): ApiKey<AdminSchoolInput> => ({
      path: `${V}/admin/schools`,
      method: 'POST',
      body: input,
      queryKey: k('admin', 'schools', 'create'),
    }),
    update: (
      id: string,
      input: AdminSchoolInput,
    ): ApiKey<AdminSchoolInput> => ({
      path: `${V}/admin/schools/${id}`,
      method: 'PUT',
      body: input,
      queryKey: k('admin', 'schools', 'update', id),
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
  adminSchoolConfig: {
    /** Current school-wide config (geofence radius, BLE range, school
     *  coordinates). Backend returns defaults when none is saved yet. */
    get: (): ApiKey => ({
      path: `${V}/admin/school-configs`,
      queryKey: k('admin', 'schoolConfig', 'get'),
    }),
    /** Replace the school config. `school_id` is derived from the JWT, so
     *  the body carries only the config fields. */
    update: (
      input: AdminSchoolConfigUpdateInput,
    ): ApiKey<AdminSchoolConfigUpdateInput> => ({
      path: `${V}/admin/school-configs`,
      method: 'PUT',
      body: input,
      queryKey: k('admin', 'schoolConfig', 'update'),
    }),
  },
  /** Mirrors /api/v1/admin/pickup (RolesInternalLevel4). */
  adminPickups: {
    list: (params?: AdminPickupListParams): ApiKey => ({
      path: `${V}/admin/pickup`,
      query: params as Record<string, string | number | undefined> | undefined,
      queryKey: k('admin', 'pickups', 'list', params ?? {}),
    }),
    /** Counts per stage label for the admin's school. */
    summary: (): ApiKey => ({
      path: `${V}/admin/pickup/summary`,
      queryKey: k('admin', 'pickups', 'summary'),
    }),
    /** Marks a queued pickup completed. Backend replies 204. */
    complete: (id: string): ApiKey => ({
      path: `${V}/admin/pickup/${id}/complete`,
      method: 'POST',
      queryKey: k('admin', 'pickups', 'complete', id),
    }),
    /** Reverts a completed pickup to queued. Backend replies 204. */
    unmark: (id: string): ApiKey => ({
      path: `${V}/admin/pickup/${id}/unmark`,
      method: 'POST',
      queryKey: k('admin', 'pickups', 'unmark', id),
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
  /**
   * Proposed backend module (KAN-18) — mock-backed until it ships, then
   * flip with `API_REAL_DOMAINS=transactions,analytics`. Contract lives in
   * `src/types/transaction.ts` + the fixtures.
   */
  transactions: {
    list: (params?: TransactionListParams): ApiKey => ({
      path: `${V}/transactions`,
      query: params as Record<string, string | number | undefined> | undefined,
      queryKey: k('transactions', 'list', params ?? {}),
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
  tv: {
    gateQueue: (schoolId: string, gateId: string): ApiKey => ({
      path: `${V}/tv/schools/${schoolId}/gates/${gateId}/queue`,
      queryKey: k('tv', 'gateQueue', schoolId, gateId),
    }),
  },
} as const;
