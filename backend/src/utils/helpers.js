const crypto = require('crypto');

/** Wrap async route handlers so errors reach the error middleware. */
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const num = (v, d = 0) => (v === null || v === undefined || v === '' ? d : Number(v));

const CATEGORY_PREFIX = {
  'Blouses': 'NishaBoutiqueBlouse', 'Chudidars': 'NishaBoutiqueChudidar', 'Frocks': 'NishaBoutiqueFrock',
  'Lehengas': 'NishaBoutiqueLehenga', 'Party Wear': 'NishaBoutiquePartyWear', 'Handbags': 'NishaBoutiqueHandbag',
  'Slippers': 'NishaBoutiqueSlipper', 'Watches': 'NishaBoutiqueWatch', "Men's Shirts": 'NishaBoutiqueMenShirt',
  "Men's Kurta": 'NishaBoutiqueMenKurta', "Men's Pants": 'NishaBoutiqueMenPant',
};

/** NishaBoutiqueBlouse001, 002 … (never re-uses a number) */
async function buildProductId(query, category) {
  const prefix = CATEGORY_PREFIX[category] || 'NishaBoutique' + String(category || 'Item').replace(/[^a-zA-Z]/g, '');
  const { rows } = await query(`SELECT product_id FROM products WHERE product_id LIKE $1`, [prefix + '%']);
  let max = 0;
  rows.forEach((r) => { const n = parseInt(r.product_id.slice(prefix.length), 10); if (!isNaN(n) && n > max) max = n; });
  return prefix + String(max + 1).padStart(3, '0');
}

const csv = (v) => {
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const genOtp = () => String(crypto.randomInt(100000, 1000000));
const clientIp = (req) => (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();

module.exports = { ah, num, buildProductId, csv, sha, genOtp, clientIp };
