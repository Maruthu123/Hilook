import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';
import CategoriesSidebar from '../../components/CategoriesSidebar/CategoriesSidebar';
import ProductCard from '../../components/ProductCard/ProductCard';
import '../Shop/Shop.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ✅ Ngrok warning bypass — எல்லா fetch-லயும் இந்த header போகும்
const FETCH_OPTS = {
  headers: { 'ngrok-skip-browser-warning': 'true' },
};

export default function CategoryPage({ title, categoryName, productCategory }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [sort,     setSort]     = useState('default');
  const [search,   setSearch]   = useState('');
  const [view,     setView]     = useState('grid');

  useEffect(() => {
    AOS.init({ duration: 500, once: true });
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName]);

  async function fetchProducts() {
    setLoading(true);
    setError('');
    try {
      const url = `${API_URL}/api/products?category=${encodeURIComponent(categoryName)}&limit=100`;
      const res = await fetch(url, FETCH_OPTS); // ✅ header add ஆச்சு
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      const available = (data.products || []).filter(p => p.isAvailable !== false);
      setProducts(available);
    } catch (err) {
      setError('Could not load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return !q ||
      p.name?.toLowerCase().includes(q) ||
      p.productId?.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'low')  return (a.minPrice || 0) - (b.minPrice || 0);
    if (sort === 'high') return (b.minPrice || 0) - (a.minPrice || 0);
    return 0;
  });

  function toCardProps(p) {
    return {
      id:       p.productId,
      name:     p.name,
      price:    `₹${(p.minPrice || 0).toLocaleString()}`,
      upto:     p.maxPrice ? `₹${p.maxPrice.toLocaleString()}` : undefined,
      image:    p.images?.[0] || '',
      badge:    p.badge,
      category: productCategory || categoryName,
    };
  }

  const SORT_OPTIONS = [
    { value: 'default', label: 'Default' },
    { value: 'low',     label: '↑ Price' },
    { value: 'high',    label: '↓ Price' },
  ];

  return (
    <div className="shop-page">
      <div className="shop-layout">
        <CategoriesSidebar />
        <main className="shop-main">

          {/* Toolbar */}
          <div className="toolbar">

            {/* Top row: title + search */}
            <div className="toolbar-top" data-aos="fade-down">
              <div className="toolbar-left">
                <h1>{title} <span className="toolbar-badge">{loading ? '...' : sorted.length}</span></h1>
              </div>
              <div className="search-wrap">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="9" r="6"/>
                  <line x1="13.5" y1="13.5" x2="18" y2="18"/>
                </svg>
                <input
                  className="shop-search"
                  placeholder="Search designs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Bottom row: count + sort + view */}
            <div className="toolbar-bottom" data-aos="fade-down">
              <p className="toolbar-count">
                {loading ? 'Loading...' : `Showing ${sorted.length} design${sorted.length !== 1 ? 's' : ''}`}
              </p>
              <div className="toolbar-controls">

                {/* Sort pills */}
                <div className="sort-pills">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`sort-pill${sort === opt.value ? ' on' : ''}`}
                      onClick={() => setSort(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* View toggle */}
                <div className="view-chips">
                  <button
                    className={`view-chip${view === 'grid' ? ' on' : ''}`}
                    onClick={() => setView('grid')}
                    title="Grid view"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="1" y="1" width="6" height="6" rx="1"/>
                      <rect x="9" y="1" width="6" height="6" rx="1"/>
                      <rect x="1" y="9" width="6" height="6" rx="1"/>
                      <rect x="9" y="9" width="6" height="6" rx="1"/>
                    </svg>
                  </button>
                  <button
                    className={`view-chip${view === 'list' ? ' on' : ''}`}
                    onClick={() => setView('list')}
                    title="List view"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <line x1="1" y1="4"  x2="15" y2="4"/>
                      <line x1="1" y1="8"  x2="15" y2="8"/>
                      <line x1="1" y1="12" x2="15" y2="12"/>
                    </svg>
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="cat-loading">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="cat-skeleton">
                  <div className="cat-skeleton-img" />
                  <div className="cat-skeleton-line" />
                  <div className="cat-skeleton-line short" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="cat-error">
              <p>⚠️ {error}</p>
              <button onClick={fetchProducts} className="cat-retry-btn">Try Again</button>
            </div>
          )}

          {/* Products grid */}
          {!loading && !error && (
            <div className={`prod-grid-shop ${view === 'list' ? 'list' : ''}`}>
              {sorted.map((p, i) => (
                <motion.div
                  key={p._id}
                  data-aos="fade-up"
                  data-aos-delay={i * 40}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                >
                  {/* ✅ Click navigates to product detail page */}
                  <Link
                    to={`/${(productCategory || categoryName).toLowerCase()}/${p.productId}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    <ProductCard {...toCardProps(p)} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && sorted.length === 0 && (
            <div className="empty">
              <p>{search ? 'No results found for your search.' : 'No products available in this category yet.'}</p>
              {search && (
                <button onClick={() => setSearch('')} className="cat-retry-btn" style={{ marginTop: 12 }}>
                  Clear Search
                </button>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}