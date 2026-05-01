import api from './api';

const walletService = {
  getWallet: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },
  
  addFunds: async (amount) => {
    const response = await api.post('/wallet/add', { amount });
    return response.data;
  }
};

export default walletService;
