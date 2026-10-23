const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('✅ Neon tables created / verified');
}

if (require.main === module) {
  run().then(() => pool.end()).catch((e) => { console.error('❌ Migration failed:', e.message); process.exit(1); });
}
module.exports = run;
