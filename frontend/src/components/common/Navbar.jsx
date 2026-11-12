import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Search, ShoppingCart, Bell, Shield, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="topbar">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="topbar-search">
        <Search className="topbar-search-icon" size={18} />
        <input
          type="text"
          placeholder="Search medicines by name, salt, or disease..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {/* Topbar Actions */}
      <div className="topbar-actions">
        {/* Role Pill */}
        <div className="badge badge-primary" style={{ padding: '0.4rem 0.85rem' }}>
          <Shield size={14} />
          <span>Role: {user?.role || 'Guest'}</span>
        </div>

        {/* Customer Cart */}
        {user?.role === 'customer' && (
          <Link
            to="/cart"
            className="btn btn-outline"
            style={{ position: 'relative', padding: '0.55rem 0.9rem' }}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {/* User Info Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <UserIcon size={16} />
          <span>{user?.name?.split(' ')[0] || 'User'}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

