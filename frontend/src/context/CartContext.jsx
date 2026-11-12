import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('medi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('medi_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (medicine, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.medicine._id === medicine._id);
      if (existing) {
        const newQty = Math.min(
          existing.quantity + quantity,
          medicine.totalStock || 99
        );
        return prev.map((item) =>
          item.medicine._id === medicine._id
            ? { ...item, quantity: newQty }
            : item
        );
      } else {
        return [...prev, { medicine, quantity: Math.min(quantity, medicine.totalStock || 1) }];
      }
    });
  };

  const updateQuantity = (medicineId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.medicine._id === medicineId) {
          const validQty = Math.min(quantity, item.medicine.totalStock || 99);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (medicineId) => {
    setCart((prev) => prev.filter((item) => item.medicine._id !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('medi_cart');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.medicine.price * item.quantity,
    0
  );
  const prescriptionNeeded = cart.some(
    (item) => item.medicine.prescriptionRequired
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal: Math.round(subtotal * 100) / 100,
        prescriptionNeeded
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

