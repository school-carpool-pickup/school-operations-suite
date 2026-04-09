import { mockDB } from '../db';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface Beacon {
  id: string;
  name: string;
  status: string;
  battery: number;
  lastSeen: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: string;
  description: string;
}

export const businessService = {
  getBeacons: async (): Promise<Beacon[]> => {
    await delay(600);
    return mockDB.beacons;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    await delay(700);
    return mockDB.transactions;
  },

  getAnalyticsSummary: async () => {
    await delay(400);
    const activeBeacons = mockDB.beacons.filter(b => b.status === 'online').length;
    const totalRevenue = mockDB.transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, current) => sum + current.amount, 0);

    return {
      activeBeacons,
      totalBeacons: mockDB.beacons.length,
      totalRevenue: totalRevenue.toFixed(2),
      pendingTransactions: mockDB.transactions.filter(t => t.status === 'pending').length
    };
  }
};
