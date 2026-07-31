import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();
  const [farmerEmail, setFarmerEmail] = useState('kirukufaith5@gmail.com');
  const [farmerPassword, setFarmerPassword] = useState('*****');
  const [adminUsername, setAdminUsername] = useState('faithkiruku@gmail.com');
  const [adminPassword, setAdminPassword] = useState('******');

  const handleFarmerLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify({ id: 2, farm_name: 'GREEN ACRES FARM', role: 'farmer' }));
    navigate('/farmer');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'admin' }));
    navigate('/admin');
  };

  return (
    <div className="login-page">
      {/* Top Header */}
      <header className="brand-header">
        <div className="brand-name">🌱 Aromas Distributors</div>
        <span className="tag-badge">SUPPLY CHAIN PLATFORM</span>
      </header>

      {/* Hero Header */}
      <div className="hero-banner">
        <h1>FROM FIELD<br />TO TABLE.</h1>
      </div>

      {/* Split Login Container */}
      <div className="login-layout">
        {/* Left Column: Farmer Login */}
        <div className="farmer-login-card">
          <h2>🌾 FARMER LOGIN</h2>
          <p className="card-subtitle">Access your batch submissions, delivery status, and payment records.</p>
          
          <form onSubmit={handleFarmerLogin}>
            <div className="form-group">
              <label className="form-label">SELECT ACCOUNT / EMAIL</label>
              <input 
                type="text" 
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
          <h2>📋 ADMIN CONTROL PANEL</h2>
          <p className="card-subtitle admin-sub">Aroma Distributors master dashboard — manage orders and oversee payouts.</p>
          
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label admin-label">ADMIN USERNAME / EMAIL</label>
              <input 
                type="text" 
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