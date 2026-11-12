import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import {
  ShieldAlert,
  Calendar,
  AlertTriangle,
  Building,
  CheckCircle,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';

const MedicineDetailPage = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [batches, setBatches] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const res = await api.get(`/medicines/${id}`);
        if (res.data.success) {
          setMedicine(res.data.medicine);
          setBatches(res.data.batches || []);
        }
      } catch (err) {
        console.error('Failed to load medicine details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  if (loading) return <Loader text="Loading clinical medicine profile..." />;
  if (!medicine) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Medicine Not Found</h3>
        <Link to="/medicines" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(medicine, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <Link to="/medicines" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)' }}>
          <ArrowLeft size={16} /> All Medicines
        </Link>
        <span>/</span>
        <span>{medicine.category?.name || 'Pharmacy'}</span>
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{medicine.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Left: Product Image & Key Badges */}
        <div>
          <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ height: '360px', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>
              <img
                src={medicine.image}
                alt={medicine.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {medicine.prescriptionRequired && (
                <div style={{ position: 'absolute', top: 16, right: 16, background: '#ef4444', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldAlert size={16} /> Schedule H / Rx Required
                </div>
              )}
            </div>
          </div>

          {/* Active Batches List (FEFO Dispensation Transparency) */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary)" />
              Active Pharmacy Batches (FEFO Dispensing)
            </h3>
            {batches.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No active warehouse batches linked to this medicine.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {batches.map(b => (
                  <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.82rem', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Batch #{b.batchNumber}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Expires: {new Date(b.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-success">{b.remainingQuantity} units in stock</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Clinical Info & Purchasing Panel */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              {medicine.category?.name || 'Therapeutic Formulation'}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              {medicine.name}
            </h1>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontWeight: 500 }}>
              Salt: <strong>{medicine.genericName}</strong>
            </div>

            {/* Price & Stock Header */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', padding: '1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Retail Price</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{medicine.price.toFixed(2)}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                {medicine.totalStock > 0 ? (
                  <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                    <CheckCircle size={14} /> Available ({medicine.totalStock} units in stock)
                  </span>
                ) : (
                  <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem' }}>Therapeutic Indications</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{medicine.description}</p>
            </div>

            {/* Specifications Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1.75rem', border: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Dosage Form</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{medicine.dosageForm}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Active Strength</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{medicine.strength}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Manufacturer</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{medicine.manufacturer}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Storage</span>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{medicine.storageInstructions}</div>
              </div>
            </div>

            {/* Add to Cart Actions */}
            {medicine.totalStock > 0 ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Quantity Counter */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '10px', background: '#fff', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ border: 'none', background: 'none', padding: '0.6rem 0.8rem', cursor: 'pointer' }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ minWidth: 36, textAlign: 'center', fontWeight: 800 }}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(medicine.totalStock, quantity + 1))}
                    style={{ border: 'none', background: 'none', padding: '0.6rem 0.8rem', cursor: 'pointer' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                >
                  <ShoppingCart size={18} />
                  Add to Cart • ₹{(medicine.price * quantity).toFixed(2)}
                </button>

                <button
                  type="button"
                  onClick={() => { addToCart(medicine, quantity); navigate('/cart'); }}
                  className="btn btn-secondary btn-lg"
                >
                  Buy Now
                </button>
              </div>
            ) : (
              <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '10px', color: '#991b1b', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
                This medicine is currently out of stock. Our pharmacists have been notified to reorder.
              </div>
            )}

            {addedNotice && (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#dcfce7', color: '#065f46', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} />
                Successfully added {quantity} units to your cart.
              </div>
            )}

          </div>

          {/* Safety & Prescription Notice */}
          <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#92400e' }}>
              <AlertTriangle size={18} /> Safety Advisory & Known Precautions
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5, marginBottom: '0.5rem' }}>
              {medicine.sideEffects}
            </p>
            {medicine.prescriptionRequired && (
              <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 700 }}>
                * A valid medical doctor prescription must be attached during checkout before dispatch.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default MedicineDetailPage;

