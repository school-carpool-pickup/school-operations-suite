import type { Id } from './common';

export interface School {
  id: Id;
  name: string;
  shortCode?: string;
  timezone?: string;
}
