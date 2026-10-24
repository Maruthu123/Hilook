import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HappyCustomer.css';
   
/**
 * Happy Customers — standalone page
 * Photo-first "boutique wall" — a masonry gallery of real customer photos.
 * Quote/name reveals on hover so photos stay the hero.
 * Replace `photo` with your real customer images (product-worn shots work best).
 */

const Butterfly = ({ size = 40, opacity = 0.5, color = '#7c3aed', rotate = 0 }) => {
  const getFilter = (c) => {
    if (c === '#fff' || c === 'white') return 'brightness(0) invert(1)';
    if (['#c4b5fd', '#e9d5ff', '#a78bfa'].includes(c)) return 'hue-rotate(260deg) saturate(0.5) brightness(1.4)';
    return 'none';
  };
  return (
    <img
      src="/butterfly.svg"
      alt=""
      width={size}
      height={size * 0.67}
      style={{ opacity, transform: `rotate(${rotate}deg)`, filter: getFilter(color), objectFit: 'contain', pointerEvents: 'none', userSelect: 'none', display: 'block' }}
    />
  );
};   

const CUSTOMERS = [
  { photo: '/image/customers/customers1.jpg', name: 'Divya R.',  place: 'Coimbatore', quote: 'Fit perfect ah irundhuchu, wore it for my sister\u2019s wedding!', stars: 5, span: 'tall' },
  { photo: '/image/customers/customers2.jpeg', name: 'Meera S.',  place: 'Chennai',    quote: 'Fabric quality super, delivery vera level fast.',            stars: 5, span: 'regular' },
  { photo: '/image/customers/customers3.jpeg', name: 'Priya K.',  place: 'Madurai',    quote: 'Silk saree correct ah irundhuchu, no regrets!',              stars: 4, span: 'regular' },
  { photo: '/image/customers/customers4.jpg', name: 'Anitha V.', place: 'Salem',      quote: 'Custom blouse stitching, measurements dead-on accurate.',    stars: 5, span: 'regular' },
  { photo: '/image/customers/customers5.jpeg', name: 'Kavya M.',  place: 'Trichy',     quote: 'Packaging special ah irundhuchu, real care felt.',           stars: 5, span: 'tall' },
  { photo: '/image/customers/customers6.jpeg', name: 'Swetha N.', place: 'Erode',      quote: 'Designs vera level, market la kidaikaadha patterns.',        stars: 4, span: 'regular' },
  { photo: '/image/customers/customers7.jpeg', name: 'Revathi P.',place: 'Salem',      quote: 'Lehenga stunning ah irundhuchu, exact like the photo.',      stars: 5, span: 'regular' },
  { photo: '/image/customers/customers8.jpeg', name: 'Lakshmi T.',place: 'Erode',      quote: 'Chudidar fit and color spot-on, ordering again soon.',       stars: 5, span: 'regular' },
];

function PhotoCard({ c }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className={`hc-card hc-${c.span}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img src={c.photo} alt={`${c.name}, happy customer from ${c.place}`} loading="lazy" />
      <div className={`hc-overlay ${hover ? 'show' : ''}`}>
        <div className="hc-stars">{'\u2605'.repeat(c.stars)}{'\u2606'.repeat(5 - c.stars)}</div>
        <p className="hc-quote">&ldquo;{c.quote}&rdquo;</p>
        <div className="hc-name">{c.name}</div>
        <div className="hc-place">{c.place}</div>
      </div>
      <span className="hc-verified">Verified</span>
    </div>
  );
}

export default function HappyCustomers() {
  return (
    <div className="hc-page">

      {/* ── HERO ── */}
      <section className="hc-hero">
        <div className="hc-hero-bf hc-bf-1"><Butterfly size={70} opacity={0.15} color="#7c3aed" /></div>
        <div className="hc-hero-bf hc-bf-2"><Butterfly size={40} opacity={0.2} color="#c9a84c" /></div>
        <div className="container hc-hero-inner">
          <span className="eyebrow-tag">
            <Butterfly size={13} opacity={1} color="#7c3aed" />
            Real Customers
          </span>
          <h1 className="hc-title">Faces Behind<br /><em>Every Stitch</em></h1>
          <p className="hc-sub">
            Every outfit we send out finds a home in someone's favourite memory.
            Here's the boutique wall &mdash; our customers, in what they wore.
          </p>
        </div>
      </section>

      {/* ── PHOTO WALL ── */}
      <section className="hc-wall-section">
        <div className="container">
          <div className="hc-wall">
            {CUSTOMERS.map((c, i) => (
              <PhotoCard c={c} key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hc-cta-section">
        <div className="hc-cta-bf hc-cta-bf-1"><Butterfly size={80} opacity={0.08} color="#fff" /></div>
        <div className="hc-cta-bf hc-cta-bf-2"><Butterfly size={50} opacity={0.06} color="#e9d5ff" /></div>
        <div className="container hc-cta-inner">
          <h2 className="hc-cta-title">Your Photo Could Be <em>Next Here</em></h2>
          <p className="hc-cta-sub">Share your look with us on WhatsApp after your order arrives &mdash; we'd love to feature you.</p>
          <div className="hc-cta-actions">
            <a href="https://wa.me/918144372323" target="_blank" rel="noreferrer" className="hc-wa-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              Share on WhatsApp
            </a>
            <Link to="/shop" className="hc-outline-btn">Shop the Collection</Link>
          </div>
        </div>
      </section>
    </div>
  );
}