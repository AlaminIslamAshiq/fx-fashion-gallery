import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const products = [
  { category: "Men", name: "Essential Oversized Shirt", price: "৳1,890", image: "photo-1602810318383-e386cc2a3ccf", description: "A premium everyday oversized shirt designed for effortless modern style." },
  { category: "Women", name: "Minimal Everyday Dress", price: "৳2,490", image: "photo-1595777457583-95e059d581b8", description: "A clean and elegant everyday dress made for modern comfort and style." },
  { category: "Men", name: "Classic Street Jacket", price: "৳2,790", image: "photo-1551028719-00167b16eac5", description: "A versatile street-inspired jacket that adds a refined edge to any look." },
  { category: "Women", name: "Modern Casual Look", price: "৳2,190", image: "photo-1539109136881-3be0616acf4b", description: "A modern casual fashion piece designed for everyday confidence." }
];

export default function ProductDetails() {
  const { id } = useParams();
  const product = products[Number(id)] || products[0];
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const { addToCart } = useCart();

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#111] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em]">← Back to Shop</Link>
        <section className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="aspect-[3/4] overflow-hidden bg-[#e9e9e5]">
            <img src={`https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=1000&q=90`} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">{product.category}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{product.name}</h1>
            <p className="mt-5 text-2xl font-semibold">{product.price}</p>
            <p className="mt-6 max-w-lg text-sm leading-7 text-black/55">{product.description}</p>
            <div className="mt-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Select Size</p>
              <div className="mt-3 flex gap-2">
                {["M", "L", "XL", "XXL"].map((size) => <button key={size} onClick={() => setSelectedSize(size)} className={`h-11 w-12 border text-xs transition ${selectedSize === size ? "border-black bg-black text-white" : "border-black/15 hover:border-black hover:bg-black hover:text-white"}`}>{size}</button>)}
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
            <button onClick={() => addToCart(product, selectedSize, quantity)} className="mt-3 w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black/80">Add to Cart</button>
          </div>
        </section>
      </div>
    </main>
  );
}
