import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import ProductCard from '../../components/ProductCard/ProductCard';
import { API_URL } from '../../api';
import { COD_ENABLED } from '../../config';
import './Home.css';

/* ───────────── data ───────────── */
const SLIDES = [
  { label: 'New Arrival',   title: 'The Art of\nHandcrafted\nElegance', sub: 'Exclusive Chudidar & Blouse Collection',              cta: 'Explore Collection', link: '/shop',     image: '/image/chudidar/chudidar111.png' },
  { label: 'Bridal Season', title: 'Aari & Zari\nMasterwork',           sub: 'Premium Embroidery Blouses — Stitched to Perfection', cta: 'Shop Blouses',       link: '/blouses',  image: '/image/blouse/blouses19.png' },
  { label: 'Festive Edit',  title: 'Dressed for\nEvery Occasion',       sub: 'Lehengas, Party Wear & Designer Chudidars',           cta: 'View Collections',   link: '/lehengas', image: '/image/lehenga/lehenga111.png' },
];
const CATS = [
  { name: 'Chudidars',  img: '/image/chudidar/chudidar1.jpeg', path: '/chudidars', count: '8 Designs' },
  { name: 'Blouses',    img: '/image/blouse/blouses12.jpeg',   path: '/blouses',   count: '135 Designs' },
  { name: 'Frocks',     img: '/image/frock/frock1.jpeg',       path: '/frocks',    count: '16 Designs' },
  { name: 'Lehengas',   img: '/image/lehenga/lehenga1.jpeg',   path: '/lehengas',  count: '16 Designs' },
  { name: 'Party Wear', img: '/image/party/party1.jpg',        path: '/party',     count: '16 Designs' },
  { name: 'Handbags',   img: '/image/handbag/handbag1.jpeg',   path: '/handbag',   count: '26 Designs' },
];
const TICKER = ['✨ New arrivals every week', '🚚 Delivery across India in 7–10 days', '💬 Live WhatsApp support', '🧵 Custom stitching available', ...(COD_ENABLED ? ['💵 Cash on Delivery'] : []), '🔒 Secure online payment'];
const FEATURES = [
  { icon: 'fa-gem',        t: 'Handcrafted Quality', d: 'Every piece is finished by experienced tailors and embroidery artists.' },
  { icon: 'fa-ruler-combined', t: 'Perfect Fit',     d: 'Detailed size charts and custom stitching for a fit that feels made for you.' },
  { icon: 'fa-truck-fast', t: 'Fast Delivery',       d: 'Live order tracking from packing to your doorstep, all over India.' },
  { icon: 'fa-hand-holding-dollar', t: 'Easy Payment', d: COD_ENABLED ? 'Pay online securely or choose Cash on Delivery – your choice.' : 'Pay securely online with UPI, cards or net banking.' },
];
const STEPS = [
  { n: '01', t: 'Pick your design', d: 'Browse hundreds of blouses, chudidars and festive wear.' },
  { n: '02', t: 'Choose size & colour', d: 'Use our size chart and place your order in a minute.' },
  { n: '03', t: 'We craft it', d: 'Your outfit is stitched, quality-checked and packed with care.' },
  { n: '04', t: 'Track & enjoy', d: 'Follow every step on the Track Orders page until delivery.' },
];
const FALLBACK_REVIEWS = [
  { name: 'Divya R.',  place: 'Coimbatore', quote: 'Fit perfect ah irundhuchu, wore it for my sister’s wedding!', stars: 5, photo: '/image/customers/customers1.jpg' },
  { name: 'Meera S.',  place: 'Chennai',    quote: 'Fabric quality super, delivery vera level fast.',            stars: 5, photo: '/image/customers/customers2.jpeg' },
  { name: 'Priya K.',  place: 'Madurai',    quote: 'Silk saree correct ah irundhuchu, no regrets!',              stars: 4, photo: '/image/customers/customers3.jpeg' },
  { name: 'Anitha V.', place: 'Salem',      quote: 'Custom blouse stitching, measurements dead-on accurate.',    stars: 5, photo: '/image/customers/customers4.jpg' },
];

