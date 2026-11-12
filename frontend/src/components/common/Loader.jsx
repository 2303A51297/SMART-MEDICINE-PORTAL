import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = 'Loading medical records...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.8rem' }}>
      <Loader2 size={36} className="spinner" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{text}</div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;

