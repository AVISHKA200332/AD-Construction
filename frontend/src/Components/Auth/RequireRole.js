import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireRole({ children, allow }) {
  const location = useLocation();
  const raw = localStorage.getItem('userData');
  const user = raw ? JSON.parse(raw) : null;
  const role = user?.role;
  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />;
  if (allow && !allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}
