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

  addToCart: async (productOrId, quantity = 1) => {
    const productId = typeof productOrId === 'object' ? productOrId._id : productOrId;
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
    // Backend already clears cart on checkout — just reset local state
    set({ cart: null, items: [] });
  },

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getCartTotal: () => {
    return get().items.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      return total + price * item.quantity;
    }, 0);
  },

  getShippingTotal: () => {
    return get().items.reduce((total, item) => {
      const fee = item.product?.shippingFee || 0;
      return total + fee * item.quantity;
    }, 0);
  },
}));

export default useCartStore;
