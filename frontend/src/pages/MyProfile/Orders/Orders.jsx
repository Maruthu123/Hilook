import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../../context/AuthContext';
import API from '../../../api';
import { payOnline, onlinePaymentEnabled } from '../../../utils/razorpay';
import './Orders.css';

const STEPS = [
  { key: 'placed', label: 'Placed', icon: 'fa-receipt' },
  { key: 'confirmed', label: 'Confirmed', icon: 'fa-circle-check' },
  { key: 'packed', label: 'Packed', icon: 'fa-box' },
  { key: 'shipped', label: 'Shipped', icon: 'fa-truck-fast' },
  { key: 'out_for_delivery', label: 'Out for delivery', icon: 'fa-motorcycle' },
  { key: 'delivered', label: 'Delivered', icon: 'fa-house-circle-check' },
];
const LABEL = { ...Object.fromEntries(STEPS.map((s) => [s.key, s.label])), cancelled: 'Cancelled' };
const BADGE = {
  placed: ['#ede9fe', '#7c3aed'], confirmed: ['#dbeafe', '#1d4ed8'], packed: ['#e0e7ff', '#4338ca'], shipped: ['#fef9c3', '#a16207'],
  out_for_delivery: ['#ffedd5', '#c2410c'], delivered: ['#dcfce7', '#166534'], cancelled: ['#fee2e2', '#991b1b'],
};
const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

function Tracker({ order }) {
  if (order.orderStatus === 'cancelled') return <div className="trk-cancelled"><i className="fa-solid fa-ban" /> This order was cancelled.</div>;
  const idx = Math.max(0, STEPS.findIndex((s) => s.key === order.orderStatus));
  return (
    <div className="trk">
      {STEPS.map((s, i) => (
        <div key={s.key} className={`trk-step ${i <= idx ? 'done' : ''} ${i === idx ? 'now' : ''}`}>
          <div className="trk-dot"><i className={`fa-solid ${s.icon}`} /></div>
          <span>{s.label}</span>
          {i < STEPS.length - 1 && <div className="trk-line"><motion.div initial={{ width: 0 }} animate={{ width: i < idx ? '100%' : '0%' }} transition={{ duration: 0.6, delay: i * 0.12 }} /></div>}
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [online, setOnline] = useState(false);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await API.get('/api/orders/my');
      setOrders(data.orders || []); setError('');
    } catch (e) { setError(e.response?.data?.message || 'Could not load your orders.'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); onlinePaymentEnabled().then(setOnline); }, [load]);

  async function cancel(o) {
    if (!window.confirm('Cancel this order?')) return;
    setBusy(o._id);
    try { await API.post(`/api/orders/${o._id}/cancel`); await load(); }
    catch (e) { alert(e.response?.data?.message || 'Could not cancel'); }
    setBusy('');
  }
  async function payNow(o) {
    setBusy(o._id);
    const r = await payOnline(o._id, { name: user?.name, email: user?.email, contact: o.shippingAddress?.phone });
    if (!r.ok && !r.dismissed) alert(r.msg);
    await load(); setBusy('');
  }

  if (loading) return <div className="orders-pg"><div className="container orders-empty"><div className="pd-loading-spinner" style={{ margin: '0 auto 14px' }} /><p>Loading your orders…</p></div></div>;
  if (error) return <div className="orders-pg"><div className="container orders-empty"><div style={{ fontSize: 44 }}>⚠️</div><h2>{error}</h2><button className="ord-shop-btn" onClick={() => { setLoading(true); load(); }}>Try again</button></div></div>;
  if (!orders.length) return (
    <div className="orders-pg"><div className="container orders-empty">
      <div style={{ fontSize: 52, marginBottom: 16 }}>📦</div><h2>No Orders Yet</h2>
      <p>Your orders and their live tracking will appear here</p><Link to="/shop" className="ord-shop-btn">Start Shopping</Link>
    </div></div>
  );

  return (
    <div className="orders-pg">
      <div className="container">
        <div className="orders-head">
          <div><h1 className="orders-title">Track My Orders</h1><p className="orders-sub">Hi {user?.name?.split(' ')[0]}, here is where your orders are right now.</p></div>
          <span className="orders-count">{orders.length} order{orders.length > 1 ? 's' : ''}</span>
        </div>

        <div className="orders-list">
          {orders.map((o, i) => {
            const [bg, tx] = BADGE[o.orderStatus] || ['#f3f4f6', '#374151'];
            const isOpen = open === o._id;
            const canCancel = ['placed', 'confirmed'].includes(o.orderStatus);
            const needsPay = o.paymentMethod === 'razorpay' && o.paymentStatus !== 'paid' && o.orderStatus !== 'cancelled';
            return (
              <motion.div key={o._id} className="order-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="order-card-top">
                  <div><span className="order-id">#{o.orderNumber}</span><span className="order-date">{fmt(o.createdAt)}</span></div>
                  <span className="order-status-badge" style={{ background: bg, color: tx }}>{LABEL[o.orderStatus] || o.orderStatus}</span>
                </div>

                {o.items.map((it, k) => (
                  <div className="order-product-row" key={k}>
                    {it.image && <img src={it.image} alt={it.name} />}
                    <div className="order-prod-info">
                      <p className="order-prod-name">{it.name}</p>
                      <p className="order-detail">Qty {it.quantity}{it.size ? ` · Size ${it.size}` : ''}{it.color ? ` · ${it.color}` : ''}</p>
                    </div>
                    <div className="order-price">₹{(it.price * it.quantity).toLocaleString()}</div>
                  </div>
                ))}

                <div className="order-meta">
                  <span className="pill"><i className={`fa-solid ${o.paymentMethod === 'cod' ? 'fa-money-bill-wave' : 'fa-credit-card'}`} /> {o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online payment'}</span>
                  <span className={`pill pay-${o.paymentStatus}`}>Payment: {o.paymentStatus}</span>
                  <span className="pill total">Total ₹{o.totalPrice.toLocaleString()}</span>
                </div>

                <Tracker order={o} />
                {o.trackingNumber && <p className="order-courier"><i className="fa-solid fa-truck" /> {o.courier || 'Courier'} · Tracking no: <b>{o.trackingNumber}</b></p>}

                <div className="order-actions">
                  <button className="ord-link" onClick={() => setOpen(isOpen ? null : o._id)}>{isOpen ? 'Hide' : 'View'} timeline <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} /></button>
                  {needsPay && online && <button className="ord-pay" disabled={busy === o._id} onClick={() => payNow(o)}>Pay now</button>}
                  {canCancel && <button className="order-cancel-btn" disabled={busy === o._id} onClick={() => cancel(o)}>Cancel order</button>}
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.ul className="timeline" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      {[...o.tracking].reverse().map((t, k) => (
                        <li key={k}><span className="tl-dot" /><div><b>{LABEL[t.status] || t.status}</b><p>{t.note}</p><small>{fmt(t.createdAt)}</small></div></li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
