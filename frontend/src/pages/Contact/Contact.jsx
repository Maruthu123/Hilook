import React, { useEffect, useRef, useState } from 'react';
import './Contact.css';

/* ─────────────────────────────────────────────
   SVG ICON COMPONENTS  (no Font Awesome needed)
───────────────────────────────────────────── */
const IconLocation = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21C12 21 5 13.5 5 8.5a7 7 0 1 1 14 0c0 5-7 12.5-7 12.5z"/>
    <circle cx="12" cy="8.5" r="2.5"/>
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="#fff">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 11 13"/>
    <path d="M22 2 15 22 11 13 2 9l20-7z"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconAt = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
  </svg>
);

const IconInsta = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
  </svg>
);

const IconFB = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const IconDir = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Contact() {
  const rootRef = useRef(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 900);
  };

  /* scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('ct-visible'); }),
      { threshold: 0.08 }
    );
    rootRef.current?.querySelectorAll('.ct-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="ct-root" ref={rootRef}>

      {/* ══════════ HERO ══════════ */}
      <section className="ct-hero">
        <div className="ct-hero-bg" />
        <div className="ct-hero-rings" />
        <div className="ct-orb ct-orb-1" />
        <div className="ct-orb ct-orb-2" />
        <div className="ct-hero-inner">
          <div className="ct-hero-badge">Reach Us</div>
          <h1 className="ct-hero-title">Let's <em>Connect</em></h1>
          <div className="ct-hero-rule" />
          <p className="ct-hero-sub">
            We'd love to hear from you. Whether it's a custom order, a fitting question,
            or just a hello — we're here for you.
          </p>
        </div>
      </section>

      {/* ══════════ BODY ══════════ */}
      <div className="ct-body">
        <div className="ct-layout">

          {/* ── LEFT: Info Panel ── */}
          <div className="ct-info-panel">
            <h2 className="ct-panel-title ct-reveal">Get in Touch</h2>
            <p className="ct-panel-sub ct-reveal ct-d1">
              Visit us in Rajapalayam or reach out through any of the channels below.
              We typically respond within a few hours.
            </p>

            {/* Location */}
            <div className="ct-info-card ct-reveal ct-d1">
              <div className="ct-info-icon"><IconLocation /></div>
              <div className="ct-info-text">
                <h4>Our Store</h4>
                <p>Rajapalayam, Virudhunagar District<br />Tamil Nadu — 626 117</p>
              </div>
            </div>

            {/* Phone */}
            <div className="ct-info-card ct-reveal ct-d2">
              <div className="ct-info-icon"><IconPhone /></div>
              <div className="ct-info-text">
                <h4>Phone / WhatsApp</h4>
                <a href="tel:+918144372323">+91 8144 372 323</a>
              </div>
            </div>

            {/* Email */}
            <div className="ct-info-card ct-reveal ct-d2">
              <div className="ct-info-icon"><IconMail /></div>
              <div className="ct-info-text">
                <h4>Email</h4>
                <a href="mailto:nishab@gmail.com">nishab@gmail.com</a>
              </div>
            </div>

            {/* Hours */}
            <div className="ct-info-card ct-reveal ct-d3">
              <div className="ct-info-icon"><IconClock /></div>
              <div className="ct-info-text">
                <h4>Working Hours</h4>
                <div className="ct-hours">
                  <div className="ct-hour-row">
                    <strong>Mon – Sat</strong>
                    <span className="ct-hour-open">09:00 AM – 10:00 PM</span>
                  </div>
                  <div className="ct-hour-row">
                    <strong>Sunday</strong>
                    <span>By Appointment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/918144372323?text=Hi! I want to know more about your products."
              target="_blank" rel="noreferrer"
              className="ct-wa-btn ct-reveal ct-d3"
            >
              <IconWhatsApp />
              Chat on WhatsApp
            </a>

            {/* Social links */}
            <div className="ct-socials ct-reveal ct-d4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="ct-social-link" title="Instagram" style={{color:'#e1306c',stroke:'#e1306c'}}>
                <IconInsta />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="ct-social-link" title="Facebook" style={{color:'#1877f2',stroke:'#1877f2'}}>
                <IconFB />
              </a>
              <a href="tel:+918144372323" className="ct-social-link" title="Call us" style={{color:'var(--blue-mid)',stroke:'var(--blue-mid)'}}>
                <IconPhone />
              </a>
              <a href="mailto:nishab@gmail.com" className="ct-social-link" title="Email us" style={{color:'var(--blue-mid)',stroke:'var(--blue-mid)'}}>
                <IconMail />
              </a>
            </div>
          </div>

          {/* ── RIGHT: Form ── */}
          <div className="ct-form-wrap ct-reveal ct-d1">
            <h2 className="ct-form-title">Send a Message</h2>
            <p className="ct-form-sub">Fill in the form below and we'll get back to you within 24 hours.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="ct-form-grid">

                {/* Name */}
                <div className="ct-field">
                  <label>Your Name</label>
                  <div className="ct-input-wrap">
                    <IconUser />
                    <input
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Priya Lakshmi"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="ct-field">
                  <label>Email Address</label>
                  <div className="ct-input-wrap">
                    <IconAt />
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="ct-field">
                  <label>Phone Number</label>
                  <div className="ct-input-wrap">
                    <IconPhone />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="ct-field">
                  <label>Service Needed</label>
                  <div className="ct-select-wrap">
                    <select value={form.subject} onChange={set('subject')} required>
                      <option value="" disabled>Select a service…</option>
                      <option value="Custom Blouse">Custom Blouse Stitching</option>
                      <option value="Chudidar">Chudidar / Salwar</option>
                      <option value="Aari Work">Aari Embroidery Work</option>
                      <option value="Bridal">Bridal Outfit</option>
                      <option value="Gents Wear">Gents Tailoring</option>
                      <option value="Alteration">Alteration / Repair</option>
                      <option value="Other">Other Enquiry</option>
                    </select>
                    <IconChevron />
                  </div>
                </div>

                {/* Message */}
                <div className="ct-field ct-full">
                  <label>Your Message</label>
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Tell us what you need — measurements, design ideas, or any questions you have..."
                    required
                  />
                </div>

              </div>

              <button type="submit" className="ct-submit" disabled={loading}>
                {loading
                  ? <><span>Sending…</span></>
                  : <><span>Send Message</span><IconSend /></>
                }
              </button>

              {submitted && (
                <div className="ct-success">
                  <IconCheck />
                  <span>Thank you! We'll get back to you within 24 hours. 🙏</span>
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
            <div className="ct-map-header-left">
              <span className="ct-map-eyebrow">Our Location</span>
              <h2 className="ct-map-title">Find Us Here</h2>
              <p className="ct-map-addr">
                Rajapalayam, Virudhunagar District, Tamil Nadu — 626 117
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Rajapalayam,Tamil+Nadu"
              target="_blank" rel="noreferrer"
              className="ct-map-dir-btn"
            >
              <IconDir />
              Get Directions
            </a>
          </div>

          <div className="ct-map-frame ct-reveal ct-d1">
            <iframe
              src="https://maps.google.com/maps?q=Rajapalayam,Tamil+Nadu&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%" height="420"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Nisha Boutique Location"
            />
          </div>
        </div>
      </section>

    </div>
  );
}