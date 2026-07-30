import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Wraps around components that require authentication.
 */
export const ProtectedRoute = ({ children }) => {
  // Check if JWT token exists in local storage
  const token = localStorage.getItem('token');

  // If no token, redirect user to login page immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected component/page
  return children;
};

export default ProtectedRoute;