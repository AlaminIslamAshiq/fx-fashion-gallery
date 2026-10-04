import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { cartItems, removeFromCart, cartCount } = useCart();

  const subtotal = cartItems.reduce((total, item) => {
    const price = Number(item.price.replace(/[^0-9]/g, ""));
    return total + price * item.quantity;
  }, 0);

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#111] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em]">
          ← Continue Shopping
        </Link>

        <header className="mt-10 border-b border-black/10 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">FX Fashion Gallery</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
            Your Cart
          </h1>
          <p className="mt-3 text-sm text-black/45">{cartCount} item(s)</p>
        </header>

        {cartItems.length === 0 ? (
          <section className="py-20 text-center">
            <p className="text-sm text-black/50">Your shopping bag is currently empty.</p>
            <Link to="/shop" className="mt-7 inline-block bg-black px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Shop Collection
            </Link>
          </section>
        ) : (
          <section className="grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              {cartItems.map((item, index) => (
                <article key={`${item.name}-${index}`} className="flex gap-5 border-b border-black/10 pb-5">
                  <img
                    src={item.selectedImageData || item.imageData || (item.image ? `https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=400&q=80` : "")}
                    alt={item.name}
                    className="h-32 w-24 object-cover"
                  />

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">{item.category}</p>
                      <h2 className="mt-1 text-base font-semibold">{item.name}</h2>
                      <p className="mt-2 text-xs text-black/50">
  {item.color ? `Color: ${item.color} · ` : ""}
  Size: {item.size} · Qty: {item.quantity}
</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm font-semibold">{item.price}</p>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/45 hover:text-black"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit border border-black/10 bg-white p-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">Order Summary</h2>

              <div className="mt-7 flex items-center justify-between border-b border-black/10 pb-5 text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-black/50">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <Link to="/checkout" className="mt-7 block w-full bg-black py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black/80">
                Proceed to Checkout
              </Link>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
