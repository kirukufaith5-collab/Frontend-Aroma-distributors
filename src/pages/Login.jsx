import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();

  // Controlled state for Farmer form inputs
  const [farmerEmail, setFarmerEmail] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');

  // Controlled state for Admin form inputs
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleFarmerLogin = (e) => {
    e.preventDefault(); // Prevents page reload
    
    // Save simulated user session to localStorage
    localStorage.setItem('user', JSON.stringify({ id: 2, farm_name: 'GREEN ACRES FARM', role: 'farmer' }));
    
    // Clear the form fields
    setFarmerEmail('');
    setFarmerPassword('');

    // Navigate to the Farmer Dashboard
    navigate('/farmer');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault(); // Prevents page reload
    
    // Save simulated user session to localStorage
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'admin' }));
    
    // Clear the form fields
    setAdminUsername('');
    setAdminPassword('');

    // Navigate to the Admin Dashboard
    navigate('/admin');
  };

  return (
    <div className="login-page">
      <header className="brand-header">
        <div className="brand-name">🌱 Aroma Distributors</div>
        <span className="tag-badge">SUPPLY CHAIN PLATFORM</span>
      </header>

      <div className="hero-banner">
        <h1>FROM FIELD<br />TO TABLE.</h1>
      </div>

      <div className="login-layout">
        {/* Left Column: Farmer Login */}
        <div className="farmer-login-card">
          <h2>FARMER LOGIN</h2>
          <p className="card-subtitle">Access your batch submissions, delivery status, and payment records.</p>
          
          <form onSubmit={handleFarmerLogin}>
            <div className="form-group">
              <label className="form-label">SELECT ACCOUNT / EMAIL</label>
              <input 
                type="email" 
                placeholder="e.g. farmer@example.com"
                value={farmerEmail} 
                onChange={(e) => setFarmerEmail(e.target.value)} 
                className="form-input" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <input 
                type="password" 
                placeholder="Enter password"
                value={farmerPassword} 
                onChange={(e) => setFarmerPassword(e.target.value)} 
                className="form-input" 
                required 
              />
            </div>

            <button type="submit" className="btn-bright-green">SIGN IN →</button>
          </form>

          <p className="forgot-link">Forgot password? <a href="#reset">Reset here</a></p>
        </div>

        {/* Right Column: Admin Panel */}
        <div className="admin-login-card">
          <h2>ADMIN CONTROL PANEL</h2>
          <p className="card-subtitle admin-sub">Aroma Distributors master dashboard — manage orders and oversee payouts.</p>
          
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label admin-label">ADMIN USERNAME / EMAIL</label>
              <input 
                type="text" 
                placeholder="e.g. admin_username"
                value={adminUsername} 
                onChange={(e) => setAdminUsername(e.target.value)} 
                className="admin-input" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label admin-label">PASSWORD</label>
              <input 
                type="password" 
                placeholder="Enter admin password"
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                className="admin-input" 
                required 
              />
            </div>

            <button type="submit" className="btn-bright-green">ACCESS DASHBOARD →</button>
          </form>
        </div>
      </div>
    </div>
  );
};