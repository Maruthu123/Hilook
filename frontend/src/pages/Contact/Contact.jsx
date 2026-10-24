import React, { useEffect, useRef, useState } from 'react';
import './Contact.css';

/* ─────────────────────────────────────────────
   STORE DETAILS  (same as the footer)
───────────────────────────────────────────── */
const STORE = {
  name: 'HI Look – Nisha Boutique',
  whatsapp: '918144372323',                 // WhatsApp number (country code + number, no +)
  phoneShow: '+91 81443 72323',
  phoneTel: '+918144372323',
  email: 'boutiquehilook965@gmail.com',
  address: ['No.1 LR Complex, Ranga Nagar 4th Cross,', 'Sunder Nagar, KK Nagar, Trichy.'],
  hours: [
    { day: 'Monday – Saturday', time: '08:00 AM – 10:00 PM', open: true },
    { day: 'Sunday', time: 'By Appointment', open: false },
  ],
  instagram: 'https://www.instagram.com/nishaa_hilook/',
  mapQuery: 'LR Complex, Ranga Nagar 4th Cross, Sunder Nagar, KK Nagar, Tiruchirappalli',
};

const SERVICES = [
  'Custom Blouse Stitching',
  'Chudidar / Salwar',
  'Aari Embroidery Work',
  'Bridal Outfit',
  'Gents Tailoring',
  'Alteration / Repair',
  'Order Enquiry',
  'Other Enquiry',
];

/* ─────────────────────────────────────────────
   BUTTERFLY (the PNG used across the website)
───────────────────────────────────────────── */
const Butterfly = ({ className = '', size = 60, style }) => (
  <span className={`ct-butterfly ${className}`} style={{ width: size, ...style }} aria-hidden="true">
    <img src="/image/butterfly.png" alt="" width={size} draggable="false" />
  </span>
);

