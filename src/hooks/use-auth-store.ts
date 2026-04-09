import { create } from 'zustand';
import { mockDB } from '@/mocks/db';

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Default to the first user locally to avoid login screens in the demo
  user: mockDB.users[0],
  isAuthenticated: true,
  login: (userId) => {
    const user = mockDB.users.find(u => u.id === userId);
    if (user) {
      set({ user, isAuthenticated: true });
    }
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
