import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from "./pages/Login.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { FarmerDashboard } from "./pages/FarmerDashboard.jsx";

// Helper component to protect routes based on authentication & role
const ProtectedRoute = ({ Farmer, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their respective authorized view if accessing wrong route
    return <Navigate to={user.role === 'admin' ? '/admin' : '/farmer'} replace />;
  }

  return Farmer;
};

export function App() {
  return (
    <>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Farmer Routes */}
        <Route
          path="/farmer"
          element={
            <ProtectedRoute allowedRole="farmer">
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default Fallback Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;