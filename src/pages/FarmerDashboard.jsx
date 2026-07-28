import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import Sidebar from "../components/Sidebar.jsx";
import { Status } from "../components/Status";
import "./FarmerDashboard.css";

export const FarmerDashboard = () => {
  // State for switching tabs
  const [activeTab, setActiveTab] = useState('harvest');

  // State for storing API data
  const [batches, setBatches] = useState([]);
  const [payoutsData, setPayoutsData] = useState({ payouts: [], summary: { total_outstanding: 0, total_paid: 0 } });
  
  // States for the form inputs
  const [vegetableType, setVegetableType] = useState('Pechay');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  // Get logged in user details from browser storage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const farmerId = user.id || 2;

  // Run these functions once when the component loads
  useEffect(() => {
    fetchBatches();
    fetchPayouts();
  }, []);

  // Fetch submitted harvest batches from backend
  const fetchBatches = () => {
    API.get(`/farmer/${farmerId}/batches`)
      .then(res => setBatches(res.data))
      .catch(err => console.log('Error loading batches:', err));
  };

  // Fetch payout information from backend
  const fetchPayouts = () => {
    API.get(`/farmer/${farmerId}/payouts`)
      .then(res => setPayoutsData(res.data))
      .catch(err => console.log('Error loading payouts:', err));
  };

  // Submit the form data to backend
  const handleSubmit = (e) => {
    e.preventDefault();
    const newHarvest = { farmer_id: farmerId, vegetable_type: vegetableType, weight, notes };
    
    API.post('/farmer/batches', newHarvest)
      .then(() => {
        alert('Harvest submitted!');
        // Reset form inputs
        setWeight('');
        setNotes('');
        // Refresh the list after adding new batch
        fetchBatches();
      })
      .catch(() => alert('Failed to log harvest.'));
  };

  // Function to log out user
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Data to display in sidebar summary
  const metrics = [
    { label: 'Batches Logged', value: batches.length },
    { label: 'Outstanding Payout', value: `₱${payoutsData.summary.total_outstanding}` },
    { label: 'Total Paid', value: `₱${payoutsData.summary.total_paid}` },
  ];

  // Navigation items for the sidebar
  const navItems = [
    { id: 'harvest', label: 'Log Harvest', icon: '🌾' },
    { id: 'history', label: 'Harvest Log', icon: '📋' },
    { id: 'payouts', label: 'Payout Statements', icon: '💰' },
  ];

  return (
    <div className="farmer-container">
      {/* Header bar */}
      <header className="farmer-header">
        <span className="farmer-brand">🌱 Aroma-distributors — FARMER PORTAL</span>
        <button onClick={handleLogout} className="admin-logout-btn">↳ LOGOUT</button>
      </header>

      <div className="farmer-content-layout">
        {/* Sidebar menu */}
        <Sidebar
          title={user.farm_name || 'FARM SUMMARY'}
          metrics={metrics}
          navItems={navItems}
          activeTab={activeTab}
          onTabSelect={setActiveTab}
        />

        {/* Main Content Area */}
        <main className="farmer-main-panel">
          
          {/* TAB 1: LOG HARVEST FORM */}
          {activeTab === 'harvest' && (
            <div>
              <h2 className="view-title">LOG HARVEST BATCH</h2>
              <form onSubmit={handleSubmit} className="form-card">
                
                {/* Crop Type Input */}
                <div className="form-group">
                  <label className="form-label">Crop Type</label>
                  <select value={vegetableType} onChange={(e) => setVegetableType(e.target.value)} className="form-input">
                    <option value="Tomatoes">Tomatoes</option>
                    <option value="Potatoes">Potatoes</option>
                    <option value="Cabbage">Cabbage</option>
                  </select>
                </div>

                {/* Weight Input */}
                <div className="form-group">
                  <label className="form-label">Total Weight (KG)</label>
                  <input
                    required
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 25.5"
                    className="form-input"
                  />
                </div>

                {/* Notes Input */}
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Freshly picked this morning"
                    className="form-input"
                  />
                </div>

                <button type="submit" className="btn-submit">Submit Harvest</button>
              </form>
            </div>
          )}

          {/* TAB 2: HARVEST HISTORY TABLE */}
          {activeTab === 'history' && (
            <div>
              <h2 className="view-title">HARVEST LOG</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Weight</th>
                      <th>Notes</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Loop through all submitted batches */}
                    {batches.map((b) => (
                      <tr key={b.id}>
                        <td>{b.created_at}</td>
                        <td>{b.product_type}</td>
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

          {/* TAB 3: PAYOUT STATEMENTS TABLE */}
          {activeTab === 'payouts' && (
            <div>
              <h2 className="view-title">PAYOUT STATEMENTS</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Issued Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Loop through all payout records */}
                    {payoutsData.payouts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.issued_at}</td>
                        <td>{p.description}</td>
                        <td>₱{p.amount}</td>
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