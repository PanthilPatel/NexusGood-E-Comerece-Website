import { create } from 'zustand';
import api from '../services/api';

const useWishlistStore = create((set, get) => ({
  wishlist: null,
  products: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/wishlist');
      set({ wishlist: data.wishlist, products: data.wishlist.products || [] });
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const { data } = await api.post(`/wishlist/toggle/${productId}`);
      set({ wishlist: data.wishlist, products: data.wishlist.products || [] });
      return data;
    } catch (error) {
      throw error;
    }
  },

  isInWishlist: (productId) => {
    return get().products.some(p => p._id === productId);
  },
}));

export default useWishlistStore;
