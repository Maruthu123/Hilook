const { query, tx } = require('../config/db');
const { num } = require('../utils/helpers');

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const FREE_SHIP_ABOVE = 1499;
const SHIPPING_FEE = 99;
const STATUS_NOTE = {
  placed: 'Order placed successfully', confirmed: 'Order confirmed by the boutique', packed: 'Your order is packed',
  shipped: 'Order shipped', out_for_delivery: 'Out for delivery', delivered: 'Order delivered', cancelled: 'Order cancelled',
};

/** One query that returns orders with customer, items and tracking timeline. */
const ORDER_SELECT = `
  SELECT o.*,
    json_build_object('_id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) AS "user",
    COALESCE((SELECT json_agg(json_build_object('productId', oi.product_code, 'name', oi.name, 'image', oi.image,
        'price', oi.price, 'quantity', oi.quantity, 'size', oi.size, 'color', oi.color) ORDER BY oi.id)
      FROM order_items oi WHERE oi.order_id = o.id), '[]') AS items,
    COALESCE((SELECT json_agg(json_build_object('status', t.status, 'note', t.note, 'createdAt', t.created_at) ORDER BY t.created_at, t.id)
      FROM order_tracking t WHERE t.order_id = o.id), '[]') AS tracking
  FROM orders o JOIN users u ON u.id = o.user_id`;

function shape(o) {
  return {
    _id: o.id, id: o.id, orderNumber: o.order_number, user: o.user, items: o.items, tracking: o.tracking,
    shippingAddress: { fullName: o.ship_name, phone: o.ship_phone, addressLine1: o.ship_line1, addressLine2: o.ship_line2, city: o.ship_city, state: o.ship_state, pincode: o.ship_pincode },
    paymentMethod: o.payment_method, paymentStatus: o.payment_status, orderStatus: o.order_status, status: o.order_status,
    itemsPrice: num(o.items_price), shippingPrice: num(o.shipping_price), discountAmount: num(o.discount_amount), totalPrice: num(o.total_price),
    couponCode: o.coupon_code, trackingNumber: o.tracking_number, courier: o.courier, deliveredAt: o.delivered_at,
    createdAt: o.created_at, updatedAt: o.updated_at,
  };
}
const getOrderRow = async (where, args) => (await query(`${ORDER_SELECT} WHERE ${where}`, args)).rows[0];

// POST /api/orders
exports.createOrder = async (req, res) => {
  const { items, shippingAddress: a = {}, couponCode } = req.body;
  const method = req.body.paymentMethod === 'razorpay' ? 'razorpay' : 'cod';
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ success: false, message: 'Your cart is empty' });
  if (!a.fullName || !/^\d{10}$/.test(a.phone || '') || !a.addressLine1)
    return res.status(400).json({ success: false, message: 'Name, 10-digit phone and address are required' });

  const order = await tx(async (db) => {
    let itemsPrice = 0; const lines = [];
    for (const it of items) {
      const code = String(it.product || it.id || '');
      const { rows } = await db.query('SELECT * FROM products WHERE product_id=$1 OR id::text=$1 FOR UPDATE', [code]);
      const p = rows[0];
      if (!p) { const e = new Error(`Product not found: ${code}`); e.status = 404; throw e; }
      if (!p.is_available) { const e = new Error(`${p.name} is currently unavailable`); e.status = 400; throw e; }
      const qty = Math.max(1, parseInt(it.quantity || it.qty || 1, 10));
      if (p.stock < qty) { const e = new Error(`Only ${p.stock} left for ${p.name}`); e.status = 400; throw e; }
      const price = num(p.min_price);
      itemsPrice += price * qty;
      lines.push({ p, qty, price, size: it.size || null, color: it.color || null });
    }

    let discount = 0; let appliedCoupon = null;
    if (couponCode) {
      const { rows } = await db.query(
        `SELECT * FROM coupons WHERE code=$1 AND is_active AND (end_date IS NULL OR end_date > NOW()) AND (usage_limit IS NULL OR used_count < usage_limit)`,
        [String(couponCode).toUpperCase()]);
      const c = rows[0];
      if (c && itemsPrice >= num(c.min_order_amount)) {
        discount = c.discount_type === 'percentage' ? (itemsPrice * num(c.discount_value)) / 100 : num(c.discount_value);
        if (c.max_discount) discount = Math.min(discount, num(c.max_discount));
        discount = Math.min(Math.round(discount), itemsPrice);
        appliedCoupon = c.code;
        await db.query('UPDATE coupons SET used_count=used_count+1 WHERE id=$1', [c.id]);
      }
    }
    const shipping = itemsPrice >= FREE_SHIP_ABOVE ? 0 : SHIPPING_FEE;
    const total = itemsPrice + shipping - discount;
    const orderNumber = 'NB' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + Math.floor(1000 + Math.random() * 9000);

    const { rows: o } = await db.query(
      `INSERT INTO orders (order_number,user_id,ship_name,ship_phone,ship_line1,ship_line2,ship_city,ship_state,ship_pincode,
         payment_method,items_price,shipping_price,discount_amount,total_price,coupon_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
      [orderNumber, req.user.id, a.fullName, a.phone, a.addressLine1, a.addressLine2 || null, a.city || null, a.state || null, a.pincode || null,
       method, itemsPrice, shipping, discount, total, appliedCoupon]);
    const id = o[0].id;

    for (const l of lines) {
      await db.query(
        `INSERT INTO order_items (order_id,product_id,product_code,name,image,price,quantity,size,color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [id, l.p.id, l.p.product_id, l.p.name, l.p.images?.[0] || null, l.price, l.qty, l.size, l.color]);
      await db.query('UPDATE products SET stock=stock-$2, sold=sold+$2 WHERE id=$1', [l.p.id, l.qty]);
    }
    await db.query(`INSERT INTO order_tracking (order_id,status,note) VALUES ($1,'placed',$2)`,
      [id, method === 'cod' ? 'Order placed – Cash on Delivery' : 'Order placed – waiting for online payment']);
    await db.query(`INSERT INTO payments (order_id,method,amount,status) VALUES ($1,$2,$3,'pending')`, [id, method, total]);
    return id;
  });

  const full = await getOrderRow('o.id=$1', [order]);
  res.status(201).json({ success: true, order: shape(full), orderId: full.id, orderNumber: full.order_number });
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  const { rows } = await query(`${ORDER_SELECT} WHERE o.user_id=$1 ORDER BY o.created_at DESC`, [req.user.id]);
  res.json({ success: true, orders: rows.map(shape) });
};

