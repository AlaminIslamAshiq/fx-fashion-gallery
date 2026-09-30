import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";

const defaultProducts = [
  { category: "Men", name: "Essential Oversized Shirt", price: "৳1,890", image: "photo-1602810318383-e386cc2a3ccf" },
  { category: "Women", name: "Minimal Everyday Dress", price: "৳2,490", image: "photo-1595777457583-95e059d581b8" },
  { category: "Men", name: "Classic Street Jacket", price: "৳2,790", image: "photo-1551028719-00167b16eac5" },
  { category: "Women", name: "Modern Casual Look", price: "৳2,190", image: "photo-1539109136881-3be0616acf4b" }
];

export default function Shop() {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [customProducts, setCustomProducts] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      setCustomProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    return () => unsubscribe();
  }, []);

  const products = [...defaultProducts, ...customProducts];

  const getInitialFilter = () => {
    const category = searchParams.get("category");
    const filter = searchParams.get("filter");

    if (["Men", "Women", "Kids"].includes(category)) return category;
    if (filter === "new") return "New Arrivals";
    if (filter === "sale") return "Sale";
    return "All Products";
  };

  const [activeFilter, setActiveFilter] = useState(getInitialFilter);

  useEffect(() => {
    setActiveFilter(getInitialFilter());
  }, [searchParams]);

  const getSalePrice = (product) => {
    const basePrice = Number(String(product.price || "").replace(/[^0-9.]/g, "")) || 0;
    const discountValue = Number(product.discountValue || 0);

    if (!product.discountEnabled || discountValue <= 0) return basePrice;

    return product.discountType === "percentage"
      ? Math.max(0, basePrice - (basePrice * discountValue / 100))
      : Math.max(0, basePrice - discountValue);
  };

  const filteredProducts = activeFilter === "All Products"
    ? products
    : activeFilter === "New Arrivals"
      ? products.filter((product) => product.newArrival === true)
      : activeFilter === "Sale"
        ? products.filter((product) => product.discountEnabled === true && Number(product.discountValue || 0) > 0)
        : products.filter((product) => product.category === activeFilter);
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#111] md:px-10">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="text-[10px] font-bold uppercase tracking-[0.2em]">← Back Home</a>
        <header className="mt-10 border-b border-black/10 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">FX Fashion Gallery</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">Shop All</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">Discover our latest fashion collection for Men, Women and everyday modern style.</p>
        </header>
        <div className="mt-7 flex gap-3 overflow-x-auto pb-2">
          {["All Products", "Men", "Women", "Kids", "New Arrivals", "Sale"].map((item) => <button key={item} onClick={() => setActiveFilter(item)} className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] transition ${activeFilter === item ? "border-black bg-black text-white" : "border-black/15 hover:bg-black hover:text-white"}`}>{item}</button>)}
        </div>
        <section className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-6">
          {filteredProducts.map((product) => (
            <Link key={product.id || product.name} to={`/product/${product.id || `default-${products.indexOf(product)}`}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#e9e9e5]">
                <img src={product.imageData || `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=800&q=85`} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 bg-white px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.15em]">New</span>
              </div>
              <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">{product.category}</p>
              <h2 className="mt-1 text-sm font-medium">{product.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">৳{getSalePrice(product).toLocaleString()}</p>

                {product.discountEnabled && getSalePrice(product) < (Number(String(product.price || "").replace(/[^0-9.]/g, "")) || 0) && (
                  <>
                    <p className="text-xs text-black/40 line-through">
                      ৳{(Number(String(product.price || "").replace(/[^0-9.]/g, "")) || 0).toLocaleString()}
                    </p>

                    <span className="bg-black px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white">
                      {product.discountType === "percentage"
                        ? product.discountValue + "% OFF"
                        : "৳" + Number(product.discountValue).toLocaleString() + " OFF"}
                    </span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
