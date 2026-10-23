import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/* ── ngrok-safe fetch ── */
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    window.location.href = '/login?mode=admin';
  }
  if (!res.ok) {
    const e = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(e.message || `Request failed (${res.status})`);
  }
  return res.json();
}

const ALL_CATS = [
  { label: 'All Products',    icon: '🛍️', value: 'All' },
  { label: 'Blouses',         icon: '👚', value: 'Blouses' },
  { label: 'Chudidars',       icon: '👗', value: 'Chudidars' },
  { label: 'Frocks',          icon: '👘', value: 'Frocks' },
  { label: 'Lehengas',        icon: '🌸', value: 'Lehengas' },
  { label: 'Party Wear',      icon: '✨', value: 'Party Wear' },
  { label: 'Handbags',        icon: '👜', value: 'Handbags' },
  { label: 'Slippers',        icon: '👡', value: 'Slippers' },
  { label: 'Watches',         icon: '⌚', value: 'Watches' },
  { label: "Men's Shirts",    icon: '👔', value: "Men's Shirts" },
  { label: "Men's Kurta",     icon: '🥻', value: "Men's Kurta" },
  { label: "Men's Pants",     icon: '👖', value: "Men's Pants" },
  { label: 'School Uniforms', icon: '🎒', value: 'School Uniforms' },
];

