import React, { useState, useEffect } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar.jsx";
import Status from "../components/Status.jsx"; // Imported correctly

export function AdminDashboard() {
  // --- 1. STATE VARIABLES ---
  // State holds data that changes in our app
  const [activeTab, setActiveTab] = useState("receive"); // Controls which page view is shown
  const [batches, setBatches] = useState([]); // Stores product batches from farmers
  const [orders, setOrders] = useState([]); // Stores client orders

  // --- 2. FETCH DATA WHEN COMPONENT LOADS ---
  useEffect(() => {
    fetchBatches();
    fetchOrders();
  }, []); // The empty [] means "run this only once when the page loads"

  // Function to load batches from the server
  const fetchBatches = async () => {
    try {
      const response = await API.get("/admin/batches");
      setBatches(response.data);
    } catch (error) {
      console.error("Error loading batches:", error);
    }
  };

  // Function to load orders from the server
  const fetchOrders = async () => {
    try {
      const response = await API.get("/admin/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  // --- 3. EVENT HANDLERS ---
  // Change batch status (Approve or Reject)
  const handleUpdateBatchStatus = async (batchId, newStatus) => {
    try {
      await API.patch(`/admin/batches/${batchId}`, { status: newStatus });
      fetchBatches(); // Reload batches to show the updated status
    } catch (error) {
      alert("Failed to update batch status.");
    }
  };

  // Close an existing order
  const handleCloseOrder = async (orderId) => {
    try {
      await API.patch(`/admin/orders/${orderId}/close`);
      fetchOrders(); // Reload orders to show updated status
    } catch (error) {
      alert("Failed to close order.");
    }
  };

  // Log out user
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // --- 4. CALCULATE METRICS FOR SIDEBAR ---
  const pendingCount = batches.filter((batch) => batch.status === "PENDING").length;
  const activeOrdersCount = orders.filter((order) => order.status === "ACTIVE").length;

  const metrics = [
    { label: "Pending approvals", value: pendingCount, highlight: pendingCount > 0 },
    { label: "Active orders", value: activeOrdersCount },
    { label: "Stock approved", value: "64.0 kg" },
    { label: "Closed sales", value: "₱14,600" },
  ];

  const navItems = [
    { id: "receive", label: "Receive Products" },
    { id: "orders", label: "All Orders" },
    { id: "create", label: "Create Order" },
  ];

  // --- 5. RENDER THE INTERFACE ---
  return (
    <div className="admin-container">
      {/* Top Header */}
      <header className="admin-header">
        <span className="admin-brand">🌱 Aroma-distributors</span>
        <button onClick={handleLogout} className="admin-logout-btn">
          ↳ LOGOUT
        </button>
      </header>

      {/* Main Layout */}
      <div className="admin-content-layout">
        <Sidebar
          title="OPERATIONS SUMMARY"
          metrics={metrics}
          navItems={navItems}
          activeTab={activeTab}
          onTabSelect={setActiveTab}
        />

        {/* Dynamic Content Area based on selected Tab */}
        <main className="admin-main-panel">
          {activeTab === "receive" && (
            <ReceiveProductsView
              batches={batches}
              onUpdateStatus={handleUpdateBatchStatus}
            />
          )}

          {activeTab === "orders" && (
            <AllOrdersView orders={orders} onCloseOrder={handleCloseOrder} />
          )}

          {activeTab === "create" && (
            <CreateOrderView onOrderCreated={fetchOrders} />
          )}
        </main>
      </div>
    </div>
  );
}


// SUB-COMPONENT 1: RECEIVE PRODUCTS VIEW

function ReceiveProductsView({ batches, onUpdateStatus }) {
  return (
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
            {batches.map((batch) => (
              <tr key={batch.id}>
                <td className="table-td">{batch.created_at}</td>
                <td className="table-td-bold">{batch.farmer_name}</td>
                <td className="table-td-bold">{batch.vegetable_type}</td>
                <td className="table-td">{batch.weight} kg</td>
                <td className="table-td">
                  {/* Fixed: Used imported Status component */}
                  <Status status={batch.status} />
                </td>
                <td className="table-td">
                  {batch.status === "PENDING" ? (
                    <div className="table-actions">
                      <button
                        onClick={() => onUpdateStatus(batch.id, "APPROVED")}
                        className="btn-approve"
                      >
                        ✓ APPROVE
                      </button>
                      <button
                        onClick={() => onUpdateStatus(batch.id, "REJECTED")}
                        className="btn-reject"
                      >
                        ✖ REJECT
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: "#A8A29E" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// SUB-COMPONENT 2: ALL ORDERS VIEW

function AllOrdersView({ orders, onCloseOrder }) {
  return (
    <div>
      <h2 className="view-title">ALL CLIENT ORDERS</h2>
      <p className="view-subtitle">View active client orders and mark completed sales as closed.</p>

      <div className="table-wrapper">
        <table className="data-table">
          <thead className="table-head">
            <tr>
              <th className="table-th">Client</th>
              <th className="table-th">Product</th>
              <th className="table-th">Quantity</th>
              <th className="table-th">Unit Price</th>
              <th className="table-th">Status</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="table-td-bold">{order.client_name}</td>
                <td className="table-td">{order.product_type}</td>
                <td className="table-td">{order.quantity} kg</td>
                <td className="table-td">₱{order.unit_price}</td>
                <td className="table-td">
                  <Status status={order.status} />
                </td>
                <td className="table-td">
                  {order.status === "ACTIVE" ? (
                    <button
                      onClick={() => onCloseOrder(order.id)}
                      className="btn-reject"
                    >
                      Close Order
                    </button>
                  ) : (
                    <span style={{ color: "#A8A29E" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT 3: CREATE ORDER VIEW
// ==========================================
function CreateOrderView({ onOrderCreated }) {
  // Form input values stored in local state
  const [formData, setFormData] = useState({
    client_name: "",
    vegetable_type: "Tomatoes",
    quantity: "",
    unit_price: "",
  });

  // Helper to update individual input fields easily
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit form data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/orders", formData);
      alert("Order created successfully!");

      // Reset form fields
      setFormData({
        client_name: "",
        vegetable_type: "Tomatoes",
        quantity: "",
        unit_price: "",
      });

      onOrderCreated(); // Call parent function to refresh orders list
    } catch (error) {
      alert("Failed to save order to database.");
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
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            placeholder="e.g. Fresh Mart Supermarket"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Vegetable Type</label>
          <select
            name="product_type"
            value={formData.product_type}
            onChange={handleChange}
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
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 100"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit Price (₱/KG)</label>
            <input
              required
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
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
}

export default AdminDashboard;