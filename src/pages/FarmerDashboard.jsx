import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
/*import { Sidebar } from "../components/Sidebar.jsx";*/
import { Status } from "../components/Status";
import "./FarmerDashboard.css";

export const FarmerDashboard = () => {
  const [activeTab, setActiveTab] = useState('harvest');
  const [batches, setBatches] = useState([]);
  const [payoutsData, setPayoutsData] = useState({ payouts: [], summary: { total_outstanding: 0, total_paid: 0 } });
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const farmerId = user.id || 2;

  useEffect(() => {
    fetchBatches();
    fetchPayouts();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await API.get(`/farmer/${farmerId}/batches`);
      setBatches(res.data);
    } catch (err) {
      console.error('Failed to fetch harvest batches:', err);
    }
  };

  const fetchPayouts = async () => {
    try {
      const res = await API.get(`/farmer/${farmerId}/payouts`);
      setPayoutsData(res.data);
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    }
  };

  const metrics = [
    { label: 'Batches Logged', value: batches.length },
    { label: 'Outstanding Payout', value: `₱${payoutsData.summary.total_outstanding.toLocaleString()}` },
    { label: 'Total Paid', value: `₱${payoutsData.summary.total_paid.toLocaleString()}` },
  ];

  const navItems = [
    { id: 'harvest', label: 'Log Harvest', icon: '🌾' },
    { id: 'history', label: 'Harvest Log', icon: '📋' },
    { id: 'payouts', label: 'Payout Statements', icon: '💰' },
  ];

  return (
    <div className="farmer-container">
      <header className="farmer-header">
        <span className="farmer-brand">🌱 Aroma-distributors — FARMER PORTAL</span>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="admin-logout-btn">
          ↳ LOGOUT
        </button>
      </header>

      <div className="farmer-content-layout">
        <Sidebar
          title={user.farm_name || 'FARM SUMMARY'}
          metrics={metrics}
          navItems={navItems}
          activeTab={activeTab}
          onTabSelect={setActiveTab}
        />

        <main className="farmer-main-panel">
          {activeTab === 'harvest' && <LogHarvestView farmerId={farmerId} onBatchCreated={fetchBatches} />}
          {activeTab === 'history' && <HarvestHistoryView batches={batches} />}
          {activeTab === 'payouts' && <PayoutsView data={payoutsData} />}
        </main>
      </div>
    </div>
  );
};

// Sub-view: Submit Harvest Form
const LogHarvestView = ({ farmerId, onBatchCreated }) => {
  const [formData, setFormData] = useState({ vegetable_type: 'Pechay', weight: '', notes: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/farmer/batches', { ...formData, farmer_id: farmerId });
      alert('Harvest batch submitted for quality inspection!');
      setFormData({ Product_type: 'Tomatoes', weight: '', notes: '' });
      onBatchCreated();
    } catch (err) {
      alert('Failed to log harvest batch.');
    }
  };

  return (
    <div>
      <h2 className="view-title">LOG HARVEST BATCH</h2>
      <p className="view-subtitle">Enter daily crop yields to submit for collection.</p>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label className="form-label">Product_Type</label>
          <select
            value={formData.vegetable_type}
            onChange={(e) => setFormData({ ...formData, vegetable_type: e.target.value })}
            className="form-input"
          >
            <option value="Tomatoes">Pechay</option>
            <option value="Potatoes">Kangkong</option>
            <option value="Cabbages">Sitaw</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Total Weight (KG)</label>
          <input
            required
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="e.g. 25.5"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes / Quality Remarks</label>
          <textarea
            rows="3"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Freshly picked this morning"
            className="form-input"
          />
        </div>

        <div>
          <button type="submit" className="btn-submit">Submit Harvest</button>
        </div>
      </form>
    </div>
  );
};

// Sub-view: Batch History
const HarvestHistoryView = ({ batches }) => (
  <div>
    <h2 className="view-title">HARVEST LOG</h2>
    <p className="view-subtitle">History of all submitted crop batches and approval statuses.</p>

    <div className="table-wrapper">
      <table className="data-table">
        <thead className="table-head">
          <tr>
            <th className="table-th">Date</th>
            <th className="table-th">Product</th>
            <th className="table-th">Weight</th>
            <th className="table-th">Notes</th>
            <th className="table-th">Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.id}>
              <td className="table-td">{b.created_at}</td>
              <td className="table-td-bold">{b.vegetable_type}</td>
              <td className="table-td">{b.weight} kg</td>
              <td className="table-td">{b.notes}</td>
              <td className="table-td"><Status status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Sub-view: Payouts & Bills
const PayoutsView = ({ data }) => (
  <div>
    <h2 className="view-title">PAYOUT STATEMENTS</h2>
    <p className="view-subtitle">Statements generated for approved harvest collections.</p>

    <div className="table-wrapper">
      <table className="data-table">
        <thead className="table-head">
          <tr>
            <th className="table-th">Issued Date</th>
            <th className="table-th">Description</th>
            <th className="table-th">Amount</th>
            <th className="table-th">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.payouts.map((p) => (
            <tr key={p.id}>
              <td className="table-td">{p.issued_at}</td>
              <td className="table-td-bold">{p.description}</td>
              <td className="table-td-bold">₱{p.amount.toLocaleString()}</td>
              <td className="table-td"><Status status={p.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);