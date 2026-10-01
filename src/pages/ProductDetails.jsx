import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";

const defaultProducts = [
  { category: "Men", name: "Essential Oversized Shirt", price: "৳1,890", image: "photo-1602810318383-e386cc2a3ccf", description: "A premium everyday oversized shirt designed for effortless modern style." },
  { category: "Women", name: "Minimal Everyday Dress", price: "৳2,490", image: "photo-1595777457583-95e059d581b8", description: "A clean and elegant everyday dress made for modern comfort and style." },
  { category: "Men", name: "Classic Street Jacket", price: "৳2,790", image: "photo-1551028719-00167b16eac5", description: "A versatile street-inspired jacket that adds a refined edge to any look." },
  { category: "Women", name: "Modern Casual Look", price: "৳2,190", image: "photo-1539109136881-3be0616acf4b", description: "A modern casual fashion piece designed for everyday confidence." }
];

export default function ProductDetails() {
  const { id } = useParams();
  const [customProducts, setCustomProducts] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      setCustomProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    return () => unsubscribe();
  }, []);

  const products = [...defaultProducts, ...customProducts];
  const defaultIndex = id && id.startsWith("default-") ? Number(id.replace("default-", "")) : -1;
  const product = customProducts.find((item) => item.id === id)
    || (defaultIndex >= 0 ? defaultProducts[defaultIndex] : null)
    || products[0];

  const basePrice = Number(String(product.price || "").replace(/[^0-9.]/g, "")) || 0;
  const discountValue = Number(product.discountValue || 0);
  const salePrice = product.discountEnabled
    ? product.discountType === "percentage"
      ? Math.max(0, basePrice - (basePrice * discountValue / 100))
      : Math.max(0, basePrice - discountValue)
    : basePrice;

  const availableSizes = String(product.sizes || "")
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);

  const sizes = availableSizes.length ? availableSizes : ["M", "L", "XL", "XXL"];

  const stockQuantity = Number(product.stock || 0);
  const hasStock = product.stock === "" || stockQuantity > 0;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const saved = isWishlisted(product.id);

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#111] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em]">← Back to Shop</Link>
        <section className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="aspect-[3/4] overflow-hidden bg-[#e9e9e5]">
            <img src={product.imageData || `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=1000&q=90`} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">{product.category}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{product.name}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-semibold">৳{salePrice.toLocaleString()}</p>
              {product.discountEnabled && salePrice < basePrice && (
                <>
                  <p className="text-sm text-black/40 line-through">৳{basePrice.toLocaleString()}</p>
                  <span className="bg-black px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                    {product.discountType === "percentage"
                      ? product.discountValue + "% OFF"
                      : "৳" + Number(product.discountValue).toLocaleString() + " OFF"}
                  </span>
                </>
              )}
            </div>
            <p className="mt-6 max-w-lg text-sm leading-7 text-black/55">{product.description}</p>
            <div className="mt-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Select Size</p>
              <div className="mt-3 flex gap-2">
                {sizes.map((size) => <button key={size} onClick={() => setSelectedSize(size)} className={`h-11 min-w-12 border px-3 text-xs transition ${selectedSize === size ? "border-black bg-black text-white" : "border-black/15 hover:border-black hover:bg-black hover:text-white"}`}>{size}</button>)}
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between border border-black/15 px-4 py-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Quantity</span>
              <div className="flex items-center gap-5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-lg">−</button>
                <span className="min-w-5 text-center text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-lg">+</button>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={"flex h-14 w-14 shrink-0 items-center justify-center border transition " + (saved ? "border-black bg-black text-white" : "border-black/15 hover:border-black")}
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                title={saved ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart className={"h-5 w-5 " + (saved ? "fill-current" : "")} />
              </button>
              <button disabled={!hasStock} onClick={() => { const cartProduct = { ...product, price: "৳" + salePrice.toLocaleString(), originalPrice: basePrice, salePrice }; addToCart(cartProduct, selectedSize, quantity); setAdded(true); setTimeout(() => setAdded(false), 2000); }} className={"flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition " + (hasStock ? "bg-black hover:bg-black/80" : "cursor-not-allowed bg-black/30")}>{!hasStock ? "Out of Stock" : added ? "Added to Cart ✓" : "Add to Cart"}</button>
            </div>
            <Link to={`/checkout?buyNow=${products.indexOf(product)}&size=${selectedSize}&quantity=${quantity}`} className="mt-2 block w-full border border-black bg-transparent py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white">Buy Now</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
