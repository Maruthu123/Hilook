import React, { createContext, useState, useEffect, useContext } from 'react';
export const WishlistContext = createContext({});
export const WishlistProvider = ({ children }) => {
  const [list, setList] = useState(() => { try { return JSON.parse(localStorage.getItem('wishlist')) || []; } catch { return []; } });
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(list)); }, [list]);
  const toggle = item => setList(prev => prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]);
  const has = id => list.some(i => i.id === id);
  return <WishlistContext.Provider value={{ list, toggle, has }}>{children}</WishlistContext.Provider>;
};
export const useWishlist = () => useContext(WishlistContext);
