import { Routes, Route, Navigate } from 'react-router-dom';

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

import Login from './pages/auth/Login';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
      {/* Admin Auth */}
      <Route path="/login" element={<Login />} />

      {/* Admin Portal Root */}
      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="import" element={<AdminImport />} />
      </Route>

      {/* Catch-all redirect to dashboard */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
