import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext }     from '../../context/CartContext';
import { AuthContext }     from '../../context/AuthContext';
import { WishlistContext } from '../../context/WishlistContext';
import './Navbar.css';

/* ─────────────────────────────────────
   INLINE SVG ICONS  (no Font Awesome)
───────────────────────────────────── */
const IcoBars = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const IcoX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
);

const IcoSearch = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IcoHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IcoBag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IcoUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IcoChevDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IcoWhatsApp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const IcoSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const IcoLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IcoOrders = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

/* ─────────────────────────────────────
   CATEGORY DATA
───────────────────────────────────── */
const CATS = [
  { label:'Chudidars',       path:'/chudidars',       emoji:'👗' },
  { label:'Blouses',         path:'/blouses',         emoji:'👚' },
  { label:'Frocks',          path:'/frocks',          emoji:'🩱' },
  { label:'Lehengas',        path:'/lehengas',        emoji:'🥻' },
  { label:'Party Wear',      path:'/party',           emoji:'✨' },
  { label:'Handbags',        path:'/handbag',         emoji:'👜' },
  { label:'Slippers',        path:'/slipper',         emoji:'🩴' },
  { label:'Watches',         path:'/watch',           emoji:'⌚' },
  { label:'School Uniform', path:'/schooluniform', emoji:'🏫' },
  { label:"Men's",           path:'/mens',            emoji:'👔' },
];

/* ═════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════ */
export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [catOpen,    setCatOpen]    = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query,      setQuery]      = useState('');

  const { count }        = useContext(CartContext);
  const { list }         = useContext(WishlistContext);
  const { user, logout } = useContext(AuthContext);
  const { pathname }     = useLocation();
  const navigate         = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setCatOpen(false);
    setUserOpen(false);
  }, [pathname]);

  const handleSearch = e => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query)}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <>
      <nav className={`nb ${scrolled ? 'nb--scrolled' : ''}`}>

        {/* ── Top bar ── */}
        <div className="nb-top">
          <p>
            Free shipping on orders above ₹1,499 &nbsp;|&nbsp; Custom stitching available &nbsp;|&nbsp;
            <a href="https://wa.me/918144372323">
              <IcoWhatsApp /> +91 8144 372 323
            </a>
          </p>
        </div>

        {/* ── Main bar ── */}
        <div className="nb-main container">

          {/* LEFT */}
          <div className="nb-left">

            {/* ☰ Hamburger — mobile only */}
            <button
              className="nb-icon nb-hamburger mobile-only"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <IcoBars />
            </button>

            {/* Categories dropdown — desktop only */}
            <div className="nb-cat-wrap desk-only"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className="nb-link">
                Categories <IcoChevDown />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div className="nb-dropdown"
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, y:8 }} transition={{ duration:0.16 }}>
                    {CATS.map(c => (
                      <Link key={c.path} to={c.path} className="nb-dropdown-item">
                        <span>{c.emoji}</span> {c.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/shop"       className="nb-link desk-only">Shop</Link>
            <Link to="/size-chart" className="nb-link desk-only">Size Chart</Link>
            <Link to="/happycustomer" className="nb-link desk-only"> Happy Customer</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="nb-link nb-admin-link desk-only">
                <IcoSettings /> Dashboard
              </Link>
            )}
          </div>

       {/* CENTER — Boutique Name */}
<Link to="/" className="nb-logo">
  <span className="nb-logo-text">HI Look Nisha Boutique</span>
</Link>

          {/* RIGHT */}
          <div className="nb-right">

            {/* Search */}
            <button className="nb-icon" onClick={() => setSearchOpen(s => !s)} aria-label="Search">
              <IcoSearch />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="nb-icon nb-icon--rel" aria-label="Wishlist">
              <IcoHeart />
              {list.length > 0 && <span className="nb-badge">{list.length}</span>}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="nb-icon nb-icon--rel" aria-label="Cart">
              <IcoBag />
              {count > 0 && <span className="nb-badge">{count}</span>}
            </Link>

            {/* User / Login */}
            {user ? (
              <div className="nb-user-wrap"
                onMouseEnter={() => setUserOpen(true)}
                onMouseLeave={() => setUserOpen(false)}
              >
                <button className="nb-icon nb-icon--user">
                  <IcoUser />
                  <span className="nb-user-name desk-only">
                    {user.name?.split(' ')[0] || 'Account'}
                  </span>
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div className="nb-dropdown nb-dropdown--right"
                      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                      <Link to="/account"  className="nb-dropdown-item"><IcoUser />    My Account</Link>
                      <Link to="/orders"   className="nb-dropdown-item"><IcoOrders />  Track Orders</Link>
                      <Link to="/wishlist" className="nb-dropdown-item"><IcoHeart />   Wishlist</Link>
                      {user.role === 'admin' && <Link to="/admin" className="nb-dropdown-item nb-dropdown-admin"><IcoSettings /> Admin Panel</Link>}
                      <button onClick={logout} className="nb-dropdown-item nb-logout"><IcoLogout /> Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="nb-login-btn desk-only">Login</Link>
            )}
          </div>
        </div>

        {/* ── Search bar ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div className="nb-search-bar"
              initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
              exit={{ height:0, opacity:0 }}>
              <form onSubmit={handleSearch} className="nb-search-form container">
                <IcoSearch />
                <input
                  type="text"
                  placeholder="Search designs, categories..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit">Search</button>
                <button type="button" onClick={() => setSearchOpen(false)} className="nb-search-close">
                  <IcoX />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div className="nb-overlay" onClick={() => setDrawerOpen(false)}
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} />

            <motion.aside className="nb-drawer"
              initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }}
              transition={{ type:'tween', duration:0.28 }}>

              <div className="nb-drawer-top">
                <span className="nb-drawer-brand">Nisha Boutique</span>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close"><IcoX /></button>
              </div>

              <div className="nb-drawer-body">
                <Link to="/"     className="nb-drawer-link">🏠 Home</Link>
                <Link to="/shop" className="nb-drawer-link">🛍️ Shop All</Link>

                <div className="nb-drawer-divider">Categories</div>
                {CATS.map(c => (
                  <Link key={c.path} to={c.path} className="nb-drawer-link nb-drawer-link--sub">
                    {c.emoji} {c.label}
                  </Link>
                ))}

                <div className="nb-drawer-divider">Account</div>
                {user ? (
                  <>
                    <Link to="/account"  className="nb-drawer-link"><span>👤</span> My Account</Link>
                    <Link to="/orders"   className="nb-drawer-link"><span>📦</span> My Orders</Link>
                    <Link to="/wishlist" className="nb-drawer-link"><span>❤️</span> Wishlist</Link>
                    <button onClick={logout} className="nb-drawer-link nb-drawer-logout">
                      <span>🚪</span> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="nb-drawer-link">🔐 Login / Sign Up</Link>
                )}

                <div className="nb-drawer-divider">More</div>
                <Link to="/size-chart" className="nb-drawer-link">📏 Size Chart</Link>
                <Link to="/happycustomer" className="nb-drawer-link">😊 Happy Customer</Link>
                <Link to="/contact"    className="nb-drawer-link">📞 Contact Us</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nb-drawer-link nb-drawer-admin">
                    <IcoSettings /> Admin Panel
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}