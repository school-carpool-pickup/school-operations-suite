/**
 * @deprecated Use `useApi` / `getApi` with `apiKeys.beacons.*` /
 * `apiKeys.transactions.*` / `apiKeys.analytics.summary()` instead.
 *
 * Kept for legacy pages until they are migrated.
 */

import type { AnalyticsSummary, Beacon, Transaction } from '@/types';
import { mockDB } from '../db';

export type { Beacon, Transaction } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const businessService = {
  getBeacons: async (): Promise<Beacon[]> => {
    await delay(600);
    return mockDB.beacons;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    await delay(700);
    return mockDB.transactions;
  },

  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    await delay(400);
    const activeBeacons = mockDB.beacons.filter(
      (b) => b.status === 'online',
    ).length;
    const totalRevenue = mockDB.transactions
      .filter((t) => t.status === 'completed')
      .reduce((sum, current) => sum + current.amount, 0);

    return {
      activeBeacons,
      totalBeacons: mockDB.beacons.length,
      totalRevenue: totalRevenue.toFixed(2),
      pendingTransactions: mockDB.transactions.filter(
        (t) => t.status === 'pending',
      ).length,
    };
  },
};
