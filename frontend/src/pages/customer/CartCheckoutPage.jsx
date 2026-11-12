import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle,
  Truck,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

const CartCheckoutPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, prescriptionNeeded } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState('');
  const [loadingRx, setLoadingRx] = useState(false);

  // Address
  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || 'A-204 Green Meadows, Hitec City',
    city: user?.address?.city || 'Hyderabad',
    state: user?.address?.state || 'Telangana',
    zipCode: user?.address?.zipCode || '500081',
    phone: user?.phone || '+91 98222 33445'
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch approved prescriptions if Rx items are in cart
  useEffect(() => {
    const fetchApprovedRx = async () => {
      setLoadingRx(true);
      try {
        const res = await api.get('/prescriptions/my');
        if (res.data.success) {
          const approved = res.data.prescriptions.filter(p => p.status === 'approved');
          setPrescriptions(approved);
          if (approved.length > 0) {
            setSelectedPrescription(approved[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load prescriptions:', err);
      } finally {
        setLoadingRx(false);
      }
    };

    fetchApprovedRx();
  }, []);

  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const finalTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty');
      return;
    }

    if (prescriptionNeeded && !selectedPrescription) {
      setErrorMsg('One or more medicines in your cart require an approved doctor prescription. Please select an approved prescription or upload one.');
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
      setErrorMsg('Please provide a complete delivery street address, city, and phone number.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create Order
      const orderPayload = {
        items: cart.map(item => ({
          medicineId: item.medicine._id,
          name: item.medicine.name,
          quantity: item.quantity,
          price: item.medicine.price
        })),
        prescription: prescriptionNeeded ? selectedPrescription : undefined,
        shippingAddress,
        paymentMethod
      };

      const orderRes = await api.post('/orders', orderPayload);
      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to generate order');
      }

      const createdOrder = orderRes.data.order;

      // 2. Process Simulated Payment Gateway
      if (paymentMethod !== 'cod') {
        await api.post('/payments/process', {
          orderId: createdOrder._id,
          paymentMethod,
          cardNumber: paymentMethod === 'card' ? cardNumber : undefined,
          upiId: paymentMethod === 'upi' ? upiId : undefined
        });
      }

      // 3. Clear cart and redirect to live tracking!
      clearCart();
      navigate(`/orders/${createdOrder._id}/track`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <ShoppingBag size={56} color="var(--primary)" style={{ opacity: 0.6, marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Browse our catalog to add authentic medicines, wellness products and healthcare supplies.</p>
        <Link to="/medicines" className="btn btn-primary btn-lg">
          Browse Medicine Catalog
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Shopping Cart & Secure Checkout</h1>
          <p className="page-subtitle">Review selected therapeutic items, select delivery address and confirm payment</p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Cart Items & Rx Link */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Items in Cart ({cart.length})</span>
              <button onClick={clearCart} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}>
                Clear Cart
              </button>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => (
                <div
                  key={item.medicine._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
                    <img
                      src={item.medicine.image}
                      alt={item.medicine.name}
                      style={{ width: 56, height: 56, borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.medicine.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.medicine.genericName}</div>
                      {item.medicine.prescriptionRequired && (
                        <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>• Rx Required</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', background: '#fff' }}>
                      <button
                        onClick={() => updateQuantity(item.medicine._id, item.quantity - 1)}
                        style={{ border: 'none', background: 'none', padding: '0.4rem 0.6rem', cursor: 'pointer' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.medicine._id, item.quantity + 1)}
                        style={{ border: 'none', background: 'none', padding: '0.4rem 0.6rem', cursor: 'pointer' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                      ₹{(item.medicine.price * item.quantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.medicine._id)}
                      style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Prescription Attachment (Required if Rx items present) */}
          {prescriptionNeeded && (
            <div className="card" style={{ border: '2px solid #38bdf8', background: '#f0f9ff', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#0369a1', fontWeight: 800, fontSize: '1rem' }}>
                <ShieldAlert size={20} /> Doctor Prescription Verification Required
              </div>
              <p style={{ fontSize: '0.85rem', color: '#0c4a6e', marginBottom: '1rem' }}>
                Your cart contains Schedule H medicines that require verified doctor clearance before checkout.
              </p>

              {prescriptions.length === 0 ? (
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600, marginBottom: '0.75rem' }}>
                    You do not have any approved prescriptions in your account.
                  </p>
                  <Link to="/prescriptions" className="btn btn-primary btn-sm">
                    Upload Doctor Prescription Now
                  </Link>
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#0369a1' }}>Attach Approved Doctor Prescription</label>
                  <select
                    className="form-control"
                    value={selectedPrescription}
                    onChange={(e) => setSelectedPrescription(e.target.value)}
                  >
                    {prescriptions.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.patientName} — {p.doctorName} (Valid until: {new Date(p.validUntil).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Delivery Address Card */}
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--primary)" /> Delivery Destination
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Street / Flat / House Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">PIN Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Simulated Payment Gateway & Order Summary */}
        <div>
          {/* Simulated Payment Gateway Card */}
          <div className="card" style={{ marginBottom: '1.5rem', background: '#fafafa' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--primary)" />
              Simulated Payment Gateway (Sandbox)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Academic test sandbox. No real money will be charged.
            </p>

            {/* Payment Method Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`btn btn-sm ${paymentMethod === 'card' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.6rem 0.4rem', fontSize: '0.75rem', flexDirection: 'column', gap: 4 }}
              >
                <CreditCard size={18} />
                Credit/Debit
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`btn btn-sm ${paymentMethod === 'upi' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.6rem 0.4rem', fontSize: '0.75rem', flexDirection: 'column', gap: 4 }}
              >
                <QrCode size={18} />
                Instant UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`btn btn-sm ${paymentMethod === 'cod' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.6rem 0.4rem', fontSize: '0.75rem', flexDirection: 'column', gap: 4 }}
              >
                <Banknote size={18} />
                Cash On Delivery
              </button>
            </div>

            {/* Simulated Card Inputs */}
            {paymentMethod === 'card' && (
              <div style={{ padding: '1rem', background: '#fff', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Simulated Test Card</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="text" className="form-control" value="12/28" readOnly />
                  <input type="text" className="form-control" value="CVV: 891" readOnly />
                </div>
              </div>
            )}

            {/* Simulated UPI Input */}
            {paymentMethod === 'upi' && (
              <div style={{ padding: '1rem', background: '#fff', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  className="form-control"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            )}

            {/* COD Notice */}
            {paymentMethod === 'cod' && (
              <div style={{ padding: '0.85rem', background: '#fff', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Pay cash or QR code to the delivery associate upon doorstep arrival.
              </div>
            )}
          </div>

          {/* Pricing Summary Card */}
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>Price Breakdown</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal Items</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>GST Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Express Courier Delivery</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
              {subtotal < 500 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                  * Add ₹{(500 - subtotal).toFixed(2)} more for Free Express Delivery
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px dashed var(--border)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary)' }}>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckoutSubmit}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={processing || (prescriptionNeeded && !selectedPrescription)}
            >
              {processing ? 'Processing Secure Sandbox Order...' : `Pay & Place Order • ₹${finalTotal.toFixed(2)}`}
              <ArrowRight size={18} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CartCheckoutPage;

