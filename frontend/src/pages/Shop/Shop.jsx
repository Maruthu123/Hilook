import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CategoriesSidebar from '../../components/CategoriesSidebar/CategoriesSidebar';
import ProductCard from '../../components/ProductCard/ProductCard';
import { API_URL } from '../../api';
import './Shop.css';

const ALL_CATS = ['All', 'Blouses', 'Chudidars', 'Frocks', 'Lehengas', 'Party Wear', 'Handbags', 'Slippers', 'Watches', "Men's Shirts", "Men's Kurta", "Men's Pants"];
const SORTS = [{ v: 'default', l: 'Default' }, { v: 'low', l: '↑ Price' }, { v: 'high', l: '↓ Price' }];

export default function Shop() {
  const location = useLocation();
  const urlSearch = new URLSearchParams(location.search).get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState(urlSearch);
  const [view, setView] = useState('grid');
  const [cat, setCat] = useState('All');

  useEffect(() => { setSearch(urlSearch); }, [urlSearch]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError('');
      try {
        const catParam = cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : '';
        const res = await fetch(`${API_URL}/api/products?limit=300${catParam}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (alive) setProducts((data.products || []).filter((p) => p.isAvailable !== false));
      } catch {
        if (alive) { setProducts([]); setError('Could not load products. Please check your connection and try again.'); }
      }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [cat]);

  const q = search.toLowerCase().trim();
  const filtered = products.filter((p) => !q || p.name?.toLowerCase().includes(q) || p.productId?.toLowerCase().includes(q));
  const sorted = [...filtered].sort((a, b) => (sort === 'low' ? a.minPrice - b.minPrice : sort === 'high' ? b.minPrice - a.minPrice : 0));

  const toCard = (p) => ({
    id: p.productId, name: p.name, price: `₹${(p.minPrice || 0).toLocaleString()}`,
    upto: p.maxPrice > p.minPrice ? `₹${p.maxPrice.toLocaleString()}` : undefined,
    image: p.images?.[0] || '', badge: p.badge, category: p.category,
  });

  return (
    <div className="shop-page">
      <div className="shop-layout">
        <CategoriesSidebar />
        <main className="shop-main">

          <motion.div className="toolbar" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
            <div className="toolbar-top">
              <div className="toolbar-left">
                <h1>{cat === 'All' ? 'Shop All' : cat} <span className="toolbar-badge">{loading ? '…' : sorted.length}</span></h1>
              </div>
              <div className="search-wrap">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="6" /><line x1="13.5" y1="13.5" x2="18" y2="18" /></svg>
                <input className="shop-search" placeholder="Search designs..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="toolbar-bottom">
              <p className="toolbar-count">{loading ? 'Loading…' : `Showing ${sorted.length} design${sorted.length !== 1 ? 's' : ''}`}</p>
              <div className="toolbar-controls">
                <div className="sort-pills">
                  {SORTS.map((o) => <button key={o.v} className={`sort-pill${sort === o.v ? ' on' : ''}`} onClick={() => setSort(o.v)}>{o.l}</button>)}
                </div>
                <div className="view-chips">
                  <button className={`view-chip${view === 'grid' ? ' on' : ''}`} onClick={() => setView('grid')} aria-label="Grid view">
                    <svg viewBox="0 0 20 20" fill="none" strokeWidth="2"><rect x="2" y="2" width="6" height="6" /><rect x="12" y="2" width="6" height="6" /><rect x="2" y="12" width="6" height="6" /><rect x="12" y="12" width="6" height="6" /></svg>
                  </button>
                  <button className={`view-chip${view === 'list' ? ' on' : ''}`} onClick={() => setView('list')} aria-label="List view">
                    <svg viewBox="0 0 20 20" fill="none" strokeWidth="2"><line x1="3" y1="5" x2="17" y2="5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="15" x2="17" y2="15" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="shop-cat-tabs">
            {ALL_CATS.map((c) => (
              <button key={c} className={`shop-cat-tab ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>

          {loading && (
            <div className="cat-loading">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="cat-skeleton"><div className="cat-skeleton-img" /><div className="cat-skeleton-line" /><div className="cat-skeleton-line short" /></div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="cat-error"><p>{error}</p><button className="cat-retry-btn" onClick={() => setCat((c) => c)}>Retry</button></div>
          )}

          {!loading && !error && (
            <AnimatePresence mode="popLayout">
              <div className={`prod-grid-shop ${view === 'list' ? 'list' : ''}`}>
                {sorted.map((p) => <ProductCard key={p._id} {...toCard(p)} />)}
              </div>
            </AnimatePresence>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className="empty"><p>{search ? 'No products found. Try a different search.' : 'No products in this category yet.'}</p></div>
          )}
        </main>
      </div>
    </div>
  );
}
