import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  ShoppingBag,
  FileText,
  Clock,
  Search,
  ArrowRight,
  ShieldAlert,
  Plus,
  Sparkles,
  Truck,
  CheckCircle2
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, rxRes, medRes] = await Promise.all([
          api.get('/orders/my'),
          api.get('/prescriptions/my'),
          api.get('/medicines?limit=6')
        ]);

        if (ordersRes.data.success) setOrders(ordersRes.data.orders);
        if (rxRes.data.success) setPrescriptions(rxRes.data.prescriptions);
        if (medRes.data.success) setFeaturedMedicines(medRes.data.medicines);
      } catch (err) {
        console.error('Failed to load customer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) return <Loader text="Loading patient dashboard..." />;

  const activeOrders = orders.filter(o => ['placed', 'confirmed', 'packed', 'out_for_delivery'].includes(o.orderStatus));
  const pendingRx = prescriptions.filter(p => p.status === 'pending');

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
        borderRadius: '20px',
        padding: '2.5rem',
        color: 'white',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)'
      }}>
        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Sparkles size={16} />
            Fast 2-Hour Express Healthcare Delivery
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Hello, {user?.name || 'Valued Patient'}!
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Need genuine medicines, chronic care refills, or clinical consultations? Order directly or upload your doctor's prescription for instant pharmacist verification.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/prescriptions" className="btn btn-secondary btn-lg" style={{ background: '#fff', color: 'var(--primary)' }}>
              <FileText size={18} />
              Upload Prescription
            </Link>
            <Link to="/medicines" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
              <Search size={18} />
              Explore All Medicines
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          icon={ShoppingBag}
          label="Active Orders"
          value={activeOrders.length}
          subtext="In fulfillment pipeline"
          color="#0284c7"
          bg="#e0f2fe"
        />
        <StatCard
          icon={FileText}
          label="Prescriptions"
          value={prescriptions.length}
          subtext={`${pendingRx.length} pending review`}
          color="#0d9488"
          bg="#ccfbf1"
        />
        <StatCard
          icon={Clock}
          label="Total Orders"
          value={orders.length}
          subtext="Lifetime order history"
          color="#8b5cf6"
          bg="#ede9fe"
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={orders.filter(o => o.orderStatus === 'delivered').length}
          subtext="Successfully received"
          color="#10b981"
          bg="#d1fae5"
        />
      </div>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Orders Out For Delivery & Packing</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time updates from our pharmacy and delivery fleet</p>
            </div>
            <Link to="/orders" className="btn btn-outline btn-sm">
              View All ({orders.length})
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeOrders.map(order => (
              <div
                key={order._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  background: '#fafafa',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{order.orderNumber}</span>
                    <Badge status={order.orderStatus} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Amount</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{order.totalAmount}</div>
                  </div>
                  <Link to={`/orders/${order._id}/track`} className="btn btn-primary btn-sm">
                    <Truck size={16} />
                    Track Live
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Medicines Catalog Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Essential Medicines in Stock</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified therapeutic formulations available for instant dispatch</p>
          </div>
          <Link to="/medicines" className="btn btn-outline btn-sm">
            Browse Full Catalog <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-cols-3">
          {featuredMedicines.map(med => (
            <div key={med._id} className="medicine-card">
              <div className="medicine-image-wrapper">
                <img src={med.image} alt={med.name} className="medicine-image" />
                {med.prescriptionRequired && (
                  <span style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    Rx Required
                  </span>
                )}
                <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(15,23,42,0.7)', color: '#fff', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {med.dosageForm} • {med.strength}
                </span>
              </div>
              <div className="medicine-card-body">
                <div className="medicine-title">{med.name}</div>
                <div className="medicine-generic">{med.genericName}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MRP</span>
                    <div className="medicine-price-tag">₹{med.price}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/medicines/${med._id}`} className="btn btn-outline btn-sm">
                      Details
                    </Link>
                    <button
                      onClick={() => addToCart(med, 1)}
                      className="btn btn-primary btn-sm"
                      disabled={med.totalStock === 0}
                    >
                      <Plus size={16} />
                      {med.totalStock === 0 ? 'Out of Stock' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;

