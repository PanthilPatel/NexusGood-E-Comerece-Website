import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';
import useSettingsStore from './store/settingsStore';
import Maintenance from './pages/Maintenance';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Guards
import AuthGuard from './components/guards/AuthGuard';

// Customer Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const { rehydrate, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { maintenanceMode, checkMaintenance, isLoading: settingsLoading } = useSettingsStore();

  useEffect(() => {
    rehydrate();
    checkMaintenance();
  }, [rehydrate, checkMaintenance]);

  // Fetch cart from backend whenever user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (maintenanceMode) {
    return <Maintenance />;
  }

  return (
    <ErrorBoundary>
      <Routes>
      {/* Auth pages — no layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer pages with main layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<AuthGuard><Cart /></AuthGuard>} />
        <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
        <Route path="/order-confirmation/:id" element={<AuthGuard><OrderConfirmation /></AuthGuard>} />
        <Route path="/orders" element={<AuthGuard><Orders /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
