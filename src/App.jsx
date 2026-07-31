import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard.jsx';
import {AdminDashboard}  from './pages/AdminDashboard';

export default function App() {
  return (
    <Routes>
      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Page Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/farmer" element={<FarmerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}