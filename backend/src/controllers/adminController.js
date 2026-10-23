const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { num } = require('../utils/helpers');
const O = require('./orderController');

// GET /admin/dashboard
exports.getDashboard = async (req, res) => {
  const [u, p, o, rev, byStatus, recent, cod] = await Promise.all([
    query(`SELECT COUNT(*)::int n FROM users WHERE role='user'`),
    query(`SELECT COUNT(*)::int n FROM products`),
    query(`SELECT COUNT(*)::int n FROM orders`),
    query(`SELECT COALESCE(SUM(total_price),0) t FROM orders WHERE payment_status='paid'`),
    query(`SELECT order_status AS "_id", COUNT(*)::int AS count FROM orders GROUP BY order_status`),
    query(`${O.ORDER_SELECT} ORDER BY o.created_at DESC LIMIT 10`),
    query(`SELECT payment_method AS "_id", COUNT(*)::int AS count FROM orders GROUP BY payment_method`),
  ]);
  res.json({
    success: true,
    stats: { totalUsers: u.rows[0].n, totalProducts: p.rows[0].n, totalOrders: o.rows[0].n, totalRevenue: num(rev.rows[0].t) },
    ordersByStatus: byStatus.rows, paymentSplit: cod.rows, recentOrders: recent.rows.map(O.shape),
  });
};

// GET /admin/users  → customer list with login + order info
exports.getUsers = async (req, res) => {
  const { search } = req.query;
  const args = []; let w = `WHERE u.role='user'`;
  if (search) { args.push(`%${search}%`); w += ` AND (u.name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)`; }
  const { rows } = await query(
    `SELECT u.*, (SELECT COUNT(*)::int FROM orders o WHERE o.user_id=u.id) AS order_count,
            (SELECT COALESCE(SUM(total_price),0) FROM orders o WHERE o.user_id=u.id AND o.order_status<>'cancelled') AS total_spent
     FROM users u ${w} ORDER BY u.created_at DESC`, args);
  res.json({
    success: true, total: rows.length,
    users: rows.map((u) => ({
      _id: u.id, name: u.name, email: u.email, phone: u.phone, isVerified: u.is_verified, isBlocked: u.is_blocked,
      loginCount: u.login_count, lastLoginAt: u.last_login_at, orderCount: u.order_count, totalSpent: num(u.total_spent), createdAt: u.created_at,
    })),
  });
};

// GET /admin/login-history
exports.getLoginHistory = async (req, res) => {
  const { rows } = await query(`SELECT id,email,login_type,success,reason,ip_address,created_at FROM login_history ORDER BY created_at DESC LIMIT 200`);
  res.json({ success: true, history: rows });
};

exports.toggleBlockUser = async (req, res) => {
  const { rows } = await query(`UPDATE users SET is_blocked = NOT is_blocked WHERE id=$1 AND role='user' RETURNING is_blocked`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: rows[0].is_blocked ? 'User blocked' : 'User unblocked' });
};

exports.deleteUser = async (req, res) => {
  await query(`DELETE FROM users WHERE id=$1 AND role='user'`, [req.params.id]);
  res.json({ success: true, message: 'User deleted' });
};

// GET /admin/orders
exports.getAdminOrders = async (req, res) => {
  const { rows } = await query(`${O.ORDER_SELECT} ORDER BY o.created_at DESC`);
  res.json({ success: true, orders: rows.map(O.shape) });
};

// PUT /admin/orders/:id/status
exports.updateAdminOrderStatus = async (req, res) => {
  const { status, note, trackingNumber, courier } = req.body;
  if (!O.STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  await O.applyStatus(req.params.id, status, note, req.user.id, { trackingNumber, courier });
  const o = await O.getOrderRow('o.id::text=$1', [req.params.id]);
  res.json({ success: true, order: O.shape(o) });
};

exports.deleteAdminOrder = async (req, res) => {
  await query('DELETE FROM orders WHERE id::text=$1', [req.params.id]);
  res.json({ success: true, message: 'Order deleted' });
};

// PUT /admin/change-credentials
exports.changeAdminCredentials = async (req, res) => {
  const { currentPassword, newPassword, newEmail } = req.body;
  if (!(await bcrypt.compare(currentPassword || '', req.user.password_hash)))
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  let email = req.user.email; let hash = req.user.password_hash;
  if (newEmail) {
    const e = newEmail.trim().toLowerCase();
    const { rows } = await query('SELECT id FROM users WHERE email=$1 AND id<>$2', [e, req.user.id]);
    if (rows[0]) return res.status(400).json({ success: false, message: 'Email already in use' });
    email = e;
  }
  if (newPassword) {
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    hash = await bcrypt.hash(newPassword, 12);
  }
  await query('UPDATE users SET email=$2, password_hash=$3, updated_at=NOW() WHERE id=$1', [req.user.id, email, hash]);
  res.json({ success: true, message: 'Credentials updated successfully', email });
};

// Coupons
exports.getCoupons = async (req, res) => res.json({ success: true, coupons: (await query('SELECT * FROM coupons ORDER BY created_at DESC')).rows });
exports.createCoupon = async (req, res) => {
  const b = req.body;
  const { rows } = await query(
    `INSERT INTO coupons (code,description,discount_type,discount_value,min_order_amount,max_discount,usage_limit,end_date)
     VALUES (UPPER($1),$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [b.code, b.description || null, b.discountType, b.discountValue, b.minOrderAmount || 0, b.maxDiscount || null, b.usageLimit || null, b.endDate || null]);
  res.status(201).json({ success: true, coupon: rows[0] });
};
exports.deleteCoupon = async (req, res) => { await query('DELETE FROM coupons WHERE id=$1', [req.params.id]); res.json({ success: true }); };
