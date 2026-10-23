const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

/** Creates the admin account from .env if it does not exist yet. */
async function ensureAdmin({ reset = false } = {}) {
  const email = (process.env.ADMIN_EMAIL || 'boutiquehilook965@gmail.com').toLowerCase();
  const pass  = process.env.ADMIN_PASSWORD || 'Hilook@123';
  const hash  = await bcrypt.hash(pass, 12);
  const { rows } = await query('SELECT id FROM users WHERE email=$1', [email]);
  if (!rows.length) {
    await query(
      `INSERT INTO users (name,email,password_hash,role,is_verified) VALUES ('Admin',$1,$2,'admin',TRUE)`,
      [email, hash]);
    console.log('👤 Admin account created:', email);
  } else if (reset) {
    await query(`UPDATE users SET password_hash=$2, role='admin', is_verified=TRUE, is_blocked=FALSE WHERE email=$1`, [email, hash]);
    console.log('🔑 Admin password reset from .env');
  }
}
module.exports = ensureAdmin;
