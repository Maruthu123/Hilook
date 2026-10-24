import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './About.css';

/* ── Edit your details here ───────────────────────────── */
const STORE = {
  address: 'No.1 LR Complex, Ranga Nagar 4th Cross, Sunder Nagar, KK Nagar, Trichy.',
  hours: 'Mon – Sat · 8 AM – 10 PM',
  phone: '+91 81443 72323',
  email: 'boutiquehilook965@gmail.com',
};

const VALUES = [
  { icon: '✂️', title: 'Handcrafted',     desc: 'Every stitch laid by skilled artisans devoted to the craft.' },
  { icon: '💎', title: 'Premium Fabrics', desc: 'Finest fabrics from trusted suppliers across Tamil Nadu and India.' },
  { icon: '📏', title: 'Perfect Fit',     desc: 'Custom measurements for a flawless tailor-made fit every time.' },
  { icon: '🤝', title: 'Customer First',  desc: 'Your satisfaction is our foundation and promise — always.' },
];

/* photos are in  public/image/about/  – change name / role here */
const TEAM = [
  { photo: '/image/about/emp1.jpg', name: 'Priya S',   role: 'Lead Tailor – Ladies' },
  { photo: '/image/about/emp2.jpg', name: 'Rajan K',   role: 'Master Tailor – Gents' },
  { photo: '/image/about/emp3.jpg', name: 'Deepa V',   role: 'Blouse Specialist' },
  { photo: '/image/about/emp4.jpg', name: 'Meena T',   role: 'Aari Work' },
];

export default function About() {
  const root = useRef(null);

  /* scroll reveal */
  useEffect(() => {
    const els = root.current ? root.current.querySelectorAll('.ab-reveal') : [];
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('ab-in')); return undefined; }
    const io = new IntersectionObserver(
      (list) => list.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('ab-in'); io.unobserve(x.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <div className="ab-root" ref={root}>

      {/* HERO */}
      <section className="ab-hero">
        <img className="ab-bf ab-bf-1" src="/image/butterfly.png" alt="" />
        <img className="ab-bf ab-bf-2" src="/image/butterfly.png" alt="" />
        <div className="ab-hero-in">
          <span className="ab-tag">Our Story</span>
          <h1>Nisha <em>Boutique</em></h1>
          <p>Handcrafting exquisite Indian fashion from the heart of Trichy, Tamil Nadu — since 2015.
             Every thread we weave carries a story of artistry, culture, and love.</p>
          <div className="ab-btns">
            <a href="#team" className="ab-btn ab-btn-light">Meet the Team</a>
            <Link to="/contact" className="ab-btn ab-btn-line">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* OWNER */}
      <section className="ab-sec">
        <div className="ab-owner ab-wrap">
          <div className="ab-owner-photo ab-reveal">
            <img src="/image/about/ower.jpg" alt="Nishaa – Founder" />
          </div>
          <div className="ab-owner-text ab-reveal">
            <span className="ab-tag ab-tag-dark">Founder &amp; Owner</span>
            <h2>Nishaa</h2>
            <p className="ab-role">Founder · Head Designer · Master Tailor</p>
            <p>Nishaa founded Nisha Boutique in 2015 with one clear vision — to celebrate the richness of Indian fashion through handcrafted tailoring. With over <b>10 years of hands-on experience</b>, she turned a humble dream into Trichy’s most trusted boutique.</p>
            <p>From embroidered Aari blouses to elegant Chudidars and bridal lehengas, every piece reflects respect for tradition and a sharp eye for modern design.</p>
            <blockquote>“Fashion is not just clothing — it is the language of culture, identity, and artistry.”</blockquote>
            <div className="ab-stats">
              <div><b>500+</b><span>Happy Clients</span></div>
              <div><b>10+</b><span>Years</span></div>
              <div><b>2015</b><span>Founded</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP INFO */}
      <section className="ab-shop">
        <div className="ab-wrap ab-reveal">
          <div className="ab-head"><span className="ab-tag ab-tag-dark">Visit Us</span><h2>Our Boutique</h2></div>
          <div className="ab-info">
            <div><i>📍</i><b>Location</b><span>{STORE.address}</span></div>
            <div><i>⏰</i><b>Working Hours</b><span>{STORE.hours}</span></div>
            <div><i>📞</i><b>Phone / WhatsApp</b><a href="tel:+918144372323">{STORE.phone}</a></div>
            <div><i>✉️</i><b>Email</b><a href={`mailto:${STORE.email}`}>{STORE.email}</a></div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="ab-sec ab-values">
        <div className="ab-wrap">
          <div className="ab-head ab-reveal"><span className="ab-tag ab-tag-dark">Our Promise</span><h2>Why Nisha Boutique?</h2></div>
          <div className="ab-grid-4">
            {VALUES.map((v) => (
              <div className="ab-card ab-reveal" key={v.title}>
                <div className="ab-ic">{v.icon}</div><h3>{v.title}</h3><p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="ab-sec" id="team">
        <div className="ab-wrap">
          <div className="ab-head ab-reveal"><span className="ab-tag ab-tag-dark">Our People</span><h2>Meet Our Team</h2></div>
          <div className="ab-team-photo ab-reveal"><img src="/image/about/team.jpg" alt="Nisha Boutique team" /></div>
          <div className="ab-grid-4">
            {TEAM.map((m) => (
              <div className="ab-member ab-reveal" key={m.name}>
                <img src={m.photo} alt={m.name} />
                <h3>{m.name}</h3><span>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}