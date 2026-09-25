import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "", city: "", area: "" });

  const placeOrder = () => {
    if (!customer.name || !customer.phone || !customer.address || !customer.city || !customer.area || cartItems.length === 0) {
      alert("Please complete all delivery information and add at least one product.");
      return;
    }

    const newOrderId = `FX-${Date.now().toString().slice(-8)}`;
    const order = { id: newOrderId, customer, items: cartItems, subtotal, paymentMethod: "Cash on Delivery", status: "Pending", createdAt: new Date().toISOString() };
    const existingOrders = JSON.parse(localStorage.getItem("fx_orders") || "[]");
    localStorage.setItem("fx_orders", JSON.stringify([...existingOrders, order]));
    setOrderId(newOrderId);
    setOrderPlaced(true);
    clearCart();
  };

  const subtotal = cartItems.reduce((total, item) => {
    const price = Number(item.price.replace(/[^0-9]/g, ""));
    return total + price * item.quantity;
  }, 0);

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#111] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/cart" className="text-[10px] font-bold uppercase tracking-[0.2em]">
          ← Back to Cart
        </Link>

        <header className="mt-10 border-b border-black/10 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            FX Fashion Gallery
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
            Checkout
          </h1>
        </header>

        {orderPlaced && (
          <section className="my-10 border border-black/10 bg-white p-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">Order Confirmed</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Thank you for your order.</h2>
            <p className="mt-3 text-sm text-black/50">Your order ID is <span className="font-semibold text-black">{orderId}</span></p>
            <Link to="/shop" className="mt-7 inline-block bg-black px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Continue Shopping</Link>
          </section>
        )}

        {!orderPlaced && <section className="grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
          <form className="space-y-7">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">
                Customer Information
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="border border-black/15 bg-white px-4 py-4 text-sm outline-none focus:border-black"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="border border-black/15 bg-white px-4 py-4 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">
                Delivery Address
              </h2>

              <div className="mt-5 space-y-4">
                <textarea
                  rows="4"
                  placeholder="Full Delivery Address"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full resize-none border border-black/15 bg-white px-4 py-4 text-sm outline-none focus:border-black"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="border border-black/15 bg-white px-4 py-4 text-sm outline-none focus:border-black"
                  />
                  <input
                    type="text"
                    placeholder="Area / District"
                    value={customer.area}
                    onChange={(e) => setCustomer({ ...customer, area: e.target.value })}
                    className="border border-black/15 bg-white px-4 py-4 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">
                Payment Method
              </h2>

              <div className="mt-5 border border-black/15 bg-white p-5">
                <label className="flex items-center gap-3 text-sm">
                  <input type="radio" name="payment" defaultChecked />
                  Cash on Delivery
                </label>
              </div>
            </div>
          </form>

          <aside className="h-fit border border-black/10 bg-white p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">
              {cartItems.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-xs text-black/45">
                      {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between border-t border-black/10 pt-5 text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">৳{subtotal.toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              className="mt-7 w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black/80"
            >
              Place Order
            </button>
          </aside>
        </section>}
      </div>
    </main>
  );
}