const MEN_CATS = [
  { t: 'Shirts', d: 'Formal & casual fits, stitched sharp.', path: '/mens-shirts' },
  { t: 'Kurta',  d: 'Festive & everyday ethnic classics.',   path: '/mens-kurta' },
  { t: 'Pants',  d: 'Tailored comfort for every occasion.',  path: '/mens-pants' },
];
// Optional: unga own image paths / URLs inga podalaam (illana store oda men's product images auto-ah varum)
const MEN_IMGS = ['/image/shirt/shirt5.jpg', '/image/kurta/kurta2.jpg', '/image/pant/pant4.jpg'];
const menPath = (cat = '') => (cat.includes('Shirt') ? '/mens-shirts' : cat.includes('Kurta') ? '/mens-kurta' : cat.includes('Pant') ? '/mens-pants' : '/mens');
const STATS = [
  { n: 5000, s: '+', l: 'Happy customers', icon: 'fa-heart' },
  { n: 500,  s: '+', l: 'Unique designs',  icon: 'fa-shirt' },
  { n: 10,   s: '+', l: 'Years of craft',  icon: 'fa-scissors' },
  { n: 28,   s: '',  l: 'States delivered', icon: 'fa-location-dot' },
];

/* ───────────── helpers ───────────── */
const ROUTE_MAP = {
  'Blouses': 'Blouses', 'Chudidars': 'Chudidars', 'Frocks': 'Frocks', 'Lehengas': 'Lehengas', 'Party Wear': 'Party Wear',
  'Handbags': 'handbags', 'Slippers': 'slippers', 'Watches': 'watches',
  "Men's Shirts": 'mensshirts', "Men's Kurta": 'menskurta', "Men's Pants": 'menspants',
};
const toCard = (p) => ({
  id: p.productId,
  name: p.name,
  price: `₹${(p.minPrice || 0).toLocaleString()}`,
  upto: p.maxPrice > p.minPrice ? `₹${p.maxPrice.toLocaleString()}` : undefined,
  image: p.images?.[0] || '',
  badge: p.badge,
  category: ROUTE_MAP[p.category] || p.category,
});

const fadeUp = { hidden: { opacity: 0, y: 36 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }) };

function Reveal({ children, className = '', i = 0, ...rest }) {
  return <motion.div className={className} variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} {...rest}>{children}</motion.div>;
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <Reveal className="hm-head">
      <span className="hm-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <span className="hm-rule"><i /></span>
      {sub && <p>{sub}</p>}
    </Reveal>
  );
}

