import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { AuthContext } from '../../context/AuthContext';
import API, { API_URL } from '../../api';
import { resolveCategory, modelPath } from '../../utils/categories';
import { payOnline, getPaymentConfig } from '../../utils/razorpay';
import { COD_ENABLED } from '../../config';
import './ProductDetail.css';

/* ─── Butterfly + Trail — same signature motif as the Home hero ─── */
function ButterflyGlyph({ size, opacity, rotate }) {
  return (
    <svg
      viewBox="0 0 200 170" width={size} height={size * 0.85}
      style={{ opacity, transform: `rotate(${rotate}deg)` }}
      className="pd-bf-trail-svg" aria-hidden="true"
    >
      <path className="pd-bft-wing" d="M100,78 C118,30 168,16 180,44 C190,68 150,82 100,86 Z" />
      <path className="pd-bft-fill" d="M108,72 C120,42 152,34 158,52 C163,68 134,76 108,74 Z" />
      <path className="pd-bft-wing" d="M100,78 C82,30 32,16 20,44 C10,68 50,82 100,86 Z" />
      <path className="pd-bft-fill" d="M92,72 C80,42 48,34 42,52 C37,68 66,76 92,74 Z" />
      <path className="pd-bft-wing" d="M100,88 C116,112 146,118 140,134 C134,148 108,130 100,102 Z" />
      <path className="pd-bft-wing" d="M100,88 C84,112 54,118 60,134 C66,148 92,130 100,102 Z" />
      <ellipse className="pd-bft-body" cx="100" cy="82" rx="4.5" ry="22" />
      <path className="pd-bft-antenna" d="M96,62 C88,42 66,34 60,40 C56,44 62,48 68,44" />
      <path className="pd-bft-antenna" d="M104,62 C112,42 134,34 140,40 C144,44 138,48 132,44" />
    </svg>
  );
}
function Butterfly({ size = 40, opacity = 0.9, rotate = 0, speed = 2.3, className = '' }) {
  return (
    <div className={`pd-bf-3d-wrap ${className}`} style={{ width: size, height: size * 0.85, opacity, transform: `rotate(${rotate}deg)` }}>
      <div className="pd-bf-3d-inner" style={{ animationDuration: `${speed}s` }}>
        <ButterflyGlyph size={size} opacity={1} rotate={0} />
      </div>
    </div>
  );
}
function PageTrail() {
  return (
    <svg className="pd-trail-svg" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,60 C150,10 300,110 450,60 C600,10 750,110 900,60 C1000,32 1100,92 1200,58" />
    </svg>
  );
}



/* API → UI shape. sizes/colors always become arrays (the old code crashed when they arrived as text). */
const toList = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);
function normalize(p) {
  const images = toList(p.images).length ? toList(p.images) : (p.image ? [p.image] : []);
  return {
    id: p.productId || p.id || '', name: p.name || '', category: p.category || '',
    minPrice: Number(p.minPrice) || 0, maxPrice: Number(p.maxPrice) || 0,
    image: images[0] || '', images, sizes: toList(p.sizes), colors: toList(p.colors),
    badge: p.badge || '', description: p.description || '', isAvailable: p.isAvailable !== false, stock: p.stock,
  };
}

/* Exactly `count` thumbnails, repeating images if the product has fewer. */
function getGalleryImages(imgs, count = 4) {
  if (!imgs || imgs.length === 0) return [];
  if (imgs.length >= count) return imgs.slice(0, count);
  const padded = [...imgs]; let i = 0;
  while (padded.length < count) { padded.push(imgs[i % imgs.length]); i++; }
  return padded;
}

