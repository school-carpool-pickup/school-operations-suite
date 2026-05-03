import type { Id, ISODate } from './common';
import type { TransactionStatus } from './enums';

export interface Transaction {
  id: Id;
  amount: number;
  date: ISODate;
  status: TransactionStatus | string;
  description: string;
}

export interface AnalyticsSummary {
  activeBeacons: number;
  totalBeacons: number;
  totalRevenue: string;
  pendingTransactions: number;
}
