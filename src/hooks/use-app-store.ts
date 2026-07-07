import { create } from 'zustand';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: NotificationSeverity;
}

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;

  notifications: Notification[];
  addNotification: (msg: string, severity?: NotificationSeverity) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  // Empty until a real notifications feed exists — no seeded/mock entries.
  notifications: [],
  addNotification: (message, severity = 'info') =>
    set((state) => ({
      notifications: [
        {
          id: Math.random().toString(36).substr(2, 9),
          message,
          timestamp: new Date().toISOString(),
          read: false,
          severity,
        },
        ...state.notifications,
      ],
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
