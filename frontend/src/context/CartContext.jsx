import React, { createContext, useState, useEffect, useContext } from 'react';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {

  const [items, setItems] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem('cart'));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const key = (i) => `${i.id}|${i.size}|${i.color}`;

  const addToCart = (item) => {
    setItems((prev) => {
      if (!Array.isArray(prev)) return [item];

      const existing = prev.find((i) => key(i) === key(item));

      if (existing) {
        return prev.map((i) =>
          key(i) === key(item)
            ? { ...i, qty: i.qty + item.qty }
            : i
        );
      }

      return [...prev, item];
    });
  };

  const remove = (id, size, color) => {
    setItems((prev) =>
      Array.isArray(prev)
        ? prev.filter(
            (i) => !(i.id === id && i.size === size && i.color === color)
          )
        : []
    );
  };

  const updateQty = (id, size, color, qty) => {
    if (qty < 1) return;

    setItems((prev) =>
      Array.isArray(prev)
        ? prev.map((i) =>
            i.id === id && i.size === size && i.color === color
              ? { ...i, qty }
              : i
          )
        : []
    );
  };

  const clear = () => setItems([]);

  const count = Array.isArray(items)
    ? items.reduce((sum, i) => sum + (i.qty || 0), 0)
    : 0;

  const total = Array.isArray(items)
    ? items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0)
    : 0;

  return (
    <CartContext.Provider
      value={{ items, addToCart, remove, updateQty, clear, count, total }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);