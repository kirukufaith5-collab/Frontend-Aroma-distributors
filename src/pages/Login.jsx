import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';

export const Login = () => {
  const navigate = useNavigate();

  const [farmerEmail, setFarmerEmail] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [farmerError, setFarmerError] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleFarmerLogin = async (e) => {
    e.preventDefault();
    setFarmerError('');

    try {
      const res = await API.post('/auth/login', {
        email: farmerEmail,
        password: farmerPassword,
      });

      const token = res.data?.token;
      const user = res.data?.user;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user', JSON.stringify(user));

        setFarmerEmail('');
        setFarmerPassword('');
        navigate('/farmer');
      }
    } catch (err) {
      console.error('Farmer Login Error:', err);
      setFarmerError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');

    try {
      const res = await API.post('/auth/login', {
        email: adminEmail,
        password: adminPassword,
      });

      const token = res.data?.token;
      const user = res.data?.user;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user', JSON.stringify(user));

        setAdminEmail('');
        setAdminPassword('');
        navigate('/admin');
      }
    } catch (err) {
      console.error('Admin Login Error:', err);
      setAdminError(err.response?.data?.message || 'Invalid admin credentials.');
    }
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
        <div className="farmer-login-card">
          <h2>FARMER LOGIN</h2>
          <p className="card-subtitle">Access batch submissions, delivery status, and records.</p>
          
          {farmerError && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{farmerError}</p>}

          <form onSubmit={handleFarmerLogin}>
            <div className="form-group">
              <label className="form-label">EMAIL</label>
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
        </div>

        <div className="admin-login-card">
          <h2>ADMIN CONTROL PANEL</h2>
          <p className="card-subtitle admin-sub">Aroma Distributors master dashboard.</p>
          
          {adminError && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{adminError}</p>}

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label admin-label">ADMIN EMAIL</label>
              <input 
                type="email" 
                placeholder="e.g. admin@example.com"
                value={adminEmail} 
                onChange={(e) => setAdminEmail(e.target.value)} 
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

export default Login;