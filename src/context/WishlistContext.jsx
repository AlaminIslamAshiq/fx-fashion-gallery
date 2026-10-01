import { createContext, useContext, useState } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() =>
    JSON.parse(localStorage.getItem("fx_wishlist") || "[]")
  );

  const toggleWishlist = (product) => {
    setWishlistItems((current) => {
      const exists = current.some((item) => item.id === product.id);
      const updated = exists
        ? current.filter((item) => item.id !== product.id)
        : [...current, product];

      localStorage.setItem("fx_wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const isWishlisted = (productId) =>
    wishlistItems.some((item) => item.id === productId);

  const removeFromWishlist = (productId) => {
    setWishlistItems((current) => {
      const updated = current.filter((item) => item.id !== productId);
      localStorage.setItem("fx_wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        isWishlisted,
        removeFromWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
