/**
 * @deprecated Direct imports from this file are kept working for legacy pages.
 * New code should call the API instead:
 *   client → useApi(apiKeys.students.list())
 *   server → getApi(apiKeys.students.list())
 *
 * Types are re-exported from `@/types` (single source of truth).
 * Behaviour below is preserved unchanged so existing pages keep rendering.
 */

import type { Family, Pickup, Staff, Student, StudentStats } from '@/types';
import { mockDB } from '../db';

export type { Family, Pickup, Staff, Student } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const crmService = {
  getStudents: async (): Promise<Student[]> => {
    await delay(500);
    return mockDB.students;
  },

  getStudentStats: async (): Promise<StudentStats> => {
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

  getStaff: async (): Promise<Staff[]> => {
    await delay(400);
    return mockDB.staff;
  },

  getFamilies: async (): Promise<Family[]> => {
    await delay(600);
    return mockDB.families;
  },

  getPickups: async (): Promise<Pickup[]> => {
    await delay(350);
    return mockDB.pickups;
  },
};
