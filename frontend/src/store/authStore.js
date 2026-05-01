import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  rehydrate: () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, accessToken: token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      get().setAuth(data.user, data.accessToken);
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password, phone, address, referralCode) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone, address, referralCode });
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
      // Ignore errors
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, isAuthenticated: false });
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
  
  addAddress: async (addressData) => {
    const { data } = await api.post('/auth/addresses', addressData);
    set(state => ({ user: { ...state.user, addresses: data.addresses } }));
    localStorage.setItem('user', JSON.stringify({ ...get().user, addresses: data.addresses }));
    return data;
  },

  deleteAddress: async (addressId) => {
    const { data } = await api.delete(`/auth/addresses/${addressId}`);
    set(state => ({ user: { ...state.user, addresses: data.addresses } }));
    localStorage.setItem('user', JSON.stringify({ ...get().user, addresses: data.addresses }));
    return data;
  },
}));

export default useAuthStore;