// GET /api/orders/:id   (id or order number)
exports.getOrder = async (req, res) => {
  const k = req.params.id;
  const o = await getOrderRow(`(o.order_number=$1 OR o.id::text=$1)`, [k]);
  if (!o || (o.user_id !== req.user.id && req.user.role !== 'admin')) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order: shape(o) });
};

// POST /api/orders/:id/cancel
exports.cancelMyOrder = async (req, res) => {
  const o = await getOrderRow(`o.id::text=$1 AND o.user_id=$2`, [req.params.id, req.user.id]);
  if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!['placed', 'confirmed'].includes(o.order_status)) return res.status(400).json({ success: false, message: 'This order can no longer be cancelled' });
  await applyStatus(o.id, 'cancelled', 'Cancelled by customer', req.user.id);
  res.json({ success: true, message: 'Order cancelled' });
};

/** Shared by customer-cancel and admin status update. Keeps timeline + stock + payment in sync. */
async function applyStatus(orderId, status, note, userId, extra = {}) {
  await tx(async (db) => {
    const { rows } = await db.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [orderId]);
    const cur = rows[0];
    if (!cur) { const e = new Error('Order not found'); e.status = 404; throw e; }
    if (cur.order_status === 'cancelled' && status !== 'cancelled') { const e = new Error('Cancelled orders cannot be changed'); e.status = 400; throw e; }

    const sets = ['order_status=$2', 'updated_at=NOW()']; const args = [orderId, status];
    if (extra.trackingNumber) { args.push(extra.trackingNumber); sets.push(`tracking_number=$${args.length}`); }
    if (extra.courier) { args.push(extra.courier); sets.push(`courier=$${args.length}`); }
    if (status === 'delivered') {
      sets.push('delivered_at=NOW()');
      if (cur.payment_method === 'cod') sets.push(`payment_status='paid'`);      // cash collected on delivery
    }
    await db.query(`UPDATE orders SET ${sets.join(', ')} WHERE id=$1`, args);

    if (status === 'delivered' && cur.payment_method === 'cod')
      await db.query(`UPDATE payments SET status='paid', paid_at=NOW() WHERE order_id=$1 AND status='pending'`, [orderId]);

    if (status === 'cancelled' && cur.order_status !== 'cancelled') {
      await db.query(`UPDATE products p SET stock=p.stock+oi.quantity, sold=GREATEST(p.sold-oi.quantity,0)
                      FROM order_items oi WHERE oi.order_id=$1 AND oi.product_id=p.id`, [orderId]);
      if (cur.payment_status === 'paid') await db.query(`UPDATE orders SET payment_status='refunded' WHERE id=$1`, [orderId]);
    }
    await db.query('INSERT INTO order_tracking (order_id,status,note,created_by) VALUES ($1,$2,$3,$4)', [orderId, status, note || STATUS_NOTE[status], userId]);
  });
}
exports.applyStatus = applyStatus;
exports.ORDER_SELECT = ORDER_SELECT;
exports.shape = shape;
exports.STATUSES = STATUSES;
exports.getOrderRow = getOrderRow;