export default function CategoryModel({ cat, path }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useContext(CartContext);
  const { toggle, has } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [state, setState] = useState('loading');           // loading | ok | notfound | error
  const [mainImg, setMainImg] = useState(0);
  const [selSize, setSelSize] = useState('');
  const [selColor, setSelColor] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  /* order modal */
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState(COD_ENABLED ? 'cod' : 'razorpay');
  const [payMode, setPayMode] = useState(null);                // 'test' | 'live'
  const [onlineOn, setOnlineOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [orderMsg, setOrderMsg] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', pincode: '', size: '', color: '' });
  const [errors, setErrors] = useState({});

  const catInfo = resolveCategory(product?.category || cat || path);
  const listRoute = catInfo?.list || '/shop';
  const catLabel = catInfo?.name || product?.category || cat || 'Shop';

  /* load product + related products (same category, from the DB) */
  useEffect(() => {
    let alive = true;
    setProduct(null); setSimilar([]); setState('loading');
    setMainImg(0); setSelSize(''); setSelColor(''); setQty(1);
    window.scrollTo(0, 0);
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(id)}`);
        if (res.status === 404) { if (alive) setState('notfound'); return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        const p = normalize(data.product || data);          // ← API wraps the product in { success, product }
        if (!alive) return;
        setProduct(p); setState('ok');
        const r = await fetch(`${API_URL}/api/products?category=${encodeURIComponent(p.category)}&exclude=${encodeURIComponent(p.id)}&limit=4`);
        const rd = await r.json();
        if (alive) setSimilar((rd.products || []).map(normalize));
      } catch { if (alive) setState((s) => (s === 'ok' ? s : 'error')); }
    })();
    return () => { alive = false; };
  }, [id]);

  useEffect(() => { getPaymentConfig().then((c) => { setOnlineOn(c.onlineEnabled); setPayMode(c.mode); }); }, []);

  const rawImgs = product?.images?.length ? product.images : [];
  const imgs = getGalleryImages(rawImgs, 4);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIdx((i) => (i + 1) % (imgs.length || 1));
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => (i - 1 + (imgs.length || 1)) % (imgs.length || 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, imgs.length]);

  /* ───────── order flow ───────── */
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit phone';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit pincode';
    if (product.sizes.length > 0 && !form.size) e.size = 'Please select a size';
    if (product.colors.length > 0 && !form.color) e.color = 'Please select a colour';
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  const handleChange = (e) => { const { name, value } = e.target; setForm((f) => ({ ...f, [name]: value })); setErrors((er) => ({ ...er, [name]: '' })); };

  function openModal() {
    if (!user) { navigate('/login', { state: { from: location.pathname } }); return; }   // must be logged in to order
    setForm((f) => ({ ...f, size: selSize || product.sizes[0] || '', color: selColor || product.colors[0] || '', name: f.name || user.name || '', phone: f.phone || user.phone || '' }));
    setStep(1); setErrors({}); setOrderMsg(''); setOrderInfo(null); setPayMethod(COD_ENABLED ? 'cod' : 'razorpay');
    setShowModal(true);
  }
  function closeModal() { setShowModal(false); setStep(1); setBusy(false); setErrors({}); }

  async function placeOrder() {
    if (payMethod === 'razorpay' && !onlineOn) { setOrderMsg('Online payment is not available right now. Please try again later.'); return; }
    setBusy(true); setOrderMsg('');
    try {
      const { data } = await API.post('/api/orders', {
        items: [{ product: product.id, quantity: qty, size: form.size, color: form.color }],
        shippingAddress: { fullName: form.name, phone: form.phone, addressLine1: form.address, city: form.city, state: 'Tamil Nadu', pincode: form.pincode },
        paymentMethod: payMethod,
      });
      const info = { id: data.orderId, number: data.orderNumber, total: data.order.totalPrice };
      setOrderInfo(info);
      if (payMethod === 'razorpay') {
        const r = await payOnline(info.id, { name: form.name, contact: form.phone, email: user?.email || '' });
        if (!r.ok) { setOrderMsg(`${r.msg}. Your order ${info.number} is saved – you can pay again from "Track Orders".`); setStep(3); setBusy(false); return; }
      }
      setStep(3);
    } catch (e) {
      setOrderMsg(e.response?.data?.message || 'Could not place the order. Please try again.');
    }
    setBusy(false);
  }

  /* ───────── states ───────── */
  if (state === 'loading') return (
    <div className="pd-pg"><div className="container pd-loading"><div className="pd-loading-spinner" /><p>Loading product...</p></div></div>
  );
  if (state === 'notfound' || state === 'error' || !product) return (
    <div className="pd-pg"><div className="container pd-not-found">
      <div className="pd-nf-icon">&#128269;</div>
      <h2>{state === 'error' ? 'Could not load product' : 'Product Not Found'}</h2>
      <p style={{ marginBottom: 20, color: 'var(--text-light)' }}>{state === 'error' ? 'Please check your connection and try again.' : 'This product may not be available.'}</p>
      <Link to={listRoute} className="btn-gold">Back to {catLabel}</Link>
    </div></div>
  );
  if (!product.isAvailable) return (
    <div className="pd-pg"><div className="container pd-not-found">
      <div style={{ fontSize: 56, marginBottom: 16 }}>&#128683;</div>
      <h2>Currently Not Available</h2>
      <p style={{ marginBottom: 20, color: 'var(--text-light)' }}>This product is temporarily unavailable.</p>
      <Link to={listRoute} className="btn-gold">Back to {catLabel}</Link>
    </div></div>
  );

  const price = product.minPrice;
  const wished = has(product.id);
  const discount = product.maxPrice > price ? Math.round(((product.maxPrice - price) / product.maxPrice) * 100) : 0;
  const youSave = discount > 0 ? product.maxPrice - price : 0;
  const activeImgSrc = imgs[mainImg] || product.image;
  const subTotal = price * qty;
  const delivery = subTotal >= 1499 ? 0 : 99;

  const handleAdd = () => {
    if (product.sizes.length && !selSize) return alert('Please select a size first');
    if (product.colors.length && !selColor) return alert('Please select a colour first');
    addToCart({ id: product.id, name: product.name, image: imgs[0], price, qty, size: selSize, color: selColor, addons: [] });
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };
  const openLightbox = () => { setLightboxIdx(mainImg); setLightboxOpen(true); };
  const lightboxNext = () => setLightboxIdx((i) => (i + 1) % imgs.length);
  const lightboxPrev = () => setLightboxIdx((i) => (i - 1 + imgs.length) % imgs.length);

  return (
    <div className="pd-pg">
      <PageTrail />
      <Butterfly size={64} opacity={0.5} className="pd-bf-1" speed={2.4} />
      <Butterfly size={44} opacity={0.4} rotate={-10} className="pd-bf-2" speed={1.9} />
      <Butterfly size={30} opacity={0.35} rotate={8} className="pd-bf-3" speed={2.7} />

      <div className="container">
        <div style={{ marginBottom: 20 }}>
          <Link to={listRoute} className="pd-back-link">&#8592; Back to {catLabel}</Link>
        </div>

        <motion.div className="pd-layout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="pd-gallery">
            <div className="pd-gallery-main">
              <div className="pd-thumbs-col">
                {imgs.map((img, i) => (
                  <div key={i} className={`pd-thumb ${mainImg === i ? 'active' : ''}`} onClick={() => setMainImg(i)}><img src={img} alt={`${product.name} ${i + 1}`} /></div>
                ))}
              </div>
              <div className="pd-main-img" onClick={openLightbox}>
                <img src={activeImgSrc} alt={product.name} />
                {product.badge && <span className={`pd-img-badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>}
                {discount > 0 && <span className="pd-img-discount">{discount}% OFF</span>}
                <span className="pd-zoom-hint">&#128269; Click to view full image</span>
              </div>
            </div>
          </div>

          <div className="pd-info">
            <p className="pd-id">{product.id}</p>
            <h1 className="pd-name">{product.name}</h1>
            <div className="pd-price-row">
              <span className="pd-price">&#8377;{price.toLocaleString()}</span>
              {product.maxPrice > price && <span className="pd-upto">&#8377;{product.maxPrice.toLocaleString()}</span>}
              {discount > 0 && <span className="pd-disc-badge">{discount}% OFF</span>}
            </div>
            {youSave > 0 && <p className="pd-save-note">You save &#8377;{youSave.toLocaleString()} on this order</p>}

            <div className="pd-feature-tags">
              <span>&#9989; Handcrafted</span><span>&#128666; Free Delivery &#8377;1,499+</span>{COD_ENABLED ? <span>&#128181; Cash on Delivery</span> : <span>&#128274; Secure Online Payment</span>}
            </div>

            {product.sizes.length > 0 && (<>
              <p className="pd-section-title">Select Size</p>
              <div className="pd-sizes">{product.sizes.map((s) => (<button key={s} className={`pd-size-btn ${selSize === s ? 'sel' : ''}`} onClick={() => setSelSize(s)}>{s}</button>))}</div>
            </>)}
            {product.colors.length > 0 && (<>
              <p className="pd-section-title">Select Colour</p>
              <div className="pd-colors-text">{product.colors.map((c) => (<button key={c} className={`pd-col-pill ${selColor === c ? 'sel' : ''}`} onClick={() => setSelColor(c)}>{c}</button>))}</div>
            </>)}

            <p className="pd-section-title">Quantity</p>
            <div className="pd-qty-wrap"><div className="pd-qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>&#8722;</button><span>{qty}</span><button onClick={() => setQty((q) => q + 1)}>+</button>
            </div></div>

            <div className="pd-actions">
              <button className="pd-add-btn" onClick={handleAdd}><i className="fa-solid fa-bag-shopping" />{added ? 'Added to Cart!' : 'Add to Cart'}</button>
              <button className={`pd-wish-btn ${wished ? 'wished' : ''}`}
                onClick={() => toggle({ id: product.id, name: product.name, image: imgs[0], price: `₹${price.toLocaleString()}`, category: product.category })} aria-label="Wishlist">
                <i className={wished ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
              </button>
            </div>

            <button className="pd-prebook-btn" onClick={openModal}>&#128722; Order Now &#8212; &#8377;{subTotal.toLocaleString()}</button>
            {!user && <p className="pd-login-note"><i className="fa-solid fa-lock" /> Login is required to place an order</p>}

            <a href={`https://wa.me/918144372323?text=${encodeURIComponent(`Hi! I am interested in ${product.name} (${product.id})`)}`} target="_blank" rel="noreferrer" className="pd-wa-btn">
              <i className="fa-brands fa-whatsapp" /> Enquire on WhatsApp
            </a>

            {product.description && (
              <div className="pd-specs" style={{ marginTop: 20 }}>
                <h3>Product Description</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-light)', lineHeight: 1.7 }}>{product.description}</p>
              </div>
            )}
            <div className="pd-specs">
              <h3>Product Details</h3>
              {[['Category', catLabel], ['Material', 'Premium Quality'], ['Shipping', '7-10 Working Days'], ['Care', 'Dry clean recommended']].map(([l, v]) => (
                <div key={l} className="pd-spec-row"><span className="pd-spec-label">{l}</span><span className="pd-spec-val">{v}</span></div>
              ))}
            </div>
          </div>
        </motion.div>

        {similar.length > 0 && (
          <div className="pd-similar-section">
            <h2 className="pd-similar-title">You May Also Like</h2>
            <div className="pd-similar-grid">
              {similar.map((sp) => (
                <Link key={sp.id} to={modelPath(sp.category, sp.id)} className="pd-similar-card">
                  <div className="pd-similar-img">
                    <img src={sp.image} alt={sp.name} />
                    {sp.badge && <span className={`pd-similar-badge badge-${sp.badge.toLowerCase()}`}>{sp.badge}</span>}
                  </div>
                  <div className="pd-similar-info">
                    <h4>{sp.name}</h4>
                    <div className="pd-similar-price">
                      <span>&#8377;{sp.minPrice.toLocaleString()}</span>
                      {sp.maxPrice > sp.minPrice && <span className="pd-similar-strike">&#8377;{sp.maxPrice.toLocaleString()}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div className="pd-lightbox-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && setLightboxOpen(false)}>
            <button className="pd-lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close">&#10005;</button>
            <div className="pd-lightbox-stage">
              {imgs.length > 1 && <button className="pd-lightbox-arrow pd-lightbox-arrow-left" onClick={lightboxPrev} aria-label="Previous">‹</button>}
              <AnimatePresence mode="wait">
                <motion.img key={lightboxIdx} src={imgs[lightboxIdx]} alt={`${product.name} ${lightboxIdx + 1}`}
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }} />
              </AnimatePresence>
              {imgs.length > 1 && <button className="pd-lightbox-arrow pd-lightbox-arrow-right" onClick={lightboxNext} aria-label="Next">›</button>}
            </div>
            {imgs.length > 1 && (
              <div className="pd-lightbox-thumbs">
                {imgs.map((img, i) => (<div key={i} className={`pd-lightbox-thumb ${lightboxIdx === i ? 'active' : ''}`} onClick={() => setLightboxIdx(i)}><img src={img} alt={`thumb ${i + 1}`} /></div>))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ORDER MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="pb-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && !busy && closeModal()}>
            <motion.div className="pb-modal" initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 30 }}>
              <div className="pb-header">
                <h2>{step === 1 && '📋 Delivery Details'}{step === 2 && '✅ Confirm & Pay'}{step === 3 && (orderMsg ? '⚠️ Payment Pending' : '🎉 Order Placed!')}</h2>
                {step !== 3 && <button className="pb-close" onClick={closeModal} disabled={busy}>&#10005;</button>}
              </div>

              {step !== 3 && (
                <div className="pb-steps">
                  {['Details', 'Confirm'].map((s, i) => (
                    <React.Fragment key={s}>
                      <div className={`pb-step ${step >= i + 1 ? 'active' : ''}`}>{i + 1} {s}</div>
                      {i < 1 && <div className="pb-step-line" />}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="pb-form">
                  <div className="pb-field"><label>Full Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" />{errors.name && <span className="pb-err">{errors.name}</span>}</div>
                  <div className="pb-field"><label>Phone Number *</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} type="tel" />{errors.phone && <span className="pb-err">{errors.phone}</span>}</div>
                  <div className="pb-field"><label>Delivery Address *</label><textarea name="address" value={form.address} onChange={handleChange} placeholder="Door No, Street, Area" rows={2} />{errors.address && <span className="pb-err">{errors.address}</span>}</div>
                  <div className="pb-row2">
                    <div className="pb-field"><label>City *</label><input name="city" value={form.city} onChange={handleChange} placeholder="City" />{errors.city && <span className="pb-err">{errors.city}</span>}</div>
                    <div className="pb-field"><label>Pincode *</label><input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6 digits" maxLength={6} inputMode="numeric" />{errors.pincode && <span className="pb-err">{errors.pincode}</span>}</div>
                  </div>
                  {product.sizes.length > 0 && (
                    <div className="pb-field"><label>Size *</label>
                      <div className="pb-size-grid">{product.sizes.map((s) => (
                        <button key={s} type="button" className={`pb-size-btn ${form.size === s ? 'sel' : ''}`} onClick={() => { setForm((f) => ({ ...f, size: s })); setErrors((e) => ({ ...e, size: '' })); }}>{s}</button>))}</div>
                      {errors.size && <span className="pb-err">{errors.size}</span>}
                    </div>
                  )}
                  {product.colors.length > 0 && (
                    <div className="pb-field"><label>Colour *</label>
                      <div className="pb-color-grid">{product.colors.map((c) => (
                        <button key={c} type="button" className={`pb-color-btn ${form.color === c ? 'sel' : ''}`} onClick={() => { setForm((f) => ({ ...f, color: c })); setErrors((e) => ({ ...e, color: '' })); }}>{c}</button>))}</div>
                      {errors.color && <span className="pb-err">{errors.color}</span>}
                    </div>
                  )}
                  <button className="pb-primary-btn" onClick={() => { if (validate()) setStep(2); }}>Next &#8594; Confirm Order</button>
                </div>
              )}

              {step === 2 && (
                <div className="pb-confirm">
                  <div className="pb-confirm-product">
                    <img src={imgs[0]} alt={product.name} className="pb-mini-img" />
                    <div><h3>{product.name}</h3><p>{product.id} · Qty {qty}</p></div>
                  </div>
                  <table className="pb-confirm-table"><tbody>
                    <tr><td>Name</td><td>{form.name}</td></tr>
                    <tr><td>Phone</td><td>{form.phone}</td></tr>
                    <tr><td>Address</td><td>{form.address}, {form.city} – {form.pincode}</td></tr>
                    {form.size && <tr><td>Size</td><td>{form.size}</td></tr>}
                    {form.color && <tr><td>Colour</td><td>{form.color}</td></tr>}
                    <tr><td>Subtotal</td><td>&#8377;{subTotal.toLocaleString()}</td></tr>
                    <tr><td>Delivery</td><td>{delivery === 0 ? 'FREE' : `₹${delivery}`}</td></tr>
                    <tr className="pb-total-row"><td>Total</td><td>&#8377;{(subTotal + delivery).toLocaleString()}</td></tr>
                  </tbody></table>

                  <p className="pb-pay-title">Payment Method</p>
                  <div className="pb-pay-options">
                    {/* Cash on Delivery – switched off (set REACT_APP_ENABLE_COD=true to bring it back) */}
                    {COD_ENABLED && (
                      <label className={`pb-pay-opt ${payMethod === 'cod' ? 'on' : ''}`}>
                        <input type="radio" name="pay" checked={payMethod === 'cod'} onChange={() => setPayMethod('cod')} />
                        <i className="fa-solid fa-money-bill-wave" /><div><b>Cash on Delivery</b><small>Pay when your order arrives</small></div>
                      </label>
                    )}
                    <label className={`pb-pay-opt ${payMethod === 'razorpay' ? 'on' : ''} ${!onlineOn ? 'off' : ''}`}>
                      <input type="radio" name="pay" disabled={!onlineOn} checked={payMethod === 'razorpay'} onChange={() => setPayMethod('razorpay')} />
                      <i className="fa-solid fa-credit-card" /><div><b>Pay Online</b><small>{onlineOn ? 'UPI · Cards · Net Banking' : 'Not available right now'}</small></div>
                    </label>
                  </div>
                  {payMode === 'test' && <p style={{ fontSize: 12, color: '#b45309', background: '#fffbeb', padding: '8px 12px', borderRadius: 8, marginTop: 10 }}>🧪 Test mode – no real money. UPI: <b>success@razorpay</b> · Card: 4111 1111 1111 1111 (any future date, any CVV)</p>}
                  {orderMsg && <p className="pb-err" style={{ marginTop: 10 }}>{orderMsg}</p>}
                  <div className="pb-confirm-btns">
                    <button className="pb-outline-btn" onClick={() => setStep(1)} disabled={busy}>&#8592; Edit</button>
                    <button className="pb-pay-btn" onClick={placeOrder} disabled={busy || (payMethod === 'razorpay' && !onlineOn)}>
                      {busy ? 'Please wait…' : payMethod === 'cod' ? 'Place Order (COD)' : `Pay ₹${(subTotal + delivery).toLocaleString()}`}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="pb-success">
                  <motion.div className="pb-success-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220 }}>{orderMsg ? '⏳' : '🎉'}</motion.div>
                  <h3>{orderMsg ? 'Order saved' : 'Order Confirmed!'}</h3>
                  <p className="pb-order-id">Order ID: <strong>{orderInfo?.number}</strong></p>
                  {orderMsg ? <p>{orderMsg}</p> : <p>Thank you <strong>{form.name}</strong>! Your <strong>{product.name}</strong>{form.size ? ` (Size: ${form.size})` : ''}{form.color ? ` in ${form.color}` : ''} will be delivered in 7-10 working days.</p>}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
                    <button className="pb-primary-btn" style={{ width: 'auto', padding: '12px 22px' }} onClick={() => { closeModal(); navigate('/orders'); }}>Track My Order</button>
                    <button className="pb-outline-btn" onClick={closeModal}>Continue Shopping</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
