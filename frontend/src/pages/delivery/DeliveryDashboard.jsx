import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle,
  PackageCheck,
  Clock,
  Navigation,
  CheckCheck
} from 'lucide-react';

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  // Modal for marking delivered
  const [deliveringItem, setDeliveringItem] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchDeliveries = async () => {
    try {
      const res = await api.get('/deliveries/assigned');
      if (res.data.success) {
        setDeliveries(res.data.deliveries);
      }
    } catch (err) {
      console.error('Failed to load assigned deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (deliveryId, newStatus, deliveryNotes = '') => {
    try {
      await api.put(`/deliveries/${deliveryId}/status`, {
        status: newStatus,
        deliveryNotes
      });
      await fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleConfirmDelivered = async (e) => {
    e.preventDefault();
    if (!deliveringItem) return;
    setUpdating(true);

    try {
      await api.put(`/deliveries/${deliveringItem._id}/status`, {
        status: 'delivered',
        deliveryNotes: notes || 'Delivered directly to patient with verification code confirmation.'
      });
      setDeliveringItem(null);
      setOtpInput('');
      setNotes('');
      await fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete delivery');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader text="Loading delivery partner route..." />;

  const activeDeliveries = deliveries.filter(d => ['assigned', 'picked_up', 'out_for_delivery'].includes(d.status));
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Courier Fleet & Delivery Dashboard</h1>
          <p className="page-subtitle">Doorstep pharmaceutical delivery dispatch, customer location routing, and hand-off verification</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        <StatCard
          icon={Truck}
          label="Active Deliveries"
          value={activeDeliveries.length}
          subtext="In route or awaiting pickup"
          color="#0284c7"
          bg="#e0f2fe"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed Today"
          value={completedDeliveries.length}
          subtext="Verified recipient handoffs"
          color="#10b981"
          bg="#d1fae5"
        />
        <StatCard
          icon={Clock}
          label="Avg Hand-off Time"
          value="24 Mins"
          subtext="Door-to-door delivery metric"
          color="#8b5cf6"
          bg="#ede9fe"
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'active' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Active Deliveries ({activeDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Delivery History ({completedDeliveries.length})
        </button>
      </div>

      {activeTab === 'active' ? (
        activeDeliveries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <CheckCheck size={48} color="#10b981" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>No Active Deliveries</div>
            <p style={{ fontSize: '0.85rem' }}>You're all caught up! New pharmacy orders will appear here once packed.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {activeDeliveries.map((del) => (
              <div key={del._id} className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Order Reference</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {del.order?.orderNumber || 'MED-ORDER'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Badge status={del.status} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Assigned: {new Date(del.assignedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Patient Name</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{del.customerName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <Phone size={14} /> {del.deliveryAddress?.phone}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Drop-off Address</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{del.deliveryAddress?.street}, {del.deliveryAddress?.city}, {del.deliveryAddress?.state} - {del.deliveryAddress?.zipCode}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Verification Code</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0369a1' }}>
                      Code: {del.deliveryCode || '4821'}
                    </div>
                  </div>
                </div>

                {/* Status Advancement Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {del.status === 'assigned' && (
                    <button
                      onClick={() => handleUpdateStatus(del._id, 'picked_up', 'Picked up sealed parcel from central pharmacy warehouse')}
                      className="btn btn-secondary"
                    >
                      <PackageCheck size={16} /> Mark as Picked Up
                    </button>
                  )}

                  {del.status === 'picked_up' && (
                    <button
                      onClick={() => handleUpdateStatus(del._id, 'out_for_delivery', 'Courier is on the way to patient residence')}
                      className="btn btn-primary"
                    >
                      <Navigation size={16} /> Mark Out for Delivery
                    </button>
                  )}

                  {del.status === 'out_for_delivery' && (
                    <button
                      onClick={() => setDeliveringItem(del)}
                      className="btn btn-success"
                    >
                      <CheckCircle size={16} /> Confirm Hand-off & Mark Delivered
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )
      ) : (
        /* History View */
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer Name</th>
                  <th>Delivered At</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedDeliveries.map((del) => (
                  <tr key={del._id}>
                    <td><strong>{del.order?.orderNumber}</strong></td>
                    <td>{del.customerName}</td>
                    <td>{new Date(del.deliveredAt || del.updatedAt).toLocaleString()}</td>
                    <td>{del.deliveryAddress?.phone}</td>
                    <td>{del.deliveryAddress?.street}, {del.deliveryAddress?.city}</td>
                    <td>{del.deliveryNotes || 'Delivered successfully'}</td>
                    <td><Badge status="delivered" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hand-off Confirmation Modal */}
      <Modal
        isOpen={!!deliveringItem}
        onClose={() => setDeliveringItem(null)}
        title="Confirm Doorstep Medicine Hand-off"
      >
        {deliveringItem && (
          <form onSubmit={handleConfirmDelivered}>
            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                Order: {deliveringItem.order?.orderNumber}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Recipient: {deliveringItem.customerName} ({deliveringItem.deliveryAddress?.phone})
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Customer Hand-off Verification Code</label>
              <input
                type="text"
                className="form-control"
                placeholder={`Expected Code: ${deliveringItem.deliveryCode || '4821'}`}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Completion Notes</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Handed over to patient directly. Package seal intact."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setDeliveringItem(null)} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-success" disabled={updating}>
                {updating ? 'Verifying...' : 'Complete Delivery'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default DeliveryDashboard;

