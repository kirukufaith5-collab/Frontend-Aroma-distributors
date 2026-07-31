import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  // Navigation tab state: 'orders' | 'receive' | 'create'
  const [activeTab, setActiveTab] = useState('orders');

  // Database-aligned states
  const [clients, setClients] = useState([
    { client_id: 1, company_name: 'Fresh Mart Supermarket' },
    { client_id: 2, company_name: 'Metro Garden Restaurant' },
    { client_id: 3, company_name: 'FoodHub Corp' }
  ]);

  const [batches, setBatches] = useState([
    { batch_id: 101, farmer_name: 'James Kamau', product_type: 'Tomatoes', weight: 45.5, status: 'Available' },
    { batch_id: 102, farmer_name: 'Maria Wanjiru', product_type: 'Potatoes', weight: 30.0, status: 'Available' },
    { batch_id: 103, farmer_name: 'John Mwangi', product_type: 'Butternut', weight: 22.8, status: 'Available' }
  ]);

  const [orders, setOrders] = useState([
    { order_id: 1, client_name: 'Fresh Mart Supermarket', product_type: 'Tomatoes', allocated_weight: 120, status: 'Pending' },
    { order_id: 2, client_name: 'Metro Garden Restaurant', product_type: 'Potatoes', allocated_weight: 80, status: 'Pending' },
    { order_id: 3, client_name: 'FoodHub Corp', product_type: 'Butternut', allocated_weight: 200, status: 'Closed' }
  ]);

  // Form state aligned to ClientOrder + OrderedItem models
  const [formData, setFormData] = useState({
    client_id: '1',
    batch_id: '101',
    allocated_weight: ''
  });

  // Fetch initial data from Flask API
  useEffect(() => {
    API.get('/admin/clients')
      .then(res => setClients(res.data))
      .catch(() => console.log('Offline: using sample clients'));

    API.get('/admin/batches')
      .then(res => setBatches(res.data))
      .catch(() => console.log('Offline: using sample batches'));

    API.get('/admin/orders')
      .then(res => setOrders(res.data))
      .catch(() => console.log('Offline: using sample orders'));
  }, []);

  // Update Batch Status (Approve / Reject incoming batches)
  const handleBatchStatus = async (batch_id, status) => {
    try {
      await API.post(`/admin/batches/${batch_id}/status`, { status });
    } catch (err) {
      console.log('Offline mode: updated batch status locally');
    }
    setBatches(prev => prev.map(b => b.batch_id === batch_id ? { ...b, status } : b));
  };

  // Close Client Order (Updates status in ClientOrder model)
  const handleCloseOrder = async (order_id) => {
    try {
      await API.post(`/admin/orders/${order_id}/close`);
    } catch (err) {
      console.log('Offline mode: closed order locally');
    }
    setOrders(prev => prev.map(o => o.order_id === order_id ? { ...o, status: 'Closed' } : o));
  };

  // Create Order matching ClientOrder and OrderedItem schema
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    const selectedClient = clients.find(c => String(c.client_id) === String(formData.client_id));
    const selectedBatch = batches.find(b => String(b.batch_id) === String(formData.batch_id));

    // Construct UI object mirroring ClientOrder + OrderedItem join data
    const newOrderUI = {
      order_id: orders.length + 1,
      client_name: selectedClient ? selectedClient.company_name : 'Unknown Client',
      product_type: selectedBatch ? selectedBatch.product_type : 'Product',
      allocated_weight: Number(formData.allocated_weight),
      status: 'Pending'
    };

    // 1. Update UI state immediately
    setOrders([newOrderUI, ...orders]);

    // 2. Reset form & switch back to ALL ORDERS tab
    setFormData({ client_id: clients[0]?.client_id || '1', batch_id: batches[0]?.batch_id || '101', allocated_weight: '' });
    setActiveTab('orders');

    // 3. Payload sent to Flask matching backend Models
    try {
      const payload = {
        client_id: Number(formData.client_id),
        created_by_admin_id: 1, // Currently logged in Admin ID
        batch_id: Number(formData.batch_id),
        allocated_weight: Number(formData.allocated_weight)
      };

      await API.post('/admin/orders', payload);
      console.log("Saved directly to Flask backend database!");
    } catch (err) {
      console.log("Backend offline or endpoint missing. Updated local state.", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Operations Metrics
  const pendingBatchesCount = batches.filter(b => b.status === 'Available' || b.status === 'PENDING').length;
  const activeOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'ACTIVE').length;

  return (
    <div className="admin-container">
      {/* Top Bar */}
      <header className="admin-header">
        <div className="admin-brand">
          <span>🌱 Aroma-Distributors</span>
          <span className="admin-badge">ADMIN</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>[→ LOGOUT]</button>
      </header>

      <div className="admin-layout">
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="admin-main">
          
          {/* TAB 1: PRODUCT BATCHES */}
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
                        <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
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

          {/* TAB 2: ALL CLIENT ORDERS */}
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
                          <span className={`order-status ${o.status.toLowerCase()}`}>{o.status}</span>
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

          {/* TAB 3: CREATE ORDER FORM */}
          {activeTab === 'create' && (
            <div>
              <h1 className="view-header">CREATE CLIENT ORDER</h1>
              <p className="view-desc">Create a ClientOrder entry and allocate ProductBatch weight via OrderedItem.</p>
              
              <div className="create-order-card">
                <form onSubmit={handleCreateOrder}>
                  {/* Select Client (Foreign key: clients.client_id) */}
                  <div className="form-group">
                    <label>SELECT CLIENT</label>
                    <select 
                      value={formData.client_id} 
                      onChange={e => setFormData({ ...formData, client_id: e.target.value })} 
                      className="form-input"
                    >
                      {clients.map(c => (
                        <option key={c.client_id} value={c.client_id}>
                          {c.company_name} (ID: #{c.client_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Inventory Batch (Foreign key: product_batches.batch_id) */}
                  <div className="form-group">
                    <label>SELECT PRODUCT BATCH TO ALLOCATE FROM</label>
                    <select 
                      value={formData.batch_id} 
                      onChange={e => setFormData({ ...formData, batch_id: e.target.value })} 
                      className="form-input"
                    >
                      {batches.map(b => (
                        <option key={b.batch_id} value={b.batch_id}>
                          Batch #{b.batch_id} - {b.product_type} ({b.weight} kg available)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Allocated Weight field (OrderedItem.allocated_weight) */}
                  <div className="form-group">
                    <label>ALLOCATED WEIGHT (KG)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 50" 
                      value={formData.allocated_weight} 
                      onChange={e => setFormData({ ...formData, allocated_weight: e.target.value })} 
                      required 
                      className="form-input" 
                    />
                  </div>

                  <button type="submit" className="btn-create-order">+ SAVE ORDER TO DATABASE</button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
