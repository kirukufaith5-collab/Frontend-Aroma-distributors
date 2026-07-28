import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  // Navigation tab state ('receive', 'orders', 'create')
  const [activeTab, setActiveTab] = useState('orders'); // Defaulted to 'orders' to match screenshot

  // Tab 1: Sample data for Farmer Batches
  const [batches, setBatches] = useState([
    { id: 1, date: '2026-07-10', farmer: 'James Kamua', product: 'Tomatoes', weight: '45.5 kg', notes: 'Grade A', status: 'APPROVED' },
    { id: 2, date: '2026-07-14', farmer: 'Maria  Wanjiru', product: 'Potatoes', weight: '30 kg', notes: '—', status: 'PENDING' },
    { id: 3, date: '2026-07-15', farmer: 'John Mwangi', product: 'Butternut', weight: '22.8 kg', notes: '—', status: 'PENDING' },
    { id: 4, date: '2026-07-09', farmer: 'Rose Mwanzila', product: 'Onions', weight: '18.5 kg', notes: '—', status: 'APPROVED' },
    { id: 5, date: '2026-07-12', farmer: 'Timothy Kalila', product: 'Carrot', weight: '35 kg', notes: 'Below minimum grade', status: 'REJECTED' }
  ]);

  // Tab 2: Sample data for Client Orders (Matching the image)
  const [orders, setOrders] = useState([
    { id: '01', date: '2026-07-08', client: 'Fresh Mart Supermarket', product: 'Tomatoes', qty: 120, unitPrice: 45, totalValue: 5400, status: 'ACTIVE' },
    { id: '02', date: '2026-07-11', client: 'Metro Garden Restaurant', product: 'Potatoes', qty: 80, unitPrice: 38, totalValue: 3040, status: 'ACTIVE' },
    { id: '03', date: '2026-07-02', client: 'FoodHub Corp', product: 'Butternut', qty: 200, unitPrice: 55, totalValue: 11000, status: 'CLOSED' },
    { id: '04', date: '2026-06-28', client: 'Bloom Bistro', product: 'Okra', qty: 60, unitPrice: 60, totalValue: 3600, status: 'CLOSED' }
  ]);

  // Tab 3: Form state for creating client order
  const [clientName, setClientName] = useState('');
  const [productType, setProductType] = useState('Pechay');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  // Fetch initial data from backend API
  useEffect(() => {
    API.get('/admin/batches')
      .then(res => setBatches(res.data))
      .catch(err => console.log('Using sample batches (API offline)'));

    API.get('/admin/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.log('Using sample orders (API offline)'));
  }, []);

  // Update batch status (Approve / Reject)
  const handleBatchStatus = (id, newStatus) => {
    API.post(`/admin/batches/${id}/status`, { status: newStatus })
      .then(() => {
        setBatches(batches.map(b => b.id === id ? { ...b, status: newStatus } : b));
      })
      .catch(() => {
        setBatches(batches.map(b => b.id === id ? { ...b, status: newStatus } : b));
      });
  };

  // Close order action button handler
  const handleCloseOrder = (orderId) => {
    API.post(`/admin/orders/${orderId}/close`)
      .then(() => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CLOSED' } : o));
      })
      .catch(() => {
        // Local offline fallback
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CLOSED' } : o));
      });
  };

  // Create Order submit handler
  const handleCreateOrder = (e) => {
    e.preventDefault();
    const newOrder = { client_name: clientName, product_type: productType, quantity, unit_price: unitPrice };

    API.post('/admin/orders', newOrder)
      .then(() => {
        alert('Order Created!');
        setClientName(''); setQuantity(''); setUnitPrice('');
      })
      .catch(() => {
        alert('Order Created (Offline)!');
        setClientName(''); setQuantity(''); setUnitPrice('');
      });
  };

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="admin-container">
      {/* Top Header Navigation */}
      <header className="admin-header">
        <div className="admin-brand">
          <span>🌱 Aroma-Distributors</span>
          <span className="admin-badge">ADMIN</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>[→ LOGOUT</button>
      </header>

      <div className="admin-layout">
        {/* Sidebar Menu */}
        <aside className="admin-sidebar">
          <div className="summary-card">
            <small className="summary-title">OPERATIONS SUMMARY</small>
            <div className="summary-row">
              <span>Pending approvals</span>
              <strong className="text-orange">2</strong>
            </div>
            <div className="summary-row">
              <span>Active orders</span>
              <strong>2</strong>
            </div>
            <div className="summary-row">
              <span>Stock approved</span>
              <strong>64.0 kg</strong>
            </div>
            <div className="summary-row">
              <span>Closed sales</span>
              <strong>₱14,600</strong>
            </div>
          </div>

          <nav className="admin-nav">
            <button 
              className={`nav-item ${activeTab === 'receive' ? 'active' : ''}`}
              onClick={() => setActiveTab('receive')}
            >
             RECEIVE PRODUCTS <span className="counter-badge">2</span>
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

        {/* Main Panel */}
        <main className="admin-main">
          
          {/* TAB 1: RECEIVE PRODUCTS */}
          {activeTab === 'receive' && (
            <div>
              <h1 className="view-header">RECEIVE & APPROVE PRODUCTS</h1>
              <p className="view-desc">Review incoming batches from farmers and update their status.</p>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>FARMER</th>
                    <th>PRODUCT</th>
                    <th>WEIGHT</th>
                    <th>NOTES</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((item) => (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td><strong>{item.farmer}</strong></td>
                      <td><strong>{item.product}</strong></td>
                      <td>{item.weight}</td>
                      <td>{item.notes}</td>
                      <td>
                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === 'PENDING' ? (
                          <div className="action-buttons">
                            <button className="btn-approve" onClick={() => handleBatchStatus(item.id, 'APPROVED')}>✔ APPROVE</button>
                            <button className="btn-reject" onClick={() => handleBatchStatus(item.id, 'REJECTED')}>✖ REJECT</button>
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
          )}

          {/* TAB 2: ALL ORDERS (Matching Image) */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="view-header">ALL ORDERS</h1>
              <p className="view-desc">Master list of all client orders.</p>

              {/* Top Orders Summary Box */}
              <div className="orders-summary-bar">
                <div className="summary-col">
                  <small>TOTAL ORDERS</small>
                  <h2>4</h2>
                </div>
                <div className="summary-col">
                  <small>ACTIVE</small>
                  <h2>2</h2>
                </div>
                <div className="summary-col">
                  <small>REVENUE (CLOSED)</small>
                  <h2>₱14,600</h2>
                </div>
              </div>

              {/* Orders Table */}
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>DATE</th>
                    <th>CLIENT</th>
                    <th>PRODUCT</th>
                    <th>QTY (kg)</th>
                    <th>UNIT PRICE</th>
                    <th>TOTAL VALUE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.date}</td>
                      <td><strong>{o.client}</strong></td>
                      <td>{o.product}</td>
                      <td>{o.qty}</td>
                      <td>₱{o.unitPrice}/kg</td>
                      <td><strong>₱{o.totalValue.toLocaleString()}</strong></td>
                      
                      {/* Status Badge */}
                      <td>
                        <span className={`order-status ${o.status.toLowerCase()}`}>
                          {o.status}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td>
                        {o.status === 'ACTIVE' ? (
                          <button 
                            className="btn-close-order" 
                            onClick={() => handleCloseOrder(o.id)}
                          >
                            CLOSE ORDER
                          </button>
                        ) : (
                          <span className="settled-text">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: CREATE CLIENT ORDER */}
          {activeTab === 'create' && (
            <div>
              <h1 className="view-header">CREATE CLIENT ORDER</h1>
              <p className="view-desc">Allocate product stock to a B2B client.</p>

              <div className="order-form-container">
                <form onSubmit={handleCreateOrder}>
                  <div className="form-group">
                    <label>CLIENT NAME</label>
                    <input type="text" placeholder="e.g. Fresh Mart Supermarket" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="form-input" />
                  </div>

                  <div className="form-group">
                    <label>PRODUCT TYPE</label>
                    <select value={productType} onChange={(e) => setProductType(e.target.value)} className="form-input">
                      <option value="Tomatoes">Tomatoes</option>
                      <option value="Potatoes">Potatoes</option>
                      <option value="Okra">Okra</option>
                      <option value="Butternut">Butternut</option>
                    </select>
                  </div>

                  <div className="form-row-two-col">
                    <div className="form-group">
                      <label>QUANTITY (KG)</label>
                      <input type="number" placeholder="e.g. 100" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="form-input" />
                    </div>

                    <div className="form-group">
                      <label>UNIT PRICE (₱/KG)</label>
                      <input type="number" placeholder="e.g. 45" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required className="form-input" />
                    </div>
                  </div>

                  <button type="submit" className="btn-dark-green">+ CREATE ORDER</button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};