import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Pill,
  FileText,
  ShoppingCart,
  Truck,
  BarChart3,
  Users,
  FolderTree,
  LogOut,
  PackageSearch,
  ShieldCheck,
  ClipboardList,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'customer';

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <Pill size={24} />
        </div>
        <div>
          <div className="brand-title">MediPharm</div>
          <div className="brand-subtitle">Smart Health Portal</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        {/* Customer Links */}
        {role === 'customer' && (
          <>
            <div className="menu-category-label">Patient Services</div>
            <NavLink to="/customer/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/medicines" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Pill size={18} />
              <span>Browse Medicines</span>
            </NavLink>
            <NavLink to="/prescriptions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>Prescription Upload</span>
            </NavLink>
            <NavLink to="/cart" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} />
              <span>Cart & Checkout</span>
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={18} />
              <span>My Orders & Tracking</span>
            </NavLink>
          </>
        )}

        {/* Pharmacist Links */}
        {role === 'pharmacist' && (
          <>
            <div className="menu-category-label">Pharmacy Desk</div>
            <NavLink to="/pharmacist/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Pharmacist Desk</span>
            </NavLink>
            <NavLink to="/pharmacist/inventory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <PackageSearch size={18} />
              <span>Inventory & Batches</span>
            </NavLink>
            <NavLink to="/medicines" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Pill size={18} />
              <span>Medicine Catalog</span>
            </NavLink>
            <NavLink to="/prescriptions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={18} />
              <span>Prescription Queue</span>
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={18} />
              <span>Order Fulfillment</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} />
              <span>Pharmacy Reports</span>
            </NavLink>
          </>
        )}

        {/* Admin Links */}
        {role === 'admin' && (
          <>
            <div className="menu-category-label">Administration</div>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Executive Dashboard</span>
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>User & Staff Control</span>
            </NavLink>
            <NavLink to="/admin/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FolderTree size={18} />
              <span>Category Hierarchy</span>
            </NavLink>
            <NavLink to="/pharmacist/inventory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <PackageSearch size={18} />
              <span>Inventory Master</span>
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={18} />
              <span>Global Orders</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} />
              <span>Analytics & Reports</span>
            </NavLink>
          </>
        )}

        {/* Delivery Partner Links */}
        {role === 'delivery' && (
          <>
            <div className="menu-category-label">Courier Logistics</div>
            <NavLink to="/delivery/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Truck size={18} />
              <span>Assigned Deliveries</span>
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={18} />
              <span>Delivery History</span>
            </NavLink>
          </>
        )}

        {/* Quick Demo Switcher Widget for Evaluation */}
        <div className="menu-category-label" style={{ marginTop: 'auto' }}>
          <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
          Quick Role Switch (Demo)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', padding: '0 0.5rem' }}>
          <button
            onClick={() => quickLogin('customer')}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.4rem' }}
          >
            Customer
          </button>
          <button
            onClick={() => quickLogin('pharmacist')}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.4rem' }}
          >
            Pharmacist
          </button>
          <button
            onClick={() => quickLogin('admin')}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.4rem' }}
          >
            Admin
          </button>
          <button
            onClick={() => quickLogin('delivery')}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.4rem' }}
          >
            Delivery
          </button>
        </div>
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-profile-widget">
          <div className="avatar-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Guest'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700 }}>
              {user?.role || 'User'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 4 }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

