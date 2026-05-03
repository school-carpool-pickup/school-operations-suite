import type { Id, ISODate } from './common';
import type { SchoolStaffRole, StaffStatus } from './enums';

export interface Staff {
  id: Id;
  name: string;
  email: string;
  role: SchoolStaffRole | string;
  status: StaffStatus | string;
  lastLogin: ISODate;
  joined: ISODate;
}

export interface StaffInput {
  name: string;
  email: string;
  role: SchoolStaffRole | string;
}
