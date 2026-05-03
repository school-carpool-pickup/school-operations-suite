import type { Id } from './common';
import type { StudentEnrollmentStatus, StudentPickupStatus } from './enums';

export interface Student {
  id: Id;
  name: string;
  email: string;
  grade: string;
  teacher: string;
  family: string;
  notes: string;
  status: StudentEnrollmentStatus | string;
  pickupStatus: StudentPickupStatus | string;
}

export interface StudentStats {
  total: number;
  pickedUp: number;
  ready: number;
  inClass: number;
  enrolled: number;
  withNotes: number;
}

export interface StudentInput {
  name: string;
  email: string;
  grade: string;
  teacher: string;
  family: string;
  notes?: string;
}