function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => { if (inView) { const c = animate(0, to, { duration: 2, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop(); } return undefined; }, [inView, to]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

/* ───────────── Butterfly mark (hero + categories) ───────────── */
function ButterflyGlyph({ size, opacity, rotate }) {
  return (
    <svg viewBox="0 0 200 170" width={size} height={size * 0.85} style={{ opacity, transform: `rotate(${rotate}deg)` }} className="bf-trail-svg" aria-hidden="true">
      <path className="bft-wing" d="M100,78 C118,30 168,16 180,44 C190,68 150,82 100,86 Z" />
      <path className="bft-fill" d="M108,72 C120,42 152,34 158,52 C163,68 134,76 108,74 Z" />
      <path className="bft-wing" d="M100,78 C82,30 32,16 20,44 C10,68 50,82 100,86 Z" />
      <path className="bft-fill" d="M92,72 C80,42 48,34 42,52 C37,68 66,76 92,74 Z" />
      <path className="bft-wing" d="M100,88 C116,112 146,118 140,134 C134,148 108,130 100,102 Z" />
      <path className="bft-wing" d="M100,88 C84,112 54,118 60,134 C66,148 92,130 100,102 Z" />
      <ellipse className="bft-body" cx="100" cy="82" rx="4.5" ry="22" />
      <path className="bft-antenna" d="M96,62 C88,42 66,34 60,40 C56,44 62,48 68,44" />
      <path className="bft-antenna" d="M104,62 C112,42 134,34 140,40 C144,44 138,48 132,44" />
    </svg>
  );
}
const Butterfly = ({ size = 40, opacity = 0.55, rotate = 0, flap = false, speed = 2.2 }) => {
  if (!flap) return <ButterflyGlyph size={size} opacity={opacity} rotate={rotate} />;
  return (
    <div className="bf-3d-wrap" style={{ width: size, height: size * 0.85, opacity, transform: `rotate(${rotate}deg)` }}>
      <div className="bf-3d-inner" style={{ animationDuration: `${speed}s` }}>
        <ButterflyGlyph size={size} opacity={1} rotate={0} />
      </div>
    </div>
  );
};

function TrailSeam({ className = '' }) {
  return (
    <svg className={`trail-seam-svg ${className}`} viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,60 C150,10 300,110 450,60 C600,10 750,110 900,60 C1000,32 1100,92 1200,58" />
    </svg>
  );
}

/* ───────────── page ───────────── */
export default function Home() {
  const [slide, setSlide] = useState(0);
  const [activeCat, setActiveCat] = useState(2);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [featured, setFeatured] = useState(null);
  const [mensFeatured, setMensFeatured] = useState([]);
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [rIdx, setRIdx] = useState(0);

  const handleHeroTilt = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -18, y: px * 18 });
  };
  const resetHeroTilt = () => setTilt({ x: 0, y: 0 });

  useEffect(() => { const t = setInterval(() => setSlide((p) => (p + 1) % SLIDES.length), 5000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setRIdx((i) => i + 1), 5500); return () => clearInterval(t); }, []);

  useEffect(() => {
    let alive = true;
    fetch(`${API_URL}/api/products?limit=8&sort=newest`).then((r) => r.json()).then((d) => alive && setFeatured(d.products || [])).catch(() => alive && setFeatured([]));
    fetch(`${API_URL}/api/products?limit=60&sort=newest`).then((r) => r.json()).then((d) => {
      const list = (d.products || []).filter((p) => p.isAvailable !== false && p.category?.startsWith("Men's")).slice(0, 4);
      if (alive) setMensFeatured(list);
    }).catch(() => {});
    fetch(`${API_URL}/api/testimonials`).then((r) => r.json()).then((d) => {
      const list = (d.testimonials || []).map((t) => ({ name: t.name, place: t.location || '', quote: t.message, stars: t.rating || 5, photo: t.photo }));
      if (alive && list.length) setReviews(list);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const sl = SLIDES[slide];
  const rn = reviews.length;
  const ri = ((rIdx % rn) + rn) % rn;
  const rv = reviews[ri];
  const prevR = () => setRIdx((i) => i - 1);
  const nextR = () => setRIdx((i) => i + 1);

  const prevCat = () => setActiveCat((p) => (p - 1 + CATS.length) % CATS.length);
  const nextCat = () => setActiveCat((p) => (p + 1) % CATS.length);
  const visibleCats = [-2, -1, 0, 1, 2].map((offset) => {
    const idx = (activeCat + offset + CATS.length) % CATS.length;
    return { ...CATS[idx], offset, idx };
  });

  return (
    <div className="hm">
      {/* ═════════ HERO ═════════ */}
      <section className="hero hero-v4">
        <div className="hero-v4-wash" aria-hidden="true" />

        <div className="container hero-v4-grid">
          <AnimatePresence mode="wait">
            <motion.div key={slide} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.6 }} className="hero-v4-text">
              <span className="hero-label"><Butterfly size={14} opacity={1} />{sl.label}</span>
              <h1 className="hero-v4-title">
                {sl.title.split('\n').map((l, i) => (
                  <span key={i} className={i === 1 ? 'hero-v2-accent' : ''}>{l}</span>
                ))}
              </h1>
              <p className="hero-sub">{sl.sub}</p>

              <div className="hero-actions">
                <Link to={sl.link} className="hero-btn-primary">{sl.cta} →</Link>
                <a href="https://wa.me/918144372323" target="_blank" rel="noreferrer" className="hero-btn-outline">
                  <i className="fa-brands fa-whatsapp" /> Custom Order
                </a>
              </div>

              <div className="hero-trust">
                <span>✅ Handstitched Quality</span>
                <span>✅ Pan-India Delivery</span>
                <span>✅ WhatsApp Support</span>
              </div>

              <div className="hero-dots-bf">
                {SLIDES.map((_, i) => (
                  <button key={i} className={`hero-dot-bf ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`}>
                    <Butterfly size={i === slide ? 20 : 14} opacity={i === slide ? 1 : 0.4} />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="hero-trail-wrap" onMouseMove={handleHeroTilt} onMouseLeave={resetHeroTilt}
            style={{ transform: `rotateX(${tilt.x * 0.25}deg) rotateY(${tilt.y * 0.25}deg)` }}>
            <svg className="hero-trail-line" viewBox="0 0 460 560" preserveAspectRatio="none" aria-hidden="true">
              <path d="M60,50 C170,10 130,150 230,160 C330,170 300,300 400,290 C440,285 452,320 430,340 C360,400 300,330 250,380 C200,430 260,480 190,510 C140,530 90,505 70,480" />
            </svg>
            <div className="trail-photo trail-photo-1"><img src={SLIDES[0].image} alt={SLIDES[0].label} /></div>
            <div className="trail-photo trail-photo-2"><img src={SLIDES[1].image} alt={SLIDES[1].label} /></div>
            <div className="trail-photo trail-photo-3"><img src={SLIDES[2].image} alt={SLIDES[2].label} /></div>
            <span className="trail-bf trail-bf-1"><Butterfly size={72} opacity={0.95} flap speed={2.4} /></span>
            <span className="trail-bf trail-bf-2"><Butterfly size={40} opacity={0.85} rotate={-12} flap speed={1.9} /></span>
          </div>
        </div>

        <div className="hero-scroll"><span>Scroll</span><div className="hero-scroll-line" /></div>
      </section>

      {/* ═════════ TICKER ═════════ */}
      <div className="hm-ticker"><div className="hm-ticker-track">{[...TICKER, ...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}</span>)}</div></div>

      {/* ═════════ CATEGORIES ═════════ */}
      <section className="cats-section">
        <div className="cats-bg-text">CATEGORIES</div>
        <TrailSeam className="cats-trail-line" />
        <div className="cats-bf cats-bf-1"><Butterfly size={72} opacity={0.35} flap speed={2.6} /></div>
        <div className="cats-bf cats-bf-2"><Butterfly size={46} opacity={0.22} /></div>
        <div className="cats-bf cats-bf-3"><Butterfly size={32} opacity={0.22} flap speed={2.4} /></div>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow-tag"><Butterfly size={13} opacity={1} />Collections</span>
            <h2>Shop by Category</h2>
            <p>Explore our curated collections of handcrafted Indian fashion</p>
          </Reveal>

          <div className="cats-carousel-wrap">
            <div className="cats-carousel-bf"><Butterfly size={26} opacity={0.2} /></div>
            <button className="cat-arrow cat-arrow-left" onClick={prevCat} aria-label="Previous category">‹</button>

            <div className="cats-stage">
              {visibleCats.map(({ name, img, path, count, offset, idx }) => {
                const isCenter = offset === 0;
                const isNear = Math.abs(offset) === 1;
                return (
                  <Link
                    to={path}
                    key={`${idx}-${offset}`}
                    className={`cat-stage-card offset-${offset} ${isCenter ? 'center' : ''} ${isNear ? 'near' : 'far'}`}
                    onClick={(e) => { if (!isCenter) { e.preventDefault(); setActiveCat(idx); } }}
                  >
                    <div className="cat-stage-inner">
                      <img src={img} alt={name} loading="lazy" />
                      <div className="cat-stage-overlay">
                        <h3>{name}</h3>
                        <span>{count}</span>
                        {isCenter && <div className="cat-stage-btn">Explore →</div>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <button className="cat-arrow cat-arrow-right" onClick={nextCat} aria-label="Next category">›</button>
          </div>

          <div className="cats-dots">
            {CATS.map((c, i) => <button key={c.name} className={`cats-dot ${i === activeCat ? 'active' : ''}`} onClick={() => setActiveCat(i)} aria-label={c.name} />)}
          </div>
        </div>
      </section>

      {/* ═════════ FEATURED ═════════ */}
      {(featured === null || featured.length > 0) && (
        <section className="hm-sec hm-sec-tint">
          <SectionHead eyebrow="Just in" title="New Arrivals" sub="Fresh designs added to the boutique" />
          <div className="hm-prod-grid">
            {featured === null
              ? [1, 2, 3, 4].map((k) => <div key={k} className="cat-skeleton"><div className="cat-skeleton-img" /><div className="cat-skeleton-line" /><div className="cat-skeleton-line short" /></div>)
              : featured.map((p) => (
                <ProductCard key={p._id} id={p.productId} name={p.name} price={`₹${p.minPrice.toLocaleString()}`}
                  upto={p.maxPrice > p.minPrice ? `₹${p.maxPrice.toLocaleString()}` : undefined} image={p.images?.[0]} badge={p.badge} category={p.category} />
              ))}
          </div>
          <Reveal className="hm-center"><Link to="/shop" className="hm-btn hm-btn-primary">View All Products <i className="fa-solid fa-arrow-right" /></Link></Reveal>
        </section>
      )}

      {/* ═════════ MEN'S SECTION ═════════ */}
      <section className="mn">
        <div className="mn-tape" aria-hidden="true" />
        <div className="mn-giant" aria-hidden="true">MEN</div>
        <span className="mn-bf mn-bf-1"><Butterfly size={70} opacity={0.9} flap speed={2.6} /></span>

        <div className="container mn-top">
          <Reveal className="mn-copy">
            <span className="mn-tag"><Butterfly size={12} opacity={1} /> New Category</span>
            <h2 className="mn-title">Tailored<br />for <em>Him</em></h2>
            <p className="mn-sub">Premium ethnic wear &amp; formal styles, handcrafted for every man who values a sharp, comfortable fit.</p>
            <div className="mn-facts">
              <div><b>3+</b><small>Categories</small></div>
              <div><b>₹499</b><small>Starting from</small></div>
              <div><b>7–10</b><small>Days delivery</small></div>
            </div>
            <Link to="/mens" className="mn-cta">Explore All Men's <i className="fa-solid fa-arrow-right" /></Link>
          </Reveal>

          <div className="mn-collage">
            {MEN_CATS.map((m, i) => {
              const hit = mensFeatured.find((p) => (p.category || '').toLowerCase().includes(m.t.toLowerCase().slice(0, 4)));
              const img = MEN_IMGS[i] || hit?.images?.[0] || mensFeatured[i]?.images?.[0] || '';
              return (
                <Reveal key={m.t} i={i + 1} className={`mn-tag-wrap mn-tag-${i + 1}`}>
                  <Link to={m.path} className="mn-tagcard">
                    <span className="mn-tag-string" aria-hidden="true"><span className="mn-tag-hole" /></span>
                    <span className="mn-tag-photo">
                      {img ? <img src={img} alt={m.t} loading="lazy" /> : <span className="mn-tag-ph">{m.t[0]}</span>}
                      <span className="mn-tag-num">0{i + 1}</span>
                      <span className="mn-tag-shade" />
                      <span className="mn-tag-info">
                        <b>{m.t}</b>
                        <small>{m.d}</small>
                        <span className="mn-tag-shop">Shop now <i className="fa-solid fa-arrow-right" /></span>
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>

        <div className="mn-marquee" aria-hidden="true">
          <div className="mn-marquee-track">
            {Array.from({ length: 8 }).map((_, i) => <span key={i}>SHIRTS ✦ KURTA ✦ PANTS ✦ </span>)}
          </div>
        </div>

        {mensFeatured.length > 0 && (
          <div className="container mn-rail">
            <div className="mn-rail-head">
              <h3>Latest <em>Arrivals</em></h3>
              <Link to="/mens">View all <i className="fa-solid fa-arrow-right" /></Link>
            </div>
            <div className="mn-rail-row">
              {mensFeatured.map((p) => (
                <Link key={p._id || p.productId} to={menPath(p.category)} className="mn-card">
                  <span className="mn-card-img">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" /> : <span className="mn-tag-ph">{p.name?.[0] || "M"}</span>}
                    {p.badge && <span className="mn-card-badge">{p.badge}</span>}
                  </span>
                  <span className="mn-card-body">
                    <b>{p.name}</b>
                    <span className="mn-card-price">₹{(p.minPrice || 0).toLocaleString()}{p.maxPrice > p.minPrice ? ` – ₹${p.maxPrice.toLocaleString()}` : ''}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═════════ STATS ═════════ */}
      <section className="sx">
        <div className="container">
          <div className="sx-bar">
            {STATS.map((st, i) => (
              <Reveal key={st.l} i={i} className="sx-item">
                <span className="sx-ic"><i className={`fa-solid ${st.icon}`} /></span>
                <b><Counter to={st.n} suffix={st.s} /></b>
                <span className="sx-l">{st.l}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ WHY US (bento) ═════════ */}
      <section className="wy">
        <div className="container">
          <SectionHead eyebrow="Why Nisha Boutique" title="Crafted with Care" sub="Four reasons our customers keep coming back" />
          <div className="wy-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.t} i={i} className={`wy-card ${i === 0 ? 'wy-big' : ''} ${i === 3 ? 'wy-wide' : ''}`}>
                <span className="wy-num">0{i + 1}</span>
                {i === 0 && <span className="wy-bf"><Butterfly size={84} opacity={0.9} flap speed={2.6} /></span>}
                <span className="wy-ic"><i className={`fa-solid ${f.icon}`} /></span>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ HOW IT WORKS (thread timeline) ═════════ */}
      <section className="tl">
        <div className="container">
          <SectionHead eyebrow="Simple process" title="How It Works" sub="From your pick to your doorstep in four easy steps" />
          <div className="tl-row">
            <span className="tl-bf"><Butterfly size={34} opacity={0.95} flap speed={1.9} /></span>
            {STEPS.map((st, i) => (
              <Reveal key={st.n} i={i} className="tl-node">
                <span className="tl-n">{st.n}</span>
                <h3>{st.t}</h3>
                <p>{st.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ REVIEWS ═════════ */}
      <section className="rv">
        <svg className="rv-wave" viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="rvg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5b21b6" /><stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path d="M0,300 L0,130 C110,20 250,50 350,140 C450,230 600,255 800,300 Z" fill="url(#rvg)" />
        </svg>

        <div className="container">
          <Reveal className="rv-head">
            <h2>What Our<br />Customers <em>Experience?</em></h2>
          </Reveal>

          <div className="rv-stage">
            <button className="rv-arrow left" onClick={prevR} aria-label="Previous review"><i className="fa-solid fa-chevron-left" /></button>

            <AnimatePresence mode="wait">
              <motion.div key={ri} className="rv-card"
                initial={{ opacity: 0, y: 26, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -18, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                <div className="rv-avatar">
                  {rv.photo ? <img src={rv.photo} alt={rv.name} /> : <span>{rv.name[0]}</span>}
                </div>
                <h3 className="rv-name">{rv.name}</h3>
                <p className="rv-role">{rv.place ? `Happy Customer · ${rv.place}` : 'Happy Customer'}</p>

                <div className="rv-inner">
                  <span className="rv-q rv-q-l">“</span>
                  <span className="rv-q rv-q-r">”</span>
                  <div className="rv-box">
                    <div className="rv-box-top">
                      {rv.photo ? <img src={rv.photo} alt="" /> : <span className="rv-mini">{rv.name[0]}</span>}
                      <div><b>{rv.name}</b><small>{rv.place || 'Verified customer'}</small></div>
                      <i className="fa-brands fa-whatsapp rv-wa" />
                    </div>
                    <div className="rv-box-stars">
                      <span>{'★'.repeat(rv.stars)}{'☆'.repeat(5 - rv.stars)}</span><small>Verified purchase</small>
                    </div>
                    <p>{rv.quote}</p>
                  </div>
                </div>

                <div className="rv-pill">
                  {[1, 2, 3, 4, 5].map((n) => <i key={n} className={`fa-solid fa-star ${n <= rv.stars ? '' : 'off'}`} />)}
                </div>
              </motion.div>
            </AnimatePresence>

            <button className="rv-arrow right" onClick={nextR} aria-label="Next review"><i className="fa-solid fa-chevron-right" /></button>
          </div>

          <div className="rv-dots">
            {reviews.slice(0, 8).map((_, i) => <button key={i} className={i === ri ? 'on' : ''} onClick={() => setRIdx(i)} aria-label={`Review ${i + 1}`} />)}
          </div>
          <Reveal className="rv-more"><Link to="/happycustomer" className="hm-btn hm-btn-ghost dark">See all reviews</Link></Reveal>
        </div>
      </section>

      {/* ═════════ CTA ═════════ */}
      <section className="ct">
        <div className="container">
          <Reveal className="ct-panel">
            <span className="ct-bf ct-bf-1"><Butterfly size={78} opacity={0.95} flap speed={2.5} /></span>
            <span className="ct-bf ct-bf-2"><Butterfly size={44} opacity={0.8} rotate={-12} flap speed={2} /></span>
            <span className="ct-tag"><Butterfly size={12} opacity={1} /> Get in touch</span>
            <h2>Ready for your <em>dream outfit?</em></h2>
            <p>Order online or chat with us on WhatsApp for custom designs.</p>
            <div className="hm-cta-row center">
              <Link to="/shop" className="hm-btn hm-btn-gold">Start Shopping</Link>
              <a href="https://wa.me/918144372323" target="_blank" rel="noreferrer" className="hm-btn ct-ghost"><i className="fa-brands fa-whatsapp" /> WhatsApp Us</a>
            </div>
            <div className="ct-trust">
              <span><i className="fa-solid fa-circle-check" /> Custom measurements</span>
              <span><i className="fa-solid fa-circle-check" /> {COD_ENABLED ? 'Cash on Delivery' : 'Secure online payment'}</span>
              <span><i className="fa-solid fa-circle-check" /> 7–10 day delivery</span>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}