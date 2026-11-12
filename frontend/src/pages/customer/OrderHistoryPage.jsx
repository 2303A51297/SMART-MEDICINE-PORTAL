import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { ShoppingBag, Truck, Search, Eye, Filter } from 'lucide-react';

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const isStaff = user?.role === 'pharmacist' || user?.role === 'admin';

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const endpoint = isStaff ? '/orders' : '/orders/my';
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (search) params.append('search', search);

        const res = await api.get(`${endpoint}?${params.toString()}`);
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, search, isStaff]);

  if (loading) return <Loader text="Loading order records..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isStaff ? 'Global Pharmacy Orders' : 'My Order History & Tracking'}</h1>
          <p className="page-subtitle">Track dispatch status, invoices and delivery logs</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by Order ID (e.g. MED-2026)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Fulfillment Statuses</option>
              <option value="placed">Placed (Pending Review)</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="out_for_delivery">Out For Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <ShoppingBag size={48} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>No orders found</div>
            <p style={{ fontSize: '0.85rem' }}>No orders currently match your filter criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  {isStaff && <th>Customer</th>}
                  <th>Items Summary</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Fulfillment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{ord.orderNumber}</span>
                    </td>
                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    {isStaff && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.customer?.name || 'Guest'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ord.customer?.phone}</div>
                      </td>
                    )}
                    <td>
                      <div style={{ fontSize: '0.85rem', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ord.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {ord.items?.length} line item(s)
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>₹{ord.totalAmount?.toFixed(2)}</strong>
                    </td>
                    <td>
                      <Badge status={ord.paymentStatus} text={ord.paymentStatus} />
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{ord.paymentMethod?.toUpperCase()}</div>
                    </td>
                    <td>
                      <Badge status={ord.orderStatus} />
                    </td>
                    <td>
                      <Link to={`/orders/${ord._id}/track`} className="btn btn-primary btn-sm">
                        <Truck size={14} /> Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default OrderHistoryPage;

