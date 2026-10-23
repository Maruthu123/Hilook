const { query } = require('../config/db');
const { num, csv, buildProductId } = require('../utils/helpers');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function shape(p) {
  return {
    _id: p.id, id: p.id, productId: p.product_id, name: p.name, category: p.category,
    minPrice: num(p.min_price), maxPrice: num(p.max_price), stock: p.stock, sold: p.sold,
    badge: p.badge || '', description: p.description || '', isAvailable: p.is_available,
    sizes: p.sizes || [], colors: p.colors || [], images: p.images || [], tags: p.tags || [],
    createdAt: p.created_at,
  };
}

async function findFlexible(idParam) {
  const { rows } = UUID_RE.test(idParam)
    ? await query('SELECT * FROM products WHERE id=$1 OR product_id=$1', [idParam])
    : await query('SELECT * FROM products WHERE product_id=$1', [idParam]);
  return rows[0];
}

// GET /api/products
exports.getProducts = async (req, res) => {
  const { category, search, sort, page = 1, limit = 12, admin, exclude } = req.query;
  const where = []; const args = [];
  if (admin !== 'true') where.push('is_available = TRUE');
  if (category && category !== 'All') { args.push(category); where.push(`LOWER(category) = LOWER($${args.length})`); }
  if (search) { args.push(`%${search}%`); where.push(`(name ILIKE $${args.length} OR product_id ILIKE $${args.length} OR description ILIKE $${args.length})`); }
  if (exclude) { args.push(exclude); where.push(`product_id <> $${args.length}`); }
  const W = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const order = { price_asc: 'min_price ASC', price_desc: 'min_price DESC', popular: 'sold DESC', newest: 'created_at DESC' }[sort] || 'created_at DESC';
  const lim = Math.min(Number(limit) || 12, 500);
  const off = (Math.max(Number(page) || 1, 1) - 1) * lim;

  const [{ rows }, { rows: cnt }] = await Promise.all([
    query(`SELECT * FROM products ${W} ORDER BY ${order} LIMIT ${lim} OFFSET ${off}`, args),
    query(`SELECT COUNT(*)::int AS n FROM products ${W}`, args),
  ]);
  res.json({ success: true, total: cnt[0].n, page: Number(page), pages: Math.ceil(cnt[0].n / lim), products: rows.map(shape) });
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  const p = await findFlexible(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product: shape(p) });
};

// POST /api/products (admin)
exports.createProduct = async (req, res) => {
  const b = req.body;
  if (!b.name || !b.category) return res.status(400).json({ success: false, message: 'Name and category are required' });
  const pid = (b.productId && b.productId.trim()) || await buildProductId(query, b.category);
  const min = num(b.minPrice);
  const max = num(b.maxPrice, min);
  const { rows } = await query(
    `INSERT INTO products (product_id,name,category,min_price,max_price,stock,badge,description,is_available,sizes,colors,images)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [pid, b.name.trim(), b.category, min, max, num(b.stock, 10), b.badge || '', b.description || '',
     b.isAvailable !== false, csv(b.sizes), csv(b.colors), csv(b.images)]);
  res.status(201).json({ success: true, product: shape(rows[0]) });
};

// PUT /api/products/:id (admin)
exports.updateProduct = async (req, res) => {
  const cur = await findFlexible(req.params.id);
  if (!cur) return res.status(404).json({ success: false, message: 'Product not found' });
  const b = req.body;
  const has = (k) => b[k] !== undefined;
  const { rows } = await query(
    `UPDATE products SET name=$2, category=$3, min_price=$4, max_price=$5, stock=$6, badge=$7, description=$8,
       is_available=$9, sizes=$10, colors=$11, images=$12, updated_at=NOW() WHERE id=$1 RETURNING *`,
    [cur.id, has('name') ? b.name : cur.name, has('category') ? b.category : cur.category,
     has('minPrice') ? num(b.minPrice) : cur.min_price, has('maxPrice') ? num(b.maxPrice, num(b.minPrice)) : cur.max_price,
     has('stock') ? num(b.stock) : cur.stock, has('badge') ? (b.badge || '') : cur.badge,
     has('description') ? b.description : cur.description, has('isAvailable') ? !!b.isAvailable : cur.is_available,
     has('sizes') ? csv(b.sizes) : cur.sizes, has('colors') ? csv(b.colors) : cur.colors, has('images') ? csv(b.images) : cur.images]);
  res.json({ success: true, product: shape(rows[0]) });
};

// PATCH /api/products/:id/availability (admin)
exports.toggleAvailability = async (req, res) => {
  const cur = await findFlexible(req.params.id);
  if (!cur) return res.status(404).json({ success: false, message: 'Product not found' });
  const { rows } = await query('UPDATE products SET is_available=$2, updated_at=NOW() WHERE id=$1 RETURNING *', [cur.id, !!req.body.isAvailable]);
  res.json({ success: true, product: shape(rows[0]) });
};

// DELETE /api/products/:id (admin)
exports.deleteProduct = async (req, res) => {
  const cur = await findFlexible(req.params.id);
  if (!cur) return res.status(404).json({ success: false, message: 'Product not found' });
  await query('DELETE FROM products WHERE id=$1', [cur.id]);
  res.json({ success: true, message: 'Product deleted' });
};

// POST /api/products/:id/review
exports.addReview = async (req, res) => {
  const p = await findFlexible(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
  const { rating, comment } = req.body;
  try {
    await query('INSERT INTO reviews (product_id,user_id,name,rating,comment) VALUES ($1,$2,$3,$4,$5)', [p.id, req.user.id, req.user.name, num(rating, 5), comment || '']);
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    throw e;
  }
  res.status(201).json({ success: true, message: 'Review submitted for approval' });
};

exports.findFlexible = findFlexible;
exports.shape = shape;
