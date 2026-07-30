// frontend/src/services/api.js
import axios from "axios";

// Create an Axios instance pointing to your backend URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Flask server address
});

// Automatically inject JWT Token into requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTHENTICATION API CALLS
// Login user (Farmer or Admin)
export const loginUser = (credentials) => API.post('/auth/login', credentials);

// Request password reset link (sends email)
export const requestPasswordReset = (emailData) => API.post('/auth/forgot-password', emailData);

// Submit new password using reset token
export const resetPassword = (resetData) => API.post('/auth/reset-password', resetData);

// Get currently logged-in user profile
export const getUserProfile = () => API.get('/auth/me');

// PRODUCT BATCHES API CALLS (Product_Batches)
export const getProductBatches = () => API.get('/batches');
export const createProductBatch = (batchData) => API.post('/batches', batchData);
export const updateProductBatch = (id, batchData) => API.put(`/batches/${id}`, batchData);
export const deleteProductBatch = (id) => API.delete(`/batches/${id}`);


// CLIENT ORDERS API CALLS (Client_Orders & Ordered_Items)
export const getOrders = () => API.get('/orders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const createOrder = (orderData) => API.post('/orders', orderData);

// PAYOUTS API CALLS (Payouts)
export const getPayouts = () => API.get('/payouts');

// CLIENTS API CALLS (Clients)

export const getClients = () => API.get('/clients');

export default API;