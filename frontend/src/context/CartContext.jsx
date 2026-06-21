import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('genz_cart') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('genz_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (artwork) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === artwork.id && i.type === artwork.type);
      if (exists) return prev;
      return [...prev, { ...artwork, qty: 1 }];
    });
  };

  const removeItem = (id, type) =>
    setItems(prev => prev.filter(i => !(i.id === id && i.type === type)));

  const updateQty = (id, type, delta) =>
    setItems(prev => prev.map(i =>
      i.id === id && i.type === type
        ? { ...i, qty: Math.max(1, i.qty + delta) }
        : i
    ));

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const count  = items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
