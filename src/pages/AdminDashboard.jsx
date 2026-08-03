import React, { useState, useEffect } from 'react';
import API from '../services/api';

export const AdminDashboard = () => {
  // Form State Variable Bindings
  const [clientInput, setClientInput] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [allocatedWeight, setAllocatedWeight] = useState('');

  // Dashboard Data State
  const [orders, setOrders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'batches', or 'create'

  // Fetch Dashboard Data from Backend API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, batchesRes] = await Promise.all([
        API.get('/admin/orders'),
        API.get('/admin/batches')
      ]);

      setOrders(ordersRes.data || []);
      setBatches(batchesRes.data || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Submit New Client Order
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    const payload = {
      client_id: clientInput,
      batch_id: batchInput,
      allocated_weight: parseFloat(allocatedWeight) || 0
    };

    try {
      const res = await API.post('/admin/orders', payload);
      alert(res.data?.message || 'Order successfully saved to database!');
      
      // Clear inputs
      setClientInput('');
      setBatchInput('');
      setAllocatedWeight('');

      // Refresh list & redirect to orders view
      fetchData();
      setActiveTab('orders');
    } catch (err) {
      console.error('Order creation error:', err);
      alert(err.response?.data?.message || 'Failed to save order to database.');
    }
  };

  // Compute Metrics for Upper Summary Cards
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(o => o.status !== 'Closed' && o.status !== 'Rejected').length;
  const pendingBatchesCount = batches.filter(b => b.status === 'Pending').length;

  return (
    <div className="admin-container">
      {/* 1. BRAND HEADER & NAVBAR */}
      <header className="admin-header">
        <div className="admin-brand">
        🌱 AROMA-DISTRIBUTORS
          <span className="admin-badge">ADMIN</span>
        </div>
        <button className="admin-logout-btn btn-logout">
          [&rarr; LOGOUT]
        </button>
      </header>

      {/* 2. MAIN LAYOUT (SIDEBAR + CONTENT) */}
      <div className="admin-layout">
        {/* Left Sidebar Panel */}
        <aside className="admin-sidebar">
          {/* Operations Summary Card */}
          <div className="summary-card">
            <span className="summary-title">OPERATIONS SUMMARY</span>
            <div className="summary-row">
              <span>Pending batches</span>
              <strong>{pendingBatchesCount}</strong>
            </div>
            <div className="summary-row">
              <span>Active orders</span>
              <strong>{activeOrdersCount}</strong>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="admin-nav">
            <button 
              className={`nav-btn nav-item ${activeTab === 'batches' ? 'active nav-item-active' : ''}`}
              onClick={() => setActiveTab('batches')}
            >
              <span>PRODUCT BATCHES</span>
              <span className="nav-badge counter-badge">{batches.length}</span>
            </button>

            <button 
              className={`nav-btn nav-item ${activeTab === 'orders' ? 'active nav-item-active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              ALL ORDERS
            </button>

            <button 
              className={`nav-btn nav-item ${activeTab === 'create' ? 'active nav-item-active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
            CREATE ORDER
            </button>
          </nav>
        </aside>

        {/* Right Main Panel */}
        <main className="admin-main">
          {activeTab === 'create' ? (
            /* CREATE ORDER FORM VIEW */
            <div>
              <h1 className="view-header view-title">CREATE CLIENT ORDER</h1>
              <p className="view-desc">Allocate available inventory batches to client accounts.</p>

              <div className="form-card create-order-card">
                <form onSubmit={handleCreateOrder}>
                  <div className="form-group">
                    <label className="form-label admin-label">CLIENT NAME OR ID</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. 1 or Client Name"
                      value={clientInput}
                      onChange={(e) => setClientInput(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label admin-label">PRODUCT BATCH OR ID</label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. 2 or Honey"
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label admin-label">ALLOCATED WEIGHT (KG)</label>
                    <input 
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="e.g. 50"
                      value={allocatedWeight}
                      onChange={(e) => setAllocatedWeight(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-bright-green btn-submit btn-submit-batch">
                    SAVE TO DATABASE
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* ALL ORDERS LEDGER VIEW */
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h1 className="view-header view-title">CLIENT ORDERS</h1>
                <p className="view-desc">Master ledger from client_orders and ordered_items tables.</p>
              </div>

              {/* Metrics Summary Top Bar */}
              <div className="orders-summary-bar">
                <div className="summary-col">
                  <small>TOTAL ORDERS</small>
                  <h2>{totalOrdersCount}</h2>
                </div>
                <div className="summary-col">
                  <small>ACTIVE / PENDING</small>
                  <h2>{activeOrdersCount}</h2>
                </div>
                <div className="summary-col">
                  <small>PENDING BATCHES</small>
                  <h2>{pendingBatchesCount}</h2>
                </div>
              </div>

              {/* Orders Data Table */}
              <div className="table-wrapper table-container">
                <table className="admin-table data-table custom-table">
                  <thead className="custom-table-head">
                    <tr>
                      <th className="custom-table-th">ORDER ID</th>
                      <th className="custom-table-th">CLIENT</th>
                      <th className="custom-table-th">PRODUCT</th>
                      <th className="custom-table-th">ALLOCATED WEIGHT (KG)</th>
                      <th className="custom-table-th">STATUS</th>
                      <th className="custom-table-th">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="custom-table-td" style={{ textAlign: 'center' }}>
                          Loading order ledger...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="custom-table-td" style={{ textAlign: 'center', color: '#78716C' }}>
                          No orders registered in system.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.order_id}>
                          <td className="custom-table-td font-mono">#{o.order_id}</td>
                          <td className="custom-table-td">{o.client_name || o.client_id || 'Unknown Client'}</td>
                          <td className="custom-table-td">{o.product_type || 'Produce'}</td>
                          <td className="custom-table-td">{o.allocated_weight || 0}</td>
                          <td className="custom-table-td">
                            <span className={`status-badge badge order-status ${
                              (o.status || 'approved').toLowerCase()
                            }`}>
                              {o.status || 'Approved'}
                            </span>
                          </td>
                          <td className="custom-table-td">
                            <button className="btn-action-close btn-close-order">
                              CLOSE ORDER
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
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

export default AdminDashboard;