import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

function getBasePrice(product) {
  return Number(String(product?.price ?? "0").replace(/[^0-9.]/g, "")) || 0;
}

function getSalePrice(product) {
  const basePrice = getBasePrice(product);
  const discountValue = Number(product?.discountValue || 0);
  if (!product?.discountEnabled || discountValue <= 0) return basePrice;
  if (product.discountType === "percentage") {
    return Math.max(0, basePrice - (basePrice * discountValue) / 100);
  }
  return Math.max(0, basePrice - discountValue);
}

function normalizeCartProduct(product) {
  const salePrice = Number(product?.salePrice ?? getSalePrice(product));
  const originalPrice = Number(product?.originalPrice ?? getBasePrice(product));
  const selectedImageData = product?.selectedImageData || product?.imageData || "";

  return {
    ...product,
    // Do not keep the full multi-image/base64 gallery in localStorage cart items.
    images: undefined,
    price: `৳${salePrice.toLocaleString()}`,
    salePrice,
    originalPrice,
    selectedImageData,
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem("fx_cart") || "[]"));

  const addToCart = (product, size, quantity) => {
    const normalized = normalizeCartProduct(product);
    setCartItems((current) => {
      const updated = [...current, { ...normalized, size, quantity }];
      localStorage.setItem("fx_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCartItems((current) => {
      const updated = current.filter((_, itemIndex) => itemIndex !== index);
      localStorage.setItem("fx_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const cartCount = cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0);

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
