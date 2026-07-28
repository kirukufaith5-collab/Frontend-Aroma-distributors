import React from 'react';
import './Components.App.css';

export const Status= ({ status }) => {
  const normalizedStatus = status ? status.toUpperCase() : 'PENDING';

  const badgeStyles = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-approved',
    PAID: 'badge-paid',
    ACTIVE: 'badge-active',
    REJECTED: 'badge-rejected',
    CLOSED: 'badge-closed',
  };

  return (
    <span className={badgeStyles[normalizedStatus] || 'badge'}>
      {normalizedStatus}
    </span>
  );
};