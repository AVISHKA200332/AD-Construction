import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = React.createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  // Initialize cart from localStorage so navigation or remounts keep the cart
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      // ignore storage errors
    }
  }, [cart]);

  const addToCart = (item, quantity) => {
    setCart(prev => {
      // Determine a stable key: prefer backend _id, fallback to a generated _cartId
      const incomingKey = item._id ?? item.id ?? null;

      // If incoming item has no backend id, try to match by a non-empty unique property (name+price)
      const existing = prev.find(i => {
        const existingKey = i._id ?? i._cartId ?? null;
        if (incomingKey && existingKey) return incomingKey === existingKey;
        // fallback: if neither has backend id, match by name+unitPrice
        if (!incomingKey && !existingKey) return i.name === item.name && Number(i.unitPrice) === Number(item.unitPrice);
        return false;
      });

      if (existing) {
        return prev.map(i => {
          const existingKey = i._id ?? i._cartId ?? null;
          if (incomingKey && existingKey && incomingKey === existingKey) {
            return { ...i, quantity: i.quantity + quantity };
          }
          if (!incomingKey && !existingKey && i.name === item.name && Number(i.unitPrice) === Number(item.unitPrice)) {
            return { ...i, quantity: i.quantity + quantity };
          }
          return i;
        });
      }

      const cartItem = {
        ...item,
        quantity,
        // attach a cart-specific id when backend _id not present
        _cartId: item._id ?? item.id ?? `cart_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      };

      return [...prev, cartItem];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => {
      // allow removing by backend _id or the local _cartId
      return !((i._id && i._id === id) || (i._cartId && i._cartId === id));
    }));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
