import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';

const FarmerDashboard = () => {
  const navigate = useNavigate();

  // Navigation tab state: 'batches' | 'register'
  const [activeTab, setActiveTab] = useState('batches');

  // Batches state & Loading indicator
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // New batch form state
  const [formData, setFormData] = useState({
    product_type: 'Tomatoes',
    weight: ''
  });

  // Fetch farmer's own batches from backend
  const fetchFarmerBatches = async () => {
    try {
      setLoading(true);
      
      // Try fetching via /farmer/batches
      const res = await API.get('/farmer/batches');
      if (Array.isArray(res.data)) {
        setBatches(res.data);
      } else {
        setBatches([]);
      }
    } catch (err) {
      console.error('Error loading farmer batches:', err);
      // Fallback default state if API fails
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerBatches();
  }, []);

  // Submit new product batch to Flask API
  const handleRegisterBatch = async (e) => {
    e.preventDefault();

    if (!formData.weight || Number(formData.weight) <= 0) {
      alert('Please enter a valid weight.');
      return;
    }

    try {
      // Get logged-in user ID from localStorage if stored during login
      const storedUserId = localStorage.getItem('user_id');

      const payload = {
        farmer_id: storedUserId ? Number(storedUserId) : undefined,
        product_type: formData.product_type,
        weight: Number(formData.weight)
      };

      // 1. Post to Flask backend first
      const res = await API.post('/farmer/batches', payload);

      alert(res.data?.message || 'Batch successfully registered!');

      // 2. Clear inputs and redirect tab
      setFormData({ product_type: 'Tomatoes', weight: '' });
      setActiveTab('batches');

      // 3. Re-fetch fresh list from database
      fetchFarmerBatches();

    } catch (err) {
      console.error('Failed to submit batch:', err);
      alert(err.response?.data?.message || 'Failed to submit batch. Check if you are logged in.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Metrics
  const totalWeight = batches.reduce((acc, b) => acc + Number(b.weight || 0), 0);
  const pendingCount = batches.filter(
    b => (b.status || '').toLowerCase() === 'pending'
  ).length;

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
                    {loading ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                          Loading batches...
                        </td>
                      </tr>
                    ) : batches.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#78716C' }}>
                          No batches registered yet. Click "+ REGISTER NEW BATCH" to add one.
                        </td>
                      </tr>
                    ) : (
                      batches.map(b => (
                        <tr key={b.batch_id}>
                          <td>#{b.batch_id}</td>
                          <td><strong>{b.product_type}</strong></td>
                          <td>{b.weight} kg</td>
                          <td>
                            <span className={`status-badge ${(b.status || 'pending').toLowerCase()}`}>
                              {b.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
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

export default FarmerDashboard;