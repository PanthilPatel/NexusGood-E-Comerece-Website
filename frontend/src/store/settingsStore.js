import { create } from 'zustand';
import api from '../services/api';

const useSettingsStore = create((set) => ({
  maintenanceMode: false,
  isLoading: true,

  checkMaintenance: async () => {
    try {
      const res = await api.get('/settings/maintenance_mode');
      const isMaintenance = res.data?.data === true;
      set({ maintenanceMode: isMaintenance, isLoading: false });
      return isMaintenance;
    } catch {
      set({ maintenanceMode: false, isLoading: false });
      return false;
    }
  }
}));

export default useSettingsStore;
