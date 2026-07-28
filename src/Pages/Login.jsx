import React, { useState } from 'react';
import API from '../services/api.js';
import './Login.css';

export const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'farmer' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Redirect based on user role
      if (res.data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/farmer';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">🌱 Aroma Distributors</h1>
        <p className="login-subtitle">DISTRIBUTORS PORTAL SYSTEM</p>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #B91C1C', color: '#991B1B', padding: '0.5rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">User Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="form-input"
            >
              <option value="farmer">Farmer Account</option>
              <option value="admin">Operations Admin</option>
            </select>
          </div>

          <div>
            <label className="form-label">Username</label>
            <input
              required
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. Maria Santos"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              required
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-submit" style={{ width: '100%', marginTop: '0.5rem' }}>
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
};