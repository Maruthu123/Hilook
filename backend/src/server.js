const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { pool } = require('./config/db');
const migrate = require('./db/migrate');
const ensureAdmin = require('./db/ensureAdmin');
const misc = require('./routes/miscRoutes');

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 600 }));

const origins = [process.env.FRONTEND_URL, 'http://localhost:3000'].filter(Boolean).map((o) => o.replace(/\/$/, ''));
app.use(cors({ origin: (o, cb) => (!o || origins.includes(o.replace(/\/$/, '')) ? cb(null, true) : cb(new Error('CORS blocked: ' + o))), credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/products',     require('./routes/productRoutes'));
app.use('/api/orders',       require('./routes/orderRoutes'));
app.use('/api/payment',      require('./routes/paymentRoutes'));
app.use('/api/testimonials', misc.testimonials);
app.use('/api/categories',   misc.categories);
app.use('/api/banners',      misc.banners);
app.use('/api/coupons',      misc.coupons);
app.use('/api/wishlist',     misc.wishlist);
app.use('/api/users',        misc.users);
app.use('/api/contact',      misc.contact);
app.use('/api/admin',        require('./routes/adminRoutes'));
app.use('/admin',            require('./routes/adminRoutes'));

app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'OK', database: 'Neon connected' }); }
  catch (e) { res.status(500).json({ status: 'ERROR', database: e.message }); }
});

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await migrate();          // creates tables if missing
    await ensureAdmin();      // creates admin from .env if missing
    app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}  (Neon connected)`));
  } catch (e) {
    console.error('❌ Could not start:', e.message);
    process.exit(1);
  }
})();
module.exports = app;
