import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginData, User } from '@/types';

/**
 * Auth state — persisted to localStorage so a refresh keeps the session.
 *
 * Token shape mirrors the backend's OAuth-style response. We hold both
 * `accessToken` (sent on every request via the apiClient interceptor) and
 * `refreshToken` (used to renew the access token before expiry — flow is
 * not yet implemented; see `setSession` for the plumbing).
 *
 * `user` is a display-side projection. The login endpoint only returns
 * `user_id` + `roles`, so name/email stay empty until a future `/auth/me`
 * endpoint ships and we hydrate them.
 */

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  /** Epoch ms when the access token expires. */
  expiresAt: number | null;
  userId: string | null;
  roles: string[];
  isAuthenticated: boolean;
  user: User | null;

  setSession: (data: LoginData) => void;
  clearSession: () => void;
  /** Replace the user record once /auth/me (or similar) returns profile data. */
  setUser: (user: User) => void;
}

const EMPTY: Omit<AuthState, 'setSession' | 'clearSession' | 'setUser'> = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  userId: null,
  roles: [],
  isAuthenticated: false,
  user: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...EMPTY,
      setSession: (data) =>
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + data.expires_in * 1000,
          userId: data.user_id,
          roles: data.roles ?? [],
          isAuthenticated: true,
          user: {
            id: data.user_id,
            // Until /auth/me ships, fall back to user_id as the display name.
            name: data.user_id,
            email: '',
            role: data.roles?.[0] ?? '',
          },
        }),
      clearSession: () => set({ ...EMPTY }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'safepickup-auth',
      // Don't persist `isAuthenticated` derived flag; recompute on rehydrate.
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        userId: state.userId,
        roles: state.roles,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isAuthenticated = !!state.accessToken;
      },
    },
  ),
);
