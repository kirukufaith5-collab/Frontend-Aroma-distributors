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

  // Local history states for typed inputs
  const [clientHistory, setClientHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('client_history') || '[]');
  });
  const [batchHistory, setBatchHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('batch_history') || '[]');
  });

  // Free-text form state (Users can type names/IDs directly)
  const [formData, setFormData] = useState({
    clientInput: '',
    batchInput: '',
    allocated_weight: ''
  });

  // Fetch initial data from Flask
  const fetchInitialData = async () => {
    try {
      const [clientsRes, batchesRes, ordersRes] = await Promise.all([
        API.get('/admin/clients'),
        API.get('/admin/batches'),
        API.get('/admin/orders')
      ]);

      setClients(clientsRes.data || []);
      setBatches(batchesRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error('Failed to communicate with Flask backend:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleBatchStatus = async (batch_id, status) => {
    try {
      await API.put(`/admin/batches/${batch_id}/status`, { status });
      setBatches(prev => prev.map(b => b.batch_id === batch_id ? { ...b, status } : b));
    } catch (err) {
      console.error('Failed to update batch status:', err);
    }
  };

  const handleCloseOrder = async (order_id) => {
    try {
      await API.post(`/admin/orders/${order_id}/close`);
      setOrders(prev => prev.map(o => o.order_id === order_id ? { ...o, status: 'Closed' } : o));
    } catch (err) {
      console.error('Failed to close order:', err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Resolve client input to an existing client_id or match typed text
    const matchedClient = clients.find(
      c => String(c.client_id) === formData.clientInput.trim() || 
           c.company_name.toLowerCase() === formData.clientInput.trim().toLowerCase()
    );
    
    // Default to matched ID or parse raw typed input if numerical
    const resolvedClientId = matchedClient ? matchedClient.client_id : Number(formData.clientInput) || 1;

    // Resolve batch input
    const matchedBatch = batches.find(
      b => String(b.batch_id) === formData.batchInput.trim() ||
           b.product_type.toLowerCase() === formData.batchInput.trim().toLowerCase()
    );
    const resolvedBatchId = matchedBatch ? matchedBatch.batch_id : Number(formData.batchInput) || 101;

    // Save inputs to browser history if new
    if (formData.clientInput && !clientHistory.includes(formData.clientInput)) {
      const updatedHistory = [formData.clientInput, ...clientHistory].slice(0, 10);
      setClientHistory(updatedHistory);
      localStorage.setItem('client_history', JSON.stringify(updatedHistory));
    }

    if (formData.batchInput && !batchHistory.includes(formData.batchInput)) {
      const updatedHistory = [formData.batchInput, ...batchHistory].slice(0, 10);
      setBatchHistory(updatedHistory);
      localStorage.setItem('batch_history', JSON.stringify(updatedHistory));
    }

    const payload = {
      client_id: resolvedClientId,
      created_by_admin_id: 1,
      batch_id: resolvedBatchId,
      allocated_weight: Number(formData.allocated_weight)
    };

    try {
      const response = await API.post('/admin/orders', payload);
      
      if (response.status === 201) {
        // Fetch fresh database state
        const freshOrders = await API.get('/admin/orders');
        setOrders(freshOrders.data);

        // Reset form
        setFormData({ clientInput: '', batchInput: '', allocated_weight: '' });
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

          {/* TAB 3: CREATE ORDER (INPUT + HISTORY DATALIST) */}
          {activeTab === 'create' && (
            <div>
              <h1 className="view-header">CREATE CLIENT ORDER</h1>
              <p className="view-desc">Type client and batch names directly or pick from recent typed history.</p>
              
              <div className="create-order-card">
                <form onSubmit={handleCreateOrder}>
                  
                  {/* Client Input Field */}
                  <div className="form-group">
                    <label>CLIENT NAME OR ID</label>
                    <input
                      type="text"
                      list="client-suggestions"
                      placeholder="Type client name or ID (e.g. Fresh Mart)"
                      value={formData.clientInput}
                      onChange={e => setFormData({ ...formData, clientInput: e.target.value })}
                      required
                      className="form-input"
                    />
                    <datalist id="client-suggestions">
                      {/* Show recently typed entries */}
                      {clientHistory.map((item, idx) => (
                        <option key={`hist-c-${idx}`} value={item} label="Recent entry" />
                      ))}
                      {/* Show backend database options */}
                      {clients.map(c => (
                        <option key={c.client_id} value={c.company_name} label={`ID: #${c.client_id}`} />
                      ))}
                    </datalist>
                  </div>

                  {/* Batch Input Field */}
                  <div className="form-group">
                    <label>PRODUCT BATCH OR ID</label>
                    <input
                      type="text"
                      list="batch-suggestions"
                      placeholder="Type product name or Batch ID (e.g. Tomatoes or 101)"
                      value={formData.batchInput}
                      onChange={e => setFormData({ ...formData, batchInput: e.target.value })}
                      required
                      className="form-input"
                    />
                    <datalist id="batch-suggestions">
                      {/* Show recently typed entries */}
                      {batchHistory.map((item, idx) => (
                        <option key={`hist-b-${idx}`} value={item} label="Recent entry" />
                      ))}
                      {/* Show backend database options */}
                      {batches.map(b => (
                        <option key={b.batch_id} value={`${b.batch_id}`} label={`${b.product_type} (${b.weight}kg)`} />
                      ))}
                    </datalist>
                  </div>

                  {/* Allocated Weight Field */}
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