import type { Id, ISODate } from './common';
import type { BeaconStatus } from './enums';

export interface Beacon {
  id: Id;
  name: string;
  status: BeaconStatus | string;
  battery: number;
  lastSeen: ISODate;
}
