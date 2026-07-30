import React from 'react';

/**
 * OrderItem Component
 * Displays a single item inside a client order.
 */
export const OrderItem = ({ item }) => {
  // Destructure properties from item with fallbacks
  const { 
    id, 
    product_type = 'Produce', 
    allocated_weight = 0, 
    unit_price = 0 
  } = item || {};

  // Calculate total price for this specific item
  const itemTotal = allocated_weight * unit_price;

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '6px',
      padding: '12px',
      marginBottom: '10px',
      backgroundColor: '#f9f9f9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{product_type}</h4>
        <small style={{ color: '#666' }}>Item ID: #{id}</small>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div><strong>{allocated_weight} kg</strong> @ KSh {unit_price}/kg</div>
        <small style={{ color: '#27ae60', fontWeight: 'bold' }}>
          Subtotal: KSh {itemTotal.toLocaleString()}
        </small>
      </div>
    </div>
  );
};

export default OrderItem;