import type { Id, ISODate } from './common';
import type { NotificationSeverity } from './enums';

export interface Notification {
  id: Id;
  message: string;
  timestamp: ISODate;
  read: boolean;
  severity: NotificationSeverity;
}