/* ─────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────── */
const svgProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconLocation = () => (<svg {...svgProps}><path d="M12 21C12 21 5 13.5 5 8.5a7 7 0 1 1 14 0c0 5-7 12.5-7 12.5z" /><circle cx="12" cy="8.5" r="2.5" /></svg>);
const IconPhone = () => (<svg {...svgProps}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>);
const IconMail = () => (<svg {...svgProps}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></svg>);
const IconClock = () => (<svg {...svgProps}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>);
const IconUser = () => (<svg {...svgProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const IconAt = () => (<svg {...svgProps}><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" /></svg>);
const IconChevron = () => (<svg {...svgProps}><path d="M6 9l6 6 6-6" /></svg>);
const IconCheck = () => (<svg {...svgProps} strokeWidth="2.6"><path d="M20 6 9 17l-5-5" /></svg>);
const IconDir = () => (<svg {...svgProps}><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>);
const IconInsta = () => (<svg {...svgProps} strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>);
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const EMPTY = { name: '', phone: '', email: '', service: '', message: '' };

export default function Contact() {
  const rootRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);          // WhatsApp opened
  const [waLink, setWaLink] = useState('');         // fallback link if the browser blocked the pop-up

  const set = (key) => (e) => {
    const value = key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Please enter your name';
    if (!/^\d{10}$/.test(form.phone)) er.phone = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) er.email = 'Enter a valid email address';
    if (!form.service) er.service = 'Please select a service';
    if (!form.message.trim()) er.message = 'Please write your message';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  /* builds the WhatsApp text from ALL the form data */
  const buildMessage = () => [
    `Hello ${STORE.name}! 👋`,
    '',
    '*New enquiry from the website*',
    `👤 *Name:* ${form.name.trim()}`,
    `📞 *Phone:* ${form.phone}`,
    `✉️ *Email:* ${form.email.trim() || '-'}`,
    `🧵 *Service:* ${form.service}`,
    '',
    `💬 *Message:*`,
    form.message.trim(),
  ].join('\n');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const url = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(buildMessage())}`;
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    setWaLink(w ? '' : url);                     // pop-up blocked → show a button instead
    setSent(true);
    setForm(EMPTY);
  };

  /* scroll reveal */
  useEffect(() => {
    const els = rootRef.current ? rootRef.current.querySelectorAll('.ct-reveal') : [];
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('ct-visible')); return undefined; }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('ct-visible'); obs.unobserve(en.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="ct-root" ref={rootRef}>

      {/* ══════════ HERO ══════════ */}
      <section className="ct-hero">
        <div className="ct-hero-glow ct-glow-1" />
        <div className="ct-hero-glow ct-glow-2" />
        <Butterfly className="ct-fly ct-fly-1" size={96} />
        <Butterfly className="ct-fly ct-fly-2" size={58} />
        <Butterfly className="ct-fly ct-fly-3" size={72} />
        <Butterfly className="ct-fly ct-fly-4" size={40} />
        <span className="ct-spark ct-spark-1">✦</span>
        <span className="ct-spark ct-spark-2">✧</span>
        <span className="ct-spark ct-spark-3">✦</span>

        <div className="ct-hero-inner">
          <span className="ct-badge">Reach Us</span>
          <h1 className="ct-hero-title">Let’s <em>Connect</em></h1>
          <div className="ct-rule"><i /></div>
          <p className="ct-hero-sub">
            Custom order, fitting question, or just a hello — send us a message and we’ll reply right on WhatsApp.
          </p>
        </div>
        <svg className="ct-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,30 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* ══════════ BODY ══════════ */}
      <div className="ct-body">
        <Butterfly className="ct-bg-bf ct-bg-bf-1" size={110} />
        <Butterfly className="ct-bg-bf ct-bg-bf-2" size={80} />

        <div className="ct-layout">

          {/* ── LEFT: info ── */}
          <div className="ct-info-panel">
            <h2 className="ct-panel-title ct-reveal">Get in Touch</h2>
            <p className="ct-panel-sub ct-reveal ct-d1">
              Visit our boutique in Trichy or reach us through any channel below. We usually reply within a few hours.
            </p>

            <div className="ct-info-card ct-reveal ct-d1">
              <div className="ct-info-icon"><IconLocation /></div>
              <div className="ct-info-text">
                <h4>Our Store</h4>
                <p>{STORE.address[0]}<br />{STORE.address[1]}</p>
              </div>
            </div>

            <div className="ct-info-card ct-reveal ct-d2">
              <div className="ct-info-icon"><IconPhone /></div>
              <div className="ct-info-text">
                <h4>Phone / WhatsApp</h4>
                <a href={`tel:${STORE.phoneTel}`}>{STORE.phoneShow}</a>
              </div>
            </div>

            <div className="ct-info-card ct-reveal ct-d2">
              <div className="ct-info-icon"><IconMail /></div>
              <div className="ct-info-text">
                <h4>Email</h4>
                <a href={`mailto:${STORE.email}`} className="ct-email">{STORE.email}</a>
              </div>
            </div>

            <div className="ct-info-card ct-reveal ct-d3">
              <div className="ct-info-icon"><IconClock /></div>
              <div className="ct-info-text">
                <h4>Working Hours</h4>
                <div className="ct-hours">
                  {STORE.hours.map((h) => (
                    <div className="ct-hour-row" key={h.day}>
                      <strong>{h.day}</strong>
                      <span className={h.open ? 'ct-hour-open' : ''}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent('Hi! I want to know more about your products.')}`}
              target="_blank" rel="noreferrer"
              className="ct-wa-btn ct-reveal ct-d3"
            >
              <IconWhatsApp /> Chat on WhatsApp
            </a>

            <div className="ct-socials ct-reveal ct-d4">
              <a href={STORE.instagram} target="_blank" rel="noreferrer" className="ct-social" title="Instagram" aria-label="Instagram"><IconInsta /></a>
              <a href={`tel:${STORE.phoneTel}`} className="ct-social" title="Call us" aria-label="Call us"><IconPhone /></a>
              <a href={`mailto:${STORE.email}`} className="ct-social" title="Email us" aria-label="Email us"><IconMail /></a>
              <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer" className="ct-social" title="WhatsApp" aria-label="WhatsApp"><IconWhatsApp /></a>
            </div>
          </div>

          {/* ── RIGHT: form → WhatsApp ── */}
          <div className="ct-form-wrap ct-reveal ct-d1">
            <Butterfly className="ct-form-bf" size={64} />
            <h2 className="ct-form-title">Send a Message</h2>
            <p className="ct-form-sub">Fill in the details and tap send — your message opens in WhatsApp, ready to send to us.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="ct-form-grid">

                <div className={`ct-field ${errors.name ? 'ct-has-err' : ''}`}>
                  <label htmlFor="ct-name">Your Name</label>
                  <div className="ct-input-wrap">
                    <IconUser />
                    <input id="ct-name" type="text" value={form.name} onChange={set('name')} placeholder="Enter your Name" autoComplete="name" />
                  </div>
                  {errors.name && <small className="ct-err">{errors.name}</small>}
                </div>

                <div className={`ct-field ${errors.phone ? 'ct-has-err' : ''}`}>
                  <label htmlFor="ct-phone">Phone Number</label>
                  <div className="ct-input-wrap">
                    <IconPhone />
                    <input id="ct-phone" type="tel" inputMode="numeric" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile number" autoComplete="tel" />
                  </div>
                  {errors.phone && <small className="ct-err">{errors.phone}</small>}
                </div>

                <div className={`ct-field ${errors.email ? 'ct-has-err' : ''}`}>
                  <label htmlFor="ct-email">Email <span className="ct-opt">(optional)</span></label>
                  <div className="ct-input-wrap">
                    <IconAt />
                    <input id="ct-email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
                  </div>
                  {errors.email && <small className="ct-err">{errors.email}</small>}
                </div>

                <div className={`ct-field ${errors.service ? 'ct-has-err' : ''}`}>
                  <label htmlFor="ct-service">Service Needed</label>
                  <div className="ct-select-wrap">
                    <select id="ct-service" value={form.service} onChange={set('service')}>
                      <option value="" disabled>Select a service…</option>
                      {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <IconChevron />
                  </div>
                  {errors.service && <small className="ct-err">{errors.service}</small>}
                </div>

                <div className={`ct-field ct-full ${errors.message ? 'ct-has-err' : ''}`}>
                  <label htmlFor="ct-message">Your Message</label>
                  <textarea id="ct-message" value={form.message} onChange={set('message')} placeholder="Tell us what you need — measurements, design ideas, or any questions…" />
                  {errors.message && <small className="ct-err">{errors.message}</small>}
                </div>
              </div>

              <button type="submit" className="ct-submit">
                <IconWhatsApp />
                <span>Send on WhatsApp</span>
              </button>

              {sent && (
                <div className="ct-success" role="status">
                  <span className="ct-success-ic"><IconCheck /></span>
                  <div>
                    <b>WhatsApp opened!</b>
                    <p>Just tap <b>Send</b> in WhatsApp to deliver your message. 🙏</p>
                    {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="ct-success-link">Open WhatsApp again →</a>}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* ══════════ MAP ══════════ */}
      <section className="ct-map-section">
        <div className="ct-map-inner">
          <div className="ct-map-header ct-reveal">
            <div>
              <span className="ct-map-eyebrow">Our Location</span>
              <h2 className="ct-map-title">Find Us Here</h2>
              <p className="ct-map-addr">{STORE.address.join(' ')}</p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE.mapQuery)}`}
              target="_blank" rel="noreferrer" className="ct-map-dir-btn"
            >
              <IconDir /> Get Directions
            </a>
          </div>

          <div className="ct-map-frame ct-reveal ct-d1">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(STORE.mapQuery)}&z=16&output=embed`}
              width="100%" height="420" style={{ border: 0, display: 'block' }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Nisha Boutique location"
            />
          </div>
        </div>
      </section>
    </div>
  );
} 