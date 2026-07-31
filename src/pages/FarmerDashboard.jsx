import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';

const FarmerDashboard = () => {
  const navigate = useNavigate();

  // Navigation tab state: 'batches' | 'register'
  const [activeTab, setActiveTab] = useState('batches');

  // Batches state
  const [batches, setBatches] = useState([
    { batch_id: 101, product_type: 'Tomatoes', weight: 45.5, status: 'Available' },
    { batch_id: 102, product_type: 'Potatoes', weight: 30.0, status: 'Available' },
    { batch_id: 103, product_type: 'Butternut', weight: 22.8, status: 'Pending' }
  ]);

  // New batch form state matching ProductBatch schema
  const [formData, setFormData] = useState({
    farmer_id: '1', // Hardcoded or pulled from auth user context
    product_type: 'Tomatoes',
    weight: ''
  });

  // Fetch farmer's own batches from backend
  useEffect(() => {
    API.get('/farmer/batches')
      .then(res => setBatches(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.log('Offline mode: using sample farmer batches', err));
  }, []);

  // Submit new product batch
  const handleRegisterBatch = async (e) => {
    e.preventDefault();

    const newBatchUI = {
      batch_id: batches.length + 101,
      product_type: formData.product_type,
      weight: Number(formData.weight),
      status: 'Pending'
    };

    // Update UI state immediately
    setBatches([newBatchUI, ...batches]);
    setFormData({ ...formData, weight: '' });
    setActiveTab('batches');

    // Post to Flask backend
    try {
      const payload = {
        farmer_id: Number(formData.farmer_id),
        product_type: formData.product_type,
        weight: Number(formData.weight)
      };

      await API.post('/farmer/batches', payload);
      console.log("Batch successfully registered in database!");
    } catch (err) {
      console.log("Backend offline or endpoint missing. Saved locally.", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Metrics
  const totalWeight = batches.reduce((acc, b) => acc + Number(b.weight || 0), 0);
  const pendingCount = batches.filter(b => b.status === 'Pending' || b.status === 'PENDING').length;

  return (
    <div className="farmer-container">
      {/* Top Header */}
      <header className="farmer-header">
        <div className="farmer-brand">
          <span>🌱 Aroma-Distributors</span>
          <span className="farmer-badge">FARMER PORTAL</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>[→ LOGOUT]</button>
      </header>

      <div className="farmer-layout">
        {/* Sidebar */}
        <aside className="farmer-sidebar">
          <div className="summary-card">
            <small className="summary-title">FARM SUMMARY</small>
            <div className="summary-row">
              <span>Total Produce</span>
              <strong>{totalWeight.toFixed(1)} kg</strong>
            </div>
            <div className="summary-row">
              <span>Pending Inspection</span>
              <strong className="text-orange">{pendingCount}</strong>
            </div>
          </div>

          <nav className="farmer-nav">
            <button 
              className={`nav-item ${activeTab === 'batches' ? 'active' : ''}`} 
              onClick={() => setActiveTab('batches')}
            >
              MY BATCHES
            </button>
            <button 
              className={`nav-item ${activeTab === 'register' ? 'active' : ''}`} 
              onClick={() => setActiveTab('register')}
            >
              + REGISTER NEW BATCH
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="farmer-main">
          
          {/* TAB 1: VIEW BATCHES */}
          {activeTab === 'batches' && (
            <div>
              <h1 className="view-header">MY PRODUCT BATCHES</h1>
              <p className="view-desc">List of all produce batches registered for admin review and order allocation.</p>

              <div className="table-wrapper">
                <table className="farmer-table">
                  <thead>
                    <tr>
                      <th>BATCH ID</th>
                      <th>PRODUCT TYPE</th>
                      <th>WEIGHT (KG)</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map(b => (
                      <tr key={b.batch_id}>
                        <td>#{b.batch_id}</td>
                        <td><strong>{b.product_type}</strong></td>
                        <td>{b.weight} kg</td>
                        <td>
                          <span className={`status-badge ${(b.status || 'pending').toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW BATCH */}
          {activeTab === 'register' && (
            <div>
              <h1 className="view-header">REGISTER NEW PRODUCE BATCH</h1>
              <p className="view-desc">Submit your harvested crop weight to make it available for client orders.</p>

              <div className="register-batch-card">
                <form onSubmit={handleRegisterBatch}>
                  
                  <div className="form-group">
                    <label>PRODUCT TYPE</label>
                    <select 
                      value={formData.product_type} 
                      onChange={e => setFormData({ ...formData, product_type: e.target.value })} 
                      className="form-input"
                    >
                      <option value="Tomatoes">Tomatoes</option>
                      <option value="Potatoes">Potatoes</option>
                      <option value="Butternut">Butternut</option>
                      <option value="Carrots">Carrots</option>
                      <option value="Onions">Onions</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>WEIGHT (KG)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="e.g. 50.0" 
                      value={formData.weight} 
                      onChange={e => setFormData({ ...formData, weight: e.target.value })} 
                      required 
                      className="form-input" 
                    />
                  </div>

                  <button type="submit" className="btn-submit-batch">+ SUBMIT BATCH FOR REVIEW</button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

// Default export at the bottom outside the component scope
export default FarmerDashboard;