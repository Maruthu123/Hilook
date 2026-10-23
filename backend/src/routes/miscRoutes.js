// Small public/user routes: testimonials, categories, banners, coupons, wishlist, addresses, contact, upload
const router = require('express').Router();
const { query } = require('../config/db');
const { protect, admin } = require('../middleware/auth');
const { ah, num } = require('../utils/helpers');
const { shape: shapeProduct } = require('../controllers/productController');

/* ── Testimonials (Happy Customers) ── */
const T = (t) => ({ _id: t.id, name: t.name, photo: t.photo, location: t.location, rating: t.rating, message: t.message, isActive: t.is_active, createdAt: t.created_at });
const testimonials = require('express').Router();
testimonials.get('/', ah(async (req, res) => {
  const all = req.query.admin === 'true';
  const { rows } = await query(`SELECT * FROM testimonials ${all ? '' : 'WHERE is_active'} ORDER BY created_at DESC`);
  res.json({ success: true, testimonials: rows.map(T) });
}));
testimonials.post('/', protect, admin, ah(async (req, res) => {
  const b = req.body;
  const { rows } = await query(`INSERT INTO testimonials (name,photo,location,rating,message) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [b.name, b.photo || null, b.location || null, num(b.rating, 5), b.message]);
  res.status(201).json({ success: true, testimonial: T(rows[0]) });
}));
testimonials.put('/:id', protect, admin, ah(async (req, res) => {
  const b = req.body;
  const { rows } = await query(`UPDATE testimonials SET name=$2, photo=$3, location=$4, rating=$5, message=$6 WHERE id=$1 RETURNING *`,
    [req.params.id, b.name, b.photo || null, b.location || null, num(b.rating, 5), b.message]);
  res.json({ success: true, testimonial: T(rows[0]) });
}));
testimonials.delete('/:id', protect, admin, ah(async (req, res) => { await query('DELETE FROM testimonials WHERE id=$1', [req.params.id]); res.json({ success: true }); }));

/* ── Categories / Banners ── */
const categories = require('express').Router();
categories.get('/', ah(async (req, res) => res.json({ success: true, categories: (await query('SELECT * FROM categories WHERE is_active ORDER BY sort_order')).rows })));
const banners = require('express').Router();
banners.get('/', ah(async (req, res) => res.json({ success: true, banners: (await query('SELECT * FROM banners WHERE is_active ORDER BY sort_order')).rows })));

/* ── Coupons ── */
const coupons = require('express').Router();
coupons.post('/validate', protect, ah(async (req, res) => {
  const code = String(req.body.code || '').toUpperCase();
  const amount = num(req.body.orderAmount ?? req.body.total);
  const { rows } = await query(`SELECT * FROM coupons WHERE code=$1 AND is_active AND (end_date IS NULL OR end_date>NOW()) AND (usage_limit IS NULL OR used_count<usage_limit)`, [code]);
  const c = rows[0];
  if (!c) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
  if (amount < num(c.min_order_amount)) return res.status(400).json({ success: false, message: `Minimum order ₹${num(c.min_order_amount)} required` });
  let d = c.discount_type === 'percentage' ? (amount * num(c.discount_value)) / 100 : num(c.discount_value);
  if (c.max_discount) d = Math.min(d, num(c.max_discount));
  d = Math.round(d);
  res.json({ success: true, discount: d, code: c.code, message: `Coupon ${c.code} applied` });
}));

/* ── Wishlist (logged-in users) ── */
const wishlist = require('express').Router();
wishlist.get('/', protect, ah(async (req, res) => {
  const { rows } = await query(`SELECT p.* FROM wishlist w JOIN products p ON p.id=w.product_id WHERE w.user_id=$1 ORDER BY w.created_at DESC`, [req.user.id]);
  res.json({ success: true, wishlist: rows.map(shapeProduct) });
}));
wishlist.post('/:productId', protect, ah(async (req, res) => {
  const { rows: p } = await query('SELECT id FROM products WHERE id::text=$1 OR product_id=$1', [req.params.productId]);
  if (!p[0]) return res.status(404).json({ success: false, message: 'Product not found' });
  const del = await query('DELETE FROM wishlist WHERE user_id=$1 AND product_id=$2', [req.user.id, p[0].id]);
  if (!del.rowCount) await query('INSERT INTO wishlist (user_id,product_id) VALUES ($1,$2)', [req.user.id, p[0].id]);
  res.json({ success: true, added: !del.rowCount });
}));

/* ── Addresses ── */
const A = (a) => ({ _id: a.id, fullName: a.full_name, phone: a.phone, addressLine1: a.address_line1, addressLine2: a.address_line2, city: a.city, state: a.state, pincode: a.pincode, isDefault: a.is_default });
const users = require('express').Router();
users.get('/addresses', protect, ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM addresses WHERE user_id=$1 ORDER BY is_default DESC, created_at DESC', [req.user.id]);
  res.json({ success: true, addresses: rows.map(A) });
}));
users.post('/addresses', protect, ah(async (req, res) => {
  const b = req.body;
  if (b.isDefault) await query('UPDATE addresses SET is_default=FALSE WHERE user_id=$1', [req.user.id]);
  const { rows } = await query(`INSERT INTO addresses (user_id,full_name,phone,address_line1,address_line2,city,state,pincode,is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [req.user.id, b.fullName, b.phone, b.addressLine1, b.addressLine2 || null, b.city, b.state, b.pincode, !!b.isDefault]);
  res.status(201).json({ success: true, address: A(rows[0]) });
}));
users.delete('/addresses/:id', protect, ah(async (req, res) => { await query('DELETE FROM addresses WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]); res.json({ success: true }); }));

/* ── Contact form ── */
const contact = require('express').Router();
contact.post('/', ah(async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !message) return res.status(400).json({ success: false, message: 'Name and message are required' });
  await query('INSERT INTO contact_messages (name,email,phone,message) VALUES ($1,$2,$3,$4)', [name, email || null, phone || null, message]);
  res.status(201).json({ success: true, message: 'Thanks! We will contact you soon.' });
}));
contact.get('/', protect, admin, ah(async (req, res) => res.json({ success: true, messages: (await query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200')).rows })));

module.exports = { testimonials, categories, banners, coupons, wishlist, users, contact };
