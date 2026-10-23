const { pool, query } = require('../config/db');
const migrate = require('./migrate');
const ensureAdmin = require('./ensureAdmin');
const { buildProductId } = require('../utils/helpers');

const CATS = ['Blouses','Chudidars','Frocks','Lehengas','Party Wear','Handbags','Slippers','Watches',"Men's Shirts","Men's Kurta","Men's Pants"];

const PRODUCTS = [
  { name:'Bridal Silk Blouse',    category:'Blouses',      min:1999, max:2500, stock:30, badge:'New',     sizes:['S','M','L','XL'], colors:['Maroon','Gold','Green'], img:'/image/blouse/blouses2.jpeg',   desc:'Premium bridal silk blouse with golden embroidery.' },
  { name:'Aari Work Blouse',      category:'Blouses',      min:1299, max:1799, stock:25, badge:'Popular', sizes:['S','M','L','XL'], colors:['Red','Blue','Pink'],     img:'/image/blouse/blouses4.jpeg',   desc:'Hand embroidered Aari work blouse.' },
  { name:'Designer Chudidar Set', category:'Chudidars',    min:1499, max:1999, stock:20, badge:'Popular', sizes:['S','M','L','XL'], colors:['Pink','Blue','Peach'],   img:'/image/chudidar/chudidar1.jpeg',desc:'Elegant hand-embroidered chudidar set.' },
  { name:'Silk Chudidar',         category:'Chudidars',    min:1899, max:2499, stock:20, badge:'',        sizes:['S','M','L','XL'], colors:['Maroon','Gold'],         img:'/image/chudidar/chudidar2.jpeg',desc:'Pure silk chudidar for festive occasions.' },
  { name:'Party Lehenga',         category:'Lehengas',     min:3999, max:5500, stock:15, badge:'Sale',    sizes:['S','M','L','XL'], colors:['Pink','Purple'],         img:'/image/lehenga/lehenga1.jpeg',  desc:'Stunning party lehenga with heavy embroidery.' },
  { name:'Designer Handbag',      category:'Handbags',     min:999,  max:1500, stock:40, badge:'New',     sizes:[],                 colors:['Black','Brown'],         img:'/image/handbag/handbag1.jpeg',  desc:'Stylish designer handbag with multiple compartments.' },
  { name:"Men's Formal Shirt",    category:"Men's Shirts", min:599,  max:999,  stock:50, badge:'',        sizes:['M','L','XL','XXL'],colors:['White','Blue'],          img:'/image/shirt/shirt1.jpg',       desc:'Classic formal shirt for professional occasions.' },
  { name:'Party Wear Gown',       category:'Party Wear',   min:2499, max:3500, stock:12, badge:'Sale',    sizes:['S','M','L','XL'], colors:['Black','Red'],           img:'/image/party/party1.jpg',       desc:'Glamorous party wear gown with sequin work.' },
];

(async () => {
  try {
    await migrate();
    await ensureAdmin({ reset: true });

    for (const [i, name] of CATS.entries()) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await query(`INSERT INTO categories (name,slug,sort_order) VALUES ($1,$2,$3) ON CONFLICT (name) DO NOTHING`, [name, slug, i]);
    }

    const { rows } = await query('SELECT COUNT(*)::int AS n FROM products');
    if (rows[0].n === 0) {
      for (const p of PRODUCTS) {
        const pid = await buildProductId(query, p.category);
        await query(
          `INSERT INTO products (product_id,name,category,min_price,max_price,stock,badge,description,sizes,colors,images)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [pid, p.name, p.category, p.min, p.max, p.stock, p.badge, p.desc, p.sizes, p.colors, [p.img]]);
      }
      console.log(`🛍️  ${PRODUCTS.length} sample products added`);
    } else {
      console.log('ℹ️  Products already exist – sample products skipped');
    }

    await query(`INSERT INTO coupons (code,description,discount_type,discount_value,min_order_amount)
                 VALUES ('WELCOME10','10% off your first order','percentage',10,999) ON CONFLICT (code) DO NOTHING`);
    console.log('\n✅ Seed complete. Admin:', process.env.ADMIN_EMAIL);
  } catch (e) {
    console.error('❌ Seed error:', e.message);
    process.exitCode = 1;
  } finally { await pool.end(); }
})();
