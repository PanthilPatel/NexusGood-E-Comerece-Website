import { create } from 'zustand';
import api from '../services/api';

const useCartStore = create((set, get) => ({
  cart: null,
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      set({ cart: data.cart, items: data.cart.items || [] });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart/add', { productId, quantity });
      set({ cart: data.cart, items: data.cart.items || [] });
      return data;
    } catch (error) {
      throw error;
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const { data } = await api.put('/cart/update', { productId, quantity });
      set({ cart: data.cart, items: data.cart.items || [] });
      return data;
    } catch (error) {
      throw error;
    }
  },

  removeFromCart: async (productId) => {
    try {
      const { data } = await api.delete(`/cart/remove/${productId}`);
      set({ cart: data.cart, items: data.cart.items || [] });
      return data;
    } catch (error) {
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const { data } = await api.delete('/cart/clear');
      set({ cart: data.cart, items: [] });
    } catch (error) {
      throw error;
    }
  },

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => {
      if (item.product) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);
  },
}));

export default useCartStore;
