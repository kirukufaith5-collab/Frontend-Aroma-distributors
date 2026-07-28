import React, { useState } from 'react';
import API from '../services/api.js';
import './Login.css';

export const Login = () => {
  // State for Farmer Login Form
  const [farmerAccount, setFarmerAccount] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');

  // State for Admin Login Form
  const [adminUsername, setAdminUsername] = useState('aroma_admin');
  const [adminPassword, setAdminPassword] = useState('');

  // Handle Farmer Login Form Submit
  const handleFarmerLogin = (e) => {
    e.preventDefault();
    API.post('/login', { account: farmerAccount, password: farmerPassword })
      .then((res) => {
        // Save user info and go to farmer dashboard
        localStorage.setItem('user', JSON.stringify(res.data.user || { id: 2, farm_name: farmerAccount }));
        window.location.href = '/farmer';
      })
      .catch(() => alert('Farmer login failed! Check credentials.'));
  };

  // Handle Admin Login Form Submit
  const handleAdminLogin = (e) => {
    e.preventDefault();
    API.post('/admin/login', { username: adminUsername, password: adminPassword })
      .then((res) => {
        // Save admin info and go to admin page
        localStorage.setItem('admin', JSON.stringify(res.data || { role: 'admin' }));
        window.location.href = '/admin';
      })
      .catch(() => alert('Admin login failed! Check credentials.'));
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
        
        {/* LEFT COLUMN: Farmer Login (Light Background) */}
        <div className="farmer-login-card">
          <h2><span className="icon"></span> FARMER LOGIN</h2>
          <p className="card-subtitle">
            Access your batch submissions, delivery status, and payment records.
          </p>

          <form onSubmit={handleFarmerLogin}>
            <div className="form-group">
              <label>SELECT ACCOUNT</label>
              <select 
                value={farmerAccount} 
                onChange={(e) => setFarmerAccount(e.target.value)}
                required
              >
                <option value="">— Choose your account —</option>
                <option value="Green Valley Farm">Green Valley Farm</option>
                <option value="Aroma Produce">Aroma Produce</option>
              </select>
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <input 
                type="password" 
                placeholder="Enter password" 
                value={farmerPassword}
                onChange={(e) => setFarmerPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-green">
              SIGN IN &rarr;
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Admin Panel (Dark Green Background) */}
        <div className="admin-login-card">
          <h2><span className="icon"></span> ADMIN CONTROL PANEL</h2>
          <p className="card-subtitle">
            Aroma Distributors master dashboard — manage orders, approve products, and oversee the supply chain.
          </p>

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>ADMIN USERNAME</label>
              <input 
                type="text" 
                value={adminUsername} 
                onChange={(e) => setAdminUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <input 
                type="password" 
                placeholder="Enter admin password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-bright-green">
              ACCESS DASHBOARD &rarr;
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};