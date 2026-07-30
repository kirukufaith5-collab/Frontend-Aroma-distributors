import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';
import Sidebar from "../components/Sidebar.jsx";
import Status from "../components/Status.jsx";
import "./FarmerDashboard.css";

export const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('harvest');

  // Logged-in farmer session info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const farmerId = user.id || 2;

  // Batches & Payouts State with initial fallbacks
  const [batches, setBatches] = useState([
    { id: 1, created_at: '2026-07-10', product_type: 'Tomatoes', weight: '45.5', notes: 'Grade A', status: 'APPROVED' },
    { id: 2, created_at: '2026-07-14', product_type: 'Potatoes', weight: '30', notes: '—', status: 'PENDING' }
  ]);

  const [payoutsData, setPayoutsData] = useState({
    payouts: [{ id: 101, issued_at: '2026-07-01', description: 'Harvest Payout Batch #1', amount: 1500, status: 'PAID' }],
    summary: { total_outstanding: 500, total_paid: 1500 }
  });

  // Single form state object
  const [formData, setFormData] = useState({ productType: 'Tomatoes', weight: '', notes: '' });

  // Initial Data Fetch
  useEffect(() => {
    API.get(`/farmer/${farmerId}/batches`).then(res => setBatches(res.data)).catch(() => console.log('Offline fallback batches loaded'));
    API.get(`/farmer/${farmerId}/payouts`).then(res => setPayoutsData(res.data)).catch(() => console.log('Offline fallback payouts loaded'));
  }, [farmerId]);

  // Handle Harvest Batch Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { farmer_id: farmerId, product_type: formData.productType, weight: formData.weight, notes: formData.notes };

    try {
      await API.post('/farmer/batches', payload);
      alert('Harvest submitted successfully!');
    } catch (err) {
      // Local fallback for offline testing
      const newBatch = { id: batches.length + 1, created_at: new Date().toISOString().split('T')[0], product_type: formData.productType, weight: formData.weight, notes: formData.notes || '—', status: 'PENDING' };
      setBatches([newBatch, ...batches]);
      alert('Harvest batch logged (offline mode)!');
    }
    
    setFormData({ productType: 'Tomatoes', weight: '', notes: '' });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Metrics array for Sidebar component
  const metrics = [
    { label: 'Batches Logged', value: batches.length },
    { label: 'Outstanding Payout', value: `KSh ${payoutsData.summary.total_outstanding}` },
    { label: 'Total Paid', value: `KSh ${payoutsData.summary.total_paid}` }
  ];

  return (
    <div className="farmer-container">
      {/* Top Navigation Bar */}
      <header className="farmer-header">
        <span className="farmer-brand">🌱 Aroma Distributors — Farmer Portal</span>
        <button onClick={handleLogout} className="admin-logout-btn">[→ LOGOUT</button>
      </header>

      <div className="farmer-content-layout">
        {/* Sidebar Component */}
        <Sidebar
          title={user.farm_name || 'FARM SUMMARY'}
          metrics={metrics}
          activeTab={activeTab}
          onTabSelect={setActiveTab}
        />

        {/* Main View Area */}
        <main className="farmer-main-panel">
          
          {/* TAB 1: LOG HARVEST FORM */}
          {activeTab === 'harvest' && (
            <div>
              <h2 className="view-title">LOG HARVEST BATCH</h2>
              <form onSubmit={handleSubmit} className="form-card">
                <div className="form-group">
                  <label className="form-label">PRODUCT TYPE</label>
                  <select 
                    value={formData.productType} 
                    onChange={e => setFormData({ ...formData, productType: e.target.value })} 
                    className="form-input"
                  >
                    <option value="Tomatoes">Tomatoes</option>
                    <option value="Potatoes">Potatoes</option>
                    <option value="Cabbage">Cabbage</option>
                    <option value="Onions">Onions</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">TOTAL WEIGHT (KG)</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    placeholder="e.g. 25.5"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NOTES</label>
                  <textarea
                    rows="3"
                    placeholder="Freshly picked this morning"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="form-input"
                  />
                </div>

                <button type="submit" className="btn-submit">Submit Harvest →</button>
              </form>
            </div>
          )}

          {/* TAB 2: HARVEST LOG TABLE */}
          {activeTab === 'history' && (
            <div>
              <h2 className="view-title">HARVEST LOG</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>DATE</th><th>PRODUCT</th><th>WEIGHT</th><th>NOTES</th><th>STATUS</th></tr>
                  </thead>
                  <tbody>
                    {batches.map(b => (
                      <tr key={b.id}>
                        <td>{b.created_at}</td>
                        <td><strong>{b.product_type}</strong></td>
                        <td>{b.weight} kg</td>
                        <td>{b.notes}</td>
                        <td><Status status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYOUT STATEMENTS */}
          {activeTab === 'payouts' && (
            <div>
              <h2 className="view-title">PAYOUT STATEMENTS</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>ISSUED DATE</th><th>DESCRIPTION</th><th>AMOUNT</th><th>STATUS</th></tr>
                  </thead>
                  <tbody>
                    {payoutsData.payouts.map(p => (
                      <tr key={p.id}>
                        <td>{p.issued_at}</td>
                        <td>{p.description}</td>
                        <td><strong>KSh {p.amount.toLocaleString()}</strong></td>
                        <td><Status status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};