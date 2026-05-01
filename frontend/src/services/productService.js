import api from './api';

const productService = {
  getFlashSales: async () => {
    const response = await api.get('/products/flash-sales');
    return response.data;
  },
  
  getProducts: async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }
};

export default productService;
