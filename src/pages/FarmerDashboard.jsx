import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import Sidebar from "../components/Sidebar.jsx";
import Status from "../components/Status";
import "./FarmerDashboard.css";

export const FarmerDashboard = () => {
  // State for switching tabs
  const [activeTab, setActiveTab] = useState('harvest');

  // State for storing API data (with initial sample data)
  const [batches, setBatches] = useState([
    { id: 1, created_at: '2026-07-10', product_type: 'Pechay', weight: '45.5', notes: 'Grade A', status: 'APPROVED' },
    { id: 2, created_at: '2026-07-14', product_type: 'Kangkong', weight: '30', notes: '—', status: 'PENDING' }
  ]);

  const [payoutsData, setPayoutsData] = useState({
    payouts: [
      { id: 101, issued_at: '2026-07-01', description: 'Harvest Payout Batch #1', amount: 1500, status: 'PAID' }
    ],
    summary: { total_outstanding: 500, total_paid: 1500 }
  });
  
  // State for form inputs (using productType instead of vegetableType)
  const [productType, setProductType] = useState('Pechay');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  // Get logged in user details
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const farmerId = user.id || 2;

  // Load data on start
  useEffect(() => {
    fetchBatches();
    fetchPayouts();
  }, []);

  // Fetch batches from backend
  const fetchBatches = () => {
    API.get(`/farmer/${farmerId}/batches`)
      .then(res => setBatches(res.data))
      .catch(err => console.log('Using sample batches (API offline)'));
  };

  // Fetch payouts from backend
  const fetchPayouts = () => {
    API.get(`/farmer/${farmerId}/payouts`)
      .then(res => setPayoutsData(res.data))
      .catch(err => console.log('Using sample payouts (API offline)'));
  };

  // Submit new harvest batch
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newHarvest = { 
      farmer_id: farmerId, 
      product_type: productType, 
      weight: weight, 
      notes: notes 
    };
    
    API.post('/farmer/batches', newHarvest)
      .then(() => {
        alert('Harvest submitted!');
        setWeight('');
        setNotes('');
        fetchBatches();
      })
      .catch(() => {
        // Fallback for offline testing
        const localItem = {
          id: batches.length + 1,
          created_at: new Date().toISOString().split('T')[0],
          product_type: productType,
          weight: weight,
          notes: notes || '—',
          status: 'PENDING'
        };
        setBatches([localItem, ...batches]);
        alert('Harvest batch added!');
        setWeight('');
        setNotes('');
      });
  };

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Summary Metrics for Sidebar
  const metrics = [
    { label: 'Batches Logged', value: batches.length },
    { label: 'Outstanding Payout', value: `₱${payoutsData.summary.total_outstanding}` },
    { label: 'Total Paid', value: `₱${payoutsData.summary.total_paid}` },
  ];

  return (
    <div className="farmer-container">
      {/* Header bar */}
      <header className="farmer-header">
        <span className="farmer-brand">🌱 Aromas-Distributors— Farmer Portal</span>
        <button onClick={handleLogout} className="admin-logout-btn">[→ LOGOUT</button>
      </header>

      <div className="farmer-content-layout">
        {/* Sidebar menu */}
        <Sidebar
          title={user.farm_name || 'FARM SUMMARY'}
          metrics={metrics}
          activeTab={activeTab}
          onTabSelect={setActiveTab}
        />

        {/* Main Content Panel */}
        <main className="farmer-main-panel">
          
          {/* TAB 1: LOG HARVEST FORM */}
          {activeTab === 'harvest' && (
            <div>
              <h2 className="view-title">LOG HARVEST BATCH</h2>
              <form onSubmit={handleSubmit} className="form-card">
                
                <div className="form-group">
                  <label className="form-label">PRODUCT TYPE</label>
                  <select 
                    value={productType} 
                    onChange={(e) => setProductType(e.target.value)} 
                    className="form-input"
                  >
                    <option value="Tomatoes">Tomatoes</option>
                    <option value="Potatoes">Potatoes</option>
                    <option value="Cabbage">Cabbage</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">TOTAL WEIGHT (KG)</label>
                  <input
                    required
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 25.5"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NOTES</label>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Freshly picked this morning"
                    className="form-input"
                  />
                </div>

                <button type="submit" className="btn-submit">Submit Harvest →</button>
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
                      <th>DATE</th>
                      <th>PRODUCT</th>
                      <th>WEIGHT</th>
                      <th>NOTES</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
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

          {/* TAB 3: PAYOUT STATEMENTS TABLE */}
          {activeTab === 'payouts' && (
            <div>
              <h2 className="view-title">PAYOUT STATEMENTS</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ISSUED DATE</th>
                      <th>DESCRIPTION</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutsData.payouts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.issued_at}</td>
                        <td>{p.description}</td>
                        <td><strong>₱{p.amount}</strong></td>
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