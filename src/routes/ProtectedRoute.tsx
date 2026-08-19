import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Gate for any branch of the route tree that requires a logged-in session (integration brief §23,
 * §66 Phase 1 "Protected routes"). Answers only "is anyone authenticated at all?" — permission-
 * level gating for an individual page within an authenticated area still uses <PermissionGuard>
 * per-route, same as before.
 */
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-semibold">
        Loading ARS System...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
