import type { Id } from './common';
import type { PickupStatus } from './enums';

export interface Pickup {
  id: Id;
  time: string;
  students: string[];
  isCarpool?: boolean;
  carpoolExtra?: number;
  parent: string;
  vehicle: string;
  type?: string; // e.g. 'Taxi'
  queue: string;
  lane: string;
  status: PickupStatus | string;
}

export interface PickupInput {
  time: string;
  students: string[];
  parent: string;
  vehicle: string;
  isCarpool?: boolean;
  carpoolExtra?: number;
}
