import React from 'react';

const StatCard = ({ icon: Icon, label, value, subtext, color = 'var(--primary)', bg = 'var(--primary-light)' }) => {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{subtext}</div>}
      </div>
      {Icon && (
        <div className="stat-icon-wrapper" style={{ background: bg, color: color }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;

