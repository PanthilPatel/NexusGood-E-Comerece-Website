import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isRehydrated: false,   // tracks whether rehydrate() has finished

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  // Restore session from localStorage — only if the stored user is an admin
  rehydrate: () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Only restore if the user is an admin
        if (user?.role === 'admin') {
          set({ user, accessToken: token, isAuthenticated: true, isRehydrated: true });
          return;
        }
      } catch {
        // malformed JSON — fall through to clear
      }
      // Non-admin or bad data — wipe it
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    set({ isRehydrated: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });

      // Block non-admin users from accessing the admin panel
      if (data.user?.role !== 'admin') {
        throw new Error('FORBIDDEN');
      }

      get().setAuth(data.user, data.accessToken);
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    get().clearAuth();
  },

  updateProfile: async (updates) => {
    const { data } = await api.put('/auth/profile', updates);
    const updatedUser = data.user;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
    return data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
    return data;
  },
}));

export default useAuthStore;
