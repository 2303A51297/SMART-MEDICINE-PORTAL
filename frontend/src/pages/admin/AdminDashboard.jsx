import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { BarChart, DonutChart } from '../../components/charts/InteractiveCharts';
import {
  Users,
  IndianRupee,
  ShoppingBag,
  Pill,
  BarChart3,
  ShieldCheck,
  FolderTree,
  PackageSearch,
  ArrowRight,
  TrendingUp,
  Truck
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, ordRes] = await Promise.all([
          api.get('/users/dashboard-stats'),
          api.get('/orders?limit=6')
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (ordRes.data.success) setRecentOrders(ordRes.data.orders);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) return <Loader text="Assembling enterprise executive metrics..." />;

  const userRoleSegments = stats?.usersByRole?.map(r => ({
    label: r._id.toUpperCase(),
    value: r.count,
    color: r._id === 'admin' ? '#0284c7' : (r._id === 'pharmacist' ? '#0d9488' : (r._id === 'delivery' ? '#f59e0b' : '#10b981'))
  })) || [];

  const orderStatusSegments = stats?.ordersByStatus?.map(o => ({
    label: o._id.replace('_', ' ').toUpperCase(),
    value: o.count,
    color: o._id === 'delivered' ? '#10b981' : (o._id === 'out_for_delivery' ? '#38bdf8' : '#f59e0b')
  })) || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Pharmacy Management Console</h1>
          <p className="page-subtitle">Full stack system control, revenue telemetry, user governance & report audits</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/reports" className="btn btn-primary">
            <BarChart3 size={16} /> View All 4 Mandatory Reports
          </Link>
          <Link to="/admin/users" className="btn btn-outline">
            <Users size={16} /> User Roles
          </Link>
          <Link to="/admin/categories" className="btn btn-outline">
            <FolderTree size={16} /> Categories
          </Link>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          icon={IndianRupee}
          label="Total Settled Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || '0'}`}
          subtext="Verified payment transactions"
          color="#10b981"
          bg="#d1fae5"
        />
        <StatCard
          icon={ShoppingBag}
          label="Cumulative Orders"
          value={stats?.totalOrders || 0}
          subtext="Across all fulfillment channels"
          color="#0284c7"
          bg="#e0f2fe"
        />
        <StatCard
          icon={Pill}
          label="Active Medicines"
          value={stats?.totalMedicines || 0}
          subtext="Live pharmaceutical formulations"
          color="#0d9488"
          bg="#ccfbf1"
        />
        <StatCard
          icon={Users}
          label="Registered Accounts"
          value={stats?.totalUsers || 0}
          subtext="Patients, pharmacists, couriers"
          color="#8b5cf6"
          bg="#ede9fe"
        />
      </div>

      {/* Graphical Telemetry Charts */}
      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        
        {/* User Distribution by Role */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--primary)" />
            User Ecosystem Distribution
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Active system entities classified across 4 RBAC role partitions
          </p>
          <DonutChart
            segments={userRoleSegments}
            centerValue={stats?.totalUsers}
            centerLabel="Total Users"
          />
        </div>

        {/* Orders Pipeline Breakdown */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} color="var(--secondary)" />
            Order Fulfillment Pipeline Status
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Distribution of orders across clinical review, packaging, and dispatch
          </p>
          <DonutChart
            segments={orderStatusSegments}
            centerValue={stats?.totalOrders}
            centerLabel="Orders"
          />
        </div>

      </div>

      {/* Recent Enterprise Orders Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Recent System Orders</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest transactions dispatched through the platform</p>
          </div>
          <Link to="/orders" className="btn btn-outline btn-sm">
            View All Orders
          </Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Patient / Customer</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Fulfillment Status</th>
                <th>Courier Partner</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord) => (
                <tr key={ord._id}>
                  <td>
                    <strong style={{ color: 'var(--primary)' }}>{ord.orderNumber}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(ord.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.customer?.name || 'Guest'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer?.email}</div>
                  </td>
                  <td><strong>₹{ord.totalAmount?.toFixed(2)}</strong></td>
                  <td><Badge status={ord.paymentStatus} /></td>
                  <td><Badge status={ord.orderStatus} /></td>
                  <td>{ord.deliveryPartner?.name || 'Unassigned'}</td>
                  <td>
                    <Link to={`/orders/${ord._id}/track`} className="btn btn-outline btn-sm">
                      Audit
                    </Link>
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

export default AdminDashboard;

