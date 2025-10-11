import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * RequireRole: Simple route guard based on localStorage role string.
 * - If no auth token, redirect to /signin
 * - If role not allowed, show a lightweight 403 message
 * - Otherwise render children
 */
export default function RequireRole({ allowed = [], children }) {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem('ad_role') : null;

  if (!token) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (Array.isArray(allowed) && allowed.length > 0) {
    if (!allowed.includes(role)) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border rounded-2xl shadow p-6 text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h2 className="text-xl font-semibold text-gray-800">Access denied</h2>
            <p className="text-gray-600 mt-1 text-sm">Your role does not have permission to view this page.</p>
            <a href="/" className="inline-block mt-4 px-4 py-2 rounded-lg bg-[#0B3954] text-white text-sm font-semibold hover:bg-[#0a2f46]">Go Home</a>
          </div>
        </div>
      );
    }
  }

  return children;
}
