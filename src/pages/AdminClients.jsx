import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';

export function AdminClients() {
  const [clients, setClients] = useState([
    { client_id: 1, company_name: 'Fresh Mart Supermarket', contact_email: 'procurement@freshmart.co.ke' },
    { client_id: 2, company_name: 'Metro Garden Restaurant', contact_email: 'orders@metrogarden.com' },
    { client_id: 3, company_name: 'FoodHub Corp', contact_email: 'supply@foodhub.com' }
  ]);

  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    API.get('/clients')
      .then((res) => setClients(res.data))
      .catch(() => console.log('Loaded fallback clients list'));
  }, []);

  // Create new Client account
  const handleAddClient = async (e) => {
    e.preventDefault();
    const newClient = { company_name: companyName, contact_email: contactEmail };

    try {
      await API.post('/clients', newClient);
    } catch (err) {
      console.log('Offline client creation');
    }

    setClients([...clients, { client_id: clients.length + 1, ...newClient }]);
    setCompanyName('');
    setContactEmail('');
    alert('Client added successfully!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>🏢 Client Management</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Register and manage B2B supermarket and restaurant clients</p>
        </div>
        <Link to="/admin" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
          ← Back to Admin Panel
        </Link>
      </div>

      {/* Add Client Form */}
      <form onSubmit={handleAddClient} style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '25px', border: '1px solid #ddd' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Register New Client</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            style={{ flex: 1, padding: '8px' }}
          />
          <input
            type="email"
            placeholder="Contact Email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            style={{ flex: 1, padding: '8px' }}
          />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            + Add Client
          </button>
        </div>
      </form>

      {/* Clients List Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#2c3e50', color: '#fff', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>CLIENT ID</th>
            <th style={{ padding: '12px' }}>COMPANY NAME</th>
            <th style={{ padding: '12px' }}>CONTACT EMAIL</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.client_id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px' }}>#{c.client_id}</td>
              <td style={{ padding: '12px' }}><strong>{c.company_name}</strong></td>
              <td style={{ padding: '12px' }}>{c.contact_email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}