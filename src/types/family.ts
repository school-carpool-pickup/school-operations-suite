import type { Id } from './common';
import type { FamilyStatus } from './enums';

export interface Family {
  id: Id;
  name: string;
  primaryContact: string;
  membersCount: number;
  studentsCount: number;
  pickupsCount: number;
  status: FamilyStatus | string;
}

export interface FamilyInput {
  name: string;
  primaryContact: string;
}
