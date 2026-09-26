import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem("fx_cart") || "[]"));

  const addToCart = (product, size, quantity) => {
    setCartItems((current) => { const updated = [...current, { ...product, size, quantity }]; localStorage.setItem("fx_cart", JSON.stringify(updated)); return updated; });
  };

  const removeFromCart = (index) => {
    setCartItems((current) => { const updated = current.filter((_, itemIndex) => itemIndex !== index); localStorage.setItem("fx_cart", JSON.stringify(updated)); return updated; });
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const clearCart = () => { setCartItems([]); localStorage.removeItem("fx_cart"); };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, cartCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
