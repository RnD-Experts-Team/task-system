import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isCancel } from "axios";
import { authService } from "@/services/authService";
import type { User, Permission, LoginCredentials } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────

function mergePermissions(user: User): Permission[] {
  const map = new Map<string, Permission>();

  for (const perm of user.permissions) {
    map.set(perm.name, perm);
  }

  for (const role of user.roles) {
    for (const perm of role.permissions) {
      map.set(perm.name, perm);
    }
  }

  return Array.from(map.values());
}

// ─── Store Types ─────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  allPermissions: Permission[];
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

// ─── Store ───────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      allPermissions: [],

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authService.login(credentials);
          authService.setToken(token);
          const allPermissions = mergePermissions(user);
          set({ user, token, isAuthenticated: true, allPermissions });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          if (!isCancel(error)) {
            console.error("Logout API call failed:", error);
          }
        } finally {
          authService.removeToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            allPermissions: [],
          });
        }
      },

      checkAuth: async () => {
        const token = authService.getToken();

        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            allPermissions: [],
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authService.getMe();
          const allPermissions = mergePermissions(user);
          set({ user, token, isAuthenticated: true, allPermissions });
        } catch (error) {
          if (!isCancel(error)) {
            authService.removeToken();
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              allPermissions: [],
            });
          }
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        allPermissions: state.allPermissions,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          authService.setToken(state.token);
        }
      },
    },
  ),
);
