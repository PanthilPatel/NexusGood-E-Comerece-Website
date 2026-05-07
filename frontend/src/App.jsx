import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';
import useWishlistStore from './store/wishlistStore';
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
import ForgotPassword from './pages/auth/ForgotPassword';
import Support from './pages/Support';
import Wishlist from './pages/Wishlist';


import ErrorBoundary from './components/ErrorBoundary';
import GlobalBackground from './components/common/GlobalBackground';

export default function App() {
  const { rehydrate, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { maintenanceMode, checkMaintenance, isLoading: settingsLoading } = useSettingsStore();

  const { fetchWishlist } = useWishlistStore();

  useEffect(() => {
    rehydrate();
    checkMaintenance();
  }, [rehydrate, checkMaintenance]);

  // Fetch cart & wishlist from backend whenever user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  const location = useLocation();

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

  const pageTransition = {
    initial: { opacity: 0, x: 10, filter: "blur(10px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -10, filter: "blur(10px)" },
    transition: { duration: 0.4, ease: "easeInOut" }
  };

  return (
    <ErrorBoundary>
      <GlobalBackground />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Auth pages — no layout */}
          <Route path="/login" element={<motion.div {...pageTransition}><Login /></motion.div>} />
          <Route path="/register" element={<motion.div {...pageTransition}><Register /></motion.div>} />
          <Route path="/forgot-password" element={<motion.div {...pageTransition}><ForgotPassword /></motion.div>} />

          {/* Customer pages with main layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<motion.div {...pageTransition}><Home /></motion.div>} />
            <Route path="/products" element={<motion.div {...pageTransition}><ProductList /></motion.div>} />
            <Route path="/collections" element={<motion.div {...pageTransition}><ProductList /></motion.div>} />
            <Route path="/new" element={<motion.div {...pageTransition}><ProductList /></motion.div>} />
            <Route path="/products/:id" element={<motion.div {...pageTransition}><ProductDetail /></motion.div>} />
            <Route path="/cart" element={<AuthGuard><motion.div {...pageTransition}><Cart /></motion.div></AuthGuard>} />
            <Route path="/checkout" element={<AuthGuard><motion.div {...pageTransition}><Checkout /></motion.div></AuthGuard>} />
            <Route path="/order-confirmation/:id" element={<AuthGuard><motion.div {...pageTransition}><OrderConfirmation /></motion.div></AuthGuard>} />
            <Route path="/orders" element={<AuthGuard><motion.div {...pageTransition}><Orders /></motion.div></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><motion.div {...pageTransition}><Profile /></motion.div></AuthGuard>} />
            <Route path="/wishlist" element={<AuthGuard><motion.div {...pageTransition}><Wishlist /></motion.div></AuthGuard>} />
            <Route path="/support" element={<motion.div {...pageTransition}><Support /></motion.div>} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