const STATUS_LIST = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_LABEL = { placed: 'Placed', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
const STATUS_BG = { placed: '#ede9fe', confirmed: '#dbeafe', packed: '#e0e7ff', shipped: '#fef9c3', out_for_delivery: '#ffedd5', delivered: '#dcfce7', cancelled: '#fee2e2' };
const STATUS_TX = { placed: '#7c3aed', confirmed: '#1d4ed8', packed: '#4338ca', shipped: '#d97706', out_for_delivery: '#c2410c', delivered: '#166534', cancelled: '#991b1b' };

const EMPTY_FORM = {
  productId: '', name: '', category: 'Blouses',
  minPrice: '', maxPrice: '', stock: '10',
  badge: '', description: '', isAvailable: true,
  sizes: 'S,M,L,XL', colors: 'Red,Blue,Green', images: '',
};

/* ── Happy Customers (Testimonials) empty form ── */
const EMPTY_TEST_FORM = {
  name: '', photo: '', location: '', rating: '5', message: '',
};

let _toastId = 0;

/* ── Safe helper: backend may send sizes/colors/images as
   an array OR a comma-separated string OR null. Normalize to string. */
function toCsv(val) {
  if (Array.isArray(val)) return val.join(',');
  if (typeof val === 'string') return val;
  return '';
}

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const isAdmin = true; // route is guarded: only the logged-in admin can reach this page

  const [tab, setTab]         = useState('dashboard');
  const [selCat, setSelCat]   = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats]     = useState({ totalOrders: 0, totalUsers: 0, totalProducts: 0, revenue: 0, recentOrders: [], statusCounts: [] });
  const [products, setProducts] = useState([]);
  const [orders, setOrders]   = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');

  /* ── Product Modal state ── */
  const [showModal, setShowModal] = useState(false);
  const [editProd, setEditProd]   = useState(null);
  const [pf, setPf]               = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [pErr, setPErr]           = useState('');

  /* ── Happy Customers (Testimonials) state ── */
  const [testimonials, setTestimonials] = useState([]);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editTest, setEditTest]           = useState(null);
  const [tf, setTf]                       = useState(EMPTY_TEST_FORM);
  const [testSaving, setTestSaving]       = useState(false);
  const [tErr, setTErr]                   = useState('');

  /* ── Settings state ── */
  const [settingsForm, setSettingsForm] = useState({ newEmail: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [settingsMsg, setSettingsMsg]   = useState('');
  const [settingsErr, setSettingsErr]   = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  /* ── Busy per-row ── */
  const [busyIds, setBusyIds] = useState({});
  const setBusy = (key, val) => setBusyIds(prev => ({ ...prev, [key]: val }));

  /* ── Toasts ── */
  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((msg, type = 'success') => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  /* ── Load data on tab/auth change ── */
  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'dashboard')   { load('dashboard'); load('products'); }
    if (tab === 'products')      load('products');
    if (tab === 'orders')        load('orders');
    if (tab === 'users')         load('users');
    if (tab === 'testimonials')  load('testimonials');
  }, [tab, isAdmin]); // eslint-disable-line

  async function load(what) {
    setLoading(true);
    try {
      if (what === 'dashboard') {
        const d = await apiFetch('/admin/dashboard');
        setStats({
          totalOrders:   d.stats?.totalOrders   || d.totalOrders   || 0,
          totalUsers:    d.stats?.totalUsers     || d.totalUsers    || 0,
          totalProducts: d.stats?.totalProducts  || d.totalProducts || 0,
          revenue:       d.stats?.totalRevenue   || d.revenue       || 0,
          recentOrders:  d.recentOrders  || [],
          statusCounts:  d.ordersByStatus || [],
        });
      }
      if (what === 'products') {
        const d = await apiFetch('/api/products?limit=500&admin=true');
        setProducts(d.products || []);
      }
      if (what === 'orders') {
        const d = await apiFetch('/admin/orders');
        setOrders(d.orders || []);
      }
      if (what === 'users') {
        const d = await apiFetch('/admin/users');
        setUsers(d.users || d || []);
      }
      if (what === 'testimonials') {
        const d = await apiFetch('/api/testimonials?admin=true');
        setTestimonials(d.testimonials || d || []);
      }
    } catch (e) {
      console.error(e);
      pushToast(`Couldn't load ${what}: ${e.message}`, 'error');
    }
    setLoading(false);
  }

  /* ── Product Modal helpers ── */
  function openAdd(cat) {
    setEditProd(null);
    setPf({ ...EMPTY_FORM, productId: '', category: cat !== 'All' ? cat : 'Blouses' });
    setPErr('');
    setShowModal(true);
  }
  function openEdit(p) {
    setEditProd(p);
    setPf({
      productId:   p.productId,
      name:        p.name,
      category:    p.category,
      minPrice:    p.minPrice,
      maxPrice:    p.maxPrice  || '',
      stock:       p.stock ?? 10,
      badge:       p.badge     || '',
      description: p.description || '',
      isAvailable: p.isAvailable !== false,
      sizes:       toCsv(p.sizes),
      colors:      toCsv(p.colors),
      images:      toCsv(p.images),
    });
    setPErr('');
    setShowModal(true);
  }

  /* ── Save product (add or edit) ── */
  async function saveProd() {
    if (!pf.name.trim() || !pf.minPrice) { setPErr('Name and price are required'); return; }
    setSaving(true); setPErr('');

    const payload = {
      ...(editProd ? { productId: pf.productId.trim() } : {}),
      name:        pf.name.trim(),
      category:    pf.category,
      minPrice:    Number(pf.minPrice),
      maxPrice:    Number(pf.maxPrice)  || undefined,
      stock:       Number(pf.stock)     || 0,
      badge:       pf.badge             || undefined,
      description: pf.description,
      isAvailable: pf.isAvailable,
      sizes:       pf.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors:      pf.colors.split(',').map(c => c.trim()).filter(Boolean),
      images:      pf.images.split(',').map(i => i.trim()).filter(Boolean),
    };

    try {
      if (editProd) {
        const res = await apiFetch(`/api/products/${editProd.productId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        const updated = res.product || res;
        setProducts(prev =>
          prev.map(p =>
            p.productId === editProd.productId ? { ...p, ...payload, ...updated } : p
          )
        );
        pushToast('Product updated ✅');
      } else {
        const res = await apiFetch('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const created = res.product || res;
        setProducts(prev => [created, ...prev]);
        pushToast('Product added ✅');
      }
      setShowModal(false);
    } catch (e) {
      setPErr(e.message);
    }
    setSaving(false);
  }

  /* ── Delete product ── */
  async function delProd(productId) {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setBusy('del-' + productId, true);
    try {
      await apiFetch(`/api/products/${productId}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.productId !== productId));
      pushToast('Product deleted');
    } catch (e) { pushToast('Delete failed: ' + e.message, 'error'); }
    setBusy('del-' + productId, false);
  }

  /* ── Toggle availability ── */
  async function toggleAvail(productId, currentlyAvailable) {
    const isAvailable = !currentlyAvailable;
    setBusy('avail-' + productId, true);
    try {
      await apiFetch(`/api/products/${productId}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable }),
      });
      setProducts(prev => prev.map(p => p.productId === productId ? { ...p, isAvailable } : p));
      pushToast(isAvailable ? 'Marked available' : 'Marked unavailable');
    } catch (e) { pushToast('Failed: ' + e.message, 'error'); }
    setBusy('avail-' + productId, false);
  }

  /* ── Order status ── */
  async function updateOrderStatus(id, status) {
    setBusy('status-' + id, true);
    try {
      let extra = {};
      if (status === 'shipped') {
        const courier = window.prompt('Courier name (optional, e.g. DTDC, India Post):') || '';
        const trackingNumber = window.prompt('Tracking / LR number (optional):') || '';
        extra = { courier, trackingNumber };
      }
      await apiFetch(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, ...extra }) });
      setOrders(prev => prev.map(o => (o.orderId === id || o._id === id) ? { ...o, status, orderStatus: status } : o));
      pushToast('Order updated');
    } catch (e) { pushToast('Status update failed: ' + e.message, 'error'); }
    setBusy('status-' + id, false);
  }

  async function delOrder(id) {
    if (!window.confirm('Delete this order?')) return;
    setBusy('order-' + id, true);
    try {
      await apiFetch(`/admin/orders/${id}`, { method: 'DELETE' });
      setOrders(prev => prev.filter(o => o.orderId !== id && o._id !== id));
      pushToast('Order deleted');
    } catch (e) { pushToast('Delete failed: ' + e.message, 'error'); }
    setBusy('order-' + id, false);
  }

  /* ── User delete ── */
  async function delUser(id) {
    if (!window.confirm('Delete this user?')) return;
    setBusy('user-' + id, true);
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u._id !== id));
      pushToast('User deleted');
    } catch (e) { pushToast('Delete failed: ' + e.message, 'error'); }
    setBusy('user-' + id, false);
  }

  /* ── Happy Customers (Testimonials) helpers ── */
  function openAddTest() {
    setEditTest(null);
    setTf(EMPTY_TEST_FORM);
    setTErr('');
    setShowTestModal(true);
  }
  function openEditTest(t) {
    setEditTest(t);
    setTf({
      name:     t.name || '',
      photo:    t.photo || t.image || '',
      location: t.location || t.city || '',
      rating:   String(t.rating || 5),
      message:  t.message || t.review || '',
    });
    setTErr('');
    setShowTestModal(true);
  }
  async function saveTest() {
    if (!tf.name.trim() || !tf.message.trim()) { setTErr('Name and review message are required'); return; }
    setTestSaving(true); setTErr('');

    const payload = {
      name:     tf.name.trim(),
      photo:    tf.photo.trim(),
      location: tf.location.trim(),
      rating:   Number(tf.rating) || 5,
      message:  tf.message.trim(),
    };

    try {
      if (editTest) {
        const res = await apiFetch(`/api/testimonials/${editTest._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        const updated = res.testimonial || res;
        setTestimonials(prev =>
          prev.map(t => t._id === editTest._id ? { ...t, ...payload, ...updated } : t)
        );
        pushToast('Review updated ✅');
      } else {
        const res = await apiFetch('/api/testimonials', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const created = res.testimonial || res;
        setTestimonials(prev => [created, ...prev]);
        pushToast('Review added ✅');
      }
      setShowTestModal(false);
    } catch (e) {
      setTErr(e.message);
    }
    setTestSaving(false);
  }
  async function delTest(id) {
    if (!window.confirm('Delete this customer review?')) return;
    setBusy('test-' + id, true);
    try {
      await apiFetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      setTestimonials(prev => prev.filter(t => t._id !== id));
      pushToast('Review deleted');
    } catch (e) { pushToast('Delete failed: ' + e.message, 'error'); }
    setBusy('test-' + id, false);
  }

  /* ── Settings ── */
  async function saveAdminSettings() {
    setSettingsErr(''); setSettingsMsg('');
    if (!settingsForm.currentPassword) return setSettingsErr('Current password required');
    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword)
      return setSettingsErr('New passwords do not match');
    if (settingsForm.newPassword && settingsForm.newPassword.length < 6)
      return setSettingsErr('Password must be at least 6 characters');
    setSettingsSaving(true);
    try {
      const body = { currentPassword: settingsForm.currentPassword };
      if (settingsForm.newEmail)    body.newEmail    = settingsForm.newEmail;
      if (settingsForm.newPassword) body.newPassword = settingsForm.newPassword;
      const data = await apiFetch('/admin/change-credentials', { method: 'PUT', body: JSON.stringify(body) });
      if (data.success) {
        setSettingsMsg('Updated! Re-login if you changed email.');
        setSettingsForm({ newEmail: '', currentPassword: '', newPassword: '', confirmPassword: '' });
        pushToast('Credentials updated');
      } else { setSettingsErr(data.message || 'Failed to update'); }
    } catch (e) { setSettingsErr('Error: ' + e.message); }
    setSettingsSaving(false);
  }

  function handleLogout() { logout(); navigate('/login?mode=admin'); }

  /* ── Filtered products ── */
  const filteredProds = products.filter(p => {
    const inCat = selCat === 'All' || p.category === selCat;
    const q = search.toLowerCase();
    return inCat && (!q || p.name?.toLowerCase().includes(q) || p.productId?.toLowerCase().includes(q));
  });

  /* ── Sidebar nav item helper ── */
  function NavItem({ id, icon, label }) {
    const active = tab === id && (id !== 'products' || selCat === 'All');
    return (
      <button className={`adm-nav-item ${active ? 'on' : ''}`}
        onClick={() => { setTab(id); setSelCat('All'); setSidebarOpen(false); }}>
        <span className="adm-nav-icon">{icon}</span>
        <span>{label}</span>
      </button>
    );
  }

  /* ════════════════════════════════════════════════════════
     MAIN DASHBOARD
  ════════════════════════════════════════════════════════ */
  return (
    <div className="adm">

      {/* ── Toasts ── */}
      <div className="adm-toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`adm-toast adm-toast-${t.type}`}>
            <span>{t.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="adm-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="adm-layout">

        {/* ════ SIDEBAR ════ */}
        <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="adm-logo">
            <span>⚙️</span>
            <span>Nisha Admin</span>
          </div>

          <div className="adm-nav-section">
            <div className="adm-nav-group-label">Overview</div>
            <NavItem id="dashboard"    icon="📊" label="Dashboard" />
            <NavItem id="orders"       icon="📦" label="Orders" />
            <NavItem id="users"        icon="👥" label="Users" />
            <NavItem id="testimonials" icon="💬" label="Happy Customers" />
            <NavItem id="settings"     icon="🔑" label="Settings" />
          </div>

          <div className="adm-nav-group-label" style={{ marginTop: 8 }}>Products</div>
          <div className="adm-cat-nav">
            {ALL_CATS.map(c => {
              const cnt     = c.value === 'All' ? products.length : products.filter(p => p.category === c.value).length;
              const unavail = c.value === 'All' ? 0 : products.filter(p => p.category === c.value && p.isAvailable === false).length;
              const active  = tab === 'products' && selCat === c.value;
              return (
                <button key={c.value}
                  className={`adm-cat-nav-item ${active ? 'on' : ''}`}
                  onClick={() => { setTab('products'); setSelCat(c.value); setSidebarOpen(false); }}>
                  <span className="adm-cat-nav-label">{c.icon} {c.label}</span>
                  <div className="adm-cat-nav-right">
                    {unavail > 0 && <span className="adm-cat-nav-unavail">{unavail}</span>}
                    <span className="adm-cat-count">{cnt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />
          <div className="adm-sidebar-footer">
            <button className="adm-nav-item adm-nav-shop" onClick={() => navigate('/')}>🏠 View Shop</button>
            <button className="adm-nav-item adm-nav-logout" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <main className="adm-main">

          {/* Mobile topbar */}
          <div className="adm-mobile-topbar">
            <button className="adm-hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <span className="adm-mobile-title">⚙️ Nisha Admin</span>
          </div>

          {loading && <div className="adm-loading"><div className="adm-loading-bar" /></div>}

          {/* ─── DASHBOARD TAB ─── */}
          {tab === 'dashboard' && (
            <>
              <div className="adm-page-header">
                <div>
                  <h1 className="adm-title">Dashboard</h1>
                  <p className="adm-subtitle">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="adm-cards">
                {[
                  { label: 'Total Orders',  val: stats.totalOrders,                                      icon: '📦', accent: '#7c3aed', bg: '#ede9fe' },
                  { label: 'Revenue',       val: '₹' + Number(stats.revenue || 0).toLocaleString(),      icon: '💰', accent: '#166534', bg: '#dcfce7' },
                  { label: 'Products',      val: stats.totalProducts,                                    icon: '👗', accent: '#1d4ed8', bg: '#dbeafe' },
                  { label: 'Customers',     val: stats.totalUsers,                                       icon: '👥', accent: '#d97706', bg: '#fef9c3' },
                ].map(c => (
                  <div key={c.label} className="adm-stat-card" style={{ '--accent': c.accent, '--bg': c.bg }}>
                    <div className="adm-stat-icon">{c.icon}</div>
                    <div className="adm-stat-val">{c.val}</div>
                    <div className="adm-stat-label">{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Orders table */}
              <div className="adm-panel">
                <div className="adm-panel-header">
                  <h2 className="adm-panel-title">Recent Orders</h2>
                  <button className="adm-link-btn" onClick={() => setTab('orders')}>View All →</button>
                </div>
                <div className="adm-table-scroll">
                  <table className="adm-table">
                    <thead>
                      <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {(stats.recentOrders || []).map(o => (
                        <tr key={o._id}>
                          <td><code className="adm-code">{o.orderNumber || o._id?.slice(-8)}</code></td>
                          <td>{o.user?.name || o.user?.email || '—'}</td>
                          <td>₹{(o.totalPrice || o.totalAmount || 0).toLocaleString()}</td>
                          <td>
                            <span className="adm-badge"
                              style={{ background: STATUS_BG[o.orderStatus || o.status] || '#f3f4f6', color: STATUS_TX[o.orderStatus || o.status] || '#374151' }}>
                              {o.orderStatus || o.status || 'placed'}
                            </span>
                          </td>
                          <td className="adm-muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                      {!stats.recentOrders?.length && (
                        <tr><td colSpan={5} className="adm-empty-row">No recent orders</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category summary */}
              <div className="adm-panel" style={{ marginTop: 16 }}>
                <div className="adm-panel-header">
                  <h2 className="adm-panel-title">Categories</h2>
                  <button className="adm-link-btn" onClick={() => { setTab('products'); setSelCat('All'); }}>Manage →</button>
                </div>
                <div className="adm-cat-summary-grid">
                  {ALL_CATS.filter(c => c.value !== 'All').map(c => {
                    const prods   = products.filter(p => p.category === c.value);
                    const unavail = prods.filter(p => p.isAvailable === false).length;
                    return (
                      <div key={c.value} className="adm-cat-card"
                        onClick={() => { setTab('products'); setSelCat(c.value); }}>
                        <div className="adm-cat-card-icon">{c.icon}</div>
                        <div className="adm-cat-card-name">{c.label}</div>
                        <div className="adm-cat-card-count">{prods.length} items</div>
                        {unavail > 0 && <div className="adm-cat-card-unavail">{unavail} hidden</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ─── PRODUCTS TAB ─── */}
          {tab === 'products' && (
            <>
              <div className="adm-page-header">
                <div>
                  <h1 className="adm-title">
                    {selCat === 'All' ? 'All Products' : selCat}
                    <span className="adm-count-pill">{filteredProds.length}</span>
                  </h1>
                </div>
                <button className="adm-primary-btn" onClick={() => openAdd(selCat)}>
                  + Add Product
                </button>
              </div>

              <div className="adm-search-wrap">
                <span className="adm-search-icon">🔍</span>
                <input className="adm-search" placeholder="Search by name or ID…"
                  value={search} onChange={e => setSearch(e.target.value)} />
                {search && (
                  <button className="adm-search-clear" onClick={() => setSearch('')}>✕</button>
                )}
              </div>

              {filteredProds.length === 0 ? (
                <div className="adm-empty-state">
                  <div className="adm-empty-icon">📦</div>
                  <p>No products in this category yet</p>
                  <button className="adm-primary-btn" style={{ marginTop: 16 }} onClick={() => openAdd(selCat)}>
                    + Add First Product
                  </button>
                </div>
              ) : (
                <div className="adm-prod-grid">
                  {filteredProds.map(p => {
                    const isDelBusy   = busyIds['del-'   + p.productId];
                    const isAvailBusy = busyIds['avail-' + p.productId];
                    const available   = p.isAvailable !== false;
                    return (
                      <div key={p._id || p.productId} className={`adm-prod-card ${!available ? 'unavailable' : ''}`}>
                        {!available && <div className="adm-unavail-ribbon">🚫 Not Available</div>}

                        <div className="adm-prod-img">
                          {(() => {
                            const imgArr = Array.isArray(p.images) ? p.images : toCsv(p.images).split(',').filter(Boolean);
                            return imgArr[0]
                              ? <img src={imgArr[0]} alt={p.name} />
                              : <div className="adm-prod-no-img">📷</div>;
                          })()}
                          {p.badge && (
                            <span className={`adm-prod-badge badge-${p.badge.toLowerCase()}`}>{p.badge}</span>
                          )}
                          {p.stock === 0 && (
                            <span className="adm-prod-badge badge-out">Out of Stock</span>
                          )}
                        </div>

                        <div className="adm-prod-body">
                          <p className="adm-prod-id">{p.productId}</p>
                          <h3 className="adm-prod-name">{p.name}</h3>
                          <p className="adm-prod-cat">{p.category}</p>
                          <div className="adm-prod-price-row">
                            <span className="adm-prod-price">₹{(p.minPrice || 0).toLocaleString()}</span>
                            {p.maxPrice && <span className="adm-prod-mrp">₹{p.maxPrice.toLocaleString()}</span>}
                          </div>
                          <p className="adm-prod-stock" style={{ color: p.stock < 1 ? '#dc2626' : p.stock < 5 ? '#d97706' : '#166534' }}>
                            {p.stock < 1 ? '⚠️ Out of stock' : `Stock: ${p.stock}`}
                          </p>
                        </div>

                        <div className="adm-prod-actions">
                          <button className="adm-btn adm-btn-edit" onClick={() => openEdit(p)}>
                            ✏️ Edit
                          </button>
                          <button
                            className={`adm-btn ${available ? 'adm-btn-warn' : 'adm-btn-success'}`}
                            disabled={isAvailBusy}
                            onClick={() => toggleAvail(p.productId, available)}>
                            {isAvailBusy ? '…' : available ? '🚫 Hide' : '✅ Show'}
                          </button>
                          <button className="adm-btn adm-btn-danger" disabled={isDelBusy}
                            onClick={() => delProd(p.productId)}>
                            {isDelBusy ? '…' : '🗑️ Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ─── HAPPY CUSTOMERS TAB ─── */}
          {tab === 'testimonials' && (
            <>
              <div className="adm-page-header">
                <h1 className="adm-title">Happy Customers <span className="adm-count-pill">{testimonials.length}</span></h1>
                <button className="adm-primary-btn" onClick={openAddTest}>+ Add Review</button>
              </div>

              {testimonials.length === 0 ? (
                <div className="adm-empty-state">
                  <div className="adm-empty-icon">💬</div>
                  <p>No customer reviews added yet</p>
                  <button className="adm-primary-btn" style={{ marginTop: 16 }} onClick={openAddTest}>
                    + Add First Review
                  </button>
                </div>
              ) : (
                <div className="adm-test-grid">
                  {testimonials.map(t => {
                    const isDelBusy = busyIds['test-' + t._id];
                    return (
                      <div key={t._id} className="adm-test-card">
                        <div className="adm-test-top">
                          <div className="adm-test-avatar">
                            {t.photo
                              ? <img src={t.photo} alt={t.name} />
                              : <span>{t.name?.[0]?.toUpperCase() || '😊'}</span>}
                          </div>
                          <div>
                            <p className="adm-test-name">{t.name}</p>
                            {t.location && <p className="adm-test-loc">{t.location}</p>}
                          </div>
                        </div>
                        <div className="adm-test-stars">
                          {'★'.repeat(t.rating || 5)}{'☆'.repeat(5 - (t.rating || 5))}
                        </div>
                        <p className="adm-test-msg">"{t.message}"</p>
                        <div className="adm-prod-actions">
                          <button className="adm-btn adm-btn-edit" onClick={() => openEditTest(t)}>
                            ✏️ Edit
                          </button>
                          <button className="adm-btn adm-btn-danger" disabled={isDelBusy}
                            onClick={() => delTest(t._id)}>
                            {isDelBusy ? '…' : '🗑️ Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ─── ORDERS TAB ─── */}
          {tab === 'orders' && (
            <>
              <div className="adm-page-header">
                <h1 className="adm-title">Orders <span className="adm-count-pill">{orders.length}</span></h1>
              </div>
              <div className="adm-panel">
                <div className="adm-table-scroll">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Order ID</th><th>Product</th><th>Customer</th><th>Phone</th>
                        <th>Size</th><th>Colour</th><th>Address</th><th>Amount</th>
                        <th>Payment</th><th>Date</th><th>Status</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => {
                        const id = o._id || o.orderId;
                        const isStatusBusy = busyIds['status-' + id];
                        const isOrderDel   = busyIds['order-'  + id];
                        return (
                          <tr key={o._id}>
                            <td><code className="adm-code">{o.orderNumber || o._id?.slice(-8)}</code></td>
                            <td className="adm-muted" style={{ maxWidth: 110 }}>{o.items?.map(i => i.name).join(', ') || '—'}</td>
                            <td>{o.user?.name || o.user?.email || '—'}</td>
                            <td>{o.user?.phone || o.shippingAddress?.phone || '—'}</td>
                            <td>{o.items?.[0]?.size  || '—'}</td>
                            <td>{o.items?.[0]?.color || '—'}</td>
                            <td className="adm-muted" style={{ maxWidth: 130 }}>
                              {o.shippingAddress?.addressLine1
                                ? `${o.shippingAddress.addressLine1}, ${o.shippingAddress.city || ''}`
                                : o.address?.line1
                                  ? `${o.address.line1}, ${o.address.city || ''}`
                                  : '—'}
                            </td>
                            <td>₹{(o.totalPrice || o.totalAmount || 0).toLocaleString()}</td>
                            <td>
                              <span className="adm-muted" style={{ display: 'block', fontSize: 11, fontWeight: 700 }}>{o.paymentMethod === 'cod' ? 'COD' : 'ONLINE'}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: o.paymentStatus === 'paid' ? '#166534' : o.paymentStatus === 'failed' ? '#991b1b' : '#b45309' }}>{(o.paymentStatus || 'pending').toUpperCase()}</span>
                            </td>
                            <td className="adm-muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                            <td>
                              <select className="adm-status-select" disabled={isStatusBusy}
                                style={{
                                  background: STATUS_BG[o.orderStatus || o.status] || '#f3f4f6',
                                  color:      STATUS_TX[o.orderStatus || o.status] || '#374151',
                                }}
                                value={o.orderStatus || o.status || 'placed'}
                                onChange={e => updateOrderStatus(id, e.target.value)}>
                                {STATUS_LIST.map(s => (
                                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <button className="adm-del-icon-btn" disabled={isOrderDel} onClick={() => delOrder(id)}>
                                {isOrderDel ? '…' : '🗑'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {orders.length === 0 && <div className="adm-empty-state" style={{ padding: '32px 0' }}>No orders yet</div>}
                </div>
              </div>
            </>
          )}

          {/* ─── USERS TAB ─── */}
          {tab === 'users' && (
            <>
              <div className="adm-page-header">
                <h1 className="adm-title">Customers <span className="adm-count-pill">{users.length}</span></h1>
              </div>
              <div className="adm-panel">
                <div className="adm-table-scroll">
                  <table className="adm-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Phone</th><th>Verified</th><th>Logins</th><th>Last Login</th><th>Orders</th><th>Spent</th><th>Joined</th><th></th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => {
                        const isUserDel = busyIds['user-' + u._id];
                        return (
                          <tr key={u._id}>
                            <td>{u.name || '—'}</td>
                            <td>{u.email}</td>
                            <td>{u.phone || '—'}</td>
                            <td>{u.isVerified
                              ? <span className="adm-verified">✅</span>
                              : <span className="adm-unverified">❌</span>}
                            </td>
                            <td>{u.loginCount ?? 0}</td>
                            <td className="adm-muted">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
                            <td>{u.orderCount ?? 0}</td>
                            <td>₹{(u.totalSpent || 0).toLocaleString()}</td>
                            <td className="adm-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                            <td>
                              <button className="adm-del-icon-btn" disabled={isUserDel} onClick={() => delUser(u._id)}>
                                {isUserDel ? '…' : '🗑'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {users.length === 0 && <div className="adm-empty-state" style={{ padding: '32px 0' }}>No customers yet</div>}
                </div>
              </div>
            </>
          )}

          {/* ─── SETTINGS TAB ─── */}
          {tab === 'settings' && (
            <div className="adm-settings-page">
              <div className="adm-page-header">
                <h1 className="adm-title">🔑 Settings</h1>
              </div>
              <div className="adm-settings-card">
                <h3 className="adm-settings-section-title">Change Admin Credentials</h3>
                <div className="adm-form-group">
                  <label>New Email <span className="adm-optional">(optional)</span></label>
                  <input className="adm-input" type="email" placeholder="Leave blank to keep current"
                    value={settingsForm.newEmail}
                    onChange={e => setSettingsForm(f => ({ ...f, newEmail: e.target.value }))} />
                </div>
                <div className="adm-form-group">
                  <label>Current Password <span className="adm-required">*</span></label>
                  <input className="adm-input" type="password" placeholder="Required"
                    value={settingsForm.currentPassword}
                    onChange={e => setSettingsForm(f => ({ ...f, currentPassword: e.target.value }))} />
                </div>
                <div className="adm-form-group">
                  <label>New Password <span className="adm-optional">(optional)</span></label>
                  <input className="adm-input" type="password" placeholder="Leave blank to keep current"
                    value={settingsForm.newPassword}
                    onChange={e => setSettingsForm(f => ({ ...f, newPassword: e.target.value }))} />
                </div>
                <div className="adm-form-group" style={{ marginBottom: 24 }}>
                  <label>Confirm New Password</label>
                  <input className="adm-input" type="password" placeholder="Repeat new password"
                    value={settingsForm.confirmPassword}
                    onChange={e => setSettingsForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                </div>
                {settingsErr && <p className="adm-msg-err">❌ {settingsErr}</p>}
                {settingsMsg && <p className="adm-msg-ok">✅ {settingsMsg}</p>}
                <button className="adm-primary-btn" style={{ width: '100%' }}
                  onClick={saveAdminSettings} disabled={settingsSaving}>
                  {settingsSaving ? 'Saving…' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ════ PRODUCT MODAL ════ */}
      {showModal && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h3>{editProd ? `✏️ Edit — ${editProd.name}` : '➕ Add New Product'}</h3>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              {pErr && <div className="adm-modal-err">⚠️ {pErr}</div>}

              <div className="adm-form-grid">
                <div className="adm-form-group">
                  <label>Product ID {editProd ? '' : <span className="adm-optional">(auto-generated)</span>}</label>
                  <input className="adm-input"
                    value={editProd ? pf.productId : 'Will be auto-generated…'}
                    placeholder="NishaBoutiqueBlouse001"
                    disabled
                    onChange={() => {}} />
                </div>
                <div className="adm-form-group">
                  <label>Category *</label>
                  <select className="adm-input" value={pf.category}
                    onChange={e => setPf(f => ({ ...f, category: e.target.value }))}>
                    {ALL_CATS.filter(c => c.value !== 'All').map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="adm-form-group adm-form-full">
                  <label>Product Name *</label>
                  <input className="adm-input" value={pf.name} placeholder="Silk Embroidery Blouse"
                    onChange={e => setPf(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="adm-form-group">
                  <label>Selling Price ₹ *</label>
                  <input className="adm-input" type="number" value={pf.minPrice} placeholder="899"
                    onChange={e => setPf(f => ({ ...f, minPrice: e.target.value }))} />
                </div>
                <div className="adm-form-group">
                  <label>MRP ₹</label>
                  <input className="adm-input" type="number" value={pf.maxPrice} placeholder="1299"
                    onChange={e => setPf(f => ({ ...f, maxPrice: e.target.value }))} />
                </div>
                <div className="adm-form-group">
                  <label>Stock</label>
                  <input className="adm-input" type="number" value={pf.stock} placeholder="10"
                    onChange={e => setPf(f => ({ ...f, stock: e.target.value }))} />
                </div>
                <div className="adm-form-group">
                  <label>Badge</label>
                  <select className="adm-input" value={pf.badge}
                    onChange={e => setPf(f => ({ ...f, badge: e.target.value }))}>
                    <option value="">None</option>
                    <option value="New">New</option>
                    <option value="Trending">Trending</option>
                    <option value="Popular">Popular</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div className="adm-form-group adm-form-full">
                  <label>Sizes (comma separated)</label>
                  <input className="adm-input" value={pf.sizes} placeholder="S,M,L,XL,XXL"
                    onChange={e => setPf(f => ({ ...f, sizes: e.target.value }))} />
                </div>
                <div className="adm-form-group adm-form-full">
                  <label>Colors (comma separated)</label>
                  <input className="adm-input" value={pf.colors} placeholder="Red,Blue,Green"
                    onChange={e => setPf(f => ({ ...f, colors: e.target.value }))} />
                </div>
                <div className="adm-form-group adm-form-full">
                  <label>Image Path</label>
                  <input className="adm-input" value={pf.images} placeholder="/image/blouse/blouses1.jpeg"
                    onChange={e => setPf(f => ({ ...f, images: e.target.value }))} />
                </div>
                <div className="adm-form-group adm-form-full">
                  <label>Description</label>
                  <textarea className="adm-input adm-textarea" value={pf.description} rows={3}
                    placeholder="Product description…"
                    onChange={e => setPf(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="adm-form-group adm-form-full">
                  <label>Availability</label>
                  <label className="adm-toggle-wrap">
                    <input type="checkbox" checked={pf.isAvailable}
                      onChange={e => setPf(f => ({ ...f, isAvailable: e.target.checked }))} />
                    <span className="adm-toggle-track">
                      <span className="adm-toggle-thumb" />
                    </span>
                    <span style={{ marginLeft: 10, fontWeight: 600, color: pf.isAvailable ? '#166534' : '#dc2626' }}>
                      {pf.isAvailable ? '✅ Available' : '🚫 Not Available'}
                    </span>
                  </label>
                </div>
              </div>

              <button className="adm-primary-btn adm-modal-save" onClick={saveProd} disabled={saving}>
                {saving ? 'Saving…' : editProd ? '✅ Update Product' : '➕ Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ HAPPY CUSTOMER MODAL ════ */}
      {showTestModal && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setShowTestModal(false)}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h3>{editTest ? `✏️ Edit — ${editTest.name}` : '➕ Add Happy Customer'}</h3>
              <button className="adm-modal-close" onClick={() => setShowTestModal(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              {tErr && <div className="adm-modal-err">⚠️ {tErr}</div>}

              <div className="adm-form-grid">
                <div className="adm-form-group adm-form-full">
                  <label>Customer Name *</label>
                  <input className="adm-input" value={tf.name} placeholder="Priya Sharma"
                    onChange={e => setTf(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="adm-form-group">
                  <label>Location <span className="adm-optional">(optional)</span></label>
                  <input className="adm-input" value={tf.location} placeholder="Coimbatore"
                    onChange={e => setTf(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="adm-form-group">
                  <label>Rating</label>
                  <select className="adm-input" value={tf.rating}
                    onChange={e => setTf(f => ({ ...f, rating: e.target.value }))}>
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>
                    ))}
                  </select>
                </div>
                <div className="adm-form-group adm-form-full">
                  <label>Photo URL <span className="adm-optional">(optional)</span></label>
                  <input className="adm-input" value={tf.photo} placeholder="/image/customers/priya.jpg"
                    onChange={e => setTf(f => ({ ...f, photo: e.target.value }))} />
                </div>
                <div className="adm-form-group adm-form-full">
                  <label>Review Message *</label>
                  <textarea className="adm-input adm-textarea" rows={3} value={tf.message}
                    placeholder="I loved the quality and quick delivery…"
                    onChange={e => setTf(f => ({ ...f, message: e.target.value }))} />
                </div>
              </div> 

              <button className="adm-primary-btn adm-modal-save" onClick={saveTest} disabled={testSaving}>
                {testSaving ? 'Saving…' : editTest ? '✅ Update Review' : '➕ Add Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}