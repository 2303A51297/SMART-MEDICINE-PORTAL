import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import {
  FileText,
  AlertTriangle,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  Calendar,
  Layers,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const PharmacistDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expiringSummary, setExpiringSummary] = useState(null);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Reviewing Prescription
  const [selectedRx, setSelectedRx] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [validDays, setValidDays] = useState(30);
  const [reviewing, setReviewing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [rxRes, ordRes, expRes, medRes] = await Promise.all([
        api.get('/prescriptions?status=pending'),
        api.get('/orders'),
        api.get('/batches/expiring-summary'),
        api.get('/medicines?limit=50')
      ]);

      if (rxRes.data.success) setPrescriptions(rxRes.data.prescriptions);
      if (ordRes.data.success) setOrders(ordRes.data.orders);
      if (expRes.data.success) setExpiringSummary(expRes.data.summary);
      if (medRes.data.success) {
        setLowStockMedicines(medRes.data.medicines.filter(m => m.totalStock <= m.reorderLevel));
      }
    } catch (err) {
      console.error('Failed to load pharmacist dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenReview = (rx) => {
    setSelectedRx(rx);
    setReviewStatus('approved');
    setReviewNotes('Prescription verified against medical guidelines. Approved for order fulfillment.');
    setValidDays(30);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRx) return;
    setReviewing(true);

    try {
      const res = await api.put(`/prescriptions/${selectedRx._id}/review`, {
        status: reviewStatus,
        reviewNotes,
        validDays
      });

      if (res.data.success) {
        setSelectedRx(null);
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to submit prescription review:', err);
    } finally {
      setReviewing(false);
    }
  };

  const handleAdvanceOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to advance order status:', err);
    }
  };

  if (loading) return <Loader text="Loading licensed pharmacist console..." />;

  const pendingOrders = orders.filter(o => ['placed', 'confirmed', 'packed'].includes(o.orderStatus));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Pharmacist Dispensation Console</h1>
          <p className="page-subtitle">Prescription clinical audits, FEFO batch dispensation, and fulfillment pipeline</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/pharmacist/inventory" className="btn btn-primary">
            <Package size={16} /> Manage Inventory Batches
          </Link>
          <Link to="/reports" className="btn btn-outline">
            View Analytics
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          icon={FileText}
          label="Pending Prescriptions"
          value={prescriptions.length}
          subtext="Awaiting pharmacist review"
          color="#f59e0b"
          bg="#fef3c7"
        />
        <StatCard
          icon={Package}
          label="Orders In Queue"
          value={pendingOrders.length}
          subtext="To confirm & pack"
          color="#0284c7"
          bg="#e0f2fe"
        />
        <StatCard
          icon={AlertTriangle}
          label="Expiring Batches"
          value={(expiringSummary?.within30Days || 0) + (expiringSummary?.expired || 0)}
          subtext={`${expiringSummary?.expired || 0} already expired`}
          color="#ef4444"
          bg="#fee2e2"
        />
        <StatCard
          icon={Layers}
          label="Low Stock Alert"
          value={lowStockMedicines.length}
          subtext="Below reorder threshold"
          color="#8b5cf6"
          bg="#ede9fe"
        />
      </div>

      {/* Prescriptions Awaiting Review */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              Doctor Prescriptions Awaiting Verification ({prescriptions.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Validate medical legitimacy, dosage safety, and doctor credentials</p>
          </div>
        </div>

        {prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '12px' }}>
            <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 700 }}>All Prescriptions Cleared</div>
            <p style={{ fontSize: '0.85rem' }}>No pending doctor prescriptions in the review queue.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Submission Date</th>
                  <th>Patient Details</th>
                  <th>Prescribing Doctor</th>
                  <th>Prescription Notes</th>
                  <th>Document</th>
                  <th>Clinical Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <tr key={rx._id}>
                    <td>{new Date(rx.createdAt).toLocaleString()}</td>
                    <td>
                      <strong>{rx.patientName}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Age: {rx.patientAge} • {rx.customer?.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rx.doctorName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rx.hospitalOrClinic}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rx.notes || 'Routine consultation prescription'}
                      </div>
                    </td>
                    <td>
                      <a href={rx.prescriptionFile} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                        <Eye size={14} /> View Rx
                      </a>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenReview(rx)}
                        className="btn btn-primary btn-sm"
                      >
                        Review & Sign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Orders In Fulfillment Pipeline */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Fulfillment & Packaging Pipeline</h2>
            <Link to="/orders" className="btn btn-outline btn-sm">View All</Link>
          </div>

          {pendingOrders.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No orders currently awaiting pharmacist packing.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingOrders.slice(0, 5).map((ord) => (
                <div key={ord._id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '10px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{ord.orderNumber}</span>
                    <Badge status={ord.orderStatus} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {ord.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{ord.totalAmount?.toFixed(2)}</span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {ord.orderStatus === 'placed' && (
                        <button
                          onClick={() => handleAdvanceOrderStatus(ord._id, 'confirmed')}
                          className="btn btn-secondary btn-sm"
                        >
                          Confirm Order
                        </button>
                      )}
                      {ord.orderStatus === 'confirmed' && (
                        <button
                          onClick={() => handleAdvanceOrderStatus(ord._id, 'packed')}
                          className="btn btn-primary btn-sm"
                        >
                          Mark Packed
                        </button>
                      )}
                      {ord.orderStatus === 'packed' && (
                        <button
                          onClick={() => handleAdvanceOrderStatus(ord._id, 'out_for_delivery')}
                          className="btn btn-success btn-sm"
                        >
                          <Truck size={14} /> Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Warning Box */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={18} /> Critical Low Stock Medicines
            </h2>
            <Link to="/pharmacist/inventory" className="btn btn-outline btn-sm">Add Batch</Link>
          </div>

          {lowStockMedicines.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#065f46' }}>All medicines have healthy stock above their designated reorder thresholds.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lowStockMedicines.slice(0, 5).map((med) => (
                <div key={med._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#9f1239' }}>{med.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#be123c' }}>Threshold: {med.reorderLevel} units</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-danger">
                      {med.totalStock === 0 ? 'Out of Stock' : `${med.totalStock} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Review Prescription Modal */}
      <Modal
        isOpen={!!selectedRx}
        onClose={() => setSelectedRx(null)}
        title="Clinical Prescription Audit & Approval"
      >
        {selectedRx && (
          <form onSubmit={handleReviewSubmit}>
            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Patient: {selectedRx.patientName} (Age: {selectedRx.patientAge})
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Prescribed by: <strong>{selectedRx.doctorName}</strong> ({selectedRx.hospitalOrClinic})
              </div>
              {selectedRx.notes && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.5rem', background: '#fff', padding: '0.5rem', borderRadius: '6px' }}>
                  Patient Note: "{selectedRx.notes}"
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Review Decision</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setReviewStatus('approved')}
                  className={`btn ${reviewStatus === 'approved' ? 'btn-success' : 'btn-outline'}`}
                >
                  <CheckCircle2 size={16} /> Approve Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatus('rejected')}
                  className={`btn ${reviewStatus === 'rejected' ? 'btn-danger' : 'btn-outline'}`}
                >
                  <XCircle size={16} /> Reject Prescription
                </button>
              </div>
            </div>

            {reviewStatus === 'approved' && (
              <div className="form-group">
                <label className="form-label">Validity Period (Days)</label>
                <input
                  type="number"
                  className="form-control"
                  value={validDays}
                  onChange={(e) => setValidDays(e.target.value)}
                  min="1"
                  max="90"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Pharmacist Clinical Remarks & Dispensation Notes</label>
              <textarea
                className="form-control"
                rows="3"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter clinical rationale, dosage confirmation or rejection reason..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedRx(null)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${reviewStatus === 'approved' ? 'btn-success' : 'btn-danger'}`}
                disabled={reviewing}
              >
                {reviewing ? 'Saving Review...' : `Confirm & ${reviewStatus === 'approved' ? 'Approve' : 'Reject'}`}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default PharmacistDashboard;

