import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Layouts
import AdminLayout from './components/layout/AdminLayout';

// Guards
import AdminGuard from './components/guards/AdminGuard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminAnalytics from './pages/admin/Analytics';
import AdminCoupons from './pages/admin/Coupons';
import AdminReviews from './pages/admin/Reviews';
import AdminSupport from './pages/admin/Support';
import AdminImport from './pages/admin/Import';
import AdminInventory from './pages/admin/Inventory';
import AdminRoles from './pages/admin/Roles';
import AdminSettings from './pages/admin/Settings';

import Login from './pages/auth/Login';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalBackground from './components/common/GlobalBackground';

export default function App() {
  const location = useLocation();

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
          {/* Admin Auth */}
          <Route path="/login" element={<motion.div {...pageTransition}><Login /></motion.div>} />

          {/* Admin Portal Root */}
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<motion.div {...pageTransition}><AdminDashboard /></motion.div>} />
            <Route path="products" element={<motion.div {...pageTransition}><AdminProducts /></motion.div>} />
            <Route path="orders" element={<motion.div {...pageTransition}><AdminOrders /></motion.div>} />
            <Route path="users" element={<motion.div {...pageTransition}><AdminUsers /></motion.div>} />
            <Route path="analytics" element={<motion.div {...pageTransition}><AdminAnalytics /></motion.div>} />
            <Route path="coupons" element={<motion.div {...pageTransition}><AdminCoupons /></motion.div>} />
            <Route path="reviews" element={<motion.div {...pageTransition}><AdminReviews /></motion.div>} />
            <Route path="support" element={<motion.div {...pageTransition}><AdminSupport /></motion.div>} />
            <Route path="import" element={<motion.div {...pageTransition}><AdminImport /></motion.div>} />
            <Route path="inventory" element={<motion.div {...pageTransition}><AdminInventory /></motion.div>} />
            <Route path="roles" element={<motion.div {...pageTransition}><AdminRoles /></motion.div>} />
            <Route path="settings" element={<motion.div {...pageTransition}><AdminSettings /></motion.div>} />
          </Route>

          {/* Catch-all redirect to dashboard */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
