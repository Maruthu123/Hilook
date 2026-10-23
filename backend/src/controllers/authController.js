const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { signToken } = require('../middleware/auth');
const { sendOtpMail } = require('../utils/mailer');
const { sha, genOtp, clientIp } = require('../utils/helpers');

const IS_DEV = () => process.env.NODE_ENV !== 'production';
const publicUser = (u) => ({
  _id: u.id, id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, avatar: u.avatar,
  isVerified: u.is_verified, createdAt: u.created_at,
});

async function logLogin(req, { userId = null, email, type, success, reason }) {
  try {
    await query(
      `INSERT INTO login_history (user_id,email,login_type,success,reason,ip_address,user_agent) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, email, type, success, reason || null, clientIp(req), (req.headers['user-agent'] || '').slice(0, 250)]);
  } catch (e) { console.error('login log failed', e.message); }
}

async function markLoggedIn(userId) {
  await query('UPDATE users SET login_count=login_count+1, last_login_at=NOW() WHERE id=$1', [userId]);
}

/** Create + mail a fresh OTP (old unused ones are invalidated). */
async function issueOtp(email, purpose) {
  const { rows: last } = await query(
    `SELECT created_at FROM otp_codes WHERE email=$1 AND purpose=$2 ORDER BY created_at DESC LIMIT 1`, [email, purpose]);
  if (last[0] && Date.now() - new Date(last[0].created_at).getTime() < 30 * 1000) {
    const err = new Error('Please wait 30 seconds before requesting another OTP'); err.status = 429; throw err;
  }
  const otp = genOtp();
  await query(`UPDATE otp_codes SET used_at=NOW() WHERE email=$1 AND purpose=$2 AND used_at IS NULL`, [email, purpose]);
  await query(
    `INSERT INTO otp_codes (email,purpose,code_hash,expires_at) VALUES ($1,$2,$3,NOW() + INTERVAL '10 minutes')`,
    [email, purpose, sha(otp + email)]);
  let mailed = false;
  try { mailed = await sendOtpMail(email, otp, purpose); } catch (e) { console.error('Mail error:', e.message); }
  return { otp, mailed };
}

/** Returns null if OK, otherwise an error string. */
async function checkOtp(email, purpose, code) {
  const { rows } = await query(
    `SELECT * FROM otp_codes WHERE email=$1 AND purpose=$2 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`, [email, purpose]);
  const rec = rows[0];
  if (!rec) return 'OTP not found. Please request a new one.';
  if (new Date(rec.expires_at) < new Date()) return 'OTP expired. Please request a new one.';
  if (rec.attempts >= 5) return 'Too many wrong attempts. Please request a new OTP.';
  if (rec.code_hash !== sha(String(code) + email)) {
    await query('UPDATE otp_codes SET attempts=attempts+1 WHERE id=$1', [rec.id]);
    return 'Invalid OTP';
  }
  await query('UPDATE otp_codes SET used_at=NOW() WHERE id=$1', [rec.id]);
  return null;
}

const otpResponse = ({ otp, mailed }, extra = {}) => ({
  success: true,
  message: mailed ? 'OTP sent to your email' : 'OTP generated (email not configured – check the server console)',
  ...(IS_DEV() && !mailed ? { devOtp: otp } : {}),
  ...extra,
});

// POST /api/auth/register
exports.register = async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const phone = (req.body.phone || '').trim() || null;
  const password = req.body.password || '';
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email' });
  if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  if (phone && !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: 'Phone must be 10 digits' });

  const { rows } = await query('SELECT id,is_verified,role FROM users WHERE email=$1', [email]);
  const hash = await bcrypt.hash(password, 12);
  if (rows[0]) {
    if (rows[0].is_verified) return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    await query('UPDATE users SET name=$2, phone=$3, password_hash=$4, updated_at=NOW() WHERE id=$1', [rows[0].id, name, phone, hash]);
  } else {
    try {
      await query('INSERT INTO users (name,email,phone,password_hash) VALUES ($1,$2,$3,$4)', [name, email, phone, hash]);
    } catch (e) {
      if (e.code === '23505') return res.status(400).json({ success: false, message: 'Phone number already used' });
      throw e;
    }
  }
  const o = await issueOtp(email, 'register');
  res.status(201).json(otpResponse(o, { email }));
};

// POST /api/auth/verify-register
exports.verifyRegister = async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const bad = await checkOtp(email, 'register', req.body.otp);
  if (bad) { await logLogin(req, { email, type: 'register', success: false, reason: bad }); return res.status(400).json({ success: false, message: bad }); }
  const { rows } = await query('UPDATE users SET is_verified=TRUE, updated_at=NOW() WHERE email=$1 RETURNING *', [email]);
  const u = rows[0];
  await markLoggedIn(u.id);
  await logLogin(req, { userId: u.id, email, type: 'register', success: true, reason: 'registered + otp verified' });
  res.json({ success: true, token: signToken(u), user: publicUser(u) });
};

// POST /api/auth/login   (step 1 for customers: password → then OTP)
exports.login = async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const { password } = req.body;
  const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password || '', u.password_hash))) {
    await logLogin(req, { userId: u?.id, email, type: 'user', success: false, reason: 'wrong email/password' });
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (u.role === 'admin') {
    return res.status(403).json({ success: false, message: 'This is an admin account. Please use the "Admin Login" tab.' });
  }
  if (u.is_blocked) return res.status(403).json({ success: false, message: 'Your account is blocked' });
  if (!u.is_verified) {
    const o = await issueOtp(email, 'register').catch(() => null);
    return res.status(403).json({ success: false, requiresVerification: true, email, message: 'Please verify your email first', ...(o ? { devOtp: IS_DEV() && !o.mailed ? o.otp : undefined } : {}) });
  }
  const o = await issueOtp(email, 'login');
  res.json(otpResponse(o, { otpRequired: true, email }));
};

// POST /api/auth/verify-otp   (step 2 for customers)
exports.verifyOtp = async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const bad = await checkOtp(email, 'login', req.body.otp);
  const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
  const u = rows[0];
  if (bad || !u || u.role === 'admin') {
    await logLogin(req, { userId: u?.id, email, type: 'user', success: false, reason: bad || 'not allowed' });
    return res.status(400).json({ success: false, message: bad || 'Invalid request' });
  }
  await markLoggedIn(u.id);
  await logLogin(req, { userId: u.id, email, type: 'user', success: true, reason: 'otp verified' });
  res.json({ success: true, token: signToken(u), user: publicUser(u) });
};

// POST /api/auth/resend-otp  { email, purpose }
exports.resendOtp = async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const purpose = req.body.purpose === 'register' ? 'register' : 'login';
  const { rows } = await query('SELECT id FROM users WHERE email=$1', [email]);
  if (!rows[0]) return res.status(404).json({ success: false, message: 'No account found with this email' });
  const o = await issueOtp(email, purpose);
  res.json(otpResponse(o));
};

// POST /api/auth/admin-login  → straight to dashboard, only role=admin accepted
exports.adminLogin = async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
  const u = rows[0];
  if (!u || u.role !== 'admin' || !(await bcrypt.compare(req.body.password || '', u.password_hash))) {
    await logLogin(req, { userId: u?.id, email, type: 'admin', success: false, reason: 'invalid admin credentials' });
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
  await markLoggedIn(u.id);
  await logLogin(req, { userId: u.id, email, type: 'admin', success: true, reason: 'admin login' });
  res.json({ success: true, token: signToken(u), user: publicUser(u) });
};

exports.getMe = async (req, res) => res.json({ success: true, user: publicUser(req.user) });

exports.updateMe = async (req, res) => {
  const { name, phone } = req.body;
  const { rows } = await query(
    `UPDATE users SET name=COALESCE(NULLIF($2,''),name), phone=NULLIF($3,''), updated_at=NOW() WHERE id=$1 RETURNING *`,
    [req.user.id, name, phone]);
  res.json({ success: true, user: publicUser(rows[0]) });
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  if (!(await bcrypt.compare(oldPassword || '', req.user.password_hash))) return res.status(400).json({ success: false, message: 'Current password incorrect' });
  await query('UPDATE users SET password_hash=$2, updated_at=NOW() WHERE id=$1', [req.user.id, await bcrypt.hash(newPassword, 12)]);
  res.json({ success: true, message: 'Password changed successfully' });
};
