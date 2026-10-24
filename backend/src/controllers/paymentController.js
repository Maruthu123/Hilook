const crypto = require('crypto');
const Razorpay = require('razorpay');
const { query, tx } = require('../config/db');
const { codEnabled, razorpayConfigured: configured, razorpayMode } = require('../utils/payConfig');

let rzp = null;
const client = () => {
  if (!configured()) return null;
  if (!rzp) rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  return rzp;
};

// GET /api/payment/config  → frontend uses this to show/hide "Pay Online"
exports.config = (req, res) => res.json({ success: true, onlineEnabled: configured(), mode: razorpayMode(), codEnabled: codEnabled(), key: configured() ? process.env.RAZORPAY_KEY_ID : null });

// POST /api/payment/create-order  { orderId }   (amount is read from the DB, never trusted from the browser)
exports.createRazorpayOrder = async (req, res) => {
  const r = client();
  if (!r) return res.status(503).json({ success: false, message: 'Online payment is not available right now. Please try again later.' });
  const { rows } = await query(`SELECT * FROM orders WHERE id::text=$1 AND user_id=$2`, [String(req.body.orderId), req.user.id]);
  const o = rows[0];
  if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
  if (o.payment_status === 'paid') return res.status(400).json({ success: false, message: 'Order already paid' });

  const rOrder = await r.orders.create({ amount: Math.round(Number(o.total_price) * 100), currency: 'INR', receipt: o.order_number });
  await query(`UPDATE payments SET razorpay_order_id=$2 WHERE order_id=$1 AND status='pending'`, [o.id, rOrder.id]);
  res.json({ success: true, order: rOrder, key: process.env.RAZORPAY_KEY_ID, orderNumber: o.order_number });
};

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  if (!configured()) return res.status(503).json({ success: false, message: 'Online payment is not enabled' });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (expected !== razorpay_signature) {
    await query(`UPDATE orders SET payment_status='failed' WHERE id::text=$1 AND user_id=$2 AND payment_status='pending'`, [String(orderId), req.user.id]);
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
  await tx(async (db) => {
    const { rows } = await db.query(`UPDATE orders SET payment_status='paid', order_status=CASE WHEN order_status='placed' THEN 'confirmed' ELSE order_status END, updated_at=NOW()
                                     WHERE id::text=$1 AND user_id=$2 RETURNING id`, [String(orderId), req.user.id]);
    if (!rows[0]) { const e = new Error('Order not found'); e.status = 404; throw e; }
    await db.query(`UPDATE payments SET status='paid', razorpay_payment_id=$2, razorpay_signature=$3, paid_at=NOW() WHERE order_id=$1 AND razorpay_order_id=$4`,
      [rows[0].id, razorpay_payment_id, razorpay_signature, razorpay_order_id]);
    await db.query(`INSERT INTO order_tracking (order_id,status,note) VALUES ($1,'confirmed','Payment received – order confirmed')`, [rows[0].id]);
  });
  res.json({ success: true, message: 'Payment successful' });
};
