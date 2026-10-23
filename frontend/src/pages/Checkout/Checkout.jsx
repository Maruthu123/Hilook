import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api';
import { payOnline, onlinePaymentEnabled } from '../../utils/razorpay';
import './Checkout.css';

export default function Checkout() {
  const { items, total, clear } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const coupon = location.state?.coupon || '';

  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(null);                 // { number, pending }
  const [error, setError] = useState('');
  const [onlineOn, setOnlineOn] = useState(false);
  const [pm, setPm] = useState('cod');
  const [addr, setAddr] = useState({ name: user?.name || '', phone: user?.phone || '', line1: '', city: '', state: 'Tamil Nadu', pincode: '' });
  const setA = (k) => (e) => setAddr((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => { onlinePaymentEnabled().then(setOnlineOn); }, []);

  const shipping = total >= 1499 ? 0 : 99;
  const grand = total + shipping;                         // coupon discount is applied by the server and shown on the order

  async function handleOrder(e) {
    e.preventDefault(); setError('');
    if (!/^\d{10}$/.test(addr.phone)) return setError('Enter a valid 10-digit phone number.');
    if (!/^\d{6}$/.test(addr.pincode)) return setError('Enter a valid 6-digit pincode.');
    setPlacing(true);
    try {
      const { data } = await API.post('/api/orders', {
        items: items.map((i) => ({ product: i.id, quantity: i.qty || 1, size: i.size, color: i.color })),
        shippingAddress: { fullName: addr.name, phone: addr.phone, addressLine1: addr.line1, city: addr.city, state: addr.state, pincode: addr.pincode },
        paymentMethod: pm, couponCode: coupon || undefined,
      });
      if (pm === 'razorpay') {
        const r = await payOnline(data.orderId, { name: addr.name, contact: addr.phone, email: user?.email || '' });
        clear();
        setDone({ number: data.orderNumber, pending: !r.ok, msg: r.ok ? '' : r.msg });
      } else {
        clear();
        setDone({ number: data.orderNumber, pending: false });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place the order. Please try again.');
    }
    setPlacing(false);
  }

  if (items.length === 0 && !done) return (
    <div className="checkout-pg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 60 }}><div style={{ fontSize: 52 }}>🛒</div><h2>Cart is Empty</h2><Link to="/shop" className="btn-gold" style={{ display: 'inline-block', marginTop: 16 }}>Shop Now</Link></div>
    </div>
  );

  if (done) return (
    <div className="checkout-pg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div className="order-success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="order-success-icon">{done.pending ? '⏳' : '🎉'}</div>
        <h2>{done.pending ? 'Order saved – payment pending' : 'Order Placed Successfully!'}</h2>
        <p>Order <strong>#{done.number}</strong>{done.pending ? <><br />{done.msg}. You can pay again from Track Orders.</> : <><br />Track every step of your order in <b>My Orders</b>.</>}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/orders')} className="btn-gold">Track My Order</button>
          <Link to="/shop" className="btn-outline">Continue Shopping</Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="checkout-pg">
      <div className="container">
        <h1>Checkout</h1>
        <div className="checkout-layout">
          <div>
            <form onSubmit={handleOrder}>
              <div className="checkout-form-box" style={{ marginBottom: 24 }}>
                <h2><i className="fa-solid fa-location-dot" style={{ color: 'var(--violet)', marginRight: 10 }} />Delivery Address</h2>
                <div className="checkout-grid">
                  <div className="field"><label>Full Name</label><input value={addr.name} onChange={setA('name')} placeholder="Your full name" required /></div>
                  <div className="field"><label>Phone</label><input value={addr.phone} onChange={setA('phone')} placeholder="10-digit mobile" required maxLength={10} inputMode="numeric" /></div>
                  <div className="field" style={{ gridColumn: '1/-1' }}><label>Address</label><input value={addr.line1} onChange={setA('line1')} placeholder="Door No, Street, Area" required /></div>
                  <div className="field"><label>City</label><input value={addr.city} onChange={setA('city')} placeholder="City" required /></div>
                  <div className="field"><label>State</label><input value={addr.state} onChange={setA('state')} placeholder="State" /></div>
                  <div className="field"><label>Pincode</label><input value={addr.pincode} onChange={setA('pincode')} placeholder="6-digit pincode" maxLength={6} required inputMode="numeric" /></div>
                </div>
              </div>

              <div className="checkout-form-box">
                <h2><i className="fa-solid fa-wallet" style={{ color: 'var(--violet)', marginRight: 10 }} />Payment Method</h2>
                <div className="pm-list">
                  <label className={`pm-item ${pm === 'cod' ? 'on' : ''}`}>
                    <input type="radio" name="pm" checked={pm === 'cod'} onChange={() => setPm('cod')} style={{ display: 'none' }} />
                    <i className="fa-solid fa-money-bill-wave" /> Cash on Delivery
                    {pm === 'cod' && <i className="fa-solid fa-circle-check" style={{ marginLeft: 'auto', color: 'var(--violet)' }} />}
                  </label>
                  <label className={`pm-item ${pm === 'razorpay' ? 'on' : ''}`} style={!onlineOn ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
                    <input type="radio" name="pm" disabled={!onlineOn} checked={pm === 'razorpay'} onChange={() => setPm('razorpay')} style={{ display: 'none' }} />
                    <i className="fa-solid fa-credit-card" /> Online Payment (UPI / Card / Net Banking)
                    {!onlineOn && <small style={{ marginLeft: 'auto' }}>Coming soon</small>}
                    {pm === 'razorpay' && <i className="fa-solid fa-circle-check" style={{ marginLeft: 'auto', color: 'var(--violet)' }} />}
                  </label>
                </div>
              </div>

              {error && <p className="checkout-error">{error}</p>}
              <button type="submit" className="btn-gold place-order-btn" disabled={placing}>
                {placing ? 'Processing…' : pm === 'cod' ? `Place Order — ₹${grand.toLocaleString()}` : `Pay ₹${grand.toLocaleString()}`}
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            {items.map((it, i) => (
              <div key={i} className="summary-item">
                <img src={it.image} alt={it.name} />
                <div className="summary-item-info">
                  <p>{it.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Qty: {it.qty}{it.size ? ` · ${it.size}` : ''} {it.color ? `· ${it.color}` : ''}</p>
                </div>
                <span className="summary-item-price">₹{(it.price * it.qty).toLocaleString()}</span>
              </div>
            ))}
            <div className="summary-row"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : '₹' + shipping}</span></div>
            {coupon && <div className="summary-row" style={{ color: '#16a34a' }}><span>Coupon {coupon}</span><span>applied at order</span></div>}
            <div className="summary-total"><span>Total</span><span>₹{grand.toLocaleString()}</span></div>
            {shipping === 0 && <p style={{ fontSize: 12, color: '#22c55e', textAlign: 'center', marginTop: 8 }}>🎉 Free shipping applied!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
