import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');

  const [clients, setClients] = useState([]);
  const [batches, setBatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    batch_id: '',
    allocated_weight: ''
  });

  // Helper functions to pull fresh data directly from PostgreSQL/SQLAlchemy
  const fetchInitialData = async () => {
    try {
      const [clientsRes, batchesRes, ordersRes] = await Promise.all([
        API.get('/admin/clients'),
        API.get('/admin/batches'),
        API.get('/admin/orders')
      ]);

      setClients(clientsRes.data);
      setBatches(batchesRes.data);
      setOrders(ordersRes.data);

      // Set default values for dropdowns once data loads
      if (clientsRes.data.length > 0 && batchesRes.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          client_id: clientsRes.data[0].client_id,
          batch_id: batchesRes.data[0].batch_id
        }));
      }
    } catch (err) {
      console.error('Failed to communicate with Flask backend:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Update Batch Status
  const handleBatchStatus = async (batch_id, status) => {
    try {
      await API.put(`/admin/batches/${batch_id}/status`, { status });
      // Refresh local state after successful DB mutation
      setBatches(prev => prev.map(b => b.batch_id === batch_id ? { ...b, status } : b));
    } catch (err) {
      console.error('Failed to update status in database:', err);
    }
  };

  // Close Client Order
  const handleCloseOrder = async (order_id) => {
    try {
      await API.post(`/admin/orders/${order_id}/close`);
      setOrders(prev => prev.map(o => o.order_id === order_id ? { ...o, status: 'Closed' } : o));
    } catch (err) {
      console.error('Failed to close order in database:', err);
    }
  };

  // Create Order matching Flask backend structure
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      client_id: Number(formData.client_id),
      created_by_admin_id: 1,
      batch_id: Number(formData.batch_id),
      allocated_weight: Number(formData.allocated_weight)
    };

    try {
      // 1. Persist to Flask DB via POST /admin/orders
      const response = await API.post('/admin/orders', payload);
      
      if (response.status === 201) {
        console.log("Database entry saved! Assigned Order ID:", response.data.order_id);
        
        // 2. Fetch fresh order list directly from DB to guarantee schema alignment
        const freshOrders = await API.get('/admin/orders');
        setOrders(freshOrders.data);

        // 3. Reset state & return to overview
        setFormData({
          client_id: clients[0]?.client_id || '',
          batch_id: batches[0]?.batch_id || '',
          allocated_weight: ''
        });
        setActiveTab('orders');
      }
    } catch (err) {
      console.error("Database Save Failed:", err.response?.data || err.message);
      alert("Failed to write order to backend database.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const pendingBatchesCount = batches.filter(b => b.status === 'Available' || b.status === 'PENDING').length;
  const activeOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'ACTIVE').length;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-brand">
          <span>🌱 Aroma-Distributors</span>
          <span className="admin-badge">ADMIN</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>[→ LOGOUT]</button>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="summary-card">
            <small className="summary-title">OPERATIONS SUMMARY</small>
            <div className="summary-row">
              <span>Pending batches</span>
              <strong className="text-orange">{pendingBatchesCount}</strong>
            </div>
            <div className="summary-row">
              <span>Active orders</span>
              <strong>{activeOrdersCount}</strong>
            </div>
          </div>

          <nav className="admin-nav">
            <button 
              className={`nav-item ${activeTab === 'receive' ? 'active' : ''}`} 
              onClick={() => setActiveTab('receive')}
            >
              PRODUCT BATCHES <span className="counter-badge">{pendingBatchesCount}</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} 
              onClick={() => setActiveTab('orders')}
            >
              ALL ORDERS
            </button>
            <button 
              className={`nav-item ${activeTab === 'create' ? 'active' : ''}`} 
              onClick={() => setActiveTab('create')}
            >
              + CREATE ORDER
            </button>
          </nav>
        </aside>

        <main className="admin-main">
          {/* TAB 1: BATCHES */}
          {activeTab === 'receive' && (
            <div>
              <h1 className="view-header">PRODUCT BATCHES</h1>
              <p className="view-desc">Batches registered by farmers available for order allocation.</p>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>BATCH ID</th>
                      <th>FARMER</th>
                      <th>PRODUCT TYPE</th>
                      <th>WEIGHT (KG)</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map(b => (
                      <tr key={b.batch_id}>
                        <td>#{b.batch_id}</td>
                        <td><strong>{b.farmer_name || `Farmer #${b.farmer_id}`}</strong></td>
                        <td><strong>{b.product_type}</strong></td>
                        <td>{b.weight} kg</td>
                        <td><span className={`status-badge ${b.status?.toLowerCase()}`}>{b.status}</span></td>
                        <td>
                          {b.status === 'Available' || b.status === 'PENDING' ? (
                            <div className="action-buttons">
                              <button className="btn-approve" onClick={() => handleBatchStatus(b.batch_id, 'Approved')}>✔ APPROVE</button>
                              <button className="btn-reject" onClick={() => handleBatchStatus(b.batch_id, 'Rejected')}>✖ REJECT</button>
                            </div>
                          ) : (
                            <span className="no-action">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="view-header">CLIENT ORDERS</h1>
              <p className="view-desc">Master ledger from client_orders and ordered_items tables.</p>
              
              <div className="orders-summary-bar">
                <div className="summary-col">
                  <small>TOTAL ORDERS</small>
                  <h2>{orders.length}</h2>
                </div>
                <div className="summary-col">
                  <small>ACTIVE / PENDING</small>
                  <h2>{activeOrdersCount}</h2>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ORDER ID</th>
                      <th>CLIENT</th>
                      <th>PRODUCT</th>
                      <th>ALLOCATED WEIGHT (KG)</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.order_id}>
                        <td>#{o.order_id}</td>
                        <td><strong>{o.client_name}</strong></td>
                        <td>{o.product_type}</td>
                        <td><strong>{o.allocated_weight} kg</strong></td>
                        <td>
                          <span className={`order-status ${o.status?.toLowerCase()}`}>{o.status}</span>
                        </td>
                        <td>
                          {o.status === 'Pending' || o.status === 'ACTIVE' ? (
                            <button className="btn-close-order" onClick={() => handleCloseOrder(o.order_id)}>CLOSE ORDER</button>
                          ) : (
                            <span className="settled-text">Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CREATE ORDER */}
          {activeTab === 'create' && (
            <div>
              <h1 className="view-header">CREATE CLIENT ORDER</h1>
              <p className="view-desc">Create a ClientOrder entry and allocate ProductBatch weight via OrderedItem.</p>
              
              <div className="create-order-card">
                <form onSubmit={handleCreateOrder}>
                  <div className="form-group">
                    <label>SELECT CLIENT</label>
                    <select 
                      value={formData.client_id} 
                      onChange={e => setFormData({ ...formData, client_id: e.target.value })} 
                      className="form-input"
                      required
                    >
                      {clients.map(c => (
                        <option key={c.client_id} value={c.client_id}>
                          {c.company_name} (ID: #{c.client_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>SELECT PRODUCT BATCH TO ALLOCATE FROM</label>
                    <select 
                      value={formData.batch_id} 
                      onChange={e => setFormData({ ...formData, batch_id: e.target.value })} 
                      className="form-input"
                      required
                    >
                      {batches.map(b => (
                        <option key={b.batch_id} value={b.batch_id}>
                          Batch #{b.batch_id} - {b.product_type} ({b.weight} kg available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>ALLOCATED WEIGHT (KG)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="e.g. 50" 
                      value={formData.allocated_weight} 
                      onChange={e => setFormData({ ...formData, allocated_weight: e.target.value })} 
                      required 
                      className="form-input" 
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-create-order">
                    {loading ? 'SAVING TO DATABASE...' : '+ SAVE ORDER TO DATABASE'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};