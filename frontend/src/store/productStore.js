import { create } from 'zustand';
import api from '../services/api';

const useProductStore = create((set) => ({
  products: [],
  product: null,
  categories: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/products', { params });
      if (data.success && data.data) {
        set({
          products: data.data.products || [],
          pagination: data.data.pagination,
        });
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load products.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProduct: async (id) => {
    set({ isLoading: true, error: null, product: null });
    try {
      const { data } = await api.get(`/products/${id}`);
      set({ product: data.product });
      return data.product;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load product.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await api.get('/categories');
      set({ categories: data.categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  clearProduct: () => set({ product: null }),

  createProduct: async (formData) => {
    const { data } = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.product;
  },

  updateProduct: async (id, formData) => {
    const { data } = await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.product;
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
  },
}));

export default useProductStore;
