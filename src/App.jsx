import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { AdminDashboard } from './pages/AdminDashboard'; // 👈 IMPORT THIS

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/farmer" element={<FarmerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} /> {/* 👈 DEFINE ROUTE */}
    </Routes>
  );
}

export default App;