import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lumora_cart')) || [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('lumora_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, qty: Math.min(item.qty + qty, product.stock) }
            : item
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCartItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, qty } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const itemsPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxPrice = 0;
  const shippingPrice = itemsPrice > 999 ? 0 : 99;
  const totalPrice = Number((itemsPrice + shippingPrice).toFixed(2));

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQty, clearCart,
      itemCount, itemsPrice, taxPrice, shippingPrice, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
