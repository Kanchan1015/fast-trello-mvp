import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RequireAuth:
 * - If auth is loading, show a simple splash to avoid UI flicker.
 * - If authenticated, render children (protected area).
 * - If not authenticated, redirect to /login preserving intended URL in state.
 *
 * Usage (routes):
 * <Route element={<RequireAuth />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 */
export const RequireAuth: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Small splash while verifying session — prevents flashing protected UI
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the attempted URL in location.state.from so we can redirect after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Authenticated — allow access
  return <>{children}</>;
};
