import React from 'react';
import "../App.css"; // Imports badge color styles

// Renders a styled badge depending on the status string passed to it
export default function Status({ status = 'PENDING' }) {
  // Convert status to string and UPPERCASE to prevent capitalization/type bugs
  const currentStatus = String(status || 'PENDING').toUpperCase();

  // Map each status name to its corresponding CSS class name in App.css
  const badgeStyles = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-approved',
    PAID: 'badge-paid',
    ACTIVE: 'badge-active',
    REJECTED: 'badge-rejected',
    CLOSED: 'badge-closed',
  };

  // Select matching class name or default to standard 'badge' if missing
  const className = badgeStyles[currentStatus] || 'badge';

  return <span className={className}>{currentStatus}</span>;
}