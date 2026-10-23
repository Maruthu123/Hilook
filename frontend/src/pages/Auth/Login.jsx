import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

/* ───────────────────────────────────────────────────────────────────────────
   TWO LOGINS ON ONE PAGE
   • Customer Login  : email + password → OTP on email → /orders (order tracking)
                       (+ Register: details → OTP → /orders)
   • Admin Login     : admin email + password → /admin (dashboard)
─────────────────────────────────────────────────────────────────────────── */
export default function Login() {
  const { user, loginStart, verifyLoginOTP, register, verifyRegisterOTP, resendOTP, adminLogin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [role, setRole] = useState(params.get('mode') === 'admin' ? 'admin' : 'user');
  const [mode, setMode] = useState('login');             // login | register | otp-login | otp-register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const afterLogin = (u) => navigate(u.role === 'admin' ? '/admin' : (location.state?.from && location.state.from !== '/login' ? location.state.from : '/orders'), { replace: true });

  // already logged in → go where they belong
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) afterLogin(user); }, []);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const reset = (newMode) => { setMode(newMode); setErr(''); setOk(''); setOtp(''); };
  const switchRole = (r) => { setRole(r); reset('login'); setPassword(''); };
  const sentMsg = (r) => (r.devOtp ? `Email not set up yet – dev OTP: ${r.devOtp}` : `OTP sent to ${email}. Check your inbox (or spam).`);

  async function handleUserLogin(e) {
    e.preventDefault(); setErr('');
    const r = await loginStart(email.trim(), password);
    if (r.ok) { setMode('otp-login'); setOk(sentMsg(r)); setCountdown(60); }
    else if (r.requiresVerification) { setMode('otp-register'); setOk(sentMsg(r)); setCountdown(60); }
    else setErr(r.msg);
  }
  async function handleVerifyLogin(e) {
    e.preventDefault(); setErr('');
    if (otp.length !== 6) return setErr('Enter the 6-digit OTP.');
    const r = await verifyLoginOTP(email.trim(), otp);
    if (r.ok) afterLogin(r.user); else { setErr(r.msg); setOtp(''); }
  }
  async function handleRegister(e) {
    e.preventDefault(); setErr('');
    if (!name || !email || !password) return setErr('Name, email and password are required.');
    if (password.length < 6) return setErr('Password must be at least 6 characters.');
    if (phone && !/^\d{10}$/.test(phone)) return setErr('Phone must be 10 digits.');
    const r = await register(name, email.trim(), password, phone);
    if (r.ok) { setMode('otp-register'); setOk(sentMsg(r)); setCountdown(60); } else setErr(r.msg);
  }
  async function handleVerifyRegister(e) {
    e.preventDefault(); setErr('');
    if (otp.length !== 6) return setErr('Enter the 6-digit OTP.');
    const r = await verifyRegisterOTP(email.trim(), otp);
    if (r.ok) afterLogin(r.user); else { setErr(r.msg); setOtp(''); }
  }
  async function handleAdmin(e) {
    e.preventDefault(); setErr('');
    const r = await adminLogin(email.trim(), password);
    if (r.ok) afterLogin(r.user); else setErr(r.msg);
  }
  async function handleResend() {
    if (countdown > 0) return;
    setErr(''); setOk('');
    const r = await resendOTP(email.trim(), mode === 'otp-register' ? 'register' : 'login');
    if (r.ok) { setOk(sentMsg(r)); setCountdown(60); } else setErr(r.msg);
  }

  const otpInput = (e, i) => {
    const v = e.target.value.replace(/\D/g, '');
    const arr = otp.padEnd(6, ' ').split(''); arr[i] = v.slice(-1) || ' ';
    setOtp(arr.join('').replace(/ /g, '').slice(0, 6));
    if (v && i < 5) document.getElementById(`o${i + 1}`)?.focus();
  };
  const otpKey = (e, i) => { if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`o${i - 1}`)?.focus(); };
  const otpPaste = (e) => { const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (t) { e.preventDefault(); setOtp(t); } };

  const isOtp = mode === 'otp-login' || mode === 'otp-register';
  const Pass = (
    <div className="field">
      <label>Password</label>
      <div className="pass-wrap">
        <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
        <button type="button" className="pass-toggle" onClick={() => setShowPass((p) => !p)} aria-label="Show password">
          <i className={`fa-regular ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
        </button>
      </div>
    </div>
  );
  const Submit = (label) => <button type="submit" className="login-submit" disabled={loading}>{loading ? <span className="spin" /> : label}</button>;

  const OtpForm = (onSubmit, label) => (
    <motion.form key="otp" onSubmit={onSubmit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="otp-header">
        <div className="otp-email-badge"><i className="fa-regular fa-envelope" /> {email}</div>
        <p className="otp-hint">Enter the 6-digit code we emailed you</p>
      </div>
      <div className="otp-boxes" onPaste={otpPaste}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input key={i} id={`o${i}`} type="text" inputMode="numeric" maxLength={1} className="otp-box" value={otp[i] || ''}
            autoFocus={i === 0} onChange={(e) => otpInput(e, i)} onKeyDown={(e) => otpKey(e, i)} />
        ))}
      </div>
      {Submit(label)}
      <div className="otp-resend-row">
        {countdown > 0 ? <span className="otp-countdown">Resend in {countdown}s</span>
          : <button type="button" className="link-btn" onClick={handleResend}>Resend OTP</button>}
        <button type="button" className="link-btn" onClick={() => reset(mode === 'otp-register' ? 'register' : 'login')}>← Back</button>
      </div>
    </motion.form>
  );

  return (
    <div className="login-pg">
      <div className="lg-blob lg-blob-1" /><div className="lg-blob lg-blob-2" /><div className="lg-blob lg-blob-3" />

      <motion.div className="login-card" initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
        <div className="login-brand">
          <motion.div className="login-logo-mark" animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 6, repeat: Infinity }}>
            <i className="fa-solid fa-gem" />
          </motion.div>
          <div className="login-logo-text">Nisha Boutique</div>
          <p className="login-tagline">{role === 'admin' ? 'Store management – authorised access only' : 'Welcome back, beautiful'}</p>
        </div>

        {/* USER / ADMIN switch */}
        <div className="role-switch" role="tablist">
          <span className={`role-pill ${role === 'admin' ? 'right' : ''}`} />
          <button type="button" role="tab" className={role === 'user' ? 'on' : ''} onClick={() => switchRole('user')}><i className="fa-regular fa-user" /> User Login</button>
          <button type="button" role="tab" className={role === 'admin' ? 'on' : ''} onClick={() => switchRole('admin')}><i className="fa-solid fa-user-shield" /> Admin Login</button>
        </div>

        {role === 'user' && !isOtp && (
          <div className="login-tabs">
            <button className={`login-tab ${mode === 'login' ? 'on' : ''}`} onClick={() => reset('login')}>Login</button>
            <button className={`login-tab ${mode === 'register' ? 'on' : ''}`} onClick={() => reset('register')}>Create Account</button>
          </div>
        )}

        <AnimatePresence>{err && <motion.div className="login-err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{err}</motion.div>}</AnimatePresence>
        <AnimatePresence>{ok && <motion.div className="login-ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{ok}</motion.div>}</AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ADMIN */}
          {role === 'admin' && (
            <motion.form key="admin" onSubmit={handleAdmin} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="field"><label>Admin Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin email" required autoFocus /></div>
              {Pass}
              {Submit('Open Dashboard')}
              <p className="login-switch">Only the store owner can open the dashboard.</p>
            </motion.form>
          )}

          {/* USER: login */}
          {role === 'user' && mode === 'login' && (
            <motion.form key="login" onSubmit={handleUserLogin} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="field"><label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus /></div>
              {Pass}
              {Submit('Login & Get OTP')}
              <p className="login-switch">New here? <button type="button" className="link-btn" onClick={() => reset('register')}>Create account</button></p>
            </motion.form>
          )}

          {/* USER: register */}
          {role === 'user' && mode === 'register' && (
            <motion.form key="register" onSubmit={handleRegister} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="field"><label>Full Name *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required autoFocus /></div>
              <div className="field"><label>Email *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
              <div className="field"><label>Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile number" maxLength={10} /></div>
              {Pass}
              {Submit('Register & Send OTP')}
              <p className="login-switch">Already registered? <button type="button" className="link-btn" onClick={() => reset('login')}>Login</button></p>
            </motion.form>
          )}

          {role === 'user' && mode === 'otp-login' && OtpForm(handleVerifyLogin, 'Verify & Login')}
          {role === 'user' && mode === 'otp-register' && OtpForm(handleVerifyRegister, 'Verify & Continue')}
        </AnimatePresence>

        <p className="login-legal">By continuing you agree to our <Link to="/about">Terms</Link> &amp; <Link to="/about">Privacy Policy</Link></p>
      </motion.div>
    </div>
  );
}
