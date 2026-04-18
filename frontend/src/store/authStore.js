import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI } from '@/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:    null,
      token:   null,
      loading: false,
      error:   null,

      // ── Setters ─────────────────────────────────────────────────────────
      setUser:  (user)  => set({ user }),
      setToken: (token) => {
        localStorage.setItem('dac_token', token);
        set({ token });
      },
      clearError: () => set({ error: null }),

      // ── Auth actions ────────────────────────────────────────────────────
      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await authAPI.register(data);
          localStorage.setItem('dac_token', res.data.token);
          set({ user: res.data.user, token: res.data.token, loading: false });
          return { success: true };
        } catch (err) {
          set({ error: err.message || 'Registration failed', loading: false });
          return { success: false, error: err.message };
        }
      },

      login: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await authAPI.login(data);
          localStorage.setItem('dac_token', res.data.token);
          set({ user: res.data.user, token: res.data.token, loading: false });
          return { success: true, role: res.data.user.role };
        } catch (err) {
          set({ error: err.message || 'Login failed', loading: false });
          return { success: false, error: err.message };
        }
      },

      googleLogin: async (credential, role) => {
        set({ loading: true, error: null });
        try {
          const res = await authAPI.googleLogin({ credential, role });
          localStorage.setItem('dac_token', res.data.token);
          set({ user: res.data.user, token: res.data.token, loading: false });
          return { success: true, role: res.data.user.role };
        } catch (err) {
          set({ error: err.message || 'Google login failed', loading: false });
          return { success: false };
        }
      },

      refreshUser: async () => {
        try {
          const res = await authAPI.me();
          set({ user: res.data.user });
        } catch {
          get().logout();
        }
      },

      updateProfile: async (data) => {
        try {
          const res = await authAPI.updateProfile(data);
          set({ user: res.data.user });
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      logout: () => {
        localStorage.removeItem('dac_token');
        set({ user: null, token: null });
      },

      isAuthenticated: () => !!get().token && !!get().user,
      isTeacher:       () => get().user?.role === 'teacher',
      isStudent:       () => get().user?.role === 'student',
    }),
    {
      name:    'dac-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;