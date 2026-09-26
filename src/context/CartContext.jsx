import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, size, quantity) => {
    setCartItems((current) => [...current, { ...product, size, quantity }]);
  };

  const removeFromCart = (index) => {
    setCartItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, cartCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
