import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  Phone,
  FileCheck,
  ArrowLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const STEPS = [
  { key: 'placed', label: 'Order Placed', desc: 'Order submitted to pharmacy queue' },
  { key: 'confirmed', label: 'Pharmacist Confirmed', desc: 'Prescription & inventory verified' },
  { key: 'packed', label: 'Order Packed', desc: 'Tamper-evident cold-chain packaging' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Dispatched with delivery partner' },
  { key: 'delivered', label: 'Delivered', desc: 'Successfully handed over to recipient' }
];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
        setDelivery(res.data.delivery);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000); // Polling for live status
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <Loader text="Retrieving live order tracking..." />;
  if (!order) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Order Not Found</h3>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === order.orderStatus);
  const progressPercent = currentStepIndex >= 0 ? (currentStepIndex / (STEPS.length - 1)) * 100 : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)' }}>
          <ArrowLeft size={16} /> All Orders
        </Link>
        <span>/</span>
        <span style={{ fontWeight: 700 }}>Tracking {order.orderNumber}</span>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active Order Reference</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{order.orderNumber}</h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Placed on: {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Badge status={order.orderStatus} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Delivery</div>
              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                {order.deliveredAt
                  ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}`
                  : (order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Within 24 Hours')}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Progress Stepper */}
        <div className="stepper-container">
          <div className="stepper-progress-bar">
            <div className="stepper-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || (order.orderStatus === 'delivered' && idx === currentStepIndex);
            const isActive = idx === currentStepIndex && order.orderStatus !== 'delivered';

            return (
              <div key={step.key} className="step-item">
                <div className={`step-node ${isCompleted ? 'completed' : (isActive ? 'active' : '')}`}>
                  {isCompleted ? <CheckCircle size={22} /> : (idx + 1)}
                </div>
                <div className="step-title">{step.label}</div>
                <div className="step-time" style={{ maxWidth: 120 }}>{step.desc}</div>
              </div>
            );
          })}
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Delivery Partner & Address */}
        <div>
          {/* Delivery Partner Assigned Card */}
          <div className="card" style={{ marginBottom: '1.5rem', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} /> Courier & Dispatch Details
            </h3>

            {order.deliveryPartner ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                  {order.deliveryPartner.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#14532d' }}>{order.deliveryPartner.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={14} /> {order.deliveryPartner.phone}
                  </div>
                  {delivery?.deliveryCode && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '4px', display: 'inline-block', fontWeight: 700, color: '#166534' }}>
                      Delivery Verification Code: {delivery.deliveryCode}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                A licensed delivery driver will be assigned as soon as the pharmacy completes packaging.
              </p>
            )}
          </div>

          {/* Delivery Address */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" /> Delivery Address
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}<br />
              <strong>Phone:</strong> {order.shippingAddress.phone}
            </p>
          </div>

          {/* Order Timeline Audit History */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary)" /> Status Progression Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {order.timeline?.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', borderLeft: '2px solid var(--border)', paddingLeft: '0.85rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -5, top: 2, width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {log.note || log.status}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Financials */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
              Ordered Items ({order.items?.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ₹{item.price} x {item.quantity} units
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>GST Tax (5%)</span>
                <span>₹{order.tax?.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Courier Delivery</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee?.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', borderTop: '2px dashed var(--border)', paddingTop: '0.8rem' }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--primary)' }}>₹{order.totalAmount?.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.4rem' }}>
                Payment Method: <strong>{order.paymentMethod?.toUpperCase()}</strong> • Status: <Badge status={order.paymentStatus} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTrackingPage;

