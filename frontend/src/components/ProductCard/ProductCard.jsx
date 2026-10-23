import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { modelPath } from '../../utils/categories';
import './ProductCard.css';

export default function ProductCard({ id, name, price, upto, image, category = 'chudidar', badge }) {
  const { addToCart } = useContext(CartContext);
  const { toggle, has } = useContext(WishlistContext);
  const wished = has(id);

  const detailPath = modelPath(category, id);
  const numPrice = parseInt(String(price).replace(/\D/g, ''), 10) || 0;

  const handleQuickAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ id, name, image, price: numPrice, qty: 1, size: '', color: '', addons: [] });
  };

  return (
    <motion.div className="pc"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pc-img-wrap">
        <Link to={detailPath}>
          <img src={image} alt={name} className="pc-img" loading="lazy" />
        </Link>
        {badge && <span className="pc-badge badge badge-gold">{badge}</span>}
        <button
          className={`pc-wish ${wished ? 'pc-wish--on' : ''}`}
          onClick={(e) => { e.preventDefault(); toggle({ id, name, image, price, category }); }}
          aria-label="Wishlist"
        >
          <i className={wished ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
        </button>
        <div className="pc-hover-bar">
          <button className="pc-quick" onClick={handleQuickAdd}>Quick Add</button>
          <Link to={detailPath} className="pc-view">View Details</Link>
        </div>
      </div>
      <div className="pc-info">
        <p className="pc-id">{id}</p>
        <p className="pc-name">{name}</p>
        <div className="pc-price-row">
          <span className="pc-price">{price}</span>
          {upto && <span className="pc-upto">upto {upto}</span>}
        </div>
        <Link to={detailPath} className="pc-book-link">
          <span className="pc-book">Order Now</span>
        </Link>
      </div>
    </motion.div>
  );
}
