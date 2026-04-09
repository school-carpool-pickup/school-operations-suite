import { mockDB } from '../db';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  teacher: string;
  family: string;
  notes: string;
  status: string;
  pickupStatus: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  joined: string;
}

export interface Family {
  id: string;
  name: string;
  primaryContact: string;
  membersCount: number;
  studentsCount: number;
  pickupsCount: number;
  status: string;
}

export interface Pickup {
  id: string;
  time: string;
  students: string[];
  isCarpool?: boolean;
  carpoolExtra?: number;
  parent: string;
  vehicle: string;
  type?: string;
  queue: string;
  lane: string;
  status: string;
}

export const crmService = {
  getStudents: async (): Promise<Student[]> => {
    await delay(500);
    return mockDB.students;
  },

  getStudentStats: async () => {
    await delay(300);
    const total = mockDB.students.length;
    return {
      total,
      pickedUp: mockDB.students.filter(s => s.pickupStatus === 'Picked Up').length,
      ready: mockDB.students.filter(s => s.pickupStatus === 'Ready for Pickup').length,
      inClass: mockDB.students.filter(s => s.pickupStatus === 'In Class').length,
      enrolled: mockDB.students.filter(s => s.status === 'enrolled').length,
      withNotes: mockDB.students.filter(s => s.notes !== '-').length,
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
  }
};
