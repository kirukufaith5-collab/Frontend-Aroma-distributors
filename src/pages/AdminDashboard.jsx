import React, { useState, useEffect } from 'react';
import API from "../services/api";
import { Sidebar } from "../components/Sidebar.js";
import { Status } from "../components/Status.jsx";
import "./AdminDashboard.css";

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('receive');
  const [batches, setBatches] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchPendingBatches();
    fetchOrders();
  }, []);

  const fetchPendingBatches = async () => {
    try {
      const res = await API.get('/admin/batches');
      setBatches(res.data);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleUpdateBatchStatus = async (batchId, newStatus) => {
    try {
      await API.patch(`/admin/batches/${batchId}`, { status: newStatus });
      fetchPendingBatches();
    } catch (err) {
      alert('Failed to update batch status.');
    }
  };

  const handleCloseOrder = async (orderId) => {
    try {
      await API.patch(`/admin/orders/${orderId}/close`);
      fetchOrders();
    } catch (err) {
      alert('Failed to close order.');
    }
  };

  const pendingCount = batches.filter((b) => b.status === 'PENDING').length;

  const metrics = [
    { label: 'Pending approvals', value: pendingCount, highlight: pendingCount > 0 },
    { label: 'Active orders', value: orders.filter((o) => o.status === 'ACTIVE').length },
    { label: 'Stock approved', value: '64.0 kg' },
    { label: 'Closed sales', value: '₱14,600' },
  ];

  const navItems = [
    { id: 'receive', label: 'Receive Products'},
    { id: 'orders', label: 'All Orders' },
    { id: 'create', label: 'Create Order' },
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <span className="admin-brand">🌱 Aroma-distributors</span>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="admin-logout-btn"
        >
          ↳ LOGOUT
        </button>
      </header>

      <div className="admin-content-layout">
        <Sidebar
          title="OPERATIONS SUMMARY"
          metrics={metrics}
          navItems={navItems}
          activeTab={activeTab}
          onTabSelect={setActiveTab}
        />

        <main className="admin-main-panel">
          {activeTab === 'receive' && (
            <ReceiveProductsView batches={batches} onUpdateStatus={handleUpdateBatchStatus} />
          )}
          {activeTab === 'orders' && (
            <AllOrdersView orders={orders} onCloseOrder={handleCloseOrder} />
          )}
          {activeTab === 'create' && (
            <CreateOrderView onOrderCreated={fetchOrders} />
          )}
        </main>
      </div>
    </div>
  );
};

// 1. Receive Products View
const ReceiveProductsView = ({ batches, onUpdateStatus }) => (
  <div>
    <h2 className="view-title">RECEIVE & APPROVE PRODUCTS</h2>
    <p className="view-subtitle">Review incoming batches from farmers and update their status.</p>

    <div className="table-wrapper">
      <table className="data-table">
        <thead className="table-head">
          <tr>
            <th className="table-th">Date</th>
            <th className="table-th">Farmer</th>
            <th className="table-th">Product</th>
            <th className="table-th">Weight</th>
            <th className="table-th">Status</th>
            <th className="table-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.id}>
              <td className="table-td">{b.created_at}</td>
              <td className="table-td-bold">{b.farmer_name}</td>
              <td className="table-td-bold">{b.vegetable_type}</td>
              <td className="table-td">{b.weight} kg</td>
              <td className="table-td">
                <StatusBadge status={b.status} />
              </td>
              <td className="table-td">
                {b.status === 'PENDING' ? (
                  <div className="table-actions">
                    <button onClick={() => onUpdateStatus(b.id, 'APPROVED')} className="btn-approve">
                      ✓ APPROVE
                    </button>
                    <button onClick={() => onUpdateStatus(b.id, 'REJECTED')} className="btn-reject">
                      ✖ REJECT
                    </button>
                  </div>
                ) : (
                  <span style={{ color: '#A8A29E' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// 2. Create Order View
const CreateOrderView = ({ onOrderCreated }) => {
  const [formData, setFormData] = useState({
    client_name: '',
    product_type: 'Tomatoes',
    quantity: '',
    unit_price: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/orders', formData);
      alert('Order created successfully!');
      setFormData({ client_name: '', Product_type: 'Tomatoes', quantity: '', unit_price: '' });
      onOrderCreated();
    } catch (err) {
      alert('Failed to save order to database.');
    }
  };

  return (
    <div>
      <h2 className="view-title">CREATE CLIENT ORDER</h2>
      <p className="view-subtitle">Allocate product stock to a B2B client.</p>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label className="form-label">Client Name</label>
          <input
            required
            type="text"
            value={formData.client_name}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            placeholder="e.g. Fresh Mart Supermarket"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Vegetable Type</label>
          <select
            value={formData.vegetable_type}
            onChange={(e) => setFormData({ ...formData, vegetable_type: e.target.value })}
            className="form-input"
          >
            <option value="Tomatoes">Tomatoes</option>
            <option value="Potatoes">Potatoes</option>
            <option value="Cabbages">Cabbage</option>
          </select>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Quantity (KG)</label>
            <input
              required
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="e.g. 100"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Unit Price (₱/KG)</label>
            <input
              required
              type="number"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              placeholder="e.g. 45"
              className="form-input"
            />
          </div>
        </div>

        <div>
          <button type="submit" className="btn-submit">
            + Create Order
          </button>
        </div>
      </form>
    </div>
  );
};