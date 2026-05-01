import { create } from 'zustand';
import api from '../services/api';

const useSettingsStore = create((set) => ({
  maintenanceMode: false,
  isLoading: false,

  fetchMaintenanceStatus: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/settings/maintenance_mode');
      set({ maintenanceMode: res.data?.data === true });
    } catch {
      set({ maintenanceMode: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setMaintenanceMode: async (value) => {
    try {
      await api.put('/settings/maintenance_mode', { value });
      set({ maintenanceMode: value });
      return true;
    } catch {
      return false;
    }
  }
}));

export default useSettingsStore;
