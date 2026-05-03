import type { Id } from './common';
import type { GateQueueStatus, GateQueueType } from './enums';

export interface Gate {
  id: Id;
  name: string;
  schoolId: Id;
  gradesAssigned: string[];
}

export interface GateQueueStudent {
  name: string;
  grade: string;
  initials: string;
  color: string;
}

export interface GateQueueParent {
  name: string;
  role: string;
  initials: string;
  color: string;
}

export interface GateQueueVehicle {
  plate: string;
  desc: string;
  type: string;
}

export interface GateQueueItem {
  id: Id;
  status: GateQueueStatus;
  type: GateQueueType;
  students: GateQueueStudent[];
  parent: GateQueueParent;
  vehicle: GateQueueVehicle;
}

export interface GateQueueSnapshot {
  gateName: string;
  queue: GateQueueItem[];
  stats: {
    inQueue: number;
    preparing: number;
  };
}
