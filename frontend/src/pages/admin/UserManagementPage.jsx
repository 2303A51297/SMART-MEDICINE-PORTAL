import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { Users, Search, Shield, Check, X, Edit, Phone, Mail } from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  if (loading) return <Loader text="Retrieving registered user registry..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User & Staff Role Control</h1>
          <p className="page-subtitle">RBAC permissions management for administrators, pharmacists, customers, and couriers</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Role Partitions</option>
              <option value="customer">Customers / Patients</option>
              <option value="pharmacist">Staff Pharmacists</option>
              <option value="delivery">Delivery Partners</option>
              <option value="admin">Platform Administrators</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Identity</th>
                <th>Contact</th>
                <th>Current Role</th>
                <th>Account Status</th>
                <th>Change Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar-circle">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-main)' }}>{u.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {u._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{u.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone || 'No phone'}</div>
                  </td>
                  <td>
                    <Badge status={u.role} text={u.role} />
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Deactivated</span>
                    )}
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    >
                      <option value="customer">Customer</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="delivery">Delivery</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-success'}`}
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default UserManagementPage;

