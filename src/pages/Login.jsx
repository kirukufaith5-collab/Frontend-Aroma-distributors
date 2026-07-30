import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api.js';
import './Login.css';

export const Login = () => {
  const navigate = useNavigate();
  
  // Single state object for form fields
  const [form, setForm] = useState({
    farmerEmail: '',
    farmerPassword: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Generic login handler for both Farmer and Admin
  const handleAuth = async (e, endpoint, credentials, redirectPath) => {
    e.preventDefault();
    try {
      const { data } = await API.post(endpoint, credentials);
      
      // Store JWT token and user details for AuthGuard/ProtectedRoute
      localStorage.setItem('token', data.token || 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(data.user || data.admin));
      
      navigate(redirectPath);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed! Check your credentials.');
    }
  };

  return (
    <div className="login-page">
      {/* Top Header Bar */}
      <header className="brand-header">
        <div className="brand-title">
          <span className="leaf-icon">🌱</span>
          <span className="brand-name">Aroma-Distributors</span>
        </div>
        <span className="tag-badge">SUPPLY CHAIN PLATFORM</span>
      </header>

      {/* Main Hero Banner Header */}
      <section className="hero-banner">
        <h1>FROM FIELD<br />TO TABLE.</h1>
      </section>

      {/* Two Column Section for Farmer & Admin Login */}
      <div className="login-layout">
        
        {/* FARMER LOGIN CARD */}
        <div className="farmer-login-card">
          <h2>FARMER LOGIN</h2>
          <p className="card-subtitle">Access your batch submissions, delivery status, and payment records.</p>

          <form onSubmit={(e) => handleAuth(e, '/auth/farmer-login', { email: form.farmerEmail, password: form.farmerPassword }, '/farmer')}>
            <div className="form-group">
              <label>FARMER EMAIL</label>
              <input 
                type="email"
                name="farmerEmail"
                placeholder="farmer@example.com" 
                value={form.farmerEmail} 
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <input 
                type="password" 
                name="farmerPassword"
                placeholder="Enter password" 
                value={form.farmerPassword}
                onChange={handleChange}
                required 
              />
            </div>

            <button type="submit" className="btn-green">SIGN IN &rarr;</button>
          </form>

          <p className="forgot-link">
            Forgot password? <Link to="/forgot-password">Reset here</Link>
          </p>
        </div>

        {/* ADMIN LOGIN CARD */}
        <div className="admin-login-card">
          <h2>ADMIN CONTROL PANEL</h2>
          <p className="card-subtitle">Aroma Distributors master dashboard — manage orders and oversee payouts.</p>

          <form onSubmit={(e) => handleAuth(e, '/auth/admin-login', { email: form.adminEmail, password: form.adminPassword }, '/admin')}>
            <div className="form-group">
              <label>ADMIN EMAIL</label>
              <input 
                type="email"
                name="adminEmail" 
                placeholder="admin@aroma.com"
                value={form.adminEmail} 
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <input 
                type="password" 
                name="adminPassword"
                placeholder="Enter admin password" 
                value={form.adminPassword}
                onChange={handleChange}
                required 
              />
            </div>

            <button type="submit" className="btn-bright-green">ACCESS DASHBOARD &rarr;</button>
          </form>
        </div>

      </div>
    </div>
  );
};