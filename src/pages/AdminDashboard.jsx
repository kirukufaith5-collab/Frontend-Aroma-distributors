import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  // Sample data fallback aligned with Product_Batches & Client_Orders schema
  const [batches, setBatches] = useState([
    { id: 1, date: '2026-07-10', farmer: 'James Kamau', product: 'Tomatoes', weight: '45.5 kg', notes: 'Grade A', status: 'APPROVED' },
    { id: 2, date: '2026-07-14', farmer: 'Maria Wanjiru', product: 'Potatoes', weight: '30 kg', notes: '—', status: 'PENDING' },
    { id: 3, date: '2026-07-15', farmer: 'John Mwangi', product: 'Butternut', weight: '22.8 kg', notes: '—', status: 'PENDING' },
    { id: 4, date: '2026-07-09', farmer: 'Rose Mwanzila', product: 'Onions', weight: '18.5 kg', notes: '—', status: 'APPROVED' }
  ]);

  const [orders, setOrders] = useState([
    { id: '01', date: '2026-07-08', client: 'Fresh Mart Supermarket', product: 'Tomatoes', qty: 120, unitPrice: 45, totalValue: 5400, status: 'ACTIVE' },
    { id: '02', date: '2026-07-11', client: 'Metro Garden Restaurant', product: 'Potatoes', qty: 80, unitPrice: 38, totalValue: 3040, status: 'ACTIVE' },
    { id: '03', date: '2026-07-02', client: 'FoodHub Corp', product: 'Butternut', qty: 200, unitPrice: 55, totalValue: 11000, status: 'CLOSED' }
  ]);

  // Consolidated form state for creating client order
  const [formData, setFormData] = useState({ clientName: '', productType: 'Tomatoes', quantity: '', unitPrice: '' });

  useEffect(() => {
    API.get('/admin/batches').then(res => setBatches(res.data)).catch(() => console.log('Offline fallback batches loaded'));
    API.get('/admin/orders').then(res => setOrders(res.data)).catch(() => console.log('Offline fallback orders loaded'));
  }, []);

  // Update Batch Status (Approve/Reject)
  const handleBatchStatus = async (id, status) => {
    try { await API.post(`/admin/batches/${id}/status`, { status }); } catch (err) { /* Offline UI fallback */ }
    setBatches(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  // Close Active Order
  const handleCloseOrder = async (orderId) => {
    try { await API.post(`/admin/orders/${orderId}/close`); } catch (err) { /* Offline UI fallback */ }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CLOSED' } : o));
  };

  // Submit New Order
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try { await API.post('/admin/orders', formData); } catch (err) { /* Offline fallback */ }
    alert('Order Created!');
    setFormData({ clientName: '', productType: 'Tomatoes', quantity: '', unitPrice: '' });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Dynamic calculations derived directly from state
  const pendingCount = batches.filter(b => b.status === 'PENDING').length;
  const activeOrdersCount = orders.filter(o => o.status === 'ACTIVE').length;
  const closedRevenue = orders.filter(o => o.status === 'CLOSED').reduce((acc, curr) => acc + curr.totalValue, 0);

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
            <div className="summary-row"><span>Pending approvals</span><strong className="text-orange">{pendingCount}</strong></div>
            <div className="summary-row"><span>Active orders</span><strong>{activeOrdersCount}</strong></div>
            <div className="summary-row"><span>Closed sales</span><strong>KSh {closedRevenue.toLocaleString()}</strong></div>
          </div>

          <nav className="admin-nav">
            <button className={`nav-item ${activeTab === 'receive' ? 'active' : ''}`} onClick={() => setActiveTab('receive')}>
              RECEIVE PRODUCTS <span className="counter-badge">{pendingCount}</span>
            </button>
            <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              ALL ORDERS
            </button>
            <button className={`nav-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
              + CREATE ORDER
            </button>
          </nav>
        </aside>

        <main className="admin-main">
          {/* TAB 1: RECEIVE PRODUCTS */}
          {activeTab === 'receive' && (
            <div>
              <h1 className="view-header">RECEIVE & APPROVE PRODUCTS</h1>
              <p className="view-desc">Review incoming batches from farmers and update their status.</p>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>DATE</th><th>FARMER</th><th>PRODUCT</th><th>WEIGHT</th><th>NOTES</th><th>STATUS</th><th>ACTIONS</th></tr>
                  </thead>
                  <tbody>
                    {batches.map(b => (
                      <tr key={b.id}>
                        <td>{b.date}</td>
                        <td><strong>{b.farmer}</strong></td>
                        <td><strong>{b.product}</strong></td>
                        <td>{b.weight}</td>
                        <td>{b.notes}</td>
                        <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
                        <td>
                          {b.status === 'PENDING' ? (
                            <div className="action-buttons">
                              <button className="btn-approve" onClick={() => handleBatchStatus(b.id, 'APPROVED')}>✔ APPROVE</button>
                              <button className="btn-reject" onClick={() => handleBatchStatus(b.id, 'REJECTED')}>✖ REJECT</button>
                            </div>
                          ) : <span className="no-action">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ALL ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="view-header">ALL ORDERS</h1>
              <p className="view-desc">Master list of all client orders.</p>
              <div className="orders-summary-bar">
                <div className="summary-col"><small>TOTAL ORDERS</small><h2>{orders.length}</h2></div>
                <div className="summary-col"><small>ACTIVE</small><h2>{activeOrdersCount}</h2></div>
                <div className="summary-col"><small>REVENUE (CLOSED)</small><h2>KSh {closedRevenue.toLocaleString()}</h2></div>
              </div>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>ORDER ID</th><th>DATE</th><th>CLIENT</th><th>PRODUCT</th><th>QTY (kg)</th><th>UNIT PRICE</th><th>TOTAL VALUE</th><th>STATUS</th><th>ACTIONS</th></tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.date}</td>
                        <td><strong>{o.client}</strong></td>
                        <td>{o.product}</td>
                        <td>{o.qty}</td>
                        <td>KSh {o.unitPrice}/kg</td>
                        <td><strong>KSh {o.totalValue.toLocaleString()}</strong></td>
                        <td><span className={`order-status ${o.status.toLowerCase()}`}>{o.status}</span></td>
                        <td>
                          {o.status === 'ACTIVE' ? (
                            <button className="btn-close-order" onClick={() => handleCloseOrder(o.id)}>CLOSE ORDER</button>
                          ) : <span className="settled-text">Settled</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CREATE CLIENT ORDER */}
          {activeTab === 'create' && (
            <div>
              <h1 className="view-header">CREATE CLIENT ORDER</h1>
              <p className="view-desc">Allocate product stock to a B2B client.</p>
              <div className="create-order-card">
                <form onSubmit={handleCreateOrder}>
                  <div className="form-group">
                    <label>CLIENT NAME</label>
                    <input type="text" placeholder="e.g. Fresh Mart Supermarket" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>PRODUCT TYPE</label>
                    <select value={formData.productType} onChange={e => setFormData({ ...formData, productType: e.target.value })} className="form-input">
                      <option value="Tomatoes">Tomatoes</option>
                      <option value="Potatoes">Potatoes</option>
                      <option value="Okra">Okra</option>
                      <option value="Butternut">Butternut</option>
                    </select>
                  </div>
                  <div className="form-grid-two-col">
                    <div className="form-group">
                      <label>QUANTITY (KG)</label>
                      <input type="number" placeholder="e.g. 100" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label>UNIT PRICE (KSh/KG)</label>
                      <input type="number" placeholder="e.g. 45" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} required className="form-input" />
                    </div>
                  </div>
                  <button type="submit" className="btn-create-order">+ CREATE ORDER</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};