import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Pages / Views
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { FarmerBatches } from './pages/FarmerBatches';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminOrders } from './pages/AdminOrders';
import { AdminClients } from './pages/AdminClients';

// Simple ProtectedRoute wrapper to guard private pages
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // If no JWT token is stored, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      // PUBLIC ROUTES (3)
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      //AUTH-PROTECTED ROUTES 
    // 1. Farmer Main Dashboard 
      <Route 
        path="/farmer" 
        element={
          <ProtectedRoute>
            <FarmerDashboard />
          </ProtectedRoute>
        } 
      />

      //2. Farmer Batches List & Management 
      <Route 
        path="/farmer/batches" 
        element={
          <ProtectedRoute>
            <FarmerBatches />
          </ProtectedRoute>
        } 
      />

      // 3. Admin Main Dashboard 
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      // 4. Admin Orders Management 
      <Route 
        path="/admin/orders" 
        element={
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        } 
      />

      // 5. Admin Clients Management 
      <Route 
        path="/admin/clients" 
        element={
          <ProtectedRoute>
            <AdminClients />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;