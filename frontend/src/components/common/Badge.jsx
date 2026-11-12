import React from 'react';

const Badge = ({ status, text }) => {
  const normalized = (status || text || '').toLowerCase().replace(/_/g, ' ');

  let type = 'primary';
  if (['delivered', 'completed', 'active', 'approved', 'in stock', 'success', 'healthy'].includes(normalized)) {
    type = 'success';
  } else if (['pending', 'placed', 'low stock', 'warning', 'assigned', 'packed'].includes(normalized)) {
    type = 'warning';
  } else if (['cancelled', 'rejected', 'expired', 'out of stock', 'failed', 'deactivated'].includes(normalized)) {
    type = 'danger';
  } else if (['confirmed', 'out for delivery', 'in transit', 'picked up'].includes(normalized)) {
    type = 'info';
  }

  return (
    <span className={`badge badge-${type}`}>
      {text || normalized}
    </span>
  );
};

export default Badge;

