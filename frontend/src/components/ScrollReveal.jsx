import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* Adds a fade-up reveal to common blocks on EVERY page, with no per-page code.
   Elements already animated by framer-motion (.pc cards, home sections) are skipped. */
const SELECTOR = [
  '.sz-card', '.order-card', '.cart-item', '.cart-summary', '.checkout-form-box', '.checkout-summary',
  '.pd-similar-card', '.pd-specs', '.about-card', '.contact-card', '.hc-card',
  '.adm-stat-card', '.reveal-me',
].join(',');

export default function ScrollReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    const scan = () => document.querySelectorAll(SELECTOR).forEach((el, i) => {
      if (el.dataset.rv) return;
      el.dataset.rv = '1';
      el.classList.add('reveal', 'd' + (i % 4));
      io.observe(el);
    });
    const t = setTimeout(scan, 60);
    const mo = new MutationObserver(scan);           // pages that load data later
    mo.observe(document.getElementById('root'), { childList: true, subtree: true });
    return () => { clearTimeout(t); mo.disconnect(); io.disconnect(); };
  }, [pathname]);
  return null;
}
