const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const JWT_SECRET = () => process.env.JWT_SECRET || 'nisha_secret_key';

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, JWT_SECRET(), { expiresIn: process.env.JWT_EXPIRE || '30d' });

/** Attaches req.user (fresh from DB) or returns 401. */
exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.split(' ')[1] : null;
    if (!token) return res.status(401).json({ success: false, message: 'Please login first' });

    const decoded = jwt.verify(token, JWT_SECRET());
    const { rows } = await query('SELECT * FROM users WHERE id=$1', [decoded.id]);
    const u = rows[0];
    if (!u) return res.status(401).json({ success: false, message: 'User not found' });
    if (u.is_blocked) return res.status(403).json({ success: false, message: 'Your account is blocked' });
    req.user = { ...u, _id: u.id };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Session expired, please login again' });
  }
};

/** Role is read from the DATABASE, not from the token → a normal user can never reach admin APIs. */
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ success: false, message: 'Admin access only' });
};

exports.signToken = signToken;
