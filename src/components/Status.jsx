import React from 'react';
import "../App.css"; // Imports badge color styles

// Renders a styled badge depending on the status string passed to it
export default function Status({ status = 'PENDING' }) {
  // Convert status string to UPPERCASE to prevent capitalization bugs
  const currentStatus = status.toUpperCase();

  // Map each status name to its corresponding CSS class name
  const badgeStyles = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-approved',
    PAID: 'badge-paid',
    ACTIVE: 'badge-active',
    REJECTED: 'badge-rejected',
    CLOSED: 'badge-closed',
  };

  // Select matching class name or default to 'badge' if missing
  const className = badgeStyles[currentStatus] || 'badge';

  return <span className={className}>{currentStatus}</span>;
}

 