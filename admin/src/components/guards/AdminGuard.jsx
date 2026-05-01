import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function AdminGuard({ children }) {
  const { isAuthenticated, isRehydrated, user, clearAuth } = useAuthStore();

  // Wait until rehydrate() has finished before making any routing decision
  if (!isRehydrated) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in at all → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but NOT admin → clear the bad session and redirect to login
  if (user?.role !== 'admin') {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  return children;
}
