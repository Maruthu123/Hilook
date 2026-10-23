import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* Customer pages  → must be logged in.
   adminOnly pages → must be the admin; everybody else is sent to the login page. */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={adminOnly ? '/login?mode=admin' : '/login'} state={{ from: location.pathname }} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
