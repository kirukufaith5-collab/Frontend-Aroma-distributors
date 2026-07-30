import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api.js';
import Status from '../components/Status.jsx';

export function FarmerBatches() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const farmerId = user.id || 2;

  // State to store batches
  const [batches, setBatches] = useState([
    { id: 101, created_at: '2026-07-20', product_type: 'Tomatoes', weight: '50.0', status: 'APPROVED' },
    { id: 102, created_at: '2026-07-22', product_type: 'Potatoes', weight: '35.0', status: 'PENDING' },
    { id: 103, created_at: '2026-07-25', product_type: 'Onions', weight: '20.0', status: 'REJECTED' }
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch batches for logged-in farmer on load
  useEffect(() => {
    API.get(`/batches?farmer_id=${farmerId}`)
      .then((res) => setBatches(res.data))
      .catch(() => console.log('Loaded fallback farmer batches'))
      .finally(() => setLoading(false));
  }, [farmerId]);

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header and Back Link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2> My Product Batches</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Overview of all logged produce for {user.name || user.farm_name || 'Farmer'}</p>
        </div>
        <Link to="/farmer" style={{ textDecoration: 'none', color: '#27ae60', fontWeight: 'bold' }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Batches Table */}
      {loading ? (
        <p>Loading batches...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#2e7d32', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>BATCH ID</th>
              <th style={{ padding: '12px' }}>DATE</th>
              <th style={{ padding: '12px' }}>PRODUCT</th>
              <th style={{ padding: '12px' }}>WEIGHT</th>
              <th style={{ padding: '12px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>#{batch.id}</td>
                <td style={{ padding: '12px' }}>{batch.created_at || batch.date}</td>
                <td style={{ padding: '12px' }}><strong>{batch.product_type || batch.product}</strong></td>
                <td style={{ padding: '12px' }}>{batch.weight} kg</td>
                <td style={{ padding: '12px' }}>
                  <Status status={batch.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}