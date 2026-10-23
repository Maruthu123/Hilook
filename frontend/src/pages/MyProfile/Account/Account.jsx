import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../../context/AuthContext';
import API from '../../../api';
import './Account.css';

const ButterflyDecor = ({ className = '', size = 48, opacity = 0.18 }) => (
  <svg
    className={`bf-decor ${className}`}
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <ellipse cx="18" cy="22" rx="16" ry="11" fill="#7c3aed" transform="rotate(-20 18 22)" />
    <ellipse cx="46" cy="22" rx="16" ry="11" fill="#7c3aed" transform="rotate(20 46 22)" />
    <ellipse cx="16" cy="40" rx="13" ry="9" fill="#a855f7" transform="rotate(15 16 40)" />
    <ellipse cx="48" cy="40" rx="13" ry="9" fill="#a855f7" transform="rotate(-15 48 40)" />
    <ellipse cx="32" cy="32" rx="3.5" ry="14" fill="#4c1d95" />
    <circle cx="32" cy="18" r="2.5" fill="#4c1d95" />
  </svg>
);

export default function Account() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!user) return (
    <div className="account-pg">
      <div className="container" style={{ padding: '140px 0', textAlign: 'center' }}>
        <ButterflyDecor size={64} opacity={0.3} />
        <h2 style={{ marginTop: 16, color: '#2d1b69' }}>Please login to view your account</h2>
        <button className="btn-violet" onClick={() => navigate('/login')} style={{ marginTop: 20 }}>
          Login
        </button>
      </div>
    </div>
  );

  async function saveProfile(e) {
    e.preventDefault(); setSaving(true); setMsg(''); setErr('');
    try {
      const { data } = await API.put('/api/auth/me', { name: form.name, phone: form.phone });
      updateUser(data); setMsg('Profile updated!');
    } catch (ex) { setErr(ex.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  }

  async function changePassword(e) {
    e.preventDefault(); setMsg(''); setErr('');
    if (pwForm.newPassword !== pwForm.confirm) return setErr('Passwords do not match');
    if (pwForm.newPassword.length < 6) return setErr('Password must be at least 6 characters');
    setSaving(true);
    try {
      await API.put('/api/auth/change-password', { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      setMsg('Password changed!');
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (ex) { setErr(ex.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  }

  const navItems = [
    { key: 'profile', icon: '👤', label: 'My Profile' },
    { key: 'password', icon: '🔒', label: 'Change Password' },
    { key: 'orders', icon: '📦', label: 'My Orders' },
  ];

  const initials = (user.name || user.email || 'U')[0].toUpperCase();

  return (
    <div className="account-pg">
      {/* Background butterfly decorations */}
      <ButterflyDecor className="bf-topleft" size={90} opacity={0.07} />
      <ButterflyDecor className="bf-topright" size={70} opacity={0.1} />
      <ButterflyDecor className="bf-bottomleft" size={60} opacity={0.06} />
      <ButterflyDecor className="bf-bottomright" size={80} opacity={0.08} />

      <div className="container">
        <motion.div
          className="account-layout"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {/* ── Sidebar ── */}
          <aside className="account-sidebar">
            <div className="sidebar-top">
              <div className="acct-avatar-wrap">
                <div className="acct-avatar">{initials}</div>
                <ButterflyDecor size={28} opacity={0.55} className="avatar-bf" />
              </div>
              <h3 className="acct-name">{user.name || 'User'}</h3>
              <p className="acct-email">{user.email}</p>
              {user.phone && <p className="acct-phone">📱 {user.phone}</p>}
            </div>

            <div className="sidebar-divider" />

            <nav className="acct-nav">
              {navItems.map(({ key, icon, label }) => (
                <button
                  key={key}
                  className={`acct-nav-btn ${tab === key ? 'active' : ''}`}
                  onClick={() => {
                    if (key === 'orders') navigate('/orders');
                    else { setTab(key); setMsg(''); setErr(''); }
                  }}
                >
                  <span className="nav-icon">{icon}</span>
                  <span>{label}</span>
                  {tab === key && <span className="nav-active-dot" />}
                </button>
              ))}
              <button
                className="acct-nav-btn logout-btn"
                onClick={() => { logout(); navigate('/'); }}
              >
                <span className="nav-icon">🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* ── Main Content ── */}
          <main className="account-main">
            <AnimatePresence mode="wait">
              {msg && (
                <motion.div
                  key="msg"
                  className="acct-toast success"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  ✅ {msg}
                </motion.div>
              )}
              {err && (
                <motion.div
                  key="err"
                  className="acct-toast error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  ❌ {err}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {tab === 'profile' && (
                <motion.div
                  key="profile"
                  className="acct-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="card-header">
                    <ButterflyDecor size={36} opacity={0.25} />
                    <div>
                      <h2>My Profile</h2>
                      <p className="card-subtitle">Manage your personal information</p>
                    </div>
                  </div>

                  <form onSubmit={saveProfile} className="acct-form">
                    <div className="form-row two-col">
                      <div className="field-group">
                        <label>Full Name</label>
                        <input
                          value={form.name}
                          onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setMsg(''); }}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="field-group">
                        <label>Phone Number</label>
                        <input
                          value={form.phone}
                          onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setMsg(''); }}
                          placeholder="10-digit mobile"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div className="field-group">
                      <label>Email Address <span className="field-badge">Cannot be changed</span></label>
                      <input value={user.email} disabled className="input-disabled" />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-violet" disabled={saving}>
                        {saving ? (
                          <><span className="spin" /> Saving…</>
                        ) : '💾 Save Changes'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {tab === 'password' && (
                <motion.div
                  key="password"
                  className="acct-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="card-header">
                    <ButterflyDecor size={36} opacity={0.25} />
                    <div>
                      <h2>Change Password</h2>
                      <p className="card-subtitle">Keep your account secure</p>
                    </div>
                  </div>

                  <form onSubmit={changePassword} className="acct-form">
                    <div className="field-group">
                      <label>Current Password</label>
                      <div className="input-eye-wrap">
                        <input
                          type={showOld ? 'text' : 'password'}
                          value={pwForm.oldPassword}
                          onChange={e => setPwForm(f => ({ ...f, oldPassword: e.target.value }))}
                          placeholder="Enter current password"
                        />
                        <button type="button" className="eye-btn" onClick={() => setShowOld(v => !v)}>
                          {showOld ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div className="form-row two-col">
                      <div className="field-group">
                        <label>New Password</label>
                        <div className="input-eye-wrap">
                          <input
                            type={showNew ? 'text' : 'password'}
                            value={pwForm.newPassword}
                            onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                            placeholder="Min 6 characters"
                          />
                          <button type="button" className="eye-btn" onClick={() => setShowNew(v => !v)}>
                            {showNew ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </div>
                      <div className="field-group">
                        <label>Confirm New Password</label>
                        <div className="input-eye-wrap">
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            value={pwForm.confirm}
                            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                            placeholder="Repeat new password"
                          />
                          <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)}>
                            {showConfirm ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {pwForm.newPassword && (
                      <div className="pw-strength">
                        <div className={`pw-bar ${pwForm.newPassword.length >= 8 ? 'strong' : pwForm.newPassword.length >= 6 ? 'medium' : 'weak'}`} />
                        <span className="pw-label">
                          {pwForm.newPassword.length >= 8 ? 'Strong' : pwForm.newPassword.length >= 6 ? 'Good' : 'Too short'}
                        </span>
                      </div>
                    )}

                    <div className="form-actions">
                      <button type="submit" className="btn-violet" disabled={saving}>
                        {saving ? (
                          <><span className="spin" /> Updating…</>
                        ) : '🔒 Update Password'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </motion.div>
      </div>
    </div>
  );
}